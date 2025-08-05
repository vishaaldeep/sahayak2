@echo off
echo ========================================
echo Debugging Ratings API 400 Error
echo ========================================

echo.
echo 📝 REQUIRED PAYLOAD FORMAT:
echo {
echo   "giver_user_id": "your_user_id_here",
echo   "receiver_user_id": "target_user_id_here",
echo   "rating": 5,
echo   "comments": "Great work!",
echo   "job_id": "job_id_here",
echo   "role_of_giver": "seeker"
echo }
echo.

echo 🔑 REQUIRED HEADERS:
echo Authorization: Bearer YOUR_JWT_TOKEN
echo Content-Type: application/json
echo.

echo 🧪 TEST COMMANDS:
echo.
echo 1. Test with missing fields (should return 400 with details):
echo curl -X POST http://localhost:5000/api/ratings \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer YOUR_TOKEN" \
echo   -d "{}"
echo.

echo 2. Test with valid payload:
echo curl -X POST http://localhost:5000/api/ratings \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer YOUR_TOKEN" \
echo   -d "{\"giver_user_id\":\"USER_ID\",\"receiver_user_id\":\"RECEIVER_ID\",\"rating\":5,\"comments\":\"Great work!\",\"job_id\":\"JOB_ID\",\"role_of_giver\":\"seeker\"}"
echo.

echo 📊 DEBUGGING CHECKLIST:
echo.
echo ✅ Check your request:
echo   1. Are you sending Content-Type: application/json header?
echo   2. Are you sending Authorization: Bearer TOKEN header?
echo   3. Is your JSON payload properly formatted?
echo   4. Are all required fields present?
echo   5. Is the rating a number between 1-5?
echo   6. Is role_of_giver either "seeker" or "provider"?
echo.

echo ❌ Common Issues:
echo   1. Missing Content-Type header (causes req.body to be empty)
echo   2. Invalid JSON format
echo   3. Missing Authorization header
echo   4. Expired or invalid JWT token
echo   5. Wrong field names (check spelling)
echo   6. Rating as string instead of number
echo.

echo 🔍 Server Logs:
echo Check your server console for these debug messages:
echo   - "🎯 Rating API - Request Body: {...}"
echo   - "🎯 Rating API - Headers: {...}"
echo   - "🎯 Rating API - User: user_id"
echo.

echo 📋 Field Validation:
echo   - giver_user_id: Must be valid ObjectId string
echo   - receiver_user_id: Must be valid ObjectId string  
echo   - rating: Must be number 1-5
echo   - job_id: Must be valid ObjectId string
echo   - role_of_giver: Must be "seeker" or "provider"
echo   - comments: Optional string
echo.

echo 🎯 Example with real data:
echo Replace these with actual IDs from your database:
echo curl -X POST http://localhost:5000/api/ratings \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
echo   -d "{\"giver_user_id\":\"64a1b2c3d4e5f6789012345a\",\"receiver_user_id\":\"64a1b2c3d4e5f6789012345b\",\"rating\":5,\"comments\":\"Excellent work!\",\"job_id\":\"64a1b2c3d4e5f6789012345c\",\"role_of_giver\":\"seeker\"}"
echo.

echo ========================================
echo If you're still getting 400 errors:
echo 1. Check the server console logs
echo 2. Verify your JWT token is valid
echo 3. Ensure Content-Type header is set
echo 4. Validate your JSON payload format
echo 5. Check that all required fields are present
echo ========================================

pause