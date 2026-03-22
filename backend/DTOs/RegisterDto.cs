namespace EGrievanceApi.DTOs
{
    public class RegisterDto
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        // Options: Student, Faculty, Warden, Dean, Admin
        public required string Role { get; set; } 
        
        // Student Profile Extension
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? Year { get; set; } 
    }
}
