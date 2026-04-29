/* ==========================================================
   主整合 — Run / Stop / Mode / Connect 按鈕綁定 + Blockly 注入
   ========================================================== */

window.DogLabApp = window.DogLabApp || {};

// === Events Dispatcher（v0.5.0）：事件積木的綁定與觸發中樞 ===
DogLabApp.events = {
  handlers: {},

  on(eventName, handler) {
    if (!this.handlers[eventName]) this.handlers[eventName] = [];
    this.handlers[eventName].push(handler);
  },

  async trigger(eventName, data) {
    const handlers = this.handlers[eventName] || [];
    if (handlers.length === 0) {
      DogLabApp.log(`⚡ 觸發 ${eventName}（沒有 handler 綁定）`, 'warn');
      return;
    }
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (e) {
        DogLabApp.log(`事件 handler 錯誤: ${e.message}`, 'error');
      }
    }
  },

  reset() {
    this.handlers = {};
  },
};

// === Runtime：根據模式派送指令到 simulator 或 serial ===
DogLabApp.runtime = {
  mode: 'simulator', // 'simulator' or 'serial'
  abortRequested: false,

  async send(asciiCommand) {
    if (this.abortRequested) throw new Error('已被使用者停止');
    if (this.mode === 'serial' && DogLabApp.serial.isConnected()) {
      return DogLabApp.serial.send(asciiCommand);
    }
    // v0.5.1：模擬模式統一走 3D simulator
    if (DogLabApp.simulator3D) {
      return DogLabApp.simulator3D.executeSkill(asciiCommand);
    }
    DogLabApp.log('⚠️ 3D 模擬器尚未初始化，跳過指令: ' + asciiCommand, 'warn');
  },

  async wait(seconds) {
    if (this.abortRequested) throw new Error('已被使用者停止');
    DogLabApp.log(`⏱️ 等待 ${seconds} 秒...`);
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  },
};

// === Log 工具 ===
DogLabApp.log = function (msg, level) {
  const logDiv = document.getElementById('log');
  if (!logDiv) {
    console.log('[Bittle]', msg);
    return;
  }
  const line = document.createElement('div');
  if (level === 'error') line.className = 'log-error';
  else if (level === 'success') line.className = 'log-success';
  else if (level === 'warn') line.className = 'log-warn';
  const time = new Date().toLocaleTimeString();
  line.textContent = `[${time}] ${msg}`;
  logDiv.appendChild(line);
  logDiv.scrollTop = logDiv.scrollHeight;
};

