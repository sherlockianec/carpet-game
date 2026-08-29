// ============================================================
// draw.js — every visual in this game is built from vector
// shapes (Graphics + Container). No image assets required.
//
// Style target: stylized 16-bit illustrated vector — thick
// dark outlines, 3-5 flat colors per element, slightly
// exaggerated proportions, Persian/Central-Asian miniature
// silhouettes (bulbous ribbed domes, tapering muqarnas
// minarets, pointed iwan arches, geometric tile bands).
// ============================================================

const INK = 0x241811;       // primary outline — warm near-black
const INK_SOFT = 0x4a3626;  // lighter secondary line (folds, seams)

// ---------- basic environment ----------

function drawSky(scene, topColor, botColor) {
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();
  g.fillGradientStyle(topColor, topColor, botColor, botColor, 1);
  g.fillRect(0, 0, W, H);
  return g;
}

function drawGround(scene, color, h, opts) {
  opts = opts || {};
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(0, H - h, W, h);
  // horizon seam
  g.fillStyle(INK, 0.18);
  g.fillRect(0, H - h, W, 3);
  if (opts.texture !== false) {
    // sparse organic texture flecks (sand grain / cobble suggestion)
    const flecks = opts.flecks || Math.floor(W / 34);
    const shade = opts.shade !== undefined ? opts.shade : INK;
    for (let i = 0; i < flecks; i++) {
      const fx = Phaser.Math.Between(0, W);
      const fy = Phaser.Math.Between(H - h + 8, H - 4);
      const fw = Phaser.Math.Between(3, 9);
      g.fillStyle(shade, 0.07 + Math.random() * 0.06);
      g.fillEllipse(fx, fy, fw, fw * 0.4);
    }
  }
  return g;
}

function drawClueHUD(scene) {
  const items = [
    { key: "swatch", color: 0xc9a24b, label: "cloth" },
    { key: "phrase", color: 0x2fb8ac, label: "word" },
    { key: "caseObtained", color: 0x8a5a34, label: "case" }
  ];
  let x = 18;
  const y = scene.scale.height - 16;
  items.forEach(it => {
    if (GameState.clues[it.key]) {
      const g = scene.add.graphics().setScrollFactor(0).setDepth(900);
      g.fillStyle(0x171025, 0.85);
      g.fillRoundedRect(x - 12, y - 12, 24, 24, 6);
      g.lineStyle(1.6, it.color, 1);
      g.strokeRoundedRect(x - 12, y - 12, 24, 24, 6);
      g.fillStyle(it.color, 1);
      g.fillCircle(x, y, 6);
      g.lineStyle(1.2, INK, 0.6);
      g.strokeCircle(x, y, 6);
      x += 30;
    }
  });
}

function makeClickable(container, w, h, cb) {
  container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
  container.on("pointerdown", cb);
  return container;
}

// ---------- animation helpers (used sparingly — high-impact spots only) ----------

function addBreathing(scene, obj, opts) {
  opts = opts || {};
  const amt = opts.amount !== undefined ? opts.amount : 0.02;
  const base = obj.scaleY !== undefined ? obj.scaleY : 1;
  return scene.tweens.add({
    targets: obj, scaleY: base * (1 + amt), duration: opts.duration || 1900,
    yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: opts.delay || 0
  });
}

function addBob(scene, obj, opts) {
  opts = opts || {};
  const dist = opts.distance !== undefined ? opts.distance : 4;
  const baseY = obj.y;
  return scene.tweens.add({
    targets: obj, y: baseY - dist, duration: opts.duration || 1500,
    yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: opts.delay || 0
  });
}

function addSway(scene, obj, opts) {
  opts = opts || {};
  const amt = opts.amount !== undefined ? opts.amount : 0.06;
  return scene.tweens.add({
    targets: obj, rotation: amt, duration: opts.duration || 1700,
    yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: opts.delay || 0
  });
}

function addFlicker(scene, obj, opts) {
  opts = opts || {};
  return scene.tweens.add({
    targets: obj, alpha: { from: opts.min || 0.65, to: opts.max || 1 },
    scale: { from: 0.9, to: 1.08 },
    duration: opts.duration || 260, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
  });
}

// ---------- pure geometry helpers ----------

// Closed polygon for a pointed Timurid/iwan arch niche sitting on a
// rectangular body: bottom-left -> up left jamb -> curve to apex ->
// curve down to right jamb -> bottom-right.
function archOutline(cx, topY, w, archH, bodyH) {
  const halfW = w / 2, steps = 6, pts = [];
  pts.push({ x: cx - halfW, y: topY + bodyH });
  pts.push({ x: cx - halfW, y: topY });
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: cx - halfW * (1 - t), y: topY - archH * Math.pow(t, 1.7) });
  }
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    pts.push({ x: cx + halfW * t, y: topY - archH * Math.pow(1 - t, 1.7) });
  }
  pts.push({ x: cx + halfW, y: topY + bodyH });
  return pts;
}

function tileBand(g, x, y, w, colorA, colorB, cell) {
  cell = cell || 8;
  const n = Math.round(w / cell);
  for (let i = 0; i < n; i++) {
    g.fillStyle(i % 2 === 0 ? colorA : colorB, 1);
    g.fillRect(x + i * cell, y, cell, cell);
  }
}

