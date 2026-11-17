// ============================================================
// art-world.js — the painted world: skies, distant skylines,
// Timurid architecture (portals, ribbed domes, minarets, walls),
// mud-brick houses, trees, market stalls and street props, the
// horse, and the flying carpet itself.
//
// Every painter draws at (cx, baseY) = the middle of where the
// thing touches the ground, in neutral daylight colours. Scenes
// tint the finished sprites for dusk or night.
// ============================================================

// ---------- sky ----------

function paintSky(ctx, w, h, stops) {
  ctx.fillStyle = gradV(ctx, 0, h, stops);
  ctx.fillRect(0, 0, w, h);
}
function paintStars(ctx, w, h, n, seed, maxA) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = Math.pow(r(), 1.5) * h, s = r.range(0.7, 2.3), a = r.range(0.25, maxA || 1);
    fillC(ctx, r.chance(0.2) ? 0xffe2b0 : 0xffffff, a);
    ctx.beginPath(); ctx.arc(x, y, s, 0, 6.2832); ctx.fill();
    if (s > 1.9) glowDot(ctx, x, y, s * 5, 0xffffff, a * 0.3);
  }
}
function paintMoon(ctx, x, y, r, o) {
  o = o || {};
  glowDot(ctx, x, y, r * 4.4, o.glow !== undefined ? o.glow : 0xa9c0ff, 0.26);
  glowDot(ctx, x, y, r * 2.1, 0xffffff, 0.28);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
  ctx.fillStyle = gradR(ctx, x - r * 0.35, y - r * 0.35, r * 0.1, r * 1.25, [[0, 0xfffdf3], [1, o.tint !== undefined ? o.tint : 0xe4d9bb]]);
  ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip();
  const rr = rng("moon");
  for (let i = 0; i < 9; i++) softEllipse(ctx, x + rr.range(-0.7, 0.7) * r, y + rr.range(-0.7, 0.7) * r, rr.range(0.1, 0.3) * r, rr.range(0.08, 0.22) * r, 0xa89a7c, 0.3);
  ctx.restore();
}
function paintSun(ctx, x, y, r, c) {
  glowDot(ctx, x, y, r * 6, c, 0.3);
  glowDot(ctx, x, y, r * 2.4, 0xffffff, 0.45);
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832);
  ctx.fillStyle = gradR(ctx, x, y, r * 0.1, r, [[0, 0xffffff], [1, lighten(c, 0.5)]]); ctx.fill();
}
// A soft cumulus with a flattish base. (x,y) = centre of the base.
function paintCloud(ctx0, x0, y0, w, h, c, seed, o) {
  // Painted on its own canvas first: the soft-base cut below must not
  // erase whatever is already on the target (the sky).
  const cw = Math.ceil(w * 1.4), ch = Math.ceil(h * 2.8);
  const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
  const ctx = cv.getContext("2d"), x = cw / 2, y = ch * 0.86;
  paintCloudRaw(ctx, x, y, w, h, c, seed, o);
  ctx0.drawImage(cv, x0 - x, y0 - y);
}
function paintCloudRaw(ctx, x, y, w, h, c, seed, o) {
  o = o || {};
  const r = rng(seed), n = 5 + Math.floor(w / 80);
  const lit = o.lit !== undefined ? o.lit : lighten(c, 0.35);
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, k = Math.sin(Math.PI * t);
      const rad = h * (0.3 + 0.55 * k) * r.range(0.82, 1.18);
      const cx = x - w / 2 + w * t + r.range(-10, 10), cy = y - rad * 0.62;
      ctx.beginPath(); ctx.arc(cx, cy - (pass ? rad * 0.14 : 0), rad * (pass ? 0.86 : 1), 0, 6.2832);
      ctx.fillStyle = pass ? gradV(ctx, cy - rad, cy + rad * 0.4, [[0, lit, 0.95], [1, lit, 0]]) : hexStr(c);
      ctx.fill();
    }
  }
  ctx.save(); ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradV(ctx, y - h * 0.12, y + h * 0.3, [[0, 0x000000, 0], [0.6, 0x000000, 1]]);
  ctx.fillRect(x - w, y - h * 0.12, w * 2, h * 2);
  ctx.restore();
}

// ---------- silhouettes (far layers, flights, the title) ----------

function silDome(ctx, cx, baseY, r, drumH) {
  const top = baseY - drumH - r * 1.5;
  ctx.moveTo(cx - r * 0.74, baseY);
  ctx.lineTo(cx - r * 0.74, baseY - drumH);
  ctx.bezierCurveTo(cx - r * 1.2, baseY - drumH - r * 0.5, cx - r * 0.78, baseY - drumH - r * 1.18, cx, top);
  ctx.bezierCurveTo(cx + r * 0.78, baseY - drumH - r * 1.18, cx + r * 1.2, baseY - drumH - r * 0.5, cx + r * 0.74, baseY - drumH);
  ctx.lineTo(cx + r * 0.74, baseY);
  ctx.closePath();
  return top;
}
function silMinaret(ctx, cx, baseY, w, h) {
  ctx.moveTo(cx - w / 2, baseY); ctx.lineTo(cx - w * 0.36, baseY - h * 0.8);
  ctx.lineTo(cx - w * 0.6, baseY - h * 0.82); ctx.lineTo(cx - w * 0.6, baseY - h * 0.86); ctx.lineTo(cx - w * 0.32, baseY - h * 0.86);
  ctx.lineTo(cx - w * 0.32, baseY - h * 0.94);
  ctx.quadraticCurveTo(cx - w * 0.4, baseY - h * 0.99, cx, baseY - h * 1.04);
  ctx.quadraticCurveTo(cx + w * 0.4, baseY - h * 0.99, cx + w * 0.32, baseY - h * 0.94);
  ctx.lineTo(cx + w * 0.32, baseY - h * 0.86); ctx.lineTo(cx + w * 0.6, baseY - h * 0.86); ctx.lineTo(cx + w * 0.6, baseY - h * 0.82);
  ctx.lineTo(cx + w * 0.36, baseY - h * 0.8); ctx.lineTo(cx + w / 2, baseY);
  ctx.closePath();
  return baseY - h * 1.04;
}
// One strip of city: boxes, domes, minarets, portals, poplars. Tiles
// horizontally because nothing crosses the left/right edge.
//   o: seed, color, color2, minH, maxH, baseH, lights, finial, trees, gap
function paintSkyline(ctx, w, baseY, o) {
  const r = rng(o.seed), col2 = o.color2 !== undefined ? o.color2 : o.color;
  const fill = gradV(ctx, baseY - o.maxH * 1.3, baseY + 30, [[0, o.color], [1, col2]]);
  const lights = [], tips = [];
  ctx.fillStyle = fill;
  const baseH = o.baseH || 24;
  ctx.beginPath(); ctx.rect(0, baseY - baseH, w, baseH + 400); ctx.fill();
  for (let x = 0; x < w; x += 22) { if (r.chance(0.62)) ctx.fillRect(x, baseY - baseH - 7, 12, 8); }
  let x = r.range(6, 40);
  while (x < w - 70) {
    const roll = r(), sc = o.scale || 1;
    ctx.beginPath();
    let ww;
    if (roll < 0.36) {
      ww = r.range(60, 150) * sc; const hh = r.range(o.minH, o.maxH * 0.62);
      if (x + ww > w - 6) break;
      ctx.rect(x, baseY - hh, ww, hh);
      if (r.chance(0.5)) for (let m = x + 4; m < x + ww - 10; m += 18) ctx.rect(m, baseY - hh - 7, 10, 8);
      lights.push([x, baseY - hh, ww, hh]);
    } else if (roll < 0.6) {
      const rad = r.range(34, 72) * sc; ww = rad * 2.2;
      if (x + ww > w - 6) break;
      const body = r.range(o.minH * 0.6, o.maxH * 0.45);
      ctx.rect(x, baseY - body, ww, body);
      const top = silDome(ctx, x + ww / 2, baseY - body, rad, rad * 0.34);
      tips.push([x + ww / 2, top]);
      lights.push([x, baseY - body, ww, body]);
    } else if (roll < 0.74) {
      ww = r.range(20, 30) * sc; const hh = r.range(o.maxH * 0.7, o.maxH);
      if (x + ww * 1.4 > w - 6) break;
      const top = silMinaret(ctx, x + ww * 0.7, baseY, ww, hh);
      tips.push([x + ww * 0.7, top]); ww *= 1.4;
    } else if (roll < 0.86) {
      ww = r.range(110, 170) * sc; const hh = r.range(o.maxH * 0.5, o.maxH * 0.74);
      if (x + ww > w - 6) break;
      ctx.rect(x, baseY - hh, ww, hh);
      ctx.rect(x - 5, baseY - hh - 12, 16, 12); ctx.rect(x + ww - 11, baseY - hh - 12, 16, 12);
      ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.globalAlpha = 0.5;
      pArch(ctx, x + ww / 2, baseY, ww * 0.5, hh * 0.78, 0.55); ctx.fill(); ctx.restore();
      ctx.fillStyle = fill; ctx.beginPath();
    } else {
      ww = 0; const n = o.trees === false ? 0 : r.int(1, 3);
      for (let i = 0; i < n; i++) {
        const tw = r.range(16, 26) * sc, th = r.range(o.maxH * 0.4, o.maxH * 0.8);
        if (x + ww + tw > w - 6) break;
        ctx.ellipse(x + ww + tw / 2, baseY - th / 2, tw / 2, th / 2, 0, 0, 6.2832); ctx.closePath();
        ww += tw + 5;
      }
    }
    ctx.fill();
    x += ww + r.range(o.gap ? o.gap[0] : 8, o.gap ? o.gap[1] : 60);
  }
  if (o.finial !== undefined) {
    tips.forEach(t => {
      strokeC(ctx, o.finial, 2.4); ctx.beginPath(); ctx.moveTo(t[0], t[1] + 2); ctx.lineTo(t[0], t[1] - 20); ctx.stroke();
      fillC(ctx, o.finial); ctx.beginPath(); ctx.arc(t[0], t[1] - 10, 3.6, 0, 6.2832); ctx.arc(t[0], t[1] - 21, 2.6, 0, 6.2832); ctx.fill();
    });
  }
  if (o.lights) {
    lights.forEach(b => {
      const n = Math.floor(b[2] * b[3] / 5200 * r.range(0.3, 1.2));
      for (let i = 0; i < n; i++) {
        const lx = b[0] + r.range(8, b[2] - 14), ly = b[1] + r.range(12, Math.max(14, b[3] - 20));
        glowDot(ctx, lx + 3, ly + 5, 20, 0xffb85a, 0.28 * o.lights);
        fillC(ctx, 0xffcf7a, 0.9 * o.lights); pArch(ctx, lx + 3, ly + 11, 7, 12, 0.5); ctx.fill();
      }
    });
  }
}
// Mountain / dune ridge.  o: seed, color, color2, amp, rough, snow
function paintRidge(ctx, w, baseY, o) {
  const r = rng(o.seed), pts = [], n = o.n || 14;
  const ph = [r() * 6.3, r() * 6.3, r() * 6.3];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = t * 6.2832;      // whole sine cycles, so the strip tiles
    let y = Math.sin(a + ph[0]) * 0.5 + Math.sin(a * 2 + ph[1]) * 0.3 + Math.sin(a * 3 + ph[2]) * 0.2;
    if (o.rough) y += (i % 2 ? 1 : -1) * o.rough * r.range(0.4, 1);
    pts.push([t * w, baseY - o.amp * (0.55 + 0.45 * y)]);
  }
  ctx.beginPath(); ctx.moveTo(0, baseY + 400); ctx.lineTo(pts[0][0], pts[0][1]);
  if (o.sharp) pts.forEach(p => ctx.lineTo(p[0], p[1]));
  else for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  ctx.lineTo(w, baseY + 400); ctx.closePath();
  ctx.fillStyle = gradV(ctx, baseY - o.amp, baseY + 40, [[0, o.color], [1, o.color2 !== undefined ? o.color2 : o.color]]);
  ctx.fill();
  if (o.snow !== undefined) {
    ctx.save(); ctx.clip();
    ctx.fillStyle = gradV(ctx, baseY - o.amp, baseY - o.amp * 0.5, [[0, o.snow, 0.95], [1, o.snow, 0]]);
    ctx.fillRect(0, baseY - o.amp * 1.1, w, o.amp * 0.7);
    ctx.restore();
  }
  return pts;
}

