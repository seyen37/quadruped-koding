/* ==========================================================
   bittle-generators.js — Bittle 積木 → JavaScript code 生成器
   生成的 code 是 async function body，由 main.js 包成 async 執行

   v0.2 重構：所有動作積木的 generator 由 BITTLE_SKILLS array loop 自動生成。
   ========================================================== */

// ============== 進入點 ==============

Blockly.JavaScript['bittle_start'] = function (block) {
  return "DogLabApp.log('🟢 程式開始', 'success');\n";
};

// === 事件積木 generators（v0.5.0）：包成 DogLabApp.events.on(...)  ===

['when_lifted', 'when_dropped', 'when_touch_head'].forEach((id) => {
  const eventName = id.replace('when_', '');
  Blockly.JavaScript['bittle_' + id] = function (block) {
    const innerCode = Blockly.JavaScript.statementToCode(block, 'DO');
    return `DogLabApp.events.on('${eventName}', async () => {\n  DogLabApp.log('⚡ 事件觸發: ${eventName}', 'success');\n${innerCode}});\n`;
  };
});

Blockly.JavaScript['bittle_when_distance_lt'] = function (block) {
  const cm = block.getFieldValue('CM');
  return `DogLabApp.events.on('distance_lt', async (data) => {\n  if (data && data > ${cm}) return;\n  DogLabApp.log('⚡ 距離 < ${cm} cm 觸發', 'success');\n${Blockly.JavaScript.statementToCode(block, 'DO')}});\n`;
};

Blockly.JavaScript['bittle_when_voltage_lt'] = function (block) {
  const v = block.getFieldValue('VOLTAGE');
  return `DogLabApp.events.on('voltage_lt', async (data) => {\n  if (data && data > ${v}) return;\n  DogLabApp.log('⚡ 電量 < ${v}V 觸發', 'warn');\n${Blockly.JavaScript.statementToCode(block, 'DO')}});\n`;
};

Blockly.JavaScript['bittle_reset'] = function (block) {
  return "await DogLabApp.runtime.send('kbalance');\n";
};

// ============== Servo 控制 ==============

Blockly.JavaScript['bittle_servo_move'] = function (block) {
  const index = block.getFieldValue('SERVO_INDEX');
  const angle = block.getFieldValue('ANGLE');
  return `await DogLabApp.runtime.send('m ${index} ${angle}');\n`;
};

Blockly.JavaScript['bittle_servo_move_pair'] = function (block) {
  const i1 = block.getFieldValue('SERVO_INDEX_1');
  const a1 = block.getFieldValue('ANGLE_1');
  const i2 = block.getFieldValue('SERVO_INDEX_2');
  const a2 = block.getFieldValue('ANGLE_2');
  return `await DogLabApp.runtime.send('i ${i1} ${a1} ${i2} ${a2}');\n`;
};

// ============== 聲音 / 時間 ==============

Blockly.JavaScript['bittle_beep'] = function (block) {
  const pitch = block.getFieldValue('PITCH');
  const dur = block.getFieldValue('DURATION');
  return `await DogLabApp.runtime.send('b ${pitch} ${dur}');\n`;
};

Blockly.JavaScript['bittle_wait'] = function (block) {
  const seconds = block.getFieldValue('SECONDS');
  return `await DogLabApp.runtime.wait(${seconds});\n`;
};

// ============== 動作積木 generators（loop 自動生成 50+ 個）==============

DogLabApp.BITTLE_SKILLS.forEach((skill) => {
  Blockly.JavaScript['bittle_' + skill.id] = function (block) {
    return `await DogLabApp.runtime.send('${skill.ascii}');\n`;
  };
});
