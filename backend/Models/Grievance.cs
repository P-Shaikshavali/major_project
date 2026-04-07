namespace EGrievanceApi.Models
{
    public class Grievance
    {
        public int Id { get; set; }
        
        // Auto-generated: GRV-XXXX
        public required string TrackingId { get; set; }
        
        // Anonymous Masking (AUTO GENERATED UNIQUE ID: ANON-XXXX)
        public string AnonymousId { get; set; } = string.Empty;
        
        // Foreign Key to User
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public required string Category { get; set; }
        public required string Description { get; set; }
        
        // Submitted, InProgress, Resolved, Escalated
        public string Status { get; set; } = "Submitted";
        
        // High, Medium, Low
        public string Priority { get; set; } = "Low";
        
        // Role assigned to handle it (e.g., Warden, Faculty, HOD, Dean)
        public string AssignedToRole { get; set; } = "Unassigned";
        
        // Optional: Specific user assigned to handle it
        public int? AssignedToUserId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        
        public bool IsEscalated { get; set; } = false;
        
        // AI-calculated score (0-100)
        public int CredibilityScore { get; set; } = 50;
    }
}
