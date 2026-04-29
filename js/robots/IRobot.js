/* ==========================================================
   IRobot.js — 機器人介面（Interface）抽象
   ----------------------------------------------------------
   為什麼要抽象？
     用戶有 4 個機器人會支援：Petoi Bittle、雙足、Unitree Go1、microbit
     這個介面讓「加新機器人」是 add-only 操作，不動現有 code

   設計細節見：
     - DECISIONS.md ADR-006（為何選 interface 抽象）
     - docs/multi-robot-architecture.md（step-by-step 如何加新 robot）

   v0.1 MVP 階段：
     - 本檔僅是 stub interface 與註解
     - 現有 main.js 還沒重構為使用 IRobot
     - v0.2 計畫把 Bittle 包成符合 IRobot 的標準實作
   ========================================================== */

window.DogLabApp = window.DogLabApp || {};

/**
 * 機器人介面 — 所有機器人實作都要 conform to this
 *
 * @interface
 */
class IRobot {
  // ===== 元數據 =====

  /** @returns {string} 唯一 ID，如 'bittle', 'biped-mk1', 'go1', 'microbit-car' */
  get id() {
    throw new Error('Not implemented: id');
  }

  /** @returns {string} 顯示名稱，如 'Petoi Bittle (NyBoard V1)' */
  get displayName() {
    throw new Error('Not implemented: displayName');
  }

  /** @returns {string} 版本號 */
  get version() {
    return '0.0.0';
  }

  /** @returns {string[]} 能力清單，如 ['walk', 'sit', 'balance', 'servo-control'] */
  getCapabilities() {
    return [];
  }

  // ===== 積木與 generator =====

  /**
   * 註冊該機器人的自訂積木到 Blockly
   * @param {Object} Blockly Blockly 主物件
   */
  registerBlocks(Blockly) {
    throw new Error('Not implemented: registerBlocks');
  }

  /**
   * 註冊該機器人的 code 生成器
   * @param {Object} Blockly Blockly 主物件
   */
  registerGenerators(Blockly) {
    throw new Error('Not implemented: registerGenerators');
  }

  /**
   * 回傳該機器人專屬的 toolbox category XML 片段
   * 會被 main.js 整合到完整 toolbox
   * @returns {string} `<category>...</category>` 一個或多個
   */
  getToolboxXmlSnippet() {
    throw new Error('Not implemented: getToolboxXmlSnippet');
  }

  // ===== 連線（實機）=====

  /**
   * 建立連線器（封裝 Web Serial / WebSocket / UDP-bridge）
   * @returns {IConnector}
   */
  createConnector() {
    throw new Error('Not implemented: createConnector');
  }

  // ===== 模擬器（視覺）=====

  /**
   * 建立模擬器物件
   * @param {HTMLElement} svgContainerEl 模擬器要 inject 的 DOM 容器
   * @returns {IRobotSimulator}
   */
  createSimulator(svgContainerEl) {
    throw new Error('Not implemented: createSimulator');
  }
}

/**
 * 連線器介面 — 抽象化「怎麼把指令送到實機」
 * Bittle / 雙足 / microbit 用 Web Serial 實作
 * Unitree Go1 用 WebSocket 連 Pi/Jetson 上的 ROS bridge
 *
 * @interface
 */
class IConnector {
  isSupported() {
    return false;
  }
  isConnected() {
    return false;
  }
  async connect() {
    throw new Error('Not implemented');
  }
  async disconnect() {
    throw new Error('Not implemented');
  }
  /** @param {string} command 機器人特定指令格式（Bittle 是 ASCII，Go1 可能是 JSON） */
  async send(command) {
    throw new Error('Not implemented');
  }
}

/**
 * 模擬器介面 — 抽象化「怎麼視覺呈現動作」
 *
 * @interface
 */
class IRobotSimulator {
  /** 重置到初始姿勢 */
  reset() {
    throw new Error('Not implemented');
  }

  /**
   * 接收一個指令，轉換為視覺動畫
   * @param {string} command 同 connector.send 的格式
   */
  async executeCommand(command) {
    throw new Error('Not implemented');
  }

  /** 設定狀態文字（顯示在模擬器下方）*/
  setStatus(text) {
    throw new Error('Not implemented');
  }
}

// 導出供未來 robot 實作 extend / 註冊用
DogLabApp.IRobot = IRobot;
DogLabApp.IConnector = IConnector;
DogLabApp.IRobotSimulator = IRobotSimulator;

// 機器人註冊表（v0.2+ 會用）
DogLabApp.robots = DogLabApp.robots || {};

/**
 * 註冊一個機器人實作
 * @param {IRobot} robotInstance
 */
DogLabApp.registerRobot = function (robotInstance) {
  if (!robotInstance.id) throw new Error('Robot must have an id');
  DogLabApp.robots[robotInstance.id] = robotInstance;
  console.log(`[DogLabApp] Registered robot: ${robotInstance.id} (${robotInstance.displayName})`);
};

/**
 * 取得目前活躍的機器人
 * v0.1：固定回傳 Bittle（向下相容），v0.2+ 會根據用戶選擇切換
 */
DogLabApp.getActiveRobot = function () {
  return DogLabApp.robots[DogLabApp.activeRobotId || 'bittle'] || null;
};
