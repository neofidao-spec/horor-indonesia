#!/usr/bin/env python3
"""Generate Mbah Karsono sprite.
NPC: pria tua 72 tahun, duduk di kursi dengan tongkat, sarungan + kemeja lusuh.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

def build():
    s = Sprite('mbah_duduk', 32, 32)
    
    # ── PALETTE ──
    SKIN = 'SKIN'
    SKIN_S = 'SKIN_S'
    RAMBUT = '#4a3a2a'  # uban
    RAMBUT_H = '#6a5a4a'
    BAJU = '#8a7a5a'    # kemeja lusuh coklat
    BAJU_S = '#6a5a3a'
    BAJU_H = '#aa9a7a'
    SARUNG = '#3a2a1a'  # sarung coklat tua
    SARUNG_S = '#2a1a0a'
    SARUNG_P = '#5a4a2a'  # pattern sarung
    KURSI = '#4a3020'
    KURSI_S = '#2a1a0a'
    TONGKAT = '#6a4a2a'
    TONGKAT_S = '#4a2a1a'
    MATA = '#000000'
    PUTIH = '#e0d8c8'
    
    # ── RAMBUT Uban (bawah kepala, tipis) ──
    s.fill(8, 1, 16, 2, RAMBUT)
    s.set(7, 2, RAMBUT); s.set(24, 2, RAMBUT)
    s.fill(9, 1, 14, 1, RAMBUT_H)
    for x in range(6, 9):
        s.set(x, 3, RAMBUT)
    for x in range(23, 26):
        s.set(x, 3, RAMBUT)
    
    # ── WAJAH (keriput) ──
    s.fill(8, 3, 16, 6, SKIN)
    s.set(7, 4, SKIN); s.set(24, 4, SKIN)
    
    # Mata (sayu, tua)
    s.set(11, 5, MATA); s.set(12, 5, MATA)
    s.set(19, 5, MATA); s.set(20, 5, MATA)
    # Keriput mata
    s.set(10, 4, SKIN_S); s.set(11, 4, SKIN_S)
    s.set(19, 4, SKIN_S); s.set(20, 4, SKIN_S)
    # Kantung mata
    s.set(11, 6, SKIN_S); s.set(12, 6, SKIN_S)
    s.set(19, 6, SKIN_S); s.set(20, 6, SKIN_S)
    
    # Hidung
    s.set(15, 6, SKIN_S); s.set(16, 6, SKIN_S)
    
    # Mulut (kompres, serius)
    s.fill(13, 8, 6, 1, 'MULUT')
    s.set(14, 8, '#6a4030'); s.set(15, 8, '#6a4030')
    s.set(16, 8, '#6a4030'); s.set(17, 8, '#6a4030')
    
    # Kumis tipis
    s.set(12, 7, '#6a5a4a'); s.set(13, 7, '#6a5a4a')
    s.set(17, 7, '#6a5a4a'); s.set(18, 7, '#6a5a4a')
    
    # ── LEHER ──
    s.fill(13, 9, 6, 2, SKIN)
    
    # ── BAJU KEMEJA ──
    s.fill(8, 11, 16, 9, BAJU)
    # Kerah
    s.fill(12, 10, 8, 1, BAJU_H)
    s.set(13, 9, BAJU_H); s.set(18, 9, BAJU_H)
    # Kancing
    s.set(15, 13, '#4a3a2a'); s.set(16, 13, '#4a3a2a')
    s.set(15, 16, '#4a3a2a'); s.set(16, 16, '#4a3a2a')
    # Lipatan baju
    s.fill(10, 15, 2, 1, BAJU_S)
    s.fill(20, 15, 2, 1, BAJU_S)
    
    # Lengan kiri (tangan pegang tongkat)
    s.fill(7, 12, 1, 3, BAJU)
    s.set(6, 14, BAJU)
    s.set(6, 15, BAJU_S)
    # Tangan kiri
    s.set(5, 16, SKIN); s.set(5, 17, SKIN)
    
    # Lengan kanan
    s.fill(24, 12, 1, 3, BAJU)
    s.set(25, 14, BAJU)
    s.set(25, 15, BAJU_S)
    # Tangan kanan
    s.set(26, 16, SKIN); s.set(26, 17, SKIN)
    
    # ── TONGKAT (di tangan kanan) ──
    s.line_v(27, 14, 24, TONGKAT)
    s.set(27, 14, TONGKAT_S)
    s.set(27, 24, TONGKAT_S)
    # Gagang tongkat
    s.set(27, 13, '#3a2a1a')
    s.set(26, 13, '#3a2a1a')
    
    # ── SARUNG ──
    s.fill(10, 20, 12, 8, SARUNG)
    s.set(9, 21, SARUNG); s.set(22, 21, SARUNG)
    s.set(9, 22, SARUNG); s.set(22, 22, SARUNG)
    # Pattern sarung (garis kotak)
    for y in range(21, 27):
        s.set(13, y, SARUNG_P)
        s.set(17, y, SARUNG_P)
    s.fill(11, 23, 2, 1, SARUNG_P)
    s.fill(19, 23, 2, 1, SARUNG_P)
    s.fill(11, 25, 2, 1, SARUNG_P)
    s.fill(19, 25, 2, 1, SARUNG_P)
    
    # Kaki (tersembunyi di balik sarung — hanya ujung)
    s.set(12, 28, SKIN); s.set(13, 28, SKIN)
    s.set(18, 28, SKIN); s.set(19, 28, SKIN)
    
    # ── KURSI (di belakang) ──
    # Sandaran kursi (di atas kepala)
    for x in range(4, 28):
        s.set(x, 0, KURSI)
    s.fill(4, 1, 1, 6, KURSI)
    s.fill(27, 1, 1, 6, KURSI)
    
    # Kaki kursi
    s.fill(4, 28, 2, 4, KURSI)
    s.fill(26, 28, 2, 4, KURSI)
    s.fill(4, 31, 2, 1, KURSI_S)
    s.fill(26, 31, 2, 1, KURSI_S)
    
    return s


if __name__ == '__main__':
    s = build()
    print(f"[OK] {s.name}: {s.filled_count()} pixel ({s.filled_pct():.1f}%)")
    
    assets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'game', 'assets.js')
    with open(assets_path, 'a') as f:
        f.write('\n' + s.to_js() + '\n')
    print(f"[OK] JS data ditulis ke {assets_path}")
    
    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
    png_path = os.path.join(outdir, f'{s.name}.png')
    s.save_png(png_path, scale=8)
    print(f"[OK] PNG preview: {png_path}")
