using EGrievanceApi.Data;
using EGrievanceApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace EGrievanceApi.Services
{
    public class AIEngineService : IAIEngineService
    {
        private readonly ApplicationDbContext _context;

        public AIEngineService(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Semantic Classification - Simulate Embeddings via Keyword Mapping
        public string ClassifyCategory(string complaintText)
        {
            var lowerText = complaintText.ToLower();

            // Simulate semantic vectors/clusters
            var categories = new Dictionary<string, List<string>>
            {
                { "Hostel", new List<string> { "food", "mess", "wifi", "room", "cleaning", "water" } },
                { "Academic", new List<string> { "marks", "grade", "faculty", "attendance", "syllabus", "exam" } },
                { "Facilities", new List<string> { "ac", "projector", "bench", "library", "lab" } },
                { "Safety", new List<string> { "harassment", "ragging", "fight", "security", "threat" } }
            };

            var maxMatch = 0;
            var bestCategory = "General";

            foreach (var category in categories)
            {
                int matchCount = category.Value.Count(word => lowerText.Contains(word));
                if (matchCount > maxMatch)
                {
                    maxMatch = matchCount;
                    bestCategory = category.Key;
                }
            }

            return bestCategory;
        }

        // 2. Priority Prediction
        public string PredictPriority(string complaintText)
        {
            var lowerText = complaintText.ToLower();
            
            // High Priority Indicators
            string[] highIndicators = { "harassment", "urgent", "danger", "ragging", "threat" };
            if (highIndicators.Any(word => lowerText.Contains(word))) return "High";

            // Medium Priority Indicators
            string[] mediumIndicators = { "broken", "not working", "issue", "problem", "marks" };
            if (mediumIndicators.Any(word => lowerText.Contains(word))) return "Medium";

            return "Low";
        }

        // 3. Credibility Score
        public async Task<int> CalculateCredibilityScoreAsync(int userId, string newComplaintText)
        {
            var userHistory = await _context.Grievances
                .Where(g => g.UserId == userId)
                .ToListAsync();

            if (!userHistory.Any()) return 50;

            double w1 = 0.4; // Resolution Success
            double w2 = 0.3; // Consistency
            double w3 = 0.2; // Similarity 
            double w4 = 0.1; // Anomaly Penalty

            double resSuccess = userHistory.Count == 0 ? 0 : 
                ((double)userHistory.Count(g => g.Status == "Resolved") / userHistory.Count) * 100;
                
            var categories = userHistory.Select(g => g.Category).Distinct().Count();
            double compConsistency = categories == 0 ? 100 : Math.Clamp(100 - (categories * 10), 0, 100);

            double maxSim = 0;
            foreach (var past in userHistory)
            {
                var sim = CalculateSimilarity(past.Description, newComplaintText);
                if (sim > maxSim) maxSim = sim;
            }
            double duplicateFactor = (1.0 - maxSim) * 100; 
            
            double anomalyPenalty = userHistory.Count(g => g.IsEscalated) * 10;

            double finalScore = (resSuccess * w1) + (compConsistency * w2) + (duplicateFactor * w3) - (anomalyPenalty * w4);
            return (int)Math.Clamp(finalScore, 0, 100);
        }

        // 4. Duplicate Detection
        public async Task<List<Grievance>> DetectDuplicatesAsync(string newComplaintText)
        {
            var allGrievances = await _context.Grievances
                .Where(g => g.Status != "Resolved") // Only compare with open issues
                .ToListAsync();

            var duplicates = new List<Grievance>();

            foreach (var grievance in allGrievances)
            {
                if (CalculateSimilarity(grievance.Description, newComplaintText) > 0.75) // 75% similarity threshold
                {
                    duplicates.Add(grievance);
                }
            }

            return duplicates;
        }

        // 5. Behavioral Analytics Insights
        public async Task<string> GenerateUserInsightsAsync(int userId)
        {
            var userHistory = await _context.Grievances.Where(g => g.UserId == userId).ToListAsync();
            if (!userHistory.Any()) return "No historical data available for this user.";

            string insight = "";
            
            var topCategory = userHistory.GroupBy(g => g.Category).OrderByDescending(g => g.Count()).FirstOrDefault();
            if (topCategory != null && topCategory.Count() > 1)
            {
                insight += $"User shows consistent complaint behavior in the {topCategory.Key} category. ";
            }

            var duplicateCount = 0;
            for (int i = 0; i < userHistory.Count; i++)
            {
                for (int j = i + 1; j < userHistory.Count; j++)
                {
                    if (CalculateSimilarity(userHistory[i].Description, userHistory[j].Description) > 0.8)
                        duplicateCount++;
                }
            }
            if (duplicateCount > 0)
            {
                insight += "Anomaly pattern detected: Repeated highly-similar complaints. ";
            }
            
            var escalations = userHistory.Count(g => g.IsEscalated);
            if (escalations > 0 && userHistory.Count > 2)
            {
                insight += "Low credibility factor: Frequently escalated grievances.";
            }

            if (string.IsNullOrWhiteSpace(insight))
            {
                insight = "High credibility: Normal resolution cycles observed with balanced complaint variation.";
            }

            return insight.Trim();
        }

        // Simulated Cosine Similarity Function
        private double CalculateSimilarity(string text1, string text2)
        {
            var words1 = Regex.Split(text1.ToLower(), @"\W+").Where(s => s != string.Empty);
            var words2 = Regex.Split(text2.ToLower(), @"\W+").Where(s => s != string.Empty);

            var intersection = words1.Intersect(words2).Count();
            var union = words1.Union(words2).Count();

            return union == 0 ? 0 : (double)intersection / union;
        }
    }
}
