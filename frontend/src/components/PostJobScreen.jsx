
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createJob } from '../api';

const PostJobScreen = () => {
  const { t } = useTranslation();
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    wage_per_hour: '',
  });

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(jobData);
      alert('Job posted successfully!');
      // clear form
      setJobData({
        title: '',
        description: '',
        location: '',
        wage_per_hour: '',
      });
    } catch (error) {
      console.error(error);
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
          />
          <textarea
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="description"
            placeholder="Job Description"
            onChange={handleChange}
            value={jobData.description}
          />
          <input
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="location"
            placeholder="Location"
            onChange={handleChange}
            value={jobData.location}
          />
          <input
            className="w-full bg-gray-800 rounded-xl px-5 py-4 text-base text-white mb-5 outline-none"
            name="wage_per_hour"
            placeholder="Wage Per Hour"
            type="number"
            onChange={handleChange}
            value={jobData.wage_per_hour}
          />
          <button type="submit" className="w-full bg-white text-gray-900 font-semibold rounded-xl py-4 mb-8 transition hover:bg-gray-200">
            {t('post_job')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJobScreen;
