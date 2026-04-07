using Microsoft.EntityFrameworkCore;
using EGrievanceApi.Models;

namespace EGrievanceApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Grievance> Grievances { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<FeeStatus> FeeStatuses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Unique Email constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Unique TrackingId constraint
            modelBuilder.Entity<Grievance>()
                .HasIndex(g => g.TrackingId)
                .IsUnique();
        }
    }
}
