import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const applyForJob = (userId, jobId) => API.post('/user-jobs/apply', { user_id: userId, job_id: jobId });
export const negotiateOffer = (userJobId, newTerms) => API.post('/user-jobs/negotiate', { userJob_id: userJobId, new_terms: newTerms });
export const recommendJob = (jobId, peerPhoneNumber) => API.post('/user-jobs/recommend', { job_id: jobId, peer_phone_number: peerPhoneNumber });
export const viewApplications = (jobId) => API.get(`/user-jobs/applications/${jobId}`);
export const hireSeeker = (userJobId) => API.post('/user-jobs/hire', { userJob_id: userJobId });
export const getJobs = () => API.get('/jobs');
export const createJob = (jobData) => API.post('/jobs', jobData);

export default API; 