// ---------- architecture ----------

// Ribbed, bulbous dome on a tiled drum.  r = radius of the widest point.
function paintDome(ctx, cx, baseY, r, o) {
  o = o || {};
  const col = o.color !== undefined ? o.color : PAL.turquoise, drum = o.drum !== undefined ? o.drum : PAL.clay;
  const dh = r * (o.drumH || 0.42), by = baseY - dh;
  // drum
  ctx.fillStyle = gradH(ctx, cx - r * 0.76, cx + r * 0.76, [[0, lighten(drum, 0.12)], [0.5, drum], [1, darken(drum, 0.28)]]);
  ctx.fillRect(cx - r * 0.76, by, r * 1.52, dh);
  ctx.save(); ctx.beginPath(); ctx.rect(cx - r * 0.76, by + dh * 0.22, r * 1.52, dh * 0.42); ctx.clip();
  ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, PAL.turquoise, 40), r / 150); ctx.fillRect(cx - r, by, r * 2, dh);
  ctx.fillStyle = gradH(ctx, cx - r * 0.76, cx + r * 0.76, [[0, 0xffffff, 0.12], [0.5, 0x000000, 0], [1, 0x000000, 0.35]]); ctx.fillRect(cx - r, by, r * 2, dh);
  ctx.restore();
  strokeC(ctx, OL(drum), 2.2); ctx.strokeRect(cx - r * 0.76, by, r * 1.52, dh);
  // dome
  const top = by - r * 1.52;
  const shape = () => {
    ctx.beginPath(); ctx.moveTo(cx - r * 0.7, by);
    ctx.bezierCurveTo(cx - r * 1.22, by - r * 0.46, cx - r * 0.8, by - r * 1.2, cx, top);
    ctx.bezierCurveTo(cx + r * 0.8, by - r * 1.2, cx + r * 1.22, by - r * 0.46, cx + r * 0.7, by);
    ctx.closePath();
  };
  shape();
  ctx.fillStyle = gradH(ctx, cx - r, cx + r, [[0, lighten(col, 0.34)], [0.38, col], [1, darken(col, 0.42)]]); ctx.fill();
  ctx.save(); shape(); ctx.clip();
  for (let i = -4; i <= 4; i++) {                     // ribs
    const k = i / 4.6;
    strokeC(ctx, i < 0 ? 0xffffff : 0x000000, 2, i < 0 ? 0.2 : 0.22);
    ctx.beginPath(); ctx.moveTo(cx + k * r * 0.72, by);
    ctx.bezierCurveTo(cx + k * r * 1.18, by - r * 0.5, cx + k * r * 0.74, by - r * 1.2, cx, top); ctx.stroke();
  }
  softEllipse(ctx, cx - r * 0.38, by - r * 0.86, r * 0.2, r * 0.36, 0xffffff, 0.34);
  ctx.fillStyle = gradV(ctx, by - r * 0.3, by, [[0, 0x000000, 0], [1, 0x000000, 0.3]]); ctx.fillRect(cx - r * 1.2, by - r * 0.3, r * 2.4, r * 0.3);
  ctx.restore();
  shape(); strokeC(ctx, OL(col), 2.4); ctx.stroke();
  // finial
  const gold = o.gold !== undefined ? o.gold : PAL.gold;
  strokeC(ctx, darken(gold, 0.3), 3.4); ctx.beginPath(); ctx.moveTo(cx, top + 4); ctx.lineTo(cx, top - r * 0.42); ctx.stroke();
  fillC(ctx, gold);
  [[0.1, 0.085], [0.24, 0.06], [0.36, 0.04]].forEach(p => { ctx.beginPath(); ctx.arc(cx, top - r * p[0], Math.max(2.4, r * p[1]), 0, 6.2832); ctx.fill(); });
  return top - r * 0.42;
}

