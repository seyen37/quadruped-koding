/* ==========================================================
   bittle-blocks.js — Bittle 自訂積木定義
   ----------------------------------------------------------
   v0.2 重構：除了「進入點」與「Servo / 聲音」少數固定積木，
   所有 50+ 動作積木由 BITTLE_SKILLS array loop 自動生成。

   詳見：
   - js/bittle-skills-data.js（單一資料源）
   - DECISIONS.md ADR-008（metadata-driven 設計理由）
   ========================================================== */

// ============== 進入點（hat）與重置 ==============

Blockly.Blocks['bittle_start'] = {
  init: function () {
    this.appendDummyInput().appendField('🟢 當程式開始');
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('程式從這裡開始執行（把動作積木接在底下）');
  },
};

// ============== 事件積木（hat block + statement input）v0.5.0 ==============

const EVENT_BLOCKS = [
  { id: 'when_lifted',     emoji: '🤚', name: '當被舉起時',     event: 'lifted' },
  { id: 'when_dropped',    emoji: '💥', name: '當跌落時',       event: 'dropped' },
  { id: 'when_touch_head', emoji: '👆', name: '當頭被觸碰時',   event: 'touch_head' },
];

EVENT_BLOCKS.forEach((evt) => {
  Blockly.Blocks['bittle_' + evt.id] = {
    init: function () {
      this.appendDummyInput().appendField(evt.emoji + ' ' + evt.name);
      this.appendStatementInput('DO').setCheck(null);
      this.setColour(50); // 黃綠色，仿 Scratch 事件積木
      this.setTooltip(`綁定 handler：當機器人「${evt.name.slice(1, -1)}」時，執行內部積木`);
    },
  };
});

// 帶數字參數的事件積木（distance / voltage）
Blockly.Blocks['bittle_when_distance_lt'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('📏 當前方距離小於')
      .appendField(new Blockly.FieldNumber(20, 1, 200), 'CM')
      .appendField('公分時');
    this.appendStatementInput('DO').setCheck(null);
    this.setColour(50);
    this.setTooltip('超音波感測器偵測到距離小於設定值時觸發（需接超音波模組或在模擬器手動觸發）');
  },
};

Blockly.Blocks['bittle_when_voltage_lt'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔋 當電量低於')
      .appendField(new Blockly.FieldNumber(7.0, 6.0, 9.0, 0.1), 'VOLTAGE')
      .appendField('V 時');
    this.appendStatementInput('DO').setCheck(null);
    this.setColour(50);
    this.setTooltip('讀電池 ADC7 低於設定值時觸發');
  },
};

Blockly.Blocks['bittle_reset'] = {
  init: function () {
    this.appendDummyInput().appendField('🔄 重置 Bittle 到站穩姿勢');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('讓 Bittle 回到 kbalance 站穩姿勢');
  },
};

// ============== Servo 控制（手寫，因有 input slot）==============

Blockly.Blocks['bittle_servo_move'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚙️ 移動 servo')
      .appendField(
        new Blockly.FieldDropdown([
          ['0 (頭)', '0'],
          ['8 (LF shoulder)', '8'],
          ['9 (RF shoulder)', '9'],
          ['10 (RB shoulder)', '10'],
          ['11 (LB shoulder)', '11'],
          ['12 (LF knee)', '12'],
          ['13 (RF knee)', '13'],
          ['14 (RB knee)', '14'],
          ['15 (LB knee)', '15'],
        ]),
        'SERVO_INDEX'
      )
      .appendField('到')
      .appendField(new Blockly.FieldNumber(30, -125, 125), 'ANGLE')
      .appendField('度');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip('送 ASCII 指令 m <index> <angle>，角度範圍 ±125°');
  },
};

Blockly.Blocks['bittle_servo_move_pair'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚙️ 同時移動 servo')
      .appendField(new Blockly.FieldNumber(8, 0, 15), 'SERVO_INDEX_1')
      .appendField('到')
      .appendField(new Blockly.FieldNumber(30, -125, 125), 'ANGLE_1')
      .appendField('度');
    this.appendDummyInput()
      .appendField('和 servo')
      .appendField(new Blockly.FieldNumber(9, 0, 15), 'SERVO_INDEX_2')
      .appendField('到')
      .appendField(new Blockly.FieldNumber(30, -125, 125), 'ANGLE_2')
      .appendField('度');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(200);
    this.setTooltip('送 ASCII 指令 i <i1> <a1> <i2> <a2>');
  },
};

// ============== 聲音 / 時間 ==============

Blockly.Blocks['bittle_beep'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔊 蜂鳴 音高')
      .appendField(new Blockly.FieldNumber(8, 1, 32), 'PITCH')
      .appendField('時長')
      .appendField(new Blockly.FieldNumber(8, 1, 32), 'DURATION');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('送 ASCII 指令 b <pitch> <duration>');
  },
};

Blockly.Blocks['bittle_wait'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⏱️ 等待')
      .appendField(new Blockly.FieldNumber(1, 0.1, 60, 0.1), 'SECONDS')
      .appendField('秒');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('暫停指定秒數後繼續執行下一個積木');
  },
};

// ============== 動作積木（loop 自動生成 50+ 個）==============

const SKILL_COLOUR = {
  gait: 290,    // 紫色
  posture: 230, // 藍紫
  show: 320,    // 粉紫
};

DogLabApp.BITTLE_SKILLS.forEach((skill) => {
  Blockly.Blocks['bittle_' + skill.id] = {
    init: function () {
      this.appendDummyInput().appendField(skill.emoji + ' ' + skill.name);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(SKILL_COLOUR[skill.category] || 290);
      this.setTooltip(skill.tooltip || skill.ascii);
      this.setHelpUrl('https://github.com/PetoiCamp/OpenCat-Quadruped-Robot');
    },
  };
});

console.log(`[DogLabApp] Registered ${DogLabApp.BITTLE_SKILLS.length} action blocks (gait/posture/show)`);
