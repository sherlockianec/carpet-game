// ============================================================
// SceneMiniGames.js — three arcade beats, all data-driven at the
// top of their class so difficulty is easy to re-tune later.
// ============================================================

// ---- Bakery: 50 loaves across three escalating paces. Heat
// drifts down on its own (a fire left untended dies) - stoke to
// warm it, vent to cool it, and keep it inside the marked safe
// band or a catch counts as a mistake even if it was on time.
// Too many mistakes in one pace tier, or too many overall, and
// the whole batch is ruined - start over from loaf one. ---------
const BAKERY_TIERS = [
  { count: 15, spawnMs: 780, burnMs: 2050, safeLo: 30, safeHi: 70, decay: 9, label: "Normal Pace" },
  { count: 15, spawnMs: 560, burnMs: 1550, safeLo: 34, safeHi: 66, decay: 13, label: "Faster!" },
  { count: 20, spawnMs: 430, burnMs: 1200, safeLo: 38, safeHi: 62, decay: 17, label: "Max Speed!" }
];
const BAKERY_TOTAL = BAKERY_TIERS.reduce((a, t) => a + t.count, 0);
const BAKERY_TIER_MISTAKE_CAP = 5;
const BAKERY_TOTAL_MISTAKE_CAP = 10;

class BakeryGameScene extends Phaser.Scene {
  constructor() { super("BakeryGameScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0xf2c98a, 0xd9873f);
    drawGround(this, 0x8a6a4a, H * 0.52, { flecks: 14 });

    this.add.text(W / 2, 24, "Keep the Ovens Fed", {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#3a2a1a", fontStyle: "bold",
      backgroundColor: "#ffffff55", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);
    drawClueHUD(this);

    this.slots = [
      { x: W * 0.30, y: H * 0.60 }, { x: W * 0.45, y: H * 0.60 },
      { x: W * 0.60, y: H * 0.60 }, { x: W * 0.75, y: H * 0.60 }
    ];
    this.slots.forEach(s => this.drawOven(s.x, s.y));

    const baker = makePerson(this, W * 0.92, H * 0.66, { robe: 0xc9a24b, skin: 0xdcbf8a, headwear: "doppi", mood: "worried" });
    baker.setDepth(Math.round(baker.y));
    addBreathing(this, baker.bodyGfx);

    this.loaves = [null, null, null, null];
    this.processed = 0; this.spawned = 0;
    this.tierMistakes = 0; this.totalMistakes = 0;
    this.tierIdx = 0; this.spawnTimer = 0; this.running = false; this.done = false;
    this.temp = 50; this.stokeCooldown = 0; this.ventCooldown = 0; this._lastDrawnTier = -1;

    this.buildHeatGauge();

    this.add.text(W / 2, H - 14, "Click each loaf before it burns. \u2191/\u2193 (or the flame/snowflake) keep heat in the marked band.", { fontSize: "12px", color: "#3a2a1a" })
      .setOrigin(0.5).setDepth(900);
    this.scoreText = this.add.text(W / 2, 52, "", { fontSize: "13px", color: "#3a2a1a", fontStyle: "bold" }).setOrigin(0.5).setDepth(900);
    this.updateScoreText();

    this.dbox = new DialogueBox(this);
    this.time.delayedCall(550, () => { this.running = true; });
  }

  drawOven(x, y) {
    const g = this.add.graphics().setDepth(1);
    const outer = archOutline(x, y + 20, 52, 42, 26);
    g.fillStyle(0x5a3f2e, 1);
    g.fillPoints(outer, true);
    g.lineStyle(3, INK, 1);
    g.strokePoints(outer, true);
    g.fillStyle(0x3a281c, 1);
    g.fillRect(x - 27, y + 34, 54, 8);
    const inner = archOutline(x, y + 16, 36, 30, 15);
    g.fillStyle(0xff9a3a, 0.9);
    g.fillPoints(inner, true);
    g.fillStyle(0xffe07a, 0.55);
    g.fillEllipse(x, y + 2, 22, 11);
  }

  buildHeatGauge() {
    const H = this.scale.height;
    const gx = 34, gy0 = H * 0.32, gy1 = H * 0.72;
    this.gaugeY0 = gy0; this.gaugeY1 = gy1;
    this.add.rectangle(gx, (gy0 + gy1) / 2, 16, gy1 - gy0, 0x2a2016).setStrokeStyle(2, 0x5a3f2e).setDepth(800);
    this.safeZoneRect = this.add.rectangle(gx, gy0, 16, 0, 0x3a8a4a, 0.45).setOrigin(0.5, 0).setDepth(801);
    this.tempFill = this.add.rectangle(gx, gy1, 12, 2, 0x2fb8ac).setOrigin(0.5, 1).setDepth(802);
    this.add.text(gx, gy0 - 66, "HEAT", { fontSize: "10px", color: "#3a2a1a", fontStyle: "bold" }).setOrigin(0.5).setDepth(800);

    this.stokeBtn = this.add.circle(gx, gy0 - 24, 14, 0xd9532a, 1).setStrokeStyle(2, 0x241811, 1).setDepth(802).setInteractive({ useHandCursor: true });
    const flameG = this.add.graphics().setDepth(803);
    flameG.fillStyle(0xffd27a, 1);
    flameG.fillTriangle(gx - 5, gy0 - 18, gx + 5, gy0 - 18, gx, gy0 - 32);
    flameG.fillStyle(0xfff3d0, 1);
    flameG.fillTriangle(gx - 2, gy0 - 20, gx + 2, gy0 - 20, gx, gy0 - 26);
    this.add.text(gx, gy0 - 46, "STOKE\n\u2191", { fontSize: "9px", color: "#3a2a1a", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(803);
    this.stokeBtn.on("pointerdown", () => this.stoke());

    this.ventBtn = this.add.circle(gx, gy1 + 24, 14, 0x2fb8ac, 1).setStrokeStyle(2, 0x241811, 1).setDepth(802).setInteractive({ useHandCursor: true });
    this.add.text(gx, gy1 + 24, "\u2744", { fontSize: "14px", color: "#0c1a18" }).setOrigin(0.5).setDepth(803);
    this.add.text(gx, gy1 + 44, "VENT\n\u2193", { fontSize: "9px", color: "#3a2a1a", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(803);
    this.ventBtn.on("pointerdown", () => this.vent());

    this.heatKeys = this.input.keyboard.addKeys({ up: "UP", down: "DOWN", w: "W", s: "S" });
    this._upWasDown = false; this._downWasDown = false;
  }

  stoke() {
    if (this.stokeCooldown > 0 || this.done || !this.running) return;
    this.temp = Math.min(100, this.temp + 17);
    this.stokeCooldown = 320;
    this.tweens.add({ targets: this.stokeBtn, scale: 1.25, duration: 100, yoyo: true });
  }

  vent() {
    if (this.ventCooldown > 0 || this.done || !this.running) return;
    this.temp = Math.max(0, this.temp - 17);
    this.ventCooldown = 320;
    this.cameras.main.flash(70, 100, 200, 210, false);
    this.tweens.add({ targets: this.ventBtn, scale: 1.25, duration: 100, yoyo: true });
  }

  updateScoreText() {
    this.scoreText.setText(
      `Loaves: ${this.processed} / ${BAKERY_TOTAL}   |   ruined this pace: ${this.tierMistakes}/${BAKERY_TIER_MISTAKE_CAP}   |   ruined total: ${this.totalMistakes}/${BAKERY_TOTAL_MISTAKE_CAP}`
    );
  }

  announceTier(label) {
    const W = this.scale.width, H = this.scale.height;
    const t = this.add.text(W / 2, H * 0.40, label, {
      fontFamily: "Georgia, serif", fontSize: "26px", color: "#ffffff", fontStyle: "bold",
      backgroundColor: "#000000aa", padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setDepth(950).setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: t, alpha: 1, scale: 1, duration: 200, onComplete: () => {
        this.time.delayedCall(700, () => this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }));
      }
    });
  }

  drawLoafGfx(g, state) {
    const palette = {
      good: { base: 0xd9a441, top: 0xf2e6c8, score: 0x8a5a2a },
      burnt: { base: 0x241a14, top: 0x3a2a1e, score: 0x0c0a08 },
      raw: { base: 0xe8dcc0, top: 0xf6ecd8, score: 0xcfc0a0 }
    };
    const c = palette[state] || palette.good;
    g.fillStyle(c.base, 1);
    g.fillEllipse(0, 0, 42, 25);
    g.lineStyle(2, INK, 1);
    g.strokeEllipse(0, 0, 42, 25);
    g.fillStyle(c.top, 0.45);
    g.fillEllipse(-3, -5, 20, 10);
    g.lineStyle(1.6, c.score, 0.75);
    for (let sx = -12; sx <= 12; sx += 8) { g.beginPath(); g.moveTo(sx, -9); g.lineTo(sx + 5, 9); g.strokePath(); }
  }

  spawnLoaf(i) {
    const s = this.slots[i];
    const tier = BAKERY_TIERS[this.tierIdx];
    const g = this.add.graphics();
    this.drawLoafGfx(g, "good");
    const c = this.add.container(s.x, s.y, [g]);
    c.setDepth(Math.round(s.y) + 2);
    makeClickable(c, 46, 32, () => this.catchLoaf(i));
    c.g = g;
    c.tier = tier;
    this.loaves[i] = c;
    c.burnEvt = this.time.delayedCall(tier.burnMs, () => this.burnLoaf(i));
  }

  catchLoaf(i) {
    const c = this.loaves[i];
    if (!c || this.done) return;
    c.burnEvt.remove(false);
    this.loaves[i] = null;
    const tier = c.tier;
    if (this.temp >= tier.safeLo && this.temp <= tier.safeHi) {
      this.goodCatch(c);
    } else {
      this.mistake(c, this.temp > tier.safeHi ? "burnt" : "raw");
    }
  }

  burnLoaf(i) {
    const c = this.loaves[i];
    if (!c) return;
    this.loaves[i] = null;
    this.mistake(c, "burnt");
  }

  goodCatch(c) {
    this.tweens.add({ targets: c, y: c.y - 30, alpha: 0, duration: 200, onComplete: () => c.destroy() });
    this.advance();
  }

  mistake(c, kind) {
    if (c) {
      c.g.clear();
      this.drawLoafGfx(c.g, kind);
      c.disableInteractive();
      if (kind === "burnt") {
        for (let k = 0; k < 3; k++) {
          const puff = this.add.circle(c.x + Phaser.Math.Between(-8, 8), c.y - 10, 4, 0x8a8a8a, 0.6).setDepth(c.depth + 1);
          this.tweens.add({ targets: puff, y: puff.y - 24, alpha: 0, scale: 1.8, duration: 500, onComplete: () => puff.destroy() });
        }
      }
      this.time.delayedCall(320, () => c.destroy());
    }
    this.tierMistakes++;
    this.totalMistakes++;
    this.updateScoreText();
    if (this.tierMistakes > BAKERY_TIER_MISTAKE_CAP) { this.failRun("Too much of this pace's batch was ruined."); return; }
    if (this.totalMistakes > BAKERY_TOTAL_MISTAKE_CAP) { this.failRun("Too many loaves ruined across the whole bake."); return; }
    this.advance();
  }

  advance() {
    this.processed++;
    this.updateScoreText();
    if (this.processed >= BAKERY_TOTAL) { this.finish(); return; }
    const newTierIdx = this.processed >= (BAKERY_TIERS[0].count + BAKERY_TIERS[1].count) ? 2 : (this.processed >= BAKERY_TIERS[0].count ? 1 : 0);
    if (newTierIdx !== this.tierIdx) {
      this.tierIdx = newTierIdx;
      this.tierMistakes = 0;
      this.announceTier(BAKERY_TIERS[newTierIdx].label);
    }
  }

  failRun(msg) {
    this.done = true; this.running = false;
    this.dbox.show([{ speaker: "", text: msg + " Let's start the batch over." }], () => this.scene.restart());
  }

  update(t, delta) {
    if (!this.running || this.done) return;
    if (this.heatKeys.up.isDown || this.heatKeys.w.isDown) this.stoke();
    if (this.heatKeys.down.isDown || this.heatKeys.s.isDown) this.vent();
    const tier = BAKERY_TIERS[this.tierIdx];
    this.temp = Phaser.Math.Clamp(this.temp - tier.decay * (delta / 1000), 0, 100);
    if (this.stokeCooldown > 0) this.stokeCooldown -= delta;
    if (this.ventCooldown > 0) this.ventCooldown -= delta;

    if (this._lastDrawnTier !== this.tierIdx) {
      this._lastDrawnTier = this.tierIdx;
      const topY = this.gaugeY1 - (this.gaugeY1 - this.gaugeY0) * (tier.safeHi / 100);
      const botY = this.gaugeY1 - (this.gaugeY1 - this.gaugeY0) * (tier.safeLo / 100);
      this.safeZoneRect.y = topY;
      this.safeZoneRect.height = botY - topY;
    }
    this.tempFill.height = Math.max(2, (this.gaugeY1 - this.gaugeY0) * (this.temp / 100));
    const inBand = this.temp >= tier.safeLo && this.temp <= tier.safeHi;
    this.tempFill.fillColor = inBand ? 0x2fb8ac : (this.temp > tier.safeHi ? 0xd9532a : 0x6a8ab5);

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0 && this.spawned < BAKERY_TOTAL) {
      const free = [];
      this.slots.forEach((s, i) => { if (!this.loaves[i]) free.push(i); });
      if (free.length) { this.spawnLoaf(Phaser.Utils.Array.GetRandom(free)); this.spawned++; }
      this.spawnTimer = tier.spawnMs;
    }
  }

  finish() {
    this.done = true; this.running = false;
    this.riverCutscene();
  }

  riverCutscene() {
    const W = this.scale.width, H = this.scale.height;
    const cartG = this.add.graphics();
    cartG.fillStyle(0x5a3f2a, 1);
    cartG.fillRoundedRect(-26, -16, 52, 26, 4);
    cartG.lineStyle(2, INK, 1);
    cartG.strokeRoundedRect(-26, -16, 52, 26, 4);
    cartG.fillStyle(0x2a1f16, 1);
    cartG.fillCircle(-14, 12, 8); cartG.fillCircle(14, 12, 8);
    cartG.lineStyle(1.6, 0xd9a441, 1);
    cartG.strokeCircle(-14, 12, 8); cartG.strokeCircle(14, 12, 8);
    const cart = this.add.container(W * 0.15, H * 0.55, [cartG]);
    this.add.rectangle(W / 2, H - 20, W, 40, 0x2f6f8a, 0.85).setDepth(500);
    this.tweens.add({
      targets: cart, x: W * 0.8, duration: 1500, onComplete: () => {
        for (let k = 0; k < 6; k++) {
          const lg = this.add.graphics();
          this.drawLoafGfx(lg, "good");
          const loaf = this.add.container(cart.x - 22 + k * 8, cart.y, [lg]).setScale(0.5);
          this.tweens.add({
            targets: loaf, y: H - 24, duration: 450, delay: k * 80, onComplete: () => {
              const splash = this.add.circle(loaf.x, H - 20, 4, 0xffffff, 0.7);
              this.tweens.add({ targets: splash, alpha: 0, scale: 2, duration: 350, onComplete: () => splash.destroy() });
              loaf.destroy();
            }
          });
        }
        this.time.delayedCall(1300, () => {
          this.dbox.show(STORY.bakery.outro, () => GameFlow.advance(this.scene));
        });
      }
    });
  }
}

// ---- Saddler: a real 24-piece assembly puzzle against a clock.
// Miss the timer and it resets with the tray reshuffled. ------
const SADDLE_PARTS = [
  { key: "horn", dx: 0, dy: -95, w: 16, h: 16, shape: "circle", color: 0xd9a441 },
  { key: "pommel", dx: 0, dy: -78, w: 50, h: 16, shape: "rect", color: 0x8a5a34 },
  { key: "blanket", dx: 0, dy: -64, w: 118, h: 12, shape: "rect", color: 0x9a3a3a },
  { key: "seat", dx: 0, dy: -46, w: 96, h: 32, shape: "rect", color: 0x6b4a2e },
  { key: "cantle", dx: 0, dy: -16, w: 66, h: 18, shape: "rect", color: 0x8a5a34 },
  { key: "conchoTL", dx: -26, dy: -38, w: 10, h: 10, shape: "circle", color: 0xd9a441 },
  { key: "conchoTR", dx: 26, dy: -38, w: 10, h: 10, shape: "circle", color: 0xd9a441 },
  { key: "frontJockeyL", dx: -46, dy: -28, w: 26, h: 22, shape: "rect", color: 0x7a5a3a },
  { key: "frontJockeyR", dx: 46, dy: -28, w: 26, h: 22, shape: "rect", color: 0x7a5a3a },
  { key: "rearJockeyL", dx: -46, dy: 2, w: 26, h: 22, shape: "rect", color: 0x7a5a3a },
  { key: "rearJockeyR", dx: 46, dy: 2, w: 26, h: 22, shape: "rect", color: 0x7a5a3a },
  { key: "conchoBL", dx: -26, dy: 0, w: 10, h: 10, shape: "circle", color: 0xd9a441 },
  { key: "conchoBR", dx: 26, dy: 0, w: 10, h: 10, shape: "circle", color: 0xd9a441 },
  { key: "skirtL", dx: -80, dy: -8, w: 30, h: 46, shape: "rect", color: 0x5a3f2a },
  { key: "skirtR", dx: 80, dy: -8, w: 30, h: 46, shape: "rect", color: 0x5a3f2a },
  { key: "girth", dx: 0, dy: 16, w: 70, h: 10, shape: "rect", color: 0x4a3320 },
  { key: "fenderL", dx: -58, dy: 30, w: 20, h: 38, shape: "rect", color: 0x6b4a2e },
  { key: "fenderR", dx: 58, dy: 30, w: 20, h: 38, shape: "rect", color: 0x6b4a2e },
  { key: "latigoL", dx: -30, dy: 22, w: 10, h: 30, shape: "rect", color: 0x4a3320 },
  { key: "latigoR", dx: 30, dy: 22, w: 10, h: 30, shape: "rect", color: 0x4a3320 },
  { key: "stirrupLeatherL", dx: -58, dy: 58, w: 10, h: 20, shape: "rect", color: 0x4a3320 },
  { key: "stirrupLeatherR", dx: 58, dy: 58, w: 10, h: 20, shape: "rect", color: 0x4a3320 },
  { key: "stirrupL", dx: -58, dy: 80, w: 26, h: 16, shape: "rect", color: 0x8a8a92 },
  { key: "stirrupR", dx: 58, dy: 80, w: 26, h: 16, shape: "rect", color: 0x8a8a92 },
  { key: "cinch", dx: 0, dy: 32, w: 40, h: 8, shape: "rect", color: 0x2a2018 }
];
const SADDLE_TIME_LIMIT_MS = 58000;

class SaddlerGameScene extends Phaser.Scene {
  constructor() { super("SaddlerGameScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0xead9b0, 0xb98a55);
    drawGround(this, 0x6b4a2e, H * 0.46, { flecks: 12 });
    this.add.text(W / 2, 24, "Assemble the Saddle", {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#2a1c10", fontStyle: "bold",
      backgroundColor: "#ffffff55", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);
    drawClueHUD(this);

    const saddler = makePerson(this, W * 0.92, H * 0.66, { robe: 0x6b4a2e, skin: 0xcfc3a8, headwear: "doppi", beard: true, mood: "neutral" });
    saddler.setDepth(Math.round(saddler.y));
    addBreathing(this, saddler.bodyGfx);

    this.timeLeft = SADDLE_TIME_LIMIT_MS;
    this.timerText = this.add.text(W / 2, 50, "1:00", { fontFamily: "Georgia, serif", fontSize: "16px", color: "#2a1c10", fontStyle: "bold" }).setOrigin(0.5).setDepth(900);
    this.progressText = this.add.text(W / 2, H - 20, `0 / ${SADDLE_PARTS.length} placed - click a piece, then its outline.`, { fontSize: "12px", color: "#2a1c10" }).setOrigin(0.5).setDepth(900);

    const cx = W * 0.5, cy = H * 0.36;
    this.slotDefs = SADDLE_PARTS.map(p => ({ key: p.key, x: cx + p.dx, y: cy + p.dy, w: p.w, h: p.h, shape: p.shape }));
    this.filled = {};
    this.slotDefs.forEach(s => {
      const g = this.add.graphics().setDepth(2);
      this.drawOutline(g, s.x, s.y, s.w, s.h, s.shape, 0xffffff);
      s.outlineG = g;
      const hit = this.add.rectangle(s.x, s.y, s.w + 10, s.h + 10, 0x000000, 0.001).setDepth(3).setInteractive();
      hit.on("pointerdown", () => this.placeSelected(s));
    });

    // reshuffled every time this scene is created - including on a
    // timeout retry - so a memorized tray order never trivializes it.
    const shuffled = Phaser.Utils.Array.Shuffle(SADDLE_PARTS.slice());
    const cols = 8, cellW = 92, cellH = 50;
    const trayStartX = W / 2 - (cols - 1) * cellW / 2, trayStartY = H * 0.68;
    this.selected = null;
    this.placedCount = 0;
    this.locked = false;
    this.parts = shuffled.map((p, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      return this.makePiece(p, trayStartX + col * cellW, trayStartY + row * cellH);
    });

    this.dbox = new DialogueBox(this);
  }

  drawFilled(g, w, h, shape, color) {
    if (shape === "circle") {
      g.fillStyle(color, 1); g.fillCircle(0, 0, w / 2);
      g.lineStyle(1.6, INK, 1); g.strokeCircle(0, 0, w / 2);
    } else {
      g.fillStyle(color, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
      g.lineStyle(1.4, INK, 1); g.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
      g.fillStyle(0xffffff, 0.16); g.fillRect(-w / 2 + 1.5, -h / 2 + 1.5, w - 3, Math.max(2, h * 0.32));
    }
  }

  drawOutline(g, x, y, w, h, shape, color) {
    g.clear();
    g.lineStyle(2.4, color, 0.95);
    if (shape === "circle") g.strokeCircle(x, y, w / 2 + 3);
    else g.strokeRoundedRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 5);
  }

  makePiece(p, x, y) {
    const w = p.w * 0.6, h = p.h * 0.6;
    const g = this.add.graphics();
    this.drawFilled(g, w, h, p.shape, p.color);
    const outline = this.add.graphics();
    if (p.shape === "circle") { outline.lineStyle(2.4, 0xffffff, 1); outline.strokeCircle(0, 0, w / 2 + 3); }
    else { outline.lineStyle(2.4, 0xffffff, 1); outline.strokeRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 5); }
    outline.setVisible(false);
    const c = this.add.container(x, y, [g, outline]).setDepth(4);
    c.pieceKey = p.key; c.homeX = x; c.homeY = y; c.outlineG = outline;
    const hitW = Math.max(28, w + 8), hitH = Math.max(22, h + 8);
    c.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
    c.on("pointerdown", () => { if (!this.locked) this.selectPart(c); });
    return c;
  }

  selectPart(r) {
    if (this.filled[r.pieceKey]) return;
    if (this.selected) this.selected.outlineG.setVisible(false);
    this.selected = r;
    r.outlineG.setVisible(true);
  }

  placeSelected(slot) {
    if (this.locked || !this.selected) return;
    if (this.selected.pieceKey === slot.key && !this.filled[slot.key]) {
      const part = this.selected;
      this.tweens.add({ targets: part, x: slot.x, y: slot.y, duration: 180 });
      this.filled[slot.key] = true;
      this.drawOutline(slot.outlineG, slot.x, slot.y, slot.w, slot.h, slot.shape, 0x2fb8ac);
      part.disableInteractive();
      part.outlineG.setVisible(false);
      this.selected = null;
      this.placedCount++;
      this.progressText.setText(`${this.placedCount} / ${this.slotDefs.length} placed - click a piece, then its outline.`);
      if (this.placedCount === this.slotDefs.length) this.finish();
    } else if (this.selected) {
      this.tweens.add({ targets: this.selected, x: this.selected.homeX, y: this.selected.homeY, duration: 130 });
      this.selected.outlineG.setVisible(false);
      this.selected = null;
      this.timeLeft = Math.max(0, this.timeLeft - 2000);
      this.cameras.main.flash(60, 200, 60, 60, false);
    }
  }

  update(t, delta) {
    if (this.locked) return;
    this.timeLeft -= delta;
    const secs = Math.max(0, Math.ceil(this.timeLeft / 1000));
    this.timerText.setText(Math.floor(secs / 60) + ":" + (secs % 60).toString().padStart(2, "0"));
    this.timerText.setColor(secs <= 10 ? "#d9532a" : "#2a1c10");
    if (this.timeLeft <= 0) {
      this.locked = true;
      this.dbox.show([{ speaker: "", text: "Time's up. Let's lay the pieces out again." }], () => this.scene.restart());
    }
  }

  finish() {
    this.locked = true;
    this.time.delayedCall(400, () => {
      this.dbox.show(STORY.saddler.outro, () => GameFlow.advance(this.scene));
    });
  }
}

// ---- Kitchen: a rotating pool of 20 ingredients. Each pace tier
// shows more options at once (6 -> 10) and keeps most of the
// previous tier's set plus one new ingredient, so the board is
// never a total reset, only a growing one. 20 rounds total. -----
const KITCHEN_POOL = [
  { key: "rice", glyph: "grain", color: 0xe8d9a0 },
  { key: "bread", glyph: "loaf", color: 0xc9a24b },
  { key: "meat", glyph: "dot", color: 0x8a3a2a },
  { key: "mint", glyph: "leafCluster", color: 0x3a8a4a },
  { key: "basil", glyph: "leaf", color: 0x2a6a3a },
  { key: "cheese", glyph: "wedge", color: 0xf2e6a0 },
  { key: "lemon", glyph: "wedge", color: 0xe8d94a },
  { key: "garlic", glyph: "bulb", color: 0xf2ece0 },
  { key: "onion", glyph: "bulb", color: 0x8a5a9a },
  { key: "nuts", glyph: "bulb", color: 0x8a6a4a },
  { key: "honey", glyph: "drop", color: 0xd9a441 },
  { key: "oil", glyph: "drop", color: 0x6a7a3a },
  { key: "tomato", glyph: "star", color: 0xc9382a },
  { key: "pomegranate", glyph: "star", color: 0x8a2a3a },
  { key: "tea", glyph: "cup", color: 0xa86a3a },
  { key: "yogurt", glyph: "cup", color: 0xf2ece0 },
  { key: "carrot", glyph: "carrot", color: 0xd9722a },
  { key: "pepper", glyph: "pepper", color: 0xd9302a },
  { key: "egg", glyph: "oval", color: 0xf2e6c8 },
  { key: "fish", glyph: "fish", color: 0x7a9ab5 }
];
const KITCHEN_TIER_SIZES = [6, 7, 8, 9, 10];
const KITCHEN_ROUNDS_PER_TIER = 4;
const KITCHEN_TOTAL_ROUNDS = KITCHEN_TIER_SIZES.length * KITCHEN_ROUNDS_PER_TIER;

class KitchenGameScene extends Phaser.Scene {
  constructor() { super("KitchenGameScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x3a2a44, 0x171025);
    drawGround(this, 0x2a2036, H * 0.5, { texture: false });
    this.add.text(W / 2, 24, "The Palace Kitchen", {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#f6ecd8", fontStyle: "bold",
      backgroundColor: "#00000055", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);
    drawClueHUD(this);

    const counter = this.add.graphics().setDepth(1);
    counter.fillStyle(0x4a3a2a, 1);
    counter.fillRoundedRect(W * 0.10, H * 0.64, W * 0.80, 20, 4);
    counter.lineStyle(2, 0x2a2018, 1);
    counter.strokeRoundedRect(W * 0.10, H * 0.64, W * 0.80, 20, 4);

    const cook = makePerson(this, W * 0.92, H * 0.62, { robe: 0x8a3a2a, skin: 0xd9c9a8, headwear: "doppi", mood: "stern" });
    cook.setDepth(Math.round(cook.y));
    addBreathing(this, cook.bodyGfx);

    this.orderText = this.add.text(W / 2, H * 0.36, "", { fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(900);
    this.orderPlate = this.add.circle(W / 2, H * 0.23, 30, 0xffffff, 0.15).setStrokeStyle(2, 0xffffff, 0.6).setDepth(2);
    this.timeBarBg = this.add.rectangle(W / 2, H * 0.295, 144, 10, 0x000000, 0.35).setDepth(899);
    this.timeBar = this.add.rectangle(W / 2, H * 0.295, 140, 8, 0xd9a441).setOrigin(0.5).setDepth(900);
    this.roundText = this.add.text(W / 2, H * 0.42, "", { fontSize: "12px", color: "#cfc3d8" }).setOrigin(0.5).setDepth(900);

    this.pool = KITCHEN_POOL;
    this.tierIdx = 0;
    this.round = 0;
    this.score = 0;
    this.needed = 14;
    this.locked = true;
    this.displayed = [];
    this.ingredientObjs = [];
    this.buildTierSubset();
    this.renderIngredientRow();

    this.dbox = new DialogueBox(this);
    this.dbox.show(STORY.kitchen.intro, () => { this.locked = false; this.nextOrder(); });
  }

  buildTierSubset() {
    const size = KITCHEN_TIER_SIZES[this.tierIdx];
    if (this.displayed.length === 0) {
      this.displayed = Phaser.Utils.Array.Shuffle(this.pool.map(p => p.key)).slice(0, size);
    } else {
      const remaining = this.pool.map(p => p.key).filter(k => !this.displayed.includes(k));
      const addKey = Phaser.Utils.Array.GetRandom(remaining);
      this.displayed = this.displayed.concat([addKey]);
    }
  }

  computePositions(n) {
    const W = this.scale.width, H = this.scale.height;
    const y = H * 0.60;
    if (n <= 6) {
      const spacing = Math.min(120, (W * 0.82) / Math.max(1, n - 1));
      const startX = W / 2 - (n - 1) * spacing / 2;
      return Array.from({ length: n }, (_, i) => ({ x: startX + i * spacing, y }));
    }
    const row1 = Math.ceil(n / 2), row2 = n - row1;
    const y0 = y - 32, y1 = y + 32;
    const sp1 = Math.min(112, (W * 0.84) / Math.max(1, row1 - 1));
    const sp2 = Math.min(112, (W * 0.84) / Math.max(1, row2 - 1));
    const startX1 = W / 2 - (row1 - 1) * sp1 / 2, startX2 = W / 2 - (row2 - 1) * sp2 / 2;
    const pos = [];
    for (let i = 0; i < row1; i++) pos.push({ x: startX1 + i * sp1, y: y0 });
    for (let i = 0; i < row2; i++) pos.push({ x: startX2 + i * sp2, y: y1 });
    return pos;
  }

  drawGlyph(x, y, glyph) {
    const g = this.add.graphics().setDepth(3);
    const ink = 0x241811;
    if (glyph === "grain") { g.fillStyle(ink, 0.85); for (let i = -1; i <= 1; i++) g.fillEllipse(x + i * 7, y, 5, 11); }
    else if (glyph === "loaf") {
      g.fillStyle(ink, 0.85); g.fillEllipse(x, y, 24, 14);
      g.lineStyle(1.6, 0xf2e6c8, 0.9);
      g.beginPath(); g.moveTo(x - 6, y - 4); g.lineTo(x - 1, y + 4); g.strokePath();
      g.beginPath(); g.moveTo(x + 2, y - 4); g.lineTo(x + 7, y + 4); g.strokePath();
    } else if (glyph === "dot") { g.fillStyle(ink, 0.85); g.fillCircle(x, y, 9); g.fillStyle(0xf2ece0, 0.9); g.fillCircle(x, y, 3); }
    else if (glyph === "leaf") {
      g.fillStyle(ink, 0.85); g.fillTriangle(x, y - 10, x - 7, y + 8, x + 7, y + 8);
      g.lineStyle(1.4, 0x1c5a2a, 0.9); g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y + 6); g.strokePath();
    } else if (glyph === "leafCluster") { for (let i = -1; i <= 1; i++) { g.fillStyle(ink, 0.85); g.fillTriangle(x + i * 7, y - 6, x + i * 7 - 4, y + 6, x + i * 7 + 4, y + 6); } }
    else if (glyph === "wedge") {
      g.fillStyle(ink, 0.85); g.fillTriangle(x - 9, y + 8, x + 9, y + 8, x, y - 9);
      g.fillStyle(0xffffff, 0.35); g.fillCircle(x - 2, y + 2, 1.6); g.fillCircle(x + 2, y - 1, 1.6);
    } else if (glyph === "bulb") { g.fillStyle(ink, 0.85); g.fillCircle(x - 4, y + 2, 6); g.fillCircle(x + 4, y + 2, 6); g.fillCircle(x, y - 4, 6); }
    else if (glyph === "drop") { g.fillStyle(ink, 0.85); g.fillTriangle(x - 6, y, x + 6, y, x, y - 10); g.fillCircle(x, y + 2, 6); }
    else if (glyph === "star") { g.fillStyle(ink, 0.85); g.fillCircle(x, y, 9); g.fillStyle(0x1c5a2a, 0.9); g.fillTriangle(x - 4, y - 8, x, y - 14, x + 4, y - 8); }
    else if (glyph === "cup") {
      g.fillStyle(ink, 0.85); g.fillRoundedRect(x - 8, y - 6, 16, 14, 3);
      g.lineStyle(1.6, ink, 0.85); g.beginPath(); g.arc(x + 10, y - 1, 4, -1.4, 1.4); g.strokePath();
    } else if (glyph === "carrot") {
      g.fillStyle(ink, 0.85); g.fillTriangle(x - 7, y - 6, x + 7, y - 6, x, y + 10);
      g.fillStyle(0x1c5a2a, 0.9); g.fillTriangle(x - 2, y - 10, x + 2, y - 10, x, y - 4);
    } else if (glyph === "pepper") {
      g.lineStyle(4, ink, 0.85);
      g.beginPath(); g.moveTo(x - 8, y - 6); g.lineTo(x + 2, y + 2); g.lineTo(x - 2, y + 8); g.lineTo(x + 8, y + 2); g.strokePath();
    } else if (glyph === "oval") { g.fillStyle(ink, 0.85); g.fillEllipse(x, y, 16, 20); }
    else if (glyph === "fish") {
      g.fillStyle(ink, 0.85); g.fillEllipse(x - 2, y, 18, 10);
      g.fillTriangle(x + 9, y, x + 18, y - 6, x + 18, y + 6);
      g.fillStyle(0xffffff, 0.7); g.fillCircle(x - 8, y - 1, 1.6);
    }
    return g;
  }

  renderIngredientRow() {
    this.ingredientObjs.forEach(o => { o.circle.destroy(); if (o.glyphG) o.glyphG.destroy(); });
    this.ingredientObjs = [];
    const positions = this.computePositions(this.displayed.length);
    const order = Phaser.Utils.Array.Shuffle(this.displayed.slice());
    order.forEach((key, i) => {
      const def = this.pool.find(p => p.key === key);
      const pos = positions[i];
      const circle = this.add.circle(pos.x, pos.y, 26, def.color).setStrokeStyle(2.4, INK, 1).setDepth(2).setInteractive({ useHandCursor: true });
      const glyphG = this.drawGlyph(pos.x, pos.y, def.glyph);
      circle.on("pointerdown", () => this.tryServe(key));
      this.ingredientObjs.push({ key, circle, glyphG });
    });
  }

  nextOrder() {
    if (this.round >= KITCHEN_TOTAL_ROUNDS) { this.finish(); return; }
    const newTierIdx = Math.floor(this.round / KITCHEN_ROUNDS_PER_TIER);
    if (newTierIdx !== this.tierIdx) {
      this.tierIdx = newTierIdx;
      this.buildTierSubset();
      this.renderIngredientRow();
    }
    this.round++;
    this.roundText.setText(`Round ${this.round} / ${KITCHEN_TOTAL_ROUNDS}   -   ${this.displayed.length} ingredients on the counter`);
    this.current = Phaser.Utils.Array.GetRandom(this.displayed);
    const match = this.pool.find(p => p.key === this.current);
    this.orderPlate.fillColor = match.color;
    this.orderText.setText("Order: " + this.current);
    const ramp = Math.max(950, 2300 - this.round * 70);
    this.timeLeft = ramp; this.timeTotal = ramp;
  }

  tryServe(key) {
    if (this.locked || !this.current) return;
    const match = this.ingredientObjs.find(o => o.key === key);
    if (key === this.current) {
      this.score++;
      if (match) this.tweens.add({ targets: match.circle, scale: 1.25, duration: 90, yoyo: true });
    } else {
      this.cameras.main.shake(80, 0.006);
    }
    this.current = null;
    this.time.delayedCall(200, () => this.nextOrder());
  }

  update(t, delta) {
    if (this.locked || !this.current) return;
    this.timeLeft -= delta;
    this.timeBar.width = Math.max(0, 140 * (this.timeLeft / this.timeTotal));
    if (this.timeLeft <= 0) { this.current = null; this.time.delayedCall(150, () => this.nextOrder()); }
  }

  finish() {
    this.locked = true;
    if (this.score < this.needed) {
      this.dbox.show([{ speaker: "", text: "The head cook scowls. Try again." }], () => this.scene.restart());
      return;
    }
    this.dbox.show(STORY.kitchen.outro, () => GameFlow.advance(this.scene));
  }
}
