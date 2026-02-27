import axios from 'axios';

function normalizeApiBaseUrl(value) {
  if (!value || !value.trim()) return '';
  const trimmed = value.trim().replace(/\/+$/, '');
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const configuredBaseURL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const runtimeBaseURL =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';
const baseURL = configuredBaseURL || runtimeBaseURL;

const api = axios.create({
  baseURL,
  withCredentials: true
});

function getCookie(name) {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('csrfToken');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }

  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
