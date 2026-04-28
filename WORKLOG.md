---
title: Petoi Bittle Koding — 工作紀錄
purpose: 記錄每次開發 round 的變更、決策與下一步
format: 倒序（最新在最上方）
related:
  - ./DECISIONS.md（架構決策記錄 ADR）
  - ./README.md
---

# 工作紀錄（WORKLOG）

> **每次完成一段工作後 append 一個 Round 條目**。包含：日期、變更摘要、commit message 建議、下一步。

---

## Round 14 — 2026-04-28 — v0.4.4 walk/pushUp 加大幅度 + 規劃 v0.6 IR 遙控

### 用戶反饋
v0.4.3 的 walk / pushUp 改善不夠明顯（用戶實機觀察「左右擺動」「腳長變化」效果仍不到位）。

### 變更
- **`js/simulator-3d.js` walk**：rotation.z 從 ±0.08 → **±0.22（約 ±13°）** + 加 position.x ±8 mm 左右滑移
- **`js/simulator-3d.js` walkReverse**：同樣加大
- **`js/simulator-3d.js` pushUp**：position.y 振幅從 50 → **105 mm**（-75 ~ +30）
- **`js/simulator-svg.js` walk / walkReverse**：腿擺動幅度從 ±20°/±10° → **±35°/±15°**（同側腿一起、強化左右搖視覺）
- **`docs/roadmap.md` 新增 v0.6.0 紅外線遙控模擬**：21 按鈕虛擬遙控器、IR Code 對照、自定義按鈕

### 用戶提供的參考機器狗（給附錄 E.4 用）
2 款其他四足機器狗截圖（具體型號待確認）：

| 款式 | 特色 |
|---|---|
| 黑色 AI 大模型款（似 XGO / Hiwonder PuppyPi Pro 級）| 語音大模型 + 視覺大模型 + 多模態大模型 + SLAM + 機械臂 + 表情顯示 + 20 組仿生動作 |
| 綠色 Maker 款（似 Adeept / Yahboom 級）| RPi/Jetson + 鋁合金結構 + 超音波 + 鏡頭 |

→ 主筆記附錄 E.4「其他四足機器狗對照」會補上（下個 round 處理）

### 用戶提到的「未來方向」
- 紅外線遙控器模擬 → 已加進 roadmap v0.6
- 多機器人感測器擴充（語音 / SLAM / 視覺大模型）→ 已在 ADR-006 多機器人架構規劃內

### Commit message 建議
```
fix(animations): increase walk and pushUp animation amplitudes for visibility
feat(roadmap): plan v0.6 IR remote simulator (21-button virtual remote)
```

### 下一步建議
1. push
2. 試新動畫，walk 應該明顯左右搖晃、pushUp 整體上下大幅振盪
3. 如果還不對，請用戶具體描述「應該長什麼樣」（例如錄個實機影片片段）

---

## Round 13 — 2026-04-28 — v0.4.3 修正 walk / pushUp 動畫以符合實機 4-bar 彈簧腿機構

### 用戶實機觀察（重要技術洞察）
從用戶提供的 6 張 Bittle 實機照片發現：

**Bittle 真實腳部結構**：
- 上腿（黃色塊）+ 下腿（黑色）之間用**金屬彈簧**連接
- 整體是 **4-bar linkage（四連桿機構）+ compliant spring** 設計
- Servo 旋轉時，4-bar 連動 → 腳掌位置與方向都改變
- 不是傳統的「肩 + 膝 兩段獨立旋轉」

**對動畫的影響**：
| Skill | 原本動畫（錯）| 實機真實表現 |
|---|---|---|
| `walk` | 對角腿前後擺動 | **左右擺動 + 重心轉移**（同側腿一起動）|
| `pushUp` | 4 腿膝蓋彎到 60° | **整體上下**（彈簧腳長變化，腿不彎膝）|

### 變更
- **`js/simulator-3d.js` walk**：對角腿前後擺 → **同側腿一起 + bittle.rotation.z ±0.08 重心轉移**
- **`js/simulator-3d.js` walkReverse**：方向反向，邏輯同上
- **`js/simulator-3d.js` pushUp**：4 腿彎膝 → **保持伸直，bittle.position.y 在 -45 ~ +5 振盪**（模擬彈簧腳長）
- **`js/simulator-svg.js` walk / walkReverse / pushUp**：同樣調整（SVG 沒 z 軸，用同側腿一起擺動暗示左右搖晃）
- **加註解**：兩個 simulator 開頭加「實機 4-bar linkage + 彈簧腿設計，walk = 左右擺動、pushUp = 整體上下」說明

### 待辦（不在這個 round）
主筆記 `Petoi_程式研究筆記.md` Part 1.3 應補一段「腿部 4-bar linkage + 彈簧機構」說明（這是個重要技術細節，原本只寫 servo 編號沒提機構）。下個 round 處理或專門開一個 round 更新主筆記。

### Commit message 建議
```
fix(animations): walk and pushUp now match real Bittle 4-bar spring-leg mechanics

- Walk: side-to-side body sway instead of diagonal leg swing
- PushUp: vertical body bounce (spring compression) instead of knee bend
- Reflect user's hands-on observation of real hardware
```

### 下一步建議
1. push
2. Pages 1-3 分鐘後重整
3. 切到 3D 試「走向前」與「伏地挺身」，確認動畫接近實機

---

## Round 12 — 2026-04-28 — v0.4.2 加 3D 主題切換（暗黑/灰調/明亮）

### 變更
- **`js/simulator-3d.js` 加主題系統**：
  - 3 個 preset：`dark`（原配色）/ `studio`（中性灰）/ `light`（明亮）
  - 每個 preset 含：背景、地面、grid、環境光 4 個顏色設定
  - `applyTheme(name)` 動態套用
  - `cycleTheme()` 循環切換
- **浮動「🌑 暗黑」按鈕**：自動 inject 到 3D canvas 右上角，點擊循環 3 主題
- 點擊按鈕後文字變化：`🌑 暗黑` → `🌗 灰調` → `☀️ 明亮` → 循環

### 為什麼
用戶反饋：地板太深色不舒服。提供 3 種選項讓不同偏好都滿意。

### Commit message 建議
```
feat(3d): add cycling theme toggle (dark / studio / light) for 3D simulator floor
```

### 下一步建議
1. push
2. Pages 更新後切到 3D，右上角會多一個「🌑 暗黑」按鈕
3. 連點 3 次循環 3 主題，挑喜歡的

---

## Round 11 — 2026-04-28 — v0.4.1 配色微調（提高 3D 模擬器對比度）

### 變更
- **`js/simulator-3d.js` 配色升級**：
  - 背景：`0x2c313c`（暗灰）→ `0x4a5466`（中灰）
  - 地面：`0x1a1d24` → `0x2a313e`（略亮）
  - 身體：`0x2a3f5f`（深藍）→ `0x4a7fc1`（亮藍）
  - 腿部：`0x3a3a3a`（深灰）→ `0xc0c0c0`（銀灰金屬感）
  - 關節球：藍色 → **橘色 `0xffb84a` + 強 emissive**（高對比 accent）
  - 環境光：`0x666666` → `0xa0a0a0`（更亮）
  - 主方向光 intensity：0.8 → 1.0
  - 藍色補光 intensity：0.3 → 0.5
  - **新增 rimLight** 暖色背光（右後方）讓輪廓亮起

### 為什麼改
用戶反饋：身體深藍 + 腿部深灰 + 背景深灰，整個融在一起看不清楚。新配色讓銀灰腿在中灰背景上明顯凸顯，橘色關節球作為高對比 accent，整體立體感大增。

### Commit message 建議
```
fix(3d): improve color contrast and lighting for 3D simulator visibility
```

### 下一步建議
1. push
2. Pages 1-3 分鐘後重整 https://seyen37.github.io/petoi-bittle-koding/
3. 切到 3D 確認 Bittle 清楚可見

---

## Round 10 — 2026-04-28 — v0.4 Three.js 3D 模擬器一氣呵成

### 變更
- **新增 `js/simulator-3d.js`**（~340 行）：Three.js BittleSimulator3D class，含 procedural Bittle mesh + 13 種 3D animation + OrbitControls
- **更新 `index.html`**：加 Three.js v0.160 importmap、3D simulator 容器、模擬器標題列加「2D/3D 切換」按鈕、ES module script 載入 simulator-3d.js
- **更新 `css/style.css`**：加 panel-header / btn-mini / simulator-3d-area 樣式
- **更新 `js/main.js`**：BittleApp.runtime.simMode 切換、btn-sim-mode click handler
- **新增 ADR-009**：紀錄 procedural mesh vs 真實 STL 的取捨

### 為何選 procedural mesh 而非真實 STL/FBX
詳見 DECISIONS.md ADR-009。簡述：
1. 用戶 STL 有 736K 面、36 MB，對 GitHub Pages 不友善
2. Petoi STEP/FBX 內部資料授權不明，不能上 Public repo
3. 教育用途用 Box/Sphere/Cylinder 拼出 Bittle 形狀已足夠

### v0.4 3D 模擬器特性
- **視覺**：藍灰機身 + 黑色 4 腿 + 藍色關節球 + 雙眼發光
- **互動**：OrbitControls（滑鼠拖拉旋轉、滾輪縮放、右鍵平移）
- **光照**：環境光 + 主光源（含陰影）+ 藍色補光
- **動畫**：13 種，與 SVG 模擬器使用相同 BITTLE_SKILLS metadata（共用 animation 對應）
- **3D 加分動作**：jump 真的會跳起、sit 整體下沉並前傾、shake 有 z 軸搖擺

### Commit message 建議
```
feat: v0.4 add Three.js 3D simulator with procedural Bittle mesh

- New simulator-3d.js with OrbitControls + 13 animations
- Add Three.js v0.160 via importmap CDN
- Add 2D/3D toggle button in simulator panel
- Procedural mesh (no external STL needed) — see ADR-009
- Animation library reuses BITTLE_SKILLS metadata (DRY)
```

### 下一步建議
1. push 到兩個 GitHub
2. Pages 等 1-3 分鐘自動更新
3. 訪問 https://seyen37.github.io/petoi-bittle-koding/ 測試 3D
4. 點 simulator 區頂部「🎬 切到 3D」按鈕，3D Bittle 出現
5. 滑鼠拖拉旋轉視角，按各種積木看 3D 動畫

### 學到的經驗
- Three.js v0.160 已不支援 examples/js（UMD），必須用 importmap + ES module
- ES module script 是 implicit deferred，會在所有 sync script 之後執行 — 完美時機 init 3D simulator
- BITTLE_SKILLS metadata 設計（ADR-008）讓 SVG 與 3D simulator 共用 animation 對應，零重複

---

## Round 9 — 2026-04-28 — v0.2 動作積木擴充：6 → 51 個（metadata-driven 重構）

### 變更
- **新增 `js/bittle-skills-data.js`**：BITTLE_SKILLS 單一資料源，51 個 skill metadata（13 步態 + 8 姿勢 + 30 表演動作）
- **重構 `js/bittle-blocks.js`**：loop 自動 register 50+ 個 Blockly.Blocks，只保留 hat/reset/servo/beep/wait 手寫
- **重構 `js/bittle-generators.js`**：loop 自動 register generators
- **重組 `js/blockly-config.js` toolbox**：動作分類拆成「步態 / 姿勢 / 表演動作」3 個 sub-category，每個顯示積木數量
- **擴充 `js/simulator-svg.js` animation library**：從 5 種擴到 13 種（walk/walkReverse/sit/rest/balance/hi/jump/kick/pushUp/shake/nod/stretch/buttUp）+ generic shake fallback
- **更新 `index.html` 載入順序**：bittle-skills-data.js 必須在 blocks/generators 之前
- **新增 ADR-008** 紀錄 metadata-driven 設計決策

### 新增的 51 個 skill 摘要
| 類別 | 數量 | 範例 |
|---|---|---|
| 🚶 步態 (gait) | 13 | walk_forward, trot, crawl, bound, jump, vault, push_walk, walk_left/right, ... |
| 🧍 姿勢 (posture) | 8 | balance, sit, rest, up, zero, calib, stretch, butt_up |
| 🎭 表演動作 (show) | 30 | hi, handshake, hug, kick, push_up, scratch, sniff, roll, moonwalk, nod, sleep, ... |

### 為什麼這樣做（架構洞察）
v0.2 後仍會持續加 skill，加上未來雙足/Go1/microbit 各自會有 50+ 個動作。如果繼續手寫 boilerplate 就會崩潰。Metadata-driven 是**為多機器人擴充鋪路的關鍵改造**。

