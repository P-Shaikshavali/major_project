using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/warden")]
    [Authorize(Roles = "Warden")]
    public class WardenGrievanceController : ControllerBase
    {
        private readonly IWardenGrievanceService _wardenService;
        private readonly ILogger<WardenGrievanceController> _logger;

        public WardenGrievanceController(IWardenGrievanceService wardenService, ILogger<WardenGrievanceController> logger)
        {
            _wardenService = wardenService;
            _logger = logger;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        [HttpGet("grievances")]
        public async Task<IActionResult> GetGrievances()
        {
            var grievances = await _wardenService.GetWardenGrievancesAsync(GetUserId());
            return Ok(grievances);
        }

        [HttpGet("student-details/{anonymousId}")]
        public async Task<IActionResult> GetStudentDetails(string anonymousId)
        {
            try
            {
                var details = await _wardenService.GetStudentDetailsSecurelyAsync(anonymousId, GetUserId());
                return Ok(details);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to unlock student identity for Wardens.");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update-status/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] WardenUpdateStatusDto dto)
        {
            try
            {
                await _wardenService.UpdateGrievanceStatusAsync(id, dto, GetUserId());
                return Ok(new { message = "Grievance updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            var analytics = await _wardenService.GetWardenAnalyticsAsync();
            return Ok(analytics);
        }
    }
}
