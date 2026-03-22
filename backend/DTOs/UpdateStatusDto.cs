namespace EGrievanceApi.DTOs
{
    public class UpdateStatusDto
    {
        public required string Status { get; set; } // InProgress, Resolved, Escalated
    }
}
