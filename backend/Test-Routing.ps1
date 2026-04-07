$ErrorActionPreference = "Stop"
$ApiBase = "http://localhost:5273/api"

Write-Host "--- EGrievance Routing Test Suite ---" -ForegroundColor Cyan

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
        
        $isPass = ($requriedCatMatch = ($actualCat -eq $tc.ExpectedCategory)) -and ($actualRole -match $tc.ExpectedRole)
        
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
