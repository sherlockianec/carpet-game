// ============================================================
// SceneDuel.js — the flashback set-piece. The player briefly
// controls King Sanobar: WASD/arrows to move, Space to attack,
// Shift to roll (brief invulnerability). Two short waves of
// attendants, then Qahraton himself. No levels, no inventory -
// just the fight. Includes simple on-screen touch controls.
// ============================================================

class DuelScene extends Phaser.Scene {
  constructor() { super("DuelScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.locked = true;
    this.rolling = false;
    this.won = false;
    this.touchAttack = false;
    this.touchRoll = false;
    this.touchDir = { x: 0, y: 0 };

    drawSky(this, 0x1a2440, 0x0d1020);
    this.arena = { x0: 60, y0: 90, x1: W - 60, y1: H - 40 };
    makeCrenellatedWall(this, W / 2, this.arena.y0 - 4, this.arena.x1 - this.arena.x0 + 30, 26, 0x2a2438, 0x4a3a2a).setDepth(2);
    this.add.rectangle((this.arena.x0 + this.arena.x1) / 2, (this.arena.y0 + this.arena.y1) / 2, this.arena.x1 - this.arena.x0, this.arena.y1 - this.arena.y0, 0x2a3a2a).setStrokeStyle(3, 0x4a3a2a).setDepth(1);
    makeTree(this, this.arena.x0 - 26, this.arena.y0 + 20, { leaf: 0x2f4a2f, h: 66 }).setDepth(3);
    makeTree(this, this.arena.x1 + 26, this.arena.y0 + 26, { leaf: 0x2f4a2f, h: 58 }).setDepth(3);
    makeTree(this, this.arena.x0 - 20, this.arena.y1 - 10, { leaf: 0x2f4a2f, h: 50 }).setDepth(3);
    makeTree(this, this.arena.x1 + 22, this.arena.y1 - 16, { leaf: 0x2f4a2f, h: 56 }).setDepth(3);
    for (let i = 0; i < 5; i++) {
      this.add.circle(Phaser.Math.Between(this.arena.x0 + 20, this.arena.x1 - 20), Phaser.Math.Between(this.arena.y0 + 20, this.arena.y1 - 20), 6, 0x6b4a2e, 0.5).setDepth(2);
    }

    this.player = makePerson(this, W / 2, H / 2, { robe: 0x8e2f2f, skin: 0xdcbf8a, holding: "sword", mood: "stern" });
    this.player.setDepth(500);
    this.player.hp = 5; this.player.invuln = 0; this.player.facing = { x: 0, y: 1 };

    this.hpText = this.add.text(20, 20, "", { fontSize: "16px", color: "#ffffff" }).setDepth(50);
    this.updateHpText();

    this.keys = this.input.keyboard.addKeys({ up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D", space: "SPACE", shift: "SHIFT" });

    this.enemies = [];
    this.wave = 0;
    this.qahratonSpawned = false;

    this.add.text(W / 2, H - 16, "WASD/Arrows move \u00b7 Space attack \u00b7 Shift roll", { fontSize: "12px", color: "#ffffffaa" }).setOrigin(0.5);
    this.buildTouchControls();

    this.dbox = new DialogueBox(this);

    const titleCard = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(3000);
    const titleText = this.add.text(W / 2, H / 2, "Twenty Years Ago", { fontFamily: "Georgia, serif", fontSize: "30px", color: "#f6ecd8" }).setOrigin(0.5).setDepth(3001);
    this.time.delayedCall(1700, () => {
      this.tweens.add({
        targets: [titleCard, titleText], alpha: 0, duration: 500, onComplete: () => {
          titleCard.destroy(); titleText.destroy();
          this.beginDuel();
        }
      });
    });
  }

  buildTouchControls() {
    const W = this.scale.width, H = this.scale.height;
    const mk = (x, y, w, h, label, onDown, onUp) => {
      const r = this.add.rectangle(x, y, w, h, 0xffffff, 0.1).setStrokeStyle(1, 0xffffff, 0.3).setScrollFactor(0).setDepth(500).setInteractive();
      this.add.text(x, y, label, { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      r.on("pointerdown", onDown);
      r.on("pointerup", onUp || (() => {}));
      r.on("pointerout", onUp || (() => {}));
      return r;
    };
    mk(40, H - 90, 40, 40, "\u25C0", () => this.touchDir.x = -1, () => { if (this.touchDir.x < 0) this.touchDir.x = 0; });
    mk(110, H - 90, 40, 40, "\u25B6", () => this.touchDir.x = 1, () => { if (this.touchDir.x > 0) this.touchDir.x = 0; });
    mk(75, H - 130, 40, 40, "\u25B2", () => this.touchDir.y = -1, () => { if (this.touchDir.y < 0) this.touchDir.y = 0; });
    mk(75, H - 50, 40, 40, "\u25BC", () => this.touchDir.y = 1, () => { if (this.touchDir.y > 0) this.touchDir.y = 0; });
    mk(W - 65, H - 90, 54, 54, "\u2694", () => { this.touchAttack = true; });
    mk(W - 140, H - 90, 50, 50, "\u21B7", () => { this.touchRoll = true; });
  }

  beginDuel() {
    this.locked = false;
    this.spawnWave();
  }

  spawnWave() {
    this.wave++;
    if (this.wave <= 2) {
      this.enemies.push(this.makeEnemy());
      this.enemies.push(this.makeEnemy());
    } else if (!this.qahratonSpawned) {
      this.qahratonSpawned = true;
      this.spawnQahraton();
    }
  }

  makeEnemy() {
    const { x0, y0, x1, y1 } = this.arena;
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    if (side === 0) { x = Phaser.Math.Between(x0, x1); y = y0 + 5; }
    else if (side === 1) { x = Phaser.Math.Between(x0, x1); y = y1 - 5; }
    else if (side === 2) { x = x0 + 5; y = Phaser.Math.Between(y0, y1); }
    else { x = x1 - 5; y = Phaser.Math.Between(y0, y1); }
    const e = makePerson(this, x, y, { robe: 0x6a6a72, skin: 0xd9d0c0, scale: 0.85, headwear: "helmet", holding: "spear", mood: "stern" });
    e.setDepth(Math.round(y));
    e.hp = 2; e.speed = 70; e.kind = "grunt"; e.hitCd = 0; e.dead = false;
    return e;
  }

  spawnQahraton() {
    const { x0, y0, x1 } = this.arena;
    const q = makePerson(this, (x0 + x1) / 2, this.arena.y0 + 10, { robe: 0x1a1010, trim: 0x8e2f2f, skin: 0xc9c0b0, scale: 1.15, beard: true, mood: "grim", holding: "sword" });
    q.setDepth(Math.round(q.y));
    q.hp = 6; q.speed = 55; q.kind = "boss"; q.hitCd = 0; q.dead = false;
    q.state = "idle"; q.stateT = 800; q.warn = null; q.lungeX = 0; q.lungeY = 0;
    this.enemies.push(q);
    this.dbox.show(STORY.duel.qahratonEnter, () => {});
  }

  updateHpText() {
    this.hpText.setText("Health: " + "\u2665".repeat(Math.max(0, this.player.hp)));
  }

  update(time, delta) {
    if (this.locked || this.dbox.visible) return;
    const dt = delta / 1000;
    const p = this.player;

    let dx = 0, dy = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) dx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) dx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) dy -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) dy += 1;
    dx += this.touchDir.x; dy += this.touchDir.y;
    dx = Phaser.Math.Clamp(dx, -1, 1); dy = Phaser.Math.Clamp(dy, -1, 1);

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len; dy /= len;
      p.facing = { x: dx, y: dy };
    }
    const spd = this.rolling ? 380 : 150;
    p.x = Phaser.Math.Clamp(p.x + dx * spd * dt, this.arena.x0 + 16, this.arena.x1 - 16);
    p.y = Phaser.Math.Clamp(p.y + dy * spd * dt, this.arena.y0 + 16, this.arena.y1 - 16);
    p.setDepth(Math.round(p.y));

    const rollPressed = Phaser.Input.Keyboard.JustDown(this.keys.shift) || this.touchRoll;
    this.touchRoll = false;
    if (rollPressed && !this.rolling) {
      this.rolling = true;
      p.invuln = 450;
      this.time.delayedCall(220, () => this.rolling = false);
    }
    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.space) || this.touchAttack;
    this.touchAttack = false;
    if (attackPressed) this.doAttack();

