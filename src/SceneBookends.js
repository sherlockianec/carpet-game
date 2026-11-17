// ============================================================
// SceneBookends.js — the title screen and the wedding ending.
// ============================================================

function paintNightCity(ctx, o) {
  o = o || {};
  paintSky(ctx, W, H, [[0, 0x070818], [0.45, 0x1a1a48], [0.8, 0x4a2a5a], [1, 0x8a4a5a]]);
  paintStars(ctx, W, 760, 360, "titlestars", 1);
  paintMoon(ctx, o.moonX || 1480, o.moonY || 250, 96);
  paintCloud(ctx, 520, 420, 520, 100, 0x2a2a58, "tc1", { lit: 0x6a6aa0 });
  paintCloud(ctx, 1640, 520, 420, 80, 0x2a2a58, "tc2", { lit: 0x6a6aa0 });
  paintRidge(ctx, W, 820, { seed: "tridge", amp: 160, color: 0x231a40, color2: 0x2e1f48 });
  paintSkyline(ctx, W, 900, { seed: "tfar", color: 0x1a1434, color2: 0x241a3c, minH: 80, maxH: 260, lights: 0.8, finial: 0x8a6a3a });
  paintSkyline(ctx, W, 980, { seed: "tnear", color: 0x0e0b20, color2: 0x120e26, minH: 60, maxH: 340, lights: 1, scale: 1.5, finial: 0x6a4a2a });
  ctx.fillStyle = gradV(ctx, 960, H, [[0, 0x0b0918], [1, 0x05040c]]); ctx.fillRect(0, 960, W, H - 960);
  grain(ctx, 0, 0, W, H, 0.035);
}

class TitleScene extends BaseScene {
  constructor() { super("TitleScene"); }

