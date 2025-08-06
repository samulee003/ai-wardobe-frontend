import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ClothingCard from '../components/ClothingCard';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #0056b3;
  }
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
  margin-bottom: 15px;
  flex-wrap: wrap;
  align-items: center;
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

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const StatsBar = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  
  strong {
    color: #333;
  }
`;

const ClothingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const Wardrobe = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    style: '',
    season: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    categories: {},
    recentlyAdded: 0
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 檢查登錄狀態
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
      return;
    }
    fetchClothes();
  }, [isAuthenticated, navigate, filters, pagination.currentPage]);

  // 獲取衣物列表
  const fetchClothes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/clothes?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('獲取衣物列表失敗');
      }

      const data = await response.json();
      setClothes(data.clothes);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });

      // 更新統計信息
      setStats(prev => ({
        ...prev,
        total: data.total
      }));

    } catch (error) {
      console.error('獲取衣物錯誤:', error);
      toast.error('獲取衣物列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 處理篩選變化
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  // 處理穿著記錄
  const handleWear = async (clothingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${clothingId}/wear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('記錄穿著失敗');
      }

      toast.success('穿著記錄已更新！');
      fetchClothes(); // 重新獲取數據

    } catch (error) {
      console.error('記錄穿著錯誤:', error);
      toast.error('記錄穿著失敗');
    }
  };

  // 處理編輯
  const handleEdit = (clothing) => {
    // 這裡可以打開編輯模態框或跳轉到編輯頁面
    toast.info('編輯功能開發中');
  };

  // 處理刪除
  const handleDelete = async (clothingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${clothingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      toast.success('衣物已刪除');
      fetchClothes(); // 重新獲取數據

    } catch (error) {
      console.error('刪除錯誤:', error);
      toast.error('刪除失敗');
    }
  };

  // 處理分頁
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>👔 我的衣櫃</Title>
        <AddButton onClick={() => navigate('/upload')}>
          ➕ 添加衣物
        </AddButton>
      </Header>

      <FilterSection>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>類別</FilterLabel>
            <FilterSelect
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">全部類別</option>
              <option value="上衣">上衣</option>
              <option value="下裝">下裝</option>
              <option value="外套">外套</option>
              <option value="鞋子">鞋子</option>
              <option value="配件">配件</option>
              <option value="內衣">內衣</option>
              <option value="運動服">運動服</option>
              <option value="正裝">正裝</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>風格</FilterLabel>
            <FilterSelect
              value={filters.style}
              onChange={(e) => handleFilterChange('style', e.target.value)}
            >
              <option value="">全部風格</option>
              <option value="休閒">休閒</option>
              <option value="正式">正式</option>
              <option value="運動">運動</option>
              <option value="時尚">時尚</option>
              <option value="復古">復古</option>
              <option value="簡約">簡約</option>
              <option value="街頭">街頭</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>季節</FilterLabel>
            <FilterSelect
              value={filters.season}
              onChange={(e) => handleFilterChange('season', e.target.value)}
            >
              <option value="">全部季節</option>
              <option value="春">春</option>
              <option value="夏">夏</option>
              <option value="秋">秋</option>
              <option value="冬">冬</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>搜索</FilterLabel>
            <SearchInput
              placeholder="搜索衣物..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </FilterGroup>
        </FilterRow>

        <StatsBar>
          <StatItem>
            <strong>{pagination.total}</strong> 件衣物
          </StatItem>
          <StatItem>
            當前頁面: <strong>{pagination.currentPage}</strong> / {pagination.totalPages}
          </StatItem>
        </StatsBar>
      </FilterSection>

      {loading ? (
        <LoadingMessage>🔄 載入中...</LoadingMessage>
      ) : clothes.length === 0 ? (
        <EmptyMessage>
          <EmptyIcon>👔</EmptyIcon>
          <h3>還沒有衣物</h3>
          <p>點擊上方的「添加衣物」按鈕開始建立你的數位衣櫃吧！</p>
          <AddButton onClick={() => navigate('/upload')}>
            📷 立即添加
          </AddButton>
        </EmptyMessage>
      ) : (
        <>
          <ClothingGrid>
            {clothes.map(clothing => (
              <ClothingCard
                key={clothing._id}
                clothing={clothing}
                onWear={handleWear}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </ClothingGrid>

          {pagination.totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                ← 上一頁
              </PageButton>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.totalPages || 
                  Math.abs(page - pagination.currentPage) <= 2
                )
                .map(page => (
                  <PageButton
                    key={page}
                    active={page === pagination.currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PageButton>
                ))}
              
              <PageButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                下一頁 →
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default Wardrobe;