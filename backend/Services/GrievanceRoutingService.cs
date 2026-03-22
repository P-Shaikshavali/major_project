namespace EGrievanceApi.Services
{
    public class GrievanceRoutingService : IGrievanceRoutingService
    {
        public string DetermineAssignedRole(string category)
        {
            // Maps the AI output to an administrative Role
            return category switch
            {
                "Hostel" => "Warden",
                "Academic" => "Faculty",
                "Facilities" => "Admin",
                "Safety" => "Dean",
                _ => "Admin"
            };
        }
    }
}
