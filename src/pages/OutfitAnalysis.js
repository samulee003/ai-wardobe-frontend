import React, { useState } from 'react';
import api from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OutfitAnalysis() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        setImagePreview(dataUrl);
        const base64 = String(dataUrl).split(',')[1] || '';
        if (!base64) {
          setError('讀取圖片失敗，請重試');
          return;
        }
        setIsLoading(true);
        const { data } = await api.analyzeOutfit(base64);
        setResult(data.analysis);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || '分析失敗');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => setError('讀取圖片失敗');
    reader.readAsDataURL(file);
  };

  return (
    <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>整套穿搭分析</h2>
      <p style={{ marginBottom: 16 }}>上傳一張包含您當下穿搭的全身照片，系統將分析整體風格與各單品。</p>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ marginBottom: 12 }}
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="preview"
          style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 8, marginBottom: 12 }}
        />
      )}

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LoadingSpinner />
          <span>分析中，請稍候...</span>
        </div>
      )}

      {error && (
        <div style={{ color: '#EF4444', marginTop: 8 }}>{error}</div>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>分析結果</h3>
          <div style={{ marginBottom: 8 }}>
            <strong>整體風格：</strong>{result.outfitStyle || '未知'}
            {typeof result.styleConfidence === 'number' && (
              <span>（信心 {Math.round(result.styleConfidence * 100)}%）</span>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>顏色：</strong>{(result.globalColors || []).join('、') || '—'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>季節：</strong>{(result.season || []).join('、') || '—'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>場合：</strong>{result.occasion || '—'}
          </div>

          <h4 style={{ margin: '12px 0 8px' }}>單品解析</h4>
          {(result.items || []).length === 0 && <div>未偵測到明顯單品</div>}
          {(result.items || []).map((it, idx) => (
            <div key={idx} style={{ padding: 12, border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 8 }}>
              <div><strong>角色：</strong>{it.role || '—'}</div>
              <div><strong>類別：</strong>{it.category || '—'} / {it.subCategory || '—'}</div>
              <div><strong>顏色：</strong>{(it.colors || []).join('、') || '—'}</div>
              {it.material && <div><strong>材質：</strong>{it.material}</div>}
              {(it.patterns && it.patterns.length > 0) && (
                <div><strong>圖案：</strong>{it.patterns.join('、')}</div>
              )}
              {typeof it.confidence === 'number' && (
                <div><strong>信心：</strong>{Math.round(it.confidence * 100)}%</div>
              )}
            </div>
          ))}

          {(result.suggestions || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ marginBottom: 8 }}>建議</h4>
              <ul style={{ paddingLeft: 18 }}>
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


