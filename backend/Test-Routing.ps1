$ErrorActionPreference = "Stop"
$ApiBase = "http://localhost:5275/api"

Write-Host "--- EGrievance Routing Test Suite ---" -ForegroundColor Cyan

# 0. Register to ensure user exists
try {
    $regBody = @{ Email = "tester@edu.in"; Password = "password123"; Name = "Tester"; Role = "Student"; StudentId = "123" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$ApiBase/Auth/register" -Method Post -Body $regBody -ContentType "application/json" -ErrorAction Stop | Out-Null
    Write-Host "Tester Registered"
} catch {}

# 1. Login to get token
Write-Host "Logging in as tester..."
$loginBody = @{ Email = "tester@edu.in"; Password = "password123" } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$ApiBase/Auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $res.Token
    Write-Host "Login Successful!" -ForegroundColor Green
} catch {
    Write-Host "Login Failed. Exiting." -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# Define our robust multi-category test cases.
# We will test cases where we explicitly set the category, AND where AI does it.
$testCases = @(
    # --- FACULTY ISSUES ---
    @{
        Name = "1. Explicit Academic (Faculty)"
        Description = "Teacher has not uploaded the assignment marks yet."
        ExplicitCategory = "Academic"
        ExpectedCategory = "Academic"
        ExpectedRole = "Faculty"
    },
    @{
        Name = "2. Explicit Faculty Issue (Faculty)"
        Description = "Their us monitor issue in class room"
        ExplicitCategory = "Faculty Issue"
        ExpectedCategory = "Faculty Issue"
        ExpectedRole = "Faculty"
    },
    
    # --- HOD ISSUES ---
    @{
        Name = "3. Explicit Examination (HOD)"
        Description = "My internal exam hall ticket is missing from the portal."
        ExplicitCategory = "Examination"
        ExpectedCategory = "Examination"
        ExpectedRole = "HOD"
    },
    @{
        Name = "4. Explicit Department (HOD)"
        Description = "Requesting permission for a departmental internship."
        ExplicitCategory = "Department"
        ExpectedCategory = "Department"
        ExpectedRole = "HOD"
    },
    
    # --- WARDEN ISSUES ---
    @{
        Name = "5. Explicit Hostel (Warden)"
        Description = "Room roof is leaking severely in block B."
        ExplicitCategory = "Hostel"
        ExpectedCategory = "Hostel"
        ExpectedRole = "Warden"
    },
    @{
        Name = "6. Explicit Food (Warden)"
        Description = "The bad food in the mess is making people sick with unhygienic conditions."
        ExplicitCategory = "Food"
        ExpectedCategory = "Food"
        ExpectedRole = "Warden"
    },

    # --- DEAN ISSUES ---
    @{
        Name = "7. Explicit Infrastructure (Dean)"
        Description = "The wifi is completely broken in the main campus, we need an engineer."
        ExplicitCategory = "Infrastructure"
        ExpectedCategory = "Infrastructure"
        ExpectedRole = "Dean"
    },
    @{
        Name = "8. Explicit Safety (Dean)"
        Description = "Someone has been threatening students near the gate."
        ExplicitCategory = "Safety"
        ExpectedCategory = "Safety"
        ExpectedRole = "Dean"
    },

    # --- ADMIN ISSUES ---
    @{
        Name = "9. Explicit Admin (Admin)"
        Description = "Need a refund for my last semester fee overcharge."
        ExplicitCategory = "Admin"
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "10. Explicit General (Admin default)"
        Description = "I have a general inquiry about college working days."
        ExplicitCategory = "General"
        ExpectedCategory = "General"
        ExpectedRole = "Dean"
    },

    # --- AI FALLBACK EXPERIMENTS ---
    @{
        Name = "11. AI Fallback - Dean (No Category)"
        Description = "The library projector is completely broken and nobody is fixing it."
        ExplicitCategory = $null
        ExpectedCategory = "Infrastructure"
        ExpectedRole = "Dean"
    },
    @{
        Name = "12. AI Fallback - Faculty (No Category)"
        Description = "The professor is showing bias and unfair evaluation."
        ExplicitCategory = $null
        ExpectedCategory = "Faculty Issue"
        ExpectedRole = "Faculty"
    },

    # --- HARD/COMPLEX AI TEST CASES ---
    @{
        Name = "13. Hard Fallback - Warden (Multi-issue)"
        Description = "The drinking water in the dorm is unhygienic and we have a room leak. Plus the mess food is undercooked."
        ExplicitCategory = $null
        ExpectedCategory = $null # Can be Hostel or Food, we only care about Warden role
        ExpectedRole = "Warden"
    },
    @{
        Name = "14. Hard Fallback - Faculty (Complex)"
        Description = "The professor for my core coursework has a strong bias and gave me unfair marks in the internal lab assignment."
        ExplicitCategory = $null
        ExpectedCategory = $null # Can be Academic or Faculty Issue
        ExpectedRole = "Faculty"
    },
    @{
        Name = "15. Hard Fallback - HOD (Multi-Dept)"
        Description = "Requesting the department head to sign my internship bond as my examination result and hall ticket have an issue."
        ExplicitCategory = $null
        ExpectedCategory = $null # Can be Examination or Department
        ExpectedRole = "HOD"
    },
    @{
        Name = "16. Hard Fallback - Dean (Severe Event)"
        Description = "A massive fight and harassment incident occurred near the library corridor. It's unsafe and there's a serious threat to students."
        ExplicitCategory = $null
        ExpectedCategory = $null # Can be Safety or Infrastructure
        ExpectedRole = "Dean"
    },
    @{
        Name = "17. Hard Fallback - Admin (Records)"
        Description = "My admission portal is failing, and my fee refund scholarship document certificate is missing."
        ExplicitCategory = $null
        ExpectedCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "18. Explicit Warden (Misspelled)"
        Description = "Th hostl is veri onheigenic"
        ExplicitCategory = "Hostel"
        ExpectedCategory = "Hostel"
        ExpectedRole = "Warden"
    },
    @{
        Name = "19. AI Fallback - Short string HOD"
        Description = "Exam hall ticket missing"
        ExplicitCategory = $null
        ExpectedCategory = "Examination"
        ExpectedRole = "HOD"
    },
    @{
        Name = "20. AI Fallback - Short string Admin"
        Description = "Fee scholarship issue"
        ExplicitCategory = $null
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "21. AI Fallback - Dean (Threat)"
        Description = "I feel unsafe on campus due to threats"
        ExplicitCategory = $null
        ExpectedCategory = "Safety"
        ExpectedRole = "Dean"
    },
    @{
        Name = "22. AI Fallback - Warden (Food Quality)"
        Description = "Got sick because of canteen meal quality"
        ExplicitCategory = $null
        ExpectedCategory = "Food"
        ExpectedRole = "Warden"
    },
    @{
        Name = "23. AI Fallback - Faculty (Evaluation)"
        Description = "The marks are unfair."
        ExplicitCategory = $null
        ExpectedCategory = "Faculty Issue"
        ExpectedRole = "Faculty"
    },
    @{
        Name = "24. Explicit General with Category override"
        Description = "[CATEGORY: Infrastructure] Provide some extra chairs in block D."
        ExplicitCategory = $null
        ExpectedCategory = "Infrastructure"
        ExpectedRole = "Dean"
    },
    @{
        Name = "25. Explicit Category override via tag 2"
        Description = "[CATEGORY: Hostel] Give us better room numbers"
        ExplicitCategory = $null
        ExpectedCategory = "Hostel"
        ExpectedRole = "Warden"
    },
    @{
        Name = "26. AI Fallback - Academic (Syllabus)"
        Description = "The core subject syllabus is incomplete before exams."
        ExplicitCategory = $null
        ExpectedCategory = "Academic"
        ExpectedRole = "Faculty"
    },
    @{
        Name = "27. AI Fallback - Dean (Water logging)"
        Description = "The campus road is blocked by water due to bad pipes."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "28. AI Fallback - Faculty (Assignment delay)"
        Description = "Assignment results are extremely delayed."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "29. AI Fallback - HOD (Permission)"
        Description = "Need permission for industry visit for my branch."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "30. AI Fallback - Warden (Electricity)"
        Description = "No power in the dormitory since last night."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "31. AI Fallback - Warden (Cleanliness)"
        Description = "The washrooms in our building are heavily unhygienic."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "32. AI Fallback - Admin (Payment gateway)"
        Description = "My credit card was charged twice on the portal."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "33. AI Fallback - Admin (Document)"
        Description = "Need my transfer certificate and transcripts immediately."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "34. AI Fallback - Dean (Bullying)"
        Description = "Report of harassment and bullying by seniors in campus."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "35. AI Fallback - Faculty (Class timings)"
        Description = "The lecture timings clash with another subject."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "36. Hard Fallback - Mixed AI (Faculty)"
        Description = "The coursework assignment has an internal issue and I need a scholarship fee extension."
        ExplicitCategory = $null
        ExpectedRole = "(Faculty|Admin)"
    },
    @{
        Name = "37. AI Fallback - Faculty (Partiality)"
        Description = "Teacher is showing partiality and unfair bias."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "38. AI Fallback - Dean (Lift Broken)"
        Description = "Elevator in the main building is stuck."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "39. AI Fallback - Dean (Ragging)"
        Description = "Severe ragging and abuse in the corridor."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "40. Explicit - Admin (ID Card)"
        Description = "Lost my student ID card, need replacement."
        ExplicitCategory = "Admin"
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "41. AI Fallback - HOD (Exam Revaluation)"
        Description = "Need revaluation for my answer sheet paper."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "42. Explicit - Admin (Portal Issue)"
        Description = "Admission portal is not accepting documents."
        ExplicitCategory = "Admin"
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "43. AI Fallback - HOD (Result Issue)"
        Description = "My examination result has a malpractice flag falsely."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "44. AI Fallback - Faculty (Syllabus Cover)"
        Description = "The curriculum and syllabus were not covered by the lecturer."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "45. AI Fallback - Faculty (Grading)"
        Description = "Extremely unfair grading in the internal project."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "46. AI Fallback - HOD (Fest Permission)"
        Description = "The departmental branch needs placement for fest."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "47. AI Fallback - Warden (Bad Food)"
        Description = "Mess food is totally undercooked and bad."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "48. AI Fallback - Warden (Dining Hygiene)"
        Description = "Dining hall is very unhygienic with stale food."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "49. Explicit - Admin (Fee Refund)"
        Description = "Scholarship fee refund has not been credited."
        ExplicitCategory = "Admin"
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "50. AI Fallback - Dean (Violence)"
        Description = "Fight and violence intimidated students today."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "51. AI Fallback - Dean (Library Wifi)"
        Description = "The wifi internet in the library is down."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "52. AI Fallback - Dean (AC broken)"
        Description = "Laboratory ac and projector are malfunctioning."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "53. AI Fallback - Warden (Washroom Leak)"
        Description = "Hostel washroom pipe has a massive leak."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "54. AI Fallback - Faculty (Favouritism)"
        Description = "Clear favouritism in class attendance."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "55. AI Fallback - HOD (Cheating Exam)"
        Description = "Students were cheating with answer sheet in examination."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "56. AI Fallback - HOD (Placement Details)"
        Description = "Need details for departmental internship placement."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "57. AI Fallback - Admin (Bonafide)"
        Description = "I urgently require a bonafide certificate."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "58. Explicit - Admin (Transfer Cert)"
        Description = "Please issue my transfer document fee."
        ExplicitCategory = "Admin"
        ExpectedCategory = "Admin"
        ExpectedRole = "Admin"
    },
    @{
        Name = "59. AI Fallback - Dean (Stray animals)"
        Description = "Unsafe roads with threat from outside."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "60. AI Fallback - Dean (Parking)"
        Description = "Corridor and parking facility need maintenance."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "61. AI Fallback - HOD (Signature)"
        Description = "HOD signature required on alumni department portal."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "62. AI Fallback - Dean (Broken Bench)"
        Description = "Bench in the laboratory is broken."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "63. AI Fallback - Faculty (Outdated notes)"
        Description = "Lecture notes provided are irrelevant to coursework."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "64. AI Fallback - Admin (Penalty Error)"
        Description = "I was charged late fees despite paying."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "65. AI Fallback - Admin (Admission query)"
        Description = "Admission transfer process requires a document."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "66. AI Fallback - Dean (Lift maintenance)"
        Description = "Elevator in the building needs urgent maintenance."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "67. AI Fallback - Dean (Parking Fight)"
        Description = "Security threat and fight in the parking area."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "68. AI Fallback - Warden (Torn mattress)"
        Description = "Dorm mattress and bedsheet are highly damaged."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "69. AI Fallback - Warden (Toilet issue)"
        Description = "Toilet washroom in dorm is not cleaned by warden staff."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "70. AI Fallback - HOD (Seating Arrangement)"
        Description = "Seating for the examination hall ticket is wrong."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "71. AI Fallback - Faculty (Notes missing)"
        Description = "Lecture syllabus notes were not provided."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "72. AI Fallback - Faculty (Unfair marks)"
        Description = "Unfair internal evaluation evaluation."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "73. Explicit - Dean (Maintenance)"
        Description = "Need maintenance for the gymnasium facility."
        ExplicitCategory = "Infrastructure"
        ExpectedCategory = "Infrastructure"
        ExpectedRole = "Dean"
    },
    @{
        Name = "74. AI Fallback - Faculty (Plagiarism)"
        Description = "Teacher reported plagiarism in project assignment."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "75. Explicit - HOD (Alumni)"
        Description = "Requesting alumni details for department placement."
        ExplicitCategory = "Department"
        ExpectedCategory = "Department"
        ExpectedRole = "HOD"
    },
    @{
        Name = "76. AI Fallback - Admin (Scholarship rejection)"
        Description = "My scholarship document was portal rejected."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "77. AI Fallback - Admin (Fee issue)"
        Description = "Admission fee portal transaction failed."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "78. AI Fallback - Admin (Document request)"
        Description = "Id card and transfer certificate requested."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    },
    @{
        Name = "79. AI Fallback - Dean (Harassment)"
        Description = "Harassment and discrimination by anonymous group."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "80. AI Fallback - Dean (Gym)"
        Description = "Sports gymnasium facility requires maintenance."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "81. AI Fallback - Dean (Sports field)"
        Description = "Maintenance for sports."
        ExplicitCategory = $null
        ExpectedRole = "Dean"
    },
    @{
        Name = "82. AI Fallback - Warden (Dormitory leak)"
        Description = "Ceiling leak in dormitory room."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "83. AI Fallback - Warden (Insect food)"
        Description = "Insect bad food in dining mess."
        ExplicitCategory = $null
        ExpectedRole = "Warden"
    },
    @{
        Name = "84. AI Fallback - HOD (Practical schedule)"
        Description = "Examination hall ticket revaluation."
        ExplicitCategory = $null
        ExpectedRole = "HOD"
    },
    @{
        Name = "85. AI Fallback - Faculty (Absent Teacher)"
        Description = "Lecturer misses teaching class notes."
        ExplicitCategory = $null
        ExpectedRole = "Faculty"
    },
    @{
        Name = "86. AI Fallback - Admin (Payment glitch)"
        Description = "Fees refund scholarship."
        ExplicitCategory = $null
        ExpectedRole = "Admin"
    }
)

$passed = 0
$total = $testCases.Count

foreach ($tc in $testCases) {
    Write-Host "`nTest: $($tc.Name)" -ForegroundColor Yellow
    
    $payloadObj = @{
        Description = $tc.Description
    }
    if ($tc.ExplicitCategory) {
        $payloadObj.Category = $tc.ExplicitCategory
    }

    $payloadJson = $payloadObj | ConvertTo-Json
    
    try {
        $result = Invoke-RestMethod -Uri "$ApiBase/Grievance/create" -Method Post -Headers $headers -Body $payloadJson -ContentType "application/json"
        
        $actualCat = $result.Category
        $actualRole = $result.AssignedToRole
        
        if ($tc.ExpectedCategory) {
            $isPass = ($actualCat -eq $tc.ExpectedCategory) -and ($actualRole -match $tc.ExpectedRole)
        } else {
            $isPass = ($actualRole -match $tc.ExpectedRole)
        }
        
        if ($isPass) {
            Write-Host " [PASS] Category: $actualCat | Role: $actualRole" -ForegroundColor Green
            $passed++
        } else {
            Write-Host " [FAIL]" -ForegroundColor Red
            Write-Host "   Expected: $($tc.ExpectedCategory) -> $($tc.ExpectedRole)"
            Write-Host "   Actual:   $actualCat -> $actualRole"
        }
    } catch {
        Write-Host " [ERROR] $_" -ForegroundColor Red
    }
}

Write-Host "`n--- Summary ---" -ForegroundColor Cyan
Write-Host "$passed / $total Tests Passed."
if ($passed -eq $total) {
    Write-Host "ALL ROUTING LOGIC IS NOW 100% ACCURATE!" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED." -ForegroundColor Red
}
