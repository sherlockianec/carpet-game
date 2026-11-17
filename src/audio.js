// ============================================================
// audio.js — every sound in the game is synthesised with the
// Web Audio API. There are no audio files.
//
//   Snd    sound effects + ambience (wind, rain, fire, night)
//   Music  a small step sequencer playing hand-written modal
//          tunes on three synthetic instruments: a plucked
//          string (dutar/rubab), a breathy flute (ney) and a
//          frame drum (doira).
//
// Browsers only allow sound after a click or key press, so the
// context is created lazily by Snd.unlock() on the first gesture.
// ============================================================

const Snd = {
  ctx: null,
  sfxOn: true,
  musicOn: true,
  amb: null,
  ambName: null,

  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; return false; }
    const c = this.ctx;
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -16; this.comp.knee.value = 20; this.comp.ratio.value = 5;
    this.comp.attack.value = 0.004; this.comp.release.value = 0.22;
    this.master = c.createGain(); this.master.gain.value = 0.85;
    this.master.connect(this.comp); this.comp.connect(c.destination);

    this.rev = c.createConvolver(); this.rev.buffer = this._impulse(2.4, 2.4);
    this.revOut = c.createGain(); this.revOut.gain.value = 0.5;
    this.rev.connect(this.revOut); this.revOut.connect(this.master);

    this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.sfxOn ? 1 : 0;
    this.sfxBus.connect(this.master);
    const sSend = c.createGain(); sSend.gain.value = 0.16; this.sfxBus.connect(sSend); sSend.connect(this.rev);

    this.musicBus = c.createGain(); this.musicBus.gain.value = this.musicOn ? 1 : 0;
    this.musicBus.connect(this.master);
    const mSend = c.createGain(); mSend.gain.value = 0.42; this.musicBus.connect(mSend); mSend.connect(this.rev);

    const n = c.sampleRate * 2;
    this.noiseBuf = c.createBuffer(1, n, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return true;
  },

  _impulse(seconds, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * seconds);
    const buf = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  },

  // Called from the first click / key press anywhere on the page.
  unlock() {
    if (!this.init()) return;
    if (this.ctx.state === "suspended") this.ctx.resume().then(() => { Music.kick(); this._startAmb(); }).catch(() => {});
    else { Music.kick(); this._startAmb(); }
  },

  ok() { return !!this.ctx && this.ctx.state === "running"; },

  setSfx(on) {
    this.sfxOn = on;
    if (this.ctx) this.sfxBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.03);
  },
  setMusic(on) {
    this.musicOn = on;
    if (this.ctx) this.musicBus.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.08);
    if (on) Music.kick(); else Music.halt();
  },

  // ---- building blocks ----
  tone(o) {
    const c = this.ctx, t0 = c.currentTime + (o.delay || 0), dur = o.dur || 0.1;
    const osc = c.createOscillator();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(o.f0, t0);
    if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t0 + dur);
    const g = c.createGain(), a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol || 0.15), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || this.sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  },
  noise(o) {
    const c = this.ctx, t0 = c.currentTime + (o.delay || 0), dur = o.dur || 0.2;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf; src.loop = true;
    const f = c.createBiquadFilter();
    f.type = o.type || "bandpass";
    f.frequency.setValueAtTime(o.f0 || 1000, t0);
    if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), t0 + dur);
    f.Q.value = o.q || 1;
    const g = c.createGain(), a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, o.vol || 0.15), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || this.sfxBus);
    src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.03);
  },
  bell(f, vol, dur, delay) {
    this.tone({ f0: f, vol: vol, dur: dur, delay: delay });
    this.tone({ f0: f * 2.76, vol: vol * 0.28, dur: dur * 0.55, delay: delay });
    this.tone({ f0: f * 5.4, vol: vol * 0.1, dur: dur * 0.3, delay: delay });
  },

  play(name, o) {
    if (!this.sfxOn || !this.ok()) return;
    const fn = SFX[name];
    if (fn) { try { fn.call(this, o || {}); } catch (e) { /* never let a sound break the game */ } }
  },

  // ---- ambience loops ----
  ambience(name) {
    if (name === this.ambName) return;
    this._stopAmb();
    this.ambName = name;
    this._startAmb();
  },
  _stopAmb() {
    const a = this.amb;
    this.amb = null;
    if (!a) return;
    if (a.timer) clearInterval(a.timer);
    try {
      const now = this.ctx.currentTime;
      a.out.gain.cancelScheduledValues(now);
      a.out.gain.setTargetAtTime(0.0001, now, 0.25);
      setTimeout(() => { try { a.nodes.forEach(n => n.stop && n.stop()); a.out.disconnect(); } catch (e) { /* ignore */ } }, 1200);
    } catch (e) { /* ignore */ }
  },
  _startAmb() {
    if (this.amb || !this.ambName || !this.ok()) return;
    const c = this.ctx, name = this.ambName, nodes = [];
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, c.currentTime);
    out.gain.setTargetAtTime(1, c.currentTime, 0.6);
    out.connect(this.sfxBus);
    const layer = (type, freq, q, vol, lfoRate, lfoDepth) => {
      const src = c.createBufferSource(); src.buffer = this.noiseBuf; src.loop = true;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(out);
      if (lfoRate) {
        const lfo = c.createOscillator(); lfo.frequency.value = lfoRate;
        const lg = c.createGain(); lg.gain.value = lfoDepth;
        lfo.connect(lg); lg.connect(f.frequency); lfo.start(); nodes.push(lfo);
        const lg2 = c.createGain(); lg2.gain.value = vol * 0.45; lfo.connect(lg2); lg2.connect(g.gain);
      }
      src.start(0, Math.random()); nodes.push(src);
    };
    let timer = null;
    if (name === "wind") { layer("bandpass", 520, 0.6, 0.075, 0.11, 260); layer("bandpass", 1500, 0.9, 0.018, 0.23, 500); }
    else if (name === "storm") {
      layer("bandpass", 420, 0.5, 0.12, 0.17, 240); layer("highpass", 2600, 0.5, 0.04, 0, 0);
    } else if (name === "night") {
      layer("bandpass", 300, 0.5, 0.022, 0.07, 120);
      timer = setInterval(() => {
        if (!this.sfxOn || !this.ok() || Math.random() < 0.35) return;
        const base = 3900 + Math.random() * 700;
        for (let i = 0; i < 3; i++) this.tone({ f0: base, dur: 0.035, vol: 0.006, delay: i * 0.075, bus: out });
      }, 1300);
    } else if (name === "fire") {
      layer("lowpass", 240, 0.6, 0.045, 0.31, 60);
      timer = setInterval(() => {
        if (!this.sfxOn || !this.ok()) return;
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) this.noise({ type: "highpass", f0: 1800 + Math.random() * 2500, dur: 0.02 + Math.random() * 0.03, vol: 0.012 + Math.random() * 0.02, delay: Math.random() * 0.25, bus: out });
      }, 260);
    }
    this.amb = { out, nodes, timer };
  }
};

// Named sound effects. `this` is Snd.
const SFX = {
  click() { this.tone({ type: "triangle", f0: 720, f1: 520, dur: 0.07, vol: 0.1 }); },
  hover() { this.tone({ f0: 980, dur: 0.03, vol: 0.025 }); },
  blip(o) { this.tone({ type: "triangle", f0: (o.pitch || 420) * (0.97 + Math.random() * 0.06), dur: 0.04, vol: 0.035 }); },
  next() { this.tone({ f0: 500, f1: 680, dur: 0.07, vol: 0.06 }); },
  step() { this.noise({ type: "bandpass", f0: 700 + Math.random() * 300, q: 1.4, dur: 0.05, vol: 0.028 }); },
  whoosh() { this.noise({ f0: 320, f1: 1700, q: 0.8, dur: 0.38, vol: 0.14, attack: 0.08 }); },
  gust() { this.noise({ f0: 380, f1: 900, q: 0.7, dur: 0.9, vol: 0.12, attack: 0.3 }); },
  spark(o) {
    const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const f = 660 * Math.pow(2, scale[Math.min(scale.length - 1, o.n || 0)] / 12);
    this.tone({ f0: f, dur: 0.2, vol: 0.085 });
    this.tone({ f0: f * 2, dur: 0.12, vol: 0.03 });
  },
  chime() { [587, 880, 1175].forEach((f, i) => this.bell(f, 0.1, 0.7, i * 0.1)); },
  success() { [587, 740, 880, 1175].forEach((f, i) => this.tone({ type: "triangle", f0: f, dur: 0.3, vol: 0.11, delay: i * 0.085 })); this.bell(1175, 0.07, 0.9, 0.34); },
  fail() { this.tone({ type: "sawtooth", f0: 233, f1: 110, dur: 0.42, vol: 0.07 }); this.tone({ type: "triangle", f0: 175, f1: 87, dur: 0.5, vol: 0.09, delay: 0.05 }); },
  hurt() { this.noise({ type: "lowpass", f0: 900, dur: 0.18, vol: 0.24 }); this.tone({ type: "square", f0: 170, f1: 70, dur: 0.2, vol: 0.08 }); },
  swing() { this.noise({ f0: 2600, f1: 700, q: 1.2, dur: 0.13, vol: 0.12 }); },
  clang() { [1900, 2850, 4100].forEach(f => this.tone({ f0: f * (0.98 + Math.random() * 0.04), dur: 0.26, vol: 0.045 })); this.noise({ type: "highpass", f0: 3500, dur: 0.03, vol: 0.12 }); },
  hit() { this.noise({ type: "lowpass", f0: 1300, dur: 0.09, vol: 0.22 }); this.tone({ type: "triangle", f0: 230, f1: 110, dur: 0.1, vol: 0.14 }); },
  thud() { this.tone({ f0: 150, f1: 58, dur: 0.14, vol: 0.3 }); this.noise({ type: "lowpass", f0: 420, dur: 0.06, vol: 0.12 }); },
  snap() { this.tone({ f0: 170, f1: 80, dur: 0.1, vol: 0.24 }); this.tone({ type: "triangle", f0: 1500, f1: 900, dur: 0.035, vol: 0.07 }); },
  pick() { this.tone({ type: "triangle", f0: 520, f1: 700, dur: 0.05, vol: 0.06 }); },
  nope() { this.tone({ type: "triangle", f0: 240, f1: 180, dur: 0.12, vol: 0.09 }); },
  pop() { this.tone({ f0: 330, f1: 640, dur: 0.08, vol: 0.15 }); },
  sizzle() { this.noise({ type: "highpass", f0: 3600, dur: 0.5, vol: 0.06 }); },
  burn() { this.noise({ type: "lowpass", f0: 520, dur: 0.42, vol: 0.14 }); this.tone({ type: "sawtooth", f0: 190, f1: 90, dur: 0.36, vol: 0.045 }); },
  stoke() { this.noise({ f0: 480, f1: 1300, q: 0.9, dur: 0.24, vol: 0.12, attack: 0.05 }); },
  plop() { this.tone({ f0: 520, f1: 180, dur: 0.12, vol: 0.14 }); },
  ding() { this.bell(1320, 0.11, 0.8); },
  thunder() { this.noise({ type: "lowpass", f0: 900, f1: 200, dur: 0.3, vol: 0.4 }); this.noise({ type: "lowpass", f0: 170, dur: 2.0, vol: 0.5, attack: 0.05 }); },
  arrow() { this.noise({ f0: 3200, f1: 1400, q: 2, dur: 0.16, vol: 0.07 }); },
  alarm() { this.tone({ type: "square", f0: 392, dur: 0.14, vol: 0.05 }); this.tone({ type: "square", f0: 330, dur: 0.2, vol: 0.05, delay: 0.14 }); },
  paper() { this.noise({ type: "highpass", f0: 2200, dur: 0.16, vol: 0.05 }); this.noise({ type: "highpass", f0: 3000, dur: 0.1, vol: 0.04, delay: 0.12 }); },
  magic() { [0, 2, 4, 7, 9, 12, 14, 16, 19].forEach((s, i) => this.tone({ f0: 587 * Math.pow(2, s / 12), dur: 0.3, vol: 0.06, delay: i * 0.055 })); },
  heart() { this.bell(784, 0.09, 0.5); this.bell(1175, 0.07, 0.6, 0.09); },
  land() { this.tone({ f0: 120, f1: 60, dur: 0.16, vol: 0.2 }); this.noise({ type: "lowpass", f0: 600, dur: 0.12, vol: 0.08 }); },
  drum() { this.tone({ f0: 130, f1: 52, dur: 0.22, vol: 0.4 }); },
  sob(o) { const v = o.vol === undefined ? 1 : o.vol; this.tone({ f0: 310, f1: 240, dur: 0.22, vol: 0.02 * v, attack: 0.05 }); this.tone({ f0: 290, f1: 220, dur: 0.26, vol: 0.018 * v, attack: 0.05, delay: 0.3 }); },
  flap() { for (let i = 0; i < 3; i++) this.noise({ type: "lowpass", f0: 700, dur: 0.07, vol: 0.06, delay: i * 0.11 }); },
  screech() { this.tone({ type: "sawtooth", f0: 2300, f1: 1500, dur: 0.42, vol: 0.035, attack: 0.03 }); this.tone({ f0: 3100, f1: 2000, dur: 0.38, vol: 0.03, attack: 0.03 }); },
  squeak() { for (let i = 0; i < 4; i++) this.tone({ f0: 5200 + Math.random() * 1400, f1: 4200, dur: 0.04, vol: 0.02, delay: i * 0.09 }); },
  bowdraw() { this.noise({ type: "bandpass", f0: 900, f1: 1600, q: 3, dur: 0.5, vol: 0.05, attack: 0.3 }); },
  creak() { this.tone({ type: "sawtooth", f0: 110, f1: 90, dur: 0.18, vol: 0.03 }); },
  splash() { this.noise({ type: "lowpass", f0: 1400, f1: 300, dur: 0.5, vol: 0.12 }); this.tone({ f0: 420, f1: 160, dur: 0.18, vol: 0.06 }); },
  slap() { this.noise({ type: "lowpass", f0: 1800, dur: 0.06, vol: 0.2 }); this.tone({ f0: 210, f1: 120, dur: 0.07, vol: 0.12 }); },
  tick() { this.tone({ type: "triangle", f0: 1600, dur: 0.03, vol: 0.05 }); },
  whistle() { this.tone({ type: "triangle", f0: 1800, f1: 2400, dur: 0.16, vol: 0.06 }); this.tone({ type: "triangle", f0: 2400, f1: 1700, dur: 0.22, vol: 0.06, delay: 0.17 }); },
  suspect() { this.tone({ type: "triangle", f0: 520, f1: 760, dur: 0.16, vol: 0.06 }); }
};

