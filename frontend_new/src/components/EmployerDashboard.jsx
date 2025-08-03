import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import API from '../api';
import SetupRecurringPayment from './SetupRecurringPayment';
import RatingModal from './RatingModal';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [employerProfile, setEmployerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiredSeekers, setHiredSeekers] = useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [currentRatingProps, setCurrentRatingProps] = useState({});

  const fetchEmployerData = async () => {
    try {
      const employerRes = await API.get('/employer');
      setEmployerProfile(employerRes.data);

      const hiredSeekersRes = await API.get(`/user-experiences/hired-seekers/${employerRes.data.user_id}`);
      setHiredSeekers(hiredSeekersRes.data);

    } catch (err) {
      setError('Failed to load employer data.');
      console.error('Error fetching employer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const openRatingModal = (jobId, receiverId) => {
    setCurrentRatingProps({
      job_id: jobId,
      giver_user_id: user._id,
      receiver_user_id: receiverId,
      role_of_giver: user.role,
    });
    setIsRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setIsRatingModalOpen(false);
    setCurrentRatingProps({});
    fetchEmployerData(); // Refresh data after rating
  };

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
                  <li><a href="/employer-profile" className="text-blue-500 hover:underline">View/Edit Profile</a></li>
                  <li><a href="/post-job" className="text-blue-500 hover:underline">Post New Job</a></li>
                  <li><a href="/jobs" className="text-blue-500 hover:underline">View My Job Listings</a></li>
                  <li><a href="/employer-agreements" className="text-blue-500 hover:underline">View Agreements</a></li>
                  <li><a href="/wallet" className="text-blue-500 hover:underline">View Wallet</a></li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {employerProfile && (
          <motion.div className="bg-white rounded-2xl shadow-xl p-8 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <SetupRecurringPayment employerId={employerProfile.user_id} />
          </motion.div>
        )}

        {employerProfile && hiredSeekers.length > 0 && (
          <motion.div className="bg-white rounded-2xl shadow-xl p-8 mt-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 className="text-2xl font-bold mb-4">Past Employees</h3>
            <ul className="space-y-4">
              {hiredSeekers.map(seekerExp => (
                <li key={seekerExp._id} className="p-4 border rounded-md shadow-sm">
                  <p><strong>Employee:</strong> {seekerExp.seeker_id.name} ({seekerExp.seeker_id.email})</p>
                  <p><strong>Job:</strong> {seekerExp.job_id.title}</p>
                  <p><strong>Dates:</strong> {new Date(seekerExp.date_joined).toLocaleDateString()} - {seekerExp.date_left ? new Date(seekerExp.date_left).toLocaleDateString() : 'Present'}</p>
                  {seekerExp.date_left && (
                    <button
                      onClick={() => openRatingModal(seekerExp.job_id._id, seekerExp.seeker_id._id)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                    >
                      Give Rating to {seekerExp.seeker_id.name}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
      {isRatingModalOpen && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={closeRatingModal}
          job_id={currentRatingProps.job_id}
          giver_user_id={currentRatingProps.giver_user_id}
          receiver_user_id={currentRatingProps.receiver_user_id}
          role_of_giver={currentRatingProps.role_of_giver}
        />
      )}
    </div>
  );
}