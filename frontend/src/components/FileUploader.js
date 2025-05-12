import React, { useState, useRef } from 'react';
import '../styles/FileUploader.css';

function FileUploader({ onCompare, loading, error }) {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);
  
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  // 處理文件選擇
  const handleFile1Change = (e) => {
    if (e.target.files[0]) {
      setFile1(e.target.files[0]);
    }
  };

  const handleFile2Change = (e) => {
    if (e.target.files[0]) {
      setFile2(e.target.files[0]);
    }
  };

  // 處理拖放功能
  const handleDrag = (e, dropZone) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      if (dropZone === 1) setDragActive1(true);
      else setDragActive2(true);
    } else if (e.type === "dragleave") {
      if (dropZone === 1) setDragActive1(false);
      else setDragActive2(false);
    }
  };

  const handleDrop = (e, dropZone) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropZone === 1) setDragActive1(false);
    else setDragActive2(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (dropZone === 1) {
        setFile1(e.dataTransfer.files[0]);
      } else {
        setFile2(e.dataTransfer.files[0]);
      }
    }
  };

  // 觸發文件選擇對話框
  const handleOpenFileDialog = (fileInputRef) => {
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 提交比較請求
  const handleSubmit = (e) => {
    e.preventDefault();
    if (file1 && file2) {
      onCompare(file1, file2);
    }
  };

  // 重置所選文件
  const handleReset = () => {
    setFile1(null);
    setFile2(null);
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
  };

  return (
    <div className="file-uploader">
      <h2>上傳文件以比較差異</h2>
      <p className="uploader-description">
        選擇或拖放兩個文件進行比較。支援的格式包含 .docx、.pdf、.txt 等。
      </p>
      
      <div className="upload-container">
        {/* 原始文件（左側） */}
        <div className="upload-box">
          <h3>原始文件 (版本 A)</h3>
          <div 
            className={`drop-zone ${dragActive1 ? 'active' : ''} ${file1 ? 'has-file' : ''}`}
            onDragEnter={(e) => handleDrag(e, 1)}
            onDragOver={(e) => handleDrag(e, 1)}
            onDragLeave={(e) => handleDrag(e, 1)}
            onDrop={(e) => handleDrop(e, 1)}
            onClick={() => handleOpenFileDialog(fileInput1Ref)}
          >
            <input 
              type="file" 
              ref={fileInput1Ref}
              onChange={handleFile1Change}
              className="hidden-input"
              accept=".txt,.doc,.docx,.pdf"
            />
            
            {file1 ? (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-name">{file1.name}</div>
                <div className="file-size">{(file1.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">⬆️</div>
                <p>點擊或拖放文件到此處</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 修改後文件（右側） */}
        <div className="upload-box">
          <h3>修改後文件 (版本 B)</h3>
          <div 
            className={`drop-zone ${dragActive2 ? 'active' : ''} ${file2 ? 'has-file' : ''}`}
            onDragEnter={(e) => handleDrag(e, 2)}
            onDragOver={(e) => handleDrag(e, 2)}
            onDragLeave={(e) => handleDrag(e, 2)}
            onDrop={(e) => handleDrop(e, 2)}
            onClick={() => handleOpenFileDialog(fileInput2Ref)}
          >
            <input 
              type="file" 
              ref={fileInput2Ref}
              onChange={handleFile2Change}
              className="hidden-input"
              accept=".txt,.doc,.docx,.pdf"
            />
            
            {file2 ? (
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-name">{file2.name}</div>
                <div className="file-size">{(file2.size / 1024).toFixed(1)} KB</div>
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">⬆️</div>
                <p>點擊或拖放文件到此處</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className="compare-button"
          onClick={handleSubmit}
          disabled={!file1 || !file2 || loading}
        >
          {loading ? '處理中...' : '比較文件'}
        </button>
        
        <button 
          className="reset-button"
          onClick={handleReset}
          disabled={loading || (!file1 && !file2)}
        >
          重置
        </button>
      </div>
      
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>正在分析文件差異，請稍候...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>錯誤：{error}</p>
        </div>
      )}
    </div>
  );
}

export default FileUploader;