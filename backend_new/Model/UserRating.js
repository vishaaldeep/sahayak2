const mongoose = require('mongoose');

const userRatingSchema = new mongoose.Schema({
  giver_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 5, required: true },
  role_of_giver: { type: String, enum: ['seeker', 'provider'], required: true },
  role_of_receiver: { type: String, enum: ['seeker', 'provider'], required: true },
  comments: { type: String },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserRating', userRatingSchema); 