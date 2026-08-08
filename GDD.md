# GAME DESIGN DOCUMENT — Malam Jumat Kliwon
## Berdasarkan STORY_BIBLE.md

---

## 1. GENRE & TARGET

| Aspek | Detail |
|-------|--------|
| **Genre** | Point-and-click horror adventure, teka-teki observasi |
| **Perspektif** | Side-scroller 2D pixel art |
| **Platform** | Android (WebView), PC (HTML) |
| **Target durasi** | 1.5 - 2 jam |
| **Rating** | 17+ (horor, kekerasan ringan, jumpscare) |
| **Bahasa** | Indonesia (dialog, UI, petunjuk) |

---

## 2. GAMEPLAY FLOW

```
MAIN MENU
  │
  ├─ [Start New Game]
  │    └─ BABAK 1: Rumah Lantai 1
  │         ├─ Eksplorasi ruang tamu, dapur, kamar
  │         ├─ Teka-teki 1: Lemari Terkunci
  │         ├─ Jump 1: Wajah di jendela
  │         ├─ Teka-teki 2: Surat Warisan
  │         ├─ Jump 2: Tangga loteng
  │         └─ Pintu loteng terbuka
  │              └─ BABAK 2: Loteng [...]
  │
  ├─ [Continue] — load dari save
  ├─ [Settings] — volume, bahasa, credits
  └─ [Credits]
```

---

## 3. SISTEM INTI

### 3a. Eksplorasi (Point & Click / Tap)

- Pemain **tap kiri/kanan** di layar untuk berjalan
- Tap pada object interaktif → muncul ikon **tangan** + deskripsi
- Tap pada pintu/lorong → pindah scene
- Kamera follow player (side-scroll)
- Setiap ruangan punya batas area — tidak free roam penuh

### 3b. Item & Inventory

- **Inventory bar** di bagian bawah layar (6 slot)
- Item didapat dari: observasi, teka-teki, pemberian scene
- Item bisa **digunakan** pada hotspot tertentu
- Beberapa item adalah **clue** (dibaca, dilihat) — bukan digunakan

**Daftar Item:**
| Item | Diperoleh | Fungsi |
|------|-----------|--------|
| Senter touch | Awal game (ada di tangan) | Sumber cahaya, penerangan |
| Baterai cadangan | Lemari lantai 1 | Ganti senter bila habis |
| Kunci gembok | Vas bunga | Buka lemari ruang tamu |
| Koran kliping | Lemari (dalam) | Clue timeline |
| Kotak perhiasan | Lemari (dalam) | Berisi jepit rambut |
| Jepit rambut merah | Kotak perhiasan | Jimat anti hantu |
| Buku catatan Mbah K | Lemari (dalam) | Baca clue loteng |
| Gunting | Dapur | Buka jahitan boneka |
| Pecahan cermin | Loteng | Lihat halusinasi |
| Boneka kain | Loteng (dalam peti) | Berisi petunjuk ritual |
| Lonceng sapi | Loteng | Deteksi hantu |
| Kitab ritual | Loteng (dinding) | Mantra pengusiran |
| Halaman robek | Peti kamar Wati | Pelengkap kitab |
| Buku harian Wati | Peti kamar Wati | Cerita + mantra lengkap |
| Tulang bayi | Makam | Kunci ritual final |

### 3c. Daya Senter (Resource Management)

- **Senter**: baterai habis ~5 menit penggunaan kontinyu
- **Mode hemat**: senter redup (lebih lama 2x) — tapi bayangan musuh lebih sulit terlihat
- **Mode terang**: terang penuh — boros baterai
- Baterai cadangan: hanya **2** di seluruh game
- Baterai habis total → gelap total → **musuh muncul lebih agresif** (tapi tidak auto-death)

### 3d. Sanity (Atmosfer)

- **Visual degradation** makin lama di area gelap (tidak wajib, hanya efek atmosfer)
  - Step 1: grain/noise di pinggir layar
  - Step 2: bayangan gerak di pinggir
  - Step 3: distorsi ringan
- Pulih saat berada di area terang (lampu ruangan)
- Tidak ada sistem sanity numeric — murni visual gradual

### 3e. Stealth

Hanya terjadi **1 kali** di Babak 4:
- Genderuwo patrol area makam
- Pemain harus **diam di balik pohon/makam** sampai Genderuwo pergi
- Jika bergerak → teriak Genderuwo → pemain kembali ke checkpoint scene
- Indikator: monitor gerakan (layar getar ringan saat Genderuwo dekat)

---

## 4. TEKA-TEKI DETAIL

### TT1: "Lemari Terkunci" (B1)
- **Tipe**: Eksplorasi → observasi → ambil kunci
- **Cara**: Cari 3 clue di ruang tamu → temukan lokasi kunci (vas bunga)
- **Salah**: Tidak ada penalty — clue tetap terlihat
- **Benar**: Lemari terbuka → dapat item + scene trigger

### TT2: "Surat Warisan" (B1)
- **Tipe**: Eksplorasi item
- **Cara**: Cari di dalam lemari → baca setiap item → trigger pindah ke loteng
- **Trigger**: Pemain harus membaca **koran** dan **buku catatan**

