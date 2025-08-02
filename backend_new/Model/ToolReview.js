const mongoose = require('mongoose');

const ToolReviewSchema = new mongoose.Schema({
  tool_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true,
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ToolReview', ToolReviewSchema);
