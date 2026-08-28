// ============================================================
// DialogueBox.js — a reusable VN-style text box.
// Usage: const dbox = new DialogueBox(this);
//        dbox.show([{speaker:'Baker', text:'...'}], () => next());
//        Click / tap / SPACE advances a line at a time.
// ============================================================

class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    const W = scene.scale.width, H = scene.scale.height;
    this.visible = false;
    this.lines = [];
    this.idx = 0;
    this.onDone = null;

    this.panel = scene.add.rectangle(W / 2, H - 72, W - 40, 116, 0x171025, 0.93)
      .setStrokeStyle(2, 0xd9a441, 0.9).setScrollFactor(0).setDepth(2000).setVisible(false);
    this.nameText = scene.add.text(40, H - 122, "", { fontFamily: "Georgia, serif", fontSize: "15px", color: "#e8c170", fontStyle: "bold" })
      .setScrollFactor(0).setDepth(2001).setVisible(false);
    this.bodyText = scene.add.text(40, H - 98, "", { fontFamily: "Georgia, serif", fontSize: "15px", color: "#f6ecd8", wordWrap: { width: W - 100 } })
      .setScrollFactor(0).setDepth(2001).setVisible(false);
    this.hintText = scene.add.text(W - 46, H - 32, "\u25B8", { fontSize: "18px", color: "#d9a441" })
      .setScrollFactor(0).setDepth(2001).setVisible(false);

    this.clickZone = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setScrollFactor(0).setDepth(1999).setVisible(false);
    this.clickZone.setInteractive();
    this.clickZone.on("pointerdown", () => this.advance());

    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on("keydown-SPACE", () => { if (this.visible) this.advance(); });
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
    this.hintText.setVisible(true);
    this.clickZone.setVisible(true);
    this.advance();
  }

  advance() {
    if (!this.visible) return;
    this.idx++;
    if (this.idx >= this.lines.length) { this.close(); return; }
    const l = this.lines[this.idx];
    this.nameText.setText(l.speaker || "");
    this.bodyText.setText(l.text || "");
  }

  close() {
    this.visible = false;
    this.panel.setVisible(false);
    this.nameText.setVisible(false);
    this.bodyText.setVisible(false);
    this.hintText.setVisible(false);
    this.clickZone.setVisible(false);
    const cb = this.onDone;
    this.onDone = null;
    if (cb) cb();
  }
}
