import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
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
      localStorage.removeItem('accountId');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    localStorage.removeItem('accountId');
    setToken(newToken);
    setIsAuthenticated(true);
    // user será carregado pelo useEffect acima ao detectar a mudança de token
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountId');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    const currentToken = localStorage.getItem('token');
    if (!isTokenValid(currentToken)) return;
    api.get('/user/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setUser(data); })
      .catch(() => {});
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }), [token, user, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}