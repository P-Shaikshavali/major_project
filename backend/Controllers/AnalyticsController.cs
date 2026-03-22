using EGrievanceApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Dean")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("category-distribution")]
        public async Task<IActionResult> GetCategoryDistribution()
        {
            var distribution = await _context.Grievances
                .GroupBy(g => g.Category)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            return Ok(distribution);
        }

        [HttpGet("monthly-trends")]
        public async Task<IActionResult> GetMonthlyTrends()
        {
            // Group by Month (simplified for this year)
            var currentYear = DateTime.UtcNow.Year;
            var trends = await _context.Grievances
                .Where(g => g.CreatedAt.Year == currentYear)
                .GroupBy(g => g.CreatedAt.Month)
                .Select(g => new 
                { 
                    Month = g.Key, 
                    New = g.Count(), 
                    Resolved = g.Count(c => c.Status == "Resolved") 
                })
                .OrderBy(g => g.Month)
                .ToListAsync();

            var mappedTrends = trends.Select(t => new
            {
                name = new DateTime(currentYear, t.Month, 1).ToString("MMM"),
                New = t.New,
                Resolved = t.Resolved
            });

            return Ok(mappedTrends);
        }

        [HttpGet("top-issues")]
        public async Task<IActionResult> GetTopIssues()
        {
            // Simple generic extraction of categories or priorities
            var topPriorities = await _context.Grievances
                .Where(g => g.Priority == "High" && g.Status != "Resolved")
                .OrderByDescending(g => g.CreatedAt)
                .Take(5)
                .Select(g => new { g.TrackingId, g.Category, g.Description, g.CreatedAt })
                .ToListAsync();

            return Ok(topPriorities);
        }
    }
}
