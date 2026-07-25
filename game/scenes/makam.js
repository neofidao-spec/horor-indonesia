/* === SCENE 2: MAKAM === */
/* Pekuburan desa 50x37 tiles. 40 nisan. Genderuwo AI (patrol/chase/retreat/roar).
   Cari 3 clue nisan → buka gua → ketemu Mbah → ritual quest. */

SceneLoader.register('makam', {
  name: 'makam',
  w: 1600, h: 1184,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(5,5,15,0.92)',
  playerStart: { x: 780, y: 1100 },

  /* Map: 0=ground, 1=wall (pagar/pohon/batu)
     Layout: border walls, entrance selatan, jalan utama vertikal,
     dua jalan horizontal (row 11 & 21), makam di 6 sektor,
     gua di pojok timur-laut (col 39-47, row 2-9). */
  mapGrid: (() => {
    const R = 37, C = 50;
    const g = [];
    for (let r = 0; r < R; r++) {
      g[r] = [];
      for (let c = 0; c < C; c++) g[r][c] = 0;
    }
    // Border pagar
    for (let c = 0; c < C; c++) g[0][c] = g[R-1][c] = 1;
    for (let r = 0; r < R; r++) g[r][0] = g[r][C-1] = 1;

    // Pintu masuk selatan (4 tile lebar)
    for (let c = 23; c <= 26; c++) g[R-1][c] = 0;

    // Jalan utama vertikal (col 23-26)
    for (let r = 2; r < R-1; r++)
      for (let c = 23; c <= 26; c++)
        g[r][c] = 0;

    // Jalan horizontal row 11 & 21
    for (let c = 2; c < C-1; c++) g[11][c] = g[21][c] = 0;

    // Pagar/pembatas antar sektor makam
    for (let r = 2; r <= 10; r++) g[r][22] = g[r][27] = 1;
    for (let r = 12; r <= 20; r++) g[r][22] = g[r][27] = 1;
    for (let r = 22; r <= 34; r++) g[r][22] = g[r][27] = 1;

    // Pohon-pohon di tepi timur & barat (solid decorative)
    for (let r = 2; r <= 10; r++) { g[r][1]=g[r][2]=g[r][C-2]=g[r][C-3]=1; }
    for (let r = 12; r <= 20; r++) { g[r][1]=g[r][2]=g[r][C-2]=g[r][C-3]=1; }
    for (let r = 22; r <= 34; r++) { g[r][1]=g[r][2]=g[r][C-2]=g[r][C-3]=1; }

    // Gua di pojok timur-laut (col 39-47, row 2-9) — fully walled initially
    for (let r = 2; r <= 9; r++)
      for (let c = 39; c <= 47; c++)
        g[r][c] = 1;
    // Interior gua (kecuali entrance tile)
    for (let r = 3; r <= 8; r++)
      for (let c = 40; c <= 46; c++)
        g[r][c] = 0;
    // Entrance gua (col 39, row 5) — mulai tertutup, dibuka setelah 3 clue
    g[5][39] = 1;

    // Beberapa makam batu besar (decorative solids) di area makam
    const batuSpots = [[3,40],[3,41],[3,42],[3,43],[9,40],[9,41],[9,42],[9,43]];
    for (const [r,c] of batuSpots) g[r][c] = 1;

    return g;
  })(),

  /* === STATE === */
  graves: [],
  clueCount: 0,
  clueGravesFound: [false, false, false],
  mbahGraveRevealed: false,
  caveOpen: false,
  inCave: false,
  mbahMet: false,
  ritualQuest: false,
  genderuwo: null,
  genderuwoActive: true,
  exitToSawah: false,
  ambientSource: null,
  timer: 0,

  /* === INIT === */
  init() {
    this.graves = [];
    this.clueCount = 0;
    this.clueGravesFound = [false, false, false];
    this.mbahGraveRevealed = false;
    this.caveOpen = false;
    this.inCave = false;
    this.mbahMet = false;
    this.ritualQuest = false;
    this.genderuwoActive = true;
    this.exitToSawah = false;
    this.timer = 0;

    // Generate 40 nisan di posisi tetap (37 normal + 3 clue)
    const gravePositions = [
      // Sektor kiri-atas (row 3-10, col 3-21) — 8 nisan
      [120,120],[220,120],[320,120],[420,120],
      [140,200],[240,200],[340,200],[440,200],
      // Sektor kiri-tengah (row 12-20, col 3-21) — 8 nisan
      [120,400],[220,400],[320,400],[420,400],
      [140,480],[240,480],[340,480],[440,480],
      // Sektor kiri-bawah (row 22-34, col 3-21) — 6 nisan
      [120,750],[240,750],[340,750],
      [140,830],[240,830],[340,830],
      // Sektor kanan-atas (row 3-10, col 28-38) — 6 nisan
      [920,120],[1020,120],[1120,120],
      [940,200],[1040,200],[1140,200],
      // Sektor kanan-tengah (row 12-20, col 28-38) — 6 nisan
      [920,400],[1020,400],[1120,400],
      [940,480],[1040,480],[1140,480],
      // Sektor kanan-bawah (row 22-34, col 28-38) — 6 nisan
      [920,750],[1020,750],[1120,750],
      [940,830],[1040,830],[1140,830],
    ];
    // 40 nisan total (37 normal + 3 clue)
    const allPos = gravePositions; // 40 posisi

    // Indeks nisan clue (3 clue spesifik)
    const clueIndices = [7, 15, 28]; // tersebar di sektor berbeda
    let clueIdx = 0;

    for (let i = 0; i < allPos.length; i++) {
      const [px, py] = allPos[i];
      const isClue = clueIndices.includes(i);
      const grave = {
        id: `nisan-${i}`,
        name: `Nisan #${i+1}`,
        x: px, y: py,
        w: 32, h: 20,
        examined: false,
        isClue: isClue,
        clueIndex: isClue ? clueIdx++ : -1,
        text: '',
      };

      if (isClue) {
        const ci = grave.clueIndex;
        grave.name = [
          'Nisan Sukardi',
          'Nisan Parminah',
          'Nisan Harjo'
        ][ci];
        grave.text = [
          'MAKAM SUKARDI (1945-1998)\nGuru ngaji yang dihormati. Di batu nisannya terukir:\n"Mbah Karsono bersemayam di tempat yang dijaga batu-batu besar. Carilah di timur laut, di mana pagar bertemu langit."\n\nTahun di nisan: 1998.',
          'MAKAM PARMINAH (1950-2007)\nPenjaga makam selama 20 tahun. Di batu nisannya:\n"Makam Mbah tidak seperti yang lain — ia dikelilingi dinding batu. Hanya yang berani dan tahu jalan bisa masuk."\n\nTahun di nisan: 2007.',
          'MAKAM HARJO (1932-2015)\nKepala desa paling lama. Di batu nisannya:\n"Aku menjaga rahasia desa. Tiga petunjuk akan membuka jalan menuju Mbah. Cari di mana batu-batu besar berjajar."\n\nTahun di nisan: 2015.'
        ][ci];
      } else {
        const texts = [
          'Nisan tua. Tulisan hampir tidak terbaca.',
          'Makam warga desa. Ditumbuhi lumut.',
          'Tanah di sini gembur. Ada bekas galian?',
          'Batu nisan retak. Tertulis: "Beristirahat dalam damai."',
          'Sepertinya baru diziarahi — ada sisa kemenyan.',
          'Nisan miring. Mungkin karena gempa.',
          'Ada ukiran bunga melati di batu.',
          'Tertulis: "Semoga arwahnya diterima."',
          'Di bawah nisan ini... tanahnya bergerak-gerak? Atau hanya perasaanmu?',
          'Sehelai rambut panjang tersangkut di nisan. Bukan rambutmu.',
        ];
        grave.text = texts[Math.floor(Math.random() * texts.length)];
      }

      this.graves.push(grave);
    }

    // Genderuwo AI
    this.genderuwo = {
      x: 500, y: 500, w: 32, h: 48,
      speed: 55,
      spriteTimer: 0,
      animFrame: 0,
      patrolPoints: [
        {x: 400, y: 160},   // kiri-atas
        {x: 1100, y: 160},  // kanan-atas (dekat gua)
        {x: 1100, y: 480},  // kanan-tengah
        {x: 400, y: 480},   // kiri-tengah
        {x: 400, y: 800},   // kiri-bawah
        {x: 1100, y: 800},  // kanan-bawah
      ],
      patrolIndex: 0,
      state: 'patrol',
      chaseTimer: 0,
      roarTimer: 0,
      retreatTimer: 0,
      visible: false,
    };

    // Ambient outdoor
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('outdoor');
    }

    // Intro dialog
    setTimeout(() => {
      Engine.showDialog('', [
        'Pekuburan desa di malam hari.',
        'Puluhan nisan berjajar rapi di bawah rembulan yang malu-malu.',
        'Di antara kabut dan bayangan, sesuatu bergerak.',
        'Kau harus menemukan makam Mbah Karsono.',
        'Cari petunjuk dari nisan-nisan di sekelilingmu...',
        'Tapi hati-hati. Genderuwo menjaga tempat ini.',
      ]);
    }, 500);

    Engine.showSubtitle('Cari 3 nisan petunjuk untuk menemukan makam Mbah...', 5000);
  },

  /* === UNLOAD === */
  unload() {
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch(e) {}
    }
  },

  /* === COLLISION === */
  isSolid(tx, ty) {
    const col = Math.floor(tx / this.tileW);
    const row = Math.floor(ty / this.tileH);
    if (row < 0 || row >= this.mapGrid.length || col < 0 || col >= this.mapGrid[0].length) return true;
    // Jika di dalam gua dan mbahMet, gua entrance jadi solid ke arah luar
    if (this.inCave && row === 5 && col === 39) return false; // always open from inside
    return this.mapGrid[row][col] === 1;
  },

  /* === INTERACT === */
  interact(px, py) {
    const cx = px + Engine.player.w / 2;
    const cy = py + Engine.player.h / 2;

    // Jika di dalam gua — interaksi dengan Mbah atau keluar
    if (this.inCave) {
      if (dist(cx, cy, 1344, 180) < 60) {
        this.meetMbah();
        return;
      }
      // Keluar gua (dekat entrance)
      if (cx > 1230 && cx < 1290 && cy > 155 && cy < 210) {
        this.exitCave();
        return;
      }
      Engine.showSubtitle('Gua kecil. Udara dingin dan lembab.', 1000);
      return;
    }

    // Exit to sawah (di pintu masuk makam)
    if (this.exitToSawah && cy > 1120 && cx > 700 && cx < 900) {
      SceneLoader.load('sawah');
      return;
    }

    // Cek interaksi dengan nisan
    for (const grave of this.graves) {
      if (dist(cx, cy, grave.x + 16, grave.y + 10) < 42) {
        if (grave.isClue && !grave.examined) {
          this.handleClueGrave(grave);
          return;
        }
        if (!grave.examined) {
          grave.examined = true;
          Engine.showDialog('', [grave.text]);
          return;
        } else {
          // Cek apakah setelah semua clue, nisan biasa menunjukkan arah
          if (this.mbahGraveRevealed && !this.caveOpen) {
            Engine.showDialog('', ['Tiga petunjuk sudah terkumpul. Makam Mbah ada di dalam gua di timur laut pekuburan.']);
            return;
          }
          Engine.showSubtitle('Sudah diperiksa.', 1000);
          return;
        }
      }
    }

    // Cek entrance gua (setelah terbuka)
    if (this.caveOpen) {
      // Entrance gua di pixel ~ col 39*32=1248, row 5*32=160
      if (dist(cx, cy, 1260, 180) < 50) {
        this.enterCave();
        return;
      }
    }

    // Interaksi dengan exit ritual (di pintu masuk bawah)
    if (this.ritualQuest && cy > 1130 && cx > 750 && cx < 850) {
      Engine.showSubtitle('Pergi ke sawah untuk ritual? (tekan E)', 2000);
      return;
    }

    // Interaksi dengan pintu masuk makam (sebelum quest)
    if (cy > 1130 && cx > 750 && cx < 850) {
      if (this.ritualQuest) {
        this.exitToSawah = true;
        Engine.showDialog('', ['Kembali ke desa... menuju sawah untuk ritual terakhir.']);
        return;
      }
      Engine.showSubtitle('Pintu masuk pekuburan. Belum waktunya kembali.', 1000);
      return;
    }

    Engine.showSubtitle('Tidak ada apa-apa di sini.', 1000);
  },

  handleClueGrave(grave) {
    grave.examined = true;
    this.clueGravesFound[grave.clueIndex] = true;
    this.clueCount++;

    Engine.showDialog('', [grave.text], () => {
      Engine.showSubtitle(`Petunjuk ${this.clueCount}/3 ditemukan!`, 2000);

      if (this.clueCount >= 3) {
        this.mbahGraveRevealed = true;
        setTimeout(() => {
          Engine.showDialog('', [
            'Tiga petunjuk telah terkumpul.',
            '"1998, 2007, 2015..."',
            'Ketiga tahun itu — semuanya angka genap. Mungkin makam Mbah ada di tempat yang genap juga.',
            'Tapi yang lebih jelas: ketiganya menunjuk ke timur laut.',
            'Di mana batu-batu besar berjajar, di mana pagar bertemu langit.',
            'Di sana... gua tempat Mbah bersemayam.',
          ], () => {
            // Buka entrance gua
            this.openCave();
          });
        }, 300);
      }
    });
  },

  openCave() {
    this.caveOpen = true;
    // Buka tile entrance gua (col 39, row 5)
    this.mapGrid[5][39] = 0;
    Engine.playTone(200, 0.5, 'sine', 0.15);
    Engine.showSubtitle('Pintu gua terbuka! Di timur laut pekuburan.', 4000);
  },

  enterCave() {
    this.inCave = true;
    // Pindahkan player ke dalam gua
    Engine.player.x = 1310;
    Engine.player.y = 220;
    Engine.showSubtitle('Gua gelap... ada seseorang di sudut.', 3000);
  },

  exitCave() {
    this.inCave = false;
    Engine.player.x = 1260;
    Engine.player.y = 200;
    Engine.showSubtitle('Kembali ke pekuburan.', 1000);
  },

  meetMbah() {
    if (this.mbahMet && this.ritualQuest) {
      Engine.showDialog('Mbah Karsono', [
        '"Kau masih di sini? Cepatlah ke sawah. Waktu terus berjalan."',
        '"Bakar kitab itu di tengah sawah. Itu satu-satunya cara menghentikan Kuntilanak."',
      ]);
      return;
    }

    this.mbahMet = true;

    Engine.showDialog('Mbah Karsono', [
      '(Seorang tua duduk di sudut gua, memegang tongkat. Wajahnya pucat, matanya kosong.)',
      '"Kau... berhasil menemukanku. Aku sudah menunggumu."',
      '"Maaf kau harus melihat keadaanku begini. Aku tidak bisa keluar dari sini."',
      '"Kuntilanak itu... dia terus menghantui desa setiap Jumat Kliwon."',
      '"Aku coba mengusirnya, tapi dia terlalu kuat. Dia mengutukku — aku tidak bisa mati, tidak bisa hidup."',
      '"Sekarang Jumat Kliwon tinggal beberapa jam lagi. Kau harus menghentikannya."',
      '"Di tengah sawah, tempat pertama kali dia dibunuh... bakar kitab kuno itu."',
      '"Itu satu-satunya cara. Tapi kau butuh api."',
    ], () => {
      // Mbah kasih korek api
      if (!Engine.hasItem('korek') && !Engine.player.hasLighter) {
        Engine.addItem({ id: 'korek', name: 'Korek Api', icon: '🔥' });
        Engine.player.hasLighter = true;
        Engine.showSubtitle('Mbah memberikan korek api!', 2000);
      }

      setTimeout(() => {
        Engine.showDialog('Mbah Karsono', [
          '"Pergilah... cepat. Jangan lihat ke belakang."',
          '"Bakar kitab di sawah. Itu satu-satunya cara."',
          '"Semoga kau berhasil, anak muda. Aku percaya padamu."',
        ], () => {
          this.ritualQuest = true;
          this.exitToSawah = true;
          Engine.showSubtitle('Quest ritual: Bakar kitab di sawah!', 4000);
        });
      }, 1000);
    });
  },

  /* === UPDATE === */
  update(dt) {
    this.timer += dt;
    const p = Engine.player;
    const g = this.genderuwo;
    if (!g || !this.genderuwoActive) return;

    // Genderuwo tidak aktif di dalam gua
    if (this.inCave) return;

    const distToPlayer = dist(g.x + 16, g.y + 24, p.x + 8, p.y + 12);

    // Visibility: only within 300px
    g.visible = distToPlayer < 300;

    // Sprite animation
    g.spriteTimer += dt;
    if (g.spriteTimer > 0.3) {
      g.spriteTimer = 0;
      g.animFrame = (g.animFrame + 1) % 4;
    }

    switch (g.state) {
      case 'patrol':
        this.updatePatrol(g, dt, distToPlayer, p);
        break;
      case 'chase':
        this.updateChase(g, dt, distToPlayer, p);
        break;
      case 'retreat':
        this.updateRetreat(g, dt, distToPlayer, p);
        break;
      case 'roar':
        this.updateRoar(g, dt, distToPlayer, p);
        break;
    }

    // Roar timer — random tiap 8-12 detik kalau player dekat
    g.roarTimer += dt;
    if (g.state === 'patrol' && distToPlayer < 350 && g.roarTimer > 8 + Math.random() * 4) {
      g.roarTimer = 0;
      g.state = 'roar';
      Engine.playTone(60, 1.5, 'sawtooth', 0.3);
      if (distToPlayer < 250) {
        Engine.showSubtitle('GRRROOOOAAAAARRR!!!', 1500);
        Engine.player.sanity = Math.max(0, Engine.player.sanity - 3);
      }
    }

    // Deteksi player: jarak < 200 atau flashlight ON → chase
    if (g.state === 'patrol' && (distToPlayer < 200 || (p.flashLight && distToPlayer < 350))) {
      g.state = 'chase';
      g.chaseTimer = 6;
      Engine.playTone(80, 0.8, 'sawtooth', 0.25);
      Engine.showSubtitle('Genderuwo melihatmu! Lari!', 2000);
    }

    // Flashlight scare: senter di wajah → retreat
    if (g.state === 'chase' && p.flashLight && distToPlayer < 150) {
      // Player must face genderuwo roughly (check direction)
      const dx = (g.x + 16) - (p.x + 8);
      const dy = (g.y + 12) - (p.y + 12);
      let facing = false;
      if (Math.abs(dx) > Math.abs(dy)) {
        facing = (dx > 0 && p.dir === 'right') || (dx < 0 && p.dir === 'left');
      } else {
        facing = (dy > 0 && p.dir === 'down') || (dy < 0 && p.dir === 'up');
      }
      if (facing || Math.random() < 0.3) {
        g.state = 'retreat';
        g.retreatTimer = 4;
        Engine.playTone(800, 0.3, 'square', 0.15);
        Engine.showSubtitle('Senter! Genderuwo mundur!', 1500);
      }
    }

    // Contact damage
    if (distToPlayer < 30 && (g.state === 'chase' || g.state === 'roar')) {
      Engine.player.hp -= 20;
      Engine.playJumpscare();
      Engine.showSubtitle('Genderuwo mencengkerammu! -20 HP', 2000);
      g.state = 'retreat';
      g.retreatTimer = 2;
      if (Engine.player.hp <= 0) {
        Engine.gameOver('Genderuwo mencabik-cabik tubuhmu...');
      }
    }

    // Heart beat when chased nearby
    if (g.state === 'chase' && distToPlayer < 120) {
      if (Engine.tick % 30 === 0) {
        Engine.playTone(40, 0.1, 'sine', 0.12);
      }
    }
  },

  updatePatrol(g, dt, distToPlayer, p) {
    const target = g.patrolPoints[g.patrolIndex];
    const dx = target.x - g.x;
    const dy = target.y - g.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < 20) {
      g.patrolIndex = (g.patrolIndex + 1) % g.patrolPoints.length;
    } else {
      g.x += (dx / d) * g.speed * dt;
      g.y += (dy / d) * g.speed * dt;
    }
  },

  updateChase(g, dt, distToPlayer, p) {
    g.chaseTimer -= dt;
    const dx = p.x + 8 - g.x;
    const dy = p.y + 12 - g.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0) {
      g.x += (dx / d) * g.speed * 1.6 * dt;
      g.y += (dy / d) * g.speed * 1.6 * dt;
    }
    // Roar while chasing
    if (Engine.tick % 120 === 0) {
      Engine.playTone(60 + Math.random() * 40, 0.5, 'sawtooth', 0.2);
    }
    // Lose interest
    if (g.chaseTimer <= 0 || distToPlayer > 500) {
      g.state = 'patrol';
      Engine.showSubtitle('Genderuwo kehilangan jejakmu...', 1500);
    }
  },

  updateRetreat(g, dt, distToPlayer, p) {
    g.retreatTimer -= dt;
    const dx = g.x - (p.x + 8);
    const dy = g.y - (p.y + 12);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0 && d < 350) {
      g.x += (dx / d) * g.speed * 1.2 * dt;
      g.y += (dy / d) * g.speed * 1.2 * dt;
    }
    // Flicker visibility
    if (Engine.tick % 30 === 0) {
      g.visible = (g.retreatTimer > 2) ? Math.random() > 0.5 : true;
    }
    // Reset after timer
    if (g.retreatTimer <= 0) {
      g.state = 'patrol';
      g.roarTimer = 0;
      g.visible = true;
      Engine.showSubtitle('Genderuwo kembali berpatroli...', 1500);
    }
  },

  updateRoar(g, dt, distToPlayer, p) {
    // Roar lasts about 1.5s then back to patrol or chase
    if (this.timer % 1.5 < 0.05) {
      g.state = distToPlayer < 250 ? 'chase' : 'patrol';
    }
  },

  /* === SAVE/LOAD === */
  getState() {
    return {
      clueCount: this.clueCount,
      clueGravesFound: [...this.clueGravesFound],
      mbahGraveRevealed: this.mbahGraveRevealed,
      caveOpen: this.caveOpen,
      inCave: this.inCave,
      mbahMet: this.mbahMet,
      ritualQuest: this.ritualQuest,
      exitToSawah: this.exitToSawah,
      genderuwoActive: this.genderuwoActive,
      genderuwo: this.genderuwo ? {
        x: this.genderuwo.x, y: this.genderuwo.y,
        state: this.genderuwo.state, patrolIndex: this.genderuwo.patrolIndex,
      } : null,
      graves: this.graves.map(g => ({ id: g.id, examined: g.examined })),
    };
  },

  setState(state) {
    if (state.clueCount !== undefined) this.clueCount = state.clueCount;
    if (state.clueGravesFound) this.clueGravesFound = [...state.clueGravesFound];
    if (state.mbahGraveRevealed !== undefined) this.mbahGraveRevealed = state.mbahGraveRevealed;
    if (state.caveOpen !== undefined) {
      this.caveOpen = state.caveOpen;
      if (this.caveOpen) this.mapGrid[5][39] = 0;
    }
    if (state.inCave !== undefined) this.inCave = state.inCave;
    if (state.mbahMet !== undefined) this.mbahMet = state.mbahMet;
    if (state.ritualQuest !== undefined) this.ritualQuest = state.ritualQuest;
    if (state.exitToSawah !== undefined) this.exitToSawah = state.exitToSawah;
    if (state.genderuwoActive !== undefined) this.genderuwoActive = state.genderuwoActive;
    if (state.genderuwo && this.genderuwo) {
      this.genderuwo.x = state.genderuwo.x;
      this.genderuwo.y = state.genderuwo.y;
      this.genderuwo.state = state.genderuwo.state;
      this.genderuwo.patrolIndex = state.genderuwo.patrolIndex || 0;
    }
    if (state.graves) {
      for (const saved of state.graves) {
        const grave = this.graves.find(g => g.id === saved.id);
        if (grave) grave.examined = saved.examined;
      }
    }
  },

  /* === RENDER === */
  render(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    if (this.inCave) {
      this.renderCave(ctx);
      return;
    }

    // === SURFACE: PEKUBURAN ===
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * tileW, y = row * tileH;

        if (tile === 1) {
          if (row <= 1 || row >= 35 || col <= 1 || col >= 48) {
            // Pagar/border luar
            if ((row + col) % 3 === 0) {
              // Tiang pagar
              ctx.fillStyle = '#3a3a2a';
              ctx.fillRect(x, y, tileW, tileH);
              ctx.fillStyle = '#4a4a3a';
              ctx.fillRect(x + 2, y + 2, tileW - 4, 4);
            } else {
              ctx.fillStyle = '#1a2a0a';
              ctx.fillRect(x, y, tileW, tileH);
              // Cabang pohon
              ctx.strokeStyle = '#2a1a0a';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 4, y + tileH);
              ctx.lineTo(x + 8, y + 4);
              ctx.stroke();
            }
          } else if (col >= 39 && row >= 2 && row <= 9) {
            // Dinding gua
            ctx.fillStyle = '#2a2218';
            ctx.fillRect(x, y, tileW, tileH);
            ctx.strokeStyle = '#1a1208';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, tileW, tileH);
          } else if (col === 22 || col === 27) {
            // Pagar pembatas sektor
            ctx.fillStyle = '#2a2a1a';
            ctx.fillRect(x, y, tileW, tileH);
            // Tiang pagar besi
            ctx.fillStyle = '#444';
            ctx.fillRect(x + 4, y + 2, 3, tileH - 4);
            ctx.fillRect(x + tileW - 7, y + 2, 3, tileH - 4);
            ctx.fillRect(x + 2, y + 8, tileW - 4, 2);
            ctx.fillRect(x + 2, y + tileH - 10, tileW - 4, 2);
          } else {
            // Semak/batu
            ctx.fillStyle = '#1a2a0a';
            ctx.fillRect(x, y, tileW, tileH);
            ctx.fillStyle = '#2a3a1a';
            ctx.beginPath();
            ctx.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Ground — rumput dan tanah
          const noise = ((row * 5 + col * 13) % 7) * 2;
          if (col >= 23 && col <= 26) {
            // Jalan setapak
            ctx.fillStyle = `rgb(${42+noise},${38+noise},${30+noise})`;
            ctx.fillRect(x, y, tileW, tileH);
          } else if (row === 11 || row === 21) {
            // Jalan horizontal
            ctx.fillStyle = `rgb(${40+noise},${36+noise},${28+noise})`;
            ctx.fillRect(x, y, tileW, tileH);
          } else {
            // Rumput
            ctx.fillStyle = `rgb(${25+noise},${28+noise},${18+noise})`;
            ctx.fillRect(x, y, tileW, tileH);
            // Rumput-rumput kecil
            if ((row + col) % 5 === 0) {
              ctx.strokeStyle = `rgba(40,50,20,${0.15 + Math.sin(this.timer * 2 + row + col) * 0.05})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(x + 6, y + tileH - 2);
              ctx.lineTo(x + 8, y + 4);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x + 12, y + tileH - 4);
              ctx.lineTo(x + 14, y + 6);
              ctx.stroke();
            }
          }
        }
      }
    }

    // === GENDERUWO ===
    if (this.genderuwo && this.genderuwo.visible && this.genderuwoActive) {
      Asset.drawSprite('genderuwo', ctx,
        Math.round(this.genderuwo.x),
        Math.round(this.genderuwo.y),
        this.genderuwo.state, this.genderuwo.animFrame
      );
      // Red glow when chasing
      if (this.genderuwo.state === 'chase') {
        ctx.save();
        ctx.fillStyle = `rgba(255,0,0,${0.05 + Math.sin(this.timer * 8) * 0.03})`;
        ctx.fillRect(this.genderuwo.x - 4, this.genderuwo.y - 4,
          this.genderuwo.w + 8, this.genderuwo.h + 8);
        ctx.restore();
      }
    }

    // === NISAN ===
    for (const grave of this.graves) {
      this.drawGrave(ctx, grave);
    }

    // === CAVE ENTRANCE (setelah terbuka) ===
    if (this.caveOpen) {
      const ex = 1240, ey = 168;
      ctx.save();
      // Mulut gua — hitam pekat
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(ex - 4, ey - 4, 48, 40);
      // Efek masuk
      ctx.fillStyle = `rgba(10,10,10,${0.5 + Math.sin(this.timer * 2) * 0.2})`;
      ctx.fillRect(ex, ey, 40, 32);
      ctx.restore();
      // Label
      ctx.fillStyle = '#555';
      ctx.font = '7px monospace';
      ctx.fillText('MULUT GUA', ex, ey - 6);
    }

    // === EXIT MARKER ===
    if (this.exitToSawah) {
      const pulse = Math.sin(this.timer * 3) * 0.3 + 0.5;
      ctx.save();
      ctx.fillStyle = `rgba(139, 58, 58, ${pulse * 0.2})`;
      ctx.fillRect(760, 1120, 48, 24);
      ctx.fillStyle = '#8b3a3a';
      ctx.font = '8px monospace';
      ctx.fillText('> SAWAH', 764, 1136);
      ctx.restore();
    }
  },

  drawGrave(ctx, grave) {
    const x = grave.x, y = grave.y;

    // Ground base (tanah gundukan)
    ctx.fillStyle = '#2a2218';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 18, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Batu nisan
    let color, detailColor;
    if (grave.isClue && !grave.examined) {
      // Clue grave — sedikit berbeda
      color = '#4a3a2a';
      detailColor = '#5a4a3a';
    } else {
      color = '#3a3a2a';
      detailColor = '#4a4a3a';
    }

    if (grave.examined && !grave.isClue) {
      // Sudah diperiksa — lebih kusam
      color = '#2a2a1a';
      detailColor = '#3a3a2a';
    }

    ctx.fillStyle = color;
    ctx.fillRect(x + 4, y - 4, grave.w - 8, grave.h - 8);
    // Atap nisan
    ctx.fillStyle = detailColor;
    ctx.fillRect(x + 2, y - 8, grave.w - 4, 6);
    ctx.fillRect(x + 6, y - 10, grave.w - 12, 4);

    // Salib/ornamen
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + grave.w / 2, y - 14);
    ctx.lineTo(x + grave.w / 2, y + 2);
    ctx.moveTo(x + grave.w / 2 - 5, y - 8);
    ctx.lineTo(x + grave.w / 2 + 5, y - 8);
    ctx.stroke();

    // Jika clue grave — efek samar
    if (grave.isClue && !grave.examined) {
      ctx.save();
      ctx.fillStyle = `rgba(200, 180, 100, ${0.05 + Math.sin(this.timer * 3 + grave.clueIndex) * 0.03})`;
      ctx.fillRect(x - 2, y - 12, grave.w + 4, grave.h + 6);
      ctx.restore();
    }

    // Tulisan kalau sudah diperiksa atau clue
    if (grave.examined) {
      ctx.fillStyle = '#666';
      ctx.font = '5px monospace';
      ctx.fillText('✝', x + 12, y - 2);
    }
  },

  renderCave(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    // === CAVE INTERIOR (rendering hanya bagian gua) ===
    // Latar belakang hitam
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(1200, 0, 400, 400);

    // Dinding gua
    for (let row = 2; row <= 9; row++) {
      for (let col = 39; col <= 47; col++) {
        if (this.mapGrid[row][col] === 1) {
          const x = col * tileW, y = row * tileH;
          ctx.fillStyle = '#2a2218';
          ctx.fillRect(x, y, tileW, tileH);
          // Tekstur dinding
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(x + 4, y + 4, 3, 3);
          ctx.fillRect(x + 20, y + 10, 5, 3);
          ctx.fillRect(x + 10, y + 24, 4, 5);
        } else {
          // Lantai gua
          const x = col * tileW, y = row * tileH;
          const noise = ((row * 3 + col * 7) % 5) * 2;
          ctx.fillStyle = `rgb(${18+noise},${16+noise},${14+noise})`;
          ctx.fillRect(x, y, tileW, tileH);
        }
      }
    }

    // Peti mati / makam Mbah di dalam gua
    const mx = 1340, my = 176;
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(mx - 16, my - 10, 32, 24);
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(mx - 14, my - 8, 28, 4);
    ctx.fillRect(mx - 14, my + 8, 28, 4);
    // Salib di makam
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx, my - 18);
    ctx.lineTo(mx, my + 2);
    ctx.moveTo(mx - 6, my - 10);
    ctx.lineTo(mx + 6, my - 10);
    ctx.stroke();
    // Glow effect
    ctx.fillStyle = `rgba(139, 58, 58, ${0.08 + Math.sin(this.timer * 2) * 0.04})`;
    ctx.fillRect(mx - 20, my - 20, 40, 40);

    // === MBAH SPRITE ===
    if (!this.mbahMet || this.ritualQuest) {
      Asset.drawSprite('mbah', ctx, 1324, 196, 'sitting');
      // Mbath tongkat
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(1342, 224, 2, 20);
    }

    // Cahaya lilin di gua
    const flicker = Math.sin(this.timer * 5) * 3;
    ctx.save();
    ctx.fillStyle = `rgba(255, 180, 50, ${0.03 + flicker * 0.002})`;
    ctx.beginPath();
    ctx.arc(mx + 24, my + 14, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#a84';
    ctx.fillRect(mx + 22, my + 12, 4, 6);
    ctx.fillStyle = '#fa4';
    ctx.fillRect(mx + 23, my + 10, 2, 3);

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '7px monospace';
    ctx.fillText('MBAH KARSONO', mx - 20, my + 24);
    ctx.fillText('[E] untuk bicara', mx - 20, my + 32);

    // Exit cave
    ctx.fillStyle = '#555';
    ctx.font = '7px monospace';
    ctx.fillText('< KELUAR', 1240, 180);
    const glow = Math.sin(this.timer * 2) * 0.2 + 0.3;
    ctx.fillStyle = `rgba(100,100,200,${glow * 0.15})`;
    ctx.fillRect(1240, 164, 40, 32);
  },
});
