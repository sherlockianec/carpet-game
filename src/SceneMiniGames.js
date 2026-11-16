// ============================================================
// SceneMiniGames.js — three hands-on challenges.
//
//   Bakery   Three tandir ovens. Each loaf darkens from pale dough
//            to gold to burnt; pull it (click the oven or press
//            1 / 2 / 3) while its ring is in the gold band. Bake
//            20 good loaves before 6 are ruined.
//   Saddler  Build the saddle on its stand by dragging the pieces
//            into place - in the right order, because each piece
//            sits on top of another. 100 seconds.
//   Kitchen  Read each ticket and put its ingredients into the
//            kazan before the time runs out. 8 orders, 6 needed.
//
// Every challenge offers "Skip" in the pause menu after two
// failed attempts.
// ============================================================

// Shared little intro card: title, how-to lines, a Start button.
function challengeIntro(scene, title, lines, onStart) {
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x05040c, 0.6).setDepth(9300).setInteractive();
  const ph = 300 + lines.length * 62;
  const pk = Tex.make(scene, "intro_panel_" + ph, 1160, ph + 60, ctx => paintPanel(ctx, 30, 30, 1100, ph, {}));
  const kids = [scene.add.image(0, 0, pk), UI.title(scene, 0, -ph / 2 + 80, title, { size: 58, color: "#f8e3a6" })];
  lines.forEach((l, i) => kids.push(UI.text(scene, 0, -ph / 2 + 170 + i * 62, l, { size: 34, color: "#f1e3c2", wrap: 980 })));
  const c = scene.add.container(W / 2, H / 2, kids).setDepth(9301).setScale(0.9).setAlpha(0);
  scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 300, ease: "Back.easeOut" });
  let done = false;
  const go = () => {
    if (done) return; done = true;
    scene.tweens.add({ targets: [c, dim], alpha: 0, duration: 250, onComplete: () => { c.destroy(); dim.destroy(); onStart(); } });
  };
  const b = UI.button(scene, W / 2, H / 2 + ph / 2 - 76, "Start", go, { primary: true, depth: 9302, w: 360 });
  scene.tweens.add({ targets: b, alpha: { from: 0, to: 1 }, duration: 300, delay: 300 });
  const kb = () => { b.destroy(); go(); };
  scene.time.delayedCall(400, () => { scene.input.keyboard.once("keydown-SPACE", kb); scene.input.keyboard.once("keydown-ENTER", kb); });
  c.once("destroy", () => { if (b.active) b.destroy(); });
}

// ============================================================ BAKERY

const BAKE = { goal: 20, maxRuined: 6, good: [0.58, 0.9] };

class BakeryGameScene extends BaseScene {
  constructor() { super("BakeryGameScene"); }
  init(data) { this.fails = data.fails || 0; }
  skipLabel() { return this.fails >= 2 ? "Skip the baking" : null; }
  skipChallenge() { this.running = false; this.win(); }

  create() {
    this.begin({ music: "cozy", amb: "fire" });
    addBackdrop(this, "bake_bg", (ctx) => {
      paintSky(ctx, W, 520, [[0, 0x2a1e48], [0.6, 0x9a4a5a], [1, 0xf09a5a]]);
      paintSkyline(ctx, W, 470, { seed: "bakesky", color: 0x4a2a48, color2: 0x5a3450, minH: 50, maxH: 170, lights: 1 });
      // the bakery's courtyard wall
      ctx.fillStyle = patS(ctx, tileBrick(0xb8886a, 0x8a5e44, 60, 26, "bakewall"), 1); ctx.fillRect(0, 380, W, 400);
      ctx.fillStyle = gradV(ctx, 380, 780, [[0, 0x000000, 0.25], [1, 0x000000, 0.05]]); ctx.fillRect(0, 380, W, 400);
      fillC(ctx, 0x6a4a34); ctx.fillRect(0, 366, W, 20);
      for (let x = 80; x < W; x += 300) { strokeC(ctx, 0x3a2414, 3); ctx.beginPath(); ctx.moveTo(x, 386); ctx.lineTo(x, 470); ctx.stroke(); paintLoaf(ctx, x, 488, 26, 0.9); }
      paintEarth(ctx, 0, 780, W, H - 780, 0x8a6a58, "bakeground", { pebbles: 60 });
      paintCobbles(ctx, 0, 780, W, H - 780, 0xa8887a, "bakecob", 0.4);
      grain(ctx, 0, 0, W, H, 0.04);
    });
    Tex.make(this, "loaf", 120, 80, ctx => paintLoaf(ctx, 60, 40, 52, 0.6, { seeds: true }), true);
    this.ovens = [520, 960, 1400].map((x, i) => this.makeOven(x, 820, i));
    this.baker = makePerson(this, 1730, 900, Object.assign({ facing: -1 }, STORY.cast["Baker"])).setDepth(900).setPerspective(1.12);
    // basket of finished loaves
    addProp(this, 200, 960, 260, 200, (c) => {
      softEllipse(c, 0, 2, 110, 20, 0x000000, 0.35);
      c.beginPath(); c.moveTo(-100, -70); c.lineTo(100, -70); c.lineTo(80, 0); c.lineTo(-80, 0); c.closePath();
      c.fillStyle = gradV(c, -70, 0, [[0, 0xc79a5c], [1, 0x7a5432]]); c.fill(); strokeC(c, 0x3a2414, 2.4); c.stroke();
      strokeC(c, 0x6b4a2e, 2, 0.7); for (let y = -60; y < 0; y += 12) { c.beginPath(); c.moveTo(-96 + (y + 70) * 0.25, y); c.lineTo(96 - (y + 70) * 0.25, y); c.stroke(); }
    });
    this.basketPile = [];
    ambientParticles(this, "embers", { area: { x: 400, y: 600, w: 1100, h: 200 } });
    addVignette(this, 0.6);

    this.good = 0; this.ruined = 0; this.running = false; this.combo = 0;
    this.scoreTxt = UI.pill(this, W / 2, 140, "", { minW: 820, size: 34, h: 70, padX: 70, gold: true, color: "#f8e3a6", font: FONT_T });
    this.updateScore();
    this.dbox = new DialogueBox(this);
    this.dbox.actors["Baker"] = this.baker;
    challengeIntro(this, "Keep the Ovens Fed", [
      "Each loaf darkens as it bakes: pale, then golden, then burnt.",
      "Pull it while its ring is inside the gold band.",
      this.touchMode ? "Tap an oven to pull its loaf." : "Click an oven, or press 1, 2 or 3.",
      "Bake " + BAKE.goal + " good loaves. " + BAKE.maxRuined + " ruined and the batch starts over."
    ], () => { this.running = true; this.ovens.forEach((o, i) => this.time.delayedCall(300 + i * 700, () => this.loadOven(o))); });
    UI.hint(this, this.touchMode ? "Tap an oven to pull its loaf" : "Click an oven or press 1 / 2 / 3");
  }

  makeOven(x, y, i) {
    addProp(this, x, y, 300, 300, c => paintTandir(c, 0, 0, 1.25), { key: "bake_tandir" });
    const my = y - 40 - 70 * 1.25 + 20;                         // centre of the glowing mouth
    const glow = addGlow(this, x, my, 360, 0xff8a30, 0.45).setDepth(y + 1);
    this.tweens.add({ targets: glow, alpha: 0.3, duration: 160 + i * 30, yoyo: true, repeat: -1 });
    const ring = this.add.graphics().setDepth(y + 3);
    const loaf = this.add.image(x, my + 4, "loaf").setDepth(y + 2).setVisible(false).setScale(0.95);
    const label = UI.title(this, x, y + 64, String(i + 1), { size: 40, color: "#f8e3a6", stroke: "#2a1608", strokeW: 6 }).setDepth(y + 5);
    const zone = this.add.zone(x, my, 240, 240).setInteractive({ useHandCursor: true });
    const o = { x, y, my, ring, loaf, glow, p: 0, rate: 0, active: false, i, label };
    zone.on("pointerdown", () => this.pull(o));
    return o;
  }

  loadOven(o) {
    if (!this.running) return;
    const t = this.good / BAKE.goal;
    o.p = 0; o.active = true;
    o.rate = 1 / lerp(4.4, 2.5, t) * (0.9 + Math.random() * 0.25);
    o.loaf.setVisible(true).setScale(0.3).setAlpha(1);
    this.tweens.add({ targets: o.loaf, scale: 0.95, duration: 220, ease: "Back.easeOut" });
    this.baker.armLock = true;
    this.tweens.add({ targets: this.baker.armR, rotation: -1.2, duration: 120, yoyo: true, onComplete: () => { this.baker.armLock = false; } });
    Snd.play("thud");
  }

  pull(o) {
    if (!this.running || !o.active) return;
    o.active = false;
    const [a, b] = BAKE.good;
    if (o.p >= a && o.p <= b) {
      this.good++; this.combo++;
      const perfect = o.p > 0.68 && o.p < 0.82;
      Snd.play("pop");
      this.floatText(o.x, o.my - 120, perfect ? "Perfect!" : "Good", perfect ? "#ffe28a" : "#f1e3c2");
      const n = this.basketPile.length;
      this.tweens.add({
        targets: o.loaf, x: 200 + (n % 4 - 1.5) * 34, y: 870 - Math.floor(n / 4) * 14, scale: 0.42, duration: 420, ease: "Cubic.easeOut",
        onComplete: () => {
          const im = this.add.image(o.loaf.x, o.loaf.y, "loaf").setScale(0.42).setDepth(961 + n).setTint(o.loaf.tintTopLeft);
          this.basketPile.push(im);
          o.loaf.setVisible(false).setPosition(o.x, o.my + 4);
        }
      });
    } else {
      this.ruin(o, o.p < a ? "Raw dough" : "Too dark");
    }
    this.updateScore();
    if (this.good >= BAKE.goal) { this.running = false; this.time.delayedCall(600, () => this.win()); return; }
    this.time.delayedCall(lerp(1300, 600, this.good / BAKE.goal), () => this.loadOven(o));
  }

  ruin(o, why) {
    this.ruined++; this.combo = 0;
    Snd.play(why === "Burnt!" ? "burn" : "nope");
    this.floatText(o.x, o.my - 120, why, "#ff9a7a");
    this.cameras.main.shake(120, 0.004);
    const puff = this.add.image(o.x, o.my - 30, "fx-puff").setTint(0x3a3a3a).setAlpha(0.7).setDepth(o.y + 6).setScale(0.6);
    this.tweens.add({ targets: puff, y: puff.y - 140, scale: 1.6, alpha: 0, duration: 900, onComplete: () => puff.destroy() });
    this.tweens.add({ targets: o.loaf, alpha: 0, y: o.my + 40, duration: 400, onComplete: () => { o.loaf.setVisible(false).setAlpha(1).setPosition(o.x, o.my + 4); } });
    this.updateScore();
    if (this.ruined >= BAKE.maxRuined) {
      this.running = false;
      Snd.play("fail");
      this.time.delayedCall(700, () => this.dbox.show([{ speaker: "Baker", text: "Too many lost. Scrape the ovens - we start the batch again." }], () => this.restartWith({ fails: this.fails + 1 })));
    }
  }

  floatText(x, y, s, color) {
    const t = UI.title(this, x, y, s, { size: 44, color, stroke: "#2a1608", strokeW: 7 }).setDepth(8000);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
  }

  updateScore() {
    this.scoreTxt.textObj.setText("Good loaves  " + this.good + " / " + BAKE.goal + "      Ruined  " + this.ruined + " / " + BAKE.maxRuined);
  }

  tick(time, d) {
    if (!this.ovens) return;
    const k = this.keys;
    if (Phaser.Input.Keyboard.JustDown(k.one)) this.pull(this.ovens[0]);
    if (Phaser.Input.Keyboard.JustDown(k.two)) this.pull(this.ovens[1]);
    if (Phaser.Input.Keyboard.JustDown(k.three)) this.pull(this.ovens[2]);
    const [a, b] = BAKE.good;
    this.ovens.forEach(o => {
      const g = o.ring;
      g.clear();
      if (!o.active) return;
      if (this.running) o.p += o.rate * d / 1000;
      // loaf colour: dough -> gold -> charcoal
      const col = o.p < a ? mixC(0xf6ecd8, 0xffd27a, o.p / a) : (o.p < b ? mixC(0xffd27a, 0xe0a050, (o.p - a) / (b - a)) : mixC(0xa06030, 0x2a1a14, clamp((o.p - b) / (1 - b), 0, 1)));
      o.loaf.setTint(col);
      const R = 112, start = -Math.PI / 2;
      g.lineStyle(16, 0x1a1008, 0.75); g.beginPath(); g.arc(o.x, o.my, R, 0, Math.PI * 2); g.strokePath();
      g.lineStyle(16, 0xffc040, 0.95); g.beginPath(); g.arc(o.x, o.my, R, start + a * Math.PI * 2, start + b * Math.PI * 2); g.strokePath();
      const inBand = o.p >= a && o.p <= b;
      g.lineStyle(8, inBand ? 0xffffff : (o.p > b ? 0xff5a3a : 0xf6ecd8), 1);
      g.beginPath(); g.arc(o.x, o.my, R, start, start + Math.min(1, o.p) * Math.PI * 2); g.strokePath();
      const ang = start + Math.min(1, o.p) * Math.PI * 2;
      g.fillStyle(0xffffff, 1); g.fillCircle(o.x + Math.cos(ang) * R, o.my + Math.sin(ang) * R, 12);
      o.label.setColor(inBand ? "#ffffff" : "#f8e3a6").setScale(inBand ? 1.25 : 1);
      if (o.p >= 1 && this.running) { o.active = false; this.ruin(o, "Burnt!"); this.time.delayedCall(1100, () => this.loadOven(o)); }
    });
  }

  win() {
    Snd.play("success");
    GameFlow.setSub(2);
    this.dbox.show([{ speaker: "Baker", text: "...Good. Good bread. Come - help me carry it." }], () => this.riverCutscene());
  }

  riverCutscene() {
    this.leave(() => {
      this.ovens = null;
      this.children.removeAll(true);
      this.leaving = false;
      this.cameras.main.fadeIn(600, 8, 6, 16);
      Snd.ambience("night");
      this.add.image(0, 0, Tex.make(this, "river_bg", W, H, (ctx) => {
        paintSky(ctx, W, 600, [[0, 0x0a0c24], [1, 0x2a3060]]);
        paintStars(ctx, W, 500, 200, "riverstars", 1); paintMoon(ctx, 1400, 200, 60);
        paintSkyline(ctx, W, 600, { seed: "riverc", color: 0x141838, color2: 0x1a1e40, minH: 60, maxH: 200, lights: 0.8 });
        ctx.fillStyle = gradV(ctx, 600, 820, [[0, 0x1a2a50], [1, 0x2a4a70]]); ctx.fillRect(0, 600, W, 220);
        for (let i = 0; i < 40; i++) { strokeC(ctx, 0xb0c8ff, 2, 0.25); const y = 620 + Math.random() * 190, x = Math.random() * W; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + Math.random() * 80, y); ctx.stroke(); }
        glowDot(ctx, 1400, 700, 160, 0xd8e0ff, 0.25);
        paintEarth(ctx, 0, 800, W, H - 800, 0x3a3a3a, "riverbank", { pebbles: 80 });
      })).setOrigin(0).setDepth(-10);
      const baker = makePerson(this, 760, 900, STORY.cast["Baker"]).setDepth(900).setPerspective(1.1).tint(0xb0b8e0);
      const hero = makePerson(this, 560, 940, HERO).setDepth(940).setPerspective(1.12).tint(0xb0b8e0);
      const bk = Tex.make(this, "breadbasket", 200, 130, (c) => {
        for (let i = 0; i < 4; i++) paintLoaf(c, 50 + i * 34, 40 + (i % 2) * 8, 24, 0.6);
        c.beginPath(); c.moveTo(14, 50); c.lineTo(186, 50); c.lineTo(166, 120); c.lineTo(34, 120); c.closePath();
        c.fillStyle = gradV(c, 50, 120, [[0, 0xc79a5c], [1, 0x7a5432]]); c.fill(); strokeC(c, 0x3a2414, 2.4); c.stroke();
      });
      const basket = this.add.image(860, 840, bk).setDepth(950).setTint(0xd0d4f0);
      addVignette(this, 0.9);
      this.time.delayedCall(800, () => {
        this.tweens.add({ targets: basket, x: 1000, y: 760, duration: 900, ease: "Sine.easeInOut", onComplete: () => {
          Snd.play("plop");
          this.tweens.add({ targets: basket, x: W + 200, duration: 9000 });
          this.tweens.add({ targets: basket, y: 772, angle: 4, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          this.dbox = new DialogueBox(this);
          this.dbox.actors = { "Baker": baker, "You": hero };
          this.time.delayedCall(1200, () => this.dbox.show(STORY.bakery.outro, () => this.advance()));
        } });
      });
    }, 600);
  }
}

// ============================================================ SADDLER

// Parts in assembly order. x, y = where they sit on the stand (relative
// to its centre). needs = what must already be in place underneath.
const SADDLE_PARTS = [
  { key: "blanket", name: "felt blanket", x: 0, y: 40, needs: [] },
  { key: "tree", name: "wooden tree", x: 0, y: -6, needs: ["blanket"] },
  { key: "flapL", name: "left flap", x: -150, y: 70, needs: ["tree"] },
  { key: "flapR", name: "right flap", x: 150, y: 70, needs: ["tree"] },
  { key: "seat", name: "leather seat", x: 0, y: -30, needs: ["tree"] },
  { key: "pommel", name: "pommel", x: -150, y: -76, needs: ["seat"] },
  { key: "cantle", name: "cantle", x: 150, y: -80, needs: ["seat"] },
  { key: "girth", name: "girth strap", x: 0, y: 150, needs: ["tree"] },
  { key: "stirrupL", name: "left stirrup", x: -150, y: 240, needs: ["flapL"] },
  { key: "stirrupR", name: "right stirrup", x: 150, y: 240, needs: ["flapR"] }
];
const SADDLE_TIME = 100;

function paintSaddlePart(ctx, key, cx, cy) {
  ctx.save(); ctx.translate(cx, cy);
  const leather = (x0, y0, x1, y1, c) => gradV(ctx, y0, y1, [[0, lighten(c, 0.22)], [1, darken(c, 0.2)]]);
  const stitch = () => { strokeC(ctx, PAL.goldLight, 2, 0.7); ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]); };
  if (key === "blanket") {
    pRR(ctx, -230, -60, 460, 120, 20); ctx.fillStyle = patS(ctx, tileIkat([0x8e2f2f, PAL.gold, 0x1c4e80, PAL.cream], "sb"), 0.8); ctx.fill();
    strokeC(ctx, 0x3a1010, 3); ctx.stroke();
    strokeC(ctx, PAL.gold, 4); ctx.beginPath(); ctx.moveTo(-214, 46); ctx.lineTo(214, 46); ctx.stroke();
  } else if (key === "tree") {
    ctx.beginPath(); ctx.moveTo(-200, 30); ctx.quadraticCurveTo(-180, -60, -140, -70); ctx.quadraticCurveTo(0, -10, 140, -74); ctx.quadraticCurveTo(184, -60, 200, 30);
    ctx.lineTo(170, 30); ctx.quadraticCurveTo(150, -30, 130, -40); ctx.quadraticCurveTo(0, 20, -130, -36); ctx.quadraticCurveTo(-150, -30, -170, 30); ctx.closePath();
    ctx.fillStyle = gradV(ctx, -74, 30, [[0, 0xd8b07a], [1, 0x8a6238]]); ctx.fill(); strokeC(ctx, 0x3a2414, 3); ctx.stroke();
  } else if (key === "seat") {
    ctx.beginPath(); ctx.moveTo(-150, -10); ctx.quadraticCurveTo(0, 50, 150, -14); ctx.quadraticCurveTo(160, 30, 130, 40); ctx.quadraticCurveTo(0, 70, -130, 40); ctx.quadraticCurveTo(-160, 30, -150, -10); ctx.closePath();
    ctx.fillStyle = leather(0, -10, 0, 60, 0x7a3e1e); ctx.fill(); strokeC(ctx, 0x2a1008, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-120, 4); ctx.quadraticCurveTo(0, 54, 120, 0); stitch();
  } else if (key === "pommel" || key === "cantle") {
    const s = key === "pommel" ? 1 : -1, hgt = key === "pommel" ? 90 : 110;
    ctx.beginPath(); ctx.moveTo(-50, 40); ctx.quadraticCurveTo(-56 * s - 10, -hgt * 0.6, 0, -hgt * 0.6); ctx.quadraticCurveTo(56 * s - 10, -hgt * 0.5, 50, 40); ctx.closePath();
    ctx.fillStyle = leather(0, -hgt, 0, 40, 0x6a3418); ctx.fill(); strokeC(ctx, 0x2a1008, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -hgt * 0.2, 16, 0, 6.2832); ctx.fillStyle = gradR(ctx, -4, -hgt * 0.2 - 4, 2, 18, [[0, 0xfff1b8], [1, PAL.goldDark]]); ctx.fill(); strokeC(ctx, 0x5a3a08, 2); ctx.stroke();
  } else if (key === "flapL" || key === "flapR") {
    const s = key === "flapL" ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(-60 * s, -60); ctx.lineTo(60 * s, -60); ctx.quadraticCurveTo(70 * s, 40, 40 * s, 80); ctx.lineTo(-50 * s, 80); ctx.quadraticCurveTo(-70 * s, 20, -60 * s, -60); ctx.closePath();
    ctx.fillStyle = leather(0, -60, 0, 80, 0x8a4a22); ctx.fill(); strokeC(ctx, 0x2a1008, 3); ctx.stroke();
    pRR(ctx, -44, -44, 88, 110, 12); stitch();
    ctx.beginPath(); ctx.arc(0, 10, 14, 0, 6.2832); strokeC(ctx, PAL.gold, 3); ctx.stroke();
  } else if (key === "girth") {
    pRR(ctx, -170, -16, 340, 32, 14); ctx.fillStyle = leather(0, -16, 0, 16, 0x4a2a14); ctx.fill(); strokeC(ctx, 0x1a0a04, 3); ctx.stroke();
    [-150, 150].forEach(x => { pRR(ctx, x - 16, -22, 32, 44, 6); strokeC(ctx, 0xc0c8d0, 5); ctx.stroke(); });
  } else if (key === "stirrupL" || key === "stirrupR") {
    strokeC(ctx, 0x4a2a14, 12); ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, -20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-36, 40); ctx.quadraticCurveTo(-40, -30, 0, -30); ctx.quadraticCurveTo(40, -30, 36, 40); ctx.closePath();
    strokeC(ctx, 0x3a3a40, 14); ctx.stroke(); strokeC(ctx, 0xc8d0d8, 8); ctx.stroke();
    pRR(ctx, -44, 30, 88, 18, 6); fillC(ctx, 0xa0a8b0); ctx.fill(); strokeC(ctx, 0x2a2a30, 2.4); ctx.stroke();
  }
  ctx.restore();
}

class SaddlerGameScene extends BaseScene {
  constructor() { super("SaddlerGameScene"); }
  init(data) { this.fails = data.fails || 0; }
  skipLabel() { return this.fails >= 2 ? "Skip the saddle" : null; }
  skipChallenge() { this.running = false; this.win(); }

  create() {
    this.begin({ music: "bazaar", amb: null });
    addBackdrop(this, "saddle_bg", (ctx) => {
      ctx.fillStyle = gradV(ctx, 0, 760, [[0, 0x4a3020], [1, 0x7a5432]]); ctx.fillRect(0, 0, W, 760);
      strokeC(ctx, 0x2a1a0e, 3, 0.6); for (let x = 0; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 760); ctx.stroke(); }
      // window with daylight
      pArch(ctx, 1600, 520, 300, 400, 0.6); ctx.fillStyle = gradV(ctx, 120, 520, [[0, 0x9ad0f0], [1, 0xf0e0b0]]); ctx.fill(); strokeC(ctx, 0x2a1a0e, 8); ctx.stroke();
      // tools and hides on the wall
      [[220, 200], [360, 180], [470, 230]].forEach((p, i) => {
        strokeC(ctx, 0x2a1a0e, 3); ctx.beginPath(); ctx.moveTo(p[0], 120); ctx.lineTo(p[0], p[1]); ctx.stroke();
        if (i === 1) { pRR(ctx, p[0] - 60, p[1], 120, 160, 30); ctx.fillStyle = gradV(ctx, p[1], p[1] + 160, [[0, 0xb07a4a], [1, 0x7a4a26]]); ctx.fill(); }
        else { strokeC(ctx, 0x8a8a90, 6); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] + 90); ctx.stroke(); }
      });
      ctx.fillStyle = gradV(ctx, 760, H, [[0, 0x6a4a30], [1, 0x3a2414]]); ctx.fillRect(0, 760, W, H - 760);
      fillC(ctx, 0x2a1a0e); ctx.fillRect(0, 756, W, 8);
      // the stand: a wooden trestle horse
      ctx.save(); ctx.translate(960, 470);
      strokeC(ctx, 0x2a1a0e, 26); ctx.lineCap = "round";
      [[-180, 260], [180, 260]].forEach(p => { ctx.beginPath(); ctx.moveTo(p[0] * 0.6, 60); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
      strokeC(ctx, 0x8a6238, 16);
      [[-180, 260], [180, 260]].forEach(p => { ctx.beginPath(); ctx.moveTo(p[0] * 0.6, 60); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
      pRR(ctx, -260, 30, 520, 60, 28); ctx.fillStyle = gradV(ctx, 30, 90, [[0, 0xb08a5a], [1, 0x6a4a28]]); ctx.fill(); strokeC(ctx, 0x2a1a0e, 3); ctx.stroke();
      ctx.restore();
      grain(ctx, 0, 0, W, H, 0.05);
    });
    const glow = addGlow(this, 1600, 320, 700, 0xfff0c0, 0.35).setDepth(1); void glow;
    this.saddler = makePerson(this, 1490, 750, Object.assign({ facing: -1 }, STORY.cast["Saddler"])).setDepth(750).setPerspective(1.05);
    this.dbox = new DialogueBox(this);
    this.dbox.actors["Saddler"] = this.saddler;

    this.cx = 960; this.cy = 470;
    this.placed = {};
    this.timeLeft = SADDLE_TIME * 1000;
    this.running = false;

    // piece textures
    SADDLE_PARTS.forEach(p => {
      Tex.make(this, "sp_" + p.key, 520, 220, ctx => paintSaddlePart(ctx, p.key, 260, 110));
      Tex.make(this, "spg_" + p.key, 520, 220, (ctx) => {
        paintSaddlePart(ctx, p.key, 260, 110);
        ctx.globalCompositeOperation = "source-in"; fillC(ctx, 0xffffff); ctx.fillRect(0, 0, 520, 220);
      });
    });
    // ghosts on the stand
    this.ghosts = {};
    SADDLE_PARTS.forEach((p, i) => {
      const gimg = this.add.image(this.cx + p.x, this.cy + p.y, "spg_" + p.key).setAlpha(0.1).setDepth(100 + i);
      this.ghosts[p.key] = gimg;
    });
    // tray (shuffled)
    const order = Phaser.Utils.Array.Shuffle(SADDLE_PARTS.slice());
    const card = Tex.make(this, "sad_card", 330, 136, (ctx) => {
      pRR(ctx, 6, 6, 318, 124, 16); fillC(ctx, 0x1a1008, 0.55); ctx.fill(); strokeC(ctx, PAL.gold, 2, 0.6); ctx.stroke();
    });
    this.pieces = order.map((p, i) => {
      const col = i % 5, row = Math.floor(i / 5);
      const hx = 290 + col * 335, hy = 852 + row * 142;
      this.add.image(hx, hy + 4, card).setDepth(400);
      UI.text(this, hx, hy + 52, p.name, { size: 22, color: "#e8d8b8", shadow: false }).setDepth(401);
      const img = this.add.image(hx, hy - 6, "sp_" + p.key).setScale(0.52).setDepth(500).setInteractive({ useHandCursor: true, draggable: true });
      img.part = p; img.home = { x: hx, y: hy - 6 };
      return img;
    });
    this.refreshGhosts();
    this.input.on("dragstart", (ptr, obj) => {
      if (!this.running || !obj.part) return;
      Snd.play("pick");
      this.tweens.killTweensOf(obj);
      obj.setDepth(2000); this.tweens.add({ targets: obj, scale: 1, duration: 140 });
      this.ghosts[obj.part.key].setAlpha(this.ready(obj.part) ? 0.55 : 0.2);
    });
    this.input.on("drag", (ptr, obj, x, y) => { if (this.running && obj.part) obj.setPosition(x, y); });
    this.input.on("dragend", (ptr, obj) => { if (obj.part) this.drop(obj); });

    this.timerTxt = UI.pill(this, W / 2, 140, "", { minW: 240, size: 40, h: 76, padX: 90, gold: true, color: "#f8e3a6", font: FONT_T });
    this.timerTxt.textObj.setText("1:40");
    this.countTxt = UI.text(this, W / 2, 205, "0 / " + SADDLE_PARTS.length + " pieces", { size: 30, color: "#f1e3c2" }).setDepth(8900);
    addVignette(this, 0.55);
    challengeIntro(this, "Build the Saddle", [
      "Drag each piece onto its place on the stand.",
      "Saddles are built in layers - a piece only fits",
      "once the piece beneath it is in place.",
      "Wrong place: lose 4 seconds. You have " + SADDLE_TIME + " seconds."
    ], () => { this.running = true; });
  }

  ready(p) { return p.needs.every(n => this.placed[n]); }
  refreshGhosts() { SADDLE_PARTS.forEach(q => { if (!this.placed[q.key]) this.ghosts[q.key].setAlpha(this.ready(q) ? 0.24 : 0.07); }); }

  drop(obj) {
    const p = obj.part;
    this.tweens.killTweensOf(obj);
    const back = () => { this.tweens.add({ targets: obj, x: obj.home.x, y: obj.home.y, scale: 0.52, duration: 220, ease: "Cubic.easeOut", onComplete: () => obj.setDepth(500) }); };
    this.refreshGhosts();
    if (!this.running) { back(); return; }
    const tx = this.cx + p.x, ty = this.cy + p.y;
    if (Math.hypot(obj.x - tx, obj.y - ty) < 110) {
      if (!this.ready(p)) {
        const missing = SADDLE_PARTS.find(q => p.needs.includes(q.key) && !this.placed[q.key]);
        Snd.play("nope"); back();
        this.say("The " + p.name + " sits on the " + missing.name + ". Put that on first.");
        return;
      }
      this.placed[p.key] = true;
      obj.disableInteractive();
      const depth = 100 + SADDLE_PARTS.indexOf(p);
      this.tweens.add({ targets: obj, x: tx, y: ty, scale: 1, duration: 160, ease: "Back.easeOut", onComplete: () => obj.setDepth(depth + 20) });
      this.ghosts[p.key].setAlpha(0);
      this.refreshGhosts();
      Snd.play("snap");
      const sp = this.add.particles(tx, ty, "fx-spark", { speed: { min: 60, max: 220 }, scale: { start: 0.4, end: 0 }, lifespan: 500, tint: [0xffe9a8], blendMode: "ADD", emitting: false }).setDepth(3000);
      sp.explode(14);
      const n = Object.keys(this.placed).length;
      this.countTxt.setText(n + " / " + SADDLE_PARTS.length + " pieces");
      if (n === SADDLE_PARTS.length) { this.running = false; this.time.delayedCall(500, () => this.win()); }
      return;
    }
    // dropped on some other piece's place?
    const other = SADDLE_PARTS.find(q => q !== p && !this.placed[q.key] && Math.hypot(obj.x - (this.cx + q.x), obj.y - (this.cy + q.y)) < 90);
    if (other) {
      this.timeLeft -= 4000;
      Snd.play("nope"); this.cameras.main.shake(100, 0.004);
      this.say("No - that's where the " + other.name + " goes.");
    }
    back();
  }

  say(text) {
    if (this.bubble) this.bubble.destroy();
    this.bubble = UI.pill(this, 1450, 520, text, { size: 28, h: 64, gold: true, color: "#f1e3c2", depth: 8950 });
    this.bubble.setScrollFactor(1);
    this.saddler.talking = true;
    this.time.delayedCall(1300, () => { this.saddler.talking = false; });
    const b = this.bubble;
    this.tweens.add({ targets: b, alpha: 0, duration: 400, delay: 2400, onComplete: () => b.destroy() });
    if (this.bubble.x + this.bubble.getBounds().width / 2 > W - 20) this.bubble.x = W - 20 - this.bubble.getBounds().width / 2;
  }

  tick(time, d) {
    if (!this.running) return;
    this.timeLeft -= d;
    const s = Math.max(0, Math.ceil(this.timeLeft / 1000));
    this.timerTxt.textObj.setText(Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0")).setColor(s <= 15 ? "#ff8a6a" : "#f8e3a6");
    if (this.timeLeft <= 0) {
      this.running = false;
      Snd.play("fail");
      this.dbox.show([{ speaker: "Saddler", text: "The light's going. Take it all apart - we'll start again." }], () => this.restartWith({ fails: this.fails + 1 }));
    }
  }

  win() {
    Snd.play("success");
    const g = addGlow(this, this.cx, this.cy, 300, 0xffe2a0, 0.8).setDepth(3000);
    this.tweens.add({ targets: g, displayWidth: 1400, displayHeight: 1400, alpha: 0, duration: 1200 });
    this.time.delayedCall(900, () => this.dbox.show(STORY.saddler.outro, () => this.advance()));
  }
}

// ============================================================ KITCHEN

const INGREDIENTS = ["rice", "carrot", "onion", "lamb", "garlic", "chickpeas", "raisins", "quince", "tomato", "pepper", "dough", "herbs"];
const DISHES = [
  { name: "Plov", items: ["rice", "carrot", "lamb", "garlic"] },
  { name: "Shurpa", items: ["lamb", "carrot", "tomato"] },
  { name: "Lagman", items: ["dough", "pepper", "tomato"] },
  { name: "Samsa", items: ["dough", "lamb", "onion"] },
  { name: "Dimlama", items: ["quince", "onion", "pepper"] },
  { name: "Wedding Plov", items: ["rice", "chickpeas", "raisins"] },
  { name: "Manti", items: ["dough", "onion", "herbs"] },
  { name: "Achichuk", items: ["tomato", "onion", "herbs"] }
];

function paintIngredient(ctx, key, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const blob = (x, y, rx, ry, c, rot) => { pEll(ctx, x, y, rx, ry, rot); ctx.fillStyle = gradR(ctx, x - rx * 0.3, y - ry * 0.4, 1, Math.max(rx, ry) * 1.2, [[0, lighten(c, 0.35)], [1, c]]); ctx.fill(); strokeC(ctx, OL(c), 2); ctx.stroke(); };
  const r = rng("ing" + key);
  if (key === "rice") { for (let i = 0; i < 26; i++) blob(r.range(-26, 26), r.range(-14, 18), 6, 3, 0xf6f0e0, r.range(0, 3)); }
  else if (key === "carrot") { [-14, 4, 20].forEach((x, i) => { ctx.save(); ctx.translate(x, 0); ctx.rotate(0.3 - i * 0.2); ctx.beginPath(); ctx.moveTo(-9, -24); ctx.lineTo(9, -24); ctx.lineTo(0, 30); ctx.closePath(); ctx.fillStyle = gradH(ctx, -9, 9, [[0, 0xffa050], [1, 0xd9622a]]); ctx.fill(); strokeC(ctx, 0x7a3010, 2); ctx.stroke(); fillC(ctx, 0x5a9a3a); ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(0, -40); ctx.lineTo(6, -24); ctx.fill(); ctx.restore(); }); }
  else if (key === "onion") { blob(-12, 6, 20, 20, 0xc86a8a); blob(14, 8, 18, 18, 0xe0b080); strokeC(ctx, 0x6a3a2a, 2); ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(-12, -24); ctx.stroke(); }
  else if (key === "lamb") { blob(0, 4, 32, 22, 0xb2383a); blob(-6, 0, 18, 10, 0xf2d8c8); blob(12, 10, 8, 5, 0xf2d8c8); }
  else if (key === "garlic") { blob(0, 6, 26, 24, 0xf6f0e4); strokeC(ctx, 0xc8bca8, 2); [-10, 0, 10].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -14); ctx.quadraticCurveTo(x * 1.6, 8, x, 28); ctx.stroke(); }); fillC(ctx, 0xc8bca8); ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(0, -32); ctx.lineTo(4, -18); ctx.fill(); }
  else if (key === "chickpeas") { for (let i = 0; i < 12; i++) blob(r.range(-24, 24), r.range(-12, 18), 9, 8, 0xe8c888); }
  else if (key === "raisins") { for (let i = 0; i < 14; i++) blob(r.range(-24, 24), r.range(-12, 18), 7, 5, r.chance(0.5) ? 0x6a2a3a : 0xc8902a, r.range(0, 3)); }
  else if (key === "quince") { blob(0, 6, 28, 26, 0xf0d040); fillC(ctx, 0x6a4a20); ctx.fillRect(-2, -26, 4, 10); fillC(ctx, 0x5a9a3a); pEll(ctx, 10, -22, 10, 5, -0.4); ctx.fill(); }
  else if (key === "tomato") { blob(-10, 6, 20, 18, 0xd8302a); blob(14, 10, 16, 14, 0xe8402a); fillC(ctx, 0x4a8a2a); pStar(ctx, -10, -10, 5, 9, 3, 0); ctx.fill(); }
  else if (key === "pepper") { [-12, 12].forEach((x, i) => { ctx.save(); ctx.translate(x, 0); ctx.rotate(i ? 0.4 : -0.3); ctx.beginPath(); ctx.moveTo(-8, -20); ctx.quadraticCurveTo(12, -20, 6, 10); ctx.quadraticCurveTo(0, 28, -4, 32); ctx.quadraticCurveTo(-12, 10, -8, -20); ctx.closePath(); fillC(ctx, i ? 0xd82a2a : 0x4a9a2a); ctx.fill(); strokeC(ctx, 0x2a1008, 2); ctx.stroke(); ctx.restore(); }); }
  else if (key === "dough") { blob(0, 6, 32, 22, 0xf2e2c4); blob(-8, 0, 12, 6, 0xfff6e4); }
  else if (key === "herbs") { for (let i = 0; i < 9; i++) { ctx.save(); ctx.rotate(r.range(-0.8, 0.8)); fillC(ctx, r.chance(0.5) ? 0x3a8a3a : 0x5aaa4a); pEll(ctx, r.range(-8, 8), r.range(-20, 6), 7, 16); ctx.fill(); ctx.restore(); } strokeC(ctx, 0x2a5a2a, 3); ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, 0); ctx.stroke(); }
  ctx.restore();
}

class KitchenGameScene extends BaseScene {
  constructor() { super("KitchenGameScene"); }
  init(data) { this.fails = data.fails || 0; this.sub = data.sub || 0; }
  skipLabel() { return this.fails >= 2 ? "Skip the cooking" : null; }
  skipChallenge() { this.running = false; this.win(); }

  create() {
    this.begin({ music: "cozy", amb: "fire" });
    addBackdrop(this, "kitchen_bg", (ctx) => {
      ctx.fillStyle = patS(ctx, tileStars(0x1c4e80, 0xf2ecdc, 0x2fb8ac, 64), 1); ctx.fillRect(0, 0, W, 640);
      ctx.fillStyle = gradV(ctx, 0, 640, [[0, 0x000000, 0.55], [1, 0x000000, 0.25]]); ctx.fillRect(0, 0, W, 640);
      // the hearth arch behind the kazan
      pArch(ctx, 960, 640, 640, 520, 0.6); ctx.fillStyle = gradV(ctx, 120, 640, [[0, 0x2a1a14], [1, 0x5a2a14]]); ctx.fill(); strokeC(ctx, PAL.gold, 6); ctx.stroke();
      glowDot(ctx, 960, 560, 300, 0xff8a30, 0.4);
      // shelves of jars
      [[260, 260], [1660, 260]].forEach(p => {
        fillC(ctx, 0x5a3a20); ctx.fillRect(p[0] - 180, p[1], 360, 16); ctx.fillRect(p[0] - 180, p[1] + 170, 360, 16);
        paintPots(ctx, p[0], p[1], "kp" + p[0], { n: 4 }); paintPots(ctx, p[0], p[1] + 170, "kq" + p[0], { n: 4 });
      });
      ctx.fillStyle = gradV(ctx, 640, H, [[0, 0x6a4a34], [1, 0x3a2418]]); ctx.fillRect(0, 640, W, H - 640);
      // the counter
      pRR(ctx, 60, 780, W - 120, 280, 18); ctx.fillStyle = gradV(ctx, 780, 1060, [[0, 0xa8784a], [1, 0x5a3a20]]); ctx.fill(); strokeC(ctx, 0x2a160a, 4); ctx.stroke();
      grain(ctx, 0, 0, W, H, 0.05);
    });
    // kazan on the fire
    addProp(this, 960, 690, 520, 300, (c) => {
      c.beginPath(); c.moveTo(-200, -150); c.lineTo(200, -150); c.quadraticCurveTo(210, 0, 0, 10); c.quadraticCurveTo(-210, 0, -200, -150); c.closePath();
      c.fillStyle = gradH(c, -200, 200, [[0, 0x6a6a72], [0.4, 0x3a3a42], [1, 0x14141a]]); c.fill(); strokeC(c, 0x0a0a0c, 3); c.stroke();
      pEll(c, 0, -150, 200, 34); fillC(c, 0x2a2a30); c.fill(); c.stroke();
      pEll(c, 0, -146, 180, 26); c.fillStyle = gradR(c, 0, -146, 10, 180, [[0, 0xe8a050], [1, 0xa8582a]]); c.fill();
    });
    this.kazanSteam = this.add.particles(960, 540, "fx-puff", { x: { min: -140, max: 140 }, speedY: { min: -80, max: -40 }, scale: { start: 0.4, end: 1.2 }, alpha: { start: 0.25, end: 0 }, lifespan: 2400, frequency: 220 }).setDepth(700);
    const fire = addGlow(this, 960, 700, 500, 0xff7a20, 0.5).setDepth(10);
    this.tweens.add({ targets: fire, alpha: 0.35, duration: 130, yoyo: true, repeat: -1 });
    this.cook = makePerson(this, 1560, 760, Object.assign({ facing: -1 }, STORY.cast["Head Cook"])).setDepth(760).setPerspective(1.0);
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "Head Cook": this.cook };

