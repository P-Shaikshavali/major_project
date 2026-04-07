using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Services
{
    public class GrievanceService : IGrievanceService
    {
        private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Submitted", "InProgress", "Resolved", "Escalated"
        };

        private readonly ApplicationDbContext    _context;
        private readonly IAIEngineService        _aiEngine;
        private readonly IGrievanceRoutingService _routingService;
        private readonly IAnonymityService       _anonymityService;

        public GrievanceService(
            ApplicationDbContext context,
            IAIEngineService aiEngine,
            IGrievanceRoutingService routingService,
            IAnonymityService anonymityService)
        {
            _context          = context;
            _aiEngine         = aiEngine;
            _routingService   = routingService;
            _anonymityService = anonymityService;
        }

        // ── CREATE ────────────────────────────────────────────────────────────
        public async Task<Grievance> CreateGrievanceAsync(int userId, CreateGrievanceDto request)
        {
            // 1. Generate unique Tracking ID
            var last    = await _context.Grievances.OrderByDescending(g => g.Id).FirstOrDefaultAsync();
            string trackingId = $"GRV-{((last?.Id ?? 0) + 1):D4}";

<<<<<<< HEAD
            // 2. AI Pipeline & Manual Tag Extraction
            string category = "General";
            string desc = request.Description;
=======
            // 2. AI Engine Pipeline 
            var aiCategory = _aiEngine.ClassifyCategory(request.Description);
            var aiPriority = _aiEngine.PredictPriority(request.Description);
            
            // Prefer user's explicit category over AI, unless it's null
            var category = !string.IsNullOrWhiteSpace(request.Category) ? request.Category : aiCategory;
            var priority = !string.IsNullOrWhiteSpace(request.Priority) ? request.Priority : aiPriority;
            
            var credibility = await _aiEngine.CalculateCredibilityScoreAsync(userId, request.Description);
            var assignedTo = _routingService.DetermineAssignedRole(category);
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)

            // Check for manual category override from frontend selection
            if (desc.StartsWith("[CATEGORY:", StringComparison.OrdinalIgnoreCase))
            {
                int end = desc.IndexOf(']');
                if (end > 10)
                {
                    category = desc.Substring(10, end - 10).Trim();
                    desc = desc.Substring(end + 1).Trim(); // Strip tag for storage
                }
            }
            else
            {
                category = _aiEngine.ClassifyCategory(desc);
            }

            var priority    = _aiEngine.PredictPriority(desc);
            var credibility = await _aiEngine.CalculateCredibilityScoreAsync(userId, desc);
            var assignedTo  = _routingService.DetermineAssignedRole(category);


            // 3. High priority → flag escalated so Admin always sees it
            bool isEscalated = priority == "High";

            // 4. Persist
            var grievance = new Grievance
            {
                TrackingId       = trackingId,
                AnonymousId      = _anonymityService.GenerateAnonymousId(),
                UserId           = userId,
                Description      = desc,
                Category         = category,

                Priority         = priority,
                CredibilityScore = credibility,
<<<<<<< HEAD
                AssignedTo       = assignedTo,
                IsEscalated      = isEscalated
=======
                AssignedToRole = assignedTo
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
            };

            _context.Grievances.Add(grievance);

            // 5. Audit
            _context.AuditLogs.Add(new AuditLog
            {
                Action  = "GrievanceCreated",
                UserId  = userId,
                Details = $"Created {trackingId} — Category: {category}, Priority: {priority}, AssignedTo: {assignedTo}"
            });

            await _context.SaveChangesAsync();
            return grievance;
        }

        // ── GET MINE ──────────────────────────────────────────────────────────
        public async Task<IEnumerable<Grievance>> GetMyGrievancesAsync(int userId)
        {
            return await _context.Grievances
                .AsNoTracking()
                .Include(g => g.User)
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        // ── GET ALL ───────────────────────────────────────────────────────────
        public async Task<IEnumerable<Grievance>> GetAllGrievancesAsync()
        {
            return await _context.Grievances
                .AsNoTracking()
                .Include(g => g.User)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        // ── UPDATE STATUS ─────────────────────────────────────────────────────
        public async Task<Grievance> UpdateStatusAsync(int grievanceId, string newStatus, int authorityUserId)
        {
            var grievance = await _context.Grievances.FindAsync(grievanceId)
                ?? throw new Exception("Grievance not found");

            if (string.IsNullOrWhiteSpace(newStatus) || !AllowedStatuses.Contains(newStatus))
                throw new Exception("Invalid status. Allowed: Submitted, InProgress, Resolved, Escalated.");

            var oldStatus     = grievance.Status;
            grievance.Status  = newStatus;
            grievance.ResolvedAt = newStatus == "Resolved" ? DateTime.UtcNow : null;
            grievance.IsEscalated = string.Equals(newStatus, "Escalated", StringComparison.OrdinalIgnoreCase);

            _context.AuditLogs.Add(new AuditLog
            {
                Action  = "StatusUpdated",
                UserId  = authorityUserId,
                Details = $"Updated {grievance.TrackingId}: {oldStatus} → {newStatus}"
            });

            await _context.SaveChangesAsync();
            return grievance;
        }
    }
}
