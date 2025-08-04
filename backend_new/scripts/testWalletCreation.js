#!/usr/bin/env node

const axios = require('axios');

async function testWalletCreation() {
  console.log('🧪 TESTING WALLET CREATION');
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

  // Test 2: Test wallet creation route without authentication
  console.log('\n📋 Test 2: Wallet Creation Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.post(`${baseURL}/api/wallet/create-decentro`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected wallet creation without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Wallet creation route not found (404)');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Test Decentro balance route without authentication
  console.log('\n📋 Test 3: Decentro Balance Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet/decentro-balance`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected balance request without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Decentro balance route not found (404)');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 4: Test wallet root route without authentication
  console.log('\n📋 Test 4: Wallet Root Route (No Auth)');
  totalTests++;
  
  try {
    const response = await axios.get(`${baseURL}/api/wallet`);
    console.log('❌ Should have failed without authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected wallet access without authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Wallet root route not found (404)');
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
    console.log('✅ Wallet creation routes are properly registered and secured');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please check the failed tests and fix the issues');
  }

  // Available endpoints
  console.log('\n🔗 WALLET CREATION ENDPOINTS:');
  console.log('• GET /api/wallet - Get wallet data');
  console.log('• POST /api/wallet/create-decentro - Create Decentro wallet');
  console.log('• GET /api/wallet/decentro-balance - Get Decentro balance');
  console.log('• GET /api/wallet/balance - Get wallet balance');
  console.log('• GET /api/wallet/transactions - Get transaction history');
  console.log('• PUT /api/wallet/savings-goal - Update savings goal');
  console.log('• GET /api/wallet/summary - Get wallet summary');

  console.log('\n🔐 AUTHENTICATION REQUIRED:');
  console.log('All wallet endpoints require authentication with JWT token');
  console.log('Include header: Authorization: Bearer YOUR_JWT_TOKEN');

  console.log('\n🧪 MANUAL TESTING STEPS:');
  console.log('1. Login to get JWT token');
  console.log('2. Test wallet creation:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" -X POST http://localhost:5000/api/wallet/create-decentro');
  console.log('3. Test wallet data:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet');
  console.log('4. Test Decentro balance:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet/decentro-balance');

  console.log('\n✅ FIXES APPLIED:');
  console.log('• Added POST /api/wallet/create-decentro route');
  console.log('• Added GET /api/wallet/decentro-balance route');
  console.log('• Updated GET /api/wallet to return wallet data');
  console.log('• Mock Decentro integration for development');
  console.log('• Automatic wallet creation if not exists');

  console.log('\n💡 MOCK DECENTRO FEATURES:');
  console.log('• Generates mock virtual account ID');
  console.log('• Creates mock reference ID');
  console.log('• Provides mock account details');
  console.log('• Returns realistic response format');
  console.log('• Ready for real Decentro API integration');

  return {
    testsPassed,
    totalTests,
    successRate: Math.round((testsPassed / totalTests) * 100)
  };
}

// Run the test
if (require.main === module) {
  testWalletCreation().catch(console.error);
}

module.exports = { testWalletCreation };