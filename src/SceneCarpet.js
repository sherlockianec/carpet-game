// ============================================================
// SceneCarpet.js — the flights between places.
//
// Hold Space / W / Up / the mouse / a finger to rise, let go to
// sink. Thread the gap between the towers below and the cloud
// banks above. Golden sparks are optional: every 12 caught gives
// back a lost heart. Later flights add birds, arrows (a "!" warns
// where they will come from), wind gusts and lightning (the sky
// flashes where it will strike).
//
// Three hits and the carpet tumbles - you restart from the start,
// or from the halfway lantern once you have passed it. After two
// tumbles the pause menu offers to skip the flight.
//
// data.quick: a short scenic flight used for the journey home.
// ============================================================

const GROUND_Y = 960, CARPET_X = 430;

// ---------- the carpet + rider rig (also used on the title screen) ----------

function makeFlyingCarpet(scene, x, y, scale) {
  const SW = 320, SH = 80, N = 16;
  Tex.make(scene, "carpet-strip", SW, SH, ctx => paintCarpetStrip(ctx, SW, SH), true);
  const tex = scene.textures.get("carpet-strip");
  if (!tex.has("s0")) for (let i = 0; i < N; i++) tex.add("s" + i, 0, i * SW / N, 0, SW / N, SH);
  Tex.make(scene, "rider", 170, 180, (ctx) => { ctx.translate(85, 150); paintRider(ctx, HERO); }, true);
  const c = scene.add.container(x, y);
  const slices = [];
  for (let i = 0; i < N; i++) {
    const s = scene.add.image(-SW / 2 + (i + 0.5) * SW / N, 0, "carpet-strip", "s" + i);
    s.setDisplaySize(SW / N + 0.8, SH);
    slices.push(s);
  }
  const rider = scene.add.image(-6, -12, "rider").setOrigin(0.5, 150 / 180);
  c.add(slices.concat([rider]));
  c.setScale(scale || 1);
  c.rider = rider; c.slices = slices; c.wave = 1; c.t = 0;
  scene.onUpdate((time, d) => {
    if (!c.active) return;
    c.t += d / 1000;
    for (let i = 0; i < N; i++) {
      const k = i / (N - 1);
      slices[i].y = Math.sin(c.t * 7 - k * 5) * 5 * c.wave * (0.25 + k * 0.9);
    }
    rider.y = -12 + slices[N >> 1].y * 0.8;
  });
  return c;
}

// ---------- obstacle painters ----------

