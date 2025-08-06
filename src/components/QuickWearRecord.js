import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const QuickRecordContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const QuickButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: #218838;
    transform: scale(1.1);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin-bottom: 20px;
  text-align: center;
`;

const ClothingList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const ClothingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.selected {
    background: #e3f2fd;
    border-color: #007bff;
  }
`;

const ClothingImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
`;

const ClothingInfo = styled.div`
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &.primary {
    background: #007bff;
    color: white;
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
  }
`;

const QuickWearRecord = ({ clothes, onRecord }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [recording, setRecording] = useState(false);

  const handleClothingSelect = (clothingId) => {
    setSelectedClothes(prev => 
      prev.includes(clothingId) 
        ? prev.filter(id => id !== clothingId)
        : [...prev, clothingId]
    );
  };

  const handleRecord = async () => {
    if (selectedClothes.length === 0) {
      toast.warn('請選擇要記錄的衣物');
      return;
    }

    setRecording(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clothes/batch-wear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clothingIds: selectedClothes })
      });

      if (!response.ok) throw new Error('記錄失敗');

      const result = await response.json();
      toast.success(`已記錄 ${result.updatedCount} 件衣物的穿著`);
      
      setShowModal(false);
      setSelectedClothes([]);
      onRecord && onRecord();
      
    } catch (error) {
      toast.error('記錄失敗，請重試');
    } finally {
      setRecording(false);
    }
  };

  return (
    <>
      <QuickRecordContainer>
        <QuickButton onClick={() => setShowModal(true)}>
          👕
        </QuickButton>
      </QuickRecordContainer>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>📝 快速記錄穿著</ModalTitle>
            
            <ClothingList>
              {clothes.map(clothing => (
                <ClothingItem
                  key={clothing._id}
                  className={selectedClothes.includes(clothing._id) ? 'selected' : ''}
                  onClick={() => handleClothingSelect(clothing._id)}
                >
                  <ClothingImage 
                    src={`http://localhost:5000${clothing.imageUrl}`}
                    alt={clothing.subCategory}
                    onError={e => e.target.style.display = 'none'}
                  />
                  <ClothingInfo>
                    <div>{clothing.subCategory}</div>
                    <small>{clothing.category}</small>
                  </ClothingInfo>
                  {selectedClothes.includes(clothing._id) && <span>✅</span>}
                </ClothingItem>
              ))}
            </ClothingList>

            <ActionButtons>
              <Button 
                className="primary" 
                onClick={handleRecord}
                disabled={recording}
              >
                {recording ? '記錄中...' : `記錄 ${selectedClothes.length} 件`}
              </Button>
              <Button 
                className="secondary" 
                onClick={() => setShowModal(false)}
              >
                取消
              </Button>
            </ActionButtons>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default QuickWearRecord;