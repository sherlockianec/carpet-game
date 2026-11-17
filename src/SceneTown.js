// ============================================================
// SceneTown.js — every "walk around and find the right person"
// place: the kiln at the city's edge, the cemetery, the street
// of ovens, the saddler's row, and the four return visits.
//
// Each place is a wide street (two to three screens) that the
// camera follows, with a crowd that grows from town to town:
// people you can talk to, and townsfolk going about their day.
// The person you are looking for has look-alikes (other potters,
// other bakers, other mourners with lanterns); what people tell
// you is what narrows it down. After several wrong guesses a
// sparkle marks them. Dialogue and who-stands-where live in
// STORY.towns (data.js); the scenery lives in TOWN_LAYOUTS below.
// ============================================================

const HORIZON = 600, STREET_Y0 = 668, STREET_Y1 = 1012;

// Per-place lighting and atmosphere.
const TOWN_ENV = {
  village: { tint: 0xffffff, amb: "wind", particles: "petals" },
  city: { tint: 0xffffff, amb: null, particles: "dust" },
  cemetery: { tint: 0xa4acd0, amb: "night", particles: "fireflies" },
  bazaar: { tint: 0xe8c8cc, amb: "fire", particles: "embers" },
  saddler: { tint: 0xffffff, amb: "wind", particles: "leaves" }
};

// ---------- painting a wide place ----------
// sky (fixed to the screen) + a far strip (slow parallax) + a seamless
// ground tile. Buildings and props are separate sprites along the street.

function paintTownSky(ctx, env) {
  if (env === "village") {
    paintSky(ctx, W, H, [[0, 0x5aa0d8], [0.5, 0xbfe0ec], [0.62, 0xfbe8c4], [1, 0xfbe8c4]]);
    paintSun(ctx, 340, 170, 50, 0xfff0c0);
    paintCloud(ctx, 900, 200, 460, 130, 0xffffff, "vc1"); paintCloud(ctx, 1600, 140, 300, 90, 0xffffff, "vc2");
    paintRidge(ctx, W, 480, { seed: "vridge", amp: 220, color: 0x8aa0c0, color2: 0xb8c4cc, snow: 0xffffff, rough: 0.12 });
  } else if (env === "city") {
    paintSky(ctx, W, H, [[0, 0x4f8fc4], [0.5, 0xb9d6dc], [0.62, 0xf6d8a4], [1, 0xf6d8a4]]);
    paintSun(ctx, 1500, 150, 52, 0xffe3a0);
    paintCloud(ctx, 420, 210, 360, 110, 0xfff4e0, "c1"); paintCloud(ctx, 1150, 150, 260, 80, 0xfff4e0, "c2");
    paintRidge(ctx, W, 500, { seed: "cityridge", amp: 140, color: 0xb6a8b4, color2: 0xd4b8a0 });
  } else if (env === "cemetery") {
    paintSky(ctx, W, H, [[0, 0x141a34], [0.5, 0x3a4a72], [0.62, 0x8a8aa8], [1, 0x8a8aa8]]);
    paintStars(ctx, W, 420, 160, "cemstars", 0.8);
    paintMoon(ctx, 1520, 170, 62);
    paintCloud(ctx, 600, 260, 420, 90, 0x3a4468, "cc1", { lit: 0x7a84a8 }); paintCloud(ctx, 1300, 330, 300, 70, 0x3a4468, "cc2", { lit: 0x7a84a8 });
    paintRidge(ctx, W, 540, { seed: "cemridge", amp: 150, color: 0x2a3050, color2: 0x3a4060 });
  } else if (env === "bazaar") {
    paintSky(ctx, W, H, [[0, 0x1e1640], [0.45, 0x8a3e66], [0.62, 0xf0985a], [1, 0xf0985a]]);
    paintStars(ctx, W, 280, 70, "bzstars", 0.6);
    paintCloud(ctx, 500, 250, 400, 90, 0xb05a6a, "bc1", { lit: 0xffb07a }); paintCloud(ctx, 1450, 200, 300, 80, 0xb05a6a, "bc2", { lit: 0xffb07a });
  } else {
    paintSky(ctx, W, H, [[0, 0x3f86c0], [0.5, 0xa8d4e8], [0.62, 0xf2e6c2], [1, 0xf2e6c2]]);
    paintSun(ctx, 320, 130, 48, 0xfff0c0);
    paintCloud(ctx, 900, 180, 420, 120, 0xffffff, "sc1"); paintCloud(ctx, 1600, 260, 300, 90, 0xffffff, "sc2");
    paintRidge(ctx, W, 500, { seed: "sdridge", amp: 170, color: 0x9ab0c4, color2: 0xc0c8c4, snow: 0xffffff });
  }
}

