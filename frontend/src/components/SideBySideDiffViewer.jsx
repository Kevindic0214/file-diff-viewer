// src/components/SideBySideDiffViewer.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useState
} from 'react';
import './SideBySideDiffViewer.css';

const SideBySideDiffViewer = forwardRef((
  { originalText, modifiedText, onDiffClick, selectedDiff },
  ref
) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const syncRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);
  const [scrolling, setScrolling] = useState(false);

  // 同步捲軸到左右
  const handleCentralScroll = (e) => {
    const top = e.target.scrollTop;
    if (leftContentRef.current) leftContentRef.current.style.transform = `translateY(-${top}px)`;
    if (rightContentRef.current) rightContentRef.current.style.transform = `translateY(-${top}px)`;
  };

  // VS Code 風格的滾輪攔截
  const handleMouseWheel = useCallback((e) => {
    if (!syncRef.current) return;
    e.preventDefault();
    const delta = e.deltaY || e.detail || e.wheelDelta;
    syncRef.current.scrollTop = syncRef.current.scrollTop + delta;
    if (!scrolling) {
      setScrolling(true);
      setTimeout(() => setScrolling(false), 150);
    }
  }, [scrolling]);

  // 核心滾動方法：透過中間 syncRef 來移動視圖
  const scrollToDiff = useCallback((diff) => {
    if (!diff || !syncRef.current) return;
    const targetLine = diff.type === 'inserted' ? diff.rightLine : diff.leftLine;
    const lineHeight = 24; // 若變更，請同步 CSS
    const scrollPosition = Math.max(0, targetLine * lineHeight - 100);
    syncRef.current.scrollTop = scrollPosition;
  }, []);

  // 暴露 scrollToDiff 給父元件
  useImperativeHandle(ref, () => ({
    scrollToDiff
  }), [scrollToDiff]);

  // 中央空白容器的高度與內容同步
  useEffect(() => {
    if (syncRef.current && leftRef.current) {
      const h = Math.max(
        leftRef.current.querySelector('.pane-content').scrollHeight,
        rightRef.current.querySelector('.pane-content').scrollHeight
      );
      syncRef.current.innerHTML = `<div style="height:${h}px"></div>`;
    }
  }, [originalText, modifiedText]);

  // 偵聽整個容器的滾輪事件
  useEffect(() => {
    const container = document.querySelector('.side-by-side-diff');
    if (container) {
      container.addEventListener('wheel', handleMouseWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleMouseWheel);
    }
  }, [handleMouseWheel]);

  // 偵聽面板尺寸變化，同步高度
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (syncRef.current && leftRef.current) {
        const h = Math.max(
          leftRef.current.querySelector('.pane-content').scrollHeight,
          rightRef.current.querySelector('.pane-content').scrollHeight
        );
        syncRef.current.innerHTML = `<div style="height:${h}px"></div>`;
      }
    });
    if (leftRef.current) ro.observe(leftRef.current);
    return () => ro.disconnect();
  }, []);

  // 當 selectedDiff 改變時，自動滾動
  useEffect(() => {
    if (selectedDiff) {
      scrollToDiff(selectedDiff);
    }
  }, [selectedDiff, scrollToDiff]);

  // 切成行陣列
  const originalLines = originalText.split('\n');
  const modifiedLines = modifiedText.split('\n');

  // 行級 diffs 計算（原始邏輯保留）
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

  // 左側內容渲染
  const renderLeftPane = () =>
    originalLines.map((line, idx) => {
      const diff = lineDiffs.find(d => d.leftLine === idx);
      const cls  = diff ? diff.type : 'equal';
      return (
        <div
          key={`L${idx}`}
          className={`diff-line ${cls}`}
          data-line={idx}
          onClick={() => diff && diff.type !== 'equal' && onDiffClick(diff)}
        >
          <span className="line-number">{idx + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });

  // 右側內容渲染
  const renderRightPane = () =>
    modifiedLines.map((line, idx) => {
      const diff = lineDiffs.find(d => d.rightLine === idx);
      const cls  = diff ? diff.type : 'equal';
      return (
        <div
          key={`R${idx}`}
          className={`diff-line ${cls}`}
          data-line={idx}
          onClick={() => diff && diff.type !== 'equal' && onDiffClick(diff)}
        >
          <span className="line-number">{idx + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });

  return (
    <div className="side-by-side-diff" style={{ display: 'flex' }}>
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

      <div
        className={`sync-scroll ${scrolling ? 'scrolling' : ''}`}
        ref={syncRef}
        onScroll={handleCentralScroll}
        style={{ width: '16px', overflowY: 'scroll', marginTop: '30px' }}
      />

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
});

export default SideBySideDiffViewer;
