import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import axios from 'axios';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
`;

const ServiceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
`;

const ServiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ServiceName = styled.h3`
  color: #333;
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.available ? '#28a745' : '#dc3545'};
  color: white;
`;

const ServiceDescription = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const ServiceMeta = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
`;

const MetaItem = styled.div`
  font-size: 14px;
  color: #666;
  
  strong {
    color: #333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e9ecef;
    }
  }
`;

const TestSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 30px;
`;

const FileInput = styled.input`
  margin-bottom: 15px;
`;

const TestResults = styled.div`
  margin-top: 20px;
`;

const ResultCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border-left: 4px solid ${props => props.success ? '#28a745' : '#dc3545'};
`;

const AISettings = () => {
  const [services, setServices] = useState({});
  const [currentService, setCurrentService] = useState('');
  const [loading, setLoading] = useState(true);
  const [testFile, setTestFile] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchServiceStatus();
  }, []);

  const fetchServiceStatus = async () => {
    try {
      const response = await axios.get('/api/ai/service-status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setServices(response.data.serviceDetails);
      setCurrentService(response.data.currentService);
      setLoading(false);
    } catch (error) {
      toast.error('獲取AI服務狀態失敗');
      setLoading(false);
    }
  };

  const switchService = async (service) => {
    try {
      await axios.post('/api/ai/switch-service', 
        { service },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setCurrentService(service);
      toast.success(`已切換到 ${services[service].name}`);
    } catch (error) {
      toast.error('切換服務失敗');
    }
  };

  const testAIService = async (service = 'all') => {
    if (!testFile) {
      toast.error('請選擇測試圖片');
      return;
    }

    setTesting(true);
    const formData = new FormData();
    formData.append('image', testFile);
    formData.append('service', service);

    try {
      const response = await axios.post('/api/ai/test-analysis', formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setTestResults(response.data.results);
      toast.success('AI服務測試完成');
    } catch (error) {
      toast.error('測試失敗');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <Container>載入中...</Container>;
  }

  return (
    <Container>
      <Title>AI服務設置</Title>
      
      {Object.entries(services).map(([key, service]) => (
        <ServiceCard key={key} active={currentService === key}>
          <ServiceHeader>
            <ServiceName>{service.name}</ServiceName>
            <StatusBadge available={service.available}>
              {service.available ? '可用' : '未配置'}
            </StatusBadge>
          </ServiceHeader>
          
          <ServiceDescription>{service.description}</ServiceDescription>
          
          <ServiceMeta>
            <MetaItem><strong>成本:</strong> {service.cost}</MetaItem>
            <MetaItem><strong>速度:</strong> {service.speed}</MetaItem>
          </ServiceMeta>
          
          <ButtonGroup>
            <Button 
              className="primary"
              disabled={!service.available}
              onClick={() => switchService(key)}
            >
              {currentService === key ? '當前使用' : '切換使用'}
            </Button>
            <Button 
              className="secondary"
              disabled={!service.available}
              onClick={() => testAIService(key)}
            >
              單獨測試
            </Button>
          </ButtonGroup>
        </ServiceCard>
      ))}
      
      <TestSection>
        <h3>AI服務測試</h3>
        <p>上傳一張衣物圖片來測試不同AI服務的識別效果</p>
        
        <FileInput
          type="file"
          accept="image/*"
          onChange={(e) => setTestFile(e.target.files[0])}
        />
        
        <ButtonGroup>
          <Button 
            className="primary"
            onClick={() => testAIService('all')}
            disabled={testing || !testFile}
          >
            {testing ? '測試中...' : '測試所有服務'}
          </Button>
          <Button 
            className="secondary"
            onClick={() => testAIService(currentService)}
            disabled={testing || !testFile}
          >
            測試當前服務
          </Button>
        </ButtonGroup>
        
        {testResults && (
          <TestResults>
            <h4>測試結果</h4>
            {Object.entries(testResults).map(([service, result]) => (
              <ResultCard key={service} success={result.success}>
                <h5>{services[service]?.name || service}</h5>
                {result.success ? (
                  <div>
                    <p><strong>識別結果:</strong> {result.result.category} - {result.result.subCategory}</p>
                    <p><strong>顏色:</strong> {result.result.colors.join(', ')}</p>
                    <p><strong>風格:</strong> {result.result.style}</p>
                    <p><strong>信心度:</strong> {(result.result.confidence * 100).toFixed(1)}%</p>
                    <p><strong>響應時間:</strong> {result.responseTime}ms</p>
                  </div>
                ) : (
                  <p style={{color: '#dc3545'}}><strong>錯誤:</strong> {result.error}</p>
                )}
              </ResultCard>
            ))}
          </TestResults>
        )}
      </TestSection>
    </Container>
  );
};

export default AISettings;