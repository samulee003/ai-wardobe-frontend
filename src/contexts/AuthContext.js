import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

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
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('認證檢查失敗:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // 登錄
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
      toast.success('登錄成功！');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || '登錄失敗';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 註冊
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      
      toast.success('註冊成功！');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || '註冊失敗';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 登出
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.info('已登出');
  };

  // 更新用戶資料
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates);
      setUser(response.data.user);
      toast.success('資料更新成功');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || '更新失敗';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // 刷新令牌
  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};