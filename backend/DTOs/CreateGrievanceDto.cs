namespace EGrievanceApi.DTOs
{
    public class CreateGrievanceDto
    {
        public required string Description { get; set; }
        public string? Category { get; set; }
        public string? Priority { get; set; }
        public bool IsAnonymous { get; set; }
    }
}
