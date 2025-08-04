# Assessment System Testing Guide

## 🚀 How to Test Run the Assessment System

### **Prerequisites:**

1. **MongoDB Running**: Ensure your MongoDB is connected
2. **Environment Setup**: `.env` file configured
3. **Dependencies Installed**: `npm install` completed
4. **Backend Running**: Server should be running on port 5000

### **Quick Test Commands:**

#### **1. Quick System Check** (Recommended First):
```bash
cd backend_new
node scripts/quickTest.js
```
**What it does:**
- Checks database connection
- Verifies data counts
- Tests assessment service status
- Shows recent applications
- Tests AI assessment functionality

#### **2. Comprehensive Test Suite**:
```bash
cd backend_new
node scripts/runAllTests.js
```
**What it does:**
- Runs all diagnostic tests
- Fixes missing assessments
- Tests complete flow
- Compares AI vs rule-based

#### **3. Individual Test Scripts**:

**Check Assessment Issues:**
```bash
node scripts/checkAssessmentIssue.js
```

**Fix Missing Assessments:**
```bash
node scripts/fixMissingAssessments.js
```

**Test Assessment Flow:**
```bash
node scripts/testAssessmentFlow.js
```

**Test AI Comparison:**
```bash
node scripts/testAIComparison.js
```

### **Manual Testing Steps:**

#### **Step 1: Start the Backend**
```bash
cd backend_new
npm run dev
```
**Expected Output:**
```
Server running on port 5000
✅ Connected to MongoDB
🤖 Smart Assessment Service initialized:
   Primary Method: openai
   OpenAI Available: false
   Fallback Enabled: true
```

#### **Step 2: Test API Endpoints**

**Check Service Status:**
```bash
curl http://localhost:5000/api/ai-assessments/status
```

**Get Assessment for Application:**
```bash
curl http://localhost:5000/api/ai-assessments/application/[APPLICATION_ID]
```

#### **Step 3: Frontend Testing**

1. **Start Frontend:**
   ```bash
   cd frontend_new
   npm start
   ```

2. **Test Flow:**
   - Login as employer
   - Create job with `assessment_required: true`
   - Add required skills (e.g., Cooking)
   - Login as seeker
   - Apply for the job
   - Check if assessment is created
   - Complete assessment
   - Check AI recommendation in employer dashboard

### **Expected Test Results:**

#### **✅ Successful Test Indicators:**

**Console Logs:**
```
📝 Job requires assessment, creating assessment for user [USER_ID]
✅ Assessment assigned successfully for job application
🤖 Starting AI assessment for application [APP_ID]
✅ AI assessment completed: TAKE A CHANCE (65%)
```

**Database Records:**
- `Assessment` record created with status 'assigned'
- `AIAssessment` record created with recommendation
- `UserSkill` updated with 'pending' status
- Notifications sent to seeker and employer

**Frontend Display:**
- Assessment appears in seeker's skills page
- AI recommendation shows in employer's applications view
- Notification bell shows new notifications

#### **❌ Common Issues and Solutions:**

**Issue 1: No Assessment Created**
```
Error: No questions available for skill: [SKILL_ID]
```
**Solution:** Run `node scripts/checkAssessmentIssue.js` to create sample questions

**Issue 2: AI Assessment Failed**
```
❌ AI assessment failed: OpenAI API failed
```
**Solution:** System falls back to rule-based assessment automatically

**Issue 3: Database Connection Error**
```
Error: connect ECONNREFUSED
```
**Solution:** Check MongoDB connection string in `.env`

### **Test Data Setup:**

#### **Create Test Job with Assessment:**
```javascript
// Example test job
{
  title: "Test Chef Position",
  description: "Cooking job for testing",
  assessment_required: true,
  skills_required: [COOKING_SKILL_ID],
  salary_min: 25000,
  salary_max: 35000
}
```

#### **Create Test Application:**
```javascript
// Apply seeker to job
POST /api/applications
{
  seeker_id: "SEEKER_ID",
  job_id: "JOB_ID"
}
```

### **Monitoring and Debugging:**

#### **Log Files to Watch:**
```bash
# Backend logs
tail -f backend_new/logs/app.log

# Console output
npm run dev
```

#### **Key Log Messages:**
```
🤖 Smart Assessment Service initialized
📝 Job requires assessment, creating assessment
✅ Assessment assigned successfully
🔄 Using assessment method: rule-based
✅ Smart Assessment Complete: TAKE A CHANCE (65%)
```

#### **Database Queries for Debugging:**
```javascript
// Check assessments
db.assessments.find({user_id: ObjectId("USER_ID")})

// Check AI assessments
db.aiassessments.find({application_id: ObjectId("APP_ID")})

// Check jobs with assessment required
db.jobs.find({assessment_required: true})
```

### **Performance Testing:**

#### **Load Test Assessment Creation:**
```bash
# Test multiple applications
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/applications \
    -H "Content-Type: application/json" \
    -d '{"seeker_id":"SEEKER_ID","job_id":"JOB_ID"}'
done
```

#### **Measure Processing Times:**
- Rule-based assessment: <100ms
- OpenAI assessment: 2-5 seconds
- Assessment creation: <500ms

### **Integration Testing:**

#### **Test Complete Hiring Flow:**
1. **Job Creation** → Assessment required = true
2. **Job Application** → Assessment created automatically
3. **Assessment Completion** → Results recorded
4. **AI Analysis** → Recommendation generated
5. **Employer Review** → AI insights displayed
6. **Hiring Decision** → Based on AI recommendation

### **Troubleshooting Checklist:**

- [ ] MongoDB connected and accessible
- [ ] Environment variables configured
- [ ] Assessment questions exist for required skills
- [ ] Backend server running without errors
- [ ] Frontend can communicate with backend
- [ ] Notifications service working
- [ ] AI assessment service responding

### **Success Criteria:**

✅ **Assessment Creation**: Automatic when applying to assessment-required jobs
✅ **AI Analysis**: Generates recommendations for all applications
✅ **Notifications**: Sent to both seekers and employers
✅ **Frontend Display**: Shows AI recommendations in employer dashboard
✅ **Error Handling**: Graceful fallback when AI fails
✅ **Performance**: Fast response times for all operations

### **Next Steps After Testing:**

1. **Production Deployment**: Configure OpenAI API key for enhanced AI
2. **Monitoring Setup**: Implement logging and alerting
3. **User Training**: Guide employers on using AI recommendations
4. **Feedback Collection**: Gather user feedback on assessment accuracy
5. **Continuous Improvement**: Refine AI prompts based on outcomes

Run the quick test first to verify everything is working, then proceed with comprehensive testing! 🎯