import React, { useState, useEffect } from 'react';
import API from '../api';

const SetupRecurringPayment = ({ employerId }) => {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [message, setMessage] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [selectedSeeker, setSelectedSeeker] = useState('');
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeekers = async () => {
      try {
        const res = await API.get('/users/seekers'); // Assuming an endpoint to get seekers
        setSeekers(res.data);
      } catch (error) {
        console.error('Error fetching seekers:', error);
      }
    };

    const fetchRecurringPayments = async () => {
      try {
        const res = await API.get(`/recurring-payments/employer/${employerId}`);
        setRecurringPayments(res.data);
      } catch (error) {
        console.error('Error fetching recurring payments:', error);
      }
    };

    fetchSeekers();
    if (employerId) {
      fetchRecurringPayments();
    }
  }, [employerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const response = await API.post('/recurring-payments', {
        employer_id: employerId,
        seeker_id: selectedSeeker,
        amount: parseFloat(amount),
        frequency,
      });
      setMessage(response.data.message);
      // Refresh the list of recurring payments
      const paymentsRes = await API.get(`/recurring-payments/employer/${employerId}`);
      setRecurringPayments(paymentsRes.data);
      setAmount('');
      setSelectedSeeker('');
    } catch (error) {
      console.error('Error setting up recurring payment:', error);
      setMessage('Failed to set up recurring payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading recurring payment setup...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Setup Recurring Payment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="seeker" className="block text-sm font-medium text-gray-700">Select Employee</label>
          <select
            id="seeker"
            value={selectedSeeker}
            onChange={(e) => setSelectedSeeker(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select an employee --</option>
            {seekers.map((seeker) => (
              <option key={seeker._id} value={seeker._id}>
                {seeker.name} ({seeker.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Setting Up...' : 'Setup Payment'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      <h3 className="text-xl font-bold mt-8 mb-4">Existing Recurring Payments</h3>
      {recurringPayments.length === 0 ? (
        <p className="text-gray-600">No recurring payments set up yet.</p>
      ) : (
        <ul className="space-y-2">
          {recurringPayments.map((payment) => (
            <li key={payment._id} className="bg-gray-50 p-3 rounded-md shadow-sm">
              <p><strong>Employee:</strong> {payment.seeker_id ? payment.seeker_id.name : 'N/A'}</p>
              <p><strong>Amount:</strong> ₹{payment.amount}</p>
              <p><strong>Frequency:</strong> {payment.frequency}</p>
              <p><strong>Status:</strong> {payment.status}</p>
              <p><strong>Next Payment:</strong> {new Date(payment.next_payment_date).toLocaleDateString()}</p>
              {payment.decentro_mandate_id && <p><strong>Decentro Mandate ID:</strong> {payment.decentro_mandate_id}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SetupRecurringPayment;
