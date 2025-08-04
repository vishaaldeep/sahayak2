const mongoose = require('mongoose');
require('dotenv').config();

// Import models and services
const User = require('../Model/User');
const Job = require('../Model/Job');
const UserApplication = require('../Model/UserApplication');
const AIHiringAssessmentService = require('../services/aiHiringAssessmentService');

async function testAIAssessment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find a seeker and a job for testing
    const seeker = await User.findOne({ role: 'seeker' });
    const job = await Job.findOne().populate('skills_required', 'name');

    if (!seeker || !job) {
      console.log('❌ Need at least one seeker and one job to test AI assessment');
      return;
    }

    console.log(`\n🧪 Testing AI Assessment:`);
    console.log(`   Candidate: ${seeker.name} (${seeker._id})`);
    console.log(`   Job: ${job.title} (${job._id})`);
    console.log(`   Required Skills: ${job.skills_required.map(s => s.name).join(', ')}`);

    // Run AI assessment
    console.log(`\n🤖 Running AI Assessment...`);
    const startTime = Date.now();
    
    const assessment = await AIHiringAssessmentService.assessCandidate(seeker._id, job._id);
    
    const processingTime = Date.now() - startTime;

    // Display results
    console.log(`\n📊 AI Assessment Results (${processingTime}ms):`);
    console.log('=' .repeat(60));
    
    console.log(`\n🎯 OVERALL RECOMMENDATION: ${assessment.assessment.recommendation}`);
    console.log(`📈 Total Score: ${assessment.assessment.total_score}%`);
    console.log(`🔍 Confidence: ${assessment.assessment.confidence}`);

    console.log(`\n📋 DETAILED BREAKDOWN:`);
    Object.entries(assessment.assessment.breakdown).forEach(([category, data]) => {
      console.log(`\n   ${category.toUpperCase()}:`);
      console.log(`   Score: ${data.score}% (Weight: ${data.weight}%)`);
      if (data.details) {
        Object.entries(data.details).forEach(([key, value]) => {
          if (typeof value === 'object' && Array.isArray(value)) {
            console.log(`   ${key}: [${value.join(', ')}]`);
          } else {
            console.log(`   ${key}: ${value}`);
          }
        });
      }
    });

    console.log(`\n💪 STRENGTHS:`);
    assessment.assessment.strengths.forEach((strength, index) => {
      console.log(`   ${index + 1}. ${strength}`);
    });

    console.log(`\n⚠️  CONCERNS:`);
    if (assessment.assessment.concerns.length > 0) {
      assessment.assessment.concerns.forEach((concern, index) => {
        console.log(`   ${index + 1}. ${concern}`);
      });
    } else {
      console.log(`   None identified`);
    }

    console.log(`\n💡 RECOMMENDATIONS:`);
    assessment.assessment.recommendations.forEach((recommendation, index) => {
      console.log(`   ${index + 1}. ${recommendation}`);
    });

    // Test multiple candidates if available
    const otherSeekers = await User.find({ role: 'seeker', _id: { $ne: seeker._id } }).limit(2);
    
    if (otherSeekers.length > 0) {
      console.log(`\n🔄 Comparing with other candidates:`);
      
      for (const otherSeeker of otherSeekers) {
        try {
          const otherAssessment = await AIHiringAssessmentService.assessCandidate(otherSeeker._id, job._id);
          console.log(`   ${otherSeeker.name}: ${otherAssessment.assessment.recommendation} (${otherAssessment.assessment.total_score}%)`);
        } catch (error) {
          console.log(`   ${otherSeeker.name}: Assessment failed - ${error.message}`);
        }
      }
    }

    console.log(`\n✅ AI Assessment Test Completed Successfully!`);

  } catch (error) {
    console.error('❌ Error in AI assessment test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testAIAssessment();
}

module.exports = { testAIAssessment };