import axios from 'axios';
import { API_BASE_URL, IS_OFFLINE_MODE } from '../config/api';
import offlineStorage from './offlineStorage';

class ApiService {
  constructor() {
    this.isOffline = IS_OFFLINE_MODE;
    
    if (!this.isOffline && API_BASE_URL) {
      this.api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 請求攔截器
      this.api.interceptors.request.use(
        (config) => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // 響應攔截器 - 網絡錯誤時切換到離線模式
      this.api.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.warn('網絡連接失敗，切換到離線模式');
            this.isOffline = true;
          }
          return Promise.reject(error);
        }
      );
    }
  }

  // 衣物相關 API
  async getClothes() {
    if (this.isOffline) {
      return { data: await offlineStorage.getClothes() };
    }

    try {
      return await this.api.get('/api/clothes');
    } catch (error) {
      console.warn('在線獲取衣物失敗，使用離線數據:', error.message);
      return { data: await offlineStorage.getClothes() };
    }
  }

  async addClothing(clothingData) {
    if (this.isOffline) {
      const result = await offlineStorage.addClothing(clothingData);
      return { data: result };
    }

    try {
      return await this.api.post('/api/clothes', clothingData);
    } catch (error) {
      console.warn('在線添加衣物失敗，保存到離線存儲:', error.message);
      const result = await offlineStorage.addClothing(clothingData);
      return { data: result };
    }
  }

  async updateClothing(id, updates) {
    if (this.isOffline) {
      const result = await offlineStorage.updateClothing(id, updates);
      return { data: result };
    }

    try {
      return await this.api.put(`/api/clothes/${id}`, updates);
    } catch (error) {
      console.warn('在線更新衣物失敗，保存到離線存儲:', error.message);
      const result = await offlineStorage.updateClothing(id, updates);
      return { data: result };
    }
  }

  async deleteClothing(id) {
    if (this.isOffline) {
      await offlineStorage.deleteClothing(id);
      return { data: { success: true } };
    }

    try {
      return await this.api.delete(`/api/clothes/${id}`);
    } catch (error) {
      console.warn('在線刪除衣物失敗，從離線存儲刪除:', error.message);
      await offlineStorage.deleteClothing(id);
      return { data: { success: true } };
    }
  }

  // 穿搭相關 API
  async getOutfits() {
    if (this.isOffline) {
      return { data: await offlineStorage.getOutfits() };
    }

    try {
      return await this.api.get('/api/outfits');
    } catch (error) {
      console.warn('在線獲取穿搭失敗，使用離線數據:', error.message);
      return { data: await offlineStorage.getOutfits() };
    }
  }

  async addOutfit(outfitData) {
    if (this.isOffline) {
      const result = await offlineStorage.addOutfit(outfitData);
      return { data: result };
    }

    try {
      return await this.api.post('/api/outfits', outfitData);
    } catch (error) {
      console.warn('在線添加穿搭失敗，保存到離線存儲:', error.message);
      const result = await offlineStorage.addOutfit(outfitData);
      return { data: result };
    }
  }

  // AI 推薦 (離線模式下提供簡單推薦)
  async getRecommendations() {
    if (this.isOffline) {
      const clothes = await offlineStorage.getClothes();
      // 簡單的離線推薦邏輯
      const recommendations = this.generateOfflineRecommendations(clothes);
      return { data: recommendations };
    }

    try {
      return await this.api.get('/api/recommendations');
    } catch (error) {
      console.warn('在線獲取推薦失敗，生成離線推薦:', error.message);
      const clothes = await offlineStorage.getClothes();
      const recommendations = this.generateOfflineRecommendations(clothes);
      return { data: recommendations };
    }
  }

  generateOfflineRecommendations(clothes) {
    // 簡單的離線推薦邏輯
    const categories = ['上衣', '下裝', '外套', '鞋子'];
    const recommendations = [];

    categories.forEach(category => {
      const categoryItems = clothes.filter(item => 
        item.category === category || item.type === category
      );
      
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
        recommendations.push({
          id: randomItem.id,
          type: 'daily',
          items: [randomItem],
          reason: `推薦您的${category}`,
          confidence: 0.8
        });
      }
    });

    return recommendations;
  }

  // 檢查連接狀態
  async checkConnection() {
    if (this.isOffline) return false;

    try {
      await this.api.get('/health');
      return true;
    } catch (error) {
      this.isOffline = true;
      return false;
    }
  }

  // 獲取連接狀態
  getConnectionStatus() {
    return {
      isOnline: !this.isOffline,
      mode: this.isOffline ? '離線模式' : '在線模式'
    };
  }
}

export default new ApiService();