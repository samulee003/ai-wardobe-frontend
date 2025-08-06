import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background: #e9ecef;
  }
`;

const DetailCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ImageSection = styled.div`
  width: 100%;
  height: 400px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ClothingImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const ContentSection = styled.div`
  padding: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Category = styled.div`
  color: #666;
  font-size: 18px;
  margin-bottom: 20px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const InfoItem = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #333;
`;

const ColorTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ColorTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 14px;
`;

const ColorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => getColorCode(props.color)};
  border: 1px solid #ddd;
`;

const SeasonTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const SeasonTag = styled.span`
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 14px;
`;

const WearHistory = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const WearHistoryTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
`;

const WearStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const WearStat = styled.div`
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 6px;
`;

const WearStatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
`;

const WearStatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
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
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.warning {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const AIAnalysis = styled.div`
  background: #e8f5e8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const AITitle = styled.h4`
  color: #155724;
  margin-bottom: 10px;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background: ${props => 
    props.confidence > 0.8 ? '#28a745' : 
    props.confidence > 0.6 ? '#ffc107' : '#dc3545'
  };
  width: ${props => props.confidence * 100}%;
  transition: width 0.3s ease;
`;

// 顏色名稱轉換為CSS顏色代碼
function getColorCode(colorName) {
  const colorMap = {
    '黑色': '#000000',
    '白色': '#ffffff',
    '紅色': '#ff0000',
    '藍色': '#0000ff',
    '綠色': '#008000',
    '黃色': '#ffff00',
    '紫色': '#800080',
    '灰色': '#808080',
    '棕色': '#a52a2a',
    '粉色': '#ffc0cb',
    '橙色': '#ffa500'
  };
  
  return colorMap[colorName] || '#cccccc';
}

const ClothingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [clothing, setClothing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
      return;
    }
    fetchClothingDetail();
  }, [id, isAuthenticated, navigate]);

  const fetchClothingDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/clothes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取衣物詳情失敗');
      }

      const data = await response.json();
      setClothing(data);

    } catch (error) {
      console.error('獲取衣物詳情錯誤:', error);
      toast.error('獲取衣物詳情失敗');
      navigate('/wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const handleWear = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${id}/wear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('記錄穿著失敗');
      }

      toast.success('穿著記錄已更新！');
      fetchClothingDetail(); // 重新獲取數據

    } catch (error) {
      console.error('記錄穿著錯誤:', error);
      toast.error('記錄穿著失敗');
    }
  };

  const handleEdit = () => {
    navigate(`/clothing/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這件衣物嗎？此操作無法撤銷。')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      toast.success('衣物已刪除');
      navigate('/wardrobe');

    } catch (error) {
      console.error('刪除錯誤:', error);
      toast.error('刪除失敗');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>🔄 載入中...</LoadingMessage>
      </Container>
    );
  }

  if (!clothing) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <h3>衣物不存在</h3>
          <Button className="primary" onClick={() => navigate('/wardrobe')}>
            返回衣櫃
          </Button>
        </div>
      </Container>
    );
  }

  const daysSinceLastWorn = clothing.lastWorn 
    ? Math.floor((new Date() - new Date(clothing.lastWorn)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Container>
      <BackButton onClick={() => navigate('/wardrobe')}>
        ← 返回衣櫃
      </BackButton>

      <DetailCard>
        <ImageSection>
          <ClothingImage 
            src={`http://localhost:5000${clothing.imageUrl}`}
            alt={clothing.subCategory}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = '<div style="font-size: 64px;">👕</div>';
            }}
          />
        </ImageSection>

        <ContentSection>
          <Title>{clothing.subCategory}</Title>
          <Category>{clothing.category}</Category>

          <InfoGrid>
            <InfoItem>
              <InfoLabel>顏色</InfoLabel>
              <InfoValue>
                <ColorTags>
                  {clothing.colors.map((color, index) => (
                    <ColorTag key={index}>
                      <ColorDot color={color} />
                      {color}
                    </ColorTag>
                  ))}
                </ColorTags>
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>風格</InfoLabel>
              <InfoValue>{clothing.style}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>適合季節</InfoLabel>
              <InfoValue>
                <SeasonTags>
                  {clothing.season.map((season, index) => (
                    <SeasonTag key={index}>{season}</SeasonTag>
                  ))}
                </SeasonTags>
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>狀況</InfoLabel>
              <InfoValue>{clothing.condition || '良好'}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>添加日期</InfoLabel>
              <InfoValue>
                {new Date(clothing.createdAt).toLocaleDateString()}
              </InfoValue>
            </InfoItem>

            {clothing.notes && (
              <InfoItem>
                <InfoLabel>備註</InfoLabel>
                <InfoValue>{clothing.notes}</InfoValue>
              </InfoItem>
            )}
          </InfoGrid>

          {clothing.aiAnalysis && (
            <AIAnalysis>
              <AITitle>🤖 AI分析結果</AITitle>
              <div>
                信心度: {(clothing.aiAnalysis.confidence * 100).toFixed(1)}%
                <ConfidenceBar>
                  <ConfidenceFill confidence={clothing.aiAnalysis.confidence} />
                </ConfidenceBar>
              </div>
              {clothing.aiAnalysis.detectedFeatures && (
                <div style={{ marginTop: '10px' }}>
                  <strong>檢測特徵:</strong> {clothing.aiAnalysis.detectedFeatures.join(', ')}
                </div>
              )}
            </AIAnalysis>
          )}

          <WearHistory>
            <WearHistoryTitle>👕 穿著記錄</WearHistoryTitle>
            <WearStats>
              <WearStat>
                <WearStatNumber>{clothing.wearCount}</WearStatNumber>
                <WearStatLabel>總穿著次數</WearStatLabel>
              </WearStat>
              
              <WearStat>
                <WearStatNumber>
                  {clothing.lastWorn 
                    ? new Date(clothing.lastWorn).toLocaleDateString()
                    : '從未'
                  }
                </WearStatNumber>
                <WearStatLabel>最後穿著</WearStatLabel>
              </WearStat>
              
              {daysSinceLastWorn !== null && (
                <WearStat>
                  <WearStatNumber>{daysSinceLastWorn}</WearStatNumber>
                  <WearStatLabel>天前穿過</WearStatLabel>
                </WearStat>
              )}
            </WearStats>
          </WearHistory>

          <ActionButtons>
            <Button className="success" onClick={handleWear}>
              ✅ 記錄穿著
            </Button>
            <Button className="primary" onClick={handleEdit}>
              ✏️ 編輯信息
            </Button>
            <Button className="warning" onClick={() => toast.info('推薦功能開發中')}>
              💡 獲取搭配建議
            </Button>
            <Button className="danger" onClick={handleDelete}>
              🗑️ 刪除衣物
            </Button>
          </ActionButtons>
        </ContentSection>
      </DetailCard>
    </Container>
  );
};

export default ClothingDetail;