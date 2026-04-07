using EGrievanceApi.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EGrievanceApi.Services
{
    public interface IWardenGrievanceService
    {
        Task<IEnumerable<WardenGrievanceDto>> GetWardenGrievancesAsync(int wardenUserId);
        Task<WardenStudentDetailsDto> GetStudentDetailsSecurelyAsync(string anonymousId, int wardenUserId);
        Task UpdateGrievanceStatusAsync(int grievanceId, WardenUpdateStatusDto dto, int wardenUserId);
        Task<WardenAnalyticsDto> GetWardenAnalyticsAsync();
    }
}
