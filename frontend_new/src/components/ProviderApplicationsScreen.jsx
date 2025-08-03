import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API, { updateApplicationStatus } from '../api';
import SeekerProfileView from './SeekerProfileView';
import MakeOfferModal from './MakeOfferModal';

const ProviderApplicationsScreen = ({ employerId }) => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentAssigning, setAssessmentAssigning] = useState({});
  const [showSeekerProfileModal, setShowSeekerProfileModal] = useState(false);
  const [selectedSeekerUserId, setSelectedSeekerUserId] = useState(null);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false); // New state
  const [selectedApplicationForOffer, setSelectedApplicationForOffer] = useState(null); // New state

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

  const handleStatusChange = async (applicationId, newStatus, application) => {
    if (newStatus === 'hired') {
      setSelectedApplicationForOffer(application);
      setShowMakeOfferModal(true);
      return;
    }
    try {
      await updateApplicationStatus(applicationId, newStatus);
      fetchApplications(); // Refresh applications after update
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status.');
    }
  };

  const handleAssignAssessment = async (application, skillId) => {
    try {
      setAssessmentAssigning({ ...assessmentAssigning, [application._id]: true });
      
      await API.post('/assessments/assign', {
        user_id: application.seeker_id._id,
        skill_id: skillId,
        job_id: application.job_id._id
      });
      
      alert(t('assessment.assignedSuccessfully') || 'Assessment assigned successfully!');
      fetchApplications();
    } catch (error) {
      console.error('Error assigning assessment:', error);
      alert(t('assessment.assignmentFailed') || 'Failed to assign assessment');
    } finally {
      setAssessmentAssigning({ ...assessmentAssigning, [application._id]: false });
    }
  };

  const fetchAssessmentResults = async (userId, jobId) => {
    try {
      const response = await API.get(`/assessments/job/${jobId}`);
      return response.data.filter(assessment => assessment.user_id._id === userId);
    } catch (error) {
      console.error('Error fetching assessment results:', error);
      return [];
    }
  };

  const handleOfferMade = () => {
    setShowMakeOfferModal(false);
    fetchApplications(); // Refresh applications after offer is made
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
                <th className="py-3 px-6 text-left">{t('jobs.jobTitle') || 'Job Title'}</th>
                <th className="py-3 px-6 text-left">{t('jobs.seekerName') || 'Seeker Name'}</th>
                <th className="py-3 px-6 text-left">{t('common.email') || 'Email'}</th>
                <th className="py-3 px-6 text-left">{t('common.phone') || 'Phone'}</th>
                <th className="py-3 px-6 text-left">{t('jobs.counterOffer') || 'Counter Offer'}</th>
                <th className="py-3 px-6 text-left">{t('common.status') || 'Status'}</th>
                <th className="py-3 px-6 text-left">{t('jobs.dateApplied') || 'Date Applied'}</th>
                <th className="py-3 px-6 text-left">{t('jobs.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {applications.map(app => (
                <tr key={app._id} className="border-b border-gray-200 hover:bg-gray-100 transition-transform transform hover:scale-102 duration-300">
                  <td className="py-4 px-6">{app.job_id ? app.job_id.title : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.name : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.email : 'N/A'}</td>
                  <td className="py-4 px-6">{app.seeker_id ? app.seeker_id.phone_number : 'N/A'}</td>
                  <td className="py-4 px-6">{app.userJob && app.userJob.counter_offer_amount ? `₹${app.userJob.counter_offer_amount}` : 'N/A'}</td>
                  <td className="py-4 px-6">
                    {app.seeker_id && app.seeker_id.false_accusation_count > 0 && (
                      <p className="text-red-500 text-sm">False Accusations: {app.seeker_id.false_accusation_count}</p>
                    )}
                    {app.seeker_id && app.seeker_id.abuse_true_count > 0 && (
                      <p className="text-red-500 text-sm">Abuse Confirmed: {app.seeker_id.abuse_true_count}</p>
                    )}
                    {app.status}</td>
                  <td className="py-4 px-6">{new Date(app.date_applied).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app._id, e.target.value, app)}
                      className="p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="discussion">Discussion</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="hired">Hired</option>
                      <option value="fired">Fired</option>
                      <option value="left">Left</option>
                    </select>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewSeekerProfile(app.seeker_id._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
                      >
                        {t('jobs.viewProfile') || 'View Profile'}
                      </button>
                      
                      {/* Assessment Assignment */}
                      {app.job_id && app.job_id.skills_required && app.job_id.skills_required.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-600">{t('assessment.assignAssessment') || 'Assign Assessment'}:</div>
                          {app.job_id.skills_required.map(skill => (
                            <button
                              key={skill._id}
                              onClick={() => handleAssignAssessment(app, skill._id)}
                              disabled={assessmentAssigning[app._id]}
                              className="bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                            >
                              {assessmentAssigning[app._id] ? t('assessment.assigning') || 'Assigning...' : skill.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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

      {showMakeOfferModal && selectedApplicationForOffer && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => setShowMakeOfferModal(false)}
          application={selectedApplicationForOffer}
          employerId={employerId}
          onOfferMade={handleOfferMade}
        />
      )}
    </div>
  );
};

export default ProviderApplicationsScreen;
