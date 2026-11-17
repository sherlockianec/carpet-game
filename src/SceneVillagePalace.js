// ============================================================
// SceneVillagePalace.js — Chapter 1, in three parts (sub):
//   0  The village: find the old traveller, receive the carpet.
//   1  The road to the palace at night: slip past the lantern
//      patrols. Hide in the shadows of carts and hay; a guard
//      who sees you sends you back to the last milestone.
//   2  The throne room: the King, the Minister, the test.
// Simplification from the tale: here the hero, not his father,
// makes the trip to the palace.
// ============================================================

// A throne room interior, shared with King Sanobar's audience.
function paintThroneRoom(ctx, o) {
  o = o || {};
  const wall = o.wall !== undefined ? o.wall : 0x3a2a5a, floor = o.floor !== undefined ? o.floor : 0x3a2a3a;
  const accent = o.accent !== undefined ? o.accent : PAL.turquoise, rug = o.rug !== undefined ? o.rug : PAL.crimson;
  ctx.fillStyle = gradV(ctx, 0, 700, [[0, darken(wall, 0.55)], [1, wall]]); ctx.fillRect(0, 0, W, 720);
  // arcade of tiled niches
  for (let i = 0; i < 7; i++) {
    const cx = 140 + i * 273;
    pArch(ctx, cx, 690, 200, 470, 0.62); ctx.fillStyle = gradV(ctx, 220, 690, [[0, darken(wall, 0.5)], [1, darken(wall, 0.25)]]); ctx.fill();
    ctx.save(); pArch(ctx, cx, 690, 200, 470, 0.62); ctx.clip();
    ctx.globalAlpha = 0.5; ctx.fillStyle = patS(ctx, tileStars(darken(accent, 0.45), lighten(accent, 0.1), PAL.gold, 40), 1); ctx.fillRect(cx - 100, 220, 200, 200); ctx.globalAlpha = 1;
    ctx.fillStyle = gradV(ctx, 380, 690, [[0, 0x000000, 0.1], [1, 0x000000, 0.45]]); ctx.fillRect(cx - 100, 220, 200, 480);
    ctx.restore();
    pArch(ctx, cx, 690, 200, 470, 0.62); strokeC(ctx, PAL.gold, 4); ctx.stroke();
    pArch(ctx, cx, 690, 224, 494, 0.62); strokeC(ctx, accent, 3, 0.8); ctx.stroke();
  }
  // tile dado and frieze
  ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, accent, 48), 1.2); ctx.fillRect(0, 610, W, 90);
  fillC(ctx, PAL.gold); ctx.fillRect(0, 604, W, 6); ctx.fillRect(0, 700, W, 6);
  ctx.fillStyle = patS(ctx, tileStripes([PAL.gold, darken(wall, 0.4), accent, darken(wall, 0.4)], [10, 6, 10, 6]), 1); ctx.fillRect(0, 160, W, 22);
  // floor
  ctx.fillStyle = gradV(ctx, 706, H, [[0, darken(floor, 0.2)], [1, floor]]); ctx.fillRect(0, 706, W, H - 706);
  ctx.save(); ctx.globalAlpha = 0.18;
  for (let y = 706, row = 0; y < H; row++) { const h = 30 + row * 10; for (let x = (row % 2) * -60; x < W; x += 120) { strokeC(ctx, 0x000000, 2); ctx.strokeRect(x, y, 120, h); } y += h; }
  ctx.restore();
  // long carpet to the throne
  ctx.save(); ctx.beginPath(); ctx.moveTo(860, 706); ctx.lineTo(1060, 706); ctx.lineTo(1300, H); ctx.lineTo(620, H); ctx.closePath(); ctx.clip();
  ctx.fillStyle = gradV(ctx, 706, H, [[0, darken(rug, 0.3)], [1, rug]]); ctx.fillRect(600, 706, 720, H);
  ctx.globalAlpha = 0.5; ctx.fillStyle = patS(ctx, tileStars(rug, PAL.gold, darken(rug, 0.5), 60), 1); ctx.fillRect(600, 706, 720, H); ctx.globalAlpha = 1;
  ctx.restore();
  strokeC(ctx, PAL.gold, 6); ctx.beginPath(); ctx.moveTo(860, 706); ctx.lineTo(620, H); ctx.moveTo(1060, 706); ctx.lineTo(1300, H); ctx.stroke();
  // dais steps
  [[600, 0], [560, 26], [520, 52]].forEach((s, i) => {
    pRR(ctx, 960 - s[0] / 2, 660 + s[1], s[0], 30, 6); ctx.fillStyle = gradV(ctx, 660 + s[1], 690 + s[1], [[0, lighten(floor, 0.3 - i * 0.08)], [1, floor]]); ctx.fill();
    strokeC(ctx, PAL.gold, 2.4); ctx.stroke();
  });
  // columns
  [300, 1620].forEach(x => {
    ctx.fillStyle = gradH(ctx, x - 44, x + 44, [[0, lighten(wall, 0.4)], [0.4, lighten(wall, 0.15)], [1, darken(wall, 0.4)]]); ctx.fillRect(x - 40, 120, 80, 600);
    ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, accent, 40), 1); ctx.fillRect(x - 40, 300, 80, 46); ctx.fillRect(x - 40, 520, 80, 46);
    fillC(ctx, PAL.gold); ctx.fillRect(x - 56, 108, 112, 22); ctx.fillRect(x - 56, 700, 112, 22);
    strokeC(ctx, 0x000000, 2, 0.5); ctx.strokeRect(x - 40, 120, 80, 600);
  });
  // hanging lamps
  [560, 960, 1360].forEach(x => {
    strokeC(ctx, 0x2a1a10, 3); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 110); ctx.stroke();
    glowDot(ctx, x, 140, 120, 0xffb850, 0.35);
    ctx.beginPath(); ctx.moveTo(x - 30, 120); ctx.quadraticCurveTo(x, 180, x + 30, 120); ctx.closePath(); ctx.fillStyle = gradV(ctx, 110, 160, [[0, 0xffe2a0], [1, 0xc07a20]]); ctx.fill(); strokeC(ctx, 0x5a3a10, 2); ctx.stroke();
  });
  grain(ctx, 0, 0, W, H, 0.04);
}

