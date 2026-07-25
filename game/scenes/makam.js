/* === SCENE 2: MAKAM === */
/* Area pemakaman desa. Genderuwo berkeliaran. Mencari makam Mbah. */

SceneLoader.register('makam', {
  name: 'makam',
  w: 1600, h: 1200,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(5,5,15,0.92)',
  playerStart: { x: 100, y: 1100 },

  mapGrid: (() => {
    const rows = 37, cols = 50;
    const g = [];
    for (let r = 0; r < rows; r++) {
      g[r] = [];
      for (let c = 0; c < cols; c++) {
        if (r === 0 || r === rows-1 || c === 0 || c === cols-1) {
          g[r][c] = 1; // border wall (pohon/pagar)
        } else if (r > 2 && r < 12 && c > 4 && c < 13) {
          g[r][c] = 1; // makam area 1 (pagar makam)
        } else {
          g[r][c] = 0; // ground
        }
      }
    }
    // Path
    for (let r = 15; r < 32; r++) {
      for (let c = 20; c < 30; c++) {
        g[r][c] = 0;
      }
    }
    return g;
  })(),

  graveObjects: [],
  genderuwo: null,
  genderuwoActive: false,
  mbahGraveFound: false,
  mbahGraveIndex: -1,
  ambientSource: null,
  graveyardKeys: 0,
  ritualDone: false,

  init() {
    // Generate graves
    this.graveObjects = [];
    for (let i = 0; i < 40; i++) {
      this.graveObjects.push({
        id: `makam-${i}`,
        name: `Makam ${i+1}`,
        x: 100 + Math.random() * 1300,
        y: 100 + Math.random() * 800,
        w: 32, h: 20,
        isMbah: i >= 38,
        examined: false,
        text: i >= 38 ? 
          'Makam Mbah! Tertulis: "Mbah Karsono — 1950-2024. Telah berpulang." Tapi tanahnya... masih baru. Sangat baru.' :
          'Makam tua. Batu nisan hampir tidak terbaca. Ada yang aneh — tanah di sekitar makam ini gembur.',
      });
    }
    this.mbahGraveFound = false;
    this.genderuwoActive = true;
    this.ritualDone = false;
    this.graveyardKeys = 0;

    // Genderuwo — large enemy NPC
    this.genderuwo = {
      x: 800, y: 400, w: 48, h: 72,
      speed: 30,
      patrolPoints: [
        {x: 600, y: 300}, {x: 1000, y: 300},
        {x: 1000, y: 600}, {x: 600, y: 600}
      ],
      patrolIndex: 0,
      state: 'patrol', // patrol | chase | retreat
      chaseTarget: null,
      chaseTimer: 0,
      visible: false,
      roarTimer: 0,
    };

    // Forest ambient
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('outdoor');
    }

    setTimeout(() => {
      Engine.showDialog('', [
        'Di luar, angin malam membawa bisikan.',
        'Makam-makam tua berjejer rapih. Tapi mana makam Mbah?',
        'Di antara nisan, kabut bergerak — seolah ada yang berjalan.',
        'Awas... Genderuwo dikabarkan menjaga tempat ini.'
      ]);
    }, 500);

    Engine.showSubtitle('Cari makam Mbah di antara puluhan nisan...', 5000);
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

    for (const grave of this.graveObjects) {
      if (dist(cx, cy, grave.x + 16, grave.y + 10) < 40) {
        if (grave.isMbah) {
          this.handleMbahGrave();
          return;
        }
        if (!grave.examined) {
          grave.examined = true;
          Engine.showDialog('', [grave.text]);
          // Chance to find key fragment
          if (Math.random() < 0.2 && this.graveyardKeys < 3) {
            this.graveyardKeys++;
            Engine.showSubtitle(`Petunjuk ${this.graveyardKeys}/3 ditemukan...`, 2000);
            if (this.graveyardKeys >= 3) {
              this.mbahGraveFound = true;
              // Unhide Mbah's grave
              const mbah = this.graveObjects.find(g => g.isMbah);
              if (mbah) {
                mbah.x = 700; mbah.y = 600;
                Engine.showSubtitle('Makam Mbah terbuka! Pergi ke pusat makam.', 3000);
              }
            }
          }
        } else {
          Engine.showSubtitle('Tidak ada yang baru.', 1000);
        }
        return;
      }
    }
    Engine.showSubtitle('Tidak ada apa-apa di sini.', 1000);
  },

  handleMbahGrave() {
    if (this.ritualDone) {
      SceneLoader.load('sawah');
      return;
    }

    Engine.showDialog('Mbah Karsono', [
      '(Suara dari dalam tanah...)',
      '"Kau... datang juga. Aku sudah menunggumu."',
      '"Aku tidak mati — aku dikutuk. Kuntilanak itu... dia mengambil wujudku."',
      '"Sekarang dia ada di desa. Di sawah tempat pertama kali dia dibunuh."',
      '"Bakar kitab ini di sana. Itu satu-satunya cara menghentikannya."',
      '"Tapi hati-hati... Genderuwo akan mengejarmu. Jangan biarkan dia menyentuhmu."'
    ], () => {
      if (!Engine.hasItem('kitab')) {
        Engine.addItem({ id: 'kitab', name: 'Kitab Kuno', icon: '📖' });
      }
    });

    this.ritualDone = true;
  },

  update(dt) {
    const p = Engine.player;
    const g = this.genderuwo;
    if (!g || !this.genderuwoActive) return;

    // Genderuwo AI
    const distToPlayer = dist(g.x, g.y, p.x, p.y);

    // Visibility — only near or when player has light
    g.visible = distToPlayer < 400;

    switch(g.state) {
      case 'patrol':
        const target = g.patrolPoints[g.patrolIndex];
        const dx = target.x - g.x;
        const dy = target.y - g.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 20) {
          g.patrolIndex = (g.patrolIndex + 1) % g.patrolPoints.length;
        } else {
          g.x += (dx/d) * g.speed * dt;
          g.y += (dy/d) * g.speed * dt;
        }
        // Roar occasionally
        g.roarTimer += dt;
        if (g.roarTimer > 8 && distToPlayer < 500) {
          g.roarTimer = 0;
          if (p.flashLight) {
            // Genderuwo notices light
            g.state = 'chase';
            g.chaseTimer = 5;
            Engine.playTone(60, 2, 'sawtooth', 0.3);
            Engine.showSubtitle('GRRRAAAAAA!!! Genderuwo melihatmu!', 2000);
          }
        }
        break;

      case 'chase':
        g.chaseTimer -= dt;
        const distX = p.x - g.x;
        const distY = p.y - g.y;
        const totalDist = Math.sqrt(distX*distX + distY*distY);
        if (totalDist > 0) {
          g.x += (distX/totalDist) * g.speed * 1.5 * dt;
          g.y += (distY/totalDist) * g.speed * 1.5 * dt;
        }
        // Roar while chasing
        if (Engine.tick % 180 === 0) {
          Engine.playTone(60 + Math.random() * 40, 1, 'sawtooth', 0.2);
        }
        // Player got caught
        if (totalDist < 35) {
          Engine.player.hp -= 30;
          Engine.playJumpscare();
          Engine.showSubtitle('Genderuwo mencengkerammu!', 2000);
          g.state = 'retreat';
          g.chaseTimer = 3;
          if (Engine.player.hp <= 0) {
            Engine.gameOver('Genderuwo mencabik-cabikmu...');
          }
        }
        // Lose interest
        if (g.chaseTimer <= 0 || totalDist > 600) {
          g.state = 'patrol';
          Engine.showSubtitle('Genderuwo kembali berpatroli...', 1500);
        }
        break;

      case 'retreat':
        g.chaseTimer -= dt;
        // Move away from player
        const awayX = g.x - p.x;
        const awayY = g.y - p.y;
        const awayDist = Math.sqrt(awayX*awayX + awayY*awayY);
        if (awayDist > 0 && awayDist < 300) {
          g.x += (awayX/awayDist) * g.speed * 0.5 * dt;
          g.y += (awayY/awayDist) * g.speed * 0.5 * dt;
        }
        // Hide in darkness
        if (Engine.tick % 120 === 0) {
          g.visible = false;
        }
        if (g.chaseTimer <= 0 || awayDist > 400) {
          g.state = 'patrol';
          g.roarTimer = 0;
        }
        break;
    }

    // Near player heart beat
    if (distToPlayer < 100 && g.state === 'chase') {
      if (Engine.tick % 30 === 0) {
        Engine.playTone(40, 0.1, 'sine', 0.15);
      }
    }

    // Check for minigame: use senter to scare genderuwo
    if (g.state === 'chase' && p.flashLight && distToPlayer < 200) {
      if (Engine.keys['f'] || (Math.random() < 0.001)) {
        // Flash genderuwo
        Engine.playTone(800, 0.2, 'square', 0.1);
        g.state = 'retreat';
        g.chaseTimer = 4;
        Engine.showSubtitle('Senter membuat Genderuwo mundur!', 1500);
      }
    }
  },

  getState() {
    return {
      graveyardKeys: this.graveyardKeys,
      mbahGraveFound: this.mbahGraveFound,
      ritualDone: this.ritualDone,
      genderuwoActive: this.genderuwoActive,
      genderuwo: this.genderuwo ? { x: this.genderuwo.x, y: this.genderuwo.y, state: this.genderuwo.state } : null,
      graves: this.graveObjects.map(g => ({ id: g.id, examined: g.examined, x: g.x, y: g.y }))
    };
  },

  setState(state) {
    if (state.graveyardKeys !== undefined) this.graveyardKeys = state.graveyardKeys;
    if (state.mbahGraveFound !== undefined) this.mbahGraveFound = state.mbahGraveFound;
    if (state.ritualDone !== undefined) this.ritualDone = state.ritualDone;
    if (state.genderuwoActive !== undefined) this.genderuwoActive = state.genderuwoActive;
    if (state.genderuwo && this.genderuwo) {
      this.genderuwo.x = state.genderuwo.x;
      this.genderuwo.y = state.genderuwo.y;
      this.genderuwo.state = state.genderuwo.state;
    }
    if (state.graves) {
      for (const saved of state.graves) {
        const grave = this.graveObjects.find(g => g.id === saved.id);
        if (grave) {
          grave.examined = saved.examined;
          grave.x = saved.x;
          grave.y = saved.y;
        }
      }
    }
  },

  render(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    // Ground
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * tileW, y = row * tileH;
        if (tile === 1) {
          ctx.fillStyle = '#1a1a0a';
          ctx.fillRect(x, y, tileW, tileH);
        } else {
          const shade = 20 + ((row * 3 + col * 7) % 6);
          ctx.fillStyle = `rgb(${shade},${shade-5},${shade-10})`;
          ctx.fillRect(x, y, tileW, tileH);
        }
      }
    }

    // Draw graves
    for (const grave of this.graveObjects) {
      if (grave.isMbah && !this.mbahGraveFound && this.graveyardKeys < 3) continue;
      
      ctx.fillStyle = grave.isMbah ? '#4a3a2a' : '#2a2a1a';
      ctx.fillRect(grave.x, grave.y, grave.w, grave.h);
      
      // Tombstone
      ctx.fillStyle = grave.isMbah ? '#5a4a3a' : '#3a3a2a';
      ctx.fillRect(grave.x + 4, grave.y - 8, grave.w - 8, 8);
      ctx.fillRect(grave.x + grave.w/2 - 2, grave.y - 14, 4, 6);

      // Cross
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(grave.x + grave.w/2, grave.y - 20);
      ctx.lineTo(grave.x + grave.w/2, grave.y + 4);
      ctx.moveTo(grave.x + grave.w/2 - 6, grave.y - 12);
      ctx.lineTo(grave.x + grave.w/2 + 6, grave.y - 12);
      ctx.stroke();

      // Mbah's grave glowing effect
      if (grave.isMbah && this.mbahGraveFound) {
        ctx.fillStyle = `rgba(139, 58, 58, ${0.1 + Math.sin(Engine.tick * 0.05) * 0.05})`;
        ctx.fillRect(grave.x - 4, grave.y - 4, grave.w + 8, grave.h + 8);
      }
    }

    // Genderuwo
    if (this.genderuwo && this.genderuwo.visible) {
      const g = this.genderuwo;
      ctx.save();
      ctx.shadowColor = '#400';
      ctx.shadowBlur = 20;

      // Body (big dark figure)
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(g.x, g.y, g.w, g.h - 10);
      
      // Head
      ctx.fillStyle = '#2a0a0a';
      ctx.fillRect(g.x + 4, g.y - 8, g.w - 8, 16);
      
      // Eyes (red glow)
      ctx.fillStyle = g.state === 'chase' ? '#f44' : '#a22';
      ctx.fillRect(g.x + 8, g.y - 2, 6, 4);
      ctx.fillRect(g.x + g.w - 14, g.y - 2, 6, 4);

      // Arms
      if (g.state === 'chase') {
        ctx.fillStyle = '#1a0a0a';
        ctx.fillRect(g.x - 12, g.y + 8, 12, 8);
        ctx.fillRect(g.x + g.w, g.y + 8, 12, 8);
      }

      ctx.restore();
    }

    // Path to exit
    if (this.ritualDone) {
      ctx.fillStyle = 'rgba(139, 58, 58, 0.15)';
      ctx.fillRect(780, 20, 40, 20);
      ctx.fillStyle = '#666';
      ctx.font = '8px monospace';
      ctx.fillText('> DESA', 782, 32);
    }
  }
});