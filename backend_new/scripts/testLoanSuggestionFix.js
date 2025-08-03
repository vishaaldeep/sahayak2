const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('../Model/User');
const Wallet = require('../Model/Wallet');
const { generateLoanSuggestion } = require('../services/loanSuggestionService');

async function testLoanSuggestionFix() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a seeker user with skills
    const seekers = await User.find({ role: 'seeker' }).limit(3);
    console.log(`Found ${seekers.length} seekers to test`);

    for (const user of seekers) {
      console.log(`\n🧪 Testing loan suggestion for: ${user.name} (${user._id})`);
      
      // Check current wallet status
      const wallet = await Wallet.findOne({ user_id: user._id });
      if (wallet) {
        console.log(`   💰 Current Wallet:`);
        console.log(`      Balance: ₹${wallet.balance}`);
        console.log(`      Monthly Savings Goal: ₹${wallet.monthly_savings_goal}`);
        
        // If no monthly savings goal, set one for testing
        if (wallet.monthly_savings_goal === 0) {
          console.log(`   🔧 Setting test monthly savings goal...`);
          wallet.monthly_savings_goal = 5000; // Set ₹5000 as test goal
          await wallet.save();
          console.log(`   ✅ Set monthly savings goal to ₹${wallet.monthly_savings_goal}`);
        }
      } else {
        console.log(`   ❌ No wallet found, creating one...`);
        const newWallet = new Wallet({
          user_id: user._id,
          balance: 1000,
          monthly_savings_goal: 5000
        });
        await newWallet.save();
        console.log(`   ✅ Created wallet with ₹5000 monthly savings goal`);
      }

      // Test loan suggestion generation
      console.log(`   🔄 Generating loan suggestions...`);
      const suggestions = await generateLoanSuggestion(user._id);
      
      if (suggestions && suggestions.length > 0) {
        console.log(`   ✅ Generated ${suggestions.length} loan suggestions:`);
        suggestions.forEach((suggestion, index) => {
          console.log(`      ${index + 1}. ${suggestion.skillName} Business`);
          console.log(`         Business: ${suggestion.businessName}`);
          console.log(`         Amount: ₹${suggestion.suggestedAmount.toLocaleString()}`);
          console.log(`         Credit Score: ${suggestion.creditScoreAtSuggestion}`);
          console.log(`         Monthly Savings: ₹${suggestion.monthlySavingsAtSuggestion}`);
        });
      } else {
        console.log(`   ❌ No loan suggestions generated`);
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
  testLoanSuggestionFix();
}

module.exports = { testLoanSuggestionFix };