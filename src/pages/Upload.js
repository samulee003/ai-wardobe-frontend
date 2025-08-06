import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ImageUpload from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 20px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 600;
`;

const ConfirmationSection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ConfirmationTitle = styled.h3`
  color: #333;
  margin-bottom: 20px;
`;

const EditableField = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FieldLabel = styled.label`
  font-weight: 600;
  color: #333;
  min-width: 80px;
`;

const FieldInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FieldSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ColorTags = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const ColorTag = styled.span`
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 12px;
  color: #495057;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Upload = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedClothing, setUploadedClothing] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 檢查登錄狀態
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登錄');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleUploadSuccess = (clothing) => {
    setUploadedClothing(clothing);
    setCurrentStep(2);
  };

  const handleAnalysisComplete = (analysis) => {
    setAnalysisResult(analysis);
    setEditedData({
      category: analysis.category,
      subCategory: analysis.subCategory,
      colors: analysis.colors,
      style: analysis.style,
      season: analysis.season,
      condition: analysis.condition || '良好',
      notes: ''
    });
  };

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    if (!uploadedClothing) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${uploadedClothing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedData)
      });

      if (!response.ok) {
        throw new Error('保存失敗');
      }

      toast.success('衣物信息已保存！');
      navigate('/wardrobe');
      
    } catch (error) {
      console.error('保存錯誤:', error);
      toast.error('保存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setCurrentStep(1);
    setUploadedClothing(null);
    setAnalysisResult(null);
    setEditedData({});
  };

  const handleReanalyze = async () => {
    if (!uploadedClothing) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clothes/${uploadedClothing._id}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('重新分析失敗');
      }

      const result = await response.json();
      setAnalysisResult(result.aiAnalysis);
      setEditedData({
        category: result.aiAnalysis.category,
        subCategory: result.aiAnalysis.subCategory,
        colors: result.aiAnalysis.colors,
        style: result.aiAnalysis.style,
        season: result.aiAnalysis.season,
        condition: result.aiAnalysis.condition || '良好',
        notes: ''
      });

      toast.success('重新分析完成！');
      
    } catch (error) {
      console.error('重新分析錯誤:', error);
      toast.error('重新分析失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <Title>📷 上傳衣物</Title>
      <Subtitle>拍照上傳你的衣物，AI會自動識別和分類</Subtitle>

      <StepIndicator>
        <Step active={currentStep === 1}>
          📸 1. 拍照上傳
        </Step>
        <Step active={currentStep === 2}>
          ✏️ 2. 確認信息
        </Step>
        <Step active={currentStep === 3}>
          ✅ 3. 完成
        </Step>
      </StepIndicator>

      {currentStep === 1 && (
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {currentStep === 2 && analysisResult && (
        <ConfirmationSection>
          <ConfirmationTitle>
            🔍 請確認AI識別結果 
            {analysisResult.confidence < 0.6 && (
              <span style={{color: '#dc3545', fontSize: '14px', fontWeight: 'bold'}}>
                ⚠️ (信心度較低，請仔細檢查所有項目)
              </span>
            )}
            {analysisResult.confidence >= 0.6 && analysisResult.confidence < 0.8 && (
              <span style={{color: '#ffc107', fontSize: '14px'}}>
                ⚡ (建議檢查關鍵項目)
              </span>
            )}
            {analysisResult.confidence >= 0.8 && (
              <span style={{color: '#28a745', fontSize: '14px'}}>
                ✅ (識別信心度高)
              </span>
            )}
          </ConfirmationTitle>

          <EditableField>
            <FieldLabel>類別:</FieldLabel>
            <FieldSelect
              value={editedData.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
            >
              <option value="上衣">上衣</option>
              <option value="下裝">下裝</option>
              <option value="外套">外套</option>
              <option value="鞋子">鞋子</option>
              <option value="配件">配件</option>
              <option value="內衣">內衣</option>
              <option value="運動服">運動服</option>
              <option value="正裝">正裝</option>
            </FieldSelect>
          </EditableField>

          <EditableField>
            <FieldLabel>子類別:</FieldLabel>
            <FieldInput
              value={editedData.subCategory}
              onChange={(e) => handleFieldChange('subCategory', e.target.value)}
              placeholder="如: T恤、襯衫、牛仔褲等"
            />
          </EditableField>

          <EditableField>
            <FieldLabel>顏色:</FieldLabel>
            <ColorTags>
              {editedData.colors?.map((color, index) => (
                <ColorTag key={index}>{color}</ColorTag>
              ))}
            </ColorTags>
          </EditableField>

          <EditableField>
            <FieldLabel>風格:</FieldLabel>
            <FieldSelect
              value={editedData.style}
              onChange={(e) => handleFieldChange('style', e.target.value)}
            >
              <option value="休閒">休閒</option>
              <option value="正式">正式</option>
              <option value="運動">運動</option>
              <option value="時尚">時尚</option>
              <option value="復古">復古</option>
              <option value="簡約">簡約</option>
              <option value="街頭">街頭</option>
            </FieldSelect>
          </EditableField>

          <EditableField>
            <FieldLabel>狀況:</FieldLabel>
            <FieldSelect
              value={editedData.condition}
              onChange={(e) => handleFieldChange('condition', e.target.value)}
            >
              <option value="全新">全新</option>
              <option value="良好">良好</option>
              <option value="普通">普通</option>
              <option value="需淘汰">需淘汰</option>
            </FieldSelect>
          </EditableField>

          <EditableField>
            <FieldLabel>備註:</FieldLabel>
            <FieldInput
              value={editedData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="可選的備註信息"
            />
          </EditableField>

          <ActionButtons>
            <Button
              className="primary"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? '保存中...' : '✅ 確認保存'}
            </Button>
            {analysisResult.confidence < 0.7 && (
              <Button
                className="secondary"
                onClick={handleReanalyze}
                disabled={saving}
                style={{background: '#17a2b8'}}
              >
                {saving ? '分析中...' : '🤖 重新分析'}
              </Button>
            )}
            <Button
              className="secondary"
              onClick={handleRetake}
            >
              🔄 重新拍照
            </Button>
          </ActionButtons>
        </ConfirmationSection>
      )}
    </Container>
  );
};

export default Upload;