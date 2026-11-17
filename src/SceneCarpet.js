// ============================================================
// SceneCarpet.js — the flights between places.
//
// Hold Space / W / Up / the mouse / a finger to rise, let go to
// sink. Thread the gaps between the towers below and whatever
// hangs above them.
//
// Every collision is tested against the painted pixels themselves
// (see texMask): the carpet and its rider are a row of thin
// top-to-bottom slices, each obstacle is a per-column outline read
// from its own picture. If the carpet visibly clears something it
// has cleared it; if it visibly touches, it has touched.
//
// Golden sparks are optional: every 12 caught gives back a heart.
// Hazards, by flight: bird flocks, diving falcons, bats, arrow
// volleys (a "!" warns where they come from), archers on the
// ground (watch them draw - the line shows where they aim), wind
// gusts, chimney smoke that lifts you, kites on long strings and
// lightning (the sky flashes where it will strike).
//
// Three hits and the carpet tumbles: you restart from the start,
// or from the halfway lantern if you reached it on THIS attempt.
// After two tumbles the pause menu offers to skip the flight.
// ============================================================

const GROUND_Y = 960, CARPET_X = 430;
const MASK_EMPTY = 32000;

// ---------- pixel masks ----------
// For each column of a painted texture: the first row from the top and
// the last row from the bottom whose alpha reaches `thr`. `spread` widens
// hair-thin features (finials, strings) so they can't slip between the
// carpet's sample slices. Cached on the canvas, so a repainted texture
// (every scene start) gets a fresh mask.
function texMask(scene, key, thr, spread) {
  const src = scene.textures.get(key).getSourceImage();
  if (src._mask && src._mask.thr === thr && src._mask.spread === spread) return src._mask;
  const w = src.width, h = src.height;
  const data = src.getContext("2d").getImageData(0, 0, w, h).data;
  const top = new Int16Array(w).fill(MASK_EMPTY), bot = new Int16Array(w).fill(-MASK_EMPTY);
  const row = w * 4;
  for (let x = 0; x < w; x++) {
    for (let y = 0, i = x * 4 + 3; y < h; y++, i += row) if (data[i] >= thr) { top[x] = y; break; }
    for (let y = h - 1, i = (h - 1) * row + x * 4 + 3; y >= 0; y--, i -= row) if (data[i] >= thr) { bot[x] = y; break; }
  }
  const s = spread || 0, T = new Int16Array(w), B = new Int16Array(w);
  let minTop = MASK_EMPTY, maxBot = -MASK_EMPTY;
  for (let x = 0; x < w; x++) {
    let t = MASK_EMPTY, b = -MASK_EMPTY;
    for (let k = -s; k <= s; k++) {
      const j = x + k;
      if (j < 0 || j >= w) continue;
      if (top[j] < t) t = top[j];
      if (bot[j] > b) b = bot[j];
    }
    T[x] = t; B[x] = b;
    if (t < minTop) minTop = t;
    if (b > maxBot) maxBot = b;
  }
  return (src._mask = { w, h, top: T, bot: B, minTop, maxBot, thr, spread });
}

// ---------- the carpet + rider rig (also used on the title screen) ----------

function makeFlyingCarpet(scene, x, y, scale) {
  const SW = 320, SH = 80, N = 16;
  Tex.make(scene, "carpet-strip", SW, SH, ctx => paintCarpetStrip(ctx, SW, SH), true);
  const tex = scene.textures.get("carpet-strip");
  if (!tex.has("s0")) for (let i = 0; i < N; i++) tex.add("s" + i, 0, i * SW / N, 0, SW / N, SH);
  Tex.make(scene, "rider", 170, 180, (ctx) => { ctx.translate(85, 150); paintRider(ctx, HERO); }, true);
  const c = scene.add.container(x, y);
  const slices = [];
  for (let i = 0; i < N; i++) {
    const s = scene.add.image(-SW / 2 + (i + 0.5) * SW / N, 0, "carpet-strip", "s" + i);
    s.setDisplaySize(SW / N + 0.8, SH);
    slices.push(s);
  }
  const rider = scene.add.image(-6, -12, "rider").setOrigin(0.5, 150 / 180);
  c.add(slices.concat([rider]));
  c.setScale(scale || 1);
  c.rider = rider; c.slices = slices; c.wave = 1; c.t = 0;
  scene.onUpdate((time, d) => {
    if (!c.active) return;
    c.t += d / 1000;
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1);
      slices[i].y = Math.sin(c.t * 7 - k * 5) * 5 * c.wave * (0.25 + k * 0.9);
    }
    rider.y = -12 + slices[N >> 1].y * 0.8;
  });
  return c;
}

// ---------- obstacle painters ----------
// Towers stand on the ground at the bottom of a w x h canvas.

function paintFlightTower(ctx, kind, w, h, seed) {
  const cx = w / 2, by = h;
  if (kind === "minaret") {
    paintMinaret(ctx, cx, by, 86, h - 150, { color: 0xc8925a, dome: PAL.turquoise });
  } else if (kind === "dome") {
    const bw = 170, top = 240;
    ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, 0x8a5a7a], [0.5, 0x6a3a5a], [1, 0x3a2040]]); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, PAL.turquoise, 40), 0.8);
    for (let y = top + 80; y < h; y += 260) ctx.fillRect(cx - bw / 2, y, bw, 34);
    fillC(ctx, 0xffc870, 0.9); for (let y = top + 160; y < h; y += 260) { pArch(ctx, cx - 40, y + 70, 30, 60, 0.5); ctx.fill(); pArch(ctx, cx + 40, y + 70, 30, 60, 0.5); ctx.fill(); }
    strokeC(ctx, 0x1a1020, 2.4); ctx.strokeRect(cx - bw / 2, top, bw, h - top);
    paintDome(ctx, cx, top, 92, { color: 0x2f9aa8, drum: 0x8a5a7a });
  } else if (kind === "spire") {
    const r = rng("spire" + seed);
    let y = by, wd = 128;
    while (y > 190) {
      const bh = r.range(70, 120), nw = wd * r.range(0.9, 0.99);
      ctx.beginPath(); ctx.moveTo(cx - wd / 2, y); ctx.lineTo(cx - nw / 2 + r.range(-6, 6), y - bh); ctx.lineTo(cx + nw / 2 + r.range(-6, 6), y - bh); ctx.lineTo(cx + wd / 2, y); ctx.closePath();
      ctx.fillStyle = gradH(ctx, cx - wd / 2, cx + wd / 2, [[0, 0xb0b8c0], [0.5, 0x8a929c], [1, 0x50586a]]); ctx.fill(); strokeC(ctx, 0x2a303c, 2.2); ctx.stroke();
      y -= bh; wd = nw;
    }
    ctx.fillStyle = gradH(ctx, cx - 50, cx + 50, [[0, 0xd8c8a8], [1, 0x8a7a5a]]); ctx.fillRect(cx - 50, y - 90, 100, 90); strokeC(ctx, 0x3a3020, 2.2); ctx.strokeRect(cx - 50, y - 90, 100, 90);
    fillC(ctx, 0x2a2018); [-25, 0, 25].forEach(dx => { pRR(ctx, cx + dx - 8, y - 78, 16, 50, 6); ctx.fill(); });
    strokeC(ctx, 0x2a1a10, 4); ctx.beginPath(); ctx.moveTo(cx, y - 90); ctx.lineTo(cx, y - 160); ctx.stroke();
    fillC(ctx, 0xb2283a); ctx.beginPath(); ctx.moveTo(cx, y - 160); ctx.quadraticCurveTo(cx + 40, y - 150, cx + 70, y - 146); ctx.lineTo(cx, y - 128); ctx.closePath(); ctx.fill();
  } else if (kind === "rock" || kind === "pillar") {
    const r = rng(kind + seed), sand = kind === "pillar";
    const c0 = sand ? 0xe8bc84 : 0xd88a5a, c1 = sand ? 0xc08850 : 0xb0603a, c2 = sand ? 0x7a5030 : 0x6a3020, ol = sand ? 0x4a2c14 : 0x3a1a10;
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([cx - 70 - t * 22 + r.range(-14, 14), 210 + (by - 210) * (1 - t)]); }
    pts.push([cx - 56, 190], [cx - 14, 158 + r.range(-8, 8)], [cx + 30, 172], [cx + 66, 204]);
    for (let i = 10; i >= 0; i--) { const t = i / 10; pts.push([cx + 70 + t * 22 + r.range(-14, 14), 210 + (by - 210) * (1 - t)]); }
    pSmooth(ctx, pts, true);
    ctx.fillStyle = gradH(ctx, cx - 92, cx + 92, [[0, c0], [0.45, c1], [1, c2]]); ctx.fill();
    ctx.save(); pSmooth(ctx, pts, true); ctx.clip();
    for (let y = 236; y < by; y += 46) { fillC(ctx, r.chance(0.5) ? 0x000000 : 0xffffff, 0.09); ctx.fillRect(0, y + r.range(-6, 6), w, r.range(10, 20)); }
    strokeC(ctx, ol, 1.6, 0.45);
    for (let i = 0; i < 7; i++) { const x = cx + r.range(-50, 50), y = r.range(260, by - 60); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(-12, 12), y + r.range(20, 50)); ctx.lineTo(x + r.range(-16, 16), y + r.range(50, 90)); ctx.stroke(); }
    ctx.fillStyle = gradV(ctx, 150, 260, [[0, 0xffffff, 0.22], [1, 0xffffff, 0]]); ctx.fillRect(0, 140, w, 120);
    ctx.restore();
    pSmooth(ctx, pts, true); strokeC(ctx, ol, 2.6); ctx.stroke();
  } else if (kind === "walltower") {
    const bw = 156, top = 250;
    ctx.fillStyle = patS(ctx, tileBrick(0x6e6684, 0x3a3450, 34, 15, "wtb"), 1); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, 0xffffff, 0.16], [0.45, 0x000000, 0], [1, 0x000000, 0.5]]); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    strokeC(ctx, 0x1a1628, 2.4); ctx.strokeRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = gradV(ctx, top - 10, top + 14, [[0, 0x8a82a2], [1, 0x4a4262]]); ctx.fillRect(cx - bw / 2 - 14, top - 10, bw + 28, 24);
    strokeC(ctx, 0x1a1628, 2.2); ctx.strokeRect(cx - bw / 2 - 14, top - 10, bw + 28, 24);
    for (let i = 0; i < 5; i++) {
      const x = cx - bw / 2 - 14 + i * ((bw + 28 - 24) / 4);
      pRR(ctx, x, top - 50, 24, 42, 3); ctx.fillStyle = gradH(ctx, x, x + 24, [[0, 0x8a82a2], [1, 0x50486a]]); ctx.fill(); strokeC(ctx, 0x1a1628, 2); ctx.stroke();
    }
    for (let y = top + 90; y < h - 80; y += 220) {
      glowDot(ctx, cx, y + 30, 46, 0xffa040, 0.32);
      pArch(ctx, cx, y + 62, 16, 62, 0.8); fillC(ctx, 0xffb050); ctx.fill(); strokeC(ctx, 0x1a1020, 2); ctx.stroke();
    }
    // the king's banner
    ctx.beginPath(); ctx.moveTo(cx - 40, top + 16); ctx.lineTo(cx + 40, top + 16); ctx.lineTo(cx + 40, top + 150); ctx.lineTo(cx, top + 128); ctx.lineTo(cx - 40, top + 150); ctx.closePath();
    ctx.fillStyle = gradH(ctx, cx - 40, cx + 40, [[0, 0xa83a3a], [1, 0x5a1a22]]); ctx.fill(); strokeC(ctx, 0x2a0a10, 2); ctx.stroke();
    fillC(ctx, PAL.gold); pStar(ctx, cx, top + 70, 8, 22, 12, 0); ctx.fill();
  } else if (kind === "chimney") {
    const b0 = 126, b1 = 94, top = 250;
    const shaft = () => { ctx.beginPath(); ctx.moveTo(cx - b0 / 2, h); ctx.lineTo(cx - b1 / 2, top); ctx.lineTo(cx + b1 / 2, top); ctx.lineTo(cx + b0 / 2, h); ctx.closePath(); };
    shaft(); ctx.fillStyle = patS(ctx, tileBrick(0xb8704a, 0x6a3a26, 28, 12, "chim"), 1); ctx.fill();
    ctx.save(); shaft(); ctx.clip();
    ctx.fillStyle = gradH(ctx, cx - b0 / 2, cx + b0 / 2, [[0, 0xffffff, 0.14], [0.45, 0x000000, 0], [1, 0x000000, 0.5]]); ctx.fillRect(0, top, w, h);
    ctx.fillStyle = gradV(ctx, top, top + 260, [[0, 0x1a1010, 0.7], [1, 0x1a1010, 0]]); ctx.fillRect(0, top, w, 260);
    fillC(ctx, PAL.turquoise, 0.85); for (let y = top + 330; y < h; y += 280) ctx.fillRect(0, y, w, 12);
    ctx.restore();
    shaft(); strokeC(ctx, 0x2a140a, 2.4); ctx.stroke();
    pRR(ctx, cx - b1 / 2 - 16, top - 30, b1 + 32, 32, 6); ctx.fillStyle = gradV(ctx, top - 30, top + 2, [[0, 0x9a6040], [1, 0x4a2414]]); ctx.fill(); strokeC(ctx, 0x2a140a, 2.4); ctx.stroke();
    pEll(ctx, cx, top - 30, b1 / 2 + 8, 9); fillC(ctx, 0x140a08); ctx.fill(); strokeC(ctx, 0x2a140a, 2); ctx.stroke();
    glowDot(ctx, cx, top - 32, 30, 0xff8a30, 0.5);
  } else if (kind === "cypress") {
    paintTree(ctx, cx, h, "cypress", 2.9, "flc" + seed, { leaf: 0x3a5a48, trunk: 0x3a2c28, shadow: false });
  } else if (kind === "poplar") {
    paintTree(ctx, cx, h, "poplar", 2.25, "flp" + seed, { leaf: 0x7a9a42, shadow: false });
  } else {                                                   // storm watchtower
    const bw = 150, top = 210;
    ctx.fillStyle = patS(ctx, tileBrick(0x4a4658, 0x2a2836, 30, 14, "stw"), 1); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, 0xffffff, 0.12], [1, 0x000000, 0.5]]); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    fillC(ctx, 0x3a3648); for (let x = cx - bw / 2 - 10; x < cx + bw / 2; x += 34) ctx.fillRect(x, top - 34, 22, 36);
    ctx.fillRect(cx - bw / 2 - 12, top - 4, bw + 24, 18);
    strokeC(ctx, 0x0e0c14, 2.4); ctx.strokeRect(cx - bw / 2, top, bw, h - top);
    glowDot(ctx, cx, top + 120, 70, 0xffa040, 0.5);
    fillC(ctx, 0xffc060); pArch(ctx, cx, top + 150, 34, 70, 0.5); ctx.fill();
  }
}