function paintThrone(ctx, cx, baseY, o) {
  o = o || {};
  const seat = o.seat !== undefined ? o.seat : 0x5a2a1a, cush = o.cush !== undefined ? o.cush : PAL.crimson;
  pArch(ctx, cx, baseY - 90, 260, 380, 0.5);
  ctx.fillStyle = gradH(ctx, cx - 130, cx + 130, [[0, lighten(seat, 0.2)], [1, darken(seat, 0.35)]]); ctx.fill(); strokeC(ctx, 0x1a0a04, 3); ctx.stroke();
  ctx.save(); pArch(ctx, cx, baseY - 90, 200, 320, 0.5); ctx.clip();
  ctx.fillStyle = patS(ctx, tileStars(cush, PAL.gold, darken(cush, 0.5), 40), 1); ctx.fillRect(cx - 100, baseY - 420, 200, 340);
  ctx.restore();
  pArch(ctx, cx, baseY - 90, 200, 320, 0.5); strokeC(ctx, PAL.gold, 5); ctx.stroke();
  fillC(ctx, PAL.gold); ctx.beginPath(); ctx.arc(cx, baseY - 480, 16, 0, 6.2832); ctx.fill();
  pRR(ctx, cx - 150, baseY - 120, 300, 80, 16); ctx.fillStyle = gradV(ctx, baseY - 120, baseY - 40, [[0, lighten(cush, 0.2)], [1, darken(cush, 0.25)]]); ctx.fill(); strokeC(ctx, 0x2a0a0a, 2.6); ctx.stroke();
  pRR(ctx, cx - 170, baseY - 46, 340, 46, 8); ctx.fillStyle = gradV(ctx, baseY - 46, baseY, [[0, PAL.gold], [1, PAL.goldDark]]); ctx.fill(); strokeC(ctx, 0x4a2a08, 2.4); ctx.stroke();
  [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * 160, baseY - 120, 22, 0, 6.2832); fillC(ctx, PAL.gold); ctx.fill(); strokeC(ctx, 0x4a2a08, 2.4); ctx.stroke(); });
}

// ---------- the night road ----------

const ROAD_LEN = 7600, ROAD_Y0 = 705, ROAD_Y1 = 995, ROAD_SQ = 0.55;   // ground depth is drawn at 55%

// Guards: patrol (walks its path, looks around at each end), sentry (stands,
// turns between `looks` every `period` ms), sweep (stands, swings a long
// narrow beam). Angles: 0 = east, PI/2 = toward the canal, -PI/2 = the wall.
const ROAD_LAYOUT = {
  milestones: [180, 2150, 4150, 6050],
  wallLamps: [620, 1380, 2300, 3150, 3980, 4820, 5660, 6380, 7020],
  props: [
    ["hay", 1180, 770], ["cart", 1500, 935], ["jars", 2060, 965],
    ["sacks", 3050, 835], ["cart", 3560, 865], ["jars", 4700, 875], ["hay", 5180, 880], ["sacks", 5800, 820],
    ["cart", 6430, 960], ["wood", 6860, 805]
  ],
  hides: [
    ["bush", 700, 965], ["bush", 1850, 745], ["alcove", 2420], ["bush", 2810, 765], ["bush", 3910, 760], ["alcove", 4060],
    ["bush", 4300, 905], ["alcove", 4900], ["alcove", 5470], ["bush", 5990, 965], ["bush", 6200, 765], ["alcove", 6700], ["bush", 7010, 770]
  ],
  guards: [
    { type: "patrol", x: 950, y: 845, path: [[950, 845], [1760, 845]], speed: 140, wait: 1500 },
    { type: "sentry", x: 1960, y: 850, looks: [-Math.PI / 2, Math.PI / 2], period: 2600, len: 420, half: 0.62, look: -Math.PI / 2 },
    { type: "patrol", x: 2600, y: 718, path: [[2600, 718], [2600, 985]], speed: 120, wait: 900, look: Math.PI / 2 },
    { type: "patrol", x: 2900, y: 975, path: [[2900, 975], [3800, 975]], speed: 165, wait: 1100 },
    { type: "sweep", x: 3350, y: 716, mid: Math.PI / 2, amp: 1.05, rate: 0.9, len: 620, half: 0.2 },
    { type: "patrol", x: 4450, y: 800, path: [[4450, 800], [5350, 800]], speed: 150, wait: 1300 },
    { type: "patrol", x: 4560, y: 960, path: [[4560, 960], [5440, 960]], speed: 150, wait: 1300 },
    { type: "sentry", x: 5640, y: 870, looks: [0, Math.PI], period: 2800, len: 470, half: 0.5, look: 0 },
    { type: "patrol", x: 5900, y: 985, path: [[5900, 985], [5900, 718]], speed: 130, wait: 900, look: -Math.PI / 2 },
    { type: "sweep", x: 6520, y: 716, mid: Math.PI / 2, amp: 1.1, rate: 1.1, len: 640, half: 0.2 },
    { type: "patrol", x: 6250, y: 880, path: [[6250, 880], [7060, 880]], speed: 185, wait: 900 },
    { type: "sentry", x: 7120, y: 985, looks: [-2.6, -1.95], period: 2200, len: 460, half: 0.5, look: -2.6 }
  ]
};

