import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../api';

export default function EmployerDashboard() {
  const [employerProfile, setEmployerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      try {
        const res = await API.get('/employer');
        setEmployerProfile(res.data);
      } catch (err) {
        setError('Failed to load employer profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerProfile();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-gray-800">
      <div className="max-w-xl mx-auto py-8 px-4">
        <motion.div className="bg-white rounded-2xl shadow-xl p-8 mb-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold mb-4">Employer Dashboard</h2>
          {employerProfile && (
            <div>
              <p className="text-lg">Welcome, {employerProfile.company_name}!
                {employerProfile.is_verified && (
                  <span className="text-green-600 ml-2">✅ Verified Employer</span>
                )}
              </p>
              <p className="text-gray-600">Company Type: {employerProfile.company_type}</p>
              <p className="text-gray-600">GSTIN: {employerProfile.gstin_number}</p>
              {/* Add more dashboard content here */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <ul className="list-disc list-inside">
                  <li><a href="/employer/profile" className="text-blue-500 hover:underline">View/Edit Profile</a></li>
                  <li><a href="/employer/post-job" className="text-blue-500 hover:underline">Post New Job</a></li>
                  <li><a href="/employer/my-jobs" className="text-blue-500 hover:underline">View My Job Listings</a></li>
                  <li><a href="/employer/ratings" className="text-blue-500 hover:underline">View Ratings & Feedback</a></li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}