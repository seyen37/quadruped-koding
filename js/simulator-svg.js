/* ==========================================================
   SVG 模擬器 — 把 ASCII 指令翻譯成 SVG 動畫
   v0.2：擴充 animation library 到 13 種，對應 v0.2 的 50+ skills
   未實作的指令會跑 generic 'shake' fallback
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

    // 建立「ASCII → animation」對照表（從 BITTLE_SKILLS metadata 生成）
    this.skillAnimMap = {};
    if (BittleApp.BITTLE_SKILLS) {
      BittleApp.BITTLE_SKILLS.forEach((s) => {
        this.skillAnimMap[s.ascii] = s.anim;
      });
    }
  }

  setStatus(text) {
    if (this.statusLine) this.statusLine.textContent = '狀態：' + text;
  }

  setLeg(legId, angle) {
    const leg = this.legs[legId];
    if (!leg) return;
    leg.setAttribute('transform', `rotate(${angle})`);
  }

  resetLegs() {
    ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 0));
  }

  resetHead() {
    if (this.head) this.head.setAttribute('transform', 'rotate(0)');
  }

  // 主入口
  async executeSkill(asciiCommand) {
    this.setStatus('執行 ' + asciiCommand);

    // 1. 從 metadata 對照查 animation
    const animName = this.skillAnimMap[asciiCommand];
    if (animName && this.animations[animName]) {
      await this.animations[animName].call(this);
    }
    // 2. servo 直控指令（m 開頭）
    else if (asciiCommand.startsWith('m ')) {
      const parts = asciiCommand.split(/\s+/);
      const index = parseInt(parts[1], 10);
      const angle = parseInt(parts[2], 10);
      await this.animateServo(index, angle);
    }
    // 3. 多 servo 指令（i 開頭）
    else if (asciiCommand.startsWith('i ')) {
      const parts = asciiCommand.split(/\s+/);
      for (let p = 1; p < parts.length; p += 2) {
        const idx = parseInt(parts[p], 10);
        const ang = parseInt(parts[p + 1], 10);
        await this.animateServo(idx, ang, false);
      }
      await this.sleep(500);
    }
    // 4. 蜂鳴（b 開頭）
    else if (asciiCommand.startsWith('b ')) {
      await this.animations.beep.call(this);
    }
    // 5. fallback：未知指令跑 generic shake
    else {
      this.setStatus('未對應的指令: ' + asciiCommand + '（fallback shake）');
      await this.animations.shake.call(this);
    }

    this.setStatus('就緒');
  }

  // ===== Animation Library（13 種 + 1 個 servo 直控）=====
  // 重要設計註：實機 Bittle 用 4-bar linkage + 彈簧腿。
  // walk = 左右擺動 / pushUp = 整體上下，已調整以接近實機視覺（Round 13）
  animations = {
    walk: async function () {
      // v0.4.5 實機影片觀察校正：bound 步態
      // 前腿大幅前 + 後腿大幅後（拉長身體），不是左右搖晃
      for (let i = 0; i < 5; i++) {
        // 跨步：前腿前伸、後腿後蹬
        this.setLeg('LF', 50); this.setLeg('RF', 50);
        this.setLeg('LB', -50); this.setLeg('RB', -50);
        await this.sleep(320);
        // 收腿：反向
        this.setLeg('LF', -25); this.setLeg('RF', -25);
        this.setLeg('LB', 25); this.setLeg('RB', 25);
        await this.sleep(320);
      }
      this.resetLegs();
    },

    walkReverse: async function () {
      for (let i = 0; i < 5; i++) {
        this.setLeg('LF', -50); this.setLeg('RF', -50);
        this.setLeg('LB', 50); this.setLeg('RB', 50);
        await this.sleep(320);
        this.setLeg('LF', 25); this.setLeg('RF', 25);
        this.setLeg('LB', -25); this.setLeg('RB', -25);
        await this.sleep(320);
      }
      this.resetLegs();
    },

    sit: async function () {
      this.setLeg('LF', -20); this.setLeg('RF', -20);
      this.setLeg('LB', 60);  this.setLeg('RB', 60);
      await this.sleep(800);
    },

    rest: async function () {
      this.setLeg('LF', 60);  this.setLeg('RF', 60);
      this.setLeg('LB', -60); this.setLeg('RB', -60);
      await this.sleep(800);
    },

    balance: async function () {
      this.resetLegs();
      this.resetHead();
      await this.sleep(400);
    },

    hi: async function () {
      this.resetLegs();
      for (let i = 0; i < 3; i++) {
        this.setLeg('RF', -60);
        await this.sleep(220);
        this.setLeg('RF', -90);
        await this.sleep(220);
      }
      this.resetLegs();
    },

    jump: async function () {
      // 4 腿一起彎 → 一起伸（上下蹲跳示意）
      ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 50));
      await this.sleep(250);
      ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, -30));
      await this.sleep(250);
      this.resetLegs();
    },

    kick: async function () {
      // RF 大幅前踢
      this.setLeg('RF', -80);
      await this.sleep(300);
      this.setLeg('RF', 60);
      await this.sleep(300);
      this.resetLegs();
    },

    pushUp: async function () {
      // 實機 4-bar 機構：彈簧腳長變化 → 整體上下，腿不彎膝
      // SVG 沒有 z 軸，用 4 腿輕微外擺暗示「彈簧伸縮」
      for (let i = 0; i < 3; i++) {
        // 腳長縮短（4 腿微微外擺暗示彈簧壓縮）
        ['LF', 'RF'].forEach((id) => this.setLeg(id, 15));
        ['LB', 'RB'].forEach((id) => this.setLeg(id, -15));
        await this.sleep(280);
        // 腳長伸長（恢復）
        this.resetLegs();
        await this.sleep(280);
      }
    },

    shake: async function () {
      // generic 短抖動 — 4 腿同時左右擺一下
      for (let i = 0; i < 2; i++) {
        ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 15));
        await this.sleep(180);
        ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, -15));
        await this.sleep(180);
      }
      this.resetLegs();
    },

    nod: async function () {
      // 頭部上下擺
      for (let i = 0; i < 3; i++) {
        this.head.setAttribute('transform', 'rotate(20)');
        await this.sleep(200);
        this.head.setAttribute('transform', 'rotate(-20)');
        await this.sleep(200);
      }
      this.resetHead();
    },

    stretch: async function () {
      // 4 腿向外伸長
      this.setLeg('LF', -45); this.setLeg('RF', -45);
      this.setLeg('LB', 45);  this.setLeg('RB', 45);
      await this.sleep(800);
      this.resetLegs();
    },

    buttUp: async function () {
      // 後腿低、前腿高（屁股翹）
      this.setLeg('LF', 60);  this.setLeg('RF', 60);
      this.setLeg('LB', -45); this.setLeg('RB', -45);
      await this.sleep(800);
    },

    beep: async function () {
      // 視覺：頭部閃爍
      this.head.style.opacity = '0.5';
      await this.sleep(100);
      this.head.style.opacity = '1';
      await this.sleep(100);
    },
  };

  async animateServo(index, angle, blocking = true) {
    if (index === 0) {
      // head pan
      this.head.setAttribute('transform', `rotate(${angle})`);
    } else if ([8, 9, 10, 11].includes(index)) {
      const map = { 8: 'LF', 9: 'RF', 10: 'RB', 11: 'LB' };
      this.setLeg(map[index], angle);
    } else if ([12, 13, 14, 15].includes(index)) {
      const map = { 12: 'LF', 13: 'RF', 14: 'RB', 15: 'LB' };
      this.setLeg(map[index], angle / 2);
    }
    if (blocking) await this.sleep(400);
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
