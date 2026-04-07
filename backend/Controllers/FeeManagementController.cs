using EGrievanceApi.Data;
using EGrievanceApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EGrievanceApi.Controllers
{
    [ApiController]
    [Route("api/fee")]
    [Authorize]
    public class FeeManagementController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FeeManagementController> _logger;

        public FeeManagementController(ApplicationDbContext context, ILogger<FeeManagementController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0";
            return int.TryParse(claim, out var id) ? id : 0;
        }

        // ── GET /api/fee/all ── Admin only: all students + fee statuses ────────
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllFeeStatuses()
        {
            // Ensure every registered student has a FeeStatus record
            var students = await _context.Users
                .Where(u => u.Role == "Student")
                .ToListAsync();

            foreach (var student in students)
            {
                var exists = await _context.FeeStatuses
                    .AnyAsync(f => f.UserId == student.Id);

                if (!exists)
                {
                    // Auto-create a fee record for new students (seeded as Unpaid)
                    _context.FeeStatuses.Add(new FeeStatus
                    {
                        UserId    = student.Id,
                        Semester  = $"{DateTime.UtcNow.Year}-Sem{(DateTime.UtcNow.Month <= 6 ? 1 : 2)}",
                        Status    = "Unpaid",
                        DueDate   = DateTime.UtcNow.AddDays(30),
                    });
                }
            }
            await _context.SaveChangesAsync();

            var result = await _context.FeeStatuses
                .Include(f => f.User)
                .AsNoTracking()
                .Select(f => new
                {
                    f.Id,
                    f.UserId,
                    StudentName    = f.User != null ? f.User.Name  : "Unknown",
                    StudentEmail   = f.User != null ? f.User.Email : "Unknown",
                    f.Semester,
                    f.Status,
                    f.DueDate,
                    f.ReminderSentAt,
                    f.ReminderCount,
                    IsOverdue      = f.Status == "Unpaid" && f.DueDate < DateTime.UtcNow,
                })
                .OrderBy(f => f.Status)
                .ToListAsync();

            return Ok(result);
        }

        // ── POST /api/fee/remind/{userId} ── Admin only: send reminder ─────────
        [HttpPost("remind/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SendReminder(int userId)
        {
            var fee = await _context.FeeStatuses
                .FirstOrDefaultAsync(f => f.UserId == userId);

            if (fee == null)
                return NotFound(new { message = "No fee record found for this student." });

            if (fee.Status == "Paid")
                return BadRequest(new { message = "Student has already paid. No reminder needed." });

            // Mark overdue if due date has passed
            if (fee.DueDate < DateTime.UtcNow && fee.Status == "Unpaid")
                fee.Status = "Overdue";

            fee.ReminderSentAt = DateTime.UtcNow;
            fee.ReminderCount  += 1;

            var student = await _context.Users.FindAsync(userId);

            _context.AuditLogs.Add(new AuditLog
            {
                UserId  = GetUserId(),
                Action  = "FeeReminderSent",
                Details = $"Admin sent fee reminder #{fee.ReminderCount} to student {student?.Name} ({student?.Email}) for {fee.Semester}."
            });

            await _context.SaveChangesAsync();

            _logger.LogInformation("Fee reminder sent to UserId={UserId}, Semester={Sem}, Count={C}",
                userId, fee.Semester, fee.ReminderCount);

            return Ok(new
            {
                message       = $"Reminder sent to {student?.Name ?? "student"} successfully.",
                reminderCount = fee.ReminderCount,
                sentAt        = fee.ReminderSentAt
            });
        }

        // ── PUT /api/fee/mark-paid/{userId} ── Admin only: mark as paid ────────
        [HttpPut("mark-paid/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkPaid(int userId)
        {
            var fee = await _context.FeeStatuses.FirstOrDefaultAsync(f => f.UserId == userId);
            if (fee == null) return NotFound(new { message = "No fee record found." });

            fee.Status = "Paid";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Fee marked as paid." });
        }

        // ── GET /api/fee/my-status ── Student: own fee status ─────────────────
        [HttpGet("my-status")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyFeeStatus()
        {
            var userId = GetUserId();
            var fee = await _context.FeeStatuses
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.UserId == userId);

            if (fee == null)
                return Ok(new { status = "Unknown", message = "No fee record found. Contact admin." });

            // Auto-mark overdue
            var isOverdue = fee.Status == "Unpaid" && fee.DueDate < DateTime.UtcNow;

            return Ok(new
            {
                fee.Semester,
                Status        = isOverdue ? "Overdue" : fee.Status,
                fee.DueDate,
                fee.ReminderSentAt,
                fee.ReminderCount,
                NeedsAttention = fee.Status != "Paid",
            });
        }
    }
}
