# TECHNICAL SPECIFICATION — Malam Jumat Kliwon
## Berdasarkan GDD.md

---

## 1. ARSITEKTUR FILE

```
horor-indonesia/
├── game/
│   ├── index.html          # Entry point, viewport, canvas
│   ├── engine.js           # Core engine: renderer, input, audio, scene, item
│   ├── assets.js           # Semua sprite data (pixel array) + tile data
│   ├── audio.js            # Audio engine + SFX + music (Web Audio API)
│   ├── data/
│   │   ├── scenes.js       # Scene definitions, dialog, triggers
│   │   ├── items.js        # Item definitions, kombinasi, fungsi
│   │   ├── teka-teki.js    # Puzzle logic, conditions, solutions
│   │   └── ending.js       # Kondisi ending + scene final
│   ├── render/
│   │   ├── sprite.js       # Sprite renderer dari pixel arrays
│   │   ├── tilemap.js      # Tilemap renderer + collision
│   │   ├── lighting.js     # Dynamic lighting, flashlight, darkness
│   │   └── effects.js      # Grain, distortion, transitions, jumpscare
│   ├── ui/
│   │   ├── hud.js          # Health, sanity, battery, item bar
│   │   ├── dialog.js       # Dialog box + portrait renderer
│   │   ├── inventory.js    # Grid inventory, use, combine
│   │   ├── menu.js         # Main menu, settings, saves
│   │   └── loading.js      # Loading screen + progress bar
│   ├── scenes/             # (opsional — bisa inline di data/scenes.js)
│   └── main.js             # Game loop, state machine, save/load
├── android/
│   └── ...                 # WebView wrapper untuk APK
├── GDD.md
├── STORY_BIBLE.md
├── TECH_SPEC.md
└── ASSET_INVENTORY.md
```

**Catatan**: Struktur di atas lebih modular. Alternatif yang lebih ringan — tetap pertahankan file lebih sedikit:

```
game/
├── index.html
├── engine.js         # Engine core + renderer (merged)
├── assets.js         # Sprites, tiles, backgrounds pixel data
├── data.js           # Scenes, items, dialog, teka-teki, ending
├── audio.js          # Audio engine + semua track/SFX
└── main.js           # Boot, menu, game loop, save
```

**Keputusan**: Ambil yang **ringan** (5 file + index). Kode lebih panjang per file, tapi lebih sedikit file dan dependency. Tidak perlu module bundler.

---

## 2. FORMAT DATA

### 2a. Sprite (Pixel Array)

Sprite 32x32 pixel disimpan sebagai array warna hex:

```javascript
// Contoh sprite 8x8 (sebenarnya 32x32 per sprite)
sprite: {
  w: 32,
  h: 32,
  // Pixel data: array flat warna hex. ''=transparan
  data: [
    '', '', '#1a1a2e', '#1a1a2e', '#1a1a2e', '#1a1a2e', '', '',
    '', '#1a1a2e', '#16213e', '#16213e', '#16213e', '#16213e', '#1a1a2e', '',
    // ... 1024 pixel total (32x32)
  ],
  // Animasi frames (optional)
  frames: [
    { x: 0, y: 0 },  // frame 1
    { x: 32, y: 0 }, // frame 2
  ]
}
```

Setiap sprite di-asset.js adalah objek dengan:

| Field | Type | Deskripsi |
|-------|------|-----------|
| `w` | number | Width pixel |
| `h` | number | Height pixel |
| `data` | string[] | Array flat warna hex; ''=transparan |
| `originX` | number | (optional) Pivot X, default w/2 |
| `originY` | number | (optional) Pivot Y, default h-2 (kaki) |

### 2b. Tilemap

Tilemap 2D array angka, tiap angka merujuk ke tileset:

