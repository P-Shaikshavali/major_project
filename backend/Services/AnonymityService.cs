using EGrievanceApi.Models;

namespace EGrievanceApi.Services
{
    public interface IAnonymityService
    {
        string GenerateAnonymousId();
        void MaskIdentity(Grievance grievance);
        void MaskIdentities(IEnumerable<Grievance> grievances);
    }

    public class AnonymityService : IAnonymityService
    {
        public string GenerateAnonymousId()
        {
            // Creates a unique ANON-XXXXXX identifier securely
            var randomBytes = new byte[4];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            string hex = BitConverter.ToString(randomBytes).Replace("-", "").Substring(0, 6);
            return $"ANON-{hex}";
        }

        public void MaskIdentity(Grievance grievance)
        {
            if (grievance == null) return;
            // The mapping exists internally at the database level on the row.
            // When returning the object to unauthorized roles, we strip the User object out completely.
            grievance.User = null;
        }

        public void MaskIdentities(IEnumerable<Grievance> grievances)
        {
            if (grievances == null) return;
            foreach (var g in grievances)
            {
                MaskIdentity(g);
            }
        }
    }
}
