// ============================================================
// data.js — all story text + config in one place.
// Edit dialogue, colors, or the chapter order here without
// touching any gameplay code.
// ============================================================

function L(speaker, text) {
  return { speaker: speaker, text: text };
}

const STORY = {

  oldMan: [
    L("Old Traveler", "You have a sharp mind, boy - sharper than your birth should allow."),
    L("Old Traveler", "Take this rug. Sit upon it and speak the old words, and it will carry you anywhere in the blink of an eye. Fold it and speak them differently, and it becomes a plain handkerchief."),
    L("Old Traveler", "When the time comes to marry, ask for no one but the King's daughter. Refuse every other match, whatever your parents say."),
    L("Old Traveler", "Go well. We will not meet again.")
  ],

  palace: [
    L("You", "I have come to ask for the Princess's hand."),
    L("The King", "A COMMONER - asking for MY daughter?! Guards! Take his head!"),
    L("Minister", "Wait, my King. Kill him, and the story ends here, unremarkable. Test him instead, and let the story decide."),
    L("Minister", "There is a couple living inside an old kiln at the edge of a distant city. No one has ever learned why. Bring me their story - and whatever it leads to - and he may yet have his bride."),
    L("The King", "Fine. Let it be his problem, not mine. Go, boy - and don't return empty-handed.")
  ],

  routeMap: {
    title: "The Road to the Palace",
    caption: "Keep to the road - slip past the patrols.",
    distance: 2000, speed: 150, gapHalf: 78, spawnInterval: 1300
  },

  towns: {

    oven: {
      title: "The Edge of a Distant City",
      envKind: "city",
      skyTop: 0xf2c98a, skyBottom: 0xd9873f, buildingColor: 0xc9a24b, accent: 0xd9a441, groundColor: 0x8a6a4a,
      spots: [
        { xf: 0.13, yf: 0.58, robe: 0x7a5a3a, name: "Neighbor", miss: ["The old ones? Keep to themselves.", "Strange house. I've never once seen the door used."] },
        { xf: 0.27, yf: 0.80, robe: 0x9a7a4a, name: "Neighbor", miss: ["Never seen them both outside at once.", "If you must ask someone, ask at the old kiln."] },
        { xf: 0.20, yf: 0.38, robe: 0x6a8a7a, name: "Water-Carrier", holding: "basket", miss: ["Heavy work, this. No time for gossip.", "Ask by the kiln - they've been here longer than me."] },
        { xf: 0.50, yf: 0.45, robe: 0x8a6a9a, name: "Child", scale: 0.82, miss: ["I'm not allowed to talk to strangers!", "Mama says the kiln people are sad, not scary."] },
        { xf: 0.58, yf: 0.82, robe: 0x5a7a8a, name: "Cart-Man", miss: ["Move along, I've a delivery.", "Kiln's that way, if that's your business."] },
        { xf: 0.86, yf: 0.42, robe: 0x9a5a5a, name: "Weaver", miss: ["Fine thread, if you're buying.", "Not much use to a wanderer, I'd think."] },
        { xf: 0.72, yf: 0.72, robe: 0x5a5040, name: "Oven-Keeper", headwear: "kalpak", beard: true, target: true }
      ],
      dialogue: [
        L("Oven-Keeper", "We share one robe between us, stranger. There is little else worth telling."),
        L("Oven-Keeper", "But if you truly want it - there is a gravekeeper, east of here. Weeps day and night, they say, and has for twenty years."),
        L("Oven-Keeper", "Bring me his reason. Then, perhaps, I'll give you mine.")
      ]
    },

    graveyard: {
      title: "A Quiet Cemetery",
      envKind: "cemetery",
      skyTop: 0x6a7a90, skyBottom: 0x2a2a3a, buildingColor: 0x585047, accent: 0x8a8070, groundColor: 0x4a4a3a,
      spots: [
        { xf: 0.12, yf: 0.42, style: "grave", miss: ["Just packed earth.", "A name long worn away."] },
        { xf: 0.30, yf: 0.32, style: "grave", miss: ["Nothing but weeds here.", "No one has visited in years."] },
        { xf: 0.18, yf: 0.75, style: "grave", miss: ["Empty. Untended."] },
        { xf: 0.40, yf: 0.62, style: "grave", miss: ["A cracked stone, no name at all."] },
        { xf: 0.55, yf: 0.36, style: "grave", miss: ["Moss has taken the whole face of it."] },
        { xf: 0.62, yf: 0.78, style: "grave", miss: ["Sunk deep into the earth. Old, this one."] },
        { xf: 0.76, yf: 0.50, style: "grave", miss: ["Nothing. Just stone and silence."] },
        { xf: 0.86, yf: 0.72, style: "grave", target: true, name: "Gravekeeper" }
      ],
      dialogue: [
        L("Gravekeeper", "...Twenty years I've sat with a promise I never kept."),
        L("Gravekeeper", "It concerns someone called only 'the baker.' I don't even know if he's still alive - or still worth trusting."),
        L("Gravekeeper", "Bring me proof of that, and I'll finally speak.")
      ]
    },

    bakery: {
      title: "A Street of Ovens",
      envKind: "bazaar",
      skyTop: 0xe07a4a, skyBottom: 0x3a2a55, buildingColor: 0x6a4a5a, accent: 0xd9a441, groundColor: 0x4a3545,
      spots: [
        { xf: 0.13, yf: 0.40, robe: 0x4a6a5a, name: "Tailor", miss: ["Bread? Try further down.", "I only sew, friend."] },
        { xf: 0.30, yf: 0.78, robe: 0x8a5a3a, name: "Fruit-Seller", holding: "basket", miss: ["That bakery? Strangest place in the city.", "They never sell a single loaf, you know."] },
        { xf: 0.48, yf: 0.34, robe: 0x9a6a8a, name: "Porter", miss: ["Careful, coming through!", "Ovens are that way - can't miss the smell."] },
        { xf: 0.60, yf: 0.62, robe: 0x6a8a9a, name: "Beggar", scale: 0.9, miss: ["Spare bread, friend?", "They give theirs to the river, not to me."] },
        { xf: 0.20, yf: 0.60, robe: 0x8a8a4a, name: "Child", scale: 0.82, miss: ["I like watching the loaves come out!", "Papa says the baker never smiles."] },
        { xf: 0.72, yf: 0.72, robe: 0xc9a24b, name: "Baker", headwear: "doppi", target: true }
      ],
      dialogue: [
        L("Baker", "Every week, bread. Never sold. I don't expect a stranger to understand why."),
        L("Baker", "Help me finish today's batch before it burns - maybe then I'll trust you enough to explain.")
      ],
      after: "minigame", minigame: "BakeryGameScene"
    },

    saddler: {
      title: "The Saddler's Row",
      envKind: "bazaar",
      skyTop: 0xead9b0, skyBottom: 0xb98a55, buildingColor: 0x6b4a2e, accent: 0xc9a24b, groundColor: 0x8a6a4a,
      spots: [
        { xf: 0.14, yf: 0.76, robe: 0x5a6a4a, name: "Cobbler", miss: ["Saddles aren't my trade.", "You want the one who breaks his own work. End of the row."] },
        { xf: 0.34, yf: 0.38, robe: 0x7a5a3a, name: "Cart-Driver", miss: ["He builds one a year. Sells it. Buys it right back. Smashes it.", "Nobody's ever gotten a straight answer from him."] },
        { xf: 0.55, yf: 0.68, robe: 0x9a8a5a, name: "Stable-Hand", miss: ["Horses all through here, mind your step.", "He's particular about who he lets near his work."] },
        { xf: 0.24, yf: 0.55, robe: 0x8a6a9a, name: "Trader", holding: "basket", miss: ["Leatherwork, best in the city.", "Except his - never for sale, that one."] },
        { xf: 0.68, yf: 0.36, robe: 0x6a9a8a, name: "Child", scale: 0.82, miss: ["He let me watch him work once!", "He talks to the saddle like it can hear him."] },
        { xf: 0.72, yf: 0.72, robe: 0x6b4a2e, name: "Saddler", headwear: "doppi", beard: true, target: true }
      ],
      dialogue: [
        L("Saddler", "One saddle a year. Sold, bought back, broken. Don't ask me why - I'm not sure I fully know myself."),
        L("Saddler", "If you've nothing better to do, help me finish this year's. Then we'll talk.")
      ],
      after: "minigame", minigame: "SaddlerGameScene"
    },

    saddlerRevisit: {
      title: "The Saddler's Row, Once More", revisit: true, grantClue: "swatch", envKind: "bazaar",
      skyTop: 0xead9b0, skyBottom: 0xb98a55, buildingColor: 0x6b4a2e, accent: 0xc9a24b, groundColor: 0x8a6a4a,
      dialogue: [
        L("You", "King Sanobar told me everything. Qahraton is dead - killed the night his queen was found unfaithful."),
        L("Saddler", "...Then he really is gone."),
        L("Saddler", "I was married off without warning, once, to a woman no one properly explained. We had two sons. Years later, after one ordinary quarrel, she vanished - and I never learned why."),
        L("Saddler", "Qahraton was my client. Each saddle had a false bottom, and always the same order: once retired, never kept - only sold, reclaimed, and broken, so whatever it carried never lingered in a stranger's hands."),
        L("Saddler", "His last saddle, he never came to collect. Its compartment still held this."),
        L("Saddler", "A baker's mark, stitched into the cloth. Take it. And take this too - your story explains something I never understood about my own wife.")
      ]
    },

    bakeryRevisit: {
      title: "The Street of Ovens, Once More", revisit: true, grantClue: "phrase", envKind: "bazaar",
      skyTop: 0xe07a4a, skyBottom: 0x3a2a55, buildingColor: 0x6a4a5a, accent: 0xd9a441, groundColor: 0x4a3545,
      dialogue: [
        L("You", "The saddler is still alive. He gave me this - your mark, on the cloth from Qahraton's last order."),
        L("Baker", "...That's mine, yes."),
        L("Baker", "Years ago my family faced ruin over a debt. A go-between, working for a man I never met, quietly covered it - on one condition. Bread, every week, left at the river, no questions asked."),
        L("Baker", "One week, the sign that it had been collected simply never came. I kept baking anyway. Hope, mostly, by the end."),
        L("Baker", "The go-between once told me - if it ever came to this - to ask for 'the keeper of the west gate of the dead.'")
      ]
    },

    graveyardRevisit: {
      title: "The Cemetery, Once More", revisit: true, grantClue: "caseObtained", envKind: "cemetery",
      skyTop: 0x7a8aa0, skyBottom: 0x2a2a3a, buildingColor: 0x585047, accent: 0x8a8070, groundColor: 0x4a4a3a,
      dialogue: [
        L("You", "The baker is alive, and still keeping his half of something. He gave me a phrase - 'the keeper of the west gate of the dead.'"),
        L("Gravekeeper", "...That was real, then. He was real."),
        L("Gravekeeper", "Twenty years ago, I reached the grounds first - before the King's men. One attendant was still breathing. His last words begged me to carry a sealed case to 'the baker who owes the house a debt.'"),
        L("Gravekeeper", "I was afraid delivering it would look like confession. So I never did. I've wept less for the dead, these twenty years, than for my own cowardice."),
        L("Gravekeeper", "Take it - still sealed. And take his other words, half-finished: something about a kiln. A mother.")
      ]
    },

    ovenRevisit: {
      title: "The Oven, One Last Time", revisit: true, envKind: "city",
      skyTop: 0xd98a4a, skyBottom: 0x5a3a2a, buildingColor: 0xc9a24b, accent: 0xd9a441, groundColor: 0x8a6a4a,
      dialogue: [
        L("You", "The gravekeeper finally kept his promise. He asked me to bring you this."),
        L("Oven-Keeper", "...Qahraton. He was our son."),
        L("Oven-Keeper", "Born to nothing, he rose to steward a royal estate - and built a life we never asked to understand. When his crimes came out and he was killed, we gave away every coin he'd ever sent us."),
        L("Oven-Keeper", "This robe is what's left. We wear it one at a time. A vow, not a hardship."),
        L("Oven-Keeper", "Let us open it together."),
        L("Letter", "...I meant tonight to be the last one. To end it with Gul. To finally tell you both where the money truly came from, and that it might now put you in danger. To disappear somewhere none of it could follow."),
        L("Letter", "I meant to stop. I simply didn't live long enough to."),
        L("Oven-Keeper", "It doesn't undo twenty years. But now, at least, we know the rest of it.")
      ]
    }

  },

  bakery: {
    outro: [
      L("Baker", "There was a saddler, once, tied up in all this. If he still remembers me, so will I remember why I do this.")
    ]
  },

  saddler: {
    outro: [
      L("Saddler", "There was a man named Qahraton. My best client, once. He rode to see a King named Sanobar - and never came back."),
      L("Saddler", "Learn what truly happened to him, and I'll tell you everything I know.")
    ]
  },

  kitchen: {
    intro: [
      L("Guard", "The palace kitchen's short-handed. Cooks welcome, if you're desperate enough to try."),
      L("You", "I'll manage.")
    ],
    outro: [
      L("Head Cook", "Fine. It was you. Go on, then - the King wants to see who's been showing him up.")
    ]
  },

  hallOfSkulls: {
    audience: [
      L("King Sanobar", "You cook better than the man I've paid for years. Name your reward."),
      L("You", "Only the truth. About the Queen kept in the iron cage."),
      L("King Sanobar", "...Walk with me first.")
    ],
    hallLines: [
      L("King Sanobar", "Every one of them asked. Every one of them is up there. One hook is still bare."),
      L("King Sanobar", "Ask again, and it won't be, by morning."),
      L("You", "I accept. Only - let me finish my tea, after."),
      L("King Sanobar", "...Strange request. Granted."),
      L("King Sanobar", "I married Gul as a child, and loved her for years - until I noticed my hunting horses exhausted every morning, though no one admitted riding them."),
      L("King Sanobar", "I stayed awake to find out why. I found a charm on my own chest that had been keeping me asleep - and followed the second horse by moonlight to my own country orchard."),
      L("King Sanobar", "There: my steward Qahraton, the forty attendants the crown had allotted his estate, and Gul - no stranger to the place at all."),
      L("King Sanobar", "I killed them. All of them. Qahraton last, after a fight neither of us was sure would end. I brought Gul home - and caged her, rather than do what the law demanded."),
      L("King Sanobar", "As I moved on him, she cried out something. A plea for his life, or an explanation of her own - I've never been sure which. Twenty years, and neither pride nor grief has let either of us raise it again."),
      L("King Sanobar", "He was carrying a sealed case that night. It was gone before my men could search the body. The one thread I've never been able to close."),
      L("King Sanobar", "There. Now you know why the hook has stayed empty.")
    ]
  },

  duel: {
    qahratonEnter: [
      L("Qahraton", "So. The King finally came himself.")
    ],
    victory: [
      L("", "Qahraton falls. The orchard is silent. Somewhere behind you, Gul says something you'll spend twenty years trying to remember correctly.")
    ]
  },

  ending: [
    L("", "The written account reaches the Minister, then the King - less impressed that the young man survived than that he came back at all, with knowledge he could easily have sold, and chose instead to spend months chasing down other people's grief."),
    L("", "The wedding runs forty days and forty nights."),
    L("", "Word of the letter reaches King Sanobar too, carried gently rather than as accusation. He does not free Gul - some things cut too deep, even twenty years on - but the iron cage becomes a guarded house instead. Confined still. No longer kept like an animal."),
    L("", "Whether she knew, that last night, that it was meant to be a farewell - no one ever asks her. She never says.")
  ],

  carpetThemes: {
    desert: { skyTop: 0xf2c98a, skyBottom: 0xd9873f, orb: 0xfff3d0, farColor: 0xb5794a, nearColor: 0x8a5a34, ground: 0xc9a24b, obstacleColor: 0x8a5a34, obstacleAccent: 0xd9a441, kind: "minaret", hazard: "bird", speed: 190, gapHalf: 98, spawnInterval: 1500, distance: 4200 },
    wind:   { skyTop: 0xcfe0e8, skyBottom: 0x6a90a0, orb: 0xffffff, farColor: 0x5a7a88, nearColor: 0x3a5a68, ground: 0x7a8a70, obstacleColor: 0x4a6a58, obstacleAccent: 0xdff0ea, kind: "wind", hazard: "bird", speed: 210, gapHalf: 90, spawnInterval: 1350, distance: 4600 },
    dusk:   { skyTop: 0xe07a4a, skyBottom: 0x3a2a55, orb: 0xffd27a, farColor: 0x5a3a5a, nearColor: 0x3a2645, ground: 0x6a4a5a, obstacleColor: 0x4a2f4a, obstacleAccent: 0xd9a441, kind: "dome", hazard: "bird", speed: 220, gapHalf: 86, spawnInterval: 1300, distance: 5000 },
    day2:   { skyTop: 0xdcd0a0, skyBottom: 0xb98a55, orb: 0xfff3d0, farColor: 0x9a7550, nearColor: 0x6b4a2e, ground: 0x8a6a4a, obstacleColor: 0x6b4a2e, obstacleAccent: 0xc9a24b, kind: "canyon", hazard: "arrow", speed: 232, gapHalf: 84, spawnInterval: 1250, distance: 5400 },
    storm:  { skyTop: 0x3a3a4a, skyBottom: 0x14141e, orb: 0x8a8a9a, farColor: 0x2a2a38, nearColor: 0x1a1a24, ground: 0x201c2a, obstacleColor: 0x2a2a38, obstacleAccent: 0x5a5a68, kind: "storm", hazard: "arrow", speed: 250, gapHalf: 80, spawnInterval: 1150, distance: 6200 }
  },

  sequence: [
    { type: "hallOfSkulls", mode: "prologue" },
    { type: "villagePalace" },
    { type: "carpet", theme: "desert", toLabel: "the Oven at the City's Edge" },
    { type: "town", key: "oven" },
    { type: "carpet", theme: "wind", toLabel: "the Gravekeeper's Hut" },
    { type: "town", key: "graveyard" },
    { type: "carpet", theme: "dusk", toLabel: "the Endless Bakery" },
    { type: "town", key: "bakery" },
    { type: "carpet", theme: "day2", toLabel: "the Saddler's Shop" },
    { type: "town", key: "saddler" },
    { type: "carpet", theme: "storm", toLabel: "the City of King Sanobar" },
    { type: "kitchenGame" },
    { type: "hallOfSkulls", mode: "real" },
    { type: "duel" },
    { type: "carpet", quick: true, toLabel: "the Saddler" },
    { type: "town", key: "saddlerRevisit" },
    { type: "carpet", quick: true, toLabel: "the Bakery" },
    { type: "town", key: "bakeryRevisit" },
    { type: "carpet", quick: true, toLabel: "the Gravekeeper" },
    { type: "town", key: "graveyardRevisit" },
    { type: "carpet", quick: true, toLabel: "the Oven" },
    { type: "town", key: "ovenRevisit" },
    { type: "carpet", quick: true, toLabel: "Home" },
    { type: "ending" }
  ]
};

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
  map: {
    hallOfSkulls: "HallOfSkullsScene",
    villagePalace: "VillagePalaceScene",
    carpet: "CarpetScene",
    town: "TownScene",
    kitchenGame: "KitchenGameScene",
    duel: "DuelScene",
    ending: "EndingScene"
  },
  advance(sceneManager) {
    this.index++;
    const step = STORY.sequence[this.index];
    if (!step) { sceneManager.start("TitleScene"); return; }
    sceneManager.start(this.map[step.type], step);
  }
};
