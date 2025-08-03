const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  // Change location to GeoJSON Point
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  // Add skill field (string, or change to array if needed)
  skill: { type: String, required: true },
  posted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  required_skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  wage_per_hour: Number,
  is_active: Boolean,
  assessment_required: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Add 2dsphere index for geospatial queries
jobSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Job', jobSchema);
