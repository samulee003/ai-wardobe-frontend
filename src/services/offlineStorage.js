// 離線存儲服務
class OfflineStorageService {
  constructor() {
    this.storageKey = 'smartWardrobe';
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        clothes: [],
        outfits: [],
        user: null,
        settings: {
          adhdMode: false,
          theme: 'light'
        }
      };
    } catch (error) {
      console.error('載入離線數據失敗:', error);
      return {
        clothes: [],
        outfits: [],
        user: null,
        settings: {
          adhdMode: false,
          theme: 'light'
        }
      };
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('保存離線數據失敗:', error);
      return false;
    }
  }

  // 衣物管理
  async getClothes() {
    return this.data.clothes || [];
  }

  async addClothing(clothing) {
    const newClothing = {
      ...clothing,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.clothes.push(newClothing);
    this.saveData();
    return newClothing;
  }

  async updateClothing(id, updates) {
    const index = this.data.clothes.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.clothes[index] = {
        ...this.data.clothes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
      return this.data.clothes[index];
    }
    throw new Error('衣物不存在');
  }

  async deleteClothing(id) {
    const index = this.data.clothes.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.clothes.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  // 穿搭管理
  async getOutfits() {
    return this.data.outfits || [];
  }

  async addOutfit(outfit) {
    const newOutfit = {
      ...outfit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.data.outfits.push(newOutfit);
    this.saveData();
    return newOutfit;
  }

  // 設置管理
  async getSettings() {
    return this.data.settings || {};
  }

  async updateSettings(settings) {
    this.data.settings = {
      ...this.data.settings,
      ...settings
    };
    this.saveData();
    return this.data.settings;
  }

  // 數據導出/導入
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      this.data = {
        ...this.data,
        ...imported
      };
      this.saveData();
      return true;
    } catch (error) {
      console.error('導入數據失敗:', error);
      return false;
    }
  }

  // 清除所有數據
  clearAllData() {
    this.data = {
      clothes: [],
      outfits: [],
      user: null,
      settings: {
        adhdMode: false,
        theme: 'light'
      }
    };
    this.saveData();
  }
}

export default new OfflineStorageService();