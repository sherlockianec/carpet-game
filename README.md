# Uchar Gilam — The Flying Carpet

A short browser game adapted from the Uzbek folk tale *Uchar Gilam*, reworked so every
side-character's riddle is a piece of one buried scandal instead of five unrelated
errands. Built with [Phaser 3](https://phaser.io). No build step, no external services,
no image files — every visual is drawn from flat shapes at runtime.

**Play time:** roughly 20–35 minutes.

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
| **Towns** (finding the right person) | Click/tap anywhere — your character walks over. Wrong person = a one-line dead end. Right person = the real conversation. |
| **Flying carpet** | Hold **↑** / **Space**, or click-and-hold anywhere, to rise. Release to fall. Thread the gaps between towers. |
| **Bakery minigame** | Click each loaf before it burns. |
| **Saddler minigame** | Click a part in the tray, then click the matching outline to place it. |
| **Kitchen minigame** | Click the ingredient that matches the order before the timer runs out. |
| **Duel (flashback)** | **WASD**/**Arrows** to move, **Space** to attack, **Shift** to roll (brief invulnerability). Small on-screen buttons appear automatically for touch/mobile. |
| **Dialogue** | Click anywhere, or press **Space**, to advance a line. |

Nobody permanently fails: minigames simply ask you to try again, and the duel
restarts on defeat with no penalty. The point is the story, not the difficulty.

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

**Deliberately left unresolved**, same as in the written retelling this game is
based on: whether Gul knew, that last night, that Qahraton meant it as a goodbye.

---

## 5. Project layout

```
index.html          – loads Phaser + every script, in order
phaser.min.js        – Phaser 3, vendored locally (no CDN dependency)
src/data.js           – ALL text, colors, and the master chapter order live here
src/draw.js            – procedural art: domes, minarets, people, the carpet, etc.
src/DialogueBox.js       – the reusable text-box UI
src/SceneBookends.js      – Title screen + Ending screen
src/SceneHallOfSkulls.js   – cold-open hook + the real "hall of skulls" chapter
src/SceneVillagePalace.js   – opening chapter (carpet gift + the failed proposal)
src/SceneCarpet.js            – the flying/travel minigame, reused for every trip
src/SceneTown.js                – the reusable "find the right person" scene
src/SceneMiniGames.js             – bakery / saddler / kitchen minigames
src/SceneDuel.js                    – the flashback combat set-piece
src/main.js                           – Phaser game config, boots TitleScene
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
- Art is intentionally flat/geometric, closer to *Alto's Adventure* than an
  illustrated game. Swapping in real sprites later just means replacing the
  `make*` functions in `draw.js` with `scene.add.image(...)` calls against loaded
  textures — the rest of the code doesn't care how those objects were built.
- Combat numbers (health, damage, speed) are all top-of-file constants in
  `SceneDuel.js` if the fight feels too easy or too hard.
