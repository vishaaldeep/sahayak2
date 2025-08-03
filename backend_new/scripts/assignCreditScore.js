
const mongoose = require('mongoose');
const User = require('../Model/User');
const CreditScore = require('../Model/creditScore');
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

const assignCreditScoreToAllUsers = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        let updatedCount = 0;
        let createdCount = 0;
        let errorCount = 0;

        for (const user of users) {
            try {
                // Use correct field name: user_id instead of user
                let creditScore = await CreditScore.findOne({ user_id: user._id });

                if (creditScore) {
                    // Update existing credit score to 30 (within valid range 10-100)
                    creditScore.score = 30;
                    creditScore.last_calculated = new Date();
                    await creditScore.save();
                    console.log(`Updated credit score for user ${user.email || user.phone_number} to 30.`);
                    updatedCount++;
                } else {
                    // Create new credit score with default value of 30
                    creditScore = new CreditScore({
                        user_id: user._id, // Correct field name
                        score: 30, // Within valid range (10-100)
                        factors: {
                            default_score: 'Initial credit score assignment'
                        },
                        last_calculated: new Date()
                    });
                    await creditScore.save();
                    console.log(`Created credit score for user ${user.email || user.phone_number} with score 30.`);
                    createdCount++;
                }
            } catch (userError) {
                console.error(`Error processing user ${user.email || user.phone_number}:`, userError.message);
                errorCount++;
            }
        }
        
        console.log('\n=== Credit Score Assignment Summary ===');
        console.log(`Total users processed: ${users.length}`);
        console.log(`Credit scores updated: ${updatedCount}`);
        console.log(`Credit scores created: ${createdCount}`);
        console.log(`Errors encountered: ${errorCount}`);
        console.log('All users have been processed for credit score assignment.');
        
    } catch (error) {
        console.error('Error in assignCreditScoreToAllUsers:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
    }
};

assignCreditScoreToAllUsers();
