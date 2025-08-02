import React, { useState, useEffect } from 'react';
import API from '../api';

export default function LoanSuggestionPage() {
  const [loanSuggestion, setLoanSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchLoanSuggestion = async () => {
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const response = await API.post('/loans/suggest', { userId });
        setLoanSuggestion(response.data);
      } catch (err) {
        setError('Failed to fetch loan suggestion: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching loan suggestion:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoanSuggestion();
  }, [userId]);

  const handleApplyLoan = async () => {
    setApplyLoading(true);
    setApplyMessage('');
    setApplyError('');
    try {
      const payload = {
        user_id: userId,
        suggested_amount: loanSuggestion.suggested_amount,
        purpose: loanSuggestion.purpose,
        repayment_period_months: loanSuggestion.repayment_period_months,
        interest_rate: loanSuggestion.interest_rate,
        score_confidence: loanSuggestion.score_confidence,
        status: 'pending', // Initial status
      };
      await API.post('/loans', payload);
      setApplyMessage('Loan application submitted successfully!');
    } catch (err) {
      setApplyError('Failed to submit loan application: ' + (err.response?.data?.message || err.message));
      console.error('Error submitting loan application:', err);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading loan suggestion...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Loan Suggestion</h1>
      {loanSuggestion ? (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto space-y-4">
          <p><strong>Suggested Amount:</strong> ₹{loanSuggestion.suggested_amount}</p>
          <p><strong>Purpose:</strong> {loanSuggestion.purpose}</p>
          <p><strong>Repayment Period:</strong> {loanSuggestion.repayment_period_months} months</p>
          <p><strong>Interest Rate:</strong> {loanSuggestion.interest_rate}%</p>
          <p><strong>Score Confidence:</strong> {loanSuggestion.score_confidence * 100}%</p>
          <button
            onClick={handleApplyLoan}
            disabled={applyLoading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
          >
            {applyLoading ? 'Applying...' : 'Apply for this Loan'}
          </button>
          {applyMessage && <p className="text-green-500 text-center mt-4">{applyMessage}</p>}
          {applyError && <p className="text-red-500 text-center mt-4">{applyError}</p>}
        </div>
      ) : (
        <p className="text-center text-gray-500">No loan suggestion available at the moment.</p>
      )}
    </div>
  );
}
