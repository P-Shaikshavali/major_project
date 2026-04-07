namespace EGrievanceApi.Models
{
    public class FeeStatus
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        // e.g. "2024-Sem1", "2024-Sem2"
        public string Semester { get; set; } = string.Empty;

        // "Paid", "Unpaid", "Overdue"
        public string Status { get; set; } = "Unpaid";

        public DateTime DueDate { get; set; }
        public DateTime? ReminderSentAt { get; set; }
        public int ReminderCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
