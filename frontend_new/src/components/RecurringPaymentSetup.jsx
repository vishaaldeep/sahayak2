import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RecurringPaymentSetup = ({ onClose, onSuccess, employees = [] }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    amount: '',
    frequency: 'daily',
    interval_value: 1,
    description: '',
    max_payments: '',
    payment_method: 'UPI'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const frequencyOptions = [
    { value: 'minutes', label: 'Minutes', description: 'For testing - payments every few minutes' },
    { value: 'hours', label: 'Hours', description: 'Hourly payments' },
    { value: 'daily', label: 'Daily', description: 'Daily payments' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly payments' },
    { value: 'monthly', label: 'Monthly', description: 'Monthly payments' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    if (formData.interval_value <= 0) {
      newErrors.interval_value = 'Interval must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/mock-recurring-payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          interval_value: parseInt(formData.interval_value),
          max_payments: formData.max_payments ? parseInt(formData.max_payments) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data);
      } else {
        setErrors({ submit: data.error || 'Failed to create recurring payment' });
      }
    } catch (error) {
      console.error('Error creating recurring payment:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Setup Recurring Payment</h2>
              <p className="text-blue-100 mt-1">Create automated payments for your employees</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose an employee...</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              placeholder="Enter amount"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Frequency *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Interval Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Every {formData.frequency === 'minutes' ? 'Minutes' : 
                     formData.frequency === 'hours' ? 'Hours' :
                     formData.frequency === 'daily' ? 'Days' :
                     formData.frequency === 'weekly' ? 'Weeks' : 'Months'}
            </label>
            <input
              type="number"
              name="interval_value"
              value={formData.interval_value}
              onChange={handleInputChange}
              min="1"
              placeholder="1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.interval_value ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.interval_value && (
              <p className="text-red-500 text-sm mt-1">{errors.interval_value}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Payment will be made every {formData.interval_value} {formData.frequency}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Monthly salary, Daily wages, Project payment"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Max Payments (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Payments (Optional)
            </label>
            <input
              type="number"
              name="max_payments"
              value={formData.max_payments}
              onChange={handleInputChange}
              min="1"
              placeholder="Leave empty for unlimited"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-sm mt-1">
              If set, payments will stop after this many payments
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Digital Wallet">Digital Wallet</option>
            </select>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Recurring Payment'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RecurringPaymentSetup;