# Retroactive Assessment Creation Script

## Overview

This script creates assessments for existing employees who were hired for jobs with `assessment_required: true` before the assessment system integration was completed. It bridges the gap for historical data.

## Problem Solved

**Before the assessment system integration:**
- Jobs could be created with `assessment_required: true`
- Employees could be hired for these jobs
- But no Assessment records were created
- Employees couldn't see or take required assessments

**This script fixes:**
- Missing Assessment records for existing hired employees
- Missing UserSkill assessment_status updates
- Retroactive integration of both assessment systems

## What the Script Does

### **1. Data Discovery**
- Finds all jobs with `assessment_required: true`
- Identifies hired employees for these jobs
- Checks required skills for each job

### **2. Assessment Creation**
- Creates Assessment records with actual questions
- Updates UserSkill records with `assessment_status: 'pending'`
- Handles duplicate prevention
- Manages error cases gracefully

### **3. Comprehensive Reporting**
- Shows detailed progress for each job/employee/skill
- Provides summary statistics
- Identifies issues (missing questions, etc.)
- Gives actionable recommendations

## Usage

### **Preview Mode (Recommended First)**
```bash
cd backend_new

# See what would be created without making changes
npm run preview-retroactive-assessments
```

### **Execution Mode**
```bash
# Actually create the assessments
npm run create-retroactive-assessments
```

### **Direct Node Execution**
```bash
# Preview
node scripts/createRetroactiveAssessments.js --dry-run

# Execute
node scripts/createRetroactiveAssessments.js
```

## Prerequisites

### **1. Question Bank Must Exist**
```bash
# Ensure questions are available for skills
npm run populate-questions
```

### **2. Database Connection**
- MongoDB must be running
- Correct MONGODB_URI in .env file

### **3. Existing Data**
- Jobs with `assessment_required: true`
- Hired employees for these jobs
- Skills defined for the jobs

## Script Output Example

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

      🎯 Processing Skill: food_safety (64f7b2c8e1234567890abce1)
         ➕ Created new UserSkill with pending assessment
         ✅ Created assessment for skill: food_safety (45 questions)

📊 SUMMARY:
==================================================
Jobs Processed: 3
Total Skill-Employee Combinations: 12
Assessments Created: 8
UserSkills Updated: 10
Errors Encountered: 0

🎉 Retroactive assessment creation completed successfully!
```

## Error Handling

### **Graceful Degradation**
- Continues processing even if individual assessments fail
- Logs specific errors for debugging
- Doesn't break on missing questions or skills

### **Duplicate Prevention**
- Checks for existing Assessment records
- Skips creation if assessment already exists
- Prevents data corruption

### **Missing Questions**
- Identifies skills without questions
- Logs warnings but continues processing
- Provides recommendations for question creation

## Safety Features

### **Dry Run Mode**
- Preview all changes before execution
- No database modifications in preview mode
- Shows exactly what would be created

### **Idempotent Operation**
- Safe to run multiple times
- Won't create duplicate assessments
- Only processes what's needed

### **Comprehensive Logging**
- Detailed progress tracking
- Error identification and reporting
- Success/failure statistics

## Common Scenarios

### **Scenario 1: Fresh Setup**
```bash
# 1. Populate question bank
npm run populate-questions

# 2. Preview what would be created
npm run preview-retroactive-assessments

# 3. Create assessments
npm run create-retroactive-assessments
```

### **Scenario 2: Missing Questions**
```
⚠️ Skills without questions (run populate-questions):
   - advanced_cooking
   - food_safety

Run: npm run populate-questions
```

**Solution:**
```bash
npm run populate-questions
npm run create-retroactive-assessments
```

### **Scenario 3: Partial Existing Data**
```
📊 SUMMARY:
Assessments Created: 5
UserSkills Updated: 3
Errors Encountered: 0
```

**Meaning:** Some assessments already existed, script only created missing ones.

## Verification

### **Check Assessment Creation**
```bash
# Test the assessment system
npm run test-assessments
```

### **Frontend Verification**
1. Login as an employee who was hired for assessment-required job
2. Go to Skills page
3. Should see orange notification banner
4. Should see "Assessment Required" buttons
5. Should be able to click and take assessments

## Troubleshooting

### **No Jobs Found**
```
ℹ️ No jobs found with assessment_required: true
```
**Solution:** Ensure jobs exist with `assessment_required: true` and `skills_required` array populated.

### **No Hired Employees**
```
⏭️ No hired employees for this job
```
**Solution:** Ensure UserApplication records exist with `status: 'hired'` for the jobs.

### **No Questions Available**
```
⚠️ No questions available for skill: cooking
```
**Solution:** Run `npm run populate-questions` to create question bank.

### **Database Connection Issues**
```
❌ MongoDB connection error
```
**Solution:** Check MongoDB is running and MONGODB_URI is correct in .env.

## Integration with Assessment System

### **Before Script:**
- UserSkill records: `assessment_status: 'not_required'`
- Assessment records: None
- Frontend: No assessments visible

### **After Script:**
- UserSkill records: `assessment_status: 'pending'`
- Assessment records: Created with questions
- Frontend: Assessments visible and accessible

## Performance Considerations

### **Batch Processing**
- Processes one job at a time
- Handles large datasets efficiently
- Memory-conscious operation

### **Database Optimization**
- Uses efficient queries
- Prevents unnecessary database calls
- Implements proper indexing usage

## Maintenance

### **Regular Usage**
- Run after importing historical data
- Use when assessment system is newly implemented
- Execute after bulk job/employee creation

### **Monitoring**
- Check logs for errors
- Verify assessment creation success
- Monitor frontend assessment visibility

The script provides a complete solution for retroactively creating assessments for existing jobs and employees! 🎯