// src/components/DiffDetails.jsx
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

  // 比較兩個字串，找出不同的部分
  const findDifference = (oldText, newText) => {
    if (!oldText || !newText) return { old: oldText || '', new: newText || '' };
    
    // 找到共同前綴的結束位置
    let prefixEnd = 0;
    while (prefixEnd < oldText.length && prefixEnd < newText.length && 
           oldText[prefixEnd] === newText[prefixEnd]) {
      prefixEnd++;
    }
    
    // 找到共同後綴的開始位置
    let oldSuffixStart = oldText.length;
    let newSuffixStart = newText.length;
    
    while (oldSuffixStart > prefixEnd && newSuffixStart > prefixEnd &&
           oldText[oldSuffixStart - 1] === newText[newSuffixStart - 1]) {
      oldSuffixStart--;
      newSuffixStart--;
    }
    
    // 提取差異部分
    const oldDiff = oldText.substring(prefixEnd, oldSuffixStart);
    const newDiff = newText.substring(prefixEnd, newSuffixStart);
    
    return {
      old: oldDiff || '<無變更>',
      new: newDiff || '<無變更>'
    };
  };

  // 獲取差異項目的顯示內容
  const getDiffContent = (diff) => {
    if (diff.type === 'replaced') {
      const difference = findDifference(diff.leftText, diff.rightText);
      return (
        <>
          <div className="diff-content old">
            <span className="highlight">{difference.old}</span>
          </div>
          <div className="diff-arrow">→</div>
          <div className="diff-content new">
            <span className="highlight">{difference.new}</span>
          </div>
        </>
      );
    }
    
    if (diff.type === 'deleted') {
      return (
        <div className="diff-content old">
          <span className="highlight">{diff.leftText || '<空白>'}</span>
        </div>
      );
    }
    
    if (diff.type === 'inserted') {
      return (
        <div className="diff-content new">
          <span className="highlight">{diff.rightText || '<空白>'}</span>
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