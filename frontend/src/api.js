
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (formData) => API.post('/users/login', formData);
export const signup = (formData) => API.post('/users/signup', formData);

export const getJobs = () => API.get('/jobs');
export const createJob = (jobData) => API.post('/jobs', jobData);
export const searchJobs = (query) => API.get(`/jobs/search?query=${query}`);

// Job Application APIs
export const applyForJob = (jobId) => API.post('/job-applications/apply', { job_id: jobId });
export const getUserApplications = () => API.get('/job-applications/my-applications');
export const getJobApplications = (jobId) => API.get(`/job-applications/job/${jobId}`);
export const hireApplicant = (applicationId) => API.put(`/job-applications/hire/${applicationId}`);
export const rejectApplicant = (applicationId) => API.put(`/job-applications/reject/${applicationId}`);
