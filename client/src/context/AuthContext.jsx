import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import * as storage from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = storage.getToken();
      if (token) {
        try {
          const { user: userData } = await authApi.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Ошибка авторизации:", err);
          storage.removeToken();
          storage.removeUser();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const data = await authApi.login(username, password);
      // Сохраняем токен и пользователя в localStorage
      storage.setToken(data.token);
      storage.setUser(data.user);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Неизвестная ошибка';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    storage.removeToken();
    storage.removeUser();
    setUser(null);
  };

  // Проверка ролей
  const hasRole = (roles) => {
    if (!user) return false;
    if (user.role === 'администратор') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
