// ============================================================
// paint.js — the brush box. Small Canvas-2D helpers (paths,
// gradients, grain), repeating cloth/tile patterns, and the
// handful of shared effect textures (glow, spark, smoke...).
//
// Nothing here knows about the story; art-people.js and
// art-world.js build the actual pictures out of these.
// ============================================================

// ---------- style setters ----------

function fillC(ctx, c, a) { ctx.fillStyle = a === undefined ? hexStr(c) : rgba(c, a); }
function strokeC(ctx, c, w, a) {
  ctx.strokeStyle = a === undefined ? hexStr(c) : rgba(c, a);
  if (w !== undefined) ctx.lineWidth = w;
}

// stops: [[offset, colour, alpha?], ...]
function addStops(g, stops) {
  stops.forEach(s => g.addColorStop(s[0], s[2] === undefined ? hexStr(s[1]) : rgba(s[1], s[2])));
  return g;
}
function gradV(ctx, y0, y1, stops) { return addStops(ctx.createLinearGradient(0, y0, 0, y1), stops); }
function gradH(ctx, x0, x1, stops) { return addStops(ctx.createLinearGradient(x0, 0, x1, 0), stops); }
function gradL(ctx, x0, y0, x1, y1, stops) { return addStops(ctx.createLinearGradient(x0, y0, x1, y1), stops); }
function gradR(ctx, x, y, r0, r1, stops) { return addStops(ctx.createRadialGradient(x, y, r0, x, y, r1), stops); }

// ---------- paths ----------

