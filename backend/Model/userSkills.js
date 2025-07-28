const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  url: String, // Link to uploaded file or DigiLocker
  type: { type: String, enum: ['certificate', 'pcc'], required: true },
  source: { type: String, enum: ['upload', 'digilocker'], required: true },
  uploaded_at: { type: Date, default: Date.now }
});

const userSkillSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill_name: { type: String, required: true },
  category: { type: String },
  experience_years: { type: Number, default: 0 },
  pcc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  assessment_status: { type: String, enum: ['not_required', 'pending', 'passed', 'failed'], default: 'pending' },
  certificates: [certificateSchema],
  verified: { type: Boolean, default: false },
  skill_score: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // 0-3 verifications complete
  badges: [String], // e.g., ['Verified Pro']
  feedback_score: { type: Number, default: 0 }, // from job feedback, 0-100
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSkills', userSkillSchema);
