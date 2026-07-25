/* === SCENE 3: SAWAH === */
/* Final chapter — sawah mistis di malam Jumat Kliwon. Kuntilanak boss fight. */

SceneLoader.register('sawah', {
  name: 'sawah',
  w: 1800, h: 1400,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(10,5,20,0.93)',
  playerStart: { x: 100, y: 1200 },

  mapGrid: (() => {
    const rows = 44, cols = 56;
    const g = [];
    for (let r = 0; r < rows; r++) {
      g[r] = [];
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows-1 || c === 0 || c === cols-1) {
          g[r][c] = 1;
        } else if (r > 5 && r < 20 && c > 5 && c < 20) {
          g[r][c] = r % 2 === 0 ? 0 : 1;
        } else {
          g[r][c] = 0;
        }
      }
    }
    return g;
  })(),

  kuntilanak: null,
  phase: 0, // 0=hidden, 1=appear, 2=chase, 3=final
  ritualSpot: null,
  ritualStarted: false,
  ritualProgress: 0,
  ritualComplete: false,
  bambooStakes: [],
  stakesPlaced: 0,
  totalStakes: 5,
  kunActive: false,
  kunScreamTimer: 0,
  endingTriggered: false,
  ambientSource: null,

  init() {
    this.phase = 0;
    this.ritualStarted = false;
    this.ritualProgress = 0;
    this.ritualComplete = false;
    this.stakesPlaced = 0;
    this.kunActive = false;
    this.kunScreamTimer = 0;
    this.endingTriggered = false;

    // Ritual spot
    this.ritualSpot = { x: 900, y: 700, w: 64, h: 64 };

    // Bamboo stake pickup spots
    this.bambooStakes = [
      { x: 200, y: 200, picked: false, id: 'stake1' },
      { x: 1400, y: 200, picked: false, id: 'stake2' },
      { x: 200, y: 1100, picked: false, id: 'stake3' },
      { x: 1500, y: 1000, picked: false, id: 'stake4' },
      { x: 800, y: 200, picked: false, id: 'stake5' },
    ];

    // Kuntilanak
    this.kuntilanak = {
      x: 900, y: 400, w: 32, h: 64,
      visible: false,
      state: 'hidden', // hidden | appear | circling | chase | attack
      appearTimer: 0,
      circleAngle: 0,
      attackCooldown: 0,
      hp: 100,
      maxHp: 100,
      screamTimer: 0,
    };

    // Sawah ambient
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('outdoor');
    }

    setTimeout(() => {
      Engine.showDialog('', [
        'Sawah luas di malam Jumat Kliwon.',
        'Kabut tebal menutupi permukaan air. Batu nisan Mbah mengatakan — di sinilah Kuntilanak pertama kali dibunuh.',
        'Kamulah yang harus mengakhiri ini.',
        'Cari 5 pancang bambu, tempatkan di titik ritual, dan baca kitabnya.',
        'Tapi dia tidak akan diam saja...'
      ]);
    }, 500);

    Engine.showSubtitle('Kumpulkan 5 pancang bambu untuk ritual', 4000);
  },

  unload() {
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch(e) {}
    }
  },

  isSolid(tx, ty) {
    const col = Math.floor(tx / this.tileW);
    const row = Math.floor(ty / this.tileH);
    if (row < 0 || row >= this.mapGrid.length || col < 0 || col >= this.mapGrid[0].length) return true;
    return this.mapGrid[row][col] === 1;
  },

  interact(px, py) {
    const cx = px + Engine.player.w/2;
    const cy = py + Engine.player.h/2;

    // Bamboo stakes pickup
    for (const stake of this.bambooStakes) {
      if (!stake.picked && dist(cx, cy, stake.x, stake.y) < 50) {
        stake.picked = true;
        this.stakesPlaced++;
        Engine.showSubtitle(`Pancang bambu ${this.stakesPlaced}/${this.totalStakes} terkumpul`, 1500);
        if (this.stakesPlaced >= this.totalStakes) {
          Engine.showSubtitle('Semua pancang terkumpul! Pergi ke titik ritual!', 3000);
          // Make ritual spot visible
        }
        return;
      }
    }

    // Ritual spot
    if (this.stakesPlaced >= this.totalStakes && 
        dist(cx, cy, this.ritualSpot.x + 32, this.ritualSpot.y + 32) < 60) {
      this.startRitual();
      return;
    }

    Engine.showSubtitle('...', 800);

    // Haunting whispers
    if (this.phase >= 1 && Math.random() < 0.3) {
      Engine.playTone(300 + Math.random() * 200, 0.2, 'sine', 0.05);
    }
  },

  startRitual() {
    if (this.ritualStarted) return;
    this.ritualStarted = true;

    Engine.showDialog('', [
      'Kamu menancapkan 5 pancang bambu di titik ritual — membentuk segi lima.',
      'Kitab kuno dibuka. Kamu mulai membaca mantra...',
      'Angin berhenti. Kabut membeku.',
      'Dan kemudian — TERTAWA.',
      'Tawa perempuan — keras, melengking, dari segala arah.',
      'Kuntilanak muncul.'
    ], () => {
      this.phase = 1;
      this.kunActive = true;
      this.kuntilanak.state = 'appear';
      this.kuntilanak.visible = true;
      Engine.playJumpscare();
      Engine.player.sanity = Math.max(0, Engine.player.sanity - 20);
    });
  },

  update(dt) {
    const p = Engine.player;
    const kun = this.kuntilanak;
    if (!kun || !this.kunActive) return;

    const distToPlayer = dist(kun.x, kun.y, p.x, p.y);

    // Kuntilanak AI
    switch(kun.state) {
      case 'appear':
        kun.appearTimer += dt;
        // Floating down from above
        kun.y += Math.sin(kun.appearTimer * 5) * 20 * dt;
        if (kun.appearTimer > 3) {
          kun.state = 'circling';
          // First scream
          Engine.playTone(800, 1.5, 'sawtooth', 0.2);
          Engine.showSubtitle('KUUUUUNTILANAAAAK!!!', 2000);
        }
        break;

      case 'circling':
        // Circle around player
        kun.circleAngle += dt * 1.2;
        const radius = 120 + Math.sin(kun.circleAngle * 0.5) * 40;
        kun.x = p.x + Math.cos(kun.circleAngle) * radius;
        kun.y = p.y + Math.sin(kun.circleAngle) * radius - 30;
        kun.visible = true;

        // Occasional scream
        kun.screamTimer += dt;
        if (kun.screamTimer > 4 + Math.random() * 3) {
          kun.screamTimer = 0;
          Engine.playTone(700 + Math.random() * 400, 0.5, 'sawtooth', 0.15);
          Engine.player.sanity = Math.max(0, Engine.player.sanity - 3);
          Engine.showSubtitle('(Tawa perempuan dari kegelapan...)', 2000);
        }

        // Attack if player tries to read kitab
        if (Engine.tick % 300 === 0 && distToPlayer < 150) {
          kun.state = 'attack';
        }
        break;

      case 'attack':
        // Dive toward player
        const targetX = p.x + 16;
        const targetY = p.y + 16;
        const dx = targetX - kun.x;
        const dy = targetY - kun.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d > 0) {
          kun.x += (dx/d) * 200 * dt;
          kun.y += (dy/d) * 200 * dt;
        }

        // Damage on contact
        if (d < 30) {
          Engine.player.hp -= 15;
          kun.state = 'circling';
          Engine.playJumpscare();
          Engine.showSubtitle('Kuntilanak menyayatmu!', 2000);
          if (Engine.player.hp <= 0) {
            Engine.gameOver('Kuntilanak merenggut jiwamu...');
          }
        }

        // Miss — reset
        if (d > 300 || kun.attackCooldown > 3) {
          kun.state = 'circling';
          kun.attackCooldown = 0;
        }
        kun.attackCooldown += dt;
        break;
    }

    // Ritual progress during battle
    if (this.ritualStarted && !this.ritualComplete && Engine.hasItem('kitab')) {
      if (distToPlayer < 100 && Engine.keys['r']) {
        this.ritualProgress += dt * 5;
        if (Engine.tick % 30 === 0) {
          Engine.playTone(200 + this.ritualProgress * 2, 0.1, 'sine', 0.05);
        }
        if (this.ritualProgress >= 100) {
          this.completeRitual();
        }
      }
    }

    // Low sanity — hallucinations
    if (p.sanity < 25 && Engine.tick % 60 === 0) {
      Engine.playTone(1000, 0.05, 'sine', 0.05);
    }
  },

  completeRitual() {
    this.ritualComplete = true;
    this.phase = 3;
    this.endingTriggered = true;

    Engine.showDialog('', [
      'Lima pancang bambu menyala dengan cahaya biru!',
      'Kuntilanak menjerit — kesakitan, marah.',
      '"Kau pikir kau bisa mengusirku?! AKU AKAN TERUS HIDUP!"',
      'Dengan sisa kekuatan, dia melesat ke arahmu —',
      'TAPI kitabmu bercahaya. Cahaya putih membakar kegelapan.',
      '"Tidaaaaaaak...!"',
      'Jeritannya memudar. Kabut menghilang. Sawah kembali sunyi.',
      'Mbah Karsono — rohnya tersenyum. "Terima kasih. Aku bisa tenang sekarang."',
      'Jumat Kliwon telah usai.',
      '— TAMAT —'
    ]);

    // Show ending
    setTimeout(() => {
      Engine.showDialog('', [
        'Kamu selamat.',
        'Tapi di luar sawah, di desa-desa lain... Jumat Kliwon masih akan datang lagi.',
        'Untuk sekarang — cukup.',
        'Untuk pertempuranmu malam ini — cukup.',
        '',
        'Terima kasih telah bermain.'
      ]);
    }, 3000);

    this.kuntilanak.visible = false;
    this.kunActive = false;
  },

  getState() {
    return {
      phase: this.phase,
      ritualStarted: this.ritualStarted,
      ritualProgress: this.ritualProgress,
      ritualComplete: this.ritualComplete,
      stakesPlaced: this.stakesPlaced,
      kunActive: this.kunActive,
      bambooStakes: this.bambooStakes.map(s => ({ id: s.id, picked: s.picked })),
      kuntilanak: this.kuntilanak ? { x: this.kuntilanak.x, y: this.kuntilanak.y, state: this.kuntilanak.state, hp: this.kuntilanak.hp } : null,
    };
  },

  setState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.ritualStarted !== undefined) this.ritualStarted = state.ritualStarted;
    if (state.ritualProgress !== undefined) this.ritualProgress = state.ritualProgress;
    if (state.ritualComplete !== undefined) this.ritualComplete = state.ritualComplete;
    if (state.stakesPlaced !== undefined) this.stakesPlaced = state.stakesPlaced;
    if (state.kunActive !== undefined) this.kunActive = state.kunActive;
    if (state.bambooStakes) {
      for (const saved of state.bambooStakes) {
        const stake = this.bambooStakes.find(s => s.id === saved.id);
        if (stake) stake.picked = saved.picked;
      }
    }
    if (state.kuntilanak && this.kuntilanak) {
      this.kuntilanak.x = state.kuntilanak.x;
      this.kuntilanak.y = state.kuntilanak.y;
      this.kuntilanak.state = state.kuntilanak.state;
      this.kuntilanak.hp = state.kuntilanak.hp;
    }
  },

  render(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    // Sawah ground — water/rice paddies
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * tileW, y = row * tileH;
        if (tile === 1) {
          ctx.fillStyle = '#1a1a0a';
          ctx.fillRect(x, y, tileW, tileH);
        } else {
          // Water reflection
          const wave = Math.sin(Engine.tick * 0.02 + row + col) * 2;
          const shade = 12 + wave + ((row * 2 + col * 5) % 4);
          ctx.fillStyle = `rgb(${shade},${shade+3},${shade+10})`;
          ctx.fillRect(x, y, tileW, tileH);
          // Rice stalks
          if ((row + col) % 4 === 0) {
            ctx.strokeStyle = `rgba(40,50,20,${0.2 + wave * 0.05})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + tileH - 4);
            ctx.lineTo(x + 8, y + 4);
            ctx.stroke();
          }
        }
      }
    }

    // Bamboo stakes (pickups)
    for (const stake of this.bambooStakes) {
      if (stake.picked) continue;
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(stake.x - 2, stake.y - 12, 4, 24);
      ctx.fillStyle = '#6a5a3a';
      ctx.fillRect(stake.x - 3, stake.y - 4, 6, 8);
      // Glow
      ctx.fillStyle = `rgba(139, 58, 58, ${0.1 + Math.sin(Engine.tick * 0.1) * 0.05})`;
      ctx.fillRect(stake.x - 6, stake.y - 6, 12, 12);
    }

    // Ritual spot
    if (this.stakesPlaced >= this.totalStakes && !this.ritualComplete) {
      const pulse = Math.sin(Engine.tick * 0.08) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(100, 50, 150, ${pulse * 0.2})`;
      ctx.fillRect(this.ritualSpot.x - 4, this.ritualSpot.y - 4, 
                   this.ritualSpot.w + 8, this.ritualSpot.h + 8);
      ctx.strokeStyle = `rgba(139, 58, 58, ${pulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(this.ritualSpot.x, this.ritualSpot.y, 
                     this.ritualSpot.w, this.ritualSpot.h);
      ctx.fillStyle = '#666';
      ctx.font = '8px monospace';
      ctx.fillText('RITUAL', this.ritualSpot.x + 10, this.ritualSpot.y - 4);
    }

    // Placed stakes circle
    if (this.ritualStarted && !this.ritualComplete) {
      for (let i = 0; i < this.totalStakes; i++) {
        const angle = (i / this.totalStakes) * Math.PI * 2;
        const sx = this.ritualSpot.x + 32 + Math.cos(angle) * 50;
        const sy = this.ritualSpot.y + 32 + Math.sin(angle) * 50;
        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(sx - 2, sy - 10, 4, 20);
        ctx.fillStyle = `rgba(100, 80, 200, ${0.3 + Math.sin(Engine.tick * 0.1 + i) * 0.1})`;
        ctx.fillRect(sx - 3, sy - 3, 6, 6);
      }
    }

    // Kuntilanak
    if (this.kuntilanak && this.kuntilanak.visible) {
      const kun = this.kuntilanak;
      ctx.save();

      // Ghostly glow
      ctx.shadowColor = '#800';
      ctx.shadowBlur = 30;

      // White dress
      ctx.fillStyle = 'rgba(220, 220, 240, 0.8)';
      ctx.fillRect(kun.x + 4, kun.y + 24, kun.w - 8, kun.h - 24);
      
      // Upper body
      ctx.fillStyle = 'rgba(180, 200, 220, 0.7)';
      ctx.fillRect(kun.x + 6, kun.y + 12, kun.w - 12, 20);

      // Head
      ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
      ctx.fillRect(kun.x + 8, kun.y, kun.w - 16, 16);

      // Long hair covering face
      ctx.fillStyle = 'rgba(10, 5, 10, 0.9)';
      ctx.fillRect(kun.x + 6, kun.y - 2, kun.w - 12, 14);
      // Hair strands
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(kun.x + 4 + i * 5, kun.y + 12, 3, 20 + Math.sin(i + Engine.tick * 0.1) * 5);
      }

      // Red eyes (visible through hair)
      if (kun.state === 'attack' || kun.state === 'circling') {
        ctx.fillStyle = '#f22';
        ctx.fillRect(kun.x + 10, kun.y + 6, 4, 3);
        ctx.fillRect(kun.x + 18, kun.y + 6, 4, 3);
      }

      // Arms
      ctx.fillStyle = 'rgba(200, 200, 220, 0.5)';
      if (kun.state === 'attack') {
        // Reaching out
        ctx.fillRect(kun.x - 10, kun.y + 16, 16, 6);
        ctx.fillRect(kun.x + kun.w - 6, kun.y + 16, 16, 6);
      } else {
        ctx.fillRect(kun.x - 4, kun.y + 16, 8, 20);
        ctx.fillRect(kun.x + kun.w - 4, kun.y + 16, 8, 20);
      }

      // Floating effect
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 0.3 + Math.sin(Engine.tick * 0.05) * 0.15;

      ctx.restore();
    }

    // Ritual progress bar
    if (this.ritualStarted && !this.ritualComplete) {
      const bx = Engine.W/2 - 60;
      const by = 40;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bx, by, 120, 8);
      ctx.fillStyle = '#69c';
      ctx.fillRect(bx, by, 120 * (this.ritualProgress / 100), 8);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(bx, by, 120, 8);
      ctx.fillStyle = '#888';
      ctx.font = '8px monospace';
      ctx.fillText('RITUAL', bx, by - 2);
      ctx.fillText(`${Math.floor(this.ritualProgress)}%`, bx + 120 - 28, by + 6);
    }

    // Exit after completion
    if (this.ritualComplete) {
      ctx.fillStyle = 'rgba(100, 200, 100, 0.2)';
      ctx.fillRect(860, 20, 40, 20);
      ctx.fillStyle = '#6a6';
      ctx.font = '8px monospace';
      ctx.fillText('> PULANG', 862, 32);
    }
  }
});