import React, { createContext, useContext, useState, useEffect } from 'react';

// Описываем структуру данных пользователя
interface UserData {
  email: string;
  nickname?: string;
}

// Описываем структуру самого контекста
interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  token: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserData | null>(null);

  // При первом запуске проверяем, есть ли сохраненный токен
  useEffect(() => {
    if (token) {
      // В будущем здесь будет запрос к бэкенду
      const savedEmail = localStorage.getItem('user_email') || '';
      setUser({ email: savedEmail, nickname: savedEmail.split('@')[0] });
    }
  }, [token]);

  // Функция входа
  const login = (newToken: string, email: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user_email', email);
    setToken(newToken);
    setUser({ email, nickname: email.split('@')[0] });
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
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

// Кастомный хук
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};
