/* === MAIN — MALAM JUMAT KLIWON v2 === */

/* === MENU FUNCTIONS === */
function startNewGame() {
  Engine.state = 'playing';
  Engine.player = {
    x: 80, y: 80, w: 16, h: 24,
    speed: 60, sneakSpeed: 35,
    dir: 'down', moving: false, sneak: false,
    animFrame: 0, animTimer: 0,
    hp: 100, maxHp: 100,
    sanity: 100, maxSanity: 100,
    inventory: [], maxInventory: 6,
    flashLight: false,
    battery: 100,
    hasLighter: false,
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
  Engine.player.hp = 60;
  Engine.player.sanity = 50;
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('pause-btn').style.display = 'flex';
  document.querySelector('.touch-dpad').style.display = 'grid';
  document.getElementById('action-btn').style.display = 'flex';
  if (Engine.scene) SceneLoader.load(Engine.scene.name);
}

function showLoadMenu() {
  if (Engine.loadGame()) {
    goToTitle();
  } else {
    Engine.showSubtitle('Belum ada save.', 2000);
  }
}

function showAbout() {
  Engine.showDialog('', [
    'MALAM JUMAT KLIWON — v2.0',
    'Horor interaktif 2D',
    'Cerita: Mbah pergi, desa sepi, dan sesuatu menunggu.',
    '',
    'Tiga babak:',
    '1. Rumah Tua — cari petunjuk, hadapi misteri',
    '2. Makam — hindari Genderuwo, temukan Mbah',
    '3. Sawah — ritual akhir melawan Kuntilanak',
    '',
    'WASD/Arrow = gerak, Shift = jalan pelan',
    'F = senter ON/OFF, E/Spasi = interaksi',
    'P/Esc = jeda, S = simpan',
    '',
    'Selamat bermain...',
    'Dan jangan terlalu penasaran.'
  ]);
}

/* === BOOT === */
window.addEventListener('load', () => {
  Engine.init();

  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('title-screen').style.display = 'flex';
    Engine.state = 'title';
  }, 1500);
});