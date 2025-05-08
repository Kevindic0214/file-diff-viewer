import React from 'react';

const DiffDetails = ({ lineDiffs, onDiffClick }) => {
  // 過濾非相等的差異行
  const significantDiffs = lineDiffs.filter(diff => diff.type !== 'equal');

  // 如果沒有顯著差異，顯示提示
  if (significantDiffs.length === 0) {
    return (
      <div className="diff-details">
        <div className="no-diffs">沒有發現差異</div>
      </div>
    );
  }

  // 獲取差異類型的中文說明
  const getTypeLabel = (type) => {
    switch (type) {
      case 'replaced': return '取代';
      case 'deleted': return '刪除';
      case 'inserted': return '新增';
      default: return '未知';
    }
  };

  // 獲取差異項目的顯示內容
  const getDiffContent = (diff) => {
    if (diff.type === 'replaced') {
      return (
        <>
          <div className="diff-content old">
            {diff.leftText || '<空白>'}
          </div>
          <div className="diff-arrow">→</div>
          <div className="diff-content new">
            {diff.rightText || '<空白>'}
          </div>
        </>
      );
    }
    
    if (diff.type === 'deleted') {
      return (
        <div className="diff-content old">
          {diff.leftText || '<空白>'}
        </div>
      );
    }
    
    if (diff.type === 'inserted') {
      return (
        <div className="diff-content new">
          {diff.rightText || '<空白>'}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="diff-details">
      <div className="diff-details-header">變更列表 ({significantDiffs.length})</div>
      {significantDiffs.map((diff, index) => (
        <div
          key={index}
          className={`diff-details-item ${diff.type}`}
          onClick={() => onDiffClick(diff)}
        >
          <div className="diff-details-item-header">
            {index + 1}. {getTypeLabel(diff.type)}
          </div>
          <div className="diff-details-item-content">
            {getDiffContent(diff)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiffDetails; 