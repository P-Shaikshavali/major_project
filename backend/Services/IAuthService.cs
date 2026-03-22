using EGrievanceApi.DTOs;
using EGrievanceApi.Models;

namespace EGrievanceApi.Services
{
    public interface IAuthService
    {
        Task<User> RegisterUserAsync(RegisterDto request);
        Task<string> LoginUserAsync(LoginDto request);
    }
}
