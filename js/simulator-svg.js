/* ==========================================================
   SVG 模擬器 — 把 ASCII 指令翻譯成 SVG 動畫
   MVP：簡單腿部與身體動畫，呈現 walk/sit/balance/rest 等
   ========================================================== */

window.BittleApp = window.BittleApp || {};

class BittleSimulator {
  constructor(svgElementId) {
    this.svg = document.getElementById(svgElementId);
    this.legs = {
      LF: this.svg.querySelector('#leg-LF'),
      RF: this.svg.querySelector('#leg-RF'),
      LB: this.svg.querySelector('#leg-LB'),
      RB: this.svg.querySelector('#leg-RB'),
    };
    this.body = this.svg.querySelector('#body');
    this.head = this.svg.querySelector('#head');
    this.statusLine = document.getElementById('status-line');
  }

  setStatus(text) {
    if (this.statusLine) this.statusLine.textContent = '狀態：' + text;
  }

  // 設定腿部旋轉（degrees）
  // 因為 SVG 用「外層 g translate + 內層 g 旋轉」結構，
  // 內層 leg-XX 的 transform 只負責 rotate，旋轉中心 (0,0) 自然在腿頂
  setLeg(legId, angle) {
    const leg = this.legs[legId];
    if (!leg) return;
    leg.setAttribute('transform', `rotate(${angle})`);
  }

  // 重置所有腿到 0 度
  resetLegs() {
    ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 0));
  }

  // 接收一個指令字串（ASCII），對應到動畫
  async executeSkill(asciiCommand) {
    this.setStatus('執行 ' + asciiCommand);

    // skill 指令（k 開頭）
    if (asciiCommand.startsWith('kwk') || asciiCommand === 'kwkF') {
      await this.animateWalk(4); // 走 4 步循環
    } else if (asciiCommand === 'kbk') {
      await this.animateWalk(4, true); // 倒退
    } else if (asciiCommand === 'ksit') {
      await this.animateSit();
    } else if (asciiCommand === 'kbalance') {
      await this.animateBalance();
    } else if (asciiCommand === 'krest') {
      await this.animateRest();
    } else if (asciiCommand === 'khi') {
      await this.animateHi();
    }
    // servo 指令（m 開頭）
    else if (asciiCommand.startsWith('m ')) {
      const parts = asciiCommand.split(/\s+/);
      const index = parseInt(parts[1], 10);
      const angle = parseInt(parts[2], 10);
      await this.animateServo(index, angle);
    }
    // 多 servo 指令（i 開頭）
    else if (asciiCommand.startsWith('i ')) {
      const parts = asciiCommand.split(/\s+/);
      for (let p = 1; p < parts.length; p += 2) {
        const idx = parseInt(parts[p], 10);
        const ang = parseInt(parts[p + 1], 10);
        await this.animateServo(idx, ang, false);
      }
      await this.sleep(500);
    }
    // 蜂鳴
    else if (asciiCommand.startsWith('b ')) {
      await this.animateBeep();
    } else {
      this.setStatus('未實作的指令: ' + asciiCommand);
      await this.sleep(300);
    }

    this.setStatus('就緒');
  }

  // ===== 動畫實作 =====

  async animateWalk(steps, reverse = false) {
    const dir = reverse ? -1 : 1;
    for (let i = 0; i < steps; i++) {
      // 對角腿同時抬起（trot 步態）
      this.setLeg('LF', 30 * dir);
      this.setLeg('RB', 30 * dir);
      this.setLeg('RF', -30 * dir);
      this.setLeg('LB', -30 * dir);
      await this.sleep(300);

      this.setLeg('LF', -30 * dir);
      this.setLeg('RB', -30 * dir);
      this.setLeg('RF', 30 * dir);
      this.setLeg('LB', 30 * dir);
      await this.sleep(300);
    }
    this.resetLegs();
  }

  async animateSit() {
    // 坐姿：前腿前伸（小角度），後腿大彎收起（用 leg 角度差表現）
    this.setLeg('LF', -20);
    this.setLeg('RF', -20);
    this.setLeg('LB', 60);
    this.setLeg('RB', 60);
    await this.sleep(800);
  }

  async animateBalance() {
    // 站穩：所有腿歸零（直立）
    this.resetLegs();
    await this.sleep(400);
  }

  async animateRest() {
    // 休息趴下：所有腿向外散開
    this.setLeg('LF', 60);
    this.setLeg('RF', 60);
    this.setLeg('LB', -60);
    this.setLeg('RB', -60);
    await this.sleep(800);
  }

  async animateHi() {
    // 揮 RF（前右腳）
    this.resetLegs();
    for (let i = 0; i < 3; i++) {
      this.setLeg('RF', -60);
      await this.sleep(250);
      this.setLeg('RF', -90);
      await this.sleep(250);
    }
    this.resetLegs();
  }

  async animateServo(index, angle, blocking = true) {
    // 單一 servo 移動
    if (index === 0) {
      // head pan — head 內層 group 只設 rotate（外層 group 已 translate 到頭部位置）
      this.head.setAttribute('transform', `rotate(${angle})`);
    } else if ([8, 9, 10, 11].includes(index)) {
      // shoulder pitch
      const map = { 8: 'LF', 9: 'RF', 10: 'RB', 11: 'LB' };
      this.setLeg(map[index], angle);
    } else if ([12, 13, 14, 15].includes(index)) {
      // knee（暫時也轉腿，未來可細分）
      const map = { 12: 'LF', 13: 'RF', 14: 'RB', 15: 'LB' };
      this.setLeg(map[index], angle / 2);
    }
    if (blocking) await this.sleep(400);
  }

  async animateBeep() {
    // 視覺效果：頭部閃爍
    this.head.style.opacity = '0.5';
    await this.sleep(100);
    this.head.style.opacity = '1';
    await this.sleep(100);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

BittleApp.simulator = null;
BittleApp.initSimulator = function () {
  BittleApp.simulator = new BittleSimulator('bittle-svg');
  BittleApp.simulator.resetLegs();
};
