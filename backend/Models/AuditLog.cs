namespace EGrievanceApi.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public required string Action { get; set; } // e.g., "GrievanceCreated", "StatusUpdated", "Escalated"
        public int? UserId { get; set; } // Who performed the action
        public string? Details { get; set; } // JSON or text details
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
