const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skill_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  verified: Boolean,
  verification_method: String,
  blockchain_cert_link: String,
  assessment_score: Number,
  verified_at: Date
});

module.exports = mongoose.model('UserSkill', userSkillSchema);
