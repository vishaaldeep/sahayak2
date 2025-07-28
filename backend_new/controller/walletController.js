const walletService = require('../services/walletService');

exports.getWallet = async (req, res) => {
  const wallet = await walletService.getWalletByUserId(req.user._id);
  if (!wallet) {
    return res.status(404).json({ message: 'Wallet not found' });
  }
  res.json(wallet);
};

exports.addMoney = async (req, res) => {
  const { amount } = req.body;
  try {
    // Ensure wallet exists for the user, create if not
    await walletService.getWalletByUserId(req.user._id);
    const wallet = await walletService.addMoneyToWallet(req.user._id, amount);
    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  res.status(200).json({ message: 'Payment verification not needed for in-house wallet.' });
};

exports.getTransactions = async (req, res) => {
  const transactions = await walletService.getTransactionsByUserId(req.user._id);
  res.json(transactions);
};

exports.updateSavingsGoal = async (req, res) => {
  const { savings_goal } = req.body;
  const wallet = await walletService.updateSavingsGoal(req.user._id, savings_goal);
  res.json(wallet);
};

exports.createWallet = async (req, res) => {
  try {
    const wallet = await walletService.createWallet(req.user._id);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};