const mongoose = require('mongoose');
const creditScoreService = require('../services/creditScoreService');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vishaaldeepsingh6:Hl8YNecl7F9namov@cluster0.2z2jsqt.mongodb.net/sahaayak';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const updateAllCreditScores = async () => {
    await connectDB();

    try {
        console.log('🎯 Starting credit score update for all seekers...');
        console.log('=====================================');

        const startTime = new Date();
        const result = await creditScoreService.updateAllSeekerCreditScores();
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;

        console.log('\n📊 Credit Score Update Summary:');
        console.log('=====================================');
        console.log(`Total seekers found: ${result.totalSeekers}`);
        console.log(`Successfully updated: ${result.updated}`);
        console.log(`Errors encountered: ${result.errors}`);
        console.log(`Processing time: ${duration.toFixed(2)} seconds`);

        if (result.results && result.results.length > 0) {
            console.log('\n🏆 Credit Score Changes:');
            console.log('=====================================');
            
            result.results.forEach((user, index) => {
                const change = user.newScore - user.oldScore;
                const changeSymbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
                const changeText = change > 0 ? `+${change}` : change.toString();
                
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   Score: ${user.oldScore} → ${user.newScore} (${changeText}) ${changeSymbol}`);
                console.log('');
            });

            // Show top improvements
            const improvements = result.results
                .filter(user => user.improvement > 0)
                .sort((a, b) => b.improvement - a.improvement);

            if (improvements.length > 0) {
                console.log('\n🚀 Top Improvements:');
                console.log('=====================================');
                improvements.slice(0, 5).forEach((user, index) => {
                    console.log(`${index + 1}. ${user.email}: +${user.improvement} points`);
                });
            }

            // Show users who need attention
            const lowScores = result.results
                .filter(user => user.newScore < 40)
                .sort((a, b) => a.newScore - b.newScore);

            if (lowScores.length > 0) {
                console.log('\n⚠️  Users with Low Credit Scores (< 40):');
                console.log('=====================================');
                lowScores.slice(0, 5).forEach((user, index) => {
                    console.log(`${index + 1}. ${user.email}: ${user.newScore} points`);
                });
            }
        }

        console.log('\n✅ Credit score update completed successfully!');

    } catch (error) {
        console.error('❌ Error updating credit scores:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database disconnected.');
    }
};

// Run the script
updateAllCreditScores();