// ---------- character system ----------
//
// makePerson(scene, x, y, opts) — opts:
//   robe, trim, skin, hair (colors) · headwear: turban|doppi|kalpak|
//   crown|minister|helmet|scarf|none · mood: neutral|stern|kind|
//   worried|grim · beard (bool) · scale · facing (1|-1) ·
//   holding: staff|spear|sword|none

function drawFace(g, cx, cy, r, mood) {
  const eyeY = cy - r * 0.06, eyeDX = r * 0.42, eyeR = r * 0.16;
  g.fillStyle(0xfdf8ec, 0.95);
  g.fillEllipse(cx - eyeDX, eyeY, eyeR * 2.2, eyeR * 1.7);
  g.fillEllipse(cx + eyeDX, eyeY, eyeR * 2.2, eyeR * 1.7);
  g.fillStyle(INK, 1);
  g.fillCircle(cx - eyeDX, eyeY + eyeR * 0.1, eyeR * 0.62);
  g.fillCircle(cx + eyeDX, eyeY + eyeR * 0.1, eyeR * 0.62);

  const browY = eyeY - r * 0.4;
  let tilt = 0.05 * r;
  if (mood === "stern" || mood === "grim") tilt = r * 0.28;
  else if (mood === "kind") tilt = -r * 0.08;
  else if (mood === "worried") tilt = -r * 0.02;
  g.lineStyle(Math.max(1.6, r * 0.13), INK, 1);
  g.beginPath();
  g.moveTo(cx - eyeDX - eyeR * 1.3, browY + tilt * 0.3);
  g.lineTo(cx - eyeDX + eyeR * 1.2, browY - tilt);
  g.strokePath();
  g.beginPath();
  g.moveTo(cx + eyeDX + eyeR * 1.3, browY + tilt * 0.3);
  g.lineTo(cx + eyeDX - eyeR * 1.2, browY - tilt);
  g.strokePath();

  const mouthY = cy + r * 0.52;
  g.lineStyle(Math.max(1.4, r * 0.11), INK, 1);
  g.beginPath();
  if (mood === "kind") g.arc(cx, mouthY - r * 0.1, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI, false);
  else if (mood === "grim" || mood === "stern") { g.moveTo(cx - r * 0.24, mouthY + r * 0.06); g.lineTo(cx + r * 0.24, mouthY - r * 0.02); }
  else if (mood === "worried") g.arc(cx, mouthY + r * 0.3, r * 0.24, 1.2 * Math.PI, 1.8 * Math.PI, true);
  else { g.moveTo(cx - r * 0.2, mouthY); g.lineTo(cx + r * 0.2, mouthY); }
  g.strokePath();
}

function drawHeadwear(g, cx, headCY, r, type, c) {
  if (type === "turban") {
    g.fillStyle(c.trim, 1);
    g.fillEllipse(cx, headCY - r * 0.85, r * 2.3, r * 1.5);
    g.fillEllipse(cx - r * 0.85, headCY - r * 0.5, r * 1.05, r * 0.85);
    g.fillEllipse(cx + r * 0.9, headCY - r * 0.55, r * 0.85, r * 0.7);
    g.lineStyle(2, INK, 1);
    g.strokeEllipse(cx, headCY - r * 0.85, r * 2.3, r * 1.5);
    g.fillStyle(0x2fb8ac, 1);
    g.fillCircle(cx, headCY - r * 1.35, r * 0.2);
  } else if (type === "doppi") {
    g.fillStyle(0x18202c, 1);
    g.fillRoundedRect(cx - r * 0.85, headCY - r * 1.55, r * 1.7, r * 0.85, 3);
    g.lineStyle(1.6, INK, 1);
    g.strokeRoundedRect(cx - r * 0.85, headCY - r * 1.55, r * 1.7, r * 0.85, 3);
    g.fillStyle(0xf2f2f2, 1);
    for (let i = -1; i <= 1; i++) g.fillCircle(cx + i * r * 0.5, headCY - r * 1.12, r * 0.09);
  } else if (type === "kalpak") {
    g.fillStyle(0xe8e2d0, 1);
    g.fillTriangle(cx - r * 1.15, headCY - r * 0.65, cx + r * 1.15, headCY - r * 0.65, cx, headCY - r * 2.15);
    g.lineStyle(2, INK, 1);
    g.strokeTriangle(cx - r * 1.15, headCY - r * 0.65, cx + r * 1.15, headCY - r * 0.65, cx, headCY - r * 2.15);
    g.fillStyle(0x14324f, 1);
    g.fillRect(cx - r * 1.2, headCY - r * 0.82, r * 2.4, r * 0.32);
  } else if (type === "crown") {
    const pts = [
      { x: cx - r * 1.05, y: headCY - r * 0.6 }, { x: cx - r * 1.05, y: headCY - r * 1.3 },
      { x: cx - r * 0.52, y: headCY - r * 0.92 }, { x: cx, y: headCY - r * 1.65 },
      { x: cx + r * 0.52, y: headCY - r * 0.92 }, { x: cx + r * 1.05, y: headCY - r * 1.3 },
      { x: cx + r * 1.05, y: headCY - r * 0.6 }
    ];
    g.fillStyle(0xd9a441, 1);
    g.fillPoints(pts, true);
    g.lineStyle(2.2, INK, 1);
    g.strokePoints(pts, true);
    g.fillStyle(0x8e2f2f, 1);
    g.fillCircle(cx, headCY - r * 1.05, r * 0.17);
    g.fillStyle(0x2fb8ac, 1);
    g.fillCircle(cx - r * 0.58, headCY - r * 0.85, r * 0.12);
    g.fillCircle(cx + r * 0.58, headCY - r * 0.85, r * 0.12);
  } else if (type === "minister") {
    g.fillStyle(0x2c3e6b, 1);
    g.fillRoundedRect(cx - r * 0.78, headCY - r * 2.0, r * 1.56, r * 1.45, r * 0.4);
    g.lineStyle(2, INK, 1);
    g.strokeRoundedRect(cx - r * 0.78, headCY - r * 2.0, r * 1.56, r * 1.45, r * 0.4);
    g.fillStyle(c.trim, 1);
    g.fillRect(cx - r * 0.78, headCY - r * 0.78, r * 1.56, r * 0.22);
  } else if (type === "helmet") {
    g.fillStyle(0x8a8a92, 1);
    g.fillEllipse(cx, headCY - r * 0.7, r * 2.2, r * 1.5);
    g.lineStyle(2, INK, 1);
    g.strokeEllipse(cx, headCY - r * 0.7, r * 2.2, r * 1.5);
    g.fillStyle(0x6a6a72, 1);
    g.fillTriangle(cx - r * 0.16, headCY - r * 1.45, cx + r * 0.16, headCY - r * 1.45, cx, headCY - r * 2.05);
    g.fillStyle(0xb8c0c8, 1);
    g.fillRect(cx - r * 1.1, headCY - r * 0.25, r * 2.2, r * 0.22);
  } else if (type === "scarf") {
    g.fillStyle(c.trim, 1);
    g.fillEllipse(cx, headCY - r * 0.62, r * 2.05, r * 1.15);
    g.fillTriangle(cx - r * 0.95, headCY - r * 0.35, cx - r * 0.55, headCY - r * 0.35, cx - r * 1.15, headCY + r * 0.85);
    g.fillTriangle(cx + r * 0.95, headCY - r * 0.35, cx + r * 0.55, headCY - r * 0.35, cx + r * 1.15, headCY + r * 0.85);
    g.lineStyle(1.8, INK, 1);
    g.strokeEllipse(cx, headCY - r * 0.62, r * 2.05, r * 1.15);
  } else {
    g.fillStyle(c.hair, 1);
    g.fillEllipse(cx, headCY - r * 0.58, r * 1.85, r * 1.05);
    g.lineStyle(1.6, INK, 1);
    g.strokeEllipse(cx, headCY - r * 0.58, r * 1.85, r * 1.05);
  }
}

function makePerson(scene, x, y, opts) {
  opts = opts || {};
  const robe = opts.robe !== undefined ? opts.robe : 0x3a6a6a;
  const trim = opts.trim !== undefined ? opts.trim : 0xd9a441;
  const skin = opts.skin !== undefined ? opts.skin : 0xdcbf8a;
  const hair = opts.hair !== undefined ? opts.hair : 0x2a1c14;
  const headwear = opts.headwear || "none";
  const mood = opts.mood || "neutral";
  const scale = opts.scale || 1;
  const facing = opts.facing || 1;
  const beard = !!opts.beard;
  const holding = opts.holding || "none";

  const g = scene.add.graphics();
  const headR = 12.5, headCY = -47, neckY = -35, shoulderY = -33, footY = 2;
  const topW = 21, botW = 28;

  // feet
  g.fillStyle(INK, 1);
  g.fillRoundedRect(-9, footY - 4, 8, 7, 2);
  g.fillRoundedRect(1, footY - 4, 8, 7, 2);

  // robe body
  const bodyPts = [
    { x: -topW * 0.42, y: shoulderY }, { x: topW * 0.42, y: shoulderY },
    { x: botW * 0.5, y: footY }, { x: -botW * 0.5, y: footY }
  ];
  g.fillStyle(robe, 1);
  g.fillPoints(bodyPts, true);
  g.lineStyle(2.4, INK, 1);
  g.strokePoints(bodyPts, true);

  // sash + placket
  g.fillStyle(trim, 1);
  g.fillRect(-topW * 0.46, -9, topW * 0.92, 5);
  g.fillStyle(trim, 0.85);
  g.fillRect(-3, shoulderY + 3, 6, footY - shoulderY - 5);
  // hem trim
  g.fillStyle(trim, 0.7);
  g.fillRect(-botW * 0.5, footY - 3, botW, 2.4);

  // arms
  g.fillStyle(robe, 1);
  g.fillRoundedRect(-topW * 0.42 - 7, shoulderY + 2, 8, 25, 4);
  g.fillRoundedRect(topW * 0.42 - 1, shoulderY + 2, 8, 25, 4);
  g.lineStyle(2, INK, 1);
  g.strokeRoundedRect(-topW * 0.42 - 7, shoulderY + 2, 8, 25, 4);
  g.strokeRoundedRect(topW * 0.42 - 1, shoulderY + 2, 8, 25, 4);
  g.fillStyle(skin, 1);
  g.fillCircle(-topW * 0.42 - 3, shoulderY + 29, 4.3);
  g.fillCircle(topW * 0.42 + 3, shoulderY + 29, 4.3);
  g.lineStyle(1.6, INK, 1);
  g.strokeCircle(-topW * 0.42 - 3, shoulderY + 29, 4.3);
  g.strokeCircle(topW * 0.42 + 3, shoulderY + 29, 4.3);

  // neck + head
  g.fillStyle(skin, 1);
  g.fillRect(-4.2, neckY, 8.4, 9);
  g.fillCircle(-headR + 1.5, headCY, 2.8);
  g.fillCircle(headR - 1.5, headCY, 2.8);
  g.fillCircle(0, headCY, headR);
  g.lineStyle(2.4, INK, 1);
  g.strokeCircle(0, headCY, headR);

  drawFace(g, 0, headCY, headR, mood);

  if (beard) {
    // sideburns hugging the jaw (kept clear of eyes + mouth)
    g.fillStyle(hair, 1);
    g.fillTriangle(-headR * 0.95, headCY - headR * 0.15, -headR * 0.55, headCY - headR * 0.1, -headR * 0.68, headCY + headR * 0.45);
    g.fillTriangle(headR * 0.95, headCY - headR * 0.15, headR * 0.55, headCY - headR * 0.1, headR * 0.68, headCY + headR * 0.45);
    // chin goatee, sitting below the mouth
    const bpts = [
      { x: -headR * 0.34, y: headCY + headR * 0.46 }, { x: headR * 0.34, y: headCY + headR * 0.46 },
      { x: headR * 0.22, y: headCY + headR * 0.98 }, { x: -headR * 0.22, y: headCY + headR * 0.98 }
    ];
    g.fillPoints(bpts, true);
    g.lineStyle(1.6, INK, 1);
    g.strokePoints(bpts, true);
  }

  drawHeadwear(g, 0, headCY, headR, headwear, { trim, hair, skin });

  if (holding === "staff" || holding === "spear") {
    const topY = holding === "spear" ? footY - 66 : footY - 40;
    g.lineStyle(3, 0x5a4326, 1);
    g.lineBetween(topW * 0.42 + 8, shoulderY + 8, topW * 0.42 + 8, topY);
    if (holding === "spear") {
      g.fillStyle(0xb8c0c8, 1);
      g.fillTriangle(topW * 0.42 + 4, topY, topW * 0.42 + 12, topY, topW * 0.42 + 8, topY - 14);
      g.lineStyle(1.4, INK, 1);
      g.strokeTriangle(topW * 0.42 + 4, topY, topW * 0.42 + 12, topY, topW * 0.42 + 8, topY - 14);
    }
  } else if (holding === "sword") {
    g.lineStyle(2.6, 0xb8c0c8, 1);
    g.lineBetween(-topW * 0.42 - 7, footY - 2, -topW * 0.42 - 15, footY - 32);
    g.fillStyle(0x6b4a2e, 1);
    g.fillCircle(-topW * 0.42 - 7, footY - 2, 3.4);
  } else if (holding === "basket") {
    g.fillStyle(0x8a6a3a, 1);
    g.fillRoundedRect(topW * 0.42 - 2, footY - 18, 14, 12, 2);
    g.lineStyle(1.4, INK, 1);
    g.strokeRoundedRect(topW * 0.42 - 2, footY - 18, 14, 12, 2);
  }

  const c = scene.add.container(x, y, [g]);
  c.setScale(scale * (facing < 0 ? -1 : 1), scale);
  c._headCY = headCY;
  c.bodyGfx = g;
  return c;
}