function paintFlightTower(ctx, kind, w, h, th) {
  const cx = w / 2, by = h;
  if (kind === "minaret") paintMinaret(ctx, cx, by, 74, h - 140, { color: 0xc8925a, dome: PAL.turquoise });
  else if (kind === "dome") {
    const bw = 170, top = 240;
    ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, 0x8a5a7a], [0.5, 0x6a3a5a], [1, 0x3a2040]]); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = patS(ctx, tileStars(PAL.lapis, PAL.cream, PAL.turquoise, 40), 0.8);
    for (let y = top + 80; y < h; y += 260) ctx.fillRect(cx - bw / 2, y, bw, 34);
    fillC(ctx, 0xffc870, 0.9); for (let y = top + 160; y < h; y += 260) { pArch(ctx, cx - 40, y + 70, 30, 60, 0.5); ctx.fill(); pArch(ctx, cx + 40, y + 70, 30, 60, 0.5); ctx.fill(); }
    strokeC(ctx, 0x1a1020, 2.4); ctx.strokeRect(cx - bw / 2, top, bw, h - top);
    paintDome(ctx, cx, top, 92, { color: 0x2f9aa8, drum: 0x8a5a7a });
  } else if (kind === "spire") {
    const r = rng("spire");
    let y = by, wd = 120;
    while (y > 170) {
      const bh = r.range(70, 120), nw = wd * r.range(0.9, 0.99);
      ctx.beginPath(); ctx.moveTo(cx - wd / 2, y); ctx.lineTo(cx - nw / 2 + r.range(-6, 6), y - bh); ctx.lineTo(cx + nw / 2 + r.range(-6, 6), y - bh); ctx.lineTo(cx + wd / 2, y); ctx.closePath();
      ctx.fillStyle = gradH(ctx, cx - wd / 2, cx + wd / 2, [[0, 0xb0b8c0], [0.5, 0x8a929c], [1, 0x50586a]]); ctx.fill(); strokeC(ctx, 0x2a303c, 2.2); ctx.stroke();
      y -= bh; wd = nw;
    }
    // wind-catcher tower on top with a pennant
    ctx.fillStyle = gradH(ctx, cx - 50, cx + 50, [[0, 0xd8c8a8], [1, 0x8a7a5a]]); ctx.fillRect(cx - 50, y - 90, 100, 90); strokeC(ctx, 0x3a3020, 2.2); ctx.strokeRect(cx - 50, y - 90, 100, 90);
    fillC(ctx, 0x2a2018); [-25, 0, 25].forEach(dx => { pRR(ctx, cx + dx - 8, y - 78, 16, 50, 6); ctx.fill(); });
    strokeC(ctx, 0x2a1a10, 4); ctx.beginPath(); ctx.moveTo(cx, y - 90); ctx.lineTo(cx, y - 160); ctx.stroke();
    fillC(ctx, 0xb2283a); ctx.beginPath(); ctx.moveTo(cx, y - 160); ctx.quadraticCurveTo(cx + 40, y - 150, cx + 70, y - 146); ctx.lineTo(cx, y - 128); ctx.closePath(); ctx.fill();
  } else if (kind === "rock") {
    const r = rng("rock" + th);
    const pts = [];
    for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([cx - 70 - t * 20 + r.range(-14, 14), 200 + (by - 200) * (1 - t)]); }
    pts.push([cx - 50, 180], [cx - 10, 150], [cx + 34, 168], [cx + 64, 200]);
    for (let i = 10; i >= 0; i--) { const t = i / 10; pts.push([cx + 70 + t * 20 + r.range(-14, 14), 200 + (by - 200) * (1 - t)]); }
    pSmooth(ctx, pts, true);
    ctx.fillStyle = gradH(ctx, cx - 90, cx + 90, [[0, 0xd88a5a], [0.45, 0xb0603a], [1, 0x6a3020]]); ctx.fill();
    ctx.save(); pSmooth(ctx, pts, true); ctx.clip();
    for (let y = 230; y < by; y += 48) { fillC(ctx, r.chance(0.5) ? 0x000000 : 0xffffff, 0.08); ctx.fillRect(0, y, w, 18); }
    ctx.restore();
    pSmooth(ctx, pts, true); strokeC(ctx, 0x3a1a10, 2.6); ctx.stroke();
  } else {                                                   // storm watchtower
    const bw = 150, top = 210;
    ctx.fillStyle = patS(ctx, tileBrick(0x4a4658, 0x2a2836, 30, 14, "stw"), 1); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    ctx.fillStyle = gradH(ctx, cx - bw / 2, cx + bw / 2, [[0, 0xffffff, 0.12], [1, 0x000000, 0.5]]); ctx.fillRect(cx - bw / 2, top, bw, h - top);
    fillC(ctx, 0x3a3648); for (let x = cx - bw / 2 - 10; x < cx + bw / 2; x += 34) ctx.fillRect(x, top - 34, 22, 36);
    ctx.fillRect(cx - bw / 2 - 12, top - 4, bw + 24, 18);
    strokeC(ctx, 0x0e0c14, 2.4); ctx.strokeRect(cx - bw / 2, top, bw, h - top);
    glowDot(ctx, cx, top + 120, 70, 0xffa040, 0.5);
    fillC(ctx, 0xffc060); pArch(ctx, cx, top + 150, 34, 70, 0.5); ctx.fill();
  }
}
function paintCloudBank(ctx, w, h, c, lit, seed) {
  const r = rng(seed);
  ctx.fillStyle = gradV(ctx, 0, h, [[0, darken(c, 0.25)], [1, c]]);
  ctx.beginPath(); ctx.rect(w * 0.22, 0, w * 0.56, h - 90); ctx.fill();
  for (let y = -20; y < h - 120; y += 56) {                // billowy sides
    [-1, 1].forEach(s => {
      const rad = r.range(46, 70);
      ctx.beginPath(); ctx.arc(w / 2 + s * (w * 0.28 + r.range(-12, 12)), y, rad, 0, 6.2832); ctx.fill();
    });
  }
  for (let i = 0; i < 9; i++) {
    const x = w * 0.12 + (w * 0.76) * i / 8 + r.range(-8, 8), y = h - 90 - r.range(0, 40), rad = r.range(52, 86) * (1 - Math.abs(i - 4) / 8);
    ctx.beginPath(); ctx.arc(x, y, rad + 20, 0, 6.2832); ctx.fillStyle = gradV(ctx, y - rad, y + rad, [[0, c], [1, darken(c, 0.08)]]); ctx.fill();
    ctx.beginPath(); ctx.arc(x - rad * 0.2, y + rad * 0.15, rad * 0.75, 0, 6.2832); ctx.fillStyle = gradV(ctx, y - rad, y + rad, [[0, c, 0], [1, lit, 0.9]]); ctx.fill();
  }
  for (let i = 0; i < 6; i++) { const y = r.range(40, h - 200); softEllipse(ctx, w / 2 + r.range(-60, 60), y, r.range(80, 140), 40, lit, 0.15); }
}
function opaqueTop(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y++) for (let x = Math.floor(w * 0.3); x < w * 0.7; x += 2) if (data[(y * w + x) * 4 + 3] > 100) return y;
  return 0;
}

