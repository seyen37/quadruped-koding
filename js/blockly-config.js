/* ==========================================================
   Blockly 設定 — toolbox 結構與選項
   ========================================================== */

window.BittleApp = window.BittleApp || {};

// Toolbox：左側積木分類選單
BittleApp.toolboxXml = `
<xml id="toolbox" style="display: none">

  <category name="🟢 開始與重置" colour="45">
    <block type="bittle_start"></block>
    <block type="bittle_reset"></block>
  </category>

  <category name="🐕 動作（Action）" colour="290">
    <block type="bittle_walk_forward"></block>
    <block type="bittle_walk_backward"></block>
    <block type="bittle_sit"></block>
    <block type="bittle_balance"></block>
    <block type="bittle_rest"></block>
    <block type="bittle_hi"></block>
  </category>

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
    <label text="這些功能在 v0.2+ 開放：" web-class="myLabelStyle"></label>
    <label text="• 感測器事件積木（lifted/dropped/IR）"></label>
    <label text="• OpenAI 串接"></label>
    <label text="• Teachable Machine"></label>
    <label text="• IoT (MQTT)"></label>
  </category>

</xml>
`;

// Blockly 注入時的選項
BittleApp.blocklyOptions = {
  toolbox: BittleApp.toolboxXml,
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
  theme: Blockly.Themes.Classic, // 後續可改 dark theme
};

// 切換 Blockly 介面到繁體中文（如果語言檔已載入）
if (typeof Blockly !== 'undefined' && Blockly.Msg) {
  // zh-hant 訊息已透過 <script src="msg/zh-hant.js"> 載入
}
