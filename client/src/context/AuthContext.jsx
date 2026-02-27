import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data.user);
      } catch {
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
    await api.post('/auth/logout');
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
