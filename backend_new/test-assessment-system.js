// Test script to verify the assessment system integration
console.log('🧪 Testing Assessment System Integration...\n');

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const UserApplication = require('./Model/UserApplication');
const Job = require('./Model/Job');
const UserSkill = require('./Model/UserSkill');
const Assessment = require('./Model/Assessment');
const AssessmentQuestion = require('./Model/AssessmentQuestion');
const Skill = require('./Model/Skill');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testAssessmentSystem() {
  try {
    await connectDB();
    
    console.log('1. Checking Skills...');
    const skills = await Skill.find().limit(5);
    console.log(`   Found ${skills.length} skills`);
    skills.forEach(skill => {
      console.log(`   - ${skill.name} (${skill._id})`);
    });
    
    console.log('\n2. Checking Assessment Questions...');
    const totalQuestions = await AssessmentQuestion.countDocuments();
    console.log(`   Total questions in database: ${totalQuestions}`);
    
    if (skills.length > 0) {
      const questionsForFirstSkill = await AssessmentQuestion.countDocuments({ skill_id: skills[0]._id });
      console.log(`   Questions for ${skills[0].name}: ${questionsForFirstSkill}`);
    }
    
    console.log('\n3. Checking Jobs with Assessment Required...');
    const assessmentJobs = await Job.find({ assessment_required: true }).limit(3);
    console.log(`   Found ${assessmentJobs.length} jobs with assessment_required: true`);
    assessmentJobs.forEach(job => {
      console.log(`   - ${job.title} (Skills: ${job.skills_required?.length || 0})`);
    });
    
    console.log('\n4. Checking User Applications...');
    const applications = await UserApplication.find({ status: 'hired' }).limit(3);
    console.log(`   Found ${applications.length} hired applications`);
    
    console.log('\n5. Checking UserSkills with Pending Assessments...');
    const pendingAssessments = await UserSkill.find({ assessment_status: 'pending' });
    console.log(`   Found ${pendingAssessments.length} skills with pending assessments`);
    
    console.log('\n6. Checking Assessment Records...');
    const assessmentRecords = await Assessment.find().populate('skill_id', 'name').populate('job_id', 'title');
    console.log(`   Found ${assessmentRecords.length} assessment records`);
    assessmentRecords.forEach(assessment => {
      console.log(`   - User: ${assessment.user_id}, Skill: ${assessment.skill_id?.name}, Job: ${assessment.job_id?.title}, Status: ${assessment.status}`);
    });
    
    console.log('\n📊 Assessment System Status:');
    console.log(`   ✅ Skills: ${skills.length}`);
    console.log(`   ✅ Questions: ${totalQuestions}`);
    console.log(`   ✅ Assessment Jobs: ${assessmentJobs.length}`);
    console.log(`   ✅ Pending UserSkills: ${pendingAssessments.length}`);
    console.log(`   ✅ Assessment Records: ${assessmentRecords.length}`);
    
    if (totalQuestions === 0) {
      console.log('\n⚠️  WARNING: No assessment questions found!');
      console.log('   Run: npm run populate-questions');
    }
    
    if (pendingAssessments.length === 0) {
      console.log('\n💡 INFO: No pending assessments found.');
      console.log('   This is normal if no one has been hired for assessment-required jobs yet.');
    }
    
    console.log('\n🎉 Assessment system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing assessment system:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testAssessmentSystem();
}

module.exports = { testAssessmentSystem };