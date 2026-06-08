# 十大機器學習演算法互動學習平台 (ML Top 10 Interactive Learning Platform)

這個專案將一個 **24MB 包含大量 Base64 嵌入圖片的靜態 HTML 研讀報告**，成功重構並轉換為一個現代化、響應式且具備實時演算法運算能力的**動態互動式機器學習學習平台**。

平台採用 **Next.js (前端)** 與 **FastAPI (後端)** 架構，讓學習者不僅能閱讀理論，還能直接在瀏覽器中調整超參數，即時觀測 Scikit-learn 模型在二維空間中擬合的**決策面 (Decision Boundary)** 與評估指標變動。

---
Live Demo: https://top10mlalgorithm.vercel.app/

## 📂 專案目錄結構

```
d:/cena/0608/HW5/
├── backend/                  # FastAPI 模擬計算後端
│   ├── main.py               # API 服務與機器學習模型計算核心
│   └── requirements.txt      # 後端 Python 依賴包 (scikit-learn, fastapi, etc.)
│
├── frontend/                 # Next.js 14 課程前端
│   ├── public/images/        # 解碼後提取的各演算法圖表與示意圖
│   ├── src/
│   │   ├── app/              # Next.js 頁面路由與全域樣式 (Dark Mode & 玻璃擬態)
│   │   ├── components/       # 側欄導航與 Canvas 二維畫布渲染核心
│   │   └── data.json         # 從 HTML 提取出的清洗後課程教材數據
│   ├── tsconfig.json         # TypeScript 設定檔
│   └── tailwind.config.js    # Tailwind CSS v3 設定檔
│
└── extracted_data/           # 提取出的原始教材 JSON 數據與圖片備份
```

---

## 🌟 核心特色功能

1. **模組化標籤教材 (Curriculum)**：
   - 整合並排版了十大演算法（線性回歸、邏輯回歸、決策樹、隨機森林、SVM、KNN、朴素貝葉斯、K-Means、PCA、神經網路）的原理與訓練邏輯。
   - 優雅渲染數學公式，並提取對應的演算法精美示意圖。
   
2. **實時動態沙盒 (Interactive Sandbox)**：
   - 使用者可自由調整超參數滑桿（如 SVM 的 C/Gamma、KNN 的 K 值、K-Means 的聚類數、神經網路的隱藏層結構與迭代次數）。
   - **HTML5 Canvas 決策面渲染**：後端實時執行 `scikit-learn` 訓練，前端動態繪製預測機率梯度背景（Decision Boundary）、支持向量（Support Vectors）標記、K-Means 質心 (Centroids)。
   - **回歸擬合線** 與 **神經網絡 Loss 訓練曲線** 實時繪製。
   - 動態顯示模型評估指標（Accuracy, MSE, $R^2$, Inertia）。

3. **貝氏垃圾郵件實作沙盒**：
   - 提供實時 NLP 電子郵件分類面板，讓使用者自訂信件內文，直接調用 MultinomialNB 進行垃圾郵件 (Spam) 判定與機率預測。

4. **多框架範例程式碼 (Code Reference)**：
   - 提供 Scikit-Learn、PyTorch、TensorFlow 三大框架對應的標準機器學習模型程式碼，方便隨手複製。

---

## 🚀 快速開始指南

### 1. 啟動 FastAPI 後端伺服器

需要安裝 Python 環境，建議使用 Python 3.10+ 以上版本。

```bash
# 進入 backend 目錄
cd backend

# 安裝依賴套件 (fastapi, uvicorn, scikit-learn, numpy, pandas 等)
pip install -r requirements.txt

# 啟動後端服務
python -m uvicorn main:app --reload --port 8000
```
* 後端服務將啟動於 [http://127.0.0.1:8000](http://127.0.0.1:8000)。

### 2. 啟動 Next.js 前端伺服器

為相容本機 Node.js 18.x 環境，本前端特別優化運行於 Next.js 14.x 及 React 18.x。

```bash
# 進入 frontend 目錄
cd frontend

# 安裝前端依賴套件
npm install

# 啟動前端開發伺服器 (指定 Port 8080 避開系統排除的 3000 連接埠)
npx next dev -p 8080
```
* 前端開發伺服器將啟動於 [http://localhost:8080](http://localhost:8080)。

---

## 🛠️ 技術細節與備註

* **連接埠衝突說明**：在 Windows 環境下，有時 Hyper-V 或系統排除會佔用 `3000` 系列連接埠（如排除範圍 `2967-3066`）。因此，前端特別指定在 `8080` 連接埠運行。
* **資料清洗**：在靜態 HTML 解析過程中，清除了各段落內重複出現的範本語句（例如 *"透過深入研究和實踐，你將更熟練掌握此演算法，在實務專案中發揮其價值。"*），使網頁排版更加乾淨專業。
