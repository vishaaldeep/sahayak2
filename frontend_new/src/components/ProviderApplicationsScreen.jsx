import React, { useEffect, useState } from 'react';
import API, { updateApplicationStatus } from '../api';
import SeekerProfileView from './SeekerProfileView';

const ProviderApplicationsScreen = ({ employerId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSeekerProfileModal, setShowSeekerProfileModal] = useState(false);
  const [selectedSeekerUserId, setSelectedSeekerUserId] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await API.get(`/applications/employer/${employerId}`);
      setApplications(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      fetchApplications(); // Refresh applications after update
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status.');
    }
  };

  const handleViewSeekerProfile = (seekerUserId) => {
    setSelectedSeekerUserId(seekerUserId);
    setShowSeekerProfileModal(true);
  };

  if (loading) return <div className="text-center p-8">Loading applications...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error loading applications: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Job Applications</h2>
      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No applications found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-6 text-left">Job Title</th>
                <th className="py-3 px-6 text-left">Seeker Name</th>
                <th className="py-3 px-6 text-left">Seeker Email</th>
                <th className="py-3 px-6 text-left">Seeker Phone</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Date Applied</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {applications.map(app => (
                <tr key={app._id} className="border-b border-gray-200 hover:bg-gray-100 transition-transform transform hover:scale-102 duration-300">
                  <td className="py-4 px-6">{app.job_id ? app.job_id.title : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.username : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.email : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.phone_number : 'N/A'}</td>
                  <td className="py-4 px-6">{app.status}</td>
                  <td className="py-4 px-6">{new Date(app.date_applied).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="discussion">Discussion</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="hired">Hired</option>
                      <option value="fired">Fired</option>
                      <option value="left">Left</option>
                    </select>
                    <button
                      onClick={() => handleViewSeekerProfile(app.seeker_id._id)}
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showSeekerProfileModal && (
        <SeekerProfileView 
          seekerUserId={selectedSeekerUserId} 
          onClose={() => setShowSeekerProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default ProviderApplicationsScreen;
