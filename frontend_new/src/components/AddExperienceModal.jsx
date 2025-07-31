import React, { useState } from 'react';
import { addExperience } from '../api';

const AddExperienceModal = ({ onClose }) => {
    const [experienceData, setExperienceData] = useState({
        job_description: '',
        description: '',
        date_joined: '',
        date_left: '',
        location: '',
    });
    const user = JSON.parse(localStorage.getItem('user'));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExperienceData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user._id) {
                alert('User not logged in.');
                return;
            }
            await addExperience({ ...experienceData, seeker_id: user._id });
            alert('Experience added successfully!');
            onClose();
        } catch (error) {
            console.error('Error adding experience:', error);
            alert('Failed to add experience: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Previous Experience</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="job_description" className="block text-sm font-medium text-gray-700">Job Title / Role</label>
                        <input
                            type="text"
                            id="job_description"
                            name="job_description"
                            value={experienceData.job_description}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description of Responsibilities</label>
                        <textarea
                            id="description"
                            name="description"
                            value={experienceData.description}
                            onChange={handleChange}
                            rows="3"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="date_joined" className="block text-sm font-medium text-gray-700">Date Joined</label>
                        <input
                            type="date"
                            id="date_joined"
                            name="date_joined"
                            value={experienceData.date_joined}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="date_left" className="block text-sm font-medium text-gray-700">Date Left (Optional)</label>
                        <input
                            type="date"
                            id="date_left"
                            name="date_left"
                            value={experienceData.date_left}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={experienceData.location}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-transform transform hover:scale-105"
                    >
                        Add Experience
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExperienceModal;