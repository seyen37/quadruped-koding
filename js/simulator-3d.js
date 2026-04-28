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

// ===== 彈簧曲線（給 TubeGeometry 用） =====
// 沿 Y 軸方向產生螺旋線，用於模擬實機 Bittle 4-bar linkage 的 compliant spring
class SpringCurve extends THREE.Curve {
  constructor(height = 20, radius = 5, turns = 4) {
    super();
    this.height = height;
    this.radius = radius;
    this.turns = turns;
  }
  getPoint(t, target = new THREE.Vector3()) {
    const angle = t * Math.PI * 2 * this.turns;
    return target.set(
      Math.cos(angle) * this.radius,
      t * this.height,
      Math.sin(angle) * this.radius
    );
  }
}

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

    // v0.4.6 新配色：仿實機 Bittle 黃黑配色 + 銀白彈簧
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x202428, roughness: 0.5, metalness: 0.2 }); // 黑色機身
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffb84a, emissive: 0xff9d3a, emissiveIntensity: 0.4 }); // 橘色 LED
    const upperLegMat = new THREE.MeshStandardMaterial({ color: 0xf5b800, roughness: 0.4, metalness: 0.3 }); // 上腿亮黃（仿實機）
    const lowerLegMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.3 }); // 下腿黑色
    const springMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 }); // 銀白金屬彈簧
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf5b800, roughness: 0.4 }); // 黃色頭

    // 身體 v0.4.10：依實機照比例（細長 body）
    const body = new THREE.Mesh(new THREE.BoxGeometry(200, 40, 80), bodyMat);
    body.castShadow = true;
    this.bittle.add(body);

    // 脖子（黑色短柱）v0.4.10
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 16, 22, 12),
      bodyMat
    );
    neck.position.set(115, 5, 0);
    neck.rotation.z = -Math.PI / 2.8; // 略微傾斜向上
    neck.castShadow = true;
    this.bittle.add(neck);

    // 頭部 group v0.4.10：縮小頭、依實機比例
    this.head = new THREE.Group();
    this.head.position.set(150, 18, 0);
    const headBall = new THREE.Mesh(new THREE.SphereGeometry(28, 24, 16), headMat);
    headBall.castShadow = true;
    this.head.add(headBall);

    // 雙眼 v0.4.10：縮小
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x4a90e2, emissiveIntensity: 0.8 });
    [20, -20].forEach((z) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 12), eyeMat);
      eye.position.set(16, 4, z);
      this.head.add(eye);
    });

    // 嘴
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(7, 3, 9),
      bodyMat
    );
    mouth.position.set(22, -8, 0);
    this.head.add(mouth);

    // 耳朵 v0.4.10：更尖
    [22, -22].forEach((z) => {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(5, 18, 4),
        headMat
      );
      ear.position.set(-8, 22, z);
      ear.rotation.z = Math.PI;
      this.head.add(ear);
    });

    // 尾巴（細小錐體，仿實機，斜上揚）v0.4.10 新增
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(4, 40, 6),
      bodyMat
    );
    tail.position.set(-115, 15, 0);
    tail.rotation.z = -Math.PI / 4;
    this.bittle.add(tail);

    this.bittle.add(this.head);

    // 4 條腿 v0.4.10：依實機照「ㄑ字形」站姿
    // 大腿（從 shoulder 看）向斜下後/前傾（前腿向後下、後腿向前下）
    // 小腿（從 knee 看）反折，腳掌向身體中心匯聚
    this.legs = {};
    const legPositions = {
      LF: { x: 75, z: 50, baseShoulder: -35, baseKnee: 70 },   // 前左：大腿向後下、小腿反折前下
      RF: { x: 75, z: -50, baseShoulder: -35, baseKnee: 70 },
      LB: { x: -75, z: 50, baseShoulder: 35, baseKnee: -70 },  // 後左：大腿向前下、小腿反折後下
      RB: { x: -75, z: -50, baseShoulder: 35, baseKnee: -70 },
    };

    Object.entries(legPositions).forEach(([id, pos]) => {
      // ===== Shoulder pivot group（含預設 base 角度）=====
      const legGroup = new THREE.Group();
      legGroup.position.set(pos.x, -22, pos.z);
      legGroup.rotation.z = THREE.MathUtils.degToRad(pos.baseShoulder); // ★ 預設角度

      // Shoulder LED 球（橘色）
      const shoulderBall = new THREE.Mesh(
        new THREE.SphereGeometry(10, 16, 16),
        accentMat
      );
      legGroup.add(shoulderBall);

      // Upper leg（黃色，仿實機）
      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(14, 45, 9),
        upperLegMat
      );
      upper.position.y = -22.5;
      upper.castShadow = true;
      legGroup.add(upper);

      // ===== Knee group（含預設 base 角度，反折形成 ㄑ字形）=====
      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -45;
      kneeGroup.rotation.z = THREE.MathUtils.degToRad(pos.baseKnee); // ★ 預設角度

      // Knee LED 球
      const kneeBall = new THREE.Mesh(
        new THREE.SphereGeometry(7, 12, 12),
        accentMat
      );
      kneeGroup.add(kneeBall);

      // ★ Compliant Spring
      const springGeo = new THREE.TubeGeometry(
        new SpringCurve(20, 5, 5),
        96, 1.0, 8, false
      );
      const spring = new THREE.Mesh(springGeo, springMat);
      spring.position.y = 0;
      spring.rotation.x = Math.PI;
      kneeGroup.add(spring);

      // Lower leg（黑色，仿實機）
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(11, 30, 5),
        lowerLegMat
      );
      lower.position.y = -35;
      lower.castShadow = true;
      kneeGroup.add(lower);

      // 足底（黑色橡膠球）
      const foot = new THREE.Mesh(
        new THREE.SphereGeometry(6, 12, 12),
        lowerLegMat
      );
      foot.position.y = -52;
      kneeGroup.add(foot);

      legGroup.add(kneeGroup);
      this.bittle.add(legGroup);

      this.legs[id] = {
        group: legGroup,
        knee: kneeGroup,
        spring: spring,
        baseShoulder: pos.baseShoulder,
        baseKnee: pos.baseKnee,
      };
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

  // v0.4.10: setLeg 改為「基準站姿 + 動畫偏移」
  // - 每條腿有 baseShoulder / baseKnee 預設角度（ㄑ字形）
  // - 動畫時 shoulderDeg 是相對於基準的偏移
  // - knee 4-bar 自動連動（kneeRatio = -0.55，更明顯的彈簧連動）
  // - 彈簧視覺反饋更明顯（scale 0 ~ 0.35）
  setLeg(id, shoulderDeg, kneeOverride = null) {
    const leg = this.legs[id];
    if (!leg) return;
    // 真實 shoulder 角度 = 基準 + 偏移
    const realShoulder = leg.baseShoulder + shoulderDeg;
    leg.group.rotation.z = THREE.MathUtils.degToRad(realShoulder);
    // 4-bar 連動：knee 也是基準 + 偏移（彈簧帶動）
    const kneeAnimOffset = (kneeOverride !== null) ? kneeOverride : shoulderDeg * -0.55;
    const realKnee = leg.baseKnee + kneeAnimOffset;
    leg.knee.rotation.z = THREE.MathUtils.degToRad(realKnee);
    // 彈簧視覺反饋更明顯：當 shoulder 偏離 base 愈大、彈簧愈縮（張力暗示）
    const stress = Math.min(Math.abs(shoulderDeg) / 60, 1);
    if (leg.spring) leg.spring.scale.y = 1 - stress * 0.35;
  }

  resetLegs() {
    // 重置 = setLeg(id, 0)：恢復基準 ㄑ字形站姿
    Object.keys(this.legs).forEach((id) => this.setLeg(id, 0));
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
      // v0.4.6 平滑化：用 lerp 在每階段細分 8 個 frame，讓動作連續自然
      // bound 步態，腿前後大幅擺動，4-bar 讓 knee 自動連動
      const lerp = THREE.MathUtils.lerp;
      const subFrames = 8;
      const frameMs = 35;

      const setBound = (frontDeg, backDeg) => {
        this.setLeg('LF', frontDeg); this.setLeg('RF', frontDeg);
        this.setLeg('LB', backDeg); this.setLeg('RB', backDeg);
      };

      for (let cycle = 0; cycle < 4; cycle++) {
        // 跨步階段：從收腿位置 (front -25, back +25) → 大跨步 (front +50, back -50)
        for (let p = 0; p <= subFrames; p++) {
          const t = p / subFrames;
          setBound(lerp(-25, 50, t), lerp(25, -50, t));
          await this.sleep(frameMs);
        }
        // 收腿階段：反向回收
        for (let p = 0; p <= subFrames; p++) {
          const t = p / subFrames;
          setBound(lerp(50, -25, t), lerp(-50, 25, t));
          await this.sleep(frameMs);
        }
      }
      this.resetLegs();
    },

    walkReverse: async function () {
      // 倒退：起始與目標翻轉
      const lerp = THREE.MathUtils.lerp;
      const subFrames = 8;
      const frameMs = 35;

      const setBound = (frontDeg, backDeg) => {
        this.setLeg('LF', frontDeg); this.setLeg('RF', frontDeg);
        this.setLeg('LB', backDeg); this.setLeg('RB', backDeg);
      };

      for (let cycle = 0; cycle < 4; cycle++) {
        for (let p = 0; p <= subFrames; p++) {
          const t = p / subFrames;
          setBound(lerp(25, -50, t), lerp(-25, 50, t));
          await this.sleep(frameMs);
        }
        for (let p = 0; p <= subFrames; p++) {
          const t = p / subFrames;
          setBound(lerp(-50, 25, t), lerp(50, -25, t));
          await this.sleep(frameMs);
        }
      }
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
      // head pan（仍用 rotation.y — 頭轉動是繞垂直軸，這個 axis 對的）
      this.head.rotation.y = THREE.MathUtils.degToRad(angle);
    } else if ([8, 9, 10, 11].includes(index)) {
      // shoulder pitch（v0.4.7 改用 rotation.z 修正方向）
      const map = { 8: 'LF', 9: 'RF', 10: 'RB', 11: 'LB' };
      this.setLeg(map[index], angle);
    } else if ([12, 13, 14, 15].includes(index)) {
      // knee（v0.4.7 改用 rotation.z 修正方向）
      const map = { 12: 'LF', 13: 'RF', 14: 'RB', 15: 'LB' };
      const leg = this.legs[map[index]];
      if (leg) leg.knee.rotation.z = THREE.MathUtils.degToRad(angle);
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
