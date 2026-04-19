using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Services
{
    /// <summary>
    /// Faculty Grievance Service — Production-grade, anonymity-enforced, AI-assisted.
    /// SECURITY GUARANTEE: This service NEVER returns Name, Email, or StudentId in any output.
    /// </summary>
    public class FacultyGrievanceService : IFacultyGrievanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIEngineService     _aiEngine;

        private const double SIMILARITY_THRESHOLD = 0.25; // 25% word overlap = "similar"

        public FacultyGrievanceService(ApplicationDbContext context, IAIEngineService aiEngine)
        {
            _context  = context;
            _aiEngine = aiEngine;
        }

        // ─────────────────────────────────────────────────────────────
        // 1. GET FACULTY GRIEVANCES (Anonymity-safe, Filtered)
        // ─────────────────────────────────────────────────────────────
        public async Task<IEnumerable<FacultyGrievanceDto>> GetFacultyGrievancesAsync(
            string   assignedRole,
            string?  priority = null,
            string?  status   = null,
            string?  category = null,
            string   sort     = "latest")
        {
            if (assignedRole != "Faculty" && assignedRole != "Warden")
                throw new InvalidOperationException("Only Faculty and Warden roles are supported by this endpoint.");

            // Query — NO .Include(g => g.User) to prevent accidental identity leakage
            var query = _context.Grievances
                .AsNoTracking()
                .Where(g => g.AssignedToRole == assignedRole);

            // Apply filters
            if (!string.IsNullOrEmpty(priority))
                query = query.Where(g => g.Priority == priority);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(g => g.Status == status);
            if (!string.IsNullOrEmpty(category))
                query = query.Where(g => g.Category == category);

            // Apply sort
            query = sort == "priority"
                ? query.OrderBy(g => g.Priority == "High" ? 0 : g.Priority == "Medium" ? 1 : 2)
                       .ThenByDescending(g => g.CreatedAt)
                : query.OrderByDescending(g => g.CreatedAt); // default: latest

            var grievances = await query.ToListAsync();

            // Load all grievances once for similarity computation
            var allOpen = await _context.Grievances
                .AsNoTracking()
                .Where(g => g.Status != "Resolved")
                .Select(g => new { g.Id, g.Category, g.Description })
                .ToListAsync();

            // Map to anonymity-safe DTO
            return grievances.Select(g =>
            {
                // Semantic similarity count (same category + word overlap ≥ THRESHOLD)
                int similarCount = allOpen.Count(other =>
                    other.Id       != g.Id &&
                    other.Category == g.Category &&
                    ComputeJaccardSimilarity(other.Description, g.Description) >= SIMILARITY_THRESHOLD);

                // AI Recommendation
                string aiRec = BuildAiRecommendation(g, similarCount);

                // Escalation awareness
                bool suggestEsc = ShouldSuggestEscalation(g);
                string escReason = suggestEsc
                    ? $"Complaint is {g.Priority} priority and remains {g.Status} for extended duration."
                    : string.Empty;

                return new FacultyGrievanceDto
                {
                    Id               = g.Id,
                    TrackingId       = g.TrackingId,
                    AnonymousId      = g.AnonymousId,
                    Category         = g.Category,
                    Description      = g.Description,
                    Priority         = g.Priority,
                    Status           = g.Status,
                    AssignedToRole   = g.AssignedToRole,
                    CreatedAt        = g.CreatedAt,
                    ResolvedAt       = g.ResolvedAt,
                    IsEscalated      = g.IsEscalated,
                    CredibilityScore = g.CredibilityScore,
                    ResolutionNote   = string.Empty, // not stored on model yet; extension point
                    SimilarCount     = similarCount,
                    AiRecommendation = aiRec,
                    SuggestEscalation = suggestEsc,
                    EscalationReason = escReason,
                };
            });
        }

        // ─────────────────────────────────────────────────────────────
        // 2. UPDATE STATUS (Audit-logged)
        // ─────────────────────────────────────────────────────────────
        public async Task<FacultyGrievanceDto> UpdateGrievanceStatusAsync(
            int    grievanceId,
            int    facultyUserId,
            FacultyUpdateStatusDto dto)
        {
            var grievance = await _context.Grievances.FindAsync(grievanceId)
                ?? throw new KeyNotFoundException($"Grievance {grievanceId} not found.");

            var oldStatus = grievance.Status;

            // Security: Faculty can only move to InProgress or Resolved (not Admin-only Escalated)
            var allowedTransitions = new[] { "InProgress", "Resolved" };
            if (!allowedTransitions.Contains(dto.NewStatus))
                throw new InvalidOperationException(
                    $"Faculty cannot set status to '{dto.NewStatus}'. Allowed: InProgress, Resolved.");

            grievance.Status     = dto.NewStatus;
            if (dto.NewStatus == "Resolved")
                grievance.ResolvedAt = DateTime.UtcNow;

            // If faculty recommends escalation, flag it (Admin acts on it separately)
            if (dto.RecommendEscalation)
                grievance.IsEscalated = true;

            // Audit log — records faculty user ID, never student identity
            _context.AuditLogs.Add(new AuditLog
            {
                Action  = "FacultyStatusUpdate",
                UserId  = facultyUserId,
                Details = $"Faculty updated {grievance.TrackingId}: {oldStatus} → {dto.NewStatus}. Note: {dto.ResolutionNote}. EscRec: {dto.RecommendEscalation}"
            });

            await _context.SaveChangesAsync();

            // Return anonymity-safe DTO
            return new FacultyGrievanceDto
            {
                Id               = grievance.Id,
                TrackingId       = grievance.TrackingId,
                AnonymousId      = grievance.AnonymousId,
                Category         = grievance.Category,
                Description      = grievance.Description,
                Priority         = grievance.Priority,
                Status           = grievance.Status,
                AssignedToRole   = grievance.AssignedToRole,
                CreatedAt        = grievance.CreatedAt,
                ResolvedAt       = grievance.ResolvedAt,
                IsEscalated      = grievance.IsEscalated,
                CredibilityScore = grievance.CredibilityScore,
                ResolutionNote   = dto.ResolutionNote,
                SimilarCount     = 0,   // not needed on update response
                AiRecommendation = string.Empty,
            };
        }

        // ─────────────────────────────────────────────────────────────
        // 3. FACULTY ANALYTICS
        // ─────────────────────────────────────────────────────────────
        public async Task<FacultyAnalyticsDto> GetFacultyAnalyticsAsync(string assignedRole)
        {
            if (assignedRole != "Faculty" && assignedRole != "Warden")
                throw new InvalidOperationException("Only Faculty and Warden roles are supported by this endpoint.");

            var grievances = await _context.Grievances
                .AsNoTracking()
                .Where(g => g.AssignedToRole == assignedRole)
                .ToListAsync();

            var resolved = grievances.Where(g => g.Status == "Resolved").ToList();

            double avgHours = 0;
            if (resolved.Any())
            {
                avgHours = resolved
                    .Where(g => g.ResolvedAt.HasValue)
                    .Average(g => (g.ResolvedAt!.Value - g.CreatedAt).TotalHours);
            }

            var categoryBreakdown = grievances
                .GroupBy(g => g.Category)
                .Select(group => new CategoryCountDto
                {
                    Category = group.Key,
                    Count    = group.Count()
                })
                .OrderByDescending(c => c.Count)
                .ToList();

            var insights = GenerateSystemInsights(grievances);

            return new FacultyAnalyticsDto
            {
                TotalAssigned      = grievances.Count,
                Pending            = grievances.Count(g => g.Status == "Submitted"),
                InProgress         = grievances.Count(g => g.Status == "InProgress"),
                Resolved           = resolved.Count,
                Escalated          = grievances.Count(g => g.IsEscalated),
                AvgResolutionHours = Math.Round(avgHours, 1),
                CategoryBreakdown  = categoryBreakdown,
                AiInsights         = insights
            };
        }

        // ─────────────────────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────────────────────

        /// <summary>Jaccard Similarity — word overlap / word union.</summary>
        private static double ComputeJaccardSimilarity(string a, string b)
        {
            var setA = new HashSet<string>(
                System.Text.RegularExpressions.Regex.Split(a.ToLower(), @"\W+")
                    .Where(s => s.Length > 2));
            var setB = new HashSet<string>(
                System.Text.RegularExpressions.Regex.Split(b.ToLower(), @"\W+")
                    .Where(s => s.Length > 2));
            if (!setA.Any() || !setB.Any()) return 0;
            int intersection = setA.Count(w => setB.Contains(w));
            int union = setA.Union(setB).Count();
            return union == 0 ? 0 : (double)intersection / union;
        }

        private static string BuildAiRecommendation(Grievance g, int similarCount)
        {
            var recs = new List<string>();
            if (similarCount >= 5)
                recs.Add($"📊 Similar issues reported {similarCount} times — systemic pattern detected.");
            else if (similarCount >= 2)
                recs.Add($"⚠️ This complaint matches {similarCount} similar open issues.");
            if (g.Priority == "High")
                recs.Add("🔴 High urgency complaint — requires immediate attention.");
            if (g.IsEscalated)
                recs.Add("🚨 Complaint has been escalated — review required.");
            if (g.CredibilityScore >= 70)
                recs.Add("✅ High credibility score — report is likely genuine.");
            else if (g.CredibilityScore < 30)
                recs.Add("⚡ Low credibility score — verify before acting.");
            return string.Join(" | ", recs.DefaultIfEmpty("ℹ️ No special indicators detected."));
        }

        private static bool ShouldSuggestEscalation(Grievance g)
        {
            if (g.Priority != "High") return false;
            if (g.Status == "Resolved") return false;
            // Unresolved High priority for > 3 days
            return (DateTime.UtcNow - g.CreatedAt).TotalDays > 3;
        }

        private static List<string> GenerateSystemInsights(List<Grievance> all)
        {
            var insights = new List<string>();
            if (!all.Any())
            {
                insights.Add("No grievances assigned yet.");
                return insights;
            }

            // Category frequency
            var topCat = all.GroupBy(g => g.Category)
                            .OrderByDescending(g => g.Count())
                            .FirstOrDefault();
            if (topCat != null)
                insights.Add($"High frequency of {topCat.Key} complaints detected ({topCat.Count()} cases).");

            // Recent week volume
            var lastWeek = all.Count(g => g.CreatedAt >= DateTime.UtcNow.AddDays(-7));
            if (lastWeek > 5)
                insights.Add($"Urgent complaints increasing — {lastWeek} new grievances in the last 7 days.");

            // Pending ratio
            int pending = all.Count(g => g.Status == "Submitted" || g.Status == "InProgress");
            if (pending > 0)
            {
                double pendingRatio = (double)pending / all.Count * 100;
                if (pendingRatio > 60)
                    insights.Add($"High backlog alert: {pendingRatio:F0}% of complaints are unresolved.");
            }

            // Escalation warning
            int escalated = all.Count(g => g.IsEscalated);
            if (escalated > 0)
                insights.Add($"Repeated issue pattern observed — {escalated} complaint(s) escalated.");

            if (insights.Count < 2)
                insights.Add("Normal resolution cycle observed. No anomalies detected.");

            return insights;
        }
    }
}
