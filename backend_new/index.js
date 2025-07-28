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

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

app.use(express.json()); // For parsing application/json

// 🟢 Log every request to Console + Fluentd
app.use((req, res, next) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  };

  console.log('📥 Incoming Request:', logData);
  fluent.emit('backend_request', logData);
  next();
});

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
    fluent.emit('backend_error', { error: err.message, timestamp: new Date().toISOString() });
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

// 🟢 Optional: frontend → backend → fluentd + console
app.post('/api/frontend-log', (req, res) => {
  const logData = {
    ...req.body,
    timestamp: new Date().toISOString()
  };

  console.log('🧾 Frontend Log:', logData);
  fluent.emit('frontend_event', logData);
  res.status(200).send({ success: true });
});

// Root
app.get('/', (req, res) => {
  const logData = { message: 'Root endpoint hit', timestamp: new Date().toISOString() };
  console.log('✅ Root:', logData);
  fluent.emit('root_access', logData);
  res.status(200).send('✅ Auth Server Running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
