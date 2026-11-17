// ============================================================
// SceneMiniGames.js — three hands-on challenges, and the river.
//
//   Bakery   Five tandir ovens. Slap a round of dough into an
//            empty one (click it or press 1-5), pull the loaf
//            while its ring is in the gold band. Ovens flare up
//            and bake twice as fast. 30 good loaves in 55 seconds
//            (perfect pulls buy a second), no more than 6 ruined.
//   River    The baker's weekly offering, set adrift at night.
//   Saddler  Build the saddle on its stand by dragging the pieces
//            into place - in the right order, because each piece
//            sits on top of another. 100 seconds.
//   Kitchen  Ten tickets; serve eight. Ingredients go in in order,
//            the bowls move after every dish, and the fire has to
//            be kept in the green with the bellows.
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

// Five tandirs. Click an empty one (or press its number) to slap a round of
// dough onto its wall; click it again to pull the loaf while its ring is in
// the gold band. Ovens sometimes flare up and bake twice as fast. The band
// narrows and the bread bakes quicker as the batch goes on.
const BAKE = { goal: 30, maxRuined: 6, time: 55, band0: [0.58, 0.88], band1: [0.65, 0.83], ovens: [330, 640, 950, 1260, 1570] };

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
      ctx.fillStyle = patS(ctx, tileBrick(0xb8886a, 0x8a5e44, 60, 26, "bakewall"), 1); ctx.fillRect(0, 380, W, 400);
      ctx.fillStyle = gradV(ctx, 380, 780, [[0, 0x000000, 0.25], [1, 0x000000, 0.05]]); ctx.fillRect(0, 380, W, 400);
      fillC(ctx, 0x6a4a34); ctx.fillRect(0, 366, W, 20);
      // shelves of cooling bread along the wall
      [[180, 470], [1740, 470]].forEach(p => {
        pRR(ctx, p[0] - 130, p[1], 260, 14, 4); fillC(ctx, 0x5a3a20); ctx.fill();
        for (let i = 0; i < 5; i++) paintLoaf(ctx, p[0] - 100 + i * 50, p[1] - 8, 22, 0.55);
        pRR(ctx, p[0] - 130, p[1] + 110, 260, 14, 4); fillC(ctx, 0x5a3a20); ctx.fill();
        for (let i = 0; i < 4; i++) paintLoaf(ctx, p[0] - 80 + i * 54, p[1] + 102, 22, 0.55);
      });
      for (let x = 420; x < W - 300; x += 340) { strokeC(ctx, 0x3a2414, 3); ctx.beginPath(); ctx.moveTo(x, 386); ctx.lineTo(x, 450); ctx.stroke(); glowDot(ctx, x, 470, 40, 0xffc060, 0.4); pRR(ctx, x - 10, 452, 20, 28, 4); fillC(ctx, 0xffd27a); ctx.fill(); }
      paintEarth(ctx, 0, 780, W, H - 780, 0x8a6a58, "bakeground", { pebbles: 60 });
      paintCobbles(ctx, 0, 780, W, H - 780, 0xa8887a, "bakecob", 0.4);
      grain(ctx, 0, 0, W, H, 0.04);
    });
    Tex.make(this, "loaf", 120, 80, ctx => paintLoaf(ctx, 60, 40, 52, 0.6, { seeds: true }), true);
    Tex.make(this, "dough", 120, 80, ctx => { pEll(ctx, 60, 42, 50, 30); ctx.fillStyle = gradR(ctx, 46, 30, 4, 56, [[0, 0xfffaf0], [1, 0xe8d8b8]]); ctx.fill(); strokeC(ctx, 0xb8a888, 2); ctx.stroke(); fillC(ctx, 0xc8b898, 0.8); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; ctx.beginPath(); ctx.arc(60 + Math.cos(a) * 14, 42 + Math.sin(a) * 9, 2, 0, 6.28); ctx.fill(); } }, true);
    this.ovens = BAKE.ovens.map((x, i) => this.makeOven(x, 860, i));
    this.baker = makePerson(this, 1790, 930, Object.assign({ facing: -1 }, STORY.cast["Baker"])).setDepth(930).setPerspective(1.12);
    addProp(this, 130, 1000, 260, 200, (c) => {
      softEllipse(c, 0, 2, 110, 20, 0x000000, 0.35);
      c.beginPath(); c.moveTo(-100, -70); c.lineTo(100, -70); c.lineTo(80, 0); c.lineTo(-80, 0); c.closePath();
      c.fillStyle = gradV(c, -70, 0, [[0, 0xc79a5c], [1, 0x7a5432]]); c.fill(); strokeC(c, 0x3a2414, 2.4); c.stroke();
      strokeC(c, 0x6b4a2e, 2, 0.7); for (let y = -60; y < 0; y += 12) { c.beginPath(); c.moveTo(-96 + (y + 70) * 0.25, y); c.lineTo(96 - (y + 70) * 0.25, y); c.stroke(); }
    });
    this.basketPile = [];
    ambientParticles(this, "embers", { area: { x: 250, y: 620, w: 1400, h: 200 } });
    addVignette(this, 0.6);

    this.good = 0; this.ruined = 0; this.running = false; this.timeLeft = BAKE.time * 1000; this.flareT = 5000;
    this.scoreTxt = UI.pill(this, W / 2, 140, "", { minW: 980, size: 34, h: 70, padX: 70, gold: true, color: "#f8e3a6", font: FONT_T });
    this.updateScore();
    this.dbox = new DialogueBox(this);
    this.dbox.actors["Baker"] = this.baker;
    challengeIntro(this, "Keep the Ovens Fed", [
      this.touchMode ? "Tap an empty oven to slap in a round of dough." : "Click an empty oven (or press 1-5) to slap in a round of dough.",
      "Pull each loaf while its ring is in the gold band - too soon is raw, too late is burnt.",
      "An oven that flares up bakes twice as fast. Watch it!",
      "Bake " + BAKE.goal + " good loaves in " + BAKE.time + " seconds. " + BAKE.maxRuined + " ruined and the batch starts over."
    ], () => { this.running = true; });
    UI.hint(this, this.touchMode ? "Tap an oven: once to load, again to pull" : "Click an oven or press 1-5: once to load, again to pull");
  }

  makeOven(x, y, i) {
    addProp(this, x, y, 300, 280, c => paintTandir(c, 0, 0, 1.0), { key: "bake_tandir" });
    const my = y - 32 - 8 - 46 + 4;                             // centre of the glowing mouth
    const glow = addGlow(this, x, my, 330, 0xff8a30, 0.32).setDepth(y + 1);
    const ring = this.add.graphics().setDepth(y + 3);
    const loaf = this.add.image(x, my + 4, "loaf").setDepth(y + 2).setVisible(false).setScale(0.82);
    const label = UI.title(this, x, y + 62, String(i + 1), { size: 40, color: "#f8e3a6", stroke: "#2a1608", strokeW: 6 }).setDepth(y + 5);
    const fire = this.add.particles(x, my + 30, "fx-dot", { x: { min: -30, max: 30 }, speedY: { min: -170, max: -90 }, scale: { start: 0.6, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 600, frequency: 40, tint: [0xffe08a, 0xff8a30, 0xff5a20], blendMode: "ADD", emitting: false }).setDepth(y + 4);
    const zone = this.add.zone(x, my, 230, 250).setInteractive({ useHandCursor: true });
    const o = { x, y, my, ring, loaf, glow, fire, label, i, state: "empty", p: 0, rate: 0, heat: 1, flare: 0, cool: 0 };
    zone.on("pointerdown", () => this.press(o));
    return o;
  }

  band() { const t = this.good / BAKE.goal; return [lerp(BAKE.band0[0], BAKE.band1[0], t), lerp(BAKE.band0[1], BAKE.band1[1], t)]; }

  press(o) {
    if (!this.running) return;
    if (o.state === "empty" && o.cool <= 0) this.loadDough(o);
    else if (o.state === "baking") this.pull(o);
  }

  loadDough(o) {
    const t = this.good / BAKE.goal;
    o.state = "baking"; o.p = 0;
    o.rate = 1 / lerp(4.4, 2.7, t) * (0.9 + Math.random() * 0.22);
    o.loaf.setTexture("dough").clearTint().setVisible(true).setScale(0.3).setAlpha(1).setPosition(o.x, o.my + 4);
    this.tweens.add({ targets: o.loaf, scale: 0.82, duration: 160, ease: "Back.easeOut" });
    this.baker.armLock = true;
    this.tweens.add({ targets: this.baker.armR, rotation: -1.2, duration: 110, yoyo: true, onComplete: () => { this.baker.armLock = false; } });
    Snd.play("slap");
  }

  pull(o) {
    const [a, b] = this.band();
    o.state = "empty"; o.cool = 350;
    if (o.p >= a && o.p <= b) {
      this.good++;
      const perfect = Math.abs(o.p - (a + b) / 2) < (b - a) * 0.18;
      Snd.play("pop");
      if (perfect) { this.timeLeft += 1000; this.floatText(o.x, o.my - 120, "Perfect! +1s", "#ffe28a"); }
      else this.floatText(o.x, o.my - 120, "Good", "#f1e3c2");
      const n = this.basketPile.length;
      this.tweens.add({
        targets: o.loaf, x: 130 + (n % 4 - 1.5) * 34, y: 910 - Math.floor(n / 4) * 12, scale: 0.4, duration: 420, ease: "Cubic.easeOut",
        onComplete: () => {
          if (n < 40) this.basketPile.push(this.add.image(o.loaf.x, o.loaf.y, "loaf").setScale(0.4).setDepth(1001 + n).setTint(o.loaf.tintTopLeft));
          o.loaf.setVisible(false).setPosition(o.x, o.my + 4);
        }
      });
    } else this.ruin(o, o.p < a ? "Raw dough" : "Too dark");
    this.updateScore();
    if (this.good >= BAKE.goal) { this.running = false; this.time.delayedCall(600, () => this.win()); }
  }

  ruin(o, why) {
    this.ruined++;
    o.state = "empty"; o.cool = why === "Burnt!" ? 1100 : 450;
    Snd.play(why === "Burnt!" ? "burn" : "nope");
    this.floatText(o.x, o.my - 120, why, "#ff9a7a");
    const puff = this.add.image(o.x, o.my - 30, "fx-puff").setTint(0x3a3a3a).setAlpha(0.7).setDepth(o.y + 6).setScale(0.6);
    this.tweens.add({ targets: puff, y: puff.y - 140, scale: 1.6, alpha: 0, duration: 900, onComplete: () => puff.destroy() });
    this.tweens.add({ targets: o.loaf, alpha: 0, y: o.my + 40, duration: 400, onComplete: () => { o.loaf.setVisible(false).setAlpha(1).setPosition(o.x, o.my + 4); } });
    this.updateScore();
    if (this.ruined >= BAKE.maxRuined) this.fail("Too many lost. Scrape the ovens - we start the batch again.");
  }

  fail(text) {
    if (!this.running) return;
    this.running = false;
    Snd.play("fail");
    this.time.delayedCall(700, () => this.dbox.show([{ speaker: "Baker", text }], () => this.restartWith({ fails: this.fails + 1 })));
  }


  floatText(x, y, s, color) {
    const t = UI.title(this, x, y, s, { size: 44, color, stroke: "#2a1608", strokeW: 7 }).setDepth(8000);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
  }

  updateScore() {
    const s = Math.max(0, Math.ceil(this.timeLeft / 1000));
    this.scoreTxt.textObj.setText("Good loaves  " + this.good + " / " + BAKE.goal + "      Ruined  " + this.ruined + " / " + BAKE.maxRuined + "      " + Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"));
    this.scoreTxt.textObj.setColor(s <= 15 && this.running ? "#ff9a7a" : "#f8e3a6");
  }

  tick(time, d) {
    if (!this.ovens) return;
    const k = this.keys;
    [k.one, k.two, k.three, k.four, k.five].forEach((key, i) => { if (Phaser.Input.Keyboard.JustDown(key)) this.press(this.ovens[i]); });
    if (this.running) {
      this.timeLeft -= d;
      if (Math.floor(this.timeLeft / 1000) !== Math.floor((this.timeLeft + d) / 1000)) this.updateScore();
      if (this.timeLeft <= 0) { this.timeLeft = 0; this.updateScore(); this.fail("The fire's gone down and the batch isn't done. Again - from the start."); }
      // now and then one oven roars up
      this.flareT -= d;
      if (this.flareT <= 0) {
        this.flareT = lerp(7000, 4200, this.good / BAKE.goal) * (0.8 + Math.random() * 0.4);
        const busy = this.ovens.filter(o => o.state === "baking" && o.flare <= 0);
        const o = busy.length ? busy[Math.floor(Math.random() * busy.length)] : null;
        if (o) { o.flare = 2600; o.fire.start(); Snd.play("stoke"); this.tweens.add({ targets: o.glow, alpha: 0.85, duration: 200, yoyo: true, repeat: 5 }); }
      }
    }
    const [a, b] = this.band();
    this.ovens.forEach(o => {
      const g = o.ring;
      g.clear();
      if (o.cool > 0) o.cool -= d;
      if (o.flare > 0) { o.flare -= d; if (o.flare <= 0) o.fire.stop(); }
      o.glow.setAlpha(o.flare > 0 ? o.glow.alpha : (o.state === "baking" ? 0.42 : 0.26));
      o.label.setColor(o.state === "empty" ? (o.cool > 0 ? "#8a7a6a" : "#9ad0ff") : "#f8e3a6");
      if (o.state === "empty") {
        if (this.running && o.cool <= 0) {          // an empty oven invites dough
          g.lineStyle(5, 0x9ad0ff, 0.35 + 0.25 * Math.sin(time / 180)); g.strokeCircle(o.x, o.my, 98);
        }
        o.label.setScale(1);
        return;
      }
      if (this.running) o.p += o.rate * (o.flare > 0 ? 2 : 1) * d / 1000;
      if (o.p > 0.05 && o.loaf.texture.key === "dough") o.loaf.setTexture("loaf");
      const col = o.p < a ? mixC(0xf6ecd8, 0xffd27a, o.p / a) : (o.p < b ? mixC(0xffd27a, 0xe0a050, (o.p - a) / (b - a)) : mixC(0xa06030, 0x2a1a14, clamp((o.p - b) / (1 - b), 0, 1)));
      o.loaf.setTint(col);
      const R = 100, start = -Math.PI / 2;
      g.lineStyle(16, 0x1a1008, 0.75); g.beginPath(); g.arc(o.x, o.my, R, 0, Math.PI * 2); g.strokePath();
      g.lineStyle(16, 0xffc040, 0.95); g.beginPath(); g.arc(o.x, o.my, R, start + a * Math.PI * 2, start + b * Math.PI * 2); g.strokePath();
      const inBand = o.p >= a && o.p <= b;
      g.lineStyle(8, inBand ? 0xffffff : (o.p > b ? 0xff5a3a : 0xf6ecd8), 1);
      g.beginPath(); g.arc(o.x, o.my, R, start, start + Math.min(1, o.p) * Math.PI * 2); g.strokePath();
      const ang = start + Math.min(1, o.p) * Math.PI * 2;
      g.fillStyle(0xffffff, 1); g.fillCircle(o.x + Math.cos(ang) * R, o.my + Math.sin(ang) * R, 12);
      o.label.setScale(inBand ? 1.3 : 1).setColor(inBand ? "#ffffff" : (o.flare > 0 ? "#ffb04a" : "#f8e3a6"));
      if (o.p >= 1 && this.running) this.ruin(o, "Burnt!");
    });
  }

  win() {
    Snd.play("success");
    GameFlow.setSub(2);
    this.ovens.forEach(o => o.fire.stop());
    this.dbox.show([{ speaker: "Baker", text: "...Good. Good bread. Come - help me carry it." }], () => this.leave(() => this.scene.start("RiverScene")));
  }
}

// ============================================================ THE RIVER
// The baker's weekly offering: a basket of bread set on a little reed raft
// with a candle, pushed out onto the night river to drift away.

function paintRiverNight(ctx) {
  paintSky(ctx, W, 640, [[0, 0x060a20], [0.7, 0x1c2a58], [1, 0x34406a]]);
  paintStars(ctx, W, 520, 260, "riverstars", 1);
  paintMoon(ctx, 1360, 190, 62);
  paintCloud(ctx, 520, 260, 420, 70, 0x1e2a50, "rvc1", { lit: 0x4a5a8a });
  // the far bank: poplars and a sleeping city
  paintSkyline(ctx, W, 590, { seed: "riverc", color: 0x121636, color2: 0x181c40, minH: 60, maxH: 200, lights: 0.8, finial: 0x5a4a2a });
  const r = rng("rpop");
  for (let x = 40; x < W; x += r.range(90, 180)) paintTree(ctx, x, 612, "poplar", r.range(0.5, 0.75), "rp" + Math.round(x), { leaf: 0x16202a, trunk: 0x10141c, shadow: false });
  fillC(ctx, 0x0e1428); ctx.fillRect(0, 600, W, 24);
  // the water
  ctx.fillStyle = gradV(ctx, 620, 900, [[0, 0x12204a], [0.5, 0x1a3060], [1, 0x0e1a3a]]); ctx.fillRect(0, 620, W, 300);
  // reflections of the city lights
  for (let i = 0; i < 40; i++) { const x = r.range(0, W), y = r.range(630, 690); strokeC(ctx, 0xffc070, 2, r.range(0.12, 0.3)); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + r.range(10, 40), y); ctx.stroke(); }
  // the near bank: earth, stone steps down to the water
  ctx.beginPath(); ctx.moveTo(0, 860); ctx.bezierCurveTo(500, 830, 1100, 900, W, 850); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = gradV(ctx, 830, H, [[0, 0x3a3a48], [1, 0x1e1e28]]); ctx.fill();
  ctx.save(); ctx.clip(); mottle(ctx, 0, 830, W, 250, 0x000000, 0.25, 16, "rbank", 60, 200); ctx.restore();
  for (let i = 0; i < 4; i++) {
    const y = 860 + i * 30, w = 360 - i * 30;
    pRR(ctx, 760 - w / 2 + i * 6, y, w, 26, 4); ctx.fillStyle = gradV(ctx, y, y + 26, [[0, 0x8a8aa0], [1, 0x4a4a5c]]); ctx.fill(); strokeC(ctx, 0x1a1a24, 2); ctx.stroke();
  }
  grain(ctx, 0, 0, W, H, 0.04);
}

