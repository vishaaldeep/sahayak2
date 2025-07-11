
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const login = (formData) => API.post('/users/login', formData);
export const signup = (formData) => API.post('/users/signup', formData);

export const getJobs = () => API.get('/jobs');
export const createJob = (jobData) => API.post('/jobs', jobData);
export const searchJobs = (query) => API.get(`/jobs/search?query=${query}`);
