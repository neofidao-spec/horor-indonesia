# Game Design Document — MALAM JUMAT KLIWON

## 1. PREMIS
Seorang pemuda (pemain) pulang ke desa setelah mendapat kabar Mbah Karsono — sesepuh desa — menghilang tanpa jejak. Rumah Mbah terbuka, barang-barang berserakan. Jumat Kliwon — malam di mana batas dunia manusia dan dunia roh menipis.

Pemain harus mencari tahu apa yang terjadi pada Mbah, dan menghadapi entitas-entitas yang mengintai di kegelapan.

---

## 2. ALUR CERITA (3 Babak)

### Babak 1: Rumah Mbah (Rumah Tua)
**Tujuan:** Cari petunjuk tentang lokasi Mbah
- Pemain mulai di dalam rumah Mbah yang sunyi
- Pintu depan terkunci — harus cari kunci/jalan alternatif
- **Plot points:**
  - Bertemu "hantu" Mbah yang memberi warning (scripted apparition)
  - Temukan catatan Mbah: "Saya kunci pintu. Genderuwo berkeliaran di luar. Jangan cari saya."
  - Dapatkan senter di peti (mini-puzzle: teka-teki sederhana)
  - Dapatkan kitab kuno di loteng
  - Melarikan diri melalui pintu belakang

### Babak 2: Makam Desa (Area Makam)
**Tujuan:** Cari makam Mbah di pekuburan
- Makam desa yang luas, puluhan nisan
- **Antagonis:** Genderuwo — patrol area, bisa dengar pemain
  - Jika pemain kepergok, kejar-kejaran terjadi
  - "Fight" tidak mungkin — hanya bisa lari dan sembunyi
- **Plot points:**
  - Cari 3 petunjuk yang tersebar di nisan
  - Ketemu makam Mbah — tapi ternyata kosong. Mbah belum mati saat dikubur.
  - Mbah (masih hidup) bersembunyi di gua dekat makam
  - Dialog dengan Mbah: "Kuntilanak itu siluman. Dia bunuh saya dengan kutukan — tapi saya bangkit lagi. Tubuh saya ada di dekatnya."
  - Mbah beri tugas: bakar kitab di titik ritual di sawah

### Babak 3: Sawah Terlarang
**Tujuan:** Laksanakan ritual bakar kitab
- Sawah luas di tengah malam berkabut
- **Antagonis:** Kuntilanak — entitas utama
  - Wujud: Perempuan baju putih, rambut panjang menutup muka
  - Tidak bisa dibunuh — hanya bisa diusir dengan ritual
  - Bermunculan di berbagai tempat, mengejar perlahan
- **Plot points:**
  - Temukan 5 titik pancang ritual (tiang bambu)
  - Paceklik api — bawa korek (dapat dari rumah Mbah)
  - Kuntilanak muncul berkali-kali, mengejar
  - Baca mantra dari kitab di titik pusat ritual
- **Ending:** 
  - Ritual berhasil → Kuntilanak musnah. Mbah meninggal damai. Pemain pulang.
  - Ritual gagal (HP/sanity habis) → Game over, pemain jadi bagian dari kegelapan

---

## 3. KARAKTER

### 3.1. Pemain (Protagonis)
**Nama:** [bisa diisi pemain — default: "Andika"]
**Usia:** 25 tahun
**Latar:** Pekerja kantoran di kota, pulang kampung karena kabar Mbah hilang
**Penampilan pixel:**
- Postur pemuda kurus
- Baju kemeja lengan panjang (biru pudar)
- Celana kain gelap
- Rambut pendek rapi (sedikit berantakan setelah berpetualang)
**Kepribadian:** Berani tapi waras — ketakutan wajar, bukan superhero
**Tone:** Relatable, bukan karakter aksi

**Sprite:**
- Idle: front, back, left, right (16x24 pixels)
- Walk: 4-frame animation per direction
- Special: flashlight ON state (tangan ke depan)

### 3.2. Mbah Karsono
**Usia:** ~70 tahun
**Latar:** Sesepuh desa, dukun spiritual, single sejak istri meninggal
**Penampilan pixel:**
- Kakek tua, baju putih lusuh
- Rambut putih tipis
- Bertongkat (scene makam)
- Mata sayu, suara lemah

