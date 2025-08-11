import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import MobileShell from '../components/MobileShell';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import exportImportService from '../services/exportImportService';
import localStorageService from '../services/localStorageService';
import AIProviderSettings from '../components/AIProviderSettings';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const Section = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin: 0 0 15px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const FileInput = styled.input`
  display: none;
`;

const StatusInfo = styled.div`
  margin-top: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.warning {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
`;

const ConflictDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
`;

const DialogTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
`;

const DialogText = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const RadioGroup = styled.div`
  margin-bottom: 20px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  
  input[type="radio"] {
    margin: 0;
  }
`;

const Settings = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [importData, setImportData] = useState(null);
  const [conflictStrategy, setConflictStrategy] = useState('duplicate');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  
  const fileInputRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // 獲取所有衣物資料（優先本地，備用雲端）
  const fetchAllClothes = async () => {
    try {
      // 優先使用本地資料
      const localClothes = await localStorageService.getAllClothes();
      if (localClothes.length > 0) {
        return localClothes;
      }
      
      // 本地無資料時嘗試雲端
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/clothes?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('獲取衣物資料失敗');
        }
        
        const data = await response.json();
        return data.clothes || [];
      }
      
      return [];
    } catch (error) {
      console.error('獲取衣物資料錯誤:', error);
      throw error;
    }
  };

  // 匯出衣櫃
  const handleExport = async () => {
    
    try {
      setIsExporting(true);
      setExportStatus(null);
      
      const clothes = await fetchAllClothes();
      
      if (clothes.length === 0) {
        toast.warning('衣櫃是空的，沒有資料可匯出');
        return;
      }
      
      const result = await exportImportService.exportWardrobe(clothes);
      
      setExportStatus({
        type: 'success',
        message: `✅ 匯出成功！檔案：${result.filename}，共 ${result.itemCount} 件衣物`
      });
      
      toast.success(`🎉 成功匯出 ${result.itemCount} 件衣物！`);
      
    } catch (error) {
      console.error('匯出錯誤:', error);
      setExportStatus({
        type: 'error',
        message: `❌ 匯出失敗：${error.message}`
      });
      toast.error(`匯出失敗：${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 選擇匯入檔案
  const handleImportFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 處理檔案選擇
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      // 驗證檔案格式
      const isValid = await exportImportService.validateBackupFile(file);
      if (!isValid) {
        toast.error('無效的備份檔案格式');
        return;
      }
      
      // 解析匯入資料
      const result = await exportImportService.importWardrobe(file);
      
      if (result.items.length === 0) {
        toast.warning('備份檔案中沒有衣物資料');
        return;
      }
      
      // 檢查是否有現有資料需要處理衝突
      const existingClothes = await fetchAllClothes();
      
      if (existingClothes.length > 0) {
        // 有現有資料，顯示衝突處理對話框
        setImportData({
          existing: existingClothes,
          importing: result.items,
          metadata: result.metadata
        });
        setShowConflictDialog(true);
      } else {
        // 沒有現有資料，直接匯入
        await executeImport([], result.items);
      }
      
    } catch (error) {
      console.error('檔案處理錯誤:', error);
      toast.error(`檔案處理失敗：${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // 執行匯入
  const executeImport = async (existingItems, importItems) => {
    try {
      const conflictResult = exportImportService.resolveConflicts(
        existingItems, 
        importItems, 
        conflictStrategy
      );
      
      // 這裡應該將資料保存到 IndexedDB 或發送到後端
      // 暫時用 localStorage 模擬
      const mergedClothes = conflictResult.items;
      
      // 保存到 IndexedDB
      for (const clothing of mergedClothes) {
        await localStorageService.addClothing(clothing, clothing.imageBlob);
      }
      
      toast.success(
        `🎉 匯入完成！新增 ${conflictResult.summary.added} 件，` +
        `跳過 ${conflictResult.summary.skipped} 件，` +
        `替換 ${conflictResult.summary.replaced} 件`
      );
      
      setShowConflictDialog(false);
      setImportData(null);
      
    } catch (error) {
      console.error('匯入執行錯誤:', error);
      toast.error(`匯入失敗：${error.message}`);
    }
  };

  // 確認匯入
  const handleConfirmImport = () => {
    if (importData) {
      executeImport(importData.existing, importData.importing);
    }
  };

  // 取消匯入
  const handleCancelImport = () => {
    setShowConflictDialog(false);
    setImportData(null);
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const content = (
    <>
      <Header style={{ textAlign: isMobile ? 'left' : 'center' }}>
        <Title>⚙️ 設定</Title>
        <Subtitle>備份與還原你的衣櫃資料</Subtitle>
      </Header>

      {/* 資料備份 */}
      <Section>
        <SectionTitle>
          💾 資料備份
        </SectionTitle>
        <SectionDescription>
          將你的衣櫃資料（包含圖片）打包成 ZIP 檔案，方便備份或轉移到其他裝置。
        </SectionDescription>
        
        <ButtonGroup>
          <Button
            className="primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '🔄 匯出中...' : '📤 匯出衣櫃'}
          </Button>
        </ButtonGroup>
        
        {exportStatus && (
          <StatusInfo className={exportStatus.type}>
            {exportStatus.message}
          </StatusInfo>
        )}
      </Section>

      {/* 資料還原 */}
      <Section>
        <SectionTitle>
          📥 資料還原
        </SectionTitle>
        <SectionDescription>
          從備份檔案還原衣櫃資料。支援衝突處理：替換現有、跳過重複或建立副本。
        </SectionDescription>
        
        <ButtonGroup>
          <Button
            className="secondary"
            onClick={handleImportFileSelect}
            disabled={isImporting}
          >
            {isImporting ? '🔄 處理中...' : '📁 選擇備份檔案'}
          </Button>
        </ButtonGroup>
        
        <FileInput
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileChange}
        />
      </Section>

      {/* AI 供應商設定 */}
      <Section>
        <SectionTitle>
          🤖 AI 供應商設定
        </SectionTitle>
        <SectionDescription>
          選擇 AI 分析服務供應商，並測試連線狀態與回應時間。
        </SectionDescription>
        
        <AIProviderSettings />
      </Section>

      {/* 衝突處理對話框 */}
      {showConflictDialog && importData && (
        <ConflictDialog>
          <DialogContent>
            <DialogTitle>⚠️ 發現資料衝突</DialogTitle>
            <DialogText>
              你的衣櫃已有 {importData.existing.length} 件衣物，
              備份檔案包含 {importData.importing.length} 件衣物。
              <br />
              請選擇衝突處理策略：
            </DialogText>
            
            <RadioGroup>
              <RadioOption>
                <input
                  type="radio"
                  name="strategy"
                  value="duplicate"
                  checked={conflictStrategy === 'duplicate'}
                  onChange={(e) => setConflictStrategy(e.target.value)}
                />
                <span>建立副本（推薦）- 保留現有資料，重複項目建立副本</span>
              </RadioOption>
              
              <RadioOption>
                <input
                  type="radio"
                  name="strategy"
                  value="replace"
                  checked={conflictStrategy === 'replace'}
                  onChange={(e) => setConflictStrategy(e.target.value)}
                />
                <span>替換現有 - 用備份資料覆蓋現有相同項目</span>
              </RadioOption>
              
              <RadioOption>
                <input
                  type="radio"
                  name="strategy"
                  value="skip"
                  checked={conflictStrategy === 'skip'}
                  onChange={(e) => setConflictStrategy(e.target.value)}
                />
                <span>跳過重複 - 只匯入不衝突的新項目</span>
              </RadioOption>
            </RadioGroup>
            
            <ButtonGroup>
              <Button className="primary" onClick={handleConfirmImport}>
                ✅ 確認匯入
              </Button>
              <Button className="secondary" onClick={handleCancelImport}>
                ❌ 取消
              </Button>
            </ButtonGroup>
          </DialogContent>
        </ConflictDialog>
      )}
    </>
  );

  if (isMobile) {
    return <MobileShell title="我的">{content}</MobileShell>;
  }
  return <Container>{content}</Container>;
};

export default Settings;
