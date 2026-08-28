// ============================================================
// SceneHallOfSkulls.js
// mode "prologue": the cold-open hook shown before the story
//                   even begins ("Months earlier...").
// mode "real": the actual chapter - audience with Sanobar,
//              the hall itself, then the tea-cup escape.
// Uses the restart({phase:1}) pattern to move between beats
// safely (Phaser fully tears down and rebuilds the scene).
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
    this.add.rectangle(W / 2, y, W * 0.86, 90, 0x1a1226).setStrokeStyle(2, 0x3a2a4a);
    for (let i = 0; i < 9; i++) {
      const x = W * 0.12 + i * (W * 0.76 / 8);
      if (i === 4) {
        this.add.circle(x, y, 4, 0x2a2038);
        this.add.rectangle(x, y - 12, 3, 14, 0x4a3a5a);
      } else {
        makeSkull(this, x, y);
      }
    }
  }

  prologueWall() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x120c1e, 0x05030a);
    this.drawWall(H * 0.35);
    this.add.text(W / 2, H * 0.6, "Somewhere, a King keeps a promise\nno one has lived to regret asking about.", {
      fontFamily: "Georgia, serif", fontSize: "16px", color: "#cfc3d8", align: "center"
    }).setOrigin(0.5);

    const cont = this.add.text(W / 2, H * 0.86, "click / tap to continue", { fontSize: "13px", color: "#8a7a9a" }).setOrigin(0.5);
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
    drawGround(this, 0x241a34, 90);
    this.add.rectangle(W / 2, H - 90, W * 0.6, 130, 0x33284a).setStrokeStyle(3, 0xd9a441);
    this.player = makePerson(this, W * 0.36, H - 120, 0x1f6f6f, 0xdcbf8a);
    this.sanobar = makePerson(this, W * 0.62, H - 150, 0x8e2f2f, 0xd9c9a8, 1.2);
    drawClueHUD(this);
    const dbox = new DialogueBox(this);
    dbox.show(STORY.hallOfSkulls.audience, () => this.scene.restart({ mode: "real", phase: 1 }));
  }

  hall() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x120c1e, 0x05030a);
    this.drawWall(H * 0.32);
    drawGround(this, 0x1a1226, 90);
    this.player = makePerson(this, W * 0.4, H - 110, 0x1f6f6f, 0xdcbf8a);
    this.sanobar = makePerson(this, W * 0.6, H - 110, 0x8e2f2f, 0xd9c9a8, 1.2);
    drawClueHUD(this);
    this.dbox = new DialogueBox(this);
    this.dbox.show(STORY.hallOfSkulls.hallLines, () => this.teaEscape());
  }

  teaEscape() {
    const p = this.player;
    const cup = this.add.circle(p.x + 16, p.y - 14, 5, 0xffffff);
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
