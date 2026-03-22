namespace EGrievanceApi.DTOs
{
    // ── Response: Anonymity-safe Grievance for Faculty ──
    public class FacultyGrievanceDto
    {
        public int     Id           { get; set; }
        public string  TrackingId   { get; set; } = string.Empty;
        public string  AnonymousId  { get; set; } = string.Empty;
        public string  Category     { get; set; } = string.Empty;
        public string  Description  { get; set; } = string.Empty;
        public string  Priority     { get; set; } = string.Empty;
        public string  Status       { get; set; } = string.Empty;
        public string  AssignedTo   { get; set; } = string.Empty;
        public DateTime CreatedAt   { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public bool    IsEscalated  { get; set; }
        public int     CredibilityScore { get; set; }

        // ── Decision Support Fields ──
        public int     SimilarCount          { get; set; }   // # similar open complaints
        public string  AiRecommendation      { get; set; } = string.Empty;
        public bool    SuggestEscalation     { get; set; }
        public string  EscalationReason      { get; set; } = string.Empty;
        public string  ResolutionNote        { get; set; } = string.Empty;

        // ── Security: NEVER include Name, Email, StudentId ──
        // These fields are explicitly excluded from this DTO
    }

    // ── Request: Faculty updates status ──
    public class FacultyUpdateStatusDto
    {
        public string  NewStatus      { get; set; } = string.Empty;
        public string  ResolutionNote { get; set; } = string.Empty;
        public bool    RecommendEscalation { get; set; } = false;
    }

    // ── Response: Faculty analytics dashboard ──
    public class FacultyAnalyticsDto
    {
        public int     TotalAssigned       { get; set; }
        public int     Pending             { get; set; }
        public int     InProgress          { get; set; }
        public int     Resolved            { get; set; }
        public int     Escalated           { get; set; }
        public double  AvgResolutionHours  { get; set; }
        public List<CategoryCountDto> CategoryBreakdown { get; set; } = new();
        public List<string> AiInsights               { get; set; } = new();
    }

    public class CategoryCountDto
    {
        public string Category { get; set; } = string.Empty;
        public int    Count    { get; set; }
    }
}
