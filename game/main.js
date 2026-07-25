/* === MAIN — MALAM JUMAT KLIWON === */

/* === MENU FUNCTIONS (global) === */
function startNewGame() {
  Engine.state = 'playing';
  Engine.player = {
    x: 80, y: 80, w: 20, h: 28,
    speed: 60, dir: 'down', moving: false,
    animFrame: 0, animTimer: 0,
    hp: 100, maxHp: 100,
    sanity: 100, maxSanity: 100,
    inventory: [],
    maxInventory: 6,
    flashLight: false,
    keyHeld: {}
  };
  Engine.camera = {x: 0, y: 0};
  Engine.flashTimer = 0;
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'flex';
  document.querySelector('.touch-dpad').style.display = 'grid';
  document.getElementById('action-btn').style.display = 'flex';
  
  SceneLoader.load('rumah-tua');
}

function saveGame() { Engine.saveGame(); }
function loadGame() { Engine.loadGame(); }
function resumeGame() { Engine.resumeGame(); }

function goToTitle() {
  Engine.state = 'title';
  document.getElementById('pause-menu').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'none';
  document.getElementById('gameover-screen').style.display = 'none';
  document.querySelector('.touch-dpad').style.display = 'none';
  document.getElementById('action-btn').style.display = 'none';
  document.getElementById('title-screen').style.display = 'flex';
}

function retryFromCheckpoint() {
  Engine.state = 'playing';
  Engine.player.hp = 80;
  Engine.player.sanity = 60;
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'flex';
  document.querySelector('.touch-dpad').style.display = 'grid';
  document.getElementById('action-btn').style.display = 'flex';
  
  // Reload current scene
  if (Engine.scene) SceneLoader.load(Engine.scene.name);
}

function showLoadMenu() {
  if (Engine.loadGame()) {
    goToTitle(); // will be overridden by loadGame setting state to playing
  } else {
    Engine.showSubtitle('Belum ada save.', 2000);
  }
}

function showAbout() {
  Engine.showDialog('', [
    'MALAM JUMAT KLIWON — v1.0',
    'Horor interaktif 2D',
    'Cerita: Mbah pergi, desa sepi, dan sesuatu menunggu.',
    '',
    'Mainkan 3 babak:',
    '1. Rumah Tua — cari jalan keluar',
    '2. Makam — hindari Genderuwo',
    '3. Sawah — hadapi Kuntilanak',
    '',
    'Gunakan WASD / arrow untuk gerak, Space/Enter/E untuk aksi.',
    'Touch control tersedia untuk HP.',
    '',
    'Selamat bermain... dan jangan terlalu penasaran.'
  ]);
}

/* === GLOBAL KEY SHORTCUTS === */
document.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') {
    // Ritual action in scene 3
  }
  if (e.key === 's' || e.key === 'S') {
    Engine.saveGame();
  }
  if (e.key === 'l' || e.key === 'L') {
    Engine.loadGame();
  }
});

/* === BOOT === */
window.addEventListener('load', () => {
  Engine.init();
  
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    Engine.state = 'title';
  }, 1500);
});