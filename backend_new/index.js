const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const skillRoutes = require('./routes/skillRoutes');
const userSkillRoutes = require('./routes/userSkillRoutes');
const userDocumentRoutes = require('./routes/userDocumentRoutes');
const userTestRoutes = require('./routes/userTestRoutes');
const walletRoutes = require('./routes/walletRoutes');
const fdRoutes = require('./routes/fdRoutes');
const employerRoutes = require('./routes/employerRoutes');
const { register } = require('./metrics');

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

app.use(express.json()); // For parsing application/json

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/user-skills', userSkillRoutes);
app.use('/api/user-documents', userDocumentRoutes);
app.use('/api/user-tests', userTestRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/fd', fdRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/employer', employerRoutes);
const userJobRoutes = require('./routes/userJobRoutes');
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);
app.use('/api/user-jobs', userJobRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).send('✅ Auth Server Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
