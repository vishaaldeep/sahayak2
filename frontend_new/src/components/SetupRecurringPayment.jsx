import React, { useState, useEffect } from 'react';
import API, { createRecurringPayment, getEmployerRecurringPayments, checkMandateStatus, executePayment } from '../api';

// Component for individual recurring payment card
const RecurringPaymentCard = ({ payment, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckStatus = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await checkMandateStatus(payment._id);
      setMessage(`Status updated: ${response.data.recurringPayment.status}`);
      onRefresh(); // Refresh the list
    } catch (error) {
      setMessage('Error checking status: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExecutePayment = async () => {
    if (!window.confirm(`Execute payment of ₹${payment.amount}?`)) return;
    
    setLoading(true);
    setMessage('');
    try {
      const response = await executePayment(payment._id, { amount: payment.amount });
      setMessage('Payment executed successfully!');
      onRefresh(); // Refresh the list
    } catch (error) {
      setMessage('Error executing payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending_authentication': return 'text-yellow-600 bg-yellow-100';
      case 'pending_approval': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <li className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><strong>Employee:</strong> {payment.seeker_id ? payment.seeker_id.name : 'N/A'}</p>
          <p><strong>Amount:</strong> ₹{payment.amount}</p>
          <p><strong>Frequency:</strong> {payment.frequency}</p>
          <p><strong>Next Payment:</strong> {new Date(payment.next_payment_date).toLocaleDateString()}</p>
        </div>
        <div>
          <div className="mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
              {payment.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          {payment.decentro_mandate_id && (
            <p className="text-sm text-gray-600 mb-2">
              <strong>Mandate ID:</strong> {payment.decentro_mandate_id}
            </p>
          )}
          {payment.authentication_url && payment.status === 'pending_authentication' && (
            <div className="mb-2">
              <a 
                href={payment.authentication_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Complete Authentication
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleCheckStatus}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
        
        {payment.status === 'active' && (
          <button
            onClick={handleExecutePayment}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Execute Payment'}
          </button>
        )}
      </div>
      
      {message && (
        <div className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </div>
      )}
    </li>
  );
};

const SetupRecurringPayment = ({ employerId }) => {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [message, setMessage] = useState('');
  const [seekers, setSeekers] = useState([]);
  const [selectedSeeker, setSelectedSeeker] = useState('');
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecurringPayments = async () => {
    try {
      const res = await getEmployerRecurringPayments(employerId);
      setRecurringPayments(res.data);
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
    }
  };

  useEffect(() => {
    const fetchSeekers = async () => {
      try {
        const res = await API.get('/users/seekers'); // Assuming an endpoint to get seekers
        setSeekers(res.data);
      } catch (error) {
        console.error('Error fetching seekers:', error);
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
      const response = await createRecurringPayment({
        employer_id: employerId,
        seeker_id: selectedSeeker,
        amount: parseFloat(amount),
        frequency,
      });
      
      setMessage(response.data.message);
      
      // If authentication URL is provided, show it to user
      if (response.data.authentication_url) {
        setMessage(response.data.message + ' Please complete authentication using the provided URL.');
        // You can open the authentication URL in a new window
        window.open(response.data.authentication_url, '_blank');
      }
      
      // Refresh the list of recurring payments
      await fetchRecurringPayments();
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
        <ul className="space-y-4">
          {recurringPayments.map((payment) => (
            <RecurringPaymentCard key={payment._id} payment={payment} onRefresh={fetchRecurringPayments} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default SetupRecurringPayment;
