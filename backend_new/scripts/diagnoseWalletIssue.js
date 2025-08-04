#!/usr/bin/env node

const axios = require('axios');

async function diagnoseWalletIssue() {
  console.log('🔍 DIAGNOSING WALLET 404 ISSUE');
  console.log('=' .repeat(60));

  const baseURL = 'http://localhost:5000';
  
  // Test 1: Check if server is running
  console.log('\n📋 Step 1: Testing Server Connectivity');
  try {
    const response = await axios.get(`${baseURL}/`);
    console.log('✅ Server is running:', response.data);
  } catch (error) {
    console.log('❌ Server is not accessible');
    console.log('   Error:', error.message);
    console.log('   Please start the server with: npm run dev');
    return;
  }

  // Test 2: Test each wallet endpoint without auth (should get 401, not 404)
  const endpoints = [
    { method: 'GET', path: '/api/wallet', description: 'Root wallet route' },
    { method: 'GET', path: '/api/wallet/balance', description: 'Wallet balance' },
    { method: 'GET', path: '/api/wallet/transactions', description: 'Wallet transactions' },
    { method: 'POST', path: '/api/wallet/create-decentro', description: 'Create Decentro wallet' },
    { method: 'GET', path: '/api/wallet/decentro-balance', description: 'Decentro balance' },
    { method: 'GET', path: '/api/wallet/summary', description: 'Wallet summary' }
  ];\

  console.log('\n📋 Step 2: Testing Wallet Endpoints (without auth)');
  console.log('Expected: 401 (Unauthorized) - means route exists but needs auth');
  console.log('Problem: 404 (Not Found) - means route doesn\'t exist');
  
  for (const endpoint of endpoints) {
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${baseURL}${endpoint.path}`);
      } else if (endpoint.method === 'POST') {
        response = await axios.post(`${baseURL}${endpoint.path}`);
      }
      console.log(`❌ ${endpoint.method} ${endpoint.path} - Unexpected success (should require auth)`);
    } catch (error) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      
      if (status === 401) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} - 401 Unauthorized (route exists, needs auth)`);
      } else if (status === 404) {
        console.log(`❌ ${endpoint.method} ${endpoint.path} - 404 Not Found (route missing!)`);
      } else {
        console.log(`⚠️ ${endpoint.method} ${endpoint.path} - ${status} ${statusText}`);
      }
    }
  }

  // Test 3: Check if wallet routes are being loaded
  console.log('\n📋 Step 3: Server Logs Analysis');
  console.log('Check your server console for these messages:');
  console.log('✅ Expected: "💰 Registering Wallet routes at /api/wallet"');
  console.log('✅ Expected: "✅ Wallet routes registered successfully"');
  console.log('❌ Problem: Any error messages about wallet routes');

  // Test 4: Manual testing instructions
  console.log('\n📋 Step 4: Manual Testing Instructions');
  console.log('1. Restart your server:');
  console.log('   cd backend_new');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Check server startup logs for wallet route registration');
  console.log('');
  console.log('3. Test with a valid JWT token:');
  console.log('   - Login to get a token');
  console.log('   - Copy token from localStorage');
  console.log('   - Test: curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/wallet');

  // Test 5: Common issues and solutions
  console.log('\n📋 Step 5: Common Issues & Solutions');
  console.log('');
  console.log('🔧 Issue: Routes return 404');
  console.log('   Solution: Restart the server (npm run dev)');
  console.log('');
  console.log('🔧 Issue: Module not found errors');
  console.log('   Solution: Check file paths and imports');
  console.log('');
  console.log('🔧 Issue: Syntax errors in routes');
  console.log('   Solution: Check walletRoutes.js for syntax errors');
  console.log('');
  console.log('🔧 Issue: Routes not registered');
  console.log('   Solution: Check index.js for wallet route registration');

  // Test 6: File verification
  console.log('\n📋 Step 6: File Verification');
  console.log('Required files:');
  console.log('✅ backend_new/routes/walletRoutes.js');
  console.log('✅ backend_new/Model/Wallet.js');
  console.log('✅ backend_new/Model/WalletTransaction.js');
  console.log('✅ backend_new/middleware/authMiddleware.js');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Restart your backend server');
  console.log('2. Check server logs for wallet route registration');
  console.log('3. Test endpoints with proper authentication');
  console.log('4. If still failing, check for syntax errors in walletRoutes.js');

  return {
    message: 'Diagnosis complete',
    recommendation: 'Restart server and check logs'
  };
}

// Run the diagnosis
if (require.main === module) {
  diagnoseWalletIssue().catch(console.error);
}

module.exports = { diagnoseWalletIssue };