// ============================================================
// art-props.js — the things people live among: the well, the
// clay jugs and storage jars, sacks, hay and firewood, pottery
// kilns, the raised supa platform, saddlery, and the horse.
//
// Same rules as art-world.js: every painter draws at (cx, baseY)
// = where the thing meets the ground, in daylight colours, with
// the outline weight, gradients and grain the people use.
// ============================================================

// ---------- the well ----------
// A round stone well with a capstone rim, a timber frame and windlass,
// a coil of rope, a bucket on the rim and a jug left beside it.
function paintWell(ctx, cx, baseY) {
  const R = 82, ry = 24, wallH = 72, top = baseY - wallH, r = rng("well" + cx);
  softEllipse(ctx, cx + 12, baseY + 4, R + 40, ry + 12, 0x000000, 0.34);
  softEllipse(ctx, cx - 40, baseY + 8, 70, 13, 0x3a2614, 0.3);                 // spilt water
  // timber posts, set either side
  const post = (x) => {
    ctx.save(); ctx.lineCap = "butt";
    pRR(ctx, x - 9, top - 150, 18, wallH + 150 - 2, 4);
    ctx.fillStyle = gradH(ctx, x - 9, x + 9, [[0, 0xa8784a], [0.45, 0x8a5c34], [1, 0x4e3218]]); ctx.fill();
    strokeC(ctx, 0x2a160a, 2.2); ctx.stroke();
    strokeC(ctx, 0x3a2412, 1, 0.5); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - 4 + k * 2.5, top - 146); ctx.quadraticCurveTo(x - 6 + k * 3, top - 60, x - 3 + k * 2.4, baseY - 6); ctx.stroke(); }
    strokeC(ctx, 0xc8b080, 2.2); [top - 128, top - 120].forEach(y => { ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x + 10, y + 4); ctx.stroke(); });
    ctx.restore();
  };
  post(cx - R - 4); post(cx + R + 4);
  // the stone wall: a cylinder, courses following its curve
  const arc = (y, dir) => { const pts = []; for (let i = 0; i <= 24; i++) { const t = dir > 0 ? i / 24 : 1 - i / 24, th = Math.PI * t; pts.push([cx + R * Math.cos(th), y + ry * Math.sin(th)]); } return pts; };
  const wall = () => { ctx.beginPath(); arc(top, 1).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); arc(baseY, -1).forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); };
  wall(); fillC(ctx, 0x6a6258); ctx.fill();
  ctx.save(); wall(); ctx.clip();
  const rowH = 15, rows = Math.ceil(wallH / rowH) + 1;
  for (let j = 0; j < rows; j++) {
    let th = (j % 2) * 0.14;
    while (th < Math.PI) {
      const t2 = Math.min(Math.PI, th + r.range(0.22, 0.34));
      const P = (a, k) => [cx + R * Math.cos(a), top + (j + k) * rowH + ry * Math.sin(a)];
      const q = [P(th, 0), P(t2, 0), P(t2, 1), P(th, 1)];
      ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1] + 1.5); q.forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath();
      const c = mixC(0xa89c8a, r.chance(0.5) ? 0xc8bca6 : 0x7a7064, r.range(0, 0.6));
      ctx.fillStyle = gradV(ctx, q[0][1], q[3][1], [[0, lighten(c, 0.12)], [1, darken(c, 0.12)]]); ctx.fill();
      strokeC(ctx, 0x3e3830, 1.8); ctx.stroke();
      th = t2;
    }
  }
  ctx.fillStyle = gradH(ctx, cx - R, cx + R, [[0, 0xffffff, 0.16], [0.35, 0xffffff, 0], [0.7, 0x000000, 0.18], [1, 0x000000, 0.5]]); ctx.fillRect(cx - R - 2, top - 4, R * 2 + 4, wallH + ry + 8);
  softEllipse(ctx, cx - 30, baseY + 8, 46, 18, 0x4a6a34, 0.45); softEllipse(ctx, cx + 44, baseY + 10, 30, 12, 0x4a6a34, 0.35);   // moss
  ctx.restore();
  wall(); strokeC(ctx, 0x2a2420, 2.4); ctx.stroke();
  // capstone rim and the dark water inside
  pEll(ctx, cx, top, R + 7, ry + 4); fillC(ctx, 0xb8ac98); ctx.fill(); strokeC(ctx, 0x2a2420, 2.2); ctx.stroke();
  pEll(ctx, cx, top + 1, R - 16, ry - 7); ctx.fillStyle = gradV(ctx, top - ry, top + ry, [[0, 0x0a0e16], [0.7, 0x16283a], [1, 0x2a4a68]]); ctx.fill(); strokeC(ctx, 0x2a2420, 2); ctx.stroke();
  ctx.save(); pEll(ctx, cx, top + 1, R - 16, ry - 7); ctx.clip();
  softEllipse(ctx, cx + 10, top + 6, 26, 5, 0xbfe0ff, 0.45);
  ctx.restore();
  strokeC(ctx, 0x6a6052, 1.6);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (R - 15), top + 1 + Math.sin(a) * (ry - 6)); ctx.lineTo(cx + Math.cos(a) * (R + 7), top + Math.sin(a) * (ry + 4)); ctx.stroke(); }
  ctx.fillStyle = gradV(ctx, top - ry, top + ry, [[0, 0xffffff, 0.22], [1, 0xffffff, 0]]); ctx.beginPath(); ctx.ellipse(cx, top, R + 7, ry + 4, 0, Math.PI, Math.PI * 2); ctx.fill();
  // crossbeam, windlass drum and crank
  const by = top - 132;
  pRR(ctx, cx - R - 18, by - 9, (R + 18) * 2, 18, 9); ctx.fillStyle = gradV(ctx, by - 9, by + 9, [[0, 0xb08050], [1, 0x5a3a1c]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2.2); ctx.stroke();
  pRR(ctx, cx - 36, by - 15, 72, 30, 10); ctx.fillStyle = gradV(ctx, by - 15, by + 15, [[0, 0xc09060], [0.5, 0x8a5c34], [1, 0x4a2c14]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2); ctx.stroke();
  strokeC(ctx, 0xd8c290, 2.6); for (let x = cx - 30; x < cx + 30; x += 6) { ctx.beginPath(); ctx.moveTo(x, by - 14); ctx.lineTo(x + 4, by + 14); ctx.stroke(); }
  strokeC(ctx, 0x3a3a40, 4.4); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx + R + 14, by); ctx.lineTo(cx + R + 30, by); ctx.lineTo(cx + R + 30, by + 30); ctx.stroke();
  strokeC(ctx, 0x6a4a28, 6); ctx.beginPath(); ctx.moveTo(cx + R + 30, by + 30); ctx.lineTo(cx + R + 40, by + 30); ctx.stroke();
  // rope down to a bucket resting on the rim
  const bx = cx + 40, bb = top + 6;
  strokeC(ctx, 0xd8c290, 2.4); ctx.beginPath(); ctx.moveTo(cx + 22, by + 12); ctx.quadraticCurveTo(cx + 34, by + 60, bx, bb - 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 17, bb - 36); ctx.lineTo(bx + 17, bb - 36); ctx.lineTo(bx + 13, bb); ctx.lineTo(bx - 13, bb); ctx.closePath();
  ctx.fillStyle = gradH(ctx, bx - 17, bx + 17, [[0, 0xb48858], [0.5, 0x8a6038], [1, 0x4e3218]]); ctx.fill(); strokeC(ctx, 0x2a160a, 1.8); ctx.stroke();
  strokeC(ctx, 0x2a160a, 1, 0.6); [-8, 0, 8].forEach(dx => { ctx.beginPath(); ctx.moveTo(bx + dx, bb - 35); ctx.lineTo(bx + dx * 0.8, bb - 1); ctx.stroke(); });
  strokeC(ctx, 0x3a3a40, 2.6); [bb - 30, bb - 9].forEach(y => { ctx.beginPath(); ctx.moveTo(bx - 16, y); ctx.lineTo(bx + 16, y); ctx.stroke(); });
  strokeC(ctx, 0x3a3a40, 1.8); ctx.beginPath(); ctx.arc(bx, bb - 36, 15, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  paintJug(ctx, cx - R - 30, baseY + 10, 0.8, "koza", "wellj");
}

// ---------- clay and copper vessels ----------
// kind: koza (terracotta water jug) | khum (big storage jar) | glazed
// (Rishtan blue glaze) | obdasta (copper ewer). (x, baseY) = the foot.
function paintJug(ctx, x, baseY, s, kind, seed) {
  const r = rng(seed || kind + x);
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  softEllipse(ctx, x + 4 * s, baseY + 2, (kind === "khum" ? 46 : 30) * s, 7 * s, 0x000000, 0.32);
  if (kind === "obdasta") {
    const c = 0xc87a3a, h = 96 * s;
    // spout
    ctx.beginPath(); ctx.moveTo(x - 12 * s, baseY - 34 * s); ctx.bezierCurveTo(x - 30 * s, baseY - 40 * s, x - 34 * s, baseY - 70 * s, x - 42 * s, baseY - 84 * s);
    ctx.lineTo(x - 37 * s, baseY - 86 * s); ctx.bezierCurveTo(x - 28 * s, baseY - 70 * s, x - 22 * s, baseY - 50 * s, x - 9 * s, baseY - 44 * s); ctx.closePath();
    ctx.fillStyle = gradL(ctx, x - 40 * s, baseY - 86 * s, x - 10 * s, baseY - 34 * s, [[0, 0xf0b070], [1, 0x8a4a1a]]); ctx.fill(); strokeC(ctx, 0x3a1a08, 1.6 * s); ctx.stroke();
    // handle
    strokeC(ctx, 0x3a1a08, 7 * s); ctx.beginPath(); ctx.moveTo(x + 8 * s, baseY - 76 * s); ctx.bezierCurveTo(x + 36 * s, baseY - 82 * s, x + 34 * s, baseY - 40 * s, x + 16 * s, baseY - 30 * s); ctx.stroke();
    strokeC(ctx, 0xd88a4a, 4 * s); ctx.stroke();
    // body: pear-shaped, tall neck, foot
    const body = () => {
      ctx.beginPath(); ctx.moveTo(x - 12 * s, baseY); ctx.lineTo(x + 12 * s, baseY); ctx.lineTo(x + 9 * s, baseY - 6 * s);
      ctx.bezierCurveTo(x + 30 * s, baseY - 14 * s, x + 30 * s, baseY - 44 * s, x + 9 * s, baseY - 58 * s);
      ctx.lineTo(x + 7 * s, baseY - 80 * s); ctx.lineTo(x + 11 * s, baseY - 86 * s); ctx.lineTo(x - 11 * s, baseY - 86 * s); ctx.lineTo(x - 7 * s, baseY - 80 * s); ctx.lineTo(x - 9 * s, baseY - 58 * s);
      ctx.bezierCurveTo(x - 30 * s, baseY - 44 * s, x - 30 * s, baseY - 14 * s, x - 9 * s, baseY - 6 * s); ctx.closePath();
    };
    body(); ctx.fillStyle = gradH(ctx, x - 28 * s, x + 28 * s, [[0, 0x7a3c12], [0.22, 0xf4c088], [0.4, c], [0.75, 0x7a3c12], [1, 0xb06a32]]); ctx.fill();
    ctx.save(); body(); ctx.clip();
    strokeC(ctx, 0x5a2a0a, 1.6 * s, 0.7); [baseY - 26 * s, baseY - 44 * s].forEach(y => { ctx.beginPath(); ctx.moveTo(x - 30 * s, y); ctx.quadraticCurveTo(x, y + 6 * s, x + 30 * s, y); ctx.stroke(); });
    fillC(ctx, 0x5a2a0a, 0.5); for (let i = -2; i <= 2; i++) { pStar(ctx, x + i * 8 * s, baseY - 35 * s, 4, 3 * s, 1.2 * s, 0); ctx.fill(); }
    ctx.restore();
    body(); strokeC(ctx, 0x3a1a08, 1.8 * s); ctx.stroke();
    // domed lid with a finial
    ctx.beginPath(); ctx.moveTo(x - 12 * s, baseY - 86 * s); ctx.quadraticCurveTo(x, baseY - 104 * s, x + 12 * s, baseY - 86 * s); ctx.closePath();
    ctx.fillStyle = gradH(ctx, x - 12 * s, x + 12 * s, [[0, 0xf4c088], [1, 0x7a3c12]]); ctx.fill(); strokeC(ctx, 0x3a1a08, 1.6 * s); ctx.stroke();
    fillC(ctx, 0xd9a441); ctx.beginPath(); ctx.arc(x, baseY - h - 4 * s, 3.4 * s, 0, 6.2832); ctx.fill();
    ctx.restore();
    return;
  }
  const big = kind === "khum";
  const h = (big ? 112 : 74) * s, bw = (big ? 42 : 27) * s, nw = (big ? 17 : 8) * s, lip = (big ? 22 : 11) * s, foot = (big ? 18 : 12) * s;
  const glazed = kind === "glazed";
  const base = glazed ? 0x1f6fa0 : (big ? r.pick([0xb8704a, 0xc6804e, 0xa86440]) : r.pick([0xc8784a, 0xd08a58, 0xb86a40]));
  const body = () => {
    ctx.beginPath(); ctx.moveTo(x - foot, baseY);
    ctx.bezierCurveTo(x - bw * 1.25, baseY - h * 0.12, x - bw * 1.08, baseY - h * 0.62, x - nw, baseY - h * 0.8);
    ctx.lineTo(x - nw * 0.95, baseY - h * 0.92); ctx.quadraticCurveTo(x - lip * 1.05, baseY - h * 0.95, x - lip, baseY - h);
    ctx.lineTo(x + lip, baseY - h); ctx.quadraticCurveTo(x + lip * 1.05, baseY - h * 0.95, x + nw * 0.95, baseY - h * 0.92);
    ctx.lineTo(x + nw, baseY - h * 0.8);
    ctx.bezierCurveTo(x + bw * 1.08, baseY - h * 0.62, x + bw * 1.25, baseY - h * 0.12, x + foot, baseY); ctx.closePath();
  };
  // handle (behind on the far side, then over the shoulder on the near side)
  if (!big) {
    strokeC(ctx, OL(base), 7.4 * s); ctx.beginPath(); ctx.moveTo(x + nw * 0.8, baseY - h * 0.86); ctx.bezierCurveTo(x + bw * 1.5, baseY - h * 0.95, x + bw * 1.5, baseY - h * 0.5, x + bw * 0.86, baseY - h * 0.48); ctx.stroke();
    strokeC(ctx, glazed ? 0x2a86b8 : lighten(base, 0.08), 4.4 * s); ctx.stroke();
  }
  body();
  ctx.fillStyle = gradR(ctx, x - bw * 0.38, baseY - h * 0.56, bw * 0.08, bw * 1.5, [[0, lighten(base, glazed ? 0.4 : 0.32)], [0.55, base], [1, darken(base, 0.4)]]); ctx.fill();
  ctx.save(); body(); ctx.clip();
  if (glazed) {
    // Rishtan glaze: white reserve band with cobalt pomegranates and leaves
    fillC(ctx, 0xf2ead8); ctx.beginPath(); ctx.ellipse(x, baseY - h * 0.5, bw * 1.2, h * 0.18, 0, 0, 6.2832); ctx.fill();
    for (let i = -2; i <= 2; i++) {
      const px = x + i * bw * 0.48, py = baseY - h * 0.5;
      fillC(ctx, 0x1a3a8a); ctx.beginPath(); ctx.arc(px, py, 5.2 * s, 0, 6.2832); ctx.fill();
      fillC(ctx, 0x2fb8ac); ctx.beginPath(); ctx.ellipse(px - 6 * s, py + 6 * s, 4 * s, 2 * s, 0.6, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.ellipse(px + 6 * s, py + 6 * s, 4 * s, 2 * s, -0.6, 0, 6.2832); ctx.fill();
      fillC(ctx, 0xb2283a); ctx.beginPath(); ctx.arc(px, py - 1 * s, 1.8 * s, 0, 6.2832); ctx.fill();
    }
    strokeC(ctx, 0x0e2a5a, 2.2 * s); [0.3, 0.7].forEach(t => { ctx.beginPath(); ctx.ellipse(x, baseY - h * t, bw * 1.3, 4 * s, 0, 0, Math.PI); ctx.stroke(); });
    fillC(ctx, 0xc8a070); ctx.fillRect(x - bw * 2, baseY - 7 * s, bw * 4, 8 * s);   // unglazed foot
    ctx.fillStyle = gradR(ctx, x - bw * 0.5, baseY - h * 0.66, 1, bw * 0.6, [[0, 0xffffff, 0.85], [0.3, 0xffffff, 0.25], [1, 0xffffff, 0]]); ctx.fillRect(x - bw * 2, baseY - h, bw * 4, h);
  } else {
    // slip-painted shoulder band and incised rings
    strokeC(ctx, 0xf2e2c4, 2.4 * s, 0.85); ctx.beginPath();
    for (let i = 0; i <= 14; i++) { const t = i / 14, px = x - bw * 1.1 + bw * 2.2 * t, py = baseY - h * 0.66 + (i % 2 ? 5 : -5) * s; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
    strokeC(ctx, darken(base, 0.35), 1.4 * s, 0.7); [0.56, 0.74].forEach(t => { ctx.beginPath(); ctx.ellipse(x, baseY - h * t, bw * 1.3, 3.4 * s, 0, 0, Math.PI); ctx.stroke(); });
    if (big) { strokeC(ctx, darken(base, 0.3), 2.2 * s, 0.6); [0.28, 0.4].forEach(t => { ctx.beginPath(); for (let i = 0; i <= 20; i++) { const px = x - bw * 1.2 + bw * 2.4 * i / 20, py = baseY - h * t + (i % 2 ? 3 : -3) * s; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); }); }
    softEllipse(ctx, x - bw * 0.42, baseY - h * 0.6, bw * 0.28, h * 0.16, 0xffffff, 0.35);
    ctx.fillStyle = gradH(ctx, x - bw, x + bw * 1.2, [[0, 0x000000, 0], [0.8, 0x000000, 0.12], [1, 0xffd0a0, 0.25]]); ctx.fillRect(x - bw * 1.3, baseY - h, bw * 2.6, h);
    softEllipse(ctx, x + bw * 0.3, baseY - 4 * s, bw * 0.9, 6 * s, 0x2a1408, 0.3);
  }
  ctx.restore();
  body(); strokeC(ctx, OL(base), 2 * s); ctx.stroke();
  // the mouth
  pEll(ctx, x, baseY - h, lip, lip * 0.32); fillC(ctx, glazed ? 0x2a86b8 : lighten(base, 0.12)); ctx.fill(); strokeC(ctx, OL(base), 1.6 * s); ctx.stroke();
  pEll(ctx, x, baseY - h + 0.5 * s, lip * 0.7, lip * 0.2); fillC(ctx, 0x1a0e08); ctx.fill();
  if (!big) {                                       // the near side of the handle, over the shoulder
    strokeC(ctx, OL(base), 6.4 * s); ctx.beginPath(); ctx.moveTo(x + nw * 0.9, baseY - h * 0.84); ctx.quadraticCurveTo(x + bw * 0.9, baseY - h * 0.9, x + bw * 1.18, baseY - h * 0.72); ctx.stroke();
    strokeC(ctx, glazed ? 0x3a9ad0 : lighten(base, 0.18), 3.6 * s); ctx.stroke();
  }
  ctx.restore();
}

// A cluster of vessels. o.n = how many, o.big = storage jars, o.kinds = list
function paintPots(ctx, cx, baseY, seed, o) {
  o = o || {};
  const r = rng(seed || "pots" + cx), n = o.n || 3;
  const kinds = o.kinds || (o.big ? ["khum", "khum", "koza"] : ["koza", "koza", "glazed", "koza", "obdasta"]);
  const gap = o.big ? 62 : 46, items = [];
  for (let i = 0; i < n; i++) items.push({ x: cx + (i - (n - 1) / 2) * gap + r.range(-6, 6), k: r.pick(kinds), s: r.range(0.82, 1.05) * (o.scale || 1), back: i % 2 === 1 });
  // the back row first, a little higher
  items.filter(it => it.back).forEach((it, i) => paintJug(ctx, it.x, baseY - 8, it.s * 0.92, it.k, seed + "b" + i));
  items.filter(it => !it.back).forEach((it, i) => paintJug(ctx, it.x, baseY, it.s, it.k, seed + "f" + i));
}

// ---------- sacks, hay, firewood ----------

function paintSacks(ctx, cx, baseY, seed) {
  const r = rng(seed || "sacks" + cx);
  softEllipse(ctx, cx + 4, baseY + 3, 98, 16, 0x000000, 0.32);
  // grain spilling at the front
  for (let i = 0; i < 40; i++) { fillC(ctx, r.pick([0xe2c27a, 0xc8a050, 0xf0d898]), 0.9); ctx.beginPath(); ctx.ellipse(cx - 20 + r.range(-34, 34), baseY + r.range(-4, 5), 2.2, 1.4, r.range(0, 3), 0, 6.2832); ctx.fill(); }
  [[-42, 0, 1, 0xcdb98e], [40, 0, 0.96, 0xc2ab7c], [0, -46, 0.92, 0xd4c298]].forEach((p, i) => {
    const x = cx + p[0], y = baseY + p[1], s = p[2], c = p[3];
    const sack = () => {
      ctx.beginPath(); ctx.moveTo(x - 32 * s, y);
      ctx.bezierCurveTo(x - 46 * s, y - 20 * s, x - 40 * s, y - 52 * s, x - 18 * s, y - 60 * s);
      ctx.quadraticCurveTo(x - 10 * s, y - 70 * s, x - 6 * s, y - 78 * s); ctx.lineTo(x + 8 * s, y - 78 * s); ctx.quadraticCurveTo(x + 10 * s, y - 68 * s, x + 20 * s, y - 60 * s);
      ctx.bezierCurveTo(x + 42 * s, y - 52 * s, x + 46 * s, y - 20 * s, x + 32 * s, y); ctx.closePath();
    };
    sack(); ctx.fillStyle = gradR(ctx, x - 12 * s, y - 40 * s, 4, 52 * s, [[0, lighten(c, 0.22)], [0.6, c], [1, darken(c, 0.32)]]); ctx.fill();
    ctx.save(); sack(); ctx.clip();
    strokeC(ctx, darken(c, 0.2), 1, 0.35);                         // burlap weave
    for (let yy = y - 78 * s; yy < y; yy += 3.4) { ctx.beginPath(); ctx.moveTo(x - 50 * s, yy); ctx.lineTo(x + 50 * s, yy + 1); ctx.stroke(); }
    for (let xx = x - 50 * s; xx < x + 50 * s; xx += 3.4) { ctx.beginPath(); ctx.moveTo(xx, y - 80 * s); ctx.lineTo(xx + 1, y); ctx.stroke(); }
    strokeC(ctx, darken(c, 0.35), 1.6, 0.5); ctx.beginPath(); ctx.moveTo(x - 20 * s, y - 52 * s); ctx.quadraticCurveTo(x - 8 * s, y - 30 * s, x - 18 * s, y - 8 * s); ctx.stroke();
    ctx.restore();
    sack(); strokeC(ctx, 0x4a3a1e, 2); ctx.stroke();
    strokeC(ctx, 0x6a4a24, 3); ctx.beginPath(); ctx.moveTo(x - 8 * s, y - 66 * s); ctx.quadraticCurveTo(x, y - 62 * s, x + 10 * s, y - 66 * s); ctx.stroke();
    if (i === 2) { fillC(ctx, r.pick([0xe8c070, 0xc85a3a, 0xf2ead8])); pEll(ctx, x + 1, y - 80 * s, 9 * s, 4 * s); ctx.fill(); }
  });
}

function paintHay(ctx, cx, baseY) {
  const r = rng("hay" + cx);
  softEllipse(ctx, cx + 6, baseY + 3, 112, 18, 0x000000, 0.32);
  const stack = () => { ctx.beginPath(); ctx.moveTo(cx - 98, baseY); ctx.bezierCurveTo(cx - 104, baseY - 70, cx - 70, baseY - 128, cx - 4, baseY - 134); ctx.bezierCurveTo(cx + 64, baseY - 132, cx + 104, baseY - 72, cx + 98, baseY); ctx.closePath(); };
  stack(); ctx.fillStyle = gradR(ctx, cx - 30, baseY - 90, 10, 140, [[0, 0xf2d98a], [0.55, 0xd6b25a], [1, 0x8a6a28]]); ctx.fill();
  ctx.save(); stack(); ctx.clip();
  for (let i = 0; i < 260; i++) {                      // straw, layered and leaning
    const x = cx + r.range(-100, 100), y = baseY - r.range(0, 136), len = r.range(10, 26), a = r.range(-0.9, 0.9) + (x - cx) * 0.004;
    strokeC(ctx, r.pick([0xf6e2a0, 0xc8a048, 0x9a7a2c, 0xe8c870]), r.range(1, 1.8), r.range(0.4, 0.85));
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * len, y - Math.cos(a) * len); ctx.stroke();
  }
  ctx.fillStyle = gradV(ctx, baseY - 40, baseY, [[0, 0x000000, 0], [1, 0x3a2a08, 0.35]]); ctx.fillRect(cx - 110, baseY - 40, 220, 42);
  ctx.restore();
  stack(); strokeC(ctx, 0x6a5218, 2.2); ctx.stroke();
  strokeC(ctx, 0x8a6a3a, 3); ctx.beginPath(); ctx.moveTo(cx - 92, baseY - 50); ctx.quadraticCurveTo(cx, baseY - 30, cx + 92, baseY - 50); ctx.stroke();   // binding rope
  strokeC(ctx, 0xd8b860, 1.4, 0.9);
  for (let i = 0; i < 26; i++) { const x = cx + r.range(-120, 120), y = baseY + r.range(-2, 6); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(-14, 14), y - r.range(0, 6)); ctx.stroke(); }   // loose straw
  // a pitchfork leaning on it
  strokeC(ctx, 0x5a3a1c, 4); ctx.beginPath(); ctx.moveTo(cx + 70, baseY + 2); ctx.lineTo(cx + 18, baseY - 150); ctx.stroke();
  strokeC(ctx, 0x6a6a70, 2.4); [-6, 0, 6].forEach(d => { ctx.beginPath(); ctx.moveTo(cx + 18 + d * 0.4, baseY - 150); ctx.lineTo(cx + 12 + d, baseY - 178); ctx.stroke(); });
}

function paintFirewood(ctx, cx, baseY) {
  const r = rng("wood" + cx);
  softEllipse(ctx, cx + 4, baseY + 3, 86, 14, 0x000000, 0.32);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5 - j; i++) {
    const x = cx - 58 + i * 29 + j * 14.5 + r.range(-2, 2), y = baseY - 14 - j * 25, rad = r.range(12, 14.5);
    // the side of the log, going back into the pile
    ctx.beginPath(); ctx.moveTo(x, y - rad); ctx.lineTo(x + 18, y - rad - 6); ctx.lineTo(x + 18, y + rad - 6); ctx.lineTo(x, y + rad); ctx.closePath();
    ctx.fillStyle = gradV(ctx, y - rad, y + rad, [[0, 0x7a5232], [1, 0x3a2414]]); ctx.fill();
    // split end grain
    pEll(ctx, x, y, rad, rad); ctx.fillStyle = gradR(ctx, x - 3, y - 3, 1, rad, [[0, 0xe8c896], [0.7, 0xc49a62], [1, 0x7a5230]]); ctx.fill();
    strokeC(ctx, 0x8a6238, 1, 0.6); [0.35, 0.6, 0.85].forEach(k => { ctx.beginPath(); ctx.arc(x + r.range(-1, 1), y + r.range(-1, 1), rad * k, 0, 6.2832); ctx.stroke(); });
    strokeC(ctx, 0x4a2c14, 1.2, 0.7); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(r.range(0, 6)) * rad, y + Math.sin(r.range(0, 6)) * rad); ctx.stroke();
    pEll(ctx, x, y, rad, rad); strokeC(ctx, 0x3a2010, 2.2); ctx.stroke();               // bark ring
  }
  // a hatchet stuck in a chopping block
  pRR(ctx, cx + 70, baseY - 30, 34, 30, 4); ctx.fillStyle = gradH(ctx, cx + 70, cx + 104, [[0, 0x9a6a3a], [1, 0x4a2c14]]); ctx.fill(); strokeC(ctx, 0x2a160a, 1.8); ctx.stroke();
  pEll(ctx, cx + 87, baseY - 30, 17, 5); fillC(ctx, 0xd8b480); ctx.fill(); ctx.stroke();
  strokeC(ctx, 0x5a3a1c, 4); ctx.beginPath(); ctx.moveTo(cx + 84, baseY - 32); ctx.lineTo(cx + 102, baseY - 70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 78, baseY - 30); ctx.lineTo(cx + 92, baseY - 36); ctx.lineTo(cx + 88, baseY - 48); ctx.lineTo(cx + 74, baseY - 42); ctx.closePath();
  ctx.fillStyle = gradV(ctx, baseY - 48, baseY - 30, [[0, 0xd8dee4], [1, 0x6a727c]]); ctx.fill(); strokeC(ctx, 0x2a2a30, 1.4); ctx.stroke();
}

