const ACCESS_TOKEN_KEY = 'event_scheduler_access_token';
const REFRESH_TOKEN_KEY = 'event_scheduler_refresh_token';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) || '';
}

export function getRefreshToken() {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) || '';
}

export function hasAuthSession() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function setAuthSession(tokens) {
  const storage = getStorage();
  if (!storage || !tokens?.accessToken || !tokens?.refreshToken) return;

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearAuthSession() {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