// === 主程式進入點 ===
window.addEventListener('DOMContentLoaded', () => {
  // v0.5.1：移除 2D simulator 初始化（3D simulator 由 simulator-3d.js auto-init）

  // 注入 Blockly
  DogLabApp.workspace = Blockly.inject('blocklyDiv', DogLabApp.blocklyOptions);

  // v0.4.8：預設載入「🟢 當程式開始」hat block（讓新使用者直接看到入口）
  try {
    const defaultXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="bittle_start" x="80" y="60"></block></xml>';
    const xmlDom = Blockly.utils.xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xmlDom, DogLabApp.workspace);
  } catch (e) {
    console.warn('預設 workspace 載入失敗:', e);
  }

  DogLabApp.log('DogLab Coding v0.5.1 已就緒', 'success');
  DogLabApp.log('提示：把動作積木接到「🟢 當程式開始」下面，按 ▶ 執行查看效果');

  // === 綁定按鈕 ===

  document.getElementById('btn-run').onclick = async () => {
    DogLabApp.runtime.abortRequested = false;
    // v0.5.0：開始執行前重置事件 handlers，避免上次 Run 殘留
    DogLabApp.events.reset();

    // 檢查 generator 是否載入成功
    if (typeof Blockly.JavaScript === 'undefined' || !Blockly.JavaScript.workspaceToCode) {
      DogLabApp.log('❌ Blockly.JavaScript generator 未載入！檢查 index.html 的 javascript_compressed.js 標籤', 'error');
      return;
    }

    const code = Blockly.JavaScript.workspaceToCode(DogLabApp.workspace);

    // 把生成的 code 顯示出來方便除錯
    DogLabApp.log('--- 生成的 JS code ---');
    code.split('\n').forEach((line) => {
      if (line.trim()) DogLabApp.log('  ' + line);
    });

    if (!code.trim()) {
      DogLabApp.log('⚠️ Workspace 是空的，或積木沒接到任何 hat block', 'warn');
      DogLabApp.log('   提示：先拖一個「🟢 當程式開始」，再把動作積木接到下面', 'warn');
      return;
    }
    DogLabApp.log('=== 開始執行 ===', 'success');
    try {
      // 把生成的 code 包成 async function 執行
      const fn = new Function(`return (async () => { ${code} })();`);
      await fn();
      DogLabApp.log('=== 執行完成 ===', 'success');
    } catch (e) {
      DogLabApp.log('執行錯誤: ' + e.message, 'error');
      console.error(e);
    }
  };

  document.getElementById('btn-stop').onclick = () => {
    DogLabApp.runtime.abortRequested = true;
    DogLabApp.log('⏹ 收到停止信號（會在下一個積木執行時生效）', 'warn');
  };

  document.getElementById('btn-mode').onclick = () => {
    if (DogLabApp.runtime.mode === 'simulator') {
      DogLabApp.runtime.mode = 'serial';
      document.getElementById('btn-mode').textContent = '模式：🤖 實機';
      DogLabApp.log('已切換到實機模式（需先 連接 Bittle）', 'warn');
    } else {
      DogLabApp.runtime.mode = 'simulator';
      document.getElementById('btn-mode').textContent = '模式：🖥️ 模擬';
      DogLabApp.log('已切換到模擬模式', 'success');
    }
  };

  // === v0.5.1 新增：模擬器尺寸切換（普通 ⇄ 放大）===
  document.getElementById('btn-sim-size').onclick = () => {
    const rightPanel = document.querySelector('.right-panel');
    const btn = document.getElementById('btn-sim-size');
    const expanded = rightPanel.classList.toggle('expanded');
    btn.textContent = expanded ? '🔍 縮小' : '🔍 放大';
    DogLabApp.log(expanded ? '已放大模擬器畫面' : '已恢復模擬器普通大小', 'success');
    // CSS transition 跑完之後再 resize（讓 Three.js canvas 抓到正確的新尺寸）
    setTimeout(() => {
      if (DogLabApp.simulator3D && DogLabApp.simulator3D.resize) {
        DogLabApp.simulator3D.resize();
      }
    }, 320);
  };

  document.getElementById('btn-connect').onclick = async () => {
    if (DogLabApp.serial.isConnected()) {
      await DogLabApp.serial.disconnect();
      document.getElementById('btn-connect').textContent = '🔌 連接 Bittle';
    } else {
      try {
        await DogLabApp.serial.connect();
        document.getElementById('btn-connect').textContent = '🔌 斷線';
        // 自動切到實機模式
        DogLabApp.runtime.mode = 'serial';
        document.getElementById('btn-mode').textContent = '模式：🤖 實機';
      } catch (e) {
        DogLabApp.log('連接失敗: ' + e.message, 'error');
      }
    }
  };

  // === v0.5.0 事件觸發列（5 個按鈕）===
  document.querySelectorAll('.btn-event').forEach((btn) => {
    btn.onclick = () => {
      const eventName = btn.dataset.event;
      const data = btn.dataset.data ? parseFloat(btn.dataset.data) : null;
      DogLabApp.log(`手動觸發事件: ${eventName}${data !== null ? ' (data=' + data + ')' : ''}`);
      DogLabApp.events.trigger(eventName, data);
    };
  });

  // === Web Serial 不支援警告 ===
  if (!DogLabApp.serial.isSupported()) {
    DogLabApp.log('⚠️ 此瀏覽器不支援 Web Serial（實機模式不可用）', 'warn');
    DogLabApp.log('   請用 Chrome 或 Edge 89+ 才能連 Bittle 實機', 'warn');
  }
});