// ---------- pottery kiln ----------
// A clay dome kiln. cold: long out of use - cracked, sooty, no fire.
function paintKiln(ctx, cx, baseY, o) {
  o = o || {};
  const cold = !!o.cold, r = rng("kiln" + cx + (cold ? "c" : ""));
  softEllipse(ctx, cx + 10, baseY + 4, 250, 48, 0x000000, 0.36);
  const dome = () => { ctx.beginPath(); ctx.moveTo(-200 + cx, baseY); ctx.bezierCurveTo(cx - 222, baseY - 200, cx - 110, baseY - 332, cx, baseY - 332); ctx.bezierCurveTo(cx + 110, baseY - 332, cx + 222, baseY - 200, cx + 200, baseY); ctx.closePath(); };
  const c0 = cold ? 0xb0906c : 0xdcae7c, c1 = cold ? 0x8a6a4c : 0xb8875a, c2 = cold ? 0x4a3828 : 0x6a4a30;
  dome(); ctx.fillStyle = gradH(ctx, cx - 210, cx + 210, [[0, c0], [0.45, c1], [1, c2]]); ctx.fill();
  ctx.save(); dome(); ctx.clip();
  ctx.globalAlpha = 0.3; ctx.fillStyle = patS(ctx, tileBrick(c1, darken(c1, 0.3), 30, 13, "kiln"), 1); ctx.fillRect(cx - 220, baseY - 340, 440, 340); ctx.globalAlpha = 1;
  mottle(ctx, cx - 220, baseY - 340, 440, 340, 0x3a2414, cold ? 0.4 : 0.22, 22, "kilnm" + cx, 30, 90);
  ctx.fillStyle = gradV(ctx, baseY - 332, baseY - 200, [[0, 0x1a0e08, cold ? 0.5 : 0.3], [1, 0x1a0e08, 0]]); ctx.fillRect(cx - 220, baseY - 340, 440, 140);   // soot
  if (cold) {                                      // cracks, a fallen patch, weeds
    strokeC(ctx, 0x2a1a10, 2.4);
    [[-90, -250], [60, -280], [130, -150]].forEach(p => { let x = cx + p[0], y = baseY + p[1]; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 6; k++) { x += r.range(-14, 14); y += r.range(10, 24); ctx.lineTo(x, y); } ctx.stroke(); });
    pPoly(ctx, [[cx + 40, baseY - 210], [cx + 92, baseY - 226], [cx + 104, baseY - 180], [cx + 54, baseY - 168]]); fillC(ctx, 0x6a4a34); ctx.fill(); strokeC(ctx, 0x2a1a10, 1.6); ctx.stroke();
  }
  ctx.restore();
  dome(); strokeC(ctx, 0x3a2414, 3); ctx.stroke();
  // vent on top
  pEll(ctx, cx, baseY - 330, 36, 11); fillC(ctx, 0x2a1a10); ctx.fill(); strokeC(ctx, 0x3a2414, 2.4); ctx.stroke();
  // the arched mouth - a doorway for the cold one, a firebox for the others
  pArch(ctx, cx, baseY, 120, 158, 0.55); fillC(ctx, 0x1e120a); ctx.fill(); strokeC(ctx, 0x3a2414, 4); ctx.stroke();
  ctx.save(); pArch(ctx, cx, baseY, 120, 158, 0.55); ctx.clip();
  if (cold) {
    ctx.fillStyle = gradV(ctx, baseY - 158, baseY, [[0, 0x0e0806], [1, 0x2a1a12]]); ctx.fillRect(cx - 60, baseY - 160, 120, 160);
    glowDot(ctx, cx + 10, baseY - 40, 50, 0xffc070, 0.22);               // a single oil lamp inside
    pRR(ctx, cx - 50, baseY - 60, 40, 60, 4); fillC(ctx, 0x6a5a48, 0.8); ctx.fill();    // the shared robe on a peg
  } else {
    ctx.fillStyle = gradR(ctx, cx, baseY - 30, 4, 90, [[0, 0xfff1b0, 1], [0.35, 0xff9a3a, 0.95], [1, 0x7a1a08, 0.3]]); ctx.fillRect(cx - 60, baseY - 160, 120, 160);
  }
  ctx.restore();
  // bricks round the mouth
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.105); pRR(ctx, cx + Math.cos(a) * 70 - 9, baseY - 98 + Math.sin(a) * 70 - 6, 18, 12, 3); fillC(ctx, cold ? 0x7a5a40 : 0xa8704a); ctx.fill(); strokeC(ctx, 0x3a2414, 1.4); ctx.stroke(); }
  if (cold) for (let i = 0; i < 8; i++) paintGrass(ctx, cx + r.range(-200, 200), baseY - r.range(0, 6), r.range(0.9, 1.5), 0x6a7a3a, "kg" + i);
}

