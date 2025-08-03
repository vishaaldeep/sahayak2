const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  monthly_savings_goal: { type: Number, default: 0 },
  decentro_wallet_id: { type: String }, // Legacy field for backward compatibility
  decentro_virtual_account_id: { type: String }, // Virtual Account UPI ID
  decentro_reference_id: { type: String }, // Reference ID for virtual account
  decentro_account_details: { type: Object }, // Complete virtual account details from Decentro
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);