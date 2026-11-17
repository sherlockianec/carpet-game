// ============================================================
// art-people.js — every character in the game.
//
// A person is described by a small config object (robe colour,
// headwear, beard, mood, what they carry...). From that we paint
// one little atlas of body parts and assemble an animated rig:
// they breathe, blink, swing their arms when they walk and nod
// when they talk. The same painters also produce the round
// portraits shown beside dialogue.
//
// Drawing units: feet on y = 0, an adult is about 150 tall.
// ============================================================

const PERSON_DEFAULTS = {
  skin: 0xdcb98a, hair: 0x2a1c14,
  body: "robe",            // robe | dress | apron | armor | royal | rags | cloak
  robe: 0x3a6a6a, robe2: null, trim: 0xd9a441, sash: null, shirt: 0xf2e6cc, vest: null,
  pattern: "plain",        // plain | stripes | ikat | dots
  head: "none",            // none | doppi | turban | kalpak | crown | jewel | helmet | scarf | hood | cap | wrap | braids
  headColor: null,
  beard: null,             // null | mustache | goatee | full | long
  beardColor: null,
  mood: "neutral",         // neutral | kind | stern | grim | worried | sad
  holding: "none",         // none | staff | spear | sword | basket | jug | lantern | peel | ladle
  shield: false, female: false, child: false, elder: false,
  boots: 0x3a2618, scale: 1, build: 1
};

function personCfg(o) {
  const c = Object.assign({}, PERSON_DEFAULTS, o || {});
  if (o && o.headwear && !o.head) c.head = o.headwear === "minister" ? "jewel" : o.headwear;
  if (c.beard === true) c.beard = "goatee";
  if (c.robe2 == null) c.robe2 = darken(c.robe, 0.28);
  if (c.sash == null) c.sash = c.trim;
  if (c.beardColor == null) c.beardColor = c.elder ? 0xe6e1d6 : c.hair;
  if (c.headColor == null) c.headColor = c.head === "scarf" ? c.trim : (c.head === "hood" ? darken(c.robe, 0.15) : 0xf2ecdc);
  if (c.child) c.scale = (o && o.scale) || 0.76;
  return c;
}
function personKey(c) { return "p_" + hashSeed(JSON.stringify(c)).toString(36); }
function OL(c) { return mixC(darken(c, 0.55), PAL.ink, 0.3); }
function patS(ctx, tile, s) {
  const p = ctx.createPattern(tile, "repeat");
  if (p.setTransform && s !== 1) p.setTransform(new DOMMatrix().scale(s));
  return p;
}
function clothFill(ctx, c, y0, y1) {
  if (c.pattern === "ikat") return patS(ctx, tileIkat([c.robe, c.robe2, c.trim, c.shirt], "p"), 0.42);
  if (c.pattern === "stripes") return patS(ctx, tileStripes([c.robe, c.robe2, c.robe, c.trim], [9, 5, 9, 2]), 0.8);
  if (c.pattern === "dots") return patS(ctx, tileDots(c.robe, c.robe2, 16), 0.9);
  return gradV(ctx, y0, y1, [[0, lighten(c.robe, 0.1)], [1, darken(c.robe, 0.12)]]);
}

// ---------- body (origin: centre of the hem) ----------