class CarpetScene extends BaseScene {
  constructor() { super("CarpetScene"); }

  init(data) {
    this.themeKey = data.theme || "desert";
    this.toLabel = data.toLabel || "";
    this.quick = !!data.quick;
    this.fromCheckpoint = !!data.ck;
    this.fails = data.fails || 0;
  }

  create() {
    const th = this.th = STORY.flights[this.themeKey] || STORY.flights.desert;
    if (this.quick) { this.createQuick(); return; }
    this.begin({ music: th.music, amb: th.storm ? "storm" : "wind" });
    this.buildWorld(th, this.themeKey);

    this.carpet = makeFlyingCarpet(this, CARPET_X, 470, 0.9).setDepth(500);
    this.trail = this.add.particles(0, 0, "fx-spark", {
      follow: this.carpet, followOffset: { x: -150, y: 10 }, speedX: { min: -260, max: -140 }, speedY: { min: -30, max: 30 },
      scale: { start: 0.28, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 600, frequency: 45, tint: [0xffe9a8, 0xd9a441], blendMode: "ADD"
    }).setDepth(499);
    this.vy = 0; this.lives = 3; this.invuln = 0; this.dist = 0; this.started = false; this.done = false;
    this.sparks = 0; this.sparkCombo = 0; this.comboT = 0; this.gust = 0;

    this.course = this.buildCourse(th);
    this.objs = []; this.hazards = []; this.items = [];
    this.nextIdx = 0;
    if (this.fromCheckpoint) {
      this.dist = this.course.checkpoint - 500;
      while (this.nextIdx < this.course.list.length && this.course.list[this.nextIdx].d < this.dist + 200) this.nextIdx++;
      this.ckPassed = true;
    }

    // HUD
    this.hearts = UI.hearts(this, 60, 62, 3);
    const barW = 760;
    this.barBg = this.add.graphics().setDepth(8900).setScrollFactor(0);
    this.barBg.fillStyle(0x0e0b22, 0.6).fillRoundedRect(W / 2 - barW / 2 - 8, 46, barW + 16, 30, 15);
    this.barBg.lineStyle(2, PAL.gold, 0.8).strokeRoundedRect(W / 2 - barW / 2 - 8, 46, barW + 16, 30, 15);
    this.barFill = this.add.rectangle(W / 2 - barW / 2, 61, 4, 14, 0xf4d58a).setOrigin(0, 0.5).setDepth(8901);
    this.barW = barW;
    const ckX = W / 2 - barW / 2 + barW * this.course.checkpoint / this.course.end;
    this.add.image(ckX, 61, "fx-spark").setTint(0xffc060).setScale(0.5).setDepth(8902);
    this.barIcon = this.add.image(W / 2 - barW / 2, 61, "fx-glow").setTint(0xffe9a8).setDisplaySize(44, 44).setBlendMode(Phaser.BlendModes.ADD).setDepth(8902);
    UI.text(this, W / 2, 104, "to " + this.toLabel, { size: 26, color: "#f1e3c2", style: "italic" }).setDepth(8900);
    this.sparkTxt = UI.text(this, 312, 62, "✦ 0", { size: 34, color: "#f4d58a", font: FONT_T }).setDepth(8900);

    UI.banner(this, th.title, this.fromCheckpoint ? "from the halfway lantern" : "to " + this.toLabel, { y: 300, hold: 1800 });
    this.startHint = UI.pill(this, W / 2, 720, this.touchMode ? "Touch and hold to rise · let go to sink" : "Hold SPACE (or the mouse) to rise · let go to sink", { size: 34, h: 76, padX: 80, gold: true, color: "#f8e3a6" });
    this.tweens.add({ targets: this.startHint, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });

    this.holding = false;
    this.input.on("pointerdown", (p, over) => { if (over && over.some(o => o.isHud)) return; this.holding = true; });
    this.input.on("pointerup", () => { this.holding = false; });
    this.input.on("gameout", () => { this.holding = false; });
    addVignette(this, th.storm ? 0.9 : 0.45);
  }

  skipLabel() { return this.fails >= 2 && !this.quick ? "Skip this flight" : null; }
  skipChallenge() { this.done = true; this.advance(); }

  // ---------- world ----------
  buildWorld(th, key) {
    const night = th.time !== "day";
    addBackdrop(this, "fl_sky_" + key, (ctx) => {
      paintSky(ctx, W, H, [[0, th.sky[0]], [0.6, th.sky[1]], [1, th.sky[2]]]);
      if (night) paintStars(ctx, W, 500, th.storm ? 40 : 160, "fs" + key, th.storm ? 0.3 : 0.9);
      if (th.time === "day") paintSun(ctx, 1500, 200, 56, 0xfff0c0);
      else if (th.time === "dusk") paintSun(ctx, 1450, 620, 90, 0xffa060);
      else paintMoon(ctx, 1500, 180, 54, { tint: 0x9a9ab0 });
    }, -20);
    const mk = (name, h, fn) => Tex.make(this, name, W, h, fn);
    mk("fl_far_" + key, 520, ctx => paintRidge(ctx, W, 520, { seed: "ff" + key, amp: 260, color: th.ridge, color2: mixC(th.ridge, th.sky[2], 0.3), n: 8 }));
    mk("fl_mid_" + key, 420, ctx => paintSkyline(ctx, W, 420, { seed: "fm" + key, color: th.city, color2: darken(th.city, 0.2), minH: 60, maxH: 260, lights: night ? 1 : 0, finial: night ? 0x8a6a3a : 0xd9a441 }));
    mk("fl_gnd_" + key, 200, (ctx) => {
      paintRidge(ctx, W, 200, { seed: "fg" + key, amp: 50, color: th.ground, color2: darken(th.ground, 0.35), n: 6 });
      ctx.save(); ctx.globalCompositeOperation = "source-atop";
      const r = rng("fgd" + key);
      for (let i = 0; i < 160; i++) { fillC(ctx, r.chance(0.5) ? 0x000000 : 0xffffff, r.range(0.04, 0.12)); ctx.beginPath(); ctx.ellipse(r() * W, r.range(150, 200), r.range(4, 22), r.range(2, 5), 0, 0, 6.2832); ctx.fill(); }
      ctx.restore();
    });
    this.far = this.add.tileSprite(0, 520, W, 520, "fl_far_" + key).setOrigin(0).setDepth(-15);
    this.mid = this.add.tileSprite(0, 600, W, 420, "fl_mid_" + key).setOrigin(0).setDepth(-12);
    this.gnd = this.add.tileSprite(0, H - 200, W, 200, "fl_gnd_" + key).setOrigin(0).setDepth(900);
    if (th.time === "day" || th.time === "dusk") {
      this.clouds = [];
      for (let i = 0; i < 5; i++) {
        const k = Tex.make(this, "fl_cloud" + i + key, 520, 200, ctx => paintCloud(ctx, 260, 170, 440, 130, th.time === "dusk" ? 0xc06a7a : 0xffffff, "fcl" + i, { lit: th.time === "dusk" ? 0xffc090 : 0xffffff }));
        this.clouds.push(this.add.image(Math.random() * W, 120 + Math.random() * 300, k).setAlpha(0.8).setDepth(-14).setScale(0.6 + Math.random() * 0.6));
      }
    }
    // tower + cloud bank textures
    const tw = 220, thh = 1000;
    this.towerKey = "fl_tower_" + key;
    Tex.make(this, this.towerKey, tw, thh, (ctx) => { paintFlightTower(ctx, th.tower, tw, thh, key); this.towerTop = opaqueTop(ctx, tw, thh); });
    if (this.towerTop === undefined) this.towerTop = 120;
    const cc = th.storm ? 0x3a3a4e : (th.time === "dusk" ? 0x8a5a7a : (th.tower === "rock" ? 0xb89068 : 0x9aa8bc));
    const cl = th.storm ? 0x6a6a88 : (th.time === "dusk" ? 0xffb090 : 0xffffff);
    this.cloudKey = "fl_bank_" + key;
    Tex.make(this, this.cloudKey, 420, 900, ctx => paintCloudBank(ctx, 420, 900, cc, cl, "bank" + key));
    // hazards
    Tex.make(this, "fl_bird0", 90, 60, ctx => this.paintBird(ctx, 0), true);
    Tex.make(this, "fl_bird1", 90, 60, ctx => this.paintBird(ctx, 1), true);
    Tex.make(this, "fl_arrow", 140, 30, (ctx) => {
      strokeC(ctx, 0x6a4a28, 5); ctx.beginPath(); ctx.moveTo(30, 15); ctx.lineTo(132, 15); ctx.stroke();
      fillC(ctx, 0xd0d6dc); ctx.beginPath(); ctx.moveTo(4, 15); ctx.lineTo(34, 5); ctx.lineTo(34, 25); ctx.closePath(); ctx.fill(); strokeC(ctx, 0x2a2a30, 1.6); ctx.stroke();
      fillC(ctx, 0xb2283a); [[110, 4], [110, 26]].forEach(p => { ctx.beginPath(); ctx.moveTo(p[0], 15); ctx.lineTo(p[0] + 26, p[1]); ctx.lineTo(p[0] + 18, 15); ctx.closePath(); ctx.fill(); });
    }, true);
  }

  paintBird(ctx, f) {
    fillC(ctx, 0x1e1a22);
    ctx.beginPath(); ctx.ellipse(45, 32, 20, 9, 0, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(24, 28, 8, 0, 6.2832); ctx.fill();
    fillC(ctx, 0xe0a030); ctx.beginPath(); ctx.moveTo(16, 27); ctx.lineTo(6, 30); ctx.lineTo(16, 31); ctx.closePath(); ctx.fill();
    fillC(ctx, 0x1e1a22);
    ctx.beginPath(); ctx.moveTo(62, 30); ctx.lineTo(86, 22); ctx.lineTo(84, 38); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(36, 30); ctx.quadraticCurveTo(48, f ? 4 : 56, 66, f ? 2 : 58); ctx.lineTo(56, 32); ctx.closePath(); ctx.fill();
  }

  // ---------- the fixed, seeded course ----------
  buildCourse(th) {
    const r = rng("course-" + this.themeKey), list = [];
    const end = th.length * th.speed;
    let d = 900, lastC = 520, i = 0;
    while (d < end - 600) {
      const t = d / end;
      const gap = lerp(th.gap[0], th.gap[1], t);
      let c = r.range(170 + gap / 2, GROUND_Y - 90 - gap / 2);
      c = clamp(c, lastC - 300, lastC + 300);
      list.push({ d, type: "gate", c, gap, i });
      // sparks along the line between this gate and the next
      for (let k = 1; k <= 3; k++) list.push({ d: d + k * 120, type: "spark", y: lerp(c, c, 0) + Math.sin(k) * 10 });
      if (th.hazard && i >= 2 && r.chance(lerp(0.2, 0.5, t))) {
        const off = r.range(0.35, 0.65);
        list.push({ d: d + off * lerp(th.spacing[0], th.spacing[1], t), type: th.hazard, y: r.range(180, GROUND_Y - 160) });
      }
      if (th.wind && i >= 3 && i % 5 === 0) list.push({ d: d + 200, type: "gust", dir: r.sign() });
      if (th.storm && i >= 3 && i % 4 === 1) list.push({ d: d + 220, type: "bolt", half: r.chance(0.5) ? "top" : "bottom" });
      lastC = c; i++;
      d += lerp(th.spacing[0], th.spacing[1], t) * r.range(0.92, 1.1);
    }
    list.sort((a, b) => a.d - b.d);
    const gates = list.filter(e => e.type === "gate");
    const mid = gates[Math.floor(gates.length / 2)];
    return { list, end: d + 700, checkpoint: mid.d - 260 };
  }

  spawn(e) {
    const x = CARPET_X + (e.d - this.dist);   // just off the right edge
    if (e.type === "gate") {
      const top = e.c - e.gap / 2, bot = e.c + e.gap / 2;
      const tower = this.add.image(x, bot - this.towerTop + 6, this.towerKey).setOrigin(0.5, 0).setDepth(400);
      const bank = this.add.image(x, top + 26, this.cloudKey).setOrigin(0.5, 1).setDepth(410);
      if (this.th.storm) { bank.setTint(0xb0b0c8); }
      this.objs.push({ x, top, bot, tower, bank, passed: false });
    } else if (e.type === "spark") {
      const g = this.objs[this.objs.length - 1];
      const y = g ? (g.top + g.bot) / 2 : 500;
      const s = this.add.image(x, y, "fx-spark").setTint(0xffb020).setScale(0.75).setDepth(420);
      const gl = addGlow(this, x, y, 120, 0xffc060, 0.5).setDepth(419);
      this.tweens.add({ targets: s, angle: 90, duration: 1400, repeat: -1 });
      this.items.push({ x, y, s, gl });
    } else if (e.type === "bird") {
      [0, 1, 2].forEach(k => {
        const b = this.add.sprite(x + k * 70, e.y + (k === 1 ? -50 : k * 30), "fl_bird0").setDepth(430).setScale(1.1);
        this.hazards.push({ kind: "bird", x: b.x, y: b.y, by: b.y, ph: Math.random() * 6, o: b, r: 30 });
      });
    } else if (e.type === "arrow") {
      const warn = this.add.image(W - 70, e.y, "prompt-mark").setDepth(8800).setScale(0.8).setTint(0xff8a6a);
      this.tweens.add({ targets: warn, alpha: 0.3, duration: 120, yoyo: true, repeat: 4 });
      Snd.play("alarm");
      this.time.delayedCall(950, () => {
        warn.destroy();
        if (this.done) return;
        const a = this.add.image(W + 80, e.y, "fl_arrow").setDepth(430);
        Snd.play("arrow");
        this.hazards.push({ kind: "arrow", x: a.x, y: e.y, o: a, r: 22 });
      });
    } else if (e.type === "gust") {
      this.warnGust(e.dir);
    } else if (e.type === "bolt") {
      this.warnBolt(e.half);
    }
  }

  warnGust(dir) {
    const ys = dir < 0 ? [760, 600, 440] : [320, 480, 640];
    const arrows = ys.map((y, i) => UI.title(this, 1500 - i * 40, y, dir < 0 ? "▲" : "▼", { size: 70, color: "#ffffff" }).setAlpha(0).setDepth(8700));
    arrows.forEach((a, i) => this.tweens.add({ targets: a, alpha: 0.7, y: a.y + dir * 40, duration: 400, delay: i * 120, yoyo: true }));
    UI.toast(this, dir < 0 ? "An updraft!" : "A downdraft!", { y: 200, hold: 900 });
    this.time.delayedCall(900, () => {
      Snd.play("gust");
      this.gust = dir * 900; this.gustT = 1300;
      const streaks = this.add.particles(0, 0, "fx-streak", { x: W + 100, y: { min: 100, max: GROUND_Y }, speedX: { min: -2400, max: -1600 }, speedY: dir * 300,
        lifespan: 900, frequency: 30, alpha: { start: 0.5, end: 0 }, scaleX: { min: 1, max: 2 }, duration: 1200 }).setDepth(600);
      this.time.delayedCall(2400, () => streaks.destroy());
    });
  }

  warnBolt(half) {
    const y0 = half === "top" ? 0 : H / 2, zone = this.add.rectangle(W / 2, y0 + H / 4, W, H / 2, 0xffffff, 0).setDepth(700);
    this.tweens.add({ targets: zone, fillAlpha: 0.14, duration: 160, yoyo: true, repeat: 3 });
    UI.toast(this, half === "top" ? "Lightning above - dive!" : "Lightning below - climb!", { y: half === "top" ? 820 : 200, hold: 900 });
    this.time.delayedCall(1250, () => {
      zone.destroy();
      if (this.done) return;
      this.cameras.main.flash(180, 220, 220, 255);
      Snd.play("thunder");
      const g = this.add.graphics().setDepth(710);
      const draw = (x) => {
        g.lineStyle(10, 0xd8e0ff, 0.5); g.beginPath(); let px = x, py = y0; g.moveTo(px, py);
        while (py < y0 + H / 2) { px += Phaser.Math.Between(-40, 40); py += 50; g.lineTo(px, py); }
        g.strokePath(); g.lineStyle(3, 0xffffff, 1); g.strokePath();
      };
      draw(CARPET_X - 40); draw(CARPET_X + 90);
      this.tweens.add({ targets: g, alpha: 0, duration: 400, onComplete: () => g.destroy() });
      const cy = this.carpet.y;
      if ((half === "top" && cy < H / 2) || (half === "bottom" && cy >= H / 2)) this.hit();
    });
  }

  // ---------- play ----------
  tick(time, d) {
    if (this.quick || !this.carpet) return;
    const dt = d / 1000, th = this.th, k = this.keys;
    const thrust = this.holding || k.space.isDown || k.up.isDown || k.w.isDown;
    if (!this.started) {
      this.carpet.y = 470 + Math.sin(time / 400) * 12;
      if (thrust) {
        this.started = true; Snd.play("whoosh");
        this.tweens.add({ targets: this.startHint, alpha: 0, duration: 300, onComplete: () => this.startHint.destroy() });
      }
      this.scrollBg(dt * 0.25);
      return;
    }
    if (this.done) { this.scrollBg(dt); return; }

    // carpet: ease toward a target climb/sink speed - responsive but smooth
    const want = thrust ? -470 : 430;
    this.vy += clamp(want - this.vy, -2600 * dt, 2600 * dt);
    if (this.gustT > 0) { this.gustT -= d; this.vy += this.gust * dt; }
    this.carpet.y += this.vy * dt;
    if (this.carpet.y < 70) { this.carpet.y = 70; this.vy = Math.max(0, this.vy); }
    if (this.carpet.y > GROUND_Y - 40) { this.carpet.y = GROUND_Y - 40; this.vy = Math.min(0, this.vy); if (this.invuln <= 0) this.hit(true); }
    this.carpet.rotation = clamp(this.vy / 1800, -0.22, 0.24);
    this.carpet.wave = 1 + Math.abs(this.vy) / 500;

    const v = th.speed * dt;
    this.dist += th.speed * dt;
    this.scrollBg(dt);
    while (this.nextIdx < this.course.list.length && this.course.list[this.nextIdx].d <= this.dist + (W - CARPET_X + 260)) {
      this.spawn(this.course.list[this.nextIdx++]);
    }

    const cx = CARPET_X, cy = this.carpet.y, hw = 112, hh = 24;
    // gates
    for (let i = this.objs.length - 1; i >= 0; i--) {
      const o = this.objs[i];
      o.x -= v; o.tower.x = o.x; o.bank.x = o.x;
      if (this.invuln <= 0 && Math.abs(o.x - cx) < hw * 0.6 + 40) {
        if (cy - 62 < o.top - 10 || cy + hh > o.bot + 4) this.hit();
      }
      if (!o.passed && o.x < cx - 60) { o.passed = true; }
      if (o.x < -300) { o.tower.destroy(); o.bank.destroy(); this.objs.splice(i, 1); }
    }
    // sparks
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.x -= v; it.s.x = it.x; it.gl.x = it.x;
      if (Math.abs(it.x - cx) < 90 && Math.abs(it.y - cy) < 80) { this.collect(it); this.items.splice(i, 1); continue; }
      if (it.x < -100) { it.s.destroy(); it.gl.destroy(); this.items.splice(i, 1); }
    }
    if (this.comboT > 0) { this.comboT -= d; if (this.comboT <= 0) this.sparkCombo = 0; }
    // hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      if (h.kind === "bird") {
        h.x -= v * 1.35; h.ph += dt * 5; h.y = h.by + Math.sin(h.ph) * 40;
        h.o.setTexture(Math.floor(h.ph * 1.6) % 2 ? "fl_bird1" : "fl_bird0");
      } else h.x -= 1250 * dt;
      h.o.setPosition(h.x, h.y);
      if (this.invuln <= 0 && Math.abs(h.x - cx) < hw * 0.75 + h.r && Math.abs(h.y - (cy - 20)) < hh + h.r + 10) this.hit();
      if (h.x < -150) { h.o.destroy(); this.hazards.splice(i, 1); }
    }

