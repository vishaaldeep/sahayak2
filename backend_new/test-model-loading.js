const mongoose = require('mongoose');
require('dotenv').config();

async function testModelLoading() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    console.log('\n📦 Loading models...');
    
    // Import models in dependency order
    const User = require('./Model/User');
    console.log('✅ User model loaded');
    
    const Skill = require('./Model/Skill');
    console.log('✅ Skill model loaded');
    
    const Job = require('./Model/Job');
    console.log('✅ Job model loaded');
    
    const UserApplication = require('./Model/UserApplication');
    console.log('✅ UserApplication model loaded');
    
    const UserSkill = require('./Model/UserSkill');
    console.log('✅ UserSkill model loaded');
    
    const Assessment = require('./Model/Assessment');
    console.log('✅ Assessment model loaded');
    
    const AssessmentQuestion = require('./Model/AssessmentQuestion');
    console.log('✅ AssessmentQuestion model loaded');
    
    console.log('\n📋 Registered models:', Object.keys(mongoose.models));
    
    // Test basic queries
    console.log('\n🔍 Testing basic queries...');
    
    const userCount = await User.countDocuments();
    console.log(`Users: ${userCount}`);
    
    const jobCount = await Job.countDocuments();
    console.log(`Jobs: ${jobCount}`);
    
    const assessmentJobCount = await Job.countDocuments({ assessment_required: true });
    console.log(`Assessment Jobs: ${assessmentJobCount}`);
    
    const hiredApplicationCount = await UserApplication.countDocuments({ status: 'hired' });
    console.log(`Hired Applications: ${hiredApplicationCount}`);
    
    const assessmentCount = await Assessment.countDocuments();
    console.log(`Assessments: ${assessmentCount}`);
    
    const questionCount = await AssessmentQuestion.countDocuments();
    console.log(`Questions: ${questionCount}`);
    
    console.log('\n🎉 All models loaded and working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

if (require.main === module) {
  testModelLoading();
}

module.exports = { testModelLoading };