using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EGrievanceApi.Services
{
    public class WardenGrievanceService : IWardenGrievanceService
    {
        private readonly ApplicationDbContext _context;

        public WardenGrievanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WardenGrievanceDto>> GetWardenGrievancesAsync(int wardenUserId)
        {
            var grievances = await _context.Grievances
                .Where(g => g.AssignedToRole == "Warden")
                .AsNoTracking()
                .ToListAsync();

            // AI Repeated Issue logic: Count how many complaints exist with similar category in last 30 days
            var recentGrievances = await _context.Grievances
                .Where(g => g.AssignedToRole == "Warden" && g.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                .Select(g => g.Category)
                .ToListAsync();

            var resultList = new List<WardenGrievanceDto>();
            foreach (var g in grievances)
            {
                var similarCount = recentGrievances.Count(c => c == g.Category);
                resultList.Add(new WardenGrievanceDto
                {
                    Id = g.Id,
                    TrackingId = g.TrackingId,
                    Category = g.Category,
                    Priority = g.Priority,
                    Status = g.Status,
                    Description = g.Description,
                    CreatedAt = g.CreatedAt,
                    IsEscalated = g.IsEscalated,
                    SimilarCount = similarCount,
                    AnonymousId = $"ANON-{g.UserId.ToString("X4")}"
                });
            }

            return resultList.OrderByDescending(x => x.CreatedAt);
        }

        public async Task<WardenStudentDetailsDto> GetStudentDetailsSecurelyAsync(string anonymousId, int wardenUserId)
        {
            // Decrypt logic: ANON-0001 -> UserID 1
            if (!anonymousId.StartsWith("ANON-"))
                throw new Exception("Invalid Identity Token");

            var hexSpan = anonymousId.Substring(5);
            if (!int.TryParse(hexSpan, System.Globalization.NumberStyles.HexNumber, null, out int studentUserId))
                throw new Exception("Corrupted Identity Token");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentUserId);
            if (user == null || user.Role != "Student")
                throw new Exception("Student not found or access denied.");

            // Mandatory Audit Log for viewing identity securely
            _context.AuditLogs.Add(new AuditLog
            {
                UserId = wardenUserId,
                Action = "Unlocked Identity",
                Timestamp = DateTime.UtcNow,
                Details = $"Warden dynamically unlocked identity mapping for {anonymousId} (User {user.Id})."
            });
            await _context.SaveChangesAsync();

            return new WardenStudentDetailsDto
            {
                Name = user.Name,
                Email = user.Email,
                Department = "General Studies" // We don't have Department in User table currently, so we fallback
            };
        }

        public async Task UpdateGrievanceStatusAsync(int grievanceId, WardenUpdateStatusDto dto, int wardenUserId)
        {
            var grievance = await _context.Grievances.FirstOrDefaultAsync(g => g.Id == grievanceId && g.AssignedToRole == "Warden");
            if (grievance == null) throw new Exception("Grievance not found or unauthorized access.");

            grievance.Status = dto.NewStatus;
            
            if (!string.IsNullOrWhiteSpace(dto.ResolutionNote))
            {
                grievance.Description += $"\n\n[Warden Resolved]: {dto.ResolutionNote}";
            }

            if (dto.Escalate)
            {
                grievance.IsEscalated = true;
                grievance.Status = "Escalated";
                grievance.AssignedToRole = "CollegeDean"; // Escalates above HOD
            }

            _context.AuditLogs.Add(new AuditLog
            {
                UserId = wardenUserId,
                Action = "Warden Updated Grievance",
                Details = $"Grievance {grievance.TrackingId} updated to {grievance.Status}. Escalated: {dto.Escalate}"
            });

            await _context.SaveChangesAsync();
        }

        public async Task<WardenAnalyticsDto> GetWardenAnalyticsAsync()
        {
            var baseQuery = _context.Grievances.Where(g => g.AssignedToRole == "Warden");
            var total = await baseQuery.CountAsync();
            var pending = await baseQuery.CountAsync(g => g.Status == "Submitted" || g.Status == "InProgress");
            var resolved = await baseQuery.CountAsync(g => g.Status == "Resolved");

            var categories = await baseQuery.GroupBy(g => g.Category)
                                            .Select(g => new { Cat = g.Key, Cnt = g.Count() })
                                            .OrderByDescending(x => x.Cnt)
                                            .FirstOrDefaultAsync();

            return new WardenAnalyticsDto
            {
                TotalComplaints = total,
                PendingComplaints = pending,
                ResolvedComplaints = resolved,
                MostFrequentIssue = categories?.Cat ?? "None"
            };
        }
    }
}
