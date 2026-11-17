// ============================================================
// SceneDuel.js — the flashback. You are King Sanobar, twenty
// years ago, in a moonlit orchard.
//
//   Move   WASD / arrows (touch: drag on the left half)
//   Strike Space / J      - press again quickly for a 3-hit combo
//   Roll   Shift / K      - a quick dash you can't be hit during
//
// Attendants glow red and shout before they lunge: roll through
// or step aside, then punish. Two waves, then Qahraton, who lunges
// harder, chains slashes and calls for help when he is hurt.
// Falling restarts only the current wave.
// ============================================================

const ARENA = { x0: 150, y0: 600, x1: W - 150, y1: 1010 };

class DuelScene extends BaseScene {
  constructor() { super("DuelScene"); }
  init(data) { this.stage = data.stage || 0; this.fails = data.fails || 0; }
  skipLabel() { return this.fails >= 2 ? "Skip the fight" : null; }
  skipChallenge() { this.over = true; this.victory(); }

  create() {
    this.begin({ music: "duel", amb: "night" });
    addBackdrop(this, "duel_bg", (ctx) => {
      paintSky(ctx, W, 640, [[0, 0x060818], [0.7, 0x1a2244], [1, 0x2a3458]]);
      paintStars(ctx, W, 480, 220, "duelstars", 1);
      paintMoon(ctx, 960, 190, 90, { glow: 0xb0c8ff });
      paintRidge(ctx, W, 560, { seed: "duelridge", amp: 110, color: 0x141a30, color2: 0x1a2038 });
      paintCityWall(ctx, 0, W, 600, 90, { color: 0x3a3a5a, towerStep: 600, towerOff: 300 });
      paintEarth(ctx, 0, 590, W, H - 590, 0x2e3e2e, "duelground", { pebbles: 100 });
      const r = rng("duelgrass");
      for (let i = 0; i < 140; i++) paintGrass(ctx, r.range(0, W), r.range(610, H), r.range(0.8, 1.4), r.pick([0x2a4a2a, 0x3a5a34, 0x24402a]), "dg" + i);
      // fallen apricot blossom
      for (let i = 0; i < 260; i++) { fillC(ctx, 0xf0d8e8, r.range(0.25, 0.6)); pEll(ctx, r.range(0, W), r.range(620, H), 3, 2, r.range(0, 3)); ctx.fill(); }
      grain(ctx, 0, 0, W, H, 0.04);
    });
    const moonGlow = addGlow(this, 960, 190, 800, 0x9ab0ff, 0.25).setDepth(-5); void moonGlow;
    const T = 0x8a98c8;
    [[90, 760, 1.2], [W - 90, 740, 1.15], [90, 1040, 1.1], [W - 90, 1050, 1.2], [520, 600, 0.9], [1400, 600, 0.95]].forEach((p, i) => {
      addProp(this, p[0], p[1], 460, 560, c => paintTree(c, 0, 0, "apricot", p[2], "duelt" + i, { leaf: 0x3a5a3a, fruit: 0xf0d0e0 }), { tint: T, depthOff: p[1] > 1000 ? 60 : 0 });
    });
    ambientParticles(this, "petals", { area: { x: 0, y: 300, w: W, h: 300 }, freq: 300 });
    ambientParticles(this, "fireflies", { area: { x: 0, y: 600, w: W, h: 400 }, freq: 500 });
    this.gul = makePerson(this, 1500, 620, STORY.cast["Gul"]).setDepth(620).setPerspective(0.82).tint(0xb0b8e0).setFacing(-1);

    this.p = makePerson(this, 960, 860, Object.assign({}, SANOBAR, { holding: "sword", mood: "stern", scale: 1 })).tint(0xd0d4f0);
    this.p.hp = 6; this.p.inv = 0; this.p.dir = { x: 1, y: 0 };
    this.rollT = 0; this.rollCd = 0; this.atkCd = 0; this.combo = 0; this.comboT = 0;
    this.enemies = [];
    this.over = false; this.locked = true;
    this.hearts = UI.hearts(this, 60, 62, 6);
    this.stageTxt = UI.pill(this, W / 2, 60, "", { minW: 520, size: 30, h: 60, gold: true, color: "#f8e3a6", font: FONT_T });
    this.dbox = new DialogueBox(this);
    this.dbox.actors = { "King Sanobar": this.p };
    addVignette(this, 1);
    this.buildTouch();

    const begin = () => { this.locked = false; this.startStage(); };
    if (this.stage === 0 && !this.fails) {
      const card = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 1).setDepth(9600);
      const ct = UI.title(this, W / 2, H / 2, "Twenty Years Ago", { size: 90, color: "#f1e3c2" }).setDepth(9601);
      this.time.delayedCall(1700, () => this.tweens.add({ targets: [card, ct], alpha: 0, duration: 700, onComplete: () => {
        card.destroy(); ct.destroy();
        this.dbox.show(STORY.duel.intro, () => {
          UI.hint(this, this.touchMode ? "Drag left side to move · STRIKE and ROLL buttons" : "WASD move · Space strike (tap again to combo) · Shift roll");
          this.time.delayedCall(7000, () => { if (this._hint) this.tweens.add({ targets: this._hint, alpha: 0, duration: 600 }); });
          begin();
        });
      } }));
    } else this.time.delayedCall(700, begin);
  }

  // ---------- touch controls ----------
  buildTouch() {
    this.stick = { active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 };
    this.touchAtk = false; this.touchRoll = false;
    const mkBtn = (x, y, label, cb) => {
      const k = Tex.make(this, "tbtn_" + label, 200, 200, (ctx) => {
        ctx.beginPath(); ctx.arc(100, 100, 88, 0, 6.2832); fillC(ctx, 0x120e2a, 0.55); ctx.fill(); strokeC(ctx, PAL.gold, 4, 0.8); ctx.stroke();
      });
      const b = this.add.image(x, y, k).setDepth(8800).setScrollFactor(0).setInteractive();
      b.isHud = true;
      const t = UI.title(this, x, y, label, { size: 34, color: "#f4d58a" }).setDepth(8801);
      b.on("pointerdown", () => { cb(); b.setScale(0.9); }); b.on("pointerup", () => b.setScale(1)); b.on("pointerout", () => b.setScale(1));
      return [b, t];
    };
    this.touchUI = [].concat(mkBtn(W - 170, H - 190, "STRIKE", () => { this.touchAtk = true; }), mkBtn(W - 390, H - 120, "ROLL", () => { this.touchRoll = true; }));
    this.stickG = this.add.graphics().setDepth(8800);
    this.touchUI.forEach(o => o.setVisible(this.touchMode));
    this.input.on("pointerdown", (ptr, over) => {
      if (ptr.wasTouch) this.touchUI.forEach(o => o.setVisible(true));
      if (over && over.length) return;
      if (ptr.x < W / 2) Object.assign(this.stick, { active: true, id: ptr.id, ox: ptr.x, oy: ptr.y, x: 0, y: 0 });
    });
    this.input.on("pointermove", (ptr) => {
      const s = this.stick; if (!s.active || ptr.id !== s.id) return;
      const dx = ptr.x - s.ox, dy = ptr.y - s.oy, l = Math.hypot(dx, dy);
      s.x = l > 18 ? dx / Math.max(l, 90) : 0; s.y = l > 18 ? dy / Math.max(l, 90) : 0;
    });
    const up = (ptr) => { if (ptr.id === this.stick.id) { this.stick.active = false; this.stick.x = this.stick.y = 0; } };
    this.input.on("pointerup", up); this.input.on("pointerupoutside", up);
  }

  // ---------- stages ----------
  startStage() {
    const st = this.stage;
    this.stageTxt.setLabel(st < 2 ? tf("Attendants · wave {n} of 2", { n: st + 1 }) : tr("Qahraton"));
    if (st === 0) { this.spawn(2); }
    else if (st === 1) { this.spawn(3); }
    else {
      this.locked = true;
      const q = this.spawnBoss();
      this.dbox.actors["Qahraton"] = q;
      this.time.delayedCall(600, () => this.dbox.show(STORY.duel.qahratonEnter, () => { this.locked = false; }));
    }
  }

  spawn(n) {
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const x = side > 0 ? ARENA.x1 + 60 : ARENA.x0 - 60, y = lerp(ARENA.y0 + 60, ARENA.y1 - 40, (i + 0.5) / n);
      const e = makePerson(this, x, y, { robe: [0x4a3a5a, 0x3a4a5a, 0x5a3a3a][i % 3], body: "robe", head: "turban", headColor: 0x2a2a34, beard: "mustache", holding: "spear", mood: "grim" }).tint(0xc0c4e8);
      Object.assign(e, { kind: "grunt", hp: 3, maxHp: 3, state: "approach", t: 400 + i * 500, speed: 190, vx: 0, vy: 0, kb: 0, dead: false });
      this.enemies.push(e);
    }
  }

  spawnBoss() {
    const q = makePerson(this, 960, ARENA.y0 + 20, STORY.cast["Qahraton"]).tint(0xd0d4f0);
    Object.assign(q, { kind: "boss", hp: 14, maxHp: 14, state: "approach", t: 900, speed: 230, vx: 0, vy: 0, kb: 0, dead: false, called: false });
    this.boss = q;
    const bw = 700;
    this.bossBar = this.add.graphics().setDepth(8900);
    this.bossLbl = UI.title(this, W / 2, H - 92, "QAHRATON", { size: 30, color: "#f1e3c2" }).setDepth(8901);
    this.drawBossBar = () => {
      const f = Math.max(0, q.hp / q.maxHp);
      this.bossBar.clear();
      this.bossBar.fillStyle(0x0e0b22, 0.7).fillRoundedRect(W / 2 - bw / 2 - 6, H - 60, bw + 12, 30, 12);
      this.bossBar.fillStyle(0xb2283a, 1).fillRoundedRect(W / 2 - bw / 2, H - 54, bw * f, 18, 8);
      this.bossBar.lineStyle(2, PAL.gold, 0.9).strokeRoundedRect(W / 2 - bw / 2 - 6, H - 60, bw + 12, 30, 12);
    };
    this.drawBossBar();
    this.enemies.push(q);
    return q;
  }

  // ---------- update ----------
  tick(time, d) {
    if (!this.p) return;
    const dt = d / 1000, p = this.p, k = this.keys;
    this.drawStick();
    for (const e of this.enemies) this.persp(e);
    this.persp(p);
    if (this.locked || this.over || this.dbox.visible) { p.moving = false; this.enemies.forEach(e => e.moving = false); return; }

    // input
    const kd = keyDir(k);
    let mx = kd.x + this.stick.x, my = kd.y + this.stick.y;
    const ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    if (ml > 0.1) { p.dir = { x: mx / Math.max(ml, 0.0001), y: my / Math.max(ml, 0.0001) }; if (Math.abs(mx) > 0.1) p.setFacing(mx < 0 ? -1 : 1); }
    const rollPress = Phaser.Input.Keyboard.JustDown(k.shift) || Phaser.Input.Keyboard.JustDown(k.k) || this.touchRoll;
    const atkPress = Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(k.j) || this.touchAtk;
    this.touchRoll = this.touchAtk = false;

    if (this.rollCd > 0) this.rollCd -= d;
    if (rollPress && this.rollT <= 0 && this.rollCd <= 0) {
      this.rollT = 260; this.rollCd = 520; p.inv = Math.max(p.inv, 320);
      this.rollDir = ml > 0.1 ? { x: mx / ml, y: my / ml } : { x: p.facing, y: 0 };
      Snd.play("whoosh");
      this.tweens.add({ targets: p.inner, angle: 360 * (this.rollDir.x < 0 ? -1 : 1), duration: 260, onComplete: () => { p.inner.angle = 0; } });
    }
    let vx, vy;
    if (this.rollT > 0) { this.rollT -= d; vx = this.rollDir.x * 980; vy = this.rollDir.y * 760; }
    else { const sp = this.atkCd > 120 ? 150 : 380; vx = mx * sp; vy = my * sp * 0.8; }
    p.x = clamp(p.x + vx * dt, ARENA.x0, ARENA.x1);
    p.y = clamp(p.y + vy * dt, ARENA.y0, ARENA.y1);
    p.moving = Math.hypot(vx, vy) > 20 && this.rollT <= 0;

    if (this.atkCd > 0) this.atkCd -= d;
    if (this.comboT > 0) { this.comboT -= d; if (this.comboT <= 0) this.combo = 0; }
    if (atkPress && this.atkCd <= 0 && this.rollT <= 0) this.attack();

    if (p.inv > 0) { p.inv -= d; p.alpha = this.rollT > 0 ? 0.7 : (Math.floor(time / 70) % 2 ? 0.4 : 1); } else p.alpha = 1;

    // enemies
    this.enemies.forEach(e => this.updateEnemy(e, dt, d));
    this.enemies = this.enemies.filter(e => !e.dead);
    if (!this.over && this.enemies.length === 0 && !this.waiting) this.stageClear();
  }

  persp(o) { o.setPerspective(lerp(0.85, 1.12, clamp((o.y - ARENA.y0) / (ARENA.y1 - ARENA.y0), 0, 1))); o.setDepth(o.y); }

  attack() {
    const p = this.p;
    this.combo = this.combo % 3 + 1;
    this.comboT = 520;
    this.atkCd = this.combo === 3 ? 380 : 210;
    Snd.play("swing");
    // the swing: arm sweep + a crescent of light
    p.armLock = true;
    p.armR.rotation = -2.4;
    this.tweens.add({ targets: p.armR, rotation: 0.6, duration: 150, ease: "Cubic.easeOut", onComplete: () => { p.armLock = false; } });
    const dir = Math.abs(p.dir.x) + Math.abs(p.dir.y) > 0.1 ? p.dir : { x: p.facing, y: 0 };
    const ang = Math.atan2(dir.y, dir.x), reach = this.combo === 3 ? 190 : 160;
    const cx = p.x + dir.x * 40, cy = p.y - 70 + dir.y * 30;
    const g = this.add.graphics().setDepth(p.y + 5).setBlendMode(Phaser.BlendModes.ADD);
    g.fillStyle(0xe8f0ff, 0.8);
    g.slice(cx, cy, reach, ang - 1.1, ang + 1.1, false); g.fillPath();
    g.fillStyle(0x0b0a1a, 1); g.slice(cx - dir.x * 30, cy - dir.y * 30, reach - 10, ang - 1.2, ang + 1.2, false); g.fillPath();
    g.setBlendMode(Phaser.BlendModes.NORMAL);
    this.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });
    this.drawSlash(cx, cy, reach, ang);
    let hitAny = false;
    this.enemies.forEach(e => {
      if (e.dead) return;
      const dx = e.x - p.x, dy = (e.y - p.y) * 1.3, dd = Math.hypot(dx, dy);
      const da = Math.abs(Phaser.Math.Angle.Wrap(Math.atan2(dy, dx) - ang));
      if (dd < reach + 40 && (da < 1.25 || dd < 70)) { this.hurtEnemy(e, this.combo === 3 ? 2 : 1, dx / (dd || 1), dy / (dd || 1)); hitAny = true; }
    });
    if (hitAny) { this.cameras.main.shake(80, 0.004); this.hitstop(50); }
  }

  drawSlash(cx, cy, r, ang) {
    const g = this.add.graphics().setDepth(5000);
    g.lineStyle(10, 0xffffff, 0.9); g.beginPath(); g.arc(cx, cy, r * 0.82, ang - 1.0, ang + 1.0); g.strokePath();
    g.lineStyle(22, 0xb0c8ff, 0.35); g.beginPath(); g.arc(cx, cy, r * 0.82, ang - 1.0, ang + 1.0); g.strokePath();
    this.tweens.add({ targets: g, alpha: 0, duration: 180, onComplete: () => g.destroy() });
  }

  hitstop(ms) { this.time.timeScale = 0.05; setTimeout(() => { if (this.time) this.time.timeScale = 1; }, ms); }

  hurtEnemy(e, dmg, nx, ny) {
    e.hp -= dmg;
    Snd.play("hit");
    e.kbx = nx * 620; e.kby = ny * 420; e.kb = 160;
    if (e.state === "windup" && e.kind === "grunt") { e.state = "recover"; e.t = 500; if (e.warn) { e.warn.destroy(); e.warn = null; } }
    e.tint(0xffffff);
    [e.body, e.armL, e.armR, e.headImg].forEach(i => i.setTintFill(0xffffff));
    this.time.delayedCall(70, () => { if (e.active) { [e.body, e.armL, e.armR, e.headImg].forEach(i => i.clearTint()); e.tint(e.kind === "boss" ? 0xd0d4f0 : 0xc0c4e8); } });
    const sp = this.add.particles(e.x, e.y - 80, "fx-spark", { speed: { min: 80, max: 260 }, scale: { start: 0.35, end: 0 }, lifespan: 300, tint: [0xffffff, 0xffd27a], blendMode: "ADD", emitting: false }).setDepth(5001);
    sp.explode(10);
    this.time.delayedCall(400, () => sp.destroy());
    if (e.kind === "boss") {
      this.drawBossBar();
      if (!e.called && e.hp <= e.maxHp / 2 && e.hp > 0) { e.called = true; this.time.delayedCall(400, () => { if (!this.over) { UI.toast(this, "“To me! Defend your steward!”", { y: 220 }); this.spawn(2); } }); }
    }
    if (e.hp <= 0) this.killEnemy(e);
  }

  killEnemy(e) {
    e.dead = true;
    if (e.warn) { e.warn.destroy(); e.warn = null; }
    Snd.play(e.kind === "boss" ? "clang" : "thud");
    this.tweens.add({ targets: e, alpha: 0, angle: e.x < this.p.x ? -80 : 80, y: e.y + 10, duration: 500, onComplete: () => e.destroy() });
    if (e.kind === "boss") { this.bossBar.destroy(); this.bossLbl.destroy(); }
  }

  updateEnemy(e, dt, d) {
    if (e.dead) return;
    const p = this.p;
    if (e.kb > 0) {
      e.kb -= d; e.x += e.kbx * dt; e.y += e.kby * dt; e.kbx *= 0.85; e.kby *= 0.85;
      e.x = clamp(e.x, ARENA.x0 - 80, ARENA.x1 + 80); e.y = clamp(e.y, ARENA.y0, ARENA.y1);
      e.moving = false;
      return;
    }
    const dx = p.x - e.x, dy = p.y - e.y, dd = Math.hypot(dx, dy) || 1;
    e.t -= d;
    const boss = e.kind === "boss";
    if (e.state === "approach") {
      const want = boss ? 210 : 240;
      // spread out a little so they don't stack
      let sx = 0, sy = 0;
      this.enemies.forEach(o => { if (o !== e && !o.dead) { const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy); if (od < 140 && od > 0) { sx += ox / od; sy += oy / od; } } });
      const dirx = dd > want ? dx / dd : (dd < want - 60 ? -dx / dd * 0.6 : -dy / dd * 0.5);
      const diry = dd > want ? dy / dd : (dd < want - 60 ? -dy / dd * 0.6 : dx / dd * 0.5);
      e.x += (dirx + sx * 0.6) * e.speed * dt; e.y += (diry + sy * 0.6) * e.speed * dt * 0.8;
      e.x = clamp(e.x, ARENA.x0 - 80, ARENA.x1 + 80); e.y = clamp(e.y, ARENA.y0, ARENA.y1);
      e.moving = true; e.face(p.x);
      if (e.t <= 0 && dd < want + 120) {
        e.state = "windup"; e.t = boss ? 520 : 700; e.moving = false;
        e.combo = boss ? (Math.random() < 0.45 ? 3 : 1) : 1;
        e.warn = this.add.image(e.x, e.y - 230, "prompt-mark").setTint(0xff5a4a).setDepth(8700).setScale(0.8);
        this.tweens.add({ targets: e.warn, scale: 1, duration: 150, yoyo: true, repeat: 2 });
        Snd.play("alarm");
        e.armLock = true; this.tweens.add({ targets: e.armR, rotation: -1.6, duration: 300 });
      }
    } else if (e.state === "windup") {
      e.moving = false;
      if (e.warn) e.warn.setPosition(e.x, e.y - 230);
      const f = Math.floor(e.t / 80) % 2;
      [e.body, e.headImg].forEach(i => f ? i.setTint(0xff8a7a) : i.setTint(boss ? 0xd0d4f0 : 0xc0c4e8));
      if (e.t <= 0) {
        if (e.warn) { e.warn.destroy(); e.warn = null; }
        e.state = "lunge"; e.t = boss ? 300 : 340;
        e.lx = dx / dd; e.ly = dy / dd; e.hitDone = false;
        Snd.play("swing");
        this.tweens.add({ targets: e.armR, rotation: 0.5, duration: 140, onComplete: () => { e.armLock = false; } });
      }
    } else if (e.state === "lunge") {
      const sp = boss ? 1050 : 820;
      e.x += e.lx * sp * dt; e.y += e.ly * sp * dt * 0.8;
      e.x = clamp(e.x, ARENA.x0 - 40, ARENA.x1 + 40); e.y = clamp(e.y, ARENA.y0, ARENA.y1);
      e.moving = true;
      if (!e.hitDone && Math.hypot(p.x - e.x, (p.y - e.y) * 1.3) < 90 && p.inv <= 0) { e.hitDone = true; this.hurtPlayer(boss ? 2 : 1, e.lx, e.ly); }
      if (e.t <= 0) {
        e.combo--;
        if (e.combo > 0) { e.state = "windup"; e.t = 260; e.armLock = true; this.tweens.add({ targets: e.armR, rotation: -1.6, duration: 150 }); }
        else { e.state = "recover"; e.t = boss ? 650 : 900; }
      }
    } else if (e.state === "recover") {
      e.moving = false;
      [e.body, e.headImg].forEach(i => i.setTint(boss ? 0xd0d4f0 : 0xc0c4e8));
      if (e.t <= 0) { e.state = "approach"; e.t = boss ? 500 + Math.random() * 500 : 900 + Math.random() * 900; }
    }
  }

  hurtPlayer(dmg, nx, ny) {
    const p = this.p;
    p.hp -= dmg; p.inv = 900;
    this.hearts.set(Math.max(0, p.hp));
    Snd.play("hurt");
    this.cameras.main.shake(180, 0.01);
    this.cameras.main.flash(120, 120, 0, 0);
    this.tweens.add({ targets: p, x: clamp(p.x + nx * 120, ARENA.x0, ARENA.x1), y: clamp(p.y + ny * 80, ARENA.y0, ARENA.y1), duration: 160 });
    if (p.hp <= 0) this.defeat();
  }

  defeat() {
    this.over = true;
    Snd.play("fail");
    this.tweens.add({ targets: this.p, angle: -80, alpha: 0.6, duration: 600 });
    this.time.delayedCall(800, () => this.dbox.show([{ speaker: "", text: "You stagger and fall - but this is a memory, and memories can be told again." }],
      () => this.restartWith({ stage: this.stage, fails: this.fails + 1 })));
  }

  stageClear() {
    if (this.stage >= 2) { if (this.boss && this.boss.dead) { this.over = true; this.time.delayedCall(700, () => this.victory()); } return; }
    this.waiting = true;
    Snd.play("chime");
    UI.toast(this, this.stage === 0 ? "More are coming…" : "The steward himself steps out of the trees", { y: 240, hold: 1400 });
    this.p.hp = Math.min(6, this.p.hp + 2); this.hearts.set(this.p.hp);
    this.time.delayedCall(1800, () => { this.stage++; this.waiting = false; this.startStage(); });
  }

  victory() {
    Snd.play("success");
    this.gul.tint(0xffffff);
    this.dbox.show(STORY.duel.victory, () => this.advance());
  }

  drawStick() {
    const g = this.stickG, s = this.stick;
    g.clear();
    if (!s.active) return;
    g.fillStyle(0xffffff, 0.12).fillCircle(s.ox, s.oy, 90);
    g.lineStyle(3, PAL.gold, 0.6).strokeCircle(s.ox, s.oy, 90);
    g.fillStyle(PAL.gold, 0.6).fillCircle(s.ox + s.x * 70, s.oy + s.y * 70, 36);
  }
}
