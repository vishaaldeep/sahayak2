import React, { useEffect, useState } from 'react';
import { getJobs } from '../api';
import PostJobPage from './PostJobPage'; // Import the PostJobPage component

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPostJobModal, setShowPostJobModal] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user ? user.role : null;

    const fetchJobs = async () => {
        try {
            const response = await getJobs();
            setJobs(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleJobPosted = () => {
        setShowPostJobModal(false);
        fetchJobs(); // Refresh job list after posting a new job
    };

    if (loading) return <div>Loading jobs...</div>;
    if (error) return <div>Error loading jobs: {error.message}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Available Jobs</h2>
            {userRole === 'provider' && (
                <button
                    onClick={() => setShowPostJobModal(true)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '20px',
                    }}
                >
                    Add New Job
                </button>
            )}

            {jobs.length === 0 ? (
                <p>No jobs available at the moment.</p>
            ) : (
                <div>
                    {jobs.map(job => (
                        <div key={job._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                            <h3>{job.title}</h3>
                            <p><strong>Description:</strong> {job.description}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Salary:</strong> {job.salary_min} - {job.salary_max}</p>
                            {/* Add more job details as needed */}
                        </div>
                    ))}
                </div>
            )}

            {showPostJobModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                    }}>
                        <button
                            onClick={() => setShowPostJobModal(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                            }}
                        >
                            &times;
                        </button>
                        <PostJobPage onClose={handleJobPosted} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsPage;
