import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dataSyncManager from '../utils/dataSync';

const useBehaviorTracking = () => {
  const { isAuthenticated } = useAuth();

  const trackBehavior = useCallback(async (behaviorData) => {
    if (!isAuthenticated) return;

    try {
      // 添加時間戳和會話信息
      const enrichedBehavior = {
        ...behaviorData,
        context: {
          ...behaviorData.context,
          timestamp: new Date().toISOString(),
          sessionId: sessionStorage.getItem('sessionId') || generateSessionId(),
          page: window.location.pathname
        }
      };

      // 如果在線，直接發送；否則加入同步隊列
      if (navigator.onLine) {
        const response = await fetch('/api/learning/behavior', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(enrichedBehavior)
        });

        if (!response.ok) {
          throw new Error('記錄行為失敗');
        }
      } else {
        // 離線時加入同步隊列
        dataSyncManager.addToSyncQueue({
          type: 'RECORD_BEHAVIOR',
          data: enrichedBehavior
        });
      }

    } catch (error) {
      console.error('行為追蹤錯誤:', error);
      
      // 失敗時也加入同步隊列
      dataSyncManager.addToSyncQueue({
        type: 'RECORD_BEHAVIOR',
        data: behaviorData
      });
    }
  }, [isAuthenticated]);

  // 便捷方法
  const trackView = useCallback((targetType, targetId, metadata = {}) => {
    trackBehavior({
      action: targetType === 'clothing' ? 'view_clothing' : 'view_outfit',
      targetType,
      targetId,
      metadata
    });
  }, [trackBehavior]);

  const trackLike = useCallback((targetId, outfitItems = null, metadata = {}) => {
    trackBehavior({
      action: 'like_outfit',
      targetType: 'outfit',
      targetId,
      metadata: {
        ...metadata,
        outfitItems
      }
    });
  }, [trackBehavior]);

  const trackDislike = useCallback((targetId, outfitItems = null, reason = '', metadata = {}) => {
    trackBehavior({
      action: 'dislike_outfit',
      targetType: 'outfit',
      targetId,
      metadata: {
        ...metadata,
        outfitItems,
        reason
      }
    });
  }, [trackBehavior]);

  const trackWear = useCallback((clothingId, metadata = {}) => {
    trackBehavior({
      action: 'wear_clothing',
      targetType: 'clothing',
      targetId: clothingId,
      metadata
    });
  }, [trackBehavior]);

  const trackSave = useCallback((outfitItems, outfitName = '', metadata = {}) => {
    trackBehavior({
      action: 'save_outfit',
      targetType: 'outfit',
      metadata: {
        ...metadata,
        outfitItems,
        outfitName
      }
    });
  }, [trackBehavior]);

  const trackSearch = useCallback((searchQuery, results = [], metadata = {}) => {
    trackBehavior({
      action: 'search_clothing',
      targetType: 'search',
      metadata: {
        ...metadata,
        searchQuery,
        resultCount: results.length
      }
    });
  }, [trackBehavior]);

  const trackFilter = useCallback((filterCriteria, results = [], metadata = {}) => {
    trackBehavior({
      action: 'filter_clothing',
      targetType: 'filter',
      metadata: {
        ...metadata,
        filterCriteria,
        resultCount: results.length
      }
    });
  }, [trackBehavior]);

  const trackRecommendationAction = useCallback((action, recommendationId, outfitItems = [], metadata = {}) => {
    const actionMap = {
      accept: 'accept_recommendation',
      reject: 'reject_recommendation'
    };

    trackBehavior({
      action: actionMap[action] || action,
      targetType: 'recommendation',
      targetId: recommendationId,
      metadata: {
        ...metadata,
        outfitItems
      }
    });
  }, [trackBehavior]);

  const trackTimeSpent = useCallback((targetType, targetId, startTime, metadata = {}) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    trackBehavior({
      action: 'view_clothing',
      targetType,
      targetId,
      metadata: {
        ...metadata,
        timeSpent
      }
    });
  }, [trackBehavior]);

  return {
    trackBehavior,
    trackView,
    trackLike,
    trackDislike,
    trackWear,
    trackSave,
    trackSearch,
    trackFilter,
    trackRecommendationAction,
    trackTimeSpent
  };
};

// 生成會話ID
const generateSessionId = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};

export default useBehaviorTracking;