function paintPersonBody(ctx, c) {
  const b = c.build, top = -72;
  const sw = (c.body === "dress" ? 20.5 : 22.5) * b;
  const hw = (c.body === "dress" ? 33 : c.body === "armor" ? 27 : 30) * b;
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-sw + 7, top);
    ctx.quadraticCurveTo(-sw - 1, top + 1, -sw - 1.5, top + 13);
    ctx.bezierCurveTo(-sw - 2, top + 36, -hw, -32, -hw, -3);
    ctx.quadraticCurveTo(0, 5, hw, -3);
    ctx.bezierCurveTo(hw, -32, sw + 2, top + 36, sw + 1.5, top + 13);
    ctx.quadraticCurveTo(sw + 1, top + 1, sw - 7, top);
    ctx.closePath();
  };

  if (c.body === "royal" || c.body === "cloak") {      // cape behind the figure
    const capeC = c.body === "royal" ? darken(c.trim, 0.5) : darken(c.robe, 0.3);
    ctx.beginPath();
    ctx.moveTo(-sw - 3, top + 4);
    ctx.bezierCurveTo(-hw - 15, -44, -hw - 13, -12, -hw - 9, 1);
    ctx.lineTo(hw + 9, 1);
    ctx.bezierCurveTo(hw + 13, -12, hw + 15, -44, sw + 3, top + 4);
    ctx.closePath();
    ctx.fillStyle = gradV(ctx, top, 0, [[0, lighten(capeC, 0.08)], [1, darken(capeC, 0.25)]]); ctx.fill();
    strokeC(ctx, OL(capeC), 2.2); ctx.stroke();
  }

  shape();
  ctx.fillStyle = clothFill(ctx, c, top, 0);
  ctx.fill();

  ctx.save();
  shape(); ctx.clip();
  const X = -hw - 6, WW = hw * 2 + 12;

  if (c.body === "robe" || c.body === "apron" || c.body === "rags" || c.body === "cloak") {
    if (c.body !== "cloak") {
      // the shirt showing in the V of the chapan, then the lapels
      ctx.beginPath(); ctx.moveTo(-9, top - 2); ctx.lineTo(9, top - 2); ctx.lineTo(0.5, top + 25); ctx.closePath();
      fillC(ctx, c.shirt); ctx.fill();
      strokeC(ctx, 0x000000, 1, 0.18); ctx.beginPath(); ctx.moveTo(0.5, top + 2); ctx.lineTo(0.5, top + 22); ctx.stroke();
      const tr = c.body === "rags" ? darken(c.robe, 0.2) : c.trim;
      strokeC(ctx, tr, 5.4);
      ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(-10.5, top - 3); ctx.lineTo(0.5, top + 26); ctx.lineTo(0.5, 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10.5, top - 3); ctx.lineTo(0.5, top + 26); ctx.stroke();
      strokeC(ctx, darken(tr, 0.4), 1, 0.7);
      ctx.beginPath(); ctx.moveTo(3.4, top + 26); ctx.lineTo(3.4, 6); ctx.stroke();
    } else {
      // a traveller's cloak: one long diagonal overlap and a clasp
      strokeC(ctx, darken(c.robe, 0.4), 2.2, 0.8);
      ctx.beginPath(); ctx.moveTo(-7, top); ctx.quadraticCurveTo(-2, -30, 9, 2); ctx.stroke();
      fillC(ctx, lighten(c.robe, 0.08), 0.6);
      ctx.beginPath(); ctx.moveTo(-7, top); ctx.quadraticCurveTo(-2, -30, 9, 2); ctx.lineTo(hw + 4, 2); ctx.lineTo(sw, top); ctx.closePath(); ctx.fill();
    }
    if (c.body === "rags") {
      const r = rng("rags" + c.robe);
      for (let i = 0; i < 4; i++) {
        const px = r.range(-hw + 6, hw - 16), py = r.range(-34, -12), pw = r.range(9, 15), ph = r.range(8, 13);
        fillC(ctx, mixC(c.robe, r.pick([0x8a7a5a, 0x5a4a3a, 0x9a8a7a]), 0.6)); ctx.fillRect(px, py, pw, ph);
        strokeC(ctx, 0x2a1c14, 1, 0.6); ctx.setLineDash([2, 2]); ctx.strokeRect(px, py, pw, ph); ctx.setLineDash([]);
      }
      strokeC(ctx, 0x6a5234, 3); ctx.beginPath(); ctx.moveTo(-hw, -38); ctx.quadraticCurveTo(0, -34, hw, -39); ctx.stroke();
    } else if (c.body !== "cloak") {
      // sash with a knot
      fillC(ctx, c.sash); ctx.fillRect(X, -42, WW, 8.5);
      fillC(ctx, 0x000000, 0.18); ctx.fillRect(X, -35, WW, 1.6);
      fillC(ctx, 0xffffff, 0.2); ctx.fillRect(X, -42, WW, 1.6);
      fillC(ctx, darken(c.sash, 0.12));
      pRR(ctx, -13.5, -43.5, 9, 11, 2.5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-13, -33); ctx.lineTo(-16, -19); ctx.lineTo(-11, -21); ctx.lineTo(-9.5, -33); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-8.5, -33); ctx.lineTo(-7, -22); ctx.lineTo(-3.5, -24); ctx.lineTo(-5, -33); ctx.closePath(); ctx.fill();
    }
    if (c.body === "apron") {
      pRR(ctx, -17, -47, 34, 45, 7);
      ctx.fillStyle = gradV(ctx, -47, 0, [[0, 0xfbf6ea], [1, 0xe2d8c2]]); ctx.fill();
      strokeC(ctx, 0x8a7a62, 1.4, 0.8); ctx.stroke();
      pRR(ctx, -11, -66, 22, 23, 4); fillC(ctx, 0xf6efe0); ctx.fill(); ctx.stroke();
      strokeC(ctx, 0xf6efe0, 3); ctx.beginPath(); ctx.moveTo(-17, -44); ctx.lineTo(-hw - 2, -42); ctx.moveTo(17, -44); ctx.lineTo(hw + 2, -42); ctx.stroke();
      strokeC(ctx, 0x8a7a62, 1.2, 0.6); pRR(ctx, -8, -28, 16, 12, 2); ctx.stroke();
      softEllipse(ctx, 6, -18, 9, 6, 0xc9a24b, 0.25);        // a dusting of flour and crust
    }
    // hem band
    strokeC(ctx, c.body === "rags" ? darken(c.robe, 0.25) : c.trim, 4.2);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -5.5); ctx.quadraticCurveTo(0, 2.5, hw + 2, -5.5); ctx.stroke();
  } else if (c.body === "dress") {
    // round neckline, necklace, optional sleeveless vest
    pEll(ctx, 0, top, 9.5, 7.5); fillC(ctx, c.skin); ctx.fill();
    strokeC(ctx, c.trim, 2.6); ctx.beginPath(); ctx.arc(0, top, 10.5, 0.1, Math.PI - 0.1); ctx.stroke();
    if (c.vest != null) {
      fillC(ctx, c.vest);
      ctx.beginPath(); ctx.moveTo(-sw - 4, top - 2); ctx.lineTo(-7, top - 2); ctx.quadraticCurveTo(-3, -52, -5.5, -36); ctx.lineTo(-hw - 4, -36); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sw + 4, top - 2); ctx.lineTo(7, top - 2); ctx.quadraticCurveTo(3, -52, 5.5, -36); ctx.lineTo(hw + 4, -36); ctx.closePath(); ctx.fill();
      strokeC(ctx, c.trim, 1.8);
      ctx.beginPath(); ctx.moveTo(-7, top - 2); ctx.quadraticCurveTo(-3, -52, -5.5, -36); ctx.lineTo(-hw - 4, -36); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, top - 2); ctx.quadraticCurveTo(3, -52, 5.5, -36); ctx.lineTo(hw + 4, -36); ctx.stroke();
    }
    fillC(ctx, PAL.goldLight);
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 3.1, top + 12.5 - Math.abs(i) * 1.1, 1.5, 0, Math.PI * 2); ctx.fill(); }
    strokeC(ctx, c.trim, 3.2);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -5.5); ctx.quadraticCurveTo(0, 2.5, hw + 2, -5.5); ctx.stroke();
    strokeC(ctx, c.shirt, 1.6, 0.9);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -10.5); ctx.quadraticCurveTo(0, -2.5, hw + 2, -10.5); ctx.stroke();
  } else if (c.body === "armor") {
    // lamellar cuirass over a tunic, belt, split skirt
    ctx.fillStyle = patS(ctx, tileScales(c.trim === PAL.gold ? 0xa9b1ba : 0x9aa3ad, 0x2e333c), 1);
    ctx.fillRect(X, top - 2, WW, 43);
    fillC(ctx, 0x000000, 0.2); ctx.fillRect(X, top + 37, WW, 4);
    fillC(ctx, 0x3a281a); ctx.fillRect(X, -33, WW, 8);
    fillC(ctx, c.trim); pRR(ctx, -5, -34.5, 10, 11, 2); ctx.fill();
    fillC(ctx, darken(c.trim, 0.45)); ctx.fillRect(-2, -31.5, 4, 5);
    strokeC(ctx, 0x000000, 1.6, 0.3); ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 2); ctx.stroke();
    strokeC(ctx, c.trim, 3.4);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -5.5); ctx.quadraticCurveTo(0, 2.5, hw + 2, -5.5); ctx.stroke();
    fillC(ctx, darken(c.robe, 0.2)); pRR(ctx, -9, top - 4, 18, 9, 3); ctx.fill();
  } else if (c.body === "royal") {
    // jewelled placket, belt and hem
    fillC(ctx, c.trim); ctx.fillRect(-7, top - 2, 14, 80);
    fillC(ctx, 0xffffff, 0.25); ctx.fillRect(-7, top - 2, 3, 80);
    for (let y = top + 16, i = 0; y < -4; y += 11, i++) {
      if (y > -48 && y < -32) continue;
      fillC(ctx, i % 2 ? 0x2fb8ac : 0xb2283a); pStar(ctx, 0, y, 4, 4.2, 2.6, 0); ctx.fill();
    }
    fillC(ctx, darken(c.trim, 0.2)); ctx.fillRect(X, -44, WW, 10);
    fillC(ctx, c.trim); ctx.fillRect(X, -43, WW, 8);
    fillC(ctx, 0xb2283a); pEll(ctx, 0, -39, 5, 4.5); ctx.fill();
    strokeC(ctx, PAL.goldLight, 1.4); ctx.stroke();
    fillC(ctx, 0x2fb8ac); [-15, 15].forEach(x => { pEll(ctx, x * b, -39, 2.6, 2.6); ctx.fill(); });
    strokeC(ctx, c.trim, 7.5);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -6.5); ctx.quadraticCurveTo(0, 1.5, hw + 2, -6.5); ctx.stroke();
    strokeC(ctx, PAL.goldLight, 1.2, 0.9);
    ctx.beginPath(); ctx.moveTo(-hw - 2, -10.5); ctx.quadraticCurveTo(0, -2.5, hw + 2, -10.5); ctx.stroke();
  }

  // light from the upper left, shade to the right and toward the hem
  ctx.fillStyle = gradH(ctx, -hw, hw, [[0, 0xffffff, 0.16], [0.36, 0xffffff, 0], [0.58, 0x000000, 0], [1, 0x000000, 0.3]]);
  ctx.fillRect(X, top - 4, WW, 84);
  ctx.fillStyle = gradV(ctx, -24, 4, [[0, 0x000000, 0], [1, 0x000000, 0.22]]);
  ctx.fillRect(X, -24, WW, 30);
  strokeC(ctx, 0x000000, 1.7, 0.15);
  ctx.beginPath(); ctx.moveTo(-13 * b, -30); ctx.quadraticCurveTo(-15 * b, -18, -17 * b, -5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(13 * b, -30); ctx.quadraticCurveTo(14 * b, -18, 17 * b, -5); ctx.stroke();
  softEllipse(ctx, 0, top + 1, 23, 12, 0x000000, 0.34);      // shadow cast by the head
  ctx.restore();

  if (c.body === "rags") {                                      // nibble a ragged hem
    ctx.save(); ctx.globalCompositeOperation = "destination-out";
    const r = rng("hem" + c.robe);
    for (let x = -hw - 2; x < hw + 2; x += 7) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x + 3.5, -r.range(1, 7)); ctx.lineTo(x + 7, 6); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  shape(); strokeC(ctx, OL(c.robe), 2.4); ctx.lineJoin = "round"; ctx.stroke();

  if (c.body === "armor") {                                     // pauldrons sit on top of the outline
    [-1, 1].forEach(s => {
      pEll(ctx, s * (sw - 1), top + 7, 10, 7.5);
      ctx.fillStyle = gradV(ctx, top, top + 14, [[0, 0xd3d9df], [1, 0x7b838d]]); ctx.fill();
      strokeC(ctx, 0x2e333c, 1.8); ctx.stroke();
    });
  }
  if (c.body === "royal") {                                     // ermine collar
    for (let i = -3; i <= 3; i++) {
      const x = i * (sw / 3.1), y = top + 3 + Math.abs(i) * 1.6;
      pEll(ctx, x, y, 6.6, 6); fillC(ctx, 0xf3ecdd); ctx.fill();
      strokeC(ctx, 0xa89a84, 1, 0.7); ctx.stroke();
      fillC(ctx, 0x2a1c14); ctx.fillRect(x - 0.8, y + 0.5, 1.6, 3.4);
    }
  }
  if (c.body === "cloak") { fillC(ctx, PAL.gold); pEll(ctx, -4, top + 4, 3.4, 3.4); ctx.fill(); strokeC(ctx, PAL.goldDark, 1); ctx.stroke(); }
}

