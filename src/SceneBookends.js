// ============================================================
// SceneBookends.js — TitleScene and EndingScene.
// ============================================================

class TitleScene extends Phaser.Scene {
  constructor() { super("TitleScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x1c4e80, 0x120c1e);
    const moon = this.add.circle(W * 0.8, H * 0.22, 40, 0xd9a441, 0.9);
    addFlicker(this, moon, { min: 0.88, max: 1, duration: 2200 });
    makeMinaret(this, W * 0.15, H - 60, 150, 0x14324f, 0xd9a441);
    makeMinaret(this, W * 0.85, H - 60, 170, 0x14324f, 0xd9a441);
    makeDome(this, W * 0.32, H - 60, 40, 0x1c4e80, 0xd9a441);
    makeDome(this, W * 0.68, H - 60, 34, 0x1c4e80, 0xd9a441);
    drawGround(this, 0x120c1e, 60, { texture: false });

    const carpet = makeCarpet(this, W * 0.5, H * 0.55, 1.3);
    this.tweens.add({ targets: carpet, y: carpet.y - 14, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    this.add.text(W / 2, H * 0.2, "UCHAR GILAM", { fontFamily: "Georgia, serif", fontSize: "40px", color: "#f6ecd8", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(W / 2, H * 0.28, "The Flying Carpet", { fontFamily: "Georgia, serif", fontSize: "18px", color: "#d9a441", fontStyle: "italic" }).setOrigin(0.5);

    const start = this.add.text(W / 2, H * 0.78, "\u25B8 click / tap to begin", { fontSize: "18px", color: "#f6ecd8" }).setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 650, yoyo: true, repeat: -1 });

    this.add.text(W / 2, H * 0.9, "Carpet: hold up / click   \u00b7   Duel: WASD + Space + Shift   \u00b7   Towns: click", { fontSize: "12px", color: "#cfc3a8" }).setOrigin(0.5);

    this.input.once("pointerdown", () => {
      GameState.reset();
      GameFlow.index = -1;
      GameFlow.advance(this.scene);
    });
  }
}

class EndingScene extends Phaser.Scene {
  constructor() { super("EndingScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x2fb8ac, 0x1c4e80);
    for (let i = 0; i < 3; i++) makeDome(this, W * (0.18 + i * 0.32), H - 70, 46, 0xe8d9b5, 0xd9a441);
    drawGround(this, 0xd9c9a0, H * 0.34, { flecks: 10 });
    this.add.text(W / 2, 50, "Forty Days, Forty Nights", {
      fontFamily: "Georgia, serif", fontSize: "24px", color: "#2a1c10", fontStyle: "bold",
      backgroundColor: "#ffffff66", padding: { x: 16, y: 6 }
    }).setOrigin(0.5).setDepth(900);

    makeRug(this, W * 0.5, H * 0.72, { base: 0x8e2f2f, trim: 0xd9a441, w: 200, h: 60 }).setDepth(1);
    const guest1 = makePerson(this, W * 0.20, H * 0.66, { robe: 0x5a7a5a, skin: 0xd9c9a8, headwear: "doppi", scale: 0.85 });
    const guest2 = makePerson(this, W * 0.80, H * 0.66, { robe: 0x7a5a9a, skin: 0xcfc3a8, headwear: "scarf", scale: 0.85, facing: -1 });
    [guest1, guest2].forEach(p => { p.setDepth(Math.round(p.y)); addBreathing(this, p.bodyGfx); });

    const bride = makePerson(this, W * 0.44, H * 0.62, { robe: 0xb5456f, trim: 0xd9a441, skin: 0xdcbf8a, headwear: "scarf" });
    const groom = makePerson(this, W * 0.56, H * 0.62, { robe: 0x1f6f6f, trim: 0xd9a441, skin: 0xdcbf8a, headwear: "doppi", facing: -1 });
    bride.setDepth(Math.round(bride.y) + 1); groom.setDepth(Math.round(groom.y) + 1);
    addBreathing(this, bride.bodyGfx); addBreathing(this, groom.bodyGfx, { delay: 200 });

    const dbox = new DialogueBox(this);
    dbox.show(STORY.ending, () => {
      this.add.text(W / 2, H * 0.86, "THE END", { fontFamily: "Georgia, serif", fontSize: "22px", color: "#2a1c10", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(W / 2, H * 0.93, "Adapted & expanded from an Uzbek folk tale, \"Uchar Gilam.\"\nBuilt with Phaser 3. Click to play again.", { fontSize: "12px", color: "#3a2a1a", align: "center" }).setOrigin(0.5);
      // Deferred by a tick on purpose: arming this on the same click that
      // just closed the dialogue could let that one click double as both
      // "close" and "play again", skipping past this screen entirely.
      this.time.delayedCall(50, () => {
        this.input.once("pointerdown", () => {
          GameState.reset();
          GameFlow.index = -1;
          this.scene.start("TitleScene");
        });
      });
    });
  }
}
