const mongoose = require('mongoose');
require('dotenv').config();

// Import models in proper order
const User = require('../Model/User');
const Skill = require('../Model/Skill');
const Job = require('../Model/Job');
const UserApplication = require('../Model/UserApplication');
const UserSkill = require('../Model/UserSkill');
const Assessment = require('../Model/Assessment');

// Connect to MongoDB
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

// Verify retroactive assessments were created correctly
async function verifyRetroactiveAssessments() {
  try {
    await connectDB();
    
    console.log('🔍 Verifying Retroactive Assessment Creation...\n');
    
    // Find all jobs with assessment_required: true
    const assessmentJobs = await Job.find({ 
      assessment_required: true,
      skills_required: { $exists: true, $ne: [] }
    }).populate('skills_required', 'name');
    
    console.log(`📋 Found ${assessmentJobs.length} jobs requiring assessments\n`);
    
    let totalExpected = 0;
    let totalAssessmentRecords = 0;
    let totalUserSkillsPending = 0;
    let missingAssessments = [];
    let missingUserSkills = [];
    
    for (const job of assessmentJobs) {
      console.log(`🔍 Checking Job: "${job.title}"`);
      
      // Find hired employees for this job
      const hiredApplications = await UserApplication.find({
        job_id: job._id,
        status: 'hired'
      }).populate('seeker_id', 'name');
      
      console.log(`   👥 Hired Employees: ${hiredApplications.length}`);
      
      for (const application of hiredApplications) {
        const employee = application.seeker_id;
        console.log(`   👤 ${employee.name}:`);
        
        for (const skill of job.skills_required) {
          totalExpected++;
          
          // Check Assessment record
          const assessmentRecord = await Assessment.findOne({
            user_id: employee._id,
            skill_id: skill._id,
            job_id: job._id
          });
          
          // Check UserSkill record
          const userSkill = await UserSkill.findOne({
            user_id: employee._id,
            skill_id: skill._id
          });
          
          if (assessmentRecord) {
            totalAssessmentRecords++;
            console.log(`      ✅ Assessment: ${skill.name} (${assessmentRecord.status})`);
          } else {
            console.log(`      ❌ Missing Assessment: ${skill.name}`);
            missingAssessments.push({
              employee: employee.name,
              skill: skill.name,
              job: job.title
            });
          }
          
          if (userSkill && userSkill.assessment_status === 'pending') {
            totalUserSkillsPending++;
            console.log(`      ✅ UserSkill: ${skill.name} (${userSkill.assessment_status})`);
          } else if (userSkill) {
            console.log(`      ⚠️  UserSkill: ${skill.name} (${userSkill.assessment_status})`);
          } else {
            console.log(`      ❌ Missing UserSkill: ${skill.name}`);
            missingUserSkills.push({
              employee: employee.name,
              skill: skill.name,
              job: job.title
            });
          }
        }
      }
      console.log('');
    }
    
    // Summary
    console.log('📊 VERIFICATION SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Expected Combinations: ${totalExpected}`);
    console.log(`Assessment Records Found: ${totalAssessmentRecords}`);
    console.log(`UserSkills with Pending Status: ${totalUserSkillsPending}`);
    console.log(`Missing Assessments: ${missingAssessments.length}`);
    console.log(`Missing UserSkills: ${missingUserSkills.length}`);
    
    // Coverage percentages
    const assessmentCoverage = totalExpected > 0 ? ((totalAssessmentRecords / totalExpected) * 100).toFixed(1) : 0;
    const userSkillCoverage = totalExpected > 0 ? ((totalUserSkillsPending / totalExpected) * 100).toFixed(1) : 0;
    
    console.log(`\nCoverage:`);
    console.log(`Assessment Records: ${assessmentCoverage}%`);
    console.log(`UserSkill Pending: ${userSkillCoverage}%`);
    
    // Status
    if (totalAssessmentRecords === totalExpected && totalUserSkillsPending === totalExpected) {
      console.log('\n🎉 VERIFICATION PASSED: All assessments created successfully!');
    } else {
      console.log('\n⚠️  VERIFICATION ISSUES FOUND:');
      
      if (missingAssessments.length > 0) {
        console.log('\n❌ Missing Assessment Records:');
        missingAssessments.forEach(item => {
          console.log(`   - ${item.employee} → ${item.skill} (${item.job})`);
        });
      }
      
      if (missingUserSkills.length > 0) {
        console.log('\n❌ Missing UserSkill Records:');
        missingUserSkills.forEach(item => {
          console.log(`   - ${item.employee} → ${item.skill} (${item.job})`);
        });
      }
      
      console.log('\n💡 Recommended Actions:');
      console.log('   1. Run: npm run create-retroactive-assessments');
      console.log('   2. Check for missing questions: npm run populate-questions');
      console.log('   3. Verify database connectivity and permissions');
    }
    
    // Additional checks
    console.log('\n🔍 Additional Checks:');
    
    // Check for orphaned assessments
    const totalAssessments = await Assessment.countDocuments();
    const orphanedAssessments = await Assessment.find({
      job_id: { $nin: assessmentJobs.map(j => j._id) }
    });
    
    console.log(`Total Assessment Records: ${totalAssessments}`);
    console.log(`Orphaned Assessments: ${orphanedAssessments.length}`);
    
    // Check for pending UserSkills without Assessment records
    const pendingUserSkills = await UserSkill.find({ assessment_status: 'pending' });
    const pendingWithoutAssessment = [];
    
    for (const userSkill of pendingUserSkills) {
      const hasAssessment = await Assessment.findOne({
        user_id: userSkill.user_id,
        skill_id: userSkill.skill_id
      });
      
      if (!hasAssessment) {
        pendingWithoutAssessment.push(userSkill);
      }
    }
    
    console.log(`Pending UserSkills: ${pendingUserSkills.length}`);
    console.log(`Pending without Assessment: ${pendingWithoutAssessment.length}`);
    
    if (pendingWithoutAssessment.length > 0) {
      console.log('\n⚠️  UserSkills with pending status but no Assessment record:');
      for (const userSkill of pendingWithoutAssessment.slice(0, 5)) {
        console.log(`   - User: ${userSkill.user_id}, Skill: ${userSkill.skill_id}`);
      }
      if (pendingWithoutAssessment.length > 5) {
        console.log(`   ... and ${pendingWithoutAssessment.length - 5} more`);
      }
    }
    
    console.log('\n✅ Verification completed!');
    
  } catch (error) {
    console.error('❌ Error in verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the verification
if (require.main === module) {
  verifyRetroactiveAssessments();
}

module.exports = { verifyRetroactiveAssessments };