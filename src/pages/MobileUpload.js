import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import MobileCameraUpload from '../components/MobileCameraUpload';
import { useAuth } from '../contexts/AuthContext';

const MobileContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
  
  @media (max-width: 768px) {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

const Header = styled.div`
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 10px 15px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 500px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const HelpButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Content = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const TipsCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const TipsTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TipItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  flex: 1;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
`;

const QuickActionCard = styled.div`
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ActionIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const ActionDesc = styled.div`
  font-size: 12px;
  color: #666;
`;

const HelpModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const HelpContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const HelpTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const HelpSection = styled.div`
  margin-bottom: 20px;
`;

const HelpSectionTitle = styled.h4`
  color: #007bff;
  margin-bottom: 10px;
  font-size: 16px;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
`;

const MobileUpload = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [stats, setStats] = useState({ totalClothes: 0, recentUploads: 0 });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
      return;
    }
    
    fetchStats();
  }, [isAuthenticated, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clothes/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalClothes: data.totalClothes || 0,
          recentUploads: data.recentWearsCount || 0
        });
      }
    } catch (error) {
      console.error('獲取統計失敗:', error);
    }
  };

  const handleUploadSuccess = (clothing) => {
    toast.success('衣物已成功添加到衣櫃！');
    fetchStats(); // 更新統計
  };

  const handleAnalysisComplete = (analysis) => {
    if (analysis.confidence > 0.8) {
      toast.success('AI識別準確度很高！');
    } else if (analysis.confidence > 0.6) {
      toast.info('AI識別完成，建議檢查結果');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MobileContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={() => navigate('/')}>
            ←
          </BackButton>
          <Title>📷 拍照識別</Title>
          <HelpButton onClick={() => setShowHelp(true)}>
            ❓
          </HelpButton>
        </HeaderContent>
      </Header>

      <Content>
        <StatsBar>
          <StatCard>
            <StatNumber>{stats.totalClothes}</StatNumber>
            <StatLabel>衣物總數</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.recentUploads}</StatNumber>
            <StatLabel>本月新增</StatLabel>
          </StatCard>
        </StatsBar>

        <QuickActions>
          <QuickActionCard onClick={() => navigate('/wardrobe')}>
            <ActionIcon>👔</ActionIcon>
            <ActionTitle>我的衣櫃</ActionTitle>
            <ActionDesc>查看所有衣物</ActionDesc>
          </QuickActionCard>
          
          <QuickActionCard onClick={() => navigate('/outfits')}>
            <ActionIcon>✨</ActionIcon>
            <ActionTitle>穿搭建議</ActionTitle>
            <ActionDesc>AI智能推薦</ActionDesc>
          </QuickActionCard>
        </QuickActions>

        <TipsCard>
          <TipsTitle>📸 拍照小貼士</TipsTitle>
          <TipsList>
            <TipItem>
              <span>💡</span>
              <span>確保光線充足，避免陰影</span>
            </TipItem>
            <TipItem>
              <span>👕</span>
              <span>衣物平鋪或懸掛拍攝效果更好</span>
            </TipItem>
            <TipItem>
              <span>🎯</span>
              <span>使用純色背景，避免雜亂</span>
            </TipItem>
            <TipItem>
              <span>📱</span>
              <span>一次拍攝一件衣物，避免重疊</span>
            </TipItem>
          </TipsList>
        </TipsCard>

        <MobileCameraUpload
          onUploadSuccess={handleUploadSuccess}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </Content>

      {showHelp && (
        <HelpModal onClick={() => setShowHelp(false)}>
          <HelpContent onClick={e => e.stopPropagation()}>
            <HelpTitle>📱 手機使用指南</HelpTitle>
            
            <HelpSection>
              <HelpSectionTitle>🤖 AI識別功能</HelpSectionTitle>
              <p>使用Google Gemini AI自動識別衣物的類別、顏色、風格和季節適用性。識別準確度通常在80%以上。</p>
            </HelpSection>
            
            <HelpSection>
              <HelpSectionTitle>📷 拍照技巧</HelpSectionTitle>
              <p>• 使用自然光或充足的室內照明<br/>
                 • 將衣物平鋪在床上或掛在衣架上<br/>
                 • 選擇簡潔的背景<br/>
                 • 確保衣物完整出現在畫面中</p>
            </HelpSection>
            
            <HelpSection>
              <HelpSectionTitle>🧠 ADHD友好設計</HelpSectionTitle>
              <p>界面簡潔明了，大按鈕設計，清晰的視覺反饋，減少認知負荷，讓您專注於衣物管理。</p>
            </HelpSection>
            
            <HelpSection>
              <HelpSectionTitle>🔄 離線支持</HelpSectionTitle>
              <p>APP支持離線使用，拍攝的照片會在網絡恢復時自動上傳和分析。</p>
            </HelpSection>
            
            <CloseButton onClick={() => setShowHelp(false)}>
              知道了
            </CloseButton>
          </HelpContent>
        </HelpModal>
      )}
    </MobileContainer>
  );
};

export default MobileUpload;