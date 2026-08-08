# AUDIO DIRECTION — Malam Jumat Kliwon
## Berdasarkan STORY_BIBLE.md + TECH_SPEC.md

---

## 1. PALETTE AUDIO

### Nada Dasar
- **Scale**: Slendro (nada gamelan Jawa) untuk semua musik — memberikan identitas Indonesia yang autentik
- **BPM**: 60-80 (lambat, menekan)
- **Key**: Minor/kecurangan — dominan nada rendah, jarang naik ke oktaf tinggi

### Sumber Suara (Web Audio API):
| Sumber | Fungsi |
|--------|--------|
| `OscillatorNode` | Nada tunggal untuk SFX dasar |
| `AudioBuffer` | Sample pendek (< 5 detik) untuk jumpscare |
| `GainNode` | Volume control + fade |
| `ConvolverNode` | Reverb — ruang kosong, loteng, makam |
| `BiquadFilter` | Low-pass → suara teredam dari ruang lain |
| `DelayNode` | Gema → suasana ruang besar/kosong |

---

## 2. MUSIK BACKGROUND (BGM)

### Pendekatan: Tone Sequence
Karena tidak pakai file eksternal, musik dibuat dari sequence nada oscillator dengan pattern berulang.

### Track List:

| ID | Scene | Mood | Sequence | Durasi |
|----|-------|------|----------|--------|
| BGM-01 | Main Menu | Sunyi, mistis, penantian | 3 nada slendro pelan (bass), 10 detik jeda | loop |
| BGM-02 | Rumah Lantai 1 | Sepi, jangkrik, sesekali derit kayu | Hanya ambient — tidak ada nada | loop |
| BGM-03 | Loteng | Tegang, dingin | 1 nada tinggi ditahan (drone), nada ke-2 masuk perlahan | loop |
| BGM-04 | Kamar Wati | Sedih, berat | 2 nada bergantian (interval minor 3rd) | loop |
| BGM-05 | Makam | Sunyi, horor | Bass rendah sekali tiap 5 detik + angin | loop |
| BGM-06 | Sawah | Menekan, klimaks | Pola gamelan cepat (dissonant) | loop |
| BGM-07 | Chase (Genderuwo) | Panik | Drum+noise cepat (2 beat) — crescendo | saat chase |

### Teknik Pembuatan BGM:
```javascript
// Contoh: BGM-04 (Kamar Wati — sedih)
// Nada 1: 220Hz (A3) — tahan 4 detik
// Nada 2: 185Hz (F#3) — tahan 4 detik
// Bergantian, dengan reverb ruang kosong
function createBGM_WatiRoom(audioCtx) {
  const notes = [
    { freq: 220, dur: 4, delay: 0 },
    { freq: 185, dur: 4, delay: 4 },
  ];
  // schedule looping
}
```

---

## 3. SOUND EFFECTS (SFX)

### 3a. Lingkungan (Ambient Loop)

| ID | Suara | Teknik | Volume |
|----|-------|--------|--------|
| AMB-01 | Jangkrik | Noise filter high-frequency, pulsa 0.3s interval 2s | 20% |
| AMB-02 | Angin malam | Noise low-pass, naik turun 8s cycle | 30% |
| AMB-03 | Hujan ringan | Noise high-pass, variasi amplitude acak | 25% |
| AMB-04 | Derit kayu | Noise + oscillator 80Hz, 1x acak tiap 10-30s | 15% |
| AMB-05 | Gamelan jauh | Oscillator slendro sangat pelan dengan low-pass | 10% |

### 3b. Footsteps

| ID | Permukaan | Frekuensi | Filter |
|----|-----------|-----------|--------|
| STP-01 | Lantai kayu | 80Hz + noise impak pendek | Mid-pass |
| STP-02 | Tanah | 50Hz + noise lebih panjang | Low-pass |
| STP-03 | Papan loteng | 120Hz + creak noise | Mid-pass, tambah reverb kecil |

### 3c. Interaksi Item

| ID | Item | Suara |
|----|------|-------|
| ITM-01 | Ambil kunci | Dering logam pendek |
| ITM-02 | Buka lemari | Derit kayu + klik |
| ITM-03 | Buka buku | Gesekan kertas |
| ITM-04 | Gunting | Klik metal (gunting membuka) |
| ITM-05 | Gunting potong kain | Robekan kain |
| ITM-06 | Lonceng sapi | Dering lonceng + delay/reverb (distorted) |
| ITM-07 | Pecahan cermin | Kaca retak + jatuh |
| ITM-08 | Peti terbuka | Derit keras |

### 3d. Horor SFX

