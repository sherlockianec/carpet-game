// ============================================================
// ui.js — everything that sits on top of the world: text,
// buttons, the pause/sound buttons, hearts, the objective chip,
// title banners, "you received" cards, the dialogue box and the
// pause menu.
// ============================================================

function paintIcon(ctx, name, s) {          // drawn around (0,0), s = overall size
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  fillC(ctx, PAL.goldLight); strokeC(ctx, PAL.goldLight, s * 0.09);
  if (name === "pause") {
    pRR(ctx, -s * 0.24, -s * 0.28, s * 0.17, s * 0.56, s * 0.05); ctx.fill();
    pRR(ctx, s * 0.07, -s * 0.28, s * 0.17, s * 0.56, s * 0.05); ctx.fill();
  } else if (name === "sound" || name === "mute") {
    ctx.beginPath(); ctx.moveTo(-s * 0.34, -s * 0.11); ctx.lineTo(-s * 0.18, -s * 0.11); ctx.lineTo(s * 0.0, -s * 0.28); ctx.lineTo(s * 0.0, s * 0.28); ctx.lineTo(-s * 0.18, s * 0.11); ctx.lineTo(-s * 0.34, s * 0.11); ctx.closePath(); ctx.fill();
    if (name === "sound") {
      ctx.beginPath(); ctx.arc(s * 0.02, 0, s * 0.17, -0.85, 0.85); ctx.stroke();
      ctx.beginPath(); ctx.arc(s * 0.02, 0, s * 0.31, -0.8, 0.8); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(s * 0.13, -s * 0.13); ctx.lineTo(s * 0.35, s * 0.13); ctx.moveTo(s * 0.35, -s * 0.13); ctx.lineTo(s * 0.13, s * 0.13); ctx.stroke();
    }
  } else if (name === "full") {
    const a = s * 0.3, b = s * 0.12;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(d => {
      ctx.beginPath(); ctx.moveTo(d[0] * a, d[1] * b); ctx.lineTo(d[0] * a, d[1] * a); ctx.lineTo(d[0] * b, d[1] * a); ctx.stroke();
    });
  }
}
function paintHeart(ctx, x, y, s, full) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.34);
  ctx.bezierCurveTo(x - s * 0.62, y - s * 0.06, x - s * 0.44, y - s * 0.52, x, y - s * 0.2);
  ctx.bezierCurveTo(x + s * 0.44, y - s * 0.52, x + s * 0.62, y - s * 0.06, x, y + s * 0.34);
  ctx.closePath();
  if (full) {
    ctx.fillStyle = gradV(ctx, y - s * 0.4, y + s * 0.34, [[0, 0xf06a6a], [1, 0xa82436]]); ctx.fill();
    strokeC(ctx, 0x4a0e18, s * 0.07); ctx.stroke();
    pEll(ctx, x - s * 0.2, y - s * 0.16, s * 0.1, s * 0.07, -0.5); fillC(ctx, 0xffffff, 0.6); ctx.fill();
  } else {
    fillC(ctx, 0x000000, 0.35); ctx.fill();
    strokeC(ctx, 0x8a6a6a, s * 0.06, 0.8); ctx.stroke();
  }
}
// The three things the hero carries between people.
function paintClue(ctx, key, s) {            // around (0,0)
  if (key === "swatch") {
    ctx.save(); ctx.rotate(-0.12);
    pRR(ctx, -s * 0.36, -s * 0.3, s * 0.72, s * 0.6, 3);
    ctx.fillStyle = patS(ctx, tileIkat([0x8e2f2f, 0xd9a441, 0x1c4e80, 0xf6ecd8], "clue"), s / 150); ctx.fill();
    strokeC(ctx, 0x3a1414, 2); ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    pEll(ctx, 0, 0, s * 0.17, s * 0.17); fillC(ctx, 0xf6ecd8); ctx.fill(); strokeC(ctx, 0x6a4712, 2); ctx.stroke();
    fillC(ctx, 0x6a4712); pStar(ctx, 0, 0, 8, s * 0.11, s * 0.05, 0); ctx.fill();
    ctx.restore();
  } else if (key === "phrase") {
    pRR(ctx, -s * 0.38, -s * 0.3, s * 0.76, s * 0.5, s * 0.12); fillC(ctx, 0xf2e6c8); ctx.fill(); strokeC(ctx, 0x6a4712, 2.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.16, s * 0.19); ctx.lineTo(-s * 0.24, s * 0.38); ctx.lineTo(-s * 0.02, s * 0.2); ctx.closePath(); fillC(ctx, 0xf2e6c8); ctx.fill(); ctx.stroke();
    fillC(ctx, 0xf2e6c8); ctx.fillRect(-s * 0.2, s * 0.13, s * 0.22, s * 0.08);
    strokeC(ctx, 0x2fb8ac, 3.4); ctx.lineCap = "round";
    [-0.14, -0.02].forEach((y, i) => { ctx.beginPath(); ctx.moveTo(-s * 0.26, s * y); ctx.lineTo(s * (i ? 0.12 : 0.26), s * y); ctx.stroke(); });
  } else if (key === "caseObtained") {
    pRR(ctx, -s * 0.38, -s * 0.2, s * 0.76, s * 0.42, s * 0.1);
    ctx.fillStyle = gradV(ctx, -s * 0.2, s * 0.22, [[0, 0xa8744a], [1, 0x6b4426]]); ctx.fill(); strokeC(ctx, 0x2a160a, 2.4); ctx.stroke();
    strokeC(ctx, 0x3a2414, 2, 0.7); ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.2); ctx.lineTo(-s * 0.18, s * 0.22); ctx.moveTo(s * 0.18, -s * 0.2); ctx.lineTo(s * 0.18, s * 0.22); ctx.stroke();
    pEll(ctx, 0, 0.01 * s, s * 0.13, s * 0.13); fillC(ctx, 0xa82436); ctx.fill(); strokeC(ctx, 0x4a0e18, 2); ctx.stroke();
    fillC(ctx, 0xe8707a); pStar(ctx, 0, 0.01 * s, 6, s * 0.07, s * 0.035, 0); ctx.fill();
  } else if (key === "carpet") {
    paintRugTop(ctx, -s * 0.42, -s * 0.24, s * 0.84, s * 0.48, {});
  }
}
const CLUE_INFO = {
  swatch: { name: "A swatch of cloth", note: "From the hidden compartment of Qahraton's last saddle. A baker's mark is stitched into it." },
  phrase: { name: "A whispered phrase", note: "\"The keeper of the west gate of the dead.\"" },
  caseObtained: { name: "The sealed case", note: "Carried twenty years by a man too afraid to deliver it. Still unopened." },
  carpet: { name: "The flying carpet", note: "Sit upon it and speak the old words. Folded, it is a plain handkerchief." }
};