// ---------- arms (origin: the shoulder). side: -1 left, +1 right ----------

function paintPersonArm(ctx, c, side) {
  const len = c.body === "apron" ? 28 : 44;
  const sleeve = c.body === "apron" ? c.shirt : c.robe;
  const item = side > 0 ? c.holding : (c.shield ? "shield" : "none");
  const hx = 0.5 * side, hy = 47;

  // things held behind the hand
  if (item === "staff" || item === "spear" || item === "peel") {
    const topY = item === "spear" ? -112 : (item === "peel" ? -64 : -58);
    ctx.lineCap = "round";
    strokeC(ctx, 0x3a2414, 6.4); ctx.beginPath(); ctx.moveTo(hx + 1, topY); ctx.lineTo(hx + 1, 77); ctx.stroke();
    strokeC(ctx, item === "spear" ? 0x7a5632 : 0x8a6238, 4); ctx.beginPath(); ctx.moveTo(hx + 1, topY); ctx.lineTo(hx + 1, 77); ctx.stroke();
    strokeC(ctx, 0xffffff, 1.2, 0.3); ctx.beginPath(); ctx.moveTo(hx, topY + 4); ctx.lineTo(hx, 72); ctx.stroke();
    if (item === "spear") {
      ctx.beginPath(); ctx.moveTo(hx + 1, topY - 26); ctx.quadraticCurveTo(hx + 9, topY - 8, hx + 1, topY + 3); ctx.quadraticCurveTo(hx - 7, topY - 8, hx + 1, topY - 26); ctx.closePath();
      ctx.fillStyle = gradH(ctx, hx - 6, hx + 8, [[0, 0xeef2f6], [0.5, 0xb9c2cb], [1, 0x7b848e]]); ctx.fill();
      strokeC(ctx, 0x2e333c, 1.6); ctx.stroke();
      fillC(ctx, 0xa12a2a); ctx.beginPath(); ctx.moveTo(hx - 3, topY + 3); ctx.lineTo(hx + 5, topY + 3); ctx.lineTo(hx + 7, topY + 17); ctx.lineTo(hx + 1, topY + 12); ctx.lineTo(hx - 5, topY + 17); ctx.closePath(); ctx.fill();
    } else if (item === "staff") {
      strokeC(ctx, 0x3a2414, 6.4); ctx.beginPath(); ctx.arc(hx + 7, topY, 6, Math.PI, Math.PI * 2.35); ctx.stroke();
      strokeC(ctx, 0x8a6238, 4); ctx.beginPath(); ctx.arc(hx + 7, topY, 6, Math.PI, Math.PI * 2.35); ctx.stroke();
    } else {
      pEll(ctx, hx + 1, topY - 9, 15, 11); fillC(ctx, 0xb98a55); ctx.fill(); strokeC(ctx, 0x3a2414, 2); ctx.stroke();
      pEll(ctx, hx + 1, topY - 11, 10.5, 7); fillC(ctx, 0xd9a441); ctx.fill(); strokeC(ctx, 0x7a4a1a, 1.4); ctx.stroke();
    }
  }

  // sleeve
  pRR(ctx, -7.6, -5, 15.2, len + 6, 7.6);
  ctx.fillStyle = c.body === "apron" ? gradV(ctx, -5, len, [[0, lighten(sleeve, 0.05)], [1, darken(sleeve, 0.1)]]) : clothFill(ctx, c, -5, len);
  ctx.fill();
  ctx.save(); pRR(ctx, -7.6, -5, 15.2, len + 6, 7.6); ctx.clip();
  ctx.fillStyle = gradH(ctx, -8, 8, side < 0 ? [[0, 0xffffff, 0.18], [0.6, 0x000000, 0], [1, 0x000000, 0.12]] : [[0, 0x000000, 0.05], [0.45, 0x000000, 0], [1, 0x000000, 0.3]]);
  ctx.fillRect(-9, -6, 18, len + 8);
  if (c.body !== "apron" && c.body !== "rags") { fillC(ctx, c.trim); ctx.fillRect(-9, len - 5, 18, 6.5); }
  if (c.body === "armor") {
    ctx.fillStyle = gradH(ctx, -8, 8, [[0, 0xd3d9df], [1, 0x7b838d]]); ctx.fillRect(-9, len - 19, 18, 14);
    strokeC(ctx, 0x2e333c, 1.2, 0.8); ctx.strokeRect(-9, len - 19, 18, 14);
  }
  ctx.restore();
  pRR(ctx, -7.6, -5, 15.2, len + 6, 7.6); strokeC(ctx, OL(sleeve), 2.2); ctx.stroke();
  if (len < 44) {                                  // rolled sleeves: bare forearm
    pRR(ctx, -5.6, len - 3, 11.2, 44 - len + 6, 5.6);
    fillC(ctx, c.skin); ctx.fill(); strokeC(ctx, OL(c.skin), 1.8); ctx.stroke();
  }

  // hand
  pEll(ctx, hx, hy, 6.9, 7.2);
  ctx.fillStyle = gradR(ctx, hx - 2, hy - 2, 1, 8, [[0, lighten(c.skin, 0.1)], [1, c.skin]]); ctx.fill();
  strokeC(ctx, OL(c.skin), 2); ctx.stroke();

  // things held in front of / below the hand
  if (item === "sword") {
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.24 * side); ctx.scale(side, 1);
    ctx.beginPath(); ctx.moveTo(-2.8, 5); ctx.quadraticCurveTo(-5, 32, -0.5, 52); ctx.quadraticCurveTo(2.5, 60, 6.5, 63);
    ctx.quadraticCurveTo(5.5, 46, 4, 30); ctx.lineTo(2.8, 5); ctx.closePath();
    ctx.fillStyle = gradH(ctx, -5, 6, [[0, 0xf4f7fa], [0.5, 0xc3ccd5], [1, 0x8a939d]]); ctx.fill();
    strokeC(ctx, 0x2e333c, 1.5); ctx.stroke();
    pRR(ctx, -8, 1.5, 16, 4.6, 2); fillC(ctx, PAL.gold); ctx.fill(); strokeC(ctx, PAL.goldDark, 1.2); ctx.stroke();
    pRR(ctx, -2.4, -6, 4.8, 9, 2); fillC(ctx, 0x3a2414); ctx.fill();
    pEll(ctx, 0, -7, 3, 3); fillC(ctx, PAL.gold); ctx.fill();
    ctx.restore();
  } else if (item === "basket") {
    strokeC(ctx, 0x6b4a2e, 2.4); ctx.beginPath(); ctx.arc(hx, hy + 11, 11, Math.PI, 0); ctx.stroke();
    fillC(ctx, 0xd9a441); [-6, 0, 6].forEach(x => { pEll(ctx, hx + x, hy + 9, 5.4, 4.6); ctx.fill(); });
    fillC(ctx, 0xb2283a); pEll(ctx, hx + 3, hy + 7.5, 4.4, 4.2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - 14, hy + 10); ctx.lineTo(hx + 14, hy + 10); ctx.lineTo(hx + 10.5, hy + 28); ctx.lineTo(hx - 10.5, hy + 28); ctx.closePath();
    ctx.fillStyle = gradV(ctx, hy + 10, hy + 28, [[0, 0xc79a5c], [1, 0x8a6238]]); ctx.fill();
    strokeC(ctx, 0x3a2414, 1.8); ctx.stroke();
    strokeC(ctx, 0x6b4a2e, 1, 0.7);
    for (let y = hy + 14; y < hy + 28; y += 4.5) { ctx.beginPath(); ctx.moveTo(hx - 13, y); ctx.lineTo(hx + 13, y); ctx.stroke(); }
  } else if (item === "jug") {
    // a terracotta koza carried by the neck
    ctx.save(); ctx.translate(hx, hy + 44); ctx.scale(0.5, 0.5); paintJug(ctx, 0, 0, 1, "koza", "carry"); ctx.restore();
    pEll(ctx, hx, hy + 4, 6.9, 7.2); ctx.fillStyle = gradR(ctx, hx - 2, hy + 2, 1, 8, [[0, lighten(c.skin, 0.1)], [1, c.skin]]); ctx.fill(); strokeC(ctx, OL(c.skin), 2); ctx.stroke();
  } else if (item === "lantern") {
    strokeC(ctx, 0x2a2018, 1.6); ctx.beginPath(); ctx.moveTo(hx, hy + 5); ctx.lineTo(hx, hy + 14); ctx.stroke();
    glowDot(ctx, hx, hy + 24, 26, 0xffc860, 0.5);
    pRR(ctx, hx - 7, hy + 14, 14, 19, 3); fillC(ctx, 0x2a2018); ctx.fill();
    pRR(ctx, hx - 4.5, hy + 17, 9, 12, 2); ctx.fillStyle = gradV(ctx, hy + 17, hy + 29, [[0, 0xfff1b8], [1, 0xffb347]]); ctx.fill();
    fillC(ctx, 0x2a2018); ctx.beginPath(); ctx.moveTo(hx - 8, hy + 14); ctx.lineTo(hx, hy + 9); ctx.lineTo(hx + 8, hy + 14); ctx.closePath(); ctx.fill();
  } else if (item === "ladle") {
    ctx.lineCap = "round";
    strokeC(ctx, 0x3a2414, 5.5); ctx.beginPath(); ctx.moveTo(hx + 1, hy + 4); ctx.lineTo(hx + 4, -4); ctx.stroke();
    strokeC(ctx, 0x8a6238, 3.2); ctx.beginPath(); ctx.moveTo(hx + 1, hy + 4); ctx.lineTo(hx + 4, -4); ctx.stroke();
    pEll(ctx, hx + 5, -11, 9.5, 7); fillC(ctx, 0xb9c2cb); ctx.fill(); strokeC(ctx, 0x2e333c, 1.6); ctx.stroke();
    pEll(ctx, hx + 5, -12, 6.5, 4); fillC(ctx, 0xc9682a); ctx.fill();
  } else if (item === "shield") {
    pEll(ctx, hx - 2 * side, 26, 22, 23);
    ctx.fillStyle = gradR(ctx, hx - 7, 18, 2, 26, [[0, lighten(c.trim, 0.25)], [1, darken(c.robe, 0.1)]]); ctx.fill();
    strokeC(ctx, 0x2e333c, 2.4); ctx.stroke();
    pEll(ctx, hx - 2 * side, 26, 16.5, 17.5); strokeC(ctx, c.trim, 2.2); ctx.stroke();
    pEll(ctx, hx - 2 * side, 26, 6, 6.2); ctx.fillStyle = gradR(ctx, hx - 4, 24, 1, 7, [[0, 0xf4f7fa], [1, 0x8a939d]]); ctx.fill();
    strokeC(ctx, 0x2e333c, 1.4); ctx.stroke();
    fillC(ctx, c.trim);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.4; pEll(ctx, hx - 2 * side + Math.cos(a) * 12, 26 + Math.sin(a) * 12.6, 1.6, 1.6); ctx.fill(); }
  }
}

