# Assessment Script Troubleshooting Guide

## Issue: MissingSchemaError - Schema hasn't been registered for model "User"

### Problem
The script was failing with:
```
❌ Error in retroactive assessment creation: MissingSchemaError: Schema hasn't been registered for model "User". Use mongoose.model(name, schema)
```

### Root Cause
The issue was caused by improper model loading order and potential circular dependencies when running the script independently from the main application.

### Solution Applied

#### **1. Fixed Model Loading Order**
```javascript
// Before (problematic)
const Job = require('../Model/Job');
const UserApplication = require('../Model/UserApplication');
const UserSkill = require('../Model/UserSkill');
const Assessment = require('../Model/Assessment');
const AssessmentQuestion = require('../Model/AssessmentQuestion');
const Skill = require('../Model/Skill');

// After (fixed)
const User = require('../Model/User');           // Base model first
const Skill = require('../Model/Skill');         // Referenced by others
const Job = require('../Model/Job');             // References User and Skill
const UserApplication = require('../Model/UserApplication'); // References User and Job
const UserSkill = require('../Model/UserSkill'); // References User and Skill
const Assessment = require('../Model/Assessment'); // References User, Skill, Job
const AssessmentQuestion = require('../Model/AssessmentQuestion'); // References Skill
```

#### **2. Created Fixed Script Version**
- **File**: `scripts/createRetroactiveAssessments_fixed.js`
- **Improvements**:
  - Proper model loading sequence
  - Better error handling
  - Model verification logging
  - Cleaner separation of concerns

#### **3. Added Model Loading Test**
- **File**: `test-model-loading.js`
- **Purpose**: Verify all models load correctly before running main script

## How to Use the Fixed Version

### **Step 1: Test Model Loading**
```bash
cd backend_new
npm run test-model-loading
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📦 Loading models...
✅ User model loaded
✅ Skill model loaded
✅ Job model loaded
✅ UserApplication model loaded
✅ UserSkill model loaded
✅ Assessment model loaded
✅ AssessmentQuestion model loaded

📋 Registered models: [ 'User', 'Skill', 'Job', 'UserApplication', 'UserSkill', 'Assessment', 'AssessmentQuestion' ]

🔍 Testing basic queries...
Users: 25
Jobs: 12
Assessment Jobs: 3
Hired Applications: 8
Assessments: 15
Questions: 3600

🎉 All models loaded and working correctly!
```

### **Step 2: Preview Assessments (Safe)**
```bash
npm run preview-retroactive-assessments
```

### **Step 3: Create Assessments**
```bash
npm run create-retroactive-assessments
```

### **Step 4: Verify Results**
```bash
npm run verify-retroactive-assessments
```

## Updated Commands

### **New Commands:**
```bash
# Test if models load correctly
npm run test-model-loading

# Preview what would be created (uses fixed script)
npm run preview-retroactive-assessments

# Create assessments (uses fixed script)
npm run create-retroactive-assessments

# Verify results
npm run verify-retroactive-assessments
```

## Common Issues and Solutions

### **Issue 1: MongoDB Connection Error**
```
❌ MongoDB connection error: MongoNetworkError
```

**Solution:**
- Check if MongoDB is running
- Verify MONGODB_URI in .env file
- Check network connectivity

### **Issue 2: Model Loading Fails**
```
❌ Error loading models: Cannot find module '../Model/User'
```

**Solution:**
- Ensure you're running from `backend_new` directory
- Check that all model files exist
- Verify file paths are correct

### **Issue 3: No Jobs Found**
```
ℹ️ No jobs found with assessment_required: true
```

**Solution:**
- Check if jobs exist with `assessment_required: true`
- Verify jobs have `skills_required` array populated
- Use MongoDB Compass or CLI to verify data

### **Issue 4: No Questions Available**
```
⚠️ No questions available for skill: cooking
```

**Solution:**
```bash
npm run populate-questions
```

## Debugging Steps

### **1. Check Database Connection**
```bash
npm run test-model-loading
```

### **2. Check Data Existence**
```javascript
// In MongoDB shell or Compass
db.jobs.find({ assessment_required: true })
db.user_applications.find({ status: 'hired' })
db.assessmentquestions.countDocuments()
```

### **3. Check Model Registration**
The fixed script now shows registered models:
```
📋 Registered models: [ 'User', 'Skill', 'Job', ... ]
```

### **4. Verbose Error Logging**
The fixed script includes detailed error logging:
```javascript
console.error('❌ Error in retroactive assessment creation:', error);
console.error('Stack trace:', error.stack);
```

## File Structure

```
backend_new/
├── scripts/
│   ├── createRetroactiveAssessments.js          # Original (may have issues)
│   ├── createRetroactiveAssessments_fixed.js    # Fixed version ✅
│   ├── verifyRetroactiveAssessments.js          # Verification script
│   └── RETROACTIVE_ASSESSMENTS_README.md       # Documentation
├── test-model-loading.js                       # Model loading test ✅
├── ASSESSMENT_SCRIPT_TROUBLESHOOTING.md        # This file ✅
└── package.json                                # Updated scripts ✅
```

## Prevention

### **Best Practices for Model Loading:**
1. **Import base models first** (User, Skill)
2. **Import dependent models after** (Job, UserApplication)
3. **Import complex models last** (Assessment)
4. **Test model loading** before running complex scripts
5. **Use proper error handling** with stack traces

### **Script Development Guidelines:**
1. **Always test model loading first**
2. **Use dry-run mode for testing**
3. **Include comprehensive error handling**
4. **Log model registration status**
5. **Verify database connectivity**

## Recovery

If you encounter the original error:

### **Quick Fix:**
```bash
# Use the fixed version
npm run test-model-loading
npm run preview-retroactive-assessments
npm run create-retroactive-assessments
```

### **Manual Fix:**
1. Stop any running scripts
2. Check MongoDB connection
3. Run model loading test
4. Use fixed script version
5. Verify results

The fixed script version resolves the MissingSchemaError and provides better error handling and debugging capabilities! 🔧✅