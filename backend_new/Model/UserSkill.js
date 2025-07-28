const mongoose = require('mongoose');
const userSkillSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  category: { type: [String], default: [] }, // Added field for selected categories
  proficiency: { type: String },
  experience_years: { type: Number },
  is_verified: { type: Boolean, default: false },
  added_at: { type: Date, default: Date.now }
});
module.exports = mongoose.model('UserSkill', userSkillSchema); 