```javascript
tilemap: {
  tileset: 'rumah_tua',    // nama tileset di assets.js
  w: 40,                   // tile horizontal
  h: 15,                   // tile vertical
  data: [
    [1, 1, 1, 1, 1, ...],  // baris 0
    [1, 0, 0, 0, 0, ...],  // baris 1
    // ...
  ],
  collisions: [1, 2, 3],   // tile index yang solid (wall)
  triggers: {
    '5,3': 'scene:pintu_belakang',  // posisi tile → event
    '7,10': 'item:kunci',
    '15,5': 'dialog:misteri',
    '20,8': 'teka-teki:1',
  }
}
```

### 2c. Scene

```javascript
scene: {
  id: 'rumah_tamu',
  name: 'Ruang Tamu',
  bg: 'rumah_tamu_bg',           // background art ref
  tilemap: 'rumah_tamu_map',     // tilemap ref
  playerStart: { x: 5, y: 10 },  // tile position
  cameraBounds: { maxX: 15 },    // horizontal scroll limit
  items: [],                      // items di scene ini
  npcs: [],                       // NPC/musuh di scene
  exits: {
    'kiri': 'rumah_dapur',
    'kanan_atas': 'tangga',
  },
  ambient: 'rumah_tamu_loop',    // audio ambient
  lighting: 'dim',                // 'bright' | 'dim' | 'dark'
}
```

### 2d. Save Data

```javascript
save: {
  version: 1,
  timestamp: 1712345678,
  scene: 'rumah_tamu',
  playerPos: { x: 5, y: 10 },
  inventory: ['senter', 'kunci', ...],
  flags: {
    'lemari_terbuka': true,
    'kunci_diambil': true,
    'kamar_wati_buka': false,
    // ... semua state game
  },
  battery: 80,                  // persen
  sanity: 100,                  // 0-100
  currentEnding: null,          // 'A', 'B', 'C', null
  tekaTekiSolved: [false * 9],  // 9 puzzle solved flags
}
```

---

## 3. ENGINE CORE

### 3a. Game Loop

```
requestAnimationFrame loop:
  1. Input processing (touch → game state)
  2. Update (player movement, AI, animations, collision)
  3. Render:
     a. Clear canvas (dark background)
     b. Draw tilemap layer (wall, floor, ceiling)
     c. Apply ambient lighting
     d. Draw game objects (items, interactive objects)
     e. Draw characters (player, NPC, enemy)
     f. Apply flashlight cone (radial gradient)
     g. Draw special effects (grain, distortion)
     h. Draw UI (HUD, inventory, dialog)
  4. Audio check (trigger music/SFX)
```

### 3b. Render Pipeline

1. **Background layer** — full screen background art (pixel array dirender 1x, di-cache)
2. **Tile layer** — tilemap dari tileset pixel array
3. **Dynamic objects** — item, NPC, trigger area
4. **Player character** — dengan animasi frame
5. **Lighting overlay** — canvas kedua untuk flashlight + darkness effect
6. **Foreground effects** — grain, fog, glitch
7. **UI overlay** — canvas ketiga untuk HUD, dialog, inventory

### 3c. Canvas Strategy

3 canvases bertumpuk (absolute position):

| Canvas | Z | Fungsi | Ukuran |
|--------|---|--------|--------|
| `#bgCanvas` | 0 | Background + tiles | 960x540 (resize ke layar) |
| `#gameCanvas` | 1 | Object, player, NPC | 960x540 |
| `#lightCanvas` | 2 | Lighting overlay | 960x540 (global composite: multiply) |
| `#uiCanvas` | 3 | UI, dialog, inventory | Full screen (mengikuti device) |

Atau lebih efisien: **1 canvas + save/restore state** (tergantung performa).

---

## 4. AUDIO ENGINE

Menggunakan **Web Audio API** + oscillator-based SFX (tidak perlu file audio besar):

### 4a. AudioEngine