// ---------- the supa ----------
// The raised wooden platform people sit and eat on, a rug and cushions on top.
function paintSupa(ctx, cx, baseY, o) {
  o = o || {};
  const w = o.w || 220, top = baseY - 46, rug = o.rug !== undefined ? o.rug : 0x8e2f2f;
  softEllipse(ctx, cx + 8, baseY + 3, w * 0.62, 16, 0x000000, 0.32);
  strokeC(ctx, 0x2a160a, 2);
  [-0.44, 0.44].forEach(k => { pRR(ctx, cx + k * w - 7, top + 8, 14, 40, 3); ctx.fillStyle = gradH(ctx, cx + k * w - 7, cx + k * w + 7, [[0, 0x9a6a3a], [1, 0x4a2c14]]); ctx.fill(); ctx.stroke(); });
  // deck seen slightly from above
  ctx.beginPath(); ctx.moveTo(cx - w / 2, top); ctx.lineTo(cx + w / 2, top); ctx.lineTo(cx + w / 2 - 18, top - 34); ctx.lineTo(cx - w / 2 + 18, top - 34); ctx.closePath();
  ctx.fillStyle = gradV(ctx, top - 34, top, [[0, 0xb08050], [1, 0x8a5c34]]); ctx.fill(); ctx.stroke();
  pRR(ctx, cx - w / 2, top, w, 14, 3); ctx.fillStyle = gradV(ctx, top, top + 14, [[0, 0x8a5c34], [1, 0x4a2c14]]); ctx.fill(); ctx.stroke();
  // rug
  ctx.save(); ctx.beginPath(); ctx.moveTo(cx - w / 2 + 26, top - 4); ctx.lineTo(cx + w / 2 - 26, top - 4); ctx.lineTo(cx + w / 2 - 38, top - 30); ctx.lineTo(cx - w / 2 + 38, top - 30); ctx.closePath(); ctx.clip();
  paintRugTop(ctx, cx - w / 2 + 26, top - 30, w - 52, 26, { base: rug });
  ctx.restore();
  // low table and a bowl
  pRR(ctx, cx - 30, top - 30, 60, 10, 3); fillC(ctx, 0x5a3418); ctx.fill();
  pEll(ctx, cx + 4, top - 32, 14, 5); fillC(ctx, 0x2a86b8); ctx.fill(); strokeC(ctx, 0x0e2a5a, 1.4); ctx.stroke();
  // bolsters
  [[-0.38, 0xb2283a], [0.38, 0x1f6f6f]].forEach(b => { pRR(ctx, cx + b[0] * w - 18, top - 22, 36, 18, 9); ctx.fillStyle = gradV(ctx, top - 22, top - 4, [[0, lighten(b[1], 0.2)], [1, darken(b[1], 0.2)]]); ctx.fill(); strokeC(ctx, OL(b[1]), 1.6); ctx.stroke(); });
}

