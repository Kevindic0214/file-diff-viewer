# 檔案差異比對工具 (File Diff Viewer)

一個強大的檔案比對工具，可視化展示文件差異並提供 AI 輔助分析功能。特別適用於合約、法律文件和其他需要精確比對的文本檔案。

## 主要功能

- **檔案差異比對**：上傳兩個檔案，自動分析並高亮顯示其間的差異
- **支援多種檔案格式**：包括 PDF、Word 文件、文本檔案等
- **AI 輔助分析**：對差異部分提供法律/合約專業意見和建議
- **報告導出**：支援將差異報告匯出為 PDF 格式

## 技術架構

### 前端 (React)
- 基於 React 開發的現代化 UI
- 支援檔案上傳、差異視覺化和 AI 分析結果顯示
- 透過 HTML2Canvas 和 jsPDF 實現報告匯出功能

### 後端 (Python Flask)
- Flask API 提供檔案處理和差異計算功能
- 整合 OpenAI API 提供智能差異分析
- 模組化的差異引擎設計

## 安裝指南

### 前置需求
- Node.js (16+)
- Python (3.9+)
- OpenAI API 金鑰 (用於 AI 分析功能)

### 後端設定
1. 進入後端目錄：
   ```
   cd backend
   ```

2. 創建並啟用虛擬環境：
   ```
   python -m venv venv
   source venv/bin/activate  # 在 Windows 上使用: venv\Scripts\activate
   ```

3. 安裝相依套件：
   ```
   pip install -r requirements.txt
   ```

4. 創建 .env 檔案並設置 OpenAI API 金鑰：
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

5. 啟動後端伺服器：
   ```
   python app.py
   ```

### 前端設定
1. 進入前端目錄：
   ```
   cd frontend
   ```

2. 安裝相依套件：
   ```
   npm install
   ```

3. 啟動開發伺服器：
   ```
   npm start
   ```

應用程式將在 http://localhost:3000 上執行，後端 API 在 http://localhost:5000 提供服務。

## 使用說明

1. 在首頁上傳兩個要比對的檔案（原始檔案和修改後檔案）
2. 系統將自動處理並顯示檔案差異，用不同顏色標示增加、刪除和修改部分
3. 點擊特定差異區塊，可獲取 AI 輔助分析和建議
4. 使用頁面上的匯出功能，將完整差異報告保存為 PDF 檔案

## 貢獻指南

歡迎提交 Pull Request 或建立 Issue 來改進本專案。在提交代碼前，請確保：

1. 遵循現有的代碼風格和命名慣例
2. 添加適當的測試用例
3. 更新相關文檔

## 授權協議

本專案採用 MIT 授權協議 - 詳見 [LICENSE](LICENSE) 檔案。
