const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  required_skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  wage_per_hour: Number,
  is_active: Boolean,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
