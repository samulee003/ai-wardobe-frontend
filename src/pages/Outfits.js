import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 30px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const GenerateButton = styled.button`
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #218838;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

const OutfitCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const OutfitHeader = styled.div`
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const OutfitTitle = styled.h3`
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
`;

const OutfitMeta = styled.div`
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
`;

const OutfitItems = styled.div`
  padding: 15px;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const ItemCard = styled.div`
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 12px;
`;

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  background: #ddd;
  border-radius: 6px;
  margin: 0 auto 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const OutfitDescription = styled.div`
  padding: 0 15px 15px;
`;

const ReasonText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
`;

const TipsText = styled.p`
  color: #007bff;
  font-size: 14px;
  font-style: italic;
  margin: 0;
`;

const OutfitActions = styled.div`
  padding: 15px;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.like {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.dislike {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.save {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Outfits = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [itemDetails, setItemDetails] = useState({}); // id -> clothing detail
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    occasion: '',
    season: '',
    style: ''
  });
  const [replacingMap, setReplacingMap] = useState({}); // key: `${outfitIndex}-${itemIndex}` => boolean

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        limit: 8,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/outfits/recommendations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取推薦失敗');
      }

      const data = await response.json();
      
      if (data.recommendations.length === 0) {
        toast.info('衣物數量不足，請先添加更多衣物');
      } else {
        setRecommendations(data.recommendations);
        // 預取衣物詳情以顯示縮圖
        const ids = Array.from(new Set(data.recommendations.flatMap(r => r.items)));
        await fetchItemDetails(ids);
        toast.success(`生成了 ${data.recommendations.length} 個穿搭推薦！`);
      }

    } catch (error) {
      console.error('生成推薦錯誤:', error);
      toast.error('生成推薦失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 取得衣物詳情（批次）
  const fetchItemDetails = async (ids) => {
    const token = localStorage.getItem('token');
    const results = {};
    await Promise.all(ids.map(async (id) => {
      if (itemDetails[id]) return; // 已有快取
      try {
        const resp = await fetch(`/api/clothes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resp.ok) {
          const data = await resp.json();
          results[id] = data;
        }
      } catch (_) {}
    }));
    if (Object.keys(results).length > 0) {
      setItemDetails(prev => ({ ...prev, ...results }));
    }
  };

  // 替換單件：根據相似度找候選，優先同類別且不在當前搭配
  const replaceItem = async (outfitIndex, itemIndex) => {
    try {
      const key = `${outfitIndex}-${itemIndex}`;
      if (replacingMap[key]) return; // 避免重複點擊
      setReplacingMap(prev => ({ ...prev, [key]: true }));
      const token = localStorage.getItem('token');
      const targetId = recommendations[outfitIndex].items[itemIndex];
      const targetDetail = itemDetails[targetId];
      const resp = await fetch(`/api/clothes/${targetId}/similar`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!resp.ok) throw new Error('獲取相似項失敗');
      const data = await resp.json();
      const currentIds = new Set(recommendations[outfitIndex].items);
      // 過濾：不在當前搭配、若有類別則匹配
      const candidates = (data.items || []).filter(c => !currentIds.has(c._id) && (!targetDetail || !targetDetail.category || c.category === targetDetail.category));
      if (candidates.length === 0) {
        toast.info('沒有合適的替換選項');
        return;
      }
      const picked = candidates[0];
      const next = [...recommendations];
      next[outfitIndex] = { ...next[outfitIndex], items: next[outfitIndex].items.map((id, idx) => idx === itemIndex ? picked._id : id) };
      setRecommendations(next);
      await fetchItemDetails([picked._id]);
      toast.success('已替換相似單品');
    } catch (error) {
      console.error(error);
      toast.error('替換失敗，請重試');
    } finally {
      const key = `${outfitIndex}-${itemIndex}`;
      setReplacingMap(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFeedback = async (outfitItems, feedback) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch('/api/outfits/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          outfitItems,
          feedback,
          rating: feedback === 'like' ? 5 : 1
        })
      });

      toast.success(feedback === 'like' ? '👍 已記錄你的喜好' : '👎 已記錄反饋');
      
    } catch (error) {
      console.error('提交反饋錯誤:', error);
      toast.error('提交反饋失敗');
    }
  };

  const handleSaveOutfit = async (outfit) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch('/api/outfits/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${outfit.style}穿搭 - ${outfit.occasion}`,
          items: outfit.items,
          style: outfit.style,
          occasion: outfit.occasion
        })
      });

      toast.success('💾 穿搭組合已保存');
      
    } catch (error) {
      console.error('保存穿搭錯誤:', error);
      toast.error('保存失敗');
    }
  };

  const getItemIcon = (category) => {
    const icons = {
      '上衣': '👕',
      '下裝': '👖',
      '外套': '🧥',
      '鞋子': '👟',
      '配件': '👜',
      '內衣': '🩲',
      '運動服': '🏃‍♂️',
      '正裝': '👔'
    };
    return icons[category] || '👕';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>✨ AI穿搭推薦</Title>
        <Subtitle>讓AI為你搭配今天的完美造型</Subtitle>
      </Header>

      <FilterSection>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>場合</FilterLabel>
            <FilterSelect
              value={filters.occasion}
              onChange={(e) => setFilters(prev => ({ ...prev, occasion: e.target.value }))}
            >
              <option value="">任何場合</option>
              <option value="daily">日常休閒</option>
              <option value="work">工作</option>
              <option value="formal">正式場合</option>
              <option value="sport">運動健身</option>
              <option value="date">約會聚會</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>季節</FilterLabel>
            <FilterSelect
              value={filters.season}
              onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
            >
              <option value="">任何季節</option>
              <option value="春">春</option>
              <option value="夏">夏</option>
              <option value="秋">秋</option>
              <option value="冬">冬</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>風格</FilterLabel>
            <FilterSelect
              value={filters.style}
              onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
            >
              <option value="">任何風格</option>
              <option value="休閒">休閒</option>
              <option value="正式">正式</option>
              <option value="運動">運動</option>
              <option value="時尚">時尚</option>
              <option value="簡約">簡約</option>
            </FilterSelect>
          </FilterGroup>

          <GenerateButton
            onClick={generateRecommendations}
            disabled={loading}
          >
            {loading ? '🤖 AI思考中...' : '🎯 生成推薦'}
          </GenerateButton>
        </FilterRow>
      </FilterSection>

      {loading ? (
        <LoadingMessage>🤖 AI正在為你精心搭配...</LoadingMessage>
      ) : recommendations.length === 0 ? (
        <EmptyMessage>
          <EmptyIcon>👗</EmptyIcon>
          <h3>還沒有推薦</h3>
          <p>點擊「生成推薦」按鈕，讓AI為你搭配完美造型！</p>
        </EmptyMessage>
      ) : (
        <RecommendationsGrid>
          {recommendations.map((outfit, index) => (
            <OutfitCard key={index}>
              <OutfitHeader>
                <OutfitTitle>推薦搭配 #{index + 1}</OutfitTitle>
                <OutfitMeta>
                  <span>🎨 {outfit.style || '休閒'}</span>
                  <span>📍 {outfit.occasion || '日常'}</span>
                  <span>⭐ {Math.round((outfit.colorHarmony || 0.8) * 10)}/10</span>
                </OutfitMeta>
              </OutfitHeader>

              <OutfitItems>
                <ItemsGrid>
                  {(outfit.items || []).slice(0, 4).map((itemId, itemIndex) => {
                    const detail = itemDetails[itemId];
                    return (
                      <ItemCard key={itemIndex}>
                        <ItemImage>
                          {detail?.imageUrl ? (
                            <img src={detail.imageUrl} alt={detail?.subCategory || '衣物'} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <span>{getItemIcon(detail?.category || '上衣')}</span>
                          )}
                        </ItemImage>
                        <div>{detail?.subCategory || `衣物 ${itemIndex + 1}`}</div>
                        <div style={{ marginTop: 6 }}>
                          <button
                            onClick={() => replaceItem(index, itemIndex)}
                            disabled={!!replacingMap[`${index}-${itemIndex}`]}
                            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', cursor: replacingMap[`${index}-${itemIndex}`] ? 'not-allowed' : 'pointer', opacity: replacingMap[`${index}-${itemIndex}`] ? 0.6 : 1 }}
                          >
                            {replacingMap[`${index}-${itemIndex}`] ? '處理中…' : '🔁 替換'}
                          </button>
                        </div>
                      </ItemCard>
                    );
                  })}
                </ItemsGrid>
              </OutfitItems>

              <OutfitDescription>
                <ReasonText>
                  💡 {outfit.reason || '這個搭配顏色和諧，風格統一，適合日常穿著。'}
                </ReasonText>
                {outfit.tips && (
                  <TipsText>
                    ✨ {outfit.tips}
                  </TipsText>
                )}
              </OutfitDescription>

              <OutfitActions>
                <ActionButton
                  className="like"
                  onClick={() => handleFeedback(outfit.items, 'like')}
                >
                  👍 喜歡
                </ActionButton>
                <ActionButton
                  className="dislike"
                  onClick={() => handleFeedback(outfit.items, 'dislike')}
                >
                  👎 不喜歡
                </ActionButton>
                <ActionButton
                  className="save"
                  onClick={() => handleSaveOutfit(outfit)}
                >
                  💾 保存
                </ActionButton>
              </OutfitActions>
            </OutfitCard>
          ))}
        </RecommendationsGrid>
      )}
    </Container>
  );
};

export default Outfits;