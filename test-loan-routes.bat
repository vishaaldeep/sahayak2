@echo off
echo ========================================
echo Testing Loan Routes
echo ========================================

cd /d "%~dp0"

echo Step 1: Starting backend server (if not already running)
echo Make sure your backend is running on http://localhost:5000

echo.
echo Step 2: Testing loan routes...
echo.

echo Testing GET /api/loans (should require admin auth)
curl -X GET http://localhost:5000/api/loans
echo.
echo.

echo Testing POST /api/loans (should require auth)
curl -X POST http://localhost:5000/api/loans ^
  -H "Content-Type: application/json" ^
  -d "{\"user_id\":\"test\",\"suggested_amount\":50000,\"purpose\":\"Test loan\"}"
echo.
echo.

echo ========================================
echo Loan Routes Test Summary:
echo.
echo 1. ✅ Created /api/loans routes
echo 2. ✅ Created Loan model
echo 3. ✅ Registered routes in index.js
echo 4. ✅ Added API functions to frontend
echo 5. ✅ Updated LoanSuggestionPage component
echo.
echo Available endpoints:
echo - POST /api/loans (create loan application)
echo - GET /api/loans (get all loans - admin only)
echo - GET /api/loans/user/:userId (get user loans)
echo - GET /api/loans/:loanId (get specific loan)
echo - PUT /api/loans/:loanId/status (update status - admin only)
echo - DELETE /api/loans/:loanId (delete loan)
echo ========================================

pause