import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
// 移除未使用的匯入以通過 ESLint

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

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const SummaryCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
`;

const SummaryNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${props => props.color || '#007bff'};
  margin-bottom: 8px;
`;

const SummaryLabel = styled.div`
  color: #666;
  font-size: 14px;
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

const RefreshButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
  }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const SuggestionCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  border-left: 4px solid ${props => {
    switch(props.priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#007bff';
    }
  }};
`;

const SuggestionHeader = styled.div`
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const SuggestionTitle = styled.h4`
  margin: 0 0 5px 0;
  color: #333;
`;

const SuggestionMeta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 15px;
`;

const SuggestionImage = styled.div`
  height: 150px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
`;

const SuggestionContent = styled.div`
  padding: 15px;
`;

const ReasonText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
`;

const SuggestionText = styled.p`
  color: #007bff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const SuggestionActions = styled.div`
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
  
  &.keep {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.later {
    background: #ffc107;
    color: #333;
    
    &:hover {
      background: #e0a800;
    }
  }
  
  &.remove {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
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

const Declutter = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 無認證模式：不再跳轉登入
    fetchSuggestions();
  }, [isAuthenticated, navigate]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/recommendations/declutter', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取淘汰建議失敗');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setSummary(data.summary || {});

    } catch (error) {
      console.error('獲取建議錯誤:', error);
      toast.error('獲取淘汰建議失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (clothingId, action) => {
    try {
      // 這裡可以實現具體的操作邏輯
      switch (action) {
        case 'keep':
          toast.success('已標記為保留');
          break;
        case 'later':
          toast.info('已標記為稍後決定');
          break;
        case 'remove':
          if (window.confirm('確定要淘汰這件衣物嗎？')) {
            // 實際刪除邏輯
            const token = localStorage.getItem('token');
            await fetch(`/api/clothes/${clothingId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            toast.success('衣物已淘汰');
            fetchSuggestions(); // 重新獲取建議
          }
          break;
        default:
          break;
      }
      
      // 從建議列表中移除
      setSuggestions(prev => prev.filter(s => s._id !== clothingId));
      
    } catch (error) {
      console.error('操作錯誤:', error);
      toast.error('操作失敗');
    }
  };

  const getFilteredSuggestions = () => {
    if (filter === 'all') return suggestions;
    return suggestions.filter(s => {
      switch (filter) {
        case 'rarely-worn':
          return s.reason === '很少穿著';
        case 'damaged':
          return s.reason === '狀況不佳';
        case 'duplicate':
          return s.reason === '重複過多';
        default:
          return true;
      }
    });
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

  if (loading) {
    return (
      <Container>
        <LoadingMessage>🔄 分析衣櫃中，生成淘汰建議...</LoadingMessage>
      </Container>
    );
  }

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <Container>
      <Header>
        <Title>🗑️ 衣物淘汰建議</Title>
        <Subtitle>AI智能分析，幫你識別可以淘汰的衣物，保持衣櫃整潔</Subtitle>
      </Header>

      <SummaryCards>
        <SummaryCard>
          <SummaryNumber color="#dc3545">{summary.total || 0}</SummaryNumber>
          <SummaryLabel>建議淘汰</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryNumber color="#ffc107">{summary.rarelyWorn || 0}</SummaryNumber>
          <SummaryLabel>很少穿著</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryNumber color="#6c757d">{summary.damaged || 0}</SummaryNumber>
          <SummaryLabel>狀況不佳</SummaryLabel>
        </SummaryCard>
        <SummaryCard>
          <SummaryNumber color="#17a2b8">{summary.duplicate || 0}</SummaryNumber>
          <SummaryLabel>重複過多</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      <FilterSection>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>篩選類型</FilterLabel>
            <FilterSelect
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">全部建議</option>
              <option value="rarely-worn">很少穿著</option>
              <option value="damaged">狀況不佳</option>
              <option value="duplicate">重複過多</option>
            </FilterSelect>
          </FilterGroup>
          
          <RefreshButton onClick={fetchSuggestions}>
            🔄 重新分析
          </RefreshButton>
        </FilterRow>
      </FilterSection>

      {filteredSuggestions.length === 0 ? (
        <EmptyMessage>
          <EmptyIcon>✨</EmptyIcon>
          <h3>太棒了！</h3>
          <p>目前沒有需要淘汰的衣物建議，你的衣櫃管理得很好！</p>
        </EmptyMessage>
      ) : (
        <SuggestionsGrid>
          {filteredSuggestions.map((suggestion) => (
            <SuggestionCard key={suggestion._id} priority={suggestion.priority}>
              <SuggestionHeader>
                <SuggestionTitle>{suggestion.subCategory}</SuggestionTitle>
                <SuggestionMeta>
                  <span>🏷️ {suggestion.category}</span>
                  <span>🎨 {suggestion.colors?.[0] || '未知'}</span>
                  <span>👕 {suggestion.style || '未知'}</span>
                </SuggestionMeta>
              </SuggestionHeader>

              <SuggestionImage>
                {getItemIcon(suggestion.category)}
              </SuggestionImage>

              <SuggestionContent>
                <ReasonText>
                  ❗ {suggestion.reason}
                  {suggestion.wearCount !== undefined && (
                    <span> (穿著 {suggestion.wearCount} 次)</span>
                  )}
                </ReasonText>
                <SuggestionText>
                  💡 {suggestion.suggestion}
                </SuggestionText>
              </SuggestionContent>

              <SuggestionActions>
                <ActionButton
                  className="keep"
                  onClick={() => handleAction(suggestion._id, 'keep')}
                >
                  ✅ 保留
                </ActionButton>
                <ActionButton
                  className="later"
                  onClick={() => handleAction(suggestion._id, 'later')}
                >
                  ⏰ 稍後
                </ActionButton>
                <ActionButton
                  className="remove"
                  onClick={() => handleAction(suggestion._id, 'remove')}
                >
                  🗑️ 淘汰
                </ActionButton>
              </SuggestionActions>
            </SuggestionCard>
          ))}
        </SuggestionsGrid>
      )}
    </Container>
  );
};

export default Declutter;