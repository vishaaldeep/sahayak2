const mongoose = require('mongoose');

const recurringPaymentSchema = new mongoose.Schema({
  employer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seeker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'bi-weekly'],
    required: true,
  },
  decentro_mandate_id: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not violate unique constraint
  },
  decentro_reference_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['pending', 'pending_authentication', 'pending_approval', 'active', 'paused', 'cancelled', 'failed'],
    default: 'pending',
  },
  authentication_url: {
    type: String, // URL for mandate authentication
  },
  next_payment_date: {
    type: Date,
    required: true,
  },
  last_payment_date: {
    type: Date,
  },
  last_payment_amount: {
    type: Number,
  },
  last_payment_reference: {
    type: String,
  },
  last_payout_reference: {
    type: String,
  },
  retry_count: {
    type: Number,
    default: 0,
  },
  last_error: {
    type: String,
  },
  last_retry_date: {
    type: Date,
  },
  // Store any other relevant Decentro mandate details here
  decentro_mandate_details: {
    type: Object,
  },
}, { timestamps: true });

module.exports = mongoose.model('RecurringPayment', recurringPaymentSchema, 'recurring_payments');