### Commit message 建議
```
feat: v0.2 expand to 51 action blocks via metadata-driven refactor

- Add bittle-skills-data.js as single source of truth (SSOT)
- Refactor blocks.js / generators.js to loop-generate from metadata
- Reorganize toolbox into gait / posture / show sub-categories
- Expand simulator animation library from 5 to 13 types
- Add ADR-008 documenting metadata-driven design decision
```

### 下一步建議
1. 重整 GitHub Pages（push 完等 1-3 分鐘）→ 訪問 https://seyen37.github.io/petoi-bittle-koding/
2. 驗證 toolbox 顯示「步態(13)」「姿勢(8)」「表演動作(30)」三個分類
3. 測試新積木（如「跳躍」「踢腿」「點頭」）的 SVG 動畫
4. （可選）下一個 round 開始 v0.2 事件積木（lifted/dropped/...）

### 學到的經驗
- Blockly toolbox XML 用 getter 延遲求值：因 BITTLE_SKILLS 在另一個檔，要等載入後才能組裝 XML
- `BittleApp.BITTLE_SKILLS.forEach` 這個 idiom 很乾淨，新增 skill 只改 metadata 就生效

---

## 🎉 Round 8 — 2026-04-28 — GitHub Pages 正式上線

### 里程碑
**v0.1.0 MVP 公開可用**：
```
https://seyen37.github.io/petoi-bittle-koding/
```

任何人不必裝任何軟體，瀏覽器打開即可使用 Bittle Koding 編程工具。

### 確認驗證項目
- ✅ Blockly toolbox 9 個分類完整中文顯示
- ✅ 「🟢 當程式開始」hat block 預載
- ✅ SVG Bittle 模擬器正常渲染（4 腿 + 頭 + 身體）
- ✅ 執行記錄即時輸出
- ✅ 模式 / 連接 / 停止 / 執行 4 按鈕正常

### 完成的智財保護
- ✅ LICENSE 真名「許士彥 (Hsu Shih-Yen)」+ MIT 授權
- ✅ 主 repo Public（社群分享）+ 備份 repo Private（災難恢復）
- ✅ Git commit 歷史 + GitHub timestamp = 公開時間戳證據
- ✅ Round 1-7 所有變更都已記錄在 WORKLOG.md（GitHub 可追溯）

### Commit message 建議（紀錄這次 WORKLOG 更新）
```
docs: log Round 8 — GitHub Pages live deployment milestone
```

### 下一步（用戶選一個方向）
- A. 補完 v0.2 的 50 個動作積木
- B. 加 v0.2 事件積木
- C. 開始第 2 個機器人（建議 microbit 自走車）
- D. 寫教學任務卡
- E. 實機測試（拿到 Bittle 時做）

---

## Round 7 — 2026-04-28 — 智財保護強化（LICENSE 真名 + 備份改 Private）

### 變更
- **LICENSE 改用真實姓名**：從 `Copyright (c) 2026 seyen37` 改為 `Copyright (c) 2026 許士彥 (Hsu Shih-Yen) (https://github.com/seyen37)`
- **備份 repo seyenbot/petoi-bittle-koding 改為 Private**（用戶在 GitHub UI 操作）

### 為什麼這樣改
1. **真名強化法律舉證**：著作權糾紛時不需額外證明「seyen37 是您本人」
2. **GitHub 連結方便識別**：保留化名作為連結 anchor，不影響識別性
3. **備份 Private 避免混淆**：別人不會誤抓備份的舊版本，主 repo 仍維持 Public 對外

### Commit message 建議
```
docs: strengthen IP protection — real name in LICENSE
```

### 下一步（用戶要做）
1. 確認 LICENSE 變動：`type LICENSE` 看新內容
2. push 到兩邊 GitHub
3. 確認 https://github.com/seyenbot/petoi-bittle-koding 已是 Private（訪問會 404 表示成功）

### 沒新增 ADR 的理由
本次屬於「執行 ADR-007 的細節調整」，不是新架構決策。LICENSE 改名 + 備份 Private 都符合 ADR-007「保有智財 + 開源分享」的原則。

---

## Round 6 — 2026-04-28 — 雙 GitHub 帳號 SSH 設置 + 實際上傳成功

