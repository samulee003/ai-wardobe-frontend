import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

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

const PreviewContainer = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const PreviewImage = styled.img`
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  margin: 15px 0;
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

const AnalysisResult = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: left;
`;

const ResultItem = styled.div`
  margin-bottom: 10px;
  
  strong {
    color: #333;
  }
  
  span {
    color: #666;
    margin-left: 8px;
  }
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin: 5px 0;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    background: ${props => props.confidence > 0.8 ? '#28a745' : props.confidence > 0.6 ? '#ffc107' : '#dc3545'};
    width: ${props => props.confidence * 100}%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const ImageUpload = ({ onUploadSuccess, onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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

  // 處理文件選擇
  const handleFileSelect = async (file) => {
    if (!validateFile(file)) return;
    
    try {
      setProgress(10);
      toast.info('正在處理圖片...', { autoClose: 2000 });
      
      // 壓縮圖片
      const compressedFile = await compressImage(file);
      
      setProgress(30);
      
      // 檢查壓縮後的文件大小
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(1);
      
      setSelectedFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      setAnalysisResult(null);
      setProgress(0);
      
      if (originalSizeMB !== compressedSizeMB) {
        toast.success(`圖片處理完成！已從 ${originalSizeMB}MB 壓縮至 ${compressedSizeMB}MB`, {
          autoClose: 3000
        });
      } else {
        toast.success('圖片選擇成功，點擊上傳開始分析');
      }
    } catch (error) {
      console.error('圖片處理錯誤:', error);
      setProgress(0);
      toast.error(`圖片處理失敗: ${error.message}，請重新選擇`, {
        autoClose: 4000
      });
    }
  };

  // 文件輸入變化
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 拖拽處理
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
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // 上傳並分析
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('請先選擇圖片');
      return;
    }

    setUploading(true);
    setAnalyzing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      // 模擬進度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/clothes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const result = await response.json();
      
      setAnalysisResult(result.aiAnalysis);
      
      if (result.aiAnalysis.confidence < 0.6) {
        toast.warn('AI識別信心度較低，請仔細確認分析結果', {
          autoClose: 5000
        });
      } else if (result.aiAnalysis.confidence < 0.8) {
        toast.info('AI識別完成，建議檢查分析結果', {
          autoClose: 4000
        });
      } else {
        toast.success('衣物分析完成！信心度很高');
      }

      if (onUploadSuccess) {
        onUploadSuccess(result.clothing);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result.aiAnalysis);
      }

    } catch (error) {
      console.error('上傳錯誤:', error);
      
      // 根據錯誤類型提供不同的提示
      if (error.message.includes('Network')) {
        toast.error('網絡連接失敗，請檢查網絡後重試', {
          autoClose: 5000
        });
      } else if (error.message.includes('413')) {
        toast.error('文件過大，請選擇較小的圖片', {
          autoClose: 4000
        });
      } else if (error.message.includes('401')) {
        toast.error('登錄已過期，請重新登錄', {
          autoClose: 4000
        });
      } else if (error.message.includes('500')) {
        toast.error('服務器錯誤，請稍後重試', {
          autoClose: 4000
        });
      } else {
        toast.error(`上傳失敗: ${error.message || '未知錯誤'}，請重試`, {
          autoClose: 4000
        });
      }
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // 重新選擇
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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
          disabled={uploading}
        >
          📁 選擇圖片
        </UploadButton>
        
        <UploadButton
          className="secondary"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
        >
          📷 拍照
        </UploadButton>
      </UploadOptions>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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

      <p>或拖拽圖片到此處</p>

      {preview && (
        <PreviewContainer>
          <PreviewImage src={preview} alt="預覽" />
          
          {progress > 0 && (
            <ProgressBar progress={progress} />
          )}
          
          <div style={{ marginTop: '15px' }}>
            {!uploading ? (
              <>
                <UploadButton
                  className="primary"
                  onClick={handleUpload}
                  style={{ marginRight: '10px' }}
                >
                  🚀 上傳分析
                </UploadButton>
                <UploadButton
                  className="secondary"
                  onClick={handleReset}
                >
                  🔄 重新選擇
                </UploadButton>
              </>
            ) : (
              <UploadButton disabled>
                {analyzing ? '🤖 AI分析中...' : '📤 上傳中...'}
              </UploadButton>
            )}
          </div>
        </PreviewContainer>
      )}

      {analysisResult && (
        <AnalysisResult>
          <h4>🎯 AI分析結果</h4>
          
          <ResultItem>
            <strong>類別:</strong>
            <span>{analysisResult.category} - {analysisResult.subCategory}</span>
          </ResultItem>
          
          <ResultItem>
            <strong>顏色:</strong>
            <span>{analysisResult.colors.join(', ')}</span>
          </ResultItem>
          
          <ResultItem>
            <strong>風格:</strong>
            <span>{analysisResult.style}</span>
          </ResultItem>
          
          <ResultItem>
            <strong>季節:</strong>
            <span>{analysisResult.season.join(', ')}</span>
          </ResultItem>
          
          <ResultItem>
            <strong>信心度:</strong>
            <span>{(analysisResult.confidence * 100).toFixed(1)}%</span>
            <ConfidenceBar confidence={analysisResult.confidence} />
          </ResultItem>
          
          {analysisResult.detectedFeatures && (
            <ResultItem>
              <strong>特徵:</strong>
              <span>{analysisResult.detectedFeatures.join(', ')}</span>
            </ResultItem>
          )}
        </AnalysisResult>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;