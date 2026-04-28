---
title: 多機器人擴充架構（Multi-Robot Architecture）
created: 2026-04-27
purpose: 為未來導入雙足機器人、Unitree Go1、microbit 自走車鋪路
related:
  - ../DECISIONS.md ADR-006（介面抽象決策）
  - ../js/robots/IRobot.js（介面 stub）
  - ./architecture.md（整體架構）
---

# 多機器人擴充架構

## 0. 為什麼這份文件存在

用戶手上有 4 個機器人，目標是讓**這套積木編程工具能逐步支援所有**：

| 機器人 | 通訊方式 | 動作風格 | 預估工作量 |
|---|---|---|---|
| Petoi Bittle ✅ | USB Serial（ASCII） | 56 預錄 skills + servo | 已完成 v0.1 |
| 雙足機器人 ⏳ | USB Serial（依型號） | 步行 + 平衡 | 中（需查具體型號協定） |
| Unitree Go1 ⏳ | UDP / DDS（需 Pi/Jetson 中介）| 預錄 + RL policy | 高（需架 bridge） |
| microbit 自走車 ⏳ | USB Serial（MakeCode 風格） | 馬達驅動 + 感測器 | 低（協定簡單） |

**不能寫死成「Bittle 專用」**。本工具的真正價值在於：**1 套介面 + N 種機器人**，學生 / 玩家換硬體不用換工具。

---

## 1. 架構設計（接 ADR-006）

```
┌──────────────────────────────────────────────────────────┐
│                     UI Layer (固定)                       │
│  index.html / Blockly workspace / 模擬器 / log / 按鈕     │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              Robot Registry (BittleApp.robots)            │
│  支援多 robot 註冊，UI 提供下拉切換                       │
└──────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬───────────────┐
        ▼                ▼                ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  IRobot      │ │  IRobot      │ │  IRobot      │ │  IRobot      │
│  Bittle      │ │  Biped       │ │  Go1         │ │  Microbit    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
        │                │                │               │
   每個 robot 各自實作 3 個東西：
        │                │                │               │
   ┌────┴────┐      ┌────┴────┐      ┌────┴────┐    ┌────┴────┐
   │ Blocks  │      │ Blocks  │      │ Blocks  │    │ Blocks  │
   │ Connector│     │Connector│      │Connector│    │Connector│
   │Simulator│      │Simulator│      │Simulator│    │Simulator│
   └─────────┘      └─────────┘      └─────────┘    └─────────┘
        │                │                │               │
        ▼                ▼                ▼               ▼
   USB Serial       USB Serial      WS → ROS bridge    USB Serial
   ASCII commands   ?               UDP / DDS          MakeCode-like
```

**3 個關鍵抽象**（已在 `js/robots/IRobot.js` 定義）：

| 介面 | 負責 | Bittle 範例 |
|---|---|---|
| `IRobot` | 機器人本身（元數據 + 註冊積木 + 工具箱）| `BittleRobot` |
| `IConnector` | 怎麼跟實機講話 | Web Serial 送 ASCII |
| `IRobotSimulator` | 怎麼用 SVG 視覺化 | `BittleSimulator`（已實作） |

---

## 2. 加新機器人 — Step by Step（以 microbit 自走車為例）

### Step 1：建資料夾

```
js/
└── robots/
    ├── IRobot.js              （介面，已存在）
    ├── bittle/                （v0.2 重構後）
    │   ├── BittleRobot.js
    │   ├── blocks.js
    │   ├── generators.js
    │   ├── connector.js
    │   └── simulator.js
    └── microbit-car/           ← 新增這個資料夾
        ├── MicrobitCarRobot.js
        ├── blocks.js
        ├── generators.js
        ├── connector.js
        └── simulator.js
```

### Step 2：實作 `MicrobitCarRobot extends IRobot`