// ---------- saddlery ----------

// A wooden rack with two finished saddles and hanging bridles.
function paintSaddleRack(ctx, cx, baseY) {
  softEllipse(ctx, cx + 6, baseY + 3, 110, 14, 0x000000, 0.3);
  strokeC(ctx, 0x2a160a, 2);
  [-80, 80].forEach(dx => { pRR(ctx, cx + dx - 6, baseY - 110, 12, 110, 3); ctx.fillStyle = gradH(ctx, cx + dx - 6, cx + dx + 6, [[0, 0x9a6a3a], [1, 0x4a2c14]]); ctx.fill(); ctx.stroke(); });
  pRR(ctx, cx - 100, baseY - 118, 200, 16, 6); ctx.fillStyle = gradV(ctx, baseY - 118, baseY - 102, [[0, 0xb08050], [1, 0x5a3a1c]]); ctx.fill(); ctx.stroke();
  [-46, 46].forEach((dx, i) => {
    const x = cx + dx, y = baseY - 118;
    ctx.beginPath(); ctx.moveTo(x - 40, y + 30); ctx.lineTo(x - 36, y - 2); ctx.lineTo(x + 36, y - 2); ctx.lineTo(x + 40, y + 30); ctx.closePath();
    ctx.fillStyle = patS(ctx, tileIkat(i ? [0x1f6f6f, PAL.gold, 0xb2283a, PAL.cream] : [0x8e2f2f, PAL.gold, 0x1c4e80, PAL.cream], "sr" + i), 0.4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 34, y - 2); ctx.quadraticCurveTo(x - 34, y - 26, x - 22, y - 30); ctx.quadraticCurveTo(x, y - 12, x + 20, y - 18); ctx.quadraticCurveTo(x + 32, y - 34, x + 34, y - 2); ctx.closePath();
    ctx.fillStyle = gradV(ctx, y - 34, y, [[0, 0x9a5a2a], [1, 0x5a2e12]]); ctx.fill(); ctx.stroke();
    fillC(ctx, PAL.gold); [x - 24, x + 22].forEach(px => { ctx.beginPath(); ctx.arc(px, y - 18, 3, 0, 6.2832); ctx.fill(); });
  });
  strokeC(ctx, 0x4a2a14, 2.4); [[-90, 0x8e2f2f], [90, 0xd9a441]].forEach(b => { ctx.beginPath(); ctx.moveTo(cx + b[0], baseY - 100); ctx.quadraticCurveTo(cx + b[0] + 12, baseY - 50, cx + b[0] - 4, baseY - 30); ctx.stroke(); fillC(ctx, b[1]); ctx.beginPath(); ctx.arc(cx + b[0] - 4, baseY - 28, 4, 0, 6.2832); ctx.fill(); });
}

