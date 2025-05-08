import React, { useState } from 'react';
import './App.css';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffs, setDiffs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setError('請選擇兩個檔案');
      return;
    }
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '伺服器錯誤');
      }
      const data = await res.json();
      setDiffs(data.diffs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDiff = () => {
    return diffs.map((d, i) => {
      const { operation, text } = d;
      if (operation === 'INSERT') {
        return <ins key={i}>{text}</ins>;
      } else if (operation === 'DELETE') {
        return <del key={i}>{text}</del>;
      } else {
        return <span key={i}>{text}</span>;
      }
    });
  };

  return (
    <div className="App">
      <h1>文件差異比對</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>檔案 1：</label>
          <input type="file" onChange={e => setFile1(e.target.files[0])} />
        </div>
        <div>
          <label>檔案 2：</label>
          <input type="file" onChange={e => setFile2(e.target.files[0])} />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '比對中...' : '開始比對'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="diff-result">
        {renderDiff()}
      </div>
    </div>
  );
}

export default App;