const UI = {
  // ---------- text ----------
  text(scene, x, y, str, o) {
    o = o || {};
    const style = {
      fontFamily: o.font || FONT_B, fontSize: (o.size || 32) + "px", color: o.color || "#f6ecd8",
      fontStyle: o.style || "normal", align: o.align || "center"
    };
    if (o.wrap) style.wordWrap = { width: o.wrap };
    if (o.lineSpacing !== undefined) style.lineSpacing = o.lineSpacing;
    if (o.stroke) { style.stroke = o.stroke; style.strokeThickness = o.strokeW || 6; }
    if (o.letterSpacing) style.letterSpacing = o.letterSpacing;
    const t = scene.add.text(x, y, str, style);
    t.setPadding(8, 6, 8, 10);
    if (o.shadow !== false) t.setShadow(0, 3, o.shadowColor || "rgba(0,0,0,0.6)", o.shadowBlur === undefined ? 7 : o.shadowBlur, true, true);
    t.setOrigin(o.ox === undefined ? 0.5 : o.ox, o.oy === undefined ? 0.5 : o.oy);
    if (o.depth !== undefined) t.setDepth(o.depth);
    if (o.fixed) t.setScrollFactor(0);
    return t;
  },
  title(scene, x, y, str, o) { return this.text(scene, x, y, str, Object.assign({ font: FONT_T, style: "bold" }, o || {})); },

  // ---------- buttons ----------
  button(scene, x, y, label, onClick, o) {
    o = o || {};
    const w = o.w || 440, h = o.h || 86, prim = !!o.primary;
    const key = Tex.make(scene, "btn_" + w + "_" + h + (prim ? "p" : "s"), w + 60, h + 60, (ctx) => {
      const X = 30, Y = 30;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      pRR(ctx, X, Y, w, h, h / 2);
      ctx.fillStyle = prim ? gradV(ctx, Y, Y + h, [[0, 0xf7dc94], [0.5, PAL.gold], [1, 0xb07a22]]) : gradV(ctx, Y, Y + h, [[0, 0x2c2458], [1, 0x151033]]);
      ctx.fill(); ctx.restore();
      pRR(ctx, X + 2, Y + 2, w - 4, h - 4, h / 2 - 2); strokeC(ctx, prim ? 0x6a4712 : PAL.gold, 3); ctx.stroke();
      pRR(ctx, X + 8, Y + 8, w - 16, h - 16, h / 2 - 8); strokeC(ctx, prim ? 0xfff0c0 : PAL.gold, 1.2, 0.5); ctx.stroke();
      fillC(ctx, prim ? 0x6a4712 : PAL.gold);
      pStar(ctx, X + 34, Y + h / 2, 4, 8, 3, 0); ctx.fill(); pStar(ctx, X + w - 34, Y + h / 2, 4, 8, 3, 0); ctx.fill();
    }, true);
    const bg = scene.add.image(0, 0, key);
    const txt = this.title(scene, 0, -1, label, { size: o.size || 36, color: prim ? "#2a1a08" : "#f4d58a", shadow: !prim });
    const c = scene.add.container(x, y, [bg, txt]).setDepth(o.depth === undefined ? 100 : o.depth);
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.isHud = true; c.label = txt;
    c.on("pointerover", () => { scene.tweens.add({ targets: c, scale: 1.05, duration: 110 }); Snd.play("hover"); });
    c.on("pointerout", () => scene.tweens.add({ targets: c, scale: 1, duration: 110 }));
    c.on("pointerdown", () => { Snd.play("click"); onClick(); });
    if (o.fixed) c.setScrollFactor(0, 0, true);
    return c;
  },
  iconButton(scene, x, y, icon, onClick, o) {
    o = o || {};
    const S = o.size || 76;
    const mk = name => Tex.make(scene, "ico_" + name + "_" + S, S + 16, S + 16, (ctx) => {
      const c0 = (S + 16) / 2;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
      ctx.beginPath(); ctx.arc(c0, c0, S / 2, 0, Math.PI * 2);
      ctx.fillStyle = gradV(ctx, c0 - S / 2, c0 + S / 2, [[0, 0x2c2458, 0.92], [1, 0x120e2a, 0.92]]); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(c0, c0, S / 2 - 2, 0, Math.PI * 2); strokeC(ctx, PAL.gold, 2.4); ctx.stroke();
      ctx.save(); ctx.translate(c0, c0); paintIcon(ctx, name, S * 0.62); ctx.restore();
    }, true);
    const img = scene.add.image(x, y, mk(icon)).setDepth(o.depth === undefined ? 9000 : o.depth).setScrollFactor(0);
    img.setInteractive({ useHandCursor: true });
    img.isHud = true;
    img.setIcon = name => img.setTexture(mk(name));
    img.on("pointerover", () => img.setScale(1.08));
    img.on("pointerout", () => img.setScale(1));
    img.on("pointerdown", () => { Snd.play("click"); onClick(); });
    return img;
  },

  // ---------- pause + sound buttons, top right ----------
  hud(scene) {
    scene.hudPause = this.iconButton(scene, W - 62, 60, "pause", () => scene.openPause());
    scene.hudSound = this.iconButton(scene, W - 150, 60, this.soundIcon(), () => this.toggleSound(scene));
  },
  soundIcon() { return (Snd.sfxOn || Snd.musicOn) ? "sound" : "mute"; },
  toggleSound(scene) {
    const on = !(Snd.sfxOn || Snd.musicOn);
    Snd.setSfx(on); Snd.setMusic(on);
    Save.data.sfx = on; Save.data.music = on; Save.write();
    if (scene && scene.hudSound && scene.hudSound.active) scene.hudSound.setIcon(this.soundIcon());
    if (on) Snd.play("click");
  },

  // ---------- small panels sized to their text ----------
  pill(scene, x, y, str, o) {
    o = o || {};
    const t = this.text(scene, 0, 0, str, { size: o.size || 27, color: o.color || "#f1e3c2", style: o.style || "normal", shadow: false, font: o.font });
    const w = Math.max(o.minW || 0, Math.ceil((t.width + (o.padX || 44)) / 20) * 20), h = o.h || 54;
    const key = Tex.make(scene, "pill_" + w + "_" + h + (o.gold ? "g" : ""), w + 24, h + 24, (ctx) => {
      pRR(ctx, 12, 12, w, h, h / 2); fillC(ctx, 0x0e0b22, o.alpha === undefined ? 0.66 : o.alpha); ctx.fill();
      if (o.gold) { pRR(ctx, 13, 13, w - 2, h - 2, h / 2 - 1); strokeC(ctx, PAL.gold, 2, 0.85); ctx.stroke(); }
    });
    const c = scene.add.container(x, y, [scene.add.image(0, 0, key), t]).setDepth(o.depth === undefined ? 8900 : o.depth);
    c.setScrollFactor(0, 0, true);
    c.textObj = t;
    return c;
  },
  // Control hint along the bottom edge.
  hint(scene, str) {
    if (scene._hint) scene._hint.destroy();
    scene._hint = this.pill(scene, W / 2, H - 44, str, { size: 26, color: "#e9dcbd" });
    return scene._hint;
  },
  // "What am I doing here" chip, top left.
  objective(scene, str) {
    if (scene._obj) scene._obj.destroy();
    if (!str) { scene._obj = null; return null; }
    const t = this.text(scene, 0, 0, str, { size: 29, color: "#f4d58a", ox: 0, shadow: false });
    const w = Math.ceil((t.width + 104) / 20) * 20, h = 64;
    const key = Tex.make(scene, "obj_" + w, w + 30, h + 30, (ctx) => {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      pRR(ctx, 15, 15, w, h, 14); ctx.fillStyle = gradV(ctx, 15, 15 + h, [[0, 0x241c4a, 0.93], [1, 0x120e2a, 0.93]]); ctx.fill(); ctx.restore();
      pRR(ctx, 17, 17, w - 4, h - 4, 12); strokeC(ctx, PAL.gold, 2.2); ctx.stroke();
      fillC(ctx, PAL.gold); pStar(ctx, 15 + 36, 15 + h / 2, 4, 13, 5, 0); ctx.fill();
      fillC(ctx, 0x241c4a); pStar(ctx, 15 + 36, 15 + h / 2, 4, 6, 2.4, Math.PI / 4); ctx.fill();
    });
    t.setPosition(-w / 2 + 66, 0);
    const c = scene.add.container(36 + w / 2, 62, [scene.add.image(0, 0, key), t]).setDepth(8900);
    c.setScrollFactor(0, 0, true);
    c.setAlpha(0); c.x -= 30;
    scene.tweens.add({ targets: c, alpha: 1, x: c.x + 30, duration: 420, ease: "Cubic.easeOut", delay: 250 });
    scene._obj = c;
    return c;
  },
  // Location / chapter card that drifts in and out near the top.
  banner(scene, title, sub, o) {
    o = o || {};
    const y = o.y || 200;
    const tt = this.title(scene, 0, 0, title, { size: o.size || 66, color: "#f8e3a6", letterSpacing: 3 });
    const kids = [tt];
    const rule = scene.add.graphics();
    const rw = Math.max(260, tt.width * 0.72);
    rule.lineStyle(2, PAL.gold, 0.9);
    rule.lineBetween(-rw / 2, 50, -18, 50); rule.lineBetween(18, 50, rw / 2, 50);
    rule.fillStyle(PAL.gold, 1); rule.fillTriangle(-9, 50, 0, 41, 9, 50); rule.fillTriangle(-9, 50, 0, 59, 9, 50);
    kids.push(rule);
    if (sub) kids.push(this.text(scene, 0, 92, sub, { size: 32, color: "#eadcbb", style: "italic" }));
    const c = scene.add.container(W / 2, y - 24, kids).setDepth(9400).setAlpha(0);
    c.setScrollFactor(0, 0, true);
    scene.tweens.add({ targets: c, alpha: 1, y: y, duration: 700, ease: "Cubic.easeOut", delay: o.delay || 300 });
    if (o.hold !== 0) scene.tweens.add({ targets: c, alpha: 0, y: y - 16, duration: 700, delay: (o.delay || 300) + (o.hold || 2600), onComplete: () => c.destroy() });
    return c;
  },
  toast(scene, str, o) {
    o = o || {};
    const c = this.pill(scene, W / 2, o.y || 250, str, { size: o.size || 34, color: o.color || "#f8e3a6", gold: true, h: 70, padX: 70, alpha: 0.85, depth: 9450, font: FONT_T, style: "bold" });
    c.setAlpha(0).setScale(0.9);
    scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 220, ease: "Back.easeOut" });
    scene.tweens.add({ targets: c, alpha: 0, y: c.y - 20, duration: 400, delay: o.hold || 1400, onComplete: () => c.destroy() });
    return c;
  },

  // ---------- hearts ----------
  hearts(scene, x, y, max) {
    const S = 58;
    const kf = Tex.make(scene, "heart_full", S, S, ctx => paintHeart(ctx, S / 2, S / 2 + 2, S * 0.8, true), true);
    const ke = Tex.make(scene, "heart_empty", S, S, ctx => paintHeart(ctx, S / 2, S / 2 + 2, S * 0.8, false), true);
    const imgs = [];
    for (let i = 0; i < max; i++) imgs.push(scene.add.image(x + i * 56, y, kf).setDepth(8900).setScrollFactor(0));
    return {
      imgs, n: max,
      set(n) {
        for (let i = 0; i < imgs.length; i++) {
          const full = i < n;
          if (!full && i < this.n) scene.tweens.add({ targets: imgs[i], scale: 1.5, duration: 110, yoyo: true });
          imgs[i].setTexture(full ? kf : ke);
        }
        this.n = n;
      }
    };
  },

  // ---------- the three clues, bottom left (only once you own one) ----------
  clues(scene) {
    const keys = ["swatch", "phrase", "caseObtained"];
    if (!keys.some(k => GameState.clues[k])) return;
    keys.forEach((k, i) => {
      const has = !!GameState.clues[k];
      const key = Tex.make(scene, "clue_" + k + (has ? "1" : "0"), 96, 96, (ctx) => {
        pRR(ctx, 6, 6, 84, 84, 16); fillC(ctx, 0x120e2a, 0.82); ctx.fill();
        strokeC(ctx, has ? PAL.gold : 0x4a426a, 2.4); ctx.stroke();
        if (has) { ctx.save(); ctx.translate(48, 48); paintClue(ctx, k, 84); ctx.restore(); }
      });
      scene.add.image(64 + i * 96, H - 66, key).setDepth(8900).setScrollFactor(0);
    });
  },

  // ---------- "you received ..." card ----------
  itemGet(scene, clueKey, onDone) {
    const info = CLUE_INFO[clueKey], kids = [];
    const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x05040c, 0.62).setDepth(9500).setScrollFactor(0).setInteractive();
    const pk = Tex.make(scene, "ig_panel", 900, 560, ctx => paintPanel(ctx, 30, 30, 840, 500, {}));
    const ik = Tex.make(scene, "ig_" + clueKey, 300, 300, (ctx) => { ctx.translate(150, 150); paintClue(ctx, clueKey, 280); });
    const glow = addGlow(scene, 0, -70, 520, 0xffd27a, 0.5);
    kids.push(scene.add.image(0, 0, pk), glow);
    kids.push(this.text(scene, 0, -208, "You received", { size: 30, color: "#cbbd9a", style: "italic" }));
    const icon = scene.add.image(0, -70, ik); kids.push(icon);
    kids.push(this.title(scene, 0, 70, info.name, { size: 50, color: "#f8e3a6" }));
    kids.push(this.text(scene, 0, 150, info.note, { size: 30, color: "#f1e3c2", wrap: 700, lineSpacing: 4 }));
    const c = scene.add.container(W / 2, H / 2, kids).setDepth(9501).setScale(0.8).setAlpha(0);
    c.setScrollFactor(0, 0, true);
    Snd.play("magic");
    scene.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 380, ease: "Back.easeOut" });
    scene.tweens.add({ targets: glow, angle: 360, duration: 9000, repeat: -1 });
    scene.tweens.add({ targets: icon, y: -80, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const sparks = scene.add.particles(W / 2, H / 2 - 70, "fx-spark", {
      speed: { min: 60, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 900,
      alpha: { start: 1, end: 0 }, tint: [0xffe9a8, 0xffffff, 0xd9a441], blendMode: "ADD", emitting: false
    }).setDepth(9502).setScrollFactor(0);
    sparks.explode(26);
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      Snd.play("next");
      scene.tweens.add({ targets: [c, dim], alpha: 0, duration: 260, onComplete: () => { c.destroy(); dim.destroy(); sparks.destroy(); if (onDone) onDone(); } });
    };
    scene.time.delayedCall(700, () => {
      const hint = this.text(scene, 0, 222, scene.touchMode ? "tap to continue" : "click or press Space", { size: 24, color: "#9d91b8" });
      c.add(hint);
      scene.tweens.add({ targets: hint, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
      dim.once("pointerdown", finish);
      const kb = () => finish();
      scene.input.keyboard.once("keydown-SPACE", kb);
      scene.input.keyboard.once("keydown-ENTER", kb);
    });
  }
};

// ============================================================
// DialogueBox
//   const dbox = new DialogueBox(this);
//   dbox.actors = { "Baker": bakerPerson };      // optional: who nods while speaking
//   dbox.show(lines, () => next());
// A line is { speaker, text } and may add `who` (a person config for the
// portrait). A blank speaker is narration; the speaker "Letter" is shown as
// a parchment letter. Click / tap / Space / Enter finishes the line that is
// being written, then moves on.
// ============================================================

class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.actors = {};
    this.lines = []; this.idx = -1; this.onDone = null;
    this.full = ""; this.shown = 0; this.typing = false; this.openedAt = 0;
    this.built = false;

    scene.input.on("pointerdown", (p, over) => {
      if (!this.visible) return;
      if (over && over.some(o => o.isHud)) return;
      this.advance();
    });
    const key = () => { if (this.visible) this.advance(); };
    scene.input.keyboard.on("keydown-SPACE", key);
    scene.input.keyboard.on("keydown-ENTER", key);
    scene.input.keyboard.on("keydown-E", key);
    scene.onUpdate((t, d) => this.update(d));
  }

  build() {
    const sc = this.scene, D = 9200;
    this.built = true;
    const kp = Tex.make(sc, "dlg_panel", 1560, 320, ctx => paintPanel(ctx, 30, 30, 1500, 260, {}));
    const kn = Tex.make(sc, "dlg_narr", 1360, 280, ctx => paintPanel(ctx, 30, 30, 1300, 220, { alpha: 0.9, top: 0x1c1838, bot: 0x0d0b1e }));
    const kl = Tex.make(sc, "dlg_letter", 1180, 600, (ctx) => {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      const r = rng("letter"), pts = [];
      for (let i = 0; i <= 22; i++) pts.push([40 + i * 50, 40 + r.range(-4, 4)]);
      for (let i = 0; i <= 10; i++) pts.push([1140 + r.range(-4, 4), 40 + i * 52]);
      for (let i = 22; i >= 0; i--) pts.push([40 + i * 50, 560 + r.range(-4, 4)]);
      for (let i = 10; i >= 0; i--) pts.push([40 + r.range(-4, 4), 40 + i * 52]);
      pPoly(ctx, pts);
      ctx.fillStyle = gradV(ctx, 40, 560, [[0, 0xf3e4bd], [1, 0xd9c08c]]); ctx.fill(); ctx.restore();
      mottle(ctx, 40, 40, 1100, 520, 0x8a6a3a, 0.16, 26, "letterm", 50, 180);
      grain(ctx, 0, 0, 1180, 600, 0.09);
      strokeC(ctx, 0x8a6a3a, 1.4, 0.5);
      for (let y = 150; y < 520; y += 62) { ctx.beginPath(); ctx.moveTo(110, y + 44); ctx.lineTo(1070, y + 44); ctx.stroke(); }
      pEll(ctx, 1030, 500, 34, 34); fillC(ctx, 0xa82436); ctx.fill(); strokeC(ctx, 0x4a0e18, 3); ctx.stroke();
      fillC(ctx, 0xe8707a); pStar(ctx, 1030, 500, 6, 20, 10, 0); ctx.fill();
    });
    const kr = Tex.make(sc, "dlg_name", 460, 84, (ctx) => {
      pRR(ctx, 6, 8, 448, 66, 12); ctx.fillStyle = gradV(ctx, 8, 74, [[0, 0xa8323c], [1, 0x6e1c28]]); ctx.fill();
      strokeC(ctx, PAL.gold, 2.4); ctx.stroke();
      fillC(ctx, PAL.goldLight); pStar(ctx, 34, 41, 4, 9, 3.4, 0); ctx.fill(); pStar(ctx, 426, 41, 4, 9, 3.4, 0); ctx.fill();
    });
    this.dim = sc.add.rectangle(W / 2, H / 2, W, H, 0x05040c, 0.55).setDepth(D - 1).setScrollFactor(0).setVisible(false);
    this.panel = sc.add.image(W / 2, 905, kp).setDepth(D).setScrollFactor(0).setVisible(false);
    this.narr = sc.add.image(W / 2, 915, kn).setDepth(D).setScrollFactor(0).setVisible(false);
    this.letter = sc.add.image(W / 2, 480, kl).setDepth(D).setScrollFactor(0).setVisible(false);
    this.keys = { panel: kp, narr: kn, letter: kl };
    this.portrait = sc.add.image(318, 890, "fx-white").setDepth(D + 2).setScrollFactor(0).setVisible(false);
    this.nameBg = sc.add.image(670, 782, kr).setDepth(D + 1).setScrollFactor(0).setVisible(false);
    this.nameText = UI.title(sc, 670, 780, "", { size: 36, color: "#fbeec4" }).setDepth(D + 2).setScrollFactor(0).setVisible(false);
    this.body = UI.text(sc, 452, 838, "", { size: 37, color: "#f6ecd8", ox: 0, oy: 0, align: "left", wrap: 1180, lineSpacing: 8 })
      .setDepth(D + 2).setScrollFactor(0).setVisible(false);
    this.more = sc.add.image(1650, 1004, "fx-spark").setDepth(D + 2).setScrollFactor(0).setTint(PAL.goldLight).setScale(0.6).setVisible(false);
    sc.tweens.add({ targets: this.more, scale: 0.85, alpha: 0.55, duration: 520, yoyo: true, repeat: -1 });
    this.skip = UI.text(sc, 1672, 800, "skip ▸▸", { size: 24, color: "#9d91b8", ox: 1 }).setDepth(D + 3).setScrollFactor(0).setVisible(false);
    this.skip.setInteractive({ useHandCursor: true }); this.skip.isHud = true;
    this.skip.on("pointerover", () => this.skip.setColor("#f4d58a"));
    this.skip.on("pointerout", () => this.skip.setColor("#9d91b8"));
    this.skip.on("pointerdown", () => { if (this.visible) { Snd.play("click"); this.close(); } });
  }

  show(lines, onDone) {
    if (!this.built) this.build();
    this.lines = lines || [];
    this.idx = -1;
    this.onDone = onDone || null;
    this.visible = true;
    this.openedAt = this.scene.time.now;
    this.skip.setVisible(this.lines.length > 2);
    this.next();
  }

  layout(mode, hasPortrait) {
    this.panel.setVisible(mode === "say");
    this.narr.setVisible(mode === "narr");
    this.letter.setVisible(mode === "letter");
    this.dim.setVisible(mode === "letter");
    const b = this.body;
    if (mode === "say") {
      b.setStyle({ fontStyle: "normal", color: "#f6ecd8", align: "left", fontSize: "37px", wordWrap: { width: hasPortrait ? 1180 : 1380 } });
      b.setOrigin(0, 0).setPosition(hasPortrait ? 452 : 250, 838).setShadow(0, 3, "rgba(0,0,0,0.6)", 6, true, true);
      this.more.setPosition(1650, 1004);
    } else if (mode === "narr") {
      b.setStyle({ fontStyle: "italic", color: "#efe3c6", align: "center", fontSize: "36px", wordWrap: { width: 1150 } });
      b.setOrigin(0.5, 0.5).setPosition(W / 2, 912).setShadow(0, 3, "rgba(0,0,0,0.6)", 6, true, true);
      this.more.setPosition(1560, 1000);
    } else {
      b.setStyle({ fontStyle: "italic", color: "#3a2412", align: "left", fontSize: "41px", wordWrap: { width: 940 } });
      b.setOrigin(0, 0).setPosition(W / 2 - 470, 262).setShadow(0, 0, "rgba(0,0,0,0)", 0, false, false);
      this.more.setPosition(W / 2 + 470, 742);
    }
  }

  next() {
    this.idx++;
    if (this.idx >= this.lines.length) { this.close(); return; }
    const l = this.lines[this.idx], sc = this.scene;
    const isLetter = l.speaker === "Letter";
    const isNarr = !isLetter && !(l.speaker && l.speaker.length);
    const who = l.who || (!isNarr && !isLetter ? (STORY.cast[l.speaker] || null) : null);
    this.layout(isLetter ? "letter" : (isNarr ? "narr" : "say"), !!who);

    if (who) {
      this.portrait.setTexture(portraitKey(sc, who, 250)).setVisible(true).setScale(0.86).setAlpha(0.6);
      sc.tweens.add({ targets: this.portrait, scale: 1, alpha: 1, duration: 200, ease: "Back.easeOut" });
    } else this.portrait.setVisible(false);
    const named = !isNarr && !isLetter;
    this.nameBg.setVisible(named); this.nameText.setVisible(named);
    if (named) {
      const nx = who ? 670 : 470;
      this.nameBg.setPosition(nx, 782); this.nameText.setPosition(nx, 780).setText(l.speaker);
    }

    // Wrap once up front so words never jump lines while being written.
    this.body.setText("").setVisible(true);
    this.full = this.body.getWrappedText(l.text || "").join("\n");
    this.shown = 0; this.acc = 0; this.typing = true;
    this.more.setVisible(false);
    this.voice = isLetter || isNarr ? 0 : 300 + (hashSeed(l.speaker) % 9) * 38;
    if (isLetter) Snd.play("paper"); else if (this.idx > 0) Snd.play("next");

    Object.keys(this.actors).forEach(n => { const a = this.actors[n]; if (a && a.active) a.talking = (n === l.speaker); });
    if (this.onLine) this.onLine(l, this.idx);
  }

  update(d) {
    if (!this.visible || !this.typing) return;
    this.acc += d * 0.062;                         // characters per millisecond
    const want = Math.min(this.full.length, Math.floor(this.acc));
    if (want > this.shown) {
      const ch = this.full.charAt(want - 1);
      if (this.voice && want % 3 === 0 && ch !== " " && ch !== "\n") Snd.play("blip", { pitch: this.voice });
      this.shown = want;
      this.body.setText(this.full.substring(0, this.shown));
      if (this.shown >= this.full.length) this.finishLine();
    }
  }
  finishLine() {
    this.typing = false;
    this.shown = this.full.length;
    this.body.setText(this.full);
    this.more.setVisible(true);
    Object.keys(this.actors).forEach(n => { const a = this.actors[n]; if (a && a.active) a.talking = false; });
  }

  advance() {
    if (!this.visible) return;
    if (this.scene.time.now - this.openedAt < 180) return;    // the click that opened us
    if (this.typing) { this.finishLine(); return; }
    this.next();
  }

  close() {
    this.visible = false; this.typing = false;
    [this.dim, this.panel, this.narr, this.letter, this.portrait, this.nameBg, this.nameText, this.body, this.more, this.skip].forEach(o => o.setVisible(false));
    Object.keys(this.actors).forEach(n => { const a = this.actors[n]; if (a && a.active) a.talking = false; });
    const cb = this.onDone;
    this.onDone = null;
    if (cb) cb();
  }
}

// ============================================================
// PauseScene — launched on top of whatever was running.
// ============================================================

class PauseScene extends Phaser.Scene {
  constructor() { super("PauseScene"); }
  init(data) { this.from = data.from; this.skipText = data.skip; }

  create() {
    const rows = 5 + (this.skipText ? 1 : 0), ph = 250 + rows * 104;
    this.add.rectangle(W / 2, H / 2, W, H, 0x05040c, 0.74).setInteractive();
    const pk = Tex.make(this, "pause_panel_" + ph, 820, ph + 60, ctx => paintPanel(ctx, 30, 30, 760, ph, {}), true);
    this.add.image(W / 2, H / 2, pk);
    const top = H / 2 - ph / 2;
    UI.title(this, W / 2, top + 82, "Paused", { size: 62, color: "#f8e3a6", letterSpacing: 4 });
    UI.text(this, W / 2, top + 146, GameFlow.index >= 0 ? GameFlow.chapterName(GameFlow.index) : "Uchar Gilam", { size: 28, color: "#b9abd0", style: "italic" });
    let y = top + 236;
    const add = (label, fn, primary) => { const b = UI.button(this, W / 2, y, label, fn, { w: 520, h: 80, size: 33, primary }); y += 104; return b; };
    add("Resume", () => this.resume(), true);
    const sfx = add("", () => { Snd.setSfx(!Snd.sfxOn); Save.data.sfx = Snd.sfxOn; Save.write(); label(); Snd.play("click"); });
    const mus = add("", () => { Snd.setMusic(!Snd.musicOn); Save.data.music = Snd.musicOn; Save.write(); label(); });
    const label = () => {
      sfx.label.setText("Sound: " + (Snd.sfxOn ? "On" : "Off"));
      mus.label.setText("Music: " + (Snd.musicOn ? "On" : "Off"));
      const sc = this.scene.get(this.from);
      if (sc && sc.hudSound && sc.hudSound.active) sc.hudSound.setIcon(UI.soundIcon());
    };
    label();
    add("Fullscreen", () => { try { this.scale.toggleFullscreen(); } catch (e) { /* not allowed here */ } });
    if (this.skipText) add(this.skipText, () => {
      const sc = this.scene.get(this.from);
      this.scene.resume(this.from); this.scene.stop();
      if (sc && sc.skipChallenge) sc.skipChallenge();
    });
    add("Quit to Title", () => {
      Music.play(null); Snd.ambience(null);
      this.scene.stop(this.from);
      this.scene.start("TitleScene");
    });
    this.input.keyboard.on("keydown-ESC", () => this.resume());
  }

  resume() {
    this.scene.resume(this.from);
    this.scene.stop();
  }
}
