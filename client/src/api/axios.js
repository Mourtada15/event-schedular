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

const csrfClient = axios.create({
  baseURL,
  withCredentials: true
});

function getCookie(name) {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

let csrfTokenMemory = null;

function needsCsrfHeader(config) {
  const method = (config.method || 'get').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return false;

  const url = String(config.url || '');
  if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/csrf')) {
    return false;
  }

  return true;
}

async function resolveCsrfToken() {
  const cookieToken = getCookie('csrfToken');
  if (cookieToken) return cookieToken;

  try {
    const response = await csrfClient.get('/auth/csrf');
    return response.data?.data?.csrfToken || null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  if (needsCsrfHeader(config)) {
    if (!csrfTokenMemory) {
      csrfTokenMemory = await resolveCsrfToken();
    }

    const csrfToken = csrfTokenMemory;
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  } else if (method === 'GET' && String(config.url || '').includes('/auth/csrf')) {
    config.headers['x-csrf-token'] = undefined;
  }

  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => {
    if (String(response.config?.url || '').includes('/auth/logout')) {
      csrfTokenMemory = null;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = String(originalRequest?.url || '');
    const shouldSkipRefresh =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/csrf');

    if (status === 401 && !shouldSkipRefresh && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;
        csrfTokenMemory = null;
        return api(originalRequest);
      } catch (refreshError) {
        csrfTokenMemory = null;
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
