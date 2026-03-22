namespace EGrievanceApi.Services
{
    public interface IGrievanceRoutingService
    {
        string DetermineAssignedRole(string category);
    }
}
