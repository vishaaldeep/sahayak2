const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');
const creditScoreService = require('../services/creditScoreService');

async function fixMissingCreditScores() {
    try {
        console.log('🔧 Starting to fix missing credit scores...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all seekers
        const seekers = await User.find({ role: 'seeker' });
        console.log(`📊 Found ${seekers.length} seekers in database`);

        // Find seekers without credit scores
        const seekersWithCreditScores = await CreditScore.find({}).distinct('user_id');
        const seekersWithoutCreditScores = seekers.filter(seeker => 
            !seekersWithCreditScores.some(id => id.toString() === seeker._id.toString())
        );

        console.log(`❌ Found ${seekersWithoutCreditScores.length} seekers without credit scores`);
        console.log(`✅ Found ${seekersWithCreditScores.length} seekers with existing credit scores`);

        if (seekersWithoutCreditScores.length === 0) {
            console.log('🎉 All seekers already have credit scores!');
            return;
        }

        // Create credit scores for seekers without them
        let successful = 0;
        let failed = 0;

        for (const seeker of seekersWithoutCreditScores) {
            try {
                console.log(`🔄 Creating credit score for ${seeker.name} (${seeker._id})`);
                
                const result = await creditScoreService.updateCreditScore(seeker._id);
                
                if (result.error) {
                    console.log(`❌ Error for ${seeker.name}: ${result.error}`);
                    failed++;
                } else {
                    console.log(`✅ Created credit score for ${seeker.name}: ${result.totalScore} points`);
                    successful++;
                }
            } catch (error) {
                console.error(`❌ Failed to create credit score for ${seeker.name}:`, error.message);
                failed++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`✅ Successfully created: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Total seekers with credit scores now: ${seekersWithCreditScores.length + successful}`);

        // Verify the fix
        const finalCreditScoreCount = await CreditScore.countDocuments();
        console.log(`🔍 Final credit score records in database: ${finalCreditScoreCount}`);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        console.log('🎉 Credit score fix completed!');

    } catch (error) {
        console.error('❌ Error fixing missing credit scores:', error);
        process.exit(1);
    }
}

// Run the fix
fixMissingCreditScores();