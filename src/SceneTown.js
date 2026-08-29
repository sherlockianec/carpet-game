// ============================================================
// SceneTown.js — one reusable scene for every "explore and find
// the right person" location (oven, graveyard, bakery street,
// saddler's row, and all four reverse-journey revisits).
// Config lives in data.js under STORY.towns[key].
//
// The player walks freely across a real 2D bazaar (WASD/arrows,
// or click-to-walk) — both X and Y matter, like a populated
// square rather than a single row of NPCs. Walking up to the
// right person opens their dialogue; walking away from a wrong
// one resets it so it can be tried again.
// ============================================================

class TownScene extends Phaser.Scene {
  constructor() { super("TownScene"); }

  init(data) {
    this.locKey = data.key;
    this.cfg = STORY.towns[this.locKey];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const cfg = this.cfg;
    const horizonY = 138;

    drawSky(this, cfg.skyTop, cfg.skyBottom);
    this.drawBackdrop(cfg, horizonY);
    drawGround(this, cfg.groundColor, H - horizonY, { flecks: 26 });
    this.wornPatches(cfg, horizonY);
    drawClueHUD(this);

    this.add.text(W / 2, 24, cfg.title, {
      fontFamily: "Georgia, serif", fontSize: "18px", color: "#f6ecd8", fontStyle: "bold",
      backgroundColor: "#00000055", padding: { x: 14, y: 6 }
    }).setOrigin(0.5).setDepth(900);

    this.dbox = new DialogueBox(this);

    if (cfg.revisit) {
      this.player = makePerson(this, W * 0.44, H - 130, { robe: 0x1f6f6f, skin: 0xdcbf8a, headwear: "none" });
      this.player.setDepth(Math.round(this.player.y));
      const other = makePerson(this, W * 0.58, H - 160, { robe: cfg.accent, skin: 0xcfc3a8, headwear: "kalpak", beard: true, facing: -1 });
      other.setDepth(Math.round(other.y));
      addBreathing(this, this.player.bodyGfx);
      addBreathing(this, other.bodyGfx, { delay: 300 });
      this.time.delayedCall(500, () => this.doTarget(cfg));
      return;
    }

    this.busy = false;
    this.bounds = { x0: 55, y0: horizonY + 22, x1: W - 55, y1: H - 62 };

    const npcPositions = [];
    this.spotObjs = [];
    cfg.spots.forEach(spot => {
      const x = W * spot.xf, y = H * spot.yf;
      npcPositions.push({ x, y });
      let obj;
      if (spot.style === "grave") {
        obj = makeGrave(this, x, y);
      } else {
        obj = makePerson(this, x, y, {
          robe: spot.robe || 0x8a6a4a, skin: spot.skin || 0xdcbf8a,
          headwear: spot.headwear || "none", beard: !!spot.beard,
          holding: spot.holding || "none", scale: spot.scale || 1,
          mood: spot.target ? "neutral" : "neutral"
        });
        addBreathing(this, obj.bodyGfx, { delay: Math.random() * 500 });
      }
      obj.setDepth(Math.round(y));
      obj._spot = spot;
      obj._triggered = false;
      this.spotObjs.push(obj);
      const hitH = spot.style === "grave" ? 40 : 76;
      makeClickable(obj, 42, hitH, () => {
        if (this.dbox.visible || this.busy) return;
        this.mover.clickTo(x, y);
      });
    });

    this.scatterProps(cfg, npcPositions);

    this.player = makePerson(this, W * 0.5, (this.bounds.y0 + this.bounds.y1) / 2, { robe: 0x1f6f6f, skin: 0xdcbf8a, headwear: "none" });
    this.player.setDepth(Math.round(this.player.y));
    this._playerBaseScale = this.player.scaleY;
    this.mover = new GridMover(this, this.player, { speed: 148, bounds: this.bounds });

    this.add.text(W / 2, H - 14, "WASD / arrows to walk - or click where you want to go.", { fontSize: "13px", color: "#ffffffaa" })
      .setOrigin(0.5).setDepth(900);

    this.input.on("pointerdown", p => {
      if (this.dbox.visible || this.busy) return;
      if (this.input.hitTestPointer(p).length > 0) return;
      this.mover.clickTo(p.worldX, p.worldY);
    });
  }

  drawBackdrop(cfg, horizonY) {
    const W = this.scale.width;
    if (cfg.envKind === "cemetery") {
      makeCrenellatedWall(this, W * 0.5, horizonY + 26, 300, 42, cfg.buildingColor, cfg.accent).setDepth(1);
      makeTree(this, W * 0.12, horizonY + 14, { trunk: 0x3a352c, leaf: 0x384636, h: 76 }).setDepth(1);
      makeTree(this, W * 0.88, horizonY + 18, { trunk: 0x3a352c, leaf: 0x384636, h: 64 }).setDepth(1);
      makeDome(this, W * 0.5, horizonY, 26, cfg.buildingColor, cfg.accent).setDepth(1);
    } else {
      const portalShade = Phaser.Display.Color.IntegerToColor(cfg.buildingColor).darken(32).color;
      makeBuilding(this, W * 0.5, horizonY + 18, {
        w: 140, h: 86, domeR: 28, body: cfg.buildingColor, accent: cfg.accent,
        tile1: cfg.accent, tile2: 0xf2ece0, domeColor: cfg.accent, portal: portalShade
      }).setDepth(1);
      makeDome(this, W * 0.16, horizonY, 32, cfg.buildingColor, cfg.accent).setDepth(1);
      makeMinaret(this, W * 0.28, horizonY, 84, cfg.buildingColor, cfg.accent).setDepth(1);
      makeDome(this, W * 0.74, horizonY, 28, cfg.buildingColor, cfg.accent).setDepth(1);
      makeMinaret(this, W * 0.87, horizonY, 72, cfg.buildingColor, cfg.accent).setDepth(1);
    }
  }

  wornPatches(cfg, horizonY) {
    const W = this.scale.width, H = this.scale.height;
    const light = Phaser.Display.Color.IntegerToColor(cfg.groundColor).lighten(12).color;
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(light, 0.28);
    for (let i = 0; i < 9; i++) {
      const x = Phaser.Math.Between(60, W - 60), y = Phaser.Math.Between(horizonY + 30, H - 60);
      g.fillEllipse(x, y, Phaser.Math.Between(55, 115), Phaser.Math.Between(16, 28));
    }
  }

  scatterProps(cfg, avoid) {
    const W = this.scale.width, H = this.scale.height;
    const kind = cfg.envKind || "bazaar";
    const reserved = avoid.slice();
    const farEnough = p => reserved.every(a => Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) > 58);
    let placed = 0, tries = 0;
    while (placed < 8 && tries < 90) {
      tries++;
      const p = { x: Phaser.Math.Between(75, W - 75), y: Phaser.Math.Between(this.bounds.y0 + 8, this.bounds.y1 - 8) };
      if (!farEnough(p)) continue;
      reserved.push(p);
      placed++;
      let obj = null;
      const r = Math.random();
      if (kind === "cemetery") {
        obj = r < 0.55
          ? makeRock(this, p.x, p.y, { color: 0x6a685c, scale: 0.65 + Math.random() * 0.35 })
          : makeTree(this, p.x, p.y, { trunk: 0x3a352c, leaf: 0x384636, h: 44 + Math.random() * 18 });
      } else if (kind === "city") {
        if (r < 0.35) obj = makeTree(this, p.x, p.y, { h: 54 + Math.random() * 22 });
        else if (r < 0.6) obj = makeRock(this, p.x, p.y, { scale: 0.6 + Math.random() * 0.3 });
        else if (r < 0.8) obj = makeRug(this, p.x, p.y, { base: cfg.accent, trim: cfg.buildingColor, w: 38 + Math.random() * 14, h: 22 + Math.random() * 8 });
        else obj = makeStreetPost(this, p.x, p.y, {});
      } else {
        if (r < 0.4) obj = makeBazaarStall(this, p.x, p.y, { wood: 0x6b4a2e, cloth: cfg.accent, cloth2: cfg.buildingColor });
        else if (r < 0.65) obj = makeRug(this, p.x, p.y, { base: cfg.accent, trim: 0xf2ece0, w: 42 + Math.random() * 14, h: 24 + Math.random() * 8 });
        else if (r < 0.85) obj = makeTree(this, p.x, p.y, { h: 50 + Math.random() * 20 });
        else obj = makeStreetPost(this, p.x, p.y, {});
      }
      if (obj && obj.setDepth) obj.setDepth(Math.round(p.y) - 1);
    }
  }

  update(time, delta) {
    if (!this.mover || this.dbox.visible || this.busy) return;
    const res = this.mover.update(delta);
    if (this.player.bodyGfx) this.player.bodyGfx.y = res.moving ? Math.sin(time / 85) * 2.2 : 0;
    this.player.scaleX = this._playerBaseScale * (this.mover.facing < 0 ? -1 : 1);

    this.spotObjs.forEach(obj => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < 42) {
        if (!obj._triggered) { obj._triggered = true; this.triggerSpot(obj._spot); }
      } else {
        obj._triggered = false;
      }
    });
  }

  triggerSpot(spot) {
    this.busy = true;
    this.mover.stop();
    if (spot.target) {
      this.doTarget(this.cfg);
    } else {
      const line = Phaser.Utils.Array.GetRandom(spot.miss || ["Not who you're looking for."]);
      this.dbox.show([{ speaker: spot.name || "", text: line }], () => { this.busy = false; });
    }
  }

  doTarget(cfg) {
    this.dbox.show(cfg.dialogue, () => {
      if (cfg.grantClue) GameState.clues[cfg.grantClue] = true;
      if (cfg.after === "minigame") {
        this.scene.start(cfg.minigame);
      } else {
        GameFlow.advance(this.scene);
      }
    });
  }
}
