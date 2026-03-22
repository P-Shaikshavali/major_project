using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EGrievanceApi.Controllers
{
    /// <summary>
    /// Faculty Grievance Module — Production-grade, anonymity-enforced API.
    /// 
    /// SECURITY:
    ///   - All endpoints require valid JWT (Bearer token)
    ///   - Student identity (Name, Email, StudentId) is NEVER returned — enforced at service level
    ///   - Status transitions are restricted at service level (Faculty cannot set Escalated directly)
    ///   - All faculty actions are audit-logged with faculty userId
    /// </summary>
    [ApiController]
    [Route("api/faculty")]
    [Authorize]   // Require valid JWT for all endpoints
    public class FacultyGrievanceController : ControllerBase
    {
        private readonly IFacultyGrievanceService _facultyService;
        private readonly ILogger<FacultyGrievanceController> _logger;

        public FacultyGrievanceController(
            IFacultyGrievanceService facultyService,
            ILogger<FacultyGrievanceController> logger)
        {
            _facultyService = facultyService;
            _logger         = logger;
        }

        // ── Helpers ──────────────────────────────────────────────────
        private int GetFacultyUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
            return int.TryParse(claim, out var id) ? id : 0;
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/faculty/grievances
        // Returns anonymity-safe list of faculty-assigned grievances.
        // Optional query params: ?priority=High&status=Submitted&category=Hostel&sort=priority
        // ─────────────────────────────────────────────────────────────
        [HttpGet("grievances")]
        [ProducesResponseType(typeof(IEnumerable<FacultyGrievanceDto>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<IEnumerable<FacultyGrievanceDto>>> GetGrievances(
            [FromQuery] string? priority = null,
            [FromQuery] string? status   = null,
            [FromQuery] string? category = null,
            [FromQuery] string  sort     = "latest")
        {
            try
            {
                _logger.LogInformation("Faculty {Id} fetching grievances [priority={P},status={S},cat={C},sort={So}]",
                    GetFacultyUserId(), priority, status, category, sort);

                var result = await _facultyService.GetFacultyGrievancesAsync(priority, status, category, sort);

                // Security Header: explicitly signal identity masking is active
                Response.Headers["X-Identity-Masking"] = "active";
                Response.Headers["X-Data-Classification"] = "anonymized";

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching faculty grievances");
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET /api/faculty/analytics
        // Returns aggregated analytics for faculty dashboard.
        // ─────────────────────────────────────────────────────────────
        [HttpGet("analytics")]
        [ProducesResponseType(typeof(FacultyAnalyticsDto), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<FacultyAnalyticsDto>> GetAnalytics()
        {
            try
            {
                var result = await _facultyService.GetFacultyAnalyticsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching faculty analytics");
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }

        // ─────────────────────────────────────────────────────────────
        // PUT /api/faculty/update-status/{id}
        // Faculty updates complaint status with optional resolution note.
        // SECURITY: Only InProgress and Resolved transitions are allowed.
        // ─────────────────────────────────────────────────────────────
        [HttpPut("update-status/{id:int}")]
        [ProducesResponseType(typeof(FacultyGrievanceDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<FacultyGrievanceDto>> UpdateStatus(
            int id, [FromBody] FacultyUpdateStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.NewStatus))
                return BadRequest(new { message = "NewStatus is required." });

            try
            {
                var facultyUserId = GetFacultyUserId();
                _logger.LogInformation("Faculty {FId} updating grievance {GId} to '{S}'",
                    facultyUserId, id, dto.NewStatus);

                var result = await _facultyService.UpdateGrievanceStatusAsync(id, facultyUserId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                // Status transition violation
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating grievance {Id}", id);
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }
    }
}
