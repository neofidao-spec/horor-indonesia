/* === SCENE 3: SAWAH === */
/* Babak final — Sawah mistis di malam Jumat Kliwon. Kuntilanak boss fight. */
/* Map 56x44 tiles, 32px per tile = 1792x1408 px */

SceneLoader.register('sawah', {
  name: 'sawah',
  w: 1792, h: 1408,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(10,5,20,0.93)',
  playerStart: { x: 100, y: 1200 },

  /* === MAP === */
  /* 0 = walkable (rice/water/path), 1 = blocked (bambu/pohon/border) */
  mapGrid: (() => {
    const rows = 44, cols = 56;
    const g = [];
    for (let r = 0; r < rows; r++) {
      g[r] = [];
      for (let c = 0; c < cols; c++) {
        // Border — hutan bambu lebat (tidak bisa dilewati)
        if (r === 0 || r === rows-1 || c === 0 || c === cols-1) {
          g[r][c] = 1;
        }
        // Rumpun bambu tersebar — obstacle alami
        else if ((r === 4 || r === 5) && (c === 4 || c === 5 || c === 6)) g[r][c] = 1;
        else if ((r === 3 || r === 4) && (c === 50 || c === 51)) g[r][c] = 1;
        else if ((r === 38 || r === 39) && (c === 4 || c === 5)) g[r][c] = 1;
        else if ((r === 38 || r === 39) && (c === 50 || c === 51)) g[r][c] = 1;
        else if (r === 10 && (c >= 18 && c <= 20)) g[r][c] = 1;
        else if (r === 8 && (c === 34 || c === 35)) g[r][c] = 1;
        else if (r === 32 && (c === 42 || c === 43)) g[r][c] = 1;
        else if ((r === 35 || r === 36) && c === 15) g[r][c] = 1;
        else if (r === 18 && c === 12) g[r][c] = 1;
        else if (r === 14 && (c === 45 || c === 46)) g[r][c] = 1;
        else if (r === 28 && c === 48) g[r][c] = 1;
        else if (r === 40 && (c === 24 || c === 25)) g[r][c] = 1;
        else if (r === 12 && c === 28) g[r][c] = 1;
        else if (r === 30 && c === 10) g[r][c] = 1;
        // Petak sawah — surface air/padi (walkable)
        else {
          g[r][c] = 0;
        }
      }
    }
    return g;
  })(),

  /* === STATE === */
  kuntilanak: null,
  phase: 0,            // 0=eksplorasi, 1=ritual dimulai, 2=battle, 3=ending
  ritualSpot: null,
  ritualStarted: false,
  ritualProgress: 0,
  ritualComplete: false,
  ritualFailed: false,
  bambooStakes: [],
  stakesPlaced: 0,
  totalStakes: 5,
  kunActive: false,
  endingTriggered: false,
  endingStage: 0,      // 0=idle, 1=kuntilanak dialog, 2=mbah dialog, 3=narator, 4=title
  ambientSource: null,
  whisperTimer: 0,
  whisperIndex: 0,

  /* === INIT === */
  init() {
    this.phase = 0;
    this.ritualStarted = false;
    this.ritualProgress = 0;
    this.ritualComplete = false;
    this.ritualFailed = false;
    this.stakesPlaced = 0;
    this.kunActive = false;
    this.endingTriggered = false;
    this.endingStage = 0;
    this.whisperTimer = 0;
    this.whisperIndex = 0;

    // Titik ritual — lingkaran di tengah sawah (tile 28,22)
    this.ritualSpot = { x: 864, y: 672, w: 64, h: 64 };

    // 5 pancang bambu tersebar di sawah
    this.bambooStakes = [
      { x:  200, y:  200, picked: false, id: 'stake1' },
      { x: 1550, y:  180, picked: false, id: 'stake2' },
      { x:  180, y: 1180, picked: false, id: 'stake3' },
      { x: 1550, y: 1180, picked: false, id: 'stake4' },
      { x:  700, y:  300, picked: false, id: 'stake5' },
    ];

    // Kuntilanak — hantu wanita (ukuran 20x40 sesuai spesifikasi)
    this.kuntilanak = {
      x: 900, y: 300, w: 20, h: 40,
      visible: false,
      state: 'hidden',   // hidden | appear | circling | attack | vanish
      appearTimer: 0,
      circleAngle: 0,
      attackCooldown: 0,
      hp: 100,
      maxHp: 100,
      screamTimer: 0,
      vanishTimer: 0,
    };

    // Ambient suara sawah
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('outdoor');
    }

    // Intro
    setTimeout(() => {
      Engine.showDialog('', [
        'Sawah luas di malam Jumat Kliwon.',
        'Kabut tebal menutupi permukaan air.',
        'Batu nisan Mbah mengatakan — di sinilah Kuntilanak pertama kali dibunuh.',
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

  /* === INTERAKSI === */
  interact(px, py) {
    const cx = px + Engine.player.w/2;
    const cy = py + Engine.player.h/2;

    // === Ambil pancang bambu ===
    for (const stake of this.bambooStakes) {
      if (!stake.picked && dist(cx, cy, stake.x, stake.y) < 50) {
        stake.picked = true;
        this.stakesPlaced++;
        Engine.addItem({
          id: `pancang-${this.stakesPlaced}`,
          name: `Pancang Bambu ${this.stakesPlaced}`,
          icon: '🎋'
        });
        Engine.showSubtitle(
          `Pancang bambu ${this.stakesPlaced}/${this.totalStakes} terkumpul`,
          1500
        );
        if (this.stakesPlaced >= this.totalStakes) {
          Engine.showSubtitle('Semua pancang terkumpul! Pergi ke titik ritual!', 3000);
        }
        return;
      }
    }

    // === Mulai ritual di titik ritual ===
    if (this.stakesPlaced >= this.totalStakes) {
      const d = dist(cx, cy, this.ritualSpot.x + 32, this.ritualSpot.y + 32);
      if (d < 60) {
        if (!Engine.hasItem('kitab')) {
          Engine.showSubtitle('Kamu butuh kitab kuno untuk ritual...', 2000);
          return;
        }
        this.startRitual();
        return;
      }
    }

    // Suasana — bisikan random
    if (this.kunActive && Math.random() < 0.2) {
      Engine.showSubtitle('(Suara air beriak...)', 1000);
    } else {
      Engine.showSubtitle('...', 800);
    }
  },

  /* === MULAI RITUAL === */
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
      // Muncul di depan player
      this.kuntilanak.x = Engine.player.x - 10;
      this.kuntilanak.y = Engine.player.y - 80;
      Engine.playJumpscare();
      Engine.player.sanity = Math.max(0, Engine.player.sanity - 20);
    });
  },

  /* === ENDING — SUKSES === */
  completeRitual() {
    if (this.endingTriggered) return;
    this.ritualComplete = true;
    this.phase = 3;
    this.endingTriggered = true;
    this.endingStage = 0;

    // Hentikan Kuntilanak
    this.kuntilanak.visible = false;
    this.kunActive = false;

    // Stage 1 — Kuntilanak mengamuk (jeda 1.5 detik lalu dialog)
    setTimeout(() => {
      this.endingStage = 1;
      Engine.showDialog('Kuntilanak', [
        '"TIDAAAAAAK! KAU TIDAK BISA MENGUSIRKU!"',
        '"AKU AKAN TERUS HIDUP! AKAN KUBURAI SELURUH DESA INI!"',
        'Dengan sisa kekuatan, Kuntilanak melesat —',
        'TAPI kitab di tanganmu meledak dalam cahaya putih.',
        '"Aku... aku... Andika... maafkan..."',
        'Suaranya berubah. Untuk sesaat — dia manusia lagi.',
        'Lalu — hilang. Sirna dalam cahaya.',
      ], () => {
        // Stage 2 — Mbah berterima kasih (langsung setelah dialog Kuntilanak)
        this.endingStage = 2;
        Engine.showDialog('Mbah Karsono (Roh)', [
          'Terima kasih, Anak Muda.',
          'Aku sudah lama terperangkap antara hidup dan mati.',
          'Kuntilanak itu — dia adalah Andika. Putriku.',
          'Dia dibunuh di sawah ini 20 tahun lalu.',
          'Arwahnya marah. Dendam kepada siapa pun yang hidup.',
          'Dan aku — aku gagal menenangkannya. Sampai sekarang.',
          'Kau berhasil memutus rantai dendamnya.',
          'Kini aku bisa menjemputnya. Kami bisa tenang.',
          'Pergilah. Jumat Kliwon sudah usai.',
        ], () => {
          // Stage 3 — Narator epilog (langsung setelah dialog Mbah)
          this.endingStage = 3;
          Engine.showDialog('Narator', [
            'Sawah kembali sunyi.',
            'Kabut mencair. Bulan purnama muncul dari balik awan.',
            'Lima pancang bambu masih berdiri — titik-titik cahaya di kegelapan.',
            'Kamu berjalan pulang. Desa masih tidur.',
            'Tidak ada yang tahu apa yang terjadi malam ini.',
            'Dan mungkin — tidak perlu tahu.',
            '',
            '— TAMAT —',
            'Terima kasih telah bermain.',
          ], () => {
            this.endingStage = 4;
            setTimeout(() => {
              goToTitle();
            }, 1500);
          });
        });
      });
    }, 1500);
  },

  /* === ENDING — GAGAL === */
  failRitual(reason) {
    if (this.endingTriggered) return;
    this.endingTriggered = true;
    this.ritualFailed = true;
    this.kunActive = false;
    this.kuntilanak.visible = false;

    Engine.gameOver(reason);
  },

  /* === UPDATE === */
  update(dt) {
    const p = Engine.player;
    const kun = this.kuntilanak;
    if (!kun) return;

    const distToPlayer = dist(kun.x, kun.y, p.x, p.y);

    // === BISIKAN ANDIKA (ambient — saat kun dalam mode hidden/vanish) ===
    if (this.kunActive && (kun.state === 'hidden' || kun.state === 'vanish')) {
      this.whisperTimer += dt;
      if (this.whisperTimer > 6 + Math.random() * 5) {
        this.whisperTimer = 0;
        const whispers = [
          'Andika...',
          'Andikaaa...',
          'Kemana kau...',
          'Aku di sini...',
          'Lihat aku...',
          'Jangan tinggalkan aku...',
          'Kembali...',
        ];
        Engine.showSubtitle(
          `(Bisikan: "${whispers[this.whisperIndex % whispers.length]}")`,
          2000
        );
        this.whisperIndex++;
        Engine.playTone(400 + Math.random() * 200, 0.3, 'sine', 0.04);
      }
    }

    // === AI KUNTILANAK ===
    if (this.kunActive) {
      switch (kun.state) {

        // HIDDEN — tidak terlihat, bersembunyi di kabut
        case 'hidden':
          kun.visible = false;
          // Selama ritual, muncul secara periodik
          if (this.ritualStarted && !this.ritualComplete) {
            kun.appearTimer += dt;
            if (kun.appearTimer > 7 + Math.random() * 5) {
              kun.appearTimer = 0;
              const angle = Math.random() * Math.PI * 2;
              kun.x = p.x + Math.cos(angle) * 130;
              kun.y = p.y + Math.sin(angle) * 130 - 20;
              kun.state = 'appear';
              kun.visible = true;
              Engine.playTone(900, 0.6, 'sawtooth', 0.12);
              Engine.showSubtitle('(Kuntilanak muncul dari kegelapan!)', 2000);
              Engine.player.sanity = Math.max(0, Engine.player.sanity - 5);
            }
          }
          break;

        // APPEAR — muncul melayang turun
        case 'appear':
          kun.appearTimer += dt;
          // Efek floating
          kun.y += Math.sin(kun.appearTimer * 8) * 1.5;

          if (kun.appearTimer > 2.5) {
            kun.state = 'circling';
            kun.appearTimer = 0;
            Engine.playTone(800, 1.2, 'sawtooth', 0.18);
            Engine.showSubtitle('KUUUUUNTILANAAAAK!!!', 2000);
            Engine.player.sanity = Math.max(0, Engine.player.sanity - 5);
          } else if (kun.appearTimer > 0.4 && Math.floor(kun.appearTimer * 3) !== Math.floor((kun.appearTimer - dt) * 3)) {
            // Denyut suara selama appear
            Engine.playTone(500 + Math.random() * 500, 0.2, 'sawtooth', 0.06);
          }
          break;

        // CIRCLING — mengorbit pemain
        case 'circling':
          kun.circleAngle += dt * (0.9 + Math.sin(Engine.tick * 0.008) * 0.3);
          const radius = 130 + Math.sin(kun.circleAngle * 0.4) * 30;
          kun.x = p.x + Math.cos(kun.circleAngle) * radius;
          kun.y = p.y + Math.sin(kun.circleAngle) * radius - 25;
          kun.visible = true;

          // Jeritan periodik — damage sanity
          kun.screamTimer += dt;
          if (kun.screamTimer > 4 + Math.random() * 4) {
            kun.screamTimer = 0;
            Engine.playTone(700 + Math.random() * 400, 0.6, 'sawtooth', 0.12);
            Engine.player.sanity = Math.max(0, Engine.player.sanity - 3);
            Engine.showSubtitle('(Tawa perempuan melengking...)', 2000);
          }

          // Bisikan "Andika" periodik
          if (Engine.tick % 400 === 0) {
            Engine.showSubtitle('(Bisikan: "Andika...")', 1500);
            Engine.playTone(300, 0.4, 'sine', 0.04);
          }

          // Serang pemain secara acak
          if (kun.attackCooldown <= 0 && distToPlayer < 160 && Math.random() < 0.004) {
            kun.state = 'attack';
            kun.attackCooldown = 3;
          }
          kun.attackCooldown = Math.max(0, kun.attackCooldown - dt);
          break;

        // ATTACK — menerkam pemain
        case 'attack':
          const targetX = p.x + 8;
          const targetY = p.y + 8;
          const dx = targetX - kun.x;
          const dy = targetY - kun.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d > 0) {
            const speed = 250;
            kun.x += (dx/d) * speed * dt;
            kun.y += (dy/d) * speed * dt;
          }

          // Damage jika kena
          if (d < 26) {
            Engine.player.hp = Math.max(0, Engine.player.hp - 15);
            kun.state = 'circling';
            kun.attackCooldown = 2;
            Engine.playJumpscare();
            Engine.showSubtitle('Kuntilanak menyayatmu!', 1500);

            // Cek game over
            if (Engine.player.hp <= 0) {
              if (this.ritualStarted && !this.ritualComplete) {
                this.failRitual('Kuntilanak merenggut nyawamu saat ritual...');
              } else {
                Engine.gameOver('Kuntilanak merenggut jiwamu...');
              }
              return;
            }
          }

          // Miss — kembali ke circling
          if (d > 250) {
            kun.state = 'circling';
            kun.attackCooldown = 1.5;
          }
          break;

        // VANISH — menghilang ke dalam kabut
        case 'vanish':
          kun.vanishTimer += dt;
          if (kun.vanishTimer > 1.5) {
            kun.state = 'hidden';
            kun.visible = false;
            kun.vanishTimer = 0;
          } else {
            // Kedip-kedip menghilang
            kun.visible = Math.floor(kun.vanishTimer * 10) % 2 === 0;
          }
          break;
      }

      // Vanishing periodik (setelah circling beberapa saat)
      if (kun.state === 'circling' && this.ritualStarted) {
        kun.appearTimer += dt;
        if (kun.appearTimer > 10 + Math.random() * 8) {
          kun.appearTimer = 0;
          kun.state = 'vanish';
          Engine.showSubtitle('(Kuntilanak menghilang ke dalam kabut...)', 2000);
        }
      }
    }

    // === PROGRES RITUAL ===
    if (this.ritualStarted && !this.ritualComplete && !this.ritualFailed) {
      const distToRitual = dist(
        p.x + p.w/2, p.y + p.h/2,
        this.ritualSpot.x + 32, this.ritualSpot.y + 32
      );

      if (distToRitual < 80) {
        // Progress otomatis saat berdiri di titik ritual
        this.ritualProgress += dt * 6;

        // Cek syarat
        if (!Engine.hasItem('kitab')) {
          Engine.showSubtitle('Kamu harus membuka kitab!', 2000);
          return;
        }

        // Efek suara progres
        if (Engine.tick % 20 === 0) {
          const freq = 200 + this.ritualProgress * 1.5;
          Engine.playTone(freq, 0.08, 'sine', 0.03);
        }

        // Sanity terus berkurang selama ritual
        if (Engine.tick % 25 === 0) {
          p.sanity = Math.max(0, p.sanity - 0.5);
        }

        // Progress selesai
        if (this.ritualProgress >= 100) {
          this.completeRitual();
          return;
        }
      }

      // Cek kegagalan ritual
      if (p.hp <= 0) {
        this.failRitual('Kuntilanak merenggut nyawamu saat ritual...');
        return;
      }
      if (p.sanity <= 0) {
        this.failRitual('Kewarasanku runtuh... mantra terhenti. Kegelapan menyambut.');
        return;
      }
    }

    // === EFEK SANITY RENDAH ===
    if (p.sanity < 25 && Engine.tick % 60 === 0) {
      Engine.playTone(1000, 0.04, 'sine', 0.04);
    }
  },

  /* === RENDER === */
  render(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    // === TILE MAP ===
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * tileW, y = row * tileH;

        if (tile === 1) {
          // Terhalang — rumpun bambu lebat / pohon
          ctx.fillStyle = '#0a0a05';
          ctx.fillRect(x, y, tileW, tileH);
          // Batang bambu
          if ((row * 3 + col * 7) % 5 < 3) {
            const bx = x + 8 + (row * 5) % 16;
            ctx.strokeStyle = 'rgba(50,60,30,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx, y + tileH - 2);
            ctx.lineTo(bx, y + 2);
            ctx.stroke();
            // Ruas bambu
            const segY = y + 6 + (row * 3) % 8;
            ctx.fillStyle = 'rgba(50,60,30,0.25)';
            ctx.fillRect(bx - 1, segY, 4, 2);
          }
        } else {
          // Cek apakah ini area ritual (central clearing)
          const isRitualArea = col >= 24 && col <= 32 && row >= 19 && row <= 25;
          // Cek apakah ini jalur setapak (mud path grid)
          const isPath = (row % 8 === 2 || row % 8 === 3) ||
                         (col % 8 === 2 || col % 8 === 3);

          if (isRitualArea) {
            // Tanah ritual — lebih gelap, ada tanda
            const pulse = Math.sin(Engine.tick * 0.03 + row + col) * 0.3;
            const shade = 20 + pulse;
            ctx.fillStyle = `rgb(${shade+3},${shade-2},${shade+8})`;
            ctx.fillRect(x, y, tileW, tileH);
            // Tanda lingkaran samar
            if (this.ritualStarted && !this.ritualComplete) {
              ctx.strokeStyle = `rgba(180, 100, 200, ${0.08 + Math.sin(Engine.tick * 0.05 + col * 0.3) * 0.04})`;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(x + 2, y + 2, tileW - 4, tileH - 4);
            }
          } else if (isPath) {
            // Jalur setapak — tanah/lumpur
            ctx.fillStyle = '#2a2218';
            ctx.fillRect(x, y, tileW, tileH);
            // Tekstur tanah
            ctx.fillStyle = `rgba(50,40,30,${0.04 + Math.sin(row + col) * 0.03})`;
            ctx.fillRect(x + 3, y + 8, tileW - 6, 2);
            ctx.fillRect(x + 4, y + 20, tileW - 8, 2);
          } else {
            // Sawah — air/padi
            const wave = Math.sin(Engine.tick * 0.018 + row * 0.5 + col * 0.3) * 2;
            const shade = 12 + wave + ((row * 2 + col * 5) % 4);
            ctx.fillStyle = `rgb(${shade},${shade+3},${shade+10})`;
            ctx.fillRect(x, y, tileW, tileH);

            // Batang padi (setiap 4 tile)
            if ((row + col) % 4 === 0) {
              ctx.strokeStyle = `rgba(40,50,20,${0.12 + wave * 0.04})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 8, y + tileH - 4);
              ctx.lineTo(x + 8, y + 4);
              ctx.stroke();
              // Daun padi
              ctx.fillStyle = `rgba(40,60,20,${0.08 + wave * 0.03})`;
              ctx.fillRect(x + 4, y + 12, 6, 2);
              ctx.fillRect(x + 20, y + 8, 6, 2);
            }

            // Riak air
            if ((row + col) % 3 === 0) {
              ctx.fillStyle = `rgba(80,120,180,${0.015 + wave * 0.01})`;
              ctx.fillRect(x + 6, y + 10 + ((row * 7) % 12), 8, 2);
            }
          }
        }
      }
    }

    // === PANCANG BAMBU (pickup items) ===
    for (const stake of this.bambooStakes) {
      if (stake.picked) continue;

      // Batang bambu
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(stake.x - 2, stake.y - 12, 4, 24);
      ctx.fillStyle = '#6a5a3a';
      ctx.fillRect(stake.x - 3, stake.y - 4, 6, 8);

      // Aura/glow merah
      const glow = 0.1 + Math.sin(Engine.tick * 0.1 + stake.x * 0.01) * 0.05;
      ctx.fillStyle = `rgba(139, 58, 58, ${glow})`;
      ctx.fillRect(stake.x - 8, stake.y - 8, 16, 16);

      // Hint [E] jika dekat
      const cx = Engine.player.x + Engine.player.w/2;
      const cy = Engine.player.y + Engine.player.h/2;
      if (dist(cx, cy, stake.x, stake.y) < 60) {
        ctx.fillStyle = '#888';
        ctx.font = '7px monospace';
        ctx.fillText('[E]', stake.x - 8, stake.y - 18);
      }
    }

    // === TITIK RITUAL ===
    if (this.stakesPlaced >= this.totalStakes &&
        !this.ritualComplete && !this.ritualFailed) {
      const pulse = Math.sin(Engine.tick * 0.08) * 0.3 + 0.5;

      // Lingkaran luar — aura
      ctx.fillStyle = `rgba(100, 50, 150, ${pulse * 0.12})`;
      ctx.fillRect(this.ritualSpot.x - 8, this.ritualSpot.y - 8,
                   this.ritualSpot.w + 16, this.ritualSpot.h + 16);

      // Lingkaran ritual
      ctx.strokeStyle = `rgba(139, 58, 58, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.ritualSpot.x + 32, this.ritualSpot.y + 32, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Lingkaran dalam
      ctx.strokeStyle = `rgba(180, 100, 200, ${pulse * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.ritualSpot.x + 32, this.ritualSpot.y + 32, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#666';
      ctx.font = '8px monospace';
      ctx.fillText('RITUAL', this.ritualSpot.x + 8, this.ritualSpot.y - 12);

      // Hint dekat player
      const cx2 = Engine.player.x + Engine.player.w/2;
      const cy2 = Engine.player.y + Engine.player.h/2;
      if (dist(cx2, cy2, this.ritualSpot.x + 32, this.ritualSpot.y + 32) < 80) {
        ctx.fillStyle = '#8b3a3a';
        ctx.font = '7px monospace';
        ctx.fillText('[E] BACA KITAB', this.ritualSpot.x + 2, this.ritualSpot.y + 50);
      }
    }

    // === PANCANG TERPASANG (lingkaran ritual aktif) ===
    if (this.ritualStarted && !this.ritualComplete && !this.ritualFailed) {
      for (let i = 0; i < this.totalStakes; i++) {
        const angle = (i / this.totalStakes) * Math.PI * 2 - Math.PI / 2;
        const sx = this.ritualSpot.x + 32 + Math.cos(angle) * 56;
        const sy = this.ritualSpot.y + 32 + Math.sin(angle) * 56;

        // Pancang
        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(sx - 2, sy - 14, 4, 28);

        // Ujung bercahaya
        const glow2 = 0.3 + Math.sin(Engine.tick * 0.1 + i * 1.5) * 0.15;
        ctx.fillStyle = `rgba(100, 80, 200, ${glow2})`;
        ctx.fillRect(sx - 4, sy - 6, 8, 8);

        // Sinar ke atas
        ctx.fillStyle = `rgba(100, 80, 200, ${glow2 * 0.08})`;
        ctx.fillRect(sx - 1, sy - 24, 2, 18);
      }

      // Garis energi antar pancang
      ctx.strokeStyle = `rgba(100, 80, 200, ${0.08 + Math.sin(Engine.tick * 0.05) * 0.04})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= this.totalStakes; i++) {
        const idx = i % this.totalStakes;
        const angle = (idx / this.totalStakes) * Math.PI * 2 - Math.PI / 2;
        const sx = this.ritualSpot.x + 32 + Math.cos(angle) * 56;
        const sy = this.ritualSpot.y + 32 + Math.sin(angle) * 56;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // === KUNTILANAK ===
    if (this.kuntilanak && this.kuntilanak.visible) {
      const kun = this.kuntilanak;
      ctx.save();

      // Aura hantu
      ctx.shadowColor = '#800';
      ctx.shadowBlur = 25;

      // Gaun putih / tubuh bawah (20x40)
      ctx.fillStyle = 'rgba(200, 210, 230, 0.75)';
      ctx.fillRect(kun.x + 2, kun.y + 20, kun.w - 4, kun.h - 20);

      // Tubuh atas
      ctx.fillStyle = 'rgba(180, 190, 210, 0.65)';
      ctx.fillRect(kun.x + 3, kun.y + 10, kun.w - 6, 14);

      // Kepala
      ctx.fillStyle = 'rgba(190, 200, 220, 0.5)';
      ctx.fillRect(kun.x + 5, kun.y, kun.w - 10, 12);

      // Rambut panjang menutupi wajah
      ctx.fillStyle = 'rgba(10, 5, 10, 0.9)';
      ctx.fillRect(kun.x + 3, kun.y - 2, kun.w - 6, 12);

      // Helai rambut
      for (let i = 0; i < 4; i++) {
        const strandLen = 16 + Math.sin(i * 1.5 + Engine.tick * 0.08) * 4;
        ctx.fillRect(kun.x + 2 + i * 5, kun.y + 10, 3, strandLen);
      }

      // Mata merah (terlihat di attack / circling)
      if (kun.state === 'attack' || (kun.state === 'circling' && Engine.tick % 60 < 30)) {
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f22';
        ctx.fillRect(kun.x + 6, kun.y + 4, 3, 2);
        ctx.fillRect(kun.x + 11, kun.y + 4, 3, 2);
        ctx.shadowBlur = 0;
      }

      // Lengan
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(190, 200, 220, 0.45)';
      if (kun.state === 'attack') {
        // Tangan menjangkau saat attack
        ctx.fillRect(kun.x - 10, kun.y + 12, 12, 4);
        ctx.fillRect(kun.x + kun.w - 2, kun.y + 12, 12, 4);
      } else {
        ctx.fillRect(kun.x - 3, kun.y + 12, 6, 16);
        ctx.fillRect(kun.x + kun.w - 3, kun.y + 12, 6, 16);
      }

      // Efek floating — transparansi bergelombang
      ctx.globalAlpha = 0.6 + Math.sin(Engine.tick * 0.04 + kun.x) * 0.2;

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // === PROGRESS BAR RITUAL ===
    if (this.ritualStarted && !this.ritualComplete && !this.ritualFailed) {
      const bx = Engine.W / 2 - 80;
      const by = 36;

      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx - 2, by - 2, 164, 14);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(bx, by, 160, 10);

      // Progress fill
      ctx.fillStyle = '#69c';
      ctx.fillRect(bx, by, 160 * (this.ritualProgress / 100), 10);

      // Pulse overlay
      const pulse2 = Math.sin(Engine.tick * 0.1) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(180, 150, 255, ${pulse2 * 0.3})`;
      ctx.fillRect(bx, by, 160 * (this.ritualProgress / 100), 10);

      // Border
      ctx.strokeStyle = '#333';
      ctx.strokeRect(bx, by, 160, 10);

      // Label
      ctx.fillStyle = '#aaa';
      ctx.font = '8px monospace';
      ctx.fillText('RITUAL', bx + 2, by - 4);
      ctx.fillStyle = '#fff';
      ctx.fillText(`${Math.floor(this.ritualProgress)}%`, bx + 140, by + 8);
    }

    // === PERINGATAN SAAT KRITIS ===
    if (this.ritualStarted && !this.ritualComplete && !this.ritualFailed) {
      const p = Engine.player;
      if (p.sanity < 30) {
        ctx.fillStyle = `rgba(139, 58, 58, ${0.08 + Math.sin(Engine.tick * 0.2) * 0.04})`;
        ctx.fillRect(0, 0, this.w, this.h);
        ctx.fillStyle = '#a44';
        ctx.font = '8px monospace';
        ctx.fillText('! KEWARASAN RENDAH !', 10, 100);
      }
      if (p.hp < 30) {
        ctx.fillStyle = '#a44';
        ctx.font = '8px monospace';
        ctx.fillText('! NYAWA RENDAH !', 10, 112);
      }
    }
  },

  /* === SAVE / LOAD === */
  getState() {
    return {
      phase: this.phase,
      ritualStarted: this.ritualStarted,
      ritualProgress: this.ritualProgress,
      ritualComplete: this.ritualComplete,
      ritualFailed: this.ritualFailed,
      stakesPlaced: this.stakesPlaced,
      kunActive: this.kunActive,
      endingTriggered: this.endingTriggered,
      endingStage: this.endingStage,
      bambooStakes: this.bambooStakes.map(s => ({ id: s.id, picked: s.picked })),
      kuntilanak: this.kuntilanak ? {
        x: this.kuntilanak.x,
        y: this.kuntilanak.y,
        state: this.kuntilanak.state,
        hp: this.kuntilanak.hp,
        circleAngle: this.kuntilanak.circleAngle,
      } : null,
    };
  },

  setState(state) {
    if (state.phase !== undefined) this.phase = state.phase;
    if (state.ritualStarted !== undefined) this.ritualStarted = state.ritualStarted;
    if (state.ritualProgress !== undefined) this.ritualProgress = state.ritualProgress;
    if (state.ritualComplete !== undefined) this.ritualComplete = state.ritualComplete;
    if (state.ritualFailed !== undefined) this.ritualFailed = state.ritualFailed;
    if (state.stakesPlaced !== undefined) this.stakesPlaced = state.stakesPlaced;
    if (state.kunActive !== undefined) this.kunActive = state.kunActive;
    if (state.endingTriggered !== undefined) this.endingTriggered = state.endingTriggered;
    if (state.endingStage !== undefined) this.endingStage = state.endingStage;
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
      this.kuntilanak.circleAngle = state.kuntilanak.circleAngle;
    }
  },
});
