---
title: Petoi Bittle Koding — 架構規格書
version: 0.1.0 (MVP)
created: 2026-04-27
related:
  - ../README.md
  - ./roadmap.md
  - ../../Petoi_程式研究筆記.md（Bittle 研究筆記，提供 56 skills + ASCII 協定 + servo 編號真相）
---

# Petoi Bittle Koding — 架構規格書

## 0. 專案目標

為 Petoi Bittle（NyBoard 與 BiBoard 通用）提供 **Scratch-like 網頁編程工具**：

- 拖曳積木組合動作邏輯
- **雙模式執行**：SVG 模擬 vs 實機連線（Web Serial）
- 純前端、可直接部署到 GitHub Pages
- 中文（繁體）介面預設
- 開源 MIT，社群可擴充

仿 NUWA Kebbi 的 codelab 體驗，但底層改接 OpenCat 的 56 個內建 skills + ASCII 序列協定。

---

## 1. 技術棧

| 層 | 技術 | 理由 |
|---|---|---|
| 積木引擎 | **Blockly v10+ via CDN**（unpkg.com） | 最成熟、文件多、不需 build pipeline |
| 框架 | **純 HTML + Vanilla JS** | GitHub Pages 部署最簡單 |
| 樣式 | **手寫 CSS（CSS Variables + Flexbox）** | 三欄布局、深色主題 |
| 模擬器 | **SVG + JavaScript 動畫** | 輕量、易自訂 |
| 實機通訊 | **Web Serial API**（Chrome 89+） | 免裝驅動、跨平台 |
| Code 生成 | **JavaScript（async/await）** | 直接被 simulator 與 serial 執行 |
| 中文化 | **Blockly i18n + 自訂 toolbox 中文 label** | zh-hant 預設 |
| Build | **無**（直接 serve 靜態檔案） | 零 dependency hell |

---

## 2. 模組分工

```
┌─────────────────────────────────────────────────────────────┐
│ index.html (UI 骨架 + 內嵌 SVG + Blockly DOM 容器)         │
└──────┬───────────────────────┬───────────────────┬──────────┘
       │                       │                   │
       ▼                       ▼                   ▼
┌─────────────┐  ┌──────────────────────┐  ┌─────────────────┐
│ blockly-    │  │ bittle-blocks.js     │  │ bittle-         │
│ config.js   │  │ (10 個自訂積木 def)  │  │ generators.js   │
│ (toolbox    │  │                      │  │ (積木 → JS 碼)  │
│  XML)       │  └──────────────────────┘  └─────────────────┘
└─────────────┘                  │                   │
       │                          └─── 註冊到 ────────┘
       ▼                                Blockly
┌──────────────────────────────────────────────────────────────┐
│ main.js  (整合：Run 按鈕 → eval generated code → 派送指令)   │
│   ↓                                                          │
│   BittleApp.runtime.send(asciiCmd)                           │
│      ├─ if mode==='simulator' → simulator-svg.js             │
│      └─ if mode==='serial'    → serial.js                    │
└──────────────────────────────────────────────────────────────┘
       │                                      │
       ▼                                      ▼
┌──────────────────────┐              ┌─────────────────────────┐
│ simulator-svg.js     │              │ serial.js               │
│ (SVG 動畫，視覺反映  │              │ (Web Serial API 包裝，  │
│  walk/sit/rest 等)   │              │  送 ASCII 到實機 Bittle) │
└──────────────────────┘              └─────────────────────────┘
```

---

## 3. 資料流

```
[使用者拖積木]
        ↓
[Blockly workspace 變化]
        ↓
[按 ▶ Run 按鈕]
        ↓
[Blockly.JavaScript.workspaceToCode(workspace)]  → 生成 async JS code
        ↓
[main.js: new Function(`async () => { ${code} }`)()]
        ↓
[await BittleApp.runtime.send('kwkF')]
        ↓
       ┌─────── 模擬模式 ───────┐  ┌─────── 實機模式 ─────────┐
       │                        │  │                          │
       ▼                        │  ▼                          │
   simulator.executeSkill('kwkF')   serial.send('kwkF\n')     │
       │                        │  │                          │
       ▼                        │  ▼                          │
   [SVG 腿部動畫]               │  [USB Serial → Bittle 主板]
                                │
                                └→ Log 顯示在右下角
```

---

## 4. 積木分類（Toolbox 結構）

| 類別 | 顏色 | MVP 積木數 | 完整版目標 |
|---|---|---|---|
| **動作（Actions）** | 290（紫） | 6 | 56（全 OpenCat skills） |
| **Servo 控制** | 200（藍） | 2 | 5（含批次、讀取角度） |
| **感測器（事件）** | 50（綠） | 0 (MVP 跳過) | 6（lifted/dropped/IR/超音波/觸控/距離） |
| **流程控制** | 內建 | 5（Blockly 內建） | 同 |
| **數學** | 內建 | 5（Blockly 內建） | 同 |
| **變數** | 內建 | 內建 | 同 |
| **文字 / 列表** | 內建 | 內建 | 同 |
| **擴充模組** | 0 | 0 | OpenAI / IoT / Teachable Machine（後期） |

---

