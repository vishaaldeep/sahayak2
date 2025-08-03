const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['applied', 'hired', 'rejected'], 
    default: 'applied' 
  },
  applied_at: { type: Date, default: Date.now },
  hired_at: { type: Date },
  rejected_at: { type: Date },
  notes: String
});

// Ensure one application per user per job
jobApplicationSchema.index({ job_id: 1, applicant_id: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);