import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

import { API_BASE } from '../config/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('esnafpano_token'));
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('esnafpano_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/auth/me`);
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('esnafpano_user', JSON.stringify(data.user));
      }
    } catch {
      // Ağ hatası veya geçici kesintide hemen silme
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone, password) => {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email: emailOrPhone, password });
    if (data.success) {
      localStorage.setItem('esnafpano_token', data.token);
      localStorage.setItem('esnafpano_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post(`${API_BASE}/auth/register`, formData);
    if (data.success) {
      localStorage.setItem('esnafpano_token', data.token);
      localStorage.setItem('esnafpano_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('esnafpano_token');
    localStorage.removeItem('esnafpano_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const saveSession = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('esnafpano_token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    if (newUser) {
      localStorage.setItem('esnafpano_user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
