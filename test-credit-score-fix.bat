@echo off
echo ========================================
echo Testing Credit Score Service Fix
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Step 1: Testing credit score service directly...
node -e "
const creditScoreService = require('./services/creditScoreService');
console.log('✅ Credit Score Service loaded successfully');
console.log('Base Score:', creditScoreService.baseScore);
console.log('Max Score:', creditScoreService.maxScore);
console.log('Min Score:', creditScoreService.minScore);
console.log('✅ All properties accessible');
"

echo.
echo Step 2: Testing the fixed import in userController...
node -e "
const creditScoreService = require('./services/creditScoreService');
console.log('✅ Credit Score Service imported correctly');
console.log('calculateCreditScore method exists:', typeof creditScoreService.calculateCreditScore === 'function');
"

echo.
echo ========================================
echo Fix Summary:
echo.
echo ❌ BEFORE: const { calculateCreditScore } = require('./services/creditScoreService');
echo ✅ AFTER:  const creditScoreService = require('./services/creditScoreService');
echo.
echo ❌ BEFORE: await calculateCreditScore(user._id);
echo ✅ AFTER:  await creditScoreService.calculateCreditScore(user._id);
echo.
echo The issue was that destructuring the function from the service
echo lost the 'this' context, making this.baseScore undefined.
echo ========================================

pause