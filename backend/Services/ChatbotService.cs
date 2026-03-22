using EGrievanceApi.DTOs;

namespace EGrievanceApi.Services
{
    public class ChatbotService : IChatbotService
    {
        private readonly IAIEngineService _aiEngine;

        public ChatbotService(IAIEngineService aiEngine)
        {
            _aiEngine = aiEngine;
        }

        public ChatbotResponseDto ProcessMessage(string message)
        {
            var lowerMessage = message.ToLower();

            if (lowerMessage.Contains("status") || lowerMessage.Contains("where is my complaint"))
            {
                return new ChatbotResponseDto 
                { 
                    Response = "You can check the status of your complaints by navigating to the 'My Complaints' section of your dashboard.",
                    SuggestedCategory = null
                };
            }

            // Route standard complaints to AI classification for category suggestion
            var suggestedCategory = _aiEngine.ClassifyCategory(message);

            string responseText = suggestedCategory switch
            {
                "Hostel" => "It sounds like you have a hostel or accommodation issue. We recommend selecting the 'Hostel' category.",
                "Academic" => "Are you facing issues with marks, faculty, or attendance? Please select 'Academic'.",
                "Facilities" => "For infrastructure issues like AC or Labs, use the 'Facilities' category.",
                "Safety" => "Safety issues are treated with high priority. Please submit a 'Safety' grievance immediately.",
                _ => "I can help you log this grievance. Please proceed to the Submit form."
            };

            return new ChatbotResponseDto
            {
                Response = responseText,
                SuggestedCategory = suggestedCategory
            };
        }
    }
}