// The far strip: a skyline or a cemetery wall, 1920 wide, tiling.
function paintTownFar(ctx, env, w, h) {
  const base = h - 20;
  if (env === "village") {
    paintRidge(ctx, w, base, { seed: "vhill", amp: 110, color: 0x8aa064, color2: 0xa0b070 });
    const r = rng("vfar");
    for (let x = 80; x < w; x += r.range(140, 260)) paintTree(ctx, x, base - r.range(10, 40), r.chance(0.5) ? "poplar" : "round", r.range(0.4, 0.6), "vft" + Math.round(x), { leaf: 0x6a8a4a });
  } else if (env === "city") {
    paintSkyline(ctx, w, base - 70, { seed: "cityfar", color: 0xc4a488, color2: 0xd2b090, minH: 50, maxH: 170, finial: 0xd9a441 });
    paintCityWall(ctx, 0, w, base, 120, { color: 0xdcbc8a, towerStep: 480, towerOff: 240 });
  } else if (env === "cemetery") {
    paintRidge(ctx, w, base - 20, { seed: "cemridge2", amp: 70, color: 0x323a52, color2: 0x404a5e });
    for (let x = 160; x < w; x += 640) { paintTree(ctx, x, base - 30, "cypress", 0.9, "cfc" + x, { leaf: 0x2e3e3a }); paintTree(ctx, x + 70, base - 26, "cypress", 0.7, "cfd" + x, { leaf: 0x2e3e3a }); }
    paintCityWall(ctx, 0, w, base, 90, { color: 0x7a7468, towerStep: 640, towerOff: 420 });
  } else if (env === "bazaar") {
    paintSkyline(ctx, w, base - 60, { seed: "bzfar", color: 0x4a2a52, color2: 0x5a3458, minH: 60, maxH: 200, lights: 0.9, finial: 0xd9a441 });
    paintSkyline(ctx, w, base, { seed: "bznear", color: 0x3a2040, color2: 0x4a2a48, minH: 40, maxH: 140, lights: 1, scale: 1.2 });
  } else {
    paintSkyline(ctx, w, base - 40, { seed: "sdfar", color: 0xb8a088, color2: 0xc8b090, minH: 40, maxH: 150, finial: 0xd9a441 });
    paintCityWall(ctx, 0, w, base, 90, { color: 0xd0b48a, towerStep: 560, towerOff: 300 });
  }
}

// The street: painted three times side by side so the tile has no seam.
function paintTownGround(ctx, env, w, h) {
  const col = { village: 0xc8a46e, city: 0xcfa070, cemetery: 0x5e604a, bazaar: 0x7a5a54, saddler: 0xc49a68 }[env];
  const pathC = { village: 0xe0c48e, city: 0xe8c896, cemetery: 0x7a7660, bazaar: 0x9a7a6e, saddler: 0xdcb886 }[env];
  [-w, 0, w].forEach(off => {
    ctx.save(); ctx.translate(off, 0);
    paintEarth(ctx, 0, 0, w, h, col, "tg" + env, { pebbles: env === "cemetery" ? 220 : 160 });
    const pts = []; for (let x = -100; x <= w + 100; x += 80) pts.push([x, 270 + Math.sin(x / w * Math.PI * 2) * 34]);
    if (env === "bazaar") paintCobbles(ctx, 0, 40, w, h - 40, 0x9a7a6e, "bzcob", 0.45);
    else paintPath(ctx, pts, env === "cemetery" ? 110 : 160, pathC, 0.5);
    const r = rng("tgr" + env);
    const grass = { village: [0x7a9a4a, 0x8aaa52, 0x6a8a3a], city: [0x9aa04a, 0x8a9040], cemetery: [0x4a5a34, 0x5a6a3a, 0x3e4c2e], bazaar: [0x6a5a3a], saddler: [0x8a9a4a, 0x7a8a3a] }[env];
    for (let i = 0; i < (env === "cemetery" || env === "village" ? 120 : 50); i++) paintGrass(ctx, r.range(0, w), r.range(20, h - 10), r.range(0.8, 1.5), r.pick(grass), "tgg" + env + i);
    ctx.restore();
  });
  ctx.fillStyle = gradV(ctx, 0, 60, [[0, 0x000000, 0.22], [1, 0x000000, 0]]); ctx.fillRect(0, 0, w, 60);
}

// ---------- scenery ----------
// back: buildings standing at the horizon. props: things in the street.
// Prop entries: [kind, x, y, options]

