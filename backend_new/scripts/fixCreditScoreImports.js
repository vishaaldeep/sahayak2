const fs = require('fs');
const path = require('path');

function fixCreditScoreImports() {
  console.log('🔧 FIXING CREDITSCORE MODEL IMPORTS');
  console.log('=' .repeat(50));

  let fixedFiles = 0;
  let totalIssues = 0;

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
      let newContent = content;
      let fileChanged = false;
      const relativePath = path.relative('backend_new', filePath);

      // Fix common import issues
      const fixes = [
        // Fix incorrect case in require path
        {
          pattern: /require\\(['\"]\\.\\.\\/Model\\/CreditScore['\"]/g,
          replacement: "require('../Model/creditScore'",
          description: 'Fixed CreditScore.js to creditScore.js in require path'
        },
        // Fix any other variations
        {
          pattern: /require\\(['\"]\\.\\.\\/Model\\/creditscore['\"]/g,
          replacement: "require('../Model/creditScore'",
          description: 'Fixed creditscore.js to creditScore.js in require path'
        },
        {
          pattern: /require\\(['\"]\\.\\.\\/Model\\/CREDITSCORE['\"]/g,
          replacement: "require('../Model/creditScore'",
          description: 'Fixed CREDITSCORE.js to creditScore.js in require path'
        }
      ];

      fixes.forEach(fix => {
        const matches = content.match(fix.pattern);
        if (matches) {
          newContent = newContent.replace(fix.pattern, fix.replacement);
          fileChanged = true;
          totalIssues += matches.length;
          console.log(`🔧 ${relativePath}: ${fix.description} (${matches.length} occurrences)`);
        }
      });

      // Write the file back if changes were made
      if (fileChanged) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        fixedFiles++;
        console.log(`✅ Fixed: ${relativePath}`);
      }

    } catch (error) {
      console.log(`⚠️ Error processing file ${filePath}: ${error.message}`);
    }
  });

  console.log('\\n📊 SUMMARY:');
  console.log(`📁 Files scanned: ${jsFiles.length}`);
  console.log(`🔧 Files fixed: ${fixedFiles}`);
  console.log(`✅ Issues resolved: ${totalIssues}`);

  // Verify the model file exists with correct name
  const modelPath = path.join('backend_new', 'Model', 'creditScore.js');
  if (fs.existsSync(modelPath)) {
    console.log('\\n✅ Model file verified: backend_new/Model/creditScore.js');
  } else {
    console.log('\\n❌ Model file missing: backend_new/Model/creditScore.js');
  }

  // Check for any remaining issues
  console.log('\\n🔍 VERIFICATION:');
  let verificationIssues = 0;
  
  jsFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative('backend_new', filePath);
      
      // Check for remaining issues
      if (content.includes("require('../Model/CreditScore')")) {
        console.log(`⚠️ Still found CreditScore import in: ${relativePath}`);
        verificationIssues++;
      }
      if (content.includes("require('../Model/creditscore')")) {
        console.log(`⚠️ Still found creditscore import in: ${relativePath}`);
        verificationIssues++;
      }
      if (content.includes("require('../Model/CREDITSCORE')")) {
        console.log(`⚠️ Still found CREDITSCORE import in: ${relativePath}`);
        verificationIssues++;
      }
    } catch (error) {
      // Ignore read errors during verification
    }
  });

  if (verificationIssues === 0) {
    console.log('✅ All CreditScore imports are now consistent!');
  } else {
    console.log(`❌ Found ${verificationIssues} remaining issues`);
  }

  console.log('\\n🎯 RECOMMENDATIONS:');
  console.log('1. Always use: require(\\'../Model/creditScore\\')');
  console.log('2. The model file should be named creditScore.js (camelCase)');
  console.log('3. The model export should be: mongoose.model(\\'CreditScore\\', schema)');
  console.log('4. Variable names can use either creditScore or CreditScore as appropriate');

  return {
    filesScanned: jsFiles.length,
    filesFixed: fixedFiles,
    issuesResolved: totalIssues,
    verificationIssues: verificationIssues
  };
}

// Run the fix
if (require.main === module) {
  fixCreditScoreImports();
}

module.exports = { fixCreditScoreImports };