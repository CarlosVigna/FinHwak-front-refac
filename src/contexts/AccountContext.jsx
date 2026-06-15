import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../pages/Login/AuthContext';

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [accountId, setAccountIdState] = useState(
    () => localStorage.getItem('accountId') || null
  );
  const [accountName, setAccountNameState] = useState(
    () => localStorage.getItem('accountName') || null
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setAccountIdState(null);
      setAccountNameState(null);
    }
  }, [isAuthenticated]);

  const setAccount = useCallback((id, name) => {
    const idStr = id ? String(id) : null;
    if (idStr) {
      localStorage.setItem('accountId', idStr);
      localStorage.setItem('accountName', name || '');
    } else {
      localStorage.removeItem('accountId');
      localStorage.removeItem('accountName');
    }
    setAccountIdState(idStr);
    setAccountNameState(name || null);
  }, []);

  const clearAccount = useCallback(() => {
    setAccount(null, null);
  }, [setAccount]);

  return (
    <AccountContext.Provider value={{ accountId, accountName, setAccount, clearAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within AccountProvider');
  return ctx;
}
