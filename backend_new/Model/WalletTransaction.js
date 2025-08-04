const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  reference_id: {
    type: String
  },
  payment_method: {
    type: String,
    enum: ['UPI', 'Bank Transfer', 'Digital Wallet', 'Cash', 'Other'],
    default: 'UPI'
  },
  category: {
    type: String,
    enum: ['salary', 'bonus', 'refund', 'withdrawal', 'deposit', 'fee', 'other'],
    default: 'other'
  },
  metadata: {
    type: Object,
    default: {}
  },
  // Decentro related fields
  decentro_transaction_id: {
    type: String
  },
  decentro_reference_id: {
    type: String
  },
  decentro_status: {
    type: String
  },
  // Related entities
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  employer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Balance tracking
  balance_before: {
    type: Number,
    default: 0
  },
  balance_after: {
    type: Number,
    default: 0
  },
  // Timestamps
  transaction_date: {
    type: Date,
    default: Date.now
  },
  processed_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
walletTransactionSchema.index({ user_id: 1, created_at: -1 });
walletTransactionSchema.index({ transaction_id: 1 });
walletTransactionSchema.index({ type: 1, status: 1 });

// Pre-save middleware to update timestamps
walletTransactionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  if (this.status === 'completed' && !this.processed_at) {
    this.processed_at = new Date();
  }
  next();
});

// Static method to generate unique transaction ID
walletTransactionSchema.statics.generateTransactionId = function() {
  return 'TXN_' + Math.random().toString(36).substr(2, 16).toUpperCase() + '_' + Date.now();
};

// Instance method to format transaction for display
walletTransactionSchema.methods.toDisplayFormat = function() {
  return {
    id: this._id,
    transaction_id: this.transaction_id,
    type: this.type,
    amount: this.amount,
    description: this.description,
    status: this.status,
    date: this.transaction_date,
    payment_method: this.payment_method,
    category: this.category,
    metadata: this.metadata
  };
};

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);