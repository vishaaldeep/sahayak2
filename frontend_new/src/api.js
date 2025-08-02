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
export const makeOffer = (offerData) => API.post('/user-jobs/make-offer', offerData);
export const getOffersForSeeker = (seekerId) => API.get(`/offers/seeker/${seekerId}`);
export const getOffersForEmployer = (employerId) => API.get(`/offers/employer/${employerId}`);
export const acceptOffer = (offerId) => API.put(`/offers/${offerId}/accept`);
export const rejectOffer = (offerId) => API.put(`/offers/${offerId}/reject`);
export const counterOffer = (offerId, counterData) => API.put(`/offers/${offerId}/counter`, counterData);
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

export const getHiredSeekers = (employerId) => API.get(`/user-experiences/hired-seekers/${employerId}`);
export const getArchivedSeekers = (employerId) => API.get(`/user-experiences/archived-seekers/${employerId}`);
export const submitRating = (ratingData) => API.post('/ratings', ratingData);
export const fundWalletUpi = (data) => API.post('/payments/fund-wallet/upi', data);
export const withdrawWalletUpi = (data) => API.post('/payments/withdraw-wallet/upi', data);
export const createDecentroWallet = () => API.post('/payments/create-decentro-wallet');
export const getDecentroWalletBalance = (decentroWalletId) => API.get(`/payments/decentro-wallet/${decentroWalletId}/balance`);


export const updateApplicationStatus = (id, status) => API.put(`/applications/${id}`, { status });
export const getAgreement = (agreementId) => API.get(`/agreements/${agreementId}`);
export const signAgreement = (agreementId, userId, role) => API.put(`/agreements/${agreementId}/sign`, { userId, role });
export const generateAgreementForExperience = (userExperienceId) => API.post(`/user-experiences/${userExperienceId}/generate-agreement`);

export default API; 