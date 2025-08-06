import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  
  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border-left: 4px solid ${props => {
    switch(props.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#007bff';
      default: return '#6c757d';
    }
  }};
  animation: ${props => props.isLeaving ? slideOut : slideIn} 0.3s ease-out;
  cursor: pointer;
  
  &:hover {
    transform: translateX(-5px);
    transition: transform 0.2s ease;
  }
`;

const ToastIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ToastMessage = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  flex-shrink: 0;
  
  &:hover {
    color: #666;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => {
    switch(props.type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#007bff';
      default: return '#6c757d';
    }
  }};
  width: ${props => props.progress}%;
  transition: width 0.1s linear;
  border-radius: 0 0 4px 4px;
`;

// Toast 管理器
class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = [];
    this.nextId = 1;
  }

  // 添加監聽器
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 通知監聽器
  notify() {
    this.listeners.forEach(listener => listener(this.toasts));
  }

  // 顯示 toast
  show(message, options = {}) {
    const toast = {
      id: this.nextId++,
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      createdAt: Date.now()
    };

    this.toasts.push(toast);
    this.notify();

    // 自動移除（除非是持久化的）
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }

    return toast.id;
  }

  // 移除 toast
  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  // 清除所有 toast
  clear() {
    this.toasts = [];
    this.notify();
  }

  // 便捷方法
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', duration: 8000 });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning', duration: 6000 });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }
}

// 全局 toast 管理器實例
export const toastManager = new ToastManager();

// Toast 組件
const Toast = ({ toast, onClose }) => {
  const [progress, setProgress] = React.useState(100);
  const [isLeaving, setIsLeaving] = React.useState(false);

  React.useEffect(() => {
    if (toast.duration > 0 && !toast.persistent) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, toast.duration - elapsed);
        const progressPercent = (remaining / toast.duration) * 100;
        
        setProgress(progressPercent);
        
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast.duration, toast.persistent]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch(toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <ToastItem
      type={toast.type}
      isLeaving={isLeaving}
      onClick={handleClose}
    >
      <ToastIcon>{getIcon()}</ToastIcon>
      <ToastContent>
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        <ToastMessage>{toast.message}</ToastMessage>
      </ToastContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
      {!toast.persistent && toast.duration > 0 && (
        <ProgressBar type={toast.type} progress={progress} />
      )}
    </ToastItem>
  );
};

// Toast 容器組件
const ToastProvider = () => {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={toastManager.remove.bind(toastManager)}
        />
      ))}
    </ToastContainer>
  );
};

export default ToastProvider;