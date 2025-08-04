const mongoose = require('mongoose');

const recurringPaymentSchema = new mongoose.Schema({
  employer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Make optional for backward compatibility
  },
  seeker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // For backward compatibility with old system
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  frequency: {
    type: String,
    enum: ['minutes', 'hours', 'daily', 'weekly', 'monthly'],
    required: true
  },
  interval_value: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  description: {
    type: String,
    required: false // Make optional for backward compatibility
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed', 'pending', 'pending_authentication', 'pending_approval', 'failed'],
    default: 'active'
  },
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date,
    required: false
  },
  next_payment_date: {
    type: Date,
    required: true
  },
  total_payments_made: {
    type: Number,
    default: 0
  },
  total_amount_paid: {
    type: Number,
    default: 0
  },
  max_payments: {
    type: Number,
    required: false // If set, payment will stop after this many payments
  },
  // Mock Decentro fields (for UI compatibility)
  decentro_flow_id: {
    type: String,
    default: function() {
      return 'MOCK_FLOW_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  decentro_status: {
    type: String,
    default: 'SUCCESS'
  },
  payment_method: {
    type: String,
    default: 'UPI'
  },
  bank_account: {
    account_number: String,
    ifsc_code: String,
    account_holder_name: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_payment_date: {
    type: Date
  },
  payment_history: [{
    payment_id: {
      type: String,
      default: function() {
        return 'PAY_' + Math.random().toString(36).substr(2, 12).toUpperCase();
      }
    },
    amount: Number,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    },
    transaction_id: {
      type: String,
      default: function() {
        return 'TXN_' + Math.random().toString(36).substr(2, 16).toUpperCase();
      }
    },
    payment_date: {
      type: Date,
      default: Date.now
    },
    failure_reason: String
  }],
  
  // Additional fields for old system compatibility
  decentro_mandate_id: String,
  decentro_mandate_details: Object,
  decentro_reference_id: String,
  authentication_url: String,
  last_payment_date: Date,
  last_payment_amount: Number,
  last_payment_reference: String,
  last_payout_reference: String
});

// Calculate next payment date based on frequency
recurringPaymentSchema.methods.calculateNextPaymentDate = function() {
  const current = this.next_payment_date || new Date();
  const next = new Date(current);
  
  switch (this.frequency) {
    case 'minutes':
      next.setMinutes(next.getMinutes() + this.interval_value);
      break;
    case 'hours':
      next.setHours(next.getHours() + this.interval_value);
      break;
    case 'daily':
      next.setDate(next.getDate() + this.interval_value);
      break;
    case 'weekly':
      next.setDate(next.getDate() + (this.interval_value * 7));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + this.interval_value);
      break;
  }
  
  return next;
};

// Check if payment is due
recurringPaymentSchema.methods.isPaymentDue = function() {
  return new Date() >= this.next_payment_date && this.status === 'active';
};

// Process payment (mock)
recurringPaymentSchema.methods.processPayment = async function() {
  const paymentRecord = {
    payment_id: 'PAY_' + Math.random().toString(36).substr(2, 12).toUpperCase(),
    amount: this.amount,
    status: 'success', // Mock success
    transaction_id: 'TXN_' + Math.random().toString(36).substr(2, 16).toUpperCase(),
    payment_date: new Date()
  };
  
  this.payment_history.push(paymentRecord);
  this.total_payments_made += 1;
  this.total_amount_paid += this.amount;
  this.last_payment_date = new Date();
  this.next_payment_date = this.calculateNextPaymentDate();
  this.updated_at = new Date();
  
  // Check if max payments reached
  if (this.max_payments && this.total_payments_made >= this.max_payments) {
    this.status = 'completed';
  }
  
  await this.save();
  return paymentRecord;
};

recurringPaymentSchema.pre('save', function(next) {
  this.updated_at = new Date();
  
  // Ensure either employee_id or seeker_id is provided
  if (!this.employee_id && !this.seeker_id) {
    return next(new Error('Either employee_id or seeker_id must be provided'));
  }
  
  // If seeker_id is provided but not employee_id, copy seeker_id to employee_id
  if (this.seeker_id && !this.employee_id) {
    this.employee_id = this.seeker_id;
  }
  
  // If employee_id is provided but not seeker_id, copy employee_id to seeker_id
  if (this.employee_id && !this.seeker_id) {
    this.seeker_id = this.employee_id;
  }
  
  next();
});

module.exports = mongoose.model('RecurringPayment', recurringPaymentSchema);