function pPoly(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
// Smooth curve through points (Catmull-Rom converted to beziers).
function pSmooth(ctx, pts, closed, begin) {
  const n = pts.length;
  if (begin !== false) ctx.beginPath();
  const P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function pRR(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function pEll(ctx, x, y, rx, ry, rot) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, Math.PI * 2);
}
// The pointed Persian arch that runs through all the architecture:
// straight jambs up to the spring line, then two curves meeting at an apex.
function pArch(ctx, cx, baseY, w, h, springFrac, begin) {
  const x0 = cx - w / 2, x1 = cx + w / 2, top = baseY - h;
  const ys = baseY - h * (springFrac === undefined ? 0.5 : springFrac);
  if (begin !== false) ctx.beginPath();
  ctx.moveTo(x0, baseY);
  ctx.lineTo(x0, ys);
  ctx.bezierCurveTo(x0, ys - (ys - top) * 0.62, cx - w * 0.2, top + (ys - top) * 0.1, cx, top);
  ctx.bezierCurveTo(cx + w * 0.2, top + (ys - top) * 0.1, x1, ys - (ys - top) * 0.62, x1, ys);
  ctx.lineTo(x1, baseY);
  ctx.closePath();
}
function pStar(ctx, x, y, points, rOut, rIn, rot) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (rot || 0) + i * Math.PI / points, r = i % 2 === 0 ? rOut : rIn;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ---------- quick shapes ----------

function softEllipse(ctx, x, y, rx, ry, c, a) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = gradR(ctx, 0, 0, 0, rx, [[0, c, a], [0.55, c, a * 0.55], [1, c, 0]]);
  ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function glowDot(ctx, x, y, r, c, a) {
  ctx.fillStyle = gradR(ctx, x, y, 0, r, [[0, c, a], [0.4, c, a * 0.45], [1, c, 0]]);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

// ---------- texture: grain + mottling ----------
// Both draw only where the canvas already has paint ("source-atop"), so
// they can be used on sprites with transparent surroundings.

let _grainTiles = null;
function grainTiles() {
  if (_grainTiles) return _grainTiles;
  const make = v => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const c = cv.getContext("2d"), id = c.createImageData(256, 256), r = rng("grain" + v);
    for (let i = 0; i < id.data.length; i += 4) {
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      const k = r(); id.data[i + 3] = Math.floor(k * k * 255);
    }
    c.putImageData(id, 0, 0);
    return cv;
  };
  return (_grainTiles = { light: make(255), dark: make(0) });
}
function grain(ctx, x, y, w, h, alpha) {
  const t = grainTiles();
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(t.light, "repeat"); ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = alpha * 1.15;
  ctx.fillStyle = ctx.createPattern(t.dark, "repeat"); ctx.fillRect(x, y, w, h);
  ctx.restore();
}
function mottle(ctx, x, y, w, h, c, alpha, n, seed, rMin, rMax) {
  const r = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  for (let i = 0; i < n; i++) {
    const rad = r.range(rMin || 40, rMax || 160);
    softEllipse(ctx, x + r() * w, y + r() * h, rad, rad * r.range(0.4, 0.9), c, alpha * r.range(0.5, 1));
  }
  ctx.restore();
}

// ---------- repeating patterns (cloth, tile, brick) ----------

const _tiles = {};
function tileCanvas(key, w, h, paint) {
  if (_tiles[key]) return _tiles[key];
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  paint(cv.getContext("2d"), w, h);
  return (_tiles[key] = cv);
}
function pat(ctx, tile) { return ctx.createPattern(tile, "repeat"); }

// Star-and-cross tilework: eight-pointed stars on a square lattice.
function tileStars(bg, star, line, s) {
  s = s || 48;
  return tileCanvas("stars" + bg + "_" + star + "_" + line + "_" + s, s, s, (c) => {
    fillC(c, bg); c.fillRect(0, 0, s, s);
    const R = s / 2, rin = R * 0.765;
    [[R, R], [0, 0], [s, 0], [0, s], [s, s]].forEach((p, i) => {
      if (i > 0) return;                       // lattice star at the tile centre only
      pStar(c, p[0], p[1], 8, R * 0.98, rin * 0.98, Math.PI / 8);
      fillC(c, star); c.fill();
      strokeC(c, line, Math.max(1.2, s * 0.045)); c.stroke();
      pStar(c, p[0], p[1], 8, R * 0.42, R * 0.3, 0);
      fillC(c, line); c.fill();
    });
    // little diamonds in the crosses between stars
    fillC(c, line);
    [[0, 0], [s, 0], [0, s], [s, s]].forEach(p => { pStar(c, p[0], p[1], 4, s * 0.16, s * 0.07, 0); c.fill(); });
  });
}
// Ikat silk: feathered lozenges in bands, the signature Uzbek cloth.
function tileIkat(colors, seed) {
  const key = "ikat" + colors.join("_") + seed;
  return tileCanvas(key, 72, 108, (c, w, h) => {
    const r = rng(key);
    fillC(c, colors[0]); c.fillRect(0, 0, w, h);
    const motif = (cx, cy, mw, mh, col) => {
      fillC(c, col);
      for (let x = -mw / 2; x < mw / 2; x += 2) {
        const t = 1 - Math.abs(x) / (mw / 2);
        const len = mh * (0.18 + 0.82 * Math.pow(t, 0.8)) * r.range(0.86, 1.08);
        const off = r.range(-3, 3);
        c.fillRect(cx + x, cy - len / 2 + off, 2.2, len);
      }
    };
    [[w / 2, h / 2], [0, 0], [w, 0], [0, h], [w, h]].forEach(p => {
      motif(p[0], p[1], w * 0.8, h * 0.78, colors[1]);
      motif(p[0], p[1], w * 0.5, h * 0.5, colors[2]);
      motif(p[0], p[1], w * 0.22, h * 0.24, colors[3] !== undefined ? colors[3] : colors[0]);
    });
  });
}
function tileStripes(colors, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  return tileCanvas("stripes" + colors.join("_") + widths.join("_"), total, 8, (c) => {
    let x = 0;
    colors.forEach((col, i) => { fillC(c, col); c.fillRect(x, 0, widths[i], 8); x += widths[i]; });
  });
}
function tileBrick(base, mortar, bw, bh, seed) {
  const key = "brick" + base + "_" + mortar + "_" + bw + "_" + bh + (seed || "");
  return tileCanvas(key, bw * 4, bh * 4, (c, w, h) => {
    const r = rng(key);
    fillC(c, mortar); c.fillRect(0, 0, w, h);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let col = -1; col < 5; col++) {
        fillC(c, mixC(base, r.chance(0.5) ? 0xffffff : 0x000000, r.range(0, 0.12)));
        c.fillRect(col * bw + off + 1.5, row * bh + 1.5, bw - 3, bh - 3);
      }
    }
  });
}
// Small overlapping plates for lamellar armour.
function tileScales(base, edge) {
  return tileCanvas("scales" + base + "_" + edge, 14, 12, (c) => {
    fillC(c, darken(base, 0.25)); c.fillRect(0, 0, 14, 12);
    const plate = (x, y) => {
      pRR(c, x, y, 6, 9, 2.4);
      c.fillStyle = gradV(c, y, y + 9, [[0, lighten(base, 0.3)], [1, base]]); c.fill();
      strokeC(c, edge, 0.8, 0.7); c.stroke();
    };
    plate(0.5, -3); plate(7.5, -3); plate(-3, 3); plate(4, 3); plate(11, 3); plate(0.5, 9); plate(7.5, 9);
  });
}
function tileDots(bg, dot, s) {
  return tileCanvas("dots" + bg + "_" + dot + "_" + s, s, s, (c) => {
    fillC(c, bg); c.fillRect(0, 0, s, s);
    fillC(c, dot);
    pStar(c, s / 2, s / 2, 4, s * 0.2, s * 0.08, 0); c.fill();
    [[0, 0], [s, 0], [0, s], [s, s]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], s * 0.08, 0, Math.PI * 2); c.fill(); });
  });
}

// A woven rug seen from above: border bands, a field of medallions, fringe.
function paintRugTop(ctx, x, y, w, h, o) {
  o = o || {};
  const base = o.base !== undefined ? o.base : PAL.crimson, trim = o.trim !== undefined ? o.trim : PAL.gold;
  const dark = o.dark !== undefined ? o.dark : PAL.navy, pale = o.pale !== undefined ? o.pale : PAL.cream;
  // fringe
  strokeC(ctx, pale, 2, 0.9);
  for (let fy = y + 4; fy < y + h - 2; fy += 5) {
    ctx.beginPath(); ctx.moveTo(x - 9, fy); ctx.lineTo(x + 1, fy + 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - 1, fy + 1); ctx.lineTo(x + w + 9, fy); ctx.stroke();
  }
  fillC(ctx, base); ctx.fillRect(x, y, w, h);
  const b = Math.max(5, Math.min(w, h) * 0.09);
  fillC(ctx, dark); ctx.fillRect(x + b * 0.5, y + b * 0.5, w - b, h - b);
  fillC(ctx, trim); ctx.fillRect(x + b, y + b, w - b * 2, h - b * 2);
  fillC(ctx, base); ctx.fillRect(x + b * 1.4, y + b * 1.4, w - b * 2.8, h - b * 2.8);
  // medallions
  const fw = w - b * 3.6, fh = h - b * 3.6, n = Math.max(1, Math.round(fw / (fh * 1.1)));
  for (let i = 0; i < n; i++) {
    const cx = x + b * 1.8 + fw * (i + 0.5) / n, cy = y + h / 2, r = Math.min(fh * 0.44, fw / n * 0.42);
    pStar(ctx, cx, cy, 8, r, r * 0.74, Math.PI / 8); fillC(ctx, dark); ctx.fill();
    pStar(ctx, cx, cy, 4, r * 0.66, r * 0.3, 0); fillC(ctx, trim); ctx.fill();
    pStar(ctx, cx, cy, 4, r * 0.34, r * 0.16, Math.PI / 4); fillC(ctx, pale); ctx.fill();
  }
  // border beads
  fillC(ctx, pale, 0.85);
  for (let bx = x + b * 0.75; bx < x + w - b * 0.5; bx += b * 1.2) {
    ctx.fillRect(bx - 1.2, y + b * 0.68, 2.4, 2.4); ctx.fillRect(bx - 1.2, y + h - b * 0.68 - 2.4, 2.4, 2.4);
  }
  // weave shading
  ctx.fillStyle = gradV(ctx, y, y + h, [[0, 0xffffff, 0.1], [0.5, 0xffffff, 0], [1, 0x000000, 0.18]]);
  ctx.fillRect(x, y, w, h);
}

// ---------- ornaments for UI ----------

