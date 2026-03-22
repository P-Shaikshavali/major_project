using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EGrievanceApi.Data;

var builder = WebApplication.CreateBuilder(args);

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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Add Authentication & JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing"));

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
builder.Services.AddScoped<EGrievanceApi.Services.IAuthService, EGrievanceApi.Services.AuthService>();
builder.Services.AddScoped<EGrievanceApi.Services.IAIEngineService, EGrievanceApi.Services.AIEngineService>();
builder.Services.AddScoped<EGrievanceApi.Services.IGrievanceRoutingService, EGrievanceApi.Services.GrievanceRoutingService>();
builder.Services.AddScoped<EGrievanceApi.Services.IGrievanceService, EGrievanceApi.Services.GrievanceService>();
builder.Services.AddScoped<EGrievanceApi.Services.IChatbotService, EGrievanceApi.Services.ChatbotService>();
builder.Services.AddScoped<EGrievanceApi.Services.IAnonymityService, EGrievanceApi.Services.AnonymityService>();

builder.Services.AddHostedService<EGrievanceApi.Services.EscalationHostedService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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

app.Run();
