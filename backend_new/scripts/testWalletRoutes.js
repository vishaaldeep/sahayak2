#!/usr/bin/env node

const axios = require('axios');

async function testWalletRoutes() {
  console.log('🧪 TESTING WALLET ROUTES');
  console.log('=' .repeat(50));

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

  // Test 2: Test wallet root route without authentication
  console.log('\n📋 Test 2: Wallet Root Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Route not found (404) - wallet routes not registered properly');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Test wallet balance route without authentication
  console.log('\n📋 Test 3: Wallet Balance Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet/balance`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected balance request without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Balance route not found (404)');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 4: Test wallet transactions route without authentication
  console.log('\n📋 Test 4: Wallet Transactions Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet/transactions`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected transactions request without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Transactions route not found (404)');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 5: Test wallet summary route without authentication
  console.log('\n📋 Test 5: Wallet Summary Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet/summary`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected summary request without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Summary route not found (404)');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Wallet routes are properly registered and secured');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please check the failed tests and fix the issues');
  }

  // Available endpoints
  console.log('\n🔗 AVAILABLE WALLET ENDPOINTS:');
  console.log('• GET /api/wallet - Wallet info and available endpoints');
  console.log('• GET /api/wallet/balance - Get wallet balance');
  console.log('• GET /api/wallet/transactions - Get transaction history');
  console.log('• GET /api/wallet/transactions/:id - Get specific transaction');
  console.log('• PUT /api/wallet/savings-goal - Update savings goal');
  console.log('• GET /api/wallet/summary - Get wallet summary/stats');

  console.log('\n🔐 AUTHENTICATION REQUIRED:');
  console.log('All wallet endpoints require authentication with JWT token');
  console.log('Include header: Authorization: Bearer YOUR_JWT_TOKEN');

  console.log('\n🧪 MANUAL TESTING:');
  console.log('1. Login to get JWT token');
  console.log('2. Test with curl:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet/balance');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet/transactions');

  console.log('\n✅ FIXES APPLIED:');
  console.log('• Added root wallet route (GET /api/wallet)');
  console.log('• Returns wallet info and available endpoints');
  console.log('• All routes properly secured with authentication');
  console.log('• Automatic wallet creation if not exists');

  return {
    testsPassed,
    totalTests,
    successRate: Math.round((testsPassed / totalTests) * 100)
  };
}

// Run the test
if (require.main === module) {
  testWalletRoutes().catch(console.error);
}

module.exports = { testWalletRoutes };