// A heavy cloud hanging from the top of the sky. Its underside is a row of
// crisp, shaded lobes with a darker rim: the part the carpet ducks under.
//   o: seed, color, top (colour high up), lit, shade, rim
function paintHangingCloud(ctx, w, h, o) {
  const r = rng(o.seed), cx = w / 2, half = w * 0.29, bottom = h - 34;
  const lobes = [], n = 5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), k = Math.sin(Math.PI * (0.12 + 0.76 * t));
    const rad = (46 + 30 * k) * r.range(0.92, 1.08);
    lobes.push([cx - half * 0.98 + half * 1.96 * t + r.range(-6, 6), bottom - rad - (1 - k) * 34 - r.range(0, 8), rad]);
  }
  // scalloped sides: billows bulging outward, growing toward the bottom
  const side = s => {                       // narrower up high, swelling toward the base
    const pts = [];
    for (let y = -110; y < bottom - 230; y += r.range(110, 165)) pts.push([cx + s * (half * (0.78 + 0.22 * y / bottom) + r.range(-16, 12)), y, r.range(18, 40)]);
    pts.push([cx + s * (half + 8), bottom - 92, 30]);
    return pts;
  };
  const SL = side(-1), SR = side(1);
  const bumps = [];
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(SL[0][0], -60);
    ctx.lineTo(SL[0][0], SL[0][1]);
    for (let i = 0; i < SL.length - 1; i++) { const a = SL[i], b = SL[i + 1]; ctx.quadraticCurveTo(Math.min(a[0], b[0]) - b[2] * 2, (a[1] + b[1]) / 2, b[0], b[1]); }
    ctx.lineTo(SR[SR.length - 1][0], SR[SR.length - 1][1]);
    for (let i = SR.length - 1; i > 0; i--) { const a = SR[i], b = SR[i - 1]; ctx.quadraticCurveTo(Math.max(a[0], b[0]) + a[2] * 2, (a[1] + b[1]) / 2, b[0], b[1]); }
    ctx.lineTo(SR[0][0], -60);
    ctx.closePath();
    lobes.forEach(l => { ctx.moveTo(l[0] + l[2], l[1]); ctx.arc(l[0], l[1], l[2], 0, 6.2832); });
  };
  [SL, SR].forEach((S, si) => { for (let i = 0; i < S.length - 1; i++) bumps.push([(S[i][0] + S[i + 1][0]) / 2 + (si ? 1 : -1) * 6, (S[i][1] + S[i + 1][1]) / 2, 40 + S[i + 1][2], si]); });
  // faint haze round the edge (well below the collision threshold)
  lobes.forEach(p => softEllipse(ctx, p[0], p[1] + 4, p[2] * 1.22, p[2] * 1.16, o.lit, 0.16));
  bumps.forEach(p => softEllipse(ctx, p[0] + (p[3] ? 14 : -14), p[1], p[2] * 1.1, p[2] * 1.2, o.lit, 0.12));
  shape();
  ctx.fillStyle = gradV(ctx, 0, bottom, [[0, o.top], [0.5, o.color], [0.84, o.color], [1, o.shade]]); ctx.fill();
  ctx.save(); shape(); ctx.clip();
  // volume: lit billows down the left, shadowed ones down the right
  bumps.forEach(p => {
    ctx.beginPath(); ctx.arc(p[0], p[1], p[2] * 1.25, 0, 6.2832);
    ctx.fillStyle = p[3] ? gradR(ctx, p[0] + p[2] * 0.3, p[1] + p[2] * 0.3, 2, p[2] * 1.3, [[0, o.shade, 0.55], [1, o.shade, 0]])
      : gradR(ctx, p[0] - p[2] * 0.3, p[1] - p[2] * 0.4, 2, p[2] * 1.3, [[0, o.lit, 0.75], [1, o.lit, 0]]);
    ctx.fill();
  });
  for (let i = 0; i < 5; i++) {                           // soft inner billows
    const x = cx + r.range(-half * 0.5, half * 0.5), y = r.range(60, bottom - 240), rad = r.range(40, 70);
    softEllipse(ctx, x - rad * 0.2, y - rad * 0.25, rad * 0.9, rad * 0.6, o.lit, 0.22);
    softEllipse(ctx, x + rad * 0.15, y + rad * 0.45, rad, rad * 0.4, o.shade, 0.18);
  }
  lobes.forEach(p => {
    ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0, 6.2832);
    ctx.fillStyle = gradR(ctx, p[0] - p[2] * 0.35, p[1] - p[2] * 0.5, p[2] * 0.05, p[2] * 1.15, [[0, o.lit, 0.8], [0.5, o.color, 0.3], [1, o.shade, 0.7]]);
    ctx.fill();
  });
  const env = x => {                         // the underside, column by column
    let y = -1e9;
    lobes.forEach(l => { const dx = x - l[0]; if (Math.abs(dx) < l[2]) y = Math.max(y, l[1] + Math.sqrt(l[2] * l[2] - dx * dx)); });
    return y;
  };
  ctx.beginPath();
  let first = true;
  for (let x = cx - half * 1.5; x <= cx + half * 1.5; x += 4) { const y = env(x); if (y < -1e8) continue; if (first) { ctx.moveTo(x, y - 40); first = false; } else ctx.lineTo(x, y - 40); }
  for (let x = cx + half * 1.5; x >= cx - half * 1.5; x -= 4) { const y = env(x); if (y < -1e8) continue; ctx.lineTo(x, y + 2); }
  ctx.closePath(); fillC(ctx, o.shade, 0.35); ctx.fill();
  ctx.restore();
  strokeC(ctx, o.rim, 3.2, 0.8); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.beginPath();
  first = true;
  for (let x = cx - half * 1.5; x <= cx + half * 1.5; x += 3) { const y = env(x); if (y < -1e8) { first = true; continue; } if (first) { ctx.moveTo(x, y - 1.6); first = false; } else ctx.lineTo(x, y - 1.6); }
  ctx.stroke();
}

