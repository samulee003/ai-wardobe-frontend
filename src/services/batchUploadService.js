/**
 * 統一的批量上傳API服務層
 * 消除桌面版和移動版之間的重複代碼
 */

class BatchUploadService {
  constructor() {
    this.baseURL = '/api/clothes';
  }

  /**
   * 執行批量上傳
   * @param {Array} files - 文件數組
   * @param {Function} onProgress - 進度回調函數
   * @returns {Promise<Object>} 上傳結果
   */
  async uploadBatch(files, onProgress = null) {
    if (!files || files.length === 0) {
      throw new Error('沒有可上傳的文件');
    }

    // 驗證文件數量
    if (files.length > 10) {
      throw new Error('一次最多只能上傳10張圖片');
    }

    try {
      const formData = new FormData();
      
      // 添加文件到FormData
      files.forEach((file, index) => {
        const fileName = file.name || `image_${index}.jpg`;
        formData.append('images', file, fileName);
      });

      // 獲取認證token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用戶未登錄，請先登錄');
      }

      // 發送請求 (使用XMLHttpRequest支援進度監聽)
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // 監聽上傳進度
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = event.loaded / event.total;
              onProgress(progress);
            }
          });
        }
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (parseError) {
              reject(new Error('服務器響應格式錯誤'));
            }
          } else {
            // 處理HTTP錯誤狀態
            switch (xhr.status) {
              case 400:
                reject(new Error('請求格式錯誤'));
                break;
              case 401:
                reject(new Error('登錄已過期，請重新登錄'));
                break;
              case 413:
                reject(new Error('文件過大，請選擇較小的圖片'));
                break;
              case 429:
                reject(new Error('請求過於頻繁，請稍後重試'));
                break;
              case 500:
                reject(new Error('服務器內部錯誤，請稍後重試'));
                break;
              default:
                reject(new Error(`上傳失敗: HTTP ${xhr.status}`));
            }
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('網絡連接失敗，請檢查網絡後重試'));
        });
        
        xhr.addEventListener('timeout', () => {
          reject(new Error('請求超時，請重試'));
        });
        
        xhr.open('POST', `${this.baseURL}/batch-upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 300000; // 5分鐘超時
        xhr.send(formData);
      });

      // 驗證響應數據結構
      if (!response.summary) {
        throw new Error('服務器響應格式錯誤');
      }

      return response;

    } catch (error) {
      // 統一錯誤處理
      console.error('批量上傳錯誤:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('網絡連接失敗，請檢查網絡後重試');
      }
      
      throw error;
    }
  }

  /**
   * 單文件上傳 (保持向後兼容)
   * @param {File} file - 單個文件
   * @returns {Promise<Object>} 上傳結果
   */
  async uploadSingle(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用戶未登錄，請先登錄');
      }

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`單文件上傳失敗: HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('單文件上傳錯誤:', error);
      throw error;
    }
  }

  /**
   * 獲取上傳限制配置
   * @returns {Object} 限制配置
   */
  getUploadLimits() {
    return {
      maxFiles: 10,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      minFileSize: 1024 // 1KB
    };
  }

  /**
   * 驗證文件
   * @param {File} file - 要驗證的文件
   * @returns {Object} 驗證結果 {valid: boolean, error?: string}
   */
  validateFile(file) {
    const limits = this.getUploadLimits();

    if (!file) {
      return { valid: false, error: '文件不存在' };
    }

    if (!limits.allowedTypes.includes(file.type)) {
      return { valid: false, error: '文件格式不支持，請選擇JPG、PNG、GIF或WebP格式' };
    }

    if (file.size > limits.maxFileSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `文件過大 (${sizeMB}MB)，請選擇小於5MB的圖片` };
    }

    if (file.size < limits.minFileSize) {
      return { valid: false, error: '文件過小，請選擇有效的圖片文件' };
    }

    return { valid: true };
  }

  /**
   * 批量驗證文件
   * @param {Array<File>} files - 文件數組
   * @returns {Object} 驗證結果 {validFiles: Array, invalidFiles: Array}
   */
  validateFiles(files) {
    const validFiles = [];
    const invalidFiles = [];

    if (files.length > this.getUploadLimits().maxFiles) {
      return {
        validFiles: [],
        invalidFiles: files.map(file => ({
          file,
          error: `一次最多只能選擇${this.getUploadLimits().maxFiles}張圖片`
        }))
      };
    }

    files.forEach(file => {
      const validation = this.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, error: validation.error });
      }
    });

    return { validFiles, invalidFiles };
  }
}

// 導出具名類別與單例，避免匿名 default export 規則報錯
const batchUploadServiceInstance = new BatchUploadService();
export default batchUploadServiceInstance;
export { BatchUploadService };
