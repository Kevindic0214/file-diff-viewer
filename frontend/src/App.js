import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import DiffView from './components/DiffView';
import Toolbar from './components/Toolbar';
import ChangesPanel from './components/ChangesPanel';
import './styles/App.css';

function App() {
  // 主要應用狀態
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' 或 'unified'
  const [selectedChangeIndex, setSelectedChangeIndex] = useState(null);
  const [filters, setFilters] = useState({
    inserted: true,
    deleted: true,
    replaced: true
  });

  // 處理文件上傳和差異比較
  const handleCompareFiles = async (file1, file2) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file1', file1);
      formData.append('file2', file2);
      
      const response = await fetch('http://localhost:5000/api/diff', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '檔案比較時發生錯誤');
      }
      
      const data = await response.json();
      processRawDiffData(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 處理和轉換原始差異數據
  const processRawDiffData = (rawData) => {
    // 處理差異數據，創建更易於使用的格式
    // 包括計算變更類型、分組相關變更等
    
    // 後端返回 { diffs: [...], originalText: "...", modifiedText: "..." }
    // 我們可以增強這個數據結構並添加更多信息
    
    const { diffs, originalText, modifiedText } = rawData;
    
    // 為每個變更計算類型和統計信息
    const enhancedDiffs = diffs.map((diff, index) => {
      const { operation } = diff;
      
      // 確定變更類型
      let changeType;
      if (operation === 'EQUAL') {
        changeType = 'unchanged';
      } else if (operation === 'INSERT') {
        changeType = 'inserted';
      } else if (operation === 'DELETE') {
        changeType = 'deleted';
      }
      
      // 對於相鄰的刪除和插入，我們可以將它們標記為替換
      // 這需要更複雜的處理邏輯，這裡只是簡化示例
      
      return {
        ...diff,
        id: `diff-block-${index}`,
        changeType,
        // 添加其他有用的元數據
      };
    });
    
    // 組織變更摘要（用於右側面板）
    const changesSummary = [];
    let currentReplaceGroup = null;
    
    // 這只是一個簡化的邏輯，實際應用中需要更複雜的算法來檢測替換組
    enhancedDiffs.forEach((diff, index) => {
      if (diff.changeType === 'deleted' && 
          index < enhancedDiffs.length - 1 && 
          enhancedDiffs[index + 1].changeType === 'inserted') {
        
        // 開始一個替換組
        if (!currentReplaceGroup) {
          currentReplaceGroup = {
            type: 'REPLACED',
            oldContent: diff.text,
            newContent: enhancedDiffs[index + 1].text,
            diffIndices: [index, index + 1],
            charDiff: enhancedDiffs[index + 1].text.length - diff.text.length
          };
        } else {
          currentReplaceGroup.oldContent += diff.text;
          currentReplaceGroup.newContent += enhancedDiffs[index + 1].text;
          currentReplaceGroup.diffIndices.push(index, index + 1);
          currentReplaceGroup.charDiff += enhancedDiffs[index + 1].text.length - diff.text.length;
        }
      } else if (diff.changeType === 'inserted' && index > 0 && enhancedDiffs[index - 1].changeType === 'deleted') {
        // 這是一個替換組的一部分，已經在前一個迭代中處理過
        if (currentReplaceGroup && index === enhancedDiffs.length - 1) {
          changesSummary.push(currentReplaceGroup);
          currentReplaceGroup = null;
        }
      } else {
        // 如果我們有一個活動的替換組，添加它
        if (currentReplaceGroup) {
          changesSummary.push(currentReplaceGroup);
          currentReplaceGroup = null;
        }
        
        // 添加單個變更
        if (diff.changeType === 'deleted') {
          changesSummary.push({
            type: 'DELETED',
            oldContent: diff.text,
            newContent: '',
            diffIndices: [index],
            charDiff: -diff.text.length
          });
        } else if (diff.changeType === 'inserted') {
          changesSummary.push({
            type: 'INSERTED',
            oldContent: '',
            newContent: diff.text,
            diffIndices: [index],
            charDiff: diff.text.length
          });
        }
        // 'unchanged' 不添加到摘要中
      }
    });
    
    // 最後檢查是否有未處理的替換組
    if (currentReplaceGroup) {
      changesSummary.push(currentReplaceGroup);
    }
    
    // 更新 state
    setDiffData({
      diffs: enhancedDiffs,
      originalText,
      modifiedText,
      changesSummary
    });
  };

  // 添加一個共用的導航函數
  const navigateToChange = (changeIndex) => {
    if (!diffData || !diffData.changesSummary || !diffData.changesSummary[changeIndex]) return;
    
    const change = diffData.changesSummary[changeIndex];
    if (change.diffIndices && change.diffIndices.length > 0) {
      const diffIndex = change.diffIndices[0];
      
      // 根據當前視圖模式選擇正確的元素ID格式
      let elementId;
      if (viewMode === 'unified') {
        elementId = `diff-unified-${diffIndex}`;
      } else {
        // 在並排視圖中，根據變更類型決定查找左側還是右側元素
        if (change.type === 'DELETED' || 
            (change.type === 'REPLACED' && diffData.diffs[diffIndex].changeType === 'deleted')) {
          elementId = `diff-side-left-${diffIndex}`;
        } else {
          const insertIndex = change.type === 'REPLACED' ? change.diffIndices[1] : diffIndex;
          elementId = `diff-side-right-${insertIndex}`;
        }
      }
      
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.warn(`導航錯誤：找不到元素 ${elementId}，變更索引：${changeIndex}`);
        // 提供更多診斷信息
        console.debug('變更詳情:', change);
        console.debug('視圖模式:', viewMode);
      }
    }
  };

  // 處理變更選擇
  const handleChangeSelect = (changeIndex) => {
    setSelectedChangeIndex(changeIndex);
    navigateToChange(changeIndex);
  };

  // 處理過濾變更
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // 處理視圖模式切換
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // 處理導航到下一個/上一個變更
  const handleNavigateChanges = (direction) => {
    if (!diffData || !diffData.changesSummary.length) return;
    
    const totalChanges = diffData.changesSummary.length;
    
    if (selectedChangeIndex === null) {
      // 如果尚未選擇任何變更，選擇第一個或最後一個
      setSelectedChangeIndex(direction === 'next' ? 0 : totalChanges - 1);
    } else {
      // 計算下一個或上一個索引
      const newIndex = direction === 'next'
        ? (selectedChangeIndex + 1) % totalChanges
        : (selectedChangeIndex - 1 + totalChanges) % totalChanges;
      
      setSelectedChangeIndex(newIndex);
      
      // 滾動到選定的變更
      const element = document.getElementById(`change-summary-${newIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>文件差異比較系統</h1>
      </header>
      
      {!diffData ? (
        <FileUploader 
          onCompare={handleCompareFiles} 
          loading={loading}
          error={error}
        />
      ) : (
        <div className="diff-container">
          <Toolbar 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onNavigatePrev={() => handleNavigateChanges('prev')}
            onNavigateNext={() => handleNavigateChanges('next')}
            onReset={() => setDiffData(null)}
          />
          
          <div className="main-content">
            <DiffView 
              diffData={diffData}
              viewMode={viewMode}
              selectedChangeIndex={selectedChangeIndex}
              filters={filters}
              onChangeSelect={handleChangeSelect}
            />
            
            <ChangesPanel 
              changes={diffData.changesSummary}
              selectedIndex={selectedChangeIndex}
              onChangeSelect={handleChangeSelect}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>© 2025 文件差異比較系統 By Kevin H. Hsieh</p>
      </footer>
    </div>
  );
}

export default App;