// A cliff overhang: jagged rock from the top of the frame ending in a few
// hanging points.  o: seed, c0 (lit), c1, c2 (shadow), ol (outline)
function paintHangingRock(ctx, w, h, o) {
  const r = rng(o.seed), cx = w / 2, half = w * 0.31, bottom = h - 26;
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([cx - half - 16 * Math.sin(t * 3) + r.range(-10, 10), -30 + (bottom - 140) * t]); }
  const teeth = [[-0.78, 70], [-0.5, 8], [-0.22, 56], [0.06, 18], [0.34, 74], [0.6, 30], [0.86, 96]];
  teeth.forEach(t => pts.push([cx + half * t[0] + r.range(-6, 6), bottom - t[1] + r.range(-8, 8)]));
  for (let i = 8; i >= 0; i--) { const t = i / 8; pts.push([cx + half + 14 * Math.sin(t * 2.5) + r.range(-10, 10), -30 + (bottom - 140) * t]); }
  pPoly(ctx, pts);
  ctx.fillStyle = gradH(ctx, cx - half, cx + half, [[0, o.c0], [0.45, o.c1], [1, o.c2]]); ctx.fill();
  ctx.save(); pPoly(ctx, pts); ctx.clip();
  for (let y = 20; y < bottom; y += 44) { fillC(ctx, r.chance(0.5) ? 0x000000 : 0xffffff, 0.1); ctx.fillRect(0, y + r.range(-6, 6), w, r.range(8, 18)); }
  ctx.fillStyle = gradV(ctx, bottom - 160, bottom, [[0, 0x000000, 0], [1, 0x000000, 0.42]]); ctx.fillRect(0, bottom - 160, w, 170);
  strokeC(ctx, o.ol, 1.4, 0.5);
  for (let i = 0; i < 8; i++) { const x = cx + r.range(-half * 0.8, half * 0.8), y = r.range(40, bottom - 120); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(-14, 14), y + r.range(24, 50)); ctx.lineTo(x + r.range(-18, 18), y + r.range(50, 96)); ctx.stroke(); }
  ctx.restore();
  pPoly(ctx, pts); strokeC(ctx, o.ol, 2.8); ctx.lineJoin = "round"; ctx.stroke();
}

// ---------- hazard painters ----------

// A bird in profile, flying left. f = 0..3: wings high -> wings low.
// Frame 130 x 96, body centred at (66, 50).
function paintFlightBird(ctx, kind, f) {
  const C = kind === "falcon"
    ? { back: 0x74502f, wing: 0x543620, cover: 0x9a744a, belly: 0xeee2c8, bar: 0x8a6440, beak: 0x2e2a2c, cere: 0xe8b830, tail: 0x5e3e24 }
    : { back: 0x34303c, wing: 0x26222c, cover: 0x48425a, belly: 0x4a4458, bar: null, beak: 0x2a2630, cere: null, tail: 0x2c2834 };
  const k = [1, 0.5, -0.12, -0.72][f];
  ctx.save(); ctx.translate(66, 50); ctx.lineJoin = "round"; ctx.lineCap = "round";
  // One wing, raised (kk > 0) or lowered (kk < 0): a swept, tapering arm
  // with a scalloped trailing edge and splayed primaries at the tip.
  const wing = (dx, kk, col, cov) => {
    const L = 58, sweep = 0.42;
    const T = (x, y) => [x + Math.abs(y * kk) * sweep, y * kk];        // y < 0 = along the wing
    const lead = [[-9, 0], [-13, -0.3], [-10, -0.62], [-3, -0.86], [6, -1]].map(p => T(p[0], p[1] * L));
    const trail = [[14, -0.86], [17, -0.7], [19, -0.52], [19, -0.33], [17, -0.15], [12, 0]].map(p => T(p[0], p[1] * L));
    ctx.save(); ctx.translate(dx, -5);
    // primaries: long separate feathers fanning from the tip
    for (let j = 0; j < 4; j++) {
      const a = T(2 + j * 4, -L * (0.8 - j * 0.07)), b = T(9 + j * 6, -L * (1.05 - j * 0.1));
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
      strokeC(ctx, OL(col), 7.6); ctx.stroke(); strokeC(ctx, darken(col, 0.08), 5); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(lead[0][0], lead[0][1]);
    for (let i = 1; i < lead.length; i++) { const p = lead[i - 1], q = lead[i]; ctx.quadraticCurveTo(p[0] - 3, (p[1] + q[1]) / 2, q[0], q[1]); }
    trail.forEach((q, i) => {                                         // scalloped trailing edge
      const p = i ? trail[i - 1] : lead[lead.length - 1];
      ctx.quadraticCurveTo((p[0] + q[0]) / 2 - 4, (p[1] + q[1]) / 2, q[0], q[1]);
    });
    ctx.closePath();
    ctx.fillStyle = gradL(ctx, 0, 0, T(4, -L)[0], T(4, -L)[1] || 1, [[0, cov], [0.45, mixC(cov, col, 0.6)], [1, col]]); ctx.fill();
    strokeC(ctx, OL(col), 1.7); ctx.stroke();
    // covert feathers: a row of short arcs near the leading edge
    strokeC(ctx, OL(col), 1, 0.5);
    for (let j = 0; j < 4; j++) { const a = T(-6 + j * 2, -L * (0.12 + j * 0.16)), b = T(10, -L * (0.2 + j * 0.16)); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 4 * Math.sign(kk || 1), b[0], b[1]); ctx.stroke(); }
    fillC(ctx, 0xffffff, 0.16);
    ctx.beginPath(); ctx.moveTo(lead[0][0] + 2, lead[0][1]); lead.slice(1, 4).forEach(p => ctx.lineTo(p[0] + 3, p[1])); lead.slice(1, 4).reverse().forEach(p => ctx.lineTo(p[0] + 8, p[1])); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  wing(7, k * 0.8, darken(C.wing, 0.3), darken(C.cover, 0.3));
  // tail
  ctx.beginPath(); ctx.moveTo(16, -5); ctx.lineTo(46, -10); ctx.quadraticCurveTo(52, -1, 46, 8); ctx.lineTo(16, 4); ctx.closePath();
  ctx.fillStyle = gradH(ctx, 16, 50, [[0, C.back], [1, C.tail]]); ctx.fill(); strokeC(ctx, OL(C.tail), 1.6); ctx.stroke();
  strokeC(ctx, OL(C.tail), 1, 0.5); [-5, 0, 5].forEach(y => { ctx.beginPath(); ctx.moveTo(24, y * 0.5); ctx.lineTo(46, y * 1.4); ctx.stroke(); });
  // body
  const body = () => { ctx.beginPath(); ctx.moveTo(-25, -3); ctx.bezierCurveTo(-22, -13, -8, -13, 6, -10); ctx.bezierCurveTo(16, -8, 22, -5, 24, -1); ctx.bezierCurveTo(18, 8, 4, 12, -10, 10); ctx.bezierCurveTo(-20, 8, -26, 3, -25, -3); ctx.closePath(); };
  body(); ctx.fillStyle = gradV(ctx, -13, 12, [[0, lighten(C.back, 0.12)], [0.42, C.back], [0.58, C.belly], [1, darken(C.belly, 0.18)]]); ctx.fill();
  if (C.bar) { ctx.save(); body(); ctx.clip(); strokeC(ctx, C.bar, 1.5, 0.6); for (let x = -18; x < 16; x += 5) { ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + 2.5, 9); ctx.stroke(); } ctx.restore(); }
  body(); strokeC(ctx, OL(C.back), 1.7); ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(-22, -6, 9.2, 0, 6.2832);
  ctx.fillStyle = gradR(ctx, -25, -10, 1, 11, [[0, lighten(C.back, 0.28)], [1, C.back]]); ctx.fill(); strokeC(ctx, OL(C.back), 1.6); ctx.stroke();
  if (kind === "falcon") {
    fillC(ctx, C.belly); ctx.beginPath(); ctx.moveTo(-28, -2); ctx.quadraticCurveTo(-22, 4, -15, 1); ctx.quadraticCurveTo(-20, -2, -24, -4); ctx.closePath(); ctx.fill();
    fillC(ctx, 0x2a1a10, 0.85); ctx.beginPath(); ctx.moveTo(-23, -5); ctx.quadraticCurveTo(-22, 1, -19, 3); ctx.lineTo(-20.5, -4); ctx.closePath(); ctx.fill();
  }
  // beak
  ctx.beginPath(); ctx.moveTo(-29, -10); ctx.quadraticCurveTo(-38, -9, -37, -2); ctx.quadraticCurveTo(-34, -4, -30, -4); ctx.closePath();
  fillC(ctx, C.beak); ctx.fill(); strokeC(ctx, 0x0e0c0c, 1); ctx.stroke();
  if (C.cere) { fillC(ctx, C.cere); ctx.beginPath(); ctx.arc(-29.4, -7.4, 2.5, 0, 6.2832); ctx.fill(); }
  fillC(ctx, C.cere ? 0xf2c43a : 0xe0c860); ctx.beginPath(); ctx.arc(-24.2, -8.4, 2.8, 0, 6.2832); ctx.fill();
  fillC(ctx, 0x0a0806); ctx.beginPath(); ctx.arc(-24.6, -8.4, 1.6, 0, 6.2832); ctx.fill();
  fillC(ctx, 0xffffff, 0.95); ctx.beginPath(); ctx.arc(-25.2, -9.2, 0.7, 0, 6.2832); ctx.fill();
  // tucked feet
  if (kind === "falcon") { fillC(ctx, C.cere); ctx.beginPath(); ctx.ellipse(6, 10, 5, 2.6, 0.3, 0, 6.2832); ctx.fill(); }
  wing(0, k, C.wing, C.cover);
  ctx.restore();
}

