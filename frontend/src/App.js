import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import SideBySideDiffViewer from './components/SideBySideDiffViewer';
import DiffDetails from './components/DiffDetails';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diffs, setDiffs] = useState([]);
  const [lineDiffs, setLineDiffs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const viewerRef = useRef();

  // 計算行級別的差異
  useEffect(() => {
    if (originalText && modifiedText && diffs.length > 0) {
      const originalLines = originalText.split('\n');
      const modifiedLines = modifiedText.split('\n');
      
      // 標記每行的差異類型
      const computedLineDiffs = [];
      
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
        
        // 只添加有差異的行
        if (diffType !== 'equal') {
          computedLineDiffs.push({
            leftLine: i,
            rightLine: i,
            leftText: origLineExists ? originalLines[i] : '',
            rightText: modLineExists ? modifiedLines[i] : '',
            type: diffType
          });
        }
      }
      
      setLineDiffs(computedLineDiffs);
    }
  }, [originalText, modifiedText, diffs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setError('請選擇兩個檔案');
      return;
    }
    setError(''); 
    setLoading(true);

    // 呼叫 API 進行差異比對
    const form = new FormData();
    form.append('file1', file1);
    form.append('file2', file2);

    try {
      const res = await fetch('/api/diff', { method: 'POST', body: form });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || '伺服器錯誤');
      
      setOriginalText(data.originalText);
      setModifiedText(data.modifiedText);
      setDiffs(data.diffs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 點擊差異項目時的處理函數
  const handleDiffClick = (diff) => {
    // 取得對應行元素
    const lineElement = document.getElementById(`line-left-${diff.leftLine}`);
    if (lineElement) {
      // 平滑滾動到對應行
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 添加一個短暫的高亮效果
      lineElement.classList.add('highlight-focus');
      setTimeout(() => {
        lineElement.classList.remove('highlight-focus');
      }, 1500);
    }
  };

  // 檔案名稱顯示格式化
  const formatFileName = (file) => {
    if (!file) return '';
    
    if (file.name.length > 25) {
      return file.name.substring(0, 22) + '...';
    }
    return file.name;
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>文件差異比對</h1>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>原始檔案：</label>
            <div className="file-input-group">
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                id="file1"
                onChange={e => setFile1(e.target.files[0])}
                className="file-input"
              />
              <label htmlFor="file1" className="file-label">
                {file1 ? formatFileName(file1) : '選擇檔案...'}
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>修改後檔案：</label>
            <div className="file-input-group">
              <input
                type="file"
                accept=".txt,.docx,.pdf"
                id="file2"
                onChange={e => setFile2(e.target.files[0])}
                className="file-input"
              />
              <label htmlFor="file2" className="file-label">
                {file2 ? formatFileName(file2) : '選擇檔案...'}
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="submit-button"
          >
            {loading ? '處理中...' : '開始比對'}
          </button>
        </form>
      </header>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <p>正在處理文件，請稍候...</p>
        </div>
      )}

      {originalText && modifiedText && (
        <div className="diff-container">
          <SideBySideDiffViewer
            originalText={originalText}
            modifiedText={modifiedText}
            diffs={diffs}
            onDiffClick={handleDiffClick}
            ref={viewerRef}
          />
          <DiffDetails
            lineDiffs={lineDiffs}
            onDiffClick={handleDiffClick}
          />
        </div>
      )}
    </div>
  );
}

export default App;
