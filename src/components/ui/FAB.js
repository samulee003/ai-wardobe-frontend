import React from 'react';
import styled from 'styled-components';

const FabButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
  cursor: pointer;
  z-index: 50;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background 0.2s ease;

  &:hover { background: var(--color-primary-hover); transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;

const FAB = ({ onClick, title = '拍照/上傳' }) => {
  return (
    <FabButton onClick={onClick} aria-label={title} title={title}>
      📷
    </FabButton>
  );
};

export default FAB;