    if (this.invuln > 0) { this.invuln -= d; this.carpet.alpha = Math.floor(time / 80) % 2 ? 0.35 : 1; }
    else this.carpet.alpha = 1;

    const pct = clamp(this.dist / this.course.end, 0, 1);
    this.barFill.width = Math.max(4, this.barW * pct);
    this.barIcon.x = W / 2 - this.barW / 2 + this.barW * pct;
    if (!this.ckPassed && this.dist > this.course.checkpoint + 300) {
      this.ckPassed = true;
      Snd.play("chime"); UI.toast(this, "Halfway lantern - you'll restart here", { y: 200 });
    }
    if (this.dist >= this.course.end) this.arrive();
  }

  scrollBg(dt) {
    const s = this.th.speed * dt;
    this.far.tilePositionX += s * 0.12; this.mid.tilePositionX += s * 0.35; this.gnd.tilePositionX += s;
    if (this.clouds) this.clouds.forEach(c => { c.x -= s * 0.06; if (c.x < -300) c.x = W + 300; });
  }

  collect(it) {
    this.sparks++; this.sparkCombo++; this.comboT = 900;
    Snd.play("spark", { n: Math.min(10, this.sparkCombo - 1) });
    this.sparkTxt.setText("✦ " + this.sparks);
    this.tweens.add({ targets: [it.s, it.gl], x: 312, y: 62, scale: 0.2, alpha: 0, duration: 380, ease: "Cubic.easeIn", onComplete: () => { it.s.destroy(); it.gl.destroy(); } });
    if (this.sparks % 12 === 0 && this.lives < 3) {
      this.lives++; this.hearts.set(this.lives); Snd.play("heart");
      UI.toast(this, "A heart restored!", { y: 200 });
    }
  }

  hit(ground) {
    if (this.invuln > 0 || this.done) return;
    this.lives--;
    this.hearts.set(this.lives);
    this.invuln = 1400;
    this.vy = ground ? -520 : this.vy * -0.4;
    this.cameras.main.shake(220, 0.008);
    Snd.play("hurt");
    if (this.lives <= 0) this.tumble();
  }

  tumble() {
    this.done = true;
    Snd.play("fail");
    this.tweens.add({ targets: this.carpet, y: GROUND_Y + 80, angle: 40, duration: 900, ease: "Quad.easeIn" });
    UI.toast(this, this.ckPassed ? "The carpet tumbles - back to the halfway lantern" : "The carpet tumbles - try again", { y: 400, hold: 1400 });
    this.time.delayedCall(1700, () => this.restartWith({ theme: this.themeKey, toLabel: this.toLabel, ck: this.ckPassed ? 1 : 0, fails: this.fails + 1 }));
  }

  arrive() {
    this.done = true;
    Snd.play("success");
    UI.banner(this, "Arrived", this.toLabel, { y: 380, hold: 1500 });
    this.tweens.add({ targets: this.carpet, x: W + 300, y: 380, duration: 1800, ease: "Sine.easeIn" });
    this.time.delayedCall(2200, () => this.advance());
  }

  // ---------- the short flight home ----------
  createQuick() {
    const keys = ["day2", "dusk", "wind", "desert", "dusk"];
    const th = STORY.flights[keys[hashSeed(this.toLabel) % keys.length]];
    this.th = th;
    this.begin({ music: "lament", amb: "wind" });
    this.buildWorld(th, "q");
    this.carpet = makeFlyingCarpet(this, -200, 520, 1.0).setDepth(500);
    this.add.particles(0, 0, "fx-spark", { follow: this.carpet, followOffset: { x: -160, y: 10 }, speedX: { min: -200, max: -100 }, scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 }, lifespan: 700, frequency: 40, tint: [0xffe9a8], blendMode: "ADD" }).setDepth(499);
    UI.banner(this, "Returning to " + this.toLabel, null, { y: 260, hold: 2400, size: 60 });
    this.tweens.add({ targets: this.carpet, x: W + 260, duration: 4200, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: this.carpet, y: 420, duration: 1400, yoyo: true, repeat: 1, ease: "Sine.easeInOut" });
    this.onUpdate((t, d) => this.scrollBg(d / 1000 * 0.6));
    const go = () => { if (!this.leaving) this.advance(); };
    this.time.delayedCall(4400, go);
    this.time.delayedCall(500, () => this.input.once("pointerdown", go));
    this.input.keyboard.once("keydown-SPACE", go);
    UI.hint(this, this.touchMode ? "tap to skip" : "click or Space to skip");
  }
}
