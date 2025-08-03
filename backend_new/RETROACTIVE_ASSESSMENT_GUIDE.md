# Retroactive Assessment Creation Guide

## Overview

This guide helps you create assessments for existing employees who were hired for jobs with `assessment_required: true` before the assessment system was fully integrated.

## Quick Start

### **Step 1: Prerequisites**
```bash
cd backend_new

# Ensure question bank exists
npm run populate-questions

# Test current assessment system
npm run test-assessments
```

### **Step 2: Preview Changes**
```bash
# See what would be created (no changes made)
npm run preview-retroactive-assessments
```

### **Step 3: Create Assessments**
```bash
# Actually create the assessments
npm run create-retroactive-assessments
```

### **Step 4: Verify Results**
```bash
# Check that everything was created correctly
npm run verify-retroactive-assessments
```

## Detailed Workflow

### **1. Understanding the Problem**

**Before Assessment Integration:**
- Jobs created with `assessment_required: true` ✅
- Employees hired for these jobs ✅
- Assessment records created ❌
- UserSkill assessment status updated ❌

**Result:** Employees couldn't see or take required assessments

### **2. What the Script Fixes**

**Creates Missing Data:**
- Assessment records with actual questions
- UserSkill records with `assessment_status: 'pending'`
- Proper integration between both systems

**Handles Edge Cases:**
- Duplicate prevention
- Missing questions
- Error recovery
- Comprehensive logging

### **3. Step-by-Step Execution**

#### **Step 3.1: Check Prerequisites**
```bash
# Check if questions exist
npm run test-assessments
```

**Expected Output:**
```
✅ Skills: 18
✅ Questions: 3,600
✅ Assessment Jobs: X
✅ Pending UserSkills: X
✅ Assessment Records: X
```

**If questions are missing:**
```bash
npm run populate-questions
```

#### **Step 3.2: Preview Mode**
```bash
npm run preview-retroactive-assessments
```

**Sample Output:**
```
🔍 DRY RUN: Preview of Retroactive Assessment Creation...

Found 3 jobs requiring assessments:

📋 Job: "Senior Chef Position"
   Skills: cooking, food_safety
   Hired Employees: 2
   - John Doe
     ➕ Would create assessment for: cooking
     ➕ Would create assessment for: food_safety
   - Jane Smith
     ⏭️ Assessment exists for: cooking
     ➕ Would create assessment for: food_safety

📊 DRY RUN SUMMARY:
Would process: 6 skill-employee combinations
Would create: 3 new assessments
```

#### **Step 3.3: Execute Creation**
```bash
npm run create-retroactive-assessments
```

**Sample Output:**
```
🔄 Creating Retroactive Assessments for Existing Jobs and Employees...

1️⃣ Finding jobs with assessment_required: true...
   Found 3 jobs requiring assessments

📋 Processing Job: "Senior Chef Position" (64f7b2c8e1234567890abcde)
   Required Skills: cooking, food_safety
   Found 2 hired employees

   👤 Processing Employee: John Doe (64f7b2c8e1234567890abcdf)

      🎯 Processing Skill: cooking (64f7b2c8e1234567890abce0)
         📝 Updated UserSkill assessment status to pending
         ✅ Created assessment for skill: cooking (50 questions)

📊 SUMMARY:
Jobs Processed: 3
Total Skill-Employee Combinations: 6
Assessments Created: 3
UserSkills Updated: 4
Errors Encountered: 0

🎉 Retroactive assessment creation completed successfully!
```

#### **Step 3.4: Verify Results**
```bash
npm run verify-retroactive-assessments
```

**Sample Output:**
```
🔍 Verifying Retroactive Assessment Creation...

📋 Found 3 jobs requiring assessments

🔍 Checking Job: "Senior Chef Position"
   👥 Hired Employees: 2
   👤 John Doe:
      ✅ Assessment: cooking (assigned)
      ✅ UserSkill: cooking (pending)
      ✅ Assessment: food_safety (assigned)
      ✅ UserSkill: food_safety (pending)

📊 VERIFICATION SUMMARY:
Expected Combinations: 6
Assessment Records Found: 6
UserSkills with Pending Status: 6
Missing Assessments: 0
Missing UserSkills: 0

Coverage:
Assessment Records: 100.0%
UserSkill Pending: 100.0%

🎉 VERIFICATION PASSED: All assessments created successfully!
```

