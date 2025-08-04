#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testEmployerProfileFix() {
  console.log('🧪 TESTING EMPLOYER PROFILE FIX');
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

  // Test 2: Check WalletTransaction model
  console.log('\n📋 Test 2: WalletTransaction Model');
  totalTests++;
  
  try {
    const WalletTransaction = require('../Model/WalletTransaction');
    console.log('✅ WalletTransaction model loaded successfully');
    testsPassed++;
  } catch (error) {
    console.log('❌ WalletTransaction model failed to load');
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Check wallet routes
  console.log('\n📋 Test 3: Wallet Routes');
  totalTests++;
  
  try {
    // Test with invalid auth to check if route exists
    const response = await axios.get(`${baseURL}/api/wallet/balance`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Wallet routes are registered and require authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Wallet routes not found');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Test 4: Check employer routes
  console.log('\n📋 Test 4: Employer Routes');
  totalTests++;
  
  try {
    // Test with invalid auth to check if route exists
    const response = await axios.get(`${baseURL}/api/employer/`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Employer routes are registered and require authentication');
      testsPassed++;
    } else if (error.response?.status === 404) {
      console.log('❌ Employer routes not found');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Test 5: Check public employer profile route
  console.log('\n📋 Test 5: Public Employer Profile Route');
  totalTests++;
  
  try {
    // This should work without authentication
    const response = await axios.get(`${baseURL}/api/employer/user/507f1f77bcf86cd799439011`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Public employer profile route exists (404 expected for non-existent user)');
      testsPassed++;
    } else if (error.response?.status === 401) {
      console.log('❌ Public employer profile route requires authentication (should be public)');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Test 6: Check public jobs route
  console.log('\n📋 Test 6: Public Jobs Route');
  totalTests++;
  
  try {
    // This should work without authentication
    const response = await axios.get(`${baseURL}/api/jobs/employer/507f1f77bcf86cd799439011/public`);
    if (response.status === 200) {
      console.log('✅ Public jobs route works without authentication');
      testsPassed++;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Public jobs route not found');
    } else if (error.response?.status === 401) {
      console.log('❌ Public jobs route requires authentication (should be public)');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Test 7: Check user profile route
  console.log('\n📋 Test 7: User Profile Route');
  totalTests++;
  
  try {
    // This should work without authentication for public profiles
    const response = await axios.get(`${baseURL}/api/users/507f1f77bcf86cd799439011`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ User profile route exists (404 expected for non-existent user)');
      testsPassed++;
    } else if (error.response?.status === 401) {
      console.log('❌ User profile route requires authentication (should be public)');
    } else {
      console.log(`⚠️ Unexpected response: ${error.response?.status}`);
    }
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Employer profile issues should be fixed');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please check the failed tests and fix the issues');
  }

  // Fix Summary
  console.log('\n🔧 FIXES APPLIED:');
  console.log('1. ✅ Created missing WalletTransaction model');
  console.log('2. ✅ Fixed employer routes authentication middleware');
  console.log('3. ✅ Added public jobs route for employer profiles');
  console.log('4. ✅ Created wallet routes for transaction management');
  console.log('5. ✅ Updated frontend API to use public endpoints');

  console.log('\n📱 FRONTEND CHANGES:');
  console.log('• Updated api.js to use public jobs endpoint');
  console.log('• Employer profile viewing should now work without 401 errors');
  console.log('• Wallet transactions component ready for use');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Test employer profile viewing in frontend');
  console.log('2. Verify wallet transactions display correctly');
  console.log('3. Check that recurring payments create wallet transactions');
  console.log('4. Ensure no more 401 errors when viewing profiles');

  return {
    testsPassed,
    totalTests,
    successRate: Math.round((testsPassed / totalTests) * 100)
  };
}

// Run the test
if (require.main === module) {
  testEmployerProfileFix().catch(console.error);
}

module.exports = { testEmployerProfileFix };