import { toastManager } from '../components/Toast';

// 錯誤類型定義
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// ADHD 友好的錯誤消息
const ADHDFriendlyMessages = {
  [ErrorTypes.NETWORK_ERROR]: {
    title: '網絡連接問題',
    message: '網絡似乎有點問題，請檢查網絡連接後重試',
    action: '重試'
  },
  [ErrorTypes.API_ERROR]: {
    title: '服務暫時不可用',
    message: '服務器正在休息，請稍後再試',
    action: '稍後重試'
  },
  [ErrorTypes.VALIDATION_ERROR]: {
    title: '輸入信息需要調整',
    message: '請檢查輸入的信息是否正確',
    action: '檢查輸入'
  },
  [ErrorTypes.AUTH_ERROR]: {
    title: '需要重新登錄',
    message: '登錄狀態已過期，請重新登錄',
    action: '重新登錄'
  },
  [ErrorTypes.FILE_ERROR]: {
    title: '文件處理問題',
    message: '文件可能太大或格式不支持，請嘗試其他文件',
    action: '選擇其他文件'
  },
  [ErrorTypes.AI_SERVICE_ERROR]: {
    title: 'AI 服務暫時不可用',
    message: 'AI 正在學習中，請稍後再試',
    action: '稍後重試'
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: '出現了意外問題',
    message: '別擔心，這不是你的錯，請嘗試刷新頁面',
    action: '刷新頁面'
  }
};

