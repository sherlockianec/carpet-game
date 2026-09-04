// ============================================================
// SceneVillagePalace.js — Chapter 1, in three phases:
//   0. Village — meet the old traveler, receive the carpet.
//   1. Route map — a short on-foot dodge across a painted map
//      from the village to the palace gate (the "way to the
//      castle is also a game").
//   2. Palace — the audience with the King; Minister intervenes.
// Simplification note: in the original tale the FATHER makes
// the doomed trip to the palace. Here the player character goes
// directly, so there is one continuous controllable protagonist
// instead of a cutscene-only father figure.
// ============================================================

class VillagePalaceScene extends Phaser.Scene {
  constructor() { super("VillagePalaceScene"); }

  init(data) { this.phase = (data && data.phase) || 0; }

  create() {
    if (this.phase === 0) this.createVillage();
    else if (this.phase === 1) this.createRouteMap();
    else this.createPalace();
  }

  // ---------------------------------------------------------- phase 0
  createVillage() {
    const W = this.scale.width, H = this.scale.height;
    const horizonY = 150;

    drawSky(this, 0xf2c98a, 0xd98a4a);
    makeDome(this, W * 0.14, horizonY, 30, 0x2fb8ac, 0xd9a441).setDepth(1);
    makeBuilding(this, W * 0.5, horizonY + 12, {
      w: 130, h: 90, domeR: 26, body: 0xc9a24b, accent: 0xd9a441,
      tile1: 0xd9a441, tile2: 0xf2ece0, domeColor: 0x1c4e80, portal: 0x5a3a22
    }).setDepth(1);
    makeDome(this, W * 0.86, horizonY, 36, 0x1c4e80, 0xd9a441).setDepth(1);
    makeMinaret(this, W * 0.68, horizonY, 58, 0xc9a24b, 0xd9a441).setDepth(1);
    drawGround(this, 0x8a6a4a, H - horizonY, { flecks: 22 });

    drawClueHUD(this);
    this.dbox = new DialogueBox(this);
    this.busy = false;
    this.spotObjs = [];

    // background villagers - a little village-life color. Walking up to
    // one of these gives a short flavor line; walking up to the old
    // traveler is what actually starts the real conversation.
    const villagers = [
      { x: W * 0.14, y: H * 0.60, robe: 0x7a5a3a, skin: 0xcfc3a8, headwear: "doppi", holding: "basket", line: "Mind the well on your way past - the rope's gone thin again." },
      { x: W * 0.88, y: H * 0.56, robe: 0x5a7a5a, skin: 0xdcbf8a, headwear: "scarf", scale: 0.86, facing: -1, line: "Haven't seen you around much. Off somewhere?" },
      { x: W * 0.80, y: H * 0.62, robe: 0x8a6a9a, skin: 0xd9c9a8, scale: 0.8, line: "Sharp eyes, that one. Everyone says so." }
    ];
    villagers.forEach(v => {
      const p = makePerson(this, v.x, v.y, { robe: v.robe, skin: v.skin, headwear: v.headwear || "none", scale: v.scale || 1, facing: v.facing || 1, holding: v.holding || "none" });
      p.setDepth(Math.round(v.y));
      addBreathing(this, p.bodyGfx, { delay: Math.random() * 400 });
      p._spot = { name: "Villager", miss: [v.line] };
      p._triggered = false;
      this.spotObjs.push(p);
      makeClickable(p, 42, 76, () => { if (!this.dbox.visible && !this.busy) this.mover.clickTo(v.x, v.y); });
    });

    makeTree(this, W * 0.24, H * 0.66, { h: 60 }).setDepth(Math.round(H * 0.66) - 1);
    makeRug(this, W * 0.62, H * 0.70, { base: 0x8e2f2f, w: 48, h: 26 }).setDepth(Math.round(H * 0.70) - 1);
    makeRock(this, W * 0.06, H * 0.72, {}).setDepth(Math.round(H * 0.72) - 1);

    const omX = W * 0.58, omY = H * 0.66;
    const oldMan = makePerson(this, omX, omY, { robe: 0x5a5040, skin: 0xcfc3a8, headwear: "kalpak", beard: true, facing: -1 });
    oldMan.setDepth(Math.round(omY));
    addBreathing(this, oldMan.bodyGfx, { delay: 250 });
    oldMan._spot = { name: "Old Traveler", target: true };
    oldMan._triggered = false;
    this.spotObjs.push(oldMan);
    makeClickable(oldMan, 42, 76, () => { if (!this.dbox.visible && !this.busy) this.mover.clickTo(omX, omY); });

    this.player = makePerson(this, W * 0.30, H * 0.58, { robe: 0x1f6f6f, skin: 0xdcbf8a });
    this.player.setDepth(Math.round(this.player.y));
    this._playerBaseScale = this.player.scaleY;
    addBreathing(this, this.player.bodyGfx);

    this.villageBounds = { x0: 40, y0: horizonY + 20, x1: W - 40, y1: H - 60 };
    this.mover = new GridMover(this, this.player, { speed: 148, bounds: this.villageBounds });

    this.add.text(W / 2, H - 14, "WASD / arrows to walk - find the old traveler and talk to him.", { fontSize: "13px", color: "#ffffffaa" })
      .setOrigin(0.5).setDepth(900);

    this.input.on("pointerdown", p => {
      if (this.dbox.visible || this.busy) return;
      if (this.input.hitTestPointer(p).length > 0) return;
      this.mover.clickTo(p.worldX, p.worldY);
    });
  }

