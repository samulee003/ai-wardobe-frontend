import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: ${props => (props.open ? 'block' : 'none')};
  z-index: 1000;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -12px 32px rgba(15, 23, 42, 0.15);
  transform: translateY(${props => (props.open ? '0%' : '100%')});
  transition: transform 220ms ease;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  z-index: 1001;
`;

const Handle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #E5E7EB;
  margin: 10px auto 8px;
`;

const Header = styled.div`
  padding: 0 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #111827;
`;

const Content = styled.div`
  padding: 0 16px 12px;
  overflow: auto;
`;

const Footer = styled.div`
  padding: 12px 16px 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${props => (props.variant === 'primary' ? '#4F46E5' : '#E5E7EB')};
  background: ${props => (props.variant === 'primary' ? '#4F46E5' : '#fff')};
  color: ${props => (props.variant === 'primary' ? '#fff' : '#111827')};
  font-weight: 600;
  cursor: pointer;
`;

const BottomSheet = ({ open, title, children, onClose, actions = [] }) => {
  return (
    <>
      <Overlay open={open} onClick={onClose} />
      <Sheet open={open} role="dialog" aria-modal="true">
        <Handle />
        <Header>
          <Title>{title}</Title>
          <Button onClick={onClose}>關閉</Button>
        </Header>
        <Content>{children}</Content>
        {actions?.length > 0 && (
          <Footer>
            {actions.map((a, idx) => (
              <Button key={idx} onClick={a.onClick} variant={a.variant || 'secondary'}>
                {a.label}
              </Button>
            ))}
          </Footer>
        )}
      </Sheet>
    </>
  );
};

export default BottomSheet;


