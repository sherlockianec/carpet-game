// ============================================================
// main.js — boots the game once the fonts are ready (so no text
// is ever drawn in a fallback font), then shows the title.
// ============================================================

function bootGame() {
  Save.load();
  Snd.sfxOn = Save.data.sfx !== false;
  Snd.musicOn = Save.data.music !== false;
  if (Dev.params.mute) { Snd.sfxOn = false; Snd.musicOn = false; }

  const scenes = [TitleScene, PauseScene, HallOfSkullsScene, VillagePalaceScene, CarpetScene, TownScene,
    BakeryGameScene, SaddlerGameScene, KitchenGameScene, DuelScene, EndingScene, BootRouter];

  window.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: W, height: H,
    backgroundColor: "#0b0a1a",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, roundPixels: false, powerPreference: "high-performance" },
    input: { activePointers: 3 },
    fps: { target: 60, forceSetTimeOut: !!Dev.params.timer },   // ?timer=1: keep running in a background tab (testing)
    scene: [BootRouter].concat(scenes.filter(s => s !== BootRouter))
  });
}

// First scene: decides where to go (title, or a test jump from the URL).
class BootRouter extends Phaser.Scene {
  constructor() { super("BootRouter"); }
  create() {
    const boot = document.getElementById("boot");
    if (boot) { boot.classList.add("gone"); setTimeout(() => boot.remove(), 600); }
    const p = Dev.params;
    if (p.step !== undefined) {
      GameState.reset();
      ["swatch", "phrase", "caseObtained"].forEach(k => { if (p[k]) GameState.clues[k] = true; });
      GameFlow.jump(this, parseInt(p.step, 10) || 0, parseInt(p.sub || "0", 10));
      return;
    }
    if (p.scene) {
      const data = {};
      Object.keys(p).forEach(k => { if (k !== "scene") data[k] = isNaN(+p[k]) ? p[k] : +p[k]; });
      this.scene.start(p.scene, data);
      return;
    }
    this.scene.start("TitleScene");
  }
}

window.addEventListener("load", () => {
  let started = false;
  const go = () => { if (!started) { started = true; bootGame(); } };
  try {
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('700 40px "El Messiri"'), document.fonts.load('600 40px "El Messiri"'),
        document.fonts.load('400 40px Alegreya'), document.fonts.load('italic 400 40px Alegreya'), document.fonts.load('700 40px Alegreya')
      ]).then(go, go);
      setTimeout(go, 2500);            // offline: don't wait forever
    } else go();
  } catch (e) { go(); }
});
