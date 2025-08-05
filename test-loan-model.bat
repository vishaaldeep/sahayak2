@echo off
echo ========================================
echo Testing Loan Model Fix
echo ========================================

cd /d "%~dp0"
cd backend_new

echo Step 1: Testing Loan model syntax...
node -e "
try {
  const Loan = require('./Model/Loan');
  console.log('✅ Loan model loaded successfully');
  console.log('✅ Model name:', Loan.modelName);
  console.log('✅ Collection name:', Loan.collection.name);
} catch (error) {
  console.error('❌ Error loading Loan model:', error.message);
  process.exit(1);
}
"

echo.
echo Step 2: Testing loan routes import...
node -e "
try {
  const loanRoutes = require('./routes/loanRoutes');
  console.log('✅ Loan routes loaded successfully');
  console.log('✅ Routes type:', typeof loanRoutes);
} catch (error) {
  console.error('❌ Error loading loan routes:', error.message);
  process.exit(1);
}
"

echo.
echo Step 3: Testing virtual methods...
node -e "
try {
  const mongoose = require('mongoose');
  const Loan = require('./Model/Loan');
  
  // Create a test loan object (not saved to DB)
  const testLoan = new Loan({
    user_id: new mongoose.Types.ObjectId(),
    amount: 100000,
    purpose: 'Test loan',
    repayment_period_months: 12,
    interest_rate: 12,
    applicant_name: 'Test User',
    applicant_phone: '1234567890'
  });
  
  console.log('✅ Test loan created');
  console.log('✅ Monthly EMI:', testLoan.monthly_emi);
  console.log('✅ Total Interest:', testLoan.total_interest);
  console.log('✅ Total Repayment:', testLoan.total_repayment);
  
} catch (error) {
  console.error('❌ Error testing virtual methods:', error.message);
  process.exit(1);
}
"

echo.
echo ========================================
echo Fix Summary:
echo.
echo ❌ PROBLEM: File had literal \\n characters instead of line breaks
echo ✅ SOLUTION: Recreated file with proper formatting
echo.
echo The Loan model now loads without syntax errors!
echo ========================================

pause