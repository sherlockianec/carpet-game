// ============================================================
// SceneBookends.js — TitleScene and EndingScene.
// ============================================================

class TitleScene extends Phaser.Scene {
  constructor() { super("TitleScene"); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x1c4e80, 0x120c1e);
    this.add.circle(W * 0.8, H * 0.22, 40, 0xd9a441, 0.9);
    makeMinaret(this, W * 0.15, H - 60, 150, 0x14324f, 0xd9a441);
    makeMinaret(this, W * 0.85, H - 60, 170, 0x14324f, 0xd9a441);
    drawGround(this, 0x120c1e, 60);

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
    drawGround(this, 0xd9c9a0, 90);
    this.add.text(W / 2, 50, "Forty Days, Forty Nights", { fontFamily: "Georgia, serif", fontSize: "24px", color: "#2a1c10", fontStyle: "bold" }).setOrigin(0.5);

    makePerson(this, W * 0.42, H - 130, 0xb5456f, 0xdcbf8a);
    makePerson(this, W * 0.58, H - 130, 0x1f6f6f, 0xdcbf8a);

    const dbox = new DialogueBox(this);
    dbox.show(STORY.ending, () => {
      this.add.text(W / 2, H * 0.86, "THE END", { fontFamily: "Georgia, serif", fontSize: "22px", color: "#2a1c10", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(W / 2, H * 0.93, "Adapted & expanded from an Uzbek folk tale, \"Uchar Gilam.\"\nBuilt with Phaser 3. Click to play again.", { fontSize: "12px", color: "#3a2a1a", align: "center" }).setOrigin(0.5);
      this.input.once("pointerdown", () => {
        GameState.reset();
        GameFlow.index = -1;
        this.scene.start("TitleScene");
      });
    });
  }
}
