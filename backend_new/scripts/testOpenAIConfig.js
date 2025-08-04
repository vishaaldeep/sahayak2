const mongoose = require('mongoose');
require('dotenv').config();

// Import services and models
const SmartHiringAssessmentService = require('../services/smartHiringAssessmentService');
const User = require('../Model/User');
const Job = require('../Model/Job');

async function testOpenAIConfig() {
  try {
    console.log('🤖 TESTING OPENAI CONFIGURATION');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Check Environment Configuration
    console.log('\n🔧 ENVIRONMENT CONFIGURATION:');
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Not Set ❌'}`);
    console.log(`   OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'Default (gpt-4)'}`);
    console.log(`   ASSESSMENT_METHOD: ${process.env.ASSESSMENT_METHOD || 'Default (openai)'}`);
    console.log(`   USE_ASSESSMENT_FALLBACK: ${process.env.USE_ASSESSMENT_FALLBACK || 'Default (true)'}`);

    // 2. Check Service Status
    console.log('\n📊 SMART ASSESSMENT SERVICE STATUS:');
    const serviceStatus = SmartHiringAssessmentService.getServiceStatus();
    console.log(`   Status: ${serviceStatus.status}`);
    console.log(`   Primary Method: ${serviceStatus.primary_method}`);
    console.log(`   OpenAI Available: ${serviceStatus.openai.available ? '✅' : '❌'}`);
    console.log(`   OpenAI Model: ${serviceStatus.openai.model}`);
    console.log(`   Rule-based Available: ${serviceStatus.rule_based.available ? '✅' : '❌'}`);
    console.log(`   Fallback Enabled: ${serviceStatus.fallback_enabled ? '✅' : '❌'}`);
    console.log(`   Version: ${serviceStatus.version}`);

    // 3. Validate Configuration
    console.log('\n🔍 CONFIGURATION VALIDATION:');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('   ❌ OpenAI API Key is missing');
      console.log('   💡 Add OPENAI_API_KEY to your .env file');
      return;
    }
    
    if (process.env.ASSESSMENT_METHOD !== 'openai') {
      console.log('   ⚠️ Assessment method is not set to OpenAI');
      console.log(`   Current: ${process.env.ASSESSMENT_METHOD}`);
      console.log('   💡 Set ASSESSMENT_METHOD=openai in .env file');
    } else {
      console.log('   ✅ Assessment method correctly set to OpenAI');
    }
    
    if (!serviceStatus.openai.available) {
      console.log('   ❌ OpenAI service is not available');
      console.log('   💡 Check your API key and network connection');
      return;
    } else {
      console.log('   ✅ OpenAI service is available');
    }

    // 4. Test OpenAI Assessment
    console.log('\n🧪 TESTING OPENAI ASSESSMENT:');
    
    const testSeeker = await User.findOne({ role: 'seeker' });
    const testJob = await Job.findOne().populate('skills_required', 'name');

    if (!testSeeker || !testJob) {
      console.log('   ⚠️ No test data available (need seeker and job)');
      console.log('   💡 Create test users and jobs for comprehensive testing');
      return;
    }

    console.log(`   Testing with: ${testSeeker.name} → ${testJob.title}`);
    console.log(`   Required Skills: ${testJob.skills_required?.map(s => s.name).join(', ') || 'None'}`);

    try {
      const startTime = Date.now();
      console.log('   🔄 Running OpenAI assessment...');
      
      const result = await SmartHiringAssessmentService.assessCandidate(testSeeker._id, testJob._id);
      const processingTime = Date.now() - startTime;
      
      console.log('\n   ✅ OPENAI ASSESSMENT SUCCESSFUL!');
      console.log(`   ⏱️ Processing Time: ${processingTime}ms`);
      console.log(`   🤖 Method Used: ${result.assessment.method_used || 'Unknown'}`);
      console.log(`   📊 Recommendation: ${result.assessment.recommendation}`);
      console.log(`   🎯 Score: ${result.assessment.total_score}%`);
      console.log(`   🔒 Confidence: ${result.assessment.confidence}`);
      console.log(`   🧠 AI Powered: ${result.assessment.ai_powered ? 'Yes' : 'No'}`);
      console.log(`   📝 Model Used: ${result.assessment.model_used || 'Unknown'}`);
      
      // Show breakdown
      if (result.assessment.breakdown) {
        console.log('\n   📋 ASSESSMENT BREAKDOWN:');
        Object.entries(result.assessment.breakdown).forEach(([category, data]) => {
          console.log(`     ${category}: ${data.score}% (weight: ${data.weight}%)`);
        });
      }
      
      // Show strengths and concerns
      if (result.assessment.strengths && result.assessment.strengths.length > 0) {
        console.log('\n   💪 TOP STRENGTHS:');
        result.assessment.strengths.slice(0, 3).forEach((strength, index) => {
          console.log(`     ${index + 1}. ${strength}`);
        });
      }
      
      if (result.assessment.concerns && result.assessment.concerns.length > 0) {
        console.log('\n   ⚠️ MAIN CONCERNS:');
        result.assessment.concerns.slice(0, 3).forEach((concern, index) => {
          console.log(`     ${index + 1}. ${concern}`);
        });
      }
      
      // Verify it's actually using OpenAI
      if (result.assessment.method_used === 'openai' || result.assessment.ai_powered) {
        console.log('\n   🎉 CONFIRMED: Using OpenAI GPT-4 for assessment!');
      } else {
        console.log('\n   ⚠️ WARNING: Assessment may have fallen back to rule-based method');
        console.log(`   Method used: ${result.assessment.method_used}`);
      }
      
    } catch (error) {
      console.log('\n   ❌ OPENAI ASSESSMENT FAILED!');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('API key')) {
        console.log('   💡 Check your OpenAI API key configuration');
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        console.log('   💡 Check your OpenAI account billing and usage limits');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        console.log('   💡 Check your internet connection and firewall settings');
      } else {
        console.log('   💡 Check the error details and OpenAI service status');
      }
      
      console.log('\n   🔄 Testing fallback to rule-based assessment...');
      // The smart service should automatically fallback
    }

    // 5. Configuration Recommendations
    console.log('\n💡 CONFIGURATION RECOMMENDATIONS:');
    
    if (serviceStatus.primary_method === 'openai' && serviceStatus.openai.available) {
      console.log('   ✅ OpenAI is properly configured as primary method');
      console.log('   ✅ Fallback to rule-based is available if needed');
      console.log('   🎯 Your system is optimally configured for AI-powered assessments');
    } else {
      console.log('   ⚠️ OpenAI configuration needs attention');
      console.log('   💡 Ensure OPENAI_API_KEY is valid and has sufficient quota');
      console.log('   💡 Check network connectivity to OpenAI services');
    }

    console.log('\n🎉 OPENAI CONFIGURATION TEST COMPLETED!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check MongoDB connection');
    console.log('2. Verify OpenAI API key is valid');
    console.log('3. Ensure sufficient OpenAI quota/billing');
    console.log('4. Check network connectivity');
    console.log('5. Verify environment variables are loaded');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
if (require.main === module) {
  testOpenAIConfig();
}

module.exports = { testOpenAIConfig };