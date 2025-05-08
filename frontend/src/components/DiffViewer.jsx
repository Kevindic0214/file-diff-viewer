import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
const WINDOW_SIZE = 100;

export default function DiffViewer({ diffs, originalText, modifiedText }) {
  const [results, setResults] = useState({});

  // Precompute offsets for original and modified texts
  const origOffsets = [];
  const modOffsets = [];
  let origPos = 0;
  let modPos = 0;
  diffs.forEach((diff, i) => {
    origOffsets[i] = origPos;
    modOffsets[i] = modPos;
    const len = diff.text.length;
    if (diff.operation !== 'INSERT') origPos += len;
    if (diff.operation !== 'DELETE') modPos += len;
  });

  const analyzeBlock = async (blockId, diff) => {
    setResults(prev => ({ ...prev, [blockId]: { loading: true } }));

    // Extract context windows around the diff
    const origStart = Math.max(0, origOffsets[blockId] - WINDOW_SIZE);
    const origLen = diff.operation !== 'INSERT' ? diff.text.length : 0;
    const origEnd = Math.min(originalText.length, origOffsets[blockId] + origLen + WINDOW_SIZE);
    const originalContext = originalText.slice(origStart, origEnd);

    const modStart = Math.max(0, modOffsets[blockId] - WINDOW_SIZE);
    const modLen = diff.operation !== 'DELETE' ? diff.text.length : 0;
    const modEnd = Math.min(modifiedText.length, modOffsets[blockId] + modLen + WINDOW_SIZE);
    const modifiedContext = modifiedText.slice(modStart, modEnd);

    try {
      const resp = await fetch(`${API_BASE}/analyze-block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, originalContext, modifiedContext }),
      });
      const json = await resp.json();
      setResults(prev => ({ ...prev, [blockId]: { loading: false, comment: json.comment } }));
    } catch (err) {
      setResults(prev => ({ ...prev, [blockId]: { loading: false, comment: '分析失敗，請稍後再試。' } }));
    }
  };

  return (
    <div className="diff-viewer">
      {diffs.map((diff, idx) => (
        <div key={idx} className="diff-block" id={`diff-${idx}`}>
          <span className={diff.operation.toLowerCase()}>
            {diff.text}
          </span>
          {diff.operation !== 'EQUAL' && (
            <div className="analysis-section">
              <button
                onClick={() => analyzeBlock(idx, diff)}
                disabled={results[idx]?.loading}
              >
                {results[idx]?.loading ? '分析中...' : '諮詢建議'}
              </button>
              {results[idx]?.comment && (
                <details>
                  <summary>顧問建議</summary>
                  <p>{results[idx].comment}</p>
                </details>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
