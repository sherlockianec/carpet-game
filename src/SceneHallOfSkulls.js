// ============================================================
// SceneHallOfSkulls.js
// mode "prologue": the cold-open hook shown before the story
//                   even begins ("Months earlier...").
// mode "real": the actual chapter - audience with Sanobar,
//              the hall itself, then the tea-cup escape.
// Uses the restart({phase:1}) pattern to move between beats
// safely (Phaser fully tears down and rebuilds the scene).
// The wall always has exactly 9 slots with the 5th (index 4)
// left as a bare hook - that is the whole point of the scene,
// so that count and position must never change.
// ============================================================

class HallOfSkullsScene extends Phaser.Scene {
  constructor() { super("HallOfSkullsScene"); }

  init(data) {
    this.mode = data.mode || "prologue";
    this.phase = data.phase || 0;
  }

  create() {
    if (this.mode === "prologue") {
      if (this.phase === 0) this.prologueWall(); else this.prologueCard();
    } else {
      if (this.phase === 0) this.audience(); else this.hall();
    }
  }

  drawWall(y) {
    const W = this.scale.width;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x1a1226, 1);
    g.fillRect(W * 0.05, y - 48, W * 0.9, 96);
    g.lineStyle(3, 0x3a2a4a, 1);
    g.strokeRect(W * 0.05, y - 48, W * 0.9, 96);
    g.lineStyle(1, 0x2a2038, 0.5);
    for (let ly = y - 40; ly < y + 44; ly += 13) { g.beginPath(); g.moveTo(W * 0.05, ly); g.lineTo(W * 0.95, ly); g.strokePath(); }
    g.fillStyle(0x0c0816, 0.5);
    g.fillRect(W * 0.05, y + 46, W * 0.9, 3);

