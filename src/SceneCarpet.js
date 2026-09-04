// ============================================================
// SceneCarpet.js — the "world map." Hold up / click-and-hold to
// rise, release to fall, thread the gaps. Reskinned per trip via
// STORY.carpetThemes (colors + speed + gap size + obstacle
// silhouette + hazard type all change). Physics (lift/gravity/
// margins) are unchanged from the original tuning.
//
// Each trip is a FIXED, seeded sequence of obstacles (not endless
// random spawning): the same theme always lays out the same
// obstacles in the same order, on the first attempt and on every
// retry, and the trip ends the moment the last one is cleared -
// not at an arbitrary distance cutoff that may or may not line up
// with what's on screen. Level 1 (desert) never spawns the
// bird/arrow hazard; it's introduced from the second trip on.
//
// data.quick === true renders a short, non-interactive flyover
// used for the faster reverse-journey transitions.
// ============================================================

const CARPET_THEME_ORDER = ["desert", "wind", "dusk", "day2", "storm"];

class CarpetScene extends Phaser.Scene {
  constructor() { super("CarpetScene"); }

  init(data) {
    this.themeKey = data.theme || "desert";
    this.toLabel = data.toLabel || "";
    this.quick = !!data.quick;
  }

  // A fixed, reproducible obstacle layout for this theme: same shape on
  // the first attempt and every retry. Gaps tighten across the trip;
  // hazards (only from the 2nd theme onward) get more frequent toward
  // the end of the trip too.
  buildSequence(theme) {
    const themeIndex = CARPET_THEME_ORDER.indexOf(this.themeKey);
    const rand = mulberry32(hashSeed("carpet-" + this.themeKey));
    const count = Math.max(3, Math.round(theme.distance / theme.spacing));
    const seq = [];
    let lastFrac = 0.5;
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0 : i / (count - 1);
      const ramp = 1.16 - 0.32 * t;
      const jitter = 0.9 + rand() * 0.22;
      const gapHalf = Math.max(56, theme.gapHalf * ramp * jitter);
      let frac = 0.26 + rand() * 0.48;
      const maxSwing = 0.34;
      if (Math.abs(frac - lastFrac) > maxSwing) frac = frac > lastFrac ? lastFrac + maxSwing : lastFrac - maxSwing;
      frac = Phaser.Math.Clamp(frac, 0.22, 0.78);
      lastFrac = frac;
      const hazard = themeIndex > 0 && i > 0 && rand() < (0.14 + t * 0.28);
      seq.push({ gapYFrac: frac, gapHalf, hazard });
    }
    return seq;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    const theme = STORY.carpetThemes[this.themeKey] || STORY.carpetThemes.desert;
    this.theme = theme;

    drawSky(this, theme.skyTop, theme.skyBottom);
    const orb = this.add.circle(W * 0.8, H * 0.22, 32, theme.orb, 0.9);
    addFlicker(this, orb, { min: 0.85, max: 1, duration: 1800 });
    this.farLayer = makeSkylineLayer(this, theme.farColor, 60, 30, 60, 30, 50, 0.8);
    this.nearLayer = makeSkylineLayer(this, theme.nearColor, 30, 50, 110, 24, 40, 1.2);
    drawGround(this, theme.ground, 46);

    if (this.toLabel) {
      this.add.text(W / 2, 50, "Flying to " + this.toLabel, { fontFamily: "Georgia, serif", fontSize: "15px", color: "#ffe9bd", fontStyle: "italic" })
        .setOrigin(0.5).setScrollFactor(0).setDepth(900);
    }

    if (this.quick) {
      this.buildQuickMontage();
      return;
    }

    this.carpetX = 170;
    this.carpetY = H / 2;
    this.carpetVY = 0;
    this.carpet = makeCarpet(this, this.carpetX, this.carpetY);
    this.carpet.setDepth(300);
    this.lives = 3;
    this.invuln = 0;
    this.distance = 0;
    this.ended = false;

    this.sequence = this.buildSequence(theme);
    this.totalDistance = this.sequence.length * theme.spacing;
    this.spawnIndex = 0;
    this.nextSpawnDistance = theme.spacing * 0.6; // small lead-in before the first obstacle
    this.obstacles = [];
    this.hazards = [];

    this.thrusting = false;
    this.input.on("pointerdown", () => this.thrusting = true);
    this.input.on("pointerup", () => this.thrusting = false);
    this.input.on("pointerout", () => this.thrusting = false);
    this.keys = this.input.keyboard.addKeys({ up: "UP", space: "SPACE", w: "W" });

