# SPRITE PRODUCTION PLAN — Malam Jumat Kliwon

Berdasarkan kegagalan sebelumnya, saya tentukan dulu **semua keputusan teknis** sebelum menyentuh kode.

---

## 1. FORMAT SPRITE

### Format Final (di assets.js)
```javascript
ASSETS.sprites.player_idle_down = {
  w: 32, h: 32,
  data: ['', '', '#1a1a2e', ...]   // 1024 entries, hex string atau ''
};
```

### Alternatif: Base64 encoded
Pixel data 32x32 dengan 16 warna palette → bisa di-base64 jadi string lebih pendek.

**Keputusan**: Pakai **string array hex** (format TECH_SPEC). Tidak perlu base64 — ukuran masih masuk akal.

---

## 2. TOOL PEMBUATAN SPRITE

### Opsi A: Tulis manual IIFE di JS (sebelumnya)
- Butuh bikin utility `_set`, `_fill`, `_empty`
- Posisi pixel ditulis satu per satu
- **Kelebihan**: Tidak perlu tools eksternal
- **Kekurangan**: Rentan human error, susah dibaca, kesalahan koordinat tidak kelihatan

### Opsi B: Python generator
- Buat skrip Python yang menghasilkan JSON pixel array
- Gunakan PIL (Pillow) untuk render PNG preview
- Lebih mudah divalidasi — bisa lihat gambar
- **Kelebihan**: Visual preview, validasi otomatis, mudah mirror
- **Kekurangan**: Butuh Pillow di Termux

### Opsi C: Canvas HTML preview
- Buat HTML yang load assets.js dan render di canvas
- Tapi tetap butuh data dulu

**Keputusan**: **Opsi B** — Python generator + konversi ke JS format.

---

## 3. ALUR PRODUKSI PER SPRITE

Setiap sprite akan diproduksi dengan urutan:

1. **Tentukan spesifikasi** — ukuran, palette, pose, arah
2. **Tulis skrip Python** — generate pixel array ke file temp JSON
3. **Validasi** — render PNG preview dengan Pillow (kalau bisa)
4. **Konversi** — JSON → JS format di assets.js
5. **Verifikasi** — node check syntax + hitung filled pixels

---

## 4. DAFTAR PRIORITAS SPRITES

### Batch 1: Player (PENTING — langsung dipakai di engine)
| No | Sprite | Frame | Keterangan |
|----|--------|-------|------------|
| 1 | player_idle_down | 1 | Wajah depan (prioritas) |
| 2 | player_idle_up | 1 | Belakang |
| 3 | player_idle_left | 1 | Samping kiri |
| 4 | player_idle_right | 1 | Samping kanan |
| 5 | player_walk_down | 4 | Animasi jalan depan |
| 6 | player_walk_up | 4 | Animasi jalan belakang |
| 7 | player_walk_left | 4 | Animasi jalan kiri |
| 8 | player_walk_right | 4 | Animasi jalan kanan |

### Batch 2: NPC & Hantu
| No | Sprite | Keterangan |
|----|--------|------------|
| 9 | mbah_duduk | Mbah Karsono duduk |
| 10 | mbah_apartisi | Hantu Mbah |
| 11 | genderuwo | Musuh 1 |
| 12 | kuntilanak | Boss |
| 13 | pocong | Hantu pendukung |

### Batch 3: Item & Object
| No | Sprite | Keterangan |
|----|--------|------------|
| 14-20 | Kunci, buku, vas, cermin, boneka, lonceng, kitab |

---

## 5. PALETTE DASAR

Palette terbatas untuk menjaga konsistensi visual:

| Warna | Hex | Fungsi |
|-------|-----|--------|
| Hitam | `#0a0a0a` | Outline, sepatu |
| Dark Navy | `#1a1a2e` | Celana, bayangan |
| Navy | `#1a2a4a` | Jaket |
| Blue mid | `#2a3d6b` | Highlight jaket |
| Dark blue | `#0f1a30` | Shadow jaket |
| Skin | `#e8c97a` | Kulit |
| Skin shadow | `#d4b065` | Shadow kulit |
| Brown dark | `#2a1a0a` | Rambut |
| Brown mid | `#3d2a14` | Highlight rambut |
| Brown light | `#8a6040` | Mulut, kayu |
| White | `#e8e0d0` | Mata, highlight |
| Red dark | `#4a0a0a` | Darah, detail horor |
| Red | `#cc2222` | Mata merah hantu |

---

## 6. NEXT STEP

Sebelum eksekusi sprite pertama, saya harus setup:

1. **Buat skrip Python generator** di `tools/sprite_gen.py` — minimal: ambil grid 32x32, render PNG, output JS
2. **Coba generate sprite pertama** (player_idle_down) lewat grid
3. **Validasi visual** — lihat hasil PNG
4. **Konversi** ke assets.js
5. **Ulang** untuk sprite berikutnya

---

**Setuju mulai dari setup tool dulu?**
