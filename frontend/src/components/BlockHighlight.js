import React, { useState } from 'react';
import '../styles/BlockHighlight.css';

function BlockHighlight({ id, text, changeType, isSelected, onBlockSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 確定樣式類別
  let blockClass = 'block-highlight';
  
  if (changeType === 'inserted') blockClass += ' inserted';
  else if (changeType === 'deleted') blockClass += ' deleted';
  else if (changeType === 'unchanged') blockClass += ' unchanged';
  
  if (isSelected) blockClass += ' selected';
  if (isHovered) blockClass += ' hovered';
  
  // 處理區塊點擊
  const handleBlockClick = () => {
    if (onBlockSelect && changeType !== 'unchanged') {
      onBlockSelect(id);
    }
  };
  
  // 對於較長的文本，實現文本截斷顯示
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // 獲取變更類型的顯示文本
  const getChangeTypeDisplay = () => {
    if (changeType === 'inserted') return '新增';
    if (changeType === 'deleted') return '刪除';
    return '';
  };

  return (
    <div 
      id={id}
      className={blockClass}
      onMouseEnter={() => changeType !== 'unchanged' && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBlockClick}
    >
      <div className="block-content">
        {text}
      </div>
      
      {/* 只有當懸停且不是未變更內容時才顯示工具提示 */}
      {isHovered && changeType !== 'unchanged' && (
        <div className="block-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-type">{getChangeTypeDisplay()}</span>
            <span className="tooltip-chars">{text.length} 字元</span>
          </div>
          
          <div className="tooltip-content">
            <p>{truncateText(text)}</p>
          </div>
          
          {/* 可以在這裡添加更多操作按鈕，如複製、接受變更等 */}
        </div>
      )}
    </div>
  );
}

export default BlockHighlight;