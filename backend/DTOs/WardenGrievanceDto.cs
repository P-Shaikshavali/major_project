using System;

namespace EGrievanceApi.DTOs
{
    public class WardenGrievanceDto
    {
        public int Id { get; set; }
        public string TrackingId { get; set; } = string.Empty;
        public string AnonymousId { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsEscalated { get; set; }

        // AI specific fields
        public int SimilarCount { get; set; }
    }

    public class WardenUpdateStatusDto
    {
        public string NewStatus { get; set; } = string.Empty;
        public string ResolutionNote { get; set; } = string.Empty;
        public bool Escalate { get; set; }
    }

    public class WardenAnalyticsDto
    {
        public int TotalComplaints { get; set; }
        public int PendingComplaints { get; set; }
        public int ResolvedComplaints { get; set; }
        public string MostFrequentIssue { get; set; } = "None";
    }

    public class WardenStudentDetailsDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Department { get; set; } = "N/A"; // Or major
    }
}
