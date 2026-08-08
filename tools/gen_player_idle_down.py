#!/usr/bin/env python3
"""Generate player_idle_down sprite (Raka menghadap depan)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite, PALETTE

def build():
    s = Sprite('player_idle_down')
    
    # ── RAMBUT (baris 0-7) ──
    s.fill(8, 0, 16, 2, 'HAIR')
    s.set(7, 1, 'HAIR')
    s.set(24, 1, 'HAIR')
    s.set(6, 2, 'HAIR')
    s.set(25, 2, 'HAIR')
    s.fill(9, 2, 14, 1, 'HAIR_H')
    
    for y in range(3, 7):
        s.set(5, y, 'HAIR')
        s.set(26, y, 'HAIR')
    for y in range(3, 5):
        s.set(6, y, 'HAIR')
        s.set(25, y, 'HAIR')
    
    # ── WAJAH (baris 3-9) ──
    s.fill(8, 3, 16, 6, 'SKIN')
    s.set(7, 4, 'SKIN')
    s.set(24, 4, 'SKIN')
    s.set(7, 5, 'SKIN')
    s.set(24, 5, 'SKIN')
    
    s.set(11, 5, 'MATA')
    s.set(12, 5, 'MATA')
    s.set(19, 5, 'MATA')
    s.set(20, 5, 'MATA')
    s.set(11, 4, 'SKIN_S')
    s.set(19, 4, 'SKIN_S')
    
    s.set(15, 6, 'SKIN_S')
    s.set(16, 6, 'SKIN_S')
    s.fill(14, 8, 4, 1, 'MULUT')
    
    # ── LEHER ──
    s.fill(13, 9, 6, 2, 'SKIN')
    
    # ── JAKET ──
    s.fill(9, 11, 14, 12, 'JKT')
    s.fill(10, 10, 12, 1, 'JKT')
    s.fill(11, 10, 10, 1, 'COLLAR')
    s.set(12, 9, 'COLLAR')
    s.set(19, 9, 'COLLAR')
    
    for y in range(12, 16):
        s.set(15, y, 'JKT_H')
        s.set(16, y, 'JKT_H')
    
    s.fill(11, 15, 3, 1, 'JKT_S')
    s.fill(18, 15, 3, 1, 'JKT_S')
    
    for y in range(12, 17):
        s.set(8, y, 'JKT')
        s.set(23, y, 'JKT')
    s.set(8, 17, 'JKT_S')
    s.set(8, 18, 'JKT_S')
    s.set(23, 17, 'JKT_S')
    s.set(23, 18, 'JKT_S')
    
    for y in range(19, 22):
        s.set(7, y, 'SKIN')
        s.set(24, y, 'SKIN')
    
    # ── CELANA ──
    s.fill(10, 22, 12, 6, 'CLN')
    s.set(9, 23, 'CLN')
    s.set(22, 23, 'CLN')
    s.set(14, 23, 'CLN_H')
    s.set(17, 23, 'CLN_H')
    s.set(14, 24, 'CLN_H')
    s.set(17, 24, 'CLN_H')
    
    # ── SEPATU ──
    s.fill(10, 28, 5, 4, 'SPT')
    s.fill(17, 28, 5, 4, 'SPT')
    s.fill(10, 31, 5, 1, 'SPT_D')
    s.fill(17, 31, 5, 1, 'SPT_D')
    
    return s


if __name__ == '__main__':
    s = build()
    print(f"[OK] {s.name}: {s.filled_count()} pixel ({s.filled_pct():.1f}%)")
    
    assets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'game', 'assets.js')
    with open(assets_path, 'a') as f:
        f.write('\n' + s.to_js() + '\n')
    print(f"[OK] JS data ditulis ke {assets_path}")
    
    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
    os.makedirs(outdir, exist_ok=True)
    png_path = os.path.join(outdir, f'{s.name}.png')
    s.save_png(png_path, scale=8)
    print(f"[OK] PNG preview: {png_path}")
