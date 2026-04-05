namespace EGrievanceApi.Services
{
    public class GrievanceRoutingService : IGrievanceRoutingService
    {
        /// <summary>
        /// Maps complaint category to the responsible authority role.
        /// High priority complaints are additionally flagged via IsEscalated
        /// so Admin dashboards always surface them.
        /// </summary>
        public string DetermineAssignedRole(string category)
        {
            return category switch
            {
                "Hostel"     => "Warden",     // Hostel → Warden
                "Academic"   => "Faculty",    // Academic → Faculty
                "Department" => "HOD",        // Department → HOD
                "Facilities" => "Admin",      // Facilities → Admin
                "Safety"     => "Dean",       // Safety → Dean
                _            => "Admin"       // Default fallback
            };
        }
    }
}
