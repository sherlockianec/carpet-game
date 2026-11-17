// ============================================================
// Walk.js — shared pieces for the scenes you walk around in.
//
//   addProp(...)   paint a prop into its own sprite that sorts by
//                  depth with the people, with an optional footprint
//                  people bump into.
//   Walker         moves the hero: WASD / arrows, or click / tap the
//                  ground to walk there. Shows a "Talk" prompt over
//                  whoever is nearest; E / Space / Enter or clicking
//                  them starts the conversation.
// ============================================================

// Paint a prop whose ground point lands at (x, y).
//   paint(ctx) draws around (0, 0) = the ground point.
//   o: pad (canvas space below the ground point), col {rx, ry} footprint,
//      tint, depthOff, key (reuse a painting), scale
function addProp(scene, x, y, w, h, paint, o) {
  o = o || {};
  const pad = o.pad === undefined ? 30 : o.pad;
  scene._propN = (scene._propN || 0) + 1;
  const key = o.key || ("prop_" + scene.scene.key + "_" + scene._propN);
  Tex.make(scene, key, w, h, (ctx) => { ctx.translate(w / 2, h - pad); paint(ctx); });
  const img = scene.add.image(x, y, key).setOrigin(0.5, (h - pad) / h);
  img.setDepth(y + (o.depthOff || 0));
  if (o.scale) img.setScale(o.scale);
  if (o.tint !== undefined && o.tint !== 0xffffff) img.setTint(o.tint);
  if (o.col) {
    scene.colliders = scene.colliders || [];
    scene.colliders.push({ x: x + (o.col.dx || 0), y: y + (o.col.dy || 0), rx: o.col.rx, ry: o.col.ry });
  }
  return img;
}

