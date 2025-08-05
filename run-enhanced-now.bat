@echo off
echo ========================================
echo Running Enhanced Job Recommendations NOW
echo ========================================

cd /d "%~dp0"

echo 🎯 ENHANCED FEATURES INCLUDED:
echo   ✅ Employer Details (verification, company info)
echo   ✅ Report Abuse History (verified and pending reports)
echo   ✅ Wages Offered Analysis (fairness scoring)
echo   ✅ Employer Ratings (from previous seekers)
echo   ✅ Safety Scoring and Warnings
echo.

echo 🚀 Choose your option:
echo   1. Test Enhanced Recommendations (Single Seeker)
echo   2. Run Enhanced Recommendations (All Active Seekers)
echo   3. Update System to Enhanced Version
echo   4. View Enhanced Features Details
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🧪 Running test for single seeker...
    node test-enhanced-recommendations.js
) else if "%choice%"=="2" (
    echo.
    echo 🎯 Running enhanced recommendations for all active seekers...
    call run-enhanced-job-recommendations.bat
) else if "%choice%"=="3" (
    echo.
    echo 🔄 Updating system to enhanced version...
    call update-to-enhanced-recommendations.bat
) else if "%choice%"=="4" (
    echo.
    echo 📋 ENHANCED FEATURES DETAILS:
    echo.
    echo 🏢 EMPLOYER QUALITY SCORING (20% weight):
    echo   - Average ratings from previous seekers
    echo   - Verification status (email, phone, documents)
    echo   - Company registration (GSTIN, business license)
    echo   - Job posting history and patterns
    echo.
    echo 🛡️ SAFETY & ABUSE MONITORING:
    echo   - Verified abuse reports: -30%% penalty
    echo   - Single abuse report: -15%% penalty  
    echo   - Multiple pending reports: -10%% penalty
    echo   - Safety warnings displayed to seekers
    echo.
    echo 💰 WAGE FAIRNESS ANALYSIS (5% weight):
    echo   - Comparison with seeker expectations
    echo   - Analysis vs employer's historical wages
    echo   - Market rate comparison
    echo   - Fair wage recommendations
    echo.
    echo ⭐ RATING INTEGRATION:
    echo   - Employer ratings from completed jobs
    echo   - Rating-based quality scoring
    echo   - Trust and reliability indicators
    echo   - Minimum rating thresholds
    echo.
    echo 🎯 ENHANCED MATCHING ALGORITHM:
    echo   - Skill Match: 30%% (was 40%%)
    echo   - Location Match: 15%% (was 20%%)
    echo   - Salary Match: 20%% (same)
    echo   - Experience Match: 10%% (same)
    echo   - Employer Quality: 20%% (NEW)
    echo   - Wage Fairness: 5%% (NEW)
    echo.
    echo 🔍 DETAILED ANALYSIS:
    echo   - Match reasons explanation
    echo   - Safety warnings and red flags
    echo   - Employer quality breakdown
    echo   - Wage fairness assessment
    echo   - AI-powered career insights
    echo.
    pause
) else (
    echo.
    echo ❌ Invalid choice. Please run the script again.
    pause
)

echo.
echo ========================================
echo Enhanced Job Recommendations Complete!
echo ========================================
pause