### 完成事項
- ✅ 用戶照 dual-github-setup.md Phase 1-2 生成兩組 SSH key（seyen37 + seyenbot）
- ✅ 兩個公鑰分別上傳到對應的 GitHub 帳號 settings/keys
- ✅ `~/.ssh/config` 設定兩個 host alias
- ✅ `ssh -T git@github.com-seyen37` 與 `git@github.com-seyenbot` 都成功（"Hi seyen37/seyenbot! ..."）
- ✅ 在兩個 GitHub 帳號各建空 repo `petoi-bittle-koding`
- ✅ 本地 `git init` + `git remote add origin` + `git remote add backup`
- ✅ `git push -u origin main` 成功（27 個檔案、50.11 KiB → seyen37/petoi-bittle-koding）
- ✅ `git push -u backup main` 成功（同樣 27 個檔案 → seyenbot/petoi-bittle-koding）

### 上線網址（待啟用 Pages 後可訪問）
- 主：https://github.com/seyen37/petoi-bittle-koding
- 備份：https://github.com/seyenbot/petoi-bittle-koding
- Pages（待啟用）：https://seyen37.github.io/petoi-bittle-koding/

### 下一步（用戶要做）
1. 在 seyen37 repo 啟用 GitHub Pages（Settings → Pages → main / root → Save）
2. 等 1-3 分鐘訪問 https://seyen37.github.io/petoi-bittle-koding/
3. （可選）設定 Phase 7「一鍵 push 兩邊」省事

### Commit message 建議（這次的 WORKLOG 變動本身也要 commit）
```
docs: log Round 6 — successful dual GitHub setup and push
```

### 學到的經驗
- 用戶一次性把 SSH 設置走完，沒卡關
- `~/.ssh/config` 用 host alias 設計很乾淨，兩帳號完全分離
- Phase 7「一鍵 push」是良好的 ergonomics 改善，建議設定

---

## Round 5 — 2026-04-27 — 雙 GitHub 帳號 SSH 設置指引（文件）

### 變更
- **新增 docs/dual-github-setup.md**：完整 SSH key 設置 + 多 remote 配置指引

### 變更
- **新增 docs/dual-github-setup.md**：完整 SSH key 設置 + 多 remote 配置指引
- 涵蓋：兩組 SSH key 生成、`~/.ssh/config` host alias 區分、兩個 GitHub 帳號加 SSH key、雙 remote 設定、「一個 push 同步兩邊」進階設定、故障排除

### 為什麼這樣設計
用戶有 2 個 GitHub 帳號（主：seyen37、備份：seyenbot）。SSH key 比 PAT 更務實：
- 一次設定終身免輸密碼
- Host alias 清晰分離
- 可設「一鍵 push 兩邊」

詳見 docs/dual-github-setup.md Phase 0 解說。

### Commit message 建議（這份指引也要 push 上去）
```
docs: add dual GitHub account SSH setup guide for backup workflow
```

### 下一步
1. 用戶照 dual-github-setup.md Phase 1-6 設置（30-45 分鐘）
2. push 完即可訪問 https://seyen37.github.io/petoi-bittle-koding/
3. 同時 seyenbot/petoi-bittle-koding 作為備份

---

## Round 4 — 2026-04-27 — UI 修復 + 多機器人架構鋪路 + 文件體系建立

### 變更
- **修 UI**：`style.css` 加 Blockly toolbox 字色 override，解決左側分類文字對比不足問題
- **新增 IRobot 介面**：`js/robots/IRobot.js` 定義機器人抽象，為未來雙足/Go1/microbit 鋪路
- **新增多機器人架構文件**：`docs/multi-robot-architecture.md` step-by-step 解釋如何加新機器人
- **新增決策紀錄**：`DECISIONS.md` 含 7 個 ADR（架構決策記錄）
- **新增工作紀錄**：本檔 `WORKLOG.md`
- **新增 GitHub 上傳指引**：`docs/github-deploy-guide.md`
- **新增 LICENSE**（MIT）+ `.gitignore`
- **README** 補連結到新文件

### Commit message 建議
```
feat: add multi-robot architecture, UI dark theme fix, and project documentation

- Add IRobot interface stub for future biped/Go1/microbit support
- Fix Blockly toolbox text contrast for dark theme
- Add WORKLOG.md and DECISIONS.md (7 ADRs) for traceability
- Add GitHub deploy guide and MIT LICENSE
- Reference: GitHub publishing setup
```