const TOWN_LAYOUTS = {
  oven: {
    width: 3800, enter: "left",
    back: [
      ["house", 260, { color: 0xe0c08c, windows: [[-0.25, 0.6], [0.25, 0.6]], doorX: 0, awning: { x: 0.24, w: 150, color: 0x1f6f6f } }],
      ["house", 820, { color: 0xd8b07a, windows: [[-0.28, 0.58]], doorX: 0.18, rug: { x: -0.3, color: 0x1c4e80 } }, 280, 180],
      ["portal", 1450], ["house", 2050, { color: 0xe0c08c, windows: [[0.25, 0.6]], doorX: -0.2, awning: { x: -0.2, w: 140, color: 0xb2283a } }],
      ["house", 2620, { color: 0xd8b07a, windows: [[-0.28, 0.6], [0.28, 0.6]], doorX: 0 }, 320, 210], ["house", 3200, { color: 0xe0c08c, windows: [[-0.2, 0.6]], doorX: 0.22, rug: { x: 0.3, color: 0x8e2f2f } }], ["house", 3640, { color: 0xd8b07a, windows: [[0.2, 0.6]], doorX: -0.2 }, 260, 170]
    ],
    props: [
      ["tree", 140, 700, "poplar"], ["sacks", 330, 880], ["well", 690, 830], ["pots", 860, 1000, { n: 4 }],
      ["kiln", 1150, 742], ["wood", 1330, 985], ["khum", 950, 760], ["cart", 1560, 668, "sacks"], ["supa", 1720, 930],
      ["kiln", 1980, 735], ["khum", 2140, 790], ["tree", 2280, 690, "poplar"], ["sacks", 2400, 1000],
      ["kiln", 2720, 748, { cold: true }], ["cart", 3060, 1000, "bricks"], ["pots", 3240, 990, { n: 3 }],
      ["kiln", 3420, 740], ["wood", 3600, 985], ["tree", 3720, 700, "poplar"]
    ]
  },
  graveyard: {
    width: 4400, enter: "right",
    back: [
      ["westgate", 330], ["mausoleum", 1000], ["tree-dead", 1500], ["mausoleum", 2100, 0.8], ["tree-cypress", 2560], ["mausoleum", 3150], ["tree-dead", 3700], ["tree-cypress", 4150]
    ],
    props: [
      ["tree", 520, 760, "mulberry"], ["bush", 1250, 1040], ["bush", 160, 1020], ["rock", 1820, 980], ["bush", 2860, 1045], ["rock", 3540, 1000], ["bush", 4080, 1040],
      ["graves", 0, 0]          // decorative graves are scattered by the scene
    ]
  },
  bakery: {
    width: 4800, enter: "left",
    back: [
      ["house", 240, { color: 0xb8886a, windows: [[-0.28, 0.66], [0.28, 0.66]], doorX: 0, awning: { x: 0, w: 300, color: 0xb2283a, color2: 0xf2d9a0 } }, 360, 230],
      ["house", 1150, { color: 0xa87a62, windows: [[0, 0.68]], doorX: -0.22, awning: { x: 0.15, w: 180, color: 0x1f6f6f, color2: 0xf2d9a0 } }],
      ["house", 2000, { color: 0xb8886a, windows: [[-0.3, 0.64], [0.3, 0.64]], doorX: 0, awning: { x: 0, w: 260, color: 0xd9a441, color2: 0x8e2f2f } }, 340, 240],
      ["house", 2850, { color: 0xa87a62, windows: [[0.25, 0.64]], doorX: -0.2, rug: { x: 0.3, color: 0x8e2f2f } }],
      ["house", 3330, { color: 0x8a9ab8, windows: [[-0.25, 0.64]], doorX: 0.12, doorColor: 0x2a5aa8 }, 330, 220],
      ["house", 3950, { color: 0xb8886a, windows: [[-0.28, 0.66], [0.28, 0.66]], doorX: 0, awning: { x: 0, w: 280, color: 0xb2283a, color2: 0xf2d9a0 } }, 360, 230],
      ["house", 4560, { color: 0xa87a62, windows: [[0, 0.66]], doorX: 0.2 }]
    ],
    props: [
      ["bakery", 720, 800], ["stall", 1100, 700, { goods: "spices", cloth: 0x1f6f6f }], ["lamp", 300, 900],
      ["bakery", 1560, 790], ["stall", 1940, 1010, { goods: "fruit", cloth: 0xd9a441, cloth2: 0x8e2f2f }], ["lamp", 1240, 960],
      ["bakery", 2420, 800], ["stall", 2780, 700, { goods: "pots", cloth: 0x2a6aa0 }], ["lamp", 2150, 760],
      ["bakery", 3300, 790, { unsold: true }], ["pots", 3060, 1000, { n: 3 }], ["lamp", 3620, 900],
      ["bakery", 4130, 800], ["stall", 4520, 1010, { goods: "melons", cloth: 0x8e2f2f }], ["lamp", 4400, 760], ["sacks", 2600, 1000], ["wood", 1850, 760]
    ]
  },
  saddler: {
    width: 5200, enter: "left",
    back: [
      ["house", 260, { color: 0xd8b888, windows: [[-0.3, 0.62]], doorX: 0.15, awning: { x: 0.12, w: 220, color: 0x6b4a2e, color2: 0xe8d4a8 } }, 340, 220],
      ["house", 1050, { color: 0xceac7c, windows: [[0.25, 0.6]], doorX: -0.2, rug: { x: 0.28, color: 0x1f6f6f } }],
      ["portal", 1880], ["house", 2650, { color: 0xceac7c, windows: [[-0.25, 0.6], [0.25, 0.6]], doorX: 0, awning: { x: 0, w: 260, color: 0x8e2f2f, color2: 0xe8d4a8 } }, 320, 210],
      ["house", 3420, { color: 0xd8b888, windows: [[-0.3, 0.62]], doorX: 0.15, awning: { x: 0.12, w: 220, color: 0x2a6a8a, color2: 0xe8d4a8 } }, 340, 220],
      ["house", 4200, { color: 0xceac7c, windows: [[0.2, 0.6]], doorX: -0.2 }], ["house", 4880, { color: 0xd8b888, windows: [[-0.25, 0.6]], doorX: 0.2, rug: { x: -0.3, color: 0x8e2f2f } }]
    ],
    props: [
      ["hay", 200, 700], ["shop", 800, 760, { cloth: 0x6b4a2e }], ["horse", 1210, 742, { color: 0x9a6234, blaze: true, saddle: true }], ["trough", 1360, 790],
      ["shop", 1520, 760, { cloth: 0x8e2f2f }], ["wood", 1760, 700], ["cart", 2000, 1000, "hay"],
      ["shop", 2320, 760, { cloth: 0x2a6a8a, broken: true }], ["horse", 2800, 740, { color: 0x3a2a24, mane: 0x14100c, saddle: false, socks: true }],
      ["shop", 3120, 760, { cloth: 0x1f6f6f }], ["hay", 3360, 1000], ["shop", 3900, 760, { cloth: 0xb2283a }],
      ["horse", 4300, 742, { color: 0xd8c8a8, mane: 0xf2ead8, saddle: true }], ["trough", 4460, 790], ["shop", 4640, 760, { cloth: 0x6b4a2e }],
      ["tree", 40, 1050, "round", { front: true }]
    ]
  },
  village: {
    width: 3400, enter: "left",
    back: [
      ["house", 240, { color: 0xe0c090, windows: [[-0.26, 0.6]], doorX: 0.18, awning: { x: 0.18, w: 150, color: 0x1f6f6f, color2: 0xf2e6c8 } }, 320, 200],
      ["house", 760, { color: 0xd8b482, windows: [[0.24, 0.6]], doorX: -0.2, rug: { x: 0.3, color: 0x8e2f2f } }, 260, 170],
      ["house", 1320, { color: 0xe0c090, windows: [[-0.28, 0.6], [0.28, 0.6]], doorX: 0 }, 300, 190],
      ["house", 1880, { color: 0xd8b482, windows: [[0.2, 0.6]], doorX: -0.22, awning: { x: -0.2, w: 130, color: 0xb2283a, color2: 0xf2e6c8 } }, 280, 180],
      ["house", 2500, { color: 0xe0c090, windows: [[-0.26, 0.6]], doorX: 0.2 }, 300, 190], ["house", 3100, { color: 0xd8b482, windows: [[0.24, 0.6]], doorX: -0.2, rug: { x: -0.3, color: 0x1f6f6f } }, 280, 180]
    ],
    props: [
      ["hay", 330, 700], ["well", 620, 720], ["pots", 860, 990, { n: 3 }],
      ["tree", 1100, 700, "apricot"], ["supa", 1450, 930], ["sacks", 1700, 720], ["cart", 2010, 1000, "hay"],
      ["tree", 2380, 760, "apricot", { big: true }], ["wood", 2700, 700], ["tree", 2900, 1010, "poplar"], ["pots", 3180, 760, { n: 2, big: true }], ["tree", 3330, 700, "poplar"]
    ]
  }
};

