/* ==========================================================
   主整合 — Run / Stop / Mode / Connect 按鈕綁定 + Blockly 注入
   ========================================================== */

window.BittleApp = window.BittleApp || {};

// === Runtime：根據模式派送指令到 simulator 或 serial ===
BittleApp.runtime = {
  mode: 'simulator', // 'simulator' or 'serial'
  abortRequested: false,

  async send(asciiCommand) {
    if (this.abortRequested) throw new Error('已被使用者停止');
    if (this.mode === 'serial' && BittleApp.serial.isConnected()) {
      return BittleApp.serial.send(asciiCommand);
    } else {
      return BittleApp.simulator.executeSkill(asciiCommand);
    }
  },

  async wait(seconds) {
    if (this.abortRequested) throw new Error('已被使用者停止');
    BittleApp.log(`⏱️ 等待 ${seconds} 秒...`);
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  },
};

// === Log 工具 ===
BittleApp.log = function (msg, level) {
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
  // 初始化模擬器
  BittleApp.initSimulator();

  // 注入 Blockly
  BittleApp.workspace = Blockly.inject('blocklyDiv', BittleApp.blocklyOptions);
  BittleApp.log('Petoi Bittle Koding v0.1.0 已就緒', 'success');
  BittleApp.log('提示：拖積木到中央區域，按 ▶ 執行查看效果');

  // === 綁定按鈕 ===

  document.getElementById('btn-run').onclick = async () => {
    BittleApp.runtime.abortRequested = false;

    // 檢查 generator 是否載入成功
    if (typeof Blockly.JavaScript === 'undefined' || !Blockly.JavaScript.workspaceToCode) {
      BittleApp.log('❌ Blockly.JavaScript generator 未載入！檢查 index.html 的 javascript_compressed.js 標籤', 'error');
      return;
    }

    const code = Blockly.JavaScript.workspaceToCode(BittleApp.workspace);

    // 把生成的 code 顯示出來方便除錯
    BittleApp.log('--- 生成的 JS code ---');
    code.split('\n').forEach((line) => {
      if (line.trim()) BittleApp.log('  ' + line);
    });

    if (!code.trim()) {
      BittleApp.log('⚠️ Workspace 是空的，或積木沒接到任何 hat block', 'warn');
      BittleApp.log('   提示：先拖一個「🟢 當程式開始」，再把動作積木接到下面', 'warn');
      return;
    }
    BittleApp.log('=== 開始執行 ===', 'success');
    try {
      // 把生成的 code 包成 async function 執行
      const fn = new Function(`return (async () => { ${code} })();`);
      await fn();
      BittleApp.log('=== 執行完成 ===', 'success');
    } catch (e) {
      BittleApp.log('執行錯誤: ' + e.message, 'error');
      console.error(e);
    }
  };

  document.getElementById('btn-stop').onclick = () => {
    BittleApp.runtime.abortRequested = true;
    BittleApp.log('⏹ 收到停止信號（會在下一個積木執行時生效）', 'warn');
  };

  document.getElementById('btn-mode').onclick = () => {
    if (BittleApp.runtime.mode === 'simulator') {
      BittleApp.runtime.mode = 'serial';
      document.getElementById('btn-mode').textContent = '模式：🤖 實機';
      BittleApp.log('已切換到實機模式（需先 連接 Bittle）', 'warn');
    } else {
      BittleApp.runtime.mode = 'simulator';
      document.getElementById('btn-mode').textContent = '模式：🖥️ 模擬';
      BittleApp.log('已切換到模擬模式', 'success');
    }
  };

  document.getElementById('btn-connect').onclick = async () => {
    if (BittleApp.serial.isConnected()) {
      await BittleApp.serial.disconnect();
      document.getElementById('btn-connect').textContent = '🔌 連接 Bittle';
    } else {
      try {
        await BittleApp.serial.connect();
        document.getElementById('btn-connect').textContent = '🔌 斷線';
        // 自動切到實機模式
        BittleApp.runtime.mode = 'serial';
        document.getElementById('btn-mode').textContent = '模式：🤖 實機';
      } catch (e) {
        BittleApp.log('連接失敗: ' + e.message, 'error');
      }
    }
  };

  // === Web Serial 不支援警告 ===
  if (!BittleApp.serial.isSupported()) {
    BittleApp.log('⚠️ 此瀏覽器不支援 Web Serial（實機模式不可用）', 'warn');
    BittleApp.log('   請用 Chrome 或 Edge 89+ 才能連 Bittle 實機', 'warn');
  }
});
