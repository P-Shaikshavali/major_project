using EGrievanceApi.Models;

namespace EGrievanceApi.Services
{
    public interface IAIEngineService
    {
        // 1. Semantic Classification
        string ClassifyCategory(string complaintText);

        // 2. Priority Prediction
        string PredictPriority(string complaintText);

        // 3. Credibility Score
        Task<int> CalculateCredibilityScoreAsync(int userId, string newComplaintText);

        // 4. Duplicate Detection
        Task<List<Grievance>> DetectDuplicatesAsync(string newComplaintText);

        // 5. Behavioral Analytics Insights
        Task<string> GenerateUserInsightsAsync(int userId);
    }
}
