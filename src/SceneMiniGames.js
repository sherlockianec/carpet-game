// ============================================================
// SceneMiniGames.js — three short, low-stakes arcade beats.
// Each is a single self-contained Phaser Scene.
// ============================================================

// ---- Bakery: keep the ovens fed AND the heat under control,
// then a short cutscene of the cart tipping bread into the
// river. Two things to juggle now, not just one. -------------
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
      { x: W * 0.26, y: H * 0.60 }, { x: W * 0.42, y: H * 0.60 },
      { x: W * 0.58, y: H * 0.60 }, { x: W * 0.74, y: H * 0.60 }
    ];
    this.slots.forEach(s => this.drawOven(s.x, s.y));

    const baker = makePerson(this, W * 0.91, H * 0.66, { robe: 0xc9a24b, skin: 0xdcbf8a, headwear: "doppi", mood: "worried" });
    baker.setDepth(Math.round(baker.y));
    addBreathing(this, baker.bodyGfx);

    this.loaves = [null, null, null, null];
    this.hits = 0; this.spawned = 0; this.maxSpawn = 16; this.needed = 11;
    this.spawnTimer = 0; this.running = false; this.done = false;

    this.temp = 42;
    this.buildHeatGauge();

    this.add.text(W / 2, H - 14, "Click each loaf before it burns - vent the oven when it runs hot!", { fontSize: "13px", color: "#3a2a1a" })
      .setOrigin(0.5).setDepth(900);
    this.scoreText = this.add.text(W / 2, 56, "Batches saved: 0 / 16", { fontSize: "14px", color: "#3a2a1a", fontStyle: "bold" })
      .setOrigin(0.5).setDepth(900);

    this.dbox = new DialogueBox(this);
    this.time.delayedCall(550, () => { this.running = true; });
  }

  drawOven(x, y) {
    const g = this.add.graphics().setDepth(1);
    const outer = archOutline(x, y + 20, 58, 44, 28);
    g.fillStyle(0x5a3f2e, 1);
    g.fillPoints(outer, true);
    g.lineStyle(3, INK, 1);
    g.strokePoints(outer, true);
    g.fillStyle(0x3a281c, 1);
    g.fillRect(x - 30, y + 34, 60, 8);
    const inner = archOutline(x, y + 16, 40, 32, 16);
    g.fillStyle(0xff9a3a, 0.9);
    g.fillPoints(inner, true);
    g.fillStyle(0xffe07a, 0.55);
    g.fillEllipse(x, y + 2, 24, 12);
  }

  buildHeatGauge() {
    const H = this.scale.height;
    const gx = 34, gy0 = H * 0.30, gy1 = H * 0.76;
    this.gaugeY0 = gy0; this.gaugeY1 = gy1;
    this.add.rectangle(gx, (gy0 + gy1) / 2, 16, gy1 - gy0, 0x2a2016).setStrokeStyle(2, 0x5a3f2e).setDepth(800);
    this.add.rectangle(gx, gy0 + (gy1 - gy0) * 0.18, 16, (gy1 - gy0) * 0.35, 0x3a8a4a, 0.35).setDepth(801);
    this.tempFill = this.add.rectangle(gx, gy1, 12, 2, 0x2fb8ac).setOrigin(0.5, 1).setDepth(802);
    this.add.text(gx, gy0 - 16, "HEAT", { fontSize: "10px", color: "#3a2a1a", fontStyle: "bold" }).setOrigin(0.5).setDepth(800);
    this.ventBtn = this.add.circle(gx, gy1 + 28, 15, 0x2fb8ac, 1).setStrokeStyle(2, 0x241811, 1).setDepth(802).setInteractive({ useHandCursor: true });
    this.add.text(gx, gy1 + 28, "\u2744", { fontSize: "15px", color: "#0c1a18" }).setOrigin(0.5).setDepth(803);
    this.ventBtn.on("pointerdown", () => this.vent());
    this.ventCooldown = 0;
  }

  vent() {
    if (this.ventCooldown > 0 || this.done || !this.running) return;
    this.temp = Math.max(0, this.temp - 28);
    this.ventCooldown = 480;
    this.cameras.main.flash(90, 100, 200, 210, false);
    this.tweens.add({ targets: this.ventBtn, scale: 1.25, duration: 100, yoyo: true });
  }

  update(t, delta) {
    if (!this.running || this.done) return;
    this.temp = Math.min(100, this.temp + delta * 0.0062);
    if (this.ventCooldown > 0) this.ventCooldown -= delta;
    const h = Math.max(2, (this.gaugeY1 - this.gaugeY0) * (this.temp / 100));
    this.tempFill.height = h;
    this.tempFill.fillColor = this.temp > 75 ? 0xd9532a : (this.temp > 48 ? 0xd9a441 : 0x2fb8ac);

    const rate = Math.max(420, 760 - this.spawned * 22);
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0 && this.spawned < this.maxSpawn) {
      const free = [];
      this.slots.forEach((s, i) => { if (!this.loaves[i]) free.push(i); });
      if (free.length) { this.spawnLoaf(Phaser.Utils.Array.GetRandom(free)); this.spawned++; }
      this.spawnTimer = rate;
    }
    if (this.spawned >= this.maxSpawn && !this.loaves.some(l => l) && !this.done) this.finish();
  }

  drawLoafGfx(g, color) {
    g.fillStyle(color, 1);
    g.fillEllipse(0, 0, 42, 25);
    g.lineStyle(2, INK, 1);
    g.strokeEllipse(0, 0, 42, 25);
    g.fillStyle(0xf2e6c8, 0.45);
    g.fillEllipse(-3, -5, 20, 10);
    g.lineStyle(1.6, 0x8a5a2a, 0.75);
    for (let sx = -12; sx <= 12; sx += 8) { g.beginPath(); g.moveTo(sx, -9); g.lineTo(sx + 5, 9); g.strokePath(); }
  }

  spawnLoaf(i) {
    const s = this.slots[i];
    const g = this.add.graphics();
    this.drawLoafGfx(g, 0xd9a441);
    const c = this.add.container(s.x, s.y, [g]);
    c.setDepth(Math.round(s.y) + 2);
    makeClickable(c, 46, 32, () => this.catchLoaf(i));
    c.g = g;
    this.loaves[i] = c;
    const burnMs = Math.max(1000, 1850 - (this.temp - 42) * 9);
    c.burnEvt = this.time.delayedCall(burnMs, () => this.burnLoaf(i));
  }

  catchLoaf(i) {
    const c = this.loaves[i];
    if (!c) return;
    c.burnEvt.remove(false);
    this.hits++;
    this.scoreText.setText("Batches saved: " + this.hits + " / 16");
    this.loaves[i] = null;
    this.tweens.add({ targets: c, y: c.y - 30, alpha: 0, duration: 220, onComplete: () => c.destroy() });
  }

  burnLoaf(i) {
    const c = this.loaves[i];
    if (!c) return;
    this.loaves[i] = null;
    c.g.clear();
    this.drawLoafGfx(c.g, 0x241a14);
    c.disableInteractive();
    for (let k = 0; k < 3; k++) {
      const puff = this.add.circle(c.x + Phaser.Math.Between(-8, 8), c.y - 10, 4, 0x8a8a8a, 0.6).setDepth(c.depth + 1);
      this.tweens.add({ targets: puff, y: puff.y - 24, alpha: 0, scale: 1.8, duration: 500, onComplete: () => puff.destroy() });
    }
    this.time.delayedCall(300, () => c.destroy());
  }

  finish() {
    this.done = true;
    if (this.hits < this.needed) {
      this.dbox.show([{ speaker: "", text: "The batch is ruined. Let's try again." }], () => this.scene.restart());
      return;
    }
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
        for (let k = 0; k < 5; k++) {
          const lg = this.add.graphics();
          this.drawLoafGfx(lg, 0xd9a441);
          const loaf = this.add.container(cart.x - 20 + k * 8, cart.y, [lg]).setScale(0.5);
          this.tweens.add({
            targets: loaf, y: H - 24, duration: 450, delay: k * 90, onComplete: () => {
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

// ---- Saddler: click a part, click its outline, done. --------
class SaddlerGameScene extends Phaser.Scene {
  constructor() { super("SaddlerGameScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0xead9b0, 0xb98a55);
    drawGround(this, 0x6b4a2e, H * 0.5, { flecks: 16 });
    this.add.text(W / 2, 24, "Assemble the Saddle", {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#2a1c10", fontStyle: "bold",
      backgroundColor: "#ffffff55", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);
    drawClueHUD(this);

    // workbench backdrop + the saddler watching
    const bench = this.add.graphics().setDepth(1);
    bench.fillStyle(0x4a3320, 1);
    bench.fillRoundedRect(W * 0.5 - 160, H * 0.62, 320, 14, 3);
    bench.fillRect(W * 0.5 - 148, H * 0.62 + 14, 10, 40);
    bench.fillRect(W * 0.5 + 138, H * 0.62 + 14, 10, 40);
    const saddler = makePerson(this, W * 0.90, H * 0.68, { robe: 0x6b4a2e, skin: 0xcfc3a8, headwear: "doppi", beard: true, holding: "none", mood: "neutral" });
    saddler.setDepth(Math.round(saddler.y));
    addBreathing(this, saddler.bodyGfx);

    this.slotDefs = [
      { key: "frame", x: W * 0.5, y: H * 0.40, w: 140, h: 30 },
      { key: "seat", x: W * 0.5, y: H * 0.505, w: 104, h: 22 },
      { key: "panel", x: W * 0.5, y: H * 0.585, w: 44, h: 20 }
    ];
    this.filled = {};
    this.slotDefs.forEach(s => {
      const g = this.add.graphics().setDepth(2);
      g.lineStyle(2, 0xffffff, 0.5);
      g.strokeRoundedRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h, 8);
      s.outlineG = g;
      this.add.rectangle(s.x, s.y, s.w + 18, s.h + 18, 0x000000, 0.001).setDepth(3).setInteractive().on("pointerdown", () => this.placeSelected(s));
    });

    const tray = [
      { key: "frame", color: 0x6b4a2e, x: W * 0.20, y: H * 0.80, w: 92, h: 22 },
      { key: "seat", color: 0xc9a24b, x: W * 0.42, y: H * 0.80, w: 70, h: 18 },
      { key: "panel", color: 0x8a5a34, x: W * 0.60, y: H * 0.80, w: 36, h: 16 }
    ];
    this.selected = null;
    this.parts = tray.map(p => this.makePart(p));

    this.add.text(W / 2, H - 20, "Click a part, then click its outline.", { fontSize: "13px", color: "#2a1c10" }).setOrigin(0.5).setDepth(900);

    this.dbox = new DialogueBox(this);
    this.locked = true;
    this.time.delayedCall(400, () => { this.locked = false; });
  }

  makePart(p) {
    const g = this.add.graphics();
    g.fillStyle(p.color, 1);
    g.fillRoundedRect(-p.w / 2, -p.h / 2, p.w, p.h, 7);
    g.lineStyle(2, INK, 1);
    g.strokeRoundedRect(-p.w / 2, -p.h / 2, p.w, p.h, 7);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-p.w / 2 + 3, -p.h / 2 + 2, p.w - 6, p.h * 0.35, 4);
    const outline = this.add.graphics();
    outline.lineStyle(3, 0xffffff, 1);
    outline.strokeRoundedRect(-p.w / 2 - 3, -p.h / 2 - 3, p.w + 6, p.h + 6, 9);
    outline.setVisible(false);
    const c = this.add.container(p.x, p.y, [g, outline]).setDepth(4);
    c.pieceKey = p.key; c.homeX = p.x; c.homeY = p.y; c.outlineG = outline;
    c.setSize(p.w, p.h);
    c.setInteractive(new Phaser.Geom.Rectangle(-p.w / 2, -p.h / 2, p.w, p.h), Phaser.Geom.Rectangle.Contains);
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
      this.tweens.add({ targets: part, x: slot.x, y: slot.y, duration: 200 });
      this.filled[slot.key] = true;
      slot.outlineG.clear();
      slot.outlineG.lineStyle(3, 0x2fb8ac, 1);
      slot.outlineG.strokeRoundedRect(slot.x - slot.w / 2, slot.y - slot.h / 2, slot.w, slot.h, 8);
      part.disableInteractive();
      part.outlineG.setVisible(false);
      this.selected = null;
      if (Object.keys(this.filled).length === this.slotDefs.length) this.finish();
    } else if (this.selected) {
      this.tweens.add({ targets: this.selected, x: this.selected.homeX, y: this.selected.homeY, duration: 150 });
      this.selected.outlineG.setVisible(false);
      this.selected = null;
    }
  }

  finish() {
    this.locked = true;
    this.time.delayedCall(400, () => {
      this.dbox.show(STORY.saddler.outro, () => GameFlow.advance(this.scene));
    });
  }
}

// ---- Kitchen: match the order to the ingredient in time. ----
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

    // counter backdrop
    const counter = this.add.graphics().setDepth(1);
    counter.fillStyle(0x4a3a2a, 1);
    counter.fillRoundedRect(W * 0.14, H * 0.66, W * 0.72, 20, 4);
    counter.lineStyle(2, 0x2a2018, 1);
    counter.strokeRoundedRect(W * 0.14, H * 0.66, W * 0.72, 20, 4);

    this.ingredients = [
      { key: "rice", color: 0xe8d9a0, glyph: "grain", x: W * 0.28 },
      { key: "bread", color: 0xc9a24b, glyph: "loaf", x: W * 0.42 },
      { key: "meat", color: 0x8a3a2a, glyph: "meat", x: W * 0.58 },
      { key: "herb", color: 0x3a8a4a, glyph: "herb", x: W * 0.72 }
    ];
    this.ingredients.forEach(i => {
      const c = this.add.circle(i.x, H * 0.72, 27, i.color).setStrokeStyle(2.4, INK, 1).setInteractive({ useHandCursor: true }).setDepth(2);
      this.drawGlyph(i.x, H * 0.72, i.glyph);
      c.on("pointerdown", () => this.tryServe(i.key));
      c.baseY = H * 0.72;
      i.obj = c;
    });

    this.orderText = this.add.text(W / 2, H * 0.40, "", { fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(900);
    this.orderPlate = this.add.circle(W / 2, H * 0.27, 30, 0xffffff, 0.15).setStrokeStyle(2, 0xffffff, 0.6).setDepth(2);
    this.timeBarBg = this.add.rectangle(W / 2, H * 0.335, 144, 10, 0x000000, 0.35).setDepth(899);
    this.timeBar = this.add.rectangle(W / 2, H * 0.335, 140, 8, 0xd9a441).setOrigin(0.5).setDepth(900);

    this.score = 0; this.round = 0; this.maxRounds = 8; this.needed = 6; this.locked = true;

    const cook = makePerson(this, W * 0.90, H * 0.66, { robe: 0x8a3a2a, skin: 0xd9c9a8, headwear: "doppi", mood: "stern" });
    cook.setDepth(Math.round(cook.y));
    addBreathing(this, cook.bodyGfx);

    this.dbox = new DialogueBox(this);
    this.dbox.show(STORY.kitchen.intro, () => { this.locked = false; this.nextOrder(); });
  }

  drawGlyph(x, y, glyph) {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(2, 0x241811, 0.85);
    g.fillStyle(0x241811, 0.85);
    if (glyph === "grain") {
      for (let i = -1; i <= 1; i++) g.fillEllipse(x + i * 7, y, 5, 11);
    } else if (glyph === "loaf") {
      g.fillEllipse(x, y, 24, 14);
      g.lineStyle(1.6, 0xf2e6c8, 0.9);
      g.beginPath(); g.moveTo(x - 6, y - 4); g.lineTo(x - 1, y + 4); g.strokePath();
      g.beginPath(); g.moveTo(x + 2, y - 4); g.lineTo(x + 7, y + 4); g.strokePath();
    } else if (glyph === "meat") {
      g.fillCircle(x, y, 9);
      g.fillStyle(0xf2ece0, 0.9);
      g.fillCircle(x, y, 3);
    } else {
      g.fillTriangle(x, y - 10, x - 7, y + 8, x + 7, y + 8);
      g.lineStyle(1.4, 0x1c5a2a, 0.9);
      g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y + 6); g.strokePath();
    }
  }

  nextOrder() {
    if (this.round >= this.maxRounds) { this.finish(); return; }
    this.round++;
    this.current = Phaser.Utils.Array.GetRandom(this.ingredients).key;
    const match = this.ingredients.find(i => i.key === this.current);
    this.orderPlate.fillColor = match.color;
    this.orderText.setText("Order: " + this.current);
    const ramp = Math.max(1300, 2200 - this.round * 90);
    this.timeLeft = ramp;
    this.timeTotal = ramp;
  }

  tryServe(key) {
    if (this.locked || !this.current) return;
    const match = this.ingredients.find(i => i.key === key);
    if (key === this.current) {
      this.score++;
      this.tweens.add({ targets: match.obj, scale: 1.25, duration: 90, yoyo: true });
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
