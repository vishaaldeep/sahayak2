// Simple verification script to check if all imports work
console.log('🔍 Verifying job application setup...\n');

try {
  // Test Model import
  console.log('1. Testing JobApplication model import...');
  const JobApplication = require('./Model/jobApplications');
  console.log('✅ JobApplication model imported successfully');
  console.log('   Model name:', JobApplication.modelName);

  // Test Controller import
  console.log('\n2. Testing jobApplicationController import...');
  const jobApplicationController = require('./controller/jobApplicationController');
  console.log('✅ jobApplicationController imported successfully');
  console.log('   Available methods:', Object.keys(jobApplicationController));

  // Test Routes import
  console.log('\n3. Testing jobApplicationRoutes import...');
  const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
  console.log('✅ jobApplicationRoutes imported successfully');

  // Test other required models
  console.log('\n4. Testing other required models...');
  const Job = require('./Model/jobs');
  const UserSkill = require('./Model/userSkills');
  console.log('✅ Job and UserSkill models imported successfully');

  console.log('\n🎉 All imports successful! The job application system should work now.');
  console.log('\nYou can now start the server with: npm start');

} catch (error) {
  console.error('❌ Error during verification:', error.message);
  console.error('Full error:', error);
}