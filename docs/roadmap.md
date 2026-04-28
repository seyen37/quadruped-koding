# Petoi Bittle Koding — 開發路線圖

## v0.1.0 — MVP（已完成 2026-04-27）

✅ Blockly 整合（CDN 載入，繁體中文介面）
✅ 三欄布局（積木 toolbox / workspace / 模擬器+log）
✅ 10 個 Bittle 自訂積木（6 動作 + 2 servo + 蜂鳴 + 等待）
✅ Code 生成器（積木 → async JS code）
✅ SVG 模擬器（4 條腿可動，walk/sit/balance/hi 動畫）
✅ Web Serial API 連線骨架（Connect / Send / Disconnect）
✅ 模式切換（模擬 vs 實機）
✅ Run / Stop / 執行記錄 log
✅ GitHub Pages 部署設定

---

## v0.2.0 — 補完核心積木 + 專案儲存（預估 1-2 週）

### 動作積木補完（從 6 → 約 56）

依主筆記附錄 D，加入：

**步態**：
- [ ] `bittle_trot_forward/left/right`（trF/trL/trR）
- [ ] `bittle_crawl_forward/left`（crF/crL）
- [ ] `bittle_bound`（bdF）
- [ ] `bittle_jump`（jpF, jmp）
- [ ] `bittle_push_walk`（phF/phL）
- [ ] `bittle_vault`（vtF/vtL）

**姿勢**：
- [ ] `bittle_butt_up`（buttUp）
- [ ] `bittle_stretch`（str）
- [ ] `bittle_up_pose`、`bittle_zero`、`bittle_calib`
- [ ] `bittle_dropped`、`bittle_lifted`、`bittle_lnd`

**表演動作**：
- [ ] handshake（hsk）、hug（hg）、wave hand（wh）
- [ ] high five（fiv）、good boy（gdb）、cheers（chr）
- [ ] dig（dg）、scratch（scrh）、sniff（snf）
- [ ] roll（rl）、kick（kc）、boxing（bx）
- [ ] backflip / frontflip（bf, ff）
- [ ] pee（pee）、play dead（pd）
- [ ] sleep（zz）、moonwalk（mw）
- [ ] check（ck）、come here（cmh）
- [ ] handstand（hds）、hands up（hu）
- [ ] nod（nd）、push up（pu, pu1）
- [ ] table（tbl）、test servo（ts）
- [ ] angry（ang）、recover（rc）

→ 用 metaprogramming 一次定義，避免 56 個 boilerplate

### 事件積木（v0.2 重點）

- [ ] `bittle_when_lifted` — 帽形積木，當被舉起觸發
- [ ] `bittle_when_dropped` — 當跌落觸發
- [ ] `bittle_when_distance_lt` — 當超音波距離小於 N cm
- [ ] `bittle_when_ir_signal` — 當紅外線收到信號
- [ ] `bittle_when_touch_head` — 當頭被觸碰
- [ ] `bittle_when_voltage_lt` — 當電池電壓低於 N

實作方式：
- 模擬模式：右側面板加按鈕模擬觸發
- 實機模式：背景 setInterval 輪詢狀態，觸發對應事件 handler

### 專案儲存（localStorage）

- [ ] 自動儲存 workspace XML 到 localStorage（每次更動）
- [ ] 「新增專案 / 開啟專案 / 刪除專案」UI
- [ ] 匯出 / 匯入 .xml 檔案

---

## v0.3.0 — 模擬器升級（預估 1-2 週）

### SVG 模擬器深化

- [ ] 側面視角切換（顯示步態起伏）
- [ ] Servo 編號實時對應（顯示 servo 0/8-15 各角度數值）
- [ ] 物理感（重心轉移、跌倒視覺、被舉起時懸空）
- [ ] 感測器視覺：頭部觸碰（紅光）、紅外線範圍（光錐）、超音波距離（圓圈）
- [ ] 環境物件：地面紋理、障礙物、目標點