// Tapering minaret with tile bands, a corbelled balcony and a lantern.
function paintMinaret(ctx, cx, baseY, w, h, o) {
  o = o || {};
  const col = o.color !== undefined ? o.color : PAL.clay;
  const tw = w * 0.7, topY = baseY - h * 0.8;
  const shaft = () => { ctx.beginPath(); ctx.moveTo(cx - w / 2, baseY); ctx.lineTo(cx - tw / 2, topY); ctx.lineTo(cx + tw / 2, topY); ctx.lineTo(cx + w / 2, baseY); ctx.closePath(); };
  shaft();
  ctx.fillStyle = gradH(ctx, cx - w / 2, cx + w / 2, [[0, lighten(col, 0.16)], [0.45, col], [1, darken(col, 0.34)]]); ctx.fill();
  ctx.save(); shaft(); ctx.clip();
  ctx.fillStyle = patS(ctx, tileBrick(col, darken(col, 0.18), 16, 8, "min"), 0.9); ctx.globalAlpha = 0.28; ctx.fillRect(cx - w, topY, w * 2, h); ctx.globalAlpha = 1;
  const bands = o.bands || [0.2, 0.5, 0.74];
  bands.forEach((t, i) => {
    const y = baseY - h * 0.8 * t, bh = w * (i === 1 ? 0.62 : 0.34);
    ctx.fillStyle = patS(ctx, i === 1 ? tileStars(PAL.lapis, PAL.cream, PAL.turquoise, 40) : tileStripes([PAL.turquoise, PAL.cream, PAL.lapis, PAL.cream], [10, 3, 10, 3]), w / 110);
    ctx.fillRect(cx - w, y - bh, w * 2, bh);
    fillC(ctx, PAL.cream, 0.9); ctx.fillRect(cx - w, y - bh - 2.5, w * 2, 2.5); ctx.fillRect(cx - w, y, w * 2, 2.5);
  });
  ctx.fillStyle = gradH(ctx, cx - w / 2, cx + w / 2, [[0, 0xffffff, 0.14], [0.4, 0x000000, 0], [1, 0x000000, 0.42]]); ctx.fillRect(cx - w, topY, w * 2, h);
  ctx.restore();
  shaft(); strokeC(ctx, OL(col), 2.2); ctx.stroke();
  // balcony (muqarnas corbel)
  const bw = tw * 1.7;
  ctx.beginPath(); ctx.moveTo(cx - tw / 2, topY + w * 0.1); ctx.lineTo(cx - bw / 2, topY - w * 0.22); ctx.lineTo(cx - bw / 2, topY - w * 0.42); ctx.lineTo(cx + bw / 2, topY - w * 0.42); ctx.lineTo(cx + bw / 2, topY - w * 0.22); ctx.lineTo(cx + tw / 2, topY + w * 0.1); ctx.closePath();
  ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, lighten(col, 0.2)], [1, darken(col, 0.36)]]); ctx.fill(); strokeC(ctx, OL(col), 2); ctx.stroke();
  fillC(ctx, PAL.lapis); ctx.fillRect(cx - bw / 2, topY - w * 0.4, bw, w * 0.1);
  // lantern
  const lw = tw * 0.82, ly = topY - w * 0.42, lh = h * 0.1;
  ctx.fillStyle = gradH(ctx, cx - lw / 2, cx + lw / 2, [[0, lighten(col, 0.16)], [1, darken(col, 0.34)]]); ctx.fillRect(cx - lw / 2, ly - lh, lw, lh);
  strokeC(ctx, OL(col), 2); ctx.strokeRect(cx - lw / 2, ly - lh, lw, lh);
  fillC(ctx, 0x1a1420, 0.8); [-0.26, 0.26].forEach(k => { pArch(ctx, cx + k * lw, ly - 2, lw * 0.26, lh * 0.74, 0.5); ctx.fill(); });
  const capR = lw * 0.6;
  ctx.beginPath(); ctx.moveTo(cx - capR, ly - lh);
  ctx.bezierCurveTo(cx - capR * 1.15, ly - lh - capR * 0.7, cx - capR * 0.5, ly - lh - capR * 1.3, cx, ly - lh - capR * 1.7);
  ctx.bezierCurveTo(cx + capR * 0.5, ly - lh - capR * 1.3, cx + capR * 1.15, ly - lh - capR * 0.7, cx + capR, ly - lh); ctx.closePath();
  const dc = o.dome !== undefined ? o.dome : PAL.turquoise;
  ctx.fillStyle = gradH(ctx, cx - capR, cx + capR, [[0, lighten(dc, 0.3)], [1, darken(dc, 0.4)]]); ctx.fill(); strokeC(ctx, OL(dc), 2); ctx.stroke();
  fillC(ctx, PAL.gold); ctx.beginPath(); ctx.arc(cx, ly - lh - capR * 1.82, Math.max(2.6, w * 0.07), 0, 6.2832); ctx.fill();
  ctx.fillRect(cx - 1.2, ly - lh - capR * 2.3, 2.4, capR * 0.5);
}

// The great portal (pishtaq): a tiled frame around a deep pointed niche.
function paintPortal(ctx, cx, baseY, w, h, o) {
  o = o || {};
  const col = o.color !== undefined ? o.color : PAL.clay, x0 = cx - w / 2, top = baseY - h;
  ctx.fillStyle = gradH(ctx, x0, x0 + w, [[0, lighten(col, 0.14)], [0.5, col], [1, darken(col, 0.24)]]);
  ctx.fillRect(x0, top, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, top, w, h); ctx.clip();
  ctx.fillStyle = patS(ctx, tileBrick(col, darken(col, 0.16), 22, 10, "portal"), 1); ctx.globalAlpha = 0.3; ctx.fillRect(x0, top, w, h); ctx.globalAlpha = 1;
  // tiled frame
  const fw = w * 0.11;
  ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, PAL.turquoise, 40), w / 520);
  ctx.fillRect(x0 + fw * 0.5, top + fw * 0.5, w - fw, fw); ctx.fillRect(x0 + fw * 0.5, top + fw * 0.5, fw, h); ctx.fillRect(x0 + w - fw * 1.5, top + fw * 0.5, fw, h);
  // inscription band
  fillC(ctx, PAL.lapis); ctx.fillRect(x0 + fw * 1.7, top + fw * 1.75, w - fw * 3.4, fw * 0.6);
  strokeC(ctx, PAL.cream, Math.max(1.6, w * 0.006), 0.9); ctx.lineCap = "round";
  const rr = rng("insc" + w);
  for (let x = x0 + fw * 2; x < x0 + w - fw * 2.2; x += w * 0.035) {
    ctx.beginPath(); ctx.moveTo(x, top + fw * 2.2); ctx.quadraticCurveTo(x + rr.range(2, 9), top + fw * rr.range(1.8, 2.0), x + w * 0.02, top + fw * rr.range(1.9, 2.25)); ctx.stroke();
  }
  // niche
  const nw = w * 0.56, nh = h * 0.7;
  pArch(ctx, cx, baseY, nw, nh, 0.52);
  ctx.fillStyle = gradV(ctx, baseY - nh, baseY, [[0, darken(col, 0.5)], [1, darken(col, 0.68)]]); ctx.fill();
  ctx.save(); pArch(ctx, cx, baseY, nw, nh, 0.52); ctx.clip();
  ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.turquoise, PAL.gold, 40), w / 600); ctx.globalAlpha = 0.5; ctx.fillRect(cx - nw / 2, baseY - nh, nw, nh * 0.42); ctx.globalAlpha = 1;
  ctx.fillStyle = gradH(ctx, cx - nw / 2, cx + nw / 2, [[0, 0x000000, 0.5], [0.3, 0x000000, 0.05], [1, 0x000000, 0.3]]); ctx.fillRect(cx - nw / 2, baseY - nh, nw, nh);
  ctx.restore();
  pArch(ctx, cx, baseY, nw, nh, 0.52); strokeC(ctx, PAL.cream, Math.max(2, w * 0.012)); ctx.stroke();
  pArch(ctx, cx, baseY, nw * 1.07, nh * 1.045, 0.52); strokeC(ctx, PAL.turquoise, Math.max(2, w * 0.01)); ctx.stroke();
  // door
  const dw = nw * 0.44, dhh = nh * 0.5;
  pArch(ctx, cx, baseY, dw, dhh, 0.6);
  ctx.fillStyle = gradV(ctx, baseY - dhh, baseY, [[0, 0x5a3a20], [1, 0x2e1c0e]]); ctx.fill(); strokeC(ctx, 0x1a0e06, 2.2); ctx.stroke();
  strokeC(ctx, 0x1a0e06, 1.6); ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, baseY - dhh * 0.96); ctx.stroke();
  fillC(ctx, PAL.gold); [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * dw * 0.1, baseY - dhh * 0.42, Math.max(2, w * 0.008), 0, 6.2832); ctx.fill(); });
  ctx.fillStyle = gradH(ctx, x0, x0 + w, [[0, 0xffffff, 0.1], [0.4, 0x000000, 0], [1, 0x000000, 0.3]]); ctx.fillRect(x0, top, w, h);
  ctx.restore();
  strokeC(ctx, OL(col), 2.4); ctx.strokeRect(x0, top, w, h);
  // corner turrets
  [-1, 1].forEach(s => {
    const tx = cx + s * (w / 2), tw2 = w * 0.07;
    ctx.fillStyle = gradH(ctx, tx - tw2, tx + tw2, [[0, lighten(col, 0.16)], [1, darken(col, 0.3)]]);
    ctx.fillRect(tx - tw2, top - h * 0.05, tw2 * 2, h * 1.05); strokeC(ctx, OL(col), 2); ctx.strokeRect(tx - tw2, top - h * 0.05, tw2 * 2, h * 1.05);
    fillC(ctx, PAL.turquoise); ctx.fillRect(tx - tw2, top + h * 0.06, tw2 * 2, h * 0.03);
    ctx.beginPath(); ctx.moveTo(tx - tw2 * 1.1, top - h * 0.05); ctx.quadraticCurveTo(tx, top - h * 0.17, tx + tw2 * 1.1, top - h * 0.05); ctx.closePath();
    ctx.fillStyle = gradH(ctx, tx - tw2, tx + tw2, [[0, lighten(PAL.turquoise, 0.3)], [1, darken(PAL.turquoise, 0.4)]]); ctx.fill(); strokeC(ctx, OL(PAL.turquoise), 1.8); ctx.stroke();
  });
}

// Mud-brick house with a flat roof.
//   o: color, door ("arch"|"plain"|null), doorX, windows, awning{color,color2}, beams, seed, rug, lit[]
function paintHouse(ctx, cx, baseY, w, h, o) {
  o = o || {};
  const col = o.color !== undefined ? o.color : PAL.clay, x0 = cx - w / 2, top = baseY - h, r = rng(o.seed || "house" + cx);
  const wall = () => {
    ctx.beginPath(); ctx.moveTo(x0, baseY); ctx.lineTo(x0 + 2, top + 5);
    for (let x = x0 + 2; x < x0 + w; x += 26) ctx.lineTo(Math.min(x0 + w - 2, x + 26), top + r.range(0, 5));
    ctx.lineTo(x0 + w, baseY); ctx.closePath();
  };
  wall();
  ctx.fillStyle = gradV(ctx, top, baseY, [[0, lighten(col, 0.12)], [0.75, col], [1, darken(col, 0.22)]]); ctx.fill();
  ctx.save(); wall(); ctx.clip();
  mottle(ctx, x0, top, w, h, darken(col, 0.4), 0.14, 10, "hm" + cx, 30, 110);
  mottle(ctx, x0, top, w, h, 0xffffff, 0.1, 6, "hl" + cx, 30, 90);
  if (o.brick !== false) { ctx.fillStyle = patS(ctx, tileBrick(col, darken(col, 0.2), 26, 11, "h"), 1); ctx.globalAlpha = 0.16; ctx.fillRect(x0, top, w, h); ctx.globalAlpha = 1; }
  // roof beams poking through under the parapet
  if (o.beams !== false) {
    for (let x = x0 + 22; x < x0 + w - 14; x += 34) {
      fillC(ctx, 0x4a3018); ctx.beginPath(); ctx.arc(x, top + 26, 5.4, 0, 6.2832); ctx.fill();
      fillC(ctx, 0x000000, 0.22); ctx.fillRect(x - 5, top + 30, 10, 12);
    }
  }
  fillC(ctx, 0x000000, 0.14); ctx.fillRect(x0, top + 14, w, 3);
  ctx.fillStyle = gradH(ctx, x0, x0 + w, [[0, 0xffffff, 0.1], [0.3, 0x000000, 0], [1, 0x000000, 0.2]]); ctx.fillRect(x0, top, w, h);
  ctx.restore();
  wall(); strokeC(ctx, OL(col), 2.4); ctx.stroke();

  const lights = [];
  // windows
  const wins = o.windows !== undefined ? o.windows : [[-0.3, 0.6], [0.3, 0.6]];
  wins.forEach(p => {
    const wx = cx + p[0] * w, wy = baseY - p[1] * h, ww = p[2] || 34, wh = p[3] || 52;
    pArch(ctx, wx, wy + wh / 2, ww + 12, wh + 12, 0.56); fillC(ctx, lighten(col, 0.24)); ctx.fill(); strokeC(ctx, OL(col), 1.6); ctx.stroke();
    pArch(ctx, wx, wy + wh / 2 - 4, ww, wh, 0.56); fillC(ctx, 0x231a2c); ctx.fill();
    ctx.save(); pArch(ctx, wx, wy + wh / 2 - 4, ww, wh, 0.56); ctx.clip();
    strokeC(ctx, 0x6a4a2a, 2.2);
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(wx + i * 9 - 30, wy + wh); ctx.lineTo(wx + i * 9 + 30, wy - wh); ctx.moveTo(wx + i * 9 + 30, wy + wh); ctx.lineTo(wx + i * 9 - 30, wy - wh); ctx.stroke(); }
    ctx.restore();
    lights.push({ x: wx, y: wy - 2, r: 70 });
  });
  // door
  if (o.door !== null) {
    const dx = cx + (o.doorX || 0) * w, dw = o.doorW || 62, dh = o.doorH || Math.min(118, h * 0.62);
    pArch(ctx, dx, baseY, dw + 18, dh + 14, 0.62); fillC(ctx, lighten(col, 0.22)); ctx.fill(); strokeC(ctx, OL(col), 1.8); ctx.stroke();
    pArch(ctx, dx, baseY, dw, dh, 0.62);
    ctx.fillStyle = gradV(ctx, baseY - dh, baseY, [[0, 0x7a5230], [1, 0x432a14]]); ctx.fill(); strokeC(ctx, 0x1e1006, 2.2); ctx.stroke();
    ctx.save(); pArch(ctx, dx, baseY, dw, dh, 0.62); ctx.clip();
    strokeC(ctx, 0x1e1006, 1.6, 0.8);
    ctx.beginPath(); ctx.moveTo(dx, baseY); ctx.lineTo(dx, baseY - dh); ctx.stroke();
    [-0.25, 0.25].forEach(k => { pRR(ctx, dx + k * dw - dw * 0.15, baseY - dh * 0.66, dw * 0.3, dh * 0.26, 3); ctx.stroke(); pRR(ctx, dx + k * dw - dw * 0.15, baseY - dh * 0.32, dw * 0.3, dh * 0.24, 3); ctx.stroke(); });
    fillC(ctx, PAL.gold); for (let y = baseY - 14; y > baseY - dh * 0.74; y -= 22) { [-0.42, -0.08, 0.08, 0.42].forEach(k => { ctx.beginPath(); ctx.arc(dx + k * dw, y, 2, 0, 6.2832); ctx.fill(); }); }
    ctx.restore();
    fillC(ctx, darken(col, 0.3)); ctx.fillRect(dx - dw / 2 - 12, baseY - 6, dw + 24, 8);
    o._door = { x: dx, y: baseY };
  }
  // awning
  if (o.awning) {
    const a = o.awning, ax = cx + (a.x || 0) * w, aw = a.w || w * 0.6, ay = baseY - (a.y || 0.52) * h, drop = a.drop || 54;
    strokeC(ctx, 0x4a3018, 5); ctx.lineCap = "round";
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(ax + s * aw * 0.47, ay + drop); ctx.lineTo(ax + s * aw * 0.47, baseY + 2); ctx.stroke(); });
    const n = Math.round(aw / 24);
    for (let i = 0; i < n; i++) {
      const xa = ax - aw / 2 + i * aw / n, xb = xa + aw / n;
      ctx.beginPath(); ctx.moveTo(xa + 6, ay); ctx.lineTo(xb + 6, ay); ctx.lineTo(xb - 4, ay + drop); ctx.quadraticCurveTo((xa + xb) / 2 - 4, ay + drop + 12, xa - 4, ay + drop); ctx.closePath();
      fillC(ctx, i % 2 ? (a.color2 !== undefined ? a.color2 : PAL.cream) : (a.color !== undefined ? a.color : PAL.crimson)); ctx.fill();
    }
    ctx.fillStyle = gradV(ctx, ay, ay + drop + 12, [[0, 0x000000, 0.28], [0.5, 0x000000, 0], [1, 0xffffff, 0.12]]);
    ctx.fillRect(ax - aw / 2 - 6, ay, aw + 14, drop + 12);
    softEllipse(ctx, ax, baseY - 2, aw * 0.5, 16, 0x000000, 0.22);
  }
  if (o.rug) {                                   // a rug hung over the wall to air
    const rx = cx + o.rug.x * w, rw = 54, rh = 96;
    ctx.save(); ctx.translate(rx, top + 12); ctx.rotate(Math.PI / 2);
    paintRugTop(ctx, 0, -rw / 2, rh, rw, { base: o.rug.color !== undefined ? o.rug.color : PAL.crimson });
    ctx.restore();
  }
  return { lights, door: o._door };
}

// Crenellated wall with round towers. Spans x0..x1.
function paintCityWall(ctx, x0, x1, baseY, h, o) {
  o = o || {};
  const col = o.color !== undefined ? o.color : PAL.sand, w = x1 - x0, top = baseY - h;
  ctx.fillStyle = gradV(ctx, top, baseY, [[0, lighten(col, 0.1)], [1, darken(col, 0.18)]]);
  ctx.fillRect(x0, top, w, h);
  for (let x = x0; x < x1; x += 34) ctx.fillRect(x, top - 14, 20, 15);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, top - 14, w, h + 14); ctx.clip();
  mottle(ctx, x0, top, w, h, darken(col, 0.4), 0.12, Math.round(w / 90), "wall" + x0, 40, 130);
  fillC(ctx, 0x000000, 0.1); ctx.fillRect(x0, top + h * 0.24, w, 3);
  ctx.restore();
  const step = o.towerStep || 460;
  for (let x = x0 + (o.towerOff || 120); x < x1 - 40; x += step) {
    const tw = h * 0.5, th = h * 1.22;
    ctx.fillStyle = gradH(ctx, x - tw / 2, x + tw / 2, [[0, lighten(col, 0.16)], [0.5, col], [1, darken(col, 0.3)]]);
    ctx.beginPath(); ctx.moveTo(x - tw * 0.56, baseY); ctx.lineTo(x - tw / 2, baseY - th); ctx.lineTo(x + tw / 2, baseY - th); ctx.lineTo(x + tw * 0.56, baseY); ctx.closePath(); ctx.fill();
    strokeC(ctx, OL(col), 2); ctx.stroke();
    for (let m = x - tw / 2; m < x + tw / 2 - 6; m += tw / 3.4) { ctx.fillRect(m, baseY - th - 13, tw / 5.4, 14); ctx.strokeRect(m, baseY - th - 13, tw / 5.4, 14); }
    fillC(ctx, 0x231a2c, 0.75); pArch(ctx, x, baseY - th * 0.56, tw * 0.16, tw * 0.44, 0.5); ctx.fill();
    ctx.fillStyle = gradH(ctx, x - tw / 2, x + tw / 2, [[0, lighten(col, 0.16)], [0.5, col], [1, darken(col, 0.3)]]);
  }
  if (o.gateX !== undefined) {
    const gx = o.gateX, gw = h * 0.9, gh = h * 1.34;
    ctx.fillStyle = gradV(ctx, baseY - gh, baseY, [[0, lighten(col, 0.14)], [1, darken(col, 0.14)]]); ctx.fillRect(gx - gw / 2, baseY - gh, gw, gh);
    strokeC(ctx, OL(col), 2.2); ctx.strokeRect(gx - gw / 2, baseY - gh, gw, gh);
    fillC(ctx, PAL.lapis); ctx.fillRect(gx - gw / 2 + 8, baseY - gh + 10, gw - 16, 14);
    pArch(ctx, gx, baseY, gw * 0.58, gh * 0.72, 0.5); fillC(ctx, 0x2a1a12); ctx.fill(); strokeC(ctx, PAL.cream, 3); ctx.stroke();
    for (let m = gx - gw / 2; m < gx + gw / 2 - 8; m += gw / 5) { fillC(ctx, col); ctx.fillRect(m, baseY - gh - 13, gw / 8, 14); }
  }
}

// ---------- trees & plants ----------
// kinds: poplar | round | apricot | cypress | dead | bush

function paintTree(ctx, cx, baseY, kind, s, seed, o) {
  o = o || {};
  const r = rng(seed || "tree" + cx), leaf = o.leaf !== undefined ? o.leaf : PAL.leaf, trunk = o.trunk !== undefined ? o.trunk : 0x6a4a30;
  const blob = (x, y, rad, c) => {
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832);
    ctx.fillStyle = gradR(ctx, x - rad * 0.35, y - rad * 0.4, rad * 0.1, rad * 1.1, [[0, lighten(c, 0.2)], [0.6, c], [1, darken(c, 0.26)]]); ctx.fill();
  };
  if (o.shadow !== false) softEllipse(ctx, cx + 14 * s, baseY + 2, (kind === "poplar" || kind === "cypress" ? 46 : 96) * s, 15 * s, 0x000000, 0.26);
  if (kind === "bush") {
    for (let i = 0; i < 6; i++) blob(cx + r.range(-34, 34) * s, baseY - r.range(12, 34) * s, r.range(18, 28) * s, mixC(leaf, r.chance(0.5) ? 0x3a5a2a : 0x8aa04a, r.range(0, 0.3)));
    return;
  }
  if (kind === "dead") {
    strokeC(ctx, trunk, 0); ctx.lineCap = "round";
    const branch = (x, y, ang, len, wd, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      strokeC(ctx, depth > 2 ? trunk : darken(trunk, 0.12), wd);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + x2) / 2 + r.range(-8, 8) * s, (y + y2) / 2, x2, y2); ctx.stroke();
      if (depth <= 0) return;
      const n = r.int(2, 3);
      for (let i = 0; i < n; i++) branch(x2, y2, ang + r.range(-0.75, 0.75), len * r.range(0.55, 0.78), wd * 0.66, depth - 1);
    };
    branch(cx, baseY, -Math.PI / 2 + r.range(-0.1, 0.1), 74 * s, 13 * s, 4);
    return;
  }
  // trunk
  const th = (kind === "poplar" ? 70 : kind === "cypress" ? 30 : 92) * s, tw = (kind === "round" || kind === "apricot" ? 20 : 11) * s;
  ctx.beginPath(); ctx.moveTo(cx - tw * 0.72, baseY); ctx.quadraticCurveTo(cx - tw * 0.4, baseY - th * 0.5, cx - tw * 0.36, baseY - th);
  ctx.lineTo(cx + tw * 0.36, baseY - th); ctx.quadraticCurveTo(cx + tw * 0.4, baseY - th * 0.5, cx + tw * 0.72, baseY); ctx.closePath();
  ctx.fillStyle = gradH(ctx, cx - tw, cx + tw, [[0, lighten(trunk, 0.2)], [1, darken(trunk, 0.3)]]); ctx.fill();
  strokeC(ctx, OL(trunk), 2); ctx.stroke();
  if (kind === "poplar" || kind === "cypress") {
    const hh = (kind === "poplar" ? 330 : 250) * s, ww = (kind === "poplar" ? 40 : 34) * s, c = kind === "cypress" ? darken(leaf, 0.32) : leaf;
    const n = 15;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), k = Math.sin(Math.PI * Math.pow(t, 0.72));
      blob(cx + r.range(-5, 5) * s, baseY - th * 0.6 - hh * t, ww * (0.3 + 0.75 * k), mixC(c, 0x2a4a22, t < 0.3 ? 0.2 : 0));
    }
    return;
  }
  // broad canopy
  const cy = baseY - th - 44 * s, R = 104 * s;
  const cols = [darken(leaf, 0.22), leaf, lighten(leaf, 0.08)];
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < 7; i++) {
      const a = r() * 6.2832, d = Math.sqrt(r()) * R * (0.95 - layer * 0.2);
      blob(cx + Math.cos(a) * d - layer * 9 * s, cy + Math.sin(a) * d * 0.62 - layer * 13 * s, r.range(34, 54) * s, cols[layer]);
    }
  }
  if (kind === "apricot") {
    const fc = o.fruit !== undefined ? o.fruit : 0xffd9e4;
    for (let i = 0; i < 46; i++) {
      const a = r() * 6.2832, d = Math.sqrt(r()) * R * 1.08;
      fillC(ctx, r.chance(0.3) ? 0xffffff : fc, 0.95); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.66 - 8 * s, r.range(3, 5.4) * s, 0, 6.2832); ctx.fill();
    }
  }
}
function paintGrass(ctx, x, y, s, c, seed) {
  const r = rng(seed || "g" + x + y);
  strokeC(ctx, c, 2.4 * s); ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const bx = x + r.range(-12, 12) * s;
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.quadraticCurveTo(bx + r.range(-5, 5) * s, y - 10 * s, bx + r.range(-9, 9) * s, y - r.range(12, 24) * s); ctx.stroke();
  }
}

// ---------- market & street props ----------

// goods: bread | melons | spices | fruit | cloth | pots | leather
function paintGoods(ctx, cx, y, w, kind, seed) {
  const r = rng(seed || kind + cx);
  if (kind === "bread") {
    for (let i = 0; i < 5; i++) {
      const x = cx - w * 0.4 + i * w * 0.2;
      for (let j = 0; j < 2 + (i % 2); j++) paintLoaf(ctx, x, y - 8 - j * 9, 21, 0.75);
    }
  } else if (kind === "melons") {
    for (let i = 0; i < 5; i++) {
      const x = cx - w * 0.38 + i * w * 0.19, c = i % 2 ? 0xd9b84a : 0x5d8a3a;
      pEll(ctx, x, y - 15, 21, 16); ctx.fillStyle = gradR(ctx, x - 6, y - 21, 2, 24, [[0, lighten(c, 0.3)], [1, darken(c, 0.2)]]); ctx.fill(); strokeC(ctx, OL(c), 1.6); ctx.stroke();
      strokeC(ctx, darken(c, 0.3), 1.4, 0.6); [-0.5, 0, 0.5].forEach(k => { ctx.beginPath(); ctx.ellipse(x, y - 15, 21 * Math.abs(k) + 1, 16, 0, -1.5, 1.5); ctx.stroke(); });
    }
  } else if (kind === "spices") {
    [0xc9382a, 0xe2a12a, 0x8a5a2a, 0xd96a2a, 0x7a8a3a].forEach((c, i) => {
      const x = cx - w * 0.38 + i * w * 0.19;
      ctx.beginPath(); ctx.moveTo(x - 16, y - 8); ctx.quadraticCurveTo(x, y - 40, x + 16, y - 8); ctx.closePath(); fillC(ctx, c); ctx.fill();
      pEll(ctx, x, y - 6, 19, 8); ctx.fillStyle = gradV(ctx, y - 12, y + 2, [[0, 0x9a6a3a], [1, 0x5a3a1a]]); ctx.fill(); strokeC(ctx, 0x2a160a, 1.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 15, y - 9); ctx.quadraticCurveTo(x, y - 38, x + 15, y - 9); ctx.quadraticCurveTo(x, y - 2, x - 15, y - 9); fillC(ctx, c); ctx.fill();
    });
  } else if (kind === "fruit") {
    for (let i = 0; i < 16; i++) {
      const c = r.pick([0xb2283a, 0xe8943a, 0xe2c04a, 0x8a3a6a]);
      const x = cx + r.range(-0.42, 0.42) * w, yy = y - r.range(6, 22);
      ctx.beginPath(); ctx.arc(x, yy, r.range(7, 10), 0, 6.2832); ctx.fillStyle = gradR(ctx, x - 3, yy - 3, 1, 11, [[0, lighten(c, 0.35)], [1, c]]); ctx.fill(); strokeC(ctx, OL(c), 1.2); ctx.stroke();
    }
  } else if (kind === "cloth") {
    [[0x8e2f2f, 0xd9a441, 0x1c4e80], [0x1f6f6f, 0xf6ecd8, 0xb2283a], [0x4a2f6a, 0xd9a441, 0x2fb8ac], [0xc66a3d, 0xf6ecd8, 0x1c4e80]].forEach((cols, i) => {
      const x = cx - w * 0.36 + i * w * 0.24;
      pRR(ctx, x - 22, y - 30, 44, 30, 8); ctx.fillStyle = patS(ctx, tileIkat([cols[0], cols[1], cols[2], PAL.cream], "g" + i), 0.4); ctx.fill(); strokeC(ctx, OL(cols[0]), 1.6); ctx.stroke();
      pEll(ctx, x + 22, y - 15, 7, 15); fillC(ctx, darken(cols[0], 0.2)); ctx.fill(); ctx.stroke();
    });
  } else if (kind === "pots") {
    for (let i = 0; i < 5; i++) {
      const x = cx - w * 0.38 + i * w * 0.19, c = i % 2 ? 0x2a6aa0 : 0xf2ead8;
      ctx.beginPath(); ctx.moveTo(x - 9, y - 30); ctx.lineTo(x + 9, y - 30); ctx.quadraticCurveTo(x + 22, y - 14, x + 11, y); ctx.lineTo(x - 11, y); ctx.quadraticCurveTo(x - 22, y - 14, x - 9, y - 30); ctx.closePath();
      ctx.fillStyle = gradH(ctx, x - 20, x + 20, [[0, lighten(c, 0.2)], [1, darken(c, 0.25)]]); ctx.fill(); strokeC(ctx, OL(c), 1.6); ctx.stroke();
      strokeC(ctx, i % 2 ? 0xf2ead8 : 0x2a6aa0, 2); ctx.beginPath(); ctx.moveTo(x - 15, y - 15); ctx.lineTo(x + 15, y - 15); ctx.stroke();
    }
  } else if (kind === "leather") {
    for (let i = 0; i < 4; i++) {
      const x = cx - w * 0.34 + i * w * 0.23, c = [0x7a4a26, 0x5a3418, 0x9a6a3a, 0x3a2412][i];
      pRR(ctx, x - 20, y - 22, 40, 22, 5); ctx.fillStyle = gradV(ctx, y - 22, y, [[0, lighten(c, 0.2)], [1, c]]); ctx.fill(); strokeC(ctx, OL(c), 1.6); ctx.stroke();
      strokeC(ctx, PAL.goldLight, 1.2, 0.8); ctx.setLineDash([3, 3]); pRR(ctx, x - 16, y - 18, 32, 14, 3); ctx.stroke(); ctx.setLineDash([]);
    }
  }
}
// Round Uzbek flatbread with its stamped centre. (x,y) = centre.
function paintLoaf(ctx, x, y, r, squash, o) {
  o = o || {};
  const c = o.color !== undefined ? o.color : 0xd9973f, ry = r * (squash === undefined ? 0.62 : squash);
  pEll(ctx, x, y, r, ry);
  ctx.fillStyle = gradR(ctx, x - r * 0.3, y - ry * 0.4, r * 0.1, r * 1.1, [[0, lighten(c, 0.28)], [0.7, c], [1, darken(c, 0.3)]]); ctx.fill();
  strokeC(ctx, OL(c), Math.max(1.4, r * 0.07)); ctx.stroke();
  pEll(ctx, x, y - ry * 0.06, r * 0.46, ry * 0.46); fillC(ctx, darken(c, 0.16), 0.9); ctx.fill();
  fillC(ctx, darken(c, 0.4), 0.8);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.26, y - ry * 0.06 + Math.sin(a) * ry * 0.26, Math.max(0.9, r * 0.04), 0, 6.2832); ctx.fill(); }
  if (o.seeds !== false) { fillC(ctx, 0xfff3d0, 0.7); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 + 0.3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.68, y + Math.sin(a) * ry * 0.68, Math.max(0.8, r * 0.035), 0, 6.2832); ctx.fill(); } }
}

// Market stall. o: cloth, cloth2, goods, w
function paintStall(ctx, cx, baseY, o) {
  o = o || {};
  const w = o.w || 230, c1 = o.cloth !== undefined ? o.cloth : PAL.crimson, c2 = o.cloth2 !== undefined ? o.cloth2 : PAL.cream;
  softEllipse(ctx, cx + 10, baseY + 2, w * 0.62, 22, 0x000000, 0.3);
  const tableY = baseY - 78, topY = baseY - 232;
  strokeC(ctx, 0x3a2414, 9); ctx.lineCap = "round";
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(cx + s * w * 0.46, baseY); ctx.lineTo(cx + s * w * 0.46, topY + 18); ctx.stroke(); });
  strokeC(ctx, 0x7a5632, 5); [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(cx + s * w * 0.46, baseY); ctx.lineTo(cx + s * w * 0.46, topY + 18); ctx.stroke(); });
  // cloth skirt of the table
  pRR(ctx, cx - w / 2, tableY, w, 78, 5);
  ctx.fillStyle = patS(ctx, tileIkat([c1, c2, PAL.gold, PAL.navy], "stall"), 0.5); ctx.fill();
  ctx.fillStyle = gradV(ctx, tableY, baseY, [[0, 0x000000, 0.05], [1, 0x000000, 0.4]]); ctx.fill();
  strokeC(ctx, OL(c1), 2.2); ctx.stroke();
  pRR(ctx, cx - w / 2 - 6, tableY - 10, w + 12, 16, 4); ctx.fillStyle = gradV(ctx, tableY - 10, tableY + 6, [[0, 0x9a7044], [1, 0x6a4a28]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2); ctx.stroke();
  paintGoods(ctx, cx, tableY - 9, w * 0.9, o.goods || "fruit", "sg" + cx);
  // awning with a scalloped edge
  const n = Math.round(w / 34), aw = w + 44;
  for (let i = 0; i < n; i++) {
    const xa = cx - aw / 2 + i * aw / n, xb = xa + aw / n;
    ctx.beginPath(); ctx.moveTo(lerp(xa, cx, 0.12), topY); ctx.lineTo(lerp(xb, cx, 0.12), topY); ctx.lineTo(xb, topY + 52);
    ctx.quadraticCurveTo((xa + xb) / 2, topY + 70, xa, topY + 52); ctx.closePath();
    fillC(ctx, i % 2 ? c2 : c1); ctx.fill();
  }
  ctx.fillStyle = gradV(ctx, topY, topY + 66, [[0, 0xffffff, 0.2], [0.5, 0x000000, 0], [1, 0x000000, 0.24]]);
  ctx.fillRect(cx - aw / 2, topY, aw, 68);
  strokeC(ctx, OL(c1), 2); ctx.beginPath(); ctx.moveTo(lerp(cx - aw / 2, cx, 0.12), topY); ctx.lineTo(lerp(cx + aw / 2, cx, 0.12), topY); ctx.stroke();
}


// Two-wheeled arba with its great spoked wheel. o.load: sacks | hay | bricks | bread | null
function paintCart(ctx, cx, baseY, o) {
  o = o || {};
  softEllipse(ctx, cx, baseY + 2, 150, 22, 0x000000, 0.3);
  strokeC(ctx, 0x4a3018, 9); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - 30, baseY - 82); ctx.lineTo(cx + 176, baseY - 8); ctx.stroke();      // shaft
  // bed
  pRR(ctx, cx - 120, baseY - 112, 190, 44, 6); ctx.fillStyle = gradV(ctx, baseY - 112, baseY - 68, [[0, 0x9a7044], [1, 0x5e3f20]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2.2); ctx.stroke();
  strokeC(ctx, 0x2a160a, 1.4, 0.6); for (let x = cx - 96; x < cx + 60; x += 26) { ctx.beginPath(); ctx.moveTo(x, baseY - 110); ctx.lineTo(x, baseY - 70); ctx.stroke(); }
  if (o.load === "hay") { for (let i = 0; i < 9; i++) { const x = cx - 100 + i * 20; ctx.beginPath(); ctx.arc(x, baseY - 124 - Math.sin(i / 8 * Math.PI) * 30, 26, 0, 6.2832); fillC(ctx, i % 2 ? 0xd9b85a : 0xc9a246); ctx.fill(); } }
  else if (o.load === "sacks") { [-84, -36, 12, -60, -12].forEach((x, i) => { pRR(ctx, cx + x - 26, baseY - (i > 2 ? 176 : 142), 52, 40, 14); fillC(ctx, i % 2 ? 0xcdb98e : 0xbfa878); ctx.fill(); strokeC(ctx, 0x5a4a2a, 1.8); ctx.stroke(); }); }
  else if (o.load === "bricks") { for (let j = 0; j < 3; j++) for (let i = 0; i < 6 - j; i++) { fillC(ctx, j % 2 ? 0xb5553a : 0xc66a3d); ctx.fillRect(cx - 104 + i * 30 + j * 15, baseY - 130 - j * 17, 27, 15); strokeC(ctx, 0x4a1c10, 1.2); ctx.strokeRect(cx - 104 + i * 30 + j * 15, baseY - 130 - j * 17, 27, 15); } }
  else if (o.load === "bread") { for (let j = 0; j < 3; j++) for (let i = 0; i < 5 - j; i++) paintLoaf(ctx, cx - 92 + i * 38 + j * 19, baseY - 122 - j * 13, 21, 0.6); }
  // wheel
  const wx = cx - 22, wy = baseY - 58, R = 58;
  strokeC(ctx, 0x2a160a, 14); ctx.beginPath(); ctx.arc(wx, wy, R, 0, 6.2832); ctx.stroke();
  strokeC(ctx, 0x8a6238, 9); ctx.beginPath(); ctx.arc(wx, wy, R, 0, 6.2832); ctx.stroke();
  strokeC(ctx, 0x6a4a28, 5); for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * R, wy + Math.sin(a) * R); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(wx, wy, 13, 0, 6.2832); fillC(ctx, 0x3a2414); ctx.fill(); ctx.beginPath(); ctx.arc(wx, wy, 5, 0, 6.2832); fillC(ctx, PAL.gold); ctx.fill();
}

// Post with a hanging lantern. Returns where its light is.
function paintLampPost(ctx, cx, baseY) {
  softEllipse(ctx, cx, baseY + 2, 26, 8, 0x000000, 0.28);
  strokeC(ctx, 0x2a160a, 9); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, baseY - 190); ctx.stroke();
  strokeC(ctx, 0x6a4a28, 5); ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, baseY - 190); ctx.stroke();
  strokeC(ctx, 0x2a160a, 5); ctx.beginPath(); ctx.moveTo(cx, baseY - 184); ctx.quadraticCurveTo(cx + 26, baseY - 196, cx + 34, baseY - 172); ctx.stroke();
  const lx = cx + 34, ly = baseY - 148;
  strokeC(ctx, 0x2a160a, 2); ctx.beginPath(); ctx.moveTo(lx, baseY - 172); ctx.lineTo(lx, ly - 16); ctx.stroke();
  pRR(ctx, lx - 11, ly - 16, 22, 32, 4); fillC(ctx, 0x2a2018); ctx.fill();
  pRR(ctx, lx - 7.5, ly - 11, 15, 21, 3); ctx.fillStyle = gradV(ctx, ly - 11, ly + 10, [[0, 0xfff1b8], [1, 0xffa83a]]); ctx.fill();
  fillC(ctx, 0x2a2018); ctx.beginPath(); ctx.moveTo(lx - 13, ly - 16); ctx.lineTo(lx, ly - 26); ctx.lineTo(lx + 13, ly - 16); ctx.closePath(); ctx.fill();
  return { x: 34, y: -148 };
}
function paintRock(ctx, cx, baseY, s, c, seed) {
  const r = rng(seed || "rock" + cx);
  softEllipse(ctx, cx + 4, baseY + 2, 44 * s, 11 * s, 0x000000, 0.28);
  const pts = [[-40, 0], [-34, -22], [-14, -38], [10, -34], [34, -18], [40, 0]].map(p => [cx + (p[0] + r.range(-5, 5)) * s, baseY + (p[1] + (p[1] ? r.range(-5, 5) : 0)) * s]);
  pSmooth(ctx, pts, false); ctx.closePath();
  ctx.fillStyle = gradL(ctx, cx - 30 * s, baseY - 40 * s, cx + 30 * s, baseY, [[0, lighten(c, 0.24)], [0.5, c], [1, darken(c, 0.34)]]); ctx.fill();
  strokeC(ctx, OL(c), 2); ctx.stroke();
}
// Graves. kind: slab | box | mound | pole
function paintGrave(ctx, cx, baseY, kind, seed) {
  const r = rng(seed || "grave" + cx), c = mixC(0x8a8478, 0x6a7068, r());
  softEllipse(ctx, cx + 6, baseY + 2, 66, 16, 0x000000, 0.34);
  // the low earth mound every grave sits on
  ctx.beginPath(); ctx.moveTo(cx - 70, baseY); ctx.quadraticCurveTo(cx, baseY - 30, cx + 70, baseY); ctx.closePath();
  ctx.fillStyle = gradV(ctx, baseY - 26, baseY, [[0, 0x6a6652], [1, 0x45412f]]); ctx.fill();
  if (kind === "slab") {
    ctx.save(); ctx.translate(cx - 22, baseY - 8); ctx.rotate(r.range(-0.09, 0.09));
    pArch(ctx, 0, 0, 58, 104, 0.6); ctx.fillStyle = gradH(ctx, -29, 29, [[0, lighten(c, 0.24)], [0.5, c], [1, darken(c, 0.34)]]); ctx.fill(); strokeC(ctx, 0x2a2a26, 2.2); ctx.stroke();
    strokeC(ctx, 0x2a2a26, 1.6, 0.5); for (let y = -74; y < -18; y += 14) { ctx.beginPath(); ctx.moveTo(-17, y); ctx.lineTo(r.range(4, 17), y); ctx.stroke(); }
    if (r.chance(0.6)) { strokeC(ctx, 0x1a1a18, 1.6, 0.7); ctx.beginPath(); ctx.moveTo(-8, -100); ctx.lineTo(4, -66); ctx.lineTo(-4, -40); ctx.stroke(); }
    softEllipse(ctx, -12, -6, 26, 10, 0x4a6a3a, 0.55);
    ctx.restore();
  } else if (kind === "box") {
    [[112, 26, 0], [88, 24, -24], [62, 22, -46]].forEach(d => {
      pRR(ctx, cx - d[0] / 2, baseY - 10 - d[1] + d[2], d[0], d[1], 4);
      ctx.fillStyle = gradH(ctx, cx - d[0] / 2, cx + d[0] / 2, [[0, lighten(c, 0.22)], [0.5, c], [1, darken(c, 0.32)]]); ctx.fill(); strokeC(ctx, 0x2a2a26, 2); ctx.stroke();
    });
  } else if (kind === "pole") {
    strokeC(ctx, 0x2a1a10, 8); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx, baseY - 12); ctx.lineTo(cx + 5, baseY - 196); ctx.stroke();
    strokeC(ctx, 0x6a4a30, 4.4); ctx.beginPath(); ctx.moveTo(cx, baseY - 12); ctx.lineTo(cx + 5, baseY - 196); ctx.stroke();
    [0xf2ead8, 0xa8323c, 0xe6dccc].forEach((cc, i) => { strokeC(ctx, cc, 5, 0.9); ctx.beginPath(); ctx.moveTo(cx + 5, baseY - 190 + i * 9); ctx.quadraticCurveTo(cx + 30, baseY - 178 + i * 12, cx + 26 + i * 6, baseY - 140 + i * 10); ctx.stroke(); });
    fillC(ctx, 0x2a1a10); ctx.beginPath(); ctx.arc(cx + 5, baseY - 198, 7, 0, 6.2832); ctx.fill();
  } else {
    for (let i = 0; i < 7; i++) paintRockLite(ctx, cx + r.range(-46, 46), baseY - r.range(4, 22), r.range(9, 17), c);
  }
  paintGrass(ctx, cx + r.range(-56, 56), baseY, 1, 0x56663a, seed + "g1");
  paintGrass(ctx, cx + r.range(-56, 56), baseY - 2, 0.8, 0x4a5a34, seed + "g2");
}
function paintRockLite(ctx, x, y, rad, c) {
  ctx.beginPath(); ctx.ellipse(x, y, rad, rad * 0.72, 0, 0, 6.2832);
  ctx.fillStyle = gradR(ctx, x - rad * 0.3, y - rad * 0.3, 1, rad, [[0, lighten(c, 0.22)], [1, darken(c, 0.3)]]); ctx.fill(); strokeC(ctx, 0x2a2a26, 1.4); ctx.stroke();
}
// The clay bread oven with a glowing mouth. Returns where its light is.
function paintTandir(ctx, cx, baseY, s) {
  s = s || 1;
  softEllipse(ctx, cx + 6, baseY + 2, 104 * s, 22 * s, 0x000000, 0.32);
  pRR(ctx, cx - 104 * s, baseY - 34 * s, 208 * s, 34 * s, 8); ctx.fillStyle = gradV(ctx, baseY - 34 * s, baseY, [[0, 0xb89a74], [1, 0x7a6248]]); ctx.fill(); strokeC(ctx, 0x3a2a1a, 2.2); ctx.stroke();
  const by = baseY - 32 * s, c = 0xc58a5a;
  const dome = () => {
    ctx.beginPath(); ctx.moveTo(cx - 88 * s, by); ctx.bezierCurveTo(cx - 100 * s, by - 100 * s, cx - 50 * s, by - 150 * s, cx, by - 150 * s);
    ctx.bezierCurveTo(cx + 50 * s, by - 150 * s, cx + 100 * s, by - 100 * s, cx + 88 * s, by); ctx.closePath();
  };
  dome(); ctx.fillStyle = gradH(ctx, cx - 92 * s, cx + 92 * s, [[0, lighten(c, 0.24)], [0.45, c], [1, darken(c, 0.38)]]); ctx.fill();
  ctx.save(); dome(); ctx.clip();
  mottle(ctx, cx - 100 * s, by - 150 * s, 200 * s, 150 * s, 0x3a2414, 0.2, 9, "tandir" + cx, 20, 60);
  strokeC(ctx, darken(c, 0.3), 1.4 * s, 0.35);                       // the clay coils it was built from
  for (let k = 1; k < 7; k++) { const yy = by - k * 20 * s; ctx.beginPath(); ctx.moveTo(cx - 110 * s, yy); ctx.quadraticCurveTo(cx, yy - 6 * s, cx + 110 * s, yy); ctx.stroke(); }
  ctx.restore();
  dome(); strokeC(ctx, OL(c), 2.4); ctx.stroke();
  // mouth
  pArch(ctx, cx, by - 8 * s, 82 * s, 92 * s, 0.5); fillC(ctx, 0x1a0c06); ctx.fill(); strokeC(ctx, 0x2a160a, 5 * s); ctx.stroke();
  ctx.save(); pArch(ctx, cx, by - 8 * s, 82 * s, 92 * s, 0.5); ctx.clip();
  ctx.fillStyle = gradR(ctx, cx, by - 14 * s, 4, 70 * s, [[0, 0xfff1b0, 1], [0.35, 0xff9a3a, 0.95], [1, 0x7a1a08, 0.2]]); ctx.fillRect(cx - 50 * s, by - 100 * s, 100 * s, 100 * s);
  ctx.restore();
  softEllipse(ctx, cx, by - 104 * s, 40 * s, 22 * s, 0x1a0c06, 0.4);     // soot above the mouth
  return { x: 0, y: -60 * s, r: 240 * s };
}



