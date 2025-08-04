const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Job = require('../Model/Job');
const UserApplication = require('../Model/UserApplication');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');
const UserSkill = require('../Model/UserSkill');
const NotificationService = require('../services/notificationService');

async function fixMissingAssessments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all jobs that require assessment
    const assessmentJobs = await Job.find({ assessment_required: true })
      .populate('skills_required', 'name')
      .populate('employer_id', 'name');

    console.log(`🔍 Found ${assessmentJobs.length} jobs that require assessment`);

    let fixedCount = 0;
    let totalApplications = 0;

    for (const job of assessmentJobs) {
      console.log(`\n📋 Checking job: ${job.title} (${job._id})`);
      console.log(`   Required skills: ${job.skills_required.map(s => s.name).join(', ')}`);
      console.log(`   Employer: ${job.employer_id?.name || 'Unknown'}`);

      // Find all applications for this job
      const applications = await UserApplication.find({ job_id: job._id })
        .populate('seeker_id', 'name email');

      console.log(`   Applications: ${applications.length}`);
      totalApplications += applications.length;

      for (const application of applications) {
        console.log(`\n     👤 Checking application: ${application.seeker_id.name}`);

        // Check each required skill
        for (const skill of job.skills_required) {
          // Check if assessment already exists
          const existingAssessment = await Assessment.findOne({
            user_id: application.seeker_id._id,
            skill_id: skill._id,
            job_id: job._id
          });

          if (existingAssessment) {
            console.log(`       ✅ Assessment already exists for ${skill.name} (Status: ${existingAssessment.status})`);
            continue;
          }

          // Check if there are questions for this skill
          const questions = await AssessmentQuestion.find({ skill_id: skill._id });
          if (questions.length === 0) {
            console.log(`       ⚠️ No questions available for ${skill.name}, skipping assessment creation`);
            continue;
          }

          console.log(`       🔧 Creating missing assessment for ${skill.name}...`);

          try {
            // Create or update UserSkill
            let userSkill = await UserSkill.findOne({
              user_id: application.seeker_id._id,
              skill_id: skill._id
            });

            if (userSkill) {
              userSkill.assessment_status = 'pending';
              await userSkill.save();
            } else {
              userSkill = new UserSkill({
                user_id: application.seeker_id._id,
                skill_id: skill._id,
                assessment_status: 'pending',
                experience_years: 0,
                category: ['Job Required']
              });
              await userSkill.save();
            }

            // Create assessment
            const questionCount = Math.min(questions.length, 20); // Limit to 20 questions
            const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffledQuestions.slice(0, questionCount);

            const assessment = new Assessment({
              user_id: application.seeker_id._id,
              skill_id: skill._id,
              job_id: job._id,
              assigned_by: job.employer_id,
              total_questions: questionCount,
              questions: selectedQuestions.map(q => ({
                question_id: q._id,
                selected_option: null,
                is_correct: null
              }))
            });

            await assessment.save();
            console.log(`       ✅ Created assessment for ${skill.name} (${questionCount} questions)`);

            // Send notification to seeker
            try {
              await assessment.populate('skill_id', 'name');
              await assessment.populate('job_id', 'title');
              await NotificationService.notifyAssessmentAssigned(application.seeker_id._id, assessment);
              console.log(`       📧 Notification sent to ${application.seeker_id.name}`);
            } catch (notificationError) {
              console.error(`       ❌ Failed to send notification:`, notificationError.message);
            }

            fixedCount++;

          } catch (error) {
            console.error(`       ❌ Failed to create assessment for ${skill.name}:`, error.message);
          }
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total jobs with assessment required: ${assessmentJobs.length}`);
    console.log(`   Total applications checked: ${totalApplications}`);
    console.log(`   Missing assessments created: ${fixedCount}`);

    if (fixedCount > 0) {
      console.log(`\n✅ Successfully fixed ${fixedCount} missing assessments!`);
      console.log(`📧 Notifications sent to affected seekers`);
    } else {
      console.log(`\n✅ No missing assessments found - all applications have proper assessments`);
    }

  } catch (error) {
    console.error('❌ Error fixing missing assessments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
if (require.main === module) {
  fixMissingAssessments();
}

module.exports = { fixMissingAssessments };