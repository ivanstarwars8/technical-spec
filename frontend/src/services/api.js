import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  getMe: () => api.get('/api/auth/me'),
  refresh: () => api.post('/api/auth/refresh'),
};

// Students API
export const studentsAPI = {
  getAll: () => api.get('/api/students/'),
  getById: (id) => api.get(`/api/students/${id}`),
  create: (data) => api.post('/api/students/', data),
  update: (id, data) => api.put(`/api/students/${id}`, data),
  delete: (id) => api.delete(`/api/students/${id}`),
  generateLinkCode: (id) => api.post(`/api/students/${id}/generate-link-code`),
};

// Lessons API
export const lessonsAPI = {
  getAll: (params) => api.get('/api/lessons/', { params }),
  getById: (id) => api.get(`/api/lessons/${id}`),
  getCalendar: (params) => api.get('/api/lessons/calendar', { params }),
  create: (data) => api.post('/api/lessons/', data),
  update: (id, data) => api.put(`/api/lessons/${id}`, data),
  delete: (id) => api.delete(`/api/lessons/${id}`),
};

// Payments API
export const paymentsAPI = {
  getAll: () => api.get('/api/payments/'),
  create: (data) => api.post('/api/payments/', data),
  getStats: (params) => api.get('/api/payments/stats', { params }),
  getDebtors: () => api.get('/api/payments/debtors'),
};

// Homework API
export const homeworkAPI = {
  generate: (data) => api.post('/api/homework/generate', data),
  getHistory: () => api.get('/api/homework/'),
  getById: (id) => api.get(`/api/homework/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  getCurrent: () => api.get('/api/subscription/'),
  upgrade: (tier) => api.post('/api/subscription/upgrade', null, { params: { tier } }),
};

export default api;
