#!/usr/bin/env python3
"""Generate player_idle_right sprite (Raka menghadap kanan)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

def build():
    s = Sprite('player_idle_right')
    
    # RAMBUT SAMPING KANAN
    s.fill(11, 1, 14, 3, 'HAIR')
    s.fill(10, 2, 16, 2, 'HAIR')
    for y in range(3, 6):
        s.set(26, y, 'HAIR')
    
    # WAJAH SAMPING KANAN
    s.fill(12, 3, 12, 7, 'SKIN')
    
    # HIDUNG (moncong ke kanan)
    s.set(24, 5, 'SKIN')
    s.set(24, 6, 'SKIN')
    s.set(25, 6, 'SKIN')
    
    # MATA
    s.set(20, 5, 'MATA')
    s.set(21, 5, 'MATA')
    
    # MULUT
    s.set(21, 8, 'MULUT')
    s.set(22, 8, 'MULUT')
    
    # LEHER
    s.fill(15, 9, 6, 2, 'SKIN')
    
    # JAKET
    s.fill(11, 11, 12, 12, 'JKT')
    s.set(22, 12, 'JKT')
    s.set(22, 13, 'JKT')
    s.set(22, 14, 'JKT')
    
    # Lengan kanan (depan)
    s.fill(22, 15, 3, 4, 'JKT')
    s.fill(22, 19, 3, 2, 'JKT_S')
    s.set(24, 20, 'SKIN')
    s.set(24, 21, 'SKIN')
    
    # Lengan kiri (belakang)
    s.fill(10, 15, 2, 4, 'JKT')
    s.fill(10, 19, 2, 2, 'JKT_S')
    s.set(9, 20, 'SKIN')
    s.set(9, 21, 'SKIN')
    
    # CELANA
    s.fill(12, 23, 10, 5, 'CLN')
    
    # SEPATU
    s.fill(12, 28, 4, 4, 'SPT')
    s.fill(17, 28, 5, 4, 'SPT')
    
    return s


if __name__ == '__main__':
    s = build()
    print(f"[OK] {s.name}: {s.filled_count()} pixel ({s.filled_pct():.1f}%)")
    
    assets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'game', 'assets.js')
    with open(assets_path, 'a') as f:
        f.write('\n' + s.to_js() + '\n')
    print(f"[OK] JS data ditulis ke {assets_path}")
    
    png_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output', f'{s.name}.png')
    s.save_png(png_path, scale=8)
    print(f"[OK] PNG preview: {png_path}")
