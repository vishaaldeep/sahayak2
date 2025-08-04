#!/usr/bin/env node

console.log('🧪 TESTING WALLET MODULE LOADING');
console.log('=' .repeat(50));

try {
  console.log('\n📋 Step 1: Testing wallet routes module');
  const walletRoutes = require('../routes/walletRoutes');
  console.log('✅ Wallet routes module loaded successfully');
  console.log('   Type:', typeof walletRoutes);
  console.log('   Constructor:', walletRoutes.constructor.name);
} catch (error) {
  console.log('❌ Failed to load wallet routes module');
  console.log('   Error:', error.message);
  console.log('   Stack:', error.stack);
  return;
}

try {
  console.log('\n📋 Step 2: Testing Wallet model');
  const Wallet = require('../Model/Wallet');
  console.log('✅ Wallet model loaded successfully');
  console.log('   Model name:', Wallet.modelName);
} catch (error) {
  console.log('❌ Failed to load Wallet model');
  console.log('   Error:', error.message);
  return;
}

try {
  console.log('\n📋 Step 3: Testing WalletTransaction model');
  const WalletTransaction = require('../Model/WalletTransaction');
  console.log('✅ WalletTransaction model loaded successfully');
  console.log('   Model name:', WalletTransaction.modelName);
} catch (error) {
  console.log('❌ Failed to load WalletTransaction model');
  console.log('   Error:', error.message);
  return;
}

try {
  console.log('\n📋 Step 4: Testing auth middleware');
  const { authenticateToken } = require('../middleware/authMiddleware');
  console.log('✅ Auth middleware loaded successfully');
  console.log('   Type:', typeof authenticateToken);
} catch (error) {
  console.log('❌ Failed to load auth middleware');
  console.log('   Error:', error.message);
  return;
}

console.log('\n🎉 ALL MODULES LOADED SUCCESSFULLY!');
console.log('\n🔧 TROUBLESHOOTING STEPS:');
console.log('1. Restart your server: npm run dev');
console.log('2. Check server logs for wallet route registration');
console.log('3. Test endpoints: npm run diagnose-wallet');
console.log('4. If still failing, check for port conflicts or caching issues');

console.log('\n📝 MANUAL VERIFICATION:');
console.log('1. Stop the server (Ctrl+C)');
console.log('2. Start the server: npm run dev');
console.log('3. Look for these messages in server logs:');
console.log('   "💰 Registering Wallet routes at /api/wallet"');
console.log('   "✅ Wallet routes registered successfully"');
console.log('4. Test with: curl http://localhost:5000/api/wallet');
console.log('   Expected: 401 Unauthorized (not 404 Not Found)');

module.exports = { testWalletModule: () => 'Module test complete' };