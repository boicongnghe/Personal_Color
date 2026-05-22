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

export const addWardrobeItem = (data) =>
  data instanceof FormData
    ? api.post('/api/wardrobe', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/api/wardrobe', data);

export const getScanHistory = () => api.get('/api/scans');

export const deleteScan = (scanId) => api.delete(`/api/scans/${scanId}`);

export const getWardrobe = () => api.get('/api/wardrobe');

export const deleteWardrobeItem = (itemId) => api.delete(`/api/wardrobe/${itemId}`);

export const register = (email, password, displayName) =>
  api.post('/api/auth/register', { email, password, displayName });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () => api.get('/api/auth/me');

export const getSubscription = () => api.get('/api/subscription');

export const getPlans = () => api.get('/api/subscription/plans');

export const createUpgradePayment = (plan = '1m') =>
  api.post('/api/subscription/upgrade', { plan });

export const confirmPayment = (orderId) =>
  api.post('/api/subscription/confirm-payment', { orderId });

export const saveBodyProfile = (data) => api.post('/api/user/body-profile', data);
export const getBodyProfile  = ()     => api.get('/api/user/body-profile');

export const getAllUsersAdmin    = ()                  => api.get('/api/user/admin/all');
export const updateUserTierAdmin = (id, tier)          => api.patch(`/api/user/admin/${id}/tier`, { tier });
export const banUserAdmin        = (id, isBanned)      => api.patch(`/api/user/admin/${id}/ban`, { isBanned });

export const savePersonPhoto = (formData) =>
  api.post('/api/wardrobe/try-on/save-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const tryOnItem = (formData) =>
  api.post('/api/wardrobe/try-on', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const checkPersonPhoto = () => api.get('/api/wardrobe/try-on/has-photo');

export const previewProduct    = (url)      => api.post('/api/products/preview', { url });
export const createProduct     = (data)     => api.post('/api/products', data);
export const getProducts       = (occasion) => api.get(`/api/products?occasion=${occasion ?? 'all'}`);
export const getAllProducts     = ()         => api.get('/api/products/all');
export const updateProduct     = (id, data) => api.patch(`/api/products/${id}`, data);
export const deleteProduct     = (id)       => api.delete(`/api/products/${id}`);
export const trackProductClick = (id)       => api.post(`/api/products/${id}/click`);

export default api;
