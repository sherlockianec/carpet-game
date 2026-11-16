# Uchar Gilam — The Flying Carpet

A story game adapted from the Uzbek folk tale *Uchar Gilam*, reworked so every
side-character's riddle is a piece of one buried scandal instead of five unrelated
errands. Built with [Phaser 3](https://phaser.io). No build step and no asset files:
every picture is painted in code at runtime and every sound — including the music on
dutar, ney and doira — is synthesised in the browser.

**Play time:** roughly 40–60 minutes. Progress saves automatically; the title screen
offers **Continue**.

**Play online:** https://sherlockianec.github.io/carpet-game/

---

## Play it locally

Serve the folder with any static web server and open it in a browser:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` straight from disk also works in most browsers.) The two
fonts load from Google Fonts; offline, the game falls back to a built-in serif.

## Controls

| Where | Keyboard / mouse | Touch |
|---|---|---|
| Walking (village, towns, the road) | **WASD** / arrows, or click the ground | tap the ground |
| Talk / look | walk up and press **E** (or Space), or click the person | tap the person |
| Dialogue | click, **Space** or **Enter** — first press finishes the line | tap |
| Carpet flights | hold **Space** / **W** / **↑** / the mouse to rise, let go to sink | touch and hold |
| Bakery | click an oven or press **1 2 3** | tap an oven |
| Saddler | drag pieces onto the stand | drag |
| Kitchen | click the ingredients the ticket asks for | tap |
| Duel | **WASD** move · **Space/J** strike (press again to combo) · **Shift/K** roll | left-side drag to move, STRIKE / ROLL buttons |
| Anywhere | **Esc** pause · **M** sound on/off | pause and sound buttons, top right |

## What happens where

- **The village** — find the old traveller who gives you the carpet. Villagers point the way; after a couple of wrong guesses a sparkle marks him.
- **The road to the palace** — slip past lantern patrols at night. Hide in the shadow of carts, hay and bushes. Being seen sends you back to the last milestone.
- **Flights** — five hand-built routes between the towers and cloud banks, each harder than the last: birds, then arrows (a **!** warns where they come from), wind gusts, and lightning in the storm (the sky flashes where it will strike). Golden sparks are optional; every 12 caught restores a heart. A halfway lantern is a checkpoint.
- **Towns** — find the right person among the crowd. Wrong people give hints; the sparkle helps after three misses.
- **Bakery** — loaves darken from dough to gold to burnt; pull each one while its ring is in the gold band. 20 good loaves, no more than 5 ruined.
- **Saddler** — build a ten-piece saddle in the right order: each piece sits on another.
- **Kitchen** — eight tickets, each a real Uzbek dish (plov, shurpa, lagman, samsa, manti…). Serve six.
- **Duel** — a flashback as King Sanobar: two waves of attendants, then Qahraton. Enemies glow and shout before they lunge — roll through, then strike. Falling only restarts the current wave.

No one is stuck for good: after two failed attempts at any challenge, the pause menu offers to skip it.

## How the story is structured (and why)

The five people the hero visits — the couple in the kiln, the gravekeeper, the baker,
the saddler, and King Sanobar — don't know each other. They're each independently
tangled in the *same* twenty-year-old event (Sanobar killing his steward Qahraton over
an affair with Queen Gul), verified only through what the player carries between
them: a cloth swatch, a whispered phrase, and finally a sealed case.

The order the player *travels* in and the order people *tell their story* in run in
opposite directions on purpose: you visit the kiln couple first and Sanobar last, but
Sanobar tells his story first and the kiln couple tell theirs last. The whole order
is the `sequence` array at the bottom of `src/data.js`.

**Simplification from the source:** in the original tale the *father* makes the
doomed trip to the palace; here the player character goes directly. **Left
unresolved, as in the written retelling:** whether Gul knew, that last night, that
Qahraton meant it as a goodbye.

## Project layout

```
index.html               loads Phaser + every script, in order
phaser.min.js            Phaser 3.90, vendored (no CDN)
src/core.js              stage size, palette, seeded randomness, texture pool, save data, story flow, BaseScene
src/data.js              ALL story text, what every character looks like, flight tuning, chapter order
src/audio.js             synthesised sound effects, ambience and the music sequencer
src/paint.js             Canvas brush helpers: gradients, paths, grain, ikat/tile patterns, panels
src/art-people.js        the layered, animated characters (blinking, walking, talking) and portraits
src/art-world.js         skies, skylines, Timurid architecture, houses, trees, props, the horse, the carpet
src/ui.js                buttons, HUD, banners, item cards, the dialogue box, the pause menu
src/Walk.js              walking controller, props with footprints, talk prompts, ambient particles
src/SceneBookends.js     title screen and the wedding ending
src/SceneHallOfSkulls.js cold open, King Sanobar's audience, the hall and the escape
src/SceneVillagePalace.js village, the night road, the throne room
src/SceneCarpet.js       the flights (and the short flights home)
src/SceneTown.js         every "find the right person" place
src/SceneMiniGames.js    bakery, saddler, kitchen
src/SceneDuel.js         the flashback fight
src/main.js              Phaser config; waits for fonts, then boots
```

To edit dialogue, change how someone looks, retune a flight (`STORY.flights`: speed,
length, gap size) or reorder chapters, you generally only touch `src/data.js`.
Minigame tuning sits in constants at the top of each class (`BAKE`, `SADDLE_PARTS`,
`DISHES`, `ARENA`).

### Testing a single scene

- `?step=7` — jump to that entry of `STORY.sequence` (add `&sub=1` for the second part of a chapter)
- `?scene=DuelScene` — open one scene directly
- `?mute=1` — start silent · `?timer=1` — keep the game running in a background tab
