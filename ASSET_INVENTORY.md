# ASSET INVENTORY — Malam Jumat Kliwon
## Target: Game horror pixel art setara DISTRAINT/Pamali mobile

---

## FASE 0: GAME DESIGN (dokumen — 4 dokumen)

| # | Dokumen | Isi | Ukuran |
|---|---------|-----|--------|
| 0a | Story Bible | Alur lengkap 3 babak, dialog, lore, twist ending | ~20KB |
| 0b | Game Design (GDD) | Mekanik, puzzle, sistem, flowchart scene | ~15KB |
| 0c | Technical Spec | Struktur kode, format save, platform target | ~10KB |
| 0d | Audio Direction | Mood per scene, jenis SFX, musik references | ~5KB |

---

## FASE 1: VISUAL ASSETS (gambar — ~30 file)

### 1a. Character Sprites (pixel 32x32 - 64x64)

| # | Aset | Frame | Arah | Detail |
|---|------|-------|------|--------|
| C01 | Player idle | 2 frame | 4 arah | Baju putih, senter di tangan |
| C02 | Player walk | 4 frame | 4 arah | Animasi langkah + senter goyang |
| C03 | Player interact | 3 frame | 1 arah | Ambil benda, baca, dorong |
| C04 | Player scared | 2 frame | 1 arah | Ekspresi takut, gemetar |
| C05 | Player death | 4 frame | 1 arah | Jatuh, kesurupan, hilang |
| C06 | Mbah Karsono (NPC) | 2 frame | 2 arah | Duduk, berdiri, tongkat |
| C07 | Mbah apparition | 3 frame | 1 arah | Transparan, float, pointing |
| C08 | Genderuwo | 4 frame | 2 arah | Patrol, chase, attack, idle |
| C09 | Kuntilanak boss | 6 frame | 1 arah | Float, scream, swoop, vanish, vulnerable, rage |
| C10 | Pocong | 3 frame | 2 arah | Hop, chase, hide |
| C11 | Tuyul (bonus) | 2 frame | 2 arah | Lari, sembunyi |

### 1b. Tilesets (pixel 16x16 - 32x32 per tile)

| # | Aset | Tile | Unik | Palette |
|---|------|------|------|---------|
| T01 | Rumah Tua tileset | 32x32 | 12 varian | Kayu gelap, tanah, debu |
| T02 | Interior items tileset | 32x32 | 8 varian | Lemari, meja, kursi, rak, pintu, jendela |
| T03 | Loteng tileset | 32x32 | 6 varian | Kayu lapuk, jaring laba, debu tebal |
| T04 | Makam tileset | 32x32 | 10 varian | Tanah, rumput, nisan, pagar, pohon |
| T05 | Gua tileset | 32x32 | 6 varian | Batu, stalaktit, altar, lilin |
| T06 | Sawah tileset | 32x32 | 8 varian | Air, padi, pematang, lumpur, bambu |

### 1c. Background Art (full screen 480x320 - 960x540)

| # | Aset | Ukuran | Keterangan |
|---|------|--------|------------|
| B01 | Title background | 960x540 | Rumah angker malam bulan purnama |
| B02 | Rumah Tua exterior | 960x540 | Rumah joglo tua, malam |
| B03 | Rumah Tua interior | 960x540 | Ruang tamu gelap, perabot usang |
| B04 | Loteng | 960x540 | Loteng gelap penuh debu |
| B05 | Makam panorama | 960x540 | Makam desa malam, pohon beringin |
| B06 | Gua Mbah | 960x540 | Gua sempit, altar batu |
| B07 | Sawah mistis | 960x540 | Sawah luas, kabut, bulan merah |
| B08 | Ending scene | 960x540 | Bergantung ending (3 varian) |

### 1d. UI/UX Elements

| # | Aset | Detail |
|---|------|--------|
| U01 | Main menu layout | Judul, tombol, partikel |
| U02 | HUD | HP bar, sanity bar, battery, minimap |
| U03 | Inventory grid | 6 slot item icon |
| U04 | Dialog box | Portrait + text box (transparan) |
| U05 | Save slot UI | 3 slot, timestamp, preview |
| U06 | Settings panel | Volume, language, credits |
| U07 | Item icons | ~12 item (kunci, kitab, senter, korek, dll) |

---

## FASE 2: AUDIO ASSETS (suara — ~40 file)

### 2a. Music (background — 8 track)

| # | Track | Durasi | Scene |
|---|-------|--------|-------|
| M01 | Title theme | 1:30 | Main menu — instrumental gamelan horror |
| M02 | Rumah Tua ambient | 2:00 | Babak 1 — low drone, wood creak |
| M03 | Loteng tension | 1:30 | Babak 1 loteng — high strings |
| M04 | Makam ambient | 2:00 | Babak 2 — angin malam, gamelan jauh |
| M05 | Genderuwo chase | 0:30 | Babak 2 pursuit — drum cepat |
| M06 | Sawah ambient | 2:00 | Babak 3 — air, gamelan dissonant |
| M07 | Kuntilanak boss | 1:00 | Babak 3 fight — orchestral horror |
| M08 | Ending theme | 1:00 | Credit roll — sedih/mistis |

### 2b. Sound Effects (SFX — ~25 suara)

| Kategori | SFX | Jumlah |
|----------|-----|--------|
| Footsteps | Kayu, tanah, air | 3 |
| Doors | Creak, slam, unlock | 3 |
| Objects | Ambil item, jatuh, geser | 4 |
| Enemy | Genderuwo growl, Kuntilanak scream, Pocong hop | 5 |
| Jumpscare | Stinger keras, distorted | 2 |
| Ambient | Jangkrik, burung malam, angin, thunder | 4 |
| UI | Click, hover, error, notification | 4 |

---

## FASE 3: KODE (5 file utama)

| # | File | Fungsi | Estimasi baris |
|---|------|--------|----------------|
| K01 | engine.js | Game engine core | ~800 |
| K02 | scenes.js | Semua scene + dialog | ~1500 |
| K03 | audio.js | Audio engine + track management | ~300 |
| K04 | renderer.js | All draw calls (sprite sheet reader) | ~500 |
| K05 | main.js | Boot, menu, save, settings | ~400 |

---

## TOTAL ESTIMASI

| Kategori | Item | Ukuran |
|----------|------|--------|
| Dokumen | 4 | ~50KB |
| Sprites | 11 karakter (33 frame total) | ~2-5MB (PNG/embedded) |
| Tilesets | 6 set (50 tile varian) | ~1-2MB |
| Background | 9 scene | ~3-5MB |
| UI | 7 elemen | ~0.5-1MB |
| Audio | 8 music + 25 SFX | ~15-25MB (OGG) |
| Kode | 5 file | ~50KB |
| **Total APK** | **Semua terkompresi** | **~25-40MB** |

---

## URUTAN EKSEKUSI

Saya akan mulai dari 0a → lanjut ke setiap aset satu per satu dengan persetujuan kamu.

Setuju mulai dari **#0a: Story Bible**?