const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  monthly_savings_goal: { type: Number, default: 0 },
  decentro_wallet_id: { type: String }, // To store Decentro wallet ID
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);