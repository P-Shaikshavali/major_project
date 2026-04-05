using System.ComponentModel.DataAnnotations;

namespace EGrievanceApi.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters.")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public required string Password { get; set; }

        // Options: Student, Faculty, Warden, Dean, HOD, Admin
        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression("Student|Faculty|Warden|Dean|HOD|Admin",
            ErrorMessage = "Role must be one of: Student, Faculty, Warden, Dean, HOD, Admin.")]
        public required string Role { get; set; }

        // Student Profile Extension
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? Year { get; set; }
    }
}
