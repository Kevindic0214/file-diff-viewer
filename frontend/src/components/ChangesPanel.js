import React, { useState } from 'react';
import '../styles/ChangesPanel.css';

function ChangesPanel({ changes, selectedIndex, onChangeSelect, filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // 根據過濾條件篩選變更
  const filteredChanges = changes.filter(change => {
    if (change.type === 'INSERTED' && !filters.inserted) return false;
    if (change.type === 'DELETED' && !filters.deleted) return false;
    if (change.type === 'REPLACED' && !filters.replaced) return false;
    return true;
  });

  // 處理過濾狀態變化
  const handleFilterToggle = (filterType) => {
    onFilterChange(filterType, !filters[filterType]);
  };
  
  // 處理面板展開/收起
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };
  
  // 處理在詳細信息中顯示變更
  const handleChangeClick = (index) => {
    onChangeSelect(index);
  };

  return (
    <div className={`changes-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={togglePanel}>
        <h3>變更摘要</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <>
          <div className="filter-controls">
            <div className="filter-title">過濾器</div>
            <div className="filter-options">
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.inserted} 
                  onChange={() => handleFilterToggle('inserted')}
                />
                <span className="filter-label">新增</span>
              </label>
              
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.deleted} 
                  onChange={() => handleFilterToggle('deleted')}
                />
                <span className="filter-label">刪除</span>
              </label>
              
              <label className="filter-option">
                <input 
                  type="checkbox" 
                  checked={filters.replaced} 
                  onChange={() => handleFilterToggle('replaced')}
                />
                <span className="filter-label">替換</span>
              </label>
            </div>
          </div>
          
          <div className="changes-list">
            {filteredChanges.length > 0 ? (
              filteredChanges.map((change, index) => {
                // 確定變更類型的樣式類名
                let changeTypeClass = '';
                if (change.type === 'INSERTED') changeTypeClass = 'inserted';
                else if (change.type === 'DELETED') changeTypeClass = 'deleted';
                else if (change.type === 'REPLACED') changeTypeClass = 'replaced';
                
                // 計算字符差異顯示
                const charDiffDisplay = change.charDiff > 0 
                  ? `+${change.charDiff}` 
                  : change.charDiff;
                
                return (
                  <div 
                    id={`change-summary-${index}`}
                    key={index} 
                    className={`change-item ${changeTypeClass} ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleChangeClick(index)}
                  >
                    <div className="change-header">
                      <span className="change-number">{index + 1}.</span>
                      <span className="change-type">{change.type}</span>
                      <span className={`char-diff ${change.charDiff >= 0 ? 'positive' : 'negative'}`}>
                        {charDiffDisplay}
                      </span>
                    </div>
                    
                    <div className="change-content">
                      {/* 舊內容（如果有） */}
                      {change.oldContent && (
                        <div className="old-content">
                          <div className="content-text">{change.oldContent}</div>
                        </div>
                      )}
                      
                      {/* 新內容（如果有） */}
                      {change.newContent && (
                        <div className="new-content">
                          <div className="content-text">{change.newContent}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-changes">
                沒有符合過濾條件的變更
              </div>
            )}
          </div>
          
          <div className="panel-footer">
            <div className="total-changes">
              共 {filteredChanges.length} 個變更
              {filteredChanges.length !== changes.length && (
                <span> (已過濾, 總計 {changes.length})</span>
              )}
            </div>
            <div className="panel-actions">
              <button 
                className="details-button"
                onClick={() => {/* 實現變更詳情功能 */}}
              >
                詳細資訊
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChangesPanel;