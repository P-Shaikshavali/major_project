using EGrievanceApi.DTOs;

namespace EGrievanceApi.Services
{
    public interface IChatbotService
    {
        ChatbotResponseDto ProcessMessage(string message);
    }
}
