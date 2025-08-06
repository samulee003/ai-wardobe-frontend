import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'large' ? '60px' : '40px'};
  color: #666;
`;

const Spinner = styled.div`
  width: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  }};
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: ${props => props.message ? '15px' : '0'};
`;

const Message = styled.div`
  font-size: ${props => props.size === 'large' ? '18px' : '16px'};
  font-weight: 500;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
`;

const LoadingSpinner = ({ 
  size = 'medium', 
  message = '載入中...', 
  showMessage = true 
}) => {
  return (
    <SpinnerContainer size={size}>
      <Spinner size={size} message={showMessage && message} />
      {showMessage && message && (
        <Message size={size}>{message}</Message>
      )}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;