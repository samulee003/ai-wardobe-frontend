import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user] = useState({ id: 'guest', name: '訪客' });
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem('token'));

  // 設置axios默認headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 檢查用戶登錄狀態
  useEffect(() => {
    // 離線/無認證模式：直接完成載入
    setLoading(false);
  }, [token]);

  // 移除真實登入/註冊/更新/刷新函數，避免未使用警告

  const value = {
    user,
    token,
    loading,
    login: async () => ({ success: true }),
    register: async () => ({ success: true }),
    logout: () => {},
    updateProfile: async () => ({ success: true }),
    refreshToken: async () => true,
    isAuthenticated: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};