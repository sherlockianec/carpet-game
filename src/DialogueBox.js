// ============================================================
// DialogueBox.js — a reusable VN-style text box.
// Usage: const dbox = new DialogueBox(this);
//        dbox.show([{speaker:'Baker', text:'...'}], () => next());
// Advance via the visible "Continue" button, clicking the panel
// itself, or SPACE — never by tapping empty/unrelated parts of
// the screen, so it always has a clear, discoverable affordance.
// ============================================================

class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    const W = scene.scale.width, H = scene.scale.height;
    this.visible = false;
    this.lines = [];
    this.idx = 0;
    this.onDone = null;

    const panelY = H - 78, panelH = 128, panelW = W - 40;
    const panelTop = panelY - panelH / 2;

    this.panel = scene.add.rectangle(W / 2, panelY, panelW, panelH, 0x171025, 0.94)
      .setStrokeStyle(2, 0xd9a441, 0.9).setScrollFactor(0).setDepth(2000).setVisible(false)
      .setInteractive();
    this.panel.on("pointerdown", () => this.advance());

    // speaker name tag — background auto-sizes to the text, so long
    // names ("Gravekeeper", "King Sanobar") never clip.
    this.nameText = scene.add.text(40, panelTop + 10, "", {
      fontFamily: "Georgia, serif", fontSize: "14px", color: "#e8c170", fontStyle: "bold",
      backgroundColor: "#2a1f3d", padding: { x: 10, y: 5 }
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2002).setVisible(false);

    this.bodyText = scene.add.text(40, panelTop + 42, "", {
      fontFamily: "Georgia, serif", fontSize: "15px", color: "#f6ecd8", lineSpacing: 5,
      wordWrap: { width: W - 160 }
    }).setScrollFactor(0).setDepth(2001).setVisible(false);

    // --- explicit Continue button, bottom-right of the panel ---
    const btnW = 118, btnH = 34;
    const btnX = W / 2 + panelW / 2 - btnW / 2 - 14;
    const btnY = panelY + panelH / 2 - btnH / 2 - 12;
    this.btnBg = scene.add.rectangle(btnX, btnY, btnW, btnH, 0xd9a441, 1)
      .setStrokeStyle(2, 0x241811, 1).setScrollFactor(0).setDepth(2001).setVisible(false)
      .setInteractive({ useHandCursor: true });
    this.btnText = scene.add.text(btnX, btnY, "Continue \u25B8", {
      fontFamily: "Georgia, serif", fontSize: "14px", color: "#241811", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2002).setVisible(false);

    this.btnBg.on("pointerover", () => this.btnBg.setFillStyle(0xf2c465, 1));
    this.btnBg.on("pointerout", () => this.btnBg.setFillStyle(0xd9a441, 1));
    this.btnBg.on("pointerdown", (p, lx, ly, ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); this.advance(); });

    this._pulse = scene.tweens.add({
      targets: [this.btnBg, this.btnText], scaleX: 1.05, scaleY: 1.05,
      duration: 620, yoyo: true, repeat: -1, ease: "Sine.easeInOut", paused: true
    });

    if (scene.input && scene.input.keyboard) {
      this._spaceHandler = () => { if (this.visible) this.advance(); };
      scene.input.keyboard.on("keydown-SPACE", this._spaceHandler);
      scene.events.once("shutdown", () => scene.input.keyboard.off("keydown-SPACE", this._spaceHandler));
    }
  }

  show(lines, onDone) {
    this.lines = lines || [];
    this.idx = -1;
    this.onDone = onDone || null;
    this.visible = true;
    this.panel.setVisible(true);
    this.nameText.setVisible(true);
    this.bodyText.setVisible(true);
    this.btnBg.setVisible(true);
    this.btnText.setVisible(true);
    if (this._pulse) this._pulse.paused = false;
    this.advance();
  }

  advance() {
    if (!this.visible) return;
    this.idx++;
    if (this.idx >= this.lines.length) { this.close(); return; }
    const l = this.lines[this.idx];
    const hasSpeaker = !!(l.speaker && l.speaker.length);
    this.nameText.setText(l.speaker || "");
    this.nameText.setVisible(hasSpeaker);
    this.bodyText.setText(l.text || "");
    const isLast = this.idx >= this.lines.length - 1;
    this.btnText.setText(isLast ? "Close \u25B8" : "Continue \u25B8");
  }

  close() {
    this.visible = false;
    this.panel.setVisible(false);
    this.nameText.setVisible(false);
    this.bodyText.setVisible(false);
    this.btnBg.setVisible(false);
    this.btnText.setVisible(false);
    if (this._pulse) this._pulse.paused = true;
    const cb = this.onDone;
    this.onDone = null;
    if (cb) cb();
  }
}
