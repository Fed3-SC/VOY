import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser, updateProfile as apiUpdateProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(res => {
      if (res.success) setUser(res.data);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success) setUser(res.data.user);
    return res;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await apiRegister(userData);
    if (res.success) setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await apiUpdateProfile(data);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user, isAdmin: user?.isAdmin === true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
