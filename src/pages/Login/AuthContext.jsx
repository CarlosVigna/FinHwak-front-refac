import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler, api } from '../../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const isTokenValid = (tokenVal) => {
    return !!tokenVal && tokenVal !== 'null' && tokenVal !== 'undefined';
  };

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid(localStorage.getItem('token')));

  // Busca os dados do usuário sempre que um token válido estiver presente
  useEffect(() => {
    if (!isTokenValid(token)) {
      setUser(null);
      return;
    }

    api.get('/user/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setUser(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
    setIsAuthenticated(isTokenValid(savedToken));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accountId');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback((newToken, newRefreshToken) => {
    localStorage.setItem('token', newToken);
    if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.removeItem('accountId');
    setToken(newToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accountId');
    localStorage.removeItem('accountName');
    localStorage.removeItem('dashboardShowConsolidated');
    localStorage.removeItem('lastAccountId');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshUser = useCallback(() => {
    const currentToken = localStorage.getItem('token');
    if (!isTokenValid(currentToken)) return;
    api.get('/user/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setUser(data); })
      .catch(() => {});
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }), [token, user, isAuthenticated, login, logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}