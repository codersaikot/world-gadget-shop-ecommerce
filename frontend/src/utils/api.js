import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

const normalizeBaseUrl = (value) => {
  if (!value) {
    return '/api';
  }

  const sanitized = value.replace(/\/+$/, '');
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(rawApiUrl),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wgs_token');
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

  config.headers = config.headers || {};

  if (isFormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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
