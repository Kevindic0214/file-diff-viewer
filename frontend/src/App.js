import React, { useState } from 'react';
import './App.css';
import DiffViewer from './components/DiffViewer';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setError('請選擇兩個檔案');
      return;
    }

    // 清空上次結果
    setError('');
    setDiffs([]);
    setOriginalText('');
    setModifiedText('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '伺服器錯誤');

      // 設定後端回傳的全文與差異
      setOriginalText(data.originalText);
      setModifiedText(data.modifiedText);
      setDiffs(data.diffs);
    } catch (err) {
      setError(err.message);
      setDiffs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>文件差異比對</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>檔案 1：</label>
          <input
            type="file"
            onChange={e => setFile1(e.target.files[0])}
          />
        </div>
        <div>
          <label>檔案 2：</label>
          <input
            type="file"
            onChange={e => setFile2(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '比對中...' : '開始比對'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="diff-result">
        {diffs.length > 0 && (
          <DiffViewer
            diffs={diffs}
            originalText={originalText}
            modifiedText={modifiedText}
          />
        )}
      </div>
    </div>
  );
}

export default App;
