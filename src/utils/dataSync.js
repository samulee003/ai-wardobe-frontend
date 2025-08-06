import axios from 'axios';
import { toast } from 'react-toastify';

class DataSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // 監聽網絡狀態變化
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // 定期同步
    this.startPeriodicSync();
  }

  // 網絡狀態處理
  handleOnline() {
    this.isOnline = true;
    toast.success('網絡已連接，正在同步數據...');
    this.processSyncQueue();
  }

  handleOffline() {
    this.isOnline = false;
    toast.warn('網絡已斷開，數據將在本地緩存');
  }

  // 添加到同步隊列
  addToSyncQueue(operation) {
    const syncItem = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      operation,
      retryCount: 0,
      maxRetries: 3
    };
    
    this.syncQueue.push(syncItem);
    this.saveQueueToStorage();
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  // 處理同步隊列
  async processSyncQueue() {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const itemsToSync = [...this.syncQueue];
      
      for (const item of itemsToSync) {
        try {
          await this.executeOperation(item.operation);
          
          // 成功後從隊列中移除
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
          
        } catch (error) {
          console.error('同步操作失敗:', error);
          
          // 增加重試次數
          item.retryCount++;
          
          if (item.retryCount >= item.maxRetries) {
            // 達到最大重試次數，移除項目
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
            toast.error(`數據同步失敗: ${item.operation.type}`);
          }
        }
      }
      
      this.saveQueueToStorage();
      
    } finally {
      this.syncInProgress = false;
    }
  }

  // 執行同步操作
  async executeOperation(operation) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('用戶未登錄');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    switch (operation.type) {
      case 'CREATE_CLOTHING':
        return await axios.post('/api/clothes/upload', operation.data, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        });
        
      case 'UPDATE_CLOTHING':
        return await axios.put(`/api/clothes/${operation.id}`, operation.data, config);
        
      case 'DELETE_CLOTHING':
        return await axios.delete(`/api/clothes/${operation.id}`, config);
        
      case 'RECORD_WEAR':
        return await axios.post(`/api/clothes/${operation.id}/wear`, {}, config);
        
      case 'BATCH_WEAR':
        return await axios.post('/api/clothes/batch-wear', operation.data, config);
        
      case 'SAVE_OUTFIT':
        return await axios.post('/api/outfits/save', operation.data, config);
        
      case 'OUTFIT_FEEDBACK':
        return await axios.post('/api/outfits/feedback', operation.data, config);
        
      case 'UPDATE_PROFILE':
        return await axios.put('/api/auth/profile', operation.data, config);
        
      default:
        throw new Error(`未知的同步操作類型: ${operation.type}`);
    }
  }

  // 保存隊列到本地存儲
  saveQueueToStorage() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('保存同步隊列失敗:', error);
    }
  }

  // 從本地存儲加載隊列
  loadQueueFromStorage() {
    try {
      const saved = localStorage.getItem('syncQueue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('加載同步隊列失敗:', error);
      this.syncQueue = [];
    }
  }

  // 開始定期同步
  startPeriodicSync() {
    // 每5分鐘嘗試同步一次
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  // 導出數據
  async exportData() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('用戶未登錄');
      }

      // 獲取所有用戶數據
      const [clothesRes, statisticsRes, profileRes] = await Promise.all([
        axios.get('/api/clothes?limit=1000', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/clothes/statistics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        user: profileRes.data.user,
        clothes: clothesRes.data.clothes,
        statistics: statisticsRes.data,
        syncQueue: this.syncQueue
      };

      // 創建下載鏈接
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wardrobe-data-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('數據導出成功！');
      
    } catch (error) {
      console.error('導出數據失敗:', error);
      toast.error('導出數據失敗');
      throw error;
    }
  }

  // 清理過期的緩存數據
  cleanupCache() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.syncQueue = this.syncQueue.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate > oneWeekAgo;
    });
    
    this.saveQueueToStorage();
  }

  // 獲取同步狀態
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
      lastSync: localStorage.getItem('lastSyncTime')
    };
  }

  // 強制同步
  async forceSync() {
    if (!this.isOnline) {
      toast.error('網絡未連接，無法同步');
      return;
    }

    toast.info('開始強制同步...');
    await this.processSyncQueue();
    
    localStorage.setItem('lastSyncTime', new Date().toISOString());
    toast.success('數據同步完成！');
  }
}

// 創建全局實例
const dataSyncManager = new DataSyncManager();

// 初始化時加載隊列
dataSyncManager.loadQueueFromStorage();

export default dataSyncManager;