    // bowls on the counter (shuffled each attempt)
    INGREDIENTS.forEach(k => Tex.make(this, "ing_" + k, 140, 120, (ctx) => {
      pEll(ctx, 70, 84, 62, 26); ctx.fillStyle = gradV(ctx, 60, 110, [[0, 0xe8e0d0], [1, 0x8a8478]]); ctx.fill(); strokeC(ctx, 0x2a2a2a, 2.4); ctx.stroke();
      pEll(ctx, 70, 76, 54, 16); fillC(ctx, 0x3a3430); ctx.fill();
      paintIngredient(ctx, k, 70, 56, 1);
    }));
    const order = Phaser.Utils.Array.Shuffle(INGREDIENTS.slice());
    this.bowls = {};
    order.forEach((k, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      const x = 300 + col * 264, y = 850 + row * 132;
      const img = this.add.image(x, y, "ing_" + k).setDepth(900 + row).setInteractive({ useHandCursor: true });
      const lbl = UI.text(this, x, y + 50, k, { size: 26, color: "#fff4dc", stroke: "#2a160a", strokeW: 6, shadow: false }).setDepth(950);
      img.on("pointerover", () => img.setScale(1.08)); img.on("pointerout", () => img.setScale(1));
      img.on("pointerdown", () => this.pick(k, img));
      this.bowls[k] = { img, lbl };
    });

