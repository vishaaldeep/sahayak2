const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

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
const creditScoreRoutes = require('./routes/creditScoreRoutes');
const loanSuggestionRoutes = require('./routes/loanSuggestionRoutes');


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
  app.use('/api/wallet', walletRoutes);
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
  app.use('/api/credit-scores', creditScoreRoutes);
  app.use('/api/loan-suggestions', loanSuggestionRoutes);

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
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

