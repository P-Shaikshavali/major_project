using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IO;
using System.Text;
using EGrievanceApi.Data;
using EGrievanceApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Default logging is sufficient for basic operational verification


var dataProtectionKeysPath = Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys");
Directory.CreateDirectory(dataProtectionKeysPath);

var dataProtectionBuilder = builder.Services.AddDataProtection()
    .SetApplicationName("EGrievanceApi")
    .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath));

if (OperatingSystem.IsWindows())
{
    dataProtectionBuilder.ProtectKeysWithDpapi();
}

// 1. Add CORS (Allow React Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// 2. Add Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Add Authentication & JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = Environment.GetEnvironmentVariable("JWT__KEY")
    ?? Environment.GetEnvironmentVariable("Jwt__Key")
    ?? jwtSettings["Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("JWT Key is missing. Set Jwt:Key in configuration or JWT__KEY as an environment variable.");
}

var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in prod
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ClockSkew = TimeSpan.Zero
    };
});


builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    // Add more roles as needed
});

// 4. Register Custom Services
builder.Services.AddSignalR(); // Enable WebSockets early
builder.Services.AddTransient<EGrievanceApi.Hubs.GrievanceHub>(); // Explictly map the hub to DI

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAIEngineService, AIEngineService>();
builder.Services.AddScoped<IGrievanceRoutingService, GrievanceRoutingService>();
builder.Services.AddScoped<IGrievanceService, GrievanceService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IChatbotService, ChatbotService>();
builder.Services.AddScoped<IAuditService, AuditService>();
// builder.Services.AddHostedService<BackgroundAutoEscalationJob>();
builder.Services.AddScoped<IAnonymityService, AnonymityService>();
builder.Services.AddScoped<IFacultyGrievanceService, FacultyGrievanceService>();
builder.Services.AddScoped<IStudentIntelligenceService, StudentIntelligenceService>();
builder.Services.AddScoped<IHODService, HODService>();

// builder.Services.AddHostedService<EscalationHostedService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS before Auth
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<EGrievanceApi.Hubs.GrievanceHub>("/hubs/grievance"); // Mount WebSocket endpoint

try
{
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine("CRITICAL FATAL EXCEPTION OCCURRED DURING STARTUP:");
    Console.WriteLine(ex.ToString());
    throw;
}
