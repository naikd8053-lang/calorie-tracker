// src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['x-auth-token'] = token;
  }
  return req;
});

// ---------- Authentication ----------
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (userData) => API.post('/auth/login', userData),
};

// ---------- Food Logs ----------
export const logsAPI = {
  getByDate: (date) => API.get(`/logs?date=${date}`),
  create: (logData) => API.post('/logs', logData),
  delete: (id) => API.delete(`/logs/${id}`),
  getWeeklySummary: () => API.get('/logs/weekly-summary'),
};

// ---------- User Profile ----------
export const usersAPI = {
  getMe: () => API.get('/users/me'),
  updateGoal: (dailyGoal) => API.put('/users/goal', { dailyGoal }),
  getStreak: () => API.get('/users/streak'),
};

// ---------- Prediction (Gemini + Linear Regression) ----------
export const predictAPI = {
  // type: 'text' or 'image'
  getCalories: (query, type = 'text') => API.post('/predict/predict', { query, type }),
};

// Optional: Image upload (if you implement separate endpoint)
// export const visionAPI = {
//   analyzeImage: (formData) => API.post('/vision/analyze-image', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' }
//   })
// };