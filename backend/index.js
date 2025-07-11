const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const skillRoutes = require('./routes/skillRoutes');
const userSkillRoutes = require('./routes/userSkillRoutes');
const retellRoutes = require('./routes/retellRoutes');
const { register } = require('./metrics');

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectDB();

app.use(express.json()); // For parsing application/json

app.get('/api/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

app.use('/api', userRoutes);
app.use('/api', jobRoutes);
app.use('/api', skillRoutes);
app.use('/api', userSkillRoutes);
app.use('/api/retell', retellRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.status(200).send('✅ Auth Server Running');
})


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
