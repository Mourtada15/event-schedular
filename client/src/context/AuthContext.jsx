import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import { clearAuthSession, getRefreshToken, hasAuthSession } from '../utils/authSession.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!hasAuthSession()) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } catch {
        clearAuthSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.data.data.user);
    return response.data.data.user;
  }

  async function register(payload) {
    const response = await api.post('/auth/register', payload);
    setUser(response.data.data.user);
    return response.data.data.user;
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Clear local auth state even if token revocation fails.
    }
    clearAuthSession();
    setUser(null);
  }

  async function refreshCurrentUser() {
    const response = await api.get('/auth/me');
    setUser(response.data.data.user);
    return response.data.data.user;
  }

  const value = useMemo(
    () => ({ user, loading, setUser, login, register, logout, refreshCurrentUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
