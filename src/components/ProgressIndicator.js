import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  margin: 20px 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.percentage >= 100) return '#28a745';
    if (props.percentage >= 75) return '#007bff';
    if (props.percentage >= 50) return '#ffc107';
    return '#dc3545';
  }};
  width: ${props => Math.min(Math.max(props.percentage, 0), 100)}%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 6px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.2),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 15px;
    left: 50%;
    right: -50%;
    height: 2px;
    background: ${props => props.completed ? '#28a745' : '#e9ecef'};
    z-index: 1;
  }
`;

const StepCircle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => {
    if (props.completed) return '#28a745';
    if (props.active) return '#007bff';
    return '#e9ecef';
  }};
  color: ${props => (props.completed || props.active) ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${props => {
    if (props.completed) return '#28a745';
    if (props.active) return '#007bff';
    return '#666';
  }};
  text-align: center;
  font-weight: ${props => (props.completed || props.active) ? '600' : '400'};
`;

const ProgressIndicator = ({ 
  percentage = 0, 
  label = '', 
  showPercentage = true,
  steps = null,
  currentStep = 0
}) => {
  if (steps) {
    return (
      <ProgressContainer>
        {label && (
          <ProgressLabel>
            <span>{label}</span>
            {showPercentage && (
              <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
            )}
          </ProgressLabel>
        )}
        
        <StepIndicator>
          {steps.map((step, index) => (
            <Step 
              key={index} 
              completed={index < currentStep}
            >
              <StepCircle 
                completed={index < currentStep}
                active={index === currentStep}
              >
                {index < currentStep ? '✓' : index + 1}
              </StepCircle>
              <StepLabel 
                completed={index < currentStep}
                active={index === currentStep}
              >
                {step}
              </StepLabel>
            </Step>
          ))}
        </StepIndicator>
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer>
      {label && (
        <ProgressLabel>
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </ProgressLabel>
      )}
      <ProgressBar>
        <ProgressFill percentage={percentage} />
      </ProgressBar>
    </ProgressContainer>
  );
};

export default ProgressIndicator;