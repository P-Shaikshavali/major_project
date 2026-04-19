using System.Security.Claims;
using EGrievanceApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EGrievanceApi.Services;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIEngineService _aiEngine;
        private readonly IAnonymityService _anonymityService;
        public DashboardController(ApplicationDbContext context, IAIEngineService aiEngine, IAnonymityService anonymityService)
        {
            _context = context;
            _aiEngine = aiEngine;
            _anonymityService = anonymityService;
        }

        private int GetCurrentUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        [HttpGet("student")]
        public async Task<IActionResult> GetStudentDashboard()
        {
            var userId = GetCurrentUserId();
            var myGrievances = await _context.Grievances.Where(g => g.UserId == userId).ToListAsync();
            
            var insights = await _aiEngine.GenerateUserInsightsAsync(userId);
            var resolutionEfficiency = myGrievances.Count == 0 ? 0 : Math.Round(((double)myGrievances.Count(g => g.Status == "Resolved") / myGrievances.Count) * 100, 1);
            var escalationRate = myGrievances.Count == 0 ? 0 : Math.Round(((double)myGrievances.Count(g => g.IsEscalated) / myGrievances.Count) * 100, 1);

            return Ok(new
            {
                TotalComplaints = myGrievances.Count,
                Pending = myGrievances.Count(g => g.Status == "Submitted"),
                InProgress = myGrievances.Count(g => g.Status == "InProgress" || g.Status == "Escalated"),
                Resolved = myGrievances.Count(g => g.Status == "Resolved"),
                RecentComplaints = myGrievances.OrderByDescending(g => g.CreatedAt).Take(5),
                BehavioralAnalytics = new 
                {
                    Insight = insights,
                    ResolutionEfficiency = resolutionEfficiency,
                    EscalationRate = escalationRate,
                    AverageCredibility = myGrievances.Any() ? myGrievances.Average(g => g.CredibilityScore) : 0
                }
            });
        }

        [HttpGet("authority")]
        [Authorize(Roles = "Faculty,Warden,HOD,Dean")]
        public async Task<IActionResult> GetAuthorityDashboard()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            
            var assignedGrievances = await _context.Grievances
                .Include(g => g.User)
                .Where(g => g.AssignedToRole == role)
                .AsNoTracking()
                .ToListAsync();

            if (role == "Faculty" || role == "Warden")
                _anonymityService.MaskIdentities(assignedGrievances);

            return Ok(assignedGrievances);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin,Dean")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var all = await _context.Grievances.ToListAsync();

            var byRole = new
            {
                Warden  = all.Count(g => g.AssignedToRole == "Warden"),
                Faculty = all.Count(g => g.AssignedToRole == "Faculty"),
                HOD     = all.Count(g => g.AssignedToRole == "HOD"),
                Dean    = all.Count(g => g.AssignedToRole == "Dean"),
                Admin   = all.Count(g => g.AssignedToRole == "Admin"),
            };

            var recentAll = all.OrderByDescending(g => g.CreatedAt).Take(20).Select(g => new
            {
                g.TrackingId, g.Category, g.Priority, g.Status,
                g.AssignedToRole, g.IsEscalated,
                g.CreatedAt
            });

            return Ok(new
            {
                Total        = all.Count,
                Active       = all.Count(g => g.Status != "Resolved"),
                HighPriority = all.Count(g => g.Priority == "High"),
                Escalated    = all.Count(g => g.IsEscalated),
                Resolved     = all.Count(g => g.Status == "Resolved"),
                ByRole       = byRole,
                RecentAll    = recentAll,
                ActiveUsers  = await _context.Users.CountAsync(),
                AvgResolution = "N/A",
            });
        }
    }
}
