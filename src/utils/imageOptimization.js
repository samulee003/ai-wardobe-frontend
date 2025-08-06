// 圖片優化工具類
class ImageOptimizer {
  constructor() {
    this.defaultOptions = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: 'jpeg'
    };
  }

  // 壓縮圖片
  async compressImage(file, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 計算新尺寸
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            config.maxWidth, 
            config.maxHeight
          );
          
          canvas.width = width;
          canvas.height = height;
          
          // 繪製圖片
          ctx.drawImage(img, 0, 0, width, height);
          
          // 轉換為 Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('圖片壓縮失敗'));
              }
            },
            `image/${config.format}`,
            config.quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('圖片載入失敗'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 計算新尺寸
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // 如果圖片尺寸小於最大尺寸，不需要縮放
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }
    
    // 計算縮放比例
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  // 生成縮略圖
  async generateThumbnail(file, size = 150) {
    return this.compressImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7
    });
  }

  // 生成多種尺寸
  async generateMultipleSizes(file) {
    const sizes = {
      thumbnail: { maxWidth: 150, maxHeight: 150, quality: 0.7 },
      medium: { maxWidth: 400, maxHeight: 400, quality: 0.8 },
      large: { maxWidth: 800, maxHeight: 800, quality: 0.8 }
    };

    const results = {};
    
    for (const [sizeName, options] of Object.entries(sizes)) {
      try {
        results[sizeName] = await this.compressImage(file, options);
      } catch (error) {
        console.error(`生成 ${sizeName} 尺寸失敗:`, error);
        results[sizeName] = null;
      }
    }
    
    return results;
  }

  // 檢查圖片格式
  isValidImageFormat(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  // 檢查文件大小
  isValidFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // 獲取圖片信息
  async getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name
        });
      };
      
      img.onerror = () => {
        reject(new Error('無法讀取圖片信息'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 轉換為 WebP 格式（如果支持）
  async convertToWebP(file, quality = 0.8) {
    // 檢查瀏覽器是否支持 WebP
    if (!this.supportsWebP()) {
      return this.compressImage(file, { quality });
    }

    return this.compressImage(file, {
      format: 'webp',
      quality
    });
  }

  // 檢查 WebP 支持
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // 批量處理圖片
  async batchProcess(files, options = {}) {
    const results = [];
    
    for (const file of files) {
      try {
        if (!this.isValidImageFormat(file)) {
          results.push({
            original: file,
            error: '不支持的圖片格式'
          });
          continue;
        }

        if (!this.isValidFileSize(file)) {
          results.push({
            original: file,
            error: '文件過大'
          });
          continue;
        }

        const compressed = await this.compressImage(file, options);
        const info = await this.getImageInfo(file);
        
        results.push({
          original: file,
          compressed,
          info,
          compressionRatio: compressed.size / file.size
        });
        
      } catch (error) {
        results.push({
          original: file,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // 創建圖片預覽 URL
  createPreviewURL(file) {
    return URL.createObjectURL(file);
  }

  // 清理預覽 URL
  revokePreviewURL(url) {
    URL.revokeObjectURL(url);
  }

  // 估算壓縮後大小
  estimateCompressedSize(originalSize, quality = 0.8) {
    // 這是一個粗略的估算
    return Math.round(originalSize * quality * 0.7);
  }
}

// 創建全局實例
const imageOptimizer = new ImageOptimizer();

export default imageOptimizer;