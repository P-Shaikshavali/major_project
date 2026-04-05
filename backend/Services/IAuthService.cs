using EGrievanceApi.DTOs;
using EGrievanceApi.Models;

namespace EGrievanceApi.Services
{
    // ── Login result carrier ──────────────────────────────────────────────────
    public class LoginResult
    {
        public required string Token { get; set; }
        public required string Role  { get; set; }
        public required string Name  { get; set; }
    }

    public interface IAuthService
    {
        Task<User>        RegisterUserAsync(RegisterDto request);
        Task<LoginResult> LoginUserAsync(LoginDto request);
    }
}
