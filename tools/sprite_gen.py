#!/usr/bin/env python3
"""
sprite_gen.py — Pixel art sprite generator untuk Malam Jumat Kliwon.

Fungsi:
  - Buat pixel grid 32x32
  - Set pixel berdasarkan koordinat (x, y) dengan warna dari palette
  - Convert ke format JS: { w: 32, h: 32, data: [...] }
  - Bisa render PNG preview (4x scale)

Cara pakai:
  python3 tools/sprite_gen.py
  -> interactive (akan diminta menggambar)
  
  Atau import dari skrip generator sprite:
  from tools.sprite_gen import Sprite, Palette, export_js

Palette standar game:
  SKIN, SKIN_S, HAIR, HAIR_H, JKT, JKT_H, JKT_S,
  CLN, CLN_H, SPT, SPT_D, MULUT, MATA, DARAH
"""

import json
import os

# ── Palette standar ──────────────────────────────────────────
PALETTE = {
    # Nama warna, Hex, Alias
    'HITAM':      '#0a0a0a',
    'SKIN':       '#e8c97a',
    'SKIN_S':     '#d4b065',
    'HAIR':       '#2a1a0a',
    'HAIR_H':     '#3d2a14',  # highlight
    'JKT':        '#1a2a4a',
    'JKT_H':      '#2a3d6b',
    'JKT_S':      '#0f1a30',
    'CLN':        '#1a1a2e',
    'CLN_H':      '#2a2a44',
    'SPT':        '#0a0a0a',
    'SPT_D':      '#222222',
    'COLLAR':     '#2a4a6b',
    'MULUT':      '#8a6040',
    'MATA':       '#000000',
    'PUTIH':      '#e8e0d0',
    'DARAH':      '#4a0a0a',
    'MERAH':     '#cc2222',
    'KAYU':       '#6b4423',
    'KAYU_S':     '#4a2e15',
    'KAYU_H':     '#8a5e3a',
    'BATU':       '#5a5a5a',
    'BATU_S':     '#3a3a3a',
    'HIJAU':      '#2a4a1a',
    'HIJAU_S':    '#1a3a0a',
    'HIJAU_H':    '#4a6a3a',
    'KUNING':     '#ccaa22',
    'ORANGE':     '#cc6622',
    'BIRU':       '#2244aa',
    'UNGU':       '#4a2a6a',
    'COKLAT':     '#5a3a1a',
    'ABU':        '#8a8a8a',
    'ABU_S':      '#5a5a5a',
    'PINK':       '#cc88aa',
    'CYAN':       '#22aaaa',
    'TRANSPARAN': '',
}


class Sprite:
    """Pixel art sprite 32x32."""

    SIZE = 32

    def __init__(self, name, w=SIZE, h=SIZE):
        self.name = name
        self.w = w
        self.h = h
        self.pixels = ['' for _ in range(w * h)]

    def set(self, x, y, color_name):
        """Set pixel di (x,y) dengan nama warna dari PALETTE.
        color_name '' (kosong) = transparan (delete pixel)."""
        if 0 <= x < self.w and 0 <= y < self.h:
            if not color_name:
                self.pixels[y * self.w + x] = ''
                return
            color = PALETTE.get(color_name, color_name)
            self.pixels[y * self.w + x] = color

    def fill(self, x, y, w, h, color_name):
        """Fill rectangle. color_name '' (kosong) = transparan (skip)."""
        if not color_name:
            return  # transparan, nothing to set
        color = PALETTE.get(color_name, color_name)
        for row in range(y, y + h):
            for col in range(x, x + w):
                self.pixels[row * self.w + col] = color

    def line_v(self, x, y_start, y_end, color_name):
        """Garis vertikal."""
        for y in range(y_start, y_end + 1):
            self.set(x, y, color_name)

    def line_h(self, y, x_start, x_end, color_name):
        """Garis horizontal."""
        for x in range(x_start, x_end + 1):
            self.set(x, y, color_name)

    def rect(self, x, y, w, h, color_name):
        """Outline rectangle (tidak diisi)."""
        self.line_h(y, x, x + w - 1, color_name)
        self.line_h(y + h - 1, x, x + w - 1, color_name)
        self.line_v(x, y, y + h - 1, color_name)
        self.line_v(x + w - 1, y, y + h - 1, color_name)

    def mirror_x(self, src_x, src_y, w, h, dst_x, dst_y=None):
        """Mirror horizontal dari area ke posisi lain."""
        if dst_y is None:
            dst_y = src_y
        for row in range(h):
            for col in range(w):
                sx = src_x + col
                sy = src_y + row
                dx = dst_x + (w - 1 - col)
                dy = dst_y + row
                if 0 <= sx < self.w and 0 <= sy < self.h and 0 <= dx < self.w and 0 <= dy < self.h:
                    self.pixels[dy * self.w + dx] = self.pixels[sy * self.w + sx]

    def copy_area(self, src_x, src_y, w, h, dst_x, dst_y):
        """Copy area persegi ke posisi lain."""
        for row in range(h):
            for col in range(w):
                sx = src_x + col
                sy = src_y + row
                dx = dst_x + col
                dy = dst_y + row
                if all(0 <= v < self.w for v in (sx, dx)) and all(0 <= v < self.h for v in (sy, dy)):
                    self.pixels[dy * self.w + dx] = self.pixels[sy * self.w + sx]

    def filled_count(self):
        return sum(1 for p in self.pixels if p != '')

    def filled_pct(self):
        total = self.w * self.h
        return (self.filled_count() / total) * 100

    def to_dict(self):
        return {'w': self.w, 'h': self.h, 'data': self.pixels}

    def to_js(self, var_name=None):
        """Export ke JS format."""
        name = var_name or self.name
        # Format data sebagai array JSON
        data_json = json.dumps(self.pixels)
        return f"""ASSETS.sprites.{name} = {{
  w: {self.w}, h: {self.h},
  data: {data_json}
}};"""

    def render_png(self, scale=4, palette_map=None):
        """Render PNG preview."""
        from PIL import Image
        if palette_map is None:
            # Parse PALETTE untuk PIL
            def parse_color(hex_str):
                if not hex_str or hex_str == '':
                    return (0, 0, 0, 0)  # transparan
                h = hex_str.lstrip('#')
                r = int(h[0:2], 16)
                g = int(h[2:4], 16)
                b = int(h[4:6], 16)
                return (r, g, b, 255)

        img = Image.new('RGBA', (self.w * scale, self.h * scale), (0, 0, 0, 0))
        for idx, color in enumerate(self.pixels):
            if not color:
                continue
            x = (idx % self.w) * scale
            y = (idx // self.w) * scale
            r, g, b = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)
            for dy in range(scale):
                for dx in range(scale):
                    img.putpixel((x + dx, y + dy), (r, g, b, 255))
        return img

    def save_png(self, path, scale=4):
        img = self.render_png(scale)
        img.save(path)
        return path


class SpriteGrid:
    """Multiple sprites dalam satu grid untuk preview."""

    def __init__(self, cols=1):
        self.cols = cols
        self.sprites = []

    def add(self, sprite):
        self.sprites.append(sprite)

    def render(self, scale=4, padding=2):
        from PIL import Image
        total = len(self.sprites)
        cols = min(self.cols, total)
        rows = (total + cols - 1) // cols
        sw = self.sprites[0].w if self.sprites else 32
        sh = self.sprites[0].h if self.sprites else 32
        pw = sw * scale
        ph = sh * scale

        img_w = cols * pw + (cols - 1) * padding
        img_h = rows * ph + (rows - 1) * padding
        img = Image.new('RGBA', (img_w, img_h), (0, 0, 0, 0))

        for idx, spr in enumerate(self.sprites):
            col = idx % cols
            row = idx // cols
            ox = col * (pw + padding)
            oy = row * (ph + padding)

            for pix_idx, color in enumerate(spr.pixels):
                if not color:
                    continue
                px = (pix_idx % spr.w) * scale + ox
                py = (pix_idx // spr.w) * scale + oy
                r, g, b = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)
                for dy in range(scale):
                    for dx in range(scale):
                        img.putpixel((px + dx, py + dy), (r, g, b, 255))
        return img


def export_js(sprites, filepath, var_name=None):
    """Export list of sprites ke file assets.js append mode.
    
    Args:
        sprites: list of Sprite objects
        filepath: path ke assets.js
        var_name: optional override nama variable
    """
    lines = []
    for s in sprites:
        lines.append(s.to_js(var_name))
        lines.append('')
    
    with open(filepath, 'a') as f:
        f.write('\n'.join(lines))
    
    return len(sprites)


def rebuild_assets_header(filepath):
    """Tulis ulang header assets.js kosong dengan ASSETS object."""
    content = """// ============================================================
// ASSET DATA — Malam Jumat Kliwon
// Auto-generated dari tools/sprite_gen.py
// Jangan edit manual — gunakan generator!
// ============================================================

const ASSETS = {
  sprites: {},

  _empty: (w, h) => new Array(w * h).fill(''),

  _set: (arr, x, y, w, color) => { arr[y * w + x] = color; },

  _fill: (arr, x, y, w, h, stride, color) => {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        arr[row * stride + col] = color;
      }
    }
  },
};

"""
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"[OK] Header ditulis ke {filepath}")


# ── Quick test ──────────────────────────────────────────────
if __name__ == '__main__':
    print("=== SPRITE GENERATOR TOOLKIT ===")
    print(f"Palette: {len(PALETTE)} warna")
    
    # Test: buat sprite contoh
    s = Sprite('test')
    s.fill(0, 0, 32, 32, 'SKIN')
    s.fill(4, 4, 8, 8, 'JKT')
    print(f"Test sprite '{s.name}': {s.filled_count()} pixel terisi ({s.filled_pct():.1f}%)")
    print(f"JS export:\n{s.to_js()}")
    
    outdir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'output')
    os.makedirs(outdir, exist_ok=True)
    png_path = os.path.join(outdir, 'test_sprite.png')
    s.save_png(png_path)
    print(f"PNG preview: {png_path}")
    print("\nToolkit siap digunakan.")