**Peran dalam game:**
- Babak 1: muncul sebagai bayangan (apparition)
- Babak 2: ditemui di gua — memberi lore + quest
- Babak 3: rohnya muncul lagi, membimbing ritual (optional guide)

**Dialog key:**
> "Jumat Kliwon... aku sudah tahu ini akan terjadi. Kuntilanak itu... dia bukan perempuan biasa. Dia dikhianati dan dibunuh di sawah itu 20 tahun lalu, bertepatan Jumat Kliwon."

### 3.3. Kuntilanak (Antagonis Utama)
**Bentuk fisik pixel:**
- Perempuan berbaju putih lusuh
- Rambut panjang hitam menutupi wajah
- Tidak terlihat kaki (hover/ngambang)
- Efek: transparan/glow redup, garis-garis hitam

**Behaviour AI:**
- Babak 3: muncul di kejauhan, menghilang, muncul lebih dekat
- Gerakan: floating, menyusuri tanah
- Sound: tawa pecah, tangisan, bisik "Andika..."
- Jika menyentuh pemain: damage besar + sanity drop

### 3.4. Genderuwo (Antagonis Babak 2)
**Bentuk fisik pixel:**
- Tinggi besar (48x72 pixels vs player 20x28)
- Hitam pekat, hampir tidak kelihatan di gelap
- Mata merah menyala
- Bahu lebar, lengan panjang

**Behaviour AI:**
- Patrol: walk route yang sudah ditentukan
- Chase: ketika pemain terdeteksi (jarak + suara) 
  - Deteksi lebih tinggi jika senter ON
  - Lari lebih cepat dari player (tapi tidak sprint)
  - Retreat: terkena sorot senter langsung di wajah → mundur sementara
- Roar: suara berat, bikin player sanity drop

---

## 4. LOKASI / LATAR

### 4.1. Rumah Mbah (Babak 1)
**Ukuran map:** 40x24 tiles (1280x768 px)
**Tile theme:**
- Lantai kayu lapuk (coklat gelap berbagai shade)
- Dinding papan (vertikal strip, coklat tua)
- Jendela pecah (kiri atas)
- Tangga ke loteng (kanan tengah)
- Pintu depan (tengah bawah)

**Atmosfer:**
- Gelap — hanya ada cahaya bulan dari jendela
- Debu beterbangan (particle subtle)
- Krek... bunyi kayu tua tiap player bergerak

**Objects:**
- Lemari (dapat dibuka, ada surprise)
- Meja (ada catatan)
- Kitab di loteng (puzzle item)
- Foto keluarga (berisi clue)
- Peti (puzzle: kitab → senter)
- Senter (key item)
- Korek api (key item — untuk ritual Babak 3)
- Pintu belakang (exit setelah dapat senter)

### 4.2. Makam Desa (Babak 2)
**Ukuran map:** 50x37 tiles (1600x1200 px)
**Tile theme:**
- Tanah pekuburan (abu-abu gelap)
- Rumput kering (abu-abu kehijauan)
- Nisan batu (berbagai bentuk)
- Pagar besi tua (border)
- Pohon-pohon (dekorasi di pinggir)

**Atmosfer:**
- Kabut tebal (efek overlay)
- Suara jangkrik + angin
- Sesekali suara Genderuwo dari jauh

**Objects:**
- 40 nisan (3 di antaranya berisi clue)
- Gua Mbah (tersembunyi di pojok, terhalang ilusi)
- Makam kosong (plot point)

### 4.3. Sawah (Babak 3)
**Ukuran map:** 56x44 tiles (1800x1400 px)
**Tile theme:**
- Air sawah (gelap dengan efek riak)
- Padi (garis-garis hijau tipis)
- Pematang (garis coklat)
- Kabut sangat tebal

**Atmosfer:**
- Hanya suara air dan angin
- Tidak ada serangga — terlalu sunyi
- Tawa Kuntilanak intermittent

**Objects:**
- 5 pancang bambu (pickups)
- Titik ritual (lingkaran di tengah sawah)
- Api/korek (dibawa dari rumah)

---

## 5. GAME MECHANICS

### 5.1. Health System
- **HP (Nyawa):** 100 — damage dari sentuh musuh
- **Sanity (Kewarasan):** 100 — turun di gelap, melihat hantu, jumpscare
- Jika HP = 0 → mati
- Jika Sanity = 0 → sanity break (game over — jiwa hilang)
- Recovery: senter (slow sanity regen), selesai puzzle (small HP/sanity boost)

