
import React, { useEffect, useState } from 'react';
import { getUserById, getEmployerByUserId, getJobsByEmployerId } from '../api';

const EmployerProfileView = ({ employerUserId, onClose }) => {
    const [employerUser, setEmployerUser] = useState(null);
    const [employerProfile, setEmployerProfile] = useState(null);
    const [postedJobs, setPostedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await getUserById(employerUserId);
                setEmployerUser(userRes.data);

                const employerRes = await getEmployerByUserId(employerUserId);
                setEmployerProfile(employerRes.data);

                const jobsRes = await getJobsByEmployerId(employerUserId);
                setPostedJobs(jobsRes.data);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [employerUserId]);

    if (loading) return <div className="text-center p-8">Loading employer profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error loading employer profile: {error.message}</div>;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl relative overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Employer Profile</h2>

                {employerUser && (
                    <div className="mb-6 p-4 border rounded-lg shadow-sm">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">User Details</h3>
                        <p><strong>Name:</strong> {employerUser.name}</p>
                        <p><strong>Email:</strong> {employerUser.email}</p>
                        <p><strong>Phone:</strong> {employerUser.phone_number}</p>
                        <p><strong>City:</strong> {employerUser.city}</p>
                    </div>
                )}

                {employerProfile && (
                    <div className="mb-6 p-4 border rounded-lg shadow-sm">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">Company Details</h3>
                        <p><strong>Company Name:</strong> {employerProfile.company_name}</p>
                        <p><strong>Company Type:</strong> {employerProfile.company_type}</p>
                        <p><strong>GSTIN:</strong> {employerProfile.gstin_number}</p>
                        <p><strong>Verified:</strong> {employerProfile.is_verified ? 'Yes' : 'No'}</p>
                        <p><strong>Abuse Reports:</strong> {employerProfile.abuse_reports}</p>
                        {employerProfile.investor_history && <p><strong>Investor History:</strong> {employerProfile.investor_history}</p>}
                    </div>
                )}

                <div className="p-4 border rounded-lg shadow-sm">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-3">Jobs Posted</h3>
                    {postedJobs.length === 0 ? (
                        <p>No jobs posted by this employer yet.</p>
                    ) : (
                        <ul className="list-disc pl-5 space-y-2">
                            {postedJobs.map(job => (
                                <li key={job._id}>
                                    <strong>{job.title}</strong> - {job.description.substring(0, 100)}...
                                    <p className="text-sm text-gray-500">{job.city}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployerProfileView;
