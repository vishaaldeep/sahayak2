import React, { useEffect, useState } from 'react';
import { getCurrentJobs, leaveJob, raiseIssue } from '../api';
import ConfirmationModal from './ConfirmationModal';
import RaiseIssueModal from './RaiseIssueModal';

const MyJobsList = ({ seekerId }) => {
    const [currentJobs, setCurrentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false);
    const [showRaiseIssueModal, setShowRaiseIssueModal] = useState(false);
    const [selectedExperienceId, setSelectedExperienceId] = useState(null);

    const fetchCurrentJobs = async () => {
        try {
            const response = await getCurrentJobs(seekerId);
            setCurrentJobs(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentJobs();
    }, [seekerId]);

    const handleLeaveJob = (experienceId) => {
        setSelectedExperienceId(experienceId);
        setShowConfirmLeaveModal(true);
    };

    const confirmLeaveJob = async () => {
        try {
            await leaveJob(selectedExperienceId);
            alert('Job left successfully!');
            fetchCurrentJobs(); // Refresh the list
            setShowConfirmLeaveModal(false);
            setSelectedExperienceId(null);
        } catch (err) {
            console.error('Error leaving job:', err);
            alert('Failed to leave job: ' + err.message);
        }
    };

    const handleRaiseIssue = (experienceId) => {
        setSelectedExperienceId(experienceId);
        setShowRaiseIssueModal(true);
    };

    const submitRaiseIssue = async (issueDescription) => {
        try {
            await raiseIssue(selectedExperienceId, issueDescription);
            alert('Issue raised successfully!');
            setShowRaiseIssueModal(false);
            setSelectedExperienceId(null);
        } catch (err) {
            console.error('Error raising issue:', err);
            alert('Failed to raise issue: ' + err.message);
        }
    };

    if (loading) return <div className="text-center p-8">Loading your jobs...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error loading your jobs: {error.message}</div>;

    return (
        <div className="container mx-auto p-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">My Current Jobs</h3>
            {currentJobs.length === 0 ? (
                <p className="text-center text-gray-500">You are not currently in any jobs.</p>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-3 px-6 text-left">Job Title</th>
                                <th className="py-3 px-6 text-left">Description</th>
                                <th className="py-3 px-6 text-left">Joined Date</th>
                                <th className="py-3 px-6 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {currentJobs.map(job => (
                                <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-100 transition-transform transform hover:scale-102 duration-300">
                                    <td className="py-4 px-6">{job.job_id ? job.job_id.title : job.job_description}</td>
                                    <td className="py-4 px-6">{job.job_id ? job.job_id.description : job.description}</td>
                                    <td className="py-4 px-6">{new Date(job.date_joined).toLocaleDateString()}</td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => handleLeaveJob(job._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 mr-2"
                                        >
                                            Leave Job
                                        </button>
                                        <button
                                            onClick={() => handleRaiseIssue(job._id)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                        >
                                            Raise Issue
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showConfirmLeaveModal && (
                <ConfirmationModal
                    message="Are you sure you want to leave this job?"
                    onConfirm={confirmLeaveJob}
                    onCancel={() => setShowConfirmLeaveModal(false)}
                />
            )}

            {showRaiseIssueModal && (
                <RaiseIssueModal
                    onRaiseIssue={submitRaiseIssue}
                    onClose={() => setShowRaiseIssueModal(false)}
                />
            )}
        </div>
    );
};

export default MyJobsList;