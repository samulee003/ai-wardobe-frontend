import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: ${props => props.radius || '4px'};
`;

const SkeletonCard = styled(SkeletonBase)`
  width: 100%;
  height: 300px;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const SkeletonText = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  margin-bottom: ${props => props.mb || '8px'};
`;

const SkeletonImage = styled(SkeletonBase)`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const SkeletonCardContent = styled.div`
  padding: 15px;
`;

// 衣物卡片骨架
export const ClothingCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonImage />
    <SkeletonCardContent>
      <SkeletonText width="70%" height="18px" mb="10px" />
      <SkeletonText width="50%" height="14px" mb="8px" />
      <SkeletonText width="80%" height="14px" mb="12px" />
      <SkeletonText width="60%" height="12px" />
    </SkeletonCardContent>
  </SkeletonCard>
);

// 衣物網格骨架
export const ClothingGridSkeleton = ({ count = 6 }) => (
  <SkeletonGrid>
    {Array.from({ length: count }, (_, index) => (
      <ClothingCardSkeleton key={index} />
    ))}
  </SkeletonGrid>
);

// 文字行骨架
export const TextSkeleton = ({ width, height, mb }) => (
  <SkeletonText width={width} height={height} mb={mb} />
);

// 統計卡片骨架
export const StatCardSkeleton = () => (
  <SkeletonBase style={{ width: '100%', height: '80px', borderRadius: '12px' }} />
);

// 列表項目骨架
export const ListItemSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
    <SkeletonBase style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
    <div style={{ flex: 1 }}>
      <SkeletonText width="60%" height="16px" mb="4px" />
      <SkeletonText width="40%" height="12px" />
    </div>
  </div>
);

const Skeletons = {
  ClothingCardSkeleton,
  ClothingGridSkeleton,
  TextSkeleton,
  StatCardSkeleton,
  ListItemSkeleton
};

export default Skeletons;
