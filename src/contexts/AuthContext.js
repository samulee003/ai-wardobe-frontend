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
  // 自用模式：關閉登入機制
  const [user] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(null);

  // 設置axios默認headers
  useEffect(() => {
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // 檢查用戶登錄狀態
  useEffect(() => {}, []);

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