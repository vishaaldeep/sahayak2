import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RecurringPaymentSetup from './RecurringPaymentSetup';

const RecurringPaymentDashboard = () => {
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchRecurringPayments();
    fetchEmployees();
  }, []);

  const fetchRecurringPayments = async () => {
    try {
      const response = await fetch('/api/mock-recurring-payments/employer', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecurringPayments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Fetch employees/seekers who have applied to jobs
      const response = await fetch('/api/users?role=seeker', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSetupSuccess = (data) => {
    setShowSetupModal(false);
    fetchRecurringPayments();
    
    // Show success message
    alert(`Recurring payment flow created successfully!\nFlow ID: ${data.data.decentro_response.flow_id}\nNext payment: ${new Date(data.data.decentro_response.next_payment_date).toLocaleString()}`);
  };

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      const response = await fetch(`/api/mock-recurring-payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchRecurringPayments();
        alert(`Payment ${status} successfully!`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const triggerManualPayment = async (paymentId) => {
    try {
      const response = await fetch(`/api/mock-recurring-payments/${paymentId}/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        fetchRecurringPayments();
        alert(`Manual payment processed successfully!\nTransaction ID: ${data.data.transaction.transaction_id}\nAmount: ₹${data.data.payment_record.amount}`);
      }
    } catch (error) {
      console.error('Error triggering manual payment:', error);
      alert('Failed to process manual payment');
    }
  };

  const viewPaymentHistory = async (payment) => {
    try {
      const response = await fetch(`/api/mock-recurring-payments/${payment._id}/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPayment(payment);
        setPaymentHistory(data.data.payment_history || []);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Failed to fetch payment history');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyText = (frequency, intervalValue) => {
    const unit = frequency === 'minutes' ? 'minute' :
                 frequency === 'hours' ? 'hour' :
                 frequency === 'daily' ? 'day' :
                 frequency === 'weekly' ? 'week' : 'month';
    
    return intervalValue === 1 ? 
      `Every ${unit}` : 
      `Every ${intervalValue} ${unit}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Payments</h1>
          <p className="text-gray-600 mt-2">Manage automated payments for your employees</p>
        </div>
        <button
          onClick={() => setShowSetupModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Setup New Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {recurringPayments.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{recurringPayments.reduce((sum, p) => sum + p.total_amount_paid, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {recurringPayments.reduce((sum, p) => sum + p.total_payments_made, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(recurringPayments.map(p => p.employee_id._id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment Schedules</h2>
        </div>

        {recurringPayments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No recurring payments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first recurring payment.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowSetupModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Setup Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recurringPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.employee_id.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.employee_id.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFrequencyText(payment.frequency, payment.interval_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.status === 'active' ? 
                        new Date(payment.next_payment_date).toLocaleString() : 
                        '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{payment.total_amount_paid.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.total_payments_made} payments
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => viewPaymentHistory(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        History
                      </button>
                      
                      {payment.status === 'active' && (
                        <>
                          <button
                            onClick={() => triggerManualPayment(payment._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Pay Now
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(payment._id, 'paused')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Pause
                          </button>
                        </>
                      )}
                      
                      {payment.status === 'paused' && (
                        <button
                          onClick={() => updatePaymentStatus(payment._id, 'active')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resume
                        </button>
                      )}
                      
                      {(payment.status === 'active' || payment.status === 'paused') && (
                        <button
                          onClick={() => updatePaymentStatus(payment._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <RecurringPaymentSetup
            onClose={() => setShowSetupModal(false)}
            onSuccess={handleSetupSuccess}
            employees={employees}
          />
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Payment History</h2>
                    <p className="text-blue-100 mt-1">
                      {selectedPayment?.employee_id.name} - {selectedPayment?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {paymentHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No payments made yet</p>
                ) : (
                  <div className="space-y-4">
                    {paymentHistory.map((payment, index) => (
                      <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.payment_date).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {payment.payment_id}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'success' ? 'bg-green-100 text-green-800' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            TXN: {payment.transaction_id}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecurringPaymentDashboard;