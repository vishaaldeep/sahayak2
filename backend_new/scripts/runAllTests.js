const mongoose = require('mongoose');
require('dotenv').config();

// Import all test scripts
const { checkAssessmentIssue } = require('./checkAssessmentIssue');
const { fixMissingAssessments } = require('./fixMissingAssessments');
const { testAssessmentFlow } = require('./testAssessmentFlow');
const { testAIComparison } = require('./testAIComparison');

async function runAllTests() {
  console.log('🧪 SAHAYAK ASSESSMENT SYSTEM - COMPREHENSIVE TEST SUITE');
  console.log('=' .repeat(80));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection: ${mongoose.connection.host}:${mongoose.connection.port}`);

    // Test 1: Check Assessment Issue
    console.log('\n' + '='.repeat(80));
    console.log('🔍 TEST 1: ASSESSMENT ISSUE DIAGNOSIS');
    console.log('='.repeat(80));
    await checkAssessmentIssue();

    // Test 2: Fix Missing Assessments
    console.log('\n' + '='.repeat(80));
    console.log('🔧 TEST 2: FIX MISSING ASSESSMENTS');
    console.log('='.repeat(80));
    await fixMissingAssessments();

    // Test 3: Test Assessment Flow
    console.log('\n' + '='.repeat(80));
    console.log('🔄 TEST 3: ASSESSMENT FLOW TEST');
    console.log('='.repeat(80));
    await testAssessmentFlow();

    // Test 4: AI Comparison Test
    console.log('\n' + '='.repeat(80));
    console.log('🤖 TEST 4: AI ASSESSMENT COMPARISON');
    console.log('='.repeat(80));
    await testAIComparison();

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 FINAL TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ All tests completed successfully!');
    console.log('📊 Check the output above for detailed results');
    console.log('🎯 Assessment system is ready for use');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check MongoDB connection');
    console.log('2. Verify environment variables');
    console.log('3. Ensure required collections exist');
    console.log('4. Check for missing dependencies');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('🏁 Test suite execution completed');
  }
}

// Run all tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };