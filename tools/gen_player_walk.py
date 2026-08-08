#!/usr/bin/env python3
"""Generate player_walk sprites (4 arah x 4 frame = 16 sprite)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from tools.sprite_gen import Sprite

# ── Variasi langkah ──
# Tiap arah punya 4 frame: cycle 0-1-2-3
# Frame 0: kaki kiri maju
# Frame 1: sejajar (mirip idle)
# Frame 2: kaki kanan maju
# Frame 3: sejajar lagi


def build_walk_down(frame):
    """Player jalan ke bawah (menghadap kamera), frame 0-3."""
    s = Sprite(f'player_walk_down_{frame}')
    SKIN = 'SKIN'
    SHADOW = 'SKIN_S'
    
    # ── RAMBUT (sama untuk semua frame) ──
    s.fill(8, 0, 16, 2, 'HAIR')
    s.set(7, 1, 'HAIR'); s.set(24, 1, 'HAIR')
    s.set(6, 2, 'HAIR'); s.set(25, 2, 'HAIR')
    s.fill(9, 2, 14, 1, 'HAIR_H')
    for y in range(3, 7):
        s.set(5, y, 'HAIR'); s.set(26, y, 'HAIR')
    for y in range(3, 5):
        s.set(6, y, 'HAIR'); s.set(25, y, 'HAIR')
    
    # ── WAJAH ──
    s.fill(8, 3, 16, 6, SKIN)
    s.set(7, 4, SKIN); s.set(24, 4, SKIN)
    s.set(7, 5, SKIN); s.set(24, 5, SKIN)
    s.set(11, 5, 'MATA'); s.set(12, 5, 'MATA')
    s.set(19, 5, 'MATA'); s.set(20, 5, 'MATA')
    s.set(11, 4, SHADOW); s.set(19, 4, SHADOW)
    s.set(15, 6, SHADOW); s.set(16, 6, SHADOW)
    s.fill(14, 8, 4, 1, 'MULUT')
    
    # ── LEHER ──
    s.fill(13, 9, 6, 2, SKIN)
    
    # ── JAKET ──
    s.fill(9, 11, 14, 12, 'JKT')
    s.fill(10, 10, 12, 1, 'JKT')
    s.fill(11, 10, 10, 1, 'COLLAR')
    s.set(12, 9, 'COLLAR'); s.set(19, 9, 'COLLAR')
    for y in range(12, 16):
        s.set(15, y, 'JKT_H'); s.set(16, y, 'JKT_H')
    s.fill(11, 15, 3, 1, 'JKT_S')
    s.fill(18, 15, 3, 1, 'JKT_S')
    for y in range(12, 17):
        s.set(8, y, 'JKT'); s.set(23, y, 'JKT')
    s.set(8, 17, 'JKT_S'); s.set(8, 18, 'JKT_S')
    s.set(23, 17, 'JKT_S'); s.set(23, 18, 'JKT_S')
    
    # Tangan (ayun saat jalan)
    if frame == 0:
        kaki_kiri_maju = True
        ayun = -1
    elif frame == 2:
        kaki_kiri_maju = False
        ayun = 1
    else:
        ayun = 0
    
    for y in range(19, 22):
        s.set(6 + ayun, y, SKIN)  # tangan kiri
        s.set(25 - ayun, y, SKIN)  # tangan kanan
    
    # ── CELANA + KAKI ──
    s.fill(10, 22, 12, 6, 'CLN')
    s.set(9, 23, 'CLN'); s.set(22, 23, 'CLN')
    
    # Variasi kaki
    if frame == 0:
        # Kaki kiri maju (sedikit ke kiri), kanan di tempat
        s.fill(8, 26, 6, 2, 'CLN')
        s.fill(17, 28, 5, 4, 'SPT')
        s.fill(7, 28, 5, 4, 'SPT')  # kiri agak ke kiri
        s.fill(7, 31, 5, 1, 'SPT_D')
        s.fill(17, 31, 5, 1, 'SPT_D')
    elif frame == 2:
        # Kaki kanan maju
        s.fill(18, 26, 6, 2, 'CLN')
        s.fill(10, 28, 5, 4, 'SPT')
        s.fill(20, 28, 5, 4, 'SPT')  # kanan agak ke kanan
        s.fill(10, 31, 5, 1, 'SPT_D')
        s.fill(20, 31, 5, 1, 'SPT_D')
    else:
        # Frame 1,3: sejajar
        s.fill(10, 28, 5, 4, 'SPT')
        s.fill(17, 28, 5, 4, 'SPT')
        s.fill(10, 31, 5, 1, 'SPT_D')
        s.fill(17, 31, 5, 1, 'SPT_D')
    
    return s


def build_walk_up(frame):
    """Player jalan ke atas (membelakangi), frame 0-3."""
    s = Sprite(f'player_walk_up_{frame}')
    
    # RAMBUT BELAKANG
    s.fill(9, 0, 14, 3, 'HAIR')
    s.fill(8, 1, 16, 2, 'HAIR')
    s.set(7, 2, 'HAIR'); s.set(24, 2, 'HAIR')
    s.fill(10, 1, 12, 1, 'HAIR_H')
    for y in range(3, 6):
        s.set(6, y, 'HAIR'); s.set(25, y, 'HAIR')
    s.fill(12, 8, 8, 2, 'SKIN_S')
    
    # PUNGGUNG
    s.fill(9, 10, 14, 13, 'JKT')
    s.set(8, 11, 'JKT'); s.set(22, 11, 'JKT')
    for x in range(14, 18):
        s.set(x, 14, 'JKT_S'); s.set(x, 17, 'JKT_S')
    for y in range(12, 17):
        s.set(8, y, 'JKT'); s.set(23, y, 'JKT')
    s.set(8, 16, 'JKT_S'); s.set(23, 16, 'JKT_S')
    s.set(7, 17, 'SKIN_S'); s.set(7, 18, 'SKIN_S')
    s.set(24, 17, 'SKIN_S'); s.set(24, 18, 'SKIN_S')
    
    # CELANA
    s.fill(10, 23, 12, 5, 'CLN')
    
    # KAKI (variasi)
    if frame == 0:
        s.fill(8, 26, 6, 2, 'CLN')
        s.fill(7, 28, 5, 4, 'SPT'); s.fill(17, 28, 5, 4, 'SPT')
    elif frame == 2:
        s.fill(18, 26, 6, 2, 'CLN')
        s.fill(10, 28, 5, 4, 'SPT'); s.fill(20, 28, 5, 4, 'SPT')
    else:
        s.fill(10, 28, 5, 4, 'SPT'); s.fill(17, 28, 5, 4, 'SPT')
    
    return s


def build_walk_left(frame):
    """Player jalan ke kiri, frame 0-3."""
    s = Sprite(f'player_walk_left_{frame}')
    
    # RAMBUT
    s.fill(7, 1, 14, 3, 'HAIR')
    s.fill(6, 2, 16, 2, 'HAIR')
    for y in range(3, 6):
        s.set(5, y, 'HAIR')
    
    # WAJAH
    s.fill(8, 3, 12, 7, 'SKIN')
    s.set(7, 5, 'SKIN'); s.set(7, 6, 'SKIN')
    s.set(6, 6, 'SKIN')
    s.set(10, 5, 'MATA'); s.set(11, 5, 'MATA')
    s.set(9, 8, 'MULUT'); s.set(10, 8, 'MULUT')
    s.fill(11, 9, 6, 2, 'SKIN')
    
    # JAKET
    s.fill(9, 11, 12, 12, 'JKT')
    s.set(8, 12, 'JKT'); s.set(8, 13, 'JKT'); s.set(8, 14, 'JKT')
    s.fill(7, 15, 2, 4, 'JKT')
    s.fill(7, 19, 2, 2, 'JKT_S')
    s.set(6, 20, 'SKIN'); s.set(6, 21, 'SKIN')
    s.fill(20, 15, 2, 4, 'JKT')
    s.fill(20, 19, 2, 2, 'JKT_S')
    s.set(21, 20, 'SKIN'); s.set(21, 21, 'SKIN')
    
    # CELANA + KAKI
    if frame == 0:
        # Kaki kiri maju
        s.fill(8, 23, 8, 5, 'CLN')
        s.fill(18, 26, 5, 2, 'CLN')
        s.fill(7, 28, 5, 4, 'SPT'); s.fill(18, 28, 4, 4, 'SPT')
    elif frame == 2:
        # Kaki kanan maju
        s.fill(12, 23, 8, 5, 'CLN')
        s.fill(8, 26, 5, 2, 'CLN')
        s.fill(10, 28, 5, 4, 'SPT'); s.fill(17, 28, 4, 4, 'SPT')
    else:
        s.fill(10, 23, 10, 5, 'CLN')
        s.fill(10, 28, 5, 4, 'SPT'); s.fill(16, 28, 4, 4, 'SPT')
    
    return s


def build_walk_right(frame):
    """Player jalan ke kanan, frame 0-3."""
    s = Sprite(f'player_walk_right_{frame}')
    
    # RAMBUT
    s.fill(11, 1, 14, 3, 'HAIR')
    s.fill(10, 2, 16, 2, 'HAIR')
    for y in range(3, 6):
        s.set(26, y, 'HAIR')
    
    # WAJAH
    s.fill(12, 3, 12, 7, 'SKIN')
    s.set(24, 5, 'SKIN'); s.set(24, 6, 'SKIN')
    s.set(25, 6, 'SKIN')
    s.set(20, 5, 'MATA'); s.set(21, 5, 'MATA')
    s.set(21, 8, 'MULUT'); s.set(22, 8, 'MULUT')
    s.fill(15, 9, 6, 2, 'SKIN')
    
    # JAKET
    s.fill(11, 11, 12, 12, 'JKT')
    s.set(22, 12, 'JKT'); s.set(22, 13, 'JKT'); s.set(22, 14, 'JKT')
    s.fill(22, 15, 3, 4, 'JKT')
    s.fill(22, 19, 3, 2, 'JKT_S')
    s.set(24, 20, 'SKIN'); s.set(24, 21, 'SKIN')
    s.fill(10, 15, 2, 4, 'JKT')
    s.fill(10, 19, 2, 2, 'JKT_S')
    s.set(9, 20, 'SKIN'); s.set(9, 21, 'SKIN')
    
    # CELANA + KAKI
    if frame == 0:
        s.fill(16, 23, 8, 5, 'CLN')
        s.fill(8, 26, 5, 2, 'CLN')
        s.fill(12, 28, 4, 4, 'SPT'); s.fill(18, 28, 5, 4, 'SPT')
    elif frame == 2:
        s.fill(12, 23, 8, 5, 'CLN')
        s.fill(18, 26, 5, 2, 'CLN')
        s.fill(12, 28, 4, 4, 'SPT'); s.fill(17, 28, 5, 4, 'SPT')
    else:
        s.fill(12, 23, 10, 5, 'CLN')
        s.fill(12, 28, 4, 4, 'SPT'); s.fill(17, 28, 5, 4, 'SPT')
    
    return s


def build_all():
    """Build all 16 walk sprites."""
    sprites = []
    for frame in range(4):
        sprites.append(build_walk_down(frame))
        sprites.append(build_walk_up(frame))
        sprites.append(build_walk_left(frame))
        sprites.append(build_walk_right(frame))
    return sprites


if __name__ == '__main__':
    sprites = build_all()
    print(f"Membangun {len(sprites)} walk sprites...")
    
    assets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'game', 'assets.js')
    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
    os.makedirs(outdir, exist_ok=True)
    
    for s in sprites:
        # Append ke assets.js
        with open(assets_path, 'a') as f:
            f.write('\n' + s.to_js() + '\n')
        
        # Render PNG
        png_path = os.path.join(outdir, f'{s.name}.png')
        s.save_png(png_path, scale=6)
        
        print(f"  {s.name}: {s.filled_count()} px -> {png_path}")
    
    print(f"\n[OK] {len(sprites)} sprite ditulis.")
