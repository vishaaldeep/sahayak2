const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../Model/User');
const Job = require('../Model/Job');
const Skill = require('../Model/Skill');
const UserApplication = require('../Model/UserApplication');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');
const AIAssessment = require('../Model/AIAssessment');
const TestResult = require('../Model/TestResult');

// Import services
const SmartHiringAssessmentService = require('../services/smartHiringAssessmentService');

async function quickTest() {
  const testStartTime = Date.now();
  let testResult = {
    test_name: 'quick_test',
    test_version: '2.0',
    status: 'passed',
    execution_time_ms: 0,
    environment: {},
    data_counts: {},
    service_status: {},
    test_results: {},
    issues_found: [],
    recommendations: [],
    executed_by: 'system',
    notes: ''
  };

  try {
    console.log('🚀 QUICK ASSESSMENT SYSTEM TEST');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Store environment info
    testResult.environment = {
      node_env: process.env.NODE_ENV || 'not set',
      mongodb_connected: true,
      openai_available: !!process.env.OPENAI_API_KEY,
      assessment_method: process.env.ASSESSMENT_METHOD || 'default (openai)',
      fallback_enabled: process.env.USE_ASSESSMENT_FALLBACK !== 'false'
    };

    // 1. Check basic data
    console.log('\n📊 CHECKING BASIC DATA:');
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const skillCount = await Skill.countDocuments();
    const applicationCount = await UserApplication.countDocuments();
    const assessmentCount = await Assessment.countDocuments();
    const questionCount = await AssessmentQuestion.countDocuments();
    const aiAssessmentCount = await AIAssessment.countDocuments();

    console.log(`   Users: ${userCount}`);
    console.log(`   Jobs: ${jobCount}`);
    console.log(`   Skills: ${skillCount}`);
    console.log(`   Applications: ${applicationCount}`);
    console.log(`   Assessments: ${assessmentCount}`);
    console.log(`   Assessment Questions: ${questionCount}`);
    console.log(`   AI Assessments: ${aiAssessmentCount}`);
    
    // Store data counts
    testResult.data_counts = {
      users: userCount,
      jobs: jobCount,
      skills: skillCount,
      applications: applicationCount,
      assessments: assessmentCount,
      assessment_questions: questionCount,
      ai_assessments: aiAssessmentCount
    };
    
    // Check for potential issues
    if (userCount === 0) {
      testResult.issues_found.push({
        type: 'no_users',
        severity: 'high',
        description: 'No users found in database',
        recommendation: 'Create test users or check data migration'
      });
    }
    
    if (jobCount === 0) {
      testResult.issues_found.push({
        type: 'no_jobs',
        severity: 'medium',
        description: 'No jobs found in database',
        recommendation: 'Create test jobs for testing'
      });
    }
    
    if (questionCount === 0) {
      testResult.issues_found.push({
        type: 'no_questions',
        severity: 'high',
        description: 'No assessment questions found',
        recommendation: 'Run question population script'
      });
    }

    // 2. Check assessment service status
    console.log('\n🤖 ASSESSMENT SERVICE STATUS:');
    const serviceStatus = SmartHiringAssessmentService.getServiceStatus();
    console.log(`   Status: ${serviceStatus.status}`);
    console.log(`   Primary Method: ${serviceStatus.primary_method}`);
    console.log(`   OpenAI Available: ${serviceStatus.openai.available}`);
    console.log(`   Rule-based Available: ${serviceStatus.rule_based.available}`);
    console.log(`   Fallback Enabled: ${serviceStatus.fallback_enabled}`);
    console.log(`   Version: ${serviceStatus.version}`);
    
    // Store service status
    testResult.service_status = {
      assessment_service_status: serviceStatus.status,
      primary_method: serviceStatus.primary_method,
      openai_available: serviceStatus.openai.available,
      rule_based_available: serviceStatus.rule_based.available,
      fallback_enabled: serviceStatus.fallback_enabled,
      version: serviceStatus.version
    };
    
    // Check service issues
    if (serviceStatus.status !== 'active') {
      testResult.issues_found.push({
        type: 'service_inactive',
        severity: 'critical',
        description: 'Assessment service is not active',
        recommendation: 'Check service configuration and restart'
      });
    }
    
    if (serviceStatus.primary_method === 'openai' && !serviceStatus.openai.available) {
      testResult.issues_found.push({
        type: 'openai_unavailable',
        severity: 'medium',
        description: 'OpenAI configured as primary but not available',
        recommendation: 'Add OPENAI_API_KEY to environment or switch to rule-based'
      });
    }

    // 3. Check for jobs with assessment required
    console.log('\n📋 JOBS WITH ASSESSMENT REQUIRED:');
    const assessmentJobs = await Job.find({ assessment_required: true })
      .populate('skills_required', 'name')
      .populate('employer_id', 'name')
      .limit(5);

    if (assessmentJobs.length === 0) {
      console.log('   ⚠️ No jobs found with assessment_required = true');
      console.log('   💡 Create a job with assessment_required = true to test');
      testResult.issues_found.push({
        type: 'no_assessment_jobs',
        severity: 'medium',
        description: 'No jobs with assessment_required found',
        recommendation: 'Create jobs with assessment_required = true for testing'
      });
    } else {
      assessmentJobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title}`);
        console.log(`      Skills: ${job.skills_required.map(s => s.name).join(', ')}`);
        console.log(`      Employer: ${job.employer_id?.name || 'Unknown'}`);
      });
    }
    
    // Store jobs with assessment count
    testResult.test_results.jobs_with_assessment = assessmentJobs.length;

    // 4. Check recent applications
    console.log('\n📝 RECENT APPLICATIONS:');
    const recentApplications = await UserApplication.find()
      .populate('seeker_id', 'name')
      .populate('job_id', 'title assessment_required')
      .sort({ createdAt: -1 })
      .limit(5);

    if (recentApplications.length === 0) {
      console.log('   ⚠️ No applications found');
      testResult.issues_found.push({
        type: 'no_applications',
        severity: 'low',
        description: 'No applications found in system',
        recommendation: 'Create test applications for comprehensive testing'
      });
    } else {
      for (const app of recentApplications) {
        console.log(`   📄 ${app.seeker_id?.name || 'Unknown'} → ${app.job_id?.title || 'Unknown Job'}`);
        console.log(`      Status: ${app.status}`);
        console.log(`      Assessment Required: ${app.job_id?.assessment_required ? 'Yes' : 'No'}`);
        
        if (app.job_id?.assessment_required) {
          const hasAssessment = await Assessment.findOne({
            user_id: app.seeker_id._id,
            job_id: app.job_id._id
          });
          console.log(`      Assessment Created: ${hasAssessment ? 'Yes' : 'No'}`);
        }

        const hasAIAssessment = await AIAssessment.findOne({ application_id: app._id });
        console.log(`      AI Assessment: ${hasAIAssessment ? hasAIAssessment.recommendation : 'None'}`);
        console.log('');
      }
    }
    
    // Store recent applications count
    testResult.test_results.recent_applications = recentApplications.length;

    // 5. Test AI assessment if possible
    console.log('\n🧪 TESTING AI ASSESSMENT:');
    const testSeeker = await User.findOne({ role: 'seeker' });
    const testJob = await Job.findOne().populate('skills_required', 'name');

    if (testSeeker && testJob) {
      console.log(`   Testing with: ${testSeeker.name} → ${testJob.title}`);
      
      try {
        const startTime = Date.now();
        const result = await SmartHiringAssessmentService.assessCandidate(testSeeker._id, testJob._id);
        const processingTime = Date.now() - startTime;
        
        console.log(`   ✅ Assessment completed in ${processingTime}ms`);
        console.log(`   Method: ${result.assessment.method_used || 'Unknown'}`);
        console.log(`   Recommendation: ${result.assessment.recommendation}`);
        console.log(`   Score: ${result.assessment.total_score}%`);
        console.log(`   Confidence: ${result.assessment.confidence}`);
        
        // Store AI assessment test results
        testResult.test_results.ai_assessment_test = {
          success: true,
          processing_time_ms: processingTime,
          method_used: result.assessment.method_used || 'Unknown',
          recommendation: result.assessment.recommendation,
          score: result.assessment.total_score,
          confidence: result.assessment.confidence,
          error_message: null
        };
        
      } catch (error) {
        console.log(`   ❌ Assessment failed: ${error.message}`);
        
        testResult.test_results.ai_assessment_test = {
          success: false,
          processing_time_ms: 0,
          method_used: null,
          recommendation: null,
          score: null,
          confidence: null,
          error_message: error.message
        };
        
        testResult.issues_found.push({
          type: 'ai_assessment_failed',
          severity: 'high',
          description: `AI assessment test failed: ${error.message}`,
          recommendation: 'Check assessment service configuration and dependencies'
        });
      }
    } else {
      console.log('   ⚠️ No test data available (need seeker and job)');
      
      testResult.test_results.ai_assessment_test = {
        success: false,
        processing_time_ms: 0,
        method_used: null,
        recommendation: null,
        score: null,
        confidence: null,
        error_message: 'No test data available'
      };
      
      testResult.issues_found.push({
        type: 'no_test_data',
        severity: 'medium',
        description: 'No test data available for AI assessment',
        recommendation: 'Create test users and jobs for comprehensive testing'
      });
    }

    // 6. Environment check
    console.log('\n🔧 ENVIRONMENT CHECK:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'configured' : 'not set'}`);
    console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'configured' : 'not set'}`);
    console.log(`   ASSESSMENT_METHOD: ${process.env.ASSESSMENT_METHOD || 'default (openai)'}`);
    console.log(`   USE_ASSESSMENT_FALLBACK: ${process.env.USE_ASSESSMENT_FALLBACK || 'default (true)'}`);

    // Calculate final test status
    const criticalIssues = testResult.issues_found.filter(issue => issue.severity === 'critical');
    const highIssues = testResult.issues_found.filter(issue => issue.severity === 'high');
    
    if (criticalIssues.length > 0) {
      testResult.status = 'failed';
    } else if (highIssues.length > 0) {
      testResult.status = 'warning';
    }
    
    // Generate recommendations
    if (testResult.issues_found.length === 0) {
      testResult.recommendations.push('System is functioning well, no immediate action required');
    } else {
      testResult.recommendations.push('Address the issues found to improve system reliability');
      if (criticalIssues.length > 0) {
        testResult.recommendations.push('Critical issues found - immediate attention required');
      }
    }
    
    // Calculate execution time
    testResult.execution_time_ms = Date.now() - testStartTime;
    
    // Save test result to database
    try {
      const savedResult = new TestResult(testResult);
      await savedResult.save();
      console.log(`\n💾 Test result saved to database with ID: ${savedResult._id}`);
    } catch (saveError) {
      console.error('\n⚠️ Failed to save test result to database:', saveError.message);
    }
    
    console.log('\n✅ QUICK TEST COMPLETED!');
    console.log(`📊 Test Status: ${testResult.status.toUpperCase()}`);
    console.log(`⏱️ Execution Time: ${testResult.execution_time_ms}ms`);
    console.log(`⚠️ Issues Found: ${testResult.issues_found.length}`);
    
    if (testResult.issues_found.length > 0) {
      console.log('\n🚨 Issues Summary:');
      testResult.issues_found.forEach((issue, index) => {
        console.log(`   ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
        console.log(`      💡 ${issue.recommendation}`);
      });
    } else {
      console.log('🎯 System appears to be working correctly');
    }

  } catch (error) {
    console.error('\n❌ Quick test failed:', error);
    console.log('\n🔧 Check the following:');
    console.log('1. MongoDB connection string');
    console.log('2. Database permissions');
    console.log('3. Required collections exist');
    console.log('4. Environment variables');
    
    // Save failed test result
    testResult.status = 'failed';
    testResult.execution_time_ms = Date.now() - testStartTime;
    testResult.notes = `Test failed with error: ${error.message}`;
    testResult.issues_found.push({
      type: 'test_execution_failed',
      severity: 'critical',
      description: `Test execution failed: ${error.message}`,
      recommendation: 'Check MongoDB connection, environment variables, and system dependencies'
    });
    
    try {
      const savedResult = new TestResult(testResult);
      await savedResult.save();
      console.log(`\n💾 Failed test result saved to database with ID: ${savedResult._id}`);
    } catch (saveError) {
      console.error('\n⚠️ Failed to save test result to database:', saveError.message);
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run quick test
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };