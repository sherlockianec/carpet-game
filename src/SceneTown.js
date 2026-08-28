// ============================================================
// SceneTown.js — one reusable scene for every "explore and find
// the right person" location (oven, graveyard, bakery street,
// saddler's row, and all four reverse-journey revisits).
// Config lives in data.js under STORY.towns[key].
// Click a spot: your character walks over and either gets a
// one-line dead end, or - on the target - the real dialogue.
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

    drawSky(this, cfg.skyTop, cfg.skyBottom);
    for (let i = 0; i < 3; i++) {
      makeDome(this, W * (0.16 + i * 0.34), H - 70, 42, cfg.buildingColor, cfg.accent);
    }
    drawGround(this, cfg.groundColor, 70);
    drawClueHUD(this);

    this.add.text(W / 2, 26, cfg.title, { fontFamily: "Georgia, serif", fontSize: "18px", color: "#f6ecd8", fontStyle: "bold" }).setOrigin(0.5);

    this.dbox = new DialogueBox(this);

    if (cfg.revisit) {
      this.player = makePerson(this, W * 0.5, H - 100, 0x1f6f6f, 0xdcbf8a);
      makePerson(this, W * 0.5, H - 150, 0x8a7a5a, 0xcfc3a8);
      this.time.delayedCall(500, () => this.doTarget(cfg));
      return;
    }

    this.player = makePerson(this, W * 0.5, H - 40, 0x1f6f6f, 0xdcbf8a);
    this.busy = false;
    cfg.spots.forEach(spot => {
      const x = W * spot.xf, y = H * spot.yf;
      const obj = spot.style === "grave" ? makeGrave(this, x, y) : makePerson(this, x, y, spot.robe || 0x8a6a4a, spot.head || 0xdcbf8a);
      makeClickable(obj, 34, spot.style === "grave" ? 36 : 66, () => this.onSpotClick(spot, obj));
    });

    this.add.text(W / 2, H - 14, "Click around to find who you need.", { fontSize: "13px", color: "#ffffffaa" }).setOrigin(0.5);
  }

  onSpotClick(spot, obj) {
    if (this.busy || this.dbox.visible) return;
    this.busy = true;
    this.tweens.add({
      targets: this.player, x: obj.x, y: obj.y + 50, duration: 420, ease: "Sine.easeInOut",
      onComplete: () => {
        if (spot.target) {
          this.doTarget(this.cfg);
        } else {
          const line = Phaser.Utils.Array.GetRandom(spot.miss || ["Not who you're looking for."]);
          this.dbox.show([{ speaker: spot.name || "", text: line }], () => { this.busy = false; });
        }
      }
    });
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