// ---------- the flying carpet ----------

// Side-on strip used for flight (rippled at runtime). Canvas w x h.
function paintCarpetStrip(ctx, w, h) {
  const fr = 22, x0 = fr, bw = w - fr * 2, y0 = h * 0.2, bh = h * 0.52;
  // tassels
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const y = y0 + 3 + i * (bh - 6) / 8;
    strokeC(ctx, i % 2 ? PAL.goldLight : PAL.gold, 3.2);
    ctx.beginPath(); ctx.moveTo(x0 + 2, y); ctx.lineTo(2, y + 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + bw - 2, y); ctx.lineTo(w - 2, y + 5); ctx.stroke();
  }
  // underside edge, then the woven top
  pRR(ctx, x0, y0 + 9, bw, bh, 5); fillC(ctx, 0x3a0e14); ctx.fill();
  paintRugTop(ctx, x0, y0, bw, bh, { base: 0x9a2a34, trim: PAL.gold, dark: 0x14264a, pale: PAL.cream });
  strokeC(ctx, 0x2a0a10, 2.2); ctx.strokeRect(x0, y0, bw, bh);
}
// Rolled-up carpet lying on the ground.
function paintCarpetRoll(ctx, cx, baseY, s) {
  softEllipse(ctx, cx, baseY + 2, 76 * s, 12 * s, 0x000000, 0.3);
  pRR(ctx, cx - 70 * s, baseY - 34 * s, 140 * s, 34 * s, 17 * s);
  ctx.fillStyle = patS(ctx, tileIkat([0x9a2a34, PAL.gold, 0x14264a, PAL.cream], "roll"), 0.4 * s); ctx.fill();
  ctx.fillStyle = gradV(ctx, baseY - 34 * s, baseY, [[0, 0xffffff, 0.2], [0.4, 0x000000, 0], [1, 0x000000, 0.4]]); ctx.fill();
  strokeC(ctx, 0x2a0a10, 2.2 * s); ctx.stroke();
  pEll(ctx, cx + 70 * s, baseY - 17 * s, 8 * s, 17 * s); fillC(ctx, 0x7a2028); ctx.fill(); ctx.stroke();
  strokeC(ctx, PAL.gold, 1.6 * s); ctx.beginPath(); ctx.ellipse(cx + 70 * s, baseY - 17 * s, 4 * s, 10 * s, 0, 0, 6.2832); ctx.stroke();
  strokeC(ctx, PAL.goldLight, 3 * s); [-30, 26].forEach(x => { ctx.beginPath(); ctx.moveTo(cx + x * s, baseY - 34 * s); ctx.lineTo(cx + x * s, baseY); ctx.stroke(); });
}

// ---------- ground ----------
// Fills x0..x1, y0..y1 with worn earth: big soft patches, speckles, pebbles.
function paintEarth(ctx, x0, y0, w, h, c, seed, o) {
  o = o || {};
  const r = rng(seed);
  ctx.fillStyle = gradV(ctx, y0, y0 + h, [[0, lighten(c, 0.1)], [1, darken(c, 0.14)]]);
  ctx.fillRect(x0, y0, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  for (let i = 0; i < 46; i++) softEllipse(ctx, x0 + r() * w, y0 + r() * h, r.range(90, 300), r.range(26, 80), r.chance(0.5) ? lighten(c, 0.3) : darken(c, 0.3), r.range(0.06, 0.16));
  for (let i = 0; i < (o.pebbles !== undefined ? o.pebbles : 160); i++) {
    const x = x0 + r() * w, y = y0 + r() * h, k = (y - y0) / h, rad = r.range(1.4, 4.2) * (0.6 + k * 0.8);
    fillC(ctx, r.chance(0.5) ? darken(c, 0.34) : lighten(c, 0.3), r.range(0.25, 0.6));
    ctx.beginPath(); ctx.ellipse(x, y, rad * 1.5, rad, 0, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}
// A worn footpath through points.
function paintPath(ctx, pts, width, c, a) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  [[1.5, 0.35], [1.15, 0.55], [0.8, 0.8]].forEach(l => {
    strokeC(ctx, c, width * l[0], (a === undefined ? 0.5 : a) * l[1]);
    pSmooth(ctx, pts, false); ctx.stroke();
  });
  ctx.restore();
}
// Irregular paving stones over a region.
function paintCobbles(ctx, x0, y0, w, h, c, seed, a) {
  const r = rng(seed);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  for (let y = y0, row = 0; y < y0 + h; row++) {
    const k = (y - y0) / h, ch = 20 + k * 22;
    for (let x = x0 - (row % 2 ? 30 : 0); x < x0 + w; ) {
      const cw = r.range(44, 74) * (0.7 + k * 0.5);
      pRR(ctx, x + 2, y + 2, cw - 4, ch - 4, 7);
      fillC(ctx, mixC(c, r.chance(0.5) ? 0xffffff : 0x000000, r.range(0.02, 0.16)), a === undefined ? 0.6 : a); ctx.fill();
      x += cw;
    }
    y += ch;
  }
  ctx.restore();
}
