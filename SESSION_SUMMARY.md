---
title: DogLab Coding — Session 1 開發總結
session: 2026-04-27 ~ 2026-04-28（單一 Cowork session）
status: v0.4.11，22 個 round 完成
purpose: 讓未來新 session 能快速接續本專案開發
---

# DogLab Coding — Session 1 開發總結

## 🎯 一句話現況

從 0 起步，23 個 round 內**完成可上線使用的 Scratch-like 機器狗編程實驗室**：51 個動作積木 + Three.js 3D 模擬器 + Web Serial 連實機 + 多機器人擴充架構。已部署 GitHub Pages、改名為 DogLab Coding 規避商標爭議、雙 GitHub 備份 + 跨電腦 git pa workflow 全部就位。

## 📊 量化成果

| 指標 | 數據 |
|---|---|
| 開發 round | **23 個** |
| 程式碼檔案 | **24 個**（HTML / CSS / JS / Markdown） |
| 動作積木 | **51 個**（13 步態 + 8 姿勢 + 30 表演動作） |
| Animation library | **13 種**（walk / sit / hi / jump / kick / pushUp...） |
| ADR 架構決策 | **10 個** |
| 文件頁面 | **8 份**（README / architecture / roadmap / examples / multi-robot / github-deploy / dual-github / WORKLOG / DECISIONS） |
| GitHub repo | 雙帳號（seyen37 主、seyenbot 備份 Private） |
| Pages URL | `https://seyen37.github.io/quadruped-koding/` |

## 🏗️ 技術棧

```
┌─────────────────────────────────────────────────────────┐
│ UI: HTML + Vanilla JS + Blockly v10（CDN）             │
├─────────────────────────────────────────────────────────┤
│ 模擬器：SVG（2D） + Three.js v0.160（3D，importmap）   │
├─────────────────────────────────────────────────────────┤
│ 實機通訊：Web Serial API（Chrome 89+）                 │
├─────────────────────────────────────────────────────────┤
│ 部署：GitHub Pages（純靜態，零 build pipeline）         │
└─────────────────────────────────────────────────────────┘
```

## 🎨 v0.4.11 已實作的功能

### 編程介面
- ✅ Blockly 中文化（zh-hant）
- ✅ Toolbox 11 個分類（開始與重置 / 步態 13 / 姿勢 8 / 表演動作 30 / Servo / 聲音時間 / 流程 / 數學 / 變數 / 文字 / 擴充規劃中）
- ✅ 「🟢 當程式開始」hat block 預載
- ✅ 51 個 Bittle 動作積木（metadata-driven 自動生成）
- ✅ Servo 0/8-15 編號（對應實機真相）
- ✅ Run / Stop / Mode 切換

### 模擬器
- ✅ 2D SVG（4 腿可動，13 種動畫）
- ✅ 3D Three.js（procedural Bittle mesh，含彈簧 + 4-bar 連動）
- ✅ 「2D / 3D」切換按鈕
- ✅ OrbitControls（拖拉旋轉、滾輪縮放）
- ✅ 主題切換（暗黑 / 灰調 / 明亮）
- ✅ 仿實機配色：黃黑機身 + 銀色彈簧 + 橘色 LED + 藍眼

### 實機連線
- ✅ Web Serial API（115200 baud）
- ✅ 自動偵測 + 容錯
- ✅ 模擬與實機切換

### 多機器人擴充準備
- ✅ `IRobot` / `IConnector` / `IRobotSimulator` 介面定義
- ✅ `docs/multi-robot-architecture.md` step-by-step 指引
- ⏳ 雙足 / Go1 / microbit 待實作

## 📋 10 個架構決策（ADR）摘要

| # | 主題 | 結論 |
|---|---|---|
| 001 | 積木引擎 | Blockly v10 |
| 002 | 部署 | 純前端 + GitHub Pages |
| 003 | 模擬器 | SVG（MVP）+ Three.js 3D（v0.4）|
| 004 | 實機通訊 | Web Serial API |
| 005 | Code 生成 | JavaScript async/await |
| 006 | 多機器人 | IRobot 介面抽象 |
| 007 | 授權 | MIT + 真名「許士彥」 |
| 008 | v0.2 積木 | Metadata-driven 自動生成 |
| 009 | 3D mesh | Procedural（不用真實 STL） |
| 010 | 產品命名 | DogLab Coding（避免 Petoi 商標）|

完整內容見 [DECISIONS.md](DECISIONS.md)。

## 🗺️ 開發路線圖（已完成 vs 待續）

| 版本 | 狀態 | 內容 |
|---|---|---|
| v0.1 MVP | ✅ | 10 個積木 + SVG + Web Serial 骨架 |
| v0.2 | ✅ | 51 個動作積木 + metadata-driven |
| v0.3 | ⏭️ 跳過 | （SVG 模擬器升級，被 v0.4 取代） |
| v0.4 | ✅ | Three.js 3D 模擬器 + 4-bar 彈簧腿 + 主題切換 |
| **v0.4.11** | ✅ **目前** | + 改名 DogLab Coding + 7 個視覺修正 |
| v0.5 | ⏳ | OpenAI / IoT / Teachable Machine 擴充積木 |
| v0.6 | ⏳ | 紅外線遙控模擬（21 鍵虛擬遙控器） |
| v0.7+ | ⏳ | 多機器人實作（microbit 自走車先） |
| v1.0 | ⏳ | 多語、教學任務卡、社群分享 |