  updateVillage(time, delta) {
    if (!this.mover || this.dbox.visible || this.busy) return;
    const res = this.mover.update(delta);
    if (this.player.bodyGfx) this.player.bodyGfx.y = res.moving ? Math.sin(time / 85) * 2.2 : 0;
    this.player.scaleX = this._playerBaseScale * (this.mover.facing < 0 ? -1 : 1);

    this.spotObjs.forEach(obj => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < 42) {
        if (!obj._triggered) { obj._triggered = true; this.triggerVillager(obj._spot); }
      } else {
        obj._triggered = false;
      }
    });
  }

  triggerVillager(spot) {
    this.busy = true;
    this.mover.stop();
    if (spot.target) {
      this.dbox.show(STORY.oldMan, () => {
        GameState.hasCarpet = true;
        this.time.delayedCall(200, () => this.scene.restart({ phase: 1 }));
      });
    } else {
      const line = Phaser.Utils.Array.GetRandom(spot.miss);
      this.dbox.show([{ speaker: spot.name, text: line }], () => { this.busy = false; });
    }
  }

  // ---------------------------------------------------------- phase 1
  createRouteMap() {
    const W = this.scale.width, H = this.scale.height;
    const rm = STORY.routeMap;

    drawSky(this, 0xf0dfb5, 0xd9b273);
    this.drawMiniatureFrame();

    const roadX0 = 250, roadX1 = W - 250;
    const topY = 100, botY = H - 78;

    const roadG = this.add.graphics().setDepth(2);
    roadG.fillStyle(0xe0c98d, 1);
    roadG.fillRect(roadX0, topY, roadX1 - roadX0, botY - topY);
    roadG.lineStyle(3, 0x8a6a3a, 0.85);
    roadG.strokeRect(roadX0, topY, roadX1 - roadX0, botY - topY);
    roadG.fillStyle(0x8a6a3a, 0.55);
    for (let y = topY + 12; y < botY; y += 26) roadG.fillRect((roadX0 + roadX1) / 2 - 3, y, 6, 13);

    for (let i = 0; i < 4; i++) {
      makeTree(this, roadX0 - 30 - Phaser.Math.Between(0, 46), topY + 30 + i * 95, { trunk: 0x6b4a2e, leaf: 0x7a8a4a, h: 40 + Math.random() * 22 }).setDepth(2);
      makeTree(this, roadX1 + 30 + Phaser.Math.Between(0, 46), topY + 30 + i * 95, { trunk: 0x6b4a2e, leaf: 0x7a8a4a, h: 40 + Math.random() * 22 }).setDepth(2);
    }
    makeRock(this, roadX0 - 60, botY - 20, { scale: 0.7 }).setDepth(2);
    makeRock(this, roadX1 + 60, topY + 60, { scale: 0.6 }).setDepth(2);

    makeDome(this, (roadX0 + roadX1) / 2, botY + 14, 20, 0xc9a24b, 0xd9a441).setDepth(3);
    this.add.text((roadX0 + roadX1) / 2, botY + 40, "Village", { fontFamily: "Georgia, serif", fontSize: "11px", color: "#4a3520" }).setOrigin(0.5).setDepth(3);
    makeBuilding(this, (roadX0 + roadX1) / 2, topY + 30, {
      w: 92, h: 54, domeR: 18, body: 0x2c3e6b, accent: 0xd9a441,
      tile1: 0xd9a441, tile2: 0xf2ece0, domeColor: 0x1c4e80, portal: 0x14203a
    }).setDepth(3);

    this.add.text(W / 2, 24, rm.title, {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#3a2712", fontStyle: "bold",
      backgroundColor: "#f6e8c8cc", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);
    this.add.text(W / 2, H - 14, rm.caption + "  (arrows / A-D to move)", { fontSize: "13px", color: "#3a2712cc" }).setOrigin(0.5).setDepth(900);

    this.roadBounds = { x0: roadX0 + 24, x1: roadX1 - 24 };
    this.player = makePerson(this, (roadX0 + roadX1) / 2, botY - 26, { robe: 0x1f6f6f, skin: 0xdcbf8a });
    this.player.setDepth(500);
    this._playerBaseScale = this.player.scaleY;

    this.keys = this.input.keyboard.addKeys({ left: "LEFT", right: "RIGHT", a: "A", d: "D" });

    this.lives = 3;
    this.livesText = this.add.text(20, 16, "\u2665 \u2665 \u2665", { fontSize: "18px", color: "#8e2f2f" }).setDepth(900);
    this.traveled = 0;
    this.speed = rm.speed;
    this.progressBg = this.add.rectangle(W / 2, 50, W - 320, 8, 0x00000030).setDepth(900);
    this.progressBar = this.add.rectangle(W / 2 - (W - 320) / 2, 50, 4, 8, 0xd9a441).setOrigin(0, 0.5).setDepth(901);

    this.topY = topY; this.botY = botY;
    this.obstacles = [];
    this.sequence = this.buildRoadSequence(rm);
    this.totalRoadDistance = this.sequence.length * 300;
    this.spawnIndex = 0;
    this.nextSpawnDistance = 260;
    this.invuln = 0;
    this.locked = false;
  }

  buildRoadSequence(rm) {
    const rand = mulberry32(hashSeed("routemap-v1"));
    const spacing = 300;
    const count = Math.max(3, Math.round(rm.distance / spacing));
    const seq = [];
    let lastX = 0.5;
    for (let i = 0; i < count; i++) {
      const t = count <= 1 ? 0 : i / (count - 1);
      const gapHalf = Math.max(46, rm.gapHalf * (1.12 - 0.28 * t) * (0.9 + rand() * 0.2));
      let xf = 0.2 + rand() * 0.6;
      const maxSwing = 0.36;
      if (Math.abs(xf - lastX) > maxSwing) xf = xf > lastX ? lastX + maxSwing : lastX - maxSwing;
      xf = Phaser.Math.Clamp(xf, 0.18, 0.82);
      lastX = xf;
      seq.push({ xf, gapHalf });
    }
    return seq;
  }

  drawMiniatureFrame() {
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.graphics().setDepth(950);
    g.lineStyle(10, 0x6b3f2e, 1);
    g.strokeRect(5, 5, W - 10, H - 10);
    g.lineStyle(3, 0xd9a441, 1);
    g.strokeRect(14, 14, W - 28, H - 28);
    const corner = (cx, cy) => {
      g.fillStyle(0xd9a441, 1);
      g.fillCircle(cx, cy, 8);
      g.lineStyle(2, 0x6b3f2e, 1);
      g.strokeCircle(cx, cy, 8);
    };
    corner(20, 20); corner(W - 20, 20); corner(20, H - 20); corner(W - 20, H - 20);
  }

  makeBarrier(x0, x1) {
    const w = x1 - x0;
    const g = this.add.graphics();
    if (w > 0) {
      g.fillStyle(0x8e2f2f, 1);
      g.fillRect(0, -9, w, 18);
      g.fillStyle(0xd9a441, 1);
      for (let sx = 4; sx < w; sx += 16) g.fillRect(sx, -9, 8, 18);
      g.lineStyle(2, 0x241811, 1);
      g.strokeRect(0, -9, w, 18);
      // small pennant at the inner (gap-facing) end
      const flagX = x0 < this.roadBounds.x0 + 40 ? w - 2 : 2;
      g.fillStyle(0x241811, 1);
      g.fillRect(flagX, -22, 2, 13);
      g.fillStyle(0xd9a441, 1);
      g.fillTriangle(flagX + 2, -22, flagX + 2, -14, flagX + 11, -18);
    }
    const c = this.add.container(x0, this.topY - 24, [g]);
    c.setDepth(400);
    return c;
  }

  spawnNext() {
    const entry = this.sequence[this.spawnIndex];
    const gapX = this.roadBounds.x0 + (this.roadBounds.x1 - this.roadBounds.x0) * entry.xf;
    const left = this.makeBarrier(this.roadBounds.x0 - 26, gapX - entry.gapHalf);
    const right = this.makeBarrier(gapX + entry.gapHalf, this.roadBounds.x1 + 26);
    this.obstacles.push({ y: this.topY - 24, gapX, gapHalf: entry.gapHalf, left, right });
    this.spawnIndex++;
    this.nextSpawnDistance += 300;
  }

  hit() {
    this.lives--;
    this.livesText.setText(("\u2665 ".repeat(Math.max(0, this.lives))).trim());
    this.invuln = 1000;
    this.cameras.main.shake(120, 0.008);
    if (this.lives <= 0) this.fail();
  }

  fail() {
    this.locked = true;
    this.cameras.main.fadeOut(280, 20, 10, 5);
    this.time.delayedCall(300, () => this.scene.restart({ phase: 1 }));
  }

  finish() {
    this.locked = true;
    this.cameras.main.fadeOut(350, 245, 225, 180);
    this.time.delayedCall(380, () => this.scene.restart({ phase: 2 }));
  }

  updateRouteMap(time, delta) {
    if (this.locked) return;
    const dt = delta / 1000;
    let dx = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) dx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) dx += 1;
    this.player.x = Phaser.Math.Clamp(this.player.x + dx * 220 * dt, this.roadBounds.x0, this.roadBounds.x1);
    if (dx !== 0) this.player.scaleX = this._playerBaseScale * (dx > 0 ? 1 : -1);
    if (this.player.bodyGfx) this.player.bodyGfx.y = dx !== 0 ? Math.sin(time / 80) * 2 : 0;

    this.traveled += this.speed * dt;
    const pct = Math.min(1, this.traveled / this.totalRoadDistance);
    this.progressBar.width = Math.max(4, (this.scale.width - 320) * pct);

    if (this.invuln > 0) {
      this.invuln -= delta;
      this.player.alpha = Math.floor(time / 70) % 2 ? 0.4 : 1;
    } else {
      this.player.alpha = 1;
    }

    if (this.spawnIndex < this.sequence.length && this.traveled >= this.nextSpawnDistance) {
      this.spawnNext();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.y += this.speed * dt;
      o.left.y = o.y; o.right.y = o.y;
      if (this.invuln <= 0 && Math.abs(o.y - this.player.y) < 15) {
        const inGap = this.player.x > o.gapX - o.gapHalf + 15 && this.player.x < o.gapX + o.gapHalf - 15;
        if (!inGap) this.hit();
      }
      if (o.y > this.botY + 50) { o.left.destroy(); o.right.destroy(); this.obstacles.splice(i, 1); }
    }

    // Ends once every fixed barrier has been spawned AND scrolled clear -
    // not at an arbitrary distance cutoff that might land mid-obstacle.
    if (!this.locked && this.spawnIndex >= this.sequence.length && this.obstacles.length === 0) this.finish();
  }

  // ---------------------------------------------------------- phase 2
  createPalace() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x2a1f3d, 0x150f22);
    drawGround(this, 0x241b30, H * 0.42, { texture: false });

    const colColor = 0x33284a, colAccent = 0xd9a441;
    makeMinaret(this, W * 0.07, H * 0.58, 210, colColor, colAccent).setDepth(2);
    makeMinaret(this, W * 0.93, H * 0.58, 210, colColor, colAccent).setDepth(2);

    [0.24, 0.76].forEach(xf => {
      const g = this.add.graphics();
      g.fillStyle(0x8e2f2f, 1);
      g.fillRect(-16, 0, 32, 150);
      g.lineStyle(2, colAccent, 1);
      g.strokeRect(-16, 0, 32, 150);
      g.fillStyle(colAccent, 1);
      g.fillTriangle(-16, 150, 16, 150, 0, 168);
      g.setPosition(W * xf, H * 0.20);
      g.setDepth(2);
      addSway(this, g, { amount: 0.015, duration: 2600 });
    });

    makeRug(this, W * 0.5, H * 0.66, { base: 0x8e2f2f, trim: colAccent, w: 240, h: 76 }).setDepth(1);
    makeThrone(this, W * 0.5, H * 0.60, { w: 108, h: 175 }).setDepth(3);
    const braz1 = makeBrazier(this, W * 0.34, H * 0.66);
    const braz2 = makeBrazier(this, W * 0.66, H * 0.66);
    braz1.container.setDepth(Math.round(H * 0.66)); braz1.flame.setDepth(Math.round(H * 0.66) + 1);
    braz2.container.setDepth(Math.round(H * 0.66)); braz2.flame.setDepth(Math.round(H * 0.66) + 1);

    const guard1 = makePerson(this, W * 0.37, H * 0.63, { robe: 0x2c3e6b, trim: 0xc9a24b, skin: 0xd9c9a8, headwear: "helmet", holding: "spear", mood: "stern" });
    guard1.setDepth(Math.round(guard1.y));
    const guard2 = makePerson(this, W * 0.63, H * 0.63, { robe: 0x2c3e6b, trim: 0xc9a24b, skin: 0xd9c9a8, headwear: "helmet", holding: "spear", mood: "stern", facing: -1 });
    guard2.setDepth(Math.round(guard2.y));

    this.player = makePerson(this, W * 0.28, H * 0.66, { robe: 0x1f6f6f, skin: 0xdcbf8a });
    this.player.setDepth(Math.round(this.player.y));

    const king = makePerson(this, W * 0.5, H * 0.545, { robe: 0x5b3a8e, trim: 0xd9a441, skin: 0xd9c9a8, headwear: "crown", beard: true, mood: "stern", scale: 1.28 });
    king.setDepth(Math.round(king.y) + 2);

    const minister = makePerson(this, W * 0.73, H * 0.66, { robe: 0x2c3e6b, trim: 0xc9a24b, skin: 0xd9c9a8, headwear: "minister", holding: "staff", mood: "worried" });
    minister.setDepth(Math.round(minister.y));

    [this.player, guard1, guard2, king, minister].forEach((p, i) => addBreathing(this, p.bodyGfx, { delay: i * 160 }));

    drawClueHUD(this);
    const dbox = new DialogueBox(this);
    dbox.show(STORY.palace, () => GameFlow.advance(this.scene));
  }

  update(time, delta) {
    if (this.phase === 0) this.updateVillage(time, delta);
    else if (this.phase === 1) this.updateRouteMap(time, delta);
  }
}
