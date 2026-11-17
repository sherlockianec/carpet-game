// ============================================================
// core.js — the shared foundation every other file leans on:
// stage size, fonts, palette, seeded randomness, colour maths,
// the texture pool, save data, story flow and BaseScene.
//
// The game is authored at 1920x1080 and scaled to fit the
// window, so it stays sharp on large and high-density screens.
// ============================================================

const W = 1920, H = 1080;

const FONT_T = '"El Messiri", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';   // titles, labels
const FONT_B = 'Alegreya, "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';       // dialogue, body

const PAL = {
  night: 0x0b0a1a, indigo: 0x17153a, navy: 0x14203a, lapis: 0x1c4e80, sky: 0x3f86b8,
  turquoise: 0x2fb8ac, teal: 0x1f6f6f, gold: 0xd9a441, goldLight: 0xf4d58a, goldDark: 0x9a6a1f,
  cream: 0xf6ecd8, parchment: 0xe9d7ae, sand: 0xdcc08c, clay: 0xcfa878, terracotta: 0xc66a3d,
  brick: 0xa5553a, crimson: 0x8e2f2f, pomegranate: 0xb23a55, plum: 0x4a2f4a, ink: 0x241811,
  inkSoft: 0x4a3626, leaf: 0x5d7a3a, olive: 0x7a8a4a, wood: 0x6b4a2e, woodDark: 0x432b18,
  stone: 0x8a7f72, steel: 0x9aa3ad, white: 0xffffff
};

// ---------- small maths ----------

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function dist(x0, y0, x1, y1) { return Math.hypot(x1 - x0, y1 - y0); }

// ---------- seeded randomness ----------
// Layouts that must look "random" but stay identical on every visit
// (obstacle courses, scattered props, cloth patterns) all draw from this.

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rng(seed) {
  const r = mulberry32(hashSeed(String(seed)));
  r.range = (a, b) => a + r() * (b - a);
  r.int = (a, b) => Math.floor(a + r() * (b - a + 1));
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.chance = p => r() < p;
  r.sign = () => (r() < 0.5 ? -1 : 1);
  return r;
}

// ---------- colour helpers (colours are 0xRRGGBB numbers) ----------

function hexStr(c) { return "#" + ((c >>> 0) & 0xffffff).toString(16).padStart(6, "0"); }
function rgba(c, a) { return "rgba(" + ((c >> 16) & 255) + "," + ((c >> 8) & 255) + "," + (c & 255) + "," + a + ")"; }
function mixC(a, b, t) {
  t = clamp(t, 0, 1);
  const r = Math.round(lerp((a >> 16) & 255, (b >> 16) & 255, t));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t));
  const bl = Math.round(lerp(a & 255, b & 255, t));
  return (r << 16) | (g << 8) | bl;
}
function lighten(c, t) { return mixC(c, 0xffffff, t); }
function darken(c, t) { return mixC(c, 0x000000, t); }
function mulC(a, b) {
  const r = Math.round(((a >> 16) & 255) * ((b >> 16) & 255) / 255);
  const g = Math.round(((a >> 8) & 255) * ((b >> 8) & 255) / 255);
  const bl = Math.round((a & 255) * (b & 255) / 255);
  return (r << 16) | (g << 8) | bl;
}

// ---------- texture pool ----------
// Every picture in the game is painted in code onto a canvas and handed to
// Phaser as a texture. Scene-specific paintings are swept when the next
// scene starts so memory stays flat across a whole playthrough.

const Tex = {
  temp: [],
  make(scene, key, w, h, paint, keep) {
    const tm = scene.textures;
    if (tm.exists(key)) return key;
    const cv = document.createElement("canvas");
    cv.width = Math.max(2, Math.ceil(w));
    cv.height = Math.max(2, Math.ceil(h));
    const ctx = cv.getContext("2d");
    paint(ctx, cv.width, cv.height);
    tm.addCanvas(key, cv);
    if (!keep) this.temp.push(key);
    return key;
  },
  // A canvas the caller has already painted (used by the people atlas).
  adopt(scene, key, canvas, keep) {
    if (scene.textures.exists(key)) return scene.textures.get(key);
    const t = scene.textures.addCanvas(key, canvas);
    if (!keep) this.temp.push(key);
    return t;
  },
  sweep(scene) {
    this.temp.forEach(k => { if (scene.textures.exists(k)) scene.textures.remove(k); });
    this.temp.length = 0;
  }
};

// ---------- save data ----------

