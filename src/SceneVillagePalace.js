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

const ROAD_LEN = 5600;

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
    addBackdrop(this, "village_bg", (ctx) => {
      paintSky(ctx, W, HORIZON + 40, [[0, 0x5aa0d8], [0.6, 0xbfe0ec], [1, 0xfbe8c4]]);
      paintSun(ctx, 340, 170, 50, 0xfff0c0);
      paintCloud(ctx, 900, 200, 460, 130, 0xffffff, "vc1"); paintCloud(ctx, 1600, 140, 300, 90, 0xffffff, "vc2");
      paintRidge(ctx, W, 470, { seed: "vridge", amp: 220, color: 0x8aa0c0, color2: 0xb8c4cc, snow: 0xffffff, rough: 0.12 });
      paintRidge(ctx, W, 560, { seed: "vhill", amp: 90, color: 0x8aa064, color2: 0xa0b070 });
      paintHouse(ctx, 240, HORIZON + 14, 320, 200, { color: 0xe0c090, windows: [[-0.26, 0.6]], doorX: 0.18, awning: { x: 0.18, w: 150, color: 0x1f6f6f, color2: 0xf2e6c8 } });
      paintHouse(ctx, 760, HORIZON + 10, 260, 170, { color: 0xd8b482, windows: [[0.24, 0.6]], doorX: -0.2, rug: { x: 0.3, color: 0x8e2f2f } });
      paintHouse(ctx, 1280, HORIZON + 14, 300, 190, { color: 0xe0c090, windows: [[-0.28, 0.6], [0.28, 0.6]], doorX: 0 });
      paintHouse(ctx, 1730, HORIZON + 10, 280, 180, { color: 0xd8b482, windows: [[0.2, 0.6]], doorX: -0.22, awning: { x: -0.2, w: 130, color: 0xb2283a, color2: 0xf2e6c8 } });
      paintEarth(ctx, 0, HORIZON + 10, W, H - HORIZON, 0xc8a46e, "vground");
      const r = rng("vgrass");
      for (let i = 0; i < 60; i++) paintGrass(ctx, r.range(0, W), r.range(HORIZON + 30, H), r.range(0.8, 1.4), r.pick([0x7a9a4a, 0x8aaa52, 0x6a8a3a]), "vg" + i);
      paintPath(ctx, [[0, 880], [600, 840], [1200, 900], [1920, 840]], 160, 0xe0c48e, 0.55);
      grain(ctx, 0, 0, W, H, 0.04);
    });
    addProp(this, 1080, 760, 520, 560, c => paintTree(c, 0, 0, "apricot", 1.25, "apr1"), { col: { rx: 34, ry: 16 } });
    addProp(this, 120, 1010, 440, 520, c => paintTree(c, 0, 0, "apricot", 1.0, "apr2"), { col: { rx: 30, ry: 14 }, depthOff: 30 });
    addProp(this, 1800, 980, 300, 540, c => paintTree(c, 0, 0, "poplar", 1.1, "vp1"), { col: { rx: 26, ry: 14 } });
    addProp(this, 560, 700, 220, 280, c => paintWell(c, 0, 0), { col: { rx: 80, ry: 26 } });
    addProp(this, 1500, 990, 260, 120, c => paintPots(c, 0, 0, "vpots", { n: 3 }), { col: { rx: 70, ry: 20 } });
    addProp(this, 300, 700, 240, 160, c => paintHay(c, 0, 0), { col: { rx: 90, ry: 22 } });
    ambientParticles(this, "petals", { area: { x: 700, y: 300, w: 900, h: 400 }, freq: 500 });
    addVignette(this, 0.45);

    this.dbox = new DialogueBox(this);
    this.hero = makePerson(this, 820, 900, HERO);
    this.walker = new Walker(this, this.hero, { bounds: { x0: 70, y0: 650, x1: W - 70, y1: 1020 } });
    this.dbox.actors["You"] = this.hero;
    this.misses = 0;

    STORY.villagers.forEach(v => {
      const p = makePerson(this, v.x, v.y, Object.assign({ facing: v.x > 960 ? -1 : 1 }, v.cfg));
      p.setPerspective(lerp(0.84, 1.12, clamp((v.y - 650) / 370, 0, 1))).setDepth(v.y);
      this.dbox.actors[v.name] = p;
      let n = 0;
      this.walker.add({ x: v.x, y: v.y, obj: p, act: () => { this.misses++; this.dbox.show([{ speaker: v.name, text: v.lines[n++ % v.lines.length], who: v.cfg }], () => this.maybeGuide()); } });
    });
    const om = this.oldMan = makePerson(this, 1180, 790, Object.assign({ facing: -1 }, STORY.cast["Old Traveler"]));
    om.setPerspective(lerp(0.84, 1.12, (790 - 650) / 370)).setDepth(790);
    this.dbox.actors["Old Traveler"] = om;
    this.walker.add({ x: om.x, y: om.y, obj: om, act: () => this.meetOldMan() });

    UI.banner(this, "The Village", "a morning like any other", { y: 180 });
    UI.objective(this, "Someone in the village is looking for you");
    UI.hint(this, this.touchMode ? "Tap the ground to walk · tap someone to talk" : "WASD / arrows or click to walk · E to talk · Esc to pause");
    this.time.delayedCall(7000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });
  }

  maybeGuide() {
    if (this.misses >= 2 && !this.mark) { this.mark = guideSparkle(this, this.oldMan.x, this.oldMan.y - 240); Snd.play("chime"); }
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
  createRoad() {
    this.begin({ music: "tense", amb: "night" });
    const cam = this.cameras.main;
    cam.setBounds(0, 0, ROAD_LEN, H);
    addBackdrop(this, "road_sky", (ctx) => {
      paintSky(ctx, W, H, [[0, 0x070a1e], [0.6, 0x1e2650], [1, 0x3a3a62]]);
      paintStars(ctx, W, 600, 260, "roadstars", 1);
      paintMoon(ctx, 1500, 160, 58);
    }, -30).setScrollFactor(0);
    Tex.make(this, "road_far", W, 420, ctx => paintSkyline(ctx, W, 420, { seed: "roadfar", color: 0x161a38, color2: 0x1e2244, minH: 50, maxH: 230, lights: 0.7, finial: 0x6a5a3a }));
    this.add.tileSprite(0, 300, ROAD_LEN, 420, "road_far").setOrigin(0).setScrollFactor(0.35, 1).setDepth(-20);
    Tex.make(this, "road_gnd", W, H - 640, (ctx) => { paintEarth(ctx, 0, 0, W, H - 640, 0x2e2c44, "roadg", { pebbles: 120 }); });
    this.add.tileSprite(0, 640, ROAD_LEN, H - 640, "road_gnd").setOrigin(0).setDepth(-15);
    const road = this.add.graphics().setDepth(-14);
    road.fillStyle(0x6a6478, 0.5); road.fillRect(0, 760, ROAD_LEN, 200);
    road.fillStyle(0x000000, 0.12); road.fillRect(0, 756, ROAD_LEN, 6); road.fillRect(0, 958, ROAD_LEN, 6);
    // the walls of the town along the back, and the palace at the end
    for (let x = 0; x < ROAD_LEN - 900; x += 900) {
      addProp(this, x + 450, 650, 920, 260, c => paintCityWall(c, -460, 460, 0, 140, { color: 0x6a6480, towerStep: 420, towerOff: 200 }), { tint: 0x9aa4d0, key: "roadwall" });
    }
    addProp(this, ROAD_LEN - 380, 700, 760, 760, (c) => { paintPortal(c, 0, 0, 520, 420, { color: 0x8a7aa0 }); paintDome(c, 0, -420, 120, { color: 0x2f7a9a, drum: 0x8a7aa0 }); }, { tint: 0xb0b8e0 });
    // milestones (checkpoints)
    this.cks = [180, 1950, 3700];
    this.cks.forEach((x, i) => {
      if (i === 0) return;
      addProp(this, x, 740, 120, 260, c => paintLampPost(c, 0, 0), { tint: 0xb0b8e0 });
      addGlow(this, x + 34, 592, 260, 0xffc060, 0.55).setDepth(6000);
    });
    // hiding places: carts, hay, bushes - hidden while you stand in their shadow
    this.hides = [];
    const hide = (x, y, kind) => {
      const img = kind === "hay" ? addProp(this, x, y, 240, 160, c => paintHay(c, 0, 0), { tint: 0x8a90b8, depthOff: 30 })
        : kind === "cart" ? addProp(this, x, y, 420, 300, c => paintCart(c, 0, 0, { load: "hay" }), { tint: 0x8a90b8, depthOff: 30 })
          : addProp(this, x, y, 260, 200, c => paintTree(c, 0, 0, "bush", 1.3, "rb" + x, { leaf: 0x3a5a3a }), { tint: 0x8a90b8, depthOff: 30 });
      const sh = this.add.image(x, y - 6, "fx-shadow").setDisplaySize(kind === "cart" ? 300 : 220, 70).setAlpha(0.7).setDepth(1);
      this.hides.push({ x, y, rx: kind === "cart" ? 140 : 100, ry: 46, img, sh });
    };
    [[820, 870, "hay"], [1420, 800, "cart"], [2350, 900, "bush"], [2900, 820, "hay"], [3350, 900, "bush"], [4150, 830, "cart"], [4650, 900, "hay"]].forEach(h => hide(h[0], h[1], h[2]));

    // patrols: { x0, x1, y, speed, wait }
    this.guards = [];
    [[1050, 1750, 830, 150, 1300], [2500, 3200, 880, 170, 1100], [3900, 4500, 800, 160, 1100], [4300, 5000, 920, 190, 900]].forEach((g, i) => {
      const p = makePerson(this, g[0], g[2], Object.assign({}, STORY.cast["Guard"], { holding: "lantern" }));
      p.setPerspective(lerp(0.84, 1.12, clamp((g[2] - 680) / 330, 0, 1))).setDepth(g[2]).tint(0xc0c4e8);
      const cone = this.add.graphics().setDepth(2);
      const light = addGlow(this, p.x, p.y - 100, 200, 0xffc060, 0.6).setDepth(6001);
      this.guards.push({ p, cone, light, x0: g[0], x1: g[1], y: g[2], speed: g[3], wait: g[4], dir: 1, waitT: i * 400, seen: 0 });
    });

    this.hero = makePerson(this, this.cks[this.ck], 880, HERO).tint(0xc8cce8);
    this.walker = new Walker(this, this.hero, { bounds: { x0: 80, y0: 690, x1: ROAD_LEN - 300, y1: 1010 } });
    cam.startFollow(this.hero, true, 0.1, 0.1, 0, 120);
    this.dbox = new DialogueBox(this);
    this.dbox.actors["You"] = this.hero;
    this.lastCk = this.ck;
    addVignette(this, 1);
    UI.objective(this, "Reach the palace gate without being seen");
    if (this.ck === 0) {
      this.busy = true;
      UI.banner(this, STORY.road.title, null, { y: 200 });
      this.time.delayedCall(1200, () => this.dbox.show(STORY.road.intro, () => {
        this.busy = false;
        UI.hint(this, "Stay out of the lanterns' light · stand in a shadow to hide");
        this.time.delayedCall(6000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });
      }));
    }
  }

  updateRoad(time, d) {
    this.walker.update(time, d);
    const h = this.hero, dt = d / 1000;
    // hidden?
    const hidden = this.hides.some(s => Math.hypot((h.x - s.x) / s.rx, (h.y - s.y) / s.ry) < 1);
    h.alpha = hidden ? 0.55 : 1;
    // checkpoints
    for (let i = this.cks.length - 1; i > this.lastCk; i--) {
      if (h.x > this.cks[i]) { this.lastCk = i; Snd.play("chime"); UI.toast(this, "Milestone reached", { y: 220 }); break; }
    }
    // guards
    this.guards.forEach(g => {
      const p = g.p;
      if (g.waitT > 0) { g.waitT -= d; p.moving = false; if (g.waitT <= 0) g.dir *= -1; }
      else {
        p.moving = true;
        p.x += g.dir * g.speed * dt;
        if ((g.dir > 0 && p.x >= g.x1) || (g.dir < 0 && p.x <= g.x0)) { p.x = clamp(p.x, g.x0, g.x1); g.waitT = g.wait; }
      }
      p.setFacing(g.dir);
      const facing = g.waitT > 0 ? -g.dir : g.dir;          // turns to look back while waiting
      if (g.waitT > 0 && g.waitT < g.wait * 0.5) p.setFacing(-g.dir);
      const look = g.waitT > 0 && g.waitT < g.wait * 0.5 ? -g.dir : g.dir;
      void facing;
      const ox = p.x + look * 30, oy = p.y - 60, len = 430, half = 0.42;
      g.light.setPosition(p.x + look * 30, p.y - 110);
      g.cone.clear();
      g.cone.fillStyle(0xffd27a, g.seen > 0 ? 0.32 : 0.16);
      g.cone.beginPath(); g.cone.moveTo(ox, oy);
      for (let a = -half; a <= half + 0.001; a += half / 6) g.cone.lineTo(ox + Math.cos(a) * len * look, oy + 60 + Math.sin(a) * len * 0.55);
      g.cone.closePath(); g.cone.fillPath();
      // is the hero inside the light?
      const dx = (h.x - ox) * look, dy = (h.y - (oy + 60)) / 0.55;
      const inCone = dx > 0 && Math.hypot(dx, dy) < len && Math.abs(Math.atan2(dy, dx)) < half;
      if (inCone && !hidden && !this.busy && !this.dbox.visible) {
        g.seen += d;
        if (g.seen > 280) this.caught(g);
      } else g.seen = Math.max(0, g.seen - d);
    });
    if (h.x > ROAD_LEN - 520 && !this.busy) {
      this.busy = true;
      Snd.play("success");
      GameFlow.setSub(2);
      this.restartWith({ sub: 2 }, 800);
    }
  }

  caught(g) {
    this.busy = true;
    Snd.play("alarm");
    const mark = this.add.image(g.p.x, g.p.y - 230, "prompt-mark").setTint(0xff6a5a).setDepth(8800);
    this.tweens.add({ targets: mark, y: mark.y - 20, duration: 200, yoyo: true });
    g.p.hop(16);
    this.dbox.show([{ speaker: "Guard", text: STORY.road.caught[Math.floor(Math.random() * 3)] }], () => {
      mark.destroy();
      this.cameras.main.fadeOut(300, 8, 6, 16);
      this.time.delayedCall(320, () => {
        this.hero.setPosition(this.cks[this.lastCk], 880);
        this.walker.stop();
        this.guards.forEach(gg => { gg.seen = 0; gg.p.x = gg.x0; gg.dir = 1; gg.waitT = 600; });
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
    if (this.sub === 0 && this.walker) this.walker.update(time, d);
    else if (this.sub === 1 && this.walker) this.updateRoad(time, d);
  }
}
