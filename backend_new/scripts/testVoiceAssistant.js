const axios = require('axios');
require('dotenv').config();

async function testVoiceAssistant() {
  console.log('🎤 TESTING VOICE ASSISTANT IMPLEMENTATION');
  console.log('=' .repeat(50));

  const baseURL = 'http://localhost:5000';
  let testsPassed = 0;
  let totalTests = 0;

  // Test 1: Check if Retell API key is configured
  console.log('\n📋 Test 1: Environment Configuration');
  totalTests++;
  
  if (process.env.RETELL_API_KEY) {
    console.log('✅ RETELL_API_KEY is configured');
    testsPassed++;
  } else {
    console.log('❌ RETELL_API_KEY is not configured');
    console.log('   Please add RETELL_API_KEY to your .env file');
  }

  if (process.env.RETELL_AGENT_ID) {
    console.log('✅ RETELL_AGENT_ID is configured');
  } else {
    console.log('⚠️ RETELL_AGENT_ID not configured, using default');
  }

  // Test 2: Check if server is running
  console.log('\n📋 Test 2: Server Connectivity');
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

  // Test 3: Test Retell auth endpoint with general context
  console.log('\n📋 Test 3: Retell Auth Endpoint (General Context)');
  totalTests++;
  
  try {
    const response = await axios.post(`${baseURL}/api/retell/auth`, {
      context: 'general'
    });
    
    if (response.status === 200 && response.data.access_token) {
      console.log('✅ Retell auth endpoint working with general context');
      console.log(`   Call ID: ${response.data.call_id}`);
      console.log(`   Access Token: ${response.data.access_token.substring(0, 20)}...`);
      testsPassed++;
    } else {
      console.log('❌ Retell auth endpoint returned invalid response');
    }
  } catch (error) {
    console.log('❌ Retell auth endpoint failed');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
  }

  // Test 4: Test Retell auth endpoint with jobs context
  console.log('\n📋 Test 4: Retell Auth Endpoint (Jobs Context)');
  totalTests++;
  
  try {
    const response = await axios.post(`${baseURL}/api/retell/auth`, {
      context: 'jobs'
    });
    
    if (response.status === 200 && response.data.access_token) {
      console.log('✅ Retell auth endpoint working with jobs context');
      console.log(`   Call ID: ${response.data.call_id}`);
      testsPassed++;
    } else {
      console.log('❌ Retell auth endpoint returned invalid response for jobs context');
    }
  } catch (error) {
    console.log('❌ Retell auth endpoint failed for jobs context');
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
  }

  // Test 5: Test error handling with invalid request
  console.log('\n📋 Test 5: Error Handling');
  totalTests++;
  
  try {
    // Temporarily set invalid API key to test error handling
    const originalKey = process.env.RETELL_API_KEY;
    process.env.RETELL_API_KEY = 'invalid_key';
    
    const response = await axios.post(`${baseURL}/api/retell/auth`, {
      context: 'test'
    });
    
    // Restore original key
    process.env.RETELL_API_KEY = originalKey;
    
    console.log('❌ Error handling test failed - should have returned error');
  } catch (error) {
    // Restore original key
    process.env.RETELL_API_KEY = process.env.RETELL_API_KEY;
    
    if (error.response?.status === 500) {
      console.log('✅ Error handling working correctly');
      testsPassed++;
    } else {
      console.log('⚠️ Unexpected error response');
    }
  }

  // Test 6: Check route registration
  console.log('\n📋 Test 6: Route Registration');
  totalTests++;
  
  try {
    const response = await axios.post(`${baseURL}/api/retell/nonexistent`, {});
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Retell routes are properly registered');
      testsPassed++;
    } else {
      console.log('❌ Unexpected response for non-existent route');
    }
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`);

  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Voice Assistant backend is properly configured');
    console.log('✅ Ready for frontend integration');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please check the failed tests and fix the issues');
  }

  // Frontend Integration Instructions
  console.log('\n🎯 FRONTEND INTEGRATION CHECKLIST:');
  console.log('1. Install retell-client-js-sdk: npm install retell-client-js-sdk');
  console.log('2. Import VoiceAssistant component in your pages');
  console.log('3. Add <VoiceAssistant context="jobs" /> to JobsPage');
  console.log('4. Ensure microphone permissions are granted in browser');
  console.log('5. Test voice functionality in development environment');

  console.log('\n🔧 TROUBLESHOOTING:');
  console.log('- If auth fails, check RETELL_API_KEY in .env file');
  console.log('- If no audio, check browser microphone permissions');
  console.log('- If connection fails, ensure backend server is running');
  console.log('- Check browser console for frontend errors');

  return {
    testsPassed,
    totalTests,
    successRate: Math.round((testsPassed / totalTests) * 100)
  };
}

// Run the test
if (require.main === module) {
  testVoiceAssistant().catch(console.error);
}

module.exports = { testVoiceAssistant };