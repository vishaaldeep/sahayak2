const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');

async function verifyCreditScores() {
    try {
        console.log('🔍 Verifying credit scores in database...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get counts
        const totalSeekers = await User.countDocuments({ role: 'seeker' });
        const totalCreditScores = await CreditScore.countDocuments();
        
        console.log(`📊 Database Statistics:`);
        console.log(`   Total Seekers: ${totalSeekers}`);
        console.log(`   Total Credit Scores: ${totalCreditScores}`);
        console.log(`   Coverage: ${totalSeekers > 0 ? Math.round((totalCreditScores / totalSeekers) * 100) : 0}%`);

        // Find seekers without credit scores
        const seekersWithCreditScores = await CreditScore.find({}).distinct('user_id');
        const seekersWithoutCreditScores = await User.find({
            role: 'seeker',
            _id: { $nin: seekersWithCreditScores }
        }).select('_id name phone_number createdAt');

        if (seekersWithoutCreditScores.length > 0) {
            console.log(`\n❌ Seekers without credit scores (${seekersWithoutCreditScores.length}):`);
            seekersWithoutCreditScores.forEach((seeker, index) => {
                console.log(`   ${index + 1}. ${seeker.name} (${seeker.phone_number}) - Created: ${seeker.createdAt.toLocaleDateString()}`);
            });
        } else {
            console.log('\n✅ All seekers have credit scores!');
        }

        // Show sample credit scores
        const sampleCreditScores = await CreditScore.find({})
            .populate('user_id', 'name phone_number')
            .limit(5)
            .sort({ last_calculated: -1 });

        if (sampleCreditScores.length > 0) {
            console.log(`\n📋 Sample Credit Scores (Latest 5):`);
            sampleCreditScores.forEach((cs, index) => {
                console.log(`   ${index + 1}. ${cs.user_id?.name || 'Unknown'}: ${cs.score} points (Updated: ${cs.last_calculated.toLocaleDateString()})`);
            });
        }

        // Check for base score (30)
        const baseScoreCount = await CreditScore.countDocuments({ score: 30 });
        console.log(`\n🎯 Seekers with base score (30): ${baseScoreCount}`);

        // Score distribution
        const scoreDistribution = await CreditScore.aggregate([
            {
                $bucket: {
                    groupBy: '$score',
                    boundaries: [0, 30, 40, 50, 60, 70, 80, 90, 100],
                    default: 'Other',
                    output: {
                        count: { $sum: 1 },
                        avgScore: { $avg: '$score' }
                    }
                }
            }
        ]);

        if (scoreDistribution.length > 0) {
            console.log(`\n📈 Score Distribution:`);
            scoreDistribution.forEach(bucket => {
                const range = bucket._id === 'Other' ? 'Other' : `${bucket._id}-${bucket._id + 9}`;
                console.log(`   ${range}: ${bucket.count} seekers (avg: ${Math.round(bucket.avgScore)})`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Verification completed!');

    } catch (error) {
        console.error('❌ Error verifying credit scores:', error);
        process.exit(1);
    }
}

// Run the verification
verifyCreditScores();