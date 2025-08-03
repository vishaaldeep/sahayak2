import React, { useState, useEffect } from 'react';
import API from '../api'; // Import the configured API instance

const UserBankDetailsForm = ({ userId }) => {
  const [formData, setFormData] = useState({
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    account_holder_name: '',
    upi_vpa: '',
    pan: '',
    account_type: 'SAVINGS',
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await API.get(`/user-bank-details/${userId}`); // Use API instance
        if (response.data) {
          setFormData(response.data);
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error fetching bank details:', error);
        setMessage('No bank details found. Please add them.');
        setIsEditing(false);
      }
    };

    if (userId) {
      fetchBankDetails();
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, user_id: userId };
      const response = await API.post('/user-bank-details', payload);
      setMessage(response.data.message);
      setIsEditing(true);
    } catch (error) {
      console.error('Error saving bank details:', error);
      setMessage('Failed to save bank details.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Bank Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="account_holder_name" className="block text-sm font-medium text-gray-700">Account Holder Name</label>
          <input
            type="text"
            name="account_holder_name"
            id="account_holder_name"
            value={formData.account_holder_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">Account Number</label>
          <input
            type="text"
            name="account_number"
            id="account_number"
            value={formData.account_number}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="ifsc_code" className="block text-sm font-medium text-gray-700">IFSC Code</label>
          <input
            type="text"
            name="ifsc_code"
            id="ifsc_code"
            value={formData.ifsc_code}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            name="bank_name"
            id="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="upi_vpa" className="block text-sm font-medium text-gray-700">UPI VPA (Optional)</label>
          <input
            type="text"
            name="upi_vpa"
            id="upi_vpa"
            value={formData.upi_vpa}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="pan" className="block text-sm font-medium text-gray-700">PAN Number (Required for eNACH)</label>
          <input
            type="text"
            name="pan"
            id="pan"
            value={formData.pan}
            onChange={handleChange}
            placeholder="ABCDE1234F"
            pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">Account Type</label>
          <select
            name="account_type"
            id="account_type"
            value={formData.account_type}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="SAVINGS">Savings</option>
            <option value="CURRENT">Current</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isEditing ? 'Update Details' : 'Save Details'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-600 text-center">{message}</p>}
    </div>
    </div>
  );
};

export default UserBankDetailsForm;