// ---------- flying carpet ----------

function makeCarpet(scene, x, y, scale) {
  scale = scale || 1;
  const g = scene.add.graphics();
  // body
  g.fillStyle(0x8e2f2f, 1);
  g.fillRoundedRect(-32, -9, 64, 18, 4);
  g.lineStyle(2, INK, 1);
  g.strokeRoundedRect(-32, -9, 64, 18, 4);
  // woven pattern bands
  g.fillStyle(0xd9a441, 1);
  g.fillRect(-32, -9, 64, 3);
  g.fillRect(-32, 6, 64, 3);
  g.fillStyle(0x2fb8ac, 1);
  for (let i = -24; i <= 24; i += 12) g.fillRect(i - 2, -3, 4, 6);
  g.fillStyle(0xf2e6c8, 1);
  g.fillRect(-32, -1, 64, 2);
  // tassels (front + back edges)
  g.fillStyle(0xd9a441, 1);
  for (let i = -2; i <= 2; i++) { g.fillRect(31 + (i % 2), -8 + i * 3.4, 4, 2); }
  for (let i = -2; i <= 2; i++) { g.fillRect(-35 - (i % 2), -8 + i * 3.4, 4, 2); }
  // rider silhouette
  g.fillStyle(0x1a1512, 1);
  g.fillTriangle(-11, -3, 5, -3, -3, -13);
  g.fillStyle(0xdcbf8a, 1);
  g.fillCircle(-3, -14, 5.4);
  g.fillStyle(0xc9a24b, 1);
  g.fillEllipse(-3, -18, 9, 5);
  const c = scene.add.container(x, y, [g]);
  c.setScale(scale);
  return c;
}

// ---------- Timurid architecture ----------

