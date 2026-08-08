#!/usr/bin/env python3
"""Generate player_idle_left sprite (Raka menghadap kiri)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

def build():
    s = Sprite('player_idle_left')
    
    # RAMBUT SAMPING (lebih banyak terlihat dari samping kiri)
    s.fill(7, 1, 14, 3, 'HAIR')
    s.fill(6, 2, 16, 2, 'HAIR')
    for y in range(3, 6):
        s.set(5, y, 'HAIR')
    
    # WAJAH SAMPING
    s.fill(8, 3, 12, 7, 'SKIN')
    
    # HIDUNG (moncong ke kiri)
    s.set(7, 5, 'SKIN')
    s.set(7, 6, 'SKIN')
    s.set(6, 6, 'SKIN')  # ujung hidung
    
    # MATA (samping)
    s.set(10, 5, 'MATA')
    s.set(11, 5, 'MATA')
    
    # MULUT
    s.set(9, 8, 'MULUT')
    s.set(10, 8, 'MULUT')
    
    # LEHER
    s.fill(11, 9, 6, 2, 'SKIN')
    
    # JAKET (dari samping — lebih ramping)
    s.fill(9, 11, 12, 12, 'JKT')
    s.set(8, 12, 'JKT')
    s.set(8, 13, 'JKT')
    s.set(8, 14, 'JKT')
    
    # Lengan kiri (depan, kelihatan)
    s.fill(7, 15, 2, 4, 'JKT')
    s.fill(7, 19, 2, 2, 'JKT_S')
    s.set(6, 20, 'SKIN')  # tangan
    s.set(6, 21, 'SKIN')
    
    # Lengan kanan (belakang, sebagian)
    s.fill(20, 15, 2, 4, 'JKT')
    s.fill(20, 19, 2, 2, 'JKT_S')
    s.set(21, 20, 'SKIN')
    s.set(21, 21, 'SKIN')
    
    # CELANA
    s.fill(10, 23, 10, 5, 'CLN')
    
    # SEPATU
    s.fill(10, 28, 5, 4, 'SPT')
    s.fill(16, 28, 4, 4, 'SPT')
    
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