    this.progressBg = this.add.rectangle(W / 2, 22, W * 0.6, 10, 0x000000, 0.35).setScrollFactor(0).setDepth(900);
    this.progressBar = this.add.rectangle(W * 0.2, 22, 2, 10, theme.orb).setOrigin(0, 0.5).setScrollFactor(0).setDepth(901);
    this.livesText = this.add.text(20, 12, "\u2665 \u2665 \u2665", { fontSize: "18px", color: "#ffefc4" }).setScrollFactor(0).setDepth(900);
    this.obstacleCountText = this.add.text(W - 20, 12, "0 / " + this.sequence.length, { fontSize: "13px", color: "#ffefc4" })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(900);
    this.add.text(W / 2, H - 14, "hold up / SPACE / click & hold to rise", { fontSize: "12px", color: "#ffffffaa" }).setOrigin(0.5).setScrollFactor(0).setDepth(900);
  }

  // ---- themed obstacle silhouettes -------------------------------------
  drawCap(g, dir, kind, color, accent) {
    // dir: +1 = cap sits on top of a bottom-pillar, pointing up.
    //      -1 = cap hangs below a top-pillar, pointing down.
    const s = dir;
    if (kind === "dome") {
      g.fillStyle(color, 1);
      g.fillEllipse(0, 0, 46, 20);
      g.fillStyle(accent, 1);
      g.fillCircle(0, -14 * s, 3);
    } else if (kind === "wind") {
      g.fillStyle(color, 1);
      g.fillRect(-16, -26 * s, 32, 26 * s);
      g.lineStyle(1.6, accent, 0.8);
      for (let i = -12; i <= 12; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, -26 * s); g.strokePath(); }
      g.fillStyle(accent, 1);
      g.fillRect(-18, -14 * s, 36, s > 0 ? 4 : -4);
    } else if (kind === "canyon") {
      g.fillStyle(color, 1);
      const pts = [{ x: -22, y: 0 }, { x: -8, y: -30 * s }, { x: 6, y: -14 * s }, { x: 20, y: -34 * s }, { x: 22, y: 0 }];
      g.fillPoints(pts, true);
      g.lineStyle(1.6, INK, 0.5);
      g.strokePoints(pts, true);
    } else if (kind === "storm") {
      g.fillStyle(color, 1);
      const pts = [{ x: -20, y: 0 }, { x: -14, y: -22 * s }, { x: -2, y: -10 * s }, { x: 10, y: -30 * s }, { x: 20, y: 0 }];
      g.fillPoints(pts, true);
      g.fillStyle(accent, 0.9);
      g.fillTriangle(-4, -14 * s, 4, -14 * s, 0, -26 * s);
    } else {
      // minaret
      g.fillStyle(color, 1);
      g.fillTriangle(-22, 0, 22, 0, 0, -34 * s);
      g.fillStyle(accent, 1);
      g.fillRect(-16, -14 * s, 32, s > 0 ? 4 : -4);
      g.fillCircle(0, -34 * s, 3);
    }
  }

  buildObstacle(gapY, gapHalf) {
    const W = this.W, H = this.H;
    const kind = this.theme.kind || "minaret";
    const container = this.add.container(W + 40, 0);
    container.setDepth(250);
    const g = this.add.graphics();
    g.fillStyle(this.theme.obstacleColor, 1);
    const topH = gapY - gapHalf;
    const botY = gapY + gapHalf;
    const botH = H - botY;
    g.fillRect(-20, 0, 40, topH);
    g.fillRect(-20, botY, 40, botH);
    g.lineStyle(1.6, INK, 0.35);
    g.strokeRect(-20, 0, 40, topH);
    g.strokeRect(-20, botY, 40, botH);
    const capTop = this.add.graphics();
    capTop.setPosition(0, topH);
    this.drawCap(capTop, -1, kind, this.theme.obstacleColor, this.theme.obstacleAccent || 0xd9a441);
    const capBot = this.add.graphics();
    capBot.setPosition(0, botY);
    this.drawCap(capBot, 1, kind, this.theme.obstacleColor, this.theme.obstacleAccent || 0xd9a441);
    container.add([g, capTop, capBot]);
    container.topH = topH;
    container.botY = botY;
    return container;
  }

  spawnHazard(y) {
    const theme = this.theme;
    const g = this.add.graphics();
    if (theme.hazard === "arrow") {
      g.fillStyle(0xcfd6da, 1);
      g.fillTriangle(-14, 0, 4, -3.5, 4, 3.5);
      g.fillRect(4, -1.4, 12, 2.8);
      g.fillStyle(0x8a6a4a, 1);
      g.fillTriangle(16, 0, 24, -5, 24, 5);
    } else {
      g.fillStyle(0x241811, 1);
      g.fillTriangle(-10, 0, 0, -5, 0, 5);
      g.fillTriangle(10, 0, 0, -5, 0, 5);
    }
    const container = this.add.container(this.W + 90, y, [g]);
    container.setDepth(260);
    container._bobBase = y;
    container._phase = Math.random() * Math.PI * 2;
    this.hazards.push(container);
  }

  // Spawn the next fixed entry from this.sequence: the pillar pair, and -
  // offset in height so it's a genuinely separate thing to track - its
  // paired hazard, if this entry has one.
  spawnNext() {
    const entry = this.sequence[this.spawnIndex];
    const gapY = this.H * entry.gapYFrac;
    this.obstacles.push(this.buildObstacle(gapY, entry.gapHalf));
    if (entry.hazard) {
      const side = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
      const hy = Phaser.Math.Clamp(gapY + side * Phaser.Math.Between(60, 100), 40, this.H - 40);
      this.spawnHazard(hy);
    }
    this.spawnIndex++;
    this.nextSpawnDistance += this.theme.spacing;
    if (this.obstacleCountText) this.obstacleCountText.setText(this.spawnIndex + " / " + this.sequence.length);
  }

  checkHit(o) {
    const halfW = 26, halfH = 9;
    const withinX = (this.carpetX + halfW > o.x - 20) && (this.carpetX - halfW < o.x + 20);
    if (!withinX) return false;
    return (this.carpetY - halfH < o.topH) || (this.carpetY + halfH > o.botY);
  }

  checkHazardHit(h) {
    const dx = Math.abs(this.carpetX - h.x), dy = Math.abs(this.carpetY - h.y);
    return dx < 22 && dy < 14;
  }

  hitObstacle() {
    this.lives--;
    this.invuln = 1100;
    this.cameras.main.shake(150, 0.01);
    this.carpetVY = 110;
    this.livesText.setText(("\u2665 ".repeat(Math.max(0, this.lives))).trim());
    if (this.lives <= 0) this.failTrip();
  }

  failTrip() {
    this.ended = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(320, () => this.scene.restart({ theme: this.themeKey, toLabel: this.toLabel }));
  }

  succeed() {
    this.ended = true;
    this.cameras.main.fadeOut(400, 10, 10, 20);
    this.time.delayedCall(420, () => GameFlow.advance(this.scene));
  }

  buildQuickMontage() {
    const W = this.W, H = this.H;
    const carpet = makeCarpet(this, -60, H / 2);
    this.add.text(W / 2, H * 0.2, "Returning to " + (this.toLabel || "\u2026"), { fontFamily: "Georgia, serif", fontSize: "20px", color: "#ffe9bd", fontStyle: "italic" }).setOrigin(0.5).setDepth(900);
    this.tweens.add({ targets: carpet, x: W + 80, duration: 1800, ease: "Sine.easeInOut" });
    this._advanced = false;
    const go = () => { if (!this._advanced) { this._advanced = true; GameFlow.advance(this.scene); } };
    this.time.delayedCall(2000, go);
    this.input.once("pointerdown", go);
  }

  update(time, delta) {
    if (this.quick || this.ended) return;
    const dt = delta / 1000;
    const thrust = this.thrusting || (this.keys.up && this.keys.up.isDown) || (this.keys.space && this.keys.space.isDown) || (this.keys.w && this.keys.w.isDown);
    const lift = 640, gravity = 480, maxV = 340;
    this.carpetVY += (thrust ? -lift : gravity) * dt;
    this.carpetVY = Phaser.Math.Clamp(this.carpetVY, -maxV, maxV);
    this.carpetY += this.carpetVY * dt;
    const margin = 34;
    if (this.carpetY < margin) { this.carpetY = margin; this.carpetVY = 0; }
    if (this.carpetY > this.H - margin - 20) { this.carpetY = this.H - margin - 20; this.carpetVY = 0; }
    this.carpet.y = this.carpetY;
    this.carpet.rotation = Phaser.Math.Clamp(this.carpetVY / 500, -0.4, 0.5);

    this.farLayer.x -= this.theme.speed * 0.35 * dt;
    if (this.farLayer.x <= -this.W) this.farLayer.x += this.W;
    this.nearLayer.x -= this.theme.speed * 0.7 * dt;
    if (this.nearLayer.x <= -this.W) this.nearLayer.x += this.W;

    this.distance += this.theme.speed * dt;

    if (this.spawnIndex < this.sequence.length && this.distance >= this.nextSpawnDistance) {
      this.spawnNext();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= this.theme.speed * dt;
      if (this.invuln <= 0 && this.checkHit(o)) {
        this.hitObstacle();
      }
      if (o.x < -60) { o.destroy(); this.obstacles.splice(i, 1); }
    }

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.x -= (this.theme.speed * 1.35) * dt;
      h._phase += dt * 3;
      h.y = h._bobBase + Math.sin(h._phase) * 18;
      h.rotation = Math.sin(h._phase) * 0.18;
      if (this.invuln <= 0 && this.checkHazardHit(h)) this.hitObstacle();
      if (h.x < -40) { h.destroy(); this.hazards.splice(i, 1); }
    }

    if (this.invuln > 0) {
      this.invuln -= delta;
      this.carpet.alpha = Math.floor(time / 70) % 2 ? 0.4 : 1;
    } else {
      this.carpet.alpha = 1;
    }

    const pct = Phaser.Math.Clamp(this.distance / this.totalDistance, 0, 1);
    this.progressBar.width = Math.max(2, (this.W * 0.6) * pct);

    // The trip only ends once every fixed obstacle has been spawned AND
    // has actually scrolled clear of the screen - not at an arbitrary
    // distance cutoff that might land mid-obstacle.
    if (!this.ended && this.spawnIndex >= this.sequence.length && this.obstacles.length === 0 && this.hazards.length === 0) {
      this.succeed();
    }
  }
}
