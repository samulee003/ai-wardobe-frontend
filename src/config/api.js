// API 配置
const API_CONFIG = {
  // 本地開發 - 可透過環境變數覆寫為 Zeabur API
  development: process.env.REACT_APP_API_URL || 'https://ai-wardobe.zeabur.app',
  // 生產環境 (雲端 API)
  production: process.env.REACT_APP_API_URL || 'https://ai-wardobe.zeabur.app',
  // 離線模式 - 使用本地存儲
  offline: null
};

// 檢測當前環境
const getCurrentEnvironment = () => {
  const forced = process.env.REACT_APP_MODE;
  if (forced === 'offline') return 'offline';
  // 允許在裝置上依然使用雲端：僅當顯式設定 OFFLINE_MODE 時才離線
  try {
    if (typeof window !== 'undefined') {
      const flag = localStorage.getItem('OFFLINE_MODE');
      if (flag === 'true') return 'offline';
    }
  } catch (_) {}
  return process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';
};

export const API_BASE_URL = API_CONFIG[getCurrentEnvironment()];
export const IS_OFFLINE_MODE = getCurrentEnvironment() === 'offline';

console.log('API 配置:', {
  environment: getCurrentEnvironment(),
  baseUrl: API_BASE_URL,
  isOffline: IS_OFFLINE_MODE
});