import React, { useState } from 'react';
import { createJob } from '../api';

const PostJobPage = ({ onClose }) => {
    const [jobData, setJobData] = useState({
        employer_id: '', // This should ideally come from authenticated user context
        title: '',
        description: '',
        responsibilities: '',
        skills_required: [], // Array of skill IDs
        experience_required: 0,
        assessment_required: false,
        number_of_openings: 1,
        job_type: 'full_time',
        duration: '',
        wage_type: 'monthly',
        salary_min: 0,
        salary_max: 0,
        negotiable: false,
        leaves_allowed: 0,
        location: '', // Added location field
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setJobData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSkillsChange = (e) => {
        // Assuming skills are entered as comma-separated IDs for now
        setJobData(prevData => ({
            ...prevData,
            skills_required: e.target.value.split(',').map(skill => skill.trim())
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user._id) {
                jobData.employer_id = user._id;
            } else {
                alert('Employer ID not found. Please log in as an employer.');
                return;
            }

            await createJob(jobData);
            alert('Job posted successfully!');
            onClose(); // Close the modal after successful post
        } catch (error) {
            alert('Error posting job: ' + error.message);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Post a New Job</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>
                    Title:
                    <input type="text" name="title" value={jobData.title} onChange={handleChange} required />
                </label>
                <label>
                    Description:
                    <textarea name="description" value={jobData.description} onChange={handleChange} required />
                </label>
                <label>
                    Responsibilities:
                    <textarea name="responsibilities" value={jobData.responsibilities} onChange={handleChange} />
                </label>
                <label>
                    Skills Required (comma-separated IDs):
                    <input type="text" name="skills_required" value={jobData.skills_required.join(',')} onChange={handleSkillsChange} />
                </label>
                <label>
                    Experience Required (years):
                    <input type="number" name="experience_required" value={jobData.experience_required} onChange={handleChange} />
                </label>
                <label>
                    Assessment Required:
                    <input type="checkbox" name="assessment_required" checked={jobData.assessment_required} onChange={handleChange} />
                </label>
                <label>
                    Number of Openings:
                    <input type="number" name="number_of_openings" value={jobData.number_of_openings} onChange={handleChange} required />
                </label>
                <label>
                    Job Type:
                    <select name="job_type" value={jobData.job_type} onChange={handleChange} required>
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="gig">Gig</option>
                        <option value="contract">Contract</option>
                    </select>
                </label>
                <label>
                    Duration:
                    <input type="text" name="duration" value={jobData.duration} onChange={handleChange} />
                </label>
                <label>
                    Wage Type:
                    <select name="wage_type" value={jobData.wage_type} onChange={handleChange} required>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="per_task">Per Task</option>
                    </select>
                </label>
                <label>
                    Salary Min:
                    <input type="number" name="salary_min" value={jobData.salary_min} onChange={handleChange} required />
                </label>
                <label>
                    Salary Max:
                    <input type="number" name="salary_max" value={jobData.salary_max} onChange={handleChange} required />
                </label>
                <label>
                    Negotiable:
                    <input type="checkbox" name="negotiable" checked={jobData.negotiable} onChange={handleChange} />
                </label>
                <label>
                    Leaves Allowed:
                    <input type="number" name="leaves_allowed" value={jobData.leaves_allowed} onChange={handleChange} />
                </label>
                <label>
                    Location:
                    <input type="text" name="location" value={jobData.location} onChange={handleChange} required />
                </label>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Post Job
                </button>
            </form>
        </div>
    );
};

export default PostJobPage;
