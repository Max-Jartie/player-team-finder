import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn || !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
