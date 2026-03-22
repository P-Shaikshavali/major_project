namespace EGrievanceApi.DTOs
{
    public class ChatbotRequestDto
    {
        public required string Message { get; set; }
    }

    public class ChatbotResponseDto
    {
        public required string Response { get; set; }
        public string? SuggestedCategory { get; set; }
    }
}