// Cast a lantern's light: rays fanned around `look` in ground space, each
// stopped by the first footprint it meets or by the edge of the road.
function castLight(ox, oy, look, half, len, out, blockers) {
  const gx = ox, gy = oy / ROAD_SQ, n = out.length - 1;
  const yTop = 692 / ROAD_SQ, yBot = 1012 / ROAD_SQ;
  const near = blockers.filter(o => Math.abs(o.x - ox) < len + o.rx + 20);
  for (let i = 0; i <= n; i++) {
    const a = look - half + 2 * half * i / n, dx = Math.cos(a), dy = Math.sin(a);
    let L = len;
    if (dy < -1e-6) L = Math.min(L, (yTop - gy) / dy);
    else if (dy > 1e-6) L = Math.min(L, (yBot - gy) / dy);
    for (let j = 0; j < near.length; j++) {
      const o = near[j], ry = o.ry / ROAD_SQ;
      const px = (gx - o.x) / o.rx, py = (gy - o.y / ROAD_SQ) / ry, qx = dx / o.rx, qy = dy / ry;
      const A = qx * qx + qy * qy, B = 2 * (px * qx + py * qy), C = px * px + py * py - 1;
      if (C < 0) continue;
      const D = B * B - 4 * A * C;
      if (D < 0) continue;
      const t = (-B - Math.sqrt(D)) / (2 * A);
      if (t > 0 && t < L) L = t;
    }
    out[i] = Math.max(0, L);
  }
}

// The road and its verges, a moonlit canal along the bottom. Painted three
// times side by side so the strip tiles without a seam.
function paintRoadGround(ctx, w, h) {
  [-w, 0, w].forEach(off => {
    ctx.save(); ctx.translate(off, 0);
    paintEarth(ctx, 0, 0, w, 380, 0x34324a, "roadg", { pebbles: 160 });
    // the packed road itself, with cart ruts
    ctx.fillStyle = gradV(ctx, 110, 330, [[0, 0x5a5670, 0], [0.15, 0x5a5670, 0.55], [0.85, 0x5a5670, 0.55], [1, 0x5a5670, 0]]); ctx.fillRect(0, 110, w, 220);
    paintCobbles(ctx, 0, 150, w, 140, 0x6a6684, "roadcob", 0.25);
    strokeC(ctx, 0x1e1c2c, 6, 0.35); [178, 262].forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); for (let x = 0; x <= w; x += 60) ctx.lineTo(x, y + Math.sin(x / 190) * 5); ctx.stroke(); });
    const r = rng("roadgrass");
    for (let i = 0; i < 70; i++) paintGrass(ctx, r.range(0, w), r.chance(0.5) ? r.range(70, 110) : r.range(330, 372), r.range(0.8, 1.4), r.pick([0x3e5040, 0x4a5a46, 0x34443a]), "rg" + i);
    ctx.restore();
  });
  // the canal (aryk): dark water, a bank, moonlight on the ripples
  ctx.fillStyle = gradV(ctx, 372, h, [[0, 0x2a2a3e], [0.12, 0x101c34], [1, 0x1a2e50]]); ctx.fillRect(0, 372, w, h - 372);
  fillC(ctx, 0x4a4860); ctx.fillRect(0, 366, w, 9);
  const r = rng("canal");
  for (let i = 0; i < 70; i++) { strokeC(ctx, 0xb0c8ff, 2, r.range(0.12, 0.35)); const y = r.range(392, h - 6), x = r.range(-40, w); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(30, 110), y); ctx.stroke(); }
  for (let x = 0; x < w; x += r.range(20, 50)) {
    strokeC(ctx, r.pick([0x2e4436, 0x3a5040, 0x26382e]), 3); ctx.lineCap = "round";
    const hh = r.range(16, 40); ctx.beginPath(); ctx.moveTo(x, 374); ctx.quadraticCurveTo(x + r.range(-6, 6), 374 - hh / 2, x + r.range(-10, 10), 374 - hh); ctx.stroke();
  }
}

