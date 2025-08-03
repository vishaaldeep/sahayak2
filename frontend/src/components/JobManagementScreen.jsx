import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Eye, Briefcase, MapPin, Clock } from 'lucide-react';
import { getJobs, getJobApplications, hireApplicant, rejectApplicant } from '../api';

export default function JobManagementScreen() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      setApplicationsLoading(true);
      const response = await getJobApplications(jobId);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleViewApplications = (job) => {
    setSelectedJob(job);
    fetchApplications(job._id);
  };

  const handleHireApplicant = async (applicationId) => {
    try {
      await hireApplicant(applicationId);
      alert('Applicant hired successfully!');
      fetchApplications(selectedJob._id); // Refresh applications
    } catch (error) {
      console.error('Error hiring applicant:', error);
      alert('Failed to hire applicant. Please try again.');
    }
  };

  const handleRejectApplicant = async (applicationId) => {
    try {
      await rejectApplicant(applicationId);
      alert('Applicant rejected.');
      fetchApplications(selectedJob._id); // Refresh applications
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('Failed to reject applicant. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Management</h1>
        
        {!selectedJob ? (
          // Jobs List View
          <div className="grid gap-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Posted Jobs</h2>
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No jobs posted yet.</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600 mt-1">{job.description}</p>
                    </div>
                    {job.assessment_required && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                        Assessment Required
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      {job.skill}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {typeof job.location === 'string' ? job.location : 'Location not specified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      ₹{job.wage_per_hour}/hr
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleViewApplications(job)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Users size={16} />
                    View Applications
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Applications View
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedJob(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Jobs
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                Applications for: {selectedJob.title}
              </h2>
            </div>
            
            {applicationsLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-600">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No applications yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map(application => (
                  <div key={application._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.applicant_id.full_name}
                        </h3>
                        <p className="text-gray-600">{application.applicant_id.email}</p>
                        <p className="text-gray-600">{application.applicant_id.phone_number}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Applied: {new Date(application.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        
                        {application.status === 'applied' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleHireApplicant(application._id)}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                            >
                              <CheckCircle size={14} />
                              Hire
                            </button>
                            <button
                              onClick={() => handleRejectApplicant(application._id)}
                              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedJob.assessment_required && application.status === 'hired' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Assessment Required:</strong> This applicant has been assigned an assessment for {selectedJob.skill}.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}