import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '../api';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [hasWallet, setHasWallet] = useState(true);
  const [showSavingsGoalPrompt, setShowSavingsGoalPrompt] = useState(false); // New state for prompt
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await API.get('/wallet');
      console.log('Wallet API response data:', res.data);
      if (res.data && res.data._id) {
        setWallet(res.data);
        setSavingsGoal(res.data.monthly_savings_goal || 0); // Set savings goal from wallet
        setHasWallet(true);
      } else {
        setHasWallet(false);
      }
    } catch (err) {
      setError('Failed to load wallet');
      setHasWallet(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/wallet/transactions');
      setTransactions(res.data);
    } catch {
      setError('Failed to load transactions');
    }
  };

  const handleAddMoney = async (amount) => {
    setLoading(true);
    setError('');
    try {
      await API.post('/wallet/add', { amount });
      fetchWallet();
      fetchTransactions();
    } catch (err) {
      setError('Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSavingsGoal = async () => {
    setLoading(true);
    setError('');
    try {
      await API.put('/wallet/savings-goal', { savings_goal: savingsGoal });
      fetchWallet();
      setShowSavingsGoalPrompt(false); // Close prompt on success
    } catch (err) {
      setError('Failed to update savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/wallet/create');
      setHasWallet(true);
      fetchWallet();
    } catch (err) {
      setError('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentClick = () => {
    if (wallet && wallet.monthly_savings_goal > 0) {
      navigate('/investment-analyzer', { state: { monthly_savings_goal: wallet.monthly_savings_goal } });
    } else {
      setShowSavingsGoalPrompt(true);
    }
  };

  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-background text-gray-800 flex items-center justify-center">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 text-center" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-2xl font-bold mb-4">Welcome!</div>
          <p className="mb-6">It looks like you don't have a wallet yet. Create one to start managing your funds and explore investment opportunities.</p>
          <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleCreateWallet} disabled={loading}>
            {loading ? 'Creating Wallet...' : 'Create My Wallet'}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-xl mx-auto py-8 px-4">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-2xl font-bold mb-4">Wallet</div>
          <div className="text-4xl font-bold text-primary mb-4">₹{wallet ? wallet.balance : '0.00'}</div>
          <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={() => handleAddMoney(100)} disabled={loading}>
            {loading ? 'Processing...' : 'Add ₹100 to Wallet'}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
        </motion.div>

        {/* Investment Options Section */}
        <motion.div className="bg-green-100 rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="text-2xl font-bold mb-4">Investment Opportunities</div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Fixed Deposit (FD) Investments</h3>
            <p className="text-gray-600">Explore secure FD options with competitive interest rates to grow your savings.</p>
            <button className="mt-3 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition" onClick={handleInvestmentClick}>
              View FD Options
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Secure 0-Risk Investments</h3>
            <p className="text-gray-600">Discover investment avenues that offer guaranteed returns with no risk to your capital.</p>
            <button className="mt-3 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleInvestmentClick}>
              Explore 0-Risk Options
            </button>
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="font-bold mb-2">Transaction History</div>
          {transactions.length === 0 ? (
            <div className="text-gray-500">No transactions yet.</div>
          ) : (
            <ul>
              {transactions.map((tx) => (
                <li key={tx._id} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-semibold">{tx.type === 'credit' ? 'Added to wallet' : 'Spent'}</div>
                    <div className="text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
        <motion.div className="bg-green-100 rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="font-bold mb-2">Monthly Savings Goal</div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">₹{savingsGoal}</div>
            <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(Number(e.target.value))} className="w-24 border rounded px-2 py-1 text-center" />
          </div>
          <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleUpdateSavingsGoal} disabled={loading}>
            {loading ? 'Saving...' : 'Set Savings Goal'}
          </button>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${wallet && savingsGoal > 0 ? (wallet.balance / savingsGoal) * 100 : 0}%` }}></div>
          </div>
          <div className="text-sm text-center mt-2">You have saved {wallet && savingsGoal > 0 ? ((wallet.balance / savingsGoal) * 100).toFixed(0) : 0}% of your goal.</div>
        </motion.div>

        {showSavingsGoalPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div className="bg-white rounded-2xl shadow-xl p-8 text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-2xl font-bold mb-4">Set Your Savings Goal</div>
              <p className="mb-6">Please set a monthly savings goal before exploring investment options.</p>
              <input
                type="number"
                placeholder="Enter monthly savings goal"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(Number(e.target.value))}
                className="w-full border rounded px-4 py-2 mb-4"
              />
              <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleUpdateSavingsGoal} disabled={loading}>
                {loading ? 'Saving...' : 'Set Goal and Continue'}
              </button>
              {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
