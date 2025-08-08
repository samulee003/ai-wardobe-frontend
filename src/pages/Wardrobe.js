import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ClothingCard from '../components/ClothingCard';
import { useAuth } from '../contexts/AuthContext';
import { ClothingGridSkeleton } from '../components/SkeletonLoader';
import localStorageService from '../services/localStorageService';

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
  const [nlQuery, setNlQuery] = useState('');
  const [nlMode, setNlMode] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [, setStats] = useState({
    total: 0,
    categories: {},
    recentlyAdded: 0
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 檢查登錄狀態
  useEffect(() => {
    // 無認證模式：不再跳轉登入
    fetchClothes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, filters, pagination.currentPage]);

  // 獲取衣物列表（優先本地，備用雲端）
  const fetchClothes = async () => {
    try {
      setLoading(true);
      
      // 自然語言搜尋優先
      if (nlMode && nlQuery.trim()) {
        try {
          // 嘗試雲端搜尋
          if (isAuthenticated) {
            const token = localStorage.getItem('token');
            const resp = await fetch(`/api/clothes/search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ q: nlQuery, limit: 24 })
            });
            if (resp.ok) {
              const data = await resp.json();
              setClothes(data.clothes || []);
              setPagination(prev => ({ ...prev, totalPages: 1, total: (data.clothes||[]).length }));
              setLoading(false);
              return;
            }
          }
          
          // 雲端失敗，本地搜尋
          const localResults = await localStorageService.searchClothes(nlQuery);
          setClothes(localResults);
          setPagination(prev => ({ ...prev, totalPages: 1, total: localResults.length }));
          setLoading(false);
          return;
        } catch (error) {
          console.warn('搜尋失敗，嘗試載入本地資料');
        }
      }

      // 優先使用本地資料
      try {
        const localClothes = await localStorageService.getAllClothes({
          limit: 12,
          offset: (pagination.currentPage - 1) * 12,
          category: filters.category,
          style: filters.style
        });
        
        if (localClothes.length > 0) {
          setClothes(localClothes);
          
          // 獲取總數用於分頁
          const allLocal = await localStorageService.getAllClothes({ includeImages: false });
          const totalPages = Math.ceil(allLocal.length / 12);
          
          setPagination({
            currentPage: pagination.currentPage,
            totalPages,
            total: allLocal.length
          });
          
          setStats(prev => ({ ...prev, total: allLocal.length }));
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn('本地資料載入失敗:', error);
      }

      // 本地無資料，嘗試雲端
      if (isAuthenticated) {
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

        if (response.ok) {
          const data = await response.json();
          setClothes(data.clothes || []);
          setPagination({
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
            total: data.total || 0
          });

          setStats(prev => ({ ...prev, total: data.total || 0 }));
        } else {
          throw new Error('獲取衣物列表失敗');
        }
      } else {
        // 未登錄且無本地資料
        setClothes([]);
        setPagination({ currentPage: 1, totalPages: 1, total: 0 });
      }

    } catch (error) {
      console.error('獲取衣物錯誤:', error);
      toast.error('獲取衣物列表失敗');
      setClothes([]);
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
          <FilterGroup style={{ flex: 1, minWidth: 260 }}>
            <FilterLabel>自然語言搜尋（如：白色正式襯衫 / 夏天藍色上衣）</FilterLabel>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <SearchInput
                placeholder="輸入描述..."
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { setNlMode(true); fetchClothes(); }
                  if (e.key === 'Escape') { setNlMode(false); setNlQuery(''); fetchClothes(); }
                }}
                style={{ flex: 1 }}
              />
              <PageButton onClick={() => { setNlMode(true); fetchClothes(); }}>搜尋</PageButton>
              {nlMode && (
                <PageButton onClick={() => { setNlMode(false); setNlQuery(''); fetchClothes(); }}>清除</PageButton>
              )}
            </div>
          </FilterGroup>

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
        <ClothingGridSkeleton count={6} />
      ) : clothes.length === 0 ? (
        <EmptyMessage>
          <EmptyIcon>👔</EmptyIcon>
          <h3>{nlMode ? '沒有找到相關衣物' : '還沒有衣物'}</h3>
          <p>
            {nlMode 
              ? '試試其他搜尋關鍵字，或清除搜尋條件查看所有衣物。' 
              : '點擊上方的「添加衣物」按鈕開始建立你的數位衣櫃吧！'
            }
          </p>
          {nlMode ? (
            <AddButton onClick={() => { setNlMode(false); setNlQuery(''); fetchClothes(); }}>
              🔍 查看所有衣物
            </AddButton>
          ) : (
            <AddButton onClick={() => navigate('/upload')}>
              📷 立即添加
            </AddButton>
          )}
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
              
              {pagination.total > 0 && (
                <div style={{ fontSize: '14px', color: '#666', marginLeft: '15px' }}>
                  共 {pagination.total} 件衣物，第 {pagination.currentPage} / {pagination.totalPages} 頁
                </div>
              )}
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default Wardrobe;