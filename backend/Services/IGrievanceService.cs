using EGrievanceApi.DTOs;
using EGrievanceApi.Models;

namespace EGrievanceApi.Services
{
    public interface IGrievanceService
    {
        Task<Grievance> CreateGrievanceAsync(int userId, CreateGrievanceDto request);
        Task<IEnumerable<Grievance>> GetMyGrievancesAsync(int userId);
        Task<IEnumerable<Grievance>> GetAllGrievancesAsync();
        Task<Grievance> UpdateStatusAsync(int grievanceId, string newStatus, int adminUserId);
    }
}
