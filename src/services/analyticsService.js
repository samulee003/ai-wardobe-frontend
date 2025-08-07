class AnalyticsService {
  constructor() {
    this.isEnabled = this.getAnalyticsConsent();
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }

  log(message) {
    console.log(`[Analytics] ${message}`);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  getAnalyticsConsent() {
    const consent = localStorage.getItem('analytics_consent');
    return consent === 'true';
  }

  setAnalyticsConsent(enabled) {
    localStorage.setItem('analytics_consent', enabled.toString());
    this.isEnabled = enabled;
    
    if (enabled) {
      this.log('分析功能已啟用');
      this.trackEvent('analytics_enabled');
    } else {
      this.log('分析功能已禁用');
      // 清理本地分析數據
      this.clearAnalyticsData();
    }
  }

  clearAnalyticsData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('analytics_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.log('分析數據已清理');
  }

  async trackEvent(eventName, properties = {}) {
    if (!this.isEnabled) {
      return;
    }

    const eventData = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    try {
      // 本地存儲（離線支持）
      this.storeEventLocally(eventData);

      // 發送到服務器（如果在線）
      if (navigator.onLine) {
        await this.sendEventToServer(eventData);
      }

    } catch (error) {
      this.log(`事件追蹤失敗: ${error.message}`);
    }
  }

  storeEventLocally(eventData) {
    const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    localEvents.push(eventData);

    // 只保留最近100個事件
    if (localEvents.length > 100) {
      localEvents.splice(0, localEvents.length - 100);
    }

    localStorage.setItem('analytics_events', JSON.stringify(localEvents));
  }

  async sendEventToServer(eventData) {
    try {
      const response = await fetch(`${this.apiUrl}/api/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        this.log(`事件已發送: ${eventData.eventName}`);
      }
    } catch (error) {
      // 網絡錯誤時靜默失敗
      this.log(`事件發送失敗: ${error.message}`);
    }
  }

  async syncOfflineEvents() {
    if (!this.isEnabled || !navigator.onLine) {
      return;
    }

    const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    if (localEvents.length === 0) {
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/analytics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: localEvents })
      });

      if (response.ok) {
        localStorage.removeItem('analytics_events');
        this.log(`已同步 ${localEvents.length} 個離線事件`);
      }
    } catch (error) {
      this.log(`離線事件同步失敗: ${error.message}`);
    }
  }

  // 預定義的事件追蹤方法
  trackAppStart() {
    this.trackEvent('app_start', {
      version: process.env.REACT_APP_VERSION,
      platform: 'web'
    });
  }

  trackPageView(pageName) {
    this.trackEvent('page_view', {
      page: pageName,
      path: window.location.pathname
    });
  }

  trackClothingUpload(method, success) {
    this.trackEvent('clothing_upload', {
      method, // 'camera', 'file', etc.
      success,
      timestamp: new Date().toISOString()
    });
  }

  trackAIAnalysis(success, confidence, processingTime) {
    this.trackEvent('ai_analysis', {
      success,
      confidence,
      processingTime,
      timestamp: new Date().toISOString()
    });
  }

  trackFeatureUsage(feature) {
    this.trackEvent('feature_usage', {
      feature, // 'wardrobe', 'outfits', 'statistics', etc.
      timestamp: new Date().toISOString()
    });
  }

  trackError(error, context) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  trackPerformance(metric, value) {
    this.trackEvent('performance', {
      metric, // 'load_time', 'api_response_time', etc.
      value,
      timestamp: new Date().toISOString()
    });
  }

  // 獲取使用統計
  getUsageStats() {
    if (!this.isEnabled) {
      return null;
    }

    const localEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    
    const stats = {
      totalEvents: localEvents.length,
      eventTypes: {},
      sessionDuration: 0,
      featuresUsed: new Set()
    };

    localEvents.forEach(event => {
      // 統計事件類型
      stats.eventTypes[event.eventName] = (stats.eventTypes[event.eventName] || 0) + 1;
      
      // 統計使用的功能
      if (event.properties.feature) {
        stats.featuresUsed.add(event.properties.feature);
      }
    });

    stats.featuresUsed = Array.from(stats.featuresUsed);

    return stats;
  }

  // 初始化分析服務
  initialize() {
    // 應用啟動追蹤
    this.trackAppStart();

    // 定期同步離線事件
    setInterval(() => {
      this.syncOfflineEvents();
    }, 5 * 60 * 1000); // 每5分鐘同步一次

    // 頁面卸載時同步
    window.addEventListener('beforeunload', () => {
      this.syncOfflineEvents();
    });

    // 網絡狀態變化時同步
    window.addEventListener('online', () => {
      this.syncOfflineEvents();
    });

    this.log('分析服務已初始化');
  }
}

// 創建全局實例
const analyticsService = new AnalyticsService();

export default analyticsService;