// ---------- head (origin: base of the neck) ----------

const HEAD_PTS = [[0, -58], [17, -55], [27, -41], [28.5, -26], [23, -11], [11, -2], [0, 0], [-11, -2], [-23, -11], [-28.5, -26], [-27, -41], [-17, -55]];

function paintPersonHead(ctx, c) {
  const s = 2.2;                       // features sit slightly toward the facing side
  const skinL = OL(c.skin), hair = c.hair, hw = c.head;
  const hairL = OL(hair);

  // ---- behind the head ----
  if (hw === "helmet") {               // mail aventail
    ctx.beginPath(); ctx.moveTo(-30, -40); ctx.lineTo(30, -40); ctx.lineTo(29, 6); ctx.quadraticCurveTo(0, 14, -29, 6); ctx.closePath();
    ctx.fillStyle = patS(ctx, tileScales(0x7f8892, 0x2e333c), 0.62); ctx.fill();
    strokeC(ctx, 0x2e333c, 2); ctx.stroke();
  } else if (hw === "scarf" || hw === "hood") {
    ctx.beginPath(); ctx.moveTo(-31, -30); ctx.lineTo(31, -30); ctx.quadraticCurveTo(37, -6, 30, 12); ctx.quadraticCurveTo(0, 20, -30, 12); ctx.quadraticCurveTo(-37, -6, -31, -30); ctx.closePath();
    fillC(ctx, darken(c.headColor, 0.22)); ctx.fill(); strokeC(ctx, OL(c.headColor), 2); ctx.stroke();
  } else if (hw === "braids" || (c.female && hw !== "scarf" && hw !== "hood")) {
    [-1, 1].forEach(sd => {
      for (let i = 0; i < 9; i++) {
        pEll(ctx, sd * (26 + Math.sin(i * 0.5) * 1.5), -16 + i * 6.4, 5.4, 5.2, sd * (i % 2 ? 0.5 : -0.5));
        fillC(ctx, i % 2 ? lighten(hair, 0.07) : hair); ctx.fill(); strokeC(ctx, hairL, 1.2); ctx.stroke();
      }
      fillC(ctx, c.trim); pEll(ctx, sd * 26.5, 43, 3.6, 3.2); ctx.fill();
    });
  } else if (hw === "turban" || hw === "jewel" || hw === "wrap") {
    ctx.beginPath(); ctx.moveTo(21, -44); ctx.quadraticCurveTo(38, -30, 31, -6); ctx.quadraticCurveTo(28, 2, 24, 4); ctx.quadraticCurveTo(27, -20, 16, -40); ctx.closePath();
    fillC(ctx, darken(c.headColor, 0.14)); ctx.fill(); strokeC(ctx, OL(c.headColor), 1.8); ctx.stroke();
  }

  // ---- neck, ears, head ----
  fillC(ctx, darken(c.skin, 0.16)); pRR(ctx, -7, -9, 14, 13, 3); ctx.fill();
  [-1, 1].forEach(sd => {
    pEll(ctx, sd * 28, -27, 5.6, 7); fillC(ctx, c.skin); ctx.fill(); strokeC(ctx, skinL, 2); ctx.stroke();
    pEll(ctx, sd * 28.4, -27, 2.4, 3.6); fillC(ctx, darken(c.skin, 0.2)); ctx.fill();
  });
  pSmooth(ctx, HEAD_PTS, true);
  ctx.fillStyle = gradR(ctx, -8, -40, 4, 46, [[0, lighten(c.skin, 0.14)], [0.7, c.skin], [1, darken(c.skin, 0.1)]]); ctx.fill();
  ctx.save(); pSmooth(ctx, HEAD_PTS, true); ctx.clip();
  ctx.fillStyle = gradH(ctx, 6, 30, [[0, 0x000000, 0], [1, 0x000000, 0.14]]); ctx.fillRect(6, -60, 26, 62);
  softEllipse(ctx, -15 + s, -17, 8, 5.5, 0xd9624a, c.child || c.female ? 0.36 : 0.22);
  softEllipse(ctx, 16 + s, -17, 8, 5.5, 0xd9624a, c.child || c.female ? 0.36 : 0.22);
  ctx.restore();
  pSmooth(ctx, HEAD_PTS, true); strokeC(ctx, skinL, 2.3); ctx.stroke();

  // ---- beard under the features ----
  const bc = c.beardColor, bl = OL(bc);
  if (c.beard === "full" || c.beard === "long") {
    const long = c.beard === "long";
    const pts = long
      ? [[-27.5, -31], [-27, -12], [-18, 8], [-8, 26], [0, 31], [8, 26], [18, 8], [27, -12], [27.5, -31], [20, -22], [10, -15.5], [s, -17.5], [-10 + s, -15.5], [-20, -22]]
      : [[-27.5, -31], [-26.5, -13], [-15, 4], [0, 9.5], [15, 4], [26.5, -13], [27.5, -31], [20, -22], [10, -15.5], [s, -17.5], [-10 + s, -15.5], [-20, -22]];
    pSmooth(ctx, pts, true);
    ctx.fillStyle = gradV(ctx, -30, long ? 30 : 10, [[0, lighten(bc, 0.06)], [1, darken(bc, 0.14)]]); ctx.fill();
    strokeC(ctx, bl, 2); ctx.stroke();
    strokeC(ctx, bl, 1.1, 0.4);
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * 5.4, -6); ctx.quadraticCurveTo(i * 4.6, long ? 10 : 2, i * 2.6, long ? 24 : 7); ctx.stroke();
    }
  } else if (c.beard === "goatee") {
    pSmooth(ctx, [[-7 + s, -6.5], [-4.5 + s, 4], [s, 9], [4.5 + s, 4], [7 + s, -6.5], [s, -8.5]], true);
    fillC(ctx, bc); ctx.fill(); strokeC(ctx, bl, 1.6); ctx.stroke();
  }

  // ---- eyes ----
  const ey = -29.5, ex = 10.6;
  const ery = c.child ? 6.6 : (c.elder ? 4.6 : 5.9);
  [-1, 1].forEach(sd => {
    const x = sd * ex + s;
    pEll(ctx, x, ey, 5.2, ery + 0.6); fillC(ctx, 0xfffaf0); ctx.fill();
    pEll(ctx, x + 0.5, ey + 0.5, 4, ery - 0.3); fillC(ctx, 0x2a1810); ctx.fill();
    pEll(ctx, x - 1.1, ey - 1.9, 1.5, 1.5); fillC(ctx, 0xffffff); ctx.fill();
    strokeC(ctx, 0x2a1810, 1.9); ctx.lineCap = "round";
    ctx.beginPath(); ctx.ellipse(x, ey, 5.6, ery + 1, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    if (c.female) {
      ctx.beginPath(); ctx.moveTo(x + sd * 5.2, ey - 2.4); ctx.lineTo(x + sd * 8.2, ey - 5); ctx.stroke();
    }
    if (c.elder) {
      strokeC(ctx, skinL, 1, 0.6);
      ctx.beginPath(); ctx.moveTo(x - 4, ey + 8); ctx.quadraticCurveTo(x, ey + 9.6, x + 4, ey + 8); ctx.stroke();
    }
  });

  // ---- brows ----
  const m = c.mood;
  let inn = 0, out = 0, arc = 1.2;
  if (m === "stern") { inn = 3.4; out = -1; arc = 0; }
  else if (m === "grim") { inn = 4.6; out = -1.4; arc = 0; }
  else if (m === "kind") { inn = -1.2; out = -0.6; arc = 2.4; }
  else if (m === "worried") { inn = -3.4; out = 1.6; arc = 0.6; }
  else if (m === "sad") { inn = -4.2; out = 2.2; arc = 0.4; }
  strokeC(ctx, c.elder ? mixC(bc, 0x8a8478, 0.3) : hair, c.elder ? 3.2 : 2.7); ctx.lineCap = "round";
  [-1, 1].forEach(sd => {
    const x = sd * ex + s, by = ey - (c.child ? 12 : 11);
    ctx.beginPath();
    ctx.moveTo(x + sd * 6.4, by + out);
    ctx.quadraticCurveTo(x + sd * 0.5, by - arc + (inn + out) * 0.4, x - sd * 5, by + inn);
    ctx.stroke();
  });

  // ---- nose ----
  strokeC(ctx, darken(c.skin, 0.34), 1.9);
  ctx.beginPath(); ctx.moveTo(s + 1.4, -25); ctx.quadraticCurveTo(s + 6.4, -19, s + 0.8, -17.6); ctx.stroke();

  // ---- mouth ----
  const my = -10.5;
  strokeC(ctx, c.beard === "full" || c.beard === "long" ? mixC(bl, 0x5a2018, 0.5) : 0x7a3226, 2.2);
  ctx.beginPath();
  if (m === "kind") { ctx.moveTo(s - 6.2, my - 1.8); ctx.quadraticCurveTo(s, my + 4.6, s + 6.2, my - 1.8); }
  else if (m === "stern") { ctx.moveTo(s - 5, my + 0.4); ctx.lineTo(s + 5, my - 0.4); }
  else if (m === "grim") { ctx.moveTo(s - 6, my + 1.6); ctx.quadraticCurveTo(s, my - 2.6, s + 6, my + 1.6); }
  else if (m === "worried") { ctx.moveTo(s - 4.6, my + 0.8); ctx.quadraticCurveTo(s - 1, my - 2, s + 4.6, my + 0.2); }
  else if (m === "sad") { ctx.moveTo(s - 5.4, my + 1.8); ctx.quadraticCurveTo(s, my - 2.8, s + 5.4, my + 1.8); }
  else { ctx.moveTo(s - 5, my - 0.4); ctx.quadraticCurveTo(s, my + 1.6, s + 5, my - 0.4); }
  ctx.stroke();

  // ---- moustache over the lip ----
  if (c.beard) {
    [-1, 1].forEach(sd => {
      ctx.beginPath(); ctx.moveTo(s, -17.4);
      ctx.quadraticCurveTo(s + sd * 7, -18.6, s + sd * 12.5, -12.2);
      ctx.quadraticCurveTo(s + sd * 6, -13.4, s, -14.2);
      ctx.closePath();
      fillC(ctx, bc); ctx.fill(); strokeC(ctx, bl, 1.2); ctx.stroke();
    });
  }

  // ---- hair ----
  if (hw === "none" || hw === "braids" || hw === "cap") {
    const part = c.female || hw === "braids";
    const pts = part
      ? [[-30, -26], [-30.5, -44], [-20, -59], [0, -63], [20, -59], [30.5, -44], [30, -26], [25, -34], [16, -46], [2, -55], [-12, -46], [-24, -34]]
      : [[-29, -30], [-29.8, -44], [-20, -59], [0, -63], [20, -59], [29.8, -44], [29, -30], [24, -39], [16, -46], [6, -48], [-4, -44.5], [-14, -48], [-24, -39]];
    pSmooth(ctx, pts, true);
    ctx.fillStyle = gradV(ctx, -63, -30, [[0, lighten(hair, 0.1)], [1, hair]]); ctx.fill();
    strokeC(ctx, hairL, 2); ctx.stroke();
    strokeC(ctx, 0xffffff, 2, 0.16); ctx.beginPath(); ctx.arc(-4, -40, 19, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke();
  } else if (hw !== "scarf" && hw !== "hood" && hw !== "helmet" && !c.female) {
    fillC(ctx, hair);                                // sideburns under a hat
    [-1, 1].forEach(sd => { pRR(ctx, sd * 26.5 - 3, -42, 6, 13, 2.6); ctx.fill(); });
  }

  paintHeadwear(ctx, c);
}

function paintHeadwear(ctx, c) {
  const hw = c.head, hc = c.headColor, hl = OL(hc);
  if (hw === "doppi") {
    ctx.beginPath(); ctx.moveTo(-26, -45); ctx.quadraticCurveTo(0, -51, 26, -45); ctx.lineTo(20.5, -65.5); ctx.quadraticCurveTo(0, -70.5, -20.5, -65.5); ctx.closePath();
    ctx.fillStyle = gradV(ctx, -70, -45, [[0, 0x2b2f3d], [1, 0x12141c]]); ctx.fill();
    strokeC(ctx, 0x08090d, 2.2); ctx.stroke();
    fillC(ctx, 0xf6f1e4);
    [-13, 0, 13].forEach(x => {                      // the white "almond" motifs
      ctx.beginPath(); ctx.moveTo(x, -62); ctx.quadraticCurveTo(x + 5.4, -57, x, -51.5); ctx.quadraticCurveTo(x - 3, -56, x, -62); ctx.fill();
    });
    for (let x = -22; x <= 22; x += 5.5) { pEll(ctx, x, -47.6 + (x * x) / 400, 1.1, 1.1); ctx.fill(); }
  } else if (hw === "cap") {
    ctx.beginPath(); ctx.moveTo(-24, -47); ctx.quadraticCurveTo(0, -52, 24, -47); ctx.quadraticCurveTo(20, -68, 0, -69); ctx.quadraticCurveTo(-20, -68, -24, -47); ctx.closePath();
    ctx.fillStyle = gradV(ctx, -69, -47, [[0, lighten(c.trim, 0.15)], [1, c.trim]]); ctx.fill();
    strokeC(ctx, OL(c.trim), 2); ctx.stroke();
    fillC(ctx, c.robe); [-12, 0, 12].forEach(x => { pStar(ctx, x, -56.5, 4, 4.4, 1.8, 0); ctx.fill(); });
  } else if (hw === "turban" || hw === "jewel" || hw === "wrap") {
    const big = hw === "jewel" ? 1.1 : (hw === "wrap" ? 0.86 : 1);
    const topY = -46 - 31 * big, halfW = 35 * big;
    pSmooth(ctx, [[-halfW, -47], [-halfW - 2, -58], [-halfW * 0.72, topY + 7], [0, topY], [halfW * 0.72, topY + 7], [halfW + 2, -58], [halfW, -47], [0, -42.5]], true);
    ctx.fillStyle = gradV(ctx, topY, -43, [[0, lighten(hc, 0.14)], [1, darken(hc, 0.12)]]); ctx.fill();
    strokeC(ctx, hl, 2.2); ctx.stroke();
    strokeC(ctx, hl, 1.5, 0.5);                      // the wound folds
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-halfW + 1, -51 - i * 6.4 * big);
      ctx.quadraticCurveTo(-4 + i * 5, -44 - i * 7.5 * big, halfW - 1, -55 - i * 5.2 * big); ctx.stroke();
    }
    if (hw === "jewel") {
      strokeC(ctx, 0xf4f7fa, 3); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(3, topY + 12); ctx.quadraticCurveTo(13, topY - 12, 7, topY - 27); ctx.stroke();
      strokeC(ctx, 0xb9c2cb, 1); ctx.beginPath(); ctx.moveTo(4, topY + 10); ctx.quadraticCurveTo(12, topY - 10, 7.5, topY - 24); ctx.stroke();
      pEll(ctx, 2, topY + 15, 6, 6.4); fillC(ctx, PAL.gold); ctx.fill(); strokeC(ctx, PAL.goldDark, 1.4); ctx.stroke();
      pEll(ctx, 2, topY + 15, 3.3, 3.6); fillC(ctx, 0x1f6fb0); ctx.fill();
    }
  } else if (hw === "kalpak") {
    ctx.beginPath(); ctx.moveTo(-27, -48); ctx.quadraticCurveTo(-25, -74, -9, -89); ctx.quadraticCurveTo(0, -94, 9, -89); ctx.quadraticCurveTo(25, -74, 27, -48); ctx.quadraticCurveTo(0, -53, -27, -48); ctx.closePath();
    ctx.fillStyle = gradH(ctx, -27, 27, [[0, 0xfdfaf1], [0.6, 0xefe8d8], [1, 0xcfc6b2]]); ctx.fill();
    strokeC(ctx, 0x6a6252, 2.2); ctx.stroke();
    strokeC(ctx, 0x8a8270, 1.2, 0.7);
    ctx.beginPath(); ctx.moveTo(0, -93); ctx.lineTo(0, -52); ctx.moveTo(-9, -89); ctx.quadraticCurveTo(-13, -70, -14, -51); ctx.moveTo(9, -89); ctx.quadraticCurveTo(13, -70, 14, -51); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-31, -45); ctx.quadraticCurveTo(0, -52, 31, -45); ctx.lineTo(33, -53.5); ctx.quadraticCurveTo(0, -60, -33, -53.5); ctx.closePath();
    fillC(ctx, 0x1c1a20); ctx.fill(); strokeC(ctx, 0x08090d, 1.8); ctx.stroke();
    fillC(ctx, 0x1c1a20); pStar(ctx, -7, -69, 4, 5, 2, 0); ctx.fill(); pStar(ctx, 7, -69, 4, 5, 2, 0); ctx.fill();
  } else if (hw === "crown") {
    ctx.beginPath(); ctx.moveTo(-26, -46); ctx.quadraticCurveTo(0, -52, 26, -46); ctx.quadraticCurveTo(22, -66, 0, -67); ctx.quadraticCurveTo(-22, -66, -26, -46); ctx.closePath();
    fillC(ctx, 0x8a1f2a); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-28.5, -45); ctx.quadraticCurveTo(0, -52, 28.5, -45);
    ctx.lineTo(31, -73); ctx.lineTo(20.5, -60.5); ctx.lineTo(13, -79); ctx.lineTo(6, -62.5); ctx.lineTo(0, -85); ctx.lineTo(-6, -62.5); ctx.lineTo(-13, -79); ctx.lineTo(-20.5, -60.5); ctx.lineTo(-31, -73); ctx.closePath();
    ctx.fillStyle = gradV(ctx, -85, -45, [[0, 0xffe9a8], [0.5, PAL.gold], [1, PAL.goldDark]]); ctx.fill();
    strokeC(ctx, 0x6a4712, 2.2); ctx.lineJoin = "round"; ctx.stroke();
    fillC(ctx, 0xfffaf0); [[-31, -73], [-13, -79], [0, -85], [13, -79], [31, -73]].forEach(p => { pEll(ctx, p[0], p[1] - 1, 3, 3); ctx.fill(); ctx.stroke(); });
    fillC(ctx, 0xb2283a); pEll(ctx, 0, -55.5, 4.4, 5); ctx.fill(); strokeC(ctx, 0x6a4712, 1.2); ctx.stroke();
    fillC(ctx, 0x2fb8ac); [-14.5, 14.5].forEach(x => { pEll(ctx, x, -53, 3, 3.4); ctx.fill(); ctx.stroke(); });
  } else if (hw === "helmet") {
    ctx.beginPath(); ctx.moveTo(-29.5, -40); ctx.quadraticCurveTo(-29, -66, 0, -75); ctx.quadraticCurveTo(29, -66, 29.5, -40); ctx.closePath();
    ctx.fillStyle = gradH(ctx, -30, 30, [[0, 0xeef2f6], [0.45, 0xaab3bd], [1, 0x636b76]]); ctx.fill();
    strokeC(ctx, 0x2e333c, 2.3); ctx.stroke();
    fillC(ctx, 0xaab3bd); ctx.beginPath(); ctx.moveTo(-4, -73); ctx.lineTo(4, -73); ctx.lineTo(0, -95); ctx.closePath(); ctx.fill(); ctx.stroke();
    pRR(ctx, -31, -44.5, 62, 8.5, 2); ctx.fillStyle = gradV(ctx, -44, -36, [[0, c.trim], [1, darken(c.trim, 0.35)]]); ctx.fill(); ctx.stroke();
    pRR(ctx, -3 + 2.2, -38, 6, 17, 2.6); fillC(ctx, 0x9aa3ad); ctx.fill(); ctx.stroke();
    strokeC(ctx, 0xffffff, 2, 0.35); ctx.beginPath(); ctx.arc(-3, -46, 24, Math.PI * 1.08, Math.PI * 1.45); ctx.stroke();
  } else if (hw === "scarf" || hw === "hood") {
    const hood = hw === "hood";
    if (!hood) {                                     // a little parted hair under the scarf
      fillC(ctx, c.hair);
      ctx.beginPath(); ctx.moveTo(-22, -40); ctx.quadraticCurveTo(-10, -52, 1, -50); ctx.quadraticCurveTo(13, -52, 23, -40); ctx.quadraticCurveTo(12, -45, 1, -43.5); ctx.quadraticCurveTo(-10, -45, -22, -40); ctx.fill();
    }
    const topY = hood ? -77 : -65;
    ctx.beginPath();
    ctx.moveTo(-31, 8); ctx.quadraticCurveTo(-37, -22, -32.5, -42); ctx.quadraticCurveTo(-24, topY + 5, 0, topY); ctx.quadraticCurveTo(24, topY + 5, 32.5, -42); ctx.quadraticCurveTo(37, -22, 31, 8);
    ctx.quadraticCurveTo(24.5, 4, 23, -8); ctx.quadraticCurveTo(29, -34, 17, -46); ctx.quadraticCurveTo(1, hood ? -55 : -51.5, -15, -46); ctx.quadraticCurveTo(-27, -34, -21, -8); ctx.quadraticCurveTo(-24.5, 4, -31, 8);
    ctx.closePath();
    ctx.fillStyle = gradV(ctx, topY, 8, [[0, lighten(hc, 0.1)], [1, darken(hc, 0.14)]]); ctx.fill();
    strokeC(ctx, hl, 2.2); ctx.lineJoin = "round"; ctx.stroke();
    if (!hood) {
      fillC(ctx, c.shirt, 0.9);
      [[-25, -50], [-12, -59], [1, -60.5], [14, -58], [26, -48], [-31, -30], [31, -28], [-30, -12], [30, -10]].forEach(p => { pStar(ctx, p[0], p[1], 4, 3, 1.2, 0.4); ctx.fill(); });
    } else {
      softEllipse(ctx, 1, -46, 20, 9, 0x000000, 0.34);
    }
  }
}

