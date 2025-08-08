import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import ADHDModeToggle from '../components/ADHDModeToggle';
import QuickWearRecord from '../components/QuickWearRecord';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';

const Container = styled.div`
  max-width: ${props => props.adhdMode ? '800px' : '1200px'};
  margin: 0 auto;
  padding: ${props => props.adhdMode ? '15px' : '20px'};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const WelcomeSection = styled.div`
  text-align: left;
`;

const WelcomeTitle = styled.h1`
  color: #333;
  margin: 0 0 ${props => props.adhdMode ? '0' : '10px'} 0;
  font-size: ${props => props.adhdMode ? '28px' : '36px'};
`;

const WelcomeSubtitle = styled.p`
  color: #666;
  margin: 0;
  font-size: 16px;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.adhdMode ? '2' : '3'}, 1fr);
  gap: 15px;
  margin-bottom: 30px;
`;

const StatCard = ({ children }) => (
  <Card className="text-center">
    <CardContent>{children}</CardContent>
  </Card>
);

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.adhdMode ? '1' : 'auto-fit'}, minmax(${props => props.adhdMode ? '100%' : '250px'}, 1fr));
  gap: ${props => props.adhdMode ? '15px' : '20px'};
  margin-bottom: 40px;
`;

const ActionCard = ({ onClick, children, adhdMode, priority }) => (
  <Card className={priority && adhdMode ? 'border-primary' : ''}>
    <CardContent>
      <div onClick={onClick} role="button">
        {children}
      </div>
    </CardContent>
  </Card>
);

const ActionIcon = styled.div`
  font-size: ${props => props.adhdMode ? '48px' : '64px'};
  margin-bottom: ${props => props.adhdMode ? '15px' : '20px'};
`;

const ActionTitle = styled.h3`
  color: #333;
  margin: 0 0 ${props => props.adhdMode ? '8px' : '10px'} 0;
  font-size: ${props => props.adhdMode ? '20px' : '24px'};
`;

const ActionDescription = styled.p`
  color: #666;
  margin: 0;
  font-size: ${props => props.adhdMode ? '14px' : '16px'};
  display: ${props => props.adhdMode ? 'none' : 'block'};
`;

const RecentSection = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
`;

const RecentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
`;

const RecentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const RecentIcon = styled.div`
  font-size: 24px;
`;

const RecentText = styled.div`
  color: #666;
  font-size: 14px;
`;

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [adhdMode, setAdhdMode] = useState(false);
  const [clothes, setClothes] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // 載入ADHD模式設置
    const savedMode = localStorage.getItem('adhdMode') === 'true';
    setAdhdMode(savedMode);
    
    fetchQuickData();
  }, [isAuthenticated, navigate]);

  const fetchQuickData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 獲取最近衣物
      const clothesRes = await fetch('/api/clothes?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (clothesRes.ok) {
        const clothesData = await clothesRes.json();
        setClothes(clothesData.clothes || []);
      }
      
      // 獲取統計數據
      const statsRes = await fetch('/api/clothes/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('獲取數據失敗:', error);
    }
  };

  if (!isAuthenticated) return null;

  const mainActions = adhdMode ? [
    { path: '/upload', icon: '📷', title: '拍照上傳', desc: '添加衣物' },
    { path: '/wardrobe', icon: '👔', title: '我的衣櫃', desc: '查看衣物' },
    { path: '/outfits', icon: '✨', title: '穿搭建議', desc: 'AI推薦' }
  ] : [
    { path: '/upload', icon: '📷', title: '拍照上傳', desc: '添加新的衣物到衣櫃' },
    { path: '/wardrobe', icon: '👔', title: '我的衣櫃', desc: '瀏覽和管理衣物' },
    { path: '/outfits', icon: '✨', title: '穿搭建議', desc: 'AI智能搭配推薦' },
    { path: '/statistics', icon: '📊', title: '統計分析', desc: '查看穿著數據' },
    { path: '/declutter', icon: '🗑️', title: '整理建議', desc: '淘汰不需要的衣物' }
  ];

  return (
    <Container adhdMode={adhdMode}>
      <Header>
        <WelcomeSection>
          <WelcomeTitle adhdMode={adhdMode}>
            👋 歡迎，{user?.name || '用戶'}！
          </WelcomeTitle>
          {!adhdMode && (
            <WelcomeSubtitle>讓我們一起管理你的智能衣櫃</WelcomeSubtitle>
          )}
        </WelcomeSection>
        <ADHDModeToggle 
          enabled={adhdMode} 
          onChange={setAdhdMode}
        />
      </Header>

      <QuickStats adhdMode={adhdMode}>
        <StatCard>
          <StatNumber>{stats.totalClothes || 0}</StatNumber>
          <StatLabel>件衣物</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.recentWearsCount || 0}</StatNumber>
          <StatLabel>本月穿著</StatLabel>
        </StatCard>
        {!adhdMode && (
          <StatCard>
            <StatNumber>{stats.utilizationRate || 0}%</StatNumber>
            <StatLabel>利用率</StatLabel>
          </StatCard>
        )}
      </QuickStats>

      <QuickActions adhdMode={adhdMode}>
        {mainActions.map((action, index) => (
          <ActionCard 
            key={action.path}
            onClick={() => navigate(action.path)}
            adhdMode={adhdMode}
            priority={index < 3}
          >
            <ActionIcon adhdMode={adhdMode}>{action.icon}</ActionIcon>
            <ActionTitle adhdMode={adhdMode}>{action.title}</ActionTitle>
            <ActionDescription adhdMode={adhdMode}>
              {action.desc}
            </ActionDescription>
            <div style={{ marginTop: 12 }}>
              <Button variant="primary" size="lg" onClick={() => navigate(action.path)}>
                立即前往
              </Button>
            </div>
          </ActionCard>
        ))}
      </QuickActions>

      {!adhdMode && (
        <RecentSection>
          <SectionTitle>📈 最近活動</SectionTitle>
          <RecentGrid>
            <RecentItem>
              <RecentIcon>📷</RecentIcon>
              <RecentText>
                {stats.totalClothes > 0 
                  ? `衣櫃中有 ${stats.totalClothes} 件衣物`
                  : '還沒有添加衣物，點擊上方開始吧！'
                }
              </RecentText>
            </RecentItem>
            <RecentItem>
              <RecentIcon>👕</RecentIcon>
              <RecentText>
                {stats.recentWearsCount > 0
                  ? `本月已穿著 ${stats.recentWearsCount} 次`
                  : '還沒有記錄穿著，試試快速記錄功能！'
                }
              </RecentText>
            </RecentItem>
          </RecentGrid>
        </RecentSection>
      )}

      <QuickWearRecord 
        clothes={clothes} 
        onRecord={fetchQuickData}
      />
    </Container>
  );
};

export default Home;