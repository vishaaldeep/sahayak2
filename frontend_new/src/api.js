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
export const createDecentroWallet = () => API.post('/wallet/create-decentro');
export const getDecentroWalletBalance = () => API.get('/wallet/decentro-balance');

// Recurring payment APIs
export const createRecurringPayment = (data) => API.post('/recurring-payments', data);
export const getEmployerRecurringPayments = (employerId) => API.get(`/recurring-payments/employer/${employerId}`);
export const getSeekerRecurringPayments = (seekerId) => API.get(`/recurring-payments/seeker/${seekerId}`);
export const checkMandateStatus = (paymentId) => API.get(`/recurring-payments/${paymentId}/mandate-status`);
export const executePayment = (paymentId, data) => API.post(`/recurring-payments/${paymentId}/execute-payment`, data);

// Credit Score APIs
export const getCreditScore = () => API.get('/credit-scores');
export const getCreditScoreDetails = () => API.get('/credit-scores/details');
export const updateCreditScore = () => API.put('/credit-scores');
export const getCreditScoreStats = () => API.get('/credit-scores/admin/stats');
export const triggerCreditScoreUpdate = () => API.post('/credit-scores/admin/trigger-update');


export const updateApplicationStatus = (id, status) => API.put(`/applications/${id}`, { status });
export const getAgreement = (agreementId) => API.get(`/agreements/${agreementId}`);
export const signAgreement = (agreementId, userId, role) => API.put(`/agreements/${agreementId}/sign`, { userId, role });
export const generateAgreementForExperience = (userExperienceId) => API.post(`/user-experiences/${userExperienceId}/generate-agreement`);

// User profile and language APIs
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (profileData) => API.put('/users/profile', profileData);
export const getCurrentUser = () => API.get('/users/me');
export const updateLanguage = (language) => API.put('/users/update-language', { language });

// User Skill Assessment APIs
export const uploadCertificate = (skillId, data) => API.post(`/user-skills/${skillId}/upload-certificate`, data);
export const fetchPCCFromDigiLocker = (skillId) => API.post(`/user-skills/${skillId}/fetch-pcc`);
export const fetchCertificateFromDigiLocker = (skillId) => API.post(`/user-skills/${skillId}/fetch-certificate`);
export const triggerAssessment = (skillId) => API.post(`/user-skills/${skillId}/trigger-assessment`);
export const setAssessmentResult = (skillId, result) => API.post(`/user-skills/${skillId}/assessment-result`, { result });

// Assessment APIs
export const createSkillAssessment = (userId, skillId) => API.post('/assessments/create-skill-assessment', { user_id: userId, skill_id: skillId });
export const getUserAssessments = (userId) => API.get(`/assessments/user/${userId}`);
export const startAssessment = (assessmentId) => API.post(`/assessments/${assessmentId}/start`);
export const submitAssessmentAnswer = (assessmentId, questionNumber, selectedOption) => API.post(`/assessments/${assessmentId}/answer`, { question_number: questionNumber, selected_option: selectedOption });
export const completeAssessment = (assessmentId) => API.post(`/assessments/${assessmentId}/complete`);

export default API; 