### 下一步建議
- 用戶按 git 上傳指引推到 GitHub
- 啟用 GitHub Pages
- 開始補完 v0.2 的 50 個動作積木（步態、表演動作）

---

## Round 3 — 2026-04-27 — Blockly generator 修復 + hat block 加入

### 變更（bug 修復為主）
- **修 root cause**：`index.html` 加 `javascript_compressed.js` script tag（少了這行 Blockly.JavaScript.workspaceToCode 回傳空字串，造成執行沒反應）
- **鎖 Blockly 版本**到 v10（避免 v11 breaking change）
- **新增 hat block**：「🟢 當程式開始」、「🔄 重置 Bittle」（仿 Scratch / NUWA 設計）
- **更新 toolbox**：最上方加「🟢 開始與重置」分類
- **更新 main.js**：Run 按鈕現在會 log 出生成的 code，方便除錯
- **新增範例文件**：`docs/examples.md` 6 個照著拖就會動的範例

### 學到的經驗
- Blockly v10+ 把 JavaScript generator 拆成獨立 .js 檔案，必須單獨載入
- v11 有 breaking change，鎖版本到 v10 比較穩

---

## Round 2 — 2026-04-27 — SVG 渲染修復

### 變更
- **修 SVG bug**：CSS `transform-box: fill-box` 與 SVG `<g transform="translate(...)">` 衝突，腿部位置錯亂
- **重構 SVG 結構**：改用「外層 group 定位 + 內層 group 旋轉」標準做法
- **更新 simulator-svg.js**：`setLeg` 簡化為只設 rotate、`animateSit/Rest` 改用腿姿表達（不再動 body）

### 學到的經驗
- SVG 屬性 transform 與 CSS transform-box 不要混用
- 用「分層 group」處理「定位 + 旋轉」更穩

---

## Round 1 — 2026-04-27 — MVP 初版建置

### 變更（從零建立）
- 建立專案資料夾 `petoi-bittle-koding/`
- 12 個檔案（HTML/CSS/JS/SVG/markdown）
- Blockly v10 整合 + 中文化（zh-hant）
- 10 個 Bittle 自訂積木：6 動作 + 2 servo + 蜂鳴 + 等待
- SVG 模擬器骨架（4 腿可動）
- Web Serial API 連線骨架
- `docs/architecture.md` 規格書、`docs/roadmap.md` v0.1 → v1.0 路線圖

### 技術選型（背景請見 DECISIONS.md）
- Blockly（vs Scratch Blocks / Snap!）→ ADR-001
- 純 HTML + Vanilla JS + GitHub Pages（vs npm + framework）→ ADR-002
- SVG 模擬（vs Canvas / Three.js）→ ADR-003
- Web Serial API（vs WebSocket / WebUSB）→ ADR-004
- JS 作為 generator 目標（vs Python / 純 ASCII）→ ADR-005

---

## Round 0 — 2026-04-27 — 需求接收與規劃

### 用戶提出
- 仿 NUWA Kebbi codelab 的網頁編程體驗
- 給 Petoi Bittle 用
- SVG 模擬 + 連實機雙模式
- 完整版 3-6 個月（業餘時間）
- 部署到 GitHub Pages 開源
- 「我代寫 + 用戶測試」分工

### 規劃決定
- v0.1 MVP 優先：能跑 + 看到動畫 + 可連 Serial
- v0.2-v1.0 擴充規劃寫進 `docs/roadmap.md`
- 直接基於主筆記 Part 2.2/2.3 的 ASCII 協定 + skill 結構真相

---

## 紀錄格式說明

未來每個 Round 條目應包含：

| 欄位 | 內容 |
|---|---|
| **標題** | `## Round N — YYYY-MM-DD — 一句話摘要` |
| **變更** | 條列改了哪些檔、為什麼 |
| **Commit message 建議** | 給用戶複製去 git commit -m 用 |
| **下一步** | （可選）下一個 round 的方向提示 |
| **學到的經驗** | （可選）值得記錄給未來的 |

順序是**倒序**（最新放上面），方便快速看現況。

---

*WORKLOG 從 v0.1.0 開始記錄。本檔每次工作結束時 append 一個 Round。*
