# DogLab Coding 🐕‍🦺

> **機器狗編程實驗室** — Scratch-like 網頁拖曳積木 + 即時 SVG / 3D 模擬 + Web Serial 連實機。
> 目前支援 Petoi Bittle（NyBoard/BiBoard），未來擴充至雙足機器人、Unitree Go1、microbit 自走車。
> Status：**v0.4.11**（多機器人架構 + 3D 模擬器 + 51 動作積木）

「Bittle」、「Petoi」為廠商商標，僅在描述支援硬體時使用。本工具與 Petoi Camp 無附屬關係。

仿 [NUWA Kebbi codelab](https://codelab.nuwarobotics.com/) 的拖曳積木編程體驗，但底層改接 Petoi OpenCat 框架的 56 個內建 skills + ASCII 序列協定。支援 **SVG 模擬** 與 **Web Serial 實機連線** 雙模式。

## 螢幕截圖

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🐕 DogLab Coding v0.1.0          [模式]  [連接]  [停止]  [▶]  │
├─────────────────────────────────────┬───────────────────────────────┤
│  動作 / Servo / 流程 / 數學 / 文字  │       [Bittle SVG 圖]        │
│                                     │                               │
│  [拖曳積木組合到這裡]                │     狀態：執行 kwkF           │
│                                     ├───────────────────────────────┤
│                                     │  執行記錄                     │
│                                     │  [10:30:01] ▶ 送出: kwkF      │
│                                     │  [10:30:04] ▶ 送出: ksit      │
└─────────────────────────────────────┴───────────────────────────────┘
```

## 快速開始

### 線上使用（建議）

部署到 GitHub Pages 後直接訪問：
```
https://<your-username>.github.io/quadruped-koding/
```

### 本地開發

```bash
# 1. clone 專案
git clone https://github.com/<your-username>/quadruped-koding.git
cd quadruped-koding

# 2. 啟動本地 server（推薦，避免 file:// 限制）
python3 -m http.server 8000
# 或：npx serve

# 3. 瀏覽器打開
# http://localhost:8000
```

### 連接實機 Bittle

1. **必須用 Chrome 或 Edge 瀏覽器（89+）**（Firefox/Safari 不支援 Web Serial）
2. 用 USB uploader（CH340C / CH343G）把 Bittle 接到電腦
3. 在頁面右上角按「🔌 連接 Bittle」
4. 從彈出對話框選擇對應的序列埠
5. 連線後，所有積木執行會直接送 ASCII 到實機

## MVP 功能

| 類別 | 積木 | ASCII 對應 |
|---|---|---|
| 動作 | 走向前 | `kwkF` |
| 動作 | 倒退 | `kbk` |
| 動作 | 坐下 | `ksit` |
| 動作 | 站穩 | `kbalance` |
| 動作 | 休息 | `krest` |
| 動作 | 打招呼 | `khi` |
| Servo | 移動單一 servo | `m <index> <angle>` |
| Servo | 同時移動兩個 servo | `i <i1> <a1> <i2> <a2>` |
| 聲音 | 蜂鳴 | `b <pitch> <duration>` |
| 流程 | 等待 N 秒 | `await wait(N)` |

加上 Blockly 內建的「流程控制」、「數學」、「變數」、「文字」積木。

## 部署到 GitHub Pages

```bash
# 1. 建立 GitHub repo 並 push
git remote add origin https://github.com/<your-username>/quadruped-koding.git
git branch -M main
git push -u origin main

# 2. 在 GitHub 啟用 Pages
# Settings → Pages → Source 選 main branch / root → Save

# 3. 訪問
# https://<your-username>.github.io/quadruped-koding/
```

`.nojekyll` 檔案告訴 GitHub Pages 不要用 Jekyll 處理，避免 `_` 開頭資料夾被忽略。

## 技術棧

- **Blockly v10+**（Google 開源拖曳積木引擎，via unpkg.com CDN）
- **Vanilla JS / HTML / CSS**（零 build pipeline）
- **SVG**（模擬器動畫）
- **Web Serial API**（實機通訊，Chrome 89+）
- **完全無 npm / 無 build / 無後端**（GitHub Pages 友善）

詳見 [docs/architecture.md](docs/architecture.md)。

## 開發路線圖

詳見 [docs/roadmap.md](docs/roadmap.md)。簡述：

| 版本 | 範圍 | 預估 |
|---|---|---|
| v0.1 (現在) | MVP：10 積木 + SVG + Serial 骨架 | ✅ 已完成 |
| v0.2 | 補完 56 個 skills + 事件積木 + 專案儲存（localStorage） | 1-2 週 |
| v0.3 | SVG 模擬器升級（步態、跌倒、感測器互動） | 1-2 週 |
| v0.4 | Three.js 3D 模擬模式 + URDF 載入 | 2-4 週 |
| v0.5 | OpenAI / IoT / Teachable Machine 擴充積木 | 4-8 週 |
| v1.0 | 完整版（多語、教學任務卡、社群分享） | 3-6 個月（總計） |

## 文件導覽

### 專案內文件
- [docs/architecture.md](docs/architecture.md) — 整體架構規格書
- [docs/multi-robot-architecture.md](docs/multi-robot-architecture.md) — **多機器人擴充架構**（為未來雙足/Go1/microbit 鋪路）
- [docs/roadmap.md](docs/roadmap.md) — v0.1 → v1.0 開發路線圖
- [docs/examples.md](docs/examples.md) — 6 個範例程式（照著拖就會動）
- [docs/github-deploy-guide.md](docs/github-deploy-guide.md) — **GitHub 上傳與部署完整指引**
- [WORKLOG.md](WORKLOG.md) — **工作紀錄**（每次 round 的變更）
- [DECISIONS.md](DECISIONS.md) — **架構決策紀錄（ADR × 7）**

### 姊妹文件（同 Cowork session 產出）
- [Petoi 機器狗程式研究筆記](../Petoi_程式研究筆記.md) — 56 skills、ASCII 協定、servo 編號真相的來源
- [Petoi BittleX / BiBoard 對照](../Petoi_BittleX_BiBoard_對照.md) — 未來可能擴充支援 BiBoard
- [Petoi 模擬環境 5 階段執行計畫](../Petoi_模擬環境_執行計畫.md) — Three.js 3D 模擬呼應其階段 2
- [Petoi 研究工作紀錄](../Petoi_研究工作紀錄.md) — Petoi 研究過程的完整紀錄

## 多機器人擴充計畫

本工具設計為**多機器人積木編程平台**：

| 機器人 | 狀態 |
|---|---|
| Petoi Bittle | ✅ v0.1 已支援 |
| Micro:bit 自走車 | ⏳ v0.3 規劃 |
| 雙足機器人 | ⏳ v0.4 規劃 |
| Unitree Go1 | ⏳ v0.5 規劃 |

詳見 [docs/multi-robot-architecture.md](docs/multi-robot-architecture.md)。

## 授權

[MIT License](LICENSE)。Copyright © 2026 seyen37。歡迎 fork、PR、Issue。

## 致謝

- [Blockly](https://developers.google.com/blockly) — Google 開源
- [PetoiCamp/OpenCat-Quadruped-Robot](https://github.com/PetoiCamp/OpenCat-Quadruped-Robot) — Petoi 韌體
- 仿 [NUWA Kebbi codelab](https://codelab.nuwarobotics.com/) 的設計理念
