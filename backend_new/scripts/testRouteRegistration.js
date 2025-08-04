const axios = require('axios');

async function testRouteRegistration() {
  console.log('🔍 TESTING ROUTE REGISTRATION');
  console.log('=' .repeat(50));

  const baseURL = 'http://localhost:5000';

  try {
    // Test 1: Check if server is running
    console.log('\n📋 Test 1: Server Status');
    try {
      const response = await axios.get(`${baseURL}/`);
      console.log('✅ Server is running');
      console.log(`   Response: ${response.data}`);
    } catch (error) {
      console.log('❌ Server is not running');
      console.log('   Please start the server with: npm run dev');
      return;
    }

    // Test 2: List all registered routes (if available)
    console.log('\n📋 Test 2: Route Registration Check');
    
    // Test retell route specifically
    try {
      const response = await axios.post(`${baseURL}/api/retell/auth`, {
        context: 'test'
      });
      console.log('✅ Retell route is registered and working');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log('❌ Retell route not found (404)');
          console.log('   Route registration issue detected');
        } else if (error.response.status === 500) {
          console.log('✅ Retell route is registered (got 500 - likely API key issue)');
          console.log(`   Error: ${error.response.data.error}`);
        } else {
          console.log(`⚠️ Unexpected status: ${error.response.status}`);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }

    // Test 3: Check other routes for comparison
    console.log('\n📋 Test 3: Other Routes Check');
    
    const testRoutes = [
      '/api/users',
      '/api/jobs',
      '/api/skills'
    ];

    for (const route of testRoutes) {
      try {
        const response = await axios.get(`${baseURL}${route}`);
        console.log(`✅ ${route} - Working`);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ ${route} - Not found (404)`);
        } else {
          console.log(`✅ ${route} - Registered (status: ${error.response?.status || 'unknown'})`);
        }
      }
    }

    // Test 4: Check if retell-sdk is installed
    console.log('\n📋 Test 4: Dependencies Check');
    try {
      require('retell-sdk');
      console.log('✅ retell-sdk is installed');
    } catch (error) {
      console.log('❌ retell-sdk is not installed');
      console.log('   Run: npm install retell-sdk');
    }

    // Test 5: Environment variables check
    console.log('\n📋 Test 5: Environment Variables');
    if (process.env.RETELL_API_KEY) {
      console.log('✅ RETELL_API_KEY is set');
    } else {
      console.log('❌ RETELL_API_KEY is not set');
      console.log('   Add RETELL_API_KEY to your .env file');
    }

    if (process.env.RETELL_AGENT_ID) {
      console.log('✅ RETELL_AGENT_ID is set');
    } else {
      console.log('⚠️ RETELL_AGENT_ID is not set (using default)');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }

  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Ensure backend server is running: npm run dev');
  console.log('2. Check if retell-sdk is installed: npm list retell-sdk');
  console.log('3. Verify .env file has RETELL_API_KEY');
  console.log('4. Check server logs for any startup errors');
  console.log('5. Try restarting the server');
}

// Run the test
if (require.main === module) {
  testRouteRegistration().catch(console.error);
}

module.exports = { testRouteRegistration };