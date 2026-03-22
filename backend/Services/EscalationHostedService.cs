using EGrievanceApi.Data;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EGrievanceApi.Services
{
    public class EscalationHostedService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EscalationHostedService> _logger;

        public EscalationHostedService(IServiceProvider serviceProvider, ILogger<EscalationHostedService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Escalation Hosted Service running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessEscalationsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Escalation processing.");
                }

                // Run every 24 hours (or whatever interval is appropriate)
                // For demonstration, simulating a 1-hour check cycle:
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task ProcessEscalationsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var thresholdDate = DateTime.UtcNow.AddDays(-3);

            var grievancesToEscalate = await context.Grievances
                .Where(g => g.Status != "Resolved" && !g.IsEscalated && g.CreatedAt <= thresholdDate)
                .ToListAsync(stoppingToken);

            foreach (var grievance in grievancesToEscalate)
            {
                grievance.IsEscalated = true;
                grievance.Status = "Escalated";
                grievance.AssignedTo = "CollegeDean";

                context.AuditLogs.Add(new AuditLog 
                {
                    Action = "SystemEscalation",
                    UserId = null, // System action
                    Details = $"Automatically escalated {grievance.TrackingId} after 3 days."
                });

                _logger.LogWarning($"Escalating Grievance {grievance.TrackingId} to CollegeDean.");
            }

            if (grievancesToEscalate.Any())
            {
                await context.SaveChangesAsync(stoppingToken);
            }
        }
    }
}