// A deep arched doorway in the town wall: stand in it and you vanish.
function paintAlcove(ctx, cx, baseY) {
  pArch(ctx, cx, baseY, 136, 214, 0.6); ctx.fillStyle = gradV(ctx, baseY - 214, baseY, [[0, 0x8a84a0], [1, 0x6a6480]]); ctx.fill(); strokeC(ctx, 0x2a2638, 2.4); ctx.stroke();
  pArch(ctx, cx, baseY, 108, 192, 0.6); ctx.fillStyle = gradV(ctx, baseY - 192, baseY, [[0, 0x0a0812], [1, 0x1a1626]]); ctx.fill();
  ctx.save(); pArch(ctx, cx, baseY, 108, 192, 0.6); ctx.clip();
  ctx.fillStyle = gradH(ctx, cx - 54, cx + 54, [[0, 0x000000, 0.5], [0.6, 0x000000, 0], [1, 0xffffff, 0.06]]); ctx.fillRect(cx - 60, baseY - 200, 120, 200);
  ctx.restore();
  fillC(ctx, 0x5a5470); ctx.fillRect(cx - 74, baseY - 6, 148, 10);
}

// The post a sweeping guard swings his big lantern from.
function paintWatchPost(ctx, cx, baseY) {
  softEllipse(ctx, cx, baseY + 2, 70, 12, 0x000000, 0.35);
  pRR(ctx, cx - 64, baseY - 34, 128, 34, 6); ctx.fillStyle = gradV(ctx, baseY - 34, baseY, [[0, 0x8a84a0], [1, 0x4a4660]]); ctx.fill(); strokeC(ctx, 0x1e1a2a, 2.2); ctx.stroke();
  ctx.fillStyle = patS(ctx, tileBrick(0x7a7490, 0x4a4660, 22, 10, "wp"), 1); ctx.fillRect(cx - 60, baseY - 30, 120, 26);
  strokeC(ctx, 0x2a1a10, 7); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx + 46, baseY - 34); ctx.lineTo(cx + 46, baseY - 128); ctx.stroke();
  strokeC(ctx, 0x6a4a2a, 4); ctx.beginPath(); ctx.moveTo(cx + 46, baseY - 34); ctx.lineTo(cx + 46, baseY - 128); ctx.stroke();
  pRR(ctx, cx + 32, baseY - 150, 28, 30, 5); fillC(ctx, 0x2a2018); ctx.fill();
  pRR(ctx, cx + 37, baseY - 145, 18, 20, 3); ctx.fillStyle = gradV(ctx, baseY - 145, baseY - 125, [[0, 0xfff1b8], [1, 0xffa83a]]); ctx.fill();
}

class VillagePalaceScene extends BaseScene {
  constructor() { super("VillagePalaceScene"); }
  init(data) { this.sub = (data && (data.sub || data.phase)) || 0; this.ck = (data && data.ck) || 0; }

  create() {
    if (this.sub === 0) this.createVillage();
    else if (this.sub === 1) this.createRoad();
    else this.createPalace();
  }

