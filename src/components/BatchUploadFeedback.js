import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const FeedbackModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const FeedbackCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  max-width: 400px;
  width: 90%;
`;

const FeedbackTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
`;

const RatingSection = styled.div`
  margin-bottom: 20px;
`;

const RatingLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 5px;
  justify-content: center;
`;

const Star = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.active ? '#ffc107' : '#e9ecef'};
  transition: color 0.2s ease;
  
  &:hover {
    color: #ffc107;
  }
`;

const CommentSection = styled.div`
  margin-bottom: 20px;
`;

const CommentLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const FeedbackButton = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
`;

const BatchUploadFeedback = ({ uploadResults, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!uploadResults) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warn('請先給個評分吧！');
      return;
    }

    setSubmitting(true);

    try {
      const feedbackData = {
        rating,
        comment,
        uploadSummary: uploadResults.summary,
        timestamp: new Date().toISOString()
      };

      // 這裡可以發送到後端API
      console.log('用戶回饋:', feedbackData);
      
      // 模擬API調用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('感謝您的回饋！');
      
      if (onSubmit) {
        onSubmit(feedbackData);
      }
      
      onClose();
      
    } catch (error) {
      console.error('提交回饋失敗:', error);
      toast.error('提交失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FeedbackModal>
      <FeedbackCard>
        <FeedbackTitle>📝 批量上傳體驗如何？</FeedbackTitle>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          fontSize: '12px',
          color: '#666'
        }}>
          剛才上傳了 {uploadResults.summary.total} 張圖片，
          成功 {uploadResults.summary.success} 張，
          成功率 {uploadResults.summary.successRate}%
        </div>

        <RatingSection>
          <RatingLabel>整體滿意度：</RatingLabel>
          <StarRating>
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                active={star <= rating}
                onClick={() => setRating(star)}
              >
                ⭐
              </Star>
            ))}
          </StarRating>
        </RatingSection>

        <CommentSection>
          <CommentLabel>有什麼建議嗎？(可選)</CommentLabel>
          <CommentTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="例如：批量上傳很方便，但希望可以更快一些..."
          />
        </CommentSection>

        <ButtonGroup>
          <FeedbackButton
            className="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            跳過
          </FeedbackButton>
          <FeedbackButton
            className="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '提交回饋'}
          </FeedbackButton>
        </ButtonGroup>
      </FeedbackCard>
    </FeedbackModal>
  );
};

export default BatchUploadFeedback;
