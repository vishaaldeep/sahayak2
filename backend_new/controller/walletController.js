const walletService = require('../services/walletService');
const decentroService = require('../services/decentroService');
const User = require('../Model/User');

exports.getWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user._id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // If wallet has virtual account, get the latest balance from Decentro
    if (wallet.decentro_reference_id) {
      try {
        const decentroBalance = await decentroService.getVirtualAccountBalance(wallet.decentro_reference_id);
        wallet.decentro_balance = decentroBalance;
      } catch (error) {
        console.error('Error fetching Decentro balance:', error);
        wallet.decentro_balance = 'Error';
      }
    }
    
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  try {
    const transactions = await walletService.getTransactionsByUserId(req.user._id);
    
    // Also get Decentro virtual account transactions if available
    const wallet = await walletService.getWalletByUserId(req.user._id);
    if (wallet && wallet.decentro_reference_id) {
      try {
        const decentroTransactions = await decentroService.getVirtualAccountTransactions(wallet.decentro_reference_id);
        // Merge and format transactions
        const formattedDecentroTx = decentroTransactions.map(tx => ({
          _id: tx.transaction_id || tx.id,
          amount: parseFloat(tx.amount),
          type: tx.transaction_type === 'CREDIT' ? 'credit' : 'debit',
          status: 'completed',
          createdAt: tx.transaction_date || tx.created_at,
          source: 'decentro',
          description: tx.description || 'Virtual account transaction'
        }));
        
        // Combine local and Decentro transactions
        const allTransactions = [...transactions, ...formattedDecentroTx]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(allTransactions);
      } catch (error) {
        console.error('Error fetching Decentro transactions:', error);
        res.json(transactions); // Return local transactions only
      }
    } else {
      res.json(transactions);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSavingsGoal = async (req, res) => {
  try {
    const { savings_goal, monthly_savings_goal } = req.body;
    const goalAmount = savings_goal || monthly_savings_goal;
    const wallet = await walletService.updateSavingsGoal(req.user._id, goalAmount);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createWallet = async (req, res) => {
  try {
    const wallet = await walletService.createWallet(req.user._id);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Create Decentro Virtual Account
exports.createDecentroWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user already has a virtual account
    const existingWallet = await walletService.getWalletByUserId(req.user._id);
    if (existingWallet && existingWallet.decentro_virtual_account_id) {
      return res.status(400).json({ error: 'Virtual account already exists for this user' });
    }
    
    const response = await decentroService.createVirtualAccount(
      req.user._id,
      user.name,
      user.email,
      user.phone_number
    );
    
    res.status(201).json({
      message: 'Virtual account created successfully',
      data: response
    });
  } catch (error) {
    console.error('Error creating Decentro virtual account:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Virtual Account Balance
exports.getVirtualAccountBalance = async (req, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user._id);
    if (!wallet || !wallet.decentro_reference_id) {
      return res.status(404).json({ error: 'Virtual account not found' });
    }
    
    const balance = await decentroService.getVirtualAccountBalance(wallet.decentro_reference_id);
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching virtual account balance:', error);
    res.status(500).json({ error: error.message });
  }
};