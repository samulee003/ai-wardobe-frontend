/**
 * 本地儲存服務 - 基於 IndexedDB 的衣櫃資料管理
 * 支援衣物資料、圖片 Blob、離線優先的設計
 */

class LocalStorageService {
  constructor() {
    this.dbName = 'AI_WardrobeDB';
    this.version = 1;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * 初始化資料庫
   * @returns {Promise<IDBDatabase>}
   */
  async initialize() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('IndexedDB 初始化失敗:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('IndexedDB 初始化成功');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 建立 clothes store
        if (!db.objectStoreNames.contains('clothes')) {
          const clothesStore = db.createObjectStore('clothes', { keyPath: 'id' });
          
          // 建立索引
          clothesStore.createIndex('category', 'category', { unique: false });
          clothesStore.createIndex('style', 'style', { unique: false });
          clothesStore.createIndex('colors', 'colors', { unique: false, multiEntry: true });
          clothesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          clothesStore.createIndex('createdAt', 'createdAt', { unique: false });
          clothesStore.createIndex('favorite', 'favorite', { unique: false });
          
          console.log('Clothes store 建立完成');
        }
        
        // 建立 images store（專門儲存圖片 Blob）
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
          console.log('Images store 建立完成');
        }
        
        // 建立 settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
          console.log('Settings store 建立完成');
        }
      };
    });
  }

  /**
   * 確保資料庫已初始化
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * 新增衣物
   * @param {Object} clothingData - 衣物資料
   * @param {Blob} imageBlob - 圖片 Blob（可選）
   * @returns {Promise<string>} 新增的衣物 ID
   */
  async addClothing(clothingData, imageBlob = null) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['clothes', 'images'], 'readwrite');
    const clothesStore = transaction.objectStore('clothes');
    const imagesStore = transaction.objectStore('images');
    
    // 生成 ID
    const id = clothingData.id || this.generateId();
    
    // 準備衣物資料
    const clothing = {
      ...clothingData,
      id,
      createdAt: clothingData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasLocalImage: !!imageBlob
    };
    
    // 移除 imageUrl 和 imageBlob，避免儲存到 clothes store
    delete clothing.imageUrl;
    delete clothing.imageBlob;
    
    try {
      // 儲存衣物資料
      await this.promisifyRequest(clothesStore.add(clothing));
      
      // 儲存圖片（如果有）
      if (imageBlob) {
        await this.promisifyRequest(imagesStore.add({
          id,
          blob: imageBlob,
          type: imageBlob.type,
          size: imageBlob.size,
          createdAt: new Date().toISOString()
        }));
      }
      
      console.log(`衣物 ${id} 新增成功`);
      return id;
      
    } catch (error) {
      console.error('新增衣物失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取單件衣物（含圖片）
   * @param {string} id - 衣物 ID
   * @returns {Promise<Object|null>}
   */
  async getClothing(id) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['clothes', 'images'], 'readonly');
    const clothesStore = transaction.objectStore('clothes');
    const imagesStore = transaction.objectStore('images');
    
    try {
      const clothing = await this.promisifyRequest(clothesStore.get(id));
      if (!clothing) return null;
      
      // 嘗試獲取本地圖片
      const imageData = await this.promisifyRequest(imagesStore.get(id));
      if (imageData) {
        clothing.imageBlob = imageData.blob;
        clothing.imageUrl = URL.createObjectURL(imageData.blob);
      }
      
      return clothing;
      
    } catch (error) {
      console.error('獲取衣物失敗:', error);
      return null;
    }
  }

  /**
   * 獲取所有衣物列表
   * @param {Object} options - 查詢選項
   * @returns {Promise<Array>}
   */
  async getAllClothes(options = {}) {
    await this.ensureInitialized();
    
    const { 
      limit = 1000, 
      offset = 0, 
      category = null, 
      style = null, 
      favorite = null,
      includeImages = true 
    } = options;
    
    const transaction = this.db.transaction(['clothes', 'images'], 'readonly');
    const clothesStore = transaction.objectStore('clothes');
    const imagesStore = transaction.objectStore('images');
    
    try {
      let cursor;
      
      // 根據篩選條件選擇索引
      if (category) {
        cursor = await this.promisifyRequest(
          clothesStore.index('category').openCursor(IDBKeyRange.only(category))
        );
      } else if (style) {
        cursor = await this.promisifyRequest(
          clothesStore.index('style').openCursor(IDBKeyRange.only(style))
        );
      } else if (favorite !== null) {
        cursor = await this.promisifyRequest(
          clothesStore.index('favorite').openCursor(IDBKeyRange.only(favorite))
        );
      } else {
        cursor = await this.promisifyRequest(clothesStore.openCursor());
      }
      
      const results = [];
      let count = 0;
      let skipped = 0;
      
      while (cursor && count < limit) {
        if (skipped >= offset) {
          const clothing = cursor.value;
          
          // 載入圖片（如果需要）
          if (includeImages && clothing.hasLocalImage) {
            try {
              const imageData = await this.promisifyRequest(imagesStore.get(clothing.id));
              if (imageData) {
                clothing.imageBlob = imageData.blob;
                clothing.imageUrl = URL.createObjectURL(imageData.blob);
              }
            } catch (error) {
              console.warn(`載入圖片 ${clothing.id} 失敗:`, error);
            }
          }
          
          results.push(clothing);
          count++;
        } else {
          skipped++;
        }
        
        cursor = await this.promisifyRequest(cursor.continue());
      }
      
      return results;
      
    } catch (error) {
      console.error('獲取衣物列表失敗:', error);
      return [];
    }
  }

  /**
   * 更新衣物
   * @param {string} id - 衣物 ID
   * @param {Object} updates - 更新資料
   * @param {Blob} newImageBlob - 新圖片 Blob（可選）
   * @returns {Promise<boolean>}
   */
  async updateClothing(id, updates, newImageBlob = null) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['clothes', 'images'], 'readwrite');
    const clothesStore = transaction.objectStore('clothes');
    const imagesStore = transaction.objectStore('images');
    
    try {
      // 獲取現有資料
      const existing = await this.promisifyRequest(clothesStore.get(id));
      if (!existing) {
        throw new Error(`衣物 ${id} 不存在`);
      }
      
      // 準備更新資料
      const updated = {
        ...existing,
        ...updates,
        id, // 確保 ID 不變
        updatedAt: new Date().toISOString(),
        hasLocalImage: newImageBlob ? true : existing.hasLocalImage
      };
      
      // 移除不應該儲存到 clothes store 的欄位
      delete updated.imageUrl;
      delete updated.imageBlob;
      
      // 更新衣物資料
      await this.promisifyRequest(clothesStore.put(updated));
      
      // 更新圖片（如果有）
      if (newImageBlob) {
        await this.promisifyRequest(imagesStore.put({
          id,
          blob: newImageBlob,
          type: newImageBlob.type,
          size: newImageBlob.size,
          updatedAt: new Date().toISOString()
        }));
      }
      
      console.log(`衣物 ${id} 更新成功`);
      return true;
      
    } catch (error) {
      console.error('更新衣物失敗:', error);
      return false;
    }
  }

  /**
   * 刪除衣物
   * @param {string} id - 衣物 ID
   * @returns {Promise<boolean>}
   */
  async deleteClothing(id) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['clothes', 'images'], 'readwrite');
    const clothesStore = transaction.objectStore('clothes');
    const imagesStore = transaction.objectStore('images');
    
    try {
      await this.promisifyRequest(clothesStore.delete(id));
      await this.promisifyRequest(imagesStore.delete(id));
      
      console.log(`衣物 ${id} 刪除成功`);
      return true;
      
    } catch (error) {
      console.error('刪除衣物失敗:', error);
      return false;
    }
  }

  /**
   * 搜尋衣物
   * @param {string} query - 搜尋關鍵字
   * @returns {Promise<Array>}
   */
  async searchClothes(query) {
    if (!query || query.trim() === '') {
      return this.getAllClothes();
    }
    
    const allClothes = await this.getAllClothes();
    const lowerQuery = query.toLowerCase();
    
    return allClothes.filter(clothing => {
      return (
        (clothing.category && clothing.category.toLowerCase().includes(lowerQuery)) ||
        (clothing.subCategory && clothing.subCategory.toLowerCase().includes(lowerQuery)) ||
        (clothing.style && clothing.style.toLowerCase().includes(lowerQuery)) ||
        (clothing.colors && clothing.colors.some(color => 
          color.toLowerCase().includes(lowerQuery)
        )) ||
        (clothing.tags && clothing.tags.some(tag => 
          tag.toLowerCase().includes(lowerQuery)
        )) ||
        (clothing.notes && clothing.notes.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * 獲取統計資料
   * @returns {Promise<Object>}
   */
  async getStatistics() {
    const allClothes = await this.getAllClothes({ includeImages: false });
    
    const stats = {
      total: allClothes.length,
      categories: {},
      styles: {},
      colors: {},
      favorites: 0,
      recentlyAdded: 0
    };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    allClothes.forEach(clothing => {
      // 統計類別
      if (clothing.category) {
        stats.categories[clothing.category] = (stats.categories[clothing.category] || 0) + 1;
      }
      
      // 統計風格
      if (clothing.style) {
        stats.styles[clothing.style] = (stats.styles[clothing.style] || 0) + 1;
      }
      
      // 統計顏色
      if (clothing.colors) {
        clothing.colors.forEach(color => {
          stats.colors[color] = (stats.colors[color] || 0) + 1;
        });
      }
      
      // 統計最愛
      if (clothing.favorite) {
        stats.favorites++;
      }
      
      // 統計最近新增
      if (clothing.createdAt && new Date(clothing.createdAt) > oneWeekAgo) {
        stats.recentlyAdded++;
      }
    });
    
    return stats;
  }

  /**
   * 清空所有資料
   * @returns {Promise<boolean>}
   */
  async clearAll() {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['clothes', 'images', 'settings'], 'readwrite');
    
    try {
      await Promise.all([
        this.promisifyRequest(transaction.objectStore('clothes').clear()),
        this.promisifyRequest(transaction.objectStore('images').clear()),
        this.promisifyRequest(transaction.objectStore('settings').clear())
      ]);
      
      console.log('所有資料已清空');
      return true;
      
    } catch (error) {
      console.error('清空資料失敗:', error);
      return false;
    }
  }

  /**
   * 釋放圖片 ObjectURL
   * @param {Array|Object} items - 衣物項目或陣列
   */
  revokeImageURLs(items) {
    const itemsArray = Array.isArray(items) ? items : [items];
    
    itemsArray.forEach(item => {
      if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.imageUrl);
        delete item.imageUrl;
      }
    });
  }

  /**
   * 工具方法：將 IDBRequest 轉換為 Promise
   */
  promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 工具方法：生成唯一 ID
   */
  generateId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 設定項目管理
   */
  async getSetting(key) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    try {
      const result = await this.promisifyRequest(store.get(key));
      return result ? result.value : null;
    } catch (error) {
      console.error('獲取設定失敗:', error);
      return null;
    }
  }

  async setSetting(key, value) {
    await this.ensureInitialized();
    
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    try {
      await this.promisifyRequest(store.put({ key, value }));
      return true;
    } catch (error) {
      console.error('保存設定失敗:', error);
      return false;
    }
  }
}

// 單例模式
const localStorageService = new LocalStorageService();
export default localStorageService;
