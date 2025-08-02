
const mongoose = require('mongoose');
const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');
const connectDB = require('../config/db');

const assignCreditScoreToAllUsers = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            let creditScore = await CreditScore.findOne({ user: user._id });

            if (creditScore) {
                creditScore.score = 30;
                await creditScore.save();
                console.log(`Updated credit score for user ${user.email} to 30.`);
            } else {
                creditScore = new CreditScore({
                    user: user._id,
                    score: 300,
                    // Add any other required fields for CreditScore model if necessary
                });
                await creditScore.save();
                console.log(`Created credit score for user ${user.email} with score 300.`);
            }
        }
        console.log('All users have been assigned a credit score of 300.');
    } catch (error) {
        console.error('Error assigning credit scores:', error);
    } finally {
        mongoose.disconnect();
        console.log('Database disconnected.');
    }
};

assignCreditScoreToAllUsers();
