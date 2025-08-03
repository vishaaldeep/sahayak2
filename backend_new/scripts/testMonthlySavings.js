const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../Model/User');
const Wallet = require('../Model/Wallet');
const CreditScore = require('../Model/creditScore');

async function testMonthlySavings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a seeker user
    const seekers = await User.find({ role: 'seeker' }).limit(5);
    console.log(`Found ${seekers.length} seekers`);

    for (const user of seekers) {
      console.log(`\n👤 User: ${user.name} (${user._id})`);
      console.log(`   Phone: ${user.phone_number}`);
      console.log(`   User.monthlySavings: ${user.monthlySavings}`);

      // Check wallet
      const wallet = await Wallet.findOne({ user_id: user._id });
      if (wallet) {
        console.log(`   💰 Wallet found:`);
        console.log(`      Balance: ₹${wallet.balance}`);
        console.log(`      Monthly Savings Goal: ₹${wallet.monthly_savings_goal}`);
      } else {
        console.log(`   ❌ No wallet found for user`);
      }

      // Check credit score
      const creditScore = await CreditScore.findOne({ user_id: user._id });
      if (creditScore) {
        console.log(`   📊 Credit Score: ${creditScore.score}/100`);
      } else {
        console.log(`   ❌ No credit score found for user`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testMonthlySavings();
}

module.exports = { testMonthlySavings };