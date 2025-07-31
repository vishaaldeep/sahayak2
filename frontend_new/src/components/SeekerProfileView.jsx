import React, { useEffect, useState } from 'react';
import { getUserById } from '../api';

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

const SeekerProfileView = ({ seekerUserId, onClose }) => {
    const [seekerUser, setSeekerUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await getUserById(seekerUserId);
                setSeekerUser(userRes.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [seekerUserId]);

    if (loading) return <div className="text-center p-8">Loading seeker profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Error loading seeker profile: {error.message}</div>;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Seeker Profile</h2>

                {seekerUser && (
                    <div className="mb-6 p-4 border rounded-lg shadow-sm">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">User Details</h3>
                        <p><strong>Name:</strong> {seekerUser.name}</p>
                        <p><strong>Email:</strong> {seekerUser.email}</p>
                        <p><strong>Phone:</strong> {seekerUser.phone_number}</p>
                        <p><strong>City:</strong> {seekerUser.city}</p>
                    </div>
                )}

                {seekerUser && seekerUser.experiences && seekerUser.experiences.length > 0 && (
                    <div className="p-4 border rounded-lg shadow-sm">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">Work Experience</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {seekerUser.experiences.map(exp => (
                                <li key={exp._id}>
                                    <strong>{exp.job_description}</strong> ({new Date(exp.date_joined).toLocaleDateString()} - {exp.date_left ? new Date(exp.date_left).toLocaleDateString() : 'Present'})
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {getExperienceTag(exp.date_joined, exp.date_left)}
                                    </span>
                                    {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}
                                    {exp.location && <p className="text-sm text-gray-500">Location: {exp.location}</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {seekerUser && (!seekerUser.experiences || seekerUser.experiences.length === 0) && (
                    <div className="p-4 border rounded-lg shadow-sm">
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">Work Experience</h3>
                        <p>No work experience found for this seeker.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeekerProfileView;