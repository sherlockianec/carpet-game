// ============================================================
// SceneHallOfSkulls.js
//   mode "prologue": the cold open - the wall of nine hooks, one
//                    bare - then "Months earlier...".
//   mode "real":     sub 0 the audience with King Sanobar,
//                    sub 1 the hall itself, his story, and the
//                    escape over a bowl of tea.
// The wall always has nine hooks with the fifth left bare: that
// count and position are the point of the scene.
// ============================================================

function paintSkull(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  strokeC(ctx, 0x2a2a30, 3); ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -38); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -74, 6, 0, 6.2832); fillC(ctx, 0x4a4a52); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -34, 7, Math.PI, 0); strokeC(ctx, 0x4a4a52, 3); ctx.stroke();
  pSmooth(ctx, [[-30, 2], [-33, -22], [-22, -38], [0, -42], [22, -38], [33, -22], [30, 2], [18, 12], [-18, 12]], true);
  ctx.fillStyle = gradR(ctx, -8, -20, 4, 44, [[0, 0xf2e8d4], [0.7, 0xcfc2a6], [1, 0x9a8e74]]); ctx.fill();
  strokeC(ctx, 0x2a2018, 2.4); ctx.stroke();
  pRR(ctx, -18, 6, 36, 22, 8); ctx.fillStyle = gradV(ctx, 6, 28, [[0, 0xd8ccb2], [1, 0x9a8e74]]); ctx.fill(); ctx.stroke();
  strokeC(ctx, 0x6a5e4a, 1.6); for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, 8); ctx.lineTo(i, 24); ctx.stroke(); }
  fillC(ctx, 0x120c0a); [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 13, -10, 9, 11, sd * 0.2, 0, 6.2832); ctx.fill(); });
  ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(4, 6); ctx.lineTo(0, -4); ctx.closePath(); ctx.fill();
  strokeC(ctx, 0x6a5e4a, 1.4); ctx.beginPath(); ctx.moveTo(14, -36); ctx.lineTo(8, -24); ctx.lineTo(12, -16); ctx.stroke();
  ctx.restore();
}

function paintSkullHall(ctx, wallY) {
  paintSky(ctx, W, H, [[0, 0x0a0710], [0.6, 0x1a1020], [1, 0x0c0810]]);
  // stone wall
  ctx.fillStyle = patS(ctx, tileBrick(0x3a2e3a, 0x1a141c, 70, 34, "hall"), 1); ctx.fillRect(0, 0, W, 780);
  ctx.fillStyle = gradV(ctx, 0, 780, [[0, 0x000000, 0.7], [0.5, 0x000000, 0.25], [1, 0x000000, 0.6]]); ctx.fillRect(0, 0, W, 780);
  // the beam the hooks hang from
  pRR(ctx, 150, wallY - 150, W - 300, 36, 6); ctx.fillStyle = gradV(ctx, wallY - 150, wallY - 114, [[0, 0x5a3a24], [1, 0x2a1a0e]]); ctx.fill(); strokeC(ctx, 0x0a0604, 2.4); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const x = 270 + i * (W - 540) / 8;
    if (i === 4) {
      strokeC(ctx, 0x2a2a30, 3); ctx.beginPath(); ctx.moveTo(x, wallY - 114); ctx.lineTo(x, wallY - 60); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - 9, wallY - 60, 9, 0, Math.PI); strokeC(ctx, 0x6a6a72, 4); ctx.stroke();
    } else paintSkull(ctx, x, wallY - 40, 1.3);
  }
  ctx.fillStyle = gradV(ctx, 780, H, [[0, 0x24181e], [1, 0x0e080c]]); ctx.fillRect(0, 780, W, H - 780);
  fillC(ctx, 0x000000, 0.4); ctx.fillRect(0, 776, W, 8);
  grain(ctx, 0, 0, W, H, 0.05);
}

function addBrazier(scene, x, y, s) {
  addProp(scene, x, y, 160, 260, (c) => {
    softEllipse(c, 0, 2, 60, 14, 0x000000, 0.4);
    strokeC(c, 0x2a2420, 8); c.lineCap = "round";
    [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 30, 0); c.lineTo(sd * 10, -110); c.stroke(); });
    c.beginPath(); c.moveTo(-54, -120); c.quadraticCurveTo(0, -60, 54, -120); c.closePath();
    c.fillStyle = gradV(c, -120, -80, [[0, 0x6a5a48], [1, 0x2a2018]]); c.fill(); strokeC(c, 0x0e0a08, 2.4); c.stroke();
    softEllipse(c, 0, -118, 50, 12, 0xff8a30, 0.8);
  }, { scale: s || 1 });
  const by = y - 120 * (s || 1);
  const glow = addGlow(scene, x, by - 30, 420, 0xff8a30, 0.45).setDepth(6000);
  scene.tweens.add({ targets: glow, alpha: 0.3, scale: glow.scale * 0.92, duration: 120 + Math.random() * 80, yoyo: true, repeat: -1 });
  scene.add.particles(x, by - 6, "fx-glow", {
    x: { min: -26, max: 26 }, speedY: { min: -160, max: -90 }, speedX: { min: -14, max: 14 }, scale: { start: 0.32, end: 0 },
    alpha: { start: 0.9, end: 0 }, lifespan: 700, frequency: 30, tint: [0xffe08a, 0xff8a30, 0xff5a20], blendMode: "ADD"
  }).setDepth(y + 1);
}

class HallOfSkullsScene extends BaseScene {
  constructor() { super("HallOfSkullsScene"); }

  init(data) {
    this.mode = data.mode || "prologue";
    this.sub = data.sub || data.phase || 0;
  }

  create() {
    if (this.mode === "prologue") this.prologue();
    else if (this.sub === 0) this.audience();
    else this.hall();
  }

