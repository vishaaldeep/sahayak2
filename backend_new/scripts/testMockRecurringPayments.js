#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testMockRecurringPayments() {
  console.log('🧪 TESTING MOCK RECURRING PAYMENT SYSTEM');
  console.log('=' .repeat(60));

  const baseURL = 'http://localhost:5000';
  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Check server connectivity
  console.log('\n📋 Test 1: Server Connectivity');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/`);
    if (response.status === 200) {
      console.log('✅ Backend server is running');
      testsPassed++;
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible');
    console.log('   Please ensure the server is running on port 5000');
    return;
  }

  // Test 2: Check route registration
  console.log('\n📋 Test 2: Route Registration');
  totalTests++;
  
  try {
    // Test with invalid auth to check if route exists
    const response = await axios.get(`${baseURL}/api/mock-recurring-payments/employer`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Mock recurring payment routes are registered');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Mock recurring payment routes not found');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Test 3: Check database models
  console.log('\n📋 Test 3: Database Models');
  totalTests++;
  
  try {
    const RecurringPayment = require('../Model/RecurringPayment');
    console.log('✅ RecurringPayment model loaded successfully');
    testsPassed++;
  } catch (error) {
    console.log('❌ RecurringPayment model failed to load');
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: Check scheduler
  console.log('\n📋 Test 4: Payment Scheduler');
  totalTests++;
  
  try {
    const mockRecurringPaymentScheduler = require('../services/mockRecurringPaymentScheduler');
    const status = mockRecurringPaymentScheduler.getStatus();
    
    if (status.isRunning) {
      console.log('✅ Mock recurring payment scheduler is running');
      console.log(`   Schedule: ${status.schedule}`);
      testsPassed++;
    } else {
      console.log('⚠️ Mock recurring payment scheduler is not running');
      console.log('   This is normal if server just started');
    }
  } catch (error) {
    console.log('❌ Payment scheduler failed to load');
    console.log(`   Error: ${error.message}`);
  }

  // Test 5: Test payment processing logic
  console.log('\n📋 Test 5: Payment Processing Logic');
  totalTests++;
  
  try {
    const { processDuePayments } = require('../controller/mockRecurringPaymentController');
    
    // This should run without error even if no payments are due
    const result = await processDuePayments();
    console.log('✅ Payment processing logic works');
    console.log(`   Processed: ${result.processed} payments`);
    testsPassed++;
  } catch (error) {
    console.log('❌ Payment processing logic failed');
    console.log(`   Error: ${error.message}`);
  }

  // Test 6: Check wallet transaction creation
  console.log('\n📋 Test 6: Wallet Models');
  totalTests++;
  
  try {
    const Wallet = require('../Model/Wallet');
    const WalletTransaction = require('../Model/WalletTransaction');
    console.log('✅ Wallet models loaded successfully');
    testsPassed++;
  } catch (error) {
    console.log('❌ Wallet models failed to load');
    console.log(`   Error: ${error.message}`);
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Mock recurring payment system is ready');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please check the failed tests and fix the issues');
  }

  // Usage Instructions
  console.log('\n🎯 USAGE INSTRUCTIONS:');
  console.log('');
  console.log('📱 FRONTEND INTEGRATION:');
  console.log('1. Import RecurringPaymentDashboard in your employer dashboard');
  console.log('2. Import WalletTransactions in your employee wallet page');
  console.log('3. Ensure proper authentication tokens are set');
  console.log('');
  console.log('🔧 API ENDPOINTS:');
  console.log('• POST /api/mock-recurring-payments/create - Create recurring payment');
  console.log('• GET /api/mock-recurring-payments/employer - Get employer payments');
  console.log('• GET /api/mock-recurring-payments/employee - Get employee payments');
  console.log('• PUT /api/mock-recurring-payments/:id/status - Update payment status');
  console.log('• POST /api/mock-recurring-payments/:id/trigger - Manual payment trigger');
  console.log('• GET /api/mock-recurring-payments/:id/history - Payment history');
  console.log('');
  console.log('⏰ PAYMENT FREQUENCIES:');
  console.log('• minutes - For testing (every few minutes)');
  console.log('• hours - Hourly payments');
  console.log('• daily - Daily payments');
  console.log('• weekly - Weekly payments');
  console.log('• monthly - Monthly payments');
  console.log('');
  console.log('💰 FEATURES:');
  console.log('• ✅ Mock Decentro integration (no real API calls)');
  console.log('• ✅ Automatic payment processing via scheduler');
  console.log('• ✅ Wallet transaction creation');
  console.log('• ✅ Payment history tracking');
  console.log('• ✅ Status management (active/paused/cancelled)');
  console.log('• ✅ Manual payment triggers');
  console.log('• ✅ Detailed transaction metadata');
  console.log('');
  console.log('🧪 TESTING:');
  console.log('1. Create a recurring payment with "minutes" frequency');
  console.log('2. Wait for automatic processing (runs every minute)');
  console.log('3. Check employee wallet for transaction');
  console.log('4. Use manual trigger for immediate testing');
  console.log('');
  console.log('🔍 MONITORING:');
  console.log('• Check server logs for payment processing messages');
  console.log('• Use payment history to track all transactions');
  console.log('• Monitor wallet balances for successful transfers');

  return {
    testsPassed,
    totalTests,
    successRate: Math.round((testsPassed / totalTests) * 100)
  };
}

// Run the test
if (require.main === module) {
  testMockRecurringPayments().catch(console.error);
}

module.exports = { testMockRecurringPayments };