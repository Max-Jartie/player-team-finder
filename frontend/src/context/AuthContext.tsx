import React, { createContext, useContext, useState, useEffect } from 'react';
import { parseJwtPayload } from '../services/parseJwt';

export interface UserData {
  id: number;
  email: string;
  nickname?: string;
  is_admin: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  token: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildUserFromToken = (token: string, email: string): UserData => {
  const { user_id, is_admin } = parseJwtPayload(token);
  const storedId = localStorage.getItem('user_id');
  const storedAdmin = localStorage.getItem('is_admin') === 'true';
  const id = user_id ?? (storedId ? parseInt(storedId, 10) : 0);
  return {
    id,
    email,
    nickname: email.split('@')[0],
    is_admin: is_admin || storedAdmin,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (token) {
      const savedEmail = localStorage.getItem('user_email') || '';
      setUser(buildUserFromToken(token, savedEmail));
    }
  }, [token]);

  const login = (newToken: string, email: string) => {
    const { user_id, is_admin } = parseJwtPayload(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_email', email);
    if (user_id !== null) localStorage.setItem('user_id', String(user_id));
    localStorage.setItem('is_admin', String(is_admin));
    setToken(newToken);
    setUser(buildUserFromToken(newToken, email));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
