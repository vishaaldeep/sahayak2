const fs = require('fs');
const path = require('path');

function checkCreditScoreImports() {
  console.log('🔍 CHECKING CREDITSCORE MODEL IMPORTS');
  console.log('=' .repeat(50));

  const issues = [];
  const correctImports = [];

  // Function to recursively search for files
  function searchFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
        searchFiles(filePath, fileList);
      } else if (file.endsWith('.js')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  // Get all JS files
  const jsFiles = searchFiles('backend_new');

  console.log(`📁 Scanning ${jsFiles.length} JavaScript files...\\n`);

  jsFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\\n');
      
      lines.forEach((line, index) => {
        // Check for CreditScore imports
        if (line.includes('require(') && line.includes('creditScore')) {
          const lineNumber = index + 1;
          const relativePath = path.relative('backend_new', filePath);
          
          // Check for different variations
          if (line.includes("require('../Model/creditScore')")) {
            correctImports.push({
              file: relativePath,
              line: lineNumber,
              content: line.trim()
            });
          } else if (line.includes("require('../Model/CreditScore')")) {
            issues.push({
              file: relativePath,
              line: lineNumber,
              content: line.trim(),
              issue: 'Incorrect case: should be creditScore.js not CreditScore.js',
              fix: line.replace("require('../Model/CreditScore')", "require('../Model/creditScore')")
            });
          } else if (line.includes('creditScore') || line.includes('CreditScore')) {
            // Check for other potential issues
            if (line.includes('Model/') && !line.includes('creditScore.js')) {
              issues.push({
                file: relativePath,
                line: lineNumber,
                content: line.trim(),
                issue: 'Potential import path issue',
                fix: 'Check if this should reference creditScore.js'
              });
            }
          }
        }
      });
    } catch (error) {
      console.log(`⚠️ Error reading file ${filePath}: ${error.message}`);
    }
  });

  // Report findings
  console.log('📊 SCAN RESULTS:');
  console.log(`✅ Correct imports found: ${correctImports.length}`);
  console.log(`❌ Issues found: ${issues.length}\\n`);

  if (correctImports.length > 0) {
    console.log('✅ CORRECT IMPORTS:');
    correctImports.forEach(item => {
      console.log(`   📄 ${item.file}:${item.line}`);
      console.log(`      ${item.content}`);
    });
    console.log('');
  }

  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:');
    issues.forEach((item, index) => {
      console.log(`   ${index + 1}. 📄 ${item.file}:${item.line}`);
      console.log(`      Current: ${item.content}`);
      console.log(`      Issue: ${item.issue}`);
      console.log(`      Fix: ${item.fix}`);
      console.log('');
    });
  } else {
    console.log('🎉 No import issues found!');
  }

  // Check if the model file exists with correct name
  const modelPath = path.join('backend_new', 'Model', 'creditScore.js');
  if (fs.existsSync(modelPath)) {
    console.log('✅ Model file exists: backend_new/Model/creditScore.js');
  } else {
    console.log('❌ Model file missing: backend_new/Model/creditScore.js');
  }

  // Check for incorrect case variations
  const incorrectCasePath = path.join('backend_new', 'Model', 'CreditScore.js');
  if (fs.existsSync(incorrectCasePath)) {
    console.log('⚠️ Found file with incorrect case: backend_new/Model/CreditScore.js');
    console.log('   This should be renamed to creditScore.js');
  }

  console.log('\\n🔧 RECOMMENDATIONS:');
  if (issues.length > 0) {
    console.log('1. Fix the import paths shown above');
    console.log('2. Ensure all imports use: require(\\'../Model/creditScore\\')');
    console.log('3. The model file should be named creditScore.js (camelCase)');
  } else {
    console.log('1. All CreditScore imports appear to be correct');
    console.log('2. Model file naming is consistent');
  }

  return {
    correctImports: correctImports.length,
    issues: issues.length,
    issueDetails: issues
  };
}

// Run the check
if (require.main === module) {
  checkCreditScoreImports();
}

module.exports = { checkCreditScoreImports };