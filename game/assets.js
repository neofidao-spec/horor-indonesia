/* === ASSET GENERATOR — Procedural Pixel Art ===
   Semua sprite digenerate via Canvas, zero image files.
   Output: Asset object dengan .draw(ctx, x, y, frame, dir) methods.
   Setiap tile: 32x32, karakter proporsional.
*/

const Asset = {
  TILE: 32,
  cache: {},

  /* === COLOR PALETTE === */
  palette: {
    // Rumah indoor
    floor1: '#2a2218', floor2: '#231c13',
    wall1: '#3a2a1a', wall2: '#332418', wall3: '#2a1f14',
    door: '#4a3520', doorFrame: '#2a1a0a',
    window: '#1a1a2a', windowFrame: '#3a2a1a',

    // Makam outdoor
    ground1: '#2a2a20', ground2: '#22221a',
    grave1: '#3a3a2a', grave2: '#333325',
    fence: '#2a2a1a', tree: '#1a2a0a', treeBark: '#2a1a0a',
    path: '#3a3228',

    // Sawah
    water1: '#0a1a2a', water2: '#0d1f30',
    rice1: '#1a3a10', rice2: '#2a4a18',
    mud: '#2a2218', ritualGround: '#2a1a2a',

    // Player
    skin: '#d4a574', skinShadow: '#b89464',
    shirt: '#3a4a6a', shirtShadow: '#2a3a5a',
    pants: '#1a1a2a', pantsShadow: '#121222',
    shoes: '#2a1a0a',
    eye: '#222', eyeWhite: '#ddd',

    // Mbah
    mbahSkin: '#c49464', mbahBaju: '#ddd', mbahBajuShadow: '#bbb',
    mbahCelana: '#444', mbahRambut: '#aaa', mbahTongkat: '#5a3a1a',

    // Genderuwo
    gendBody: '#1a0a0a', gendBody2: '#221010',
    gendEye: '#f22', gendEyeGlow: 'rgba(255,34,34,0.3)',

    // Kuntilanak
    kunDress: 'rgba(200,210,230,0.7)', kunDressShadow: 'rgba(160,170,200,0.5)',
    kunSkin: 'rgba(180,190,210,0.5)', kunHair: '#0a050a',
    kunEye: '#f22',

    // Objects
    wood: '#3a2a1a', woodLight: '#4a3a2a', woodDark: '#2a1a0a',
    metal: '#666', metalLight: '#888', rust: '#844',
    paper: '#d4c8a0', fire: '#f84', fireGlow: '#fa4',
    bamboo: '#5a4a2a', bambooLight: '#6a5a3a',
  },

  /* === TILESET RENDERERS === */
  tiles: {},

  _initTiles() {
    const P = this.palette;
    const T = this.TILE;
    const S = 1; // shadow offset

    // === RUMAH TILES ===
    this.tiles['rumah-floor1'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const noise = ((r * 3 + c * 7) % 5) * 3;
          ctx.fillStyle = `rgb(${42+noise},${34+noise},${24+noise})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
      // Wood grain
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.5;
      for (let gy = 0; gy < 4; gy++) {
        ctx.beginPath();
        ctx.moveTo(x, y + gy * 8 + 4);
        ctx.lineTo(x + T, y + gy * 8 + 6 + (gy%2));
        ctx.stroke();
      }
    };

    this.tiles['rumah-floor2'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const noise = ((r * 7 + c * 3) % 5) * 3;
          ctx.fillStyle = `rgb(${35+noise},${28+noise},${19+noise})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
      // Dirtier grain
      ctx.strokeStyle = 'rgba(30,20,10,0.12)';
      ctx.lineWidth = 0.5;
      for (let gy = 0; gy < 4; gy++) {
        ctx.beginPath();
        ctx.moveTo(x, y + gy * 8 + 3);
        ctx.lineTo(x + T, y + gy * 8 + 5);
        ctx.stroke();
      }
    };

    this.tiles['rumah-wall'] = (ctx, x, y) => {
      // Vertical plank wall
      for (let plank = 0; plank < 4; plank++) {
        const px = x + plank * 8;
        const shade = plank % 2 === 0 ? '#3a2a1a' : '#332418';
        ctx.fillStyle = shade;
        ctx.fillRect(px, y, 8, T);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(px, y, 1, T);
        ctx.fillRect(px + 7, y, 1, T);
      }
      // Top beam
      ctx.fillStyle = '#2a1f14';
      ctx.fillRect(x, y, T, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x, y + 3, T, 1);
    };

    this.tiles['rumah-wall-dark'] = (ctx, x, y) => {
      this.tiles['rumah-wall'](ctx, x, y);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x, y, T, T);
    };

    this.tiles['rumah-door'] = (ctx, x, y) => {
      ctx.fillStyle = P.door;
      ctx.fillRect(x, y, T, T);
      ctx.fillStyle = P.doorFrame;
      ctx.fillRect(x, y + 2, 4, T - 4);
      ctx.fillRect(x + T - 4, y + 2, 4, T - 4);
      ctx.fillRect(x + 2, y, T - 4, 4);
      ctx.fillRect(x + 2, y + T - 4, T - 4, 4);
      // Door panel detail
      ctx.fillStyle = '#3a2818';
      ctx.fillRect(x + 6, y + 6, T - 12, 6);
      ctx.fillRect(x + 6, y + 18, T - 12, 6);
      // Handle
      ctx.fillStyle = P.metal;
      ctx.fillRect(x + T - 10, y + T/2 - 2, 6, 4);
    };

    this.tiles['rumah-window'] = (ctx, x, y) => {
      ctx.fillStyle = P.windowFrame;
      ctx.fillRect(x, y, T, T);
      ctx.fillStyle = P.window;
      ctx.fillRect(x + 3, y + 3, T - 6, T - 6);
      ctx.strokeStyle = P.windowFrame;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 3, y + 3, T - 6, T - 6);
      ctx.beginPath();
      ctx.moveTo(x + T/2, y + 3);
      ctx.lineTo(x + T/2, y + T - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 3, y + T/2);
      ctx.lineTo(x + T - 3, y + T/2);
      ctx.stroke();
      // Glass shimmer
      ctx.fillStyle = 'rgba(100,150,200,0.08)';
      ctx.fillRect(x + 5, y + 5, 8, 10);
      ctx.fillRect(x + 18, y + 18, 8, 8);
      // Crack
      ctx.strokeStyle = 'rgba(180,180,180,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + 3);
      ctx.lineTo(x + 20, y + 12);
      ctx.lineTo(x + 16, y + 18);
      ctx.stroke();
    };

    this.tiles['rumah-stairs'] = (ctx, x, y) => {
      for (let i = 0; i < 5; i++) {
        const sy = y + i * 6;
        const sw = T - i * 5;
        ctx.fillStyle = `rgb(${50 - i*4},${40 - i*4},${30 - i*4})`;
        ctx.fillRect(x + (T - sw)/2, sy, sw, 5);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + (T - sw)/2, sy, sw, 5);
      }
      // Dark above
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(x, y - 10, T, 10);
    };

    // === MAKAM TILES ===
    this.tiles['makam-ground'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const noise = ((r * 5 + c * 13) % 7) * 2;
          ctx.fillStyle = `rgb(${42+noise},${42+noise},${32+noise})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
    };

    this.tiles['makam-ground2'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const noise = ((r * 7 + c * 11) % 7) * 2;
          ctx.fillStyle = `rgb(${34+noise},${34+noise},${26+noise})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
    };

    this.tiles['makam-grave'] = (ctx, x, y) => {
      ctx.fillStyle = P.grave1;
      ctx.fillRect(x + 8, y + 8, T - 16, T - 8);
      ctx.fillStyle = P.grave2;
      ctx.fillRect(x + 10, y + 10, T - 20, 4);
      ctx.fillRect(x + 10, y + 18, T - 20, 4);
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 13, y + 4, T - 26, 6);
      // Cross
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + T/2, y + 2);
      ctx.lineTo(x + T/2, y + 10);
      ctx.moveTo(x + T/2 - 4, y + 6);
      ctx.lineTo(x + T/2 + 4, y + 6);
      ctx.stroke();
    };

    this.tiles['makam-fence'] = (ctx, x, y) => {
      ctx.fillStyle = '#2a2a1a';
      ctx.fillRect(x, y, T, T);
      // Iron bars
      ctx.fillStyle = '#444';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i * 8 + 2, y + 4, 4, T - 8);
      }
      // Horizontal bars
      ctx.fillRect(x + 2, y + 8, T - 4, 3);
      ctx.fillRect(x + 2, y + T - 12, T - 4, 3);
      // Top spike
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 8 + 2, y + 4);
        ctx.lineTo(x + i * 8 + 4, y - 2);
        ctx.lineTo(x + i * 8 + 6, y + 4);
        ctx.fill();
      }
    };

    this.tiles['makam-tree'] = (ctx, x, y) => {
      // Trunk
      ctx.fillStyle = P.treeBark;
      ctx.fillRect(x + 12, y + 16, 8, 16);
      // Foliage
      ctx.fillStyle = P.tree;
      ctx.beginPath();
      ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 8, y + 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 24, y + 16, 8, 0, Math.PI * 2);
      ctx.fill();
      // Dark overlay
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.arc(x + 16, y + 12, 12, 0, Math.PI * 2);
      ctx.fill();
    };

    // === SAWAH TILES ===
    this.tiles['sawah-water'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const wave = Math.sin(r * 0.3 + c * 0.2) * 2;
          ctx.fillStyle = `rgb(${10+wave},${26+wave},${42+wave})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
      // Reflection
      ctx.fillStyle = 'rgba(80,120,180,0.04)';
      ctx.fillRect(x + 4, y + 8, 6, 3);
      ctx.fillRect(x + 18, y + 20, 8, 2);
    };

    this.tiles['sawah-rice'] = (ctx, x, y) => {
      this.tiles['sawah-water'](ctx, x, y);
      // Rice stalks
      ctx.fillStyle = P.rice1;
      ctx.fillRect(x + 7, y + 4, 2, T - 4);
      ctx.fillRect(x + 23, y + 8, 2, T - 8);
      ctx.fillStyle = P.rice2;
      ctx.fillRect(x + 12, y + 2, 3, 6);
      ctx.fillRect(x + 20, y + 4, 3, 6);
      // Leaves
      ctx.fillStyle = 'rgba(26,58,16,0.4)';
      ctx.fillRect(x + 4, y + 16, 6, 2);
      ctx.fillRect(x + 22, y + 20, 6, 2);
    };

    this.tiles['sawah-mud'] = (ctx, x, y) => {
      for (let r = 0; r < T; r++) {
        for (let c = 0; c < T; c++) {
          const noise = ((r * 3 + c * 11) % 5) * 2;
          ctx.fillStyle = `rgb(${42+noise},${34+noise},${24+noise})`;
          ctx.fillRect(x+c, y+r, 1, 1);
        }
      }
    };

    this.tiles['sawah-ritual'] = (ctx, x, y) => {
      this.tiles['sawah-mud'](ctx, x, y);
      // Circle marking
      ctx.strokeStyle = 'rgba(139,58,58,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + T/2, y + T/2, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(139,58,58,0.2)';
      ctx.beginPath();
      ctx.arc(x + T/2, y + T/2, 6, 0, Math.PI * 2);
      ctx.stroke();
    };
  },

  /* === CHARACTER SPRITES === */
  sprites: {},

  _initSprites() {
    const P = this.palette;
    const T = this.TILE;

    // === PLAYER (16x24 px, drawn within 32x32 tile) ===
    this.sprites['player'] = (ctx, x, y, dir, frame, flashOn) => {
      const cx = x + 8, cy = y + 4;
      const f = frame || 0;
      const walkCycle = Math.sin(f * Math.PI / 2);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(cx + 8, cy + 23, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = P.shirt;
      ctx.fillRect(cx + 2, cy + 10, 12, 8);

      // Shirt shadow
      ctx.fillStyle = P.shirtShadow;
      ctx.fillRect(cx + 8, cy + 10, 6, 8);

      // Head
      ctx.fillStyle = P.skin;
      ctx.fillRect(cx + 4, cy, 8, 10);
      ctx.fillStyle = P.skinShadow;
      ctx.fillRect(cx + 8, cy, 4, 10);

      // Hair (dark brown)
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(cx + 4, cy, 8, 3);
      ctx.fillRect(cx + 3, cy + 1, 2, 4);
      ctx.fillRect(cx + 11, cy + 1, 2, 4);

      // Eyes — direction-based
      ctx.fillStyle = P.eye;
      if (dir === 'right') {
        ctx.fillRect(cx + 8, cy + 4, 3, 2);
        ctx.fillRect(cx + 8, cy + 7, 3, 2);
      } else if (dir === 'left') {
        ctx.fillRect(cx + 5, cy + 4, 3, 2);
        ctx.fillRect(cx + 5, cy + 7, 3, 2);
      } else { // front/back
        ctx.fillRect(cx + 5, cy + 4, 3, 2);
        ctx.fillRect(cx + 9, cy + 4, 3, 2);
        // Down: focus forward
        if (dir === 'down') {
          ctx.fillStyle = P.skin;
          ctx.fillRect(cx + 6, cy + 5, 1, 1);
          ctx.fillRect(cx + 10, cy + 5, 1, 1);
        }
      }

      // Legs
      const legOff = Math.round(walkCycle * 2);
      ctx.fillStyle = P.pants;
      ctx.fillRect(cx + 3, cy + 18, 5, 6 + legOff);
      ctx.fillRect(cx + 8, cy + 18, 5, 6 - legOff);

      // Shoes
      ctx.fillStyle = P.shoes;
      ctx.fillRect(cx + 3, cy + 24, 5, 2);
      ctx.fillRect(cx + 8, cy + 24, 5, 2);

      // Arms
      const armSwing = Math.round(walkCycle * 2);
      ctx.fillStyle = P.skin;
      if (dir === 'right') {
        ctx.fillRect(cx + 14, cy + 12 + armSwing, 3, 6);
        ctx.fillRect(cx - 1, cy + 12 - armSwing, 3, 6);
      } else if (dir === 'left') {
        ctx.fillRect(cx - 1, cy + 12 + armSwing, 3, 6);
        ctx.fillRect(cx + 14, cy + 12 - armSwing, 3, 6);
      } else {
        ctx.fillRect(cx - 1, cy + 12 + armSwing, 3, 6);
        ctx.fillRect(cx + 14, cy + 12 - armSwing, 3, 6);
      }

      // Flashlight beam
      if (flashOn) {
        ctx.save();
        ctx.shadowColor = '#ffd';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(255,255,200,0.03)';
        if (dir === 'right') {
          ctx.fillRect(cx + 16, cy + 10, 60, 20);
        } else if (dir === 'left') {
          ctx.fillRect(cx - 60, cy + 10, 60, 20);
        } else if (dir === 'up') {
          ctx.fillRect(cx + 4, cy - 50, 20, 60);
        } else {
          ctx.fillRect(cx + 4, cy + 30, 20, 60);
        }
        ctx.restore();
        // Flashlight item
        ctx.fillStyle = P.metalLight;
        ctx.fillRect(dir === 'left' ? cx - 2 : cx + 12, cy + 10 + (dir === 'up' ? -8 : 0), 4, 4);
        ctx.fillStyle = '#ffd';
        ctx.fillRect(dir === 'left' ? cx - 1 : cx + 13, cy + 11 + (dir === 'up' ? -8 : 0), 2, 2);
      }
    };

    // === MBAH (20x28 px) ===
    this.sprites['mbah'] = (ctx, x, y, pose) => {
      const cx = x + 6, cy = y + 2;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(cx + 10, cy + 27, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Baju
      ctx.fillStyle = P.mbahBaju;
      ctx.fillRect(cx + 2, cy + 10, 16, 12);
      ctx.fillStyle = P.mbahBajuShadow;
      ctx.fillRect(cx + 10, cy + 10, 8, 12);
      // Celana
      ctx.fillStyle = P.mbahCelana;
      ctx.fillRect(cx + 3, cy + 22, 6, 6);
      ctx.fillRect(cx + 11, cy + 22, 6, 6);
      // Kepala
      ctx.fillStyle = P.mbahSkin;
      ctx.fillRect(cx + 5, cy, 10, 10);
      // Rambut putih
      ctx.fillStyle = P.mbahRambut;
      ctx.fillRect(cx + 5, cy, 10, 3);
      ctx.fillRect(cx + 3, cy + 1, 3, 5);
      ctx.fillRect(cx + 14, cy + 1, 3, 5);
      // Mata sayu
      ctx.fillStyle = P.eye;
      ctx.fillRect(cx + 7, cy + 4, 3, 1);
      ctx.fillRect(cx + 11, cy + 4, 3, 1);
      // Mulut
      ctx.fillStyle = '#966';
      ctx.fillRect(cx + 8, cy + 8, 4, 1);
      // Tongkat
      if (pose !== 'sitting') {
        ctx.fillStyle = P.mbahTongkat;
        ctx.fillRect(cx + 18, cy + 2, 2, 26);
        ctx.fillRect(cx + 16, cy + 2, 6, 3);
      }
    };

    // === GENDERUWO (32x48 px) ===
    this.sprites['genderuwo'] = (ctx, x, y, state, frame) => {
      const cx = x, cy = y;
      const glow = state === 'chase' ? 20 : 5;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(cx + 16, cy + 48, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = P.gendEyeGlow;
      ctx.shadowBlur = glow;

      // Body
      ctx.fillStyle = P.gendBody;
      ctx.fillRect(cx + 4, cy + 16, 24, 28);

      // Shoulders
      ctx.fillStyle = P.gendBody2;
      ctx.fillRect(cx, cy + 14, 32, 10);

      // Head
      ctx.fillStyle = P.gendBody;
      ctx.fillRect(cx + 6, cy - 4, 20, 22);
      ctx.fillStyle = P.gendBody2;
      ctx.fillRect(cx + 8, cy - 2, 16, 18);

      // Eyes (red)
      ctx.fillStyle = state === 'chase' ? '#ff4444' : '#aa2222';
      ctx.fillRect(cx + 8, cy + 2, 6, 5);
      ctx.fillRect(cx + 18, cy + 2, 6, 5);
      // Pupil
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx + 9, cy + 3, 2, 3);
      ctx.fillRect(cx + 21, cy + 3, 2, 3);

      // Arms
      ctx.fillStyle = P.gendBody;
      if (state === 'chase') {
        // Reaching forward
        ctx.fillRect(cx - 6, cy + 18, 12, 8);
        ctx.fillRect(cx + 26, cy + 18, 12, 8);
      } else if (state === 'roar') {
        // Arms up
        ctx.fillRect(cx - 4, cy + 4, 8, 20);
        ctx.fillRect(cx + 28, cy + 4, 8, 20);
      } else {
        // Normal
        ctx.fillRect(cx - 4, cy + 18, 8, 16);
        ctx.fillRect(cx + 28, cy + 18, 8, 16);
      }

      // Legs
      const legSwing = Math.sin((frame || 0) * Math.PI / 2) * 3;
      ctx.fillStyle = P.gendBody2;
      ctx.fillRect(cx + 6, cy + 42, 8, 8 + legSwing);
      ctx.fillRect(cx + 18, cy + 42, 8, 8 - legSwing);

      ctx.restore();
    };

    // === KUNTILANAK (20x40 px) ===
    this.sprites['kuntilanak'] = (ctx, x, y, state, frame) => {
      const cx = x + 6, cy = y;
      const float = Math.sin((frame || 0) * 0.1) * 3;

      // No shadow (she floats)

      ctx.save();

      // Glow
      if (state === 'attack') {
        ctx.shadowColor = '#800';
        ctx.shadowBlur = 30;
      } else {
        ctx.shadowColor = '#400';
        ctx.shadowBlur = 15;
      }

      // Dress
      ctx.fillStyle = P.kunDress;
      ctx.fillRect(cx + 2, cy + 16 + float, 16, 24);

      // Dress shadow
      ctx.fillStyle = P.kunDressShadow;
      ctx.fillRect(cx + 10, cy + 16 + float, 8, 24);

      // Upper body
      ctx.fillStyle = P.kunSkin;
      ctx.fillRect(cx + 4, cy + 8 + float, 12, 12);

      // Head
      ctx.fillStyle = P.kunSkin;
      ctx.fillRect(cx + 5, cy - 2 + float, 10, 12);

      // Hair (long, covering face)
      ctx.fillStyle = P.kunHair;
      ctx.fillRect(cx + 4, cy - 4 + float, 12, 12);
      // Hair strands
      for (let i = 0; i < 5; i++) {
        const strandX = cx + 3 + i * 3;
        const strandLen = 16 + Math.sin(i * 2 + (frame || 0) * 0.1) * 4;
        ctx.fillRect(strandX, cy + 8 + float, 2, strandLen);
      }

      // Eyes (visible through hair in attack state)
      if (state === 'attack' || state === 'circling') {
        ctx.fillStyle = P.kunEye;
        ctx.fillRect(cx + 7, cy + 2 + float, 3, 3);
        ctx.fillRect(cx + 12, cy + 2 + float, 3, 3);
      }

      // Arms
      if (state === 'attack') {
        // Reaching forward
        ctx.fillStyle = P.kunSkin;
        ctx.fillRect(cx - 6, cy + 12 + float, 10, 5);
        ctx.fillRect(cx + 16, cy + 12 + float, 10, 5);
      } else {
        ctx.fillStyle = P.kunDressShadow;
        ctx.fillRect(cx - 2, cy + 14 + float, 6, 14);
        ctx.fillRect(cx + 16, cy + 14 + float, 6, 14);
      }

      // Disappear effect (low alpha for certain states)
      if (state === 'hidden') {
        ctx.globalAlpha = 0.3;
      }

      ctx.restore();
    };

    // === OBJECT SPRITES ===
    this.sprites['lemari'] = (ctx, x, y) => {
      const cx = x + 2, cy = y;
      ctx.fillStyle = P.wood;
      ctx.fillRect(cx, cy, 28, 32);
      ctx.fillStyle = P.woodDark;
      ctx.fillRect(cx + 2, cy + 4, 4, 24);
      ctx.fillRect(cx + 22, cy + 4, 4, 24);
      // Door line
      ctx.strokeStyle = P.woodDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy + 4);
      ctx.lineTo(cx + 14, cy + 28);
      ctx.stroke();
      // Handles
      ctx.fillStyle = P.metal;
      ctx.fillRect(cx + 6, cy + 14, 3, 2);
      ctx.fillRect(cx + 19, cy + 14, 3, 2);
      // Top detail
      ctx.fillStyle = P.woodLight;
      ctx.fillRect(cx, cy, 28, 3);
    };

    this.sprites['meja'] = (ctx, x, y) => {
      ctx.fillStyle = P.wood;
      ctx.fillRect(x + 2, y + 4, 28, 5);
      ctx.fillStyle = P.woodDark;
      ctx.fillRect(x + 6, y, 4, 28);
      ctx.fillRect(x + 22, y, 4, 28);
    };

    this.sprites['peti'] = (ctx, x, y) => {
      ctx.fillStyle = P.wood;
      ctx.fillRect(x + 4, y + 4, 24, 24);
      ctx.fillStyle = P.woodLight;
      ctx.fillRect(x + 4, y + 4, 24, 4);
      ctx.fillStyle = P.metal;
      ctx.fillRect(x + 12, y + 14, 8, 6);
      // Lock
      ctx.fillStyle = P.rust;
      ctx.fillRect(x + 13, y + 15, 6, 4);
    };

    this.sprites['kitab'] = (ctx, x, y) => {
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 6, y + 4, 20, 14);
      ctx.fillStyle = P.paper;
      ctx.fillRect(x + 8, y + 6, 16, 10);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(x + 6, y + 4, 4, 14);
      // Writing
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 10, y + 8, 12, 1);
      ctx.fillRect(x + 10, y + 11, 10, 1);
      ctx.fillRect(x + 10, y + 14, 8, 1);
    };

    this.sprites['senter'] = (ctx, x, y) => {
      ctx.fillStyle = P.metal;
      ctx.fillRect(x + 6, y + 4, 20, 6);
      ctx.fillStyle = P.metalLight;
      ctx.fillRect(x + 8, y + 5, 16, 4);
      ctx.fillStyle = '#444';
      ctx.fillRect(x + 6, y + 4, 3, 6);
      // Lens
      ctx.fillStyle = '#aac';
      ctx.fillRect(x + 24, y + 5, 4, 4);
    };

    this.sprites['korek'] = (ctx, x, y) => {
      ctx.fillStyle = '#a44';
      ctx.fillRect(x + 10, y + 6, 12, 8);
      ctx.fillStyle = '#666';
      ctx.fillRect(x + 10, y + 4, 12, 3);
      ctx.fillStyle = '#888';
      ctx.fillRect(x + 14, y + 3, 4, 2);
    };

    this.sprites['pancang'] = (ctx, x, y) => {
      ctx.fillStyle = P.bamboo;
      ctx.fillRect(x + 13, y, 6, 32);
      ctx.fillStyle = P.bambooLight;
      ctx.fillRect(x + 14, y + 2, 4, 28);
      // Segments
      ctx.fillStyle = P.bamboo;
      ctx.fillRect(x + 12, y + 8, 8, 2);
      ctx.fillRect(x + 12, y + 18, 8, 2);
      // Sharp top
      ctx.beginPath();
      ctx.moveTo(x + 13, y);
      ctx.lineTo(x + 16, y - 6);
      ctx.lineTo(x + 19, y);
      ctx.fill();
    };

    this.sprites['catatan'] = (ctx, x, y) => {
      ctx.fillStyle = P.paper;
      ctx.fillRect(x + 6, y + 6, 20, 16);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x + 8, y + 9, 16, 1);
      ctx.fillRect(x + 8, y + 12, 14, 1);
      ctx.fillRect(x + 8, y + 15, 10, 1);
      ctx.fillRect(x + 8, y + 18, 12, 1);
      // fold
      ctx.fillStyle = '#c4b890';
      ctx.fillRect(x + 24, y + 6, 2, 16);
    };

    this.sprites['foto'] = (ctx, x, y) => {
      // Frame
      ctx.fillStyle = P.wood;
      ctx.fillRect(x, y, 32, 32);
      ctx.fillStyle = P.woodLight;
      ctx.fillRect(x + 2, y + 2, 28, 28);
      // Photo area
      ctx.fillStyle = '#c4b8a0';
      ctx.fillRect(x + 4, y + 4, 24, 20);
      // Family silhouettes
      ctx.fillStyle = 'rgba(60,30,20,0.4)';
      ctx.fillRect(x + 7, y + 7, 6, 12);  // adult 1
      ctx.fillRect(x + 14, y + 9, 5, 10); // child 1
      ctx.fillRect(x + 20, y + 8, 5, 11); // child 2
      ctx.fillStyle = 'rgba(60,30,20,0.6)';
      ctx.fillRect(x + 14, y + 6, 5, 3);  // adult 2 head
      // Red eyes on one figure
      ctx.fillStyle = '#f22';
      ctx.fillRect(x + 23, y + 11, 2, 1);
      ctx.fillRect(x + 23, y + 14, 2, 1);
      // Glass reflection
      ctx.fillStyle = 'rgba(200,200,255,0.06)';
      ctx.fillRect(x + 6, y + 6, 8, 6);
    };

  },

  /* === DRAW HELPERS === */
  drawTile(map, tileId, ctx, x, y) {
    const key = `${map}-${tileId}`;
    const renderer = this.tiles[key];
    if (renderer) {
      renderer(ctx, x, y);
    } else {
      // Fallback — checkerboard
      ctx.fillStyle = (Math.floor(x/16) + Math.floor(y/16)) % 2 === 0 ? '#333' : '#222';
      ctx.fillRect(x, y, this.TILE, this.TILE);
    }
  },

  drawSprite(name, ctx, x, y, ...args) {
    const renderer = this.sprites[name];
    if (renderer) {
      renderer(ctx, x, y, ...args);
    }
  },

  /* === INIT — generate all assets into cache === */
  init() {
    if (Object.keys(this.tiles).length > 0) return; // already initted
    this._initTiles();
    this._initSprites();
    // Generate preview sprite sheet (for debug)
    this._generateSpriteSheet();
  },

  _generateSpriteSheet() {
    // Create a hidden canvas and render all sprites for visual check
    // Used only in dev mode
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    canvas.id = 'asset-preview';
    canvas.style.display = 'none';
    const ctx = canvas.getContext('2d');
    
    // Draw tiles
    const tileNames = Object.keys(this.tiles);
    let idx = 0;
    for (const name of tileNames.slice(0, 30)) {
      const tx = (idx % 10) * 34;
      const ty = Math.floor(idx / 10) * 34;
      ctx.strokeStyle = '#444';
      ctx.strokeRect(tx, ty, 32, 32);
      this.tiles[name](ctx, tx + 1, ty + 1);
      ctx.fillStyle = '#aaa';
      ctx.font = '6px monospace';
      ctx.fillText(name, tx, ty + 40);
      idx++;
    }
  }
};

// Auto-init
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    Asset.init();
  });
}
