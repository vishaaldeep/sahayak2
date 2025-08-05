const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const paymentScheduler = require('./services/paymentScheduler');
const creditScoreScheduler = require('./services/creditScoreScheduler');
const mockRecurringPaymentScheduler = require('./services/mockRecurringPaymentScheduler');
const jobRecommendationScheduler = require('./services/jobRecommendationScheduler');


// 🟡 Fluentd logger setup
const fluent = require('fluent-logger');
fluent.configure('website.logs', {
  host: 'localhost',
  port: 24224,
});

const app = express();



// Enable CORS
app.use(cors());
app.use(express.json()); // For parsing application/json



// Require routes here, outside the connectDB block, so they are available
// when the app starts, but their 'use' will be inside the connectDB block.
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const userSkillRoutes = require('./routes/userSkillRoutes');
const userDocumentRoutes = require('./routes/userDocumentRoutes');
const userTestRoutes = require('./routes/userTestRoutes');
const walletRoutes = require('./routes/walletRoutes');
const fdRoutes = require('./routes/fdRoutes');
const employerRoutes = require('./routes/employerRoutes');
const { register } = require('./metrics');
const userJobRoutes = require('./routes/userJobRoutes');
const jobRoutes = require('./routes/jobRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const userApplicationRoutes = require('./routes/userApplicationRoutes');
const userExperienceRoutes = require('./routes/userExperienceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recurringPaymentRoutes = require('./routes/recurringPaymentRoutes');
const userBankDetailsRoutes = require('./routes/userBankDetailsRoutes');
const decentroWebhookRoutes = require('./routes/decentroWebhookRoutes');
const toolRoutes = require('./routes/toolRoutes');
const toolLoanRoutes = require('./routes/toolLoanRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const offerRoutes = require('./routes/offerRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
//const debugRoutes = require('./routes/debugRoutes');
const creditScoreRoutes = require('./routes/creditScoreRoutes');
const loanSuggestionRoutes = require('./routes/loanSuggestionRoutes');
const loanRoutes = require('./routes/loanRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiAssessmentRoutes = require('./routes/aiAssessmentRoutes');
const retellRoutes = require('./routes/retellRoutes');
const mockRecurringPaymentRoutes = require('./routes/mockRecurringPaymentRoutes');
const jobRecommendationRoutes = require('./routes/jobRecommendationRoutes');
const adminRoutes = require('./routes/adminRoutes');



// Connect to MongoDB
connectDB().then(() => {
  

  // Serve static uploads
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Prometheus metrics
  app.get('/api/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      console.error('❌ Metrics error:', err);
      
      res.status(500).end(err);
    }
  });

  

  // API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/user-skills', userSkillRoutes);
  app.use('/api/user-documents', userDocumentRoutes);
  app.use('/api/user-tests', userTestRoutes);
  console.log('💰 Registering Wallet routes at /api/wallet');
  app.use('/api/wallet', walletRoutes);
  console.log('✅ Wallet routes registered successfully');
  app.use('/api/fd', fdRoutes);
  app.use('/api/employer', employerRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/user-jobs', userJobRoutes);
  app.use('/api/voice', voiceRoutes);
  app.use('/api/applications', userApplicationRoutes);
  app.use('/api/user-experiences', userExperienceRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/recurring-payments', recurringPaymentRoutes);
  app.use('/api/user-bank-details', userBankDetailsRoutes);
  app.use('/api/decentro-webhook', decentroWebhookRoutes);
  app.use('/api/tools', toolRoutes);
  app.use('/api/tool-loans', toolLoanRoutes);
  app.use('/api/ratings', ratingRoutes);


  app.use('/api/reports', reportRoutes);
  app.use('/api/admin', adminAuthRoutes);
  app.use('/api/offers', offerRoutes);
  app.use('/api/agreements', agreementRoutes);
  //app.use('/api/debug', debugRoutes);
  app.use('/api/credit-scores', creditScoreRoutes);
  app.use('/api/loan-suggestions', loanSuggestionRoutes);
  console.log('💰 Registering Loan routes at /api/loans');
  app.use('/api/loans', loanRoutes);
  console.log('✅ Loan routes registered successfully');
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/ai-assessments', aiAssessmentRoutes);
  

  
  // Register retell routes with debugging
  console.log('🎤 Registering Retell routes at /api/retell');
  app.use('/api/retell', retellRoutes);
  console.log('✅ Retell routes registered successfully');
  
  // Register mock recurring payment routes
  console.log('💰 Registering Mock Recurring Payment routes at /api/mock-recurring-payments');
  app.use('/api/mock-recurring-payments', mockRecurringPaymentRoutes);
  console.log('✅ Mock Recurring Payment routes registered successfully');
  
  // Register job recommendation routes
  console.log('🎯 Registering Job Recommendation routes at /api/job-recommendations');
  app.use('/api/job-recommendations', jobRecommendationRoutes);
  console.log('✅ Job Recommendation routes registered successfully');
  
  // Register admin management routes
  console.log('👑 Registering Admin Management routes at /api/admin/management');
  app.use('/api/admin/management', adminRoutes);
  console.log('✅ Admin Management routes registered successfully');

  // 🟢 Optional: frontend → backend → fluentd + console
  app.post('/api/frontend-log', (req, res) => {
    const logData = {
      ...req.body,
      timestamp: new Date().toISOString()
    };

    console.log('🧾 Frontend Log:', logData);
    
    res.status(200).send({ success: true });
  });

  // Root
  app.get('/', (req, res) => {
    const logData = { message: 'Root endpoint hit', timestamp: new Date().toISOString() };
    console.log('✅ Root:', logData);
    
    res.status(200).send('✅ Auth Server Running');
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    
    // Start the automatic payment scheduler
    paymentScheduler.start();
    console.log('💰 Automatic payment scheduler started');
    
    // Start the automatic credit score scheduler
    creditScoreScheduler.start();
    console.log('🎯 Automatic credit score scheduler started');
    
    // Start the mock recurring payment scheduler
    mockRecurringPaymentScheduler.start();
    console.log('💰 Mock recurring payment scheduler started');
    
    // Start the job recommendation scheduler
    jobRecommendationScheduler.start();
    console.log('🎯 Job recommendation scheduler started');
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