## Common Scenarios

### **Scenario 1: Fresh Database**
```bash
# 1. Populate questions first
npm run populate-questions

# 2. Preview what would be created
npm run preview-retroactive-assessments

# 3. Create assessments
npm run create-retroactive-assessments

# 4. Verify success
npm run verify-retroactive-assessments
```

### **Scenario 2: Partial Existing Data**
```bash
# Some assessments already exist
npm run preview-retroactive-assessments
# Output: "Would create: 5 new assessments"

npm run create-retroactive-assessments
# Output: "Assessments Created: 5"
```

### **Scenario 3: Missing Questions**
```bash
npm run preview-retroactive-assessments
# Output: "Cannot create assessment for: advanced_cooking (no questions)"

# Fix by populating questions
npm run populate-questions

# Try again
npm run create-retroactive-assessments
```

## Troubleshooting

### **Issue: No Jobs Found**
```
ℹ️ No jobs found with assessment_required: true
```

**Causes:**
- No jobs have `assessment_required: true`
- Jobs don't have `skills_required` array populated

**Solution:**
```javascript
// Check jobs in MongoDB
db.jobs.find({ assessment_required: true })
```

### **Issue: No Hired Employees**
```
⏭️ No hired employees for this job
```

**Causes:**
- No UserApplication records with `status: 'hired'`
- Applications exist but status is different

**Solution:**
```javascript
// Check applications
db.user_applications.find({ status: 'hired' })
```

### **Issue: No Questions Available**
```
⚠️ No questions available for skill: cooking
```

**Solution:**
```bash
npm run populate-questions
```

### **Issue: Database Connection**
```
❌ MongoDB connection error
```

**Solution:**
- Check MongoDB is running
- Verify MONGODB_URI in .env file
- Check database permissions

## Frontend Verification

After running the script, verify in the frontend:

### **1. Login as Affected Employee**
- Use credentials of someone hired for assessment-required job

### **2. Check Skills Page**
- Should see orange notification banner
- Should see "Assessment Required" buttons
- Buttons should be clickable (not disabled)

### **3. Take Assessment**
- Click assessment button
- AssessmentModal should open
- Should see available assessments
- Should be able to start and complete

## Monitoring and Maintenance

### **Regular Checks**
```bash
# Weekly verification
npm run verify-retroactive-assessments

# Check system health
npm run test-assessments
```

### **After Data Imports**
```bash
# After importing historical data
npm run preview-retroactive-assessments
npm run create-retroactive-assessments
```

### **Performance Monitoring**
- Monitor script execution time
- Check for memory usage during large datasets
- Verify database performance impact

## Advanced Usage

### **Custom Filtering**
Modify the script to process specific jobs:

```javascript
// In createRetroactiveAssessments.js
const assessmentJobs = await Job.find({ 
  assessment_required: true,
  skills_required: { $exists: true, $ne: [] },
  // Add custom filters
  created_at: { $gte: new Date('2024-01-01') }
});
```

### **Batch Processing**
For very large datasets, consider processing in batches:

```javascript
// Process jobs in batches of 10
const batchSize = 10;
for (let i = 0; i < assessmentJobs.length; i += batchSize) {
  const batch = assessmentJobs.slice(i, i + batchSize);
  // Process batch
}
```

## Integration with CI/CD

### **Automated Deployment**
```bash
# In deployment script
npm run populate-questions
npm run create-retroactive-assessments
npm run verify-retroactive-assessments
```

### **Health Checks**
```bash
# Regular health check
npm run test-assessments
npm run verify-retroactive-assessments
```

The retroactive assessment creation system provides a complete solution for historical data integration! 🎯