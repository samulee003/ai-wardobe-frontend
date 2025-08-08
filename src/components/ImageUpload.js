import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import BatchUploadFeedback from './BatchUploadFeedback';
import batchUploadService from '../services/batchUploadService';

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
  
  &.dragover {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const UploadOptions = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const UploadButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// 移除未使用的樣式元件以通過 CI 嚴格模式

// 新增：批量上傳佇列相關組件
const QueueContainer = styled.div`
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const QueueItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid ${props => {
    switch(props.status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'uploading': return '#007bff';
      case 'compressing': return '#ffc107';
      default: return '#e9ecef';
    }
  }};
`;

const QueueItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 12px;
`;

const QueueItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const QueueItemName = styled.div`
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const QueueItemStatus = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const QueueItemProgress = styled.div`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    background: #007bff;
    width: ${props => props.progress}%;
    transition: width 0.3s ease;
  }
`;

const QueueItemActions = styled.div`
  display: flex;
  gap: 8px;
`;

const QueueActionButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.remove {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.retry {
    background: #17a2b8;
    color: white;
    
    &:hover {
      background: #138496;
    }
  }
`;

const BatchActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
`;

const BatchButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
`;

const ResultsSummary = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border-left: 4px solid #28a745;
`;

const SummaryTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #333;
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
`;

const StatItem = styled.div`
  text-align: center;
  
  .number {
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.color || '#007bff'};
  }
  
  .label {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
  }
`;

const ImageUpload = ({ onUploadSuccess, onAnalysisComplete }) => {
  // 新的批量上傳狀態管理
  const [fileQueue, setFileQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 文件狀態：'pending', 'compressing', 'uploading', 'success', 'error'

  // 壓縮圖片
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // 計算新尺寸，保持寬高比
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // 設置高質量繪製
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 繪製並壓縮
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('圖片壓縮失敗'));
            }
          }, 'image/jpeg', quality);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = URL.createObjectURL(file);
    });
  };

  // 驗證文件
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const minSize = 1024; // 1KB
    
    if (!file) {
      toast.error('請選擇一個文件');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('請選擇JPG、PNG、GIF或WebP格式的圖片', {
        autoClose: 4000
      });
      return false;
    }
    
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`圖片文件過大 (${sizeMB}MB)，請選擇小於5MB的圖片`, {
        autoClose: 5000
      });
      return false;
    }
    
    if (file.size < minSize) {
      toast.error('圖片文件過小，請選擇有效的圖片文件');
      return false;
    }
    
    // 檢查文件名
    if (file.name.length > 100) {
      toast.warn('文件名過長，將自動重命名');
    }
    
    return true;
  };

  // 更新佇列中特定文件的狀態
  const updateFileInQueue = (index, updates) => {
    setFileQueue(prevQueue => 
      prevQueue.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    );
  };

  // 處理多文件選擇
  const handleFilesSelect = async (files) => {
    const validFiles = [];
    
    // 驗證所有文件
    for (let file of files) {
      if (validateFile(file)) {
        validFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: file,
          originalName: file.name,
          status: 'pending',
          progress: 0,
          preview: URL.createObjectURL(file),
          compressedFile: null,
          result: null,
          error: null
        });
      }
    }

    if (validFiles.length === 0) {
      toast.error('沒有有效的圖片文件');
      return;
    }

    // 添加到佇列
    setFileQueue(prevQueue => [...prevQueue, ...validFiles]);
    
    toast.success(`已添加 ${validFiles.length} 張圖片到上傳佇列`, {
      autoClose: 2000
    });

    // 開始壓縮圖片
    compressFilesInQueue(validFiles);
  };

  // 批量壓縮圖片
  const compressFilesInQueue = async (files) => {
    // 獲取當前佇列的實際起始索引
    const startIndex = fileQueue.length - files.length;
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      const queueIndex = startIndex + i;

      try {
        updateFileInQueue(queueIndex, { 
          status: 'compressing', 
          progress: 10 
        });

        const compressedFile = await compressImage(fileData.file);
        
        updateFileInQueue(queueIndex, { 
          status: 'pending', 
          progress: 100,
          compressedFile: compressedFile
        });

      } catch (error) {
        console.error(`壓縮 ${fileData.originalName} 失敗:`, error);
        updateFileInQueue(queueIndex, { 
          status: 'error', 
          error: `壓縮失敗: ${error.message}` 
        });
      }
    }
  };

  // 文件輸入變化 (支援多文件)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  };

  // 從佇列中移除文件
  const removeFromQueue = (index) => {
    setFileQueue(prevQueue => prevQueue.filter((_, i) => i !== index));
  };

  // 重試失敗的文件
  const retryFile = async (index) => {
    const fileData = fileQueue[index];
    if (!fileData) return;

    updateFileInQueue(index, { 
      status: 'compressing', 
      progress: 0, 
      error: null 
    });

    try {
      const compressedFile = await compressImage(fileData.file);
      updateFileInQueue(index, { 
        status: 'pending', 
        progress: 100,
        compressedFile: compressedFile
      });
    } catch (error) {
      updateFileInQueue(index, { 
        status: 'error', 
        error: `壓縮失敗: ${error.message}` 
      });
    }
  };

  // 拖拽處理 (支援多文件)
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  };

  // 批量上傳並分析
  const handleBatchUpload = async () => {
    const pendingFiles = fileQueue.filter(item => 
      item.status === 'pending' && item.compressedFile
    );

    if (pendingFiles.length === 0) {
      toast.error('沒有可上傳的文件');
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      const formData = new FormData();
      
      // 標記所有文件為上傳中
      pendingFiles.forEach((_, index) => {
        const fileIndex = fileQueue.findIndex(item => item.id === pendingFiles[index].id);
        updateFileInQueue(fileIndex, { status: 'uploading', progress: 0 });
      });

      // 添加所有文件到FormData
      pendingFiles.forEach((fileData, index) => {
        formData.append('images', fileData.compressedFile, fileData.originalName);
      });

      // 使用統一服務層進行上傳，支援進度回調
      const compressedFiles = pendingFiles.map(fileData => fileData.compressedFile);
      
      const result = await batchUploadService.uploadBatch(compressedFiles, (progress) => {
        // 更新所有上傳中文件的進度
        pendingFiles.forEach((fileData, index) => {
          const fileIndex = fileQueue.findIndex(item => item.id === fileData.id);
          updateFileInQueue(fileIndex, { 
            status: 'uploading', 
            progress: Math.round(progress * 100) 
          });
        });
      });
      
      setUploadResults(result);

      // 更新文件狀態
      pendingFiles.forEach((fileData, index) => {
        const fileIndex = fileQueue.findIndex(item => item.id === fileData.id);
        const uploadResult = result.results?.find(r => r.filename === fileData.originalName);
        const uploadError = result.errors?.find(e => e.filename === fileData.originalName);

        if (uploadResult) {
          updateFileInQueue(fileIndex, { 
            status: 'success', 
            progress: 100,
            result: uploadResult
          });
        } else if (uploadError) {
          updateFileInQueue(fileIndex, { 
            status: 'error', 
            progress: 0,
            error: uploadError.error
          });
        }
      });

      // 顯示結果通知
      if (result.summary.successRate === 100) {
        toast.success(`🎉 批量上傳完成！成功處理 ${result.summary.success} 張圖片`, {
          autoClose: 4000
        });
      } else if (result.summary.success > 0) {
        toast.warn(`⚠️ 部分成功：${result.summary.success}/${result.summary.total} 張圖片上傳成功`, {
          autoClose: 5000
        });
      } else {
        toast.error(`❌ 批量上傳失敗：所有圖片處理失敗`, {
          autoClose: 5000
        });
      }

      // 顯示回饋收集
      setTimeout(() => {
        setShowFeedback(true);
      }, 1000);

      // 回調給父組件
      if (onUploadSuccess && result.results?.length > 0) {
        result.results.forEach(uploadResult => {
          onUploadSuccess(uploadResult.clothing);
        });
      }

      if (onAnalysisComplete && result.results?.length > 0) {
        result.results.forEach(uploadResult => {
          onAnalysisComplete(uploadResult.aiAnalysis);
        });
      }

    } catch (error) {
      console.error('批量上傳錯誤:', error);
      
      // 標記所有上傳中的文件為失敗
      pendingFiles.forEach((fileData) => {
        const fileIndex = fileQueue.findIndex(item => item.id === fileData.id);
        updateFileInQueue(fileIndex, { 
          status: 'error', 
          error: error.message || '網絡錯誤'
        });
      });

      toast.error(`批量上傳失敗: ${error.message}`, {
        autoClose: 5000
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 清空佇列
  const handleClearQueue = () => {
    // 清理內存中的 blob URLs
    fileQueue.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    
    setFileQueue([]);
    setUploadResults(null);
    setShowFeedback(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // 統計資料
  const queueStats = {
    total: fileQueue.length,
    pending: fileQueue.filter(item => item.status === 'pending').length,
    uploading: fileQueue.filter(item => item.status === 'uploading').length,
    success: fileQueue.filter(item => item.status === 'success').length,
    error: fileQueue.filter(item => item.status === 'error').length,
    compressing: fileQueue.filter(item => item.status === 'compressing').length
  };

  return (
    <UploadContainer 
      className={dragOver ? 'dragover' : ''}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadOptions>
        <UploadButton
          className="primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          📁 選擇圖片 {fileQueue.length > 0 && `(${fileQueue.length})`}
        </UploadButton>
        
        <UploadButton
          className="secondary"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isUploading}
        >
          📷 拍照
        </UploadButton>
      </UploadOptions>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <p>或拖拽多張圖片到此處 (最多10張)</p>

      {fileQueue.length > 0 && (
        <QueueContainer>
          <h4>📋 上傳佇列 ({fileQueue.length} 張圖片)</h4>
          
          {fileQueue.map((item, index) => (
            <QueueItem key={item.id} status={item.status}>
              <QueueItemImage src={item.preview} alt={item.originalName} />
              
              <QueueItemInfo>
                <QueueItemName>{item.originalName}</QueueItemName>
                <QueueItemStatus>
                  {item.status === 'pending' && '⏳ 等待上傳'}
                  {item.status === 'compressing' && '🔄 壓縮中...'}
                  {item.status === 'uploading' && '📤 上傳中...'}
                  {item.status === 'success' && '✅ 上傳成功'}
                  {item.status === 'error' && `❌ ${item.error}`}
                </QueueItemStatus>
                
                {(item.status === 'compressing' || item.status === 'uploading') && (
                  <QueueItemProgress progress={item.progress} />
                )}
                
                {item.status === 'success' && item.result && (
                  <div style={{ fontSize: '11px', color: '#28a745', marginTop: '4px' }}>
                    AI識別: {item.result.aiAnalysis?.category} | 
                    信心度: {(item.result.aiAnalysis?.confidence * 100).toFixed(0)}%
                  </div>
                )}
              </QueueItemInfo>
              
              <QueueItemActions>
                {item.status === 'error' && (
                  <QueueActionButton 
                    className="retry" 
                    onClick={() => retryFile(index)}
                  >
                    🔄
                  </QueueActionButton>
                )}
                <QueueActionButton 
                  className="remove" 
                  onClick={() => removeFromQueue(index)}
                  disabled={item.status === 'uploading'}
                >
                  🗑️
                </QueueActionButton>
              </QueueItemActions>
            </QueueItem>
          ))}

          <BatchActions>
            <BatchButton
              className="primary"
              onClick={handleBatchUpload}
              disabled={isUploading || queueStats.pending === 0}
            >
              {isUploading ? '🚀 上傳中...' : `🚀 批量上傳 (${queueStats.pending} 張)`}
            </BatchButton>
            
            <BatchButton
              className="secondary"
              onClick={handleClearQueue}
              disabled={isUploading}
            >
              🗑️ 清空佇列
            </BatchButton>
          </BatchActions>
        </QueueContainer>
      )}

      {uploadResults && (
        <ResultsSummary>
          <SummaryTitle>📊 批量上傳結果</SummaryTitle>
          <SummaryStats>
            <StatItem color="#007bff">
              <div className="number">{uploadResults.summary.total}</div>
              <div className="label">總計</div>
            </StatItem>
            <StatItem color="#28a745">
              <div className="number">{uploadResults.summary.success}</div>
              <div className="label">成功</div>
            </StatItem>
            <StatItem color="#dc3545">
              <div className="number">{uploadResults.summary.failed}</div>
              <div className="label">失敗</div>
            </StatItem>
            <StatItem color="#ffc107">
              <div className="number">{uploadResults.summary.successRate}%</div>
              <div className="label">成功率</div>
            </StatItem>
          </SummaryStats>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {uploadResults.message}
          </div>
        </ResultsSummary>
      )}

      {/* 批量上傳回饋收集 */}
      {showFeedback && (
        <BatchUploadFeedback
          uploadResults={uploadResults}
          onClose={() => setShowFeedback(false)}
          onSubmit={(feedbackData) => {
            console.log('收到用戶回饋:', feedbackData);
            // 這裡可以發送到分析服務
          }}
        />
      )}
    </UploadContainer>
  );
};

export default ImageUpload;