// ============================================================
// SceneTown.js — every "walk around and find the right person"
// place: the kiln at the city's edge, the cemetery, the street
// of ovens, the saddler's row, and the four return visits.
// Config lives in STORY.towns (data.js).
//
// Walk with WASD / arrows or by clicking the ground. Walk up to
// someone and press E (or click them) to talk. Wrong people point
// you onward; after a couple of wrong guesses a sparkle marks the
// person you are looking for.
// ============================================================

const HORIZON = 600;

// Per-place lighting and props.
const TOWN_ENV = {
  city: { tint: 0xffffff, amb: null, particles: "dust" },
  cemetery: { tint: 0xa4acd0, amb: "night", particles: "fireflies" },
  bazaar: { tint: 0xe8c8cc, amb: "fire", particles: "embers" },
  saddler: { tint: 0xffffff, amb: "wind", particles: "leaves" }
};

function paintTownBackdrop(ctx, env) {
  if (env === "city") {
    paintSky(ctx, W, HORIZON + 40, [[0, 0x4f8fc4], [0.55, 0xb9d6dc], [1, 0xf6d8a4]]);
    paintSun(ctx, 1500, 150, 52, 0xffe3a0);
    paintCloud(ctx, 420, 210, 360, 110, 0xfff4e0, "c1"); paintCloud(ctx, 1150, 150, 260, 80, 0xfff4e0, "c2");
    paintRidge(ctx, W, 470, { seed: "cityridge", amp: 120, color: 0xb6a8b4, color2: 0xd4b8a0 });
    paintSkyline(ctx, W, 540, { seed: "cityfar", color: 0xc4a488, color2: 0xd2b090, minH: 50, maxH: 170, finial: 0xd9a441 });
    paintCityWall(ctx, 0, W, HORIZON + 6, 120, { color: 0xdcbc8a, gateX: 820, towerStep: 520, towerOff: 260 });
    paintHouse(ctx, 260, HORIZON + 14, 300, 200, { color: 0xe0c08c, windows: [[-0.25, 0.6], [0.25, 0.6]], doorX: 0, awning: { x: 0.24, w: 150, color: 0x1f6f6f } });
    paintHouse(ctx, 1240, HORIZON + 16, 280, 180, { color: 0xd8b07a, windows: [[-0.28, 0.58]], doorX: 0.18, rug: { x: -0.3, color: 0x1c4e80 } });
    paintEarth(ctx, 0, HORIZON, W, H - HORIZON, 0xcfa070, "cityground");
    paintPath(ctx, [[0, 860], [500, 820], [1000, 880], [1500, 830], [1920, 860]], 150, 0xe8c896, 0.5);
  } else if (env === "cemetery") {
    paintSky(ctx, W, HORIZON + 40, [[0, 0x141a34], [0.55, 0x3a4a72], [1, 0x8a8aa8]]);
    paintStars(ctx, W, 420, 160, "cemstars", 0.8);
    paintMoon(ctx, 1520, 170, 62);
    paintCloud(ctx, 600, 260, 420, 90, 0x3a4468, "cc1", { lit: 0x7a84a8 }); paintCloud(ctx, 1300, 330, 300, 70, 0x3a4468, "cc2", { lit: 0x7a84a8 });
    paintRidge(ctx, W, 520, { seed: "cemridge", amp: 140, color: 0x2a3050, color2: 0x3a4060 });
    paintRidge(ctx, W, 570, { seed: "cemridge2", amp: 70, color: 0x323a52, color2: 0x404a5e });
    // the mausoleum on the hill
    paintPortal(ctx, 960, HORIZON + 4, 300, 230, { color: 0x8a8070 });
    paintDome(ctx, 960, HORIZON - 226, 86, { color: 0x4a7a8a, drum: 0x8a8070 });
    paintMinaret(ctx, 760, HORIZON + 6, 40, 280, { color: 0x8a8070, dome: 0x4a7a8a });
    paintMinaret(ctx, 1160, HORIZON + 6, 40, 280, { color: 0x8a8070, dome: 0x4a7a8a });
    paintTree(ctx, 200, HORIZON + 30, "dead", 1.5, "dt1", { trunk: 0x3a3438 });
    paintTree(ctx, 1760, HORIZON + 24, "dead", 1.3, "dt2", { trunk: 0x3a3438 });
    paintTree(ctx, 420, HORIZON + 10, "cypress", 0.9, "cy1", { leaf: 0x3a5040 });
    paintTree(ctx, 1500, HORIZON + 10, "cypress", 1.0, "cy2", { leaf: 0x3a5040 });
    paintEarth(ctx, 0, HORIZON + 30, W, H - HORIZON, 0x5e604a, "cemground", { pebbles: 220 });
    const r = rng("cemgrass");
    for (let i = 0; i < 90; i++) paintGrass(ctx, r.range(0, W), r.range(HORIZON + 40, H), r.range(0.8, 1.5), r.pick([0x4a5a34, 0x5a6a3a, 0x3e4c2e]), "cg" + i);
    paintPath(ctx, [[0, 980], [600, 900], [1200, 960], [1920, 880]], 110, 0x7a7660, 0.45);
  } else if (env === "bazaar") {
    paintSky(ctx, W, HORIZON + 40, [[0, 0x1e1640], [0.5, 0x8a3e66], [1, 0xf0985a]]);
    paintStars(ctx, W, 280, 70, "bzstars", 0.6);
    paintCloud(ctx, 500, 250, 400, 90, 0xb05a6a, "bc1", { lit: 0xffb07a }); paintCloud(ctx, 1450, 200, 300, 80, 0xb05a6a, "bc2", { lit: 0xffb07a });
    paintSkyline(ctx, W, 520, { seed: "bzfar", color: 0x4a2a52, color2: 0x5a3458, minH: 60, maxH: 200, lights: 0.9, finial: 0xd9a441 });
    paintSkyline(ctx, W, 570, { seed: "bznear", color: 0x3a2040, color2: 0x4a2a48, minH: 40, maxH: 140, lights: 1, scale: 1.2 });
    paintHouse(ctx, 230, HORIZON + 20, 360, 230, { color: 0xb8886a, windows: [[-0.28, 0.66], [0.28, 0.66]], doorX: 0, awning: { x: 0, w: 300, color: 0xb2283a, color2: 0xf2d9a0 } });
    paintHouse(ctx, 700, HORIZON + 18, 300, 200, { color: 0xa87a62, windows: [[0, 0.68]], doorX: -0.22, awning: { x: 0.15, w: 180, color: 0x1f6f6f, color2: 0xf2d9a0 } });
    paintHouse(ctx, 1180, HORIZON + 20, 340, 240, { color: 0xb8886a, windows: [[-0.3, 0.64], [0.3, 0.64]], doorX: 0, awning: { x: 0, w: 260, color: 0xd9a441, color2: 0x8e2f2f } });
    paintHouse(ctx, 1660, HORIZON + 18, 320, 210, { color: 0xa87a62, windows: [[0.25, 0.64]], doorX: -0.2, rug: { x: 0.3, color: 0x8e2f2f } });
    paintEarth(ctx, 0, HORIZON + 20, W, H - HORIZON, 0x7a5a54, "bzground", { pebbles: 60 });
    paintCobbles(ctx, 0, HORIZON + 30, W, H - HORIZON, 0x9a7a6e, "bzcob", 0.45);
  } else if (env === "saddler") {
    paintSky(ctx, W, HORIZON + 40, [[0, 0x3f86c0], [0.6, 0xa8d4e8], [1, 0xf2e6c2]]);
    paintSun(ctx, 320, 130, 48, 0xfff0c0);
    paintCloud(ctx, 900, 180, 420, 120, 0xffffff, "sc1"); paintCloud(ctx, 1600, 260, 300, 90, 0xffffff, "sc2");
    paintRidge(ctx, W, 480, { seed: "sdridge", amp: 160, color: 0x9ab0c4, color2: 0xc0c8c4, snow: 0xffffff });
    paintSkyline(ctx, W, 550, { seed: "sdfar", color: 0xb8a088, color2: 0xc8b090, minH: 40, maxH: 150, finial: 0xd9a441 });
    paintHouse(ctx, 260, HORIZON + 16, 340, 220, { color: 0xd8b888, windows: [[-0.3, 0.62]], doorX: 0.15, awning: { x: 0.12, w: 220, color: 0x6b4a2e, color2: 0xe8d4a8 } });
    paintHouse(ctx, 760, HORIZON + 14, 300, 190, { color: 0xceac7c, windows: [[0.25, 0.6]], doorX: -0.2, rug: { x: 0.28, color: 0x1f6f6f } });
    paintPortal(ctx, 1230, HORIZON + 18, 300, 260, { color: 0xd8b888 });
    paintHouse(ctx, 1680, HORIZON + 16, 320, 210, { color: 0xceac7c, windows: [[-0.25, 0.6], [0.25, 0.6]], doorX: 0, awning: { x: 0, w: 260, color: 0x8e2f2f, color2: 0xe8d4a8 } });
    paintEarth(ctx, 0, HORIZON + 16, W, H - HORIZON, 0xc49a68, "sdground");
    paintPath(ctx, [[0, 820], [700, 860], [1300, 800], [1920, 850]], 170, 0xdcb886, 0.5);
  }
  grain(ctx, 0, 0, W, H, 0.04);
}

