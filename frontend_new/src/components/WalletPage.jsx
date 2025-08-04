import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

import { useDbTranslation, formatCurrency, formatDate } from '../utils/translationHelpers';
import API, { fundWalletUpi, withdrawWalletUpi, createDecentroWallet, getDecentroWalletBalance } from '../api';
import UserBankDetailsForm from './UserBankDetailsForm';

export default function WalletPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { translateTransactionType, translateTransactionStatus } = useDbTranslation();
  

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [hasWallet, setHasWallet] = useState(true);
  const [showSavingsGoalPrompt, setShowSavingsGoalPrompt] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundVpa, setFundVpa] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawVpa, setWithdrawVpa] = useState('');
  const [withdrawBeneficiaryName, setWithdrawBeneficiaryName] = useState('');
  const [decentroBalance, setDecentroBalance] = useState(null);
  const [selectedTab, setSelectedTab] = useState('wallet'); // 'wallet' or 'bankDetails'
  const navigate = useNavigate();

  console.log('Current selectedTab:', selectedTab);
  console.log('User ID for bank details:', localStorage.getItem('userId'));

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(t('wallet.failedToLoadTransactions') || 'Failed to load transactions');
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await API.get('/wallet');
      console.log('Wallet API response data:', res.data);
      if (res.data && res.data.wallet) {
        setWallet(res.data.wallet);
        setSavingsGoal(res.data.wallet.monthly_savings_goal || 0);
        setHasWallet(true);
        if (res.data.wallet.decentro_virtual_account_id || res.data.wallet.decentro_reference_id) {
          try {
            const decentroRes = await getDecentroWalletBalance();
            setDecentroBalance(decentroRes.data.balance);
          } catch (decentroErr) {
            console.error('Failed to fetch Decentro balance:', decentroErr);
            setDecentroBalance('Error');
          }
        }
      } else {
        setHasWallet(false);
      }
    } catch (err) {
      setError(t('wallet.failedToLoadWallet') || 'Failed to load wallet');
      setHasWallet(false);
    }
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    setError('');
    try {
      await createDecentroWallet();
      alert(t('wallet.walletCreatedSuccess') || 'Wallet created successfully! Please refresh the page.');
      fetchWallet();
    } catch (err) {
      setError((t('wallet.failedToCreateWallet') || 'Failed to create wallet') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDecentroWallet = async () => {
    setLoading(true);
    setError('');
    try {
      await createDecentroWallet();
      alert(t('wallet.decentroWalletCreationInitiated') || 'Decentro wallet creation initiated. Please refresh the page after a moment.');
      fetchWallet();
    } catch (err) {
      setError((t('wallet.failedToCreateDecentroWallet') || 'Failed to create Decentro wallet') + ': ' + (err.response?.data?.message || err.message));
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

  const handleFundWalletUpi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fundWalletUpi({
        amount: parseFloat(fundAmount),
        virtualPaymentAddress: fundVpa,
        purpose: 'Fund Wallet via UPI',
      });
      alert(t('wallet.upiCollectionInitiated') || 'UPI collection initiated. Please complete the payment in your UPI app.');
      setFundAmount('');
      setFundVpa('');
      fetchWallet();
      fetchTransactions();
    } catch (err) {
      setError((t('wallet.failedToInitiateUpiCollection') || 'Failed to initiate UPI collection') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawWalletUpi = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await withdrawWalletUpi({
        amount: parseFloat(withdrawAmount),
        beneficiaryVpa: withdrawVpa,
        beneficiaryName: withdrawBeneficiaryName,
      });
      alert(t('wallet.upiPayoutInitiated') || 'UPI payout initiated. Funds should reflect in your account shortly.');
      setWithdrawAmount('');
      setWithdrawVpa('');
      setWithdrawBeneficiaryName('');
      fetchWallet();
      fetchTransactions();
    } catch (err) {
      setError((t('wallet.failedToInitiateUpiPayout') || 'Failed to initiate UPI payout') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  

  const handleUpdateSavingsGoal = async () => {
    setLoading(true);
    setError('');
    try {
      await API.put('/wallet/savings-goal', { monthly_savings_goal: savingsGoal });
      alert(t('wallet.savingsGoalUpdated') || 'Savings goal updated successfully!');
      setShowSavingsGoalPrompt(false);
      fetchWallet();
    } catch (err) {
      setError((t('wallet.failedToUpdateSavingsGoal') || 'Failed to update savings goal') + ': ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-background text-gray-800 flex items-center justify-center">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 text-center" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-2xl font-bold mb-4">{t('wallet.welcome') || 'Welcome!'}</div>
          <p className="mb-6">{t('wallet.noWalletMessage') || "It looks like you don't have a wallet yet. Create one to start managing your funds and explore investment opportunities."}</p>
          <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleCreateWallet} disabled={loading}>
            {loading ? (t('wallet.creatingWallet') || 'Creating Wallet...') : (t('wallet.createMyWallet') || 'Create My Wallet')}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 text-center font-semibold rounded-t-lg ${selectedTab === 'wallet' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('wallet')}
          >
            {t('wallet.myWallet') || 'My Wallet'}
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold rounded-t-lg ${selectedTab === 'bankDetails' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setSelectedTab('bankDetails')}
          >
            {t('wallet.bankDetails') || 'Bank Details'}
          </button>
        </div>

        {selectedTab === 'wallet' && (
          <>
            <motion.div className="bg-white rounded-2xl shadow-xl p-8 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-2xl font-bold mb-4">{t('wallet.title') || 'Wallet'}</div>
              <div className="text-4xl font-bold text-primary mb-4">{formatCurrency(wallet ? wallet.balance : 0, currentLanguage)}</div>
              {wallet && wallet.decentro_virtual_account_id && (
                <div className="text-gray-600 text-sm mb-4">
                  <p>{t('wallet.virtualAccountUpiId') || 'Virtual Account UPI ID'}: <span className="font-semibold">{wallet.decentro_virtual_account_id}</span></p>
                  {wallet.decentro_reference_id && (
                    <p>{t('wallet.referenceId') || 'Reference ID'}: <span className="font-semibold">{wallet.decentro_reference_id}</span></p>
                  )}
                </div>
              )}
              {decentroBalance !== null && (
                <p className="text-gray-600 text-sm mb-4">{t('wallet.decentroBalance') || 'Decentro Balance'}: <span className="font-semibold">{formatCurrency(decentroBalance, currentLanguage)}</span></p>
              )}

              {!wallet || !wallet.decentro_virtual_account_id ? (
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition" onClick={handleCreateDecentroWallet} disabled={loading}>
                  {loading ? (t('wallet.creatingDecentroWallet') || 'Creating Decentro Wallet...') : (t('wallet.createDecentroWallet') || 'Create Decentro Wallet')}
                </button>
              ) : (
                <>
                  <div className="mt-6 p-4 border rounded-lg shadow-sm bg-blue-50">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">{t('wallet.fundWalletViaUpi') || 'Fund Wallet via UPI'}</h3>
                    <form onSubmit={handleFundWalletUpi} className="space-y-4">
                      <div>
                        <label htmlFor="fundAmount" className="block text-sm font-medium text-blue-700">{t('common.amount') || 'Amount'}</label>
                        <input
                          type="number"
                          id="fundAmount"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          required
                          min="1"
                          step="0.01"
                          className="mt-1 block w-full p-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="fundVpa" className="block text-sm font-medium text-blue-700">{t('wallet.yourUpiId') || 'Your UPI ID (VPA)'}</label>
                        <input
                          type="text"
                          id="fundVpa"
                          value={fundVpa}
                          onChange={(e) => setFundVpa(e.target.value)}
                          required
                          className="mt-1 block w-full p-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition" disabled={loading}>
                        {loading ? (t('wallet.initiating') || 'Initiating...') : (t('wallet.fundWallet') || 'Fund Wallet')}
                      </button>
                    </form>
                  </div>

                  <div className="mt-6 p-4 border rounded-lg shadow-sm bg-green-50">
                    <h3 className="text-xl font-bold text-green-800 mb-4">{t('wallet.withdrawFromWalletViaUpi') || 'Withdraw from Wallet via UPI'}</h3>
                    <form onSubmit={handleWithdrawWalletUpi} className="space-y-4">
                      <div>
                        <label htmlFor="withdrawAmount" className="block text-sm font-medium text-green-700">{t('common.amount') || 'Amount'}</label>
                        <input
                          type="number"
                          id="withdrawAmount"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          required
                          min="1"
                          step="0.01"
                          className="mt-1 block w-full p-2 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="withdrawVpa" className="block text-sm font-medium text-green-700">{t('wallet.beneficiaryUpiId') || 'Beneficiary UPI ID (VPA)'}</label>
                        <input
                          type="text"
                          id="withdrawVpa"
                          value={withdrawVpa}
                          onChange={(e) => setWithdrawVpa(e.target.value)}
                          required
                          className="mt-1 block w-full p-2 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="withdrawBeneficiaryName" className="block text-sm font-medium text-green-700">{t('wallet.beneficiaryName') || 'Beneficiary Name'}</label>
                        <input
                          type="text"
                          id="withdrawBeneficiaryName"
                          value={withdrawBeneficiaryName}
                          onChange={(e) => setWithdrawBeneficiaryName(e.target.value)}
                          required
                          className="mt-1 block w-full p-2 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition" disabled={loading}>
                        {loading ? (t('wallet.initiating') || 'Initiating...') : (t('wallet.withdrawFunds') || 'Withdraw Funds')}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </motion.div>

            {/* Investment Options Section */}
            <motion.div className="bg-green-100 rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="text-2xl font-bold mb-4">{t('wallet.investmentOpportunities') || 'Investment Opportunities'}</div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{t('wallet.fixedDepositInvestments') || 'Fixed Deposit (FD) Investments'}</h3>
                <p className="text-gray-600">{t('wallet.fdDescription') || 'Explore secure FD options with competitive interest rates to grow your savings.'}</p>
                <button className="mt-3 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition" onClick={() => handleInvestmentClick('FD')}>
                  {t('wallet.viewFdOptions') || 'View FD Options'}
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{t('wallet.secureZeroRiskInvestments') || 'Secure 0-Risk Investments'}</h3>
                <p className="text-gray-600">{t('wallet.zeroRiskDescription') || 'Discover investment avenues that offer guaranteed returns with no risk to your capital.'}</p>
                <button className="mt-3 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={() => handleInvestmentClick('0-Risk')}>
                  {t('wallet.exploreZeroRiskOptions') || 'Explore 0-Risk Options'}
                </button>
              </div>
            </motion.div>

            <motion.div className="bg-white rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="font-bold mb-2">{t('wallet.transactionHistory') || 'Transaction History'}</div>
              {transactions.length === 0 ? (
                <div className="text-gray-500">{t('wallet.noTransactionsYet') || 'No transactions yet.'}</div>
              ) : (
                <ul>
                  {transactions.map((tx) => (
                    <li key={tx._id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <div className="font-semibold">{tx.type === 'credit' ? (t('wallet.addedToWallet') || 'Added to wallet') : (t('wallet.spent') || 'Spent')}</div>
                        <div className="text-sm text-gray-500">{formatDate(tx.createdAt, currentLanguage)}</div>
                      </div>
                      <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount, currentLanguage)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            <motion.div className="bg-green-100 rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="font-bold mb-2">{t('wallet.monthlySavingsGoal') || 'Monthly Savings Goal'}</div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-semibold">{formatCurrency(savingsGoal, currentLanguage)}</div>
                <input type="number" value={savingsGoal} onChange={(e) => setSavingsGoal(Number(e.target.value))} className="w-24 border rounded px-2 py-1 text-center" />
              </div>
              <button className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition" onClick={handleUpdateSavingsGoal} disabled={loading}>
                {loading ? (t('wallet.saving') || 'Saving...') : (t('wallet.setSavingsGoal') || 'Set Savings Goal')}
              </button>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${wallet && savingsGoal > 0 ? (wallet.balance / savingsGoal) * 100 : 0}%` }}></div>
              </div>
              <div className="text-sm text-center mt-2">{t('wallet.savedPercentage', { percentage: wallet && savingsGoal > 0 ? ((wallet.balance / savingsGoal) * 100).toFixed(0) : 0 }) || `You have saved ${wallet && savingsGoal > 0 ? ((wallet.balance / savingsGoal) * 100).toFixed(0) : 0}% of your goal.`}</div>
            </motion.div>
          </>
        )}

        {selectedTab === 'bankDetails' && wallet && (
          <UserBankDetailsForm userId={wallet.user_id} />
        )}

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
    </motion.div>
  );
}