```javascript
// js/robots/microbit-car/MicrobitCarRobot.js
class MicrobitCarRobot extends BittleApp.IRobot {
  get id() { return 'microbit-car'; }
  get displayName() { return 'Micro:bit 自走車'; }
  get version() { return '0.1.0'; }

  getCapabilities() {
    return ['forward', 'backward', 'turn-left', 'turn-right', 'stop',
            'sensor-light', 'sensor-distance'];
  }

  registerBlocks(Blockly) {
    // 在這裡定義 microbit 自走車的積木
    Blockly.Blocks['microbit_forward'] = {
      init: function() {
        this.appendDummyInput().appendField('🚗 前進');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(290);
      }
    };
    // ... 其他積木
  }

  registerGenerators(Blockly) {
    Blockly.JavaScript['microbit_forward'] = function(block) {
      return "await BittleApp.runtime.send('forward');\n";
    };
    // ... 其他 generators
  }

  getToolboxXmlSnippet() {
    return `
      <category name="🚗 自走車動作" colour="290">
        <block type="microbit_forward"></block>
        <block type="microbit_backward"></block>
        <block type="microbit_turn_left"></block>
        <block type="microbit_turn_right"></block>
        <block type="microbit_stop"></block>
      </category>
    `;
  }

  createConnector() {
    return new MicrobitCarConnector();
  }

  createSimulator(svgContainerEl) {
    return new MicrobitCarSimulator(svgContainerEl);
  }
}
```

### Step 3：實作 Connector（USB Serial 通訊）

```javascript
// js/robots/microbit-car/connector.js
class MicrobitCarConnector extends BittleApp.IConnector {
  isSupported() { return 'serial' in navigator; }
  isConnected() { return this.port !== null; }

  async connect() {
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.writer = this.port.writable.getWriter();
    BittleApp.log('已連接 microbit 自走車', 'success');
  }

  async send(command) {
    // microbit 通常吃自定義文字協定，如 'forward\n', 'turn 90\n'
    const data = new TextEncoder().encode(command + '\n');
    await this.writer.write(data);
    BittleApp.log('▶ 送出: ' + command);
  }

  async disconnect() {
    if (this.writer) await this.writer.close();
    if (this.port) await this.port.close();
    this.port = null;
  }
}
```

### Step 4：實作 Simulator（SVG 視覺）

```javascript
// js/robots/microbit-car/simulator.js
class MicrobitCarSimulator extends BittleApp.IRobotSimulator {
  constructor(containerEl) {
    super();
    // 載入車的 SVG（4 輪 + 車身），inject 到 container
    containerEl.innerHTML = MICROBIT_CAR_SVG;
    this.svg = containerEl.querySelector('svg');
    this.x = 200; this.y = 200; this.rotation = 0;
  }

  reset() {
    this.x = 200; this.y = 200; this.rotation = 0;
    this.updateSvg();
  }

  async executeCommand(command) {
    if (command === 'forward') {
      this.x += 30 * Math.cos(this.rotation * Math.PI / 180);
      this.y += 30 * Math.sin(this.rotation * Math.PI / 180);
      this.updateSvg();
      await this.sleep(500);
    }
    // ...
  }

  setStatus(text) { /* ... */ }

  updateSvg() {
    const car = this.svg.querySelector('#car-body');
    car.setAttribute('transform', `translate(${this.x}, ${this.y}) rotate(${this.rotation})`);
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}
```

### Step 5：在 `index.html` 載入新 robot

```html
<!-- 既有 -->
<script src="js/robots/IRobot.js"></script>

<!-- 新加：每個 robot 自己的檔案 -->
<script src="js/robots/microbit-car/connector.js"></script>
<script src="js/robots/microbit-car/simulator.js"></script>
<script src="js/robots/microbit-car/MicrobitCarRobot.js"></script>
<script>
  BittleApp.registerRobot(new MicrobitCarRobot());
</script>
```

### Step 6：UI 加 robot 選擇下拉（v0.2 規劃）

```html
<select id="robot-selector">
  <option value="bittle">Petoi Bittle</option>
  <option value="microbit-car">Micro:bit 自走車</option>
  <option value="biped">雙足機器人</option>
  <option value="go1">Unitree Go1</option>
</select>
```

切換時：
1. 清空 Blockly workspace
2. 重新生成 toolbox（用所選 robot 的 `getToolboxXmlSnippet()` + 通用積木）
3. 重新建立 simulator（替換右側模擬器區）
4. `BittleApp.runtime.connector` 與 `BittleApp.runtime.simulator` 換成新 robot 的實例

---

## 3. 各機器人特殊考量

### 3.1 Petoi Bittle（已實作 v0.1）

| 面向 | 設定 |
|---|---|
| 通訊 | USB Serial 115200 baud |
| 指令格式 | ASCII（kwk, ksit, m 0 30, ...） |
| 積木分類 | 動作 / Servo / 聲音時間 |
| 模擬 | SVG 4 腿擺動 |

### 3.2 雙足機器人（待用戶提供型號 + 協定）

