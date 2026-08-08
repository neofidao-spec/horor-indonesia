#!/usr/bin/env python3
"""Generate player_idle_up sprite (Raka membelakangi)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

def build():
    s = Sprite('player_idle_up')
    
    # RAMBUT BELAKANG (puncak kepala + samping)
    s.fill(9, 0, 14, 3, 'HAIR')
    s.fill(8, 1, 16, 2, 'HAIR')
    s.set(7, 2, 'HAIR')
    s.set(24, 2, 'HAIR')
    s.fill(10, 1, 12, 1, 'HAIR_H')
    
    for y in range(3, 6):
        s.set(6, y, 'HAIR')
        s.set(25, y, 'HAIR')
    
    # TENGKUK (warna kulit lebih gelap karena bayangan)
    s.fill(12, 8, 8, 2, 'SKIN_S')
    
    # PUNGGUNG (jaket dari belakang)
    s.fill(9, 10, 14, 13, 'JKT')
    s.set(8, 11, 'JKT')
    s.set(22, 11, 'JKT')
    
    # Lipatan punggung
    for x in range(14, 18):
        s.set(x, 14, 'JKT_S')
    for x in range(14, 18):
        s.set(x, 17, 'JKT_S')
    
    # Lengan kiri
    for y in range(12, 17):
        s.set(8, y, 'JKT')
    s.set(8, 16, 'JKT_S')
    
    # Lengan kanan
    for y in range(12, 17):
        s.set(23, y, 'JKT')
    s.set(23, 16, 'JKT_S')
    
    # Tangan
    s.set(7, 17, 'SKIN_S')
    s.set(7, 18, 'SKIN_S')
    s.set(24, 17, 'SKIN_S')
    s.set(24, 18, 'SKIN_S')
    
    # CELANA
    s.fill(10, 23, 12, 5, 'CLN')
    
    # SEPATU
    s.fill(10, 28, 5, 4, 'SPT')
    s.fill(17, 28, 5, 4, 'SPT')
    
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
