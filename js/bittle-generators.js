/* ==========================================================
   Bittle 積木 → JavaScript code 生成器
   生成的 code 是 async function body，由 main.js 包成 async 執行
   ========================================================== */

// === 進入點 ===

Blockly.JavaScript['bittle_start'] = function (block) {
  return "BittleApp.log('🟢 程式開始', 'success');\n";
};

Blockly.JavaScript['bittle_reset'] = function (block) {
  return "await BittleApp.runtime.send('kbalance');\n";
};

// === 動作類（呼叫 BittleApp.runtime.send 派送 ASCII 指令）===

Blockly.JavaScript['bittle_walk_forward'] = function (block) {
  return "await BittleApp.runtime.send('kwkF');\n";
};

Blockly.JavaScript['bittle_walk_backward'] = function (block) {
  return "await BittleApp.runtime.send('kbk');\n";
};

Blockly.JavaScript['bittle_sit'] = function (block) {
  return "await BittleApp.runtime.send('ksit');\n";
};

Blockly.JavaScript['bittle_balance'] = function (block) {
  return "await BittleApp.runtime.send('kbalance');\n";
};

Blockly.JavaScript['bittle_rest'] = function (block) {
  return "await BittleApp.runtime.send('krest');\n";
};

Blockly.JavaScript['bittle_hi'] = function (block) {
  return "await BittleApp.runtime.send('khi');\n";
};

// === Servo 控制 ===

Blockly.JavaScript['bittle_servo_move'] = function (block) {
  const index = block.getFieldValue('SERVO_INDEX');
  const angle = block.getFieldValue('ANGLE');
  return `await BittleApp.runtime.send('m ${index} ${angle}');\n`;
};

Blockly.JavaScript['bittle_servo_move_pair'] = function (block) {
  const i1 = block.getFieldValue('SERVO_INDEX_1');
  const a1 = block.getFieldValue('ANGLE_1');
  const i2 = block.getFieldValue('SERVO_INDEX_2');
  const a2 = block.getFieldValue('ANGLE_2');
  return `await BittleApp.runtime.send('i ${i1} ${a1} ${i2} ${a2}');\n`;
};

// === 聲音 / 時間 ===

Blockly.JavaScript['bittle_beep'] = function (block) {
  const pitch = block.getFieldValue('PITCH');
  const dur = block.getFieldValue('DURATION');
  return `await BittleApp.runtime.send('b ${pitch} ${dur}');\n`;
};

Blockly.JavaScript['bittle_wait'] = function (block) {
  const seconds = block.getFieldValue('SECONDS');
  return `await BittleApp.runtime.wait(${seconds});\n`;
};
