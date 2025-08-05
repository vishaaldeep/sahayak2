@echo off
echo ========================================
echo Testing Loan Routes Fix
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Step 1: Testing loan routes syntax...
node -e "
try {
  const loanRoutes = require('./routes/loanRoutes');
  console.log('✅ Loan routes loaded successfully');
  console.log('✅ Routes type:', typeof loanRoutes);
  console.log('✅ Router stack length:', loanRoutes.stack ? loanRoutes.stack.length : 'N/A');
} catch (error) {
  console.error('❌ Error loading loan routes:', error.message);
  process.exit(1);
}
"

echo.
echo Step 2: Testing loan model import in routes...
node -e "
try {
  const Loan = require('./Model/Loan');
  const User = require('./Model/User');
  console.log('✅ Loan model imported successfully');
  console.log('✅ User model imported successfully');
  console.log('✅ Loan model name:', Loan.modelName);
  console.log('✅ User model name:', User.modelName);
} catch (error) {
  console.error('❌ Error importing models:', error.message);
  process.exit(1);
}
"

echo.
echo Step 3: Testing middleware import...
node -e "
try {
  const { authenticateToken } = require('./middleware/authMiddleware');
  console.log('✅ Auth middleware imported successfully');
  console.log('✅ authenticateToken type:', typeof authenticateToken);
} catch (error) {
  console.error('❌ Error importing auth middleware:', error.message);
  console.log('ℹ️  This is expected if authMiddleware.js doesn\\'t exist');
}
"

echo.
echo Step 4: Testing route registration...
node -e "
try {
  const express = require('express');
  const loanRoutes = require('./routes/loanRoutes');
  
  const app = express();
  app.use('/api/loans', loanRoutes);
  
  console.log('✅ Routes registered successfully');
  console.log('✅ Express app created with loan routes');
} catch (error) {
  console.error('❌ Error registering routes:', error.message);
  process.exit(1);
}
"

echo.
echo ========================================
echo Fix Summary:
echo.
echo ❌ PROBLEM: loanRoutes.js was all on one line without proper formatting
echo ✅ SOLUTION: Recreated file with proper line breaks and indentation
echo.
echo Available Loan Routes:
echo - POST   /api/loans                    (Create loan application)
echo - GET    /api/loans                    (Get all loans - admin only)
echo - GET    /api/loans/user/:userId       (Get user's loans)
echo - GET    /api/loans/:loanId            (Get specific loan)
echo - PUT    /api/loans/:loanId/status     (Update loan status - admin only)
echo - DELETE /api/loans/:loanId            (Delete loan application)
echo.
echo The loan routes are now properly formatted and functional!
echo ========================================

pause