function paintPersonLids(ctx, c) {       // origin: between the eyes
  const ery = c.child ? 6.6 : (c.elder ? 4.6 : 5.9);
  [-1, 1].forEach(sd => {
    const x = sd * 10.6;
    pEll(ctx, x, 0, 6.2, ery + 1.9); fillC(ctx, c.skin); ctx.fill();
    strokeC(ctx, 0x2a1810, 2); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - 5, 0.6); ctx.quadraticCurveTo(x, 4, x + 5, 0.6); ctx.stroke();
  });
}
function paintPersonMouth(ctx, c) {      // origin: the mouth
  const dark = c.beard === "full" || c.beard === "long";
  pEll(ctx, 0, 0, 6.6, 5.2); fillC(ctx, dark ? c.beardColor : c.skin); ctx.fill();
  pEll(ctx, 0, 0.6, 4.4, 3.6); fillC(ctx, 0x4a1612); ctx.fill();
  pEll(ctx, 0, 2.2, 2.6, 1.5); fillC(ctx, 0xc65a4a); ctx.fill();
}
function paintPersonBoot(ctx, c) {       // origin: top centre
  ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(6, -1); ctx.lineTo(7.5, 12); ctx.quadraticCurveTo(8, 18.5, 0.5, 18.5); ctx.quadraticCurveTo(-8, 18.5, -7.5, 12); ctx.closePath();
  ctx.fillStyle = gradV(ctx, 0, 18, [[0, lighten(c.boots, 0.12)], [1, darken(c.boots, 0.2)]]); ctx.fill();
  strokeC(ctx, OL(c.boots), 2); ctx.stroke();
}

