import React, { useState } from 'react';
import { viewApplications, hireSeeker } from '../api';

const JobProviderActions = () => {
    const [jobId, setJobId] = useState('');
    const [userJobId, setUserJobId] = useState('');
    const [applications, setApplications] = useState([]);

    const handleViewApplications = async () => {
        try {
            const response = await viewApplications(jobId);
            setApplications(response.data.applications);
            alert('Applications fetched!');
        } catch (error) {
            alert('Error fetching applications: ' + error.message);
        }
    };

    const handleHireSeeker = async () => {
        try {
            await hireSeeker(userJobId);
            alert('Seeker hired!');
        } catch (error) {
            alert('Error hiring seeker: ' + error.message);
        }
    };

    return (
        <div style={{ border: '1px solid black', padding: '20px', margin: '20px' }}>
            <h3>Job Provider Actions</h3>
            <div>
                <h4>View Applications</h4>
                <input type="text" placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
                <button onClick={handleViewApplications}>View Applications</button>
                <div>
                    {applications.map(app => (
                        <p key={app._id}>{app.user_id.name} - {app.status}</p>
                    ))}
                </div>
            </div>
            <div>
                <h4>Hire Seeker</h4>
                <input type="text" placeholder="UserJob ID" value={userJobId} onChange={(e) => setUserJobId(e.target.value)} />
                <button onClick={handleHireSeeker}>Hire Seeker</button>
            </div>
        </div>
    );
};

export default JobProviderActions;
