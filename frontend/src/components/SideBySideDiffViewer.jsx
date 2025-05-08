import React, { useRef, useEffect } from 'react';
import './SideBySideDiffViewer.css';

const SideBySideDiffViewer = ({ originalText, modifiedText, diffs, onDiffClick }) => {
  const leftRef = useRef();
  const rightRef = useRef();

  // 同步滾動
  const handleScroll = (side) => (e) => {
    const syncTarget = side === 'left' ? rightRef : leftRef;
    if (syncTarget.current) {
      syncTarget.current.scrollTop = e.target.scrollTop;
    }
  };

  // 分離原始文本和修改後文本為行
  const originalLines = originalText.split('\n');
  const modifiedLines = modifiedText.split('\n');

  // 計算差異行的對應，將字符級別的差異轉換為行級別
  const processedDiffs = [];
  let origIndex = 0;
  let modIndex = 0;

  // 處理每個 diff，將其映射到行
  const computeLineDiffs = () => {
    // 初始化行差異數組
    const lineDiffs = [];
    
    // 構建行對應關係的映射
    let origLineMapping = [];
    let modLineMapping = [];
    let currOrigLine = 0;
    let currModLine = 0;
    
    // 對每個差異進行處理
    for (const diff of diffs) {
      const { operation, text } = diff;
      const lines = text.split('\n');
      
      // 根據操作類型更新行映射
      for (let i = 0; i < lines.length; i++) {
        const isLastLine = i === lines.length - 1;
        
        if (operation === 'EQUAL') {
          origLineMapping.push(currOrigLine);
          modLineMapping.push(currModLine);
          
          if (!isLastLine || text.endsWith('\n')) {
            currOrigLine++;
            currModLine++;
          }
        } else if (operation === 'INSERT') {
          modLineMapping.push(currModLine);
          
          if (!isLastLine || text.endsWith('\n')) {
            currModLine++;
          }
        } else if (operation === 'DELETE') {
          origLineMapping.push(currOrigLine);
          
          if (!isLastLine || text.endsWith('\n')) {
            currOrigLine++;
          }
        }
      }
    }
    
    // 標記每行的差異類型
    for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
      // 檢查原始行在修改後是否存在
      const origLineExists = i < originalLines.length;
      const modLineExists = i < modifiedLines.length;
      
      // 判斷差異類型
      let diffType = 'equal';
      
      if (origLineExists && modLineExists) {
        if (originalLines[i] !== modifiedLines[i]) {
          diffType = 'replaced';
        }
      } else if (origLineExists) {
        diffType = 'deleted';
      } else if (modLineExists) {
        diffType = 'inserted';
      }
      
      // 添加到行差異數組
      lineDiffs.push({
        leftLine: i,
        rightLine: i,
        leftText: origLineExists ? originalLines[i] : '',
        rightText: modLineExists ? modifiedLines[i] : '',
        type: diffType
      });
    }
    
    return lineDiffs;
  };

  const lineDiffs = computeLineDiffs();

  // 渲染左側（原始）面板
  const renderLeftPane = () => {
    return originalLines.map((line, index) => {
      // 找到當前行的差異類型
      const diff = lineDiffs.find(d => d.leftLine === index);
      const diffClass = diff ? diff.type : 'equal';
      
      return (
        <div 
          key={`left-${index}`} 
          id={`line-left-${index}`} 
          className={`diff-line ${diffClass}`}
          onClick={() => onDiffClick && diff && diff.type !== 'equal' && onDiffClick(diff)}
        >
          <span className="line-number">{index + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  // 渲染右側（修改後）面板
  const renderRightPane = () => {
    return modifiedLines.map((line, index) => {
      // 找到當前行的差異類型
      const diff = lineDiffs.find(d => d.rightLine === index);
      const diffClass = diff ? diff.type : 'equal';
      
      return (
        <div 
          key={`right-${index}`} 
          id={`line-right-${index}`} 
          className={`diff-line ${diffClass}`}
          onClick={() => onDiffClick && diff && diff.type !== 'equal' && onDiffClick(diff)}
        >
          <span className="line-number">{index + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="side-by-side-diff">
      <div 
        className="diff-viewer-pane left" 
        ref={leftRef} 
        onScroll={handleScroll('left')}
      >
        <div className="pane-header">原始文件</div>
        <div className="pane-content">
          {renderLeftPane()}
        </div>
      </div>
      <div 
        className="diff-viewer-pane right" 
        ref={rightRef} 
        onScroll={handleScroll('right')}
      >
        <div className="pane-header">修改後文件</div>
        <div className="pane-content">
          {renderRightPane()}
        </div>
      </div>
    </div>
  );
};

export default SideBySideDiffViewer; 