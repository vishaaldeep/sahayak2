#!/usr/bin/env node

const axios = require('axios');

async function testInhouseWallet() {
  console.log('🧪 TESTING IN-HOUSE WALLET FUNCTIONALITY');
  console.log('=' .repeat(60));

  const baseURL = 'http://localhost:5000';
  
  // Test 1: Check server connectivity
  console.log('\n📋 Step 1: Server Connectivity');
  try {
    const response = await axios.get(`${baseURL}/`);
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not accessible');
    console.log('   Please start the server with: npm run dev');
    return;
  }

  // Test 2: Test wallet endpoints without auth (should get 401, not 404)
  const endpoints = [
    { method: 'GET', path: '/api/wallet', description: 'Root wallet route' },
    { method: 'GET', path: '/api/wallet/test', description: 'Test route (no auth)' },
    { method: 'GET', path: '/api/wallet/balance', description: 'Wallet balance' },
    { method: 'GET', path: '/api/wallet/transactions', description: 'Wallet transactions' },
    { method: 'POST', path: '/api/wallet/add-money', description: 'Add money to wallet' },
    { method: 'PUT', path: '/api/wallet/savings-goal', description: 'Update savings goal' },
    { method: 'GET', path: '/api/wallet/summary', description: 'Wallet summary' }
  ];

  console.log('\n📋 Step 2: Testing In-House Wallet Endpoints');
  console.log('Expected: 401 (Unauthorized) for protected routes');
  console.log('Expected: 200 (Success) for test route');
  
  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${baseURL}${endpoint.path}`);
      } else if (endpoint.method === 'POST') {
        response = await axios.post(`${baseURL}${endpoint.path}`, {});
      } else if (endpoint.method === 'PUT') {
        response = await axios.put(`${baseURL}${endpoint.path}`, {});
      }
      
      if (endpoint.path === '/api/wallet/test') {
        console.log(`✅ ${endpoint.method} ${endpoint.path} - 200 Success (test route working)`);
      } else {
        console.log(`❌ ${endpoint.method} ${endpoint.path} - Unexpected success (should require auth)`);
      }
    } catch (error) {
      const status = error.response?.status;
      
      if (status === 401) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} - 401 Unauthorized (route exists, needs auth)`);
      } else if (status === 404) {
        console.log(`❌ ${endpoint.method} ${endpoint.path} - 404 Not Found (route missing!)`);
      } else {
        console.log(`⚠️ ${endpoint.method} ${endpoint.path} - ${status} ${error.response?.statusText}`);
      }
    }
  }

  console.log('\n📋 Step 3: Features Removed');
  console.log('❌ Removed: POST /api/wallet/create-decentro');
  console.log('❌ Removed: GET /api/wallet/decentro-balance');
  console.log('❌ Removed: Decentro virtual account creation');
  console.log('❌ Removed: Decentro balance checking');

  console.log('\n📋 Step 4: Features Added');
  console.log('✅ Added: POST /api/wallet/add-money');
  console.log('✅ Added: In-house wallet service integration');
  console.log('✅ Added: Automatic wallet creation');
  console.log('✅ Added: Simple money addition functionality');

  console.log('\n📋 Step 5: Available Endpoints');
  console.log('🔗 GET /api/wallet - Get wallet data');
  console.log('🔗 GET /api/wallet/test - Test route (no auth)');
  console.log('🔗 GET /api/wallet/balance - Get wallet balance');
  console.log('🔗 GET /api/wallet/transactions - Get transaction history');
  console.log('🔗 POST /api/wallet/add-money - Add money to wallet');
  console.log('🔗 PUT /api/wallet/savings-goal - Update savings goal');
  console.log('🔗 GET /api/wallet/summary - Get wallet summary');

  console.log('\n🧪 Manual Testing Steps:');
  console.log('1. Login to get JWT token');
  console.log('2. Test wallet creation:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet');
  console.log('3. Test adding money:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \\');
  console.log('        -d \'{"amount": 100, "description": "Test money"}\' \\');
  console.log('        -X POST http://localhost:5000/api/wallet/add-money');
  console.log('4. Test balance:');
  console.log('   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet/balance');

  console.log('\n✅ IN-HOUSE WALLET FEATURES:');
  console.log('• Simple wallet creation without external dependencies');
  console.log('• Direct money addition to wallet balance');
  console.log('• Transaction history tracking');
  console.log('• Savings goal management');
  console.log('• Wallet summary and statistics');
  console.log('• Integration with existing wallet service');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Restart your backend server');
  console.log('2. Test the simple test route: curl http://localhost:5000/api/wallet/test');
  console.log('3. Login and test wallet creation');
  console.log('4. Test adding money to wallet');
  console.log('5. Verify frontend wallet page works without Decentro');

  return {
    message: 'In-house wallet testing complete',
    recommendation: 'Test with authentication for full functionality'
  };
}

// Run the test
if (require.main === module) {
  testInhouseWallet().catch(console.error);
}

module.exports = { testInhouseWallet };