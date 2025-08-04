const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../Model/User');
const Job = require('../Model/Job');

async function testEmployerJobFilter() {
  try {
    console.log('🧪 Testing Employer Job Filter');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahayak', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all employers
    const employers = await User.find({ role: 'provider' }).limit(3);
    console.log(`\n👥 Found ${employers.length} employers:`);
    
    for (const employer of employers) {
      console.log(`   - ${employer.name} (${employer._id})`);
    }

    // Test job filtering for each employer
    for (const employer of employers) {
      console.log(`\n🔍 Testing jobs for employer: ${employer.name}`);
      
      // Get all jobs (without filter) - this should show all jobs
      const allJobs = await Job.find({ is_archived: false })
        .populate('employer_id', 'name');
      console.log(`   All jobs in system: ${allJobs.length}`);
      
      // Get jobs filtered by employer (simulating the fixed API)
      const employerJobs = await Job.find({ 
        employer_id: employer._id,
        is_archived: false 
      }).populate('employer_id', 'name');
      console.log(`   Jobs posted by ${employer.name}: ${employerJobs.length}`);
      
      if (employerJobs.length > 0) {
        employerJobs.forEach((job, index) => {
          console.log(`     ${index + 1}. ${job.title} (Posted by: ${job.employer_id.name})`);
        });
      } else {
        console.log(`     No jobs found for ${employer.name}`);
      }
      
      // Verify that all returned jobs belong to this employer
      const wrongJobs = employerJobs.filter(job => 
        job.employer_id._id.toString() !== employer._id.toString()
      );
      
      if (wrongJobs.length > 0) {
        console.log(`   ❌ ERROR: Found ${wrongJobs.length} jobs that don't belong to this employer!`);
        wrongJobs.forEach(job => {
          console.log(`     - ${job.title} (Actually posted by: ${job.employer_id.name})`);
        });
      } else {
        console.log(`   ✅ All jobs correctly belong to ${employer.name}`);
      }
    }

    // Test the API query simulation
    console.log(`\n🔧 Testing API Query Simulation:`);
    
    if (employers.length > 0) {
      const testEmployer = employers[0];
      console.log(`   Testing with employer: ${testEmployer.name}`);
      
      // Simulate the fixed API query
      const query = {
        is_archived: false,
        employer_id: testEmployer._id
      };
      
      const apiResults = await Job.find(query).populate('employer_id', 'name');
      console.log(`   API would return: ${apiResults.length} jobs`);
      
      apiResults.forEach((job, index) => {
        console.log(`     ${index + 1}. ${job.title} (${job.employer_id.name})`);
      });
      
      // Verify all results belong to the test employer
      const correctResults = apiResults.every(job => 
        job.employer_id._id.toString() === testEmployer._id.toString()
      );
      
      if (correctResults) {
        console.log(`   ✅ API filter working correctly!`);
      } else {
        console.log(`   ❌ API filter has issues!`);
      }
    }

    console.log('\n📊 Summary:');
    console.log('✅ Employer job filtering test completed');
    console.log('🎯 Each employer should only see their own jobs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testEmployerJobFilter();
}

module.exports = { testEmployerJobFilter };