/* === ENGINE INTI v2 — MALAM JUMAT KLIWON ===
   Sesuai GDD. Asset-driven, battery, stealth, sanity.
*/

const Engine = {
  canvas: null, ctx: null,
  W: 0, H: 0, TILE: 32,
  camera: {x:0, y:0},
  state: 'loading',
  scene: null,
  tick: 0, dt: 0, lastTime: 0,
  keys: {},
  flashTimer: 0,
  subtitles: [],
  subtitleTimer: 0,

  player: {
    x: 80, y: 80, w: 16, h: 24,
    speed: 60, sneakSpeed: 35,
    dir: 'down', moving: false, sneak: false,
    animFrame: 0, animTimer: 0,
    hp: 100, maxHp: 100,
    sanity: 100, maxSanity: 100,
    inventory: [], maxInventory: 6,
    flashLight: false,
    battery: 100,  // percent
    hasLighter: false,
  },

  dialog: {
    speaker: '', text: '', lines: [], index: 0,
    active: false, callback: null
  },

  audioCtx: null,
  audioEnabled: true,

  init() {
    // Ensure Asset is initialized before game loop
    if (typeof Asset !== 'undefined' && Asset.init) Asset.init();

    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Keyboard
    document.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') this.handleAction();
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') this.togglePause();
      if (e.key === 'f' || e.key === 'F') this.toggleFlashlight();
      if (e.key === 's' || e.key === 'S') this.saveGame();
      if (e.key === 'l' || e.key === 'L') this.loadGame();
      if (e.key === 'Shift') this.player.sneak = true;
    });
    document.addEventListener('keyup', e => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === 'Shift') this.player.sneak = false;
    });

    // Touch dpad
    document.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
      const dir = btn.dataset.dir;
      const keyMap = {up:'w', down:'s', left:'a', right:'d'};
      btn.addEventListener('touchstart', e => { e.preventDefault(); this.keys[keyMap[dir]] = true; });
      btn.addEventListener('touchend', e => { e.preventDefault(); this.keys[keyMap[dir]] = false; });
    });
    document.getElementById('action-btn').addEventListener('click', () => this.handleAction());
    document.getElementById('action-btn').addEventListener('touchstart', e => { e.preventDefault(); this.handleAction(); });
    document.getElementById('dialog-box').addEventListener('click', () => this.advanceDialog());

    // Audio context init on first interaction
    document.addEventListener('click', () => this.initAudio(), {once: true});

    this.lastTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
  },

  initAudio() {
    if (this.audioCtx) return;
    try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { this.audioEnabled = false; }
  },

  /* === AUDIO === */
  playTone(freq, duration, type='sine', volume=0.3) {
    if (!this.audioEnabled || !this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  },

  playAmbient(type) {
    if (!this.audioEnabled || !this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 3;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = this.audioCtx.createGain();
    gain.gain.value = type === 'indoor' ? 0.1 : 0.12;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'indoor' ? 250 : 600;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start();
    return source;
  },

  playJumpscare() {
    this.playTone(80, 0.3, 'sawtooth', 0.5);
    this.playTone(60, 0.5, 'square', 0.3);
    this.flashScreen(120);
  },

  flashScreen(duration=100) {
    const el = document.getElementById('flash-overlay');
    el.style.display = 'block';
    this.flashTimer = duration;
  },

  /* === DIALOG === */
  showDialog(speaker, lines, callback) {
    this.state = 'dialog';
    this.dialog.speaker = speaker || '';
    this.dialog.lines = typeof lines === 'string' ? [lines] : lines;
    this.dialog.index = 0;
    this.dialog.callback = callback || null;
    this.dialog.active = true;
    const box = document.getElementById('dialog-box');
    box.style.display = 'block';
    document.getElementById('dialog-speaker').textContent = speaker ? `[${speaker}]` : '';
    document.getElementById('dialog-text').textContent = this.dialog.lines[0];
  },

  advanceDialog() {
    if (this.state !== 'dialog' || !this.dialog.active) return;
    this.dialog.index++;
    if (this.dialog.index >= this.dialog.lines.length) {
      this.closeDialog();
      return;
    }
    document.getElementById('dialog-speaker').textContent = 
      this.dialog.speaker ? `[${this.dialog.speaker}]` : '';
    document.getElementById('dialog-text').textContent = this.dialog.lines[this.dialog.index];
  },

  closeDialog() {
    this.dialog.active = false;
    document.getElementById('dialog-box').style.display = 'none';
    this.state = 'playing';
    if (this.dialog.callback) { this.dialog.callback(); this.dialog.callback = null; }
  },

  /* === SUBTITLES === */
  showSubtitle(text, duration=3000) {
    const el = document.getElementById('subtitle-overlay');
    el.textContent = text;
    el.style.display = 'block';
    this.subtitleTimer = duration;
  },

  /* === INVENTORY === */
  addItem(item) {
    if (this.player.inventory.length >= this.player.maxInventory) {
      this.showSubtitle('Inventory penuh!', 1500);
      return false;
    }
    this.player.inventory.push(item);
    this.showSubtitle(`Dapat: ${item.name}`, 1500);
    this.updateInventoryUI();
    return true;
  },

  hasItem(itemId) {
    return this.player.inventory.some(i => i.id === itemId);
  },

  removeItem(itemId) {
    const idx = this.player.inventory.findIndex(i => i.id === itemId);
    if (idx !== -1) { this.player.inventory.splice(idx, 1); this.updateInventoryUI(); return true; }
    return false;
  },

  updateInventoryUI() {
    const bar = document.getElementById('inventory-bar');
    if (this.player.inventory.length === 0) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    bar.innerHTML = '';
    this.player.inventory.forEach(item => {
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.textContent = item.icon || item.name.substring(0,3);
      div.title = item.name;
      bar.appendChild(div);
    });
  },

  toggleFlashlight() {
    if (!this.hasItem('senter')) return;
    this.player.flashLight = !this.player.flashLight;
    this.showSubtitle(this.player.flashLight ? 'Senter ON' : 'Senter OFF', 800);
  },

  /* === SAVE/LOAD === */
  saveGame() {
    const data = {
      player: {
        x: this.player.x, y: this.player.y,
        hp: this.player.hp, sanity: this.player.sanity,
        inventory: this.player.inventory,
        flashLight: this.player.flashLight,
        battery: this.player.battery,
        hasLighter: this.player.hasLighter,
      },
      sceneState: this.scene ? this.scene.getState() : {},
      sceneName: this.scene ? this.scene.name : '',
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('horor_save', JSON.stringify(data));
      this.showSubtitle('Game disimpan.', 1500);
    } catch(e) { this.showSubtitle('Gagal menyimpan!', 1500); }
  },

  loadGame() {
    try {
      const raw = localStorage.getItem('horor_save');
      if (!raw) { this.showSubtitle('Tidak ada save.', 1500); return false; }
      const data = JSON.parse(raw);
      Object.assign(this.player, data.player);
      if (data.sceneName && SceneLoader.scenes[data.sceneName]) {
        SceneLoader.load(data.sceneName);
        if (this.scene && this.scene.setState) this.scene.setState(data.sceneState);
      }
      this.updateInventoryUI();
      this.showSubtitle('Game dimuat.', 1500);
      this.state = 'playing';
      document.getElementById('title-screen').style.display = 'none';
      document.getElementById('pause-menu').style.display = 'none';
      document.getElementById('pause-btn').style.display = 'flex';
      document.querySelector('.touch-dpad').style.display = 'grid';
      document.getElementById('action-btn').style.display = 'flex';
      return true;
    } catch(e) { this.showSubtitle('Save corrupt!', 1500); return false; }
  },

  /* === PAUSE === */
  togglePause() {
    if (this.state === 'playing') { this.state = 'paused'; document.getElementById('pause-menu').style.display = 'flex'; }
    else if (this.state === 'paused') { this.resumeGame(); }
  },

  resumeGame() {
    this.state = 'playing';
    document.getElementById('pause-menu').style.display = 'none';
  },

  /* === GAME OVER === */
  gameOver(reason) {
    this.state = 'gameover';
    document.getElementById('gameover-reason').textContent = reason;
    document.getElementById('gameover-screen').style.display = 'flex';
    document.getElementById('pause-btn').style.display = 'none';
    document.querySelector('.touch-dpad').style.display = 'none';
    document.getElementById('action-btn').style.display = 'none';
    this.playJumpscare();
  },

  /* === PLAYER MOVEMENT === */
  updatePlayer(dt) {
    const p = this.player;
    p.sneak = this.keys['shift'] || false;
    const currentSpeed = p.sneak ? p.sneakSpeed : p.speed;
    let dx = 0, dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) { dy = -1; p.dir = 'up'; }
    else if (this.keys['s'] || this.keys['arrowdown']) { dy = 1; p.dir = 'down'; }
    else if (this.keys['a'] || this.keys['arrowleft']) { dx = -1; p.dir = 'left'; }
    else if (this.keys['d'] || this.keys['arrowright']) { dx = 1; p.dir = 'right'; }

    p.moving = dx !== 0 || dy !== 0;

    if (p.moving) {
      if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
      const spd = currentSpeed * dt;
      let nx = p.x + dx * spd;
      let ny = p.y + dy * spd;

      // Collision
      if (this.scene && this.scene.isSolid) {
        if (!this.scene.isSolid(nx + p.w/2, p.y + p.h/2) &&
            !this.scene.isSolid(nx + p.w/2, p.y + p.h/4) &&
            !this.scene.isSolid(nx + p.w/4, p.y + p.h/2)) p.x = nx;
        if (!this.scene.isSolid(p.x + p.w/2, ny + p.h/2) &&
            !this.scene.isSolid(p.x + p.w/2, ny + p.h/4) &&
            !this.scene.isSolid(p.x + p.w/4, ny + p.h/2)) p.y = ny;
      } else {
        p.x = nx; p.y = ny;
      }

      p.animTimer += dt;
      if (p.animTimer > 0.2) { p.animTimer = 0; p.animFrame = (p.animFrame + 1) % 4; }
    }

    // Bounds
    if (this.scene) {
      p.x = Math.max(2, Math.min(this.scene.w - p.w - 2, p.x));
      p.y = Math.max(2, Math.min(this.scene.h - p.h - 2, p.y));
    }

    // Camera follow (lerp)
    const targetCX = p.x - this.W/2 + p.w/2;
    const targetCY = p.y - this.H/2 + p.h/2;
    this.camera.x += (targetCX - this.camera.x) * 0.1;
    this.camera.y += (targetCY - this.camera.y) * 0.1;
  },

  handleAction() {
    if (this.state === 'dialog') { this.advanceDialog(); return; }
    if (this.state !== 'playing') return;
    if (this.scene && this.scene.interact) {
      this.scene.interact(this.player.x, this.player.y);
    }
  },

  /* === UPDATE === */
  update(dt) {
    const p = this.player;

    // Battery drain (flashlight on)
    if (p.flashLight && p.battery > 0) {
      p.battery -= 1.5 * dt; // ~66 seconds full
      if (p.battery <= 0) {
        p.battery = 0;
        p.flashLight = false;
        this.showSubtitle('Baterai senter habis!', 2000);
      }
    }

    // Sanity recovery when flashlight ON
    if (p.flashLight && p.sanity < p.maxSanity) {
      p.sanity = Math.min(p.maxSanity, p.sanity + 2 * dt);
    }

    // Sanity drain in dark
    if (!p.flashLight && this.tick % 90 === 0) {
      p.sanity = Math.max(0, p.sanity - 0.5);
    }

    // Low sanity effects
    if (p.sanity < 30 && this.tick % 180 === 0) {
      this.playTone(200 + Math.random() * 100, 0.1, 'sine', 0.06);
    }

    // Subtitle timer
    if (this.subtitleTimer > 0) {
      this.subtitleTimer -= dt * 1000;
      if (this.subtitleTimer <= 0) document.getElementById('subtitle-overlay').style.display = 'none';
    }

    // Flash timer
    if (this.flashTimer > 0) {
      this.flashTimer -= dt * 1000;
      if (this.flashTimer <= 0) document.getElementById('flash-overlay').style.display = 'none';
    }

    // Death checks
    if (p.hp <= 0) this.gameOver('Nyawamu habis... Kegelapan menyambut.');
    if (p.sanity <= 0) this.gameOver('Kewarasannya runtuh... jiwa tersesat selamanya.');

    // Scene update
    if (this.scene && this.scene.update) this.scene.update(dt);
  },

  /* === RENDER === */
  render() {
    const ctx = this.ctx;
    const cam = this.camera;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.save();
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));

    // Scene
    if (this.scene && this.scene.render) this.scene.render(ctx);

    // Player
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'dialog') {
      this.renderPlayer(ctx);
    }

    // Fog
    if (this.scene && this.scene.fogColor) {
      this.renderFog(ctx);
    }

    ctx.restore();

    // HUD
    if (this.state === 'playing' || this.state === 'dialog') this.renderHUD(ctx);
  },

  renderPlayer(ctx) {
    const p = this.player;
    Asset.drawSprite('player', ctx, Math.round(p.x), Math.round(p.y),
      p.dir, p.moving ? p.animFrame : 0, p.flashLight);
  },

  renderFog(ctx) {
    if (!this.scene) return;
    const p = this.player;
    const lightRadius = p.flashLight && p.battery > 0 ? 220 : 100;
    const grad = ctx.createRadialGradient(
      p.x + p.w/2, p.y + p.h/2, 5,
      p.x + p.w/2, p.y + p.h/2, lightRadius
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.05)');
    grad.addColorStop(1, this.scene.fogColor || 'rgba(5,5,15,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.scene.w, this.scene.h);
  },

  renderHUD(ctx) {
    const p = this.player;
    const barW = 100;
    const barH = 5;
    const x = 8, y = 8;

    // HP
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = p.hp > 50 ? '#4a8' : (p.hp > 25 ? '#a84' : '#a44');
    ctx.fillRect(x, y, barW * (p.hp / p.maxHp), barH);
    ctx.fillStyle = '#888';
    ctx.font = '7px monospace';
    ctx.fillText('NYAWA', x + 2, y + barH + 10);

    // Sanity
    const sy = y + 16;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, sy, barW, barH);
    ctx.fillStyle = p.sanity > 50 ? '#69c' : (p.sanity > 25 ? '#a84' : '#a44');
    ctx.fillRect(x, sy, barW * (p.sanity / p.maxSanity), barH);
    ctx.fillStyle = '#888';
    ctx.font = '7px monospace';
    ctx.fillText('KEWARASAN', x + 2, sy + barH + 10);

    // Battery
    if (p.flashLight || p.battery < 100) {
      const by = sy + 16;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x, by, barW, barH);
      ctx.fillStyle = p.battery > 30 ? '#a84' : '#a44';
      ctx.fillRect(x, by, barW * (p.battery / 100), barH);
      ctx.fillStyle = '#888';
      ctx.font = '7px monospace';
      ctx.fillText('BATERAI', x + 2, by + barH + 10);
    }

    // Items
    ctx.fillStyle = '#666';
    ctx.font = '8px monospace';
    ctx.fillText(`ITEM ${p.inventory.length}/${p.maxInventory}`, x, 58);

    // Lighter indicator
    if (p.hasLighter) {
      ctx.fillStyle = '#a84';
      ctx.font = '7px monospace';
      ctx.fillText('API', x, 68);
    }
  },

  /* === MAIN LOOP === */
  loop(time) {
    this.dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.tick++;

    if (this.state === 'playing') {
      this.updatePlayer(this.dt);
      this.update(this.dt);
    }

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }
};

/* Utility */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(x1,y1,x2,y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); }