// The pieces of a saddle smashed on purpose, lying in the dust.
function paintBrokenSaddle(ctx, cx, baseY) {
  softEllipse(ctx, cx + 4, baseY + 2, 90, 12, 0x000000, 0.3);
  strokeC(ctx, 0x2a160a, 2);
  ctx.save(); ctx.translate(cx - 30, baseY - 14); ctx.rotate(-0.35);
  ctx.beginPath(); ctx.moveTo(-40, 8); ctx.quadraticCurveTo(-36, -18, -20, -20); ctx.lineTo(4, -8); ctx.lineTo(-6, 4); ctx.lineTo(8, 10); ctx.closePath();
  ctx.fillStyle = gradV(ctx, -20, 10, [[0, 0xd8b07a], [1, 0x8a6238]]); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.translate(cx + 30, baseY - 10); ctx.rotate(0.5);
  ctx.beginPath(); ctx.moveTo(-6, 8); ctx.lineTo(4, -2); ctx.lineTo(-4, -10); ctx.quadraticCurveTo(20, -20, 36, -6); ctx.lineTo(30, 8); ctx.closePath();
  ctx.fillStyle = gradV(ctx, -20, 10, [[0, 0x9a5a2a], [1, 0x5a2e12]]); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(cx - 10, baseY - 4); ctx.quadraticCurveTo(cx + 30, baseY - 14, cx + 70, baseY - 2); ctx.lineTo(cx + 66, baseY + 2); ctx.quadraticCurveTo(cx + 30, baseY - 6, cx - 8, baseY + 2); ctx.closePath();
  fillC(ctx, 0x6a3418); ctx.fill(); ctx.stroke();
  strokeC(ctx, 0xc8d0d8, 3); ctx.beginPath(); ctx.ellipse(cx - 64, baseY - 8, 10, 7, 0.4, 0, 6.2832); ctx.stroke();
  fillC(ctx, 0xd8b07a); for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(cx - 40 + i * 14, baseY + 2); ctx.lineTo(cx - 36 + i * 14, baseY - 4); ctx.lineTo(cx - 30 + i * 14, baseY + 2); ctx.closePath(); ctx.fill(); }
  // the mallet
  ctx.save(); ctx.translate(cx + 90, baseY - 8); ctx.rotate(-0.2);
  strokeC(ctx, 0x5a3a1c, 5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-34, -6); ctx.stroke();
  pRR(ctx, 0, -12, 24, 22, 5); ctx.fillStyle = gradV(ctx, -12, 10, [[0, 0xb08050], [1, 0x5a3a1c]]); ctx.fill(); strokeC(ctx, 0x2a160a, 1.8); ctx.stroke();
  ctx.restore();
}

