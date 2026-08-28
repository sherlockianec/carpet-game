// ============================================================
// draw.js — every visual in this game is built from simple
// shapes (Graphics + Container). No image assets required.
// ============================================================

function drawSky(scene, topColor, botColor) {
  const W = scene.scale.width, H = scene.scale.height;
  const g = scene.add.graphics();
  g.fillGradientStyle(topColor, topColor, botColor, botColor, 1);
  g.fillRect(0, 0, W, H);
  return g;
}

function drawGround(scene, color, h) {
  const W = scene.scale.width, H = scene.scale.height;
  return scene.add.rectangle(W / 2, H - h / 2, W, h, color);
}

function drawClueHUD(scene) {
  const items = [
    { key: "swatch", color: 0xc9a24b },
    { key: "phrase", color: 0x2fb8ac },
    { key: "caseObtained", color: 0x8a5a34 }
  ];
  let x = 16;
  items.forEach(it => {
    if (GameState.clues[it.key]) {
      scene.add.circle(x, scene.scale.height - 14, 7, it.color).setScrollFactor(0).setDepth(900);
      x += 20;
    }
  });
}

function makeClickable(container, w, h, cb) {
  container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
  container.on("pointerdown", cb);
  return container;
}

function makePerson(scene, x, y, robeColor, headColor, scale) {
  scale = scale || 1;
  const g = scene.add.graphics();
  g.fillStyle(robeColor, 1);
  g.fillTriangle(0, -30, 16, 20, -16, 20);
  g.fillStyle(headColor, 1);
  g.fillCircle(0, -34, 9);
  const c = scene.add.container(x, y, [g]);
  c.setScale(scale);
  return c;
}

function makeCarpet(scene, x, y, scale) {
  scale = scale || 1;
  const g = scene.add.graphics();
  g.fillStyle(0x8e2f2f, 1);
  g.fillRoundedRect(-30, -8, 60, 16, 4);
  g.fillStyle(0xd9a441, 1);
  g.fillRect(-30, -8, 60, 3);
  g.fillRect(-30, 5, 60, 3);
  g.fillStyle(0x241f1a, 1);
  g.fillTriangle(-12, -2, 4, -2, -4, -11);
  g.fillCircle(-4, -11, 5);
  const c = scene.add.container(x, y, [g]);
  c.setScale(scale);
  return c;
}

function makeDome(scene, x, y, r, color, accent) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(-r * 0.55, 0, r * 1.1, r * 0.85);
  g.fillEllipse(0, 0, r * 1.5, r * 1.05);
  g.fillStyle(accent || 0xd9a441, 1);
  g.fillCircle(0, -r * 0.55, 4);
  return scene.add.container(x, y, [g]);
}

function makeMinaret(scene, x, y, h, color, accent) {
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  g.fillRect(-8, -h, 16, h);
  g.fillStyle(accent || 0xd9a441, 1);
  g.fillRect(-9, -h * 0.35, 18, 5);
  g.fillStyle(color, 1);
  g.fillEllipse(0, -h, 20, 12);
  return scene.add.container(x, y, [g]);
}

function makeGrave(scene, x, y) {
  const g = scene.add.graphics();
  g.fillStyle(0x585047, 1);
  g.fillRoundedRect(-12, -24, 24, 24, 6);
  g.fillStyle(0x3a352c, 1);
  g.fillRect(-12, -2, 24, 3);
  return scene.add.container(x, y, [g]);
}

function makeSkull(scene, x, y) {
  const g = scene.add.graphics();
  g.fillStyle(0xdedad0, 1);
  g.fillEllipse(0, 0, 20, 16);
  g.fillStyle(0x2a2a33, 1);
  g.fillCircle(-5, -1, 3);
  g.fillCircle(5, -1, 3);
  g.fillRect(-6, 6, 12, 5);
  return scene.add.container(x, y, [g]);
}

// A wide silhouette strip of domes/minarets, drawn twice back to
// back so it can be scrolled seamlessly by shifting the container
// left by exactly one screen-width and wrapping.
function makeSkylineLayer(scene, color, baseY, minH, maxH, minW, maxW, density) {
  const W = scene.scale.width, H = scene.scale.height;
  const shapes = [];
  let x = 0;
  while (x < W) {
    const w = Phaser.Math.Between(minW, maxW);
    const h = Phaser.Math.Between(minH, maxH);
    shapes.push({ x: x, w: w, h: h, dome: Math.random() < 0.5 });
    x += w + Phaser.Math.Between(20, 70) / density;
  }
  const g = scene.add.graphics();
  g.fillStyle(color, 1);
  const drawSet = (offsetX) => {
    shapes.forEach(s => {
      if (s.dome) {
        g.fillRect(offsetX + s.x, H - baseY, s.w, baseY);
        g.fillEllipse(offsetX + s.x + s.w / 2, H - baseY, s.w, s.w * 0.6);
        g.fillCircle(offsetX + s.x + s.w / 2, H - baseY - s.w * 0.4, 3);
      } else {
        g.fillRect(offsetX + s.x + s.w * 0.3, H - baseY - s.h, s.w * 0.4, baseY + s.h);
        g.fillTriangle(offsetX + s.x + s.w * 0.05, H - baseY - s.h, offsetX + s.x + s.w * 0.75, H - baseY - s.h, offsetX + s.x + s.w * 0.4, H - baseY - s.h - 16);
      }
    });
  };
  drawSet(0);
  drawSet(W);
  return scene.add.container(0, 0, [g]);
}