    // the ticket
    this.ticket = this.add.container(560, 330).setDepth(8000);
    const tk = Tex.make(this, "ticket", 600, 380, (ctx) => {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      pRR(ctx, 20, 20, 560, 340, 10); ctx.fillStyle = gradV(ctx, 20, 360, [[0, 0xf6ead0], [1, 0xdcc8a0]]); ctx.fill(); ctx.restore();
      strokeC(ctx, 0x8a6a3a, 2); pRR(ctx, 34, 34, 532, 312, 6); ctx.stroke();
      grain(ctx, 0, 0, 600, 380, 0.08);
    });
    this.ticket.add(this.add.image(0, 0, tk));
    this.dishTxt = UI.title(this, 0, -120, "", { size: 52, color: "#4a2a10", shadow: false });
    this.ticket.add(this.dishTxt);
    this.ticketIcons = [];
    this.timeBarBg = this.add.rectangle(0, 140, 480, 22, 0x3a2a1a, 0.4); this.timeBar = this.add.rectangle(-240, 140, 480, 22, 0xd9a441).setOrigin(0, 0.5);
    this.ticket.add([this.timeBarBg, this.timeBar]);
    this.ticket.setVisible(false);

    this.served = 0; this.missed = 0; this.round = 0; this.total = 8; this.need = 6; this.running = false;
    this.scoreTxt = UI.pill(this, 1460, 140, "", { minW: 480, size: 34, h: 70, padX: 70, gold: true, color: "#f8e3a6", font: FONT_T });
    this.updateScore();
    addVignette(this, 0.5);

