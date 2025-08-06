import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import WearTrendChart from '../components/WearTrendChart';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #666;
  font-weight: 600;
`;

const ChartSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BarLabel = styled.div`
  min-width: 80px;
  font-size: 14px;
  color: #333;
  font-weight: 600;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background: ${props => props.color || '#007bff'};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const BarValue = styled.div`
  min-width: 40px;
  font-size: 14px;
  color: #666;
  text-align: right;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const InsightSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const InsightTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
`;

const InsightList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InsightItem = styled.li`
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
  color: #666;
  
  &:last-child {
    border-bottom: none;
  }
  
  &::before {
    content: '💡';
    margin-right: 10px;
  }
`;

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
      return;
    }
    fetchStatistics();
  }, [isAuthenticated, navigate]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/clothes/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取統計數據失敗');
      }

      const data = await response.json();
      setStats(data);

    } catch (error) {
      console.error('獲取統計錯誤:', error);
      toast.error('獲取統計數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (stats) => {
    const insights = [];
    
    if (stats.totalClothes > 50) {
      insights.push('你的衣櫃很豐富！考慮整理一下很少穿的衣物。');
    } else if (stats.totalClothes < 20) {
      insights.push('你的衣櫃比較精簡，這很棒！');
    }

    if (stats.averageWearCount < 2) {
      insights.push('許多衣物穿著次數較少，可以嘗試更多搭配組合。');
    }

    const topCategory = Object.keys(stats.categoryDistribution || {})
      .reduce((a, b) => (stats.categoryDistribution[a] > stats.categoryDistribution[b]) ? a : b, '');
    
    if (topCategory) {
      insights.push(`你最多的衣物類別是「${topCategory}」，佔 ${stats.categoryDistribution[topCategory]} 件。`);
    }

    const topColor = Object.keys(stats.colorDistribution || {})
      .reduce((a, b) => (stats.colorDistribution[a] > stats.colorDistribution[b]) ? a : b, '');
    
    if (topColor) {
      insights.push(`你最喜歡的顏色是「${topColor}」，可以嘗試搭配其他顏色增加變化。`);
    }

    return insights;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>🔄 載入統計數據中...</LoadingMessage>
      </Container>
    );
  }

  if (!stats || stats.totalClothes === 0) {
    return (
      <Container>
        <Title>📊 衣櫃統計</Title>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
          <h3>暫無統計數據</h3>
          <p>添加一些衣物後就能看到詳細的統計分析了！</p>
        </div>
      </Container>
    );
  }

  const insights = generateInsights(stats);

  return (
    <Container>
      <Title>📊 衣櫃統計分析</Title>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats.totalClothes}</StatNumber>
          <StatLabel>總衣物數量</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{stats.averageWearCount}</StatNumber>
          <StatLabel>平均穿著次數</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{Object.keys(stats.categoryDistribution || {}).length}</StatNumber>
          <StatLabel>衣物類別數</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber>{Object.keys(stats.colorDistribution || {}).length}</StatNumber>
          <StatLabel>顏色種類數</StatLabel>
        </StatCard>
      </StatsGrid>

      {stats.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 && (
        <ChartSection>
          <ChartTitle>📂 類別分布</ChartTitle>
          <BarChart>
            {Object.entries(stats.categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => {
                const percentage = (count / stats.totalClothes) * 100;
                return (
                  <BarItem key={category}>
                    <BarLabel>{category}</BarLabel>
                    <BarContainer>
                      <BarFill 
                        percentage={percentage}
                        color="#007bff"
                      />
                    </BarContainer>
                    <BarValue>{count} 件</BarValue>
                  </BarItem>
                );
              })}
          </BarChart>
        </ChartSection>
      )}

      {stats.colorDistribution && Object.keys(stats.colorDistribution).length > 0 && (
        <ChartSection>
          <ChartTitle>🎨 顏色分布</ChartTitle>
          <BarChart>
            {Object.entries(stats.colorDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8) // 只顯示前8種顏色
              .map(([color, count]) => {
                const percentage = (count / stats.totalClothes) * 100;
                const colorMap = {
                  '黑色': '#000000',
                  '白色': '#ffffff',
                  '紅色': '#dc3545',
                  '藍色': '#007bff',
                  '綠色': '#28a745',
                  '黃色': '#ffc107',
                  '紫色': '#6f42c1',
                  '灰色': '#6c757d',
                  '棕色': '#795548',
                  '粉色': '#e91e63'
                };
                
                return (
                  <BarItem key={color}>
                    <BarLabel>{color}</BarLabel>
                    <BarContainer>
                      <BarFill 
                        percentage={percentage}
                        color={colorMap[color] || '#007bff'}
                      />
                    </BarContainer>
                    <BarValue>{count} 件</BarValue>
                  </BarItem>
                );
              })}
          </BarChart>
        </ChartSection>
      )}

      <WearTrendChart />

      {insights.length > 0 && (
        <InsightSection>
          <InsightTitle>🔍 智能分析建議</InsightTitle>
          <InsightList>
            {insights.map((insight, index) => (
              <InsightItem key={index}>{insight}</InsightItem>
            ))}
          </InsightList>
        </InsightSection>
      )}
    </Container>
  );
};

export default Statistics;