const Save = {
  KEY: "uchar-gilam-save-v2",
  data: { index: -1, sub: 0, clues: {}, hasCarpet: false, music: true, sfx: true, finished: false, lang: null },
  load() {
    try {
      const raw = window.localStorage.getItem(this.KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* private mode / sandboxed preview: play without saving */ }
  },
  write() {
    try { window.localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },
  hasProgress() {
    return this.data.index >= 1 && this.data.index < STORY.sequence.length;
  }
};

// ---------- story state + flow ----------

const GameState = {
  clues: { swatch: false, phrase: false, caseObtained: false },
  hasCarpet: false,
  reset() {
    this.clues = { swatch: false, phrase: false, caseObtained: false };
    this.hasCarpet = false;
  }
};

const GameFlow = {
  index: -1,
  sub: 0,
  map: {
    hallOfSkulls: "HallOfSkullsScene",
    villagePalace: "VillagePalaceScene",
    carpet: "CarpetScene",
    town: "TownScene",
    kitchenGame: "KitchenGameScene",
    duel: "DuelScene",
    ending: "EndingScene"
  },
  step() { return STORY.sequence[this.index]; },
  persist() {
    Save.data.index = this.index;
    Save.data.sub = this.sub;
    Save.data.clues = Object.assign({}, GameState.clues);
    Save.data.hasCarpet = GameState.hasCarpet;
    Save.write();
  },
  // Remember a sub-stage inside the current chapter (e.g. "the walk is done,
  // the minigame is next") so Continue resumes there instead of at its start.
  setSub(sub) { this.sub = sub; this.persist(); },
  launch(scene) {
    const step = STORY.sequence[this.index];
    if (!step) {
      this.index = -1; this.sub = 0;
      Save.data.index = -1; Save.data.sub = 0; Save.data.finished = true; Save.write();
      scene.scene.start("TitleScene");
      return;
    }
    scene.scene.start(this.map[step.type], Object.assign({ sub: this.sub }, step));
  },
  advance(scene) {
    this.index++;
    this.sub = 0;
    this.persist();
    this.launch(scene);
  },
  newGame(scene) {
    GameState.reset();
    this.index = -1;
    this.advance(scene);
  },
  resume(scene) {
    GameState.clues = Object.assign({ swatch: false, phrase: false, caseObtained: false }, Save.data.clues || {});
    GameState.hasCarpet = !!Save.data.hasCarpet;
    this.index = Save.data.index;
    this.sub = Save.data.sub || 0;
    this.launch(scene);
  },
  jump(scene, index, sub) {
    this.index = index;
    this.sub = sub || 0;
    this.launch(scene);
  },
  chapterName(index) { return tr(this.chapterKey(index)); },
  chapterKey(index) {
    if (index <= 0) return "Prologue";
    if (index === 1) return "The Village";
    if (index <= 3) return "The Kiln at the City's Edge";
    if (index <= 5) return "The Gravekeeper";
    if (index <= 7) return "The Street of Ovens";
    if (index <= 9) return "The Saddler's Row";
    if (index <= 11) return "The City of King Sanobar";
    if (index <= 13) return "The Hall of Skulls";
    if (index <= 21) return "The Road Back";
    return "Home";
  }
};

// ---------- URL switches (handy for testing a single scene) ----------
//   ?step=7            jump straight to that entry of STORY.sequence
//   ?scene=DuelScene   open one scene directly (extra params become its data)
//   ?mute=1            start silent

const Dev = (function () {
  const out = { params: {}, touch: false };
  try {
    new URLSearchParams(window.location.search).forEach((v, k) => { out.params[k] = v; });
    out.touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  } catch (e) { /* ignore */ }
  return out;
})();

// ---------- input ----------

function makeKeys(scene) {
  return scene.input.keyboard.addKeys({
    up: "UP", down: "DOWN", left: "LEFT", right: "RIGHT", w: "W", a: "A", s: "S", d: "D",
    space: "SPACE", enter: "ENTER", e: "E", shift: "SHIFT", j: "J", k: "K",
    one: "ONE", two: "TWO", three: "THREE", four: "FOUR", five: "FIVE"
  }, true, false);
}
function keyDir(k) {
  let x = 0, y = 0;
  if (k.left.isDown || k.a.isDown) x -= 1;
  if (k.right.isDown || k.d.isDown) x += 1;
  if (k.up.isDown || k.w.isDown) y -= 1;
  if (k.down.isDown || k.s.isDown) y += 1;
  return { x, y };
}

// ---------- BaseScene ----------
// Every scene calls this.begin({...}) first thing in create(). It sweeps the
// previous scene's paintings, fades in, starts the right music, adds the
// pause/sound buttons and wires Esc. Scenes put their per-frame logic in
// tick(time, delta) and leave through this.leave()/this.advance() so every
// exit gets the same fade.

class BaseScene extends Phaser.Scene {
  begin(opts) {
    opts = opts || {};
    Tex.sweep(this);
    makeCommonTextures(this);
    this.leaving = false;
    this._updaters = [];
    this.touchMode = Dev.touch;
    const cam = this.cameras.main;
    cam.setBackgroundColor(opts.bg !== undefined ? opts.bg : PAL.night);
    cam.fadeIn(opts.fadeIn !== undefined ? opts.fadeIn : 520, 8, 6, 16);
    if (opts.music !== undefined) Music.play(opts.music);
    Snd.ambience(opts.amb || null);
    this.keys = makeKeys(this);
    if (opts.hud !== false) UI.hud(this, opts);
    this.input.keyboard.on("keydown-ESC", () => this.openPause());
    this.input.keyboard.on("keydown-M", () => UI.toggleSound(this));
    this.input.on("pointerdown", p => { if (p.wasTouch) this.touchMode = true; });
  }

  onUpdate(fn) { this._updaters.push(fn); return fn; }

  update(time, delta) {
    // A long hitch (tab switch, slow frame) must not teleport anything.
    const d = Math.min(delta, 50);
    const list = this._updaters;
    if (list) for (let i = 0; i < list.length; i++) list[i](time, d);
    if (this.tick) this.tick(time, d);
  }

  leave(fn, ms) {
    if (this.leaving) return;
    this.leaving = true;
    ms = ms === undefined ? 380 : ms;
    this.cameras.main.fadeOut(ms, 8, 6, 16);
    this.time.delayedCall(ms + 40, fn);
  }
  advance() { this.leave(() => GameFlow.advance(this)); }
  restartWith(data, ms) { this.leave(() => this.scene.restart(data), ms); }

  openPause() {
    if (this.leaving || this.noPause || this.scene.isPaused()) return;
    Snd.play("click");
    this.scene.launch("PauseScene", { from: this.scene.key, skip: this.skipLabel ? this.skipLabel() : null });
    this.scene.bringToTop("PauseScene");
    this.scene.pause();
  }
}