// Prompt bubble textures (kept across scenes).
function promptTextures(scene) {
  Tex.make(scene, "prompt-key", 92, 92, (ctx) => {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    pRR(ctx, 10, 8, 72, 68, 16); ctx.fillStyle = gradV(ctx, 8, 76, [[0, 0xfff1c4], [1, 0xe0b24e]]); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(36, 75); ctx.lineTo(46, 88); ctx.lineTo(56, 75); ctx.closePath(); fillC(ctx, 0xe0b24e); ctx.fill();
    pRR(ctx, 10, 8, 72, 68, 16); strokeC(ctx, 0x6a4712, 3); ctx.stroke();
  }, true);
  Tex.make(scene, "prompt-mark", 70, 110, (ctx) => {
    glowDot(ctx, 35, 50, 34, 0xffd27a, 0.5);
    pRR(ctx, 27, 10, 16, 56, 8); ctx.fillStyle = gradV(ctx, 10, 66, [[0, 0xfff1c4], [1, 0xe0a83a]]); ctx.fill(); strokeC(ctx, 0x6a4712, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(35, 86, 10, 0, 6.2832); ctx.fill(); ctx.stroke();
  }, true);
}

class Walker {
  // o: bounds {x0,y0,x1,y1}, speed, persp [yFar, yNear, kFar, kNear]
  constructor(scene, person, o) {
    o = o || {};
    this.scene = scene;
    this.p = person;
    this.bounds = o.bounds || { x0: 80, y0: 640, x1: W - 80, y1: 1010 };
    this.speed = o.speed || 360;
    this.persp = o.persp || [this.bounds.y0, this.bounds.y1, 0.84, 1.12];
    this.locked = false;
    this.target = null; this.onArrive = null;
    this.stepT = 0; this.busyAt = 0;
    this.facing = person.facing;
    scene.colliders = scene.colliders || [];
    scene.interactables = scene.interactables || [];
    promptTextures(scene);

    this.prompt = scene.add.container(0, 0).setDepth(8800).setVisible(false);
    this.promptKey = scene.add.image(0, 0, "prompt-key");
    this.promptKeyTxt = UI.title(scene, 0, -6, "E", { size: 40, color: "#3a2208", shadow: false });
    this.promptLbl = UI.text(scene, 0, 62, "Talk", { size: 28, color: "#fff4d6", stroke: "#1a1030", strokeW: 6, shadow: false });
    this.prompt.add([this.promptKey, this.promptKeyTxt, this.promptLbl]);
    scene.tweens.add({ targets: this.prompt, scale: 1.08, duration: 520, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    scene.input.on("pointerdown", (p, over) => {
      if (this.isBusy()) return;
      if (over && over.length) return;          // something under the pointer handles it
      this.walkTo(p.worldX, p.worldY);
      this.marker(p.worldX, p.worldY);
    });
    this.applyPerspective();
  }

  isBusy() {
    const s = this.scene;
    return this.locked || s.leaving || (s.dbox && s.dbox.visible) || s.busy;
  }

  marker(x, y) {
    const m = this.scene.add.image(x, clamp(y, this.bounds.y0, this.bounds.y1), "fx-glow").setTint(0xffe2a0).setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(90, 34).setAlpha(0.8).setDepth(1);
    this.scene.tweens.add({ targets: m, alpha: 0, scaleX: m.scaleX * 1.6, scaleY: m.scaleY * 1.6, duration: 420, onComplete: () => m.destroy() });
  }

  walkTo(x, y, onArrive) {
    this.target = { x: clamp(x, this.bounds.x0, this.bounds.x1), y: clamp(y, this.bounds.y0, this.bounds.y1) };
    this.onArrive = onArrive || null;
  }
  stop() { this.target = null; this.onArrive = null; this.p.moving = false; }

  // Register something you can talk to / look at.
  //   it: { x, y, r, label, obj (for clicking), act() , head (prompt height) }
  add(it) {
    it.r = it.r || 150;
    this.scene.interactables.push(it);
    if (it.obj) {
      const o = it.obj;
      if (!o.input) {
        if (o instanceof Person) o.setInteractive(new Phaser.Geom.Rectangle(-50, -165, 100, 175), Phaser.Geom.Rectangle.Contains);
        else o.setInteractive({ useHandCursor: true, pixelPerfect: false });
      }
      if (o.input) o.input.cursor = "pointer";
      o.on("pointerdown", () => {
        if (this.isBusy()) return;
        const side = this.p.x < it.x ? -1 : 1;
        const tx = it.x + side * (it.stand || 95), ty = it.y + 8;
        this.walkTo(tx, ty, () => { this.p.face(it.x); this.trigger(it); });
      });
    }
    return it;
  }
  remove(it) {
    const list = this.scene.interactables, i = list.indexOf(it);
    if (i >= 0) list.splice(i, 1);
  }

  trigger(it) {
    if (this.isBusy()) return;
    this.stop();
    this.prompt.setVisible(false);
    if (it.obj && it.obj.face) it.obj.face(this.p.x);
    it.act();
  }

  applyPerspective() {
    const [y0, y1, k0, k1] = this.persp;
    const k = lerp(k0, k1, clamp((this.p.y - y0) / (y1 - y0), 0, 1));
    this.p.setPerspective(k);
    this.p.setDepth(this.p.y);
    return k;
  }

  update(time, d) {
    const s = this.scene, p = this.p;
    if (this.isBusy()) {
      this.busyAt = time;
      p.moving = false;
      this.prompt.setVisible(false);
      return;
    }
    const k = s.keys, dir = keyDir(k);
    let dx = dir.x, dy = dir.y;
    if (dx || dy) { this.target = null; this.onArrive = null; }
    else if (this.target) {
      const tx = this.target.x - p.x, ty = this.target.y - p.y, dd = Math.hypot(tx, ty);
      if (dd < 12) {
        const cb = this.onArrive;
        this.target = null; this.onArrive = null;
        if (cb) { p.moving = false; cb(); return; }
      } else { dx = tx / dd; dy = ty / dd; }
    }
    const moving = !!(dx || dy);
    if (moving) {
      const len = Math.hypot(dx, dy) || 1;
      const sc = this.applyPerspective();
      const v = this.speed * (d / 1000) * sc;
      let nx = p.x + dx / len * v, ny = p.y + dy / len * v * 0.8;
      // push out of prop footprints (ellipses)
      s.colliders.forEach(c => {
        const ex = (nx - c.x) / c.rx, ey = (ny - c.y) / c.ry, e = Math.hypot(ex, ey);
        if (e < 1 && e > 0.0001) { nx = c.x + ex / e * c.rx; ny = c.y + ey / e * c.ry; }
      });
      const bx = clamp(nx, this.bounds.x0, this.bounds.x1), by = clamp(ny, this.bounds.y0, this.bounds.y1);
      const progressed = Math.hypot(bx - p.x, by - p.y);
      p.x = bx; p.y = by;
      if (Math.abs(dx) > 0.15) p.setFacing(dx < 0 ? -1 : 1);
      // walking into a wall toward a click target: give up rather than moonwalk
      if (this.target && progressed < v * 0.2) { this.stuck = (this.stuck || 0) + d; if (this.stuck > 260) { const cb = this.onArrive; this.target = null; this.onArrive = null; this.stuck = 0; if (cb) cb(); } }
      else this.stuck = 0;
      this.stepT -= d;
      if (this.stepT <= 0) { this.stepT = 300; Snd.play("step"); }
    }
    p.moving = moving;
    this.applyPerspective();

    // nearest thing to interact with
    let best = null, bd = 1e9;
    s.interactables.forEach(it => {
      if (it.enabled === false) return;
      const dd = Math.hypot(it.x - p.x, (it.y - p.y) * 1.4);
      if (dd < it.r && dd < bd) { bd = dd; best = it; }
    });
    this.near = best;
    if (best) {
      const hy = best.head !== undefined ? best.head : (best.obj && best.obj.h ? best.obj.h * (best.obj.pk || 1) + 70 : 180);
      this.prompt.setPosition(best.x, best.y - hy).setVisible(true);
      this.promptKeyTxt.setText(s.touchMode ? "☝" : "E");
      this.promptLbl.setText(tr(best.label || "Talk"));
      const fresh = time - this.busyAt > 260;
      if (fresh && (Phaser.Input.Keyboard.JustDown(k.e) || Phaser.Input.Keyboard.JustDown(k.space) || Phaser.Input.Keyboard.JustDown(k.enter))) {
        p.face(best.x);
        this.trigger(best);
      }
    } else {
      this.prompt.setVisible(false);
    }
  }
}

// A soft sparkle that marks where to go when the player seems lost.
function guideSparkle(scene, x, y) {
  const g = scene.add.image(x, y, "prompt-mark").setDepth(8790).setAlpha(0);
  scene.tweens.add({ targets: g, alpha: 1, duration: 400 });
  scene.tweens.add({ targets: g, y: y - 16, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  return g;
}

// Drifting ambience particles. kind: dust | fireflies | leaves | petals | embers | snow
function ambientParticles(scene, kind, o) {
  o = o || {};
  const area = o.area || { x: 0, y: 0, w: W, h: H };
  const cfg = {
    dust: { tex: "fx-dot", tint: [0xfff1c4], scale: { min: 0.08, max: 0.22 }, alpha: { start: 0.55, end: 0 }, speedX: { min: -12, max: 18 }, speedY: { min: -14, max: 6 }, lifespan: 7000, freq: 160, blend: "ADD" },
    fireflies: { tex: "fx-glow", tint: [0xd8ff8a, 0xfff2a0], scale: { min: 0.05, max: 0.11 }, alpha: { start: 0.9, end: 0 }, speedX: { min: -24, max: 24 }, speedY: { min: -22, max: 10 }, lifespan: 5200, freq: 220, blend: "ADD" },
    leaves: { tex: "fx-leaf", tint: [0x9ab04a, 0xd9a441, 0xc66a3d], scale: { min: 0.7, max: 1.2 }, alpha: { start: 0.95, end: 0.6 }, speedX: { min: 40, max: 120 }, speedY: { min: 40, max: 90 }, lifespan: 9000, freq: 600, rotate: true },
    petals: { tex: "fx-petal", tint: [0xffd9e4, 0xffffff, 0xffc0d0], scale: { min: 0.7, max: 1.3 }, alpha: { start: 1, end: 0.5 }, speedX: { min: 30, max: 90 }, speedY: { min: 30, max: 70 }, lifespan: 10000, freq: 260, rotate: true },
    embers: { tex: "fx-dot", tint: [0xffc060, 0xff7a2a], scale: { min: 0.1, max: 0.25 }, alpha: { start: 1, end: 0 }, speedX: { min: -20, max: 20 }, speedY: { min: -80, max: -30 }, lifespan: 2600, freq: 120, blend: "ADD" }
  }[kind];
  const pm = scene.add.particles(0, 0, cfg.tex, {
    x: { min: area.x, max: area.x + area.w }, y: { min: area.y, max: area.y + area.h },
    speedX: cfg.speedX, speedY: cfg.speedY, scale: cfg.scale, alpha: cfg.alpha, lifespan: cfg.lifespan,
    frequency: o.freq || cfg.freq, tint: cfg.tint, rotate: cfg.rotate ? { min: 0, max: 360 } : 0,
    blendMode: cfg.blend || "NORMAL"
  });
  pm.setDepth(o.depth === undefined ? 5000 : o.depth);
  if (o.prewarm !== false) pm.fastForward(cfg.lifespan);
  return pm;
}

// Background image painted once per scene at full resolution.
function addBackdrop(scene, key, paint, depth) {
  Tex.make(scene, key, W, H, paint);
  return scene.add.image(0, 0, key).setOrigin(0).setDepth(depth === undefined ? -10 : depth);
}
