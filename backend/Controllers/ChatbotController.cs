using EGrievanceApi.DTOs;
using EGrievanceApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IChatbotService _chatbotService;

        public ChatbotController(IChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("ask")]
        public IActionResult Ask([FromBody] ChatbotRequestDto request)
        {
            var response = _chatbotService.ProcessMessage(request.Message);
            return Ok(response);
        }
    }
}
