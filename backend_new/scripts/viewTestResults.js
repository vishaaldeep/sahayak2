const mongoose = require('mongoose');
require('dotenv').config();

const TestResult = require('../Model/TestResult');

async function viewTestResults() {
  try {
    console.log('📊 TEST RESULTS VIEWER');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'recent';
    const limit = parseInt(args[1]) || 10;

    switch (command) {
      case 'recent':
        await showRecentResults(limit);
        break;
      case 'summary':
        await showSummary();
        break;
      case 'failed':
        await showFailedTests(limit);
        break;
      case 'stats':
        await showStats();
        break;
      case 'cleanup':
        await cleanupOldResults();
        break;
      default:
        showUsage();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

async function showRecentResults(limit) {
  console.log(`\n📋 Recent ${limit} Test Results:`);
  
  const results = await TestResult.find()
    .sort({ executed_at: -1 })
    .limit(limit);

  if (results.length === 0) {
    console.log('   No test results found');
    return;
  }

  results.forEach((result, index) => {
    const statusIcon = getStatusIcon(result.status);
    const timeAgo = getTimeAgo(result.executed_at);
    
    console.log(`\n${index + 1}. ${statusIcon} ${result.test_name} v${result.test_version}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    console.log(`   Executed: ${timeAgo}`);
    console.log(`   Duration: ${result.execution_time_ms}ms`);
    console.log(`   Issues: ${result.issues_found.length}`);
    
    if (result.issues_found.length > 0) {
      const criticalCount = result.issues_found.filter(i => i.severity === 'critical').length;
      const highCount = result.issues_found.filter(i => i.severity === 'high').length;
      if (criticalCount > 0) console.log(`   🚨 Critical: ${criticalCount}`);
      if (highCount > 0) console.log(`   ⚠️ High: ${highCount}`);
    }
    
    if (result.data_counts) {
      console.log(`   Data: ${result.data_counts.users} users, ${result.data_counts.jobs} jobs, ${result.data_counts.applications} apps`);
    }
  });
}

async function showSummary() {
  console.log('\n📈 Test Results Summary:');
  
  const totalTests = await TestResult.countDocuments();
  const passedTests = await TestResult.countDocuments({ status: 'passed' });
  const failedTests = await TestResult.countDocuments({ status: 'failed' });
  const warningTests = await TestResult.countDocuments({ status: 'warning' });
  
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`   ⚠️ Warnings: ${warningTests} (${((warningTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`   ❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  
  // Recent trend
  const recentTests = await TestResult.find()
    .sort({ executed_at: -1 })
    .limit(10);
    
  if (recentTests.length > 0) {
    const recentPassed = recentTests.filter(t => t.status === 'passed').length;
    console.log(`\n📊 Recent Trend (last 10 tests):`);
    console.log(`   Success Rate: ${((recentPassed/recentTests.length)*100).toFixed(1)}%`);
  }
}

async function showFailedTests(limit) {
  console.log(`\n❌ Recent ${limit} Failed Tests:`);
  
  const failedResults = await TestResult.find({ status: 'failed' })
    .sort({ executed_at: -1 })
    .limit(limit);

  if (failedResults.length === 0) {
    console.log('   No failed tests found! 🎉');
    return;
  }

  failedResults.forEach((result, index) => {
    const timeAgo = getTimeAgo(result.executed_at);
    
    console.log(`\n${index + 1}. ${result.test_name} v${result.test_version}`);
    console.log(`   Failed: ${timeAgo}`);
    console.log(`   Duration: ${result.execution_time_ms}ms`);
    
    if (result.notes) {
      console.log(`   Notes: ${result.notes}`);
    }
    
    console.log(`   Issues (${result.issues_found.length}):`);
    result.issues_found.forEach((issue, idx) => {
      console.log(`     ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
    });
  });
}

async function showStats() {
  console.log('\n📊 Detailed Statistics:');
  
  // Test execution stats
  const avgExecutionTime = await TestResult.aggregate([
    { $group: { _id: null, avgTime: { $avg: '$execution_time_ms' } } }
  ]);
  
  if (avgExecutionTime.length > 0) {
    console.log(`   Average Execution Time: ${Math.round(avgExecutionTime[0].avgTime)}ms`);
  }
  
  // Most common issues
  const issueStats = await TestResult.aggregate([
    { $unwind: '$issues_found' },
    { $group: { _id: '$issues_found.type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  if (issueStats.length > 0) {
    console.log('\n🔍 Most Common Issues:');
    issueStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat._id}: ${stat.count} occurrences`);
    });
  }
  
  // Test frequency
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const testsToday = await TestResult.countDocuments({ 
    executed_at: { $gte: yesterday } 
  });
  
  console.log(`\n📅 Tests in last 24 hours: ${testsToday}`);
}

async function cleanupOldResults() {
  console.log('\n🧹 Cleaning up old test results...');
  
  // Keep only last 100 results
  const totalCount = await TestResult.countDocuments();
  
  if (totalCount <= 100) {
    console.log(`   Only ${totalCount} results found, no cleanup needed`);
    return;
  }
  
  const keepResults = await TestResult.find()
    .sort({ executed_at: -1 })
    .limit(100)
    .select('_id');
    
  const keepIds = keepResults.map(r => r._id);
  
  const deleteResult = await TestResult.deleteMany({
    _id: { $nin: keepIds }
  });
  
  console.log(`   Deleted ${deleteResult.deletedCount} old test results`);
  console.log(`   Kept most recent 100 results`);
}

function showUsage() {
  console.log('\n📖 Usage:');
  console.log('   node scripts/viewTestResults.js [command] [limit]');
  console.log('\n   Commands:');
  console.log('     recent [limit]  - Show recent test results (default: 10)');
  console.log('     summary         - Show test results summary');
  console.log('     failed [limit]  - Show recent failed tests (default: 10)');
  console.log('     stats           - Show detailed statistics');
  console.log('     cleanup         - Clean up old test results (keep last 100)');
  console.log('\n   Examples:');
  console.log('     npm run view-tests');
  console.log('     npm run view-tests recent 20');
  console.log('     npm run view-tests failed 5');
  console.log('     npm run view-tests summary');
}

function getStatusIcon(status) {
  switch (status) {
    case 'passed': return '✅';
    case 'warning': return '⚠️';
    case 'failed': return '❌';
    default: return '❓';
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Run the viewer
if (require.main === module) {
  viewTestResults();
}

module.exports = { viewTestResults };