// Cheap silhouette dome (skyline / background use).
function makeDome(scene, x, y, r, color, accent) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(-r * 0.58, -r * 0.9, r * 1.16, r * 0.9);
  g.fillEllipse(0, -r * 0.9, r * 1.55, r * 1.15);
  g.lineStyle(1.4, INK, 0.55);
  g.strokeEllipse(0, -r * 0.9, r * 1.55, r * 1.15);
  g.fillStyle(accent || 0xd9a441, 1);
  g.fillRect(-r * 0.58, -r * 0.5, r * 1.16, r * 0.12);
  g.fillCircle(0, -r * 1.5, 3.4);
  g.fillRect(-1, -r * 1.5, 2, r * 0.42);
  return scene.add.container(x, y, [g]);
}

// Cheap silhouette minaret (skyline / background use).
function makeMinaret(scene, x, y, h, color, accent) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillTriangle(-9, 0, 9, 0, 11, -h);
  g.fillTriangle(-9, 0, 11, -h, -11, -h);
  g.lineStyle(1.3, INK, 0.5);
  g.strokeTriangle(-9, 0, -11, -h, 11, -h);
  g.fillStyle(accent || 0xd9a441, 1);
  g.fillRect(-10.5, -h * 0.32, 21, 4.5);
  g.fillRect(-9, -h * 0.68, 18, 3.5);
  g.fillStyle(color, 1);
  g.fillEllipse(0, -h, 15, 10);
  g.fillStyle(accent || 0xd9a441, 1);
  g.fillCircle(0, -h - 8, 3);
  g.fillRect(-1, -h - 8, 2, 8);
  return scene.add.container(x, y, [g]);
}

// Detailed foreground Timurid building: portal (pishtaq) + tile
// bands + drum dome + finial. opts: {w,h,domeR,body,portal,tile1,
// tile2,accent,domeColor}
function makeBuilding(scene, x, y, opts) {
  opts = opts || {};
  const w = opts.w || 120, h = opts.h || 100;
  const body = opts.body !== undefined ? opts.body : 0xc9a24b;
  const portal = opts.portal !== undefined ? opts.portal : 0x6b3f2e;
  const tile1 = opts.tile1 !== undefined ? opts.tile1 : 0x1c6e8c;
  const tile2 = opts.tile2 !== undefined ? opts.tile2 : 0xdff0ea;
  const accent = opts.accent !== undefined ? opts.accent : 0xd9a441;
  const domeColor = opts.domeColor !== undefined ? opts.domeColor : 0x1c6e8c;
  const domeR = opts.domeR || w * 0.34;

  const g = scene.add.graphics();
  // main facade block
  g.fillStyle(body, 1);
  g.fillRect(-w / 2, -h, w, h);
  g.lineStyle(2.4, INK, 1);
  g.strokeRect(-w / 2, -h, w, h);

  // tile band under the cornice
  tileBand(g, -w / 2, -h + h * 0.12, w, tile1, tile2, w / 14);
  g.lineStyle(1, INK, 0.4);
  g.strokeRect(-w / 2, -h + h * 0.12, w, w / 14);

  // corner finials
  g.fillStyle(accent, 1);
  g.fillCircle(-w / 2 + 6, -h - 4, 4);
  g.fillCircle(w / 2 - 6, -h - 4, 4);

  // pointed-arch portal niche
  const archPts = archOutline(0, -h * 0.28, w * 0.42, h * 0.5, h * 0.42);
  g.fillStyle(portal, 1);
  g.fillPoints(archPts, true);
  g.lineStyle(2.4, INK, 1);
  g.strokePoints(archPts, true);
  // inner niche shadow + small door
  const innerPts = archOutline(0, -h * 0.28, w * 0.30, h * 0.38, h * 0.3);
  g.fillStyle(0x140f0c, 0.55);
  g.fillPoints(innerPts, true);
  // muqarnas frame dots around portal
  g.fillStyle(accent, 1);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    g.fillCircle(-w * 0.21 + t * w * 0.42, -h * 0.62, 2.6);
  }

  // drum + dome on top, centered
  g.fillStyle(body, 1);
  g.fillRect(-domeR * 0.6, -h - domeR * 0.5, domeR * 1.2, domeR * 0.5);
  g.fillStyle(domeColor, 1);
  g.fillEllipse(0, -h - domeR * 0.5, domeR * 1.7, domeR * 1.25);
  g.lineStyle(2, INK, 1);
  g.strokeEllipse(0, -h - domeR * 0.5, domeR * 1.7, domeR * 1.25);
  // dome ribbing
  g.lineStyle(1.4, 0x0e3a4a, 0.55);
  for (let i = -2; i <= 2; i++) {
    g.beginPath();
    g.moveTo(i * domeR * 0.22, -h - domeR * 0.5 - domeR * 0.56);
    g.lineTo(i * domeR * 0.36, -h - domeR * 0.5 + domeR * 0.46);
    g.strokePath();
  }
  g.fillStyle(accent, 1);
  g.fillCircle(0, -h - domeR * 1.05, 4);
  g.fillRect(-1.5, -h - domeR * 1.05, 3, domeR * 0.5);

  return scene.add.container(x, y, [g]);
}

function makeCrenellatedWall(scene, x, y, w, h, color, accent) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(-w / 2, -h, w, h);
  g.lineStyle(2, INK, 1);
  g.strokeRect(-w / 2, -h, w, h);
  tileBand(g, -w / 2, -h * 0.35, w, accent || 0xd9a441, INK_SOFT, 14);
  const merlonW = 18, gap = 10, count = Math.floor(w / (merlonW + gap));
  g.fillStyle(color, 1);
  let mx = -w / 2 + (w - count * (merlonW + gap) + gap) / 2;
  for (let i = 0; i < count; i++) {
    g.fillRect(mx, -h - 14, merlonW, 14);
    g.lineStyle(1.6, INK, 1);
    g.strokeRect(mx, -h - 14, merlonW, 14);
    mx += merlonW + gap;
  }
  return scene.add.container(x, y, [g]);
}

function makeThrone(scene, x, y, opts) {
  opts = opts || {};
  const seat = opts.seat !== undefined ? opts.seat : 0x6b3f2e;
  const gold = opts.gold !== undefined ? opts.gold : 0xd9a441;
  const cush = opts.cush !== undefined ? opts.cush : 0x8e2f2f;
  const tile = opts.tile !== undefined ? opts.tile : 0x1c6e8c;
  const w = opts.w || 100, h = opts.h || 160;

  const g = scene.add.graphics();
  // dais step
  g.fillStyle(INK_SOFT, 1);
  g.fillRect(-w * 0.95, -16, w * 1.9, 16);
  g.lineStyle(2, INK, 1);
  g.strokeRect(-w * 0.95, -16, w * 1.9, 16);

  // arched iwan backrest (echoes the building portal motif)
  const backPts = archOutline(0, -h * 0.34, w * 0.86, h * 0.62, h * 0.5);
  g.fillStyle(seat, 1);
  g.fillPoints(backPts, true);
  g.lineStyle(2.6, INK, 1);
  g.strokePoints(backPts, true);
  // gold inlay frame, echoing the arch
  const innerFrame = archOutline(0, -h * 0.34, w * 0.68, h * 0.5, h * 0.36);
  g.lineStyle(3, gold, 1);
  g.strokePoints(innerFrame, false);
  // tile accent band across the base of the back
  g.fillStyle(tile, 1);
  g.fillRect(-w * 0.43, -h * 0.34 - 5, w * 0.86, 8);

  // side posts
  g.fillStyle(seat, 1);
  g.fillRoundedRect(-w * 0.56, -h * 0.4, 10, h * 0.4, 3);
  g.fillRoundedRect(w * 0.46, -h * 0.4, 10, h * 0.4, 3);
  g.lineStyle(2, INK, 1);
  g.strokeRoundedRect(-w * 0.56, -h * 0.4, 10, h * 0.4, 3);
  g.strokeRoundedRect(w * 0.46, -h * 0.4, 10, h * 0.4, 3);

  // cushion / seat
  g.fillStyle(cush, 1);
  g.fillRoundedRect(-w * 0.5, -46, w, 34, 6);
  g.lineStyle(2, INK, 1);
  g.strokeRoundedRect(-w * 0.5, -46, w, 34, 6);
  g.lineStyle(1.6, gold, 0.9);
  g.strokeRoundedRect(-w * 0.42, -40, w * 0.84, 22, 4);

  // arm finials
  g.fillStyle(gold, 1);
  g.fillCircle(-w * 0.52, -42, 8);
  g.fillCircle(w * 0.52, -42, 8);
  g.lineStyle(1.6, INK, 1);
  g.strokeCircle(-w * 0.52, -42, 8);
  g.strokeCircle(w * 0.52, -42, 8);

  // crest finial atop the arch apex
  g.fillStyle(gold, 1);
  g.fillCircle(0, -h * 0.34 - h * 0.62 - 6, 6);
  g.fillTriangle(-7, -h * 0.34 - h * 0.62, 7, -h * 0.34 - h * 0.62, 0, -h * 0.34 - h * 0.62 - 16);
  g.lineStyle(1.6, INK, 1);
  g.strokeCircle(0, -h * 0.34 - h * 0.62 - 6, 6);
  return scene.add.container(x, y, [g]);
}

// Brazier with a built-in flickering flame (returns {container, flame}).
function makeBrazier(scene, x, y) {
  const g = scene.add.graphics();
  g.fillStyle(0x3a352c, 1);
  g.fillRect(-2.5, -30, 5, 22);
  g.fillEllipse(0, -32, 22, 9);
  g.lineStyle(1.8, INK, 1);
  g.strokeEllipse(0, -32, 22, 9);
  g.fillStyle(0x201c16, 1);
  g.fillEllipse(0, -34, 15, 5);
  const container = scene.add.container(x, y, [g]);

  const flame = scene.add.graphics();
  flame.fillStyle(0xffb23a, 1);
  flame.fillTriangle(-6, 0, 6, 0, 0, -16);
  flame.fillStyle(0xffe37a, 1);
  flame.fillTriangle(-3, -1, 3, -1, 0, -10);
  flame.setPosition(x, y - 38);
  addFlicker(scene, flame, { duration: 220 + Math.random() * 160 });
  return { container, flame };
}

// ---------- graves & skulls ----------