// 標準錯誤消息
const StandardMessages = {
  [ErrorTypes.NETWORK_ERROR]: {
    title: '網絡錯誤',
    message: '無法連接到服務器，請檢查網絡連接',
    action: '重試'
  },
  [ErrorTypes.API_ERROR]: {
    title: 'API 錯誤',
    message: '服務器響應錯誤，請稍後重試',
    action: '重試'
  },
  [ErrorTypes.VALIDATION_ERROR]: {
    title: '驗證錯誤',
    message: '請檢查輸入數據的格式和完整性',
    action: '檢查輸入'
  },
  [ErrorTypes.AUTH_ERROR]: {
    title: '認證錯誤',
    message: '身份驗證失敗，請重新登錄',
    action: '重新登錄'
  },
  [ErrorTypes.FILE_ERROR]: {
    title: '文件錯誤',
    message: '文件上傳或處理失敗',
    action: '重新上傳'
  },
  [ErrorTypes.AI_SERVICE_ERROR]: {
    title: 'AI 服務錯誤',
    message: 'AI 服務暫時不可用，請稍後重試',
    action: '重試'
  },
  [ErrorTypes.UNKNOWN_ERROR]: {
    title: '未知錯誤',
    message: '發生了未預期的錯誤',
    action: '刷新頁面'
  }
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.setupGlobalErrorHandlers();
  }

  // 設置全局錯誤處理器
  setupGlobalErrorHandlers() {
    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      console.error('未處理的 Promise 拒絕:', event.reason);
      this.handleError(event.reason, ErrorTypes.UNKNOWN_ERROR);
      event.preventDefault();
    });

    // 捕獲全局 JavaScript 錯誤
    window.addEventListener('error', (event) => {
      console.error('全局錯誤:', event.error);
      this.handleError(event.error, ErrorTypes.UNKNOWN_ERROR);
    });
  }

  // 主要錯誤處理方法
  handleError(error, type = ErrorTypes.UNKNOWN_ERROR, context = {}) {
    // 記錄錯誤
    this.logError(error, type, context);

    // 確定錯誤類型
    const errorType = this.determineErrorType(error, type);

    // 獲取適當的錯誤消息
    const isADHDMode = document.body.classList.contains('simplified-mode');
    const messages = isADHDMode ? ADHDFriendlyMessages : StandardMessages;
    const errorMessage = messages[errorType] || messages[ErrorTypes.UNKNOWN_ERROR];

    // 顯示用戶友好的錯誤消息
    this.showUserMessage(errorMessage, errorType);

    // 發送錯誤報告
    this.reportError(error, errorType, context);

    return errorMessage;
  }

  // 確定錯誤類型
  determineErrorType(error, suggestedType) {
    if (suggestedType !== ErrorTypes.UNKNOWN_ERROR) {
      return suggestedType;
    }

    // 根據錯誤內容自動判斷類型
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status || error?.response?.status;

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return ErrorTypes.NETWORK_ERROR;
    }

    if (errorStatus === 401 || errorStatus === 403) {
      return ErrorTypes.AUTH_ERROR;
    }

    if (errorStatus >= 400 && errorStatus < 500) {
      return ErrorTypes.VALIDATION_ERROR;
    }

    if (errorStatus >= 500) {
      return ErrorTypes.API_ERROR;
    }

    if (errorMessage.includes('file') || errorMessage.includes('upload')) {
      return ErrorTypes.FILE_ERROR;
    }

    if (errorMessage.includes('ai') || errorMessage.includes('vision') || errorMessage.includes('gemini')) {
      return ErrorTypes.AI_SERVICE_ERROR;
    }

    return ErrorTypes.UNKNOWN_ERROR;
  }

  // 顯示用戶消息
  showUserMessage(errorMessage, errorType) {
    const toastType = this.getToastType(errorType);
    
    toastManager.show(errorMessage.message, {
      type: toastType,
      title: errorMessage.title,
      duration: errorType === ErrorTypes.AUTH_ERROR ? 0 : 6000, // 認證錯誤持久顯示
      persistent: errorType === ErrorTypes.AUTH_ERROR
    });
  }

  // 獲取 Toast 類型
  getToastType(errorType) {
    switch (errorType) {
      case ErrorTypes.VALIDATION_ERROR:
        return 'warning';
      case ErrorTypes.AUTH_ERROR:
      case ErrorTypes.API_ERROR:
      case ErrorTypes.AI_SERVICE_ERROR:
        return 'error';
      case ErrorTypes.NETWORK_ERROR:
      case ErrorTypes.FILE_ERROR:
        return 'warning';
      default:
        return 'error';
    }
  }

  // 記錄錯誤
  logError(error, type, context) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      },
      type,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errorLog.push(errorEntry);

    // 限制日誌大小
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    console.error('錯誤處理器記錄:', errorEntry);
  }

  // 發送錯誤報告
  async reportError(error, type, context) {
    try {
      const report = {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        type,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // 發送到錯誤監控服務
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
    } catch (reportError) {
      console.error('發送錯誤報告失敗:', reportError);
    }
  }

  // 處理 API 錯誤
  handleAPIError(error, endpoint) {
    const context = { endpoint, timestamp: Date.now() };
    
    if (!navigator.onLine) {
      return this.handleError(error, ErrorTypes.NETWORK_ERROR, context);
    }

    const status = error?.response?.status || error?.status;
    
    if (status === 401 || status === 403) {
      return this.handleError(error, ErrorTypes.AUTH_ERROR, context);
    }

    if (status >= 400 && status < 500) {
      return this.handleError(error, ErrorTypes.VALIDATION_ERROR, context);
    }

    if (status >= 500) {
      return this.handleError(error, ErrorTypes.API_ERROR, context);
    }

    return this.handleError(error, ErrorTypes.NETWORK_ERROR, context);
  }

  // 處理文件錯誤
  handleFileError(error, fileName) {
    const context = { fileName, fileSize: error?.fileSize };
    return this.handleError(error, ErrorTypes.FILE_ERROR, context);
  }

  // 處理 AI 服務錯誤
  handleAIError(error, service) {
    const context = { service, timestamp: Date.now() };
    return this.handleError(error, ErrorTypes.AI_SERVICE_ERROR, context);
  }

  // 獲取錯誤日誌
  getErrorLog() {
    return [...this.errorLog];
  }

  // 清除錯誤日誌
  clearErrorLog() {
    this.errorLog = [];
  }

  // 導出錯誤日誌
  exportErrorLog() {
    const logData = {
      exportTime: new Date().toISOString(),
      errors: this.errorLog
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-log-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// 創建全局錯誤處理器實例
const errorHandler = new ErrorHandler();

export default errorHandler;