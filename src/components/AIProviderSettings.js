import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProviderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProviderOption = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};
  
  &:hover {
    border-color: #007bff;
  }
`;

const ProviderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProviderIcon = styled.div`
  font-size: 24px;
`;

const ProviderDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProviderName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
`;

const ProviderDesc = styled.div`
  font-size: 14px;
  color: #666;
`;

const ProviderStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
`;

const StatusIndicator = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  
  &.available {
    background: #d4edda;
    color: #155724;
  }
  
  &.unavailable {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.testing {
    background: #fff3cd;
    color: #856404;
  }
`;

const LatencyInfo = styled.div`
  font-size: 12px;
  color: #666;
`;

const TestButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #007bff;
    color: white;
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    border-color: #ccc;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
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
  }
`;

// 精簡為 KIMI + 本地分析
const providers = [
  {
    id: 'kimi',
    name: 'KIMI (Moonshot) Vision',
    description: '主力供應商：穩定、快速的圖像理解',
    icon: '🌙',
    requiresKey: true
  },
  {
    id: 'fallback',
    name: '本地分析',
    description: '基礎功能，無需網路連線',
    icon: '🏠',
    requiresKey: false
  }
];

const AIProviderSettings = () => {
  const [selectedProvider, setSelectedProvider] = useState('kimi');
  const [providerStatus, setProviderStatus] = useState({});
  const [testing, setTesting] = useState(null);
  const [lastResults, setLastResults] = useState({});

  // 載入設定
  useEffect(() => {
    loadSettings();
    checkProviderStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        if (data.services?.ai) {
          setSelectedProvider(data.services.ai.preferredService || 'kimi');
          
          // 更新狀態
          const status = {};
          if (data.services.ai.hasKimiKey) status.kimi = 'available';
          status.fallback = 'available';
          
          setProviderStatus(status);
          
          // 載入歷史結果
          if (data.services.ai.lastAnalysis) {
            setLastResults({
              [data.services.ai.preferredService]: {
                latency: data.services.ai.analysesByService?.[data.services.ai.preferredService]?.avgLatency || 0,
                timestamp: data.services.ai.lastAnalysis
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
    }
  };

  const checkProviderStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        const ai = data.services?.ai;
        const status = {};
        status.kimi = ai?.hasKimiKey ? 'available' : 'unavailable';
        status.fallback = 'available';
        
        setProviderStatus(status);
      }
    } catch (error) {
      console.error('檢查供應商狀態失敗:', error);
    }
  };

  const testProvider = async (providerId) => {
    setTesting(providerId);
    setProviderStatus(prev => ({ ...prev, [providerId]: 'testing' }));
    
    try {
      const startTime = Date.now();
      
      // 發送測試請求到後端
      const response = await fetch(`${API_BASE_URL}/api/ai-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          provider: providerId,
          testImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' // 1x1 透明 GIF
        })
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        await response.json();
        
        setProviderStatus(prev => ({ ...prev, [providerId]: 'available' }));
        setLastResults(prev => ({
          ...prev,
          [providerId]: {
            latency,
            timestamp: new Date().toISOString(),
            success: true
          }
        }));
        
        toast.success(`${providers.find(p => p.id === providerId)?.name} 測試成功！回應時間：${latency}ms`);
      } else {
        const error = await response.json();
        
        setProviderStatus(prev => ({ ...prev, [providerId]: 'unavailable' }));
        setLastResults(prev => ({
          ...prev,
          [providerId]: {
            latency,
            timestamp: new Date().toISOString(),
            success: false,
            error: error.message
          }
        }));
        
        toast.error(`${providers.find(p => p.id === providerId)?.name} 測試失敗：${error.message}`);
      }
    } catch (error) {
      setProviderStatus(prev => ({ ...prev, [providerId]: 'unavailable' }));
      setLastResults(prev => ({
        ...prev,
        [providerId]: {
          latency: 0,
          timestamp: new Date().toISOString(),
          success: false,
          error: error.message
        }
      }));
      
      toast.error(`測試失敗：${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const saveSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/ai-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ provider: selectedProvider })
      });
      
      if (response.ok) {
        toast.success('設定已保存！');
      } else {
        throw new Error('保存失敗');
      }
    } catch (error) {
      toast.error(`保存設定失敗：${error.message}`);
    }
  };

  const getStatusDisplay = (providerId) => {
    const status = providerStatus[providerId];
    const res = lastResults[providerId];
    
    switch (status) {
      case 'available':
        return res?.success ? '✅ 可用' : '⚠️ 可用';
      case 'unavailable':
        return '❌ 不可用';
      case 'testing':
        return '🔄 測試中...';
      default:
        return '❓ 未知';
    }
  };

  const getLatencyDisplay = (providerId) => {
    const res = lastResults[providerId];
    if (!res || !res.success) return null;
    return `${res.latency}ms`;
  };

  return (
    <Container>
      <ProviderGroup>
        {providers.map(provider => {
          const isSelected = selectedProvider === provider.id;
          const status = providerStatus[provider.id];
          const isAvailable = status === 'available';
          const isTesting = testing === provider.id;
          
          return (
            <ProviderOption
              key={provider.id}
              selected={isSelected}
              onClick={() => !isTesting && setSelectedProvider(provider.id)}
            >
              <ProviderInfo>
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={isSelected}
                  onChange={() => setSelectedProvider(provider.id)}
                  style={{ margin: 0 }}
                />
                <ProviderIcon>{provider.icon}</ProviderIcon>
                <ProviderDetails>
                  <ProviderName>{provider.name}</ProviderName>
                  <ProviderDesc>{provider.description}</ProviderDesc>
                </ProviderDetails>
              </ProviderInfo>
              
              <ProviderStatus>
                <StatusIndicator className={isAvailable ? 'available' : 'unavailable'}>
                  {getStatusDisplay(provider.id)}
                </StatusIndicator>
                {getLatencyDisplay(provider.id) && (
                  <LatencyInfo>延遲: {getLatencyDisplay(provider.id)}</LatencyInfo>
                )}
                <TestButton
                  onClick={(e) => {
                    e.stopPropagation();
                    testProvider(provider.id);
                  }}
                  disabled={isTesting}
                >
                  {isTesting ? '測試中...' : '測試'}
                </TestButton>
              </ProviderStatus>
            </ProviderOption>
          );
        })}
      </ProviderGroup>
      
      <ActionButtons>
        <Button className="primary" onClick={saveSettings}>
          💾 保存設定
        </Button>
        <Button className="secondary" onClick={checkProviderStatus}>
          🔄 重新檢查
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default AIProviderSettings;
