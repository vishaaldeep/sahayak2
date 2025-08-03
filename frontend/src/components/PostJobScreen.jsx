
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createJob } from '../api';

const PostJobScreen = () => {
  const { t } = useTranslation();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: { type: 'Point', coordinates: [0, 0] },
    skill: '',
    wage_per_hour: '',
    assessment_required: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'location') {
      // For simplicity, we'll use a string location and convert it in the backend
      setJobData({ ...jobData, location: value });
    } else if (type === 'checkbox') {
      setJobData({ ...jobData, [name]: checked });
    } else {
      setJobData({ ...jobData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createJob(jobData);
      alert('Job posted successfully!');
      // clear form
      setJobData({
        title: '',
        description: '',
        location: '',
        skill: '',
        wage_per_hour: '',
        assessment_required: false,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center mb-12">{t('post_a_new_job')}</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="title"
            placeholder="Job Title"
            onChange={handleChange}
            value={jobData.title}
            disabled={loading}
          />
          <textarea
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="description"
            placeholder="Job Description"
            onChange={handleChange}
            value={jobData.description}
            disabled={loading}
          />
          <input
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={jobData.location}
            disabled={loading}
          />
          <select
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="skill"
            onChange={handleChange}
            value={jobData.skill}
            disabled={loading}
            required
          >
            <option value="">Select Required Skill</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrician">Electrician</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cooking">Cooking</option>
            <option value="Driving">Driving</option>
            <option value="Gardening">Gardening</option>
            <option value="Painting">Painting</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
          </select>
          <input
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="wage_per_hour"
            placeholder="Wage Per Hour"
            type="number"
            onChange={handleChange}
            value={jobData.wage_per_hour}
            disabled={loading}
          />
          <div className="flex items-center mb-5">
            <input
              type="checkbox"
              id="assessment_required"
              name="assessment_required"
              checked={jobData.assessment_required}
              onChange={handleChange}
              disabled={loading}
              className="mr-3 w-4 h-4"
            />
            <label htmlFor="assessment_required" className="text-white text-base">
              Assessment Required
            </label>
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold rounded-xl py-4 mb-8 transition hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJobScreen;