### 5.2. Flashlight / Senter
- ON/OFF toggleable
- ON: visibility lebih luas, tapi:
  - Genderuwo lebih mudah detect
  - Baterai drain (time limit for battery)
- OFF: hampir buta, tapi aman dari deteksi
- Battery: isi ulang di spot tertentu (Babak 2: makam ada power cell)

### 5.3. Stealth (Babak 2)
- Genderuwo tidak bisa melihat dalam gelap total
- Player bisa crouch? (maybe — simplify: jogging vs walking)
- Jika ketahuan: lari ke "safe zone" (terang atau ruang sempit)
- Flashlight: stun 1-2 detik

### 5.4. Puzzle
- **Lemari puzzle (Babak 1):** 
  - Lemari terkunci dengan simbol — cari kunci di meja dapur
  - Atau: teka-teki urutan bunyi (3 nada dari gramophone)
- **Peti (Babak 1):** 
  - Butuh kitab dari loteng
  - Kitab: bahasa Jawa kuno — terjemahan parsial
- **3 clue nisan (Babak 2):**
  - Nama-nama yang sudah meninggal — baca urutan sesuai tahun
  - Menunjuk ke makam yang benar

### 5.5. Ritual (Babak 3)
1. Kumpulkan 5 pancang bambu (tersebar di sawah)
2. Tancapkan di lingkaran ritual
3. Mulai baca mantra (progress bar)
4. Kuntilanak attack saat ritual berlangsung
5. Player harus tahan sampai 100%
6. Selesai → ending

---

## 6. USER INTERFACE

### 6.1. HUD
- HP bar (kiri atas)
- Sanity bar (di bawah HP)
- Item count (item/6)
- Mini-map (pojok kanan atas) — sederhana, hanya outline

### 6.2. Dialog System
- Kotak dialog di bawah
- Nama speaker di kiri
- "Tekan untuk lanjut" 
- Typewriter effect optional

### 6.3. Menu
- Start → New Game / Continue / About
- Pause → Resume / Save / Load / Quit to Title

---

## 7. AUDIO

### Sound Effects (Procedural via Web Audio)
| Sfx | Deskripsi |
|---|---|
| Footsteps | Krek kayu (indoor), desir rumput (outdoor) |
| Jumpscare | Stinger + flash putih |
| Genderuwo roar | Low freq sawtooth + noise |
| Kuntilanak laugh | High pitch, reverb |
| Pintu terbuka | Krek... |
| Angin | White noise LPF |
| Mantra | Drone + harmonics |

### Music
- Tidak ada musik terus-menerus — hanya ambient
- Music cue saat: 
  - Genderuwo chase
  - Kuntilanak appear
  - Ritual in progress (tension build)
  - Ending

---

## 8. ASSETS CHECKLIST

### Pixel Art (16x16/32x32 tiles)
- [ ] Tileset Rumah: lantai, dinding, jendela, pintu, tangga
- [ ] Tileset Makam: tanah, nisan, rumput, pagar
- [ ] Tileset Sawah: air, padi, pematang, kabut
- [ ] Player sprite: idle 4 arah, walk 4 arah x4 frame
- [ ] Mbah sprite: standing, sitting (gua)
- [ ] Genderuwo sprite: idle, walk, chase pose, roar pose
- [ ] Kuntilanak sprite: idle floating, chase floating, attack
- [ ] Object sprites: lemari, meja, peti, kitab, senter, korek, pancang bambu

### Dialog/Text
- [ ] Script Babak 1 (Rumah Tua)
- [ ] Script Babak 2 (Makam)
- [ ] Script Babak 3 (Sawah)
- [ ] 3 ending text variants

---

## 9. TIMELINE & PRIORITAS

| Fase | Deliverable | Est. |
|---|---|---|
| **Fase 0** | GDD + konsep ✅ (ini) | Done |
| **Fase 1** | Pixel art — tileset + karakter | Next |
| **Fase 2** | Engine refactor (match GDD) | |
| **Fase 3** | Scene 1: Rumah Tua — full implementation | |
| **Fase 4** | Scene 2: Makam — map, AI, stealth | |
| **Fase 5** | Scene 3: Sawah — boss, ritual | |
| **Fase 6** | Dialog scripting + audio | |
| **Fase 7** | Polish + QA + APK | |

---

*Dokumen ini live — akan diupdate seiring development.*
