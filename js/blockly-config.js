/* ==========================================================
   Blockly 設定 — toolbox 結構與選項
   v0.2：toolbox 動作分類拆成 步態 / 姿勢 / 表演動作 三個 sub-category
   ========================================================== */

window.DogLabApp = window.DogLabApp || {};

// 由 BITTLE_SKILLS metadata 自動產生 category XML 片段
function buildSkillCategoryXml(categoryName, skills, colour) {
  const blocks = skills.map((s) => `    <block type="bittle_${s.id}"></block>`).join('\n');
  return `  <category name="${categoryName}" colour="${colour}">\n${blocks}\n  </category>`;
}

// ⚠️ Toolbox XML 在 BITTLE_SKILLS 載入後才能組裝
// 所以 DogLabApp.toolboxXml 用 getter 延遲求值
Object.defineProperty(DogLabApp, 'toolboxXml', {
  get: function () {
    const gait    = DogLabApp.SKILLS_BY_CATEGORY?.gait    || [];
    const posture = DogLabApp.SKILLS_BY_CATEGORY?.posture || [];
    const show    = DogLabApp.SKILLS_BY_CATEGORY?.show    || [];

    return `
<xml id="toolbox" style="display: none">

  <category name="🟢 開始與重置" colour="45">
    <block type="bittle_start"></block>
    <block type="bittle_reset"></block>
  </category>

  <category name="⚡ 事件感測" colour="50">
    <block type="bittle_when_lifted"></block>
    <block type="bittle_when_dropped"></block>
    <block type="bittle_when_touch_head"></block>
    <block type="bittle_when_distance_lt">
      <field name="CM">20</field>
    </block>
    <block type="bittle_when_voltage_lt">
      <field name="VOLTAGE">7.0</field>
    </block>
  </category>

${buildSkillCategoryXml(`🚶 步態（${gait.length} 個）`,    gait,    290)}
${buildSkillCategoryXml(`🧍 姿勢（${posture.length} 個）`, posture, 230)}
${buildSkillCategoryXml(`🎭 表演動作（${show.length} 個）`, show,    320)}

  <category name="⚙️ Servo 控制" colour="200">
    <block type="bittle_servo_move">
      <field name="SERVO_INDEX">8</field>
      <field name="ANGLE">30</field>
    </block>
    <block type="bittle_servo_move_pair">
      <field name="SERVO_INDEX_1">8</field>
      <field name="ANGLE_1">30</field>
      <field name="SERVO_INDEX_2">9</field>
      <field name="ANGLE_2">30</field>
    </block>
  </category>

  <category name="🔊 聲音與時間" colour="60">
    <block type="bittle_beep">
      <field name="PITCH">8</field>
      <field name="DURATION">8</field>
    </block>
    <block type="bittle_wait">
      <field name="SECONDS">1</field>
    </block>
  </category>

  <category name="🔁 流程控制" colour="120">
    <block type="controls_repeat_ext">
      <value name="TIMES"><shadow type="math_number"><field name="NUM">3</field></shadow></value>
    </block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
      <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    </block>
    <block type="controls_if"></block>
  </category>

  <category name="🧮 數學" colour="230">
    <block type="math_number"><field name="NUM">0</field></block>
    <block type="math_arithmetic"></block>
    <block type="math_random_int">
      <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
      <value name="TO"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
    </block>
  </category>

  <category name="📦 變數" colour="330" custom="VARIABLE"></category>

  <category name="🔤 文字" colour="160">
    <block type="text"></block>
    <block type="text_print"><value name="TEXT"><shadow type="text"><field name="TEXT">Hello Bittle</field></shadow></value></block>
  </category>

  <sep></sep>

  <category name="🚧 擴充（規劃中）" colour="20">
    <label text="這些功能在 v0.3+ 開放："></label>
    <label text="• 感測器事件積木（lifted/dropped/IR）"></label>
    <label text="• OpenAI 串接"></label>
    <label text="• Teachable Machine"></label>
    <label text="• IoT (MQTT)"></label>
    <label text="• 多機器人切換（雙足/Go1/microbit）"></label>
  </category>

</xml>
    `;
  },
});

DogLabApp.blocklyOptions = {
  get toolbox() { return DogLabApp.toolboxXml; },
  trashcan: true,
  scrollbars: true,
  sounds: false,
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.95,
    maxScale: 2.0,
    minScale: 0.5,
    scaleSpeed: 1.1,
  },
  grid: {
    spacing: 20,
    length: 3,
    colour: '#2c313c',
    snap: true,
  },
  theme: Blockly.Themes.Classic,
};
