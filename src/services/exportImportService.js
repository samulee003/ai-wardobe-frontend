/**
 * 匯出/匯入服務 - 處理衣櫃資料的備份與還原
 * 支援 zip 格式：meta.json + images/ 目錄
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class ExportImportService {
  /**
   * 匯出所有衣物資料到 zip 檔案
   * @param {Array} clothes - 衣物陣列
   * @returns {Promise<void>}
   */
  async exportWardrobe(clothes) {
    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder('images');
      
      // 準備 metadata
      const metadata = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalItems: clothes.length,
        items: []
      };

      // 處理每件衣物
      for (let i = 0; i < clothes.length; i++) {
        const clothing = clothes[i];
        
        // 下載圖片並加入 zip
        let imageFilename = null;
        if (clothing.imageUrl) {
          try {
            const response = await fetch(clothing.imageUrl);
            if (response.ok) {
              const blob = await response.blob();
              imageFilename = `${clothing._id || i}.jpg`;
              imagesFolder.file(imageFilename, blob);
            }
          } catch (error) {
            console.warn(`無法下載圖片 ${clothing.imageUrl}:`, error);
          }
        }

        // 準備衣物 metadata（移除 imageUrl，改用本地檔名）
        const itemMeta = {
          ...clothing,
          imageFilename,
          originalImageUrl: clothing.imageUrl // 保留原始 URL 供參考
        };
        delete itemMeta.imageUrl;
        
        metadata.items.push(itemMeta);
      }

      // 加入 metadata.json
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      
      // 生成 zip 檔案
      const content = await zip.generateAsync({ type: 'blob' });
      
      // 下載檔案
      const filename = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.zip`;
      saveAs(content, filename);
      
      return {
        success: true,
        filename,
        itemCount: clothes.length
      };
      
    } catch (error) {
      console.error('匯出失敗:', error);
      throw new Error(`匯出失敗: ${error.message}`);
    }
  }

  /**
   * 匯入 zip 檔案並解析衣物資料
   * @param {File} file - zip 檔案
   * @returns {Promise<Object>} 解析結果
   */
  async importWardrobe(file) {
    try {
      const zip = await JSZip.loadAsync(file);
      
      // 讀取 metadata.json
      const metadataFile = zip.file('metadata.json');
      if (!metadataFile) {
        throw new Error('無效的備份檔案：缺少 metadata.json');
      }
      
      const metadataContent = await metadataFile.async('string');
      const metadata = JSON.parse(metadataContent);
      
      if (!metadata.items || !Array.isArray(metadata.items)) {
        throw new Error('無效的備份檔案：metadata 格式錯誤');
      }

      // 處理衣物資料和圖片
      const importedItems = [];
      const imagesFolder = zip.folder('images');
      
      for (const item of metadata.items) {
        const processedItem = { ...item };
        
        // 處理圖片
        if (item.imageFilename && imagesFolder) {
          const imageFile = imagesFolder.file(item.imageFilename);
          if (imageFile) {
            try {
              const imageBlob = await imageFile.async('blob');
              // 創建 ObjectURL 供前端使用
              processedItem.imageBlob = imageBlob;
              processedItem.imageUrl = URL.createObjectURL(imageBlob);
            } catch (error) {
              console.warn(`無法讀取圖片 ${item.imageFilename}:`, error);
              processedItem.imageUrl = item.originalImageUrl; // 回退到原始 URL
            }
          }
        }
        
        // 移除僅用於備份的欄位
        delete processedItem.imageFilename;
        delete processedItem.originalImageUrl;
        
        importedItems.push(processedItem);
      }
      
      return {
        success: true,
        metadata: {
          version: metadata.version,
          exportDate: metadata.exportDate,
          totalItems: metadata.totalItems
        },
        items: importedItems
      };
      
    } catch (error) {
      console.error('匯入失敗:', error);
      throw new Error(`匯入失敗: ${error.message}`);
    }
  }

  /**
   * 處理匯入衝突的策略
   * @param {Array} existingItems - 現有衣物
   * @param {Array} importItems - 匯入衣物
   * @param {string} strategy - 衝突處理策略：'replace', 'skip', 'duplicate'
   * @returns {Array} 處理後的衣物陣列
   */
  resolveConflicts(existingItems, importItems, strategy = 'duplicate') {
    const existingIds = new Set(existingItems.map(item => item._id).filter(Boolean));
    const result = [...existingItems];
    let addedCount = 0;
    let skippedCount = 0;
    let replacedCount = 0;

    for (const importItem of importItems) {
      const hasConflict = importItem._id && existingIds.has(importItem._id);
      
      if (!hasConflict) {
        // 無衝突，直接加入
        result.push(importItem);
        addedCount++;
      } else {
        // 有衝突，根據策略處理
        switch (strategy) {
          case 'replace':
            // 替換現有項目
            const index = result.findIndex(item => item._id === importItem._id);
            if (index !== -1) {
              result[index] = importItem;
              replacedCount++;
            }
            break;
            
          case 'skip':
            // 跳過衝突項目
            skippedCount++;
            break;
            
          case 'duplicate':
          default:
            // 建立副本（移除 _id 讓系統重新生成）
            const duplicateItem = { ...importItem };
            delete duplicateItem._id;
            duplicateItem.notes = `${duplicateItem.notes || ''} [匯入副本]`.trim();
            result.push(duplicateItem);
            addedCount++;
            break;
        }
      }
    }

    return {
      items: result,
      summary: {
        total: importItems.length,
        added: addedCount,
        skipped: skippedCount,
        replaced: replacedCount
      }
    };
  }

  /**
   * 驗證備份檔案格式
   * @param {File} file - 要驗證的檔案
   * @returns {Promise<boolean>}
   */
  async validateBackupFile(file) {
    try {
      if (!file.name.endsWith('.zip')) {
        return false;
      }
      
      const zip = await JSZip.loadAsync(file);
      const metadataFile = zip.file('metadata.json');
      
      if (!metadataFile) {
        return false;
      }
      
      const metadataContent = await metadataFile.async('string');
      const metadata = JSON.parse(metadataContent);
      
      return metadata.items && Array.isArray(metadata.items);
      
    } catch (error) {
      return false;
    }
  }
}

// 單例模式
const exportImportService = new ExportImportService();
export default exportImportService;
