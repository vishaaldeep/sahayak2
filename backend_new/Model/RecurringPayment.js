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
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'cancelled', 'failed'],
    default: 'pending',
  },
  next_payment_date: {
    type: Date,
    required: true,
  },
  // Store any other relevant Decentro mandate details here
  decentro_mandate_details: {
    type: Object,
  },
}, { timestamps: true });

module.exports = mongoose.model('RecurringPayment', recurringPaymentSchema, 'recurring_payments');