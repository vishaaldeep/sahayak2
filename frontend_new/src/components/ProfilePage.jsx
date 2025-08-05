import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import API from '../api';


const schemes = [
  {
    id: 'eshram',
    name: 'e-Shram',
    image: 'https://www.uxdt.nic.in/wp-content/uploads/2024/07/e-shram-e-shram-01.jpg?x86456',
    applyUrl: 'https://eshram.gov.in/',
  },
  {
    id: 'pmjay',
    name: 'PM Jan Arogya Yojana',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM14i34pZNJ6lGEyd34mVLqMlE2j73Xrhgeg&s',
    applyUrl: 'https://pmjay.gov.in/',
  },
  {
    id: 'pmsym',
    name: 'Maan-dhan (PM-SYM)',
    image: 'https://media.umangapp.in/app/ico/service/maandhan.png',
    applyUrl: 'https://maandhan.in/',
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
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
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, loading: languageLoading } = useLanguage();
  const userLocal = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    const newLanguage = e.target.value;
    setError('');
    setSuccess('');
    
    try {
      // Update language in context (this will also update i18n and localStorage)
      await changeLanguage(newLanguage);
      
      // Update user state to reflect the change
      setUser(u => ({ ...u, language: newLanguage }));
      
      setSuccess(t('profile.languageUpdated') || 'Language updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update language:', error);
      setError(t('profile.languageUpdateError') || 'Failed to update language');
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

  if (!user) return <div className="min-h-screen flex items-center justify-center">{t('common.loading') || 'Loading...'}</div>;

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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name') || 'Full Name'}</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.city') || 'Location'}</label>
                <input name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.address') || 'Address'}</label>
                <input name="address" value={form.address || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" placeholder={t('profile.enterAddress') || 'Enter address'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email') || 'Email'}</label>
                <input name="email" value={form.email || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50" placeholder={t('profile.enterEmail') || 'Enter email'} />
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded mt-2" onClick={handleSave}>{t('common.save') || 'Save'}</button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Location display removed as per request */}
              <div className="text-gray-700">
                {t('common.address') || 'Address'}: {user.address ? user.address : t('profile.notSet') || 'Not set'}
              </div>
              {user.email && (
                <div className="text-gray-700">
                  {t('common.email') || 'Email'}: {user.email}
                </div>
              )}
              <button className="bg-blue-100 text-primary px-3 py-1 rounded text-xs mt-2" onClick={() => setEditing(true)}>{t('common.edit') || 'Edit Info'}</button>
            </div>
          )}
        </motion.div>
        <motion.div className="bg-white rounded-2xl shadow-xl p-6 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="font-bold mb-4">{t('common.settings') || 'Settings'}</div>
          
          <div className="flex items-center justify-between mb-4">
            <span>{t('notifications.title') || 'Notifications'}</span>
            <button
              className={`w-12 h-6 rounded-full ${user.notifications ? 'bg-primary' : 'bg-gray-300'} flex items-center transition`}
              onClick={handleNotifications}
            >
              <span className={`w-5 h-5 bg-white rounded-full shadow transform transition ${user.notifications ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.language') || 'Language'} / {t('profile.selectLanguage') || 'भाषा चुनें'}
            </label>
            <div className="relative">
              <select
                name="language"
                value={user.language || currentLanguage}
                onChange={handleLanguage}
                disabled={languageLoading}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-gray-50 text-base ${
                  languageLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } appearance-none`}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
              {languageLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('profile.languageChangeNote') || 'Website language will change immediately'}
            </p>
          </div>
          
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              ✗ {error}
            </div>
          )}
        </motion.div>
        <motion.div className="bg-white rounded-2xl shadow-xl p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="font-bold mb-2">{t('profile.ratings') || 'Ratings'}</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-lg">★</span>
            <span className="font-semibold text-lg">{user.avgRating ? user.avgRating.toFixed(1) : 'N/A'}</span>
            <span className="text-gray-500 text-sm">({user.reviewCount} reviews)</span>
          </div>
          {user.false_accusation_count > 0 && (
            <p className="text-red-500 text-sm">{t('profile.falseAccusations') || 'False Accusations'}: {user.false_accusation_count}</p>
          )}
          {user.abuse_true_count > 0 && (
            <p className="text-red-500 text-sm">{t('profile.abuseConfirmed') || 'Abuse Confirmed'}: {user.abuse_true_count}</p>
          )}
          
        </motion.div>

        {user.role === 'seeker' && user.experiences && user.experiences.length > 0 && (
          <motion.div className="bg-white rounded-2xl shadow-xl p-6 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{t('profile.workExperience') || 'Work Experience'}</h3>
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
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">{t('profile.workExperience') || 'Work Experience'}</h3>
            <p>{t('profile.noWorkExperience') || 'No work experience added yet.'}</p>
          </motion.div>
        )}

        {/* Government Schemes */}
{user.role === 'seeker' && (
  <motion.div
    className="bg-white rounded-2xl shadow-xl p-6 mt-6"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <div className="text-2xl font-semibold text-gray-700 mb-4">{t('government_schemes') || 'Government Schemes'}</div>
    {schemes.map((scheme) => (
      <div key={scheme.id} className="flex items-center bg-gray-50 rounded-xl p-4 mb-4 gap-4 shadow">
        <img src={scheme.image} alt={scheme.name} className="w-16 h-16 rounded-lg bg-gray-100 object-cover" />
        <div className="flex-1 flex justify-between items-center">
          <div className="font-semibold text-base text-gray-800">{scheme.name}</div>
          <button
            className="bg-green-500 rounded px-5 py-2 font-bold text-white hover:bg-green-600 transition"
            onClick={() => window.open(scheme.applyUrl, '_blank')}
          >
            {t('apply')}
          </button>
        </div>
      </div>
    ))}
  </motion.div>
)}


        {error && <div className="text-red-500 text-sm text-center mt-4">{error}</div>}
      </div>
    </div>
  );
}