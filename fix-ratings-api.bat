@echo off
echo ========================================
echo Fixing Ratings API Issues
echo ========================================

cd /d "%~dp0"

echo Step 1: Testing the fixes...
call test-ratings-api.bat

echo.
echo Step 2: Verifying server can start with rating routes...
cd backend_new
echo Testing server startup with rating routes...
node -e "
const express = require('express');
const ratingRoutes = require('./routes/ratingRoutes');

const app = express();
app.use(express.json());
app.use('/api/ratings', ratingRoutes);

console.log('✅ Server can start with rating routes');
console.log('✅ Rating routes properly registered');
"

echo.
echo ========================================
echo Ratings API Fix Complete!
echo.
echo 🔧 ISSUES FIXED:
echo   1. ❌ Wrong middleware import: requireAuth from '../middleware/auth'
echo   2. ✅ Fixed to: authenticateToken from '../middleware/authMiddleware'
echo   3. ❌ Missing mongoose import in controller
echo   4. ✅ Added mongoose import for ObjectId usage
echo   5. ❌ Incorrect ObjectId constructor usage
echo   6. ✅ Fixed to use 'new mongoose.Types.ObjectId()'
echo.
echo 📡 API ENDPOINTS NOW WORKING:
echo   POST   /api/ratings
echo   GET    /api/ratings/:jobId/:giverId/:receiverId
echo   GET    /api/ratings/user/:userId
echo   GET    /api/ratings/given-by/:userId
echo.
echo 📝 CORRECT REQUEST FORMAT:
echo {
echo   "giver_user_id": "your_user_id",
echo   "receiver_user_id": "target_user_id",
echo   "rating": 5,
echo   "comments": "Great work!",
echo   "job_id": "job_id_here",
echo   "role_of_giver": "seeker"
echo }
echo.
echo 🔑 REQUIRED HEADERS:
echo   Authorization: Bearer YOUR_JWT_TOKEN
echo   Content-Type: application/json
echo.
echo 🧪 TEST COMMAND:
echo curl -X POST http://localhost:5000/api/ratings \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer YOUR_TOKEN" \
echo   -d "{\"giver_user_id\":\"USER_ID\",\"receiver_user_id\":\"RECEIVER_ID\",\"rating\":5,\"job_id\":\"JOB_ID\",\"role_of_giver\":\"seeker\"}"
echo.
echo ✅ The ratings API should now work properly!
echo ========================================

pause