import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function AdminLoginPage() {
  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/admin/login', { phone_number, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <motion.h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>Sahaayak Admin</motion.h1>
          <div className="text-gray-500 text-sm mb-2">Admin Login Panel</div>
        </div>
        <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50"
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow">
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
}
