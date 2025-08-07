// API 配置
const API_CONFIG = {
  // 本地開發
  development: 'http://localhost:5000',
  
  // 生產環境 (如果有服務器)
  production: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // 離線模式 - 使用本地存儲
  offline: null
};

// 檢測當前環境
const getCurrentEnvironment = () => {
  // 如果是 Capacitor 應用且沒有網絡連接
  if (window.Capacitor) {
    return 'offline';
  }
  
  return process.env.NODE_ENV || 'development';
};

export const API_BASE_URL = API_CONFIG[getCurrentEnvironment()];
export const IS_OFFLINE_MODE = getCurrentEnvironment() === 'offline';

console.log('API 配置:', {
  environment: getCurrentEnvironment(),
  baseUrl: API_BASE_URL,
  isOffline: IS_OFFLINE_MODE
});