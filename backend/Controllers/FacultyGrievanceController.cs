using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using EGrievanceApi.Hubs;
using System.Security.Claims;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/faculty")]
    [Authorize(Roles = "Faculty,Warden")]
    public class FacultyGrievanceController : ControllerBase
    {
        private readonly IFacultyGrievanceService _facultyService;
        private readonly ILogger<FacultyGrievanceController> _logger;
        private readonly IHubContext<GrievanceHub> _hubContext;

        public FacultyGrievanceController(
            IFacultyGrievanceService facultyService,
            ILogger<FacultyGrievanceController> logger,
            IHubContext<GrievanceHub> hubContext)
        {
            _facultyService = facultyService;
            _logger = logger;
            _hubContext = hubContext;
        }

        private int GetFacultyUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        private string GetCurrentRole() => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        [HttpGet("grievances")]
        public async Task<ActionResult<IEnumerable<FacultyGrievanceDto>>> GetGrievances(string? priority = null, string? status = null, string? category = null, string sort = "latest")
        {
            var result = await _facultyService.GetFacultyGrievancesAsync(GetCurrentRole(), priority, status, category, sort);
            Response.Headers["X-Identity-Masking"] = "active";
            return Ok(result);
        }

        [HttpGet("analytics")]
        public async Task<ActionResult<FacultyAnalyticsDto>> GetAnalytics()
        {
            var result = await _facultyService.GetFacultyAnalyticsAsync(GetCurrentRole());
            return Ok(result);
        }

        [HttpPut("update-status/{id:int}")]
        public async Task<ActionResult<FacultyGrievanceDto>> UpdateStatus(int id, [FromBody] FacultyUpdateStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NewStatus)) return BadRequest(new { message = "NewStatus is required." });

            try
            {
                var result = await _facultyService.UpdateGrievanceStatusAsync(id, GetFacultyUserId(), dto);
                
                // 🔥 Broadcast instantaneous SignalR real-time event across the network
                await _hubContext.Clients.All.SendAsync("ReceiveSystemUpdate");
                
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
