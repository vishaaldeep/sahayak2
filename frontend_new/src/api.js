import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const applyForJob = (seeker_id, job_id) => API.post('/applications', { seeker_id, job_id });
export const negotiateOffer = (userJobId, newTerms) => API.post('/user-jobs/negotiate', { userJob_id: userJobId, new_terms: newTerms });
export const recommendJob = (jobId, peerPhoneNumber) => API.post('/user-jobs/recommend', { job_id: jobId, peer_phone_number: peerPhoneNumber });
export const viewApplications = (jobId) => API.get(`/user-jobs/applications/${jobId}`);
export const hireSeeker = (userJobId) => API.post('/user-jobs/hire', { userJob_id: userJobId });
export const getJobs = (params) => API.get('/jobs', { params });
export const createJob = (jobData) => API.post('/jobs', jobData);
export const getSkills = () => API.get('/skills');
export const getApplicationsBySeeker = (seekerId) => API.get(`/applications/seeker/${seekerId}`);
export const getUserById = (userId) => API.get(`/users/${userId}`);
export const getEmployerByUserId = (userId) => API.get(`/employer/user/${userId}`);
export const getJobsByEmployerId = (userId) => API.get('/jobs', { params: { userId } });
export const addExperience = (experienceData) => API.post('/user-experiences', experienceData);
export const getCurrentJobs = (seekerId) => API.get(`/user-experiences/current-jobs/${seekerId}`);
export const leaveJob = (experienceId) => API.put(`/user-experiences/leave-job/${experienceId}`);
export const raiseIssue = (experienceId, issueDescription) => API.post(`/user-experiences/raise-issue/${experienceId}`, { issueDescription });


export const updateApplicationStatus = (id, status) => API.put(`/applications/${id}`, { status });

export default API; 