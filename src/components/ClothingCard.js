import React from 'react';
import styled from 'styled-components';
import LazyImage from './LazyImage';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

// 移除原來的 ClothingImage，使用 LazyImage 組件

const Content = styled.div`
  padding: 16px;
`;

const Category = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const SubCategory = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Colors = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const ColorDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => getColorCode(props.color)};
  border: 1px solid #ddd;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
`;

const Tag = styled.span`
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const WearInfo = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  justify-content: space-between;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
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

const ClothingCard = ({ clothing, onWear, onEdit, onDelete }) => {
  const safeColors = Array.isArray(clothing.colors) ? clothing.colors : [];
  const safeSeason = Array.isArray(clothing.season) ? clothing.season : [];
  const wearCount = Number.isFinite(clothing.wearCount) ? clothing.wearCount : 0;
  const handleWear = () => {
    onWear && onWear(clothing._id);
  };

  const handleEdit = () => {
    onEdit && onEdit(clothing);
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除這件衣物嗎？')) {
      onDelete && onDelete(clothing._id);
    }
  };

  return (
    <Card>
      <ImageContainer>
        <LazyImage 
          src={`http://localhost:5000${clothing.imageUrl}`} 
          alt={clothing.subCategory}
          width="100%"
          height="200px"
          placeholder="👕"
          onError={() => {
            console.log('圖片載入失敗:', clothing.imageUrl);
          }}
        />
      </ImageContainer>
      
      <Content>
        <Category>{clothing.category}</Category>
        <SubCategory>{clothing.subCategory}</SubCategory>
        
        <Colors>
          {safeColors.map((color, index) => (
            <ColorDot key={index} color={color} title={color} />
          ))}
        </Colors>
        
        <Tags>
          <Tag>{clothing.style}</Tag>
          {safeSeason.map((season, index) => (
            <Tag key={index}>{season}</Tag>
          ))}
        </Tags>
        
        <WearInfo>
          <span>穿過 {wearCount} 次</span>
          <span>
            {clothing.lastWorn 
              ? `上次: ${new Date(clothing.lastWorn).toLocaleDateString()}`
              : '未穿過'
            }
          </span>
        </WearInfo>
        
        <Actions>
          <Button className="primary" onClick={handleWear}>
            記錄穿著
          </Button>
          <Button className="secondary" onClick={handleEdit}>
            編輯
          </Button>
          <Button className="secondary" onClick={handleDelete}>
            刪除
          </Button>
        </Actions>
      </Content>
    </Card>
  );
};

export default ClothingCard;