  // ------------------------------------------------------------ village
  createVillage() {
    this.begin({ music: "village", amb: "wind" });
    this.busy = false;
    const layout = TOWN_LAYOUTS.village, cam = this.cameras.main;
    this.colliders = [];
    cam.setBounds(0, 0, layout.width, H);
    buildWidePlace(this, "village", layout);
    ambientParticles(this, "petals", { area: { x: 200, y: 260, w: 1500, h: 500 }, freq: 420 }).setScrollFactor(0);
    addVignette(this, 0.45);

    this.dbox = new DialogueBox(this);
    this.hero = makePerson(this, 300, 900, HERO);
    this.walker = new Walker(this, this.hero, { bounds: { x0: 70, y0: STREET_Y0, x1: layout.width - 70, y1: STREET_Y1 } });
    this.dbox.actors["You"] = this.hero;
    cam.startFollow(this.hero, true, 0.08, 0.08, 0, 140);
    this.misses = 0;

    STORY.villagers.forEach(v => {
      const p = makePerson(this, v.x, v.y, Object.assign({ facing: v.x > this.hero.x ? -1 : 1 }, v.cfg));
      p.setPerspective(lerp(0.84, 1.12, clamp((v.y - STREET_Y0) / (STREET_Y1 - STREET_Y0), 0, 1))).setDepth(v.y);
      let n = 0;
      this.walker.add({ x: v.x, y: v.y, obj: p, act: () => {
        this.misses++; this.dbox.actors[v.name] = p;
        this.dbox.show([{ speaker: v.name, text: v.lines[n++ % v.lines.length], who: v.cfg }], () => this.maybeGuide());
      } });
    });
    const at = STORY.oldManAt;
    const om = this.oldMan = makePerson(this, at.x, at.y, Object.assign({ facing: -1 }, STORY.cast["Old Traveler"]));
    om.setPerspective(lerp(0.84, 1.12, (at.y - STREET_Y0) / (STREET_Y1 - STREET_Y0))).setDepth(at.y);
    this.dbox.actors["Old Traveler"] = om;
    this.walker.add({ x: om.x, y: om.y, obj: om, act: () => this.meetOldMan() });
    makeCrowd(this, { n: 6, seed: "villagecrowd", env: "village", width: layout.width });

    UI.banner(this, "The Village", "a morning like any other", { y: 180 });
    UI.objective(this, "Someone in the village is looking for you");
    UI.hint(this, this.touchMode ? "Tap the ground to walk · tap someone to talk" : "WASD / arrows or click to walk · E to talk · Esc to pause");
    this.time.delayedCall(7000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });
  }

  maybeGuide() {
    if (this.misses >= 4 && !this.mark) { this.mark = guideSparkle(this, this.oldMan.x, this.oldMan.y - 240); Snd.play("chime"); }
  }

  meetOldMan() {
    if (this.mark) { this.mark.destroy(); this.mark = null; }
    this.busy = true;
    this.dbox.show(STORY.oldMan, () => {
      GameState.hasCarpet = true;
      UI.itemGet(this, "carpet", () => {
        this.tweens.add({ targets: this.oldMan, alpha: 0, duration: 900 });
        Snd.play("whoosh");
        this.time.delayedCall(900, () => {
          this.dbox.show([L("", "When you look up, the old traveller is gone. That evening, against all sense, you set out for the palace to ask for the Princess's hand.")], () => {
            GameFlow.setSub(1);
            this.restartWith({ sub: 1 }, 700);
          });
        });
      });
    });
  }

  // ------------------------------------------------------------ road
  // The night road. The ground is a squashed plane: a lantern's light is
  // a fan of rays in ground space (y / ROAD_SQ) that stops at carts, hay
  // and jars, at the wall above and at the canal below. The lit fan is
  // drawn exactly as it is tested, so the edge of the light is the edge
  // of danger. Bushes and wall alcoves hide you completely.
  createRoad() {
    this.begin({ music: "tense", amb: "night" });
    const cam = this.cameras.main;
    cam.setBounds(0, 0, ROAD_LEN, H);
    addBackdrop(this, "road_sky", (ctx) => {
      paintSky(ctx, W, H, [[0, 0x060818], [0.6, 0x1a2248], [1, 0x34345c]]);
      paintStars(ctx, W, 600, 280, "roadstars", 1);
      paintMoon(ctx, 1500, 150, 58);
      paintCloud(ctx, 520, 250, 420, 70, 0x232a4c, "rc1", { lit: 0x4a5684 });
    }, -30).setScrollFactor(0);
    Tex.make(this, "road_far", W, 420, ctx => paintSkyline(ctx, W, 420, { seed: "roadfar", color: 0x141834, color2: 0x1c2042, minH: 50, maxH: 230, lights: 0.7, finial: 0x6a5a3a }));
    this.add.tileSprite(0, 270, ROAD_LEN, 420, "road_far").setOrigin(0).setScrollFactor(0.35, 1).setDepth(-20);
    Tex.make(this, "road_gnd", W, 440, ctx => paintRoadGround(ctx, W, 440));
    this.add.tileSprite(0, 640, ROAD_LEN, 440, "road_gnd").setOrigin(0).setDepth(-15);
    for (let x = 0; x < ROAD_LEN - 700; x += 900) {
      addProp(this, x + 450, 700, 920, 300, c => paintCityWall(c, -460, 460, 0, 170, { color: 0x6a6480, towerStep: 440, towerOff: 210 }), { tint: 0x9aa4d0, key: "roadwall", pad: 40 });
    }
    addProp(this, ROAD_LEN - 300, 720, 760, 780, (c) => { paintPortal(c, 0, 0, 540, 440, { color: 0x8a7aa0 }); paintDome(c, 0, -440, 124, { color: 0x2f7a9a, drum: 0x8a7aa0 }); }, { tint: 0xb0b8e0 });
    const gate = addGlow(this, ROAD_LEN - 300, 640, 520, 0xffc060, 0.35).setDepth(6000);
    this.tweens.add({ targets: gate, alpha: 0.22, duration: 900, yoyo: true, repeat: -1 });

    const L = ROAD_LAYOUT;
    this.colliders = [];
    this.blockers = [];        // footprints that stop light
    this.hides = [];           // places that hide you completely
    // milestones
    this.cks = L.milestones;
    this.cks.forEach((x, i) => {
      if (i === 0) return;
      addProp(this, x, 760, 120, 260, c => paintLampPost(c, 0, 0), { tint: 0xb0b8e0 });
      addGlow(this, x + 34, 612, 260, 0xffc060, 0.55).setDepth(6000);
    });
    // wall lamps, for atmosphere
    L.wallLamps.forEach(x => { addGlow(this, x, 610, 200, 0xffb050, 0.35).setDepth(5); this.add.image(x, 618, "fx-dot").setTint(0xffd27a).setScale(0.5).setDepth(6); });
    // obstacles: carts, hay, jars, sacks, firewood - they block light and you
    L.props.forEach(pr => {
      const [kind, x, y] = pr;
      const T = { tint: 0x8a90b8 };
      let img, rx, ry;
      if (kind === "cart") { img = addProp(this, x, y, 420, 300, c => paintCart(c, 0, 0, { load: "hay" }), T); rx = 132; ry = 28; }
      else if (kind === "hay") { img = addProp(this, x, y, 240, 170, c => paintHay(c, 0, 0), T); rx = 94; ry = 26; }
      else if (kind === "jars") { img = addProp(this, x, y, 260, 170, c => paintPots(c, 0, 0, "rj" + x, { n: 3, big: true }), T); rx = 82; ry = 24; }
      else if (kind === "sacks") { img = addProp(this, x, y, 240, 150, c => paintSacks(c, 0, 0, "rs" + x), T); rx = 84; ry = 22; }
      else { img = addProp(this, x, y, 220, 130, c => paintFirewood(c, 0, 0), T); rx = 74; ry = 20; }
      this.colliders.push({ x, y, rx, ry });
      this.blockers.push({ x, y, rx: rx + 6, ry: ry + 6 });
      void img;
    });
    // bushes and alcoves: step inside and nobody can see you
    L.hides.forEach(hd => {
      const [kind, x, y] = hd;
      if (kind === "bush") {
        addProp(this, x, y, 300, 220, c => paintTree(c, 0, 0, "bush", 1.55, "rb" + x, { leaf: 0x3a5a3a }), { tint: 0x8a90b8, depthOff: 70 });
        this.hides.push({ x, y: y - 8, rx: 70, ry: 30 });
      } else {
        addProp(this, x, 708, 200, 260, c => paintAlcove(c, 0, 0), { tint: 0x9aa4d0, depthOff: -40, pad: 10 });
        this.hides.push({ x, y: 716, rx: 54, ry: 18 });
      }
    });

    // the guards
    this.guards = L.guards.map((def, i) => this.makeGuard(def, i));
    this.coneG = this.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);

    this.hero = makePerson(this, this.cks[this.ck], 880, HERO).tint(0xa8b0d8);
    this.walker = new Walker(this, this.hero, { bounds: { x0: 80, y0: ROAD_Y0, x1: ROAD_LEN - 200, y1: ROAD_Y1 } });
    cam.startFollow(this.hero, true, 0.1, 0.1, 0, 120);
    this.dbox = new DialogueBox(this);
    this.dbox.actors["You"] = this.hero;
    this.lastCk = this.ck;
    this.hidTxt = UI.pill(this, 0, 0, "hidden", { size: 24, h: 44, padX: 34, color: "#b8c4ff", depth: 8780 }).setScrollFactor(1, 1, true).setVisible(false);
    addVignette(this, 1);
    UI.objective(this, "Reach the palace gate without being seen");
    if (this.ck === 0) {
      this.busy = true;
      UI.banner(this, STORY.road.title, null, { y: 200 });
      this.time.delayedCall(1200, () => this.dbox.show(STORY.road.intro, () => {
        this.busy = false;
        UI.hint(this, "Stay out of the lantern light · step into bushes and dark doorways to hide");
        this.time.delayedCall(7000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });
      }));
    }
  }

  makeGuard(def, i) {
    const p = makePerson(this, def.x, def.y, Object.assign({}, STORY.cast["Guard"], { holding: "lantern" }));
    p.tint(0xc0c4e8);
    const g = Object.assign({ len: 470, half: 0.5, speed: 150, wait: 1300 }, def);
    g.p = p; g.i = i; g.sus = 0; g.t = Math.random() * 6; g.rays = new Float32Array(25);
    g.look = def.look !== undefined ? def.look : 0; g.endLook = g.look; g.base = { x: def.x, y: def.y, look: g.look };
    g.pi = 1; g.waitT = 300 + i * 250; g.si = 0; g.turnT = def.period || 3200;
    g.glow = addGlow(this, def.x, def.y - 100, 210, 0xffc060, 0.6).setDepth(6001);
    g.mark = UI.title(this, def.x, def.y - 230, "?", { size: 58, color: "#ffd84a", stroke: "#1a0c04", strokeW: 9 }).setDepth(8790).setAlpha(0);
    if (g.type === "sweep") addProp(this, def.x, def.y + 6, 220, 140, c => paintWatchPost(c, 0, 0), { tint: 0x9aa4d0, depthOff: -30 });
    return g;
  }

  resetGuard(g) {
    g.p.setPosition(g.base.x, g.base.y); g.look = g.endLook = g.base.look; g.sus = 0; g.pi = 1; g.waitT = 600; g.si = 0; g.turnT = g.period || 3200; g.alert = null;
  }

  // Look angles are in ground space: 0 = east, PI/2 = toward the canal.
  turnToward(g, want, rate, dt) {
    let d = Math.atan2(Math.sin(want - g.look), Math.cos(want - g.look));
    const step = rate * dt;
    g.look += clamp(d, -step, step);
  }

  updateGuard(g, dt, d) {
    const p = g.p;
    g.t += dt;
    p.moving = false;
    if (g.alert) {                                  // something moved in the light: stop and stare
      this.turnToward(g, g.alert.ang, 3.2, dt);
      if (g.sus < 0.12) g.alert = null;
    } else if (g.type === "patrol") {
      const tgt = g.path[g.pi];
      if (g.waitT > 0) {
        g.waitT -= d;
        this.turnToward(g, g.endLook + Math.sin(g.t * 2.3) * 0.75, 2.6, dt);
      } else {
        const dx = tgt[0] - p.x, dy = tgt[1] - p.y, L = Math.hypot(dx, dy);
        const v = g.speed * dt * (p.pk || 1);
        if (L <= v) {
          p.setPosition(tgt[0], tgt[1]);
          g.endLook = Math.atan2(dy / ROAD_SQ, dx);
          g.pi = (g.pi + 1) % g.path.length; g.waitT = g.wait;
        } else {
          p.x += dx / L * v; p.y += dy / L * v; p.moving = true;
          this.turnToward(g, Math.atan2(dy / ROAD_SQ, dx), 5, dt);
        }
      }
    } else if (g.type === "sentry") {
      g.turnT -= d;
      if (g.turnT <= 0) { g.si = (g.si + 1) % g.looks.length; g.turnT = g.period; if (Math.abs(p.x - this.hero.x) < 1300) Snd.play("creak"); }
      this.turnToward(g, g.looks[g.si], 2.2, dt);
    } else if (g.type === "sweep") {
      g.look = g.mid + Math.sin(g.t * g.rate) * g.amp;
    }
    p.setFacing(Math.cos(g.look) < 0 ? -1 : 1);
    p.setPerspective(lerp(0.84, 1.12, clamp((p.y - ROAD_Y0) / (ROAD_Y1 - ROAD_Y0), 0, 1))).setDepth(p.y);
    const k = p.pk || 1;
    g.ox = p.x + p.facing * 24 * k; g.oy = p.y + 4;
    g.glow.setPosition(p.x + p.facing * 26 * k, p.y - 98 * k);
    castLight(g.ox, g.oy, g.look, g.half, g.len, g.rays, this.blockers);
  }

  // Is the hero's position inside guard g's light? -> 0 (no) .. 1 (right at the lantern)
  litBy(g, hx, hy) {
    const gx = hx - g.ox, gy = (hy - g.oy) / ROAD_SQ, dist = Math.hypot(gx, gy);
    if (dist < 1) return 1;
    const rel = Math.atan2(Math.sin(Math.atan2(gy, gx) - g.look), Math.cos(Math.atan2(gy, gx) - g.look));
    if (Math.abs(rel) > g.half) return 0;
    const n = g.rays.length - 1, f = (rel + g.half) / (2 * g.half) * n, i = Math.min(n - 1, Math.floor(f));
    const reach = lerp(g.rays[i], g.rays[i + 1], f - i);
    return dist < reach - 6 ? 1 - dist / g.len : 0;
  }

  drawCones() {
    const G = this.coneG, cam = this.cameras.main;
    G.clear();
    this.guards.forEach(g => {
      if (g.ox < cam.scrollX - 700 || g.ox > cam.scrollX + W + 700) return;
      const n = g.rays.length - 1, warm = g.sus > 0.05 ? mixC(0xffd27a, 0xff6a4a, g.sus) : 0xffd27a;
      const a0 = 0.42, pts = [];
      for (let i = 0; i <= n; i++) {
        const a = g.look - g.half + 2 * g.half * i / n, L = g.rays[i];
        pts.push([g.ox + Math.cos(a) * L, g.oy + Math.sin(a) * L * ROAD_SQ, a0 * (1 - 0.72 * L / g.len)]);
      }
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[i + 1];
        G.fillGradientStyle(warm, warm, warm, warm, a0, p[2], q[2], q[2]);
        G.fillTriangle(g.ox, g.oy, p[0], p[1], q[0], q[1]);
      }
      // the rim of the light, so its edge reads clearly
      G.lineStyle(3, warm, 0.32);
      G.beginPath(); G.moveTo(g.ox, g.oy); pts.forEach(p => G.lineTo(p[0], p[1])); G.closePath(); G.strokePath();
    });
  }

  updateRoad(time, d) {
    this.walker.update(time, d);
    const h = this.hero, dt = d / 1000;
    const hidden = this.hides.some(s => Math.hypot((h.x - s.x) / s.rx, (h.y - s.y) / s.ry) < 1);
    // checkpoints
    for (let i = this.cks.length - 1; i > this.lastCk; i--) {
      if (h.x > this.cks[i]) { this.lastCk = i; Snd.play("chime"); UI.toast(this, "Milestone reached", { y: 220 }); break; }
    }
    let lit = 0;
    const active = !this.busy && !this.dbox.visible;
    const grace = (this.grace || 0) > 0;                 // a moment to get your bearings after a respawn
    if (grace && active) this.grace -= d;
    this.guards.forEach(g => {
      this.updateGuard(g, active ? dt : 0, active ? d : 0);      // frozen during dialogue, light still drawn
      const seen = hidden || grace ? 0 : this.litBy(g, h.x, h.y);
      lit = Math.max(lit, seen);
      const near = !hidden && !grace && Math.hypot(h.x - g.p.x, (h.y - g.p.y) / ROAD_SQ) < 64;
      if (active && (seen > 0 || near)) {
        const before = g.sus;
        g.sus = Math.min(1, g.sus + dt * (near ? 6 : 1.15 + 1.9 * seen));
        if (before < 0.3 && g.sus >= 0.3) Snd.play("suspect");
        if (g.sus > 0.45) g.alert = { ang: Math.atan2((h.y - g.oy) / ROAD_SQ, h.x - g.ox) };
        if (g.sus >= 1) this.caught(g);
      } else g.sus = Math.max(0, g.sus - dt * 0.55);
      const m = g.mark;
      m.setPosition(g.p.x, g.p.y - 220 * (g.p.pk || 1));
      m.setAlpha(clamp(g.sus * 3, 0, 1)).setScale(0.6 + g.sus * 0.6);
      m.setText(g.sus >= 0.999 ? "!" : "?").setColor(g.sus > 0.7 ? "#ff6a4a" : "#ffd84a");
    });
    this.drawCones();
    // how the hero looks: warm in the light, faded in hiding, moonlit otherwise
    h.alpha = hidden ? 0.5 : (grace ? 0.55 + 0.35 * Math.sin(time / 70) : 1);
    if (lit > 0) h.tint(0xfff0d0); else h.tint(hidden ? 0x7078a8 : 0xa8b0d8);
    this.hidTxt.setVisible(hidden).setPosition(h.x, h.y - 210 * (h.pk || 1));
    if (h.x > ROAD_LEN - 520 && !this.busy) {
      this.busy = true;
      Snd.play("success");
      GameFlow.setSub(2);
      this.restartWith({ sub: 2 }, 800);
    }
  }

  caught(g) {
    if (this.busy) return;
    this.busy = true;
    this.walker.stop();
    Snd.play("whistle");
    g.p.hop(16);
    g.mark.setText("!").setColor("#ff6a4a").setAlpha(1).setScale(1.3);
    this.dbox.show([{ speaker: "Guard", text: STORY.road.caught[Math.floor(Math.random() * STORY.road.caught.length)] }], () => {
      this.cameras.main.fadeOut(300, 8, 6, 16);
      this.time.delayedCall(320, () => {
        this.hero.setPosition(this.cks[this.lastCk], 880);
        this.walker.stop();
        // back on their rounds, each at some unknown point of it
        this.guards.forEach(gg => {
          this.resetGuard(gg);
          for (let t = Math.random() * 6; t > 0; t -= 0.1) this.updateGuard(gg, 0.1, 100);
        });
        this.grace = 1600;
        this.cameras.main.fadeIn(400, 8, 6, 16);
        this.busy = false;
      });
    });
  }

  // ------------------------------------------------------------ palace
  createPalace() {
    this.begin({ music: "tense", amb: "fire" });
    addBackdrop(this, "palace_bg", (ctx) => {
      paintThroneRoom(ctx, { wall: 0x2e2a5a, floor: 0x3a3048, accent: PAL.turquoise, rug: 0x8e2f2f });
      paintThrone(ctx, 960, 700, {});
    });
    [[560, 140], [960, 140], [1360, 140]].forEach(p => { const g = addGlow(this, p[0], p[1], 360, 0xffb850, 0.4).setDepth(10); this.tweens.add({ targets: g, alpha: 0.3, duration: 200, yoyo: true, repeat: -1 }); });
    const king = makePerson(this, 960, 640, Object.assign({}, KING)).setDepth(640);
    king.setPerspective(1.05);
    const g1 = makePerson(this, 660, 720, STORY.cast["Guard"]).setDepth(720).setPerspective(1.02);
    const g2 = makePerson(this, 1260, 720, Object.assign({ facing: -1 }, STORY.cast["Guard"])).setDepth(720).setPerspective(1.02);
    const min = makePerson(this, 1420, 760, Object.assign({ facing: -1 }, STORY.cast["Minister"])).setDepth(760).setPerspective(1.08);
    const hero = makePerson(this, 420, 790, HERO).setDepth(790).setPerspective(1.14);
    ambientParticles(this, "dust", { area: { x: 300, y: 100, w: 1300, h: 700 } });
    addVignette(this, 0.75);
    UI.banner(this, "The Palace", "an audience with the King", { y: 200, hold: 1800 });
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "You": hero, "The King": king, "Minister": min };
    this.tweens.add({ targets: hero, x: 700, duration: 1400, onStart: () => hero.moving = true, onComplete: () => {
      hero.moving = false;
      this.time.delayedCall(500, () => this.dbox.show(STORY.palace, () => this.advance()));
    } });
    this.guards2 = [g1, g2];
    this.dbox.onLine = (l) => { if (l && /Guards!/.test(l.text)) [g1, g2].forEach(g => g.hop(18)); };
  }

  tick(time, d) {
    if (this.sub === 0 && this.walker) { this.walker.update(time, d); updateCrowd(this, d); }
    else if (this.sub === 1 && this.walker) this.updateRoad(time, d);
  }
}