// A bat, wings spread, frame 110 x 80. f = 0..2: up, level, down.
function paintBat(ctx, f) {
  const k = [1, 0.2, -0.75][f];
  ctx.save(); ctx.translate(55, 42); ctx.lineJoin = "round";
  const memb = 0x3e2c48, bone = 0x1a1220;
  [-1, 1].forEach(s => {
    const P = [[s * 7, -3], [s * 20, -22 * k], [s * 50, -30 * k - 2], [s * 44, -8 * k + 6], [s * 36, 6 * k + 10], [s * 24, 2 * k + 12], [s * 8, 6]];
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1]); ctx.lineTo(P[2][0], P[2][1]);
    for (let i = 3; i < P.length; i++) { const a = P[i - 1], b = P[i]; ctx.quadraticCurveTo((a[0] + b[0]) / 2 - s * 2, (a[1] + b[1]) / 2 - 5, b[0], b[1]); }
    ctx.closePath();
    ctx.fillStyle = gradV(ctx, -30 * Math.abs(k) - 4, 14, [[0, lighten(memb, 0.12)], [1, darken(memb, 0.3)]]); ctx.fill();
    strokeC(ctx, bone, 1.6); ctx.stroke();
    strokeC(ctx, bone, 1.2, 0.8); [P[3], P[4], P[5]].forEach(p => { ctx.beginPath(); ctx.moveTo(P[1][0], P[1][1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
  });
  pEll(ctx, 0, 2, 9, 12); ctx.fillStyle = gradR(ctx, -2, -2, 1, 13, [[0, 0x5a4660], [1, 0x241828]]); ctx.fill(); strokeC(ctx, bone, 1.4); ctx.stroke();
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(s * 3, -8); ctx.lineTo(s * 7, -18); ctx.lineTo(s * 8, -7); ctx.closePath(); fillC(ctx, 0x2a1e30); ctx.fill(); ctx.stroke(); });
  fillC(ctx, 0xffd060); [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(s * 3.4, -4, 1.6, 0, 6.2832); ctx.fill(); });
  ctx.restore();
}

// Arrow flying left (tip on the left). Frame 180 x 30.
function paintFlightArrow(ctx) {
  ctx.fillStyle = gradH(ctx, 70, 180, [[0, 0xffffff, 0.35], [1, 0xffffff, 0]]); ctx.fillRect(70, 13.5, 110, 3);
  ctx.lineCap = "round";
  strokeC(ctx, 0x2e1c0e, 6); ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(150, 15); ctx.stroke();
  strokeC(ctx, 0xc09a62, 3.4); ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(150, 15); ctx.stroke();
  strokeC(ctx, 0xffffff, 1, 0.4); ctx.beginPath(); ctx.moveTo(32, 13.8); ctx.lineTo(146, 13.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, 15); ctx.lineTo(30, 5); ctx.lineTo(25, 15); ctx.lineTo(30, 25); ctx.closePath();
  ctx.fillStyle = gradV(ctx, 5, 25, [[0, 0xf4f7fa], [0.5, 0xaab4be], [1, 0x5a6470]]); ctx.fill(); strokeC(ctx, 0x1e2228, 1.6); ctx.stroke();
  [-1, 1].forEach(s => {
    ctx.beginPath(); ctx.moveTo(126, 15); ctx.quadraticCurveTo(140, 15 + s * 4, 148, 15 + s * 12); ctx.lineTo(166, 15 + s * 12); ctx.quadraticCurveTo(158, 15 + s * 4, 152, 15); ctx.closePath();
    fillC(ctx, s < 0 ? 0xb2283a : 0xf2ead8); ctx.fill(); strokeC(ctx, 0x3a1010, 1.2); ctx.stroke();
  });
  strokeC(ctx, 0x2e1c0e, 3); ctx.beginPath(); ctx.moveTo(150, 15); ctx.lineTo(172, 15); ctx.stroke();
}

// A bowman standing side-on, facing left. f 0 = bow lowered, 1 = drawn.
// Frame 110 x 140, feet at (56, 134).
function paintArcher(ctx, f) {
  ctx.save(); ctx.translate(56, 134); ctx.lineJoin = "round"; ctx.lineCap = "round";
  const robe = 0x7a2430, ol = 0x1e0c10, skin = 0xd0a77a, steel = 0xb8c0c8;
  softEllipse(ctx, 0, 2, 30, 7, 0x000000, 0.35);
  // boots
  [[-8, 0], [10, 0]].forEach(b => { pRR(ctx, b[0] - 9, -12, 17, 12, 4); fillC(ctx, 0x2a1a10); ctx.fill(); });
  // robe
  ctx.beginPath(); ctx.moveTo(-20, -10); ctx.lineTo(-13, -70); ctx.lineTo(13, -70); ctx.lineTo(22, -10); ctx.quadraticCurveTo(0, -4, -20, -10); ctx.closePath();
  ctx.fillStyle = gradH(ctx, -20, 22, [[0, lighten(robe, 0.18)], [1, darken(robe, 0.32)]]); ctx.fill(); strokeC(ctx, ol, 2); ctx.stroke();
  fillC(ctx, PAL.gold); ctx.fillRect(-15, -44, 30, 6);
  // quiver on the back
  ctx.save(); ctx.translate(14, -60); ctx.rotate(0.35);
  pRR(ctx, -6, -6, 12, 40, 4); fillC(ctx, 0x6a4424); ctx.fill(); strokeC(ctx, ol, 1.6); ctx.stroke();
  [-3, 0, 3].forEach(x => { strokeC(ctx, 0xb2283a, 2); ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x, -14); ctx.stroke(); });
  ctx.restore();
  // head + pointed helmet
  ctx.beginPath(); ctx.arc(0, -82, 11, 0, 6.2832); fillC(ctx, skin); ctx.fill(); strokeC(ctx, ol, 1.8); ctx.stroke();
  fillC(ctx, 0x2a1a14); ctx.beginPath(); ctx.moveTo(-9, -78); ctx.quadraticCurveTo(-4, -66, 4, -74); ctx.lineTo(2, -80); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-13, -84); ctx.quadraticCurveTo(-12, -100, 0, -108); ctx.quadraticCurveTo(12, -100, 13, -84); ctx.closePath();
  ctx.fillStyle = gradH(ctx, -13, 13, [[0, 0xf0f4f8], [0.5, steel], [1, 0x5a626c]]); ctx.fill(); strokeC(ctx, 0x1e2228, 1.6); ctx.stroke();
  fillC(ctx, 0x0a0806); ctx.beginPath(); ctx.arc(-6, -84, 1.6, 0, 6.2832); ctx.fill();
  // bow arm reaching forward (left), drawing arm back to the cheek
  const bx = f ? -40 : -30, by = f ? -74 : -46;
  strokeC(ctx, ol, 9); ctx.beginPath(); ctx.moveTo(-6, -64); ctx.lineTo(bx + 4, by); ctx.stroke();
  strokeC(ctx, robe, 6); ctx.beginPath(); ctx.moveTo(-6, -64); ctx.lineTo(bx + 4, by); ctx.stroke();
  // the bow: a recurve, string pulled back when drawn
  ctx.save(); ctx.translate(bx, by); ctx.rotate(f ? 0 : -0.5);
  const pull = f ? 30 : 6;
  strokeC(ctx, 0x2a1a0e, 5); ctx.beginPath(); ctx.moveTo(4, -38); ctx.quadraticCurveTo(-8, -30, -6, -14); ctx.quadraticCurveTo(-4, 0, -6, 14); ctx.quadraticCurveTo(-8, 30, 4, 38); ctx.stroke();
  strokeC(ctx, 0x8a5a2a, 2.6); ctx.stroke();
  strokeC(ctx, 0xf2ead8, 1.2); ctx.beginPath(); ctx.moveTo(4, -38); ctx.lineTo(pull, 0); ctx.lineTo(4, 38); ctx.stroke();
  if (f) { strokeC(ctx, 0x6a4a2a, 2.4); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(pull + 2, 0); ctx.stroke(); fillC(ctx, steel); ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-16, -4); ctx.lineTo(-16, 4); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  const hx = f ? bx + pull + 2 : -8, hy = f ? by : -40;
  strokeC(ctx, ol, 9); ctx.beginPath(); ctx.moveTo(6, -64); ctx.lineTo(hx + 2, hy); ctx.stroke();
  strokeC(ctx, robe, 6); ctx.beginPath(); ctx.moveTo(6, -64); ctx.lineTo(hx + 2, hy); ctx.stroke();
  [[bx, by], [hx, hy]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], 4.2, 0, 6.2832); fillC(ctx, skin); ctx.fill(); strokeC(ctx, ol, 1.4); ctx.stroke(); });
  ctx.restore();
}

// A paper kite on a long string. Frame 130 x 200, kite centre (65, 64).
function paintKite(ctx, cols, seed) {
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
  // ribbon tail with bows
  strokeC(ctx, 0xf2ead8, 2); ctx.beginPath(); ctx.moveTo(65, 128);
  for (let i = 1; i <= 6; i++) ctx.quadraticCurveTo(65 + (i % 2 ? 14 : -14), 128 + i * 11 - 6, 65, 128 + i * 11);
  ctx.stroke();
  [0, 1, 2].forEach(i => { const y = 146 + i * 18; fillC(ctx, cols[i % cols.length]); ctx.beginPath(); ctx.moveTo(65, y); ctx.lineTo(55, y - 6); ctx.lineTo(55, y + 6); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(65, y); ctx.lineTo(75, y - 6); ctx.lineTo(75, y + 6); ctx.closePath(); ctx.fill(); });
  const kite = () => { ctx.beginPath(); ctx.moveTo(65, 6); ctx.lineTo(112, 56); ctx.lineTo(65, 128); ctx.lineTo(18, 56); ctx.closePath(); };
  kite(); ctx.fillStyle = patS(ctx, tileIkat([cols[0], cols[1], cols[2], PAL.cream], "kite" + seed), 0.7); ctx.fill();
  ctx.save(); kite(); ctx.clip();
  ctx.fillStyle = gradL(ctx, 18, 6, 112, 128, [[0, 0xffffff, 0.25], [0.5, 0xffffff, 0], [1, 0x000000, 0.3]]); ctx.fillRect(0, 0, 130, 130);
  ctx.restore();
  strokeC(ctx, 0x3a2414, 2.2); ctx.beginPath(); ctx.moveTo(65, 6); ctx.lineTo(65, 128); ctx.moveTo(18, 56); ctx.lineTo(112, 56); ctx.stroke();
  kite(); strokeC(ctx, 0x2a1408, 2.6); ctx.stroke();
  ctx.restore();
}

class CarpetScene extends BaseScene {
  constructor() { super("CarpetScene"); }

  init(data) {
    this.themeKey = data.theme || "desert";
    this.toLabel = data.toLabel || "";
    this.fromCheckpoint = !!data.ck;
    this.fails = data.fails || 0;
  }

