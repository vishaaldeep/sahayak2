#!/usr/bin/env node

const axios = require('axios');

async function quickTest() {
  console.log('🔍 QUICK ROUTE TEST');
  console.log('==================');
  
  const baseURL = 'http://localhost:5000';
  
  console.log('\n1. Testing server connectivity...');
  try {
    const response = await axios.get(baseURL);
    console.log('✅ Server is running');
    console.log(`   Response: ${response.data}`);
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('   Please start the server with: npm run dev');
    console.log(`   Error: ${error.message}`);
    return;
  }
  
  console.log('\n2. Testing retell debug route...');
  try {
    const response = await axios.get(`${baseURL}/api/retell/test`);
    console.log('✅ Retell debug route working');
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Retell debug route failed');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data || error.message}`);
  }
  
  console.log('\n3. Testing retell auth GET route...');
  try {
    const response = await axios.get(`${baseURL}/api/retell/auth`);
    console.log('✅ Retell auth GET route working');
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Retell auth GET route failed');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    console.log(`   Error: ${error.response?.data || error.message}`);
  }
  
  console.log('\n4. Testing retell auth POST route...');
  try {
    const response = await axios.post(`${baseURL}/api/retell/auth`, {
      context: 'test'
    });
    console.log('✅ Retell auth POST route working');
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.log('❌ Retell auth POST route failed');
    console.log(`   Status: ${error.response?.status || 'No response'}`);
    if (error.response?.status === 500) {
      console.log('   Note: 500 error is expected if RETELL_API_KEY is not configured');
    }
    console.log(`   Error: ${error.response?.data || error.message}`);
  }
  
  console.log('\n5. Testing other routes for comparison...');
  const testRoutes = ['/api/users', '/api/jobs', '/api/skills'];
  
  for (const route of testRoutes) {
    try {
      const response = await axios.get(`${baseURL}${route}`);
      console.log(`✅ ${route} - Working (${response.status})`);
    } catch (error) {
      const status = error.response?.status || 'No response';
      if (status === 404) {
        console.log(`❌ ${route} - Not found (404)`);
      } else {
        console.log(`✅ ${route} - Registered (${status})`);
      }
    }
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('If retell routes are failing but other routes work,');
  console.log('the issue is likely with route registration or file paths.');
  console.log('\nIf all routes are failing, the issue is with the server setup.');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check server console for error messages');
  console.log('2. Verify retell files exist and have correct syntax');
  console.log('3. Restart the server and check registration messages');
  console.log('4. Check .env file for required variables');
}

quickTest().catch(console.error);