### 與 v0.2 事件積木整合

- [ ] 點擊 SVG 上的腿可觸發 `when_touch` 事件
- [ ] 拖移虛擬「障礙物」測試 `when_distance_lt` 事件
- [ ] 「被舉起」按鈕觸發 IMU 事件

---

## v0.4.0 — Three.js 3D 模擬（預估 2-4 週）

呼應主筆記《Petoi_模擬環境_執行計畫.md》的階段 2-3。

- [ ] Three.js 整合（CDN）
- [ ] 載入 Bittle URDF（從 AIWintermuteAI/Bittle_URDF）
- [ ] 簡化的物理（不上 Cannon.js / Ammo.js，用近似動力）
- [ ] 鏡頭控制（旋轉、縮放、平移）
- [ ] 「2D / 3D 切換」按鈕

⚠️ **挑戰**：URDF 載入到 Three.js 需要 `urdf-loader` 函式庫；3D 動畫對應 servo 角度需要更複雜的 IK；可能要 web worker 不阻塞 UI。

---

## v0.5.0 — 擴充積木（預估 4-8 週）

### Open AI 擴充

- [ ] `openai_ask` 積木：把使用者輸入丟給 GPT 取回答
- [ ] `openai_chat_history` 積木：保留對話脈絡
- [ ] 設定 API key UI（存 localStorage，警告不要 commit）

### IoT 擴充

- [ ] `mqtt_publish` / `mqtt_subscribe` 積木（用 mqtt.js）
- [ ] `webhook_send` 積木（fetch 包裝）

### Teachable Machine 整合

- [ ] 嵌入 Teachable Machine 模型 URL → 積木執行影像分類
- [ ] 結果觸發對應 Bittle 動作

### Petoi 特定擴充

- [ ] `bittle_upload_skill` — 用 `K` token 上傳自訂 skill 到 EEPROM
- [ ] `bittle_read_servo_angle` — 用 `j` token 讀取
- [ ] `bittle_read_battery` — 用 `R` token 讀電池電壓

---

## v1.0.0 — 完整版（預估 3-6 個月總計）

### 多語系
- [ ] zh-TW / zh-CN / en / ja 切換

### 教學系統
- [ ] 任務卡（仿 NUWA「任務卡」設計）
- [ ] 內建範例專案（人氣小店長 / 輔導小老師 / 活潑機器人互動）
- [ ] 互動式教學引導

### 社群功能
- [ ] 「Share」按鈕：把 workspace XML 編碼成 URL，分享連結
- [ ] 「Embed」按鈕：產生 iframe HTML 給部落格嵌入

### 進階
- [ ] 暗 / 亮主題切換
- [ ] 自訂積木顏色 / 主題
- [ ] 鍵盤快捷鍵
- [ ] 響應式設計（平板可用）
- [ ] 無障礙（鍵盤導航、screen reader）

---

## 不會做的（範圍外）

- ❌ 多人協作（純前端做不到，需要後端伺服器）
- ❌ 雲端儲存（同上）
- ❌ 帳號系統 / 個人化（同上）
- ❌ 後端執行 ASCII 指令（純前端 + Web Serial 已涵蓋）
- ❌ 編譯到 Bittle 韌體（OpenCat 是 Arduino C++，不在本工具範圍）

如果未來要做這些，就要從「純前端」升級為「全端」（加 Node.js/Python 後端 + 資料庫）。

---

## 預估時程總覽

| 版本 | 累計工作量（單人業餘）|
|---|---|
| v0.1 (MVP) | 已完成 |
| v0.2 | 1-2 週 |
| v0.3 | 1-2 週 |
| v0.4 | 2-4 週 |
| v0.5 | 4-8 週 |
| v1.0 | 額外 4-8 週（多語、任務卡、社群、優化） |
| **總計到 v1.0** | **約 3-6 個月** |

---

*此 roadmap v0.1 完成於 2026-04-27。每次發布新版本後更新。*