    for (let i = 0; i < 9; i++) {
      const x = W * 0.12 + i * (W * 0.76 / 8);
      if (i === 4) {
        // the one bare hook - the entire point of this wall
        const hg = this.add.graphics();
        hg.lineStyle(2, 0x2a2a30, 1);
        hg.beginPath(); hg.moveTo(0, -14); hg.lineTo(0, 4); hg.strokePath();
        hg.fillStyle(0x3a3a42, 1);
        hg.fillCircle(0, -14, 3);
        hg.lineStyle(1.6, 0x2a2a30, 1);
        hg.strokeCircle(0, 6, 4);
        hg.setPosition(x, y);
        hg.setDepth(1);
      } else {
        makeSkull(this, x, y, { hung: true }).setDepth(1);
      }
    }
  }

  prologueWall() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x120c1e, 0x05030a);
    this.drawWall(H * 0.33);
    const b1 = makeBrazier(this, W * 0.07, H * 0.33 + 66);
    const b2 = makeBrazier(this, W * 0.93, H * 0.33 + 66);
    [b1, b2].forEach(b => { b.container.setDepth(2); b.flame.setDepth(3); });

    this.add.text(W / 2, H * 0.62, "Somewhere, a King keeps a promise\nno one has lived to regret asking about.", {
      fontFamily: "Georgia, serif", fontSize: "16px", color: "#cfc3d8", align: "center"
    }).setOrigin(0.5).setDepth(5);

    const cont = this.add.text(W / 2, H * 0.86, "click / tap to continue", { fontSize: "13px", color: "#8a7a9a" }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: cont, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

    this.input.once("pointerdown", () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.time.delayedCall(370, () => this.scene.restart({ mode: "prologue", phase: 1 }));
    });
  }

  prologueCard() {
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setBackgroundColor(0x05030a);
    const t = this.add.text(W / 2, H / 2, "Months earlier\u2026", { fontFamily: "Georgia, serif", fontSize: "28px", color: "#f6ecd8" }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: t, alpha: 1, duration: 600, onComplete: () => {
        this.time.delayedCall(1100, () => {
          this.tweens.add({ targets: t, alpha: 0, duration: 500, onComplete: () => GameFlow.advance(this.scene) });
        });
      }
    });
  }

  audience() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x2a1e40, 0x120c1e);
    drawGround(this, 0x241a34, H * 0.42, { texture: false });

    const colColor = 0x3a2440, colAccent = 0xc9a24b;
    makeMinaret(this, W * 0.08, H * 0.58, 195, colColor, colAccent).setDepth(2);
    makeMinaret(this, W * 0.92, H * 0.58, 195, colColor, colAccent).setDepth(2);
    [0.27, 0.77].forEach(xf => {
      const g = this.add.graphics();
      g.fillStyle(0x5b1f1f, 1);
      g.fillRect(-15, 0, 30, 135);
      g.lineStyle(2, colAccent, 1);
      g.strokeRect(-15, 0, 30, 135);
      g.fillStyle(colAccent, 1);
      g.fillTriangle(-15, 135, 15, 135, 0, 152);
      g.setPosition(W * xf, H * 0.22);
      g.setDepth(2);
      addSway(this, g, { amount: 0.014, duration: 2700 });
    });

    makeRug(this, W * 0.56, H * 0.67, { base: 0x5b1f1f, trim: colAccent, w: 210, h: 66 }).setDepth(1);
    makeThrone(this, W * 0.62, H * 0.60, { w: 100, h: 165, seat: 0x4a2a1a, cush: 0x5b1f1f, gold: colAccent }).setDepth(3);
    const braz = makeBrazier(this, W * 0.40, H * 0.68);
    braz.container.setDepth(Math.round(H * 0.68)); braz.flame.setDepth(Math.round(H * 0.68) + 1);

    const guard1 = makePerson(this, W * 0.46, H * 0.635, { robe: 0x3a2440, trim: colAccent, skin: 0xd9c9a8, headwear: "helmet", holding: "spear", mood: "stern", facing: -1 });
    guard1.setDepth(Math.round(guard1.y));

    this.player = makePerson(this, W * 0.28, H * 0.66, { robe: 0x1f6f6f, skin: 0xdcbf8a });
    this.player.setDepth(Math.round(this.player.y));
    this.sanobar = makePerson(this, W * 0.62, H * 0.545, { robe: 0x8e2f2f, trim: 0xd9a441, skin: 0xd9c9a8, headwear: "crown", beard: true, mood: "stern", scale: 1.28 });
    this.sanobar.setDepth(Math.round(this.sanobar.y) + 2);

    [this.player, this.sanobar, guard1].forEach((p, i) => addBreathing(this, p.bodyGfx, { delay: i * 180 }));

    drawClueHUD(this);
    const dbox = new DialogueBox(this);
    dbox.show(STORY.hallOfSkulls.audience, () => this.scene.restart({ mode: "real", phase: 1 }));
  }

  hall() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x120c1e, 0x05030a);
    this.drawWall(H * 0.28);
    const b1 = makeBrazier(this, W * 0.09, H * 0.28 + 62);
    const b2 = makeBrazier(this, W * 0.91, H * 0.28 + 62);
    [b1, b2].forEach(b => { b.container.setDepth(2); b.flame.setDepth(3); });
    drawGround(this, 0x1a1226, H * 0.5, { texture: false });

    this.player = makePerson(this, W * 0.36, H * 0.66, { robe: 0x1f6f6f, skin: 0xdcbf8a });
    this.player.setDepth(Math.round(this.player.y));
    this.sanobar = makePerson(this, W * 0.60, H * 0.66, { robe: 0x8e2f2f, trim: 0xd9a441, skin: 0xd9c9a8, headwear: "crown", beard: true, mood: "grim", scale: 1.24, facing: -1 });
    this.sanobar.setDepth(Math.round(this.sanobar.y));
    addBreathing(this, this.player.bodyGfx);
    addBreathing(this, this.sanobar.bodyGfx, { delay: 200 });

    drawClueHUD(this);
    this.dbox = new DialogueBox(this);
    this.dbox.show(STORY.hallOfSkulls.hallLines, () => this.teaEscape());
  }

  teaEscape() {
    const p = this.player;
    const cup = this.add.circle(p.x + 16, p.y - 60, 5, 0xffffff).setDepth(600);
    this.tweens.add({
      targets: cup, y: cup.y - 6, duration: 450, yoyo: true, repeat: 1, onComplete: () => {
        this.tweens.add({
          targets: [p, cup], alpha: 0, scale: 0.5, duration: 500, onComplete: () => {
            GameFlow.advance(this.scene);
          }
        });
      }
    });
  }
}
