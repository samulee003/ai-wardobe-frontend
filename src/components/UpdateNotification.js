import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import UpdateChecker from '../services/updateChecker';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Version = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const ReleaseNotes = styled.div`
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 15px;
  max-height: 100px;
  overflow-y: auto;
  white-space: pre-line;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
`;

const DownloadButton = styled(Button)`
  background: #4CAF50;
  color: white;

  &:hover {
    background: #45a049;
  }
`;

const LaterButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const DisableButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [updateChecker] = useState(() => new UpdateChecker());

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const info = await updateChecker.checkForUpdates();
      if (info && info.hasUpdate) {
        setUpdateInfo(info);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('更新檢查失敗:', error);
    }
  };

  const handleDownload = () => {
    if (updateInfo.downloadUrl) {
      updateChecker.openDownloadPage(updateInfo.downloadUrl);
    }
    setIsVisible(false);
  };

  const handleLater = () => {
    setIsVisible(false);
  };

  const handleDisable = () => {
    updateChecker.disableUpdateCheck();
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !updateInfo) {
    return null;
  }

  const formattedNotes = updateChecker.formatReleaseNotes(updateInfo.releaseNotes);
  const fileSize = updateChecker.formatFileSize(updateInfo.apkSize);

  return (
    <NotificationContainer>
      <CloseButton onClick={handleClose}>×</CloseButton>
      
      <Title>
        🚀 發現新版本！
        {updateInfo.isPrerelease && <span style={{fontSize: '12px', opacity: 0.8}}>(Beta)</span>}
      </Title>
      
      <Version>
        {updateInfo.currentVersion} → {updateInfo.latestVersion}
        {fileSize !== '未知' && <span style={{marginLeft: '10px'}}>({fileSize})</span>}
      </Version>
      
      {formattedNotes && (
        <ReleaseNotes>{formattedNotes}</ReleaseNotes>
      )}
      
      <ButtonGroup>
        <DownloadButton onClick={handleDownload}>
          📱 下載更新
        </DownloadButton>
        <LaterButton onClick={handleLater}>
          稍後提醒
        </LaterButton>
        <DisableButton onClick={handleDisable}>
          不再提醒
        </DisableButton>
      </ButtonGroup>
    </NotificationContainer>
  );
};

export default UpdateNotification;