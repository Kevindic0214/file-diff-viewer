import React, { useRef, useEffect, useState } from 'react';
import '../styles/DiffView.css';

function DiffView({ diffData, viewMode, selectedChangeIndex, filters }) {
  const [visibleDiffs, setVisibleDiffs] = useState([]);
  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  
  // 處理滾動同步
  useEffect(() => {
    const handleLeftScroll = () => {
      if (rightPaneRef.current && leftPaneRef.current) {
        rightPaneRef.current.scrollTop = leftPaneRef.current.scrollTop;
      }
    };
    
    const handleRightScroll = () => {
      if (leftPaneRef.current && rightPaneRef.current) {
        leftPaneRef.current.scrollTop = rightPaneRef.current.scrollTop;
      }
    };
    
    const leftPane = leftPaneRef.current;
    const rightPane = rightPaneRef.current;
    
    if (leftPane) {
      leftPane.addEventListener('scroll', handleLeftScroll);
    }
    
    if (rightPane) {
      rightPane.addEventListener('scroll', handleRightScroll);
    }
    
    return () => {
      if (leftPane) {
        leftPane.removeEventListener('scroll', handleLeftScroll);
      }
      
      if (rightPane) {
        rightPane.removeEventListener('scroll', handleRightScroll);
      }
    };
  }, [diffData]);
  
  // 當選定的變更索引變化時，根據需要滾動到視圖
  useEffect(() => {
    if (selectedChangeIndex !== null) {
      // 找出選定變更對應的差異區塊
      const selectedDiff = diffData.diffs.find(
        diff => diff.id === `change-${selectedChangeIndex}`
      );
      
      if (selectedDiff) {
        const element = document.getElementById(selectedDiff.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedChangeIndex, diffData]);
  
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
            const { id, text, changeType } = diff;
            
            return (
              <div 
                key={id} 
                id={id}
                className={`diff-segment ${changeType} ${
                  selectedChangeIndex !== null && 
                  id === `change-${selectedChangeIndex}` ? 'selected' : ''
                }`}
              >
                {text}
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
      const { id, text, changeType } = diff;
      const isSelected = selectedChangeIndex !== null && 
                         id === `change-${selectedChangeIndex}`;
      
      if (changeType === 'unchanged') {
        // 兩邊都添加相同內容
        leftContent.push(
          <div key={`left-${id}`} id={`left-${id}`} className="diff-segment unchanged">
            {text}
          </div>
        );
        
        rightContent.push(
          <div key={`right-${id}`} id={`right-${id}`} className="diff-segment unchanged">
            {text}
          </div>
        );
      } else if (changeType === 'deleted') {
        // 僅在左側添加，標記為刪除
        leftContent.push(
          <div 
            key={`left-${id}`} 
            id={id} 
            className={`diff-segment deleted ${isSelected ? 'selected' : ''}`}
          >
            {text}
          </div>
        );
        
        // 在右側可能需要添加一個空白區域，保持對齊
        if (index < visibleDiffs.length - 1 && 
            visibleDiffs[index + 1].changeType !== 'inserted') {
          rightContent.push(
            <div key={`right-${id}`} className="diff-segment placeholder"></div>
          );
        }
      } else if (changeType === 'inserted') {
        // 僅在右側添加，標記為插入
        
        // 在左側可能需要添加一個空白區域，保持對齊
        if (index > 0 && visibleDiffs[index - 1].changeType !== 'deleted') {
          leftContent.push(
            <div key={`left-${id}`} className="diff-segment placeholder"></div>
          );
        }
        
        rightContent.push(
          <div 
            key={`right-${id}`} 
            id={id} 
            className={`diff-segment inserted ${isSelected ? 'selected' : ''}`}
          >
            {text}
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
                  key={`indicator-${diff.id}`}
                  className={`change-indicator ${indicatorClass}`}
                  onClick={() => {
                    const element = document.getElementById(diff.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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