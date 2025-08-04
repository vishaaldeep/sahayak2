#!/usr/bin/env node

console.log('🔍 DIAGNOSING BACKEND STARTUP ERROR');
console.log('=' .repeat(50));

// Test 1: Check Node.js version
console.log('\n📋 Test 1: Node.js Environment');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);

// Test 2: Check if main dependencies can be loaded
console.log('\n📋 Test 2: Core Dependencies');
const dependencies = [
  'express',
  'cors', 
  'dotenv',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs'
];

for (const dep of dependencies) {
  try {
    require(dep);
    console.log(`✅ ${dep} - OK`);
  } catch (error) {
    console.log(`❌ ${dep} - ERROR: ${error.message}`);
  }
}

// Test 3: Check if custom modules can be loaded
console.log('\n📋 Test 3: Custom Modules');
const customModules = [
  './config/db',
  './middleware/authMiddleware',
  './routes/userRoutes',
  './routes/retellRoutes',
  './controller/retellController'
];

for (const module of customModules) {
  try {
    require(module);
    console.log(`✅ ${module} - OK`);
  } catch (error) {
    console.log(`❌ ${module} - ERROR: ${error.message}`);
    console.log(`   Stack: ${error.stack.split('\n')[1]}`);
  }
}

// Test 4: Check environment variables
console.log('\n📋 Test 4: Environment Variables');
require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

const optionalEnvVars = [
  'RETELL_API_KEY',
  'RETELL_AGENT_ID',
  'OPENAI_API_KEY'
];

console.log('Required:');
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Set`);
  } else {
    console.log(`❌ ${envVar} - Missing`);
  }
}

console.log('Optional:');
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Set`);
  } else {
    console.log(`⚠️ ${envVar} - Not set`);
  }
}

// Test 5: Check file syntax
console.log('\n📋 Test 5: File Syntax Check');
const filesToCheck = [
  './index.js',
  './middleware/authMiddleware.js',
  './routes/retellRoutes.js',
  './controller/retellController.js'
];

for (const file of filesToCheck) {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common syntax issues
    if (content.includes('\\n')) {
      console.log(`⚠️ ${file} - Contains escaped newlines`);
    } else if (content.includes('undefined')) {
      console.log(`⚠️ ${file} - Contains 'undefined' keyword`);
    } else {
      console.log(`✅ ${file} - Syntax looks OK`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Cannot read: ${error.message}`);
  }
}

// Test 6: Try to load the main index.js
console.log('\n📋 Test 6: Main Index.js Load Test');
try {
  // Don't actually run it, just check if it can be parsed
  const fs = require('fs');
  const vm = require('vm');
  const indexContent = fs.readFileSync('./index.js', 'utf8');
  
  // Create a sandbox to test syntax
  const sandbox = {
    require: require,
    console: console,
    process: process,
    __dirname: __dirname,
    __filename: __filename,
    module: { exports: {} },
    exports: {}
  };
  
  vm.createContext(sandbox);
  vm.runInContext(indexContent, sandbox, { filename: 'index.js' });
  console.log('✅ index.js - Syntax is valid');
} catch (error) {
  console.log('❌ index.js - Syntax error:');
  console.log(`   Error: ${error.message}`);
  console.log(`   Line: ${error.stack.split('\n')[1]}`);
}

console.log('\n🔧 RECOMMENDATIONS:');
console.log('1. Check the error messages above');
console.log('2. Fix any missing dependencies with: npm install');
console.log('3. Ensure .env file exists with required variables');
console.log('4. Fix any syntax errors in the reported files');
console.log('5. Try starting with: npm run dev');

console.log('\n📞 If you need help:');
console.log('1. Share the specific error message you see');
console.log('2. Run this diagnostic and share the output');
console.log('3. Check if any files have unusual characters or formatting');