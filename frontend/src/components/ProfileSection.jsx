import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut,
  CreditCard as Edit, Star, Award, Briefcase, MapPin, Phone, Mail
} from 'lucide-react';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const skills = ['Plumbing', 'Electrical Work', 'Construction', 'Delivery'];
  const achievements = [
    { title: 'Top Performer', description: '5-star rating for 3 months', icon: Star },
    { title: 'Skill Verified', description: 'Blockchain verified skills', icon: Award },
    { title: 'Reliable Worker', description: '100+ completed jobs', icon: Briefcase },
  ];

  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(profile?.address || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`http://localhost:5000/api/users/${user.user._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setAddress(profile?.address || '');
    setEmail(profile?.email || '');
    setError('');
  };
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Replace with your actual API call
      const res = await fetch(`http://localhost:5000/api/users/${profile._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ address, email }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updatedUser = await res.json();
      localStorage.setItem('user', JSON.stringify({ ...profile, ...updatedUser }));
      setEditing(false);
      window.location.reload();
    } catch (e) {
      setError('Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Replace with your actual sign out logic
  const handleSignOut = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex justify-between items-center pt-4 pb-6">
          <div className="text-2xl font-bold">{t('profile')}</div>
          <button className="p-2 bg-transparent border-none outline-none">
            <Edit size={20} color="#9CA3AF" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200"
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-gray-800"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-gray-900">
              <Shield size={16} color="#fff" />
            </div>
          </div>
          <div className="text-2xl font-bold mb-1">Priya Sharma</div>
          <div className="text-gray-400 text-base mb-5">Skilled Worker</div>
          <div className="flex items-center bg-gray-800 rounded-xl py-4 px-8 w-full max-w-md">
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-bold mb-1">4.8</div>
              <div className="text-xs text-gray-400">{t('rating')}</div>
            </div>
            <div className="w-px h-8 bg-gray-600 mx-4" />
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-bold mb-1">127</div>
              <div className="text-xs text-gray-400">{t('jobs_done')}</div>
            </div>
            <div className="w-px h-8 bg-gray-600 mx-4" />
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xl font-bold mb-1">₹45K</div>
              <div className="text-xs text-gray-400">{t('earned')}</div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">{t('contact_information')}</div>
          <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Phone size={20} color="#9CA3AF" />
              <span className="text-base">+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} color="#9CA3AF" />
              {editing ? (
                <input
                  type="email"
                  className="bg-gray-700 text-white rounded px-2 py-1 ml-2"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              ) : (
                <span className="text-base">{profile?.email || 'No email set'}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={20} color="#9CA3AF" />
              {editing ? (
                <input
                  type="text"
                  className="bg-gray-700 text-white rounded px-2 py-1 ml-2"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter address"
                />
              ) : (
                <span className="text-base">{profile?.address ? profile.address.split(',')[0] : 'City not set'}</span>
              )}
            </div>
            {editing && (
              <div className="flex gap-2 mt-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded" onClick={handleCancel} disabled={saving}>Cancel</button>
                {error && <span className="text-red-400 ml-2">{error}</span>}
              </div>
            )}
          </div>
          {!editing && (
            <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded" onClick={handleEdit}>Edit</button>
          )}
        </div>

        {/* Skills */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">{t('verified_skills_profile')}</div>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex items-center bg-gray-800 rounded-full px-4 py-2 gap-2"
              >
                <Shield size={14} color="#10B981" />
                <span className="text-sm font-medium">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">{t('achievements')}</div>
          {achievements.map((achievement, idx) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={idx}
                className="flex items-center bg-gray-800 rounded-xl p-4 mb-3 gap-4"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <IconComponent size={20} color="#F59E0B" />
                </div>
                <div>
                  <div className="font-semibold text-base">{achievement.title}</div>
                  <div className="text-gray-400 text-sm">{achievement.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Menu Options */}
        <div className="mb-8">
          <div className="text-lg font-bold mb-4">Settings</div>
          <button className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2">
            <span className="flex items-center gap-3">
              <User size={20} color="#9CA3AF" />
              <span className="text-base">{t('personal_information')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
          <button className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2">
            <span className="flex items-center gap-3">
              <Bell size={20} color="#9CA3AF" />
              <span className="text-base">{t('notifications_profile')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
          <button className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2">
            <span className="flex items-center gap-3">
              <Shield size={20} color="#9CA3AF" />
              <span className="text-base">{t('privacy_security')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
          <button className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2">
            <span className="flex items-center gap-3">
              <HelpCircle size={20} color="#9CA3AF" />
              <span className="text-base">{t('help_support')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
          <button className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2">
            <span className="flex items-center gap-3">
              <Settings size={20} color="#9CA3AF" />
              <span className="text-base">{t('app_settings')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
          <button
            className="w-full flex items-center justify-between bg-gray-800 rounded-xl p-4 mb-2"
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')}
          >
            <span className="flex items-center gap-3">
              <Settings size={20} color="#9CA3AF" />
              <span className="text-base">{t('toggle_language')}</span>
            </span>
            <span className="text-xl text-gray-400">&rsaquo;</span>
          </button>
        </div>

        {/* Logout */}
        <div className="mb-8">
          <button
            className="w-full flex items-center justify-center gap-3 bg-gray-800 rounded-xl p-4 border border-red-500"
            onClick={handleSignOut}
          >
            <LogOut size={20} color="#EF4444" />
            <span className="text-base font-semibold text-red-500">{t('sign_out')}</span>
          </button>
        </div>

        {/* App Version */}
        <div className="flex justify-center pb-8">
          <span className="text-xs text-gray-500">WorkerBuild v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
