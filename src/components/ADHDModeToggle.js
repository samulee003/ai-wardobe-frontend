import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const ToggleContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ToggleButton = styled.button`
  background: ${props => props.simplified ? '#28a745' : '#007bff'};
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }
  
  &:focus {
    outline: 3px solid rgba(255,255,255,0.5);
  }
`;

const ModeIndicator = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: ${props => props.simplified ? '#28a745' : 'transparent'};
  color: white;
  padding: ${props => props.simplified ? '8px 16px' : '0'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 999;
  opacity: ${props => props.simplified ? 1 : 0};
  transition: all 0.3s ease;
`;

const ADHDModeToggle = () => {
  const [simplifiedMode, setSimplifiedMode] = useState(false);
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    // 從用戶偏好中讀取簡化模式設置
    if (user?.preferences?.simplifiedInterface) {
      setSimplifiedMode(true);
      document.body.classList.add('simplified-mode');
    }
  }, [user]);

  const toggleMode = async () => {
    const newMode = !simplifiedMode;
    setSimplifiedMode(newMode);
    
    // 更新DOM類
    if (newMode) {
      document.body.classList.add('simplified-mode');
    } else {
      document.body.classList.remove('simplified-mode');
    }
    
    // 更新用戶偏好
    if (user) {
      await updateProfile({
        preferences: {
          ...user.preferences,
          simplifiedInterface: newMode
        }
      });
    }
    
    // 存儲到本地存儲
    localStorage.setItem('simplifiedMode', newMode.toString());
  };

  // 如果用戶未登錄，從本地存儲讀取設置
  useEffect(() => {
    if (!user) {
      const savedMode = localStorage.getItem('simplifiedMode') === 'true';
      if (savedMode !== simplifiedMode) {
        setSimplifiedMode(savedMode);
        if (savedMode) {
          document.body.classList.add('simplified-mode');
        } else {
          document.body.classList.remove('simplified-mode');
        }
      }
    }
  }, [user, simplifiedMode]);

  return (
    <>
      <ModeIndicator simplified={simplifiedMode}>
        🧠 ADHD友好模式
      </ModeIndicator>
      
      <ToggleContainer>
        <ToggleButton
          simplified={simplifiedMode}
          onClick={toggleMode}
          title={simplifiedMode ? '切換到標準模式' : '切換到簡化模式'}
        >
          {simplifiedMode ? '🧠' : '⚙️'}
          {simplifiedMode ? '簡化模式' : '標準模式'}
        </ToggleButton>
      </ToggleContainer>
    </>
  );
};

export default ADHDModeToggle;