### TT3: "Altar Terpendam" (B2)
- **Tipe**: Observasi — cari 3 benda di loteng
- **Cara**:
  1. Cari cermin retak → lihat dari sudut tertentu → dapat angka/kode
  2. Cari boneka kain → gunakan **gunting** (dari dapur B1) → sobekan kertas
  3. Cari lonceng sapi → goyang → suara tangis bayi menunjuk arah dinding
- **Salah**: Tidak ada — cuma perlu urutan benar
- **Benar**: Bisa baca coretan aksara Jawa di dinding (petunjuk ke dinding palsu)

### TT4: "Buku Ritual" (B2)
- **Tipe**: Eksplorasi tersembunyi
- **Cara**: Cari papan longgar di dinding loteng (dengan senter, ada goresan tipis)
- **Dapat**: Kitab ritual + foto Mbah Karsono dan Wati hamil

### TT5: "Simpul Ingatan" (B3)
- **Tipe**: Simbolik — urutan kronologis
- **Cara**: 3 tali di gagang pintu — atur posisi sesuai 3 tahap:
  1. Simpul longgar (Wati senang, awal kerja)
  2. Simpul setengah (Wati hamil — rahasia)
  3. Simpul kencang (Wati dikurung — sedih)
- **Salah**: Suara tangis + tawa — tali reset
- **Verifikasi**: Setelah benar, pintu terbuka otomatis

### TT6: "Peti Wati" (B3)
- **Tipe**: Observasi — kombinasi angka (3 digit)
- **Clue**:
  - Digit 1: Sudut retakan cermin yang menunjuk ke angka (dilihat dari tempat tidur)
  - Digit 2: Tanggal kematian Wati (dari koran di lantai kamar)
  - Digit 3: Jumlah jepit rambut di kotak perhiasan (3)

### TT7: "Makam Tak Bertanda" (B4)
- **Tipe**: Eksplorasi lingkungan
- **Cara**: Cari perbedaan visual di area makam:
  - Pohon randu (1 pohon di antara makam)
  - Tanah lebih gelap
  - Sensor berdiri di titik tepat → trigger audio (tangis bayi)
- **Trigger stealth**: Muncul Genderuwo setelah tanah digali

### TT8: "Tulang Bayi" (B4)
- **Tipe**: Narasi — baca buku harian Wati
- **Cara**: Setelah selamat dari Genderuwo, baca buku harian yang sudah didapat dari TT6
- **Isi**: Mantra lengkap + petunjuk ritual di sawah

### TT9: "Ritual Penutupan" (B5)
- **Tipe**: Multi-tahap
- **Titik 1**: Letakkan tulang di lingkaran batu
- **Titik 2**: Hadapi Kuntilanak muncul jauh → tap di titik air berputar
- **Titik 3**: Hadapi Genderuwo chase (geser ke kiri/kanan menghindar) sampai pohon bambu
- **Final**: Tap di kuburan di titik 3 → baca mantra → **diam 10 detik** saat Kuntilanak di depan wajah

---

## 5. JUMPSCARE SCHEDULE

| No | Lokasi | Trigger | Visual | Audio |
|----|--------|---------|--------|-------|
| J1 | B1 — Jendela ruang tamu | Ambil kunci dari vas | Wajah ibu di kaca (0.5s) + sidik jari basah | Stinger violin + glass crack |
| J2 | B1 — Tangga loteng | Dekati tangga | Layar padam 1 detik + napas berat di belakang | Breath + static |
| J3 | B2 — Boneka loteng | Gunakan gunting di boneka | Kepala boneka menoleh 180° | Creaking boneka + stinger |
| J4 | B3 — Kamar Wati (setelah buka pintu) | Pintu terbuka | Sosok duduk → berbalik → wajah hancur (0.5s) → gelap | Scream + reverberasi |
| J5 | B4 — Makam | Gali tanah | Genderuwo muncul langsung dari atas | Bass drop + growl |

---

## 6. SCENE LIST & TRANSITIONS

| Scene | Lokasi | Entry dari | Exit ke |
|-------|--------|-----------|---------|
| S01 | Ext. Jalan Desa (cinematic) | — | S02 (auto) |
| S02 | Int. Rumah — Ruang Tamu | S01 / S08 | S03, S04, S05 |
| S03 | Int. Rumah — Dapur | S02 | S02 (kembali) |
| S04 | Int. Rumah — Kamar Tidur | S02 | S02 (kembali) |
| S05 | Int. Rumah — Tangga | S02 | S06 (loteng) / S08 (lantai 2) |
| S06 | Int. Loteng | S05 | S02 (turun) |
| S07 | Int. Loteng — Altar Area | S06 | S06 |
| S08 | Int. Lantai 2 — Koridor | S05 | S09, S02 |
| S09 | Int. Kamar Wati | S08 | S08 |
| S10 | Ext. Makam | S02 (keluar pintu belakang) | S11 |
| S11 | Ext. Makam — Area Wati | S10 | S10 |
| S12 | Ext. Sawah Larangan | S11 | — |

---

## 7. SYSTEM REQUIREMENTS

### Android
- **Min**: Android 8 (Oreo), RAM 2GB
- **Storage**: ~40MB
- **Layar**: Minimal 5" (720p dianjurkan)

### Web (development)
- Browser modern (Chrome, Firefox, Edge)
- JavaScript ES6+
- Canvas 2D

---

*Siapkan dokumen selanjutnya: **#0c Technical Spec** atau revisi GDD dulu?*
