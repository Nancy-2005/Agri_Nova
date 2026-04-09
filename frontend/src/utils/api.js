import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth APIs
export const authAPI = {
    sendOtp: (data) => api.post('/send-otp', data),
    verifyOtp: (data) => api.post('/verify-otp', data),
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    checkSession: () => api.get('/check-session'),
    getGuidance: () => api.get('/guidance'),
    markGuidanceShown: () => api.post('/mark-guidance-shown'),
};

// Farmer APIs
export const farmerAPI = {
    submitData: (data) => api.post('/farmer-data', data),
    getProfile: (userId) => api.get(`/farmer-profile/${userId}`),
    updateData: (userId, data) => api.put(`/farmer-data/${userId}`, data),
};

// Results APIs
export const resultsAPI = {
    getAdoptionResult: (userId) => api.get(`/adoption-result/${userId}`),
    getRecommendations: (userId) => api.get(`/recommendations/${userId}`),
    getSchemes: (userId) => api.get(`/schemes/${userId}`),
    downloadReport: (userId, lang) => api.get(`/report/${userId}?lang=${lang}`, { responseType: 'blob' }),
};

// Chatbot API
export const chatbotAPI = {
    sendMessage: (message, language) => api.post('/chat', { message, language }),
};

// Weather API
export const weatherAPI = {
    getWeather: (city) => api.get(`/weather${city ? `?city=${encodeURIComponent(city)}` : ''}`),
};

// Simulation API
export const simulationAPI = {
    getData: (userId) => api.get(`/simulation/${userId}`),
    runCustomSimulation: (data) => api.post('/run_custom_simulation', data),
};

export default api;
