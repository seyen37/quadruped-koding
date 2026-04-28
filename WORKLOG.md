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
