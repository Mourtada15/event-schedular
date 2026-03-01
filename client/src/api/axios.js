import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, setAuthSession } from '../utils/authSession.js';

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
  baseURL
});

const refreshClient = axios.create({
  baseURL
});

function shouldSkipAuthHeader(url) {
  const value = String(url || '');
  return value.includes('/auth/login') || value.includes('/auth/register') || value.includes('/auth/refresh');
}

function shouldSkipRefresh(url) {
  const value = String(url || '');
  return (
    value.includes('/auth/login') ||
    value.includes('/auth/register') ||
    value.includes('/auth/refresh')
  );
}

api.interceptors.request.use((config) => {
  if (!shouldSkipAuthHeader(config.url)) {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => {
    const tokens = response.data?.data?.tokens;
    if (tokens?.accessToken && tokens?.refreshToken) {
      setAuthSession(tokens);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    if (status === 401 && !shouldSkipRefresh(requestUrl) && !originalRequest?._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post('/auth/refresh', { refreshToken })
            .then((response) => {
              const tokens = response.data?.data?.tokens;
              if (!tokens?.accessToken || !tokens?.refreshToken) {
                throw new Error('Missing refreshed tokens');
              }

              setAuthSession(tokens);
              return tokens;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
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