    const start = () => challengeIntro(this, "The King's Dinner", [
      "Each ticket names a dish and what goes in it.",
      "Click those ingredients - in any order - before the time runs out.",
      "A wrong ingredient costs time.",
      "Serve " + this.need + " of " + this.total + " dishes."
    ], () => { this.running = true; this.nextOrder(); });
    if (this.sub === 0 && !this.fails) this.time.delayedCall(500, () => this.dbox.show(STORY.kitchen.intro, () => { GameFlow.setSub(1); start(); }));
    else start();
  }

  updateScore() { this.scoreTxt.textObj.setText("Served " + this.served + "    Spoiled " + this.missed); }

  nextOrder() {
    if (this.round >= this.total) { this.finish(); return; }
    const dish = DISHES[(this.round + (hashSeed("k" + this.fails) % 8)) % DISHES.length];
    this.round++;
    this.dish = dish; this.got = {};
    this.ticketIcons.forEach(o => o.destroy()); this.ticketIcons = [];
    this.dishTxt.setText(dish.name + "  (" + this.round + "/" + this.total + ")");
    const n = dish.items.length;
    dish.items.forEach((k, i) => {
      const x = (i - (n - 1) / 2) * 130;
      const img = this.add.image(x, 0, "ing_" + k).setScale(0.85);
      const lbl = UI.text(this, x, 66, k, { size: 24, color: "#4a2a10", shadow: false });
      const tickMark = UI.title(this, x + 40, -30, "✓", { size: 56, color: "#2a8a3a", shadow: false }).setVisible(false);
      img.k = k; img.tick = tickMark;
      this.ticket.add([img, lbl, tickMark]);
      this.ticketIcons.push(img, lbl, tickMark);
    });
    this.timeTotal = lerp(15000, 9500, this.round / this.total);
    this.timeLeft = this.timeTotal;
    this.ticket.setVisible(true).setScale(0.8).setAlpha(0);
    this.tweens.add({ targets: this.ticket, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" });
    Snd.play("paper");
  }

  pick(k, img) {
    if (!this.running || !this.dish) return;
    this.tweens.add({ targets: img, scale: 1.2, duration: 80, yoyo: true });
    if (this.dish.items.includes(k) && !this.got[k]) {
      this.got[k] = true;
      Snd.play("plop");
      const fly = this.add.image(img.x, img.y, "ing_" + k).setDepth(800);
      this.tweens.add({ targets: fly, x: 960, y: 520, scale: 0.4, duration: 380, ease: "Quad.easeIn", onComplete: () => { fly.destroy(); Snd.play("sizzle"); } });
      const t = this.ticketIcons.find(o => o.k === k); if (t) t.tick.setVisible(true);
      if (this.dish.items.every(i => this.got[i])) this.serve(true);
    } else if (this.got[k]) {
      Snd.play("nope");
    } else {
      this.timeLeft -= 2500;
      Snd.play("nope"); this.cameras.main.shake(100, 0.004);
      const puff = this.add.image(960, 520, "fx-puff").setTint(0x4a4a4a).setAlpha(0.7).setDepth(800);
      this.tweens.add({ targets: puff, y: 380, scale: 2, alpha: 0, duration: 800, onComplete: () => puff.destroy() });
      this.cook.talking = true; this.time.delayedCall(600, () => { this.cook.talking = false; });
      UI.toast(this, k + " doesn't go in " + this.dish.name + "!", { y: 640, hold: 900 });
    }
  }

  serve(ok) {
    const d = this.dish; this.dish = null;
    if (ok) { this.served++; Snd.play("success"); UI.toast(this, d.name + " served!", { y: 640, hold: 700 }); }
    else { this.missed++; Snd.play("fail"); UI.toast(this, "Too slow - the " + d.name + " is spoiled", { y: 640, hold: 900 }); }
    this.updateScore();
    this.tweens.add({ targets: this.ticket, alpha: 0, x: ok ? 1500 : 560, y: ok ? 330 : 500, duration: 300, onComplete: () => { this.ticket.setPosition(560, 330); this.time.delayedCall(350, () => this.nextOrder()); } });
    if (this.total - this.missed < this.need) { this.round = this.total; }
  }

  tick(time, d) {
    if (!this.running || !this.dish) return;
    this.timeLeft -= d;
    const f = clamp(this.timeLeft / this.timeTotal, 0, 1);
    this.timeBar.width = 480 * f;
    this.timeBar.fillColor = f < 0.3 ? 0xd8502a : 0xd9a441;
    if (this.timeLeft <= 0) this.serve(false);
  }

  finish() {
    this.running = false;
    this.ticket.setVisible(false);
    if (this.served >= this.need) this.win();
    else this.dbox.show([{ speaker: "Head Cook", text: "Half the King's table sent back? Again - from the first dish." }], () => this.restartWith({ fails: this.fails + 1, sub: 1 }));
  }

  win() {
    this.ticket.setVisible(false);
    this.dbox.show(STORY.kitchen.outro, () => this.advance());
  }
}
