const mongoose = require('mongoose');

const wageOfferSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proposed_wage: Number,
  employer_response: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WageOffer', wageOfferSchema);
