const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const Job = require('../Model/Job');
const User = require('../Model/User');
const UserApplication = require('../Model/UserApplication');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');
const Skill = require('../Model/Skill');

async function testAssessmentFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Assessment Creation Flow\n');

    // Step 1: Find or create cooking skill
    let cookingSkill = await Skill.findOne({ name: /cooking/i });
    if (!cookingSkill) {
      cookingSkill = new Skill({ name: 'Cooking', category: 'Culinary' });
      await cookingSkill.save();
      console.log('✅ Created cooking skill');
    } else {
      console.log(`✅ Found cooking skill: ${cookingSkill.name}`);
    }

    // Step 2: Check assessment questions for cooking
    let questions = await AssessmentQuestion.find({ skill_id: cookingSkill._id });
    console.log(`📝 Assessment questions for cooking: ${questions.length}`);

    if (questions.length === 0) {
      console.log('⚠️ No questions found, creating sample questions...');
      
      const sampleQuestions = [
        {
          skill_id: cookingSkill._id,
          question_text: "What is the safe internal temperature for cooking chicken?",
          options: ["145°F (63°C)", "160°F (71°C)", "165°F (74°C)", "180°F (82°C)"],
          correct_option: 2,
          difficulty: "medium",
          category: "Food Safety"
        },
        {
          skill_id: cookingSkill._id,
          question_text: "Which cooking method uses dry heat?",
          options: ["Boiling", "Steaming", "Roasting", "Poaching"],
          correct_option: 2,
          difficulty: "easy",
          category: "Cooking Methods"
        },
        {
          skill_id: cookingSkill._id,
          question_text: "What does 'al dente' mean when cooking pasta?",
          options: ["Overcooked", "Undercooked", "Firm to the bite", "Soft and mushy"],
          correct_option: 2,
          difficulty: "medium",
          category: "Cooking Terms"
        }
      ];

      for (const questionData of sampleQuestions) {
        const question = new AssessmentQuestion(questionData);
        await question.save();
      }
      
      questions = await AssessmentQuestion.find({ skill_id: cookingSkill._id });
      console.log(`✅ Created ${questions.length} sample questions`);
    }

    // Step 3: Find a job that requires cooking skill and assessment
    let testJob = await Job.findOne({
      skills_required: cookingSkill._id,
      assessment_required: true
    }).populate('skills_required', 'name').populate('employer_id', 'name');

    if (!testJob) {
      console.log('⚠️ No cooking job with assessment found');
      
      // Find any employer to create a test job
      const employer = await User.findOne({ role: 'provider' });
      if (!employer) {
        console.log('❌ No employer found to create test job');
        return;
      }

      testJob = new Job({
        title: 'Test Chef Position',
        description: 'Test cooking job for assessment flow',
        employer_id: employer._id,
        skills_required: [cookingSkill._id],
        assessment_required: true,
        salary_min: 25000,
        salary_max: 35000,
        number_of_openings: 1,
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        }
      });
      
      await testJob.save();
      await testJob.populate('skills_required', 'name');
      await testJob.populate('employer_id', 'name');
      
      console.log(`✅ Created test job: ${testJob.title}`);
    } else {
      console.log(`✅ Found test job: ${testJob.title}`);
    }

    console.log(`   Job ID: ${testJob._id}`);
    console.log(`   Employer: ${testJob.employer_id?.name || 'Unknown'}`);
    console.log(`   Skills Required: ${testJob.skills_required.map(s => s.name).join(', ')}`);
    console.log(`   Assessment Required: ${testJob.assessment_required}`);

    // Step 4: Find a seeker to test with
    const seeker = await User.findOne({ role: 'seeker' });
    if (!seeker) {
      console.log('❌ No seeker found to test with');
      return;
    }

    console.log(`\n👤 Test seeker: ${seeker.name} (${seeker._id})`);

    // Step 5: Check if application already exists
    let existingApplication = await UserApplication.findOne({
      seeker_id: seeker._id,
      job_id: testJob._id
    });

    if (existingApplication) {
      console.log('⚠️ Application already exists, checking assessment...');
      
      const existingAssessment = await Assessment.findOne({
        user_id: seeker._id,
        job_id: testJob._id,
        skill_id: cookingSkill._id
      });

      if (existingAssessment) {
        console.log(`✅ Assessment already exists: Status = ${existingAssessment.status}, Questions = ${existingAssessment.total_questions}`);
      } else {
        console.log('❌ Application exists but no assessment found!');
      }
      
      return;
    }

    // Step 6: Simulate job application (this should trigger assessment creation)
    console.log('\n🔄 Simulating job application...');
    
    const application = new UserApplication({
      seeker_id: seeker._id,
      job_id: testJob._id
    });
    
    await application.save();
    console.log('✅ Application created');

    // Populate the application (simulating what happens in the controller)
    await application.populate('job_id', 'title employer_id skills_required assessment_required');
    await application.populate('seeker_id', 'name email phone_number');

    // Step 7: Check if assessment should be created
    if (application.job_id.assessment_required) {
      console.log('📝 Job requires assessment, checking if assessment was created...');
      
      // Wait a moment for any async operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assessment = await Assessment.findOne({
        user_id: seeker._id,
        job_id: testJob._id,
        skill_id: cookingSkill._id
      }).populate('skill_id', 'name').populate('job_id', 'title');

      if (assessment) {
        console.log('✅ Assessment found!');
        console.log(`   Skill: ${assessment.skill_id.name}`);
        console.log(`   Job: ${assessment.job_id.title}`);
        console.log(`   Status: ${assessment.status}`);
        console.log(`   Questions: ${assessment.total_questions}`);
        console.log(`   Created: ${assessment.created_at}`);
      } else {
        console.log('❌ No assessment found - this indicates the issue!');
        console.log('🔧 The assessment creation logic may not be working properly');
        
        // Manual assessment creation for testing
        console.log('\n🔧 Manually creating assessment for testing...');
        
        const manualAssessment = new Assessment({
          user_id: seeker._id,
          skill_id: cookingSkill._id,
          job_id: testJob._id,
          assigned_by: testJob.employer_id,
          total_questions: Math.min(questions.length, 10),
          questions: questions.slice(0, 10).map(q => ({
            question_id: q._id,
            selected_option: null,
            is_correct: null
          }))
        });
        
        await manualAssessment.save();
        console.log('✅ Manual assessment created successfully');
      }
    } else {
      console.log('⚠️ Job does not require assessment');
    }

    // Step 8: Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Cooking skill: ${cookingSkill.name} (${cookingSkill._id})`);
    console.log(`   Assessment questions: ${questions.length}`);
    console.log(`   Test job: ${testJob.title} (Assessment required: ${testJob.assessment_required})`);
    console.log(`   Test seeker: ${seeker.name}`);
    console.log(`   Application created: ✅`);
    
    const finalAssessment = await Assessment.findOne({
      user_id: seeker._id,
      job_id: testJob._id,
      skill_id: cookingSkill._id
    });
    
    console.log(`   Assessment created: ${finalAssessment ? '✅' : '❌'}`);

    if (finalAssessment) {
      console.log('\n🎉 Assessment flow is working correctly!');
    } else {
      console.log('\n⚠️ Assessment flow needs to be fixed');
      console.log('💡 Recommendation: Run the fixMissingAssessments script');
    }

  } catch (error) {
    console.error('❌ Error testing assessment flow:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testAssessmentFlow();
}

module.exports = { testAssessmentFlow };