**需要您提供的資訊**：
- 機器人型號（如 OTTO DIY、Bioloid、Robotis OP3、Unitree H1...）
- 通訊方式（USB Serial / Bluetooth / WiFi？）
- 指令協定（自定義 ASCII / JSON / Dynamixel protocol？）
- 內建動作或要從零控制 servo？

**實作大略**：
- Connector：通常也是 Web Serial（但可能不同 baud / parity）
- Blocks：「前進、後退、左轉、右轉、蹲下、揮手」等步行類為主
- Simulator：SVG 兩腿 + 重心偏移視覺（比 Bittle 更難，因為平衡是核心）

### 3.3 Unitree Go1

**核心挑戰**：Go1 不直接走 USB Serial，要透過 Pi / Jetson 上的 bridge。

**架構**：

```
瀏覽器（Blockly Koding）
    │
    │ WebSocket
    ▼
Pi/Jetson 上的 ROS bridge（Node.js / Python）
    │
    │ UDP / DDS
    ▼
Go1 main controller (STM32H743)
```

**實作大略**：
- Connector：`Go1Connector`，封裝 WebSocket 連到您指定的 bridge URL
- Bridge 是另一個獨立專案（可參考主 Petoi 研究筆記姊妹文件 Go1 部分）
- Blocks：「行走（連續）/ 切換步態 / 拍照 / 讀感測器」
- Simulator：可借用 PetoiCamp 不同 repo 的 URDF（Go1 也有 URDF）

### 3.4 microbit 自走車

| 面向 | 設定 |
|---|---|
| 通訊 | USB Serial（micro:bit 是 serial device） |
| 指令格式 | 自定義（看您的 micro:bit code 怎麼解析） |
| 積木分類 | 自走車動作 / 感測器（光、距離、傾斜） |
| 模擬 | SVG 4 輪 + 平移旋轉 |

---

## 4. 通用積木（不屬於任何 robot）

不論哪個 robot，這些積木都能用（Blockly 內建）：
- 流程控制（重複、迴圈、if-else、while）
- 數學（運算、隨機、三角函數）
- 變數
- 文字 / 列表
- 函式

**未來也可加**：
- OpenAI 對話積木（呼叫 API）
- IoT MQTT 積木
- Teachable Machine 積木

這些「擴充積木」要設計成 robot-agnostic（不依賴特定 robot）。

---

## 5. 遷移路線圖

| 階段 | 工作 | 預估 |
|---|---|---|
| **v0.1**（now）| 純 Bittle MVP，IRobot 介面只是 stub | ✅ 已完成 |
| **v0.2** | 把 Bittle 重構為 `BittleRobot extends IRobot`，現有 code 不變但結構整齊 | 1-2 週 |
| **v0.3** | UI 加 robot 切換下拉、加第 1 個第二機器人（建議從 microbit 自走車開始 — 最簡單）| 2-3 週 |
| **v0.4** | 加雙足機器人（看具體型號難度）| 3-6 週 |
| **v0.5** | 加 Go1（含 ROS bridge 子專案 + WebSocket connector）| 6-12 週 |
| **v1.0** | 4 機器人都能切換、共用 workspace 概念、教學任務卡 | 累計 6-12 個月 |

---

## 6. 維護原則

1. **加 robot = add 新檔案，不改舊檔案**
2. **Robot 之間的積木互相獨立，不共用 ID**（避免 namespace clash）
3. **通用積木統一在 `js/blockly-config.js` 的 toolbox 末段**
4. **每加一個 robot，更新 DECISIONS.md（如有架構決策）+ WORKLOG.md（一定）**

---

## 7. 給未來的我（您回頭看本檔時）

如果您未來想加新機器人但忘了流程，重點順序：

1. **問**：這個 robot 用什麼通訊？（決定 Connector）
2. **問**：這個 robot 的「動作詞彙」是什麼？（決定 Blocks）
3. **問**：怎麼用 SVG 視覺化？（決定 Simulator — 可以很簡陋，能看到反應就好）
4. **看**：Bittle 資料夾的 4 個檔案結構，依樣畫葫蘆
5. **照**：本檔 Step 1-6 操作

如果連這個都太困難，回頭看本檔，或開新 Cowork session 帶上 ADR-006 + 這份文件，AI 助理會幫您實作。

---

*多機器人架構設計 v1.0 完成於 2026-04-27。實作從 v0.2 開始，本檔隨進度更新。*
