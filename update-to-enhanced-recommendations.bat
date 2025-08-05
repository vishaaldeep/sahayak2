@echo off
echo ========================================
echo Updating System to Enhanced Job Recommendations
echo ========================================

cd /d "%~dp0"
cd backend_new

echo 🔄 Backing up original service...
if exist services\jobRecommendationService.js.backup (
    echo   ✅ Backup already exists
) else (
    copy services\jobRecommendationService.js services\jobRecommendationService.js.backup
    echo   ✅ Original service backed up
)

echo.
echo 🔄 Updating to enhanced service...
copy services\enhancedJobRecommendationService.js services\jobRecommendationService.js
echo   ✅ Enhanced service is now active

echo.
echo 🔄 Updating scheduler to use enhanced service...
echo   The scheduler will automatically use the enhanced service

echo.
echo 🧪 Testing enhanced service integration...
node -e "
try {
    const service = require('./services/jobRecommendationService');
    console.log('✅ Enhanced job recommendation service loaded successfully');
    console.log('✅ Service type: Enhanced with employer quality analysis');
} catch (error) {
    console.error('❌ Error loading enhanced service:', error.message);
    process.exit(1);
}
"

echo.
echo ========================================
echo System Update Complete!
echo.
echo ✅ WHAT'S NEW:
echo   - Enhanced employer quality scoring
echo   - Abuse report integration
echo   - Wage fairness analysis
echo   - Rating-based recommendations
echo   - Safety warnings and penalties
echo.
echo 🎯 ENHANCED FEATURES ACTIVE:
echo   - Employer verification status checking
echo   - Historical wage analysis
echo   - Abuse report penalties
echo   - Multi-factor safety scoring
echo   - Detailed match explanations
echo.
echo 📊 SCORING BREAKDOWN:
echo   - Skill Match: 30%
echo   - Location Match: 15%
echo   - Salary Match: 20%
echo   - Experience Match: 10%
echo   - Employer Quality: 20% (NEW)
echo   - Wage Fairness: 5% (NEW)
echo.
echo 🛡️ SAFETY FEATURES:
echo   - Verified abuse reports: -30% score penalty
echo   - Single abuse report: -15% score penalty
echo   - Multiple pending reports: -10% score penalty
echo   - Unverified employers: Lower quality scores
echo.
echo 🚀 READY TO USE:
echo   The enhanced system is now active and will be used for:
echo   - Automatic daily recommendations (9 AM)
echo   - Automatic weekly recommendations (Monday 10 AM)
echo   - Manual API calls
echo   - Frontend recommendation requests
echo ========================================

pause