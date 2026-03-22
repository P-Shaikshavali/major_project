using EGrievanceApi.DTOs;

namespace EGrievanceApi.Services
{
    public interface IFacultyGrievanceService
    {
        /// <summary>
        /// Returns faculty-assigned grievances with full anonymity enforcement.
        /// Supported filters: priority, status, category, sort
        /// </summary>
        Task<IEnumerable<FacultyGrievanceDto>> GetFacultyGrievancesAsync(
            string?  priority   = null,
            string?  status     = null,
            string?  category   = null,
            string   sort       = "latest");

        /// <summary>
        /// Allows faculty to update the status of a complaint and optionally add a resolution note.
        /// All changes are audit-logged against the faculty user's ID.
        /// </summary>
        Task<FacultyGrievanceDto> UpdateGrievanceStatusAsync(
            int    grievanceId,
            int    facultyUserId,
            FacultyUpdateStatusDto dto);

        /// <summary>
        /// Returns analytics: totals, avg resolution time, category breakdown, AI insights.
        /// </summary>
        Task<FacultyAnalyticsDto> GetFacultyAnalyticsAsync();
    }
}