// Put one piece of scenery into the scene. Returns lights to add.
function placeTownProp(scene, p, tint, lights) {
  const [kind, x, y] = p, o = p[3] || {};
  const T = { tint };
  const P = (w, h, fn, extra) => addProp(scene, x, y, w, h, fn, Object.assign({}, T, extra || {}));
  const col = (rx, ry) => { scene.colliders.push({ x, y, rx, ry }); };
  if (kind === "tree") {
    const t = p[3], big = (p[4] && p[4].big) || (o && o.big), front = p[4] && p[4].front;
    const s = t === "poplar" ? 1.15 : (big ? 1.25 : 1.05);
    P(t === "poplar" ? 280 : 560, 560, c => paintTree(c, 0, 0, t === "mulberry" ? "round" : t, s, "tt" + x), { depthOff: front ? 60 : 0 });
    col(t === "poplar" ? 26 : 34, 14);
  } else if (kind === "well") { P(320, 340, c => paintWell(c, 0, 0), { pad: 40 }); col(100, 28); }
  else if (kind === "pots") { P(320, 200, c => paintPots(c, 0, 0, "tp" + x, o), { pad: 20 }); col(30 + (o.n || 3) * 24, 20); }
  else if (kind === "khum") { P(200, 170, c => paintPots(c, 0, 0, "tk" + x, { n: 2, big: true }), { pad: 20 }); col(70, 20); }
  else if (kind === "sacks") { P(260, 170, c => paintSacks(c, 0, 0, "ts" + x)); col(90, 22); }
  else if (kind === "hay") { P(280, 220, c => paintHay(c, 0, 0)); col(100, 24); }
  else if (kind === "wood") { P(280, 150, c => paintFirewood(c, 0, 0)); col(90, 18); }
  else if (kind === "cart") { P(440, 310, c => paintCart(c, 0, 0, { load: p[3] })); col(135, 26); }
  else if (kind === "supa") { P(300, 150, c => paintSupa(c, 0, 0, o), { depthOff: -30 }); col(110, 24); }
  else if (kind === "rock") { P(200, 120, c => paintRock(c, 0, 0, 1.3, 0x7a7a70, "tr" + x)); col(50, 16); }
  else if (kind === "bush") { P(260, 200, c => paintTree(c, 0, 0, "bush", 1.1, "tb" + x, { leaf: 0x3e5034 }), { depthOff: 40 }); }
  else if (kind === "lamp") {
    P(130, 270, c => paintLampPost(c, 0, 0)); col(14, 8);
    lights.push({ x: x + 34, y: y - 148, r: 280, c: 0xffc060, a: 0.55, flicker: true });
  } else if (kind === "stall") { P(340, 320, c => paintStall(c, 0, 0, Object.assign({ w: 230 }, o))); col(125, 24); }
  else if (kind === "kiln") {
    P(540, 420, c => paintKiln(c, 0, 0, o)); col(205, 40);
    if (!o.cold) {
      lights.push({ x, y: y - 60, r: 300, c: 0xff8a30, a: 0.4, flicker: true });
      const smoke = scene.add.particles(x, y - 336, "fx-puff", { x: { min: -14, max: 14 }, speedY: { min: -70, max: -40 }, speedX: { min: 6, max: 26 }, scale: { start: 0.45, end: 2.2 }, alpha: { start: 0.4, end: 0 }, lifespan: 4200, frequency: 260, tint: [0x7a6a6a, 0x9a8a88] }).setDepth(y - 1);
      smoke.fastForward(4000);
    }
  } else if (kind === "bakery") {
    // a tandir, a bread table, and (for the one who never sells) bread piled high
    addProp(scene, x - 120, y, 300, 280, c => paintTandir(c, 0, 0, 1.05), T); scene.colliders.push({ x: x - 120, y, rx: 110, ry: 26 });
    addProp(scene, x + 150, y + 10, 340, 320, c => paintStall(c, 0, 0, { goods: "bread", cloth: o.unsold ? 0x2a5aa8 : 0xb2283a, cloth2: 0xf2d9a0, w: 230, heaped: o.unsold }), T);
    scene.colliders.push({ x: x + 150, y: y + 10, rx: 125, ry: 24 });
    if (o.unsold) addProp(scene, x + 330, y + 30, 200, 150, c => { for (let j = 0; j < 4; j++) for (let i = 0; i < 4 - j; i++) paintLoaf(c, -42 + i * 28 + j * 14, -14 - j * 15, 18, 0.6); }, T);
    lights.push({ x: x - 120, y: y - 80, r: 330, c: 0xff8a30, a: 0.5, flicker: true });
  } else if (kind === "shop") {
    addProp(scene, x, y, 360, 330, c => paintStall(c, 0, 0, { goods: "leather", cloth: o.cloth, cloth2: 0xe8d4a8, w: 250 }), T); scene.colliders.push({ x, y, rx: 130, ry: 24 });
    addProp(scene, x + 230, y + 40, 280, 220, c => paintSaddleRack(c, 0, 0), T); scene.colliders.push({ x: x + 230, y: y + 40, rx: 100, ry: 18 });
    if (o.broken) addProp(scene, x + 80, y + 150, 280, 100, c => paintBrokenSaddle(c, 0, 0), Object.assign({}, T, { depthOff: -60 }));
  } else if (kind === "horse") { P(460, 380, c => paintHorse(c, 0, 0, 1.0, o), { pad: 30 }); col(160, 26); }
  else if (kind === "trough") {
    P(240, 120, (c) => {
      softEllipse(c, 4, 2, 100, 12, 0x000000, 0.3);
      pRR(c, -90, -44, 180, 44, 6); c.fillStyle = gradV(c, -44, 0, [[0, 0x9a6a3a], [1, 0x4a2c14]]); c.fill(); strokeC(c, 0x2a160a, 2); c.stroke();
      pEll(c, 0, -44, 86, 10); c.fillStyle = gradV(c, -54, -34, [[0, 0x2a4a68], [1, 0x6a9ac0]]); c.fill(); strokeC(c, 0x2a160a, 2); c.stroke();
    }); col(95, 18);
  }
}

