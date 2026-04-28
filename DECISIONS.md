---
title: Petoi Bittle Koding — 架構決策記錄（ADR）
purpose: 記錄每個關鍵架構決策的背景、選項、決策、權衡，方便未來遷移到雙足/Go1/microbit 等新硬體時參考
format: 仿 Michael Nygard 的 ADR 格式（標準業界做法）
related:
  - ./WORKLOG.md（變更紀錄）
  - ./docs/multi-robot-architecture.md（多機器人擴充）
  - ./docs/architecture.md（整體架構）
---

# 架構決策紀錄（Architecture Decision Records）

> **ADR 是什麼**：在做關鍵架構決策時記下「為什麼選 A 不選 B」，避免未來回頭問「當初為什麼這樣？」
> 每個 ADR 是不可變的（immutable），如要改變決定就寫新 ADR 並標註 Supersedes。

---

## ADR-001：選 Blockly 作為積木引擎

**Status**: Accepted（2026-04-27）
**Context**：需要 Scratch-like 拖曳積木介面，候選方案有 3 個。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Blockly**（Google） | 文件最完整、CDN 直載免 build、社群大、可自訂積木與 generator | 介面較「工程感」、不像 Scratch 圓潤 |
| Scratch Blocks | 視覺最接近 Scratch、兒童友善 | 需 npm + build pipeline、自訂積木較複雜、文件較少 |
| Snap! | 開源 BSD、Berkeley 學術背景、第一階函式 | 客製化門檻最高、社群最小 |

### Decision

選 **Blockly**。

### Rationale

1. **零 build pipeline** — GitHub Pages 部署最簡單
2. **CDN 直接載入** — 不需要 webpack / vite
3. **自訂積木最直覺** — `Blockly.Blocks['my_block'] = {...}` 一行搞定
4. **生成 JavaScript / Python / C 都支援** — 未來生成不同目標 code 不用換引擎
5. **社群文件最豐富** — 出問題容易找答案

### Consequences

- ✅ 部署超簡單（純靜態檔案）
- ✅ 自訂積木 / generator 高度彈性
- ❌ 視覺不如 Scratch Blocks 圓潤（用 CSS theming 緩解）
- ❌ Blockly v11 有 breaking change，要鎖 v10（已在 Round 3 處理）

### 對未來機器人擴充的影響

新增雙足 / Go1 / microbit 機器人時：
- 重用整個 Blockly 引擎（無需換）
- 只需在 `js/robots/<robot-name>/blocks.js` 加新積木定義
- 詳見 `docs/multi-robot-architecture.md`

---

## ADR-002：純前端 + GitHub Pages 部署，不用 npm / framework

**Status**: Accepted（2026-04-27）
**Context**：需要快速部署 + 開源分享。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **純 HTML + Vanilla JS** | 零依賴、GitHub Pages 直接 serve、初學者好懂 | 沒有元件化、長期擴充可能變混亂 |
| Vite + React/Vue | 元件化、TypeScript 支援、HMR 開發快 | 要 build、要用 GitHub Actions 部署、依賴鏈長 |
| Next.js / Nuxt | SSR / ISR / 完整框架 | overkill — 純前端工具不需要 |

### Decision

選 **純 HTML + Vanilla JS（v0.1 - v1.0）**。

### Rationale

1. **GitHub Pages 部署成本 0** — push 完幾分鐘就上線
2. **沒有 node_modules 地獄** — 用戶 fork 後 Chrome 雙擊就能跑
3. **debug 簡單** — 沒有 source map / build artifact 困擾
4. **學習曲線最低** — 學生想看程式碼直接打開就好

### Consequences

- ✅ 部署 / fork / 學習門檻低
- ✅ 適合教育用途
- ⚠️ 達 ~5000 行 code 可能要重構元件化
- ❌ 沒有 TypeScript 安全網（用 JSDoc 註解補強）

### 何時要 reconsider

- 當 codebase > 5000 行
- 當需要 SSR / SEO（教育工具用不到）
- 當要做 PWA（可後加，不必整體重構）

---

## ADR-003：SVG 模擬器（vs Canvas / Three.js）

**Status**: Accepted for MVP（2026-04-27）；3D 規劃在 v0.4
**Context**：需要視覺化機器人動作。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **SVG**（v0.1） | DOM 化、CSS 動畫、易修改、accessibility 好 | 大量元素效能差、3D 困難 |
| Canvas 2D | 效能好、像素級控制 | DOM 操作不便、accessibility 差 |
| Three.js（WebGL）| 3D 真實感、光影、物理 | 載入慢、URDF 整合複雜、初學者門檻高 |

### Decision

**MVP 用 SVG**；**v0.4 加 Three.js 3D 模式**作為選項（不取代 SVG）。

### Rationale

