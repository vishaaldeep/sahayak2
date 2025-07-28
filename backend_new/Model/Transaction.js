const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }, // Default to completed for in-house
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);