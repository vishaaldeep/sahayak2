const mongoose = require('mongoose');
require('dotenv').config();

// Import models in proper order
const User = require('../Model/User');
const Skill = require('../Model/Skill');
const Job = require('../Model/Job');
const UserApplication = require('../Model/UserApplication');
const UserSkill = require('../Model/UserSkill');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vishaaldeepsingh6:Hl8YNecl7F9namov@cluster0.2z2jsqt.mongodb.net/sahaayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Verify models are registered
    console.log('📋 Registered models:', Object.keys(mongoose.models));
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Helper function to create Assessment record
async function createAssessmentRecord(userId, skillId, jobId, assignedBy) {
  try {
    // Check if assessment already exists
    const existingAssessment = await Assessment.findOne({
      user_id: userId,
      skill_id: skillId,
      job_id: jobId,
      status: { $in: ['assigned', 'in_progress', 'completed'] }
    });

    if (existingAssessment) {
      console.log(`   ⏭️  Assessment already exists for user: ${userId}, skill: ${skillId}`);
      return { created: false, reason: 'already_exists' };
    }

    // Get skill name for logging
    const skill = await Skill.findById(skillId);
    const skillName = skill ? skill.name : 'Unknown';

    // Get unique random questions for the skill
    const allQuestions = await AssessmentQuestion.find({ skill_id: skillId });
    
    if (allQuestions.length === 0) {
      console.log(`   ⚠️  No questions available for skill: ${skillName} (${skillId})`);
      return { created: false, reason: 'no_questions' };
    }

    // Use available questions (even if less than 50) but ensure uniqueness
    const questionCount = Math.min(allQuestions.length, 50);
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, questionCount);

    // Create assessment
    const assessment = new Assessment({
      user_id: userId,
      skill_id: skillId,
      job_id: jobId,
      assigned_by: assignedBy,
      total_questions: questionCount,
      questions: selectedQuestions.map(q => ({
        question_id: q._id,
        selected_option: null,
        is_correct: null
      }))
    });

    await assessment.save();
    console.log(`   ✅ Created assessment for skill: ${skillName} (${questionCount} questions)`);
    return { created: true, questionCount };
  } catch (error) {
    console.error(`   ❌ Error creating assessment record:`, error.message);
    return { created: false, reason: 'error', error: error.message };
  }
}

// Helper function to update UserSkill assessment status
async function updateUserSkillAssessmentStatus(userId, skillId) {
  try {
    // Find user's skill that matches the job requirement
    let userSkill = await UserSkill.findOne({
      user_id: userId,
      skill_id: skillId
    });

    if (userSkill) {
      // Set assessment status to pending if not already completed
      if (userSkill.assessment_status === 'not_required') {
        userSkill.assessment_status = 'pending';
        await userSkill.save();
        console.log(`   📝 Updated UserSkill assessment status to pending`);
        return { updated: true, action: 'updated_existing' };
      } else {
        console.log(`   ⏭️  UserSkill already has assessment status: ${userSkill.assessment_status}`);
        return { updated: false, reason: 'already_set' };
      }
    } else {
      // Create a new skill entry for the user with pending assessment
      const newUserSkill = new UserSkill({
        user_id: userId,
        skill_id: skillId,
        assessment_status: 'pending',
        experience_years: 0,
        category: ['Job Required']
      });
      await newUserSkill.save();
      console.log(`   ➕ Created new UserSkill with pending assessment`);
      return { updated: true, action: 'created_new' };
    }
  } catch (error) {
    console.error(`   ❌ Error updating UserSkill:`, error.message);
    return { updated: false, reason: 'error', error: error.message };
  }
}

