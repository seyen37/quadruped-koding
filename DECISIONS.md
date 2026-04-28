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

## 📑 ADR 速查索引

| ADR | 決策 | 結論 |
|---|---|---|
| 001 | 積木引擎選型 | **Blockly v10**（vs Scratch Blocks / Snap!）|
| 002 | 部署方式 | **純前端 + GitHub Pages**（vs npm/framework）|
| 003 | 模擬器技術 | **MVP 用 SVG，v0.4+ 加 Three.js 3D**（vs Canvas） |
| 004 | 實機通訊 | **Web Serial API**（vs WebUSB / 後端中介）|
| 005 | Code 生成目標 | **JavaScript async/await**（vs Python / 純 ASCII） |
| 006 | 多機器人架構 | **IRobot 介面抽象 + 每 robot 一資料夾** |
| 007 | 授權選擇 | **MIT License + 真名「許士彥」**（vs GPL / 閉源）|
| 008 | v0.2 積木擴充 | **Metadata-driven 生成**（vs 手寫 50 個 boilerplate）|
| 009 | 3D mesh 來源 | **Procedural Three.js geometry**（vs 載入真實 STL）|
| 010 ⭐ | 產品命名 | **DogLab Coding**（避免 Petoi Bittle 商標爭議）|

未來 ADR 從 011 起編號。

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

## ADR-008：v0.2 動作積木採 metadata-driven 生成（vs 手寫 boilerplate）

**Status**: Accepted（2026-04-28）
**Context**：v0.1 手寫 6 個動作積木已寫了 ~250 行 boilerplate（每個積木要寫 Block.Blocks definition + Generator + 加到 toolbox）。v0.2 要 50 個積木，照這寫法會變 2000+ 行。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Metadata-driven（一個 array 定義全部，loop 生成）** | DRY、新增 skill 改 1 行、tooltip/animation/category 統一在 metadata | 失去「每個積木細節都能客製」的彈性 |
| 手寫每個積木 | 最大彈性 | 2000+ 行 boilerplate、新增 skill 要改 5 個地方 |
| Code generator（從 array 自動產生 .js 檔，build pipeline）| 兩全其美 | 引入 build pipeline 違背 ADR-002（純前端 + 零 build） |

### Decision

選 **Metadata-driven**（純執行期，不引入 build pipeline）。

### Implementation

新檔 `js/bittle-skills-data.js` 是單一資料源（SSOT），含 `BITTLE_SKILLS` array：

```javascript
BittleApp.BITTLE_SKILLS = [
  { id: 'walk_forward', name: '走向前', emoji: '🚶',
    ascii: 'kwkF', category: 'gait', anim: 'walk',
    tooltip: 'walk forward — 對角腿輪流擺動前進' },
  ...
];
```

`bittle-blocks.js` loop 自動 register：
```javascript
BittleApp.BITTLE_SKILLS.forEach((skill) => {
  Blockly.Blocks['bittle_' + skill.id] = { init: ... };
});
```

`bittle-generators.js`、`blockly-config.js` toolbox、`simulator-svg.js` skillAnimMap 都吃同一份 metadata。

### Rationale

1. **51 個積木的 boilerplate 不可維護** — 加新 skill 不能要改 5 個檔
2. **保留純前端**（與 ADR-002 一致）
3. **效能不變** — Blockly.Blocks 註冊本來就是執行期動作
4. **積木細節彈性**：只有少數需要 input slot 的積木（servo / beep / wait）保留手寫

### Consequences

- ✅ 加 skill 只改 `bittle-skills-data.js` 一個檔
- ✅ tooltip / animation / category 集中管理
- ✅ codebase 從 ~600 行 boilerplate 縮為 ~200 行
- ❌ 失去「每個積木視覺超客製」的能力（接受 — 對 50+ 個 skill 來說沒人會想為每個寫獨特 UI）
- ⚠️ Animation library 限 13 種，部分 skill 對應不夠精準（如 backflip 對應 jump）— 接受，視覺只是示意

### 對未來機器人擴充的影響

ADR-006 多機器人架構與本決策**完美契合**：每個 robot 各自有自己的 `<robot>-skills-data.js`，loop 機制可重用。

雙足 / microbit / Go1 都可採同樣 metadata-driven 模式。

---

## ADR-009：v0.4 3D 模擬器採 procedural mesh（vs 載入真實 STL/FBX）

**Status**: Accepted（2026-04-28）
**Context**：用戶提供 Petoi 官方 STEP（9 MB）/ FBX（4.4 MB）/ STL（36 MB，736K 三角面）。v0.4 要 Three.js 3D 模擬，模型有 4 個來源選擇。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| **Procedural mesh**（Box/Sphere/Cylinder 拼） | 無外部依賴、檔案最小（~10 KB）、GitHub Pages 友善、無授權問題 | 視覺較簡化，不像實機 |
| 載入真實 STL（36 MB） | 視覺最像實機 | 36 MB 對 Pages 太大、Petoi IP 授權不明、736K 面拖慢渲染 |
| 簡化版 STL（Blender decimation 到 ~5K 面）| 視覺接近實機、檔案 ~1 MB | 用戶要本地用 Blender 簡化、Petoi IP 仍不能公開 commit |
| 載入 FBX（4.4 MB） | 含可能骨架 rigging | 仍是 Petoi 內部資料 IP 問題、檔案大 |
| Runtime 用戶上傳（File API） | 完全規避 IP 問題 | 用戶體驗不佳（每次要載入） |

