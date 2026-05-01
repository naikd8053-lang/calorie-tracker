import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers['x-auth-token'] = token;
  return req;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data)
};

export const logsAPI = {
  getByDate: (date) => API.get(`/logs?date=${date}`),
  create: (log) => API.post('/logs', log),
  delete: (id) => API.delete(`/logs/${id}`),
  getWeeklySummary: () => API.get('/logs/weekly-summary')
};

export const usersAPI = {
  getMe: () => API.get('/users/me'),
  updateGoal: (dailyGoal) => API.put('/users/goal', { dailyGoal }),
  getStreak: () => API.get('/users/streak')
};

export const aiAPI = {
  parseFood: (query) => API.post('/ai/parse-food', { query })
};