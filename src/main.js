// ============================================================
// main.js — creates the Phaser game. TitleScene boots first;
// every other scene is reached through GameFlow (see data.js).
// ============================================================

window.addEventListener("load", () => {
  const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 960,
    height: 540,
    backgroundColor: "#0a0812",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [
      TitleScene,
      HallOfSkullsScene,
      VillagePalaceScene,
      CarpetScene,
      TownScene,
      BakeryGameScene,
      SaddlerGameScene,
      KitchenGameScene,
      DuelScene,
      EndingScene
    ]
  };
  window.game = new Phaser.Game(config);
});
