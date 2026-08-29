// ============================================================
// GridMover.js — small reusable free-movement controller for
// "walk around a bounded 2D area" scenes: the bazaar (SceneTown)
// and the route map (SceneVillagePalace). WASD/arrow input,
// optional click-to-walk, rectangular bounds clamping, facing,
// and a footstep-cadence callback for a walk-cycle.
// ============================================================

class GridMover {
  constructor(scene, target, opts) {
    opts = opts || {};
    this.scene = scene;
    this.target = target;
    this.speed = opts.speed || 130;
    this.bounds = opts.bounds || { x0: 0, y0: 0, x1: scene.scale.width, y1: scene.scale.height };
    this.onStep = opts.onStep || null;
    this.enabled = true;
    this.facing = 1;
    this.walkTarget = null;
    this._stepTimer = 0;

    this.keys = scene.input.keyboard.addKeys({
      up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D"
    });
  }

  clickTo(x, y) {
    this.walkTarget = { x: Phaser.Math.Clamp(x, this.bounds.x0, this.bounds.x1), y: Phaser.Math.Clamp(y, this.bounds.y0, this.bounds.y1) };
  }

  stop() { this.walkTarget = null; }

  update(delta) {
    if (!this.enabled) return { moving: false };
    const dt = delta / 1000;
    let dx = 0, dy = 0;
    const k = this.keys;
    if (k.left.isDown || k.a.isDown) dx -= 1;
    if (k.right.isDown || k.d.isDown) dx += 1;
    if (k.up.isDown || k.w.isDown) dy -= 1;
    if (k.down.isDown || k.s.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      this.walkTarget = null;
    } else if (this.walkTarget) {
      const tdx = this.walkTarget.x - this.target.x, tdy = this.walkTarget.y - this.target.y;
      const dist = Math.hypot(tdx, tdy);
      if (dist < 4) this.walkTarget = null;
      else { dx = tdx / dist; dy = tdy / dist; }
    }

    let moving = false;
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      this.target.x = Phaser.Math.Clamp(this.target.x + dx * this.speed * dt, this.bounds.x0, this.bounds.x1);
      this.target.y = Phaser.Math.Clamp(this.target.y + dy * this.speed * dt, this.bounds.y0, this.bounds.y1);
      if (Math.abs(dx) > 0.1) this.facing = dx > 0 ? 1 : -1;
      moving = true;
      this._stepTimer -= delta;
      if (this._stepTimer <= 0) { this._stepTimer = 260; if (this.onStep) this.onStep(); }
    }
    if (this.target.setDepth) this.target.setDepth(Math.round(this.target.y));
    return { dx, dy, moving };
  }
}