    if (p.invuln > 0) { p.invuln -= delta; p.alpha = 0.5 + 0.5 * Math.sin(time / 40); }
    else { p.alpha = 1; }

    this.enemies.forEach(e => {
      if (e.dead) return;
      if (e.kind === "grunt" || e.state !== "lunge") {
        const ddx = p.x - e.x, ddy = p.y - e.y, dlen = Math.hypot(ddx, ddy) || 1;
        e.x += (ddx / dlen) * e.speed * dt;
        e.y += (ddy / dlen) * e.speed * dt;
      }
      if (e.kind === "boss") this.updateBoss(e, delta, dt);
      if (e.hitCd > 0) e.hitCd -= delta;
      e.setDepth(Math.round(e.y));

      const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
      if (dist < 26 && p.invuln <= 0 && e.hitCd <= 0) {
        this.playerHit(e.kind === "boss" ? 2 : 1);
        e.hitCd = 700;
      }
    });

    this.enemies = this.enemies.filter(e => !e.dead);
    if (this.qahratonSpawned && this.enemies.length === 0 && !this.won) {
      this.won = true;
      this.winDuel();
    }
  }

  updateBoss(e, delta, dt) {
    e.stateT -= delta;
    if (e.warn) { e.warn.x = e.x; e.warn.y = e.y - 40; }
    if (e.state === "idle" && e.stateT <= 0) {
      e.state = "telegraph"; e.stateT = 500;
      e.warn = this.add.circle(e.x, e.y - 40, 8, 0xff3333);
    } else if (e.state === "telegraph" && e.stateT <= 0) {
      if (e.warn) { e.warn.destroy(); e.warn = null; }
      e.state = "lunge"; e.stateT = 350;
      const p = this.player;
      const ddx = p.x - e.x, ddy = p.y - e.y, dlen = Math.hypot(ddx, ddy) || 1;
      e.lungeX = (ddx / dlen) * 420; e.lungeY = (ddy / dlen) * 420;
    } else if (e.state === "lunge") {
      e.x += e.lungeX * dt; e.y += e.lungeY * dt;
      e.x = Phaser.Math.Clamp(e.x, this.arena.x0 + 16, this.arena.x1 - 16);
      e.y = Phaser.Math.Clamp(e.y, this.arena.y0 + 16, this.arena.y1 - 16);
      if (e.stateT <= 0) { e.state = "cooldown"; e.stateT = 900; }
    } else if (e.state === "cooldown" && e.stateT <= 0) {
      e.state = "idle"; e.stateT = 1200;
    }
  }

  doAttack() {
    const p = this.player;
    const range = 50;
    this.enemies.forEach(e => {
      if (e.dead) return;
      const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
      if (dist < range) {
        e.hp--;
        this.tweens.add({ targets: e, alpha: 0.3, duration: 80, yoyo: true });
        if (e.hp <= 0) {
          e.dead = true;
          if (e.warn) { e.warn.destroy(); e.warn = null; }
          this.tweens.add({ targets: e, alpha: 0, scale: 0.4, duration: 200, onComplete: () => e.destroy() });
          if (e.kind === "grunt" && !this.qahratonSpawned && this.enemies.filter(x => !x.dead && x.kind === "grunt").length === 0) {
            this.time.delayedCall(500, () => this.spawnWave());
          }
        }
      }
    });
    const flash = this.add.circle(p.x + p.facing.x * 30, p.y + p.facing.y * 30, 14, 0xffffff, 0.7);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.6, duration: 150, onComplete: () => flash.destroy() });
  }

  playerHit(dmg) {
    this.player.hp -= dmg;
    this.player.invuln = 700;
    this.cameras.main.shake(150, 0.008);
    this.updateHpText();
    if (this.player.hp <= 0) {
      this.locked = true;
      this.dbox.show([{ speaker: "", text: "You stagger back \u2014 but the fight isn't over yet." }], () => this.scene.restart());
    }
  }

  winDuel() {
    this.locked = true;
    this.dbox.show(STORY.duel.victory, () => GameFlow.advance(this.scene));
  }
}
