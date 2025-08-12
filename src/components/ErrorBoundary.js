import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 24px;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
  max-width: 500px;
`;

const ErrorDetails = styled.details`
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  max-width: 600px;
  width: 100%;
  
  summary {
    cursor: pointer;
    font-weight: 600;
    color: #495057;
    margin-bottom: 10px;
  }
  
  pre {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    color: #495057;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
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
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能夠顯示降級後的 UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // 記錄錯誤信息
    this.setState({
      error,
      errorInfo
    });

    // 發送錯誤報告到監控服務
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      // 發送到錯誤監控服務
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportError) {
      console.error('發送錯誤報告失敗:', reportError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;

      return (
        <ErrorContainer>
          <ErrorIcon>😵</ErrorIcon>
          <ErrorTitle>哎呀！出現了一些問題</ErrorTitle>
          <ErrorMessage>
            應用程序遇到了意外錯誤。我們已經記錄了這個問題，<br/>
            開發團隊會盡快修復。你可以嘗試以下操作：
          </ErrorMessage>

          <ActionButtons>
            <Button className="primary" onClick={this.handleRetry}>
              🔄 重試
            </Button>
            <Button className="secondary" onClick={this.handleReload}>
              🔃 重新載入
            </Button>
            <Button className="secondary" onClick={this.handleGoHome}>
              🏠 回到首頁
            </Button>
          </ActionButtons>

          {error && (
            <ErrorDetails>
              <summary>技術詳情 (錯誤ID: {errorId})</summary>
              <div>
                <strong>錯誤信息:</strong>
                <pre>{error.message}</pre>
              </div>
              {error.stack && (
                <div>
                  <strong>錯誤堆棧:</strong>
                  <pre>{error.stack}</pre>
                </div>
              )}
              {errorInfo && errorInfo.componentStack && (
                <div>
                  <strong>組件堆棧:</strong>
                  <pre>{errorInfo.componentStack}</pre>
                </div>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;