// ---------- the atlas ----------

const PERSON_FRAMES = {
  body: { x: 0, y: 0, w: 150, h: 96, ox: 75, oy: 86 },
  head: { x: 150, y: 0, w: 150, h: 200, ox: 75, oy: 150 },
  armL: { x: 300, y: 0, w: 100, h: 250, ox: 50, oy: 144 },
  armR: { x: 400, y: 0, w: 100, h: 250, ox: 50, oy: 144 },
  boot: { x: 0, y: 100, w: 30, h: 26, ox: 15, oy: 3 },
  lids: { x: 40, y: 100, w: 56, h: 26, ox: 28, oy: 13 },
  mouth: { x: 100, y: 100, w: 24, h: 18, ox: 12, oy: 9 }
};

function personAtlas(scene, c) {
  const key = personKey(c);
  if (scene.textures.exists(key)) return key;
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256;
  const ctx = cv.getContext("2d"), F = PERSON_FRAMES;
  const draw = (f, fn) => {
    ctx.save();
    ctx.beginPath(); ctx.rect(f.x, f.y, f.w, f.h); ctx.clip();
    ctx.translate(f.x + f.ox, f.y + f.oy);
    fn();
    ctx.restore();
  };
  draw(F.body, () => paintPersonBody(ctx, c));
  draw(F.head, () => paintPersonHead(ctx, c));
  draw(F.armL, () => paintPersonArm(ctx, c, -1));
  draw(F.armR, () => paintPersonArm(ctx, c, 1));
  draw(F.boot, () => paintPersonBoot(ctx, c));
  draw(F.lids, () => paintPersonLids(ctx, c));
  draw(F.mouth, () => paintPersonMouth(ctx, c));
  grain(ctx, 0, 0, 512, 256, 0.055);
  const tex = Tex.adopt(scene, key, cv);
  Object.keys(F).forEach(n => tex.add(n, 0, F[n].x, F[n].y, F[n].w, F[n].h));
  return key;
}

