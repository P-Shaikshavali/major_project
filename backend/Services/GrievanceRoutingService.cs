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
<<<<<<< HEAD
                "Hostel"     => "Warden",     // Hostel → Warden
                "Academic"   => "Faculty",    // Academic → Faculty
                "Department" => "HOD",        // Department → HOD
                "Facilities" => "Admin",      // Facilities → Admin
                "Safety"     => "Dean",       // Safety → Dean
                _            => "Admin"       // Default fallback
=======
                // ── Hostel / living conditions → Warden ──────────────────────
                "Hostel"        => "Warden",
                "Food"          => "Warden",
                "Room"          => "Warden",
                "Water"         => "Warden",
                "Cleanliness"   => "Warden",

                // ── Academic performance / teaching → Faculty ─────────────────
                "Academic"      => "Faculty",

                // ── Faculty/staff behaviour → Faculty ─────────────────────────
                "Faculty Issue" => "Faculty",

                // ── Examination / results → HOD ───────────────────────────────
                "Examination"   => "HOD",

                // ── Department-level issues → HOD ─────────────────────────────
                "Department"    => "HOD",

                // ── Campus infrastructure (lab, wifi, projector…) → Dean ──────
                "Infrastructure" => "Dean",
                "Facilities"     => "Dean",
                "Campus"         => "Dean",

                // ── Safety / harassment / discrimination → Dean ───────────────
                "Safety"         => "Dean",
                "Discrimination" => "Dean",

                // ── Administrative (fees, certificates, portals…) → Admin ─────
                "Admin"          => "Admin",

                // ── General / unclassified → Dean (Grievance Committee) ───────
                "General"        => "Dean",

                // ── Fallback ──────────────────────────────────────────────────
                _                => "Admin"
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
            };
        }
    }
}