// ------------------------------------------------------------
// Music
// ------------------------------------------------------------

const SCALES = {
  hijaz: [0, 1, 4, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  mixo: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10]
};

// Tune notation: one token per step. A number is a scale degree (1-7),
// ' raises and , lowers it an octave, - holds the previous note, . rests.
// Drums: D = deep "dum", T = sharp "tak", t = soft tak, . = rest.
const TRACKS = {
  title: {
    step: 0.44, steps: 8, root: 50, scale: "hijaz", drone: [-12, -5], droneVol: 0.05,
    drums: ["D . . . . . t .", "D . . t . . t ."], drumVol: 0.45,
    voices: [
      { inst: "flute", vol: 0.085, oct: 1, bars: ["5 - - - 6 5 4 -", "3 - - 2 1 - - -", ". . 1 2 3 - 4 3", "2 - 1 - - - . .", "5 - - 6 7 - 6 5", "6 - 5 - 4 3 4 -", "3 - 2 1 2 - 3 2", "1 - - - - - . ."] },
      { inst: "pluck", vol: 0.15, oct: 0, bars: ["1 . 5 . 1' . 5 .", "1 . 5 . 3 . 5 .", "1 . 4 . 1' . 4 .", "1 . 5 . 1 . . ."] }
    ]
  },
  village: {
    step: 0.185, steps: 12, root: 50, scale: "mixo", drone: [-12], droneVol: 0.03,
    drums: ["D . t D t . D . t D t t", "D . t D t . D t t D . t"], drumVol: 0.55,
    voices: [
      { inst: "pluck", vol: 0.17, oct: 1, bars: ["5 . 5 6 5 4 3 . 3 4 3 2", "1 . 1 2 3 . 2 . 1 . . .", "5 . 5 6 5 4 3 . 5 . 6 .", "7 . 6 5 6 . 5 . . . . .", "1' . 1' 7 6 5 6 . 5 4 3 .", "4 . 4 5 4 3 2 . 3 2 1 .", "3 . 3 4 5 . 6 5 4 3 2 .", "1 . . 5, 1 . . . . . . ."] },
      { inst: "pluck", vol: 0.15, oct: -1, bars: ["1 . . 1 . 5 1 . . 1 . 5", "1 . . 1 . 5 1 . . 5 . .", "1 . . 1 . 5 1 . . 1 . 5", "4 . . 4 . 1' 5 . . 5 . ."] }
    ]
  },
  bazaar: {
    step: 0.275, steps: 8, root: 50, scale: "hijaz", drone: [-12], droneVol: 0.03,
    drums: ["D T . T D . T .", "D T . T D . T t"], drumVol: 0.5,
    voices: [
      { inst: "pluck", vol: 0.17, oct: 1, bars: ["1 . 2 3 4 3 2 1", "2 . 3 2 1 . 7, 1", "3 . 4 5 6 5 4 3", "4 3 2 3 1 . . .", "5 . 5 6 5 4 3 4", "5 . 6 7 1' . 7 6", "5 4 3 4 5 . 4 3", "2 3 2 1 1 . . ."] },
      { inst: "pluck", vol: 0.15, oct: -1, bars: ["1 . . 1 . . 5 .", "1 . . 1 . . 5 .", "1 . . 1 . . 4 .", "5 . . 5 . . 1 ."] }
    ]
  },
  dusk: {
    step: 0.36, steps: 8, root: 50, scale: "dorian", drone: [-12, -5], droneVol: 0.045,
    drums: ["D . . t . . t .", "D . . t . D t ."], drumVol: 0.38,
    voices: [
      { inst: "flute", vol: 0.08, oct: 1, bars: ["5 - 4 3 4 - - .", "3 - 2 1 2 - - .", "1 - 3 4 5 - 7 -", "6 - 5 - - - . .", "1' - 7 6 5 - 4 -", "5 - 3 - 4 - 2 -", "3 - 1 2 3 4 2 -", "1 - - - - - . ."] },
      { inst: "pluck", vol: 0.13, oct: 0, bars: ["1 5 1' 5 2' 5 1' 5", "1 5 1' 5 3' 5 1' 5", "7, 4 7 4 2' 4 7 4", "1 5 1' 5 1' . . ."] }
    ]
  },
  grave: {
    step: 0.56, steps: 8, root: 50, scale: "aeolian", drone: [-12, -5], droneVol: 0.07,
    drums: [], drumVol: 0,
    voices: [
      { inst: "flute", vol: 0.085, oct: 1, bars: ["1 - - - - - 2 -", "3 - - - 2 - - -", "1 - - - - - . .", ". . . . . . . .", "5 - - - 6 - 5 -", "4 - - 3 - - 2 -", "3 - - - 1 - - -", ". . . . . . . ."] },
      { inst: "pluck", vol: 0.12, oct: -1, bars: ["1 . . . . . . .", ". . . . 5 . . .", "6, . . . . . . .", ". . . . 5 . . ."] }
    ]
  },
  lament: {
    step: 0.4, steps: 8, root: 50, scale: "aeolian", drone: [-12], droneVol: 0.035,
    drums: [], drumVol: 0,
    voices: [
      { inst: "pluck", vol: 0.15, oct: 0, bars: ["1 . 5 . 1' . 3' .", "6, . 3 . 6 . 1' .", "7, . 4 . 7 . 2' .", "1 . 5 . 1' . . ."] },
      { inst: "flute", vol: 0.075, oct: 1, bars: [". . . . . . . .", ". . . . . . . .", ". . . . . . . .", ". . . . . . . .", "5 - - - 3 - - -", "4 - - 3 1 - - -", "2 - - - 4 - 2 -", "1 - - - - - . .", "5 - - 6 5 - 3 -", "6 - - 5 3 - 1 -", "7 - - 1' 2' - 7 -", "1' - - - - - . ."] }
    ]
  },
  tense: {
    step: 0.25, steps: 16, root: 38, scale: "hijaz", drone: [0, 7], droneVol: 0.05,
    drums: ["D . . . . . . . D . D . . . . .", "D . . . . . . . D . . . . . . ."], drumVol: 0.5,
    voices: [
      { inst: "pluck", vol: 0.14, oct: 1, bars: ["1 . . . . . 2 . 1 . . . . . . .", ". . . . . . . . 5 . 4 . 2 . 1 .", "1 . . . . . 2 . 3 . 2 . . . . .", ". . . . . . . . . . . . 2 . 1 ."] },
      { inst: "flute", vol: 0.05, oct: 2, bars: [". . . . . . . . . . . . . . . .", ". . . . . . . . . . . . . . . .", "5 - - - - - - - 6 - - - 5 - - -", "4 - - - - - 3 - 2 - - - - - . ."] }
    ]
  },
  flight: {
    step: 0.235, steps: 8, root: 50, scale: "mixo", drone: [-12, -5], droneVol: 0.035,
    drums: ["D . t . D . t t", "D . t . D t t ."], drumVol: 0.5,
    voices: [
      { inst: "pluck", vol: 0.13, oct: 0, bars: ["1 5 1' 5 1 5 1' 5", "1 5 1' 5 1 5 2' 5", "4, 1 4 1 4, 1 4 1", "5, 2 5 2 5, 2 7 5"] },
      { inst: "flute", vol: 0.085, oct: 1, bars: ["5 - - - 6 - 5 -", "3 - - - - - 2 3", "4 - - - 5 - 4 -", "2 - - - - - . .", "5 - - - 6 - 7 -", "1' - - - 7 - 6 -", "5 - 4 - 3 - 2 -", "1 - - - - - . ."] }
    ]
  },
  duel: {
    step: 0.128, steps: 12, root: 50, scale: "hijaz", drone: [-12], droneVol: 0.04,
    drums: ["D . t D t t D . t D t t", "D t t D . t D t t D t t"], drumVol: 0.6,
    voices: [
      { inst: "pluck", vol: 0.16, oct: 1, bars: ["1 . 2 3 . 2 1 . 7, 1 . .", "1 . 2 3 . 4 5 . 4 3 2 .", "5 . 6 5 . 4 3 . 4 3 2 .", "3 . 2 1 . 2 1 . . . . ."] },
      { inst: "pluck", vol: 0.15, oct: -1, bars: ["1 . . 1 . . 1 . . 1 . 5", "1 . . 1 . . 2 . . 2 . .", "1 . . 1 . . 1 . . 1 . 5", "4 . . 4 . . 5 . . 5 . ."] }
    ]
  },
  cozy: {
    step: 0.27, steps: 8, root: 50, scale: "mixo", drone: [-12], droneVol: 0.025,
    drums: ["D . t . D t t .", "D . t . D . t t"], drumVol: 0.42,
    voices: [
      { inst: "pluck", vol: 0.16, oct: 1, bars: ["1 . 3 . 5 . 3 .", "6 . 5 . 3 . 2 .", "1 . 3 . 5 . 6 .", "5 . . . 3 . . .", "6 . 6 . 5 . 3 .", "2 . 3 . 5 . 3 .", "2 . 3 . 2 . 1 .", "1 . . . . . . ."] },
      { inst: "pluck", vol: 0.14, oct: -1, bars: ["1 . . . 5 . . .", "4 . . . 5 . . .", "1 . . . 5 . . .", "5 . . . 1 . . ."] }
    ]
  },
  wedding: {
    step: 0.158, steps: 12, root: 52, scale: "mixo", drone: [-12], droneVol: 0.03,
    drums: ["D . t D t t D . t D t t", "D t t D . t D . t D t t"], drumVol: 0.6,
    voices: [
      { inst: "pluck", vol: 0.17, oct: 1, bars: ["5 . 5 6 5 4 3 . 3 4 3 2", "1 . 1 2 3 . 2 . 1 . . .", "5 . 5 6 5 4 3 . 5 . 6 .", "7 . 6 5 6 . 5 . . . . .", "1' . 1' 7 6 5 6 . 5 4 3 .", "4 . 4 5 4 3 2 . 3 2 1 .", "3 . 3 4 5 . 6 5 4 3 2 .", "1 . . 5, 1 . . . . . . ."] },
      { inst: "flute", vol: 0.06, oct: 1, bars: ["5 - - - - - 3 - - - - -", "1 - - - - - 2 - - 1 - -", "5 - - - - - 3 - - 5 - -", "7 - - 6 - - 5 - - - - -"] },
      { inst: "pluck", vol: 0.15, oct: -1, bars: ["1 . . 1 . 5 1 . . 1 . 5", "1 . . 1 . 5 1 . . 5 . ."] }
    ]
  }
};
// Each flight borrows the "flight" tune in its own key and mood.
[["flight1", 50, "mixo", 0.24], ["flight2", 52, "dorian", 0.23], ["flight3", 48, "dorian", 0.235], ["flight4", 50, "hijaz", 0.22], ["flight5", 47, "phrygian", 0.205],
  ["flight6", 45, "hijaz", 0.2], ["flight7", 49, "mixo", 0.23], ["flight8", 46, "aeolian", 0.25], ["flight9", 51, "phrygian", 0.215], ["flight10", 53, "mixo", 0.225]]
  .forEach(v => { TRACKS[v[0]] = Object.assign({}, TRACKS.flight, { root: v[1], scale: v[2], step: v[3] }); });

