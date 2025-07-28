const Wallet = require('../Model/Wallet');
const Transaction = require('../Model/Transaction');

exports.createWallet = (userId) => Wallet.create({ user_id: userId });

exports.getWalletByUserId = async (userId) => {
  const wallet = await Wallet.findOne({ user_id: userId });
  return wallet;
};

exports.addMoneyToWallet = async (userId, amount) => {
  const wallet = await Wallet.findOne({ user_id: userId });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  wallet.balance += amount;
  await wallet.save();

  await Transaction.create({
    wallet_id: wallet._id,
    amount,
    type: 'credit',
    status: 'completed',
  });
  return wallet;
};

exports.getTransactionsByUserId = async (userId) => {
  const wallet = await Wallet.findOne({ user_id: userId });
  if (!wallet) {
    return [];
  }
  const transactions = await Transaction.find({ wallet_id: wallet._id }).sort({ createdAt: -1 });
  return transactions;
};

exports.updateSavingsGoal = async (userId, savings_goal) => {
  const wallet = await Wallet.findOneAndUpdate({ user_id: userId }, { monthly_savings_goal: savings_goal }, { new: true });
  return wallet;
};