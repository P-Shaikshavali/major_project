using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Services
{
    public class GrievanceService : IGrievanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIEngineService _aiEngine;
        private readonly IGrievanceRoutingService _routingService;
        private readonly IAnonymityService _anonymityService;

        public GrievanceService(ApplicationDbContext context, IAIEngineService aiEngine, IGrievanceRoutingService routingService, IAnonymityService anonymityService)
        {
            _context = context;
            _aiEngine = aiEngine;
            _routingService = routingService;
            _anonymityService = anonymityService;
        }

        public async Task<Grievance> CreateGrievanceAsync(int userId, CreateGrievanceDto request)
        {
            // 1. Generate Tracking ID
            var lastGrievance = await _context.Grievances.OrderByDescending(g => g.Id).FirstOrDefaultAsync();
            int newIdNum = (lastGrievance?.Id ?? 0) + 1;
            string trackingId = $"GRV-{newIdNum:D4}";

            // 2. AI Engine Pipeline
            var category = _aiEngine.ClassifyCategory(request.Description);
            var priority = _aiEngine.PredictPriority(request.Description);
            var credibility = await _aiEngine.CalculateCredibilityScoreAsync(userId, request.Description);
            var assignedTo = _routingService.DetermineAssignedRole(category);

            // 3. Create Record
            var grievance = new Grievance
            {
                TrackingId = trackingId,
                AnonymousId = _anonymityService.GenerateAnonymousId(),
                UserId = userId,
                Description = request.Description,
                Category = category,
                Priority = priority,
                CredibilityScore = credibility,
                AssignedTo = assignedTo
            };

            _context.Grievances.Add(grievance);
            
            // 4. Audit Log
            _context.AuditLogs.Add(new AuditLog 
            { 
                Action = "GrievanceCreated", 
                UserId = userId, 
                Details = $"Created Grievance {trackingId} to Category {category}"
            });

            await _context.SaveChangesAsync();
            return grievance;
        }

        public async Task<IEnumerable<Grievance>> GetMyGrievancesAsync(int userId)
        {
            return await _context.Grievances
                .AsNoTracking()
                .Include(g => g.User)
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Grievance>> GetAllGrievancesAsync()
        {
            return await _context.Grievances
                .AsNoTracking()
                .Include(g => g.User)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        public async Task<Grievance> UpdateStatusAsync(int grievanceId, string newStatus, int authorityUserId)
        {
            var grievance = await _context.Grievances.FindAsync(grievanceId);
            if (grievance == null) throw new Exception("Grievance not found");

            var oldStatus = grievance.Status;
            grievance.Status = newStatus;
            
            if (newStatus == "Resolved")
            {
                grievance.ResolvedAt = DateTime.UtcNow;
            }

            _context.AuditLogs.Add(new AuditLog 
            { 
                Action = "StatusUpdated", 
                UserId = authorityUserId, 
                Details = $"Updated {grievance.TrackingId} status from {oldStatus} to {newStatus}"
            });

            await _context.SaveChangesAsync();
            return grievance;
        }
    }
}