// ---------- the animated rig ----------

class Person extends Phaser.GameObjects.Container {
  constructor(scene, x, y, cfg) {
    super(scene, x, y);
    scene.add.existing(this);
    const c = this.cfg = personCfg(cfg);
    const key = personAtlas(scene, c), F = PERSON_FRAMES, b = c.build;
    const part = (name, px, py) => {
      const f = F[name];
      return scene.add.image(px, py, key, name).setOrigin(f.ox / f.w, f.oy / f.h);
    };
    this.shadow = scene.add.image(0, 3, "fx-shadow").setDisplaySize(96 * b, 30).setAlpha(0.55);
    this.bootL = part("boot", -11 * b, -15);
    this.bootR = part("boot", 11 * b, -15);
    this.body = part("body", 0, -9);
    this.armL = part("armL", -23 * b, -77);
    this.armR = part("armR", 23 * b, -77);
    this.headImg = part("head", 0, 0);
    this.lids = part("lids", 2.2, -29.5).setVisible(false);
    this.mouth = part("mouth", 2.2, -10).setVisible(false);
    this.head = scene.add.container(0, -80, [this.headImg, this.lids, this.mouth]);
    if (c.child) this.head.setScale(1.16);
    this.inner = scene.add.container(0, 0, [this.bootL, this.bootR, this.body, this.armL, this.armR, this.head]);
    this.add([this.shadow, this.inner]);

    this.restL = 0.07; this.restR = -0.07;
    this.armL.rotation = this.restL; this.armR.rotation = this.restR;
    this.baseScale = c.scale;
    this.setScale(this.baseScale);
    this.facing = cfg && cfg.facing < 0 ? -1 : 1;
    this.inner.scaleX = this.facing;
    this.moving = false; this.talking = false; this.armLock = false;
    this.t = Math.random() * 10; this.walkT = 0; this.talkT = 0;
    this.blinkT = 600 + Math.random() * 3500;
    this.h = 150 * this.baseScale;
    if (scene.onUpdate) scene.onUpdate((time, d) => { if (this.active) this.step(d); });
  }

  setFacing(f) { this.facing = f < 0 ? -1 : 1; this.inner.scaleX = this.facing; return this; }
  face(x) { if (Math.abs(x - this.x) > 4) this.setFacing(x < this.x ? -1 : 1); return this; }
  // Perspective: people further "up" the screen are drawn a little smaller.
  setPerspective(k) { this.pk = k; this.setScale(this.baseScale * k); return this; }
  tint(color) {
    [this.bootL, this.bootR, this.body, this.armL, this.armR, this.headImg, this.lids, this.mouth].forEach(i => i.setTint(color));
    return this;
  }
  hop(h) {
    this.scene.tweens.add({ targets: this.inner, y: -(h || 14), duration: 130, yoyo: true, ease: "Quad.easeOut" });
    return this;
  }

