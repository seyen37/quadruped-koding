/* ==========================================================
   simulator-3d.js — Three.js 3D 模擬器（v0.4）
   ----------------------------------------------------------
   設計：Procedural mesh（Box/Sphere/Cylinder 拼成 Bittle）
   為什麼不用真實 STL？見 DECISIONS.md ADR-009
     - 36MB STL 對 GitHub Pages 不友善
     - Petoi STEP 內部資料授權不明、不可公開
     - Procedural mesh 對教育用途已足夠

   架構：ES module（用 importmap）；init 完掛載到 window.BittleApp.simulator3D
   ========================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class BittleSimulator3D {
  constructor(containerEl) {
    this.container = containerEl;
    this.statusLine = document.getElementById('status-line');
    this.currentTheme = 'dark'; // dark / studio / light

    this.initScene();
    this.initBittle();
    this.initLights();
    this.initControls();
    this.addThemeToggle();
    this.startRenderLoop();
    this.bindResize();

    // 對照 ASCII → animation（與 SVG simulator 同 metadata 來源）
    this.skillAnimMap = {};
    if (window.BittleApp && window.BittleApp.BITTLE_SKILLS) {
      window.BittleApp.BITTLE_SKILLS.forEach((s) => {
        this.skillAnimMap[s.ascii] = s.anim;
      });
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
    // v0.4.1：背景略亮，與深色 UI 一致但對比夠
    this.scene.background = new THREE.Color(0x4a5466);

    const w = this.container.clientWidth || 400;
    const h = this.container.clientHeight || 280;

    this.camera = new THREE.PerspectiveCamera(45, w / h, 1, 3000);
    this.camera.position.set(350, 250, 350);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 地面（v0.4.1：略亮，與背景區分）— 存成 this.ground 給 setTheme 用
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: 0x2a313e, roughness: 0.8 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.y = -100;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // 地面 grid 輔助 — 存成 this.grid 給 setTheme 用（換主題時要重建）
    this.grid = new THREE.GridHelper(1000, 20, 0x6a7280, 0x4a5466);
    this.grid.position.y = -99;
    this.scene.add(this.grid);
  }

  // ===== v0.4.2 主題系統 =====
  themes = {
    dark: {
      label: '🌑 暗黑',
      background: 0x4a5466,
      ground: 0x2a313e,
      gridMajor: 0x6a7280,
      gridMinor: 0x4a5466,
      ambient: 0xa0a0a0,
    },
    studio: {
      label: '🌗 灰調',
      background: 0x9ba5b4,
      ground: 0x7a8290,
      gridMajor: 0x5a626f,
      gridMinor: 0x8a929d,
      ambient: 0xc0c0c0,
    },
    light: {
      label: '☀️ 明亮',
      background: 0xe8ecef,
      ground: 0xc0c8d0,
      gridMajor: 0xa0a8b0,
      gridMinor: 0xd0d8e0,
      ambient: 0xffffff,
    },
  };

  applyTheme(themeName) {
    const t = this.themes[themeName];
    if (!t) return;
    this.currentTheme = themeName;

    this.scene.background = new THREE.Color(t.background);
    this.ground.material.color.setHex(t.ground);

    // Grid 要重建（color 屬性不可動態改）
    this.scene.remove(this.grid);
    this.grid = new THREE.GridHelper(1000, 20, t.gridMajor, t.gridMinor);
    this.grid.position.y = -99;
    this.scene.add(this.grid);

    // 環境光
    if (this.ambientLight) this.ambientLight.color.setHex(t.ambient);

    // 按鈕文字
    if (this.themeBtn) this.themeBtn.textContent = t.label;
  }

  cycleTheme() {
    const order = ['dark', 'studio', 'light'];
    const idx = order.indexOf(this.currentTheme);
    const next = order[(idx + 1) % order.length];
    this.applyTheme(next);
  }

  addThemeToggle() {
    // 確保 container 是 relative，浮動按鈕才能 absolute 定位
    if (this.container.style.position !== 'absolute') {
      this.container.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.textContent = '🌑 暗黑';
    btn.title = '點擊循環切換 3 種地板/背景主題';
    btn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 5px 10px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: 1px solid #5fa9e8;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: -apple-system, "Microsoft JhengHei", sans-serif;
      z-index: 100;
      transition: all 0.15s;
    `;
    btn.onmouseover = () => { btn.style.background = 'rgba(95, 169, 232, 0.9)'; };
    btn.onmouseout = () => { btn.style.background = 'rgba(0, 0, 0, 0.6)'; };
    btn.onclick = () => this.cycleTheme();
    this.container.appendChild(btn);
    this.themeBtn = btn;
  }

  initBittle() {
    this.bittle = new THREE.Group();

    // v0.4.1 配色升級：身體變亮藍、腿變中灰，全面提高對比
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a7fc1, roughness: 0.4, metalness: 0.3 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffb84a, emissive: 0xff9d3a, emissiveIntensity: 0.5 }); // 改橘色高對比
    const legMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.5, metalness: 0.4 }); // 銀灰金屬感

    // 身體（200×60×100 mm）
    const body = new THREE.Mesh(new THREE.BoxGeometry(200, 60, 100), bodyMat);
    body.castShadow = true;
    this.bittle.add(body);

    // 頭部 group（旋轉中心在頸部，可 head pan）
    this.head = new THREE.Group();
    this.head.position.set(130, 20, 0);
    const headBall = new THREE.Mesh(new THREE.SphereGeometry(35, 24, 16), bodyMat);
    headBall.castShadow = true;
    this.head.add(headBall);

    // 雙眼
    [25, -25].forEach((z) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 12), accentMat);
      eye.position.set(20, 5, z);
      this.head.add(eye);
    });

    // 嘴巴（小條）
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 20),
      new THREE.MeshStandardMaterial({ color: 0x5fa9e8 })
    );
    mouth.position.set(28, -8, 0);
    this.head.add(mouth);

    this.bittle.add(this.head);

    // 4 條腿
    this.legs = {};
    const legPositions = {
      LF: { x: 60, z: 50 },
      RF: { x: 60, z: -50 },
      LB: { x: -60, z: 50 },
      RB: { x: -60, z: -50 },
    };

    Object.entries(legPositions).forEach(([id, pos]) => {
      // shoulder pivot group（rotation.x = shoulder pitch）
      const legGroup = new THREE.Group();
      legGroup.position.set(pos.x, -30, pos.z);

      // upper leg（從 shoulder 往下 60 mm）
      const upper = new THREE.Mesh(
        new THREE.CylinderGeometry(8, 8, 60, 12),
        legMat
      );
      upper.position.y = -30;
      upper.castShadow = true;
      legGroup.add(upper);

      // shoulder 關節指示（藍球）
      const shoulderBall = new THREE.Mesh(
        new THREE.SphereGeometry(7, 12, 12),
        accentMat
      );
      legGroup.add(shoulderBall);

      // knee group（rotation.x = knee）
      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -60;

      const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 6, 50, 10),
        legMat
      );
      lower.position.y = -25;
      lower.castShadow = true;
      kneeGroup.add(lower);

      // 足底（小球）
      const foot = new THREE.Mesh(
        new THREE.SphereGeometry(7, 12, 12),
        legMat
      );
      foot.position.y = -50;
      kneeGroup.add(foot);

      legGroup.add(kneeGroup);
      this.bittle.add(legGroup);

      this.legs[id] = { group: legGroup, knee: kneeGroup };
    });

    this.scene.add(this.bittle);
  }

  initLights() {
    // v0.4.1：增強整體照明，避免暗部融成一片

    // 環境光（從 0x666666 提升）— 存成 this.ambientLight 給 setTheme 用
    this.ambientLight = new THREE.AmbientLight(0xa0a0a0);
    this.scene.add(this.ambientLight);

    // 主方向光（含陰影，從 0.8 → 1.0）
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(200, 400, 200);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.left = -300;
    dirLight.shadow.camera.right = 300;
    dirLight.shadow.camera.top = 300;
    dirLight.shadow.camera.bottom = -300;
    this.scene.add(dirLight);

    // 藍色補光（左下角，從 0.3 → 0.5）
    const fillLight = new THREE.DirectionalLight(0x5fa9e8, 0.5);
    fillLight.position.set(-200, 100, -200);
    this.scene.add(fillLight);

    // v0.4.1 新增：暖色背光（右後方，讓輪廓亮起）
    const rimLight = new THREE.DirectionalLight(0xffd0a0, 0.4);
    rimLight.position.set(150, 50, -300);
    this.scene.add(rimLight);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 1500;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  startRenderLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  bindResize() {
    window.addEventListener('resize', () => this.resize());
    // 切換到 3D 模式時也要 resize
    this.resize = () => {
      const w = this.container.clientWidth || 400;
      const h = this.container.clientHeight || 280;
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
  }

  setStatus(text) {
    if (this.statusLine) this.statusLine.textContent = '狀態（3D）：' + text;
  }

  setLeg(id, shoulderDeg, kneeDeg = 0) {
    const leg = this.legs[id];
    if (!leg) return;
    leg.group.rotation.x = THREE.MathUtils.degToRad(shoulderDeg);
    leg.knee.rotation.x = THREE.MathUtils.degToRad(kneeDeg);
  }

  resetLegs() {
    Object.keys(this.legs).forEach((id) => this.setLeg(id, 0, 0));
  }

  resetHead() {
    this.head.rotation.set(0, 0, 0);
  }

  // ===== 主入口（與 SVG simulator 同 API）=====
  async executeSkill(asciiCommand) {
    this.setStatus('執行 ' + asciiCommand);

    const animName = this.skillAnimMap[asciiCommand];
    if (animName && this.animations[animName]) {
      await this.animations[animName].call(this);
    } else if (asciiCommand.startsWith('m ')) {
      const parts = asciiCommand.split(/\s+/);
      const index = parseInt(parts[1], 10);
      const angle = parseInt(parts[2], 10);
      await this.animateServo(index, angle);
    } else if (asciiCommand.startsWith('i ')) {
      const parts = asciiCommand.split(/\s+/);
      for (let p = 1; p < parts.length; p += 2) {
        const idx = parseInt(parts[p], 10);
        const ang = parseInt(parts[p + 1], 10);
        await this.animateServo(idx, ang, false);
      }
      await this.sleep(500);
    } else if (asciiCommand.startsWith('b ')) {
      await this.animations.beep.call(this);
    } else {
      this.setStatus('未對應的指令: ' + asciiCommand + '（fallback shake）');
      await this.animations.shake.call(this);
    }

    this.setStatus('就緒');
  }

  // ===== Animation Library（同 SVG 13 種，但 3D 版含關節 + 整體位移）=====
  // 重要設計註：實機 Bittle 用 4-bar linkage + 彈簧腿設計（每腿上下兩段由彈簧連接）。
  // Servo 旋轉時，4-bar 連動 → 腳掌位置變化，不是傳統的「肩 + 膝兩段獨立旋轉」。
  // 因此：walk = 左右擺動（重心轉移） / pushUp = 整體上下（彈簧腳長變化），
  // 已調整以接近實機視覺。詳見 Round 13 WORKLOG。
  animations = {
    walk: async function () {
      // 實機 4-bar 彈簧腿：走路是大幅左右搖晃為主、腿小幅前後
      // v0.4.4 加大幅度：rotation.z 從 ±0.08 → ±0.22（約 ±13°）
      for (let i = 0; i < 6; i++) {
        // 重心向右（body roll right）
        this.bittle.rotation.z = -0.22;
        this.bittle.position.x = 8;
        this.setLeg('LF', 12); this.setLeg('LB', 12);
        this.setLeg('RF', -6); this.setLeg('RB', -6);
        await this.sleep(280);
        // 重心向左
        this.bittle.rotation.z = 0.22;
        this.bittle.position.x = -8;
        this.setLeg('LF', -6); this.setLeg('LB', -6);
        this.setLeg('RF', 12); this.setLeg('RB', 12);
        await this.sleep(280);
      }
      this.bittle.rotation.z = 0;
      this.bittle.position.x = 0;
      this.resetLegs();
    },

    walkReverse: async function () {
      // 倒退：搖晃方向相反、加負向 x 位移示意倒退
      for (let i = 0; i < 6; i++) {
        this.bittle.rotation.z = 0.22;
        this.bittle.position.x = -8;
        this.setLeg('LF', -12); this.setLeg('LB', -12);
        this.setLeg('RF', 6); this.setLeg('RB', 6);
        await this.sleep(280);
        this.bittle.rotation.z = -0.22;
        this.bittle.position.x = 8;
        this.setLeg('LF', 6); this.setLeg('LB', 6);
        this.setLeg('RF', -12); this.setLeg('RB', -12);
        await this.sleep(280);
      }
      this.bittle.rotation.z = 0;
      this.bittle.position.x = 0;
      this.resetLegs();
    },

    sit: async function () {
      this.setLeg('LF', -20, 0); this.setLeg('RF', -20, 0);
      this.setLeg('LB', 60, 60); this.setLeg('RB', 60, 60);
      this.bittle.position.y = -20;
      this.bittle.rotation.x = -0.1;
      await this.sleep(800);
    },

    rest: async function () {
      this.setLeg('LF', 60, 30); this.setLeg('RF', 60, 30);
      this.setLeg('LB', -60, 30); this.setLeg('RB', -60, 30);
      this.bittle.position.y = -40;
      await this.sleep(800);
    },

    balance: async function () {
      this.resetLegs();
      this.resetHead();
      this.bittle.position.y = 0;
      this.bittle.rotation.set(0, 0, 0);
      await this.sleep(400);
    },

    hi: async function () {
      this.resetLegs();
      for (let i = 0; i < 3; i++) {
        this.setLeg('RF', -60, 30);
        await this.sleep(220);
        this.setLeg('RF', -90, 60);
        await this.sleep(220);
      }
      this.resetLegs();
    },

    jump: async function () {
      // 蹲下蓄力
      ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 50, 30));
      this.bittle.position.y = -30;
      await this.sleep(200);
      // 跳起
      ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, -30, 0));
      this.bittle.position.y = 80;
      await this.sleep(200);
      // 落地
      this.bittle.position.y = 0;
      this.resetLegs();
      await this.sleep(150);
    },

    kick: async function () {
      this.setLeg('RF', -80, 30);
      await this.sleep(300);
      this.setLeg('RF', 60, -10);
      await this.sleep(300);
      this.resetLegs();
    },

    pushUp: async function () {
      // 實機 4-bar 彈簧腳長變化：身體大幅上下，腿完全不動
      // v0.4.4 加大幅度：從 -45~+5 → -75~+30（總 105 mm 振幅）
      for (let i = 0; i < 3; i++) {
        // 腳長收縮 → 身體大幅下沉
        this.bittle.position.y = -75;
        await this.sleep(320);
        // 腳長伸長 → 身體大幅上升
        this.bittle.position.y = 30;
        await this.sleep(320);
      }
      this.bittle.position.y = 0;
    },

    shake: async function () {
      for (let i = 0; i < 2; i++) {
        ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, 15));
        this.bittle.rotation.z = 0.1;
        await this.sleep(180);
        ['LF', 'RF', 'LB', 'RB'].forEach((id) => this.setLeg(id, -15));
        this.bittle.rotation.z = -0.1;
        await this.sleep(180);
      }
      this.resetLegs();
      this.bittle.rotation.z = 0;
    },

    nod: async function () {
      for (let i = 0; i < 3; i++) {
        this.head.rotation.x = THREE.MathUtils.degToRad(20);
        await this.sleep(200);
        this.head.rotation.x = THREE.MathUtils.degToRad(-20);
        await this.sleep(200);
      }
      this.head.rotation.x = 0;
    },

    stretch: async function () {
      this.setLeg('LF', -45, 0); this.setLeg('RF', -45, 0);
      this.setLeg('LB', 45, 0); this.setLeg('RB', 45, 0);
      await this.sleep(800);
      this.resetLegs();
    },

    buttUp: async function () {
      this.setLeg('LF', 60, 0); this.setLeg('RF', 60, 0);
      this.setLeg('LB', -45, 60); this.setLeg('RB', -45, 60);
      this.bittle.rotation.x = 0.2;
      await this.sleep(800);
      this.bittle.rotation.x = 0;
    },

    beep: async function () {
      // 雙眼閃爍
      const eyes = this.head.children.filter((c) => c.geometry?.type === 'SphereGeometry' && c !== this.head.children[0]);
      eyes.forEach((eye) => {
        eye.material.emissiveIntensity = 1;
      });
      await this.sleep(150);
      eyes.forEach((eye) => {
        eye.material.emissiveIntensity = 0.3;
      });
      await this.sleep(100);
    },
  };

  async animateServo(index, angle, blocking = true) {
    if (index === 0) {
      // head pan
      this.head.rotation.y = THREE.MathUtils.degToRad(angle);
    } else if ([8, 9, 10, 11].includes(index)) {
      const map = { 8: 'LF', 9: 'RF', 10: 'RB', 11: 'LB' };
      this.setLeg(map[index], angle);
    } else if ([12, 13, 14, 15].includes(index)) {
      const map = { 12: 'LF', 13: 'RF', 14: 'RB', 15: 'LB' };
      const leg = this.legs[map[index]];
      if (leg) leg.knee.rotation.x = THREE.MathUtils.degToRad(angle);
    }
    if (blocking) await this.sleep(400);
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

// 掛載到 global
window.BittleApp = window.BittleApp || {};
window.BittleApp.BittleSimulator3D = BittleSimulator3D;

// Auto init when 3D container exists & DOM ready
function tryInit3D() {
  const container = document.getElementById('simulator-3d-area');
  if (!container) {
    console.warn('[BittleApp] 3D container not found, skipping 3D init');
    return;
  }
  try {
    window.BittleApp.simulator3D = new BittleSimulator3D(container);
    console.log('[BittleApp] 3D simulator initialized');
  } catch (e) {
    console.error('[BittleApp] 3D init failed:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInit3D);
} else {
  tryInit3D();
}