// Main function to create retroactive assessments
async function createRetroactiveAssessments() {
  try {
    await connectDB();
    
    console.log('🔄 Creating Retroactive Assessments for Existing Jobs and Employees...\n');
    
    // Step 1: Find all jobs with assessment_required: true
    console.log('1️⃣ Finding jobs with assessment_required: true...');
    
    try {
      const assessmentJobs = await Job.find({ 
        assessment_required: true,
        skills_required: { $exists: true, $ne: [] }
      }).populate('skills_required', 'name');
      
      console.log(`   Found ${assessmentJobs.length} jobs requiring assessments\n`);
      
      if (assessmentJobs.length === 0) {
        console.log('ℹ️  No jobs found with assessment_required: true');
        return;
      }
    } catch (error) {
      console.error('❌ Error finding jobs:', error);
      throw error;
    }
    
    console.log(`   Found ${assessmentJobs.length} jobs requiring assessments\n`);
    
    if (assessmentJobs.length === 0) {
      console.log('ℹ️  No jobs found with assessment_required: true');
      return;
    }
    
    let totalProcessed = 0;
    let totalAssessmentsCreated = 0;
    let totalUserSkillsUpdated = 0;
    let totalErrors = 0;
    
    // Step 2: Process each job
    for (const job of assessmentJobs) {
      console.log(`📋 Processing Job: "${job.title}" (${job._id})`);
      console.log(`   Required Skills: ${job.skills_required.map(s => s.name).join(', ')}`);
      
      // Find all hired applications for this job
      const hiredApplications = await UserApplication.find({
        job_id: job._id,
        status: 'hired'
      }).populate('seeker_id', 'name email');
      
      console.log(`   Found ${hiredApplications.length} hired employees`);
      
      if (hiredApplications.length === 0) {
        console.log(`   ⏭️  No hired employees for this job\n`);
        continue;
      }
      
      // Process each hired employee
      for (const application of hiredApplications) {
        const employee = application.seeker_id;
        console.log(`\n   👤 Processing Employee: ${employee.name} (${employee._id})`);
        
        // Process each required skill
        for (const skill of job.skills_required) {
          console.log(`\n      🎯 Processing Skill: ${skill.name} (${skill._id})`);
          
          // Update UserSkill assessment status
          const userSkillResult = await updateUserSkillAssessmentStatus(
            employee._id, 
            skill._id
          );
          
          if (userSkillResult.updated) {
            totalUserSkillsUpdated++;
          }
          
          // Create Assessment record
          const assessmentResult = await createAssessmentRecord(
            employee._id,
            skill._id,
            job._id,
            job.employer_id
          );
          
          if (assessmentResult.created) {
            totalAssessmentsCreated++;
          } else if (assessmentResult.reason === 'error') {
            totalErrors++;
          }
          
          totalProcessed++;
        }
      }
      
      console.log(`\n   ✅ Completed processing job: "${job.title}"\n`);
    }
    
    // Step 3: Summary
    console.log('📊 SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`Jobs Processed: ${assessmentJobs.length}`);
    console.log(`Total Skill-Employee Combinations: ${totalProcessed}`);
    console.log(`Assessments Created: ${totalAssessmentsCreated}`);
    console.log(`UserSkills Updated: ${totalUserSkillsUpdated}`);
    console.log(`Errors Encountered: ${totalErrors}`);
    
    if (totalAssessmentsCreated > 0) {
      console.log('\n🎉 Retroactive assessment creation completed successfully!');
      console.log('   Employees can now see and take their required assessments.');
    } else {
      console.log('\n💡 No new assessments were created.');
      console.log('   This could mean:');
      console.log('   - All assessments already exist');
      console.log('   - No questions available for required skills');
      console.log('   - No employees have been hired for assessment-required jobs');
    }
    
    // Step 4: Recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    
    // Check for skills without questions
    const skillsWithoutQuestions = [];
    for (const job of assessmentJobs) {
      for (const skill of job.skills_required) {
        const questionCount = await AssessmentQuestion.countDocuments({ skill_id: skill._id });
        if (questionCount === 0) {
          skillsWithoutQuestions.push(skill.name);
        }
      }
    }
    
    if (skillsWithoutQuestions.length > 0) {
      console.log('⚠️  Skills without questions (run populate-questions):');
      skillsWithoutQuestions.forEach(skillName => {
        console.log(`   - ${skillName}`);
      });
      console.log('   Run: npm run populate-questions');
    }
    
    console.log('\n✅ Script completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in retroactive assessment creation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Dry run function to preview what would be created
async function dryRunRetroactiveAssessments() {
  try {
    await connectDB();
    
    console.log('🔍 DRY RUN: Preview of Retroactive Assessment Creation...\n');
    
    const assessmentJobs = await Job.find({ 
      assessment_required: true,
      skills_required: { $exists: true, $ne: [] }
    }).populate('skills_required', 'name');
    
    console.log(`Found ${assessmentJobs.length} jobs requiring assessments:\n`);
    
    let totalWouldProcess = 0;
    let totalWouldCreate = 0;
    
    for (const job of assessmentJobs) {
      console.log(`📋 Job: "${job.title}"`);
      console.log(`   Skills: ${job.skills_required.map(s => s.name).join(', ')}`);
      
      const hiredApplications = await UserApplication.find({
        job_id: job._id,
        status: 'hired'
      }).populate('seeker_id', 'name');
      
      console.log(`   Hired Employees: ${hiredApplications.length}`);
      
      for (const application of hiredApplications) {
        console.log(`   - ${application.seeker_id.name}`);
        
        for (const skill of job.skills_required) {
          const existingAssessment = await Assessment.findOne({
            user_id: application.seeker_id._id,
            skill_id: skill._id,
            job_id: job._id
          });
          
          const questionCount = await AssessmentQuestion.countDocuments({ skill_id: skill._id });
          
          if (!existingAssessment && questionCount > 0) {
            console.log(`     ➕ Would create assessment for: ${skill.name}`);
            totalWouldCreate++;
          } else if (!existingAssessment && questionCount === 0) {
            console.log(`     ⚠️  Cannot create assessment for: ${skill.name} (no questions)`);
          } else {
            console.log(`     ⏭️  Assessment exists for: ${skill.name}`);
          }
          
          totalWouldProcess++;
        }
      }
      console.log('');
    }
    
    console.log('📊 DRY RUN SUMMARY:');
    console.log(`Would process: ${totalWouldProcess} skill-employee combinations`);
    console.log(`Would create: ${totalWouldCreate} new assessments`);
    console.log('\nTo execute the actual creation, run without --dry-run flag');
    
  } catch (error) {
    console.error('❌ Error in dry run:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Command line interface
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

if (require.main === module) {
  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode...\n');
    dryRunRetroactiveAssessments();
  } else {
    createRetroactiveAssessments();
  }
}

module.exports = { 
  createRetroactiveAssessments, 
  dryRunRetroactiveAssessments 
};