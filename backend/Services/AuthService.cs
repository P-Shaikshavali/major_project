using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EGrievanceApi.Data;
using EGrievanceApi.DTOs;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EGrievanceApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration       _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context       = context;
            _configuration = configuration;
        }

        // ── SIGNUP ────────────────────────────────────────────────────────────
        public async Task<User> RegisterUserAsync(RegisterDto request)
        {
            // Normalise email
            var emailNorm = request.Email.Trim().ToLowerInvariant();

            // ── Role-Based Email Domain Validation (STRICT) ────────────────────────
            if (request.Role == "Student" && !emailNorm.EndsWith("@edu.in", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Registration Denied: Student accounts MUST use a college email ending in '@edu.in'");
            }
            // For others, any valid email is allowed

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailNorm))
            {
                throw new Exception("User with this email already exists.");
            }

            var user = new User
            {
                Name         = request.Name.Trim(),
                Email        = emailNorm,
                Role         = request.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                StudentId    = request.StudentId,
                Department   = request.Department,
                Year         = request.Year
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }


        // ── LOGIN ─────────────────────────────────────────────────────────────
        public async Task<LoginResult> LoginUserAsync(LoginDto request)
        {
            var emailNorm = request.Email.Trim().ToLowerInvariant();
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Email.ToLower() == emailNorm);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new Exception("Invalid email or password.");
            }

            return new LoginResult
            {
                Token = GenerateJwtToken(user),
                Role  = user.Role,
                Name  = user.Name
            };
        }

        // ── JWT Generator ─────────────────────────────────────────────────────
        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var jwtKey = Environment.GetEnvironmentVariable("JWT__KEY")
                ?? Environment.GetEnvironmentVariable("Jwt__Key")
                ?? jwtSettings["Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
                throw new InvalidOperationException(
                    "JWT Key is missing. Set Jwt:Key in config or JWT__KEY env var.");

            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email,           user.Email),
                new Claim(ClaimTypes.Name,            user.Name),
                new Claim(ClaimTypes.Role,            user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject            = new ClaimsIdentity(claims),
                Expires            = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature),
                Issuer   = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
    }
}
