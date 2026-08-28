// ============================================================
// SceneVillagePalace.js — Chapter 1.
// Simplification note: in the original tale the FATHER makes
// the doomed trip to the palace. Here the player character goes
// directly, so there is one continuous controllable protagonist
// instead of a cutscene-only father figure.
// ============================================================

class VillagePalaceScene extends Phaser.Scene {
  constructor() { super("VillagePalaceScene"); }

  init(data) { this.phase = (data && data.phase) || 0; }

  create() {
    if (this.phase === 0) this.createVillage(); else this.createPalace();
  }

  createVillage() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0xf2c98a, 0xd98a4a);
    drawGround(this, 0x8a6a4a, 90);
    makeDome(this, 120, H - 70, 40, 0x2fb8ac, 0xd9a441);
    makeDome(this, W - 140, H - 70, 50, 0x1c4e80, 0xd9a441);

    this.player = makePerson(this, W * 0.35, H - 110, 0x1f6f6f, 0xdcbf8a);
    makePerson(this, W * 0.62, H - 110, 0x5a5040, 0xcfc3a8);

    drawClueHUD(this);
    const dbox = new DialogueBox(this);
    dbox.show(STORY.oldMan, () => {
      GameState.hasCarpet = true;
      this.time.delayedCall(200, () => this.scene.restart({ phase: 1 }));
    });
  }

  createPalace() {
    const W = this.scale.width, H = this.scale.height;
    drawSky(this, 0x241a3a, 0x120c1e);
    drawGround(this, 0x2a2036, 90);
    makeMinaret(this, 90, H - 70, 140, 0x1c4e80, 0xd9a441);
    makeMinaret(this, W - 90, H - 70, 140, 0x1c4e80, 0xd9a441);
    this.add.rectangle(W / 2, H - 70, W * 0.5, 120, 0x33284a).setStrokeStyle(3, 0xd9a441);

    this.player = makePerson(this, W * 0.3, H - 110, 0x1f6f6f, 0xdcbf8a);
    makePerson(this, W * 0.62, H - 140, 0x5b3a8e, 0xd9c9a8, 1.2);
    makePerson(this, W * 0.78, H - 120, 0x2c3e6b, 0xd9c9a8);

    drawClueHUD(this);
    const dbox = new DialogueBox(this);
    dbox.show(STORY.palace, () => GameFlow.advance(this.scene));
  }
}
