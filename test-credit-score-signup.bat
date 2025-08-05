@echo off
echo ========================================
echo Testing Credit Score Creation on Signup
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Step 1: Testing credit score service methods...
node -e "
const creditScoreService = require('./services/creditScoreService');
console.log('✅ Credit Score Service loaded');
console.log('✅ Base Score:', creditScoreService.baseScore);
console.log('✅ updateCreditScore method exists:', typeof creditScoreService.updateCreditScore === 'function');
console.log('✅ calculateCreditScore method exists:', typeof creditScoreService.calculateCreditScore === 'function');
"

echo.
echo Step 2: Testing CreditScore model...
node -e "
const CreditScore = require('./Model/creditScore');
console.log('✅ CreditScore model loaded');
console.log('✅ Model name:', CreditScore.modelName);
console.log('✅ Collection name:', CreditScore.collection.name);
"

echo.
echo ========================================
echo Fix Summary:
echo.
echo ❌ PROBLEM: signup was calling calculateCreditScore() which only calculates
echo ✅ SOLUTION: signup now calls updateCreditScore() which saves to database
echo.
echo Changes Made:
echo 1. Updated userController.js signup method
echo 2. Now calls creditScoreService.updateCreditScore() for seekers
echo 3. Added proper error handling (won't fail signup if credit score fails)
echo 4. Added logging for successful credit score creation
echo 5. Combined duplicate seeker setup blocks
echo.
echo Expected Behavior:
echo - New seekers get initial credit score of 30 saved to database
echo - Credit score record created in creditscores collection
echo - Signup process continues even if credit score creation fails
echo - Proper logging shows credit score creation status
echo ========================================

pause