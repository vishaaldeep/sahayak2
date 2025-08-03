const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  description: { type: String }, // Description of the transaction
  external_transaction_id: { type: String }, // External transaction ID (e.g., from Decentro)
  source: { type: String, enum: ['internal', 'decentro_virtual_account', 'decentro_payment', 'upi'], default: 'internal' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);