  prologue() {
    this.begin({ music: "grave", amb: "fire", fadeIn: 1400 });
    addBackdrop(this, "hall_bg", ctx => paintSkullHall(ctx, 420));
    addBrazier(this, 160, 860, 1.2); addBrazier(this, W - 160, 860, 1.2);
    ambientParticles(this, "dust", { area: { x: 0, y: 0, w: W, h: 900 } });
    addVignette(this, 1);
    const hook = addGlow(this, 960, 370, 180, 0xffe0a0, 0).setDepth(100);
    this.tweens.add({ targets: hook, alpha: 0.35, duration: 2200, delay: 2200, yoyo: true, repeat: -1 });
    const t = UI.text(this, W / 2, 700, "Somewhere, a King keeps a promise\nno one has lived to regret asking about.", { size: 52, color: "#e6dccb", style: "italic", lineSpacing: 10 }).setDepth(200).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 1800, delay: 1200 });
    const c = UI.text(this, W / 2, 940, this.touchMode ? "tap to continue" : "click or press Space", { size: 28, color: "#8a7a9a" }).setDepth(200).setAlpha(0);
    this.tweens.add({ targets: c, alpha: 0.8, duration: 800, delay: 3200, yoyo: true, repeat: -1 });
    let gone = false;
    const t0 = this.time.now;
    const go = () => {
      if (gone || this.time.now - t0 < 1500) return; gone = true;
      this.leave(() => this.monthsEarlier(), 900);
    };
    this.input.on("pointerdown", (p, over) => { if (!over.length) go(); });
    this.input.keyboard.on("keydown-SPACE", go);
    this.input.keyboard.on("keydown-ENTER", go);
  }

  monthsEarlier() {
    this.children.removeAll(true);
    this.leaving = false;
    this.cameras.main.fadeIn(400, 8, 6, 16);
    const t = UI.title(this, W / 2, H / 2, "Months earlier…", { size: 80, color: "#f1e3c2" }).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 900, onComplete: () => this.time.delayedCall(1300, () => this.advance()) });
  }

  audience() {
    this.begin({ music: "tense", amb: "fire" });
    addBackdrop(this, "sanobar_bg", (ctx) => {
      paintThroneRoom(ctx, { wall: 0x4a1a24, floor: 0x2a1a20, accent: 0xc9a24b, rug: 0x5a1020 });
      paintThrone(ctx, 1180, 700, { seat: 0x2a1410, cush: 0x5a1020 });
    });
    addBrazier(this, 760, 760, 1.1); addBrazier(this, 1600, 760, 1.1);
    const k = makePerson(this, 1180, 650, SANOBAR).setDepth(650).setPerspective(1.06);
    const g = makePerson(this, 1450, 740, Object.assign({ facing: -1 }, STORY.cast["Guard"])).setDepth(740).setPerspective(1.06);
    const hero = makePerson(this, 640, 790, HERO).setDepth(790).setPerspective(1.12);
    UI.clues(this);
    addVignette(this, 0.85);
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "King Sanobar": k, "You": hero };
    void g;
    UI.banner(this, "The City of King Sanobar", "the cook is summoned", { y: 200, hold: 1800 });
    this.time.delayedCall(1600, () => this.dbox.show(STORY.hallOfSkulls.audience, () => { GameFlow.setSub(1); this.restartWith({ mode: "real", sub: 1 }, 900); }));
  }

  hall() {
    this.begin({ music: "grave", amb: "fire" });
    addBackdrop(this, "hall_bg", ctx => paintSkullHall(ctx, 420));
    addBrazier(this, 160, 860, 1.2); addBrazier(this, W - 160, 860, 1.2);
    ambientParticles(this, "dust", { area: { x: 0, y: 0, w: W, h: 900 } });
    const hero = this.hero = makePerson(this, 720, 790, HERO).setDepth(790).setPerspective(1.15);
    const k = makePerson(this, 1180, 790, Object.assign({ facing: -1 }, SANOBAR)).setDepth(790).setPerspective(1.15);
    UI.clues(this);
    addVignette(this, 1);
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "King Sanobar": k, "You": hero };
    this.dbox.show(STORY.hallOfSkulls.hallLines, () => this.teaEscape());
  }

  teaEscape() {
    const h = this.hero;
    h.armLock = true;
    this.tweens.add({ targets: h.armR, rotation: -2.1, duration: 600, ease: "Sine.easeOut" });
    const cupKey = Tex.make(this, "teacup", 60, 40, (c) => {
      c.beginPath(); c.moveTo(6, 6); c.lineTo(54, 6); c.quadraticCurveTo(50, 36, 30, 36); c.quadraticCurveTo(10, 36, 6, 6); c.closePath();
      c.fillStyle = gradH(c, 6, 54, [[0, 0xffffff], [1, 0xc0c8d8]]); c.fill(); strokeC(c, 0x2a3a6a, 2); c.stroke();
      strokeC(c, 0x2a5aa8, 3); c.beginPath(); c.moveTo(10, 16); c.lineTo(50, 16); c.stroke();
    });
    const cup = this.add.image(h.x + 70, h.y - 190, cupKey).setDepth(2000).setAlpha(0);
    this.tweens.add({ targets: cup, alpha: 1, duration: 300, delay: 400 });
    this.time.delayedCall(1000, () => this.dbox.show(STORY.hallOfSkulls.escape, () => {
      Snd.play("magic");
      const glow = addGlow(this, h.x, h.y - 100, 100, 0xffe2a0, 0.9).setDepth(2100);
      this.tweens.add({ targets: glow, displayWidth: 900, displayHeight: 900, alpha: 0, duration: 1200 });
      const sp = this.add.particles(h.x, h.y - 100, "fx-spark", { speed: { min: 80, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 1100,
        tint: [0xffe9a8, 0xffffff], blendMode: "ADD", emitting: false }).setDepth(2101);
      sp.explode(50);
      this.tweens.add({ targets: [h, cup], alpha: 0, y: "-=60", duration: 900, delay: 200 });
      this.time.delayedCall(1700, () => this.advance());
    }));
  }
}
