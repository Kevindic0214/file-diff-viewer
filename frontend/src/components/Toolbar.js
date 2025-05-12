import React from 'react';
import '../styles/Toolbar.css';

function Toolbar({ 
  viewMode, 
  onViewModeChange, 
  onNavigatePrev, 
  onNavigateNext, 
  onReset,
  onPrint,
  onSave,
  onShare 
}) {
  // 處理列印功能
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };
  
  // 處理儲存功能 (如果沒有提供處理函數則下載為HTML)
  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      const htmlContent = document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-comparison.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  // 處理分享功能
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (navigator.share) {
      navigator.share({
        title: '文件差異比較',
        text: '查看這份文件差異比較',
        url: window.location.href
      });
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          title="列印"
          onClick={handlePrint}
        >
          <span className="toolbar-icon">🖨️</span>
          <span className="toolbar-label">列印</span>
        </button>
        
        <button 
          className="toolbar-button" 
          title="儲存"
          onClick={handleSave}
        >
          <span className="toolbar-icon">💾</span>
          <span className="toolbar-label">儲存</span>
        </button>
        
        <button 
          className="toolbar-button" 
          title="分享"
          onClick={handleShare}
        >
          <span className="toolbar-icon">🔗</span>
          <span className="toolbar-label">分享</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className={`toolbar-button ${viewMode === 'side-by-side' ? 'active' : ''}`} 
          title="並排視圖"
          onClick={() => onViewModeChange('side-by-side')}
        >
          <span className="toolbar-icon">⊞</span>
          <span className="toolbar-label">並排視圖</span>
        </button>
        
        <button 
          className={`toolbar-button ${viewMode === 'unified' ? 'active' : ''}`} 
          title="合併視圖"
          onClick={() => onViewModeChange('unified')}
        >
          <span className="toolbar-icon">⊟</span>
          <span className="toolbar-label">合併視圖</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button" 
          title="文字選擇"
        >
          <span className="toolbar-icon">✏️</span>
          <span className="toolbar-label">選擇文字</span>
        </button>
        
        <button 
          className="toolbar-button" 
          title="鎖定捲動"
        >
          <span className="toolbar-icon">🔒</span>
          <span className="toolbar-label">鎖定捲動</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button nav-button" 
          title="上一個變更"
          onClick={onNavigatePrev}
        >
          <span className="toolbar-icon">⬆️</span>
          <span className="toolbar-label">上一個變更</span>
        </button>
        
        <button 
          className="toolbar-button nav-button" 
          title="下一個變更"
          onClick={onNavigateNext}
        >
          <span className="toolbar-icon">⬇️</span>
          <span className="toolbar-label">下一個變更</span>
        </button>
      </div>
      
      <div className="toolbar-group">
        <button 
          className="toolbar-button reset-button" 
          title="重置視圖"
          onClick={onReset}
        >
          <span className="toolbar-icon">🔄</span>
          <span className="toolbar-label">重置</span>
        </button>
      </div>
    </div>
  );
}

export default Toolbar;