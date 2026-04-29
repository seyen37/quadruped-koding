/* ==========================================================
   bittle-skills-data.js — Bittle 全部 skill 的單一資料源（SSOT）

   為什麼這樣設計？
     v0.1 手寫 6 個積木已寫了 ~250 行。v0.2 要 50 個積木如果繼續手寫
     就會有 ~2000 行 boilerplate，難維護。改成 metadata-driven：
     一個 array 定義全部 skill，loop 自動生成 Blockly.Blocks、generators、toolbox XML。

   要新增 skill？只要在 BITTLE_SKILLS array 加一行物件即可。
   詳見 DECISIONS.md ADR-008。

   每個 skill 的 metadata 欄位：
     id        — 唯一 ID（會變成 'bittle_<id>' 作為 Blockly block type）
     name      — 顯示名稱（中文）
     emoji     — 視覺圖示
     ascii     — 對應的 OpenCat ASCII 指令（如 'kwkF', 'ksit'）
     category  — 'gait' | 'posture' | 'show'
     anim      — SVG 模擬器要播的動畫（見 simulator-svg.js animationLibrary）
     tooltip   — hover 提示
   ========================================================== */

window.DogLabApp = window.DogLabApp || {};

DogLabApp.BITTLE_SKILLS = [
  // ============== 🚶 步態（gait，週期播放）==============
  { id: 'walk_forward',  name: '走向前',     emoji: '🚶', ascii: 'kwkF', category: 'gait', anim: 'walk',        tooltip: 'walk forward — 對角腿輪流擺動前進' },
  { id: 'walk_backward', name: '倒退',       emoji: '🔙', ascii: 'kbk',  category: 'gait', anim: 'walkReverse', tooltip: 'back — 對角腿輪流擺動後退' },
  { id: 'walk_left',     name: '向左走',     emoji: '↩️',  category: 'gait', ascii: 'kwkL', anim: 'walk',        tooltip: 'walk left — 邊走邊向左轉' },
  { id: 'walk_right',    name: '向右走',     emoji: '↪️',  category: 'gait', ascii: 'kwkR', anim: 'walk',        tooltip: 'walk right — 邊走邊向右轉' },
  { id: 'trot',          name: '小跑',       emoji: '🐎', ascii: 'ktr',  category: 'gait', anim: 'walk',        tooltip: 'trot — 小跑步（節奏比 walk 快）' },
  { id: 'trot_left',     name: '小跑左轉',   emoji: '↺',   ascii: 'ktrL', category: 'gait', anim: 'walk',        tooltip: 'trot left' },
  { id: 'trot_right',    name: '小跑右轉',   emoji: '↻',   ascii: 'ktrR', category: 'gait', anim: 'walk',        tooltip: 'trot right' },
  { id: 'crawl',         name: '慢爬',       emoji: '🐛', ascii: 'kcr',  category: 'gait', anim: 'walk',        tooltip: 'crawl — 慢速三點支撐爬行' },
  { id: 'crawl_left',    name: '慢爬左轉',   emoji: '⬅️',  ascii: 'kcrL', category: 'gait', anim: 'walk',        tooltip: 'crawl left' },
  { id: 'bound',         name: '彈跳跑',     emoji: '🦘', ascii: 'kbdF', category: 'gait', anim: 'jump',        tooltip: 'bound — 雙腳同步彈跳' },
  { id: 'jump',          name: '跳躍',       emoji: '⬆️',  ascii: 'kjmp', category: 'gait', anim: 'jump',        tooltip: 'jump' },
  { id: 'vault',         name: '跨步',       emoji: '🤸', ascii: 'kvtF', category: 'gait', anim: 'walk',        tooltip: 'vault forward' },
  { id: 'push_walk',     name: '推進步',     emoji: '🦵', ascii: 'kphF', category: 'gait', anim: 'walk',        tooltip: 'push walk — 像伏地挺身般推進' },

  // ============== 🧍 姿勢（posture，靜態到位）==============
  { id: 'balance',  name: '站穩',     emoji: '🧍', ascii: 'kbalance', category: 'posture', anim: 'balance', tooltip: 'balance — 4 腿歸零站穩' },
  { id: 'sit',      name: '坐下',     emoji: '🪑', ascii: 'ksit',     category: 'posture', anim: 'sit',     tooltip: 'sit' },
  { id: 'rest',     name: '休息',     emoji: '💤', ascii: 'krest',    category: 'posture', anim: 'rest',    tooltip: 'rest — 4 腿展開趴下' },
  { id: 'up',       name: '站立',     emoji: '🆙', ascii: 'kup',      category: 'posture', anim: 'balance', tooltip: 'up — 4 腿向後展開站立' },
  { id: 'zero',     name: '歸零',     emoji: '0️⃣',  ascii: 'kzero',    category: 'posture', anim: 'balance', tooltip: 'zero — 全 servo 歸 0°' },
  { id: 'calib',    name: '校準姿勢', emoji: '📐', ascii: 'kcalib',   category: 'posture', anim: 'balance', tooltip: 'calib — 校準專用姿勢（全部 servo = 0）' },
  { id: 'stretch',  name: '伸懶腰',   emoji: '🤲', ascii: 'kstr',     category: 'posture', anim: 'stretch', tooltip: 'stretch' },
  { id: 'butt_up',  name: '屁股翹起', emoji: '🍑', ascii: 'kbuttUp',  category: 'posture', anim: 'buttUp',  tooltip: 'butt up — 後腿低、前腿高' },

  // ============== 🎭 表演動作（show / behavior，一次性）==============
  { id: 'hi',          name: '打招呼',     emoji: '👋', ascii: 'khi',   category: 'show', anim: 'hi',         tooltip: 'hi — 揮前右腳' },
  { id: 'handshake',   name: '握手',       emoji: '🤝', ascii: 'khsk',  category: 'show', anim: 'hi',         tooltip: 'handshake — 伸出前右腳' },
  { id: 'hug',         name: '抱抱',       emoji: '🤗', ascii: 'khg',   category: 'show', anim: 'hi',         tooltip: 'hug' },
  { id: 'high_five',   name: '擊掌',       emoji: '🖐️', ascii: 'kfiv',  category: 'show', anim: 'hi',         tooltip: 'high five' },
  { id: 'good_boy',    name: '好棒棒',     emoji: '😇', ascii: 'kgdb',  category: 'show', anim: 'nod',        tooltip: 'good boy — 開心點頭' },
  { id: 'cheers',      name: '乾杯',       emoji: '🥂', ascii: 'kchr',  category: 'show', anim: 'hi',         tooltip: 'cheers' },
  { id: 'wave_head',   name: '揮頭',       emoji: '🎵', ascii: 'kwh',   category: 'show', anim: 'nod',        tooltip: 'wave head — 頭部左右搖' },
  { id: 'kick',        name: '踢腿',       emoji: '🦵', ascii: 'kkc',   category: 'show', anim: 'kick',       tooltip: 'kick — 前右腳大力踢' },
  { id: 'push_up',     name: '伏地挺身',   emoji: '💪', ascii: 'kpu',   category: 'show', anim: 'pushUp',     tooltip: 'push up — 4 腿同時彎曲再展開' },
  { id: 'push_up_one', name: '單臂伏地挺身', emoji: '💪', ascii: 'kpu1', category: 'show', anim: 'pushUp',     tooltip: 'push up single arm' },
  { id: 'scratch',     name: '抓癢',       emoji: '🐾', ascii: 'kscrh', category: 'show', anim: 'shake',      tooltip: 'scratch' },
  { id: 'sniff',       name: '聞聞',       emoji: '👃', ascii: 'ksnf',  category: 'show', anim: 'nod',        tooltip: 'sniff — 鼻子聞地' },
  { id: 'roll',        name: '翻滾',       emoji: '🔄', ascii: 'krl',   category: 'show', anim: 'shake',      tooltip: 'roll' },
  { id: 'moonwalk',    name: '月球漫步',   emoji: '🕴️', ascii: 'kmw',   category: 'show', anim: 'walkReverse', tooltip: 'moonwalk — 倒退步' },
  { id: 'nod',         name: '點頭',       emoji: '✅', ascii: 'knd',   category: 'show', anim: 'nod',        tooltip: 'nod' },
  { id: 'play_dead',   name: '裝死',       emoji: '💀', ascii: 'kpd',   category: 'show', anim: 'rest',       tooltip: 'play dead' },
  { id: 'sleep',       name: '睡覺',       emoji: '😴', ascii: 'kzz',   category: 'show', anim: 'rest',       tooltip: 'sleep / zz' },
  { id: 'hands_up',    name: '舉手',       emoji: '🙌', ascii: 'khu',   category: 'show', anim: 'hi',         tooltip: 'hands up' },
  { id: 'handstand',   name: '倒立',       emoji: '🤸‍♀️', ascii: 'khds', category: 'show', anim: 'shake',      tooltip: 'handstand' },
  { id: 'dig',         name: '挖掘',       emoji: '⛏️', ascii: 'kdg',   category: 'show', anim: 'shake',      tooltip: 'dig' },
  { id: 'angry',       name: '生氣',       emoji: '😡', ascii: 'kang',  category: 'show', anim: 'shake',      tooltip: 'angry' },
  { id: 'backflip',    name: '後空翻',     emoji: '🤾', ascii: 'kbf',   category: 'show', anim: 'jump',       tooltip: 'back flip' },
  { id: 'frontflip',   name: '前空翻',     emoji: '🤽', ascii: 'kff',   category: 'show', anim: 'jump',       tooltip: 'front flip' },
  { id: 'boxing',      name: '出拳',       emoji: '🥊', ascii: 'kbx',   category: 'show', anim: 'kick',       tooltip: 'boxing' },
  { id: 'pee',         name: '撒尿',       emoji: '🚰', ascii: 'kpee',  category: 'show', anim: 'shake',      tooltip: 'pee' },
  { id: 'come_here',   name: '過來',       emoji: '🤚', ascii: 'kcmh',  category: 'show', anim: 'hi',         tooltip: 'come here' },
  { id: 'check',       name: '檢查',       emoji: '👀', ascii: 'kck',   category: 'show', anim: 'shake',      tooltip: 'check' },
  { id: 'recover',     name: '復原',       emoji: '🔧', ascii: 'krc',   category: 'show', anim: 'balance',    tooltip: 'recover' },
  { id: 'table',       name: '桌子姿',     emoji: '🪑', ascii: 'ktbl',  category: 'show', anim: 'balance',    tooltip: 'table — 維持桌面平穩姿勢' },
  { id: 'test_servo',  name: '測試 servo', emoji: '🔬', ascii: 'kts',   category: 'show', anim: 'shake',      tooltip: 'test servo — 逐顆 servo 測試' },
];

// 依 category 分組（給 toolbox 自動產生用）
DogLabApp.SKILLS_BY_CATEGORY = {
  gait:    DogLabApp.BITTLE_SKILLS.filter(s => s.category === 'gait'),
  posture: DogLabApp.BITTLE_SKILLS.filter(s => s.category === 'posture'),
  show:    DogLabApp.BITTLE_SKILLS.filter(s => s.category === 'show'),
};
