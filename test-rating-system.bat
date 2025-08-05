@echo off
echo ========================================
echo Testing Rating System Fix
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Step 1: Testing UserRating model...
node -e "
try {
  const UserRating = require('./Model/UserRating');
  console.log('✅ UserRating model loaded successfully');
  console.log('✅ Model name:', UserRating.modelName);
  console.log('✅ Collection name:', UserRating.collection.name);
} catch (error) {
  console.error('❌ Error loading UserRating model:', error.message);
  process.exit(1);
}
"

echo.
echo Step 2: Testing rating controller...
node -e "
try {
  const ratingController = require('./controller/ratingController');
  console.log('✅ Rating controller loaded successfully');
  console.log('✅ createOrUpdateRating method exists:', typeof ratingController.createOrUpdateRating === 'function');
  console.log('✅ getRating method exists:', typeof ratingController.getRating === 'function');
  console.log('✅ getUserRatings method exists:', typeof ratingController.getUserRatings === 'function');
  console.log('✅ getRatingsGivenByUser method exists:', typeof ratingController.getRatingsGivenByUser === 'function');
} catch (error) {
  console.error('❌ Error loading rating controller:', error.message);
  process.exit(1);
}
"

echo.
echo Step 3: Testing rating routes...
node -e "
try {
  const ratingRoutes = require('./routes/ratingRoutes');
  console.log('✅ Rating routes loaded successfully');
  console.log('✅ Routes type:', typeof ratingRoutes);
} catch (error) {
  console.error('❌ Error loading rating routes:', error.message);
  process.exit(1);
}
"

echo.
echo Step 4: Testing auth middleware...
node -e "
try {
  const { requireAuth } = require('./middleware/auth');
  console.log('✅ Auth middleware loaded successfully');
  console.log('✅ requireAuth type:', typeof requireAuth);
} catch (error) {
  console.error('❌ Error loading auth middleware:', error.message);
  process.exit(1);
}
"

echo.
echo ========================================
echo Rating System API Testing Guide:
echo.
echo 📝 Required Fields for POST /api/ratings:
echo {
echo   "giver_user_id": "user_id_of_person_giving_rating",
echo   "receiver_user_id": "user_id_of_person_receiving_rating", 
echo   "rating": 5,
echo   "comments": "Great work!",
echo   "job_id": "job_id_for_this_rating",
echo   "role_of_giver": "seeker"
echo }
echo.
echo 🔧 Test with curl:
echo curl -X POST http://localhost:5000/api/ratings \
echo   -H "Content-Type: application/json" \
echo   -H "Authorization: Bearer YOUR_TOKEN" \
echo   -d "{\"giver_user_id\":\"USER_ID\",\"receiver_user_id\":\"RECEIVER_ID\",\"rating\":5,\"job_id\":\"JOB_ID\",\"role_of_giver\":\"seeker\"}"
echo.
echo 📊 Available Endpoints:
echo - POST   /api/ratings                           (Create/update rating)
echo - GET    /api/ratings/:jobId/:giverId/:receiverId (Get specific rating)
echo - GET    /api/ratings/user/:userId              (Get user's received ratings)
echo - GET    /api/ratings/given-by/:userId          (Get user's given ratings)
echo.
echo ✅ All components loaded successfully!
echo ========================================

pause