1. **MVP 重點是「能看到動作」**，不需要物理擬真
2. **SVG 改外型最快** — Bittle / 雙足 / Go1 各自的 SVG 圖檔幾分鐘畫好
3. **未來雙足 / Go1 也能 SVG 化**（簡化代表即可，不必精細模型）
4. **3D 留給「研究模擬」階段**（呼應主研究筆記《Petoi_模擬環境_執行計畫.md》）

### Consequences

- ✅ MVP 1 週內可看到效果
- ✅ 4 條腿 / 2 條腿 / 4 輪自走車 SVG 都不難
- ❌ 沒有重力 / 物理感（Round 4 暫不要求）
- ❌ 3D 視覺要等 v0.4

### 對多機器人的影響

新增雙足 / Go1 / microbit 模擬時：
- 每個 robot 有自己的 SVG 檔案（`assets/<robot>.svg`）
- 各自實作 `IRobotSimulator` 介面（在 `js/robots/<robot>/simulator.js`）
- 共用同一個 SVG 動畫框架（CSS transition + JS attribute setter）

---

## ADR-004：Web Serial API 連實機（vs WebSocket / WebUSB / 後端中介）

**Status**: Accepted（2026-04-27）
**Context**：要從瀏覽器送指令到 USB 接的實機機器人。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Web Serial API** | 瀏覽器原生、免裝驅動、跨平台、Chrome 89+ 支援 | 只 Chrome/Edge、必須 https/localhost、user gesture 才能用 |
| WebUSB | 也是瀏覽器原生、可用於非 serial 裝置 | 需在 OS 層 claim interface（Win 麻煩）、文件少 |
| 後端中介（Python/Node 跑 serial） | 不限瀏覽器 | 要架伺服器（破壞「純前端」目標） |
| 桌面 App（Electron/Tauri） | 全功能 | 要打包跨平台、用戶要安裝 |

### Decision

選 **Web Serial API**。

### Rationale

1. **與「純前端 + GitHub Pages」目標一致**（不破壞 ADR-002）
2. **連實機 Bittle 完美** — 115200 baud serial 是 Petoi 標準
3. **適用 microbit、Arduino-based 雙足**（都走 USB serial）
4. **Go1 不適用**（Go1 用 UDP / DDS，不是 serial）— 但 Go1 本來就要中介機（Pi/Jetson），這是另一條路

### Consequences

- ✅ 實機連線無需安裝任何軟體
- ✅ Bittle / microbit / Arduino-based 雙足都通用
- ❌ Firefox / Safari 不能用實機模式（顯示警告，仍可用模擬）
- ❌ 必須 http://localhost 或 https（file:// 不行）— 文件已說明

### 對多機器人的影響

| 機器人 | 通訊 | 適用 Web Serial？ |
|---|---|---|
| Petoi Bittle | USB Serial 115200 baud | ✅ |
| Arduino-based 雙足 | USB Serial | ✅ |
| Microbit 自走車 | USB Serial（Microbit 是 serial device） | ✅ |
| **Unitree Go1** | UDP / DDS（需 Pi/Jetson 中介） | ❌ — 改實作 `Go1Connector` 走 WebSocket 連 Pi/Jetson 上的 bridge |

詳見 `docs/multi-robot-architecture.md` 的 Connector 抽象。

---

## ADR-005：Code 生成目標選 JavaScript（vs Python / 純 ASCII）

**Status**: Accepted（2026-04-27）
**Context**：Blockly 可以生成多種語言，要選哪個作為「執行 code」？

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **JavaScript（async/await）** | 瀏覽器直接 `eval` / `new Function` 執行、可整合 Promise / setTimeout | 用戶看不懂可能不熟悉 |
| Python | 教學最普及、語法簡單 | 瀏覽器要 Pyodide / Brython（多 5MB+ 載入） |
| 純 ASCII（送指令清單） | 最直覺，與韌體協定 1:1 | 沒有流程控制、迴圈、變數 |

### Decision

選 **JavaScript（async/await）**。

### Rationale

1. **瀏覽器原生** — 0 額外載入
2. **`async/await` 完美對應「等動作完成再下一個」** — 這是機器人控制的核心需求
3. **Blockly JavaScript generator 最成熟** — 支援所有內建積木
4. **未來想 export Python 也容易** — 在 generator 多寫一份就好（Blockly.Python['xxx']）

### Consequences

- ✅ 生成 code 直接 `new Function(code)()` 執行
- ✅ 跟 Web Serial / setTimeout / Promise 完美整合
- ❌ 用戶看「View Code」會看到 `await BittleApp.runtime.send(...)` — 要稍微解釋
- ❌ 想學 Python 的用戶要靠 export 功能（v0.5 規劃）

### 對多機器人的影響

每個機器人實作各自的 `runtime.send(asciiCommand)`，generator 統一呼叫這個函式 — generator 不需 know robot 是誰。

---

## ADR-006：「機器人介面」抽象（IRobot）