## 5. Bittle 積木全規格

### 5.1 MVP（v0.1.0）的 10 個積木

| ID | 顯示 | 對應 ASCII | 類別 |
|---|---|---|---|
| `bittle_walk_forward` | 走向前 | `kwkF` | 動作 |
| `bittle_walk_backward` | 倒退 | `kbk` | 動作 |
| `bittle_sit` | 坐下 | `ksit` | 動作 |
| `bittle_balance` | 站穩 | `kbalance` | 動作 |
| `bittle_rest` | 休息 | `krest` | 動作 |
| `bittle_hi` | 打招呼 | `khi` | 動作 |
| `bittle_servo_move` | 移動 servo [編號] 到 [角度]° | `m N angle` | Servo |
| `bittle_servo_move_pair` | 同時移動 servo [N1] [angle1] 與 [N2] [angle2] | `i N1 a1 N2 a2` | Servo |
| `bittle_beep` | 蜂鳴 [音高] [時長] | `b pitch dur` | 動作 |
| `bittle_wait` | 等待 [N] 秒 | `await wait(N)` | 流程 |

### 5.2 完整版（v1.0.0）規劃補入

**動作類（補 50 個）**：
- 步態：trF/trL/trR、crF/crL、bdF、jpF、phF/phL、vtF/vtL
- 姿勢：buttUp、stretch、up、zero、calib、dropped、lifted、lnd
- 表演：ang、bf/ff、bx、chr、ck、cmh、dg、fiv、gdb、hds、hg、hsk、hu、jmp、kc、mw、nd、pd、pee、pu/pu1、rc、rl、scrh、snf、tbl、ts、wh、zz

**事件積木（最重要的擴充）**：
- `bittle_on_lifted` — 當被舉起
- `bittle_on_dropped` — 當跌落
- `bittle_on_touch_head` — 當頭被觸碰
- `bittle_when_distance_lt` — 當超音波距離 < N cm
- `bittle_when_ir_detect` — 當紅外線偵測到

**讀取類**：
- `bittle_read_servo_angle` — 讀取 servo 角度
- `bittle_read_voltage` — 讀取電池電壓
- `bittle_read_distance` — 讀取超音波距離

---

## 6. SVG 模擬器設計

### MVP 範圍
- 顯示 Bittle 正面靜態圖
- 4 條腿（LF/RF/RB/LB）為獨立 SVG group，可動
- 對應 `walk` / `sit` / `balance` 動作的簡單腿部動畫
- 訊息 log 區顯示「正在執行 kwkF」等

### 完整版規劃
- 側面視角切換
- 詳細 servo 角度即時對應（呼應實機 servo 0/8-15 編號）
- 物理感（重心轉移、跌倒視覺）
- Three.js 3D 模式（載 Bittle URDF，呼應 Petoi_模擬環境_執行計畫.md 的階段 2）

---

## 7. Web Serial 實機連線

### MVP
- 「連線」按鈕 → `navigator.serial.requestPort()` 彈出 port 選擇
- 連上後，所有積木執行直接送 ASCII 到 Bittle
- log 區顯示送出與回應
- 「斷線」按鈕

### 完整版規劃
- 自動偵測 Petoi 裝置（vendor ID 過濾）
- 上傳自訂 skill 到 EEPROM（呼應主筆記附錄 F）
- 即時讀取 servo 角度回饋
- 多 Bittle 同時連線

---

## 8. 擴充點

未來新增積木的步驟：

```
1. 在 bittle-blocks.js 加 Block.Blocks['my_block'] 定義
2. 在 bittle-generators.js 加對應 Blockly.JavaScript['my_block'] 生成器
3. 在 blockly-config.js 的 TOOLBOX_XML 加 <block type="my_block"/>
4. 如果是新動作，在 simulator-svg.js executeSkill switch 加 case
5. （實機自動可用，因為 Web Serial 直送 ASCII）
```

---

## 9. GitHub Pages 部署

```bash
# 1. 建立 GitHub repo
git init
git add .
git commit -m "Initial commit: Petoi Bittle Koding MVP"
git remote add origin https://github.com/<your-username>/petoi-bittle-koding.git
git push -u origin main

# 2. 啟用 Pages
# 在 GitHub Repo Settings → Pages → Source 選 main branch / root

# 3. 訪問
# https://<your-username>.github.io/petoi-bittle-koding/
```

`.nojekyll` 檔案告訴 Pages 不要 Jekyll 處理，避免 `_` 開頭資料夾被忽略。

---

## 10. 已知限制與後續

| 限制 | 解法（roadmap） |
|---|---|
| Web Serial 只 Chrome/Edge 支援 | 提示 + 文件記錄 |
| Blockly CDN 依賴外部服務 | v0.2 改 vendor 進 repo |
| 沒有專案儲存（重整就消失） | v0.3 加 localStorage |
| 沒有事件積木 | v0.2 補 |
| SVG 模擬簡陋 | v0.4 升級 + Three.js 3D 選項 |
| 沒有多人協作 | 不做（純前端不可能，需後端） |

---

*本架構書 v0.1.0 (MVP) 完成於 2026-04-27。後續以 git commit 持續更新。*