  step(d) {
    const dt = d / 1000;
    this.t += dt;
    const br = Math.sin(this.t * 2.1);
    this.body.scaleY = 1 + br * 0.013;
    let headY = -80 - br * 0.8, bob = 0;

    if (this.moving) {
      this.walkT += dt * 10.5;
      const s = Math.sin(this.walkT);
      this.bootL.y = -15 - Math.max(0, s) * 6; this.bootR.y = -15 - Math.max(0, -s) * 6;
      this.bootL.rotation = s * 0.22; this.bootR.rotation = -s * 0.22;
      bob = -Math.abs(Math.cos(this.walkT)) * 3.2;
      const amp = this.cfg.holding === "none" ? 0.46 : 0.16;
      this.armL.rotation = this.restL + s * 0.46;
      if (!this.armLock) this.armR.rotation = this.restR - s * amp;
      this.body.rotation = 0.035; this.head.rotation = 0.03;
    } else {
      const k = Math.min(1, dt * 12);
      this.bootL.y += (-15 - this.bootL.y) * k; this.bootR.y += (-15 - this.bootR.y) * k;
      this.bootL.rotation *= 1 - k; this.bootR.rotation *= 1 - k;
      this.armL.rotation += (this.restL + br * 0.012 - this.armL.rotation) * k;
      if (!this.armLock) this.armR.rotation += (this.restR - br * 0.012 - this.armR.rotation) * k;
      this.body.rotation *= 1 - k;
      if (!this.talking) this.head.rotation *= 1 - k;
    }
    this.body.y = -9 + bob; this.armL.y = -77 + bob; this.armR.y = -77 + bob;

    if (this.talking) {
      this.talkT += d;
      this.head.rotation = Math.sin(this.talkT / 95) * 0.045;
      headY += Math.sin(this.talkT / 60) * 0.8;
      this.mouth.setVisible(Math.floor(this.talkT / 105) % 2 === 0);
    } else if (this.mouth.visible) {
      this.mouth.setVisible(false);
    }
    this.head.y = headY + bob;

    this.blinkT -= d;
    if (this.blinkT <= 0) {
      this.lids.setVisible(true);
      if (this.blinkT < -120) { this.lids.setVisible(false); this.blinkT = 1600 + Math.random() * 3600; }
    }
  }
}
function makePerson(scene, x, y, cfg) { return new Person(scene, x, y, cfg); }

// ---------- portraits ----------

function portraitKey(scene, cfg, size) {
  const c = personCfg(cfg), S = size || 220;
  const key = "port_" + personKey(c) + "_" + S;
  return Tex.make(scene, key, S, S, (ctx) => {
    const R = S / 2, aura = mixC(mixC(c.robe, 0x1a1640, 0.55), 0xffffff, 0.06);
    ctx.save();
    ctx.beginPath(); ctx.arc(R, R, R - 9, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = gradR(ctx, R, R * 0.8, R * 0.1, R * 1.1, [[0, lighten(aura, 0.3)], [1, darken(aura, 0.45)]]);
    ctx.fillRect(0, 0, S, S);
    ctx.globalAlpha = 0.1; ctx.fillStyle = patS(ctx, tileStars(0x000000, 0xffffff, 0x000000, 44), 0.8); ctx.fillRect(0, 0, S, S); ctx.globalAlpha = 1;
    const k = S / 112;
    ctx.translate(R - 2 * k, S * 0.83); ctx.scale(k, k);
    ctx.save(); ctx.translate(0, 71); paintPersonBody(ctx, c); ctx.restore();
    ctx.save(); ctx.translate(-23 * c.build, 3); ctx.rotate(0.07); paintPersonArm(ctx, c, -1); ctx.restore();
    ctx.save(); ctx.translate(23 * c.build, 3); ctx.rotate(-0.07); paintPersonArm(ctx, c, 1); ctx.restore();
    paintPersonHead(ctx, c);
    ctx.restore();
    grain(ctx, 0, 0, S, S, 0.05);
    strokeC(ctx, PAL.goldDark, 9); ctx.beginPath(); ctx.arc(R, R, R - 6, 0, Math.PI * 2); ctx.stroke();
    strokeC(ctx, PAL.gold, 5); ctx.beginPath(); ctx.arc(R, R, R - 6, 0, Math.PI * 2); ctx.stroke();
    strokeC(ctx, PAL.goldLight, 1.4, 0.9); ctx.beginPath(); ctx.arc(R, R, R - 3.4, 0, Math.PI * 2); ctx.stroke();
    fillC(ctx, PAL.goldLight);
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; pEll(ctx, R + Math.cos(a) * (R - 6), R + Math.sin(a) * (R - 6), 1.5, 1.5); ctx.fill(); }
  });
}

// ---------- the hero seated on the carpet (side view, for flights) ----------
// Origin: the middle of the carpet, where the rider sits.

function paintRider(ctx, cfg) {
  const c = personCfg(cfg);
  // crossed legs
  pSmooth(ctx, [[-30, 0], [-27, -14], [-8, -20], [14, -19], [31, -11], [33, 0]], true);
  ctx.fillStyle = gradV(ctx, -20, 0, [[0, lighten(c.robe, 0.08)], [1, darken(c.robe, 0.2)]]); ctx.fill();
  strokeC(ctx, OL(c.robe), 2.2); ctx.stroke();
  pEll(ctx, 27, -4, 9, 5.4, -0.2); fillC(ctx, c.boots); ctx.fill(); strokeC(ctx, OL(c.boots), 1.8); ctx.stroke();
  // torso, leaning into the wind
  ctx.save(); ctx.translate(-2, -14); ctx.rotate(0.1);
  pSmooth(ctx, [[-16, 0], [-17, -30], [-11, -44], [9, -44], [16, -30], [18, 0]], true);
  ctx.fillStyle = clothFill(ctx, c, -44, 0); ctx.fill();
  ctx.save(); pSmooth(ctx, [[-16, 0], [-17, -30], [-11, -44], [9, -44], [16, -30], [18, 0]], true); ctx.clip();
  fillC(ctx, c.shirt); ctx.beginPath(); ctx.moveTo(-4, -46); ctx.lineTo(9, -46); ctx.lineTo(4, -28); ctx.closePath(); ctx.fill();
  strokeC(ctx, c.trim, 4.4); ctx.beginPath(); ctx.moveTo(-5, -46); ctx.lineTo(4, -27); ctx.lineTo(5, 0); ctx.stroke();
  fillC(ctx, c.sash); ctx.fillRect(-20, -13, 42, 7.5);
  ctx.fillStyle = gradH(ctx, -18, 18, [[0, 0x000000, 0.22], [0.5, 0x000000, 0], [1, 0xffffff, 0.12]]); ctx.fillRect(-20, -46, 42, 48);
  ctx.restore();
  pSmooth(ctx, [[-16, 0], [-17, -30], [-11, -44], [9, -44], [16, -30], [18, 0]], true); strokeC(ctx, OL(c.robe), 2.2); ctx.stroke();
  // forward arm resting on the knee
  ctx.save(); ctx.translate(8, -36); ctx.rotate(-0.62);
  pRR(ctx, -6.5, -4, 13, 36, 6.5); ctx.fillStyle = clothFill(ctx, c, -4, 32); ctx.fill(); strokeC(ctx, OL(c.robe), 2); ctx.stroke();
  fillC(ctx, c.trim); ctx.fillRect(-6.5, 25, 13, 5);
  pEll(ctx, 0, 36, 6, 6.2); fillC(ctx, c.skin); ctx.fill(); strokeC(ctx, OL(c.skin), 1.8); ctx.stroke();
  ctx.restore();
  ctx.translate(-1, -45); ctx.scale(0.86, 0.86);
  paintPersonHead(ctx, c);
  ctx.restore();
}
