import React, { useRef, useEffect, useState } from 'react';
import '../styles/DiffView.css';

function DiffView({ diffData, viewMode, selectedChangeIndex, filters, onChangeSelect }) {
  const [visibleDiffs, setVisibleDiffs] = useState([]);
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  // 使用 useRef 來追蹤滾動同步狀態，避免觸發重新渲染
  const isScrollingSynced = useRef(false);
  const lastLeftScrollTop = useRef(0);
  const lastRightScrollTop = useRef(0);
  
// 在 DiffView.js 中更新滾動同步邏輯
useEffect(() => {
  // 如果不是並排視圖或沒有數據，則不需要設置滾動同步
  if (viewMode !== 'side-by-side' || !diffData) {
    return;
  }
  
  // 使用一個共享的鎖標記正在進行的同步操作
  let syncingLock = false;
  let syncTimeout = null;
  
  // 更健壯的滾動同步函數
  const syncPanels = (sourcePane, targetPane, sourceId) => {
    if (syncingLock || !sourcePane || !targetPane) return;
    
    // 設置鎖以防止循環
    syncingLock = true;
    clearTimeout(syncTimeout);
    
    try {
      // 計算滾動比例
      const sourceMax = sourcePane.scrollHeight - sourcePane.clientHeight;
      const targetMax = targetPane.scrollHeight - targetPane.clientHeight;
      
      // 防止除以零
      if (sourceMax <= 0 || targetMax <= 0) {
        syncingLock = false;
        return;
      }
      
      const scrollRatio = sourcePane.scrollTop / sourceMax;
      const targetScrollTop = scrollRatio * targetMax;
      
      console.log(`同步從 ${sourceId} 到另一側: 比例=${scrollRatio.toFixed(4)}, 目標=${targetScrollTop.toFixed(2)}px`);
      
      // 設置目標面板的滾動位置
      targetPane.scrollTo({
        top: targetScrollTop,
        behavior: 'auto' // 即時同步
      });
    } catch (err) {
      console.error('滾動同步錯誤:', err);
    }
    
    // 延遲釋放鎖，給瀏覽器時間完成滾動
    syncTimeout = setTimeout(() => {
      syncingLock = false;
    }, 20); // 短暫延遲，但比一個幀長一點
  };
  
  // 左側面板滾動事件處理
  const handleLeftScroll = () => {
    requestAnimationFrame(() => {
      syncPanels(leftPaneRef.current, rightPaneRef.current, 'left');
    });
  };
  
  // 右側面板滾動事件處理
  const handleRightScroll = () => {
    requestAnimationFrame(() => {
      syncPanels(rightPaneRef.current, leftPaneRef.current, 'right');
    });
  };
  
  // 獲取面板引用
  const leftPane = leftPaneRef.current;
  const rightPane = rightPaneRef.current;
  
  // 確認引用有效
  if (!leftPane || !rightPane) {
    console.warn('滾動同步錯誤: 面板引用無效', {leftPane, rightPane});
    return;
  }
  
  // 添加事件監聽器
  leftPane.addEventListener('scroll', handleLeftScroll, { passive: true });
  rightPane.addEventListener('scroll', handleRightScroll, { passive: true });
  
  console.log('滾動事件監聽器已設置', {leftPane, rightPane});
  
  // 清理函數
  return () => {
    clearTimeout(syncTimeout);
    
    if (leftPane) {
      leftPane.removeEventListener('scroll', handleLeftScroll);
    }
    
    if (rightPane) {
      rightPane.removeEventListener('scroll', handleRightScroll);
    }
    
    console.log('滾動事件監聽器已移除');
  };
}, [diffData, viewMode]);
  
  // 當選定的變更索引變化時，根據需要滾動到視圖
  useEffect(() => {
    if (selectedChangeIndex !== null && diffData) {
      const change = diffData.changesSummary[selectedChangeIndex];
      if (change && change.diffIndices && change.diffIndices.length > 0) {
        const diffIndex = change.diffIndices[0];
        
        // 根據當前視圖模式選擇正確的元素ID格式
        let elementId;
        if (viewMode === 'unified') {
          elementId = `diff-unified-${diffIndex}`;
        } else {
          // 在並排視圖中，根據變更類型決定查找左側還是右側元素
          if (change.type === 'DELETED' || 
              (change.type === 'REPLACED' && diffData.diffs[diffIndex].changeType === 'deleted')) {
            elementId = `diff-side-left-${diffIndex}`;
          } else {
            const insertIndex = change.type === 'REPLACED' ? change.diffIndices[1] : diffIndex;
            elementId = `diff-side-right-${insertIndex}`;
          }
        }
        
        const element = document.getElementById(elementId);
        if (element) {
          // 暫時禁用滾動同步，以避免在自動滾動期間觸發同步
          isScrollingSynced.current = true;
          
          // 使用平滑滾動進行導航
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // 滾動完成後恢復滾動同步
          setTimeout(() => {
            isScrollingSynced.current = false;
          }, 500); // 假設滾動動畫大約需要 500ms
        }
      }
    }
  }, [selectedChangeIndex, diffData, viewMode]);
  
  // 視圖切換後的滾動同步
  useEffect(() => {
    // 確保兩個面板初始滾動位置同步
    if (viewMode === 'side-by-side' && leftPaneRef.current && rightPaneRef.current) {
      // 使用 requestAnimationFrame 確保在 DOM 更新後執行
      requestAnimationFrame(() => {
        // 在視圖切換時重設滾動位置到頂部
        leftPaneRef.current.scrollTop = 0;
        rightPaneRef.current.scrollTop = 0;
        
        // 重設上次滾動位置記錄
        lastLeftScrollTop.current = 0;
        lastRightScrollTop.current = 0;
      });
    }
  }, [viewMode]);
  
  // 當過濾條件或差異數據變化時，過濾顯示的差異
  useEffect(() => {
    if (!diffData || !diffData.diffs) return;
    
    // 根據過濾條件篩選差異
    const filtered = diffData.diffs.filter(diff => {
      if (diff.changeType === 'unchanged') return true;
      if (diff.changeType === 'inserted' && !filters.inserted) return false;
      if (diff.changeType === 'deleted' && !filters.deleted) return false;
      
      // 對於替換，我們需要檢查 'replaced' 過濾條件
      // 這需要更複雜的邏輯，但這裡我們採用簡化處理
      return true;
    });
    
    setVisibleDiffs(filtered);
  }, [diffData, filters]);
  
  if (!diffData) return <div className="loading">正在載入差異數據...</div>;
  
  // 在統一視圖中渲染差異
  const renderUnifiedView = () => {
    return (
      <div className="unified-view">
        <div className="diff-pane">
          {visibleDiffs.map((diff, index) => {
            // 確定是否是選定變更的一部分
            const isSelected = selectedChangeIndex !== null && 
                              diffData.changesSummary[selectedChangeIndex] &&
                              diffData.changesSummary[selectedChangeIndex].diffIndices.includes(index);
            
            return (
              <div 
                key={`unified-${index}`} 
                id={`diff-unified-${index}`}
                className={`diff-segment ${diff.changeType} ${isSelected ? 'selected' : ''}`}
              >
                {diff.text}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // 在並排視圖中渲染差異
  const renderSideBySideView = () => {
    // 為左側和右側視圖準備內容
    const leftContent = [];
    const rightContent = [];
    
    visibleDiffs.forEach((diff, index) => {
      // 確定是否是選定變更的一部分
      const isSelected = selectedChangeIndex !== null && 
                        diffData.changesSummary[selectedChangeIndex] &&
                        diffData.changesSummary[selectedChangeIndex].diffIndices.includes(index);
      
      if (diff.changeType === 'unchanged') {
        // 兩邊都添加相同內容
        leftContent.push(
          <div 
            key={`left-unchanged-${index}`} 
            id={`diff-side-left-unchanged-${index}`} 
            className="diff-segment unchanged"
          >
            {diff.text}
          </div>
        );
        
        rightContent.push(
          <div 
            key={`right-unchanged-${index}`} 
            id={`diff-side-right-unchanged-${index}`} 
            className="diff-segment unchanged"
          >
            {diff.text}
          </div>
        );
      } else if (diff.changeType === 'deleted') {
        // 僅在左側添加，標記為刪除
        leftContent.push(
          <div 
            key={`left-deleted-${index}`} 
            id={`diff-side-left-${index}`} 
            className={`diff-segment deleted ${isSelected ? 'selected' : ''}`}
          >
            {diff.text}
          </div>
        );
        
        // 在右側可能需要添加一個空白區域，保持對齊
        if (index < visibleDiffs.length - 1 && 
            visibleDiffs[index + 1].changeType !== 'inserted') {
          rightContent.push(
            <div key={`right-placeholder-${index}`} className="diff-segment placeholder"></div>
          );
        }
      } else if (diff.changeType === 'inserted') {
        // 僅在右側添加，標記為插入
        
        // 在左側可能需要添加一個空白區域，保持對齊
        if (index > 0 && visibleDiffs[index - 1].changeType !== 'deleted') {
          leftContent.push(
            <div key={`left-placeholder-${index}`} className="diff-segment placeholder"></div>
          );
        }
        
        rightContent.push(
          <div 
            key={`right-inserted-${index}`} 
            id={`diff-side-right-${index}`} 
            className={`diff-segment inserted ${isSelected ? 'selected' : ''}`}
          >
            {diff.text}
          </div>
        );
      }
    });
    
    return (
      <div className="side-by-side-view">
        <div className="file-headers">
          <div className="file-header left">
            <div className="file-info">
              <span className="file-name">原始文件</span>
              <span className="file-version">版本 A</span>
            </div>
          </div>
          <div className="file-header right">
            <div className="file-info">
              <span className="file-name">修改後文件</span>
              <span className="file-version">版本 B</span>
            </div>
          </div>
        </div>
        
        <div className="diff-panes-container">
          <div className="diff-pane left" ref={leftPaneRef}>
            {leftContent}
          </div>
          
          <div className="change-indicators">
            {visibleDiffs.map((diff, index) => {
              if (diff.changeType === 'unchanged') return null;
              
              // 根據變更類型確定指示器的位置和顏色
              const indicatorClass = diff.changeType === 'deleted' ? 'delete-indicator' : 'insert-indicator';
              
              return (
                <div 
                  key={`indicator-${index}`}
                  className={`change-indicator ${indicatorClass}`}
                  onClick={() => {
                    // 根據變更類型選擇正確的元素ID
                    const elementId = diff.changeType === 'deleted' 
                      ? `diff-side-left-${index}` 
                      : `diff-side-right-${index}`;
                    
                    // 獲取元素並滾動到視圖中
                    const element = document.getElementById(elementId);
                    if (element) {
                      // 暫時禁用滾動同步
                      isScrollingSynced.current = true;
                      
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      
                      // 找到對應的變更索引
                      const changeIndex = diffData.changesSummary.findIndex(change => 
                        change.diffIndices && change.diffIndices.includes(index)
                      );
                      
                      // 如果找到對應的變更，則選中它
                      if (changeIndex !== -1) {
                        // 使用 setTimeout 確保滾動完成後再更新選擇的變更
                        setTimeout(() => {
                          // 通知父組件更新選中的變更索引
                          if (typeof onChangeSelect === 'function') {
                            onChangeSelect(changeIndex);
                          }
                          
                          // 滾動完成後恢復滾動同步
                          setTimeout(() => {
                            isScrollingSynced.current = false;
                          }, 400);
                        }, 100);
                      } else {
                        // 如果沒有找到對應的變更，仍需要恢復滾動同步
                        setTimeout(() => {
                          isScrollingSynced.current = false;
                        }, 500);
                      }
                    } else {
                      console.warn(`導航錯誤：找不到元素 ${elementId}`);
                    }
                  }}
                ></div>
              );
            })}
          </div>
          
          <div className="diff-pane right" ref={rightPaneRef}>
            {rightContent}
          </div>
        </div>
      </div>
    );
  };
  
  // 渲染文件信息和統計
  const renderFileInfo = () => {
    // 計算統計數據
    const stats = {
      originalSize: diffData.originalText.length,
      modifiedSize: diffData.modifiedText.length,
      insertions: 0,
      deletions: 0,
      changes: 0
    };
    
    // 計算插入和刪除字符數
    diffData.diffs.forEach(diff => {
      if (diff.changeType === 'inserted') {
        stats.insertions += diff.text.length;
      } else if (diff.changeType === 'deleted') {
        stats.deletions += diff.text.length;
      }
    });
    
    stats.changes = diffData.changesSummary.length;
    
    return (
      <div className="file-statistics">
        <div className="stat-item">
          <span className="stat-label">原始文件:</span>
          <span className="stat-value">{stats.originalSize} 字元</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">修改後文件:</span>
          <span className="stat-value">{stats.modifiedSize} 字元</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">新增:</span>
          <span className="stat-value stat-insertions">+{stats.insertions} 字元</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">刪除:</span>
          <span className="stat-value stat-deletions">-{stats.deletions} 字元</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">變更數:</span>
          <span className="stat-value">{stats.changes}</span>
        </div>
      </div>
    );
  };

  // 主要的 return 語句
  return (
    <div className="diff-view-container">
      {renderFileInfo()}
      <div className="diff-content">
        {viewMode === 'unified' ? renderUnifiedView() : renderSideBySideView()}
      </div>
    </div>
  );
}

export default DiffView;