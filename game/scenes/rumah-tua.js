/* === SCENE 1: RUMAH TUA === */
/* Map 40×24. Alur: intro → cari clue → loteng → kitab → peti → senter+korek → exit. */

SceneLoader.register('rumah-tua', {
  name: 'rumah-tua',
  w: 1280, h: 768,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(5,5,15,0.88)',
  playerStart: { x: 592, y: 320 },

  /* Tile: 0=floor, 1=wall, 2=wall-dark, 3=door, 4=window, 5=stairs */
  mapGrid: (() => {
    const W = 1, WD = 2, F = 0, D = 3, WIN = 4, ST = 5;
    const cols = 40, rows = 24;
    const g = [];
    for (let r = 0; r < rows; r++) {
      g[r] = [];
      for (let c = 0; c < cols; c++) {
        /* Outer boundary — thick walls */
        if (r <= 1 || r >= 21) { g[r][c] = W; continue; }
        if (c <= 4 || c >= 35) { g[r][c] = W; continue; }
        /* Front wall with door at center */
        if (r === 2) { g[r][c] = (c >= 18 && c <= 21) ? D : W; continue; }
        /* Back wall with door at center */
        if (r === 20) { g[r][c] = (c >= 18 && c <= 21) ? D : W; continue; }
        /* Windows on side walls */
        if (c === 5 && r >= 4 && r <= 6) { g[r][c] = WIN; continue; }
        if (c === 34 && r >= 4 && r <= 6) { g[r][c] = WIN; continue; }
        /* Interior dividing wall with 4-tile gap at center */
        if (r === 12 && (c < 18 || c > 21)) { g[r][c] = WD; continue; }
        /* Tangga loteng — stairs tile (col 29-30, row 9) */
        if (r === 9 && (c >= 29 && c <= 30)) { g[r][c] = ST; continue; }
        /* Floor */
        g[r][c] = F;
      }
    }
    return g;
  })(),

  /* === STATE === */
  cluesFound: 0,
  lemariOpened: false,
  kitabFound: false,
  petiOpened: false,
  senterCollected: false,
  korekCollected: false,
  jumpScareTriggered: false,
  tanggaUnlocked: false,
  fotoExamined: false,
  mejaExamined: false,
  jendelaExamined: false,
  catatanCollected: false,
  ambientSource: null,

  interactiveObjects: [
    { id: 'pintu-depan',  x: 576, y: 64,  w: 128, h: 32 },
    { id: 'jendela',      x: 160, y: 128, w: 32,  h: 32 },
    { id: 'lemari',       x: 208, y: 176, w: 48,  h: 64 },
    { id: 'foto',         x: 480, y: 96,  w: 32,  h: 48 },
    { id: 'meja',         x: 560, y: 288, w: 64,  h: 48 },
    { id: 'catatan',      x: 384, y: 400, w: 16,  h: 16 },
    { id: 'tangga',       x: 928, y: 288, w: 64,  h: 32 },
    { id: 'peti',         x: 816, y: 480, w: 48,  h: 32 },
    { id: 'pintu-belakang', x: 576, y: 640, w: 128, h: 32 },
  ],

  init() {
    this.cluesFound = 0;
    this.lemariOpened = false;
    this.kitabFound = false;
    this.petiOpened = false;
    this.senterCollected = false;
    this.korekCollected = false;
    this.jumpScareTriggered = false;
    this.tanggaUnlocked = false;
    this.fotoExamined = false;
    this.mejaExamined = false;
    this.jendelaExamined = false;
    this.catatanCollected = false;

    /* Start ambient */
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('indoor');
    }

    /* Intro dialog */
    setTimeout(() => {
      Engine.showDialog('Narator', [
        'Desa ini sepi. Terlalu sepi.',
        'Mbah pergi tiga hari lalu — tanpa pamit. Rumahnya ditinggal begitu saja.',
        'Kamu datang untuk mencari tahu. Tapi sejak melangkah masuk, pintu di belakangmu tertutup sendiri.',
        'Cari jalan keluar. Dan waspadalah... sesuatu di sini tidak sendirian.'
      ]);
    }, 500);

    Engine.showSubtitle('Cari petunjuk di rumah ini...', 4000);
  },

  unload() {
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch (e) {}
    }
  },

  isSolid(tx, ty) {
    const col = Math.floor(tx / this.tileW);
    const row = Math.floor(ty / this.tileH);
    if (row < 0 || row >= this.mapGrid.length || col < 0 || col >= this.mapGrid[0].length) return true;
    const tile = this.mapGrid[row][col];
    /* Wall, wall-dark, and window tiles are solid */
    return tile === 1 || tile === 2 || tile === 4;
  },

  interact(px, py) {
    const cx = px + Engine.player.w / 2;
    const cy = py + Engine.player.h / 2;
    let closest = null;
    let closestDist = 64;

    for (const obj of this.interactiveObjects) {
      const ox = obj.x + (obj.w || 32) / 2;
      const oy = obj.y + (obj.h || 32) / 2;
      const d = dist(cx, cy, ox, oy);
      if (d < closestDist) {
        closestDist = d;
        closest = obj;
      }
    }

    if (!closest) {
      Engine.showSubtitle('Tidak ada yang bisa dilakukan.', 1000);
      return;
    }

    this.handleObject(closest);
  },

  handleObject(obj) {
    switch (obj.id) {
      case 'pintu-depan':   this.handlePintuDepan(); break;
      case 'pintu-belakang': this.handlePintuBelakang(); break;
      case 'jendela':       this.handleJendela(); break;
      case 'lemari':        this.handleLemari(); break;
      case 'foto':          this.handleFoto(); break;
      case 'meja':          this.handleMeja(); break;
      case 'catatan':       this.handleCatatan(); break;
      case 'tangga':        this.handleTangga(); break;
      case 'peti':          this.handlePeti(); break;
      default:
        Engine.showSubtitle('...', 1000);
    }
  },

  /* === INTERAKSI PER OBJEK === */

  handlePintuDepan() {
    Engine.showDialog('', [
      'Pintu utama — tertutup rapat.',
      'Kamu mendorong, tapi tidak bisa. Terkunci dari luar.',
      'Seseorang menguncimu di dalam.',
      'Cari jalan lain...'
    ]);
  },

  handlePintuBelakang() {
    if (!Engine.hasItem('senter')) {
      Engine.showDialog('', [
        'Pintu belakang — mengarah ke halaman.',
        'Di luar gelap gulita. Tanpa senter, kamu tidak akan bisa melihat apa-apa.',
        'Cari senter dulu...'
      ]);
      return;
    }
    if (!Engine.hasItem('korek')) {
      Engine.showDialog('', [
        'Pintu belakang — kamu bisa membukanya.',
        'Halaman di luar sangat gelap. Tapi tanpa api,',
        'kegelapan bukan satu-satunya bahaya.',
        'Cari korek — mungkin di peti besi?'
      ]);
      return;
    }
    SceneLoader.load('makam');
  },

  handleJendela() {
    if (!this.jendelaExamined) {
      this.jendelaExamined = true;
      this.cluesFound++;
      if (this.cluesFound >= 3) this.tanggaUnlocked = true;

      Engine.showDialog('', [
        'Jendela kayu pecah. Kacanya berserakan di lantai.',
        'Angin malam masuk — bau tanah basah dan bunga melati.',
        'Aroma melati di malam Jumat Kliwon... pertanda buruk.',
        'Dari luar, terdengar suara — seperti seseorang berjalan di dedaunan.',
        'Tapi siapa? Di desa yang katanya sudah sepi...'
      ]);
    } else {
      Engine.showSubtitle('Jendela pecah. Angin masih masuk.', 1000);
    }
  },

  handleLemari() {
    if (!this.lemariOpened) {
      this.lemariOpened = true;
      this.cluesFound++;
      if (this.cluesFound >= 3) this.tanggaUnlocked = true;

      /* Jump scare — lemari terbuka sendiri */
      if (!this.jumpScareTriggered) {
        this.jumpScareTriggered = true;
        setTimeout(() => {
          Engine.playJumpscare();
          Engine.showSubtitle('LEMARI TERBUKA SENDIRI!!', 2000);
          Engine.player.sanity = Math.max(0, Engine.player.sanity - 15);
        }, 800);
      }

      Engine.showDialog('', [
        'Lemari tua dari kayu jati. Kamu meraih gagangnya...',
        '*CREAK* — pintu lemari terbuka dengan deritan panjang.',
        'Di dalamnya tergantung baju-baju usang Mbah. Debu tebal.',
        'Tidak ada benda berharga — hanya pakaian lapuk.',
        'Tapi di dasar lemari... ada lubang kecil. Sesuatu mungkin tersembunyi di ruangan lain.'
      ]);
      return;
    }

    Engine.showSubtitle('Lemari sudah terbuka. Hanya baju-baju usang.', 1500);
  },

  handleFoto() {
    if (!this.fotoExamined) {
      this.fotoExamined = true;
      this.cluesFound++;
      if (this.cluesFound >= 3) this.tanggaUnlocked = true;

      Engine.showDialog('', [
        'Bingkai foto keluarga di dinding.',
        'Foto Mbah Karsono bersama keluarganya — istri, dua anak, dan seorang tamu.',
        'Wajah-wajah mereka buram, dimakan usia. Tapi satu sosok di pojok...',
        'Matanya — merah. Menyala samar.',
        'Kamu merasa sedang diawasi.'
      ]);
    } else {
      Engine.showSubtitle('Foto keluarga... seseorang menatapmu.', 1000);
    }
  },

  handleMeja() {
    if (!this.mejaExamined) {
      this.mejaExamined = true;
      this.cluesFound++;
      if (this.cluesFound >= 3) this.tanggaUnlocked = true;

      Engine.showDialog('', [
        'Meja kayu lapuk di tengah ruangan.',
        'Ada lilin meleleh di atasnya — sudah kering. Surat kabar usang: "Jumat Kliwon — 3 hari lagi."',
        'Tanggal di koran... hari ini.',
        'Mbah mungkin pergi lewat loteng. Ada tangga di pojok sana.',
        'Tapi loteng gelap. Kamu butuh lebih banyak petunjuk sebelum naik.'
      ]);
    } else {
      Engine.showSubtitle('Meja dengan lilin meleleh.', 1000);
    }
  },

  handleCatatan() {
    if (!this.catatanCollected) {
      this.catatanCollected = true;
      this.cluesFound++;
      if (this.cluesFound >= 3) this.tanggaUnlocked = true;

      Engine.showDialog('', [
        'Di sela-sela papan lantai, kamu melihat secarik kertas.',
        'Kamu mengambilnya. Tulisan Mbah — getar, terburu-buru.',
        '',
        '"Kuntilanak datang lagi. Genderuwo gelisah. Aku harus pergi sebelum Jumat Kliwon."',
        '"Maaf. Aku tidak bisa melindungi kalian lagi."',
        '',
        'Bulan ini Jumat Kliwon... malam ini.'
      ]);
      Engine.addItem({ id: 'catatan', name: 'Catatan Mbah', icon: '📄' });
      Engine.showSubtitle('Catatan Mbah didapat!', 1500);
    } else {
      Engine.showSubtitle('Catatan sudah kamu ambil.', 1000);
    }
  },

  handleTangga() {
    if (!this.tanggaUnlocked) {
      Engine.showDialog('', [
        'Tangga kayu menuju loteng. Gelap di atas.',
        'Kayunya berderit — mungkin tidak akan kuat menahanmu.',
        'Cari petunjuk dulu sebelum naik...'
      ]);
      return;
    }

    if (this.kitabFound) {
      Engine.showSubtitle('Loteng sudah kamu periksa. Tidak ada lagi yang berguna di atas.', 2000);
      return;
    }

    /* Naik ke loteng — temukan kitab */
    Engine.showDialog('', [
      'Kamu menaiki tangga dengan hati-hati. Setiap anak tangga berderit keras.',
      'Loteng gelap dan pengap. Debu bertebaran. Bau kemenyan dan sesuatu yang busuk.',
      'Di sudut, di balik peti tua dan selimut laba-laba...',
      'Sebuah KITAB KUNO. Sampul kulit. Tulisan Jawa Kawi.',
      'Kamu membukanya — satu halaman masih terbaca.',
      '"Mantra pengusir roh jahat. Bacakan di atas sesajen... dengan api."',
      'Ini yang kamu cari. Kamu turun kembali.'
    ]);
    Engine.addItem({ id: 'kitab', name: 'Kitab Kuno', icon: '📖' });
    this.kitabFound = true;
    Engine.showSubtitle('Kitab Kuno didapat!', 2000);
  },

  handlePeti() {
    if (!this.petiOpened) {
      if (!Engine.hasItem('kitab')) {
        Engine.showDialog('', [
          'Peti besi berat. Terkunci rapat.',
          'Ada ukiran di permukaannya — aksara Jawa Kawi.',
          'Sepertinya butuh kitab kuno untuk membukanya...'
        ]);
        return;
      }

      /* Buka peti dengan kitab */
      Engine.showDialog('', [
        'Kamu membuka kitab dan membaca mantra pelan-pelan.',
        'Ukiran di peti mulai bercahaya merah...',
        'Terdengar bunyi "KLIK" — peti terbuka!',
        '',
        'Di dalamnya:',
        '- SENTER tua, masih menyala terang!',
        '- KOREK API, masih ada bensinnya.',
        '- Foto keluarga — wajah mereka berlumuran darah.',
        'Kecuali satu wajah...',
        'Wajah itu... wajahmu sendiri.',
        '',
        'Kamu mundur, jantung berdebar. Tapi setidaknya sekarang kamu punya cahaya.'
      ]);
      this.petiOpened = true;
      this.senterCollected = true;
      this.korekCollected = true;
      Engine.addItem({ id: 'senter', name: 'Senter Tua', icon: '🔦' });
      Engine.addItem({ id: 'korek', name: 'Korek Api', icon: '🔥' });
      Engine.player.flashLight = true;
      Engine.player.hasLighter = true;
      Engine.showSubtitle('Senter + Korek didapat! Sekarang bisa keluar!', 2500);
      return;
    }

    Engine.showSubtitle('Peti sudah terbuka. Kosong.', 1000);
  },

  update(dt) {
    const p = Engine.player;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    /* Random creaking sounds saat berjalan */
    if (p.moving && Math.random() < 0.002) {
      Engine.playTone(120 + Math.random() * 80, 0.12, 'sine', 0.08);
    }

    /* Jump scare — saat pertama dekat lemari */
    if (!this.jumpScareTriggered) {
      const lemari = this.interactiveObjects.find(o => o.id === 'lemari');
      if (lemari && dist(cx, cy, lemari.x + 24, lemari.y + 32) < 50) {
        this.jumpScareTriggered = true;
        setTimeout(() => {
          Engine.playJumpscare();
          Engine.showSubtitle('LEMARI BERDERIT!!', 2000);
          Engine.player.sanity = Math.max(0, Engine.player.sanity - 10);
        }, 1200);
      }
    }

    /* Suara misterius dekat jendela */
    const jendela = this.interactiveObjects.find(o => o.id === 'jendela');
    if (jendela && dist(cx, cy, jendela.x + 16, jendela.y + 16) < 70) {
      if (Engine.tick % 250 === 0) {
        Engine.playTone(400 + Math.random() * 200, 0.15, 'sine', 0.04);
        if (Math.random() < 0.3) {
          Engine.showSubtitle('(Suara bisikan dari luar jendela...)', 2000);
        }
      }
    }

    /* Peti yang terkunci — bisikan mistis */
    if (!this.petiOpened && !Engine.hasItem('kitab')) {
      const peti = this.interactiveObjects.find(o => o.id === 'peti');
      if (peti && dist(cx, cy, peti.x + 24, peti.y + 16) < 60 && Engine.tick % 300 === 0) {
        Engine.playTone(250, 0.3, 'sine', 0.04);
      }
    }

    /* Suara napas dari loteng setelah kitab ditemukan */
    if (this.kitabFound) {
      const tangga = this.interactiveObjects.find(o => o.id === 'tangga');
      if (tangga && dist(cx, cy, tangga.x + 32, tangga.y + 16) < 80 && Engine.tick % 350 === 0) {
        Engine.playTone(70, 2.0, 'sine', 0.03);
        Engine.showSubtitle('(Suara napas berat dari loteng...)', 2000);
      }
    }

    /* Efek sanity rendah */
    if (p.sanity < 30 && Engine.tick % 180 === 0) {
      Engine.playTone(200 + Math.random() * 100, 0.08, 'sine', 0.05);
    }
  },

  render(ctx) {
    /* === DRAW MAP TILES === */
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * this.tileW;
        const y = row * this.tileH;
        let tileId;
        switch (tile) {
          case 0: tileId = (row + col) % 2 === 0 ? 'floor1' : 'floor2'; break;
          case 1: tileId = 'wall'; break;
          case 2: tileId = 'wall-dark'; break;
          case 3: tileId = 'door'; break;
          case 4: tileId = 'window'; break;
          case 5: tileId = 'stairs'; break;
          default: tileId = 'floor1';
        }
        Asset.drawTile('rumah', tileId, ctx, x, y);
      }
    }

    /* === DRAW INTERACTIVE OBJECT SPRITES === */
    for (const obj of this.interactiveObjects) {
      const x = obj.x;
      const y = obj.y;

      switch (obj.id) {
        case 'lemari':
          Asset.drawSprite('lemari', ctx, x, y);
          break;

        case 'meja':
          Asset.drawSprite('meja', ctx, x, y);
          break;

        case 'foto':
          Asset.drawSprite('foto', ctx, x, y);
          break;

        case 'peti':
          Asset.drawSprite('peti', ctx, x, y);
          if (this.petiOpened && this.senterCollected) {
            /* Tanda peti sudah terbuka — gambar bukaannya */
            ctx.fillStyle = 'rgba(10,5,5,0.5)';
            ctx.fillRect(x + 8, y + 8, 32, 20);
          }
          break;

        case 'catatan':
          if (!this.catatanCollected) {
            Asset.drawSprite('catatan', ctx, x, y);
          }
          break;

        /* Doors, windows, tangga — visual sudah dari tile map */
        default:
          break;
      }
    }

    /* Tanda interaksi jika pemain dekat pintu belakang dan punya senter */
    if (Engine.hasItem('senter') && Engine.hasItem('korek')) {
      const p = Engine.player;
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      const pintuBelakang = this.interactiveObjects.find(o => o.id === 'pintu-belakang');
      if (pintuBelakang && dist(cx, cy, pintuBelakang.x + 64, pintuBelakang.y + 16) < 80) {
        ctx.fillStyle = `rgba(100,255,100,${0.3 + Math.sin(Engine.tick * 0.1) * 0.15})`;
        ctx.font = '8px monospace';
        ctx.fillText('> KELUAR', pintuBelakang.x + 24, pintuBelakang.y - 8);
      }
    }
  },

  getState() {
    return {
      cluesFound: this.cluesFound,
      lemariOpened: this.lemariOpened,
      kitabFound: this.kitabFound,
      petiOpened: this.petiOpened,
      senterCollected: this.senterCollected,
      korekCollected: this.korekCollected,
      jumpScareTriggered: this.jumpScareTriggered,
      tanggaUnlocked: this.tanggaUnlocked,
      fotoExamined: this.fotoExamined,
      mejaExamined: this.mejaExamined,
      jendelaExamined: this.jendelaExamined,
      catatanCollected: this.catatanCollected,
    };
  },

  setState(state) {
    if (state.cluesFound !== undefined) this.cluesFound = state.cluesFound;
    if (state.lemariOpened !== undefined) this.lemariOpened = state.lemariOpened;
    if (state.kitabFound !== undefined) this.kitabFound = state.kitabFound;
    if (state.petiOpened !== undefined) this.petiOpened = state.petiOpened;
    if (state.senterCollected !== undefined) this.senterCollected = state.senterCollected;
    if (state.korekCollected !== undefined) this.korekCollected = state.korekCollected;
    if (state.jumpScareTriggered !== undefined) this.jumpScareTriggered = state.jumpScareTriggered;
    if (state.tanggaUnlocked !== undefined) this.tanggaUnlocked = state.tanggaUnlocked;
    if (state.fotoExamined !== undefined) this.fotoExamined = state.fotoExamined;
    if (state.mejaExamined !== undefined) this.mejaExamined = state.mejaExamined;
    if (state.jendelaExamined !== undefined) this.jendelaExamined = state.jendelaExamined;
    if (state.catatanCollected !== undefined) this.catatanCollected = state.catatanCollected;
  },
});
