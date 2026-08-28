// ============================================================
// SceneMiniGames.js — three short, low-stakes arcade beats.
// Each is a single self-contained Phaser Scene.
// ============================================================

// ---- Bakery: catch the loaves before they burn, then a short
// cutscene of the cart tipping bread into the river. ----------
class BakeryGameScene extends Phaser.Scene {
  constructor() { super("BakeryGameScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0xf2c98a, 0xd9873f);
    drawGround(this, 0x8a6a4a, 90);
    this.add.text(W / 2, 26, "Keep the Ovens Fed", { fontFamily: "Georgia, serif", fontSize: "18px", color: "#3a2a1a", fontStyle: "bold" }).setOrigin(0.5);
    drawClueHUD(this);

    this.slots = [{ x: W * 0.28, y: H * 0.55 }, { x: W * 0.42, y: H * 0.55 }, { x: W * 0.58, y: H * 0.55 }, { x: W * 0.72, y: H * 0.55 }];
    this.loaves = [null, null, null, null];
    this.hits = 0; this.spawned = 0; this.maxSpawn = 10;
    this.spawnTimer = 0; this.running = false; this.done = false;

    this.add.text(W / 2, H - 70, "Click each loaf before it burns!", { fontSize: "14px", color: "#3a2a1a" }).setOrigin(0.5);
    this.scoreText = this.add.text(W / 2, 60, "Batches saved: 0 / 10", { fontSize: "14px", color: "#3a2a1a" }).setOrigin(0.5);

    this.dbox = new DialogueBox(this);
    this.time.delayedCall(600, () => { this.running = true; });
  }

  update(t, delta) {
    if (!this.running || this.done) return;
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0 && this.spawned < this.maxSpawn) {
      const free = [];
      this.slots.forEach((s, i) => { if (!this.loaves[i]) free.push(i); });
      if (free.length) {
        this.spawnLoaf(Phaser.Utils.Array.GetRandom(free));
        this.spawned++;
      }
      this.spawnTimer = 780;
    }
    if (this.spawned >= this.maxSpawn && !this.loaves.some(l => l) && !this.done) { this.finish(); }
  }

  spawnLoaf(i) {
    const s = this.slots[i];
    const g = this.add.graphics();
    g.fillStyle(0xd9a441, 1);
    g.fillEllipse(0, 0, 40, 26);
    const c = this.add.container(s.x, s.y, [g]);
    makeClickable(c, 44, 30, () => this.catchLoaf(i));
    c.g = g;
    this.loaves[i] = c;
    c.burnEvt = this.time.delayedCall(2400, () => this.burnLoaf(i));
  }

  catchLoaf(i) {
    const c = this.loaves[i];
    if (!c) return;
    c.burnEvt.remove(false);
    this.hits++;
    this.scoreText.setText("Batches saved: " + this.hits + " / 10");
    this.loaves[i] = null;
    this.tweens.add({ targets: c, y: c.y - 30, alpha: 0, duration: 220, onComplete: () => c.destroy() });
  }

  burnLoaf(i) {
    const c = this.loaves[i];
    if (!c) return;
    this.loaves[i] = null;
    c.g.clear(); c.g.fillStyle(0x2a2016, 1); c.g.fillEllipse(0, 0, 40, 26);
    c.disableInteractive();
    this.time.delayedCall(300, () => c.destroy());
  }

  finish() {
    this.done = true;
    if (this.hits < 5) {
      this.dbox.show([{ speaker: "", text: "The batch is ruined. Let's try again." }], () => this.scene.restart());
      return;
    }
    this.riverCutscene();
  }

