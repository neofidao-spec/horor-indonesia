/* === ENGINE INTI — MALAM JUMAT KLIWON === */
const Engine = {
  canvas: null, ctx: null,
  W: 0, H: 0, TILE: 32,
  camera: {x:0, y:0},
  state: 'loading', // loading|title|playing|dialog|paused|gameover
  scene: null,
  tick: 0,
  keys: {},
  dt: 0, lastTime: 0,
  flashTimer: 0,
  subtitles: [],
  subtitleTimer: 0,

  /* Player */
  player: {
    x: 80, y: 80, w: 20, h: 28,
    speed: 60,
    dir: 'down',
    moving: false,
    animFrame: 0,
    animTimer: 0,
    hp: 100,
    maxHp: 100,
    sanity: 100,
    maxSanity: 100,
    inventory: [],
    maxInventory: 6,
    flashLight: false,
    keyHeld: {}
  },

  /* Dialog */
  dialog: {
    speaker: '', text: '', lines: [], index: 0,
    active: false, callback: null
  },

  /* Audio (Web Audio - procedural) */
  audioCtx: null,
  audioEnabled: true,

  /* Save */
  saveSlot: null,

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Input
    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
      this.player.keyHeld[e.key] = true;
      if (e.key === ' ' || e.key === 'Enter') this.handleAction();
      if (e.key === 'p' || e.key === 'P') this.togglePause();
      if (e.key === 'Escape') this.togglePause();
    });
    document.addEventListener('keyup', e => {
      this.keys[e.key] = false;
      this.player.keyHeld[e.key] = false;
    });

    // Touch dpad
    document.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
      const dir = btn.dataset.dir;
      const keyMap = {up:'w', down:'s', left:'a', right:'d'};
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        this.keys[keyMap[dir]] = true;
      });
      btn.addEventListener('touchend', e => {
        e.preventDefault();
        this.keys[keyMap[dir]] = false;
      });
      btn.addEventListener('touchcancel', e => {
        this.keys[keyMap[dir]] = false;
      });
    });

    // Action button
    document.getElementById('action-btn').addEventListener('click', () => this.handleAction());
    document.getElementById('action-btn').addEventListener('touchstart', e => {
      e.preventDefault();
      this.handleAction();
    });

    // Dialog click
    document.getElementById('dialog-box').addEventListener('click', () => this.advanceDialog());
    document.getElementById('dialog-box').addEventListener('touchstart', e => {
      e.preventDefault();
      this.advanceDialog();
    });

    // Audio context init on first interaction
    document.addEventListener('click', () => this.initAudio(), {once: true});
    document.addEventListener('touchstart', () => this.initAudio(), {once: true});

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
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    // Ambient noise via brown noise approximation
    const bufferSize = this.audioCtx.sampleRate * 2;
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
    gain.gain.value = 0.15;
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'indoor' ? 300 : 800;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);
    source.start();
    return source;
  },

  playJumpscare() {
    this.playTone(80, 0.3, 'sawtooth', 0.5);
    this.playTone(60, 0.5, 'square', 0.3);
    this.flashScreen(100);
  },

  flashScreen(duration=100) {
    const el = document.getElementById('flash-overlay');
    el.style.display = 'block';
    this.flashTimer = duration;
  },

  /* === DIALOG === */
  showDialog(speaker, lines, callback) {
    this.state = 'dialog';
    this.dialog.speaker = speaker;
    this.dialog.lines = lines;
    this.dialog.index = 0;
    this.dialog.callback = callback || null;
    this.dialog.active = true;
    const box = document.getElementById('dialog-box');
    box.style.display = 'block';
    document.getElementById('dialog-speaker').textContent = speaker ? `[${speaker}]` : '';
    document.getElementById('dialog-text').textContent = lines[0];
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
    document.getElementById('dialog-text').textContent = 
      this.dialog.lines[this.dialog.index];
  },

  closeDialog() {
    this.dialog.active = false;
    const box = document.getElementById('dialog-box');
    box.style.display = 'none';
    this.state = 'playing';
    if (this.dialog.callback) {
      this.dialog.callback();
      this.dialog.callback = null;
    }
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
    if (idx !== -1) {
      this.player.inventory.splice(idx, 1);
      this.updateInventoryUI();
      return true;
    }
    return false;
  },

  updateInventoryUI() {
    const bar = document.getElementById('inventory-bar');
    if (this.player.inventory.length === 0) {
      bar.style.display = 'none';
      return;
    }
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

  /* === SAVE/LOAD === */
  saveGame() {
    const data = {
      player: {
        x: this.player.x, y: this.player.y,
        hp: this.player.hp, sanity: this.player.sanity,
        inventory: this.player.inventory,
        flashLight: this.player.flashLight
      },
      sceneState: this.scene ? this.scene.getState() : {},
      sceneName: this.scene ? this.scene.name : '',
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('horor_save', JSON.stringify(data));
      this.showSubtitle('Game disimpan!', 1500);
    } catch(e) {
      this.showSubtitle('Gagal menyimpan!', 1500);
    }
  },

  loadGame() {
    try {
      const raw = localStorage.getItem('horor_save');
      if (!raw) { this.showSubtitle('Tidak ada save data.', 1500); return false; }
      const data = JSON.parse(raw);
      Object.assign(this.player, data.player);
      if (data.sceneName && SceneLoader.scenes[data.sceneName]) {
        SceneLoader.load(data.sceneName);
        if (this.scene && this.scene.setState) this.scene.setState(data.sceneState);
      }
      this.updateInventoryUI();
      this.showSubtitle('Game dimuat!', 1500);
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
    if (this.state === 'playing') {
      this.state = 'paused';
      document.getElementById('pause-menu').style.display = 'flex';
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
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
    let dx = 0, dy = 0;
    
    if (this.keys['w'] || this.keys['arrowup']) { dy = -1; p.dir = 'up'; }
    else if (this.keys['s'] || this.keys['arrowdown']) { dy = 1; p.dir = 'down'; }
    else if (this.keys['a'] || this.keys['arrowleft']) { dx = -1; p.dir = 'left'; }
    else if (this.keys['d'] || this.keys['arrowright']) { dx = 1; p.dir = 'right'; }

    p.moving = dx !== 0 || dy !== 0;

    if (p.moving) {
      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }
      const speed = p.speed * dt;
      let nx = p.x + dx * speed;
      let ny = p.y + dy * speed;

      // Collision with scene tiles
      if (this.scene && this.scene.isSolid) {
        const px = nx, py = p.y;
        if (!this.scene.isSolid(px + p.w/2, py + p.h/2) &&
            !this.scene.isSolid(px + p.w/2, py) &&
            !this.scene.isSolid(px, py + p.h/2)) {
          p.x = nx;
        }
        const px2 = p.x, py2 = ny;
        if (!this.scene.isSolid(px2 + p.w/2, py2 + p.h/2) &&
            !this.scene.isSolid(px2 + p.w/2, py2) &&
            !this.scene.isSolid(px2, py2 + p.h/2)) {
          p.y = ny;
        }
      } else {
        p.x = nx;
        p.y = ny;
      }

      // Animation
      p.animTimer += dt;
      if (p.animTimer > 0.15) {
        p.animTimer = 0;
        p.animFrame = (p.animFrame + 1) % 4;
      }
    }

    // Screen bounds
    p.x = Math.max(0, Math.min(this.scene ? this.scene.w - p.w : 800, p.x));
    p.y = Math.max(0, Math.min(this.scene ? this.scene.h - p.h : 600, p.y));

    // Camera follow
    this.camera.x = p.x - this.W/2 + p.w/2;
    this.camera.y = p.y - this.H/2 + p.h/2;
  },

  handleAction() {
    if (this.state === 'dialog') { this.advanceDialog(); return; }
    if (this.state !== 'playing') return;
    if (this.scene && this.scene.interact) {
      this.scene.interact(this.player.x, this.player.y);
    }
  },

  /* === RENDER === */
  render() {
    const ctx = this.ctx;
    const cam = this.camera;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this.W, this.H);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    // Scene background
    if (this.scene && this.scene.render) {
      this.scene.render(ctx);
    }

    // Player (only when playing)
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'dialog') {
      this.renderPlayer(ctx);
    }

    // Fog / darkness overlay
    if (this.scene && this.scene.fogColor) {
      this.renderFog(ctx);
    }

    ctx.restore();

    // Flash overlay
    if (this.flashTimer > 0) {
      const el = document.getElementById('flash-overlay');
      el.style.opacity = this.flashTimer > 50 ? '1' : (this.flashTimer / 50);
    }

    // HUD
    if (this.state === 'playing' || this.state === 'dialog') {
      this.renderHUD(ctx);
    }

    // Minimap
    if (this.scene && this.scene.minimap) {
      this.renderMinimap(ctx);
    }
  },

  renderPlayer(ctx) {
    const p = this.player;
    const x = Math.round(p.x);
    const y = Math.round(p.y);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + p.w/2, y + p.h - 2, p.w/2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (simple pixel character)
    const flashOn = p.flashLight;
    ctx.save();
    
    // Flashlight cone
    if (flashOn) {
      ctx.shadowColor = '#ffd';
      ctx.shadowBlur = 30;
    }

    // Head
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(x + 4, y, 12, 10);

    // Eyes (direction based)
    ctx.fillStyle = '#222';
    if (p.dir === 'right') {
      ctx.fillRect(x + 12, y + 3, 3, 3);
      ctx.fillRect(x + 12, y + 7, 3, 3);
    } else if (p.dir === 'left') {
      ctx.fillRect(x + 5, y + 3, 3, 3);
      ctx.fillRect(x + 5, y + 7, 3, 3);
    } else {
      ctx.fillRect(x + 6, y + 3, 3, 3);
      ctx.fillRect(x + 12, y + 3, 3, 3);
    }

    // Body
    ctx.fillStyle = '#2a2a3a'; // dark clothes
    ctx.fillRect(x + 3, y + 10, 14, 12);

    // Arms
    ctx.fillStyle = '#d4a574';
    if (p.moving) {
      const swing = Math.sin(p.animFrame * Math.PI / 2) * 2;
      ctx.fillRect(x - 2, y + 12 + swing, 5, 6);
      ctx.fillRect(x + 17, y + 12 - swing, 5, 6);
    } else {
      ctx.fillRect(x - 2, y + 12, 5, 6);
      ctx.fillRect(x + 17, y + 12, 5, 6);
    }

    // Legs
    ctx.fillStyle = '#1a1a2a';
    if (p.moving) {
      const legSwing = Math.sin(p.animFrame * Math.PI / 2) * 3;
      ctx.fillRect(x + 4, y + 22, 5, 7 + legSwing);
      ctx.fillRect(x + 11, y + 22, 5, 7 - legSwing);
    } else {
      ctx.fillRect(x + 4, y + 22, 5, 7);
      ctx.fillRect(x + 11, y + 22, 5, 7);
    }

    ctx.restore();
  },

  renderFog(ctx) {
    const p = this.player;
    const grad = ctx.createRadialGradient(
      p.x + p.w/2, p.y + p.h/2, 20,
      p.x + p.w/2, p.y + p.h/2, 250
    );
    const lightRadius = p.flashLight ? 280 : 150;
    const grad2 = ctx.createRadialGradient(
      p.x + p.w/2, p.y + p.h/2, 5,
      p.x + p.w/2, p.y + p.h/2, lightRadius
    );
    grad2.addColorStop(0, 'rgba(0,0,0,0)');
    grad2.addColorStop(0.6, 'rgba(0,0,0,0.1)');
    grad2.addColorStop(1, this.scene.fogColor || 'rgba(5,5,15,0.85)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, this.scene.w, this.scene.h);
  },

  renderHUD(ctx) {
    const p = this.player;
    const barW = 120;
    const barH = 6;
    const x = 10, y = 10;

    // HP bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, barW, barH);
    const hpPct = p.hp / p.maxHp;
    ctx.fillStyle = hpPct > 0.5 ? '#4a8' : (hpPct > 0.25 ? '#a84' : '#a44');
    ctx.fillRect(x, y, barW * hpPct, barH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, barW, barH);
    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.fillText('NYAWA', x, y - 2);

    // Sanity bar
    const sy = y + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, sy, barW, barH);
    const sanPct = p.sanity / p.maxSanity;
    ctx.fillStyle = sanPct > 0.5 ? '#69c' : (sanPct > 0.25 ? '#a84' : '#a44');
    ctx.fillRect(x, sy, barW * sanPct, barH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, sy, barW, barH);
    ctx.fillStyle = '#888';
    ctx.font = '8px monospace';
    ctx.fillText('KEWARASAN', x, sy - 2);

    // Item count
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`ITEM: ${p.inventory.length}/${p.maxInventory}`, x, sy + 24);
  },

  renderMinimap(ctx) {
    if (!this.scene || !this.scene.mapGrid) return;
    const s = 3; // scale
    const mx = this.W - this.scene.mapGrid[0].length * s - 10;
    const my = 10;
    const w = this.scene.mapGrid[0].length * s;
    const h = this.scene.mapGrid.length * s;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(mx - 2, my - 2, w + 4, h + 4);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(mx - 2, my - 2, w + 4, h + 4);

    for (let row = 0; row < this.scene.mapGrid.length; row++) {
      for (let col = 0; col < this.scene.mapGrid[row].length; col++) {
        const tile = this.scene.mapGrid[row][col];
        if (tile === 1) {
          ctx.fillStyle = '#444'; // wall
        } else if (tile === 2) {
          ctx.fillStyle = '#2a3'; // exit/door
        } else if (tile === 3) {
          ctx.fillStyle = '#a84'; // interactive
        } else {
          ctx.fillStyle = '#222'; // floor
        }
        ctx.fillRect(mx + col * s, my + row * s, s, s);
      }
    }

    // Player dot
    const px = mx + (this.player.x / this.scene.tileW) * s;
    const py = my + (this.player.y / this.scene.tileH) * s;
    ctx.fillStyle = '#8b3a3a';
    ctx.fillRect(px - 1, py - 1, 3, 3);
  },

  /* === MAIN LOOP === */
  loop(time) {
    this.dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.tick++;

    if (this.state === 'playing') {
      this.updatePlayer(this.dt);
      if (this.scene && this.scene.update) {
        this.scene.update(this.dt);
      }

      // Sanity slowly decreases in dark
      if (!this.player.flashLight && this.tick % 60 === 0) {
        this.player.sanity = Math.max(0, this.player.sanity - 0.5);
      }

      // Subtitle timer
      if (this.subtitleTimer > 0) {
        this.subtitleTimer -= this.dt * 1000;
        if (this.subtitleTimer <= 0) {
          document.getElementById('subtitle-overlay').style.display = 'none';
        }
      }

      // Flash timer
      if (this.flashTimer > 0) {
        this.flashTimer -= this.dt * 1000;
        if (this.flashTimer <= 0) {
          document.getElementById('flash-overlay').style.display = 'none';
        }
      }

      // Low sanity effects
      if (this.player.sanity < 30 && this.tick % 120 === 0) {
        this.playTone(200 + Math.random() * 100, 0.1, 'sine', 0.1);
      }

      // Death check
      if (this.player.hp <= 0) {
        this.gameOver('Nyawamu habis...');
      }
      if (this.player.sanity <= 0) {
        this.gameOver('Kewarasannya runtuh... kegelapan menyambut...');
      }
    }

    this.render();
    requestAnimationFrame(t => this.loop(t));
  }
};

/* Utility */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function dist(x1,y1,x2,y2) { return Math.sqrt((x2-x1)**2 + (y2-y1)**2); }
function rectCollide(a,b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}