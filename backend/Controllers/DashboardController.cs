using System.Security.Claims;
using EGrievanceApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EGrievanceApi.Services.IAIEngineService _aiEngine;
        private readonly EGrievanceApi.Services.IAnonymityService _anonymityService;

        public DashboardController(ApplicationDbContext context, EGrievanceApi.Services.IAIEngineService aiEngine, EGrievanceApi.Services.IAnonymityService anonymityService)
        {
            _context = context;
            _aiEngine = aiEngine;
            _anonymityService = anonymityService;
        }

        private int GetCurrentUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        private string GetCurrentUserRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? "Student";

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
        [Authorize(Roles = "Faculty,Warden,Dean")]
        public async Task<IActionResult> GetAuthorityDashboard()
        {
            var role = GetCurrentUserRole();
            
            var assignedGrievances = await _context.Grievances
                .Include(g => g.User)
                .Where(g => g.AssignedTo == role)
                .AsNoTracking()
                .ToListAsync();

            if (role == "Faculty" || role == "Warden")
            {
                _anonymityService.MaskIdentities(assignedGrievances);
            }

            return Ok(new
            {
                NewItems = assignedGrievances.Count(g => g.Status == "Submitted"),
                Escalated = assignedGrievances.Count(g => g.IsEscalated),
                Resolved = assignedGrievances.Count(g => g.Status == "Resolved"),
                Queue = assignedGrievances.OrderByDescending(g => g.CreatedAt).Take(20)
            });
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var allGrievances = await _context.Grievances.ToListAsync();
            
            return Ok(new
            {
                Total = allGrievances.Count,
                Active = allGrievances.Count(g => g.Status != "Resolved"),
                HighPriority = allGrievances.Count(g => g.Priority == "High"),
                Escalated = allGrievances.Count(g => g.IsEscalated)
            });
        }
    }
}