  create() {
    const th = this.th = STORY.flights[this.themeKey] || STORY.flights.desert;
    // The scene object is reused between flights and attempts: every piece
    // of per-flight state is set here, never inherited from a previous run.
    this.vy = 0; this.lives = 3; this.invuln = 0; this.dist = 0; this.started = false; this.done = false;
    this.sparks = 0; this.sparkCombo = 0; this.comboT = 0; this.gust = 0; this.gustT = 0; this.lift = 0;
    this.ckPassed = false; this.objs = []; this.hazards = []; this.items = []; this.kites = []; this.nextIdx = 0;
    this.pts = []; this.pts.n = 0;

    this.begin({ music: th.music, amb: th.storm ? "storm" : (th.time === "night" ? "night" : "wind") });
    promptTextures(this);                       // the "!" warnings (normally made by the walking scenes)
    this.buildWorld(th, this.themeKey);

    this.carpet = makeFlyingCarpet(this, CARPET_X, 470, 0.9).setDepth(500);
    this.stripMask = texMask(this, "carpet-strip", 128, 0);
    this.riderMask = texMask(this, "rider", 128, 1);
    this.trail = this.add.particles(0, 0, "fx-spark", {
      follow: this.carpet, followOffset: { x: -150, y: 10 }, speedX: { min: -260, max: -140 }, speedY: { min: -30, max: 30 },
      scale: { start: 0.28, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 600, frequency: 45, tint: [0xffe9a8, 0xd9a441], blendMode: "ADD"
    }).setDepth(499);

    this.course = this.buildCourse(th);
    if (this.fromCheckpoint) {
      this.dist = this.course.checkpoint - 500;
      while (this.nextIdx < this.course.list.length && this.course.list[this.nextIdx].d < this.dist + 200) this.nextIdx++;
      this.ckPassed = true;
    }

    // HUD
    this.hearts = UI.hearts(this, 60, 62, 3);
    const barW = 760;
    this.barBg = this.add.graphics().setDepth(8900).setScrollFactor(0);
    this.barBg.fillStyle(0x0e0b22, 0.6).fillRoundedRect(W / 2 - barW / 2 - 8, 46, barW + 16, 30, 15);
    this.barBg.lineStyle(2, PAL.gold, 0.8).strokeRoundedRect(W / 2 - barW / 2 - 8, 46, barW + 16, 30, 15);
    this.barFill = this.add.rectangle(W / 2 - barW / 2, 61, 4, 14, 0xf4d58a).setOrigin(0, 0.5).setDepth(8901);
    this.barW = barW;
    const ckX = W / 2 - barW / 2 + barW * this.course.checkpoint / this.course.end;
    this.add.image(ckX, 61, "fx-spark").setTint(0xffc060).setScale(0.5).setDepth(8902);
    this.barIcon = this.add.image(W / 2 - barW / 2, 61, "fx-glow").setTint(0xffe9a8).setDisplaySize(44, 44).setBlendMode(Phaser.BlendModes.ADD).setDepth(8902);
    UI.text(this, W / 2, 104, "to " + this.toLabel, { size: 26, color: "#f1e3c2", style: "italic" }).setDepth(8900);
    this.sparkTxt = UI.text(this, 312, 62, "✦ 0", { size: 34, color: "#f4d58a", font: FONT_T }).setDepth(8900);
    this.hurtOverlay = this.add.image(W / 2, H / 2, "fx-edge").setDisplaySize(W, H).setTint(0xff2a2a).setAlpha(0).setDepth(8600).setScrollFactor(0);

    UI.banner(this, th.title, this.fromCheckpoint ? "from the halfway lantern" : "to " + this.toLabel, { y: 300, hold: 1800 });
    this.startHint = UI.pill(this, W / 2, 720, this.touchMode ? "Touch and hold to rise · let go to sink" : "Hold SPACE (or the mouse) to rise · let go to sink", { size: 34, h: 76, padX: 80, gold: true, color: "#f8e3a6" });
    this.tweens.add({ targets: this.startHint, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
    if (th.intro) this.time.delayedCall(2300, () => { if (!this.done) UI.toast(this, th.intro, { y: 200, hold: 2600, size: 30 }); });

    this.holding = false;
    this.input.on("pointerdown", (p, over) => { if (over && over.some(o => o.isHud)) return; this.holding = true; });
    this.input.on("pointerup", () => { this.holding = false; });
    this.input.on("gameout", () => { this.holding = false; });
    addVignette(this, th.storm || th.time === "night" ? 0.9 : 0.45);
  }

  skipLabel() { return this.fails >= 2 ? "Skip this flight" : null; }
  skipChallenge() { this.done = true; this.advance(); }

  // ---------- world ----------
  buildWorld(th, key) {
    const time = th.time, night = time !== "day";
    addBackdrop(this, "fl_sky_" + key, (ctx) => {
      paintSky(ctx, W, H, [[0, th.sky[0]], [0.6, th.sky[1]], [1, th.sky[2]]]);
      if (time === "night" || time === "storm" || time === "dusk") paintStars(ctx, W, 520, time === "storm" ? 40 : (time === "dusk" ? 90 : 220), "fs" + key, time === "storm" ? 0.3 : 0.9);
      if (time === "day") paintSun(ctx, 1500, 200, 56, 0xfff0c0);
      else if (time === "dusk") paintSun(ctx, 1450, 620, 90, 0xffa060);
      else if (time === "dawn") { paintStars(ctx, W, 300, 40, "fsd" + key, 0.4); paintSun(ctx, 1380, 660, 84, 0xffc890); }
      else paintMoon(ctx, 1500, 180, 54, { tint: time === "storm" ? 0x9a9ab0 : 0xe4d9bb });
    }, -20);
    const mk = (name, h, fn) => Tex.make(this, name, W, h, fn);
    mk("fl_far_" + key, 520, ctx => paintRidge(ctx, W, 520, { seed: "ff" + key, amp: 260, color: th.ridge, color2: mixC(th.ridge, th.sky[2], 0.3), n: 8 }));
    mk("fl_mid_" + key, 420, ctx => paintSkyline(ctx, W, 420, { seed: "fm" + key, color: th.city, color2: darken(th.city, 0.2), minH: 60, maxH: 260, lights: night ? 1 : 0, finial: night ? 0x8a6a3a : 0xd9a441 }));
    // the ground: its painted surface IS the floor the carpet can hit
    mk("fl_gnd_" + key, 220, (ctx) => {
      paintRidge(ctx, W, 130, { seed: "fg" + key, amp: 40, color: th.ground, color2: darken(th.ground, 0.4), n: 6 });
      ctx.save(); ctx.globalCompositeOperation = "source-atop";
      const r = rng("fgd" + key);
      for (let i = 0; i < 220; i++) { fillC(ctx, r.chance(0.5) ? 0x000000 : 0xffffff, r.range(0.04, 0.12)); ctx.beginPath(); ctx.ellipse(r() * W, r.range(100, 220), r.range(4, 26), r.range(2, 6), 0, 0, 6.2832); ctx.fill(); }
      ctx.fillStyle = gradV(ctx, 86, 140, [[0, 0xffffff, 0.16], [1, 0xffffff, 0]]); ctx.fillRect(0, 80, W, 60);
      ctx.restore();
    });
    this.far = this.add.tileSprite(0, 520, W, 520, "fl_far_" + key).setOrigin(0).setDepth(-15);
    this.mid = this.add.tileSprite(0, 590, W, 420, "fl_mid_" + key).setOrigin(0).setDepth(-12);
    this.gnd = this.add.tileSprite(0, H - 220, W, 220, "fl_gnd_" + key).setOrigin(0).setDepth(900);
    this.groundMask = texMask(this, "fl_gnd_" + key, 128, 0);
    if (time === "day" || time === "dusk" || time === "dawn") {
      this.clouds = [];
      const cc = time === "dusk" ? 0xc06a7a : (time === "dawn" ? 0xf0c0b0 : 0xffffff), lit = time === "dusk" ? 0xffc090 : (time === "dawn" ? 0xfff0d8 : 0xffffff);
      for (let i = 0; i < 5; i++) {
        const k = Tex.make(this, "fl_cloud" + i + key, 520, 200, ctx => paintCloud(ctx, 260, 170, 440, 130, cc, "fcl" + i, { lit }));
        this.clouds.push(this.add.image(Math.random() * W, 120 + Math.random() * 300, k).setAlpha(0.8).setDepth(-14).setScale(0.6 + Math.random() * 0.6));
      }
    }
    // the tower below and what hangs above each gap
    const tw = 260, thh = 1000;
    this.towerKey = "fl_tower_" + key;
    Tex.make(this, this.towerKey, tw, thh, ctx => paintFlightTower(ctx, th.tower, tw, thh, key));
    this.towerMask = texMask(this, this.towerKey, 128, 2);
    this.bankKey = "fl_bank_" + key;
    Tex.make(this, this.bankKey, 380, 900, (ctx) => {
      const top = th.top || "cloud";
      if (top === "rock") paintHangingRock(ctx, 380, 900, th.tower === "pillar" ? { seed: "hr" + key, c0: 0xe8bc84, c1: 0xc08850, c2: 0x6a4428, ol: 0x3a2410 } : { seed: "hr" + key, c0: 0xd88a5a, c1: 0xa8583a, c2: 0x5a2a1a, ol: 0x2e140a });
      else if (th.storm) paintHangingCloud(ctx, 380, 900, { seed: "hc" + key, top: 0x14141e, color: 0x2e2e40, lit: 0x6a6a8a, shade: 0x12121a, rim: 0x08080e });
      else if (time === "night") paintHangingCloud(ctx, 380, 900, { seed: "hc" + key, top: 0x1a1a30, color: 0x34385a, lit: 0x8a92c0, shade: 0x1a1a2e, rim: 0x0e0e1c });
      else if (time === "dusk") paintHangingCloud(ctx, 380, 900, { seed: "hc" + key, top: 0x5a3a5a, color: 0x9a6080, lit: 0xffb898, shade: 0x5a3050, rim: 0x3a1a34 });
      else if (time === "dawn") paintHangingCloud(ctx, 380, 900, { seed: "hc" + key, top: 0xb08aa0, color: 0xe8b8b0, lit: 0xfff0dc, shade: 0xa07890, rim: 0x6a4a60 });
      else paintHangingCloud(ctx, 380, 900, { seed: "hc" + key, top: 0x8a98b0, color: 0xc4d0de, lit: 0xffffff, shade: 0x7a88a2, rim: 0x4a5670 });
    });
    this.bankMask = texMask(this, this.bankKey, 150, 0);
    // hazards (kept between flights)
    Tex.make(this, "fl_birds", 520, 192, (ctx) => {
      ["crow", "falcon"].forEach((kind, row) => { for (let f = 0; f < 4; f++) { ctx.save(); ctx.translate(f * 130, row * 96); paintFlightBird(ctx, kind, f); ctx.restore(); } });
    }, true);
    const bt = this.textures.get("fl_birds");
    if (!bt.has("crow0")) ["crow", "falcon"].forEach((kind, row) => { for (let f = 0; f < 4; f++) bt.add(kind + f, 0, f * 130, row * 96, 130, 96); });
    Tex.make(this, "fl_bat", 330, 80, (ctx) => { for (let f = 0; f < 3; f++) { ctx.save(); ctx.translate(f * 110, 0); paintBat(ctx, f); ctx.restore(); } }, true);
    const bat = this.textures.get("fl_bat");
    if (!bat.has("b0")) for (let f = 0; f < 3; f++) bat.add("b" + f, 0, f * 110, 0, 110, 80);
    Tex.make(this, "fl_arrow2", 180, 30, ctx => paintFlightArrow(ctx), true);
    Tex.make(this, "fl_archer", 220, 140, (ctx) => { [0, 1].forEach(f => { ctx.save(); ctx.translate(f * 110, 0); paintArcher(ctx, f); ctx.restore(); }); }, true);
    const ar = this.textures.get("fl_archer");
    if (!ar.has("a0")) [0, 1].forEach(f => ar.add("a" + f, 0, f * 110, 0, 110, 140));
    if (th.sand) {
      Tex.make(this, "fl_sand", 512, 256, (ctx) => {
        const r = rng("sand");
        for (let i = 0; i < 260; i++) { fillC(ctx, 0xf0d0a0, r.range(0.15, 0.5)); ctx.fillRect(r() * 512, r() * 256, r.range(10, 60), r.range(1, 2.4)); }
      });
      this.sandHaze = this.add.rectangle(W / 2, H / 2, W, H, 0xd8a868, 0.22).setDepth(880);
      this.sandFx = this.add.tileSprite(0, 0, W, H, "fl_sand").setOrigin(0).setDepth(890).setAlpha(0.8);
    }
  }

  // ---------- the fixed, seeded course ----------
  buildCourse(th) {
    const r = rng("course-" + this.themeKey), list = [];
    const end = th.length * th.speed, hz = th.hazards || [], rate = th.hazardRate || [0.25, 0.5];
    let d = 950, lastC = 520, i = 0, prev = null;
    while (d < end - 700) {
      const t = d / end;
      const gap = lerp(th.gap[0], th.gap[1], t), space = lerp(th.spacing[0], th.spacing[1], t);
      let c = r.range(190 + gap / 2, GROUND_Y - 70 - gap / 2);
      c = clamp(c, lastC - 290, lastC + 290);
      const g = { d, type: "gate", c, gap, i };
      list.push(g);
      // a trail of sparks curving from the last gap into this one
      if (prev) for (let k = 1; k <= 3; k++) { const f = k / 4; list.push({ d: lerp(prev.d, d, f), type: "spark", y: lerp(prev.c, c, smooth(f)) }); }
      if (hz.length && i >= 2 && r.chance(lerp(rate[0], rate[1], t))) {
        const kind = r.pick(hz);
        if (kind === "archer" || kind === "smoke") g[kind] = true;
        else list.push({ d: d + space * r.range(0.42, 0.58), type: kind, y: r.range(220, GROUND_Y - 220), seed: i });
      }
      if (th.wind && i >= 3 && i % 5 === 0) list.push({ d: d + 200, type: "gust", dir: r.sign() });
      if (th.storm && i >= 3 && i % 4 === 1) list.push({ d: d + 220, type: "bolt", half: r.chance(0.5) ? "top" : "bottom" });
      prev = g; lastC = c; i++;
      d += space * r.range(0.92, 1.1);
    }
    list.sort((a, b) => a.d - b.d);
    const gates = list.filter(e => e.type === "gate");
    const mid = gates[Math.floor(gates.length / 2)];
    return { list, end: d + 700, checkpoint: mid.d - 260 };
  }

  spawn(e) {
    const x = CARPET_X + (e.d - this.dist);
    if (e.type === "gate") this.spawnGate(e, x);
    else if (e.type === "spark") {
      const s = this.add.image(x, e.y, "fx-spark").setTint(0xffb020).setScale(0.75).setDepth(420);
      const gl = addGlow(this, x, e.y, 120, 0xffc060, 0.5).setDepth(419);
      this.tweens.add({ targets: s, angle: 90, duration: 1400, repeat: -1 });
      this.items.push({ x, y: e.y, s, gl });
    } else if (e.type === "bird") this.spawnFlock(x, e.y);
    else if (e.type === "falcon") this.spawnFalcon();
    else if (e.type === "bat") this.spawnBats(x, e.y);
    else if (e.type === "arrow") this.spawnVolley();
    else if (e.type === "kite") this.spawnKite(x, e);
    else if (e.type === "gust") this.warnGust(e.dir);
    else if (e.type === "bolt") this.warnBolt(e.half);
  }

  spawnGate(e, x) {
    const top = e.c - e.gap / 2, bot = e.c + e.gap / 2;
    const TM = this.towerMask, BM = this.bankMask;
    const ty = bot - TM.minTop;                       // the tower's highest pixel is the gap's floor
    const by = top - BM.maxBot;                       // the lowest pixel above is the gap's ceiling
    const o = { x, ty, by, extras: [] };
    o.tower = this.add.image(x, ty, this.towerKey).setOrigin(0.5, 0).setDepth(400);
    o.bank = this.add.image(x, by, this.bankKey).setOrigin(0.5, 0).setDepth(410);
    if (this.th.storm) this.tweens.add({ targets: o.bank, alpha: 0.88, duration: 90, yoyo: true, repeat: -1, repeatDelay: 2600 + Math.random() * 2000 });
    if (e.archer) {
      const gx = x - 70, gy = this.groundAt(gx) + 6;
      o.archer = { spr: this.add.image(gx, gy, "fl_archer", "a0").setOrigin(0.5, 134 / 140).setDepth(905).setScale(0.95), state: 0, dx: -70 };
      if (this.th.time === "night" || this.th.storm) o.archer.spr.setTint(0x9aa0c8);
    }
    if (e.smoke) {
      const sy = ty + TM.minTop;
      o.plume = this.add.particles(x, sy, "fx-puff", {
        x: { min: -26, max: 26 }, speedY: { min: -300, max: -200 }, speedX: { min: -30, max: 30 }, scale: { start: 0.5, end: 2.2 },
        alpha: { start: 0.42, end: 0 }, lifespan: 2200, frequency: 45, tint: [0x5a4a50, 0x7a6a6a, 0x3a3038]
      }).setDepth(415);
      o.plumeY = sy;
      o.heat = addGlow(this, x, sy, 150, 0xff8a30, 0.45).setDepth(414);
    }
    this.objs.push(o);
  }

  groundAt(x) {
    const G = this.groundMask, col = ((((x + this.gnd.tilePositionX) % G.w) + G.w) % G.w) | 0;
    return this.gnd.y + (G.top[col] === MASK_EMPTY ? 120 : G.top[col]);
  }

  spawnFlock(x, y) {
    const kind = this.th.storm || this.th.time === "night" ? "falcon" : "crow";
    [[0, 0], [70, -46], [70, 46], [140, -90]].slice(0, this.th.storm ? 4 : 3).forEach((p, k) => {
      const b = this.add.sprite(x + p[0], y + p[1], "fl_birds", kind + (k % 4)).setDepth(430).setScale(0.95);
      if (this.th.time === "night" || this.th.storm) b.setTint(0xb0b4d8);
      this.hazards.push({ kind: "bird", x: b.x, y: b.y, by: b.y, ph: Math.random() * 6, o: b, r: 24, frames: kind, fr: k, speed: 1.3 });
    });
    Snd.play("flap");
  }

  spawnFalcon() {
    const ty = this.carpet.y - 30;
    const warn = this.add.image(W - 90, 130, "prompt-mark").setDepth(8800).setScale(0.8).setTint(0xff8a6a);
    this.tweens.add({ targets: warn, alpha: 0.3, duration: 110, yoyo: true, repeat: 4, onComplete: () => warn.destroy() });
    Snd.play("screech");
    this.time.delayedCall(750, () => {
      if (this.done) return;
      const P0 = { x: W + 90, y: 90 + Math.random() * 60 }, P2 = { x: -160, y: ty < 540 ? ty + 260 : ty - 300 };
      const B = { x: CARPET_X, y: ty };                 // where it crosses the carpet's line, 60% of the way
      const P1 = { x: (B.x - 0.16 * P0.x - 0.36 * P2.x) / 0.48, y: (B.y - 0.16 * P0.y - 0.36 * P2.y) / 0.48 };
      const b = this.add.sprite(P0.x, P0.y, "fl_birds", "falcon0").setDepth(432).setScale(1.25);
      if (this.th.time === "night" || this.th.storm) b.setTint(0xc0c4e0);
      this.hazards.push({ kind: "falcon", x: P0.x, y: P0.y, o: b, r: 30, t: 0, dur: 1.75, P0, P1, P2, frames: "falcon", ph: 0 });
    });
  }

  spawnBats(x, y) {
    for (let k = 0; k < 5; k++) {
      const b = this.add.sprite(x + k * 55, y + (k % 2 ? -50 : 40), "fl_bat", "b0").setDepth(430).setScale(0.9);
      this.hazards.push({ kind: "bat", x: b.x, y: b.y, by: b.y, ph: Math.random() * 6, ph2: Math.random() * 6, o: b, r: 17 });
    }
    Snd.play("squeak");
  }

  spawnVolley() {
    const cy = this.carpet.y - 20, ys = [cy, cy - 150 - Math.random() * 40, cy + 150 + Math.random() * 40].filter(y => y > 110 && y < GROUND_Y - 60).slice(0, this.th.storm ? 3 : 2);
    ys.forEach((y, k) => {
      const warn = this.add.image(W - 70, y, "prompt-mark").setDepth(8800).setScale(0.8).setTint(0xff8a6a);
      this.tweens.add({ targets: warn, alpha: 0.3, duration: 120, yoyo: true, repeat: 4 });
      this.time.delayedCall(950 + k * 140, () => {
        warn.destroy();
        if (this.done) return;
        this.fireArrow(W + 90, y, -1, 0, 1300);
      });
    });
    Snd.play("alarm");
  }

  fireArrow(x, y, dx, dy, speed) {
    const len = Math.hypot(dx, dy) || 1;
    const a = this.add.image(x, y, "fl_arrow2").setDepth(433).setRotation(Math.atan2(dy, dx) - Math.PI);
    if (this.th.time === "night" || this.th.storm) a.setTint(0xd0d4ee);
    const tr = this.add.particles(0, 0, "fx-streak", { follow: a, speed: 0, scaleX: { start: 0.45, end: 0.1 }, scaleY: 0.5, alpha: { start: 0.45, end: 0 }, lifespan: 220, frequency: 18, rotate: Phaser.Math.RadToDeg(a.rotation) }).setDepth(432);
    this.hazards.push({ kind: "arrow", x, y, vx: dx / len * speed, vy: dy / len * speed, o: a, trail: tr, r: 9, tip: true });
    Snd.play("arrow");
  }

  spawnKite(x, e) {
    const cols = [[0xb2283a, 0xd9a441, 0x1c4e80], [0x1f6f6f, 0xf6ecd8, 0xb2283a], [0x4a2f6a, 0xd9a441, 0x2fb8ac]][e.seed % 3];
    const key = "fl_kite" + (e.seed % 3);
    Tex.make(this, key, 130, 200, ctx => paintKite(ctx, cols, e.seed % 3));
    const ky = clamp(e.y, 380, 620);
    const img = this.add.image(x, ky, key).setOrigin(0.5, 64 / 200).setDepth(425);
    const str = this.add.graphics().setDepth(424);
    this.kites.push({ x, y: ky, ky, ax: x + 250, img, str, ph: Math.random() * 6, segs: [] });
  }

  warnGust(dir) {
    const ys = dir < 0 ? [760, 600, 440] : [320, 480, 640];
    const arrows = ys.map((y, i) => UI.title(this, 1500 - i * 40, y, dir < 0 ? "▲" : "▼", { size: 70, color: "#ffffff" }).setAlpha(0).setDepth(8700));
    arrows.forEach((a, i) => this.tweens.add({ targets: a, alpha: 0.7, y: a.y + dir * 40, duration: 400, delay: i * 120, yoyo: true, onComplete: () => a.destroy() }));
    UI.toast(this, dir < 0 ? "An updraft!" : "A downdraft!", { y: 200, hold: 900 });
    this.time.delayedCall(900, () => {
      if (this.done) return;
      Snd.play("gust");
      this.gust = dir * 900; this.gustT = 1300;
      const streaks = this.add.particles(0, 0, "fx-streak", { x: W + 100, y: { min: 100, max: GROUND_Y }, speedX: { min: -2400, max: -1600 }, speedY: dir * 300,
        lifespan: 900, frequency: 30, alpha: { start: 0.5, end: 0 }, scaleX: { min: 1, max: 2 }, duration: 1200 }).setDepth(600);
      this.time.delayedCall(2400, () => streaks.destroy());
    });
  }

  warnBolt(half) {
    const y0 = half === "top" ? 0 : H / 2, zone = this.add.rectangle(W / 2, y0 + H / 4, W, H / 2, 0xffffff, 0).setDepth(700);
    this.tweens.add({ targets: zone, fillAlpha: 0.14, duration: 160, yoyo: true, repeat: 3 });
    UI.toast(this, half === "top" ? "Lightning above - dive!" : "Lightning below - climb!", { y: half === "top" ? 820 : 200, hold: 900 });
    this.time.delayedCall(1250, () => {
      zone.destroy();
      if (this.done) return;
      this.cameras.main.flash(180, 220, 220, 255);
      Snd.play("thunder");
      const g = this.add.graphics().setDepth(710).setBlendMode(Phaser.BlendModes.ADD);
      const bolt = (x, ya, yb, wd, branch) => {
        const pts = [[x, ya]];
        let px = x, py = ya;
        while (py < yb) { px += Phaser.Math.Between(-46, 46); py += Phaser.Math.Between(34, 60); pts.push([px, Math.min(py, yb)]); }
        [[wd * 4, 0x6a7aff, 0.25], [wd * 2, 0xc8d0ff, 0.6], [wd, 0xffffff, 1]].forEach(s => {
          g.lineStyle(s[0], s[1], s[2]); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); pts.forEach(p => g.lineTo(p[0], p[1])); g.strokePath();
        });
        if (branch) pts.forEach((p, i) => { if (i > 1 && i % 3 === 0) bolt(p[0], p[1], Math.min(yb, p[1] + 140), wd * 0.5, false); });
      };
      [CARPET_X - 60, CARPET_X + 110, 900 + Math.random() * 700].forEach(x => bolt(x, y0, y0 + H / 2, 3, true));
      this.tweens.add({ targets: g, alpha: 0, duration: 420, onComplete: () => g.destroy() });
      const cy = this.carpet.y;
      if ((half === "top" && cy < H / 2) || (half === "bottom" && cy >= H / 2)) this.hit("bolt", CARPET_X, cy);
    });
  }

  // ---------- the carpet's outline ----------
  // A row of short top-to-bottom segments across the carpet and rider, in
  // screen space, read from the painted pixels of both.
  outline() {
    const c = this.carpet, k = c.scaleX, cs = Math.cos(c.rotation), sn = Math.sin(c.rotation);
    const S = this.stripMask, R = this.riderMask, pts = this.pts;
    let n = 0;
    for (let col = 26; col <= 294; col += 6) {
      if (S.top[col] === MASK_EMPTY) continue;
      const sl = c.slices[Math.min(15, (col / 20) | 0)], u = col - 160;
      let t = sl.y - 40 + S.top[col];
      const b = sl.y - 40 + S.bot[col], rc = Math.round(u + 91);
      if (rc >= 0 && rc < R.w && R.top[rc] !== MASK_EMPTY) t = Math.min(t, c.rider.y - 150 + R.top[rc]);
      const p = pts[n] || (pts[n] = {});
      p.x0 = c.x + (u * cs - t * sn) * k; p.y0 = c.y + (u * sn + t * cs) * k;
      p.x1 = c.x + (u * cs - b * sn) * k; p.y1 = c.y + (u * sn + b * cs) * k;
      n++;
    }
    pts.n = n;
    return pts;
  }

  // Did anything touch the carpet this frame? -> [kind, x, y] or null
  contact() {
    const P = this.outline(), n = P.n;
    for (let i = 0; i < n; i++) { const p = P[i]; if (p.y1 > this.groundAt(p.x1) + 3) return ["ground", p.x1, p.y1]; }
    const TM = this.towerMask, BM = this.bankMask;
    for (let j = 0; j < this.objs.length; j++) {
      const o = this.objs[j];
      if (Math.abs(o.x - CARPET_X) > 420) continue;
      const tl = o.x - TM.w / 2, bl = o.x - BM.w / 2;
      for (let i = 0; i < n; i++) {
        const p = P[i];
        let col = Math.floor(p.x1 - tl);
        if (col >= 0 && col < TM.w && p.y1 > o.ty + TM.top[col] + 3) return ["tower", p.x1, p.y1];
        col = Math.floor(p.x0 - bl);
        if (col >= 0 && col < BM.w && p.y0 < o.by + BM.bot[col] - 3) return ["cloud", p.x0, p.y0];
      }
    }
    for (let j = 0; j < this.hazards.length; j++) {
      const h = this.hazards[j];
      if (h.gone || Math.abs(h.x - CARPET_X) > 230) continue;
      const hx = h.tip ? h.x - Math.cos(h.o.rotation) * 80 : h.x, hy = h.tip ? h.y - Math.sin(h.o.rotation) * 80 : h.y;
      for (let i = 0; i < n; i++) {
        const p = P[i];
        if (segDist(hx, hy, p.x0, p.y0, p.x1, p.y1) < h.r) return [h.kind, hx, hy];
        if (h.tip && segDist(h.x, h.y, p.x0, p.y0, p.x1, p.y1) < h.r) return [h.kind, h.x, h.y];
      }
    }
    for (let j = 0; j < this.kites.length; j++) {
      const kt = this.kites[j];
      if (Math.abs(kt.x - CARPET_X) > 420) continue;
      for (let i = 0; i < n; i++) {
        const p = P[i];
        if (segDist(kt.x, kt.y, p.x0, p.y0, p.x1, p.y1) < 46) return ["kite", kt.x, kt.y];
        for (let s = 0; s < kt.segs.length - 1; s++) {
          const a = kt.segs[s], b = kt.segs[s + 1];
          if (segCross(a[0], a[1], b[0], b[1], p.x0, p.y0, p.x1, p.y1)) return ["string", p.x0, (p.y0 + p.y1) / 2];
        }
      }
    }
    return null;
  }

  // ---------- play ----------
  tick(time, d) {
    if (!this.carpet) return;
    const dt = d / 1000, th = this.th, k = this.keys;
    const thrust = this.holding || k.space.isDown || k.up.isDown || k.w.isDown;
    if (!this.started) {
      this.carpet.y = 470 + Math.sin(time / 400) * 12;
      if (thrust) {
        this.started = true; Snd.play("whoosh");
        this.tweens.add({ targets: this.startHint, alpha: 0, duration: 300, onComplete: () => this.startHint.destroy() });
      }
      this.scrollBg(dt * 0.25);
      return;
    }
    if (this.done) { this.scrollBg(dt); return; }

    // carpet: ease toward a target climb/sink speed - responsive but smooth.
    // Wind and rising smoke shift that target, so they are felt for real.
    let want = thrust ? -470 : 430;
    if (this.gustT > 0) { this.gustT -= d; want += this.gust * 0.35; }
    want -= this.lift;
    this.vy += clamp(want - this.vy, -2600 * dt, 2600 * dt);
    this.carpet.y += this.vy * dt;
    if (this.carpet.y < 70) { this.carpet.y = 70; this.vy = Math.max(0, this.vy); }
    if (this.carpet.y > GROUND_Y + 40) { this.carpet.y = GROUND_Y + 40; this.vy = Math.min(0, this.vy); }
    this.carpet.rotation = clamp(this.vy / 1800, -0.22, 0.24);
    this.carpet.wave = 1 + Math.abs(this.vy) / 500;

    const v = th.speed * dt;
    this.dist += th.speed * dt;
    this.scrollBg(dt);
    while (this.nextIdx < this.course.list.length && this.course.list[this.nextIdx].d <= this.dist + (W - CARPET_X + 300)) {
      this.spawn(this.course.list[this.nextIdx++]);
    }

    // gates (and their archers and smoke)
    this.lift = 0;
    for (let i = this.objs.length - 1; i >= 0; i--) {
      const o = this.objs[i];
      o.x -= v; o.tower.x = o.x; o.bank.x = o.x;
      if (o.archer) this.updateArcher(o, d);
      if (o.plume) {
        o.plume.setPosition(o.x, o.plumeY); o.heat.x = o.x;
        if (Math.abs(this.carpet.x - o.x) < 95 && this.carpet.y < o.plumeY) this.lift = 540;
      }
      if (o.x < -320) {
        o.tower.destroy(); o.bank.destroy();
        if (o.archer) o.archer.spr.destroy();
        if (o.aim) o.aim.destroy();
        if (o.plume) { o.plume.destroy(); o.heat.destroy(); }
        this.objs.splice(i, 1);
      }
    }
    // sparks
    const cx = CARPET_X, cy = this.carpet.y;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.x -= v; it.s.x = it.x; it.gl.x = it.x;
      if (Math.abs(it.x - cx) < 100 && it.y > cy - 110 && it.y < cy + 50) { this.collect(it); this.items.splice(i, 1); continue; }
      if (it.x < -100) { it.s.destroy(); it.gl.destroy(); this.items.splice(i, 1); }
    }
    if (this.comboT > 0) { this.comboT -= d; if (this.comboT <= 0) this.sparkCombo = 0; }
    this.updateHazards(dt, v);
    this.updateKites(dt, v);

    if (this.invuln > 0) { this.invuln -= d; this.carpet.alpha = Math.floor(time / 80) % 2 ? 0.4 : 1; }
    else {
      this.carpet.alpha = 1;
      const c = this.contact();
      if (c) this.hit(c[0], c[1], c[2]);
    }

    const pct = clamp(this.dist / this.course.end, 0, 1);
    this.barFill.width = Math.max(4, this.barW * pct);
    this.barIcon.x = W / 2 - this.barW / 2 + this.barW * pct;
    if (!this.ckPassed && this.dist > this.course.checkpoint + 300) {
      this.ckPassed = true;
      Snd.play("chime"); UI.toast(this, "Halfway lantern - you'll restart here", { y: 200 });
    }
    if (this.dist >= this.course.end) this.arrive();
  }

  updateArcher(o, d) {
    const A = o.archer;
    A.spr.x = o.x + A.dx;
    if (A.state === 0 && o.x < 1560 && o.x > CARPET_X + 260) {
      A.state = 1; A.t = 700;
      A.spr.setFrame("a1");
      A.target = { x: CARPET_X - 20, y: this.carpet.y - 30 };
      o.aim = this.add.graphics().setDepth(431);
      Snd.play("bowdraw");
    }
    if (A.state === 1) {
      A.t -= d;
      const sx = A.spr.x - 36, sy = A.spr.y - 70;
      o.aim.clear();
      const k = 1 - A.t / 700;
      o.aim.lineStyle(4, 0xff5a3a, 0.35 + 0.5 * k);
      const L = Math.hypot(A.target.x - sx, A.target.y - sy), ux = (A.target.x - sx) / L, uy = (A.target.y - sy) / L;
      for (let s = 0; s < L + 600; s += 34) { o.aim.beginPath(); o.aim.moveTo(sx + ux * s, sy + uy * s); o.aim.lineTo(sx + ux * (s + 18), sy + uy * (s + 18)); o.aim.strokePath(); }
      if (A.t <= 0) {
        A.state = 2; A.spr.setFrame("a0");
        o.aim.destroy(); o.aim = null;
        if (!this.done) this.fireArrow(sx, sy, ux, uy, 1150);
      }
    }
  }

  updateHazards(dt, v) {
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (h.kind === "bird") {
        h.x -= v * h.speed; h.ph += dt * 5; h.y = h.by + Math.sin(h.ph) * 36;
        h.o.setFrame(h.frames + (Math.floor(h.ph * 2.6 + h.fr) % 4));
      } else if (h.kind === "falcon") {
        h.t += dt / h.dur;
        const t = h.t, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
        const nx = a * h.P0.x + b * h.P1.x + c * h.P2.x, ny = a * h.P0.y + b * h.P1.y + c * h.P2.y;
        h.o.rotation = clamp(Math.atan2(ny - h.y, -(nx - h.x)) * -1, -0.6, 0.6);
        h.x = nx; h.y = ny; h.ph += dt * 12;
        h.o.setFrame("falcon" + (t > 0.35 && t < 0.75 ? 0 : Math.floor(h.ph) % 4));
        if (t >= 1) h.x = -400;
      } else if (h.kind === "bat") {
        h.ph += dt * 3.1; h.ph2 += dt * 7.3;
        h.x -= v * 1.2 + Math.sin(h.ph2 * 0.7) * 90 * dt;
        h.y = h.by + Math.sin(h.ph) * 60 + Math.sin(h.ph2) * 22;
        h.o.setFrame("b" + (Math.floor(h.ph2 * 1.6) % 3));
      } else if (h.kind === "arrow") {
        h.x += h.vx * dt; h.y += h.vy * dt;
      }
      h.o.setPosition(h.x, h.y);
      if (h.x < -220 || h.x > W + 400 || h.y < -200 || h.y > H + 200) {
        h.o.destroy();
        if (h.trail) h.trail.destroy();
        this.hazards.splice(i, 1);
      }
    }
  }