function placeBackBuilding(scene, b, tint) {
  const [kind, x] = b, T = { tint, depthOff: -40 };
  if (kind === "house") {
    const w = b[3] || 300, h = b[4] || 200, o = b[2];
    addProp(scene, x, HORIZON + 16, w + 80, h + 60, c => { const r = paintHouse(c, 0, 0, w, h, o); if (o.doorColor !== undefined && r.door) { pArch(c, r.door.x, 0, 56, Math.min(112, h * 0.6), 0.62); fillC(c, o.doorColor); c.fill(); strokeC(c, 0x0e1a3a, 2); c.stroke(); } }, Object.assign({ pad: 10 }, T));
  } else if (kind === "portal") {
    addProp(scene, x, HORIZON + 18, 400, 360, (c) => { paintPortal(c, 0, 0, 300, 260, { color: 0xd8b888 }); }, Object.assign({ pad: 10 }, T));
  } else if (kind === "westgate") {
    addProp(scene, x, HORIZON + 20, 460, 520, (c) => { paintPortal(c, 0, 0, 320, 300, { color: 0x8a8070 }); paintDome(c, 0, -300, 70, { color: 0x4a7a8a, drum: 0x8a8070 }); }, Object.assign({ pad: 10 }, T));
  } else if (kind === "mausoleum") {
    const s = b[2] || 1;
    addProp(scene, x, HORIZON + 24, 380 * s, 420 * s, (c) => { paintPortal(c, 0, 0, 200 * s, 170 * s, { color: 0x8a8070 }); paintDome(c, 0, -170 * s, 64 * s, { color: 0x4a7a8a, drum: 0x8a8070 }); }, Object.assign({ pad: 10 }, T));
  } else if (kind === "tree-dead") {
    addProp(scene, x, HORIZON + 30, 400, 420, c => paintTree(c, 0, 0, "dead", 1.5, "td" + x, { trunk: 0x3a3438 }), Object.assign({ pad: 10 }, T));
  } else if (kind === "tree-cypress") {
    addProp(scene, x, HORIZON + 26, 160, 420, c => paintTree(c, 0, 0, "cypress", 1.0, "tc" + x, { leaf: 0x3a5040 }), Object.assign({ pad: 10 }, T));
  }
}