### Decision

選 **Procedural mesh**。

### Rationale

1. **教育用途夠用**：Bittle Koding 主要是讓使用者學編程，不是看精細外觀。Procedural Bittle（藍灰機身 + 4 條黑腿 + 兩眼）視覺上一目了然「是隻機器狗」就達成目的。
2. **無 IP 風險**：與 ADR-007（保有著作權 + MIT 開源）一致 — 不能上 Petoi 內部 STEP/FBX 到 Public repo。
3. **與 ADR-002 一致**（純前端 + GitHub Pages）：純 Three.js geometry 用 ~10 KB 程式碼定義，不需 mesh 檔案 hosting。
4. **效能**：procedural mesh 約 ~50 個 triangle，遠優於真實 STL 的 736K。
5. **未來可擴充**：保留 STL loader stub，未來如有授權清楚的簡化 mesh，加 file input 即可。

### Implementation

新檔 `js/simulator-3d.js` 實作：
- Body：BoxGeometry(200×60×100)
- Head：Group（含 SphereGeometry head + 雙眼 + 嘴）→ 旋轉 = head pan
- 4 條腿：每條 Group（含 upper + knee Group）→ 旋轉 = shoulder/knee
- 13 種 animation 對應主筆記附錄 D 的 skill 類型

### Consequences

- ✅ 整個 3D 模擬器只 ~10 KB（與 v0.1 SVG 同量級）
- ✅ GitHub Pages 部署無需任何 mesh 檔案
- ✅ Three.js v0.160 透過 importmap CDN 載入，零 build pipeline
- ✅ 與 v0.1 SVG simulator 共用 BITTLE_SKILLS metadata（不重複定義 animation 對應）
- ❌ 視覺較「方塊感」，實機愛好者可能想要更像
- ⚠️ 未來如要真實 mesh，要解決 IP + 簡化 + hosting 三道關卡

### 對多機器人擴充（ADR-006）的影響

未來每個 robot 各有自己的 procedural mesh：
- microbit 自走車：Box body + 4 個 Cylinder 輪子
- 雙足機器人：Box torso + 2 條腿 group
- Unitree Go1：類似 Bittle 但更大、更多關節

每個 robot 的 `createSimulator(container)` 回傳該 robot 的 3D simulator 實作。

---

## ADR-010：產品改名為 DogLab Coding（避免 Petoi Bittle 商標爭議）

**Status**: Accepted（2026-04-28）
**Context**：本工具初版命名為「Petoi Bittle Koding」，包含「Petoi」「Bittle」兩個廠商商標。隨工具擴充（多機器人架構、Three.js 3D、開放給社群），用商標作工具名有侵權與品牌混淆風險。

### Options

| 方案 | 優點 | 缺點 |
|---|---|---|
| 保留「Petoi Bittle Koding」| 已有 GitHub repo / Pages URL / commit 歷史 | **商標侵權風險、品牌混淆** |
| **改 DogLab Coding**（中文：動感小狗 編程實驗室）| 中性、有實驗室教育感、與多機器人擴充一致 | 改名工程量、URL 變化 |
| 改 Quadruped Koding | 描述精準（四足）| 較學術、不夠親切 |
| 改 PupCode / PuppyBlocks | 親切簡潔 | 已有同名工具/擴充 |

### Decision

選 **DogLab Coding**（用戶決定）。

### Rationale

1. **「DogLab」=「狗實驗室」**，傳達「玩 + 實驗 + 教育」的定位
2. **中文「動感小狗 編程實驗室」**朗朗上口
3. **與多機器人擴充規劃契合**：未來支援雙足/microbit 也能在 DogLab 概念下放（強調「實驗室」)
4. 完全脫離 Petoi 商標，符合 ADR-007（保有著作權 + 開源）的精神

### Implementation

| 改動 | 範圍 |
|---|---|
| GitHub repo 名 | `petoi-bittle-koding` → **`quadruped-koding`**（兩個帳號都改） |
| GitHub Pages URL | `https://seyen37.github.io/petoi-bittle-koding/` → `/quadruped-koding/` |
| 工具標題 / brand | `Petoi Bittle Koding` → `DogLab Coding` |
| index.html title | 同上 |
| README.md 全文 | 同上 |
| Pages 顯示 emoji | 🐕 → 🐕‍🦺（導盲犬，更有「教育/實驗」感） |
| 商標使用 | 「Bittle」「Petoi」**僅在描述支援硬體時保留**，明示無附屬關係 |

**保留不改的**：
- LICENSE 著作權人「許士彥」
- 內部 namespace `BittleApp`（technical debt，未來 ADR-011 可改）
- JS 檔名 `bittle-blocks.js` 等（這些是「Bittle 機器人」的積木定義檔，名稱仍合理）
- 主筆記姊妹文件名（研究筆記主題就是 Bittle 機器人，名稱保留）

### Consequences

- ✅ 完全規避商標爭議
- ✅ 工具定位清晰（多機器人實驗室）
- ✅ 與「許士彥」著作權主張一致（自主開發品牌）
- ⚠️ GitHub Pages URL 變化，舊書籤失效（GitHub 會自動 redirect 至新 URL，但需重新部署 Pages）
- ⚠️ 內部 namespace `BittleApp` 暫保留（未來改名工程量大，獨立 ADR 處理）

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