  updateKites(dt, v) {
    for (let i = this.kites.length - 1; i >= 0; i--) {
      const kt = this.kites[i];
      kt.ph += dt * 1.8;
      kt.x -= v; kt.ax -= v;
      kt.y = kt.ky + Math.sin(kt.ph) * 18;
      kt.img.setPosition(kt.x + Math.sin(kt.ph * 0.7) * 8, kt.y).setRotation(Math.sin(kt.ph * 0.9) * 0.12);
      // the string sags from the kite down to a rooftop far ahead
      const gy = this.groundAt(kt.ax) - 4, segs = kt.segs;
      segs.length = 0;
      for (let s = 0; s <= 8; s++) {
        const t = s / 8;
        segs.push([lerp(kt.x, kt.ax, t), lerp(kt.y + 40, gy, t) + Math.sin(Math.PI * t) * 46]);
      }
      kt.str.clear();
      kt.str.lineStyle(5, 0x000000, 0.18); kt.str.beginPath(); kt.str.moveTo(segs[0][0], segs[0][1] + 2); segs.forEach(p => kt.str.lineTo(p[0], p[1] + 2)); kt.str.strokePath();
      kt.str.lineStyle(2.6, 0xfff4dc, 0.95); kt.str.beginPath(); kt.str.moveTo(segs[0][0], segs[0][1]); segs.forEach(p => kt.str.lineTo(p[0], p[1])); kt.str.strokePath();
      if (kt.ax < -200) { kt.img.destroy(); kt.str.destroy(); this.kites.splice(i, 1); }
    }
  }