function paintReeds(ctx, w, h, seed) {
  const r = rng(seed);
  for (let i = 0; i < 14; i++) {
    const x = w / 2 + r.range(-w * 0.4, w * 0.4), hh = r.range(h * 0.5, h * 0.95), bend = r.range(-16, 16);
    strokeC(ctx, r.pick([0x22322a, 0x2a3e32, 0x1a2620]), r.range(2.4, 4)); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, h); ctx.quadraticCurveTo(x + bend * 0.3, h - hh / 2, x + bend, h - hh); ctx.stroke();
    if (r.chance(0.45)) { pEll(ctx, x + bend, h - hh + 14, 5, 15); fillC(ctx, 0x3a2a1e); ctx.fill(); }
  }
}

class RiverScene extends BaseScene {
  constructor() { super("RiverScene"); }

  create() {
    this.begin({ music: "lament", amb: "night" });
    addBackdrop(this, "river_bg", ctx => paintRiverNight(ctx));
    // the moon's path on the water, shimmering
    this.shimmer = [];
    for (let i = 0; i < 16; i++) {
      const s = this.add.image(1360 + (Math.random() - 0.5) * 60, 640 + i * 14, "fx-streak").setTint(0xdfe8ff).setAlpha(0.5).setDepth(1).setBlendMode(Phaser.BlendModes.ADD);
      s.setDisplaySize(60 + Math.random() * 120 + i * 8, 4);
      this.tweens.add({ targets: s, alpha: 0.15, x: s.x + (Math.random() - 0.5) * 50, duration: 700 + Math.random() * 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.shimmer.push(s);
    }
    // gentle current lines
    for (let i = 0; i < 18; i++) {
      const s = this.add.image(Math.random() * W, 700 + Math.random() * 160, "fx-streak").setTint(0x8aa8e0).setAlpha(0.22).setDepth(1);
      s.setDisplaySize(80 + Math.random() * 120, 3);
      this.tweens.add({ targets: s, x: s.x + 300, duration: 7000 + Math.random() * 4000, repeat: -1, onRepeat: () => { s.x = Math.random() * W - 300; } });
    }
    // reeds in front, swaying
    [[120, 900], [380, 940], [1250, 920], [1560, 900], [1820, 940]].forEach((p, i) => {
      const k = Tex.make(this, "reeds" + i, 200, 220, ctx => paintReeds(ctx, 200, 220, "rd" + i));
      const im = this.add.image(p[0], p[1] + 20, k).setOrigin(0.5, 1).setDepth(2000 + p[1]);
      this.tweens.add({ targets: im, angle: 2.5, duration: 1800 + i * 200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    });
    ambientParticles(this, "fireflies", { area: { x: 0, y: 560, w: W, h: 380 }, freq: 260 });

    // the raft: reeds lashed together, the bread wrapped in cloth, a candle
    const rk = Tex.make(this, "bread_raft", 240, 170, (c) => {
      for (let i = 0; i < 9; i++) { pRR(c, 20, 118 + i * 3.2 - 12, 200, 9, 4.5); fillC(c, i % 2 ? 0xb89a5a : 0xa88a4a); c.fill(); strokeC(c, 0x4a3a1e, 1.2); c.stroke(); }
      strokeC(c, 0x6a4a24, 2.4); [60, 120, 180].forEach(x => { c.beginPath(); c.moveTo(x, 104); c.lineTo(x + 4, 140); c.stroke(); });
      c.beginPath(); c.moveTo(56, 108); c.lineTo(184, 108); c.lineTo(168, 64); c.lineTo(72, 64); c.closePath();
      c.fillStyle = gradV(c, 64, 108, [[0, 0xc79a5c], [1, 0x7a5432]]); c.fill(); strokeC(c, 0x3a2414, 2); c.stroke();
      for (let i = 0; i < 4; i++) paintLoaf(c, 84 + i * 24, 62 - (i % 2) * 6, 18, 0.6);
      c.beginPath(); c.moveTo(66, 70); c.quadraticCurveTo(120, 40, 176, 70); c.lineTo(170, 80); c.quadraticCurveTo(120, 60, 72, 80); c.closePath();
      c.fillStyle = patS(c, tileIkat([0x8e2f2f, PAL.gold, 0x1c4e80, PAL.cream], "raft"), 0.35); c.fill(); strokeC(c, 0x3a1414, 1.4); c.stroke();
      pRR(c, 192, 76, 12, 30, 3); fillC(c, 0xf2ead8); c.fill(); strokeC(c, 0x8a7a5a, 1.2); c.stroke();
    });
    const baker = makePerson(this, 520, 930, STORY.cast["Baker"]).setDepth(930).setPerspective(1.1).tint(0xb8c0e8);
    const hero = makePerson(this, 300, 960, HERO).setDepth(960).setPerspective(1.12).tint(0xb8c0e8);
    const raft = this.add.image(hero.x + 80, hero.y - 90, rk).setDepth(965).setScale(0.75).setTint(0xd8dcf0);
    const flame = addGlow(this, 0, 0, 120, 0xffc060, 0.8).setDepth(966);
    this.tweens.add({ targets: flame, alpha: 0.5, duration: 140, yoyo: true, repeat: -1 });
    const sync = () => flame.setPosition(raft.x + (198 - 120) * raft.scaleX, raft.y + (70 - 85) * raft.scaleY);
    this.onUpdate(sync); sync();
    addVignette(this, 0.95);
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "Baker": baker, "You": hero };

    // walk down to the steps together, set it on the water, let it go
    [hero, baker].forEach(p => { p.moving = true; });
    this.tweens.add({ targets: baker, x: 820, y: 880, duration: 2200, ease: "Sine.easeInOut", onComplete: () => { baker.moving = false; baker.setFacing(1); } });
    this.tweens.add({ targets: [hero, raft], x: "+=380", duration: 2200, ease: "Sine.easeInOut", onComplete: () => {
      hero.moving = false;
      this.time.delayedCall(400, () => {
        this.tweens.add({ targets: raft, x: 760, y: 838, scale: 0.68, duration: 900, ease: "Sine.easeInOut", onComplete: () => {
          Snd.play("splash");
          const ring = this.add.image(760, 856, "fx-glow").setTint(0xbfd0ff).setDisplaySize(80, 16).setAlpha(0.6).setDepth(964).setBlendMode(Phaser.BlendModes.ADD);
          this.tweens.add({ targets: ring, displayWidth: 300, displayHeight: 50, alpha: 0, duration: 1600, onComplete: () => ring.destroy() });
          // the current takes it: out, across, and away into the dark, smaller and smaller
          this.tweens.add({ targets: raft, x: 1500, y: 700, scale: 0.28, duration: 15000, ease: "Sine.easeIn" });
          this.tweens.add({ targets: raft, angle: 4, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
          this.time.delayedCall(1600, () => this.dbox.show(STORY.bakery.outro, () => {
            this.tweens.add({ targets: raft, alpha: 0, duration: 1500 });
            this.time.delayedCall(1200, () => this.advance());
          }));
        } });
      });
    } });
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

// Eighteen ingredients, some of them easy to mix up. Recipes go into the
// kazan in order (plov starts with hot oil and onion, the rice goes in
// last); the bowls are reshuffled after every dish and only show their
// names when you point at them. The fire under the kazan sinks on its own
// and drops whenever something cold goes in: work the bellows to keep it
// in the green. Too cold or too hot and the dish's time runs out twice as
// fast; let it blaze and the dish burns.
const INGREDIENTS = ["rice", "carrot", "ycarrot", "onion", "garlic", "lamb", "beef", "chickpeas", "raisins", "quince", "tomato", "pepper", "gpepper", "dough", "herbs", "cumin", "oil", "egg"];
const ING_NAMES = { ycarrot: "yellow carrot", gpepper: "green pepper", pepper: "red pepper", chickpeas: "chickpeas", oil: "cotton oil" };
const ingName = k => ING_NAMES[k] || k;
const DISHES = [
  { name: "Plov", items: ["oil", "onion", "lamb", "carrot", "ycarrot", "cumin", "rice"] },
  { name: "Shurpa", items: ["lamb", "onion", "carrot", "tomato", "pepper", "herbs"] },
  { name: "Lagman", items: ["oil", "beef", "gpepper", "tomato", "garlic", "dough"] },
  { name: "Samsa", items: ["dough", "lamb", "onion", "cumin"] },
  { name: "Manti", items: ["dough", "beef", "onion", "cumin"] },
  { name: "Dimlama", items: ["lamb", "quince", "onion", "carrot", "tomato", "gpepper"] },
  { name: "Mastava", items: ["oil", "beef", "carrot", "tomato", "rice", "herbs"] },
  { name: "Chuchvara", items: ["dough", "egg", "beef", "onion"] },
  { name: "Achichuk", items: ["tomato", "onion", "gpepper", "herbs"] },
  { name: "Wedding Plov", items: ["oil", "onion", "lamb", "ycarrot", "chickpeas", "raisins", "rice"] }
];
const HEAT = { start: 68, drift: 5.5, stoke: 15, chill: 6, lo: 40, hi: 86, burn: 112 };

function paintIngredient(ctx, key, cx, cy, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineJoin = "round"; ctx.lineCap = "round";
  const blob = (x, y, rx, ry, c, rot) => { pEll(ctx, x, y, rx, ry, rot); ctx.fillStyle = gradR(ctx, x - rx * 0.3, y - ry * 0.4, 1, Math.max(rx, ry) * 1.2, [[0, lighten(c, 0.35)], [1, c]]); ctx.fill(); strokeC(ctx, OL(c), 2); ctx.stroke(); };
  const r = rng("ing" + key);
  const carrots = (c0, c1) => [-14, 4, 20].forEach((x, i) => {
    ctx.save(); ctx.translate(x, 0); ctx.rotate(0.3 - i * 0.2);
    ctx.beginPath(); ctx.moveTo(-9, -24); ctx.quadraticCurveTo(0, -27, 9, -24); ctx.quadraticCurveTo(6, 10, 0, 30); ctx.quadraticCurveTo(-6, 10, -9, -24); ctx.closePath();
    ctx.fillStyle = gradH(ctx, -9, 9, [[0, c0], [1, c1]]); ctx.fill(); strokeC(ctx, OL(c1), 2); ctx.stroke();
    strokeC(ctx, OL(c1), 1, 0.5); [-12, -2, 8].forEach(y => { ctx.beginPath(); ctx.moveTo(-6, y); ctx.lineTo(-1, y + 2); ctx.stroke(); });
    fillC(ctx, 0x5a9a3a); ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(-4, -40); ctx.lineTo(0, -28); ctx.lineTo(4, -42); ctx.lineTo(6, -24); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  const meat = (c, fat) => {
    blob(0, 4, 32, 22, c);
    strokeC(ctx, fat, fat === 0xf2d8c8 ? 5 : 2.4, 0.9); ctx.beginPath(); ctx.moveTo(-24, -6); ctx.quadraticCurveTo(-4, 6, 22, -4); ctx.stroke();
    if (fat === 0xf2d8c8) blob(14, 12, 9, 6, fat); else { strokeC(ctx, fat, 1.6, 0.8); ctx.beginPath(); ctx.moveTo(-18, 10); ctx.quadraticCurveTo(0, 16, 16, 8); ctx.stroke(); }
    fillC(ctx, 0xf6ead8); pEll(ctx, -22, 8, 6, 5); ctx.fill(); strokeC(ctx, 0x8a6a5a, 1.4); ctx.stroke();
  };
  if (key === "rice") { for (let i = 0; i < 30; i++) blob(r.range(-26, 26), r.range(-14, 18), 6, 3, 0xf6f0e0, r.range(0, 3)); }
  else if (key === "carrot") carrots(0xffa050, 0xd9622a);
  else if (key === "ycarrot") carrots(0xffe08a, 0xd8a838);
  else if (key === "onion") { blob(-12, 6, 20, 20, 0xc86a8a); blob(14, 8, 18, 18, 0xe0b080); strokeC(ctx, 0x6a3a2a, 2); ctx.beginPath(); ctx.moveTo(-12, -14); ctx.lineTo(-12, -24); ctx.moveTo(14, -10); ctx.lineTo(16, -20); ctx.stroke(); strokeC(ctx, 0x8a4a5a, 1, 0.6); [-18, -12, -6].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -10); ctx.quadraticCurveTo(x - 2, 6, x, 22); ctx.stroke(); }); }
  else if (key === "garlic") { blob(0, 6, 26, 24, 0xf6f0e4); strokeC(ctx, 0xc8bca8, 2); [-10, 0, 10].forEach(x => { ctx.beginPath(); ctx.moveTo(x, -14); ctx.quadraticCurveTo(x * 1.6, 8, x, 28); ctx.stroke(); }); fillC(ctx, 0xc8bca8); ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(0, -32); ctx.lineTo(4, -18); ctx.fill(); }
  else if (key === "lamb") meat(0xc8484a, 0xf2d8c8);
  else if (key === "beef") meat(0x8a1e24, 0xe8b8b0);
  else if (key === "chickpeas") { for (let i = 0; i < 12; i++) blob(r.range(-24, 24), r.range(-12, 18), 9, 8, 0xe8c888); }
  else if (key === "raisins") { for (let i = 0; i < 14; i++) blob(r.range(-24, 24), r.range(-12, 18), 7, 5, r.chance(0.5) ? 0x6a2a3a : 0xc8902a, r.range(0, 3)); }
  else if (key === "quince") { blob(0, 6, 28, 26, 0xf0d040); fillC(ctx, 0x6a4a20); ctx.fillRect(-2, -26, 4, 10); fillC(ctx, 0x5a9a3a); pEll(ctx, 10, -22, 10, 5, -0.4); ctx.fill(); softEllipse(ctx, -8, -4, 8, 6, 0xffffff, 0.5); }
  else if (key === "tomato") { blob(-10, 6, 20, 18, 0xd8302a); blob(14, 10, 16, 14, 0xe8402a); fillC(ctx, 0x4a8a2a); pStar(ctx, -10, -10, 5, 9, 3, 0); ctx.fill(); pStar(ctx, 14, -2, 5, 7, 2.5, 0.4); ctx.fill(); }
  else if (key === "pepper" || key === "gpepper") {
    const c = key === "pepper" ? 0xd82a2a : 0x4a9a2a;
    [-12, 12].forEach((x, i) => { ctx.save(); ctx.translate(x, 0); ctx.rotate(i ? 0.4 : -0.3); ctx.beginPath(); ctx.moveTo(-8, -20); ctx.quadraticCurveTo(12, -20, 6, 10); ctx.quadraticCurveTo(0, 28, -4, 32); ctx.quadraticCurveTo(-12, 10, -8, -20); ctx.closePath(); ctx.fillStyle = gradH(ctx, -8, 10, [[0, lighten(c, 0.3)], [1, c]]); ctx.fill(); strokeC(ctx, 0x2a1008, 2); ctx.stroke(); fillC(ctx, 0x3a6a1a); ctx.fillRect(-3, -26, 5, 7); ctx.restore(); });
  }
  else if (key === "dough") { blob(0, 6, 32, 22, 0xf2e2c4); blob(-8, 0, 12, 6, 0xfff6e4); strokeC(ctx, 0xd8c8a4, 1.4); ctx.beginPath(); ctx.moveTo(-20, 12); ctx.quadraticCurveTo(0, 18, 20, 10); ctx.stroke(); }
  else if (key === "herbs") { for (let i = 0; i < 9; i++) { ctx.save(); ctx.rotate(r.range(-0.8, 0.8)); fillC(ctx, r.chance(0.5) ? 0x3a8a3a : 0x5aaa4a); pEll(ctx, r.range(-8, 8), r.range(-20, 6), 7, 16); ctx.fill(); ctx.restore(); } strokeC(ctx, 0x2a5a2a, 3); ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, 0); ctx.stroke(); }
  else if (key === "cumin") { ctx.beginPath(); ctx.moveTo(-30, 22); ctx.quadraticCurveTo(0, -24, 30, 22); ctx.closePath(); fillC(ctx, 0x8a6a3a); ctx.fill(); strokeC(ctx, 0x4a3418, 2); ctx.stroke(); for (let i = 0; i < 26; i++) { fillC(ctx, r.pick([0x6a4a24, 0xa8844a, 0x5a3a1a])); pEll(ctx, r.range(-22, 22), r.range(-6, 18), 3, 1.4, r.range(0, 3)); ctx.fill(); } }
  else if (key === "oil") { paintJug(ctx, 0, 30, 0.62, "koza", "oilj"); fillC(ctx, 0xe8c040, 0.9); pEll(ctx, 0, -16, 6, 2); ctx.fill(); }
  else if (key === "egg") { [[-14, 8], [12, 10], [0, -6]].forEach(p => { pEll(ctx, p[0], p[1], 13, 16); ctx.fillStyle = gradR(ctx, p[0] - 4, p[1] - 6, 1, 18, [[0, 0xfffaf0], [1, 0xe8d8c0]]); ctx.fill(); strokeC(ctx, 0x9a8a72, 1.6); ctx.stroke(); }); }
  ctx.restore();
}

// Leather bellows, nozzle to the right.
function paintBellows(ctx, cx, cy, squeeze) {
  ctx.save(); ctx.translate(cx, cy); ctx.lineJoin = "round";
  const k = 1 - squeeze * 0.45;
  strokeC(ctx, 0x2a160a, 2.2);
  ctx.beginPath(); ctx.moveTo(-70, -30 * k); ctx.lineTo(40, -10); ctx.lineTo(40, 10); ctx.lineTo(-70, 30 * k); ctx.closePath();
  ctx.fillStyle = gradV(ctx, -30, 30, [[0, 0x9a5a2a], [0.5, 0x6a3a18], [1, 0x9a5a2a]]); ctx.fill(); ctx.stroke();
  strokeC(ctx, 0x3a1a08, 1.4, 0.6); for (let i = 1; i < 5; i++) { const x = -70 + i * 22; ctx.beginPath(); ctx.moveTo(x, -30 * k + i * 4); ctx.lineTo(x, 30 * k - i * 4); ctx.stroke(); }
  [-1, 1].forEach(s => { pRR(ctx, -84, s * 30 * k - 6, 126, 12, 5); ctx.fillStyle = gradV(ctx, -6, 6, [[0, 0xc89a62], [1, 0x7a5232]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2); ctx.stroke(); });
  pRR(ctx, -112, -10, 34, 20, 8); fillC(ctx, 0x7a5232); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, -8); ctx.lineTo(84, -4); ctx.lineTo(84, 4); ctx.lineTo(40, 8); ctx.closePath(); ctx.fillStyle = gradV(ctx, -8, 8, [[0, 0xd8dee4], [1, 0x6a727c]]); ctx.fill(); strokeC(ctx, 0x2a2a30, 1.6); ctx.stroke();
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
      pArch(ctx, 960, 640, 640, 520, 0.6); ctx.fillStyle = gradV(ctx, 120, 640, [[0, 0x2a1a14], [1, 0x5a2a14]]); ctx.fill(); strokeC(ctx, PAL.gold, 6); ctx.stroke();
      glowDot(ctx, 960, 560, 300, 0xff8a30, 0.4);
      [[230, 230], [1690, 230]].forEach(p => {
        fillC(ctx, 0x5a3a20); ctx.fillRect(p[0] - 190, p[1], 380, 16); ctx.fillRect(p[0] - 190, p[1] + 180, 380, 16);
        paintPots(ctx, p[0], p[1], "kp" + p[0], { n: 4, scale: 0.9 }); paintPots(ctx, p[0], p[1] + 180, "kq" + p[0], { n: 4, scale: 0.9 });
      });
      // strings of dried peppers and onions
      [[430, 0xb2283a], [1490, 0xc88a5a]].forEach(s => { strokeC(ctx, 0x6a4a24, 2); ctx.beginPath(); ctx.moveTo(s[0], 140); ctx.lineTo(s[0], 330); ctx.stroke(); for (let y = 160; y < 330; y += 22) { fillC(ctx, s[1]); pEll(ctx, s[0] + (y % 44 ? 7 : -7), y, 7, 11); ctx.fill(); } });
      ctx.fillStyle = gradV(ctx, 640, H, [[0, 0x6a4a34], [1, 0x3a2418]]); ctx.fillRect(0, 640, W, H - 640);
      pRR(ctx, 60, 760, W - 120, 300, 18); ctx.fillStyle = gradV(ctx, 760, 1060, [[0, 0xa8784a], [1, 0x5a3a20]]); ctx.fill(); strokeC(ctx, 0x2a160a, 4); ctx.stroke();
      strokeC(ctx, 0x3a2414, 2, 0.5); for (let x = 120; x < W - 100; x += 140) { ctx.beginPath(); ctx.moveTo(x, 764); ctx.lineTo(x + 30, 1056); ctx.stroke(); }
      grain(ctx, 0, 0, W, H, 0.05);
    });
    addProp(this, 960, 690, 520, 300, (c) => {
      c.beginPath(); c.moveTo(-200, -150); c.lineTo(200, -150); c.quadraticCurveTo(210, 0, 0, 10); c.quadraticCurveTo(-210, 0, -200, -150); c.closePath();
      c.fillStyle = gradH(c, -200, 200, [[0, 0x6a6a72], [0.4, 0x3a3a42], [1, 0x14141a]]); c.fill(); strokeC(c, 0x0a0a0c, 3); c.stroke();
      pEll(c, 0, -150, 200, 34); fillC(c, 0x2a2a30); c.fill(); c.stroke();
      pEll(c, 0, -146, 180, 26); c.fillStyle = gradR(c, 0, -146, 10, 180, [[0, 0xe8a050], [1, 0xa8582a]]); c.fill();
    });
    this.kazanSteam = this.add.particles(960, 540, "fx-puff", { x: { min: -140, max: 140 }, speedY: { min: -80, max: -40 }, scale: { start: 0.4, end: 1.2 }, alpha: { start: 0.25, end: 0 }, lifespan: 2400, frequency: 220 }).setDepth(700);
    this.fireGlow = addGlow(this, 960, 700, 520, 0xff7a20, 0.5).setDepth(10);
    this.flames = this.add.particles(960, 715, "fx-dot", { x: { min: -150, max: 150 }, speedY: { min: -150, max: -70 }, scale: { start: 0.7, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 500, frequency: 30, tint: [0xffe08a, 0xff8a30, 0xff5a20], blendMode: "ADD" }).setDepth(705);
    this.cook = makePerson(this, 1790, 720, Object.assign({ facing: -1 }, STORY.cast["Head Cook"])).setDepth(720).setPerspective(1.0);
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "Head Cook": this.cook };

    // bellows and the heat gauge
    Tex.make(this, "bellows0", 220, 90, ctx => paintBellows(ctx, 120, 45, 0));
    Tex.make(this, "bellows1", 220, 90, ctx => paintBellows(ctx, 120, 45, 1));
    this.bellows = this.add.image(640, 690, "bellows0").setDepth(760).setInteractive({ useHandCursor: true });
    this.bellows.on("pointerdown", () => this.stoke());
    UI.text(this, 640, 752, this.touchMode ? "bellows" : "bellows · F", { size: 24, color: "#f1e3c2", stroke: "#2a160a", strokeW: 5, shadow: false }).setDepth(761);
    this.fKey = this.input.keyboard.addKey("F");
    this.gauge = this.add.graphics().setDepth(770);
    this.heatTxt = UI.text(this, 1250, 400, "", { size: 28, color: "#f8e3a6", stroke: "#2a160a", strokeW: 6, shadow: false }).setDepth(771);

    // bowls on the counter: 3 rows of 6, reshuffled after every dish
    INGREDIENTS.forEach(k => Tex.make(this, "ing_" + k, 140, 120, (ctx) => {
      pEll(ctx, 70, 84, 62, 26); ctx.fillStyle = gradV(ctx, 60, 110, [[0, 0xe8e0d0], [1, 0x8a8478]]); ctx.fill(); strokeC(ctx, 0x2a2a2a, 2.4); ctx.stroke();
      pEll(ctx, 70, 76, 54, 16); fillC(ctx, 0x3a3430); ctx.fill();
      paintIngredient(ctx, k, 70, 56, 1);
    }));
    this.slots = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 6; col++) this.slots.push({ x: 290 + col * 268 + (row % 2) * 40, y: 815 + row * 95 });
    this.bowls = {};
    INGREDIENTS.forEach(k => {
      const img = this.add.image(0, 0, "ing_" + k).setInteractive({ useHandCursor: true });
      const lbl = UI.text(this, 0, 0, ingName(k), { size: 24, color: "#fff4dc", stroke: "#2a160a", strokeW: 6, shadow: false }).setDepth(990).setVisible(this.touchMode);
      img.on("pointerover", () => { img.setScale(1.08); lbl.setVisible(true); });
      img.on("pointerout", () => { img.setScale(1); lbl.setVisible(this.touchMode); });
      img.on("pointerdown", () => this.pick(k, img));
      this.bowls[k] = { img, lbl };
    });
    this.shuffleBowls(false);

    // the ticket
    this.ticket = this.add.container(470, 300).setDepth(8000);
    const tk = Tex.make(this, "ticket", 760, 400, (ctx) => {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      pRR(ctx, 20, 20, 720, 360, 10); ctx.fillStyle = gradV(ctx, 20, 380, [[0, 0xf6ead0], [1, 0xdcc8a0]]); ctx.fill(); ctx.restore();
      strokeC(ctx, 0x8a6a3a, 2); pRR(ctx, 34, 34, 692, 332, 6); ctx.stroke();
      grain(ctx, 0, 0, 760, 400, 0.08);
    });
    this.ticket.add(this.add.image(0, 0, tk));
    this.dishTxt = UI.title(this, 0, -130, "", { size: 50, color: "#4a2a10", shadow: false });
    this.ticket.add(this.dishTxt);
    this.ticketIcons = [];
    this.timeBarBg = this.add.rectangle(0, 145, 620, 22, 0x3a2a1a, 0.4); this.timeBar = this.add.rectangle(-310, 145, 620, 22, 0xd9a441).setOrigin(0, 0.5);
    this.ticket.add([this.timeBarBg, this.timeBar]);
    this.ticket.setVisible(false);

    this.served = 0; this.missed = 0; this.round = 0; this.total = 10; this.need = 8; this.running = false; this.heat = HEAT.start;
    const r = rng("menu" + this.fails);
    this.menu = DISHES.slice().sort(() => r() - 0.5);
    this.scoreTxt = UI.pill(this, 1500, 140, "", { minW: 520, size: 34, h: 70, padX: 70, gold: true, color: "#f8e3a6", font: FONT_T });
    this.updateScore();
    addVignette(this, 0.5);

    const start = () => challengeIntro(this, "The King's Dinner", [
      "Each ticket is a dish. Put its ingredients in the kazan IN ORDER.",
      "Point at a bowl to see what's in it - they move after every dish.",
      (this.touchMode ? "Tap the bellows" : "Click the bellows or press F") + " to keep the fire in the green.",
      "Too cold or too hot and time runs out twice as fast. Serve " + this.need + " of " + this.total + "."
    ], () => { this.running = true; this.nextOrder(); });
    if (this.sub === 0 && !this.fails) this.time.delayedCall(500, () => this.dbox.show(STORY.kitchen.intro, () => { GameFlow.setSub(1); start(); }));
    else start();
  }

  shuffleBowls(animate) {
    const order = Phaser.Utils.Array.Shuffle(INGREDIENTS.slice());
    order.forEach((k, i) => {
      const s = this.slots[i], b = this.bowls[k];
      b.img.setDepth(900 + Math.floor(i / 6));
      if (animate) { this.tweens.add({ targets: b.img, x: s.x, y: s.y, duration: 380, ease: "Cubic.easeInOut" }); this.tweens.add({ targets: b.lbl, x: s.x, y: s.y + 48, duration: 380, ease: "Cubic.easeInOut" }); }
      else { b.img.setPosition(s.x, s.y); b.lbl.setPosition(s.x, s.y + 48); }
    });
  }

  updateScore() { this.scoreTxt.textObj.setText("Served " + this.served + " / " + this.need + "    Spoiled " + this.missed + " / " + (this.total - this.need)); }

  nextOrder() {
    if (this.round >= this.total) { this.finish(); return; }
    const dish = this.menu[this.round];
    this.round++;
    this.dish = dish; this.step = 0;
    this.ticketIcons.forEach(o => o.destroy()); this.ticketIcons = [];
    this.dishTxt.setText(dish.name + "  (" + this.round + "/" + this.total + ")");
    const n = dish.items.length, gap = Math.min(96, 640 / n);
    dish.items.forEach((k, i) => {
      const x = (i - (n - 1) / 2) * gap;
      const num = UI.title(this, x, -62, String(i + 1), { size: 26, color: "#8a6a3a", shadow: false });
      const img = this.add.image(x, 0, "ing_" + k).setScale(gap / 150);
      const lbl = UI.text(this, x, 62, ingName(k), { size: n > 6 ? 17 : 20, color: "#4a2a10", shadow: false, wrap: gap + 10 });
      const tickMark = UI.title(this, x + 26, -26, "✓", { size: 48, color: "#2a8a3a", shadow: false }).setVisible(false);
      img.k = k; img.tick = tickMark; img.num = num;
      this.ticket.add([num, img, lbl, tickMark]);
      this.ticketIcons.push(num, img, lbl, tickMark);
    });
    this.markNext();
    const k = lerp(1, 0.76, this.round / this.total);
    this.timeTotal = (5000 + 1900 * n) * k;
    this.timeLeft = this.timeTotal;
    this.ticket.setVisible(true).setScale(0.8).setAlpha(0).setPosition(470, 300);
    this.tweens.add({ targets: this.ticket, scale: 1, alpha: 1, duration: 260, ease: "Back.easeOut" });
    Snd.play("paper");
  }

  markNext() {
    this.ticketIcons.filter(o => o.k).forEach((img, i) => {
      const cur = i === this.step;
      img.num.setColor(cur ? "#c0281a" : "#8a6a3a").setScale(cur ? 1.3 : 1);
      img.setAlpha(i < this.step ? 0.45 : 1);
    });
  }

  stoke() {
    if (!this.running) return;
    if (this.stokeCd > 0) return;
    this.stokeCd = 140;
    this.heat = Math.min(130, this.heat + HEAT.stoke);
    Snd.play("stoke");
    this.bellows.setTexture("bellows1");
    this.time.delayedCall(120, () => this.bellows.setTexture("bellows0"));
    const p = this.add.particles(1010, 712, "fx-dot", { speedX: { min: 60, max: 200 }, speedY: { min: -120, max: -30 }, scale: { start: 0.5, end: 0 }, lifespan: 400, tint: [0xffe08a, 0xff8a30], blendMode: "ADD", emitting: false }).setDepth(706);
    p.explode(10); this.time.delayedCall(500, () => p.destroy());
  }

  mistake(text) {
    this.timeLeft -= 2800;
    Snd.play("nope"); this.cameras.main.flash(120, 120, 30, 20);
    const puff = this.add.image(960, 520, "fx-puff").setTint(0x4a4a4a).setAlpha(0.7).setDepth(800);
    this.tweens.add({ targets: puff, y: 380, scale: 2, alpha: 0, duration: 800, onComplete: () => puff.destroy() });
    this.cook.talking = true; this.time.delayedCall(600, () => { this.cook.talking = false; });
    UI.toast(this, text, { y: 600, hold: 1100 });
  }

  pick(k, img) {
    if (!this.running || !this.dish) return;
    this.tweens.add({ targets: img, scale: 1.18, duration: 80, yoyo: true });
    const want = this.dish.items[this.step];
    if (k === want) {
      this.step++;
      this.heat -= HEAT.chill;
      Snd.play("plop");
      const fly = this.add.image(img.x, img.y, "ing_" + k).setDepth(800);
      this.tweens.add({ targets: fly, x: 960, y: 520, scale: 0.4, duration: 380, ease: "Quad.easeIn", onComplete: () => { fly.destroy(); Snd.play("sizzle"); } });
      const t = this.ticketIcons.find(o => o.k === k && !o.tick.visible); if (t) t.tick.setVisible(true);
      this.markNext();
      if (this.step >= this.dish.items.length) this.serve(true);
    } else if (this.dish.items.indexOf(k) >= this.step) this.mistake("Not yet - the " + ingName(want) + " goes in first!");
    else if (this.dish.items.indexOf(k) >= 0) this.mistake("The " + ingName(k) + " is already in!");
    else this.mistake(ingName(k)[0].toUpperCase() + ingName(k).slice(1) + " doesn't go in " + this.dish.name + "!");
  }

  serve(ok, why) {
    const d = this.dish; this.dish = null;
    if (ok) { this.served++; Snd.play("success"); UI.toast(this, d.name + " served!", { y: 600, hold: 700 }); }
    else { this.missed++; Snd.play("fail"); UI.toast(this, why || ("Too slow - the " + d.name + " is spoiled"), { y: 600, hold: 1000 }); }
    this.updateScore();
    if (this.missed > this.total - this.need) this.round = this.total;
    this.tweens.add({ targets: this.ticket, alpha: 0, x: ok ? 1400 : 470, y: ok ? 300 : 480, duration: 300, onComplete: () => {
      this.shuffleBowls(true);
      this.time.delayedCall(500, () => this.nextOrder());
    } });
  }

  drawGauge() {
    const g = this.gauge, x = 1230, y0 = 450, h = 240, w = 34, f = v => y0 + h - clamp(v / 130, 0, 1) * h;
    g.clear();
    g.fillStyle(0x1a1008, 0.75).fillRoundedRect(x - w / 2 - 6, y0 - 6, w + 12, h + 12, 10);
    g.fillStyle(0x3a6a9a, 0.6).fillRect(x - w / 2, f(HEAT.lo), w, f(0) - f(HEAT.lo));
    g.fillStyle(0x4aa04a, 0.75).fillRect(x - w / 2, f(HEAT.hi), w, f(HEAT.lo) - f(HEAT.hi));
    g.fillStyle(0xd8502a, 0.7).fillRect(x - w / 2, f(130), w, f(HEAT.hi) - f(130));
    g.fillStyle(0x000000, 0.6).fillRect(x - w / 2, f(HEAT.burn) - 2, w, 4);
    const yy = f(this.heat);
    g.fillStyle(0xffffff, 1).fillTriangle(x - w / 2 - 16, yy - 9, x - w / 2 - 16, yy + 9, x - w / 2 - 2, yy);
    g.lineStyle(3, PAL.gold, 0.9).strokeRoundedRect(x - w / 2 - 6, y0 - 6, w + 12, h + 12, 10);
    const state = this.heat < HEAT.lo ? "too cold" : (this.heat > HEAT.hi ? "too hot!" : "heat");
    this.heatTxt.setText(state).setColor(this.heat < HEAT.lo ? "#9ad0ff" : (this.heat > HEAT.hi ? "#ff8a6a" : "#bff0a0")).setPosition(x, y0 - 34);
  }

  tick(time, d) {
    this.stokeCd = (this.stokeCd || 0) - d;
    if (this.fKey && Phaser.Input.Keyboard.JustDown(this.fKey)) this.stoke();
    if (!this.running) { this.drawGauge(); return; }
    this.heat -= HEAT.drift * d / 1000;
    if (this.heat < 0) this.heat = 0;
    const off = this.heat < HEAT.lo || this.heat > HEAT.hi;
    this.fireGlow.setAlpha(clamp(this.heat / 130, 0.15, 0.9));
    this.flames.setFrequency(this.heat < HEAT.lo ? 120 : (this.heat > HEAT.hi ? 14 : 30));
    this.drawGauge();
    if (!this.dish) return;
    if (this.heat >= HEAT.burn) { this.heat = HEAT.hi - 10; this.serve(false, "The fire's roaring - the " + this.dish.name + " is burnt!"); return; }
    this.timeLeft -= d * (off ? 2.2 : 1);
    const f = clamp(this.timeLeft / this.timeTotal, 0, 1);
    this.timeBar.width = 620 * f;
    this.timeBar.fillColor = off ? (Math.floor(time / 150) % 2 ? 0xd8502a : 0x9a3a1a) : (f < 0.3 ? 0xd8502a : 0xd9a441);
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
