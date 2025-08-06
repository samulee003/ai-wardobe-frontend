// 性能監控工具
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isSupported = 'performance' in window;
    
    if (this.isSupported) {
      this.initializeObservers();
    }
  }

  // 初始化性能觀察器
  initializeObservers() {
    // 觀察 LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer 不支持:', error);
      }

      // 觀察 FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer 不支持:', error);
      }

      // 觀察 CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric('CLS', clsValue);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer 不支持:', error);
      }
    }
  }

  // 記錄指標
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    // 觸發事件
    this.dispatchMetricEvent(metric);
  }

  // 測量函數執行時間
  measureFunction(name, fn) {
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      // 如果是 Promise，等待完成
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          const endTime = performance.now();
          this.recordMetric(`function_${name}`, endTime - startTime);
        });
      } else {
        const endTime = performance.now();
        this.recordMetric(`function_${name}`, endTime - startTime);
        return result;
      }
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`function_${name}`, endTime - startTime, { error: error.message });
      throw error;
    }
  }

  // 測量 API 請求時間
  measureAPICall(url, options = {}) {
    const startTime = performance.now();
    
    return fetch(url, options)
      .then(response => {
        const endTime = performance.now();
        this.recordMetric('api_call', endTime - startTime, {
          url,
          status: response.status,
          success: response.ok
        });
        return response;
      })
      .catch(error => {
        const endTime = performance.now();
        this.recordMetric('api_call', endTime - startTime, {
          url,
          error: error.message,
          success: false
        });
        throw error;
      });
  }

  // 測量頁面載入時間
  measurePageLoad() {
    if (!this.isSupported) return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        this.recordMetric('page_load', navigation.loadEventEnd - navigation.fetchStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('first_byte', navigation.responseStart - navigation.fetchStart);
      }
    });
  }

  // 測量資源載入時間
  measureResourceLoading() {
    if (!this.isSupported) return;

    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('resource_load', entry.duration, {
          name: entry.name,
          type: entry.initiatorType,
          size: entry.transferSize
        });
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', resourceObserver);
  }

  // 監控內存使用
  measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      this.recordMetric('memory_usage', memory.usedJSHeapSize, {
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      });
    }
  }

  // 監控網絡狀態
  measureNetworkStatus() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.recordMetric('network_status', connection.effectiveType, {
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
    }
  }

  // 獲取 Web Vitals
  getWebVitals() {
    const vitals = {};
    
    ['LCP', 'FID', 'CLS'].forEach(metric => {
      const entries = this.metrics.get(metric);
      if (entries && entries.length > 0) {
        vitals[metric] = entries[entries.length - 1].value;
      }
    });
    
    return vitals;
  }

  // 獲取性能報告
  getPerformanceReport() {
    const report = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      webVitals: this.getWebVitals(),
      metrics: {}
    };

    // 計算各指標的統計信息
    this.metrics.forEach((entries, name) => {
      if (entries.length > 0) {
        const values = entries.map(e => e.value);
        report.metrics[name] = {
          count: entries.length,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          latest: entries[entries.length - 1].value
        };
      }
    });

    return report;
  }

  // 發送性能數據到服務器
  async sendMetrics(endpoint = '/api/analytics/performance') {
    try {
      const report = this.getPerformanceReport();
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.error('發送性能數據失敗:', error);
    }
  }

  // 觸發指標事件
  dispatchMetricEvent(metric) {
    const event = new CustomEvent('performance-metric', {
      detail: metric
    });
    window.dispatchEvent(event);
  }

  // 清理觀察器
  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }

  // 設置性能預算警告
  setPerformanceBudget(budgets) {
    this.budgets = budgets;
    
    window.addEventListener('performance-metric', (event) => {
      const { name, value } = event.detail;
      const budget = this.budgets[name];
      
      if (budget && value > budget) {
        console.warn(`性能預算超標: ${name} = ${value}ms (預算: ${budget}ms)`);
        
        // 可以發送警告到監控系統
        this.recordMetric('budget_exceeded', value, {
          metric: name,
          budget,
          excess: value - budget
        });
      }
    });
  }

  // 開始監控
  startMonitoring() {
    this.measurePageLoad();
    this.measureResourceLoading();
    
    // 定期測量內存和網絡狀態
    setInterval(() => {
      this.measureMemoryUsage();
      this.measureNetworkStatus();
    }, 30000); // 每30秒測量一次

    // 頁面卸載時發送數據
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });
  }
}

// 創建全局實例
const performanceMonitor = new PerformanceMonitor();

// 設置性能預算
performanceMonitor.setPerformanceBudget({
  LCP: 2500,    // 2.5秒
  FID: 100,     // 100毫秒
  CLS: 0.1,     // 0.1
  page_load: 3000,  // 3秒
  api_call: 1000    // 1秒
});

// 開始監控
performanceMonitor.startMonitoring();

export default performanceMonitor;