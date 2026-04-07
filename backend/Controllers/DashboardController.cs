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
        private readonly IHODService _hodService;
        private readonly IAdminService _adminService;

        public DashboardController(ApplicationDbContext context, IAIEngineService aiEngine, IAnonymityService anonymityService, IHODService hodService, IAdminService adminService)
        {
            _context = context;
            _aiEngine = aiEngine;
            _anonymityService = anonymityService;
            _hodService = hodService;
            _adminService = adminService;
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

<<<<<<< HEAD
        [HttpGet("faculty")]
        [Authorize(Roles = "Faculty")]
        public async Task<IActionResult> GetFacultyDashboard()
        {
            var assignedGrievances = await _context.Grievances.Include(g => g.User).Where(g => g.AssignedTo == "Faculty").AsNoTracking().ToListAsync();
            _anonymityService.MaskIdentities(assignedGrievances);
            return Ok(assignedGrievances); // Matches expected structure
        }
=======
        [HttpGet("authority")]
        [Authorize(Roles = "Faculty,Warden,HOD,Dean")]
        public async Task<IActionResult> GetAuthorityDashboard()
        {
            var role = GetCurrentUserRole();
            
            var assignedGrievances = await _context.Grievances
                .Include(g => g.User)
                .Where(g => g.AssignedToRole == role)
                .AsNoTracking()
                .ToListAsync();
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)

        [HttpGet("warden")]
        [Authorize(Roles = "Warden")]
        public async Task<IActionResult> GetWardenDashboard()
        {
            var assignedGrievances = await _context.Grievances.Include(g => g.User).Where(g => g.AssignedTo == "Warden").AsNoTracking().ToListAsync();
            _anonymityService.MaskIdentities(assignedGrievances);
            return Ok(assignedGrievances);
        }

        [HttpGet("hod")]
        [Authorize(Roles = "HOD")]
        public async Task<IActionResult> GetHodDashboard()
        {
            var data = await _hodService.GetDashboardDataAsync();
            return Ok(data);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin,Dean")]
        public async Task<IActionResult> GetAdminDashboard()
        {
<<<<<<< HEAD
            var data = await _adminService.GetGlobalDashboardDataAsync();
            return Ok(data);
=======
            var all = await _context.Grievances.ToListAsync();

            // Per-role complaint queues for supervisory oversight
            var byRole = new
            {
                Warden  = all.Count(g => g.AssignedToRole == "Warden"),
                Faculty = all.Count(g => g.AssignedToRole == "Faculty"),
                HOD     = all.Count(g => g.AssignedToRole == "HOD"),
                Dean    = all.Count(g => g.AssignedToRole == "Dean"),
                Admin   = all.Count(g => g.AssignedToRole == "Admin"),
            };

            // Recent complaints across ALL roles — supervisory feed (latest 20)
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
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
        }
    }
}
