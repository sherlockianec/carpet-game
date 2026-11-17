# Uchar Gilam — The Flying Carpet

A story game adapted from the Uzbek folk tale *Uchar Gilam*, reworked so every
side-character's riddle is a piece of one buried scandal instead of five unrelated
errands. Built with [Phaser 3](https://phaser.io). No build step and no asset files:
every picture is painted in code at runtime and every sound — including the music on
dutar, ney and doira — is synthesised in the browser.

**Languages:** English, Russian and Uzbek — pick one on the title screen (the first visit follows
the browser's language).

**Play time:** roughly 60–90 minutes. Progress saves automatically; the title screen
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
| Bakery | click an oven or press **1–5**: once to load the dough, again to pull the loaf | tap an oven |
| Saddler | drag pieces onto the stand | drag |
| Kitchen | click the ingredients in the ticket's order (point at a bowl to see its name) · work the bellows with a click or **F** | tap |
| Duel | **WASD** move · **Space/J** strike (press again to combo) · **Shift/K** roll | left-side drag to move, STRIKE / ROLL buttons |
| Anywhere | **Esc** pause · **M** sound on/off | pause and sound buttons, top right |

## What happens where

- **The village** — a long village street; find the old traveller who gives you the carpet. Villagers point the way; after a few wrong guesses a sparkle marks him.
- **The road to the palace** — a long night road past twelve guards: patrols, sentries who turn, crossing patrols, and watchmen swinging long lantern beams. Lantern light stops at carts, hay and jars, and is drawn exactly where it can see you; the "?" over a guard fills while you stand in it. Bushes and dark wall alcoves hide you completely. Being seen sends you back to the last milestone.
- **Flights** — hold to rise, let go to sink, through the gaps between towers and whatever hangs above them. Collisions are tested against the painted pictures themselves, so what you see is what you hit. Each flight has its own trouble: bird flocks, diving falcons, arrow volleys (a **!** warns where they come from), archers on the ground who draw and aim (the dashed line shows where), wind gusts, lightning in the storm (the sky flashes where it will strike); the five flights home add palace archers, chimney smoke that lifts you, bats, a sandstorm and kites on long strings. Golden sparks are optional; every 12 caught restores a heart. Reaching the halfway lantern makes it your restart point for that flight.
- **Towns** — each is a wide street with a crowd that grows from town to town, and the person you want has look-alikes: other potters at working kilns, other mourners with lanterns, other bakers with queues, other saddlers. What people tell you narrows it down; the sparkle only helps after several wrong guesses.
- **Bakery** — five tandirs. Slap the dough in, pull each loaf while its ring is in the gold band; ovens flare up and bake twice as fast, and the band narrows as you go. 30 good loaves in 55 seconds (perfect pulls buy a second back), no more than 6 ruined. Then the bread goes out on the river.
- **Saddler** — build a ten-piece saddle in the right order: each piece sits on another.
- **Kitchen** — ten tickets, each a real Uzbek dish (plov, shurpa, lagman, samsa, manti, dimlama, mastava, chuchvara…). Ingredients go in in order, the bowls move after every dish, and the fire under the kazan must be kept in the green with the bellows. Serve eight.
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
src/i18n.js              tr()/tf(): every on-screen string is looked up in the chosen language as it is drawn
src/lang-ru.js           Russian, keyed by the English text
src/lang-uz.js           Uzbek (Latin script), keyed by the English text
src/data.js              ALL story text, what every character looks like, flight tuning, chapter order
src/audio.js             synthesised sound effects, ambience and the music sequencer
src/paint.js             Canvas brush helpers: gradients, paths, grain, ikat/tile patterns, panels
src/art-people.js        the layered, animated characters (blinking, walking, talking) and portraits
src/art-world.js         skies, skylines, Timurid architecture, houses, trees, stalls, carts, the carpet
src/art-props.js         the well, clay and copper vessels, sacks, hay, firewood, kilns, the supa, saddlery, the horse
src/ui.js                buttons, HUD, banners, item cards, the dialogue box, the pause menu
src/Walk.js              walking controller, props with footprints, talk prompts, ambient particles
src/SceneBookends.js     title screen and the wedding ending
src/SceneHallOfSkulls.js cold open, King Sanobar's audience, the hall and the escape
src/SceneVillagePalace.js village, the night road (guards, light, hiding), the throne room
src/SceneCarpet.js       the flights, their obstacles and hazards, pixel-mask collisions
src/SceneTown.js         every "find the right person" place: wide streets, scenery layouts, crowds
src/SceneMiniGames.js    bakery, the river, saddler, kitchen
src/SceneDuel.js         the flashback fight
src/main.js              Phaser config; waits for fonts, then boots
```

Text is written in English in the code and in `src/data.js`; when you change or add a line,
add the same English line with its translation to `src/lang-ru.js` and `src/lang-uz.js`
(a missing entry simply shows in English).

To edit dialogue, change how someone looks, retune a flight (`STORY.flights`: speed,
length, gap size) or reorder chapters, you generally only touch `src/data.js`.
Minigame tuning sits in constants next to each class (`BAKE`, `SADDLE_PARTS`,
`DISHES`, `HEAT`, `ARENA`). Street scenery is `TOWN_LAYOUTS` in `src/SceneTown.js`; the
night road's guards and hiding places are `ROAD_LAYOUT` in `src/SceneVillagePalace.js`.

### Testing a single scene

- `?step=7` — jump to that entry of `STORY.sequence` (add `&sub=1` for the second part of a chapter)
- `?scene=DuelScene` — open one scene directly
- `?mute=1` — start silent · `?timer=1` — keep the game running in a background tab
