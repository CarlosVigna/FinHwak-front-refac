import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const isTokenValid = (tokenVal) => {
    return !!tokenVal && tokenVal !== 'null' && tokenVal !== 'undefined';
  };

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(isTokenValid(localStorage.getItem('token')));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
    setIsAuthenticated(isTokenValid(savedToken));
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    localStorage.removeItem('accountId');
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accountId');
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = useMemo(() => ({
    token,
    isAuthenticated,
    login,
    logout
  }), [token, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}