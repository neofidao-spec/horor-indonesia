/* === SCENE 1: RUMAH TUA === */
/* Desa terpencil, rumah Mbah yang sudah meninggal. Suasana sunyi, benda-benda berhantu. */

SceneLoader.register('rumah-tua', {
  name: 'rumah-tua',
  w: 1280, h: 960,
  tileW: 32, tileH: 32,
  fogColor: 'rgba(5,5,15,0.88)',
  playerStart: { x: 120, y: 400 },
  
  /* Tile map: 0=floor, 1=wall, 2=door, 3=interactive */
  mapGrid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,2,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],

  interactiveObjects: [],
  doorsState: {},
  puzzleSolved: false,
  senterFound: false,
  jumpScareTriggered: false,
  exitUnlocked: false,
  steps: 0,
  ambientSource: null,

  init() {
    this.interactiveObjects = [
      { id: 'lemari', x: 320, y: 208, w: 48, h: 64, name: 'Lemari Tua', 
        examined: false, opened: false, text: 'Lemari tua berdebu. Ada yang aneh...' },
      { id: 'meja', x: 480, y: 400, w: 64, h: 48, name: 'Meja Kayu',
        examined: false, text: 'Meja kayu lapuk. Ada lilin meleleh di atasnya.' },
      { id: 'foto', x: 640, y: 208, w: 32, h: 48, name: 'Bingkai Foto',
        examined: false, text: 'Foto keluarga Mbah. Wajah-wajahnya buram, tapi seseorang di foto itu... menatapmu.' },
      { id: 'senter', x: 340, y: 260, w: 16, h: 16, name: 'Senter', 
        hidden: true, text: 'Senter tua! Masih menyala.' },
      { id: 'kitab', x: 500, y: 390, w: 24, h: 16, name: 'Kitab Kuno',
        hidden: true, text: 'Kitab berbahasa Jawa kuno. Satu kalimat terbaca: "Wong kang mati ora bakal mati..." (Orang yang mati tidak akan mati...)', 
        collectable: true, itemId: 'kitab' },
      { id: 'pintu-depan', x: 608, y: 160, w: 48, h: 16, name: 'Pintu Depan',
        isDoor: true, locked: true, text: 'Pintu terkunci dari luar.' },
      { id: 'pintu-belakang', x: 860, y: 480, w: 16, h: 48, name: 'Pintu Belakang',
        isDoor: true, locked: false, text: 'Pintu belakang — menuju ke belakang rumah.' },
      { id: 'jendela', x: 200, y: 180, w: 64, h: 8, name: 'Jendela Pecah',
        examined: false, text: 'Kaca pecah. Angin malam masuk — bau tanah basah dan sesuatu yang lebih busuk.' },
      { id: 'tangga', x: 800, y: 400, w: 48, h: 32, name: 'Tangga Loteng',
        text: 'Tangga ke loteng. Gelap. Dari atas terdengar suara — seperti dengkuran, tapi bukan manusia.', 
        stairsUp: true, blocked: true },
      { id: 'catatan', x: 400, y: 464, w: 16, h: 16, name: 'Catatan Mbah',
        hidden: true, text: '"Minggu lalu, Kuntilanak datang lagi. Genderuwo gelisah. Aku harus pergi sebelum Jumat Kliwon."',
        collectable: true, itemId: 'catatan' },
      { id: 'peti', x: 544, y: 240, w: 48, h: 32, name: 'Peti Besi',
        examined: false, locked: true, text: 'Peti besi berat. Terkunci. Ada ukiran — butuh kitab untuk membukanya.', 
        puzzleItem: 'kitab', solvedText: 'PETI TERBUKA! Di dalamnya ada: (1) Senter, (2) Foto lama — seseorang bersimbah darah.' },
    ];

    this.doorsState = {};
    this.puzzleSolved = false;
    this.senterFound = false;
    this.jumpScareTriggered = false;
    this.exitUnlocked = false;
    this.steps = 0;

    // Start ambient
    if (Engine.audioEnabled && Engine.audioCtx) {
      this.ambientSource = Engine.playAmbient('indoor');
    }

    // First dialog
    setTimeout(() => {
      Engine.showDialog('Narator', [
        'Desa ini sepi. Terlalu sepi.',
        'Mbah pergi tiga hari lalu — tanpa pamit. Rumahnya ditinggal begitu saja.',
        'Kamu datang untuk mencari tahu. Tapi sejak melangkah masuk, pintu di belakangmu tertutup sendiri.',
        'Cari jalan keluar. Dan waspadalah... sesuatu di sini tidak sendirian.'
      ]);
    }, 500);

    Engine.showSubtitle('Cari jalan keluar dari rumah ini...', 4000);
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
    const tile = this.mapGrid[row][col];
    if (tile === 1) return true;
    
    // Check doors
    for (const obj of this.interactiveObjects) {
      if (obj.isDoor && obj.locked && !obj.opened) {
        if (tx >= obj.x && tx <= obj.x + obj.w && ty >= obj.y && ty <= obj.y + obj.h) return true;
      }
    }
    return false;
  },

  interact(px, py) {
    const cx = px + Engine.player.w/2;
    const cy = py + Engine.player.h/2;
    const pDir = Engine.player.dir;

    // Check proximity to objects
    let closest = null;
    let closestDist = 80; // interact range

    for (const obj of this.interactiveObjects) {
      const ox = obj.x + (obj.w || 32)/2;
      const oy = obj.y + (obj.h || 32)/2;
      const d = dist(cx, cy, ox, oy);
      
      // Direction bias
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
    if (obj.hidden && !obj.examined && obj.id !== 'senter' && obj.id !== 'catatan' && obj.id !== 'kitab') {
      Engine.showSubtitle('Tidak ada apa-apa.', 1000);
      return;
    }

    // Hidden objects that need discovery
    if (obj.id === 'senter' && !this.senterFound) {
      if (Engine.hasItem('kitab')) {
        this.handlePeti();
        return;
      }
      Engine.showSubtitle('Ada sesuatu di lantai berdebu...', 1500);
      return;
    }

    if (obj.id === 'kitab' && !Engine.hasItem('kitab')) {
      if (!this.puzzleSolved) {
        Engine.showDialog('', [
          'Di bawah meja, ada kitab kuno terselip.',
          'Kamu mengambilnya. Tulisan Jawa Kawi — tapi satu halaman bisa kau baca.',
          'Isinya mantra pengusir roh jahat. Mungkin berguna nanti.'
        ]);
        Engine.addItem({ id: 'kitab', name: 'Kitab Kuno', icon: '📖' });
        obj.hidden = true;
        this.puzzleSolved = true;
      }
      return;
    }

    if (obj.id === 'catatan' && !Engine.hasItem('catatan')) {
      Engine.showDialog('', [
        'Di sela-sela papan lantai, ada secarik kertas.',
        'Tulisan Mbah — khas orang tua, getar.' , 
        '"Kuntilanak datang lagi. Genderuwo gelisah..."', 
        '"Aku harus pergi sebelum Jumat Kliwon. Maaf."',
        'Bulan ini Jumat Kliwon — malam ini.'
      ]);
      Engine.addItem({ id: 'catatan', name: 'Catatan Mbah', icon: '📄' });
      obj.hidden = true;
      Engine.showSubtitle('Jumat Kliwon... malam ini.', 2000);
      return;
    }

    // Peti puzzle
    if (obj.id === 'peti') {
      this.handlePeti();
      return;
    }

    // Doors
    if (obj.isDoor) {
      this.handleDoor(obj);
      return;
    }

    if (obj.stairsUp) {
      if (obj.blocked) {
        Engine.showDialog('', [
          'Tangga ke loteng. Kayunya berderit.',
          'Dari atas terdengar suara napas berat — teratur. Seperti makhluk besar sedang tidur.',
          'Lebih baik tidak ke atas sekarang...',
        ]);
      }
      return;
    }

    // Regular examine
    if (!obj.examined) {
      obj.examined = true;
      Engine.showDialog('', [obj.text]);
    } else {
      Engine.showDialog('', [obj.text]);
    }
  },

  handlePeti() {
    if (!Engine.hasItem('kitab')) {
      Engine.showSubtitle('Peti terkunci butuh kitab.', 1500);
      return;
    }
    
    Engine.showDialog('', [
      'Kamu membuka kitab dan membaca mantra di atas peti.',
      'Terdengar bunyi "klik" — peti terbuka.',
      'Di dalamnya ada SENTER tua! Dan foto keluarga yang aneh...',
      'Wajah semua orang di foto itu berlumuran darah — kecuali satu.',
      'Wajah itu... wajahmu sendiri.'
    ]);

    Engine.addItem({ id: 'senter', name: 'Senter Tua', icon: '🔦' });
    Engine.player.flashLight = true;
    this.senterFound = true;

    // Unlock loteng stairs after this
    const tangga = this.interactiveObjects.find(o => o.id === 'tangga');
    if (tangga) tangga.blocked = false;

    Engine.showSubtitle('Senter didapat! Lihat sekeliling lebih jelas.', 2000);
  },

  handleDoor(obj) {
    if (obj.id === 'pintu-depan') {
      Engine.showDialog('', [
        'Pintu utama terkunci dari luar. Seseorang menguncimu di dalam.',
        'Cari jalan lain...'
      ]);
      return;
    }

    if (obj.id === 'pintu-belakang') {
      if (this.senterFound) {
        SceneLoader.load('makam');
      } else {
        Engine.showDialog('', [
          'Pintu belakang — mengarah ke halaman.',
          'Di luar gelap gulita. Tanpa cahaya, kamu tidak akan bisa melihat apa-apa.',
          'Cari senter dulu...'
        ]);
      }
      return;
    }
  },

  update(dt) {
    const p = Engine.player;
    this.steps += p.moving ? 1 : 0;

    // Random creaking sounds
    if (p.moving && Math.random() < 0.002) {
      Engine.playTone(150 + Math.random() * 100, 0.15, 'sine', 0.1);
    }

    // First time near lemari (jump scare)
    if (!this.jumpScareTriggered && dist(p.x, p.y, 320, 208) < 60) {
      this.jumpScareTriggered = true;
      setTimeout(() => {
        Engine.playJumpscare();
        Engine.showSubtitle('LEMARI TERBUKA SENDIRI!!', 2000);
        Engine.player.sanity = Math.max(0, Engine.player.sanity - 15);
      }, 1000);
    }

    // Near tangga loteng — weird sounds
    const tangga = this.interactiveObjects.find(o => o.id === 'tangga');
    if (tangga && !tangga.blocked && dist(p.x, p.y, tangga.x, tangga.y) < 80) {
      if (Engine.tick % 300 === 0) {
        Engine.playTone(80, 1.5, 'sine', 0.05);
        Engine.showSubtitle('(Suara napas berat dari loteng...)', 2000);
      }
    }
  },

  getState() {
    return {
      senterFound: this.senterFound,
      puzzleSolved: this.puzzleSolved,
      jumpScareTriggered: this.jumpScareTriggered,
      exitUnlocked: this.exitUnlocked,
      objects: this.interactiveObjects.map(o => ({ 
        id: o.id, examined: o.examined, opened: o.opened, hidden: o.hidden, blocked: o.blocked 
      }))
    };
  },

  setState(state) {
    if (state.senterFound !== undefined) this.senterFound = state.senterFound;
    if (state.puzzleSolved !== undefined) this.puzzleSolved = state.puzzleSolved;
    if (state.jumpScareTriggered !== undefined) this.jumpScareTriggered = state.jumpScareTriggered;
    if (state.exitUnlocked !== undefined) this.exitUnlocked = state.exitUnlocked;
    if (state.objects) {
      for (const saved of state.objects) {
        const obj = this.interactiveObjects.find(o => o.id === saved.id);
        if (obj) {
          if (saved.examined !== undefined) obj.examined = saved.examined;
          if (saved.opened !== undefined) obj.opened = saved.opened;
          if (saved.hidden !== undefined) obj.hidden = saved.hidden;
          if (saved.blocked !== undefined) obj.blocked = saved.blocked;
        }
      }
    }
  },

  render(ctx) {
    const tileW = this.tileW, tileH = this.tileH;

    // Draw map
    for (let row = 0; row < this.mapGrid.length; row++) {
      for (let col = 0; col < this.mapGrid[row].length; col++) {
        const tile = this.mapGrid[row][col];
        const x = col * tileW, y = row * tileH;
        
        if (tile === 1) {
          // Wall — plank pattern
          ctx.fillStyle = (row + col) % 2 === 0 ? '#2a1a1a' : '#221515';
          ctx.fillRect(x, y, tileW, tileH);
          ctx.strokeStyle = '#1a0a0a';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, tileW, tileH);
        } else if (tile === 2) {
          // Door
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y, tileW, tileH);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x + 4, y + 2, 2, tileH - 4);
          ctx.fillRect(x + tileW - 6, y + 2, 2, tileH - 4);
        } else {
          // Floor — worn planks
          const shade = ((row * 7 + col * 3) % 5) * 3;
          ctx.fillStyle = `rgb(${20+shade},${18+shade},${15+shade})`;
          ctx.fillRect(x, y, tileW, tileH);
          // Wood grain lines
          ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.sin(row+col)*0.03})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y + 8);
          ctx.lineTo(x + tileW, y + 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y + 20);
          ctx.lineTo(x + tileW, y + 18);
          ctx.stroke();
        }
      }
    }

    // Draw objects
    for (const obj of this.interactiveObjects) {
      if (obj.hidden && !obj.examined && obj.id !== 'pintu-depan' && obj.id !== 'pintu-belakang') continue;
      
      const x = obj.x, y = obj.y, w = obj.w || 32, h = obj.h || 32;
      
      switch(obj.id) {
        case 'lemari':
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x+4, y+10, 4, h-10);
          ctx.fillRect(x+w-8, y+10, 4, h-10);
          ctx.fillRect(x+8, y+4, w-16, 6);
          ctx.fillStyle = '#4a3a2a';
          ctx.fillRect(x+6, y+8, 4, 4);
          break;
        case 'meja':
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y+4, w, 6);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x+8, y, 4, h);
          ctx.fillRect(x+w-12, y, 4, h);
          ctx.fillRect(x+w/2-2, y, 4, h);
          // Lily
          ctx.fillStyle = '#5a3a1a';
          ctx.fillRect(x+20, y-4, 8, 8);
          break;
        case 'foto':
          ctx.fillStyle = '#1a0a00';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x+2, y+2, w-4, h-4);
          // Faces (blobs)
          ctx.fillStyle = '#4a3a3a';
          ctx.beginPath();
          ctx.arc(x+8, y+14, 5, 0, Math.PI*2);
          ctx.arc(x+24, y+14, 5, 0, Math.PI*2);
          ctx.arc(x+16, y+34, 5, 0, Math.PI*2);
          ctx.fill();
          break;
        case 'senter':
          if (this.senterFound) {
            ctx.fillStyle = '#888';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#aa8';
            ctx.fillRect(x+3, y+2, w-6, 4);
          } else if (Engine.hasItem('kitab') && !Engine.hasItem('senter')) {
            // Senter visible after peti opened
            ctx.fillStyle = '#888';
            ctx.fillRect(x, y, w, h);
          }
          break;
        case 'peti':
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#4a3a2a';
          ctx.fillRect(x+2, y+2, w-4, 4);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x+4, y+8, w-8, h-10);
          // Lock
          ctx.fillStyle = '#666';
          ctx.fillRect(x+w/2-4, y+18, 8, 6);
          break;
        case 'tangga':
          ctx.fillStyle = '#3a2a1a';
          for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + i*3, y + i*8, w - i*6, 6);
          }
          break;
        case 'jendela':
          ctx.fillStyle = '#1a1a2a';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = '#3a2a1a';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
          ctx.beginPath();
          ctx.moveTo(x+w/2, y);
          ctx.lineTo(x+w/2, y+h);
          ctx.stroke();
          // Crack
          ctx.strokeStyle = '#aaa';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x+12, y);
          ctx.lineTo(x+28, y+6);
          ctx.lineTo(x+24, y+4);
          ctx.stroke();
          break;
        case 'pintu-depan':
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x+6, y+4, 4, h-8);
          ctx.fillRect(x-4, y+h/2-8, 8, 16);
          break;
        case 'pintu-belakang':
          ctx.fillStyle = '#3a2a1a';
          ctx.fillRect(x, y, w, h);
          ctx.fillStyle = '#2a1a0a';
          ctx.fillRect(x+2, y+6, w-4, 4);
          ctx.fillRect(x+w-6, y+h/2-4, 8, 8);
          break;
      }
    }
  }
});