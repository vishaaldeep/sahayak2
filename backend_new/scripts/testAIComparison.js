const mongoose = require('mongoose');
require('dotenv').config();

// Import services
const SmartHiringAssessmentService = require('../services/smartHiringAssessmentService');
const User = require('../Model/User');
const Job = require('../Model/Job');

async function testAIComparison() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find test candidates and jobs
    const seekers = await User.find({ role: 'seeker' }).limit(2);
    const jobs = await Job.find().populate('skills_required', 'name').limit(1);

    if (seekers.length === 0 || jobs.length === 0) {
      console.log('❌ Need at least one seeker and one job to test');
      return;
    }

    console.log(`\n🧪 Testing AI Assessment:`);
    console.log(`   OpenAI Available: ${!!process.env.OPENAI_API_KEY}`);

    // Test each combination
    for (const seeker of seekers) {
      for (const job of jobs) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`👤 Candidate: ${seeker.name}`);
        console.log(`💼 Job: ${job.title}`);
        
        // Test Smart Assessment Service
        console.log(`\n🤖 Running Assessment...`);
        try {
          const result = await SmartHiringAssessmentService.assessCandidate(seeker._id, job._id);
          console.log(`   Method: ${result.assessment.method_used || 'Unknown'}`);
          console.log(`   Recommendation: ${result.assessment.recommendation}`);
          console.log(`   Score: ${result.assessment.total_score}%`);
          console.log(`   Confidence: ${result.assessment.confidence}`);
          
          if (result.assessment.strengths.length > 0) {
            console.log(`   Strength: ${result.assessment.strengths[0]}`);
          }
          if (result.assessment.concerns.length > 0) {
            console.log(`   Concern: ${result.assessment.concerns[0]}`);
          }
        } catch (error) {
          console.log(`   ❌ Assessment Failed: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Test Completed!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testAIComparison();
}

module.exports = { testAIComparison };