// Sky, far strip, ground, buildings and props for a wide place.
function buildWidePlace(scene, env, layout) {
  const tint = TOWN_ENV[env].tint, lights = [];
  addBackdrop(scene, "town_sky_" + env, ctx => paintTownSky(ctx, env), -30).setScrollFactor(0);
  Tex.make(scene, "town_far_" + env, W, 360, ctx => paintTownFar(ctx, env, W, 360));
  scene.add.tileSprite(0, HORIZON - 330, layout.width, 360, "town_far_" + env).setOrigin(0).setScrollFactor(0.45, 1).setDepth(-20);
  Tex.make(scene, "town_gnd_" + env, W, H - HORIZON + 20, ctx => paintTownGround(ctx, env, W, H - HORIZON + 20));
  scene.add.tileSprite(0, HORIZON - 4, layout.width, H - HORIZON + 20, "town_gnd_" + env).setOrigin(0).setDepth(-15);
  scene.colliders = scene.colliders || [];
  layout.back.forEach(b => placeBackBuilding(scene, b, tint));
  layout.props.forEach(p => placeTownProp(scene, p, tint, lights));
  lights.forEach(l => {
    const g = addGlow(scene, l.x, l.y, l.r * 2, l.c, l.a).setDepth(6000);
    if (l.flicker) scene.tweens.add({ targets: g, alpha: l.a * 0.7, duration: 140 + Math.random() * 120, yoyo: true, repeat: -1 });
  });
  return lights;
}

// ---------- crowds ----------
// Townsfolk going about their day: walking from place to place, stopping
// to chat, queueing. Not someone to talk to - the people who matter stand
// still and turn to face you when you come near.

function crowdLook(r, env) {
  const female = r.chance(0.42), child = !female && r.chance(0.14), elder = !child && r.chance(0.22);
  const robe = r.pick([0x7a5a3a, 0x5a7a5a, 0x8a6a9a, 0x6a5a3a, 0x4a6a5a, 0x9a4a3a, 0x6a8a7a, 0x5a7a8a, 0x8a5a3a, 0x4a5a7a, 0x7a3a4a, 0x3a5a6a, 0x9a7a4a]);
  const c = { robe, trim: r.pick([0xd9a441, 0xb5553a, 0x2fb8ac, 0xf2e6cc, 0x1c4e80]) };
  if (female) Object.assign(c, { body: "dress", female: true, head: r.pick(["scarf", "scarf", "scarf", "braids"]), headColor: r.pick([0xd9a441, 0xb2283a, 0x2fb8ac, 0xf6ecd8, 0x6a8a3a, 0x8a4a7a]), vest: r.chance(0.5) ? darken(robe, 0.4) : null, pattern: r.chance(0.35) ? "ikat" : "plain" });
  else Object.assign(c, { head: r.pick(["doppi", "doppi", "turban", "cap", "wrap", "kalpak"]), headColor: r.pick([0xf2ecdc, 0xe8dcc4, 0xd9cdb4]), beard: elder ? r.pick(["full", "long"]) : r.pick([null, null, "mustache", "goatee", "full"]), pattern: r.chance(0.3) ? "stripes" : "plain" });
  if (child) { c.child = true; c.beard = null; }
  if (elder) c.elder = true;
  c.holding = env === "cemetery" ? r.pick(["lantern", "none", "lantern"]) : r.pick(["none", "none", "none", "basket", "jug"]);
  return c;
}

function makeCrowd(scene, opts) {
  const r = rng(opts.seed || "crowd"), env = opts.env, tint = TOWN_ENV[env].tint;
  const looks = []; for (let i = 0; i < Math.min(opts.n, 14); i++) looks.push(crowdLook(r, env));
  scene.crowd = scene.crowd || [];
  const spawn = (x, y, mode, face) => {
    const look = looks[scene.crowd.length % looks.length];
    const p = makePerson(scene, x, y, Object.assign({ facing: face || r.sign() }, look));
    if (tint !== 0xffffff) p.tint(mixC(tint, 0xffffff, 0.35));
    const a = { p, mode, speed: r.range(60, 105) * (look.elder ? 0.7 : 1) * (look.child ? 1.2 : 1), wait: r.range(0, 3000), tx: x, ty: y, talkT: r.range(1000, 4000) };
    scene.crowd.push(a);
    return a;
  };
  for (let i = 0; i < opts.n; i++) {
    const x = r.range(250, opts.width - 250), y = r.range(STREET_Y0 + 20, STREET_Y1 - 10);
    if (scene.colliders.some(c => Math.hypot((x - c.x) / c.rx, (y - c.y) / c.ry) < 1.3)) { i--; continue; }
    if (r.chance(0.25)) {                               // two neighbours chatting
      const a = spawn(x, y, "chat", 1), b = spawn(x + 90, y + r.range(-10, 10), "chat", -1);
      a.mate = b; b.mate = a; i++;
    } else spawn(x, y, "walk");
  }
  (opts.queues || []).forEach(q => { for (let k = 0; k < q[2]; k++) spawn(q[0] + k * 62, q[1] + (k % 2) * 10, "queue", -1); });
  scene.crowdW = opts.width;
}