```javascript
class AudioEngine {
  constructor() { /* ... */ }
  
  // Suara oscillator
  playNote(freq, duration, type, volume)   // untuk SFX dasar
  playNoise(duration, volume)               // static/white noise
  playAmbient(type)                         // loop ambient (angin, jangkrik)
  playStinger(type)                         // jumpscare stingers
  
  // Musik background — bisa oscillator pattern atau tone sequence
  playBGM(trackName)
  stopBGM()
  
  // Utility
  setVolumeSFX(v)
  setVolumeMusic(v)
  muteAll()
}
```

### 4b. SFX Kategori

| Kategori | Method | Detail |
|----------|--------|--------|
| Footsteps | `playStep(surface)` | 3 varian: kayu, tanah, air |
| Ambience | `playAmbient('wind')` | Angin malam, jangkrik |
| Stingers | `playStinger('violin')` | Jumpscare violin |
| UI | `playClick()`, `playOpen()` | Interaksi UI |
| Monster | `playGrowl()`, `playScream()` | Genderuwo, Kuntilanak |
| Items | `playPickup()`, `playUnlock()` | Item interaksi |

### 4c. Catatan Audio

- Semua SFX **built-in via Web Audio API** — tidak perlu file eksternal
- Musik background bisa menggunakan **pattern sequencer** (nada berulang, scale tertentu) — atau file OGG jika ukuran tidak masalah
- **Prioritas**: SFX dibuat dulu via oscillator. Musik bisa ditambahkan belakangan

---

## 5. INPUT

### 5a. Touch (Android utama)

| Gesture | Aksi |
|---------|------|
| Tap kiri layar | Jalan ke kiri |
| Tap kanan layar | Jalan ke kanan |
| Tap object/hotspot | Interaksi |
| Tap item di inventory | Pilih item (highlight) |
| Tap hotspot dengan item terpilih | Gunakan item |
| Tap di luar inventory | Cancel pemilihan item |
| Double tap pintu | Pindah scene |
| Tap dialog | Lanjut ke baris berikutnya |

### 5b. Mouse/Keyboard (PC dev testing)

| Input | Aksi |
|-------|------|
| Click A / Arrow Left | Jalan kiri |
| Click D / Arrow Right | Jalan kanan |
| Click object | Interaksi |
| E / Enter | Interaksi object terdekat |
| I | Buka/tutup inventory |
| Space | Lanjut dialog |

---

## 6. SAVE SYSTEM

- **3 save slot** + 1 auto-save
- Save trigger: **titik tertentu** di scene (mirror, meja, area aman)
- Auto-save: setiap pindah scene
- Format: JSON → `localStorage` (untuk HTML/WebView)
- **Tidak ada save di tengah jumpscare atau chase**

---

## 7. PERFORMANCE TARGET

| Metrik | Target |
|--------|--------|
| Frame rate | 30-60 FPS (device mid-range) |
| Frame drop | Maks 5% waktu bermain |
| Touch latency | < 100ms |
| Loading time | < 3 detik |
| APK size | 25-40MB |

### Optimasi:
- Pre-render background ke offscreen canvas (cache)
- Hanya update area layar yang berubah (dirty rect)
- Sprite atlas: merge sprite kecil jadi satu canvas
- Lighting effect hanya update per 3 frame (bukan tiap frame)

---

## 8. PLATFORM BUILD

### Android (APK)
- **WebView wrapper** — load `game/index.html`
- Fullscreen, no chrome, haptic feedback (opsional)
- Build via **GitHub Actions** (sebelumnya sudah setup)

### Web (development)
- Buka `game/index.html` di browser
- Dev mode: show FPS, grid overlay, coordinate

---

## 9. CODE STANDARDS

- **ES6+** (no transpiler — WebView modern sudah support)
- **No dependencies** — vanilla JS saja
- **Strict mode** `'use strict'`
- Konsistensi: camelCase functions, UPPER_SNAKE constants
- Error handling: try/catch utama + fallback state
- File structure: setiap file punya satu class/modul utama

---

*Siap lanjut ke aset berikutnya. Next: **#0d Audio Direction** atau langsung ke **#1a Visual Assets (Character Sprites)**?*
