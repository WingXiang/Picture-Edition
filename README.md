# OmniPixel - 全能瀏覽器端圖片編輯工具 🎨

OmniPixel 是一款強大、現代化且完全基於瀏覽器運作的圖片處理工具。所有的影像處理與 AI 去背功能皆在你的本地設備（Client-side）執行，保證了極致的隱私與效能。

![OmniPixel](https://via.placeholder.com/1200x600/2a4189/ffffff?text=OmniPixel+Web+Image+Editor)

## 🌟 核心功能

- **光影與調整 (Tune Tool)**：亮度、對比度、飽和度調整，以及圖片翻轉與旋轉。
- **裁減圖片 (Crop Tool)**：自由比例、1:1、4:3、16:9 等標準比例智能裁切。
- **圖片變清晰 (Sharpen Tool)**：像素級銳化處理矩陣，拯救模糊照片。
- **智慧去背 (Background Remover)**：基於 `@imgly/background-removal` AI 引擎，精準識別人像與物體，輸出高清透明 PNG (完全無須伺服器)。
- **調整大小與格式 (Basic Editor)**：一鍵調整解析度，支援壓縮轉檔至 JPG, PNG, WebP。
- **批量壓縮 (Batch Compressor)**：一鍵匯入數十張圖片，在維持極高品質的前提下壓縮體積，並自動打包為 ZIP 下載。
- **文件提取 (Document Extractor)**：直接上傳 PDF/DOCX 檔案，系統自動掃描並抓取文件內所有圖片供下載。
- **色彩工具 (Color Picker)**：上傳圖片，使用滑鼠直接點擊獲取精準 HEX 色碼與 RGB 數值。

---

## 🚀 技術棧 (Tech Stack)

- **前端框架**: React 18 + Vite
- **UI 與樣式**: Tailwind CSS + Lucide React (Icons)
- **核心影像處理**: HTML5 Canvas API
- **AI 模型**: `@imgly/background-removal` (WASM + WebGL 運算)
- **檔案處理**: `jszip`, `pdf.js`

---

## 💻 本地開發與運行

請確保你的電腦已安裝 [Node.js](https://nodejs.org/) (建議版本 v18 以上)。

1. **安裝依賴套件**
   在終端機中執行以下指令以安裝所需套件：
   ```bash
   npm install
   ```

2. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   啟動後，在瀏覽器打開 `http://localhost:5173` 即可開始使用。

---

## 🌐 部署至 GitHub Pages 或其他靜態主機

本專案完全是由純靜態的前端檔案構成，可以輕鬆部署到 GitHub Pages, Vercel, Netlify 或自有的伺服器上。

### 1. 編譯專案 (Build)
在終端機中執行：
```bash
npm run build
```
這個指令會將所有的 React 程式碼打包、壓縮並優化，最終輸出到 `dist` 資料夾中。

### 2. 部署方式
- **GitHub Pages**: 將 `dist` 資料夾的內容推送到 GitHub 倉庫的 `gh-pages` 分支。如果你使用 GitHub Actions，可以直接配置部署 `dist` 目錄。（注意：`vite.config.js` 中已設定 `base: './'`，確保資源路徑皆正確）
- **Vercel / Netlify**: 授權你的 GitHub 倉庫，設定 Build Command 為 `npm run build`，Output Directory 為 `dist`，系統即可自動完成部署。
- **傳統虛擬主機 (cPanel / WordPress FTP)**: 直接將 `dist` 資料夾內的所有檔案上傳到你伺服器的公開資料夾 (如 `public_html`) 中。

---

## ⚠️ 注意事項與已知限制

1. **AI 去背功能**：首次使用時，瀏覽器會從網路下載約 40MB 的 AI 運算模型。這需要一點時間，下載後會快取在瀏覽器中。請確保使用者的裝置記憶體充足。
2. **跨域問題 (CORS)**：若是未來整合了外部圖床或 API，請確保後端有設定好 CORS 允許，否則瀏覽器會阻擋上傳。本專案目前皆為純本地運算，無此問題。
3. **文件提取**：目前 `DOCX` 檔案的提取為基礎支援，不保證所有包含特殊加密的文件皆能 100% 提取。

---
*Developed with ❤️*
