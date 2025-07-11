const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  match_score: Number,
  recommended_at: Date
});

module.exports = mongoose.model('JobMatch', jobMatchSchema);
