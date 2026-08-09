// src/auth/AuthContext.jsx
//
// C.1 Super Admin Authentication -- Secure Login, Auto Session Restore,
// Logout, Unauthorized Access Protection. One context is the single source
// of truth for "who is logged in right now" across the whole app; pages
// never call authApi directly, they call useAuth().

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, hasSession } from './tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'

  // C.1 Auto Session Restore -- on every app load, if tokens exist, confirm
  // they're still valid (and the account still active) by calling /me
  // rather than trusting a decoded-but-unverified JWT client-side.
  useEffect(() => {
    async function restore() {
      if (!hasSession()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const profile = await authApi.me();
        setAdmin(profile);
        setStatus('authenticated');
      } catch {
        clearTokens();
        setStatus('unauthenticated');
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authApi.login(email, password);
    setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setAdmin(result.admin);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      clearTokens();
      setAdmin(null);
      setStatus('unauthenticated');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, status, login, logout, isAuthenticated: status === 'authenticated' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
