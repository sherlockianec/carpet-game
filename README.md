# Uchar Gilam — The Flying Carpet

A short browser game adapted from the Uzbek folk tale *Uchar Gilam*, reworked so every
side-character's riddle is a piece of one buried scandal instead of five unrelated
errands. Built with [Phaser 3](https://phaser.io). No build step, no external services,
no image files — every visual is drawn from flat shapes at runtime.

**Play time:** roughly 25–40 minutes.

---

## 1. Play it locally

Just open `index.html` in a browser (double-click it, or drag it into a browser
window). Everything — Phaser included — is a local file, so it works completely
offline.

If your browser is unusually strict about `file://` pages, run a tiny local server
from this folder instead and it will work the same way:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## 2. Put it on GitHub Pages (so anyone with a link can play)

1. Create a new repository on GitHub (public, so Pages can serve it for free).
2. Push everything in this folder to the repo, **keeping the folder structure**
   (`index.html`, `phaser.min.js`, and the `src/` folder all need to stay siblings):
   ```bash
   git init
   git add .
   git commit -m "Uchar Gilam: The Flying Carpet"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a
   branch"**, branch `main`, folder `/ (root)`. Save.
4. GitHub gives you a URL that looks like:
   `https://<you>.github.io/<repo-name>/`
   That link is the whole game — share it with anyone, no install needed.

(It usually takes 30–90 seconds after saving for the first deploy to go live.)

---

## 3. How to play

| Section | Controls |
|---|---|
| **Towns** (finding the right person) | **WASD**/**Arrows** to walk around the bazaar, or click/tap a spot on the ground to walk there. Walk up to someone to talk. Wrong person = a one-line dead end (walk away and try again). Right person = the real conversation. |
| **Road to the Palace** (Chapter 1, after the village) | **Arrows**/**A-D** to slide side to side and slip through the gaps in the patrols. |
| **Flying carpet** | Hold **↑** / **Space**, or click-and-hold anywhere, to rise. Release to fall. Thread the gaps between towers — the gaps get tighter and less predictable the further into a trip you get. |
| **Bakery minigame** | Click each loaf before it burns. The oven runs hotter over time (burns faster) — click the vent icon on the heat gauge, left side, to cool it back down. |
| **Saddler minigame** | Click a part in the tray, then click the matching outline to place it. |
| **Kitchen minigame** | Click the ingredient that matches the order before the timer runs out. |
| **Duel (flashback)** | **WASD**/**Arrows** to move, **Space** to attack, **Shift** to roll (brief invulnerability). Small on-screen buttons appear automatically for touch/mobile. |
| **Dialogue** | Click the **Continue ▸** button (or the dialogue box itself, or press **Space**) to advance a line. |

Nobody permanently fails: minigames and the road/carpet trips simply ask you to try
again, and the duel restarts on defeat with no penalty. The point is the story, not
the difficulty.

---

## 4. How the story is structured (and why)

The five people the hero visits — the couple in the oven, the gravekeeper, the baker,
the saddler, and King Sanobar — don't know each other and never refer to a shared
web of acquaintance. They're each independently tangled in the *same* twenty-year-old
event (Sanobar killing his steward Qahraton over an affair with Queen Gul), verified
only through what the player carries between them: a cloth swatch, a whispered
password, and finally a sealed letter.

The order the player *travels* in and the order people *tell their story* in run in
opposite directions on purpose — you visit the oven couple first and Sanobar last,
but Sanobar tells his story first (he has nothing left to wait for) and the oven
couple tell theirs last (they're the ones who needed everyone else's piece before
they'd trust you with their own). If you want to see that structure in one place,
it's the `sequence` array at the bottom of `src/data.js`.

**Deliberate simplification from the source text:** in the original tale, the
*father* makes the doomed trip to the palace to ask for the princess's hand, and the
son only sets out afterward. Here the player character makes that trip directly, so
there's one continuous controllable protagonist instead of a cutscene-only father.
The short "Road to the Palace" dodge-the-patrols beat between the village and the
audience with the King is this version's own addition, giving that trip the same
"every location is also a small game" treatment as everywhere else.

**Deliberately left unresolved**, same as in the written retelling this game is
based on: whether Gul knew, that last night, that Qahraton meant it as a goodbye.

---

## 5. Project layout

```
index.html          – loads Phaser + every script, in order
phaser.min.js        – Phaser 3, vendored locally (no CDN dependency)
src/data.js           – ALL text, colors, and the master chapter order live here
src/draw.js            – procedural art: characters, Timurid buildings, the carpet,
                          bazaar props, skulls/graves, etc. Everything else calls into this.
src/DialogueBox.js       – the reusable text-box UI, with a visible Continue button
src/GridMover.js          – shared free-movement controller (bazaar + road-to-palace)
src/SceneBookends.js       – Title screen + Ending screen
src/SceneHallOfSkulls.js    – cold-open hook + the real "hall of skulls" chapter
src/SceneVillagePalace.js    – village → road-to-palace minigame → palace audience
src/SceneCarpet.js             – the flying/travel minigame, reused for every trip
src/SceneTown.js                 – the reusable bazaar "find the right person" scene
src/SceneMiniGames.js              – bakery / saddler / kitchen minigames
src/SceneDuel.js                     – the flashback combat set-piece
src/main.js                            – Phaser game config, boots TitleScene
```

Everything is data-driven through `STORY` in `data.js`. To edit dialogue, retune
carpet difficulty, add a new town, or reorder chapters, you generally only need to
touch that one file — the scene code just reads whatever is there.

## 6. Known limitations / easy next steps

- No sound or music yet (the brief mentioned dutar/rubab/ney — there's a hook for
  it, but no audio files are bundled).
- No save/resume — a play session is meant to be one sitting. (Browser storage APIs
  were deliberately avoided so this also works safely if you ever paste the code
  into a Claude-style in-chat preview, where `localStorage` is disabled.)
- Art is illustrated vector built entirely from Phaser Graphics shapes (thick
  outlines, layered silhouettes, no image files) rather than hand-painted sprites —
  closer to a stylized paper-cutout look than a fully painted illustration. Swapping
  in real artwork later just means replacing the `make*` functions in `draw.js` with
  `scene.add.image(...)` calls against loaded textures — the rest of the code
  doesn't care how those objects were built.
- The bazaar's environment props (stalls, trees, rugs, rocks) are scattered
  procedurally each time a town loads, so the layout varies slightly between visits —
  this is intentional (it's what makes the space feel less like a fixed diorama), but
  it does mean prop placement isn't hand-composed.
- Combat numbers (health, damage, speed) are all top-of-file constants in
  `SceneDuel.js` if the fight feels too easy or too hard. Carpet and road-to-palace
  difficulty (gap size, speed, trip length) live in `STORY.carpetThemes` and
  `STORY.routeMap` in `data.js`.