  create() {
    this.begin({ music: "title", amb: "night", hud: false });
    this.noPause = true;
    addBackdrop(this, "title_bg", ctx => paintNightCity(ctx));
    const moonGlow = addGlow(this, 1480, 250, 700, 0x9ab0ff, 0.25).setDepth(-5);
    this.tweens.add({ targets: moonGlow, alpha: 0.15, duration: 3000, yoyo: true, repeat: -1 });
    ambientParticles(this, "fireflies", { area: { x: 0, y: 700, w: W, h: 380 }, freq: 400 });

    this.carpet = makeFlyingCarpet(this, 1350, 560, 1.5);
    this.carpet.setDepth(50);
    this.tweens.add({ targets: this.carpet, x: 1420, duration: 4200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: this.carpet, y: 600, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const glow = addGlow(this, 560, 300, 900, 0xd9a441, 0.18).setDepth(80);
    this.tweens.add({ targets: glow, alpha: 0.1, duration: 2400, yoyo: true, repeat: -1 });
    const t1 = UI.title(this, 560, 270, "UCHAR GILAM", { size: 140, color: "#f6d98c", letterSpacing: 10, shadowBlur: 24, shadowColor: "rgba(0,0,0,0.85)" }).setDepth(100);
    const rule = this.add.graphics().setDepth(100);
    rule.lineStyle(2.5, PAL.gold, 0.9); rule.lineBetween(250, 380, 530, 380); rule.lineBetween(590, 380, 870, 380);
    rule.fillStyle(PAL.gold, 1); rule.fillTriangle(546, 380, 560, 366, 574, 380); rule.fillTriangle(546, 380, 560, 394, 574, 380);
    const t2 = UI.text(this, 560, 440, "The Flying Carpet", { size: 54, color: "#f1e3c2", style: "italic" }).setDepth(100);
    const t3 = UI.text(this, 560, 500, "a story from an Uzbek folk tale", { size: 30, color: "#a89cc8", style: "italic" }).setDepth(100);
    [t1, rule, t2, t3].forEach((o, i) => { o.setAlpha(0); this.tweens.add({ targets: o, alpha: 1, duration: 900, delay: 300 + i * 220 }); });

    let y = 650;
    const btns = [];
    if (Save.hasProgress()) {
      btns.push(UI.button(this, 560, y, "Continue", () => this.go(() => GameFlow.resume(this)), { primary: true, w: 480 }));
      UI.text(this, 560, y + 62, GameFlow.chapterName(Save.data.index), { size: 26, color: "#a89cc8", style: "italic" }).setDepth(100);
      y += 150;
      btns.push(UI.button(this, 560, y, "New Game", () => this.go(() => GameFlow.newGame(this)), { w: 480 }));
    } else {
      btns.push(UI.button(this, 560, y, "Begin the Journey", () => this.go(() => GameFlow.newGame(this)), { primary: true, w: 540 }));
    }
    btns.forEach((b, i) => { b.setAlpha(0); this.tweens.add({ targets: b, alpha: 1, duration: 700, delay: 1100 + i * 150 }); });
    this.input.keyboard.once("keydown-ENTER", () => btns[0].emit("pointerdown"));

    this.soundBtn = UI.iconButton(this, W - 62, 60, UI.soundIcon(), () => { UI.toggleSound(this); this.soundBtn.setIcon(UI.soundIcon()); });
    UI.iconButton(this, W - 150, 60, "full", () => { try { this.scale.toggleFullscreen(); } catch (e) { /* ignore */ } });
    // language: English · Русский · Oʻzbekcha (remembered with the save)
    LANGS.forEach((l, i) => {
      UI.button(this, 150 + i * 250, 62, l.name, () => {
        if (I18N.lang === l.id || this.leaving) return;
        I18N.set(l.id); Save.data.lang = l.id; Save.write();
        this.scene.restart();
      }, { w: 230, h: 62, size: 26, primary: I18N.lang === l.id, depth: 200, raw: true });
    });
    UI.text(this, W / 2, H - 46, this.touchMode ? "Best played in landscape · headphones recommended" : "Move: WASD / arrows · Talk: E · Fly: hold Space · Pause: Esc · Sound: M",
      { size: 26, color: "#8a80aa" }).setDepth(100);
  }

  go(fn) {
    if (this.leaving) return;
    Snd.unlock();
    Snd.play("magic");
    this.leave(fn, 600);
  }
}

class EndingScene extends BaseScene {
  constructor() { super("EndingScene"); }

  create() {
    this.begin({ music: "wedding", amb: "fire" });
    addBackdrop(this, "end_bg", (ctx) => {
      paintSky(ctx, W, 700, [[0, 0x0a0a24], [0.6, 0x2a1e52], [1, 0x5a2e5a]]);
      paintStars(ctx, W, 520, 200, "endstars", 0.9);
      paintMoon(ctx, 300, 180, 64);
      paintPortal(ctx, 960, 640, 520, 400, { color: 0xc89a6a });
      paintDome(ctx, 960, 236, 120, { color: 0x2fa0b0, drum: 0xc89a6a });
      paintMinaret(ctx, 560, 650, 56, 480, {}); paintMinaret(ctx, 1360, 650, 56, 480, {});
      paintHouse(ctx, 200, 650, 340, 240, { color: 0xb8886a, door: null, windows: [[-0.25, 0.6], [0.25, 0.6]] });
      paintHouse(ctx, 1720, 650, 340, 240, { color: 0xb8886a, door: null, windows: [[-0.25, 0.6], [0.25, 0.6]] });
      paintEarth(ctx, 0, 640, W, H - 640, 0x7a5a50, "endground", { pebbles: 40 });
      paintCobbles(ctx, 0, 650, W, H - 650, 0x9a7a6e, "endcob", 0.4);
      ctx.save(); ctx.translate(960, 770); ctx.scale(1, 0.42); paintRugTop(ctx, -420, -260, 840, 520, {}); ctx.restore();
      // strings of lanterns
      [[0, 300, 960, 420], [960, 420, 1920, 300]].forEach(s => {
        strokeC(ctx, 0x2a1a10, 2); ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.quadraticCurveTo((s[0] + s[2]) / 2, Math.max(s[1], s[3]) + 90, s[2], s[3]); ctx.stroke();
      });
      grain(ctx, 0, 0, W, H, 0.035);
    });
    // lantern glows along the strings
    for (let i = 1; i < 16; i++) {
      const t = i / 16, half = t < 0.5, u = half ? t * 2 : (t - 0.5) * 2;
      const x0 = half ? 0 : 960, y0 = half ? 300 : 420, x1 = half ? 960 : 1920, y1 = half ? 420 : 300;
      const cx = (x0 + x1) / 2, cy = Math.max(y0, y1) + 90;
      const x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;
      const c = [0xffb050, 0xff6a6a, 0x7ad0ff, 0xffe080][i % 4];
      const g = addGlow(this, x, y + 14, 120, c, 0.7).setDepth(30);
      this.add.circle(x, y + 14, 9, c).setDepth(31);
      this.tweens.add({ targets: g, alpha: 0.45, duration: 300 + i * 37, yoyo: true, repeat: -1 });
    }

    const bride = makePerson(this, 900, 760, { body: "dress", robe: 0xb5456f, trim: 0xd9a441, female: true, head: "scarf", headColor: 0xf2e6c8, pattern: "ikat", robe2: 0xd9a441, mood: "kind", vest: 0x6a1a3a });
    const groom = makePerson(this, 1030, 760, Object.assign({}, HERO, { mood: "kind", facing: -1, robe: 0x1c4e80, trim: 0xd9a441, head: "turban", headColor: 0xf6efe0 }));
    [bride, groom].forEach(p => p.setPerspective(1.15).setDepth(760));
    const guests = [
      [380, 690, { robe: 0x8a3a2a, head: "doppi", beard: "full" }], [560, 740, { body: "dress", robe: 0x2f6f6f, female: true, head: "scarf", headColor: 0xd9a441 }],
      [1380, 740, { robe: 0x5a3a6a, head: "turban", headColor: 0xe8dcc4, beard: "goatee" }], [1560, 690, { body: "dress", robe: 0xd9a441, female: true, head: "scarf", headColor: 0x8e2f2f }],
      [250, 780, { robe: 0x6a8a4a, child: true }], [1690, 780, { robe: 0xb5553a, child: true }],
      [720, 670, KING], [1220, 670, STORY.cast["Minister"]]
    ];
    guests.forEach((g, i) => {
      const p = makePerson(this, g[0], g[1], Object.assign({ facing: g[0] < 960 ? 1 : -1, mood: "kind" }, g[2]));
      p.setPerspective(lerp(0.9, 1.15, (g[1] - 700) / 260)).setDepth(g[1]);
      if (i < 6) this.time.addEvent({ delay: 420 + i * 60, loop: true, callback: () => p.hop(10 + (i % 3) * 4) });
    });
    ambientParticles(this, "petals", { area: { x: 0, y: -100, w: W, h: 200 }, freq: 140 });
    addVignette(this, 0.6);

    this.dbox = new DialogueBox(this);
    this.time.delayedCall(900, () => this.dbox.show(STORY.ending, () => this.theEnd()));
  }

  theEnd() {
    Save.data.finished = true; Save.data.index = -1; Save.write();
    Snd.play("success");
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x05040c, 0).setDepth(9000);
    this.tweens.add({ targets: dim, fillAlpha: 0.7, duration: 1200 });
    const t = UI.title(this, W / 2, 330, "THE END", { size: 130, color: "#f6d98c", letterSpacing: 12 }).setDepth(9100).setAlpha(0);
    const s = UI.text(this, W / 2, 450, "Adapted and expanded from the Uzbek folk tale “Uchar Gilam”", { size: 34, color: "#e8dcc0", style: "italic" }).setDepth(9100).setAlpha(0);
    this.tweens.add({ targets: [t, s], alpha: 1, duration: 1400, delay: 600 });
    this.time.delayedCall(1800, () => {
      UI.button(this, W / 2, 640, "Play Again", () => this.leave(() => GameFlow.newGame(this)), { primary: true, depth: 9200 });
      UI.button(this, W / 2, 760, "Title Screen", () => this.leave(() => this.scene.start("TitleScene")), { depth: 9200 });
    });
  }
}