// Foreground props per place. Returns lights [{x, y, r, c}] to glow.
function townProps(scene, env, tint) {
  const lights = [], T = { tint };
  const P = (x, y, w, h, fn, o) => addProp(scene, x, y, w, h, fn, Object.assign({}, T, o || {}));
  if (env === "city") {
    P(140, 700, 260, 520, c => paintTree(c, 0, 0, "poplar", 1.2, "cp1"), { col: { rx: 26, ry: 14 } });
    P(1830, 690, 260, 520, c => paintTree(c, 0, 0, "poplar", 1.1, "cp2"), { col: { rx: 26, ry: 14 } });
    P(700, 800, 220, 280, c => paintWell(c, 0, 0), { col: { rx: 80, ry: 26 } });
    P(1010, 1000, 260, 120, c => paintPots(c, 0, 0, "cpots", { n: 4 }), { col: { rx: 90, ry: 20 } });
    P(1180, 640, 420, 260, c => paintCart(c, 0, 0, { load: "sacks" }), { col: { rx: 130, ry: 24 } });
    P(200, 860, 240, 120, c => paintSacks(c, 0, 0, "csk"), { col: { rx: 80, ry: 22 } });
    // the old kiln the couple live in
    P(1720, 760, 520, 420, (c) => {
      const s = 2.1;
      softEllipse(c, 0, 4, 240, 46, 0x000000, 0.35);
      c.beginPath(); c.moveTo(-200, 0); c.bezierCurveTo(-220, -200, -110, -330, 0, -330); c.bezierCurveTo(110, -330, 220, -200, 200, 0); c.closePath();
      c.fillStyle = gradH(c, -210, 210, [[0, 0xdcae7c], [0.45, 0xb8875a], [1, 0x6a4a30]]); c.fill();
      c.save(); c.clip(); mottle(c, -220, -340, 440, 340, 0x3a2414, 0.25, 22, "kiln", 30, 90);
      c.fillStyle = patS(c, tileBrick(0xb8875a, 0x8a6040, 30, 13, "kiln"), 1); c.globalAlpha = 0.25; c.fillRect(-220, -340, 440, 340); c.restore();
      strokeC(c, 0x3a2414, 3); c.stroke();
      pArch(c, 0, 0, 110, 150, 0.55); fillC(c, 0x1e120a); c.fill(); strokeC(c, 0x3a2414, 4); c.stroke();
      c.save(); pArch(c, 0, 0, 110, 150, 0.55); c.clip(); glowDot(c, 0, -30, 90, 0xffb060, 0.45); c.restore();
      softEllipse(c, 0, -300, 50, 20, 0x2a1a10, 0.5);
      paintPots(c, 150, 2, "kp", { n: 2 });
      void s;
    }, { col: { rx: 200, ry: 40 } });
    lights.push({ x: 1720, y: 700, r: 260, c: 0xffa040, a: 0.25 });
  } else if (env === "cemetery") {
    P(1250, 1040, 240, 200, c => paintTree(c, 0, 0, "bush", 1.1, "cb1", { leaf: 0x3e5034 }), { depthOff: 40 });
    P(160, 1020, 240, 200, c => paintTree(c, 0, 0, "bush", 1.0, "cb2", { leaf: 0x3e5034 }), { depthOff: 40 });
    P(1820, 980, 200, 120, c => paintRock(c, 0, 0, 1.3, 0x7a7a70, "cr1"), { col: { rx: 50, ry: 16 } });
  } else if (env === "bazaar") {
    P(560, 690, 320, 320, c => paintStall(c, 0, 0, { goods: "bread", cloth: 0xb2283a, w: 230 }), { col: { rx: 120, ry: 24 } });
    P(1160, 690, 320, 320, c => paintStall(c, 0, 0, { goods: "spices", cloth: 0x1f6f6f, w: 230 }), { col: { rx: 120, ry: 24 } });
    P(1820, 1010, 320, 320, c => paintStall(c, 0, 0, { goods: "fruit", cloth: 0xd9a441, cloth2: 0x8e2f2f, w: 220 }), { col: { rx: 120, ry: 24 } });
    const t1 = P(1460, 690, 280, 300, c => paintTandir(c, 0, 0, 1.05), { col: { rx: 110, ry: 26 } });
    const t2 = P(820, 1020, 260, 280, c => paintTandir(c, 0, 0, 0.9), { col: { rx: 96, ry: 24 } });
    lights.push({ x: 1460, y: 620, r: 340, c: 0xff8a30, a: 0.5 }, { x: 820, y: 960, r: 300, c: 0xff8a30, a: 0.5 });
    [[260, 900], [1000, 800], [1700, 700]].forEach(p => {
      P(p[0], p[1], 120, 260, c => paintLampPost(c, 0, 0), { col: { rx: 14, ry: 8 } });
      lights.push({ x: p[0] + 34, y: p[1] - 148, r: 280, c: 0xffc060, a: 0.55, flicker: true });
    });
    void t1; void t2;
  } else if (env === "saddler") {
    P(560, 700, 340, 320, c => paintStall(c, 0, 0, { goods: "leather", cloth: 0x6b4a2e, cloth2: 0xe8d4a8, w: 240 }), { col: { rx: 125, ry: 24 } });
    P(1380, 980, 340, 320, c => paintStall(c, 0, 0, { goods: "cloth", cloth: 0x8e2f2f, cloth2: 0xe8d4a8, w: 240 }), { col: { rx: 125, ry: 24 } });
    P(1000, 700, 420, 320, c => paintHorse(c, 0, 0, 1.0, { color: 0x8a5a30, blaze: true, saddle: true }), { col: { rx: 150, ry: 26 } });
    P(220, 700, 240, 160, c => paintHay(c, 0, 0), { col: { rx: 90, ry: 22 } });
    P(140, 1000, 260, 520, c => paintTree(c, 0, 0, "round", 1.0, "st1"), { col: { rx: 30, ry: 14 }, depthOff: 30 });
    P(1820, 690, 200, 120, c => paintFirewood(c, 0, 0), { col: { rx: 70, ry: 18 } });
  }
  return lights;
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
    const env = TOWN_ENV[cfg.env];
    this.begin({ music: cfg.music, amb: env.amb });
    makeCommonTextures(this);
    this.busy = false;
    this.misses = 0;

    addBackdrop(this, "town_bg_" + cfg.env, ctx => paintTownBackdrop(ctx, cfg.env));
    const lights = townProps(this, cfg.env, env.tint);
    lights.forEach(l => {
      const g = addGlow(this, l.x, l.y, l.r * 2, l.c, l.a).setDepth(6000);
      if (l.flicker) this.tweens.add({ targets: g, alpha: l.a * 0.7, duration: 140 + Math.random() * 120, yoyo: true, repeat: -1 });
    });
    if (env.particles) ambientParticles(this, env.particles, { area: env.particles === "embers" ? { x: 700, y: 700, w: 900, h: 300 } : { x: 0, y: 200, w: W, h: 800 } });
    if (cfg.env === "cemetery") this.fog();
    addVignette(this, cfg.env === "cemetery" ? 0.95 : 0.6);

    this.dbox = new DialogueBox(this);
    this.hero = makePerson(this, -60, 860, HERO);
    if (env.tint !== 0xffffff) this.hero.tint(mixC(env.tint, 0xffffff, 0.35));
    this.walker = new Walker(this, this.hero, { bounds: { x0: 70, y0: 650, x1: W - 70, y1: 1020 } });
    this.walker.locked = true;
    this.dbox.actors["You"] = this.hero;

    this.spawnSpots(env);
    UI.clues(this);
    UI.banner(this, cfg.title, cfg.sub, { y: 180 });
    UI.objective(this, cfg.objective);
    UI.hint(this, this.touchMode ? "Tap the ground to walk · tap someone to talk" : "WASD / arrows or click to walk · E to talk");
    this.time.delayedCall(6000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });

    // walk in from the left edge
    this.tweens.add({
      targets: this.hero, x: 220, duration: 1100, ease: "Sine.easeOut",
      onStart: () => { this.hero.moving = true; },
      onComplete: () => { this.hero.moving = false; this.walker.locked = false; }
    });
  }

  fog() {
    for (let i = 0; i < 7; i++) {
      const f = this.add.image(Math.random() * W, 640 + Math.random() * 380, "fx-puff").setDisplaySize(900, 200)
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
        obj = addProp(this, s.x, s.y, 200, 260, c => paintGrave(c, 0, 0, s.grave, "gr" + idx), { tint: env.tint, col: { rx: 66, ry: 18 } });
        it = { x: s.x, y: s.y, r: 150, label: "Look", head: 190, obj, stand: 110 };
      } else {
        const look = s.target ? STORY.cast[s.name] : s.cfg;
        obj = makePerson(this, s.x, s.y, Object.assign({ facing: s.x > W / 2 ? -1 : 1 }, look));
        obj.setPerspective(lerp(0.84, 1.12, clamp((s.y - 650) / 370, 0, 1))).setDepth(s.y);
        if (env.tint !== 0xffffff) obj.tint(mixC(env.tint, 0xffffff, 0.35));
        this.dbox.actors[s.name] = obj;
        it = { x: s.x, y: s.y, r: 160, label: "Talk", obj };
        if (s.target && s.name === "Oven-Keeper") {
          const wife = makePerson(this, s.x + 110, s.y - 30, { body: "dress", robe: 0x8a7a64, female: true, head: "scarf", headColor: 0xcfc2a8, elder: true, mood: "sad", facing: -1 });
          wife.setPerspective(obj.pk).setDepth(s.y - 30);
        }
        if (s.target && s.name === "Gravekeeper") {
          const g = addGlow(this, s.x + 28, s.y - 100, 260, 0xffc060, 0.5).setDepth(6000);
          this.tweens.add({ targets: g, alpha: 0.35, duration: 180, yoyo: true, repeat: -1 });
          this.time.addEvent({ delay: 4200, loop: true, callback: () => { if (!this.dbox.visible) Snd.play("sob"); } });
        }
      }
      it.act = () => this.talk(s, obj);
      this.walker.add(it);
      this.spots.push({ s, obj, it });
      if (revisit && s.target) this.targetMark = guideSparkle(this, s.x, s.y - 230);
    });
  }

  talk(s, obj) {
    if (s.target) { this.doTarget(); return; }
    const line = s.miss[(s._n = ((s._n === undefined ? -1 : s._n) + 1)) % s.miss.length];
    this.misses++;
    const who = s.grave ? null : s.cfg;
    this.dbox.show([{ speaker: s.grave ? "" : s.name, text: line, who }], () => {
      if (this.misses >= 3 && !this.targetMark) {
        const t = this.spots.find(p => p.s.target);
        if (t) { this.targetMark = guideSparkle(this, t.s.x, t.s.y - 230); Snd.play("chime"); }
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
  }
}