## 🚧 下次回來可選的方向

| 選項 | 範圍 |
|---|---|
| **P. 改內部 namespace** `BittleApp` → `App`（清 ADR-010 的 technical debt） | 1 round |
| **F. 加事件積木**（lifted/dropped/distance hat blocks）| 1 週 |
| **L. v0.6 IR 遙控模擬**（21 鍵虛擬遙控器） | 1 週 |
| **G. 開始 microbit 自走車**（驗證多機器人架構） | 2 週 |
| **H. 寫教學任務卡**（仿 NUWA 人氣小店長） | 1 週 |
| **3D 視覺再微調**（如還有不對的地方） | 30 分 |

## 🔄 持續工作模式（給未來 AI 助理）

每次 round 結束**必須**：
1. **更新 `WORKLOG.md`** — append 新 Round 條目（日期、變更、commit message、下一步）
2. **更新 `DECISIONS.md`** — 如有架構決策，append 新 ADR
3. **驗證**：自我審查跨檔一致性
4. **提醒用戶 git push**：給 PowerShell 命令（不要混 cmd `::` 註解）

詳見 [WORKLOG.md 速查索引](WORKLOG.md#-round-速查索引) 與 [DECISIONS.md ADR 索引](DECISIONS.md#-adr-速查索引)。

## 💡 重要洞察與經驗教訓

1. **實機照片 / 影片是不可替代的資訊源**（從文字描述 4-bar 彈簧腿改了 5 次都不對，看影片 1 次就對）
2. **「左右擺動」這類中文口語對非機械工程師有歧義**（誤判 4 個 round，學到要改用「朝頭/朝尾巴」具體描述）
3. **Three.js axis 必須先單獨測試**（rotation.x vs .z 一個字母錯就視覺全錯，改了 4 次）
4. **PowerShell 命令不要混 cmd `::` 註解**（用戶照貼會報錯）
5. **Metadata-driven 設計值得早做**（v0.2 一改就解決所有 boilerplate 問題）
6. **規避商標**：Petoi / Bittle 等廠商商標只在「描述支援硬體」時保留，工具名要中性

## 📁 相關文件

### 工具內（git repo）
- [README.md](README.md) — 專案介紹、使用、部署
- [WORKLOG.md](WORKLOG.md) — 22 個 round 完整紀錄
- [DECISIONS.md](DECISIONS.md) — 10 個 ADR
- [docs/architecture.md](docs/architecture.md) — 整體架構規格
- [docs/multi-robot-architecture.md](docs/multi-robot-architecture.md) — 加新機器人指引
- [docs/roadmap.md](docs/roadmap.md) — v0.1 → v1.0 路線圖
- [docs/examples.md](docs/examples.md) — 6 個範例程式
- [docs/github-deploy-guide.md](docs/github-deploy-guide.md) — GitHub 部署
- [docs/dual-github-setup.md](docs/dual-github-setup.md) — 雙帳號 SSH 設置

### 姊妹文件（外部，非 git）
- `../Petoi_程式研究筆記.md` — Bittle 機器人完整研究（含 4-bar 彈簧腿機構說明）
- `../Petoi_BittleX_BiBoard_對照.md` — 未來升級參考
- `../Petoi_模擬環境_執行計畫.md` — 5 階段模擬環境路線
- `../Petoi_研究工作紀錄.md` — Petoi 研究 session 紀錄
- `../3d-models/petoi-bittle-evo/` — 用戶提供的 STEP/FBX/STL（不公開）

## 🔗 連結

| 資源 | URL |
|---|---|
| 線上版（Pages） | `https://seyen37.github.io/quadruped-koding/` |
| 主 repo | `https://github.com/seyen37/quadruped-koding` |
| 備份 repo | `https://github.com/seyenbot/quadruped-koding`（Private）|

---

*Session 1 結束於 2026-04-28。Round 1-23 完整紀錄。雙 GitHub backup + git pa workflow 已運作。下次新 Cowork session 開始時，AI 助理會自動延續本專案工作模式（記憶系統已存）。*

## 🛠️ 工作流速查（給未來自己）

```
開工：git pull
收工：git pa  （等同 git push origin main && git push backup main）
新 repo：兩邊 GitHub 各建空 repo → add origin/backup → push -u origin main && push -u backup main → 之後 git pa
跨電腦：~/.ssh/config 設 host alias、SSH key 各電腦各自生成，公鑰加到 GitHub
```

詳見 [`personal-playbook/PROJECT_PLAYBOOK.md`](https://github.com/seyen37/personal-playbook)（私人 repo）。