function paintDiamondRule(ctx, cx, y, w, c, a) {
  strokeC(ctx, c, 2, a === undefined ? 1 : a);
  ctx.beginPath(); ctx.moveTo(cx - w / 2, y); ctx.lineTo(cx - 16, y); ctx.moveTo(cx + 16, y); ctx.lineTo(cx + w / 2, y); ctx.stroke();
  fillC(ctx, c, a === undefined ? 1 : a);
  pStar(ctx, cx, y, 4, 9, 3.6, 0); ctx.fill();
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * (w / 2 + 5), y, 2.6, 0, Math.PI * 2); ctx.fill(); });
}
// A lacquered panel with a double gold border and star corners.
function paintPanel(ctx, x, y, w, h, o) {
  o = o || {};
  const r = o.r !== undefined ? o.r : 18;
  const top = o.top !== undefined ? o.top : 0x241c4a, bot = o.bot !== undefined ? o.bot : 0x120e2a;
  const gold = o.gold !== undefined ? o.gold : PAL.gold;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
  pRR(ctx, x, y, w, h, r); ctx.fillStyle = gradV(ctx, y, y + h, [[0, top, o.alpha || 0.96], [1, bot, o.alpha || 0.96]]); ctx.fill();
  ctx.restore();
  ctx.save();
  pRR(ctx, x, y, w, h, r); ctx.clip();
  if (o.pattern !== false) {
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = pat(ctx, tileStars(0x000000, 0xffffff, 0x000000, 44));
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = gradV(ctx, y, y + h * 0.5, [[0, 0xffffff, 0.09], [1, 0xffffff, 0]]);
  ctx.fillRect(x, y, w, h * 0.5);
  ctx.restore();
  pRR(ctx, x + 2, y + 2, w - 4, h - 4, r - 2); strokeC(ctx, gold, 3); ctx.stroke();
  pRR(ctx, x + 10, y + 10, w - 20, h - 20, Math.max(2, r - 9)); strokeC(ctx, gold, 1.2, 0.55); ctx.stroke();
  if (o.corners !== false) {
    fillC(ctx, gold);
    [[x + 10, y + 10], [x + w - 10, y + 10], [x + 10, y + h - 10], [x + w - 10, y + h - 10]].forEach(p => {
      pStar(ctx, p[0], p[1], 4, 9, 3.4, 0); ctx.fill();
    });
  }
}

// ---------- shared effect textures (kept for the whole session) ----------

function makeCommonTextures(scene) {
  const K = true;
  Tex.make(scene, "fx-glow", 256, 256, (c) => {
    c.fillStyle = gradR(c, 128, 128, 0, 128, [[0, 0xffffff, 1], [0.25, 0xffffff, 0.55], [0.6, 0xffffff, 0.14], [1, 0xffffff, 0]]);
    c.fillRect(0, 0, 256, 256);
  }, K);
  Tex.make(scene, "fx-dot", 32, 32, (c) => {
    c.fillStyle = gradR(c, 16, 16, 0, 16, [[0, 0xffffff, 1], [0.5, 0xffffff, 0.8], [1, 0xffffff, 0]]);
    c.fillRect(0, 0, 32, 32);
  }, K);
  Tex.make(scene, "fx-spark", 64, 64, (c) => {
    glowDot(c, 32, 32, 30, 0xffffff, 0.5);
    fillC(c, 0xffffff); pStar(c, 32, 32, 4, 30, 5, 0); c.fill();
    pStar(c, 32, 32, 4, 13, 4, Math.PI / 4); c.fill();
  }, K);
  Tex.make(scene, "fx-puff", 96, 96, (c) => {
    const r = rng("puff");
    for (let i = 0; i < 7; i++) glowDot(c, 48 + r.range(-16, 16), 48 + r.range(-16, 16), r.range(20, 30), 0xffffff, 0.5);
  }, K);
  Tex.make(scene, "fx-leaf", 28, 16, (c) => {
    fillC(c, 0xffffff); c.beginPath(); c.moveTo(1, 8); c.quadraticCurveTo(14, -3, 27, 8); c.quadraticCurveTo(14, 19, 1, 8); c.fill();
  }, K);
  Tex.make(scene, "fx-petal", 18, 14, (c) => {
    fillC(c, 0xffffff); c.beginPath(); c.moveTo(1, 7); c.quadraticCurveTo(7, -2, 17, 5); c.quadraticCurveTo(10, 15, 1, 7); c.fill();
  }, K);
  Tex.make(scene, "fx-shadow", 160, 64, (c) => { softEllipse(c, 80, 32, 78, 30, 0x000000, 0.62); }, K);
  Tex.make(scene, "fx-streak", 256, 10, (c) => {
    c.fillStyle = gradH(c, 0, 256, [[0, 0xffffff, 0], [0.5, 0xffffff, 1], [1, 0xffffff, 0]]);
    c.fillRect(0, 3, 256, 4);
  }, K);
  Tex.make(scene, "fx-drop", 6, 46, (c) => {
    c.fillStyle = gradV(c, 0, 46, [[0, 0xffffff, 0], [1, 0xffffff, 0.9]]); c.fillRect(1.5, 0, 3, 46);
  }, K);
  Tex.make(scene, "fx-vignette", 480, 270, (c) => {
    c.fillStyle = gradR(c, 240, 130, 110, 330, [[0, 0x000000, 0], [0.6, 0x000000, 0.18], [1, 0x000000, 0.7]]);
    c.fillRect(0, 0, 480, 270);
  }, K);
  Tex.make(scene, "fx-ray", 220, 600, (c) => {
    c.fillStyle = gradV(c, 0, 600, [[0, 0xffffff, 0.55], [1, 0xffffff, 0]]);
    c.beginPath(); c.moveTo(70, 0); c.lineTo(150, 0); c.lineTo(220, 600); c.lineTo(0, 600); c.closePath(); c.fill();
  }, K);
  Tex.make(scene, "fx-white", 8, 8, (c) => { fillC(c, 0xffffff); c.fillRect(0, 0, 8, 8); }, K);
}

// Convenience: a full-screen vignette on top of a scene.
function addVignette(scene, alpha, depth) {
  return scene.add.image(W / 2, H / 2, "fx-vignette").setDisplaySize(W, H).setAlpha(alpha === undefined ? 0.8 : alpha)
    .setDepth(depth === undefined ? 8000 : depth).setScrollFactor(0);
}
// Convenience: an additive glow sprite.
function addGlow(scene, x, y, size, color, alpha) {
  return scene.add.image(x, y, "fx-glow").setDisplaySize(size, size).setTint(color).setAlpha(alpha === undefined ? 0.6 : alpha)
    .setBlendMode(Phaser.BlendModes.ADD);
}
