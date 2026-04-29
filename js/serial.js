/* ==========================================================
   Web Serial API 包裝 — 連到實機 Bittle 主板
   需 Chrome 89+ 或 Edge 89+。Firefox / Safari 不支援。
   ========================================================== */

window.DogLabApp = window.DogLabApp || {};

class BittleSerial {
  constructor() {
    this.port = null;
    this.writer = null;
    this.reader = null;
    this.readLoopAbort = null;
  }

  isSupported() {
    return 'serial' in navigator;
  }

  isConnected() {
    return this.port !== null;
  }

  async connect() {
    if (!this.isSupported()) {
      throw new Error('您的瀏覽器不支援 Web Serial API。請用 Chrome 或 Edge（89+）。');
    }
    if (this.port) {
      throw new Error('已連線中，請先斷線');
    }

    // 彈出 port 選擇對話框
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200, dataBits: 8, stopBits: 1, parity: 'none' });

    // 取得 reader / writer
    this.writer = this.port.writable.getWriter();
    this.reader = this.port.readable.getReader();

    // 啟動讀取 loop（在背景處理 Bittle 回應）
    this.readLoopAbort = false;
    this._startReadLoop();

    DogLabApp.log('已連線到 Bittle (115200 baud)', 'success');
    return true;
  }

  async send(asciiCommand) {
    if (!this.writer) {
      DogLabApp.log('未連線，自動切回模擬模式執行', 'warn');
      // 回退到模擬器
      if (DogLabApp.simulator) await DogLabApp.simulator.executeSkill(asciiCommand);
      return;
    }
    const data = new TextEncoder().encode(asciiCommand + '\n');
    await this.writer.write(data);
    DogLabApp.log('▶ 送出: ' + asciiCommand);
  }

  async _startReadLoop() {
    try {
      while (!this.readLoopAbort) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          const text = new TextDecoder().decode(value);
          if (text.trim()) DogLabApp.log('◀ 回應: ' + text.trim());
        }
      }
    } catch (e) {
      if (!this.readLoopAbort) {
        DogLabApp.log('讀取中斷: ' + e.message, 'error');
      }
    }
  }

  async disconnect() {
    if (!this.port) return;
    this.readLoopAbort = true;
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }
      await this.port.close();
    } catch (e) {
      DogLabApp.log('斷線錯誤: ' + e.message, 'error');
    }
    this.port = null;
    DogLabApp.log('已斷線', 'warn');
  }
}

DogLabApp.serial = new BittleSerial();