  riverCutscene() {
    const W = this.scale.width, H = this.scale.height;
    const cartG = this.add.graphics(); cartG.fillStyle(0x5a3f2a, 1); cartG.fillRect(-25, -15, 50, 30);
    const cart = this.add.container(W * 0.15, H * 0.55, [cartG]);
    this.add.rectangle(W / 2, H - 20, W, 40, 0x2f6f8a, 0.85);
    this.tweens.add({
      targets: cart, x: W * 0.8, duration: 1500, onComplete: () => {
        for (let k = 0; k < 5; k++) {
          const loaf = this.add.circle(cart.x - 20 + k * 8, cart.y, 9, 0xd9a441);
          this.tweens.add({
            targets: loaf, y: H - 24, duration: 450, delay: k * 90, onComplete: () => {
              const splash = this.add.circle(loaf.x, H - 20, 4, 0xffffff, 0.7);
              this.tweens.add({ targets: splash, alpha: 0, duration: 350, onComplete: () => splash.destroy() });
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
    drawGround(this, 0x6b4a2e, 90);
    this.add.text(W / 2, 26, "Assemble the Saddle", { fontFamily: "Georgia, serif", fontSize: "18px", color: "#2a1c10", fontStyle: "bold" }).setOrigin(0.5);
    drawClueHUD(this);

    this.slotDefs = [
      { key: "frame", x: W * 0.5, y: H * 0.4, w: 130, h: 26 },
      { key: "seat", x: W * 0.5, y: H * 0.5, w: 96, h: 20 },
      { key: "panel", x: W * 0.5, y: H * 0.58, w: 40, h: 18 }
    ];
    this.filled = {};
    this.slotDefs.forEach(s => {
      s.outline = this.add.rectangle(s.x, s.y, s.w, s.h, 0x000000, 0).setStrokeStyle(2, 0xffffff, 0.45);
      this.add.rectangle(s.x, s.y, s.w + 18, s.h + 18, 0x000000, 0.001).setInteractive().on("pointerdown", () => this.placeSelected(s));
    });

    const tray = [
      { key: "frame", color: 0x6b4a2e, x: W * 0.22, y: H * 0.78, w: 80, h: 18 },
      { key: "seat", color: 0xc9a24b, x: W * 0.46, y: H * 0.78, w: 60, h: 16 },
      { key: "panel", color: 0x8a5a34, x: W * 0.66, y: H * 0.78, w: 30, h: 16 }
    ];
    this.selected = null;
    this.parts = tray.map(p => {
      const r = this.add.rectangle(p.x, p.y, p.w, p.h, p.color).setInteractive();
      r.pieceKey = p.key; r.homeX = p.x; r.homeY = p.y;
      r.on("pointerdown", () => { if (!this.locked) this.selectPart(r); });
      return r;
    });

    this.add.text(W / 2, H - 24, "Click a part, then click its outline.", { fontSize: "13px", color: "#2a1c10" }).setOrigin(0.5);

    this.dbox = new DialogueBox(this);
    this.locked = true;
    this.time.delayedCall(400, () => { this.locked = false; });
  }

  selectPart(r) {
    if (this.filled[r.pieceKey]) return;
    if (this.selected) this.selected.setStrokeStyle();
    this.selected = r;
    r.setStrokeStyle(3, 0xffffff);
  }

  placeSelected(slot) {
    if (this.locked || !this.selected) return;
    if (this.selected.pieceKey === slot.key && !this.filled[slot.key]) {
      const part = this.selected;
      this.tweens.add({ targets: part, x: slot.x, y: slot.y, duration: 200 });
      this.filled[slot.key] = true;
      slot.outline.setStrokeStyle(2, 0x2fb8ac, 1);
      part.disableInteractive();
      part.setStrokeStyle();
      this.selected = null;
      if (Object.keys(this.filled).length === this.slotDefs.length) this.finish();
    } else if (this.selected) {
      this.tweens.add({ targets: this.selected, x: this.selected.homeX, y: this.selected.homeY, duration: 150 });
      this.selected.setStrokeStyle();
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
    drawGround(this, 0x2a2036, 90);
    this.add.text(W / 2, 26, "The Palace Kitchen", { fontFamily: "Georgia, serif", fontSize: "18px", color: "#f6ecd8", fontStyle: "bold" }).setOrigin(0.5);
    drawClueHUD(this);

    this.ingredients = [
      { key: "rice", color: 0xe8d9a0, x: W * 0.28 },
      { key: "bread", color: 0xc9a24b, x: W * 0.42 },
      { key: "meat", color: 0x8a3a2a, x: W * 0.58 },
      { key: "herb", color: 0x3a8a4a, x: W * 0.72 }
    ];
    this.ingredients.forEach(i => {
      const c = this.add.circle(i.x, H * 0.75, 26, i.color).setInteractive();
      c.on("pointerdown", () => this.tryServe(i.key));
    });

    this.orderText = this.add.text(W / 2, H * 0.42, "", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    this.orderPlate = this.add.circle(W / 2, H * 0.3, 30, 0xffffff, 0.15).setStrokeStyle(2, 0xffffff, 0.6);
    this.timeBar = this.add.rectangle(W / 2, H * 0.36, 140, 8, 0xd9a441).setOrigin(0.5);

    this.score = 0; this.round = 0; this.maxRounds = 6; this.locked = true;

    this.dbox = new DialogueBox(this);
    this.dbox.show(STORY.kitchen.intro, () => { this.locked = false; this.nextOrder(); });
  }

  nextOrder() {
    if (this.round >= this.maxRounds) { this.finish(); return; }
    this.round++;
    this.current = Phaser.Utils.Array.GetRandom(this.ingredients).key;
    const match = this.ingredients.find(i => i.key === this.current);
    this.orderPlate.fillColor = match.color;
    this.orderText.setText("Order: " + this.current);
    this.timeLeft = 2200;
  }

  tryServe(key) {
    if (this.locked || !this.current) return;
    if (key === this.current) { this.score++; }
    this.current = null;
    this.time.delayedCall(200, () => this.nextOrder());
  }

  update(t, delta) {
    if (this.locked || !this.current) return;
    this.timeLeft -= delta;
    this.timeBar.width = Math.max(0, 140 * (this.timeLeft / 2200));
    if (this.timeLeft <= 0) { this.current = null; this.time.delayedCall(150, () => this.nextOrder()); }
  }

  finish() {
    this.locked = true;
    if (this.score < 3) {
      this.dbox.show([{ speaker: "", text: "The head cook scowls. Try again." }], () => this.scene.restart());
      return;
    }
    this.dbox.show(STORY.kitchen.outro, () => GameFlow.advance(this.scene));
  }
}
