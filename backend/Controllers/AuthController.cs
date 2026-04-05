using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ── Signup (primary endpoint per spec) ────────────────────────────────
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] RegisterDto request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            try
            {
                var user = await _authService.RegisterUserAsync(request);
                return Ok(new { message = "Signup successful", userId = user.Id });
            }
            catch (Exception ex) when (ex.Message.Contains("@edu.in"))
            {
                // 422 Unprocessable — student email domain violation
                return UnprocessableEntity(new { message = ex.Message });
            }
            catch (Exception ex) when (ex.Message.Contains("already exists"))
            {
                // 409 Conflict — email already taken
                return Conflict(new { message = "User already exists" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // ── Register (alias kept for backward compatibility) ──────────────────
        [HttpPost("register")]
        public Task<IActionResult> Register([FromBody] RegisterDto request)
            => Signup(request);

        // ── Login ─────────────────────────────────────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = string.Join(" ", errors) });
            }

            try
            {
                var result = await _authService.LoginUserAsync(request);
                return Ok(new
                {
                    token   = result.Token,
                    role    = result.Role,
                    name    = result.Name,
                    message = "Login successful"
                });
            }
            catch (Exception)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
        }
    }
}
