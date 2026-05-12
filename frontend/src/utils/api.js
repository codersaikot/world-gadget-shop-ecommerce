import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wgs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.method?.toLowerCase() === 'get') {
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wgs_token');
      localStorage.removeItem('wgs_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
