import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../api';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
];

const getExperienceTag = (dateJoined, dateLeft) => {
    const start = new Date(dateJoined);
    const end = dateLeft ? new Date(dateLeft) : new Date();

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
        return 'Daily Wage';
    } else if (diffDays > 30 && diffDays <= 90) {
        return 'Contract';
    } else {
        return 'Long Term';
    }
};

export default function ProfilePage() {
  const userLocal = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const fetchUserProfile = async () => {
    if (!userLocal) return window.location.href = '/login';
    try {
      const res = await API.get('/users/profile');
      console.log('Profile data from backend:', res.data);
      setUser(res.data);
      setForm(res.data);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSave = async () => {
    try {
      const res = await API.put('/users/profile', form);
      setUser(res.data);
      setEditing(false);
    } catch {
      setError('Failed to update profile');
    }
  };
  const handleLanguage = async e => {
    try {
      const res = await API.put('/users/profile/language', { language: e.target.value });
      setUser(u => ({ ...u, language: res.data.language }));
    } catch {
      setError('Failed to update language');
    }
  };
  const handleNotifications = async () => {
    try {
      const res = await API.put('/users/profile/notifications', { notifications: !user.notifications });
      setUser(u => ({ ...u, notifications: res.data.notifications }));
    } catch {
      setError('Failed to update notifications');
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-xl mx-auto py-8 px-4">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">{user.name[0]}</div>
            <div>
              <div className="text-xl font-bold">{user.name}</div>
              <div className="text-gray-500 text-sm">{user.phone_number}</div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-semibold text-lg">{user.avgRating ? user.avgRating.toFixed(1) : 'N/A'}</span>
            </div>
          </div>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input name="address" value={form.address || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" placeholder="Enter address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={form.email || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" placeholder="Enter email" />
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded mt-2" onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Location display removed as per request */}
              <div className="text-gray-700">
                Address: {user.address ? user.address : 'Not set'}
              </div>
              {user.email && (
                <div className="text-gray-700">
                  Email: {user.email}
                </div>
              )}
              <button className="bg-blue-100 text-primary px-3 py-1 rounded text-xs mt-2" onClick={() => setEditing(true)}>Edit Info</button>
            </div>
          )}
        </motion.div>
        <motion.div className="bg-white rounded-2xl shadow-xl p-6 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="font-bold mb-2">Settings</div>
          <div className="flex items-center justify-between mb-3">
            <span>Notifications</span>
            <button
              className={`w-12 h-6 rounded-full ${user.notifications ? 'bg-primary' : 'bg-gray-300'} flex items-center transition`}
              onClick={handleNotifications}
            >
              <span className={`w-5 h-5 bg-white rounded-full shadow transform transition ${user.notifications ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              name="language"
              value={user.language}
              onChange={handleLanguage}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </motion.div>
        <motion.div className="bg-white rounded-2xl shadow-xl p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="font-bold mb-2">Ratings</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-semibold text-lg">{user.avgRating ? user.avgRating.toFixed(1) : 'N/A'}</span>
            <span className="text-gray-500 text-sm">({user.reviewCount} reviews)</span>
          </div>
          {user.false_accusation_count > 0 && (
            <p className="text-red-500 text-sm">False Accusations: {user.false_accusation_count}</p>
          )}
          {user.abuse_true_count > 0 && (
            <p className="text-red-500 text-sm">Abuse Confirmed: {user.abuse_true_count}</p>
          )}
          
        </motion.div>

        {user.role === 'seeker' && user.experiences && user.experiences.length > 0 && (
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Work Experience</h3>
            <ul className="list-disc pl-5 space-y-2">
              {user.experiences.map(exp => (
                <li key={exp._id}>
                  <strong>{exp.job_id ? exp.job_id.title : exp.job_description}</strong> ({new Date(exp.date_joined).toLocaleDateString()} - {exp.date_left ? new Date(exp.date_left).toLocaleDateString() : 'Present'})
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {getExperienceTag(exp.date_joined, exp.date_left)}
                  </span>
                  {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}
                  {exp.location && <p className="text-sm text-gray-500">Location: {exp.location}</p>}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {user.role === 'seeker' && (!user.experiences || user.experiences.length === 0) && (
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Work Experience</h3>
            <p>No work experience added yet.</p>
          </motion.div>
        )}

        {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
      </div>
    </div>
  );
}