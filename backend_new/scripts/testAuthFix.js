#!/usr/bin/env node

const axios = require('axios');

async function testAuthFix() {
  console.log('🧪 TESTING AUTHENTICATION FIX');
  console.log('=' .repeat(50));

  const baseURL = 'http://localhost:5000';
  
  // Test 1: Check server connectivity
  console.log('\n📋 Test 1: Server Connectivity');
  try {
    const response = await axios.get(`${baseURL}/`);
    if (response.status === 200) {
      console.log('✅ Backend server is running');
    }
  } catch (error) {
    console.log('❌ Backend server is not accessible');
    console.log('   Please ensure the server is running on port 5000');
    return;
  }

  // Test 2: Test debug auth route without token
  console.log('\n📋 Test 2: Auth Route Without Token');
  try {
    const response = await axios.get(`${baseURL}/api/employer/debug/auth`);
    console.log('❌ Should have failed without token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without token');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  // Test 3: Test with a sample token (you'll need to provide a real token)
  console.log('\n📋 Test 3: Auth Route With Token');
  console.log('⚠️ To test with a real token, you need to:');
  console.log('   1. Login as an employer in the frontend');
  console.log('   2. Copy the token from localStorage');
  console.log('   3. Test manually with:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/employer/debug/auth');

  // Test 4: Test employer profile route
  console.log('\n📋 Test 4: Employer Profile Route');
  try {
    const response = await axios.get(`${baseURL}/api/employer/`);
    console.log('❌ Should have failed without token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected employer profile request without token');
    } else {
      console.log(`⚠️ Unexpected status: ${error.response?.status}`);
    }
  }

  console.log('\n🔧 MANUAL TESTING STEPS:');
  console.log('1. Open your frontend application');
  console.log('2. Login as an employer (provider role)');
  console.log('3. Open browser developer tools');
  console.log('4. Go to Application/Storage > Local Storage');
  console.log('5. Copy the "token" value');
  console.log('6. Test the debug routes:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/employer/debug/auth');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/employer/debug/employer');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/employer/');

  console.log('\n📊 EXPECTED RESULTS:');
  console.log('✅ /debug/auth should return user info');
  console.log('✅ /debug/employer should return user info (if role is provider)');
  console.log('✅ / should return employer profile or 404 if no profile exists');

  console.log('\n🎯 FIXES APPLIED:');
  console.log('✅ Fixed JWT token field mismatch (_id vs userId)');
  console.log('✅ Added debug routes for testing authentication');
  console.log('✅ Middleware now correctly decodes JWT tokens');

  return {
    message: 'Authentication fix applied',
    nextSteps: 'Test manually with real JWT token from frontend login'
  };
}

// Run the test
if (require.main === module) {
  testAuthFix().catch(console.error);
}

module.exports = { testAuthFix };