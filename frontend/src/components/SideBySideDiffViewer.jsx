import React, { useRef, useEffect } from 'react';
import './SideBySideDiffViewer.css';

const SideBySideDiffViewer = ({ originalText, modifiedText, diffs, onDiffClick }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const syncRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);

  // 中央捲軸滾動時，同步左右
  const handleCentralScroll = (e) => {
    const top = e.target.scrollTop;
    if (leftContentRef.current) leftContentRef.current.style.transform = `translateY(-${top}px)`;
    if (rightContentRef.current) rightContentRef.current.style.transform = `translateY(-${top}px)`;
  };

  // 讓中間的空白容器高度跟內容一樣
  useEffect(() => {
    if (syncRef.current && leftRef.current) {
      const h = Math.max(
        leftRef.current.querySelector('.pane-content').scrollHeight,
        rightRef.current.querySelector('.pane-content').scrollHeight
      );
      syncRef.current.innerHTML = `<div style="height:${h}px"></div>`;
    }
  }, [originalText, modifiedText]);

  // 左右面板高度變化時也更新中央捲軸高度
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (syncRef.current && leftRef.current) {
        const h = Math.max(
          leftRef.current.querySelector('.pane-content').scrollHeight,
          rightRef.current.querySelector('.pane-content').scrollHeight
        );
        syncRef.current.innerHTML = `<div style="height:${h}px"></div>`;
      }
    });
    
    if (leftRef.current) {
      resizeObserver.observe(leftRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 切行
  const originalLines = originalText.split('\n');
  const modifiedLines = modifiedText.split('\n');

  // 字元級 diffs 轉行級
  const computeLineDiffs = () => {
    const lineDiffs = [];
    for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
      let type = 'equal';
      const origExists = i < originalLines.length;
      const modExists  = i < modifiedLines.length;
      if (origExists && modExists) {
        if (originalLines[i] !== modifiedLines[i]) type = 'replaced';
      } else if (origExists) {
        type = 'deleted';
      } else {
        type = 'inserted';
      }
      lineDiffs.push({
        leftLine:  i,
        rightLine: i,
        leftText:  origExists ? originalLines[i] : '',
        rightText: modExists  ? modifiedLines[i] : '',
        type
      });
    }
    return lineDiffs;
  };
  const lineDiffs = computeLineDiffs();

  // 左側內容
  const renderLeftPane = () =>
    originalLines.map((line, idx) => {
      const diff = lineDiffs.find(d => d.leftLine === idx);
      const cls  = diff ? diff.type : 'equal';
      return (
        <div
          key={`L${idx}`}
          className={`diff-line ${cls}`}
          onClick={() => diff && diff.type !== 'equal' && onDiffClick && onDiffClick(diff)}
        >
          <span className="line-number">{idx + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });

  // 右側內容
  const renderRightPane = () =>
    modifiedLines.map((line, idx) => {
      const diff = lineDiffs.find(d => d.rightLine === idx);
      const cls  = diff ? diff.type : 'equal';
      return (
        <div
          key={`R${idx}`}
          className={`diff-line ${cls}`}
          onClick={() => diff && diff.type !== 'equal' && onDiffClick && onDiffClick(diff)}
        >
          <span className="line-number">{idx + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });

  return (
    <div className="side-by-side-diff" style={{ display: 'flex' }}>
      {/* 左側：隱藏本身捲軸 */}
      <div
        className="diff-viewer-pane left"
        ref={leftRef}
        style={{ overflow: 'hidden', flex: 1 }}
      >
        <div className="pane-header">原始文件</div>
        <div className="pane-content" style={{ overflow: 'hidden', position: 'relative' }}>
          <div ref={leftContentRef} style={{ position: 'absolute', width: '100%' }}>
            {renderLeftPane()}
          </div>
        </div>
      </div>

      {/* 中央唯一捲軸 */}
      <div
        className="sync-scroll"
        ref={syncRef}
        onScroll={handleCentralScroll}
        style={{ width: '16px', overflowY: 'scroll', marginTop: '30px' }}
      />

      {/* 右側：隱藏本身捲軸 */}
      <div
        className="diff-viewer-pane right"
        ref={rightRef}
        style={{ overflow: 'hidden', flex: 1 }}
      >
        <div className="pane-header">修改後文件</div>
        <div className="pane-content" style={{ overflow: 'hidden', position: 'relative' }}>
          <div ref={rightContentRef} style={{ position: 'absolute', width: '100%' }}>
            {renderRightPane()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBySideDiffViewer;
