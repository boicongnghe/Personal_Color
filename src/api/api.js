import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clarity_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('clarity_token');
      window.location = '/login';
    }
    return Promise.reject(err);
  }
);

export const analyzeFace = (formData) =>
  api.post('/api/analyze-face', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const getResult = (userId) => api.get(`/api/result/${userId}`);

export const saveOutfitPreference = (data) => api.post('/api/save-scan', data);

export const getOutfitSuggestions = (season, occasion) =>
  api.get(`/api/outfit/${season}`, { params: { occasion } });

export const addWardrobeItem = (data) => api.post('/api/wardrobe', data);

export const getWardrobe = () => api.get('/api/wardrobe');

export const deleteWardrobeItem = (itemId) => api.delete(`/api/wardrobe/${itemId}`);

export const register = (email, password, displayName) =>
  api.post('/api/auth/register', { email, password, displayName });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () => api.get('/api/auth/me');

export const getSubscription = () => api.get('/api/subscription');

export const createUpgradePayment = () => api.post('/api/subscription/upgrade');

export const verifyPaymentCallback = (params) =>
  api.get('/api/subscription/callback', { params });

export default api;
