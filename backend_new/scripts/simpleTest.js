console.log('🚀 Starting Simple Test...');

const mongoose = require('mongoose');
require('dotenv').config();

console.log('📋 Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not Set');

async function simpleTest() {
  try {
    console.log('\n🔌 Attempting MongoDB connection...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak';
    console.log('Connection URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    // Test basic model imports
    console.log('\n📦 Testing Model Imports...');
    
    try {
      const User = require('../Model/User');
      console.log('✅ User model imported');
      
      const userCount = await User.countDocuments();
      console.log(`📊 Users in database: ${userCount}`);
      
      if (userCount > 0) {
        const sampleUser = await User.findOne();
        console.log(`👤 Sample user: ${sampleUser.name} (${sampleUser.role})`);
      }
      
    } catch (modelError) {
      console.log('❌ Model import error:', modelError.message);
    }
    
    // Test Job model
    try {
      const Job = require('../Model/Job');
      console.log('✅ Job model imported');
      
      const jobCount = await Job.countDocuments();
      console.log(`💼 Jobs in database: ${jobCount}`);
      
      if (jobCount > 0) {
        const sampleJob = await Job.findOne();
        console.log(`🏢 Sample job: ${sampleJob.title} (Assessment required: ${sampleJob.assessment_required})`);
      }
      
    } catch (jobError) {
      console.log('❌ Job model error:', jobError.message);
    }
    
    // Test service import
    try {
      console.log('\n🤖 Testing Service Import...');
      const SmartHiringAssessmentService = require('../services/smartHiringAssessmentService');
      console.log('✅ SmartHiringAssessmentService imported');
      
      const status = SmartHiringAssessmentService.getServiceStatus();
      console.log('📊 Service Status:', status.status);
      console.log('🔧 Primary Method:', status.primary_method);
      
    } catch (serviceError) {
      console.log('❌ Service import error:', serviceError.message);
    }
    
    console.log('\n🎉 Simple test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Simple test failed:');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.name === 'MongoNetworkError') {
      console.log('\n🔧 MongoDB Connection Issues:');
      console.log('1. Check if MongoDB is running');
      console.log('2. Verify connection string in .env file');
      console.log('3. Check network connectivity');
    } else if (error.name === 'MongoParseError') {
      console.log('\n🔧 MongoDB URI Issues:');
      console.log('1. Check MONGODB_URI format in .env');
      console.log('2. Ensure credentials are correct');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
simpleTest();