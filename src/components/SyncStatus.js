import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import dataSyncManager from '../utils/dataSync';

const StatusContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  z-index: 999;
  border-left: 4px solid ${props => {
    if (!props.isOnline) return '#dc3545';
    if (props.queueLength > 0) return '#ffc107';
    return '#28a745';
  }};
  
  @media (max-width: 768px) {
    position: relative;
    top: 0;
    left: 0;
    margin: 10px;
    width: calc(100% - 20px);
  }
`;

const StatusIcon = styled.div`
  font-size: 16px;
`;

const StatusText = styled.div`
  color: #333;
  font-weight: 500;
`;

const SyncButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ExportButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 4px;
  
  &:hover {
    background: #218838;
  }
`;

const SyncStatus = () => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    queueLength: 0,
    syncInProgress: false,
    lastSync: null
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // 定期更新狀態
    const updateStatus = () => {
      setStatus(dataSyncManager.getSyncStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    // 監聽網絡狀態變化
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    try {
      await dataSyncManager.forceSync();
      setStatus(dataSyncManager.getSyncStatus());
    } catch (error) {
      toast.error('同步失敗');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await dataSyncManager.exportData();
    } catch (error) {
      toast.error('導出失敗');
    } finally {
      setExporting(false);
    }
  };

  const getStatusInfo = () => {
    if (!status.isOnline) {
      return {
        icon: '🔴',
        text: '離線模式',
        color: '#dc3545'
      };
    }

    if (status.syncInProgress) {
      return {
        icon: '🔄',
        text: '同步中...',
        color: '#007bff'
      };
    }

    if (status.queueLength > 0) {
      return {
        icon: '⏳',
        text: `${status.queueLength} 項待同步`,
        color: '#ffc107'
      };
    }

    return {
      icon: '✅',
      text: '已同步',
      color: '#28a745'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <StatusContainer 
      isOnline={status.isOnline}
      queueLength={status.queueLength}
    >
      <StatusIcon>{statusInfo.icon}</StatusIcon>
      <StatusText>{statusInfo.text}</StatusText>
      
      {status.isOnline && status.queueLength > 0 && (
        <SyncButton
          onClick={handleForceSync}
          disabled={status.syncInProgress}
        >
          立即同步
        </SyncButton>
      )}
      
      <ExportButton
        onClick={handleExport}
        disabled={exporting}
        title="導出數據"
      >
        {exporting ? '導出中...' : '📥'}
      </ExportButton>
    </StatusContainer>
  );
};

export default SyncStatus;