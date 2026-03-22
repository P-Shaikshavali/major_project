namespace EGrievanceApi.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }
        
        // Roles: Student, Faculty, Warden, Dean, Admin
        public required string Role { get; set; }
        
        // Student Specific Profile Intelligence Fields
        public string? StudentId { get; set; }
        public string? Department { get; set; }
        public string? Year { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
