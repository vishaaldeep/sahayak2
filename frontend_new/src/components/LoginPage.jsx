import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api';

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone_number: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/users/login', form);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user._id); // Store userId explicitly
      // Fetch user skills
      const skillsRes = await API.get(`/user-skills/${res.data.user._id}`);
      if (skillsRes.data.length === 0) {
        window.location.href = '/skills';
      } else {
        window.location.href = '/profile';
      }
    } catch (err) {
      setError(err.response?.data?.error || t('auth.loginError') || 'Login failed');
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
          <motion.h1 className="text-3xl font-extrabold text-primary mb-2 tracking-tight" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>Sahaayak</motion.h1>
          <div className="text-gray-500 text-sm mb-2">{t('auth.aiPoweredAssistant') || 'Your AI-Powered Work Assistant'}</div>
        </div>
        <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phoneNumber') || 'Mobile Number'}</label>
            <input name="phone_number" value={form.phone_number} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password') || 'Password'}</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.role') || 'Role'}</label>
            <input value={t('auth.seeker') || 'job seeker'} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-400" />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition">{loading ? (t('auth.loggingIn') || 'Logging in...') : (t('auth.signIn') || 'Login')}</button>
        </motion.form>
        <div className="text-center text-sm text-gray-600 mt-6">
          {t('auth.dontHaveAccount') || "Don't have an account?"} <a href="/signup" className="text-blue-500 hover:underline font-medium">{t('auth.signUp') || 'Sign up'}</a>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {t('auth.areYouAdmin') || 'Are you an admin?'} <a href="/admin/login" className="text-blue-500 hover:underline font-medium">{t('auth.adminLogin') || 'Admin Login'}</a>
        </div>
      </motion.div>
    </div>
  );
} 