  scrollBg(dt) {
    const s = this.th.speed * dt;
    this.far.tilePositionX += s * 0.12; this.mid.tilePositionX += s * 0.35; this.gnd.tilePositionX += s;
    if (this.clouds) this.clouds.forEach(c => { c.x -= s * 0.06; if (c.x < -300) c.x = W + 300; });
    if (this.sandFx) { this.sandFx.tilePositionX += s * 2.4; this.sandFx.tilePositionY -= s * 0.1; }
  }

  collect(it) {
    this.sparks++; this.sparkCombo++; this.comboT = 900;
    Snd.play("spark", { n: Math.min(10, this.sparkCombo - 1) });
    this.sparkTxt.setText("✦ " + this.sparks);
    this.tweens.add({ targets: [it.s, it.gl], x: 312, y: 62, scale: 0.2, alpha: 0, duration: 380, ease: "Cubic.easeIn", onComplete: () => { it.s.destroy(); it.gl.destroy(); } });
    if (this.sparks % 12 === 0 && this.lives < 3) {
      this.lives++; this.hearts.set(this.lives); Snd.play("heart");
      UI.toast(this, "A heart restored!", { y: 200 });
    }
  }

  hit(kind, x, y) {
    if (this.invuln > 0 || this.done) return;
    this.lives--;
    this.hearts.set(this.lives);
    this.invuln = 1500;
    if (kind === "ground" || kind === "tower") this.vy = -560;
    else if (kind === "cloud") this.vy = 380;
    else this.vy = this.vy * -0.4;
    // feedback that never moves the camera off the picture
    Snd.play("hurt");
    this.hurtOverlay.setAlpha(0.9);
    this.tweens.add({ targets: this.hurtOverlay, alpha: 0, duration: 560, ease: "Quad.easeOut" });
    const soft = kind === "cloud" || kind === "bolt";
    const burst = this.add.particles(x, y, soft ? "fx-puff" : "fx-dot", {
      speed: { min: 90, max: 340 }, angle: { min: 0, max: 360 }, scale: { start: soft ? 0.55 : 0.5, end: 0 }, alpha: { start: 0.95, end: 0 }, lifespan: 600,
      tint: soft ? [0xffffff, 0xd8e0ff] : (kind === "tower" || kind === "ground" ? [0xe8c890, 0x9a7a54] : [0xfff0c0, 0xffffff]), emitting: false
    }).setDepth(520);
    burst.explode(soft ? 10 : 20);
    this.time.delayedCall(900, () => burst.destroy());
    this.tweens.add({ targets: this.carpet, scaleX: 0.82, scaleY: 0.98, duration: 70, yoyo: true, ease: "Quad.easeOut" });
    if (this.lives <= 0) this.tumble();
  }

  tumble() {
    this.done = true;
    Snd.play("fail");
    this.tweens.add({ targets: this.carpet, y: GROUND_Y + 100, angle: 40, duration: 900, ease: "Quad.easeIn" });
    UI.toast(this, this.ckPassed ? "The carpet tumbles - back to the halfway lantern" : "The carpet tumbles - from the start", { y: 400, hold: 1400 });
    this.time.delayedCall(1700, () => this.restartWith({ theme: this.themeKey, toLabel: this.toLabel, ck: this.ckPassed ? 1 : 0, fails: this.fails + 1 }));
  }

  arrive() {
    this.done = true;
    Snd.play("success");
    UI.banner(this, "Arrived", this.toLabel, { y: 380, hold: 1500 });
    this.tweens.add({ targets: this.carpet, x: W + 300, y: 380, duration: 1800, ease: "Sine.easeIn" });
    this.time.delayedCall(2200, () => this.advance());
  }
}

// Distance from point (px, py) to the segment a-b.
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
// Do segments a-b and c-d cross?
function segCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx), d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax), d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}