function makeGrave(scene, x, y, opts) {
  opts = opts || {};
  const tilt = opts.tilt !== undefined ? opts.tilt : Phaser.Math.FloatBetween(-0.05, 0.05);
  const g = scene.add.graphics();
  g.fillStyle(0x585047, 1);
  const pts = archOutline(0, -8, 22, 14, 22);
  g.fillPoints(pts, true);
  g.lineStyle(2, INK, 1);
  g.strokePoints(pts, true);
  g.fillStyle(0x3a352c, 0.5);
  g.fillRect(-9, -18, 18, 2);
  g.fillRect(-6, -12, 12, 1.6);
  // weathering crack
  if (Math.random() < 0.5) {
    g.lineStyle(1.2, 0x3a352c, 0.6);
    g.beginPath();
    g.moveTo(-4, -20);
    g.lineTo(2, -8);
    g.lineTo(-2, 0);
    g.strokePath();
  }
  g.fillStyle(0x6a6255, 0.7);
  g.fillEllipse(0, 1, 30, 6);
  const c = scene.add.container(x, y, [g]);
  c.rotation = tilt;
  return c;
}

// Menacing skull, optionally hung from an iron hook + chain.
function makeSkull(scene, x, y, opts) {
  opts = opts || {};
  const hung = opts.hung !== false;
  const g = scene.add.graphics();
  const topY = hung ? -14 : 0;
  if (hung) {
    g.lineStyle(2, 0x2a2a30, 1);
    g.beginPath(); g.moveTo(0, -26); g.lineTo(0, -16); g.strokePath();
    g.fillStyle(0x3a3a42, 1);
    g.fillCircle(0, -26, 3);
    g.strokeCircle(0, -14, 3);
  }
  // cranium
  g.fillStyle(0xcfc7b4, 1);
  g.fillEllipse(0, topY, 22, 19);
  g.lineStyle(2, INK, 1);
  g.strokeEllipse(0, topY, 22, 19);
  // deep brow shadow band
  g.fillStyle(0x8f8672, 0.8);
  g.fillEllipse(0, topY - 3, 20, 8);
  // eye sockets — deep dark hollows
  g.fillStyle(0x0c0a08, 1);
  g.fillEllipse(-6, topY, 6.4, 8);
  g.fillEllipse(6, topY, 6.4, 8);
  g.fillStyle(0x3a1010, 0.55);
  g.fillEllipse(-6, topY + 1.5, 4.4, 3.6);
  g.fillEllipse(6, topY + 1.5, 4.4, 3.6);
  // nasal cavity
  g.fillStyle(0x0c0a08, 1);
  g.fillTriangle(-2.6, topY + 4, 2.6, topY + 4, 0, topY + 10);
  // cheekbone shading
  g.fillStyle(0x9a8f78, 0.6);
  g.fillEllipse(-9, topY + 5, 5, 4);
  g.fillEllipse(9, topY + 5, 5, 4);
  // jaw + teeth
  g.fillStyle(0xc4bba8, 1);
  g.fillRoundedRect(-9, topY + 8, 18, 8, 2);
  g.lineStyle(1.6, INK, 1);
  g.strokeRoundedRect(-9, topY + 8, 18, 8, 2);
  g.lineStyle(1.2, 0x8f8672, 0.8);
  for (let i = -7; i <= 7; i += 3.5) { g.beginPath(); g.moveTo(i, topY + 8); g.lineTo(i, topY + 16); g.strokePath(); }
  // crack detail
  g.lineStyle(1, 0x8f8672, 0.7);
  g.beginPath(); g.moveTo(10, topY - 8); g.lineTo(6, topY - 1); g.strokePath();
  return scene.add.container(x, y, [g]);
}

// ---------- bazaar / nature props ----------

function makeTree(scene, x, y, opts) {
  opts = opts || {};
  const trunk = opts.trunk !== undefined ? opts.trunk : 0x5a4326;
  const leaf = opts.leaf !== undefined ? opts.leaf : 0x4a7a4a;
  const h = opts.h || 70;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.16);
  g.fillEllipse(0, 3, h * 0.5, h * 0.14);
  g.fillStyle(trunk, 1);
  g.fillRect(-4, -h * 0.42, 8, h * 0.42 + 3);
  g.lineStyle(1.6, INK, 1);
  g.strokeRect(-4, -h * 0.42, 8, h * 0.42 + 3);
  g.fillStyle(leaf, 1);
  g.fillCircle(0, -h * 0.62, h * 0.32);
  g.fillCircle(-h * 0.22, -h * 0.5, h * 0.22);
  g.fillCircle(h * 0.22, -h * 0.5, h * 0.22);
  g.lineStyle(2, INK, 1);
  g.strokeCircle(0, -h * 0.62, h * 0.32);
  g.fillStyle(0xffffff, 0.12);
  g.fillCircle(-h * 0.08, -h * 0.74, h * 0.12);
  return scene.add.container(x, y, [g]);
}