// ---------- the horse ----------
// An Akhal-Teke type: long arched neck, fine head, slim legs with real
// joints. Faces right; about 340 wide and 330 tall at s = 1.
//   o: color, mane, blaze, socks, saddle, bridle
function paintHorse(ctx, cx, baseY, s, o) {
  o = o || {};
  const c = o.color !== undefined ? o.color : 0x9a6234, mane = o.mane !== undefined ? o.mane : 0x2a1a12, ol = OL(c);
  const X = x => cx + x * s, Y = y => baseY + y * s;
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  softEllipse(ctx, cx + 4 * s, baseY + 3, 170 * s, 22 * s, 0x000000, 0.34);
  // A leg from a list of [x, y, half-width] samples down its middle.
  const leg = (pts, far, sock) => {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], pr = pts[Math.max(0, i - 1)];
      const dx = q[0] - pr[0], dy = q[1] - pr[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      L.push([X(p[0] + nx * p[2]), Y(p[1] + ny * p[2])]); R.push([X(p[0] - nx * p[2]), Y(p[1] - ny * p[2])]);
    }
    const Rr = R.reverse(), outline = L.concat(Rr);
    const col = far ? darken(c, 0.32) : c;
    pSmooth(ctx, outline, true);
    ctx.fillStyle = gradV(ctx, Y(pts[0][1]), Y(0), [[0, far ? col : darken(c, 0.16)], [0.3, col], [0.75, darken(col, sock ? 0 : 0.45)], [1, sock ? 0xf2ead8 : darken(col, 0.6)]]); ctx.fill();
    strokeC(ctx, far ? darken(ol, 0.2) : ol, 2.2 * s);
    if (far) ctx.stroke();
    else { pSmooth(ctx, L.slice(1).concat(Rr.slice(0, Rr.length - 1)), false); ctx.stroke(); }     // no seam where it joins the body
    // hoof
    const h = pts[pts.length - 1];
    ctx.beginPath(); ctx.moveTo(X(h[0] - 10), Y(-13)); ctx.lineTo(X(h[0] + 9), Y(-13)); ctx.lineTo(X(h[0] + 14), Y(0)); ctx.lineTo(X(h[0] - 11), Y(0)); ctx.closePath();
    ctx.fillStyle = gradH(ctx, X(h[0] - 11), X(h[0] + 14), [[0, 0x4a3a30], [1, 0x14100c]]); ctx.fill(); strokeC(ctx, 0x0e0a08, 1.6 * s); ctx.stroke();
  };
  // forearm/gaskin -> knee/hock -> slim cannon -> fetlock -> sloping pastern
  const foreNear = [[70, -144, 18], [72, -114, 13], [73, -90, 9.5], [74, -80, 11], [74, -71, 8.5], [74, -50, 6], [74, -32, 6], [75, -23, 8.6], [79, -15, 6.6], [84, -11, 7.2]];
  const foreFar = foreNear.map(p => [p[0] + 26, p[1] + 2, p[2] * 0.92]);
  const hindNear = [[-72, -158, 28], [-84, -128, 22], [-96, -102, 14], [-102, -86, 11], [-105, -77, 11.6], [-101, -67, 8], [-99, -48, 6.2], [-98, -32, 6.2], [-97, -23, 8.6], [-93, -15, 6.6], [-88, -11, 7.2]];
  const hindFar = hindNear.map(p => [p[0] + 24, p[1] + 2, p[2] * 0.92]);
  leg(hindFar, true, o.socks); leg(foreFar, true, false);
  // tail
  ctx.beginPath(); ctx.moveTo(X(-120), Y(-206));
  ctx.bezierCurveTo(X(-152), Y(-196), X(-166), Y(-140), X(-158), Y(-80));
  ctx.bezierCurveTo(X(-156), Y(-60), X(-150), Y(-44), X(-142), Y(-36));
  ctx.bezierCurveTo(X(-138), Y(-60), X(-136), Y(-110), X(-126), Y(-150));
  ctx.bezierCurveTo(X(-122), Y(-170), X(-116), Y(-186), X(-112), Y(-196)); ctx.closePath();
  ctx.fillStyle = gradH(ctx, X(-166), X(-112), [[0, darken(mane, 0.3)], [1, lighten(mane, 0.2)]]); ctx.fill(); strokeC(ctx, darken(mane, 0.5), 1.6 * s); ctx.stroke();
  strokeC(ctx, lighten(mane, 0.3), 1.2 * s, 0.6); for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(X(-124 - i * 5), Y(-190 + i * 4)); ctx.quadraticCurveTo(X(-150 - i * 2), Y(-130), X(-146 - i * 2), Y(-50 - i * 3)); ctx.stroke(); }
  // body, neck and head: one silhouette
  const body = () => {
    ctx.beginPath(); ctx.moveTo(X(-118), Y(-200));
    ctx.bezierCurveTo(X(-108), Y(-212), X(-90), Y(-218), X(-68), Y(-216));          // croup
    ctx.bezierCurveTo(X(-38), Y(-212), X(-12), Y(-198), X(10), Y(-198));            // back
    ctx.bezierCurveTo(X(32), Y(-198), X(50), Y(-210), X(64), Y(-220));             // withers
    ctx.bezierCurveTo(X(92), Y(-236), X(118), Y(-276), X(140), Y(-300));           // crest of the neck
    ctx.bezierCurveTo(X(146), Y(-306), X(152), Y(-308), X(158), Y(-306));          // poll
    ctx.bezierCurveTo(X(180), Y(-288), X(204), Y(-252), X(216), Y(-226));          // face
    ctx.bezierCurveTo(X(222), Y(-214), X(220), Y(-202), X(212), Y(-200));          // muzzle
    ctx.bezierCurveTo(X(204), Y(-196), X(196), Y(-198), X(190), Y(-202));          // chin
    ctx.bezierCurveTo(X(180), Y(-208), X(176), Y(-226), X(166), Y(-238));          // jaw
    ctx.bezierCurveTo(X(156), Y(-236), X(140), Y(-212), X(132), Y(-190));          // throat
    ctx.bezierCurveTo(X(126), Y(-172), X(128), Y(-150), X(116), Y(-136));          // chest
    ctx.bezierCurveTo(X(100), Y(-124), X(86), Y(-122), X(70), Y(-122));            // girth
    ctx.bezierCurveTo(X(30), Y(-110), X(-30), Y(-110), X(-60), Y(-126));           // belly
    ctx.bezierCurveTo(X(-74), Y(-132), X(-86), Y(-142), X(-104), Y(-150));         // stifle
    ctx.bezierCurveTo(X(-124), Y(-160), X(-130), Y(-180), X(-118), Y(-200)); ctx.closePath();
  };
  body(); ctx.fillStyle = gradV(ctx, Y(-306), Y(-110), [[0, lighten(c, 0.16)], [0.55, c], [1, darken(c, 0.3)]]); ctx.fill();
  ctx.save(); body(); ctx.clip();
  // muscle light: shoulder, hip, neck; shade along the belly and under the jaw
  softEllipse(ctx, X(62), Y(-178), 42 * s, 30 * s, 0xffffff, 0.2);
  softEllipse(ctx, X(-74), Y(-182), 46 * s, 30 * s, 0xffffff, 0.2);
  softEllipse(ctx, X(110), Y(-248), 22 * s, 40 * s, 0xffffff, 0.16);
  softEllipse(ctx, X(0), Y(-114), 90 * s, 18 * s, 0x000000, 0.28);
  softEllipse(ctx, X(160), Y(-222), 20 * s, 14 * s, 0x000000, 0.22);
  strokeC(ctx, darken(c, 0.35), 1.6 * s, 0.55);
  ctx.beginPath(); ctx.moveTo(X(86), Y(-206)); ctx.quadraticCurveTo(X(60), Y(-176), X(84), Y(-142)); ctx.stroke();                  // shoulder line
  ctx.beginPath(); ctx.moveTo(X(-50), Y(-206)); ctx.quadraticCurveTo(X(-80), Y(-188), X(-96), Y(-152)); ctx.stroke();               // hip line
  ctx.beginPath(); ctx.moveTo(X(168), Y(-246)); ctx.quadraticCurveTo(X(182), Y(-226), X(196), Y(-214)); ctx.stroke();               // cheek
  if (o.blaze) { fillC(ctx, 0xf6ecd8, 0.92); ctx.beginPath(); ctx.moveTo(X(170), Y(-290)); ctx.quadraticCurveTo(X(196), Y(-260), X(214), Y(-216)); ctx.quadraticCurveTo(X(204), Y(-236), X(180), Y(-276)); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  body(); strokeC(ctx, ol, 2.4 * s); ctx.stroke();
  leg(hindNear, false, o.socks); leg(foreNear, false, false);
  // mane along the crest, and the forelock
  ctx.beginPath(); ctx.moveTo(X(156), Y(-310));
  ctx.bezierCurveTo(X(130), Y(-300), X(100), Y(-262), X(62), Y(-226));
  const mp = [[62, -226], [74, -218], [84, -232], [96, -226], [104, -246], [116, -242], [122, -264], [134, -262], [138, -284], [150, -290]];
  for (let i = 1; i < mp.length; i++) ctx.quadraticCurveTo(X(mp[i - 1][0] + 8), Y(mp[i - 1][1] + 10), X(mp[i][0]), Y(mp[i][1]));
  ctx.closePath();
  ctx.fillStyle = gradV(ctx, Y(-310), Y(-220), [[0, lighten(mane, 0.15)], [1, mane]]); ctx.fill(); strokeC(ctx, darken(mane, 0.5), 1.6 * s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(156), Y(-308)); ctx.quadraticCurveTo(X(176), Y(-300), X(178), Y(-282)); ctx.quadraticCurveTo(X(166), Y(-292), X(152), Y(-296)); ctx.closePath(); fillC(ctx, mane); ctx.fill();
  // ears
  [[150, -306, 142, -334, darken(c, 0.25)], [158, -306, 160, -336, c]].forEach(e => {
    ctx.beginPath(); ctx.moveTo(X(e[0] - 5), Y(e[1])); ctx.quadraticCurveTo(X(e[2] - 6), Y(e[3] + 14), X(e[2]), Y(e[3])); ctx.quadraticCurveTo(X(e[2] + 7), Y(e[3] + 16), X(e[0] + 6), Y(e[1] + 2)); ctx.closePath();
    fillC(ctx, e[4]); ctx.fill(); strokeC(ctx, ol, 1.8 * s); ctx.stroke();
  });
  // eye, nostril, mouth
  ctx.beginPath(); ctx.ellipse(X(178), Y(-266), 6 * s, 4.2 * s, 0.5, 0, 6.2832); fillC(ctx, 0x140c08); ctx.fill();
  fillC(ctx, 0xffffff, 0.9); ctx.beginPath(); ctx.arc(X(176.5), Y(-267.5), 1.5 * s, 0, 6.2832); ctx.fill();
  strokeC(ctx, darken(c, 0.5), 1.4 * s); ctx.beginPath(); ctx.arc(X(178), Y(-268), 8 * s, Math.PI * 1.05, Math.PI * 1.7); ctx.stroke();
  fillC(ctx, 0x1a0e08, 0.85); ctx.beginPath(); ctx.ellipse(X(210), Y(-214), 4 * s, 2.6 * s, 0.6, 0, 6.2832); ctx.fill();
  strokeC(ctx, darken(c, 0.5), 1.4 * s); ctx.beginPath(); ctx.moveTo(X(196), Y(-202)); ctx.quadraticCurveTo(X(204), Y(-204), X(212), Y(-203)); ctx.stroke();
  // tack: bridle with tassels, breastplate, decorated saddle, stirrup
  if (o.bridle !== false) {
    strokeC(ctx, 0x6a1a1a, 3.4 * s);
    ctx.beginPath(); ctx.moveTo(X(156), Y(-302)); ctx.quadraticCurveTo(X(160), Y(-270), X(184), Y(-218)); ctx.stroke();       // cheekpiece
    ctx.beginPath(); ctx.moveTo(X(198), Y(-238)); ctx.quadraticCurveTo(X(212), Y(-228), X(218), Y(-222)); ctx.stroke();       // noseband
    ctx.beginPath(); ctx.moveTo(X(166), Y(-294)); ctx.lineTo(X(178), Y(-290)); ctx.stroke();                                  // browband
    fillC(ctx, PAL.gold); [[184, -220], [166, -292]].forEach(p => { ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3.2 * s, 0, 6.2832); ctx.fill(); });
    strokeC(ctx, 0x3a1a10, 2 * s); ctx.beginPath(); ctx.moveTo(X(194), Y(-206)); ctx.quadraticCurveTo(X(140), Y(-180), X(54), Y(-214)); ctx.stroke();   // rein
    [[172, -292], [178, -289]].forEach(p => { strokeC(ctx, 0xc8282a, 2.6 * s); ctx.beginPath(); ctx.moveTo(X(p[0]), Y(p[1])); ctx.lineTo(X(p[0] + 1), Y(p[1] + 14)); ctx.stroke(); });
    strokeC(ctx, 0x6a1a1a, 3.4 * s); ctx.beginPath(); ctx.moveTo(X(64), Y(-214)); ctx.quadraticCurveTo(X(118), Y(-170), X(126), Y(-150)); ctx.stroke();   // breastplate
    for (let i = 0; i < 4; i++) { const px = 96 + i * 8, py = -188 + i * 10; fillC(ctx, i % 2 ? PAL.gold : 0xc8282a); ctx.beginPath(); ctx.moveTo(X(px), Y(py)); ctx.lineTo(X(px - 3), Y(py + 14)); ctx.lineTo(X(px + 3), Y(py + 14)); ctx.closePath(); ctx.fill(); }
  }
  if (o.saddle) {
    // ikat saddle cloth with a fringe
    ctx.beginPath(); ctx.moveTo(X(-34), Y(-206)); ctx.quadraticCurveTo(X(10), Y(-212), X(48), Y(-210)); ctx.lineTo(X(44), Y(-138)); ctx.quadraticCurveTo(X(6), Y(-130), X(-30), Y(-138)); ctx.closePath();
    ctx.fillStyle = patS(ctx, tileIkat([0x8e2f2f, PAL.gold, 0x1c4e80, PAL.cream], "horse"), 0.55 * s); ctx.fill();
    ctx.fillStyle = gradV(ctx, Y(-212), Y(-130), [[0, 0xffffff, 0.12], [1, 0x000000, 0.3]]); ctx.fill(); strokeC(ctx, 0x3a1414, 2 * s); ctx.stroke();
    fillC(ctx, PAL.gold); for (let x = -28; x < 44; x += 7) { ctx.beginPath(); ctx.moveTo(X(x), Y(-136)); ctx.lineTo(X(x + 3), Y(-126)); ctx.lineTo(X(x + 6), Y(-136)); ctx.closePath(); ctx.fill(); }
    // girth
    strokeC(ctx, 0x4a2a14, 6 * s); ctx.beginPath(); ctx.moveTo(X(30), Y(-136)); ctx.quadraticCurveTo(X(40), Y(-122), X(44), Y(-112)); ctx.stroke();
    // the wooden saddle with its tall pommel
    ctx.beginPath(); ctx.moveTo(X(-26), Y(-206)); ctx.quadraticCurveTo(X(-30), Y(-234), X(-16), Y(-236)); ctx.quadraticCurveTo(X(6), Y(-218), X(26), Y(-222));
    ctx.quadraticCurveTo(X(34), Y(-250), X(44), Y(-246)); ctx.quadraticCurveTo(X(46), Y(-222), X(40), Y(-208)); ctx.quadraticCurveTo(X(8), Y(-214), X(-26), Y(-206)); ctx.closePath();
    ctx.fillStyle = gradV(ctx, Y(-250), Y(-204), [[0, 0xb06a32], [1, 0x5a2e12]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2 * s); ctx.stroke();
    fillC(ctx, PAL.gold); [[-18, -228], [40, -238], [10, -216]].forEach(p => { ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3 * s, 0, 6.2832); ctx.fill(); });
    // stirrup
    strokeC(ctx, 0x4a2a14, 3 * s); ctx.beginPath(); ctx.moveTo(X(8), Y(-212)); ctx.lineTo(X(10), Y(-150)); ctx.stroke();
    strokeC(ctx, 0x3a3a40, 4 * s); ctx.beginPath(); ctx.moveTo(X(0), Y(-132)); ctx.quadraticCurveTo(X(10), Y(-160), X(20), Y(-132)); ctx.closePath(); ctx.stroke();
    strokeC(ctx, 0xc8d0d8, 2 * s); ctx.stroke();
  }
  ctx.restore();
}