function updateCrowd(scene, d) {
  if (!scene.crowd) return;
  const dt = d / 1000, frozen = scene.dbox && scene.dbox.visible;
  scene.crowd.forEach(a => {
    const p = a.p;
    p.setPerspective(lerp(0.84, 1.12, clamp((p.y - STREET_Y0) / (STREET_Y1 - STREET_Y0), 0, 1))).setDepth(p.y);
    if (frozen) { p.moving = false; return; }
    if (a.mode === "chat") {
      a.talkT -= d;
      if (a.talkT <= 0) { a.talkT = 1500 + Math.random() * 3000; p.talking = !p.talking && !(a.mate && a.mate.p.talking); }
      p.face(a.mate ? a.mate.p.x : p.x);
      return;
    }
    if (a.mode === "queue") return;
    if (a.wait > 0) { a.wait -= d; p.moving = false; return; }
    const dx = a.tx - p.x, dy = a.ty - p.y, L = Math.hypot(dx, dy);
    if (L < 8) {
      a.wait = 1200 + Math.random() * 4200;
      a.tx = clamp(p.x + (Math.random() - 0.5) * 1400, 180, scene.crowdW - 180);
      a.ty = STREET_Y0 + 20 + Math.random() * (STREET_Y1 - STREET_Y0 - 30);
      if (scene.colliders.some(c => Math.hypot((a.tx - c.x) / c.rx, (a.ty - c.y) / c.ry) < 1.2)) { a.tx = p.x; a.ty = p.y; }
      return;
    }
    const v = a.speed * dt * (p.pk || 1);
    let nx = p.x + dx / L * v, ny = p.y + dy / L * v * 0.8;
    scene.colliders.forEach(c => {
      const ex = (nx - c.x) / c.rx, ey = (ny - c.y) / c.ry, e = Math.hypot(ex, ey);
      if (e < 1 && e > 0.0001) { nx = c.x + ex / e * c.rx; ny = c.y + ey / e * c.ry; }
    });
    if (Math.hypot(nx - p.x, ny - p.y) < v * 0.2) { a.stuck = (a.stuck || 0) + d; if (a.stuck > 600) { a.tx = p.x; a.ty = p.y; a.stuck = 0; } } else a.stuck = 0;
    p.x = nx; p.y = ny; p.moving = true;
    if (Math.abs(dx) > 4) p.setFacing(dx < 0 ? -1 : 1);
  });
}

// Scatter graves through the cemetery, keeping clear of the people in it.
function scatterGraves(scene, width, avoid, tint) {
  const r = rng("graves"), kinds = ["slab", "box", "mound", "pole", "slab", "box"];
  for (let x = 220; x < width - 160; x += r.range(120, 210)) {
    const y = r.range(STREET_Y0 + 30, STREET_Y1 - 20);
    if (avoid.some(a => Math.abs(a.x - x) < 120 && Math.abs(a.y - y) < 90)) continue;
    if (Math.abs(y - (870 + Math.sin(x / W * Math.PI * 2) * 34)) < 50) continue;      // keep the path clear
    addProp(scene, x, y, 200, 260, c => paintGrave(c, 0, 0, r.pick(kinds), "dg" + Math.round(x)), { tint, key: undefined });
    scene.colliders.push({ x, y, rx: 62, ry: 16 });
  }
}

class TownScene extends BaseScene {
  constructor() { super("TownScene"); }

  init(data) {
    this.locKey = data.key;
    this.cfg = STORY.towns[this.locKey];
    this.sub = data.sub || 0;
  }

  create() {
    const cfg = this.cfg;
    if (this.sub >= 1 && cfg.minigame) { this.scene.start(cfg.minigame); return; }
    const env = TOWN_ENV[cfg.env], layout = TOWN_LAYOUTS[cfg.base || this.locKey];
    this.begin({ music: cfg.music, amb: env.amb });
    this.busy = false;
    this.misses = 0;
    this.colliders = [];
    const cam = this.cameras.main;
    cam.setBounds(0, 0, layout.width, H);

    buildWidePlace(this, cfg.env, layout);
    if (cfg.env === "cemetery") scatterGraves(this, layout.width, cfg.spots, env.tint);
    if (env.particles) ambientParticles(this, env.particles, { area: env.particles === "embers" ? { x: 300, y: 600, w: 1300, h: 400 } : { x: 0, y: 200, w: W, h: 800 } }).setScrollFactor(0);
    if (cfg.env === "cemetery") this.fog(layout.width);
    addVignette(this, cfg.env === "cemetery" ? 0.95 : 0.6);

    this.dbox = new DialogueBox(this);
    const fromRight = layout.enter === "right";
    this.hero = makePerson(this, fromRight ? layout.width + 60 : -60, 880, HERO);
    if (env.tint !== 0xffffff) this.hero.tint(mixC(env.tint, 0xffffff, 0.35));
    this.walker = new Walker(this, this.hero, { bounds: { x0: 70, y0: STREET_Y0, x1: layout.width - 70, y1: STREET_Y1 } });
    this.walker.locked = true;
    this.dbox.actors["You"] = this.hero;
    cam.startFollow(this.hero, true, 0.08, 0.08, 0, 140);

    this.spawnSpots(env);
    makeCrowd(this, { n: cfg.crowd || 0, seed: "crowd" + (cfg.base || this.locKey), env: cfg.env, width: layout.width, queues: cfg.queues });
    UI.clues(this);
    UI.banner(this, cfg.title, cfg.sub, { y: 180 });
    UI.objective(this, cfg.objective);
    UI.hint(this, this.touchMode ? "Tap the ground to walk · tap someone to talk" : "WASD / arrows or click to walk · E to talk");
    this.time.delayedCall(6000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });

    this.tweens.add({
      targets: this.hero, x: fromRight ? layout.width - 220 : 220, duration: 1100, ease: "Sine.easeOut",
      onStart: () => { this.hero.moving = true; this.hero.setFacing(fromRight ? -1 : 1); },
      onComplete: () => { this.hero.moving = false; this.walker.locked = false; }
    });
  }

  fog(width) {
    for (let x = 0; x < width; x += 520) {
      const f = this.add.image(x + Math.random() * 300, 660 + Math.random() * 360, "fx-puff").setDisplaySize(900, 200)
        .setAlpha(0.13).setTint(0xb8c4e8).setDepth(5500);
      this.tweens.add({ targets: f, x: f.x + 400, duration: 26000 + Math.random() * 10000, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
  }

  spawnSpots(env) {
    const cfg = this.cfg, revisit = !!cfg.base;
    this.spots = [];
    cfg.spots.forEach((s, idx) => {
      let obj, it;
      if (s.grave) {
        obj = addProp(this, s.x, s.y, 200, 260, c => paintGrave(c, 0, 0, s.grave, "gr" + idx), { tint: env.tint });
        this.colliders.push({ x: s.x, y: s.y, rx: 66, ry: 18 });
        it = { x: s.x, y: s.y, r: 150, label: "Look", head: 190, obj, stand: 110 };
      } else {
        const look = s.target ? STORY.cast[s.name] : s.cfg;
        obj = makePerson(this, s.x, s.y, Object.assign({ facing: s.face || (s.x > this.hero.x ? -1 : 1) }, look));
        obj.setPerspective(lerp(0.84, 1.12, clamp((s.y - STREET_Y0) / (STREET_Y1 - STREET_Y0), 0, 1))).setDepth(s.y);
        if (env.tint !== 0xffffff) obj.tint(mixC(env.tint, 0xffffff, 0.35));
        this.dbox.actors[s.name] = obj;
        it = { x: s.x, y: s.y, r: 150, label: "Talk", obj };
        if (s.target && s.name === "Oven-Keeper") {
          const wife = makePerson(this, s.x + 100, s.y - 26, { body: "dress", robe: 0x8a7a64, female: true, head: "scarf", headColor: 0xcfc2a8, elder: true, mood: "sad", facing: -1 });
          wife.setPerspective(obj.pk).setDepth(s.y - 26);
        }
        if (s.target && s.name === "Gravekeeper") {
          const g = addGlow(this, s.x + 28, s.y - 100, 260, 0xffc060, 0.5).setDepth(6000);
          this.tweens.add({ targets: g, alpha: 0.35, duration: 180, yoyo: true, repeat: -1 });
          // the weeping carries: louder the closer you are
          this.time.addEvent({ delay: 3600, loop: true, callback: () => {
            if (this.dbox.visible) return;
            const dd = Math.abs(this.hero.x - s.x);
            Snd.play("sob", { vol: clamp(1.6 - dd / 1500, 0.15, 1.6) });
          } });
        }
        if (s.glow) { const g = addGlow(this, s.x + 28, s.y - 100, 220, 0xffc060, 0.4).setDepth(6000); this.tweens.add({ targets: g, alpha: 0.28, duration: 200, yoyo: true, repeat: -1 }); }
      }
      it.act = () => this.talk(s, obj);
      this.walker.add(it);
      this.spots.push({ s, obj, it });
      if (revisit && s.target) this.targetMark = guideSparkle(this, s.x, s.y - 230);
    });
  }

  talk(s, obj) {
    if (!s.grave) this.dbox.actors[s.name] = obj;          // several people share a trade name
    if (s.target) { this.doTarget(); return; }
    const line = s.miss[(s._n = ((s._n === undefined ? -1 : s._n) + 1)) % s.miss.length];
    this.misses++;
    const who = s.grave ? null : s.cfg;
    this.dbox.show([{ speaker: s.grave ? "" : s.name, text: line, who }], () => {
      if (this.misses >= (this.cfg.guideAfter || 6) && !this.targetMark) {
        const t = this.spots.find(p => p.s.target);
        if (t) { this.targetMark = guideSparkle(this, t.s.x, t.s.y - 230); Snd.play("chime"); UI.toast(this, "Someone nearby seems to be the one", { y: 250 }); }
      }
    });
    void obj;
  }

  doTarget() {
    const cfg = this.cfg;
    if (this.targetMark) { this.targetMark.destroy(); this.targetMark = null; }
    this.busy = true;
    this.dbox.show(cfg.dialogue, () => {
      const go = () => {
        if (cfg.minigame) {
          GameFlow.setSub(1);
          this.leave(() => this.scene.start(cfg.minigame));
        } else this.advance();
      };
      if (cfg.grantClue) {
        GameState.clues[cfg.grantClue] = true;
        UI.itemGet(this, cfg.grantClue, go);
      } else if (cfg.base === "oven") {
        Snd.play("success");
        this.time.delayedCall(600, go);
      } else go();
    });
  }

  tick(time, d) {
    if (this.walker) this.walker.update(time, d);
    updateCrowd(this, d);
  }
}