**Status**: Accepted（2026-04-27）
**Context**：用戶有 4 個機器人會要支援（Bittle、雙足、Go1、microbit）。如何讓 codebase 不會 if/else 滿天飛？

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Interface 抽象**（IRobot）+ 每個 robot 一個資料夾 | 清晰 separation、新增 robot 是 add-only | 需要前期設計、稍微 over-engineer for 1 robot |
| 全部寫在 main.js 用 if/else 切 | 短期最快 | 加第 2 個 robot 就會失控 |
| 用 class inheritance（BittleRobot extends BaseRobot） | OOP 標準做法 | Vanilla JS 沒 TS 型別檢查、容易破壞 LSP |

### Decision

選 **Interface 抽象 + 每 robot 一個資料夾**。

### Rationale

1. **用戶明確說「未來導入雙足/Go1/microbit」** — 必須事先設計
2. **Add-only 是維護性最好的模式** — 加 robot 不動現有 code
3. **教育用途的代碼也要乾淨** — 學生看了知道怎麼擴充

### Interface 規範

```javascript
// js/robots/IRobot.js
class IRobot {
  // 元數據
  get id() { /* 如 'bittle', 'biped', 'go1' */ }
  get displayName() { /* 如 'Petoi Bittle' */ }
  get version() { /* 如 'v0.1.0' */ }

  // 積木定義
  registerBlocks(Blockly) { /* 註冊自訂積木 */ }
  registerGenerators(Blockly) { /* 註冊 code 生成器 */ }
  getToolboxXmlSnippet() { /* 回傳該機器人專屬的 toolbox category XML */ }

  // 連線（實機）
  createConnector() { /* 回傳 IConnector 物件，封裝 Web Serial / WebSocket / UDP-via-bridge */ }

  // 模擬器（視覺）
  createSimulator(svgContainerEl) { /* 回傳 IRobotSimulator 物件 */ }

  // 元數據查詢
  getCapabilities() { /* 回傳該機器人能做什麼，如 ['walk', 'turn', 'sit'] */ }
}
```

詳細實作範例與 step-by-step「如何加 robot」見 `docs/multi-robot-architecture.md`。

### Consequences

- ✅ 加新 robot 只需 add files，不動現有
- ✅ 切換 robot 在 UI 加 dropdown 即可
- ✅ Code base 結構與「擴充想法」對齊
- ❌ 為 1 個 robot 寫 interface 略 over-engineer（接受，因為計畫至少 4 robot）

---

## ADR-007：用戶選 MIT License（vs GPL / 閉源）

**Status**: Accepted（2026-04-27）
**Context**：用戶希望「保有智慧財產權 + 開源分享」。

### Options

| 授權 | 商用 | 衍生需開源 | 著作權保留 |
|---|---|---|---|
| **MIT** | ✅ | ❌（衍生可閉源） | ✅（必須保留 LICENSE） |
| Apache 2.0 | ✅ | ❌ | ✅ + 專利保護 |
| GPL-3.0 | ✅ | ✅（衍生必須 GPL） | ✅ |
| AGPL | ✅ | ✅（含網路服務） | ✅ |
| All Rights Reserved（不開源） | — | — | ✅ |

### Decision

選 **MIT**。

### Rationale

1. **保有著作權** — 任何人 fork 都要保留 LICENSE 與 copyright notice
2. **接受度最高** — 教育機構、公司、個人都不會猶豫使用
3. **與「開源社群分享」目標一致** — 用 GPL 會讓部分用戶卻步
4. **「自主開發」的智財不會丟** — 用戶仍是著作人

### Consequences

- ✅ 任何人能用、改、商用，但都要記得作者
- ✅ 上傳 GitHub 公開無風險
- ❌ 商業公司可能 fork 後改成商用閉源（接受，因為 MIT 預期如此）
- ⚠️ 如未來想要更嚴格（如「衍生必須開源」），可改 GPL — 但會 break 已下載的用戶承諾

### 替代方案（如要改）

如要更嚴格保護：
- **GPL-3.0**：衍生作品必須開源
- **Dual License**：開源 GPL + 商業需付費（適合產品化）

---

## 未來新增 ADR 的時機

當您（或我）做以下決策時，請新增 ADR：

| 決策類型 | 範例 |
|---|---|
| 引入新依賴 | 「決定用 Three.js 而非 Babylon.js 做 3D」 |
| 改變現有架構 | 「v0.5 引入 React 元件化」 |
| 新增主要機器人 | 「為 Go1 設計 WebSocket bridge 而非直連」 |
| 改變部署方式 | 「從 GitHub Pages 改 Cloudflare Pages 因為 X 原因」 |
| 改變授權 | 「從 MIT 改 GPL-3.0 因為 X 原因」 |

格式：複製本檔已有的 ADR 結構（Status / Context / Options / Decision / Rationale / Consequences）。

---

*ADR 第 1-7 號完成於 2026-04-27。新 ADR 編號從 008 開始，**永遠 append，不修改既有 ADR**（如要修改，新 ADR 標註 Supersedes ADR-XXX）。*
