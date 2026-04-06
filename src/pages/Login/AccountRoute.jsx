import React from 'react';
import { Navigate } from 'react-router-dom';

const AccountRoute = ({ children }) => {
  const accountId = localStorage.getItem('accountId');

  if (!accountId) {
    return <Navigate to="/contas" replace />;
  }

  return children;
};

export default AccountRoute;