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

export const deleteWardrobeItem  = (itemId)       => api.delete(`/api/wardrobe/${itemId}`);
export const updateWardrobeItem = (itemId, data) =>
  data instanceof FormData
    ? api.patch(`/api/wardrobe/${itemId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.patch(`/api/wardrobe/${itemId}`, data);

export const register = (email, password, displayName) =>
  api.post('/api/auth/register', { email, password, displayName });

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const getMe           = ()                           => api.get('/api/auth/me');
export const forgotPassword  = (email)                      => api.post('/api/auth/forgot-password', { email });
export const resetPassword   = (token, newPassword)         => api.post('/api/auth/reset-password',  { token, newPassword });

export const getSubscription = () => api.get('/api/subscription');

export const getPlans = () => api.get('/api/subscription/plans');

export const createUpgradePayment = (plan = '1m') =>
  api.post('/api/subscription/upgrade', { plan });

export const checkPaymentStatus = (orderInvoice) =>
  api.get(`/api/subscription/status/${orderInvoice}`);

export const confirmPayment = (orderId) =>
  api.post('/api/subscription/confirm-payment', { orderId });

export const uploadAvatar      = (formData) =>
  api.post('/api/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleFavoriteApi = (productId) => api.post(`/api/user/favorites/${productId}`);
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

export const tryOnReplicate = (personFile, clothingFile) => {
  const formData = new FormData();
  formData.append('person',   personFile);
  formData.append('clothing', clothingFile);
  return api.post('/api/wardrobe/try-on/replicate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
};

export const checkPersonPhoto  = () => api.get('/api/wardrobe/try-on/has-photo');
export const fetchPersonPhoto  = () => api.get('/api/wardrobe/try-on/person-photo');

export const previewProduct    = (url)      => api.post('/api/products/preview', { url });
export const createProduct     = (data)     => api.post('/api/products', data);
export const getProducts       = (occasion) => api.get(`/api/products?occasion=${occasion ?? 'all'}`);
export const getAllProducts     = ()         => api.get('/api/products/all');
export const updateProduct     = (id, data) => api.patch(`/api/products/${id}`, data);
export const deleteProduct     = (id)       => api.delete(`/api/products/${id}`);
export const trackProductClick = (id)       => api.post(`/api/products/${id}/click`);

export const chatAssistant = (message, imageFile, history, occasion) => {
  const fd = new FormData();
  fd.append('message', message || '');
  fd.append('occasion', occasion || '');
  fd.append('history', JSON.stringify(history || []));
  if (imageFile) fd.append('image', imageFile);
  return api.post('/api/assistant/chat', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const listConversations   = ()           => api.get('/api/conversations');
export const createConversation  = (title)      => api.post('/api/conversations', { title });
export const getConversation     = (id)         => api.get(`/api/conversations/${id}`);
export const updateConversation  = (id, data)   => api.put(`/api/conversations/${id}`, data);
export const deleteConversation  = (id)         => api.delete(`/api/conversations/${id}`);

export const sendSupportMessage  = (message)       => api.post('/api/support', { message });
export const getMySupportMessages = ()              => api.get('/api/support');
export const getAllSupportMessages = ()             => api.get('/api/support/admin/all');
export const replyToSupportMessage = (id, reply)   => api.patch(`/api/support/${id}/reply`, { reply });

export const getAdminStats       = () => api.get('/api/subscription/admin/stats');
export const getAnalyticsMetrics = () => api.get('/api/analytics/metrics');

export default api;
