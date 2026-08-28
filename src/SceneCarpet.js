// ============================================================
// SceneCarpet.js — the "world map." Hold up / click-and-hold to
// rise, release to fall, thread the gaps. Reskinned per trip via
// STORY.carpetThemes (colors + speed + gap size all change).
// data.quick === true renders a short, non-interactive flyover
// used for the faster reverse-journey transitions.
// ============================================================

class CarpetScene extends Phaser.Scene {
  constructor() { super("CarpetScene"); }

  init(data) {
    this.themeKey = data.theme || "desert";
    this.toLabel = data.toLabel || "";
    this.quick = !!data.quick;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;
    const theme = STORY.carpetThemes[this.themeKey] || STORY.carpetThemes.desert;
    this.theme = theme;

    drawSky(this, theme.skyTop, theme.skyBottom);
    this.add.circle(W * 0.8, H * 0.22, 32, theme.orb, 0.9);
    this.farLayer = makeSkylineLayer(this, theme.farColor, 60, 30, 60, 30, 50, 0.8);
    this.nearLayer = makeSkylineLayer(this, theme.nearColor, 30, 50, 110, 24, 40, 1.2);
    drawGround(this, theme.ground, 46);

    if (this.toLabel) {
      this.add.text(W / 2, 50, "Flying to " + this.toLabel, { fontFamily: "Georgia, serif", fontSize: "15px", color: "#ffe9bd", fontStyle: "italic" }).setOrigin(0.5).setScrollFactor(0);
    }

    if (this.quick) {
      this.buildQuickMontage();
      return;
    }

    this.carpetX = 170;
    this.carpetY = H / 2;
    this.carpetVY = 0;
    this.carpet = makeCarpet(this, this.carpetX, this.carpetY);
    this.lives = 3;
    this.invuln = 0;
    this.distance = 0;
    this.targetDistance = theme.distance;
    this.obstacles = [];
    this.spawnTimer = 700;
    this.ended = false;

    this.thrusting = false;
    this.input.on("pointerdown", () => this.thrusting = true);
    this.input.on("pointerup", () => this.thrusting = false);
    this.input.on("pointerout", () => this.thrusting = false);
    this.keys = this.input.keyboard.addKeys({ up: "UP", space: "SPACE", w: "W" });

    this.progressBg = this.add.rectangle(W / 2, 22, W * 0.6, 10, 0x000000, 0.35).setScrollFactor(0);
    this.progressBar = this.add.rectangle(W * 0.2, 22, 2, 10, theme.orb).setOrigin(0, 0.5).setScrollFactor(0);
    this.livesText = this.add.text(20, 12, "\u2665 \u2665 \u2665", { fontSize: "18px", color: "#ffefc4" }).setScrollFactor(0);
    this.add.text(W / 2, H - 14, "hold up / SPACE / click & hold to rise", { fontSize: "12px", color: "#ffffffaa" }).setOrigin(0.5).setScrollFactor(0);
  }

  buildObstacle(gapY, gapHalf) {
    const W = this.W, H = this.H;
    const container = this.add.container(W + 40, 0);
    const g = this.add.graphics();
    g.fillStyle(this.theme.obstacleColor, 1);
    const topH = gapY - gapHalf;
    const botY = gapY + gapHalf;
    const botH = H - botY;
    g.fillRect(-20, 0, 40, topH);
    g.fillEllipse(0, topH, 44, 16);
    g.fillRect(-20, botY, 40, botH);
    g.fillEllipse(0, botY, 44, 16);
    container.add(g);
    container.topH = topH;
    container.botY = botY;
    return container;
  }

  checkHit(o) {
    const halfW = 26, halfH = 9;
    const withinX = (this.carpetX + halfW > o.x - 20) && (this.carpetX - halfW < o.x + 20);
    if (!withinX) return false;
    return (this.carpetY - halfH < o.topH) || (this.carpetY + halfH > o.botY);
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
    this.add.text(W / 2, H * 0.2, "Returning to " + (this.toLabel || "\u2026"), { fontFamily: "Georgia, serif", fontSize: "20px", color: "#ffe9bd", fontStyle: "italic" }).setOrigin(0.5);
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

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.theme.spawnInterval + Phaser.Math.Between(-150, 150);
      const gapHalf = this.theme.gapHalf;
      const gapY = Phaser.Math.Between(this.H * 0.3, this.H * 0.72);
      this.obstacles.push(this.buildObstacle(gapY, gapHalf));
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= this.theme.speed * dt;
      if (this.invuln <= 0 && this.checkHit(o)) {
        this.hitObstacle();
      }
      if (o.x < -60) { o.destroy(); this.obstacles.splice(i, 1); }
    }
    if (this.invuln > 0) this.invuln -= delta;

    this.distance += this.theme.speed * dt;
    const pct = Phaser.Math.Clamp(this.distance / this.targetDistance, 0, 1);
    this.progressBar.width = Math.max(2, (this.W * 0.6) * pct);

    if (this.distance >= this.targetDistance && !this.ended) {
      this.succeed();
    }
  }
}
