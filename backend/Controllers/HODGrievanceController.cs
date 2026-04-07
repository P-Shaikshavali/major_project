using EGrievanceApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/hod")]
    [Authorize(Roles = "HOD")]
    public class HODGrievanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HODGrievanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("grievances")]
        public async Task<IActionResult> GetGrievances()
        {
            var results = await _context.Grievances
                .Where(g => g.AssignedToRole == "HOD")
                .AsNoTracking()
                .ToListAsync();
            return Ok(results);
        }
    }
}