function makeBazaarStall(scene, x, y, opts) {
  opts = opts || {};
  const wood = opts.wood !== undefined ? opts.wood : 0x6b4a2e;
  const cloth = opts.cloth !== undefined ? opts.cloth : 0x8e2f2f;
  const cloth2 = opts.cloth2 !== undefined ? opts.cloth2 : 0xd9a441;
  const goods = opts.goods || [0xd9a441, 0x8e2f2f, 0x3a8a4a, 0xc9a24b];
  const w = opts.w || 74;
  const g = scene.add.graphics();
  // legs
  g.fillStyle(wood, 1);
  g.fillRect(-w / 2 + 4, -6, 5, 26);
  g.fillRect(w / 2 - 9, -6, 5, 26);
  g.fillRect(-w / 2 + 4, -46, 5, 30);
  g.fillRect(w / 2 - 9, -46, 5, 30);
  // table
  g.fillStyle(wood, 1);
  g.fillRoundedRect(-w / 2, -12, w, 8, 2);
  g.lineStyle(1.8, INK, 1);
  g.strokeRoundedRect(-w / 2, -12, w, 8, 2);
  // striped awning
  const stripes = 6, sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle(i % 2 === 0 ? cloth : cloth2, 1);
    g.fillTriangle(-w / 2 + i * sw, -46, -w / 2 + (i + 1) * sw, -46, -w / 2 + (i + 0.5) * sw, -54);
  }
  g.lineStyle(1.6, INK, 1);
  g.strokeRect(-w / 2 - 2, -50, w + 4, 6);
  // goods on the table
  goods.forEach((c, i) => {
    const gx = -w / 2 + 10 + i * ((w - 20) / Math.max(1, goods.length - 1));
    g.fillStyle(c, 1);
    g.fillCircle(gx, -17, 5.5);
    g.lineStyle(1.2, INK, 1);
    g.strokeCircle(gx, -17, 5.5);
  });
  return scene.add.container(x, y, [g]);
}

function makeRock(scene, x, y, opts) {
  opts = opts || {};
  const color = opts.color !== undefined ? opts.color : 0x8a7a68;
  const s = opts.scale || 1;
  const g = scene.add.graphics();
  const pts = [
    { x: -16 * s, y: 0 }, { x: -12 * s, y: -12 * s }, { x: -2 * s, y: -18 * s },
    { x: 10 * s, y: -13 * s }, { x: 16 * s, y: 0 }, { x: 6 * s, y: 3 * s }, { x: -6 * s, y: 3 * s }
  ];
  g.fillStyle(color, 1);
  g.fillPoints(pts, true);
  g.lineStyle(2, INK, 1);
  g.strokePoints(pts, true);
  g.fillStyle(0xffffff, 0.1);
  g.fillTriangle(-8 * s, -8 * s, 0, -16 * s, -2 * s, -6 * s);
  return scene.add.container(x, y, [g]);
}

function makeRug(scene, x, y, opts) {
  opts = opts || {};
  const base = opts.base !== undefined ? opts.base : 0x8e2f2f;
  const trim = opts.trim !== undefined ? opts.trim : 0xd9a441;
  const w = opts.w || 46, h = opts.h || 30;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(0, h * 0.42, w * 0.9, h * 0.3);
  g.fillStyle(base, 1);
  g.fillEllipse(0, 0, w, h);
  g.lineStyle(2, INK, 1);
  g.strokeEllipse(0, 0, w, h);
  g.lineStyle(1.6, trim, 1);
  g.strokeEllipse(0, 0, w * 0.72, h * 0.68);
  g.fillStyle(trim, 1);
  g.fillEllipse(0, 0, w * 0.18, h * 0.18);
  return scene.add.container(x, y, [g]);
}

// Cheap silhouette streetlamp / signpost flavor prop.
function makeStreetPost(scene, x, y, opts) {
  opts = opts || {};
  const color = opts.color !== undefined ? opts.color : 0x3a352c;
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(-2, -46, 4, 46);
  g.fillCircle(0, -48, 6);
  g.lineStyle(1.6, INK, 1);
  g.strokeCircle(0, -48, 6);
  g.fillStyle(0xffdf9a, 0.9);
  g.fillCircle(0, -48, 3.2);
  return scene.add.container(x, y, [g]);
}

// ---------- skyline / parallax layers ----------

function makeSkylineLayer(scene, color, baseY, minH, maxH, minW, maxW, density) {
  const W = scene.scale.width, H = scene.scale.height;
  const shapes = [];
  let x = 0;
  while (x < W) {
    const w = Phaser.Math.Between(minW, maxW);
    const h = Phaser.Math.Between(minH, maxH);
    const roll = Math.random();
    const kind = roll < 0.4 ? "dome" : (roll < 0.7 ? "minaret" : "wall");
    shapes.push({ x, w, h, kind });
    x += w + Phaser.Math.Between(20, 70) / density;
  }
  const g = scene.add.graphics();
  const drawSet = (offsetX) => {
    shapes.forEach(s => {
      const bx = offsetX + s.x;
      g.fillStyle(color, 1);
      if (s.kind === "dome") {
        g.fillRect(bx, H - baseY, s.w, baseY * 0.6);
        g.fillEllipse(bx + s.w / 2, H - baseY, s.w, s.w * 0.62);
        g.fillStyle(0xd9a441, 0.85);
        g.fillCircle(bx + s.w / 2, H - baseY - s.w * 0.42, 3);
      } else if (s.kind === "minaret") {
        g.fillTriangle(bx, H - baseY, bx + s.w, H - baseY, bx + s.w * 0.5, H - baseY - s.h - 14);
        g.fillStyle(0xd9a441, 0.8);
        g.fillRect(bx + s.w * 0.15, H - baseY - s.h * 0.5, s.w * 0.7, 3.4);
      } else {
        g.fillRect(bx + s.w * 0.1, H - baseY - s.h, s.w * 0.8, baseY + s.h);
        // simple crenellation top
        for (let m = 0; m < 3; m++) {
          g.fillRect(bx + s.w * 0.14 + m * s.w * 0.26, H - baseY - s.h - 7, s.w * 0.14, 7);
        }
      }
    });
  };
  drawSet(0);
  drawSet(W);
  return scene.add.container(0, 0, [g]);
}
