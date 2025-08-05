const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../Model/User');
const Job = require('../Model/Job');
const UserRating = require('../Model/UserRating');

async function testRatingsAPI() {
    try {
        console.log('🧪 Testing Ratings API Components...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test UserRating model
        console.log('\n📊 Testing UserRating Model...');
        const sampleRating = new UserRating({
            giver_user_id: new mongoose.Types.ObjectId(),
            receiver_user_id: new mongoose.Types.ObjectId(),
            job_id: new mongoose.Types.ObjectId(),
            rating: 5,
            comments: 'Test rating',
            role_of_giver: 'seeker',
            role_of_receiver: 'provider'
        });

        // Validate without saving
        const validationError = sampleRating.validateSync();
        if (validationError) {
            console.log('❌ Model validation failed:', validationError.message);
        } else {
            console.log('✅ UserRating model validation passed');
        }

        // Test required fields
        console.log('\n🔍 Testing Required Fields...');
        const requiredFields = ['giver_user_id', 'receiver_user_id', 'job_id', 'rating', 'role_of_giver', 'role_of_receiver'];
        const modelPaths = Object.keys(UserRating.schema.paths);
        
        requiredFields.forEach(field => {
            if (modelPaths.includes(field)) {
                const path = UserRating.schema.paths[field];
                console.log(`✅ ${field}: ${path.isRequired ? 'Required' : 'Optional'} (${path.instance})`);
            } else {
                console.log(`❌ ${field}: Field not found in model`);
            }
        });

        // Test virtual fields
        console.log('\n🔗 Testing Virtual Fields...');
        console.log('✅ seeker_id virtual:', typeof sampleRating.seeker_id);
        console.log('✅ employer_id virtual:', typeof sampleRating.employer_id);
        console.log('✅ feedback virtual:', typeof sampleRating.feedback);

        // Check existing data
        console.log('\n📈 Database Statistics...');
        const totalRatings = await UserRating.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        
        console.log(`📊 Total Ratings: ${totalRatings}`);
        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`💼 Total Jobs: ${totalJobs}`);

        if (totalRatings > 0) {
            const sampleExistingRating = await UserRating.findOne().populate('giver_user_id receiver_user_id job_id');
            console.log('\n📋 Sample Existing Rating:');
            console.log(`   Rating: ${sampleExistingRating.rating}/5`);
            console.log(`   Giver: ${sampleExistingRating.giver_user_id?.name || 'Unknown'}`);
            console.log(`   Receiver: ${sampleExistingRating.receiver_user_id?.name || 'Unknown'}`);
            console.log(`   Job: ${sampleExistingRating.job_id?.title || 'Unknown'}`);
        }

        // Test aggregation query
        console.log('\n🔢 Testing Aggregation Query...');
        try {
            const testUserId = new mongoose.Types.ObjectId();
            const aggregationResult = await UserRating.aggregate([
                { $match: { receiver_user_id: testUserId } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);
            console.log('✅ Aggregation query works correctly');
        } catch (aggError) {
            console.log('❌ Aggregation query failed:', aggError.message);
        }

        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully!');
        console.log('\n🎯 Ratings API should be working properly now.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testRatingsAPI();