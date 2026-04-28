/* ==========================================================
   Bittle 自訂積木定義
   參考主筆記附錄 D 的 ASCII token + skill 縮寫對照
   ========================================================== */

// === 進入點（Hat Block）：仿 NUWA / Scratch 的「開始」積木 ===

Blockly.Blocks['bittle_start'] = {
  init: function () {
    this.appendDummyInput().appendField('🟢 當程式開始');
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('程式從這裡開始執行（把動作積木接在底下）');
  },
};

Blockly.Blocks['bittle_reset'] = {
  init: function () {
    this.appendDummyInput().appendField('🔄 重置 Bittle 到站穩姿勢');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(45);
    this.setTooltip('讓 Bittle 回到 kbalance 站穩姿勢，腿復位');
  },
};

// === 動作類（Action）：對應 OpenCat 內建 56 skills 的 6 個 MVP 子集 ===

Blockly.Blocks['bittle_walk_forward'] = {
  init: function () {
    this.appendDummyInput().appendField('🚶 走向前');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 walk forward (kwkF) skill');
    this.setHelpUrl('https://github.com/PetoiCamp/OpenCat-Quadruped-Robot');
  },
};

Blockly.Blocks['bittle_walk_backward'] = {
  init: function () {
    this.appendDummyInput().appendField('🔙 倒退');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 walk backward (kbk) skill');
  },
};

Blockly.Blocks['bittle_sit'] = {
  init: function () {
    this.appendDummyInput().appendField('🪑 坐下');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 sit (ksit) skill');
  },
};

Blockly.Blocks['bittle_balance'] = {
  init: function () {
    this.appendDummyInput().appendField('🧍 站穩');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 balance (kbalance) skill');
  },
};

Blockly.Blocks['bittle_rest'] = {
  init: function () {
    this.appendDummyInput().appendField('💤 休息');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 rest (krest) skill');
  },
};

Blockly.Blocks['bittle_hi'] = {
  init: function () {
    this.appendDummyInput().appendField('👋 打招呼');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('執行 hi (khi) skill');
  },
};

// === Servo 控制 ===

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

// === 聲音 / 時間 ===

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
