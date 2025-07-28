import React, { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    password: '',
    language: 'en',
    location: '',
    role: 'seeker',
    company_name: '',
    company_type: '',
    gstin_number: '',
  });
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setForm(f => ({
          ...f,
          location: {
            type: 'Point',
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          }
        })),
        () => setError('Could not get location')
      );
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let location = form.location;
      if (typeof location === 'string' && location.includes(',')) {
        const [lat, lng] = location.split(',').map(Number);
        location = { type: 'Point', coordinates: [lng, lat] };
      }
      const res = await API.post('/users/signup', {
        ...form,
        location,
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      setStep(1);
      setTimeout(() => {
        if (form.role === 'provider') {
          window.location.href = '/employer/profile';
        } else {
          window.location.href = '/skills';
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
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
          <div className="text-gray-500 text-sm mb-2">Your AI-Powered Work Assistant</div>
        </div>
        {step === 0 && (
          <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input name="phone_number" value={form.phone_number} onChange={handleChange} required maxLength={10} pattern="[0-9]{10}" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select name="language" value={form.language} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex gap-2">
                <input name="location" value={typeof form.location === 'string' ? form.location : (form.location.coordinates ? `${form.location.coordinates[1]},${form.location.coordinates[0]}` : '')} onChange={handleChange} placeholder="Auto or enter manually" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
                <button type="button" onClick={handleLocation} className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition">Auto</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50">
                <option value="seeker">Job Seeker</option>
                <option value="provider">Job Provider</option>
              </select>
            </div>
            {form.role === 'provider' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input name="company_name" value={form.company_name || ''} onChange={handleChange} required={form.role === 'provider'} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                  <select name="company_type" value={form.company_type || ''} onChange={handleChange} required={form.role === 'provider'} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50">
                    <option value="">Select Company Type</option>
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="startup">Startup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN Number</label>
                  <input name="gstin_number" value={form.gstin_number || ''} onChange={handleChange} required={form.role === 'provider'} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
                </div>
              </>
            )}
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button type="submit" className="w-full py-2 px-4 bg-primary hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition">{loading ? 'Signing up...' : 'Sign Up'}</button>
          </motion.form>
        )}
        {step === 1 && (
          <motion.div className="text-center py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-2xl font-bold text-primary mb-2">Welcome, {form.name}!</div>
            <div className="text-gray-600 mb-4">Your account has been created.<br />Redirecting to Skills...</div>
            <div className="w-12 h-12 mx-auto rounded-full bg-accent animate-pulse" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 