#!/usr/bin/env python3
"""Generate Mbah Apparition sprite.
Hantu Mbah Karsono — transparan, melayang, pointing.
Palette lebih pucat/kelabu dengan efek tembus pandang (banyak transparan).
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

def build():
    s = Sprite('mbah_apparition', 32, 32)
    
    # Palette hantu (pucat, kebiru-abuan)
    KULIT = '#c8c0b0'
    KULIT_S = '#a8a090'
    RAMBUT = '#5a5a5a'
    BAJU = '#6a7a7a'    # baju hantu kumal
    BAJU_S = '#4a5a5a'
    SARUNG = '#4a4a3a'
    SARUNG_P = '#3a3a2a'
    MATA = '#000000'
    MATA_H = '#88ccff'  # mata bercahaya
    CAHAYA = '#4488aa'  # efek glow
    
    # ── GLOW (lingkaran luar samar) ──
    s.set(15, 3, CAHAYA); s.set(16, 3, CAHAYA)
    s.set(14, 4, CAHAYA); s.set(17, 4, CAHAYA)
    s.set(13, 5, CAHAYA); s.set(18, 5, CAHAYA)
    s.set(13, 6, CAHAYA); s.set(18, 6, CAHAYA)
    
    # ── RAMBUT (tipis, uban, kusut) ──
    s.fill(8, 2, 16, 1, RAMBUT)
    s.fill(9, 1, 14, 1, RAMBUT)
    s.set(7, 3, RAMBUT); s.set(24, 3, RAMBUT)
    for y in range(3, 6):
        s.set(6, y, RAMBUT); s.set(25, y, RAMBUT)
        s.set(7, y, RAMBUT); s.set(24, y, RAMBUT)
    
    # ── WAJAH (pucat, keriput, seram) ──
    s.fill(8, 3, 16, 6, KULIT)
    
    # Mata (terbuka lebar, bercahaya)
    s.set(11, 5, MATA); s.set(12, 5, MATA)
    s.set(19, 5, MATA); s.set(20, 5, MATA)
    s.set(11, 4, MATA_H); s.set(12, 4, MATA_H)  # sorot biru
    s.set(19, 4, MATA_H); s.set(20, 4, MATA_H)
    # Lingkaran hitam mata
    s.set(10, 4, KULIT_S); s.set(11, 4, '#000000')
    s.set(19, 4, '#000000'); s.set(20, 4, KULIT_S)
    s.set(11, 5, '#000000'); s.set(12, 5, '#000000')
    s.set(19, 5, '#000000'); s.set(20, 5, '#000000')
    # Celah biru tipis
    s.set(12, 4, '#4488cc'); s.set(20, 4, '#4488cc')
    
    # Kantung mata hitam
    s.set(11, 6, '#3a3a3a'); s.set(12, 6, '#3a3a3a')
    s.set(19, 6, '#3a3a3a'); s.set(20, 6, '#3a3a3a')
    
    # Hidung
    s.set(15, 6, KULIT_S); s.set(16, 6, KULIT_S)
    
    # Mulut (terbuka, gelap)
    s.fill(13, 8, 6, 2, '#1a0a0a')
    s.set(14, 8, '#000000'); s.set(15, 8, '#000000')
    s.set(16, 8, '#000000'); s.set(17, 8, '#000000')
    
    # ── LEHER ──
    s.fill(13, 10, 6, 1, KULIT)
    s.set(13, 11, KULIT); s.set(14, 11, KULIT)
    s.set(18, 11, KULIT); s.set(19, 11, KULIT)
    
    # ── BAJU (robek, melayang) ──
    s.fill(9, 12, 14, 8, BAJU)
    # Bagian bawah tidak rata (seperti robek)
    s.set(8, 14, BAJU); s.set(8, 15, BAJU)
    s.set(22, 14, BAJU); s.set(22, 15, BAJU)
    s.fill(8, 18, 2, 2, BAJU)
    s.fill(22, 18, 2, 2, BAJU)
    # Robekan
    s.set(12, 19, ''); s.set(13, 19, '')
    s.set(18, 19, ''); s.set(19, 19, '')
    
    # Kerah baju
    s.fill(12, 11, 8, 1, BAJU_S)
    s.set(13, 10, BAJU_S); s.set(18, 10, BAJU_S)
    
    # ── Tangan kiri (nunjuk ke depan) ──
    s.fill(5, 14, 2, 2, BAJU)
    s.fill(4, 16, 2, 2, BAJU)
    s.set(4, 14, BAJU)
    # Jari nunjuk
    s.set(3, 18, KULIT)
    s.set(3, 19, KULIT)
    s.set(4, 19, KULIT)
    
    # Tangan kanan (samping)
    s.fill(24, 15, 2, 2, BAJU)
    s.set(25, 17, BAJU)
    s.set(25, 18, KULIT)
    s.set(25, 19, KULIT)
    
    # ── SARUNG (bawah, robek) ──
    s.fill(10, 20, 12, 6, SARUNG)
    s.set(9, 21, SARUNG); s.set(22, 21, SARUNG)
    # Pattern
    for y in range(21, 25):
        s.set(13, y, SARUNG_P)
        s.set(17, y, SARUNG_P)
    s.fill(11, 23, 2, 1, SARUNG_P)
    s.fill(19, 23, 2, 1, SARUNG_P)
    
    # Kaki (melayang — tidak menyentuh tanah)
    s.set(12, 26, KULIT); s.set(13, 26, KULIT)
    s.set(18, 26, KULIT); s.set(19, 26, KULIT)
    # Kaki memanjang ke bawah
    s.fill(12, 27, 2, 3, KULIT)
    s.fill(18, 27, 2, 3, KULIT)
    
    # ── EFEK KABUT (beberapa pixel transparan di pinggir) ──
    for x in range(5, 27):
        s.set(x, 0, CAHAYA)
        s.set(x, 31, '#446688')
    
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
