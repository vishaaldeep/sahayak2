import React, { useState, useEffect } from 'react';
import API from '../api';

export default function LoanApplicationReview() {
  const [loanOffers, setLoanOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLoanOffers();
  }, []);

  const fetchLoanOffers = async () => {
    try {
      // Admin endpoint to get all loan offers
      const response = await API.get('/loans'); // This endpoint needs to be created/modified in backend
      setLoanOffers(response.data);
    } catch (err) {
      setError('Failed to fetch loan offers.');
      console.error('Error fetching loan offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (offerId, status) => {
    setMessage('');
    setError('');
    try {
      await API.put(`/loans/${offerId}/status`, { status });
      setMessage(`Loan offer ${status} successfully!`);
      fetchLoanOffers(); // Refresh list
    } catch (err) {
      setError(`Failed to update loan offer status to ${status}: ` + (err.response?.data?.message || err.message));
      console.error(`Error updating loan offer status to ${status}:`, err);
    }
  };

  const handleSuggestToUser = async (offerId, userId) => {
    setMessage('');
    setError('');
    try {
      // This endpoint needs to be created in backend for AI suggestion/matching
      await API.post(`/loans/${offerId}/suggest-to-investor`, { userId }); 
      setMessage(`Loan offer suggested to user ${userId} successfully!`);
    } catch (err) {
      setError(`Failed to suggest loan offer to user ${userId}: ` + (err.response?.data?.message || err.message));
      console.error(`Error suggesting loan offer to user ${userId}:`, err);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading loan offers...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Loan Application Review</h1>

      {loanOffers.length === 0 ? (
        <p className="text-center text-gray-500">No loan applications to review.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loanOffers.map((offer) => (
            <div key={offer._id} className="bg-white p-6 rounded-lg shadow-md space-y-3">
              <h2 className="text-xl font-bold">Amount: ₹{offer.suggested_amount}</h2>
              <p><strong>User ID:</strong> {offer.user_id}</p>
              <p><strong>Purpose:</strong> {offer.purpose}</p>
              <p><strong>Repayment Period:</strong> {offer.repayment_period_months} months</p>
              <p><strong>Interest Rate:</strong> {offer.interest_rate}%</p>
              {offer.user_id && offer.user_id.credit_score && (
                <p><strong>Credit Score:</strong> {offer.user_id.credit_score.score}</p>
              )}
              <p><strong>Status:</strong> <span className="font-semibold capitalize">{offer.status}</span></p>
              <div className="flex space-x-2 mt-4">
                {offer.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(offer._id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                )}
                {offer.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(offer._id, 'rejected')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                )}
                {offer.status === 'approved' && (
                  <>
                    <input
                      type="text"
                      placeholder="Investor User ID"
                      className="p-2 border rounded-md"
                      id={`investor-id-${offer._id}`}
                    />
                    <button
                      onClick={() => handleSuggestToUser(offer._id, document.getElementById(`investor-id-${offer._id}`).value)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    >
                      Suggest to Investor
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
