using System.Security.Claims;
using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using EGrievanceApi.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GrievanceController : ControllerBase
    {
        private readonly IGrievanceService _grievanceService;
        private readonly IAnonymityService _anonymityService;
        private readonly IHubContext<GrievanceHub> _hubContext;

        public GrievanceController(
            IGrievanceService grievanceService, 
            IAnonymityService anonymityService,
            IHubContext<GrievanceHub> hubContext)
        {
            _grievanceService = grievanceService;
            _anonymityService = anonymityService;
            _hubContext = hubContext;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGrievance([FromBody] CreateGrievanceDto request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return Unauthorized();

            var grievance = await _grievanceService.CreateGrievanceAsync(userId, request);
            
            // Broadcast live creation payload across the whole network
            await _hubContext.Clients.All.SendAsync("ReceiveSystemUpdate");
            
            return Ok(grievance);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyGrievances()
        {
            var userId = GetCurrentUserId();
            var grievances = await _grievanceService.GetMyGrievancesAsync(userId);
            return Ok(grievances);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Dean,Warden,Faculty")]
        public async Task<IActionResult> GetAllGrievances()
        {
            var grievances = await _grievanceService.GetAllGrievancesAsync();
            
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role == "Faculty" || role == "Warden")
            {
                _anonymityService.MaskIdentities(grievances);
            }
            
            return Ok(grievances);
        }

        [HttpPut("update-status/{id}")]
        [Authorize(Roles = "Admin,Dean,Warden,Faculty")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var grievance = await _grievanceService.UpdateStatusAsync(id, request.Status, userId);
                
                var role = User.FindFirst(ClaimTypes.Role)?.Value;
                if (role == "Faculty" || role == "Warden")
                {
                    _anonymityService.MaskIdentity(grievance);
                }
                
                return Ok(grievance);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
