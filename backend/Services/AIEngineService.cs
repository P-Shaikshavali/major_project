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

        // 1. Semantic Classification using TF-IDF and Cosine Similarity mapping
        public string ClassifyCategory(string complaintText)
        {
            var lowerText = complaintText.ToLower();

            // ⚠️ Keys here MUST match GrievanceRoutingService switch cases exactly
            var categoryCorpus = new Dictionary<string, string>
            {
                { "Hostel",     "food mess wifi room cleaning water bed bathroom accommodation hostel warden dormitory" },
                { "Academic",   "marks grade faculty attendance syllabus exam lecture class assignment result semester" },
                { "Department", "hod head department transfer promotion discrimination staff department issue complaint professor internal" },
                { "Facilities", "ac projector bench library lab infrastructure internet light fan equipment maintenance repairs" },
                { "Safety",     "harassment ragging fight security threat abuse bullying unsafe danger violence intimidate" },
            };

            var bestCategory = "General";
            double maxCosine = 0;

            foreach (var category in categoryCorpus)
            {
                double similarity = CalculateCosineSimilarity(lowerText, category.Value);
                if (similarity > maxCosine)
                {
                    maxCosine    = similarity;
                    bestCategory = category.Key;
                }
            }

            // Only classify if similarity exceeds threshold, otherwise use category selected by user
            return maxCosine > 0.05 ? bestCategory : "General";
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
                var sim = CalculateCosineSimilarity(past.Description, newComplaintText);
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
                if (CalculateCosineSimilarity(grievance.Description, newComplaintText) > 0.40) // Adjusted threshold for cosine map
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
                    if (CalculateCosineSimilarity(userHistory[i].Description, userHistory[j].Description) > 0.6)
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

        // Mathematical TF-IDF and Cosine Similarity Function
        private double CalculateCosineSimilarity(string text1, string text2)
        {
            var words1 = Regex.Split(text1.ToLower(), @"\W+").Where(s => s != string.Empty).ToList();
            var words2 = Regex.Split(text2.ToLower(), @"\W+").Where(s => s != string.Empty).ToList();

            if (!words1.Any() || !words2.Any()) return 0.0;

            var allWords = words1.Union(words2).Distinct().ToList();

            // Compute TF (Term Frequency) Vectors
            var vector1 = new double[allWords.Count];
            var vector2 = new double[allWords.Count];

            for (int i = 0; i < allWords.Count; i++)
            {
                string word = allWords[i];
                double tf1 = (double)words1.Count(w => w == word) / words1.Count;
                double tf2 = (double)words2.Count(w => w == word) / words2.Count;
                
                // Simple IDF simulation (inverse document frequency approximation)
                double idf = Math.Log10(2.0 / ((words1.Contains(word) ? 1 : 0) + (words2.Contains(word) ? 1 : 0)));

                vector1[i] = tf1 * idf;
                vector2[i] = tf2 * idf;
            }

            // Dot Product and Magnitudes
            double dotProduct = 0;
            double mag1 = 0;
            double mag2 = 0;

            for (int i = 0; i < allWords.Count; i++)
            {
                dotProduct += vector1[i] * vector2[i];
                mag1 += Math.Pow(vector1[i], 2);
                mag2 += Math.Pow(vector2[i], 2);
            }

            if (mag1 == 0 || mag2 == 0) return 0;

            return dotProduct / (Math.Sqrt(mag1) * Math.Sqrt(mag2));
        }
    }
}