const Music = {
  name: null,
  timer: null,
  out: null,
  drone: null,
  stepIndex: 0,
  nextTime: 0,
  cache: {},

  play(name) {
    if (name === this.name) return;
    this.halt();
    this.name = name || null;
    this.kick();
  },

  // (Re)start the sequencer if a tune is wanted and sound is available.
  kick() {
    if (!this.name || this.timer || !Snd.musicOn || !Snd.ok()) return;
    const tr = TRACKS[this.name];
    if (!tr) return;
    if (!tr._parsed) this._parse(tr);
    const c = Snd.ctx;
    this.track = tr;
    this.stepIndex = 0;
    this.nextTime = c.currentTime + 0.15;
    this.out = c.createGain();
    this.out.gain.setValueAtTime(0.0001, c.currentTime);
    this.out.gain.linearRampToValueAtTime(1, c.currentTime + 1.4);
    this.out.connect(Snd.musicBus);
    this._startDrone(tr);
    this.timer = setInterval(() => this._schedule(), 70);
  },

  // Stop sounding (the wanted tune name is kept so kick() can resume it).
  halt() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    const out = this.out, drone = this.drone;
    this.out = null; this.drone = null;
    if (out && Snd.ctx) {
      const now = Snd.ctx.currentTime;
      try {
        out.gain.cancelScheduledValues(now);
        out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), now);
        out.gain.linearRampToValueAtTime(0.0001, now + 0.7);
      } catch (e) { /* ignore */ }
      setTimeout(() => { try { if (drone) drone.forEach(n => n.stop()); out.disconnect(); } catch (e) { /* ignore */ } }, 900);
    }
  },

  _parse(tr) {
    const parseBar = str => {
      const toks = str.trim().split(/\s+/), out = [];
      for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (t === "." || t === "-") { out.push(null); continue; }
        let len = 1;
        while (i + len < toks.length && toks[i + len] === "-") len++;
        const m = /^(\d)([',]*)$/.exec(t);
        if (!m) { out.push(null); continue; }
        let oct = 0;
        for (const ch of m[2]) oct += ch === "'" ? 1 : -1;
        out.push({ deg: parseInt(m[1], 10), oct, len });
      }
      return out;
    };
    tr._parsed = tr.voices.map(v => v.bars.map(parseBar));
    tr._drums = (tr.drums || []).map(s => s.trim().split(/\s+/));
  },

  _startDrone(tr) {
    const c = Snd.ctx;
    this.drone = [];
    if (!tr.drone || !tr.droneVol) return;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 420; f.Q.value = 0.4;
    const g = c.createGain(); g.gain.value = tr.droneVol;
    f.connect(g); g.connect(this.out);
    const lfo = c.createOscillator(); lfo.frequency.value = 0.09;
    const lg = c.createGain(); lg.gain.value = tr.droneVol * 0.35;
    lfo.connect(lg); lg.connect(g.gain); lfo.start(); this.drone.push(lfo);
    tr.drone.forEach(semi => {
      [-4, 4].forEach(cents => {
        const o = c.createOscillator(); o.type = "sawtooth";
        o.frequency.value = this._hz(tr.root + semi); o.detune.value = cents;
        o.connect(f); o.start(); this.drone.push(o);
      });
    });
  },

  _hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); },

  _schedule() {
    const c = Snd.ctx, tr = this.track;
    if (!c || c.state !== "running" || !tr || !this.out) return;
    if (this.nextTime < c.currentTime - 0.2) this.nextTime = c.currentTime + 0.05;   // woke from a hidden tab
    while (this.nextTime < c.currentTime + 0.28) {
      this._step(tr, this.stepIndex, this.nextTime);
      this.nextTime += tr.step;
      this.stepIndex++;
    }
  },

  _step(tr, idx, t) {
    const steps = tr.steps, bar = Math.floor(idx / steps), pos = idx % steps;
    const scale = SCALES[tr.scale];
    tr.voices.forEach((v, vi) => {
      const bars = tr._parsed[vi];
      const n = bars[bar % bars.length][pos];
      if (!n) return;
      const d = n.deg - 1;
      const midi = tr.root + 12 * ((v.oct || 0) + n.oct + Math.floor(d / 7)) + scale[d % 7];
      const vol = v.vol * (0.82 + Math.random() * 0.3) * (pos === 0 ? 1.12 : 1);
      const jitter = Math.random() * 0.012;
      if (v.inst === "flute") this._flute(midi, t + jitter, n.len * tr.step, vol);
      else this._pluck(midi, t + jitter, vol);
    });
    if (tr._drums.length) {
      const tok = tr._drums[bar % tr._drums.length][pos];
      if (tok && tok !== ".") this._drum(tok, t, tr.drumVol);
    }
  },

  // Karplus-Strong plucked string, rendered once per pitch and cached.
  _pluckBuf(midi) {
    if (this.cache[midi]) return this.cache[midi];
    const c = Snd.ctx, sr = c.sampleRate, freq = this._hz(midi);
    const n = Math.floor(sr * 1.7), N = Math.max(2, Math.round(sr / freq));
    const buf = c.createBuffer(1, n, sr), out = buf.getChannelData(0);
    const ring = new Float32Array(N);
    let prev = 0, mean = 0;
    for (let i = 0; i < N; i++) { prev += ((Math.random() * 2 - 1) - prev) * 0.62; ring[i] = prev; mean += prev; }
    mean /= N;
    for (let i = 0; i < N; i++) ring[i] -= mean;
    let idx = 0, peak = 0;
    for (let i = 0; i < n; i++) {
      const a = ring[idx], b = ring[(idx + 1) % N];
      out[i] = a;
      ring[idx] = (a + b) * 0.5 * 0.9968;
      idx = (idx + 1) % N;
      if (Math.abs(a) > peak) peak = Math.abs(a);
    }
    const k = peak > 0 ? 0.9 / peak : 1, fade = Math.floor(sr * 0.05);
    for (let i = 0; i < n; i++) out[i] *= k * (i > n - fade ? (n - i) / fade : 1);
    return (this.cache[midi] = { buf, rate: freq / (sr / (N + 0.5)) });
  },
  _pluck(midi, t, vol) {
    const c = Snd.ctx, p = this._pluckBuf(midi);
    const src = c.createBufferSource(); src.buffer = p.buf; src.playbackRate.value = p.rate;
    const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 3400; f.Q.value = 0.3;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.out);
    src.start(t);
  },
  _flute(midi, t, dur, vol) {
    const c = Snd.ctx, f = this._hz(midi), end = t + Math.max(0.18, dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.07);
    g.gain.setValueAtTime(vol, Math.max(t + 0.08, end - 0.1));
    g.gain.linearRampToValueAtTime(0.0001, end + 0.06);
    g.connect(this.out);
    const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
    const o2 = c.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 2;
    const g2 = c.createGain(); g2.gain.value = 0.16;
    const vib = c.createOscillator(); vib.frequency.value = 5.1;
    const vg = c.createGain();
    vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(0.5, dur));
    vib.connect(vg); vg.connect(o1.frequency);
    o1.connect(g); o2.connect(g2); g2.connect(g);
    const ns = c.createBufferSource(); ns.buffer = Snd.noiseBuf; ns.loop = true;
    const bf = c.createBiquadFilter(); bf.type = "bandpass"; bf.frequency.value = f * 2.1; bf.Q.value = 1.6;
    const ng = c.createGain(); ng.gain.value = 0.22;
    ns.connect(bf); bf.connect(ng); ng.connect(g);
    [o1, o2, vib].forEach(o => { o.start(t); o.stop(end + 0.1); });
    ns.start(t, Math.random()); ns.stop(end + 0.1);
  },
  _drum(tok, t, vol) {
    const c = Snd.ctx;
    if (tok === "D") {
      const o = c.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(135, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.14);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.42 * vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 0.33);
    } else {
      const soft = tok === "t";
      const s = c.createBufferSource(); s.buffer = Snd.noiseBuf;
      const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = soft ? 2900 : 2100; f.Q.value = 1.1;
      const g = c.createGain(), peak = (soft ? 0.1 : 0.2) * vol;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (soft ? 0.05 : 0.09));
      s.connect(f); f.connect(g); g.connect(this.out);
      s.start(t, Math.random() * 1.5); s.stop(t + 0.12);
    }
  }
};

// Unlock on the first gesture; go quiet while the tab is hidden.
(function () {
  const first = () => Snd.unlock();
  ["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, first, { passive: true }));
  document.addEventListener("visibilitychange", () => {
    if (!Snd.ctx) return;
    if (document.hidden) { Snd.ctx.suspend().catch(() => {}); }
    else { Snd.ctx.resume().then(() => { Music.kick(); Snd._startAmb(); }).catch(() => {}); }
  });
})();