| ID | Momen | Suara | Karakteristik |
|----|-------|-------|---------------|
| HR-01 | Jumpscare umum | Stinger violin + noise burst | 400Hz → 2000Hz slide 0.1s + white noise 0.3s |
| HR-02 | Napas berat (Jump 2) | Napas noise-filtered | 3x napas, 0.5s interval, spacial kiri/kanan |
| HR-03 | Tangis bayi (Jump 3) | Baby cry oscillator | 400Hz-800Hz wobble, delay 0.3s |
| HR-04 | Scream Wati (Jump 4) | Female scream + distortion | 500Hz peaking, efek robot |
| HR-05 | Genderuwo growl (Jump 5) | Low growl + sub-bass | 60Hz, durasi 2 detik |
| HR-06 | Kuntilanak laugh | Tawa tinggi + reverb besar | 800Hz, echo 0.5s 3x |

### 3e. UI SFX

| ID | Elemen | Suara |
|----|--------|-------|
| UI-01 | Hover button | Tick pendek |
| UI-02 | Click button | Klik rendah |
| UI-03 | Error/wrong | Buzz pendek |
| UI-04 | Puzzle solved | Chord kecil (3 nada) |
| UI-05 | Save game | Tinta stempel |
| UI-06 | Item received | Dering pendek (F bell) |

---

## 4. AUDIO ARCHITECTURE

```javascript
class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    this.bgmNode = null;
    this.ambientNodes = [];
    this.currentScene = null;
    this.muted = false;
    
    this.volume = {
      master: 0.7,
      bgm: 0.5,
      sfx: 0.8,
      ambient: 0.4,
    };
  }

  // SFX generators
  playNote(freq, duration = 0.1, type = 'sine', volume = 0.3) {}
  playNoise(duration = 0.5, volume = 0.2) {}
  playFootstep(surface = 'wood') {}
  playStinger(type = 'violin') {}
  playPickup() {}
  playCreak() {}
  playScream(type = 'wanita') {}
  playGrowl() {}
  playBabyCry() {}
  
  // Ambient
  startAmbient(type) {}  // 'cricket', 'wind', 'rain'
  stopAmbient(type) {}
  
  // BGM
  playBGM(trackId) {}
  stopBGM(fadeOut = 1.0) {}
  switchBGM(trackId, fadeOut, fadeIn) {}
  
  // Scene
  setScene(sceneId) {}  // auto-set ambient + BGM sesuai scene
  
  // Controls
  setVolume(type, value) {}  // type: master/bgm/sfx/ambient
  mute() {}
  unmute() {}
  isMuted() {}
}
```

---

## 5. AUDIO MATRIX PER SCENE

| Scene | BGM | Ambient | Interactive SFX |
|-------|-----|---------|-----------------|
| Main Menu | BGM-01 | — | UI-01, UI-02 |
| Ruang Tamu | BGM-02 | AMB-01, AMB-04 | STP-01, ITM-01–03 |
| Dapur | BGM-02 | AMB-04 | STP-01 |
| Tangga | BGM-02 (crossfade) | AMB-04 + napas | STP-01 |
| Loteng biasa | BGM-03 | AMB-02, AMB-04 | STP-03, ITM-04–06 |
| Loteng altar | BGM-03 (lebih keras) | AMB-01 (slow) | STP-03, ITM-07 |
| Kamar Wati | BGM-04 | AMB-02 (tertahan) | ITM-08 |
| Makam | BGM-05 | AMB-02, AMB-03 | STP-02 |
| Makam — chase | BGM-07 | — | HR-05, STP-02 cepat |
| Sawah | BGM-06 | AMB-05 (gamelan) | STP-02, HR-06 |
| Sawah — final | BGM-06 (klimaks) | — | HR-06, HR-01 |

---

## 6. PRIORITAS IMPLEMENTASI

| Prioritas | SFX | Alasan |
|-----------|-----|--------|
| **P1** | Footsteps (3 varian) | Pemain dengar setiap langkah — paling sering |
| **P1** | UI click, error, receive | Interaksi dasar |
| **P1** | Jumpscare stinger | 5 momen kunci game |
| **P2** | Ambient loops (jangkrik, angin) | Atmosfer penting |
| **P2** | Item interaksi (lemari, buku, kunci) | Feedback mekanik |
| **P3** | BGM tracks (slendro sequences) | Meningkatkan mood — bisa ditambahkan belakangan |
| **P3** | Monster SFX (growl, scream, cry) | Momen spesifik |
| **P4** | Scene transition audio | Kosmetik |

---

## 7. IMPLEMENTASI NOTE

- **AudioContext** harus di-resume setelah interaksi pengguna (autoplay policy browser)
- Semua audio di-generate real-time — **tidak ada file eksternal**
- Untuk suara yang lebih kompleks (gamelan, tangis bayi), gunakan kombinasi oscillator + noise + filter
- Performa: maksimal 4 simultaneous Node aktif (batasi polyphony)
- Fallback: jika AudioContext gagal, game tetap jalan tanpa audio

---

*Siap lanjut ke **#1a — Character Sprites (Visual Assets)**. Setuju?*
