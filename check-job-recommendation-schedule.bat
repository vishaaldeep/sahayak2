@echo off
echo ========================================
echo Job Recommendation Service Schedule
echo ========================================

cd /d "%~dp0"
cd backend_new

echo 📅 AUTOMATIC SCHEDULE:
echo.
echo ⏰ DAILY RECOMMENDATIONS:
echo   - Time: Every day at 9:00 AM (Asia/Kolkata timezone)
echo   - Target: Active seekers only
echo   - Criteria: Users active in last 30 days
echo   - Includes: Recent profile updates, new users, recent applications
echo.
echo ⏰ WEEKLY COMPREHENSIVE ANALYSIS:
echo   - Time: Every Monday at 10:00 AM (Asia/Kolkata timezone)
echo   - Target: ALL seekers in the database
echo   - Purpose: Complete recommendation refresh
echo   - Features: Full AI analysis and career insights
echo.

echo 🚀 MANUAL TRIGGERS:
echo.
echo 1. Individual Seeker (API):
echo    POST /api/job-recommendations/generate
echo    - Generates recommendations for current logged-in seeker
echo.
echo 2. Specific Seeker (API):
echo    POST /api/job-recommendations/generate/:seekerId
echo    - Generates recommendations for specific seeker (admin or self)
echo.
echo 3. All Seekers (Admin API):
echo    POST /api/job-recommendations/generate-all
echo    - Bulk generates recommendations for all seekers (admin only)
echo.
echo 4. Frontend Button:
echo    - "Generate New Recommendations" button in /job-recommendations page
echo    - Available to seekers in their dashboard
echo.

echo 🔄 WHEN IT STARTS:
echo.
echo ✅ Automatically starts when server starts:
echo   - Server startup → jobRecommendationScheduler.start()
echo   - Logs: "🎯 Job recommendation scheduler started"
echo   - Logs: "📅 Daily recommendations: Every day at 9:00 AM"
echo   - Logs: "📅 Weekly comprehensive analysis: Every Monday at 10:00 AM"
echo.

echo 📊 ACTIVE SEEKER CRITERIA (Daily):
echo.
echo Users are considered "active" if they have:
echo   - Updated their profile in the last 30 days, OR
echo   - Created account in the last 30 days, OR
echo   - Applied for jobs in the last 30 days
echo.
echo This prevents generating recommendations for inactive users.
echo.

echo 🎯 WHAT HAPPENS DURING EXECUTION:
echo.
echo Daily Run (9:00 AM):
echo   1. Find active seekers (last 30 days activity)
echo   2. Generate recommendations for each active seeker
echo   3. Send notifications about new recommendations
echo   4. Log results (successful/failed counts)
echo   5. 1-second delay between each seeker (prevent overload)
echo.
echo Weekly Run (Monday 10:00 AM):
echo   1. Get ALL seekers from database
echo   2. Generate comprehensive recommendations for everyone
echo   3. Full AI analysis and career insights
echo   4. Send notifications about updated recommendations
echo   5. 2-second delay between each seeker (prevent overload)
echo.

echo 📈 PERFORMANCE METRICS:
echo.
echo The scheduler tracks:
echo   - Total seekers processed
echo   - Successful generations
echo   - Failed generations
echo   - Execution duration
echo   - Last run timestamp
echo.

echo 🔍 CHECK CURRENT STATUS:
echo.
echo To check if the scheduler is running:
node -e "
const scheduler = require('./services/jobRecommendationScheduler');
const status = scheduler.getStatus();
console.log('📊 Scheduler Status:');
console.log('  Running:', status.isRunning);
console.log('  Last Run:', status.lastRun ? status.lastRun.timestamp : 'Never');
console.log('  Last Run Type:', status.lastRun ? status.lastRun.type : 'N/A');
if (status.lastRun) {
  console.log('  Last Run Results:', status.lastRun.successful + ' successful, ' + status.lastRun.failed + ' failed');
}
"

echo.
echo 🧪 MANUAL TEST:
echo.
echo To manually trigger recommendations for testing:
echo.
echo 1. For current user (via frontend):
echo    - Go to /job-recommendations page
echo    - Click "Generate New Recommendations" button
echo.
echo 2. For all active seekers (via API):
echo    curl -X POST http://localhost:5000/api/job-recommendations/generate-all \
echo      -H "Authorization: Bearer ADMIN_TOKEN"
echo.
echo 3. For specific seeker (via API):
echo    curl -X POST http://localhost:5000/api/job-recommendations/generate \
echo      -H "Authorization: Bearer SEEKER_TOKEN"
echo.

echo ========================================
echo SUMMARY:
echo.
echo ✅ Runs automatically: Daily at 9 AM, Weekly on Monday at 10 AM
echo ✅ Timezone: Asia/Kolkata (Indian Standard Time)
echo ✅ Starts with server: Yes, automatically on server startup
echo ✅ Manual triggers: Available via API and frontend
echo ✅ Target users: Active seekers (daily), All seekers (weekly)
echo ✅ Notifications: Sent automatically after generation
echo ✅ Performance: Optimized with delays to prevent overload
echo.
echo The job recommendation service is fully automated and running!
echo ========================================

pause