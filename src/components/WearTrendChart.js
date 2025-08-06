import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const ChartContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TimeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const TimeButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const ChartArea = styled.div`
  height: 200px;
  display: flex;
  align-items: end;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 10px;
`;

const ChartBar = styled.div`
  flex: 1;
  background: ${props => props.height > 0 ? '#007bff' : '#f8f9fa'};
  height: ${props => Math.max(props.height, 2)}px;
  border-radius: 2px 2px 0 0;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.height > 0 ? '#0056b3' : '#e9ecef'};
    
    &::after {
      content: '${props => props.count} 次';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const WearTrendChart = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    fetchTrendData();
  }, [selectedPeriod]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/clothes/wear-trends?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取趨勢數據失敗');
      }

      const data = await response.json();
      setTrendData(data);

    } catch (error) {
      console.error('獲取趨勢錯誤:', error);
      toast.error('獲取穿著趨勢失敗');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getMaxCount = () => {
    if (!trendData?.trends) return 1;
    return Math.max(...trendData.trends.map(t => t.count), 1);
  };

  if (loading) {
    return (
      <ChartContainer>
        <LoadingMessage>📊 載入穿著趨勢中...</LoadingMessage>
      </ChartContainer>
    );
  }

  if (!trendData) {
    return (
      <ChartContainer>
        <ChartTitle>📈 穿著趨勢</ChartTitle>
        <div style={{ textAlign: 'center', color: '#666' }}>
          暫無趨勢數據
        </div>
      </ChartContainer>
    );
  }

  const maxCount = getMaxCount();
  const totalWears = trendData.trends.reduce((sum, day) => sum + day.count, 0);

  return (
    <ChartContainer>
      <ChartTitle>
        📈 穿著趨勢
      </ChartTitle>

      <TimeSelector>
        <TimeButton
          active={selectedPeriod === 7}
          onClick={() => setSelectedPeriod(7)}
        >
          7天
        </TimeButton>
        <TimeButton
          active={selectedPeriod === 30}
          onClick={() => setSelectedPeriod(30)}
        >
          30天
        </TimeButton>
        <TimeButton
          active={selectedPeriod === 90}
          onClick={() => setSelectedPeriod(90)}
        >
          90天
        </TimeButton>
      </TimeSelector>

      <ChartArea>
        {trendData.trends.map((day, index) => (
          <ChartBar
            key={day.date}
            height={(day.count / maxCount) * 180}
            count={day.count}
          />
        ))}
      </ChartArea>

      <ChartLabels>
        <span>{formatDate(trendData.trends[0]?.date)}</span>
        <span>{formatDate(trendData.trends[Math.floor(trendData.trends.length / 2)]?.date)}</span>
        <span>{formatDate(trendData.trends[trendData.trends.length - 1]?.date)}</span>
      </ChartLabels>

      <StatsRow>
        <StatItem>
          <StatValue>{totalWears}</StatValue>
          <StatLabel>總穿著次數</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.round(trendData.averageDaily * 10) / 10}</StatValue>
          <StatLabel>日均穿著</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{Math.max(...trendData.trends.map(t => t.count))}</StatValue>
          <StatLabel>單日最高</StatLabel>
        </StatItem>
      </StatsRow>
    </ChartContainer>
  );
};

export default WearTrendChart;