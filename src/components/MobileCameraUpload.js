import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const MobileContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  padding: 10px;
  
  @media (max-width: 768px) {
    padding: 5px;
  }
`;

const CameraButton = styled.button`
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 16px rgba(0,123,255,0.3);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,123,255,0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .icon {
    font-size: 32px;
  }
  
  .text {
    font-size: 16px;
  }
  
  .hint {
    font-size: 12px;
    opacity: 0.9;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

const QuickButton = styled.button`
  padding: 15px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
  }
  
  .icon {
    font-size: 24px;
  }
`;

const PreviewSection = styled.div`
  margin-top: 20px;
  
  ${props => props.show ? 'display: block;' : 'display: none;'}
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 15px;
`;

const AnalysisCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 15px;
`;

const AnalysisTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AnalysisItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const AnalysisLabel = styled.span`
  font-weight: 600;
  color: #333;
`;

const AnalysisValue = styled.span`
  color: #666;
  text-align: right;
  flex: 1;
  margin-left: 10px;
`;

const ConfidenceIndicator = styled.div`
  width: 60px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-left: 10px;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.confidence * 100}%;
    background: ${props => 
      props.confidence > 0.8 ? '#28a745' : 
      props.confidence > 0.6 ? '#ffc107' : '#dc3545'
    };
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
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
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
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

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255,255,255,0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const MobileCameraUpload = ({ onUploadSuccess, onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // 檢測是否為移動設備
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 壓縮圖片（移動端優化）
  const compressImageForMobile = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 移動端使用更小的尺寸以節省流量
        const maxWidth = 600;
        const maxHeight = 600;
        const quality = 0.7;
        
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
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 處理拍照
  const handleCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // 處理相冊選擇
  const handleGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // 處理文件選擇
  const handleFileSelect = async (file) => {
    if (!file) return;
    
    try {
      setAnalyzing(true);
      
      // 壓縮圖片
      const compressedFile = await compressImageForMobile(file);
      
      setSelectedFile(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
      
      // 自動開始AI分析
      await analyzeImage(compressedFile);
      
    } catch (error) {
      console.error('處理圖片錯誤:', error);
      toast.error('圖片處理失敗，請重試');
    } finally {
      setAnalyzing(false);
    }
  };

  // AI分析圖片
  const analyzeImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/clothes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('AI分析失敗');
      }

      const result = await response.json();
      setAnalysisResult(result.aiAnalysis);
      
      if (result.aiAnalysis.confidence < 0.6) {
        toast.warn('AI識別信心度較低，請確認結果', { autoClose: 4000 });
      } else {
        toast.success('AI分析完成！');
      }

      if (onUploadSuccess) {
        onUploadSuccess(result.clothing);
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result.aiAnalysis);
      }

    } catch (error) {
      console.error('AI分析錯誤:', error);
      toast.error('AI分析失敗，請重試');
    }
  };

  // 確認保存
  const handleConfirm = () => {
    toast.success('衣物已保存到衣櫃！');
    handleReset();
  };

  // 重新拍照
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // 重新分析
  const handleReanalyze = async () => {
    if (selectedFile) {
      setAnalyzing(true);
      await analyzeImage(selectedFile);
      setAnalyzing(false);
    }
  };

  return (
    <MobileContainer>
      {!preview ? (
        <>
          <CameraButton onClick={handleCamera}>
            <div className="icon">📷</div>
            <div className="text">拍照識別衣物</div>
            <div className="hint">AI會自動分析衣物屬性</div>
          </CameraButton>

          <QuickActions>
            <QuickButton onClick={handleGallery}>
              <div className="icon">🖼️</div>
              <div>從相冊選擇</div>
            </QuickButton>
            
            <QuickButton onClick={() => toast.info('功能開發中')}>
              <div className="icon">📊</div>
              <div>批量上傳</div>
            </QuickButton>
          </QuickActions>
        </>
      ) : (
        <PreviewSection show={true}>
          <PreviewImage src={preview} alt="預覽" />
          
          {analysisResult && (
            <AnalysisCard>
              <AnalysisTitle>
                🤖 AI分析結果
                <ConfidenceIndicator confidence={analysisResult.confidence} />
              </AnalysisTitle>
              
              <AnalysisItem>
                <AnalysisLabel>類別</AnalysisLabel>
                <AnalysisValue>{analysisResult.category}</AnalysisValue>
              </AnalysisItem>
              
              <AnalysisItem>
                <AnalysisLabel>類型</AnalysisLabel>
                <AnalysisValue>{analysisResult.subCategory}</AnalysisValue>
              </AnalysisItem>
              
              <AnalysisItem>
                <AnalysisLabel>顏色</AnalysisLabel>
                <AnalysisValue>{analysisResult.colors?.join(', ')}</AnalysisValue>
              </AnalysisItem>
              
              <AnalysisItem>
                <AnalysisLabel>風格</AnalysisLabel>
                <AnalysisValue>{analysisResult.style}</AnalysisValue>
              </AnalysisItem>
              
              <AnalysisItem>
                <AnalysisLabel>信心度</AnalysisLabel>
                <AnalysisValue>{(analysisResult.confidence * 100).toFixed(1)}%</AnalysisValue>
              </AnalysisItem>
            </AnalysisCard>
          )}

          <ActionButtons>
            <ActionButton className="primary" onClick={handleConfirm}>
              ✅ 保存到衣櫃
            </ActionButton>
            {analysisResult?.confidence < 0.7 && (
              <ActionButton className="retry" onClick={handleReanalyze}>
                🔄 重新分析
              </ActionButton>
            )}
            <ActionButton className="secondary" onClick={handleReset}>
              📷 重新拍照
            </ActionButton>
          </ActionButtons>
        </PreviewSection>
      )}

      {/* 隱藏的文件輸入 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />
      
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {/* 加載覆蓋層 */}
      {analyzing && (
        <LoadingOverlay>
          <div className="spinner"></div>
          <div>🤖 AI正在分析衣物...</div>
          <div style={{fontSize: '14px', opacity: 0.8, marginTop: '10px'}}>
            請稍候，這可能需要幾秒鐘
          </div>
        </LoadingOverlay>
      )}
    </MobileContainer>
  );
};

export default MobileCameraUpload;