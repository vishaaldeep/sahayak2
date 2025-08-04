const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Job = require('../Model/Job');
const Skill = require('../Model/Skill');
const AssessmentQuestion = require('../Model/AssessmentQuestion');
const Assessment = require('../Model/Assessment');
const UserApplication = require('../Model/UserApplication');

async function checkAssessmentIssue() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find cooking skill jobs with assessment required
    const cookingSkill = await Skill.findOne({ name: /cooking/i });
    if (!cookingSkill) {
      console.log('❌ No cooking skill found in database');
      return;
    }
    
    console.log(`🍳 Found cooking skill: ${cookingSkill.name} (${cookingSkill._id})`);

    // Find jobs that require cooking skill and have assessment_required = true
    const cookingJobs = await Job.find({
      skills_required: cookingSkill._id,
      assessment_required: true
    }).populate('skills_required', 'name').populate('employer_id', 'name');

    console.log(`\n📋 Found ${cookingJobs.length} cooking jobs with assessment required:`);
    
    for (const job of cookingJobs) {
      console.log(`\n   Job: ${job.title}`);
      console.log(`   Employer: ${job.employer_id?.name || 'Unknown'}`);
      console.log(`   Skills Required: ${job.skills_required.map(s => s.name).join(', ')}`);
      console.log(`   Assessment Required: ${job.assessment_required}`);
      
      // Check applications for this job
      const applications = await UserApplication.find({ job_id: job._id })
        .populate('seeker_id', 'name email');
      
      console.log(`   Applications: ${applications.length}`);
      
      for (const app of applications) {
        console.log(`     - ${app.seeker_id.name} (${app.seeker_id.email}) - Status: ${app.status}`);
        
        // Check if assessment exists for this application
        const assessments = await Assessment.find({
          user_id: app.seeker_id._id,
          job_id: job._id,
          skill_id: cookingSkill._id
        });
        
        console.log(`       Assessments: ${assessments.length}`);
        if (assessments.length > 0) {
          assessments.forEach(assessment => {
            console.log(`         - Status: ${assessment.status}, Questions: ${assessment.total_questions}`);
          });
        }
      }
    }

    // Check if there are assessment questions for cooking skill
    const cookingQuestions = await AssessmentQuestion.find({ skill_id: cookingSkill._id });
    console.log(`\n❓ Assessment questions for cooking skill: ${cookingQuestions.length}`);
    
    if (cookingQuestions.length === 0) {
      console.log('⚠️ NO ASSESSMENT QUESTIONS FOUND FOR COOKING SKILL!');
      console.log('This is likely why assessments are not being created.');
      
      // Create some sample cooking questions
      console.log('\n🔧 Creating sample cooking assessment questions...');
      
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
          question_text: "What is the French term for 'mise en place'?",
          options: ["Everything in its place", "Cooking technique", "Sauce preparation", "Knife skills"],
          correct_option: 0,
          difficulty: "medium",
          category: "Culinary Terms"
        },
        {
          skill_id: cookingSkill._id,
          question_text: "Which spice is known as the 'king of spices'?",
          options: ["Cinnamon", "Cardamom", "Black Pepper", "Saffron"],
          correct_option: 2,
          difficulty: "easy",
          category: "Spices and Seasonings"
        },
        {
          skill_id: cookingSkill._id,
          question_text: "What is the ideal temperature for deep frying?",
          options: ["300°F (150°C)", "350°F (175°C)", "400°F (200°C)", "450°F (230°C)"],
          correct_option: 1,
          difficulty: "medium",
          category: "Cooking Techniques"
        }
      ];
      
      for (const questionData of sampleQuestions) {
        const question = new AssessmentQuestion(questionData);
        await question.save();
      }
      
      console.log(`✅ Created ${sampleQuestions.length} sample cooking questions`);
    } else {
      console.log('✅ Assessment questions exist for cooking skill');
      console.log('Sample questions:');
      cookingQuestions.slice(0, 3).forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.question_text}`);
      });
    }

    console.log('\n🔍 Assessment creation logic check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
if (require.main === module) {
  checkAssessmentIssue();
}

module.exports = { checkAssessmentIssue };