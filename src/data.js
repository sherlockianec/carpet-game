// ============================================================
// data.js — all story text, who looks like what, and the order
// of chapters. Edit dialogue, characters or pacing here without
// touching any gameplay code.
// ============================================================

function L(speaker, text) { return { speaker: speaker, text: text }; }

// ---------- what everyone looks like ----------
const HERO = { robe: 0x1f6f6f, robe2: 0x134a4a, trim: 0xd9a441, shirt: 0xf2e6cc, pattern: "ikat", head: "doppi", mood: "neutral" };
const SANOBAR = { body: "royal", robe: 0x7a1f2a, trim: 0xd9a441, head: "crown", beard: "full", hair: 0x3a2a20, beardColor: 0x4a3a30, mood: "grim", skin: 0xd6b48a, scale: 1.12, build: 1.1 };
const KING = { body: "royal", robe: 0x4a2f7a, trim: 0xd9a441, head: "crown", beard: "long", hair: 0x8a8070, beardColor: 0xcfc8b8, mood: "stern", elder: true, scale: 1.1, build: 1.12 };

const STORY = {

  cast: {
    "You": HERO,
    "Old Traveler": { body: "cloak", robe: 0x5a5040, head: "kalpak", beard: "long", elder: true, mood: "kind", holding: "staff", skin: 0xcfb08a },
    "The King": KING,
    "Minister": { robe: 0x2c3e6b, trim: 0xc9a24b, pattern: "stripes", head: "jewel", headColor: 0xf2ecdc, beard: "goatee", mood: "worried", holding: "staff" },
    "Oven-Keeper": { body: "rags", robe: 0x6a5a48, head: "wrap", headColor: 0xd9cdb4, beard: "full", elder: true, mood: "sad", skin: 0xc9a47a },
    "Gravekeeper": { body: "cloak", robe: 0x3e4048, head: "hood", beard: "full", elder: true, mood: "sad", holding: "lantern", skin: 0xcdb08e },
    "Baker": { body: "apron", robe: 0xb5553a, trim: 0xd9a441, head: "doppi", beard: "mustache", mood: "worried", build: 1.15 },
    "Saddler": { robe: 0x6b4a2e, trim: 0xc9a24b, pattern: "stripes", head: "doppi", beard: "full", hair: 0x3a2a1a, mood: "neutral" },
    "Guard": { body: "armor", robe: 0x3a2440, trim: 0xc9a24b, head: "helmet", beard: "mustache", mood: "stern", holding: "spear" },
    "Head Cook": { body: "apron", robe: 0x8a3a2a, head: "turban", headColor: 0xf6efe0, beard: "goatee", mood: "stern", build: 1.2, holding: "ladle" },
    "King Sanobar": SANOBAR,
    "Qahraton": { body: "cloak", robe: 0x1e1a22, trim: 0x8e2f2f, head: "turban", headColor: 0x2a2228, beard: "goatee", mood: "grim", holding: "sword", skin: 0xc9b090, scale: 1.08 },
    "Gul": { body: "dress", robe: 0x7a2a4a, trim: 0xd9a441, female: true, head: "scarf", headColor: 0xd9a441, mood: "worried", vest: 0x3a1a2a }
  },

  oldMan: [
    L("Old Traveler", "You have a sharp mind, boy - sharper than your birth should allow."),
    L("Old Traveler", "Take this rug. Sit upon it and speak the old words, and it will carry you anywhere in the blink of an eye. Fold it and speak them differently, and it becomes a plain handkerchief."),
    L("Old Traveler", "When the time comes to marry, ask for no one but the King's daughter. Refuse every other match, whatever your parents say."),
    L("Old Traveler", "Go well. We will not meet again.")
  ],

  villagers: [
    { x: 500, y: 820, name: "Water-Carrier", cfg: { robe: 0x7a5a3a, head: "cap", trim: 0xb5553a, holding: "jug" }, lines: ["Mind the well on your way past - the rope's gone thin again.", "There's an old man under the big apricot tree, east of the cart. Been sitting there since dawn, asking after you."] },
    { x: 900, y: 890, name: "Neighbour", cfg: { body: "dress", robe: 0x5a7a5a, female: true, head: "scarf", headColor: 0xb2283a, vest: 0x2a3a2a }, lines: ["Haven't seen you around much. Off somewhere?", "A traveller in a white kalpak asked which house was yours. Strange eyes, that one."] },
    { x: 1240, y: 960, name: "Child", cfg: { robe: 0x8a6a9a, child: true, head: "none", mood: "kind" }, lines: ["Sharp eyes, you. Everyone says so!", "The old man under the biggest tree gave me a dried apricot. Go see him!"] },
    { x: 1400, y: 900, name: "Grandmother", cfg: { body: "dress", robe: 0x6a5a6a, female: true, head: "scarf", headColor: 0xf6ecd8, elder: true, mood: "kind" }, lines: ["Sit, sit. Have some tea.", "Your mother says you're too clever for this village. Maybe she's right."] },
    { x: 1620, y: 820, name: "Farmer", cfg: { robe: 0x6a5a3a, head: "turban", headColor: 0xe8dcc4, beard: "full", holding: "basket" }, lines: ["Good harvest this year. The apricots nearly broke the branches.", "A stranger by the biggest tree is waiting for someone. Not me, I asked."] },
    { x: 1900, y: 900, name: "Shepherd", cfg: { robe: 0x7a6a4a, head: "kalpak", headColor: 0xf2ecdc, beard: "goatee", holding: "staff" }, lines: ["The flock's restless today. Something in the air.", "That old man came up the east road at dawn. Never seen him before."] },
    { x: 2760, y: 900, name: "Smith's Boy", cfg: { body: "apron", robe: 0x6a4a3a, head: "cap", trim: 0x1f6f6f }, lines: ["Can't stop, the forge is hot!", "The stranger? Under the apricot, back west a little."] },
    { x: 3080, y: 880, name: "Baker's Wife", cfg: { body: "dress", robe: 0x9a4a3a, female: true, head: "scarf", headColor: 0xd9a441, holding: "jug" }, lines: ["Bread's in the oven - don't tell my husband I stopped to talk.", "Under the apricot tree. You walked right past him."] }
  ],
  oldManAt: { x: 2440, y: 880 },

  palace: [
    L("You", "I have come to ask for the Princess's hand."),
    L("The King", "A COMMONER - asking for MY daughter?! Guards! Take his head!"),
    L("Minister", "Wait, my King. Kill him, and the story ends here, unremarkable. Test him instead, and let the story decide."),
    L("Minister", "There is a couple living inside an old kiln at the edge of a distant city. No one has ever learned why. Bring me their story - and whatever it leads to - and he may yet have his bride."),
    L("The King", "Fine. Let it be his problem, not mine. Go, boy - and don't return empty-handed.")
  ],

  road: {
    title: "The Road to the Palace",
    intro: [L("", "Night patrols watch the road to the palace. A commoner caught out after curfew is sent back to the village gate.")],
    caught: ["Halt! Back the way you came!", "You there - not tonight!", "Curfew! Off with you!"]
  },

  towns: {

    oven: {
      title: "The Edge of a Distant City", sub: "the potters' quarter", env: "city", music: "bazaar",
      objective: "Find the couple who live in the old kiln",
      crowd: 10, guideAfter: 6,
      spots: [
        { x: 330, y: 760, name: "Neighbour", cfg: { robe: 0x7a5a3a, head: "doppi" }, miss: ["The old ones? Keep to themselves.", "Strange house, a kiln. I've never once seen them both outside it."] },
        { x: 840, y: 905, name: "Water-Carrier", cfg: { robe: 0x6a8a7a, head: "cap", holding: "jug" }, miss: ["Heavy work, this. No time for gossip.", "The kilns run along the city's edge. One of them hasn't smoked in years."] },
        { x: 1120, y: 865, name: "Potter", cfg: { body: "apron", robe: 0x8a5a3a, head: "wrap", headColor: 0xd9cdb4, beard: "full", build: 1.1 }, miss: ["This one? Fired every morning since my grandfather's day.", "You want the cold kiln. Keep going east - past the second chimney."] },
        { x: 1450, y: 960, name: "Child", cfg: { robe: 0x8a6a9a, child: true, mood: "kind" }, miss: ["I'm not allowed to talk to strangers!", "The quiet kiln is scary at night. There's a little light inside."] },
        { x: 1650, y: 905, name: "Old Man", face: 1, cfg: { robe: 0x5a4a3a, head: "turban", headColor: 0xe8dcc4, beard: "long", elder: true, mood: "kind" }, miss: ["A kiln? Do I look like I sleep in a kiln?", "They have one robe between them, those two. You'll know them by that."] },
        { x: 1785, y: 910, name: "Old Woman", face: -1, cfg: { body: "dress", robe: 0x6a5a6a, female: true, head: "scarf", headColor: 0xf6ecd8, elder: true }, miss: ["We live behind the dyer's, dear. Not in any kiln.", "They had a son, once. Nobody says his name any more."] },
        { x: 1960, y: 860, name: "Potter", cfg: { body: "apron", robe: 0x7a4a2a, head: "doppi", beard: "goatee", build: 1.05 }, miss: ["Mind the heat, stranger.", "Further east. The one with the cracked dome and weeds round the door."] },
        { x: 2290, y: 800, name: "Cart-Man", cfg: { robe: 0x5a7a8a, head: "turban", headColor: 0xe8dcc4, beard: "full" }, miss: ["Move along, I've a delivery.", "Kiln's that way, if that's your business. No smoke - you can't miss it."] },
        { x: 2420, y: 920, name: "Weaver", cfg: { body: "dress", robe: 0x5a3a6a, female: true, head: "scarf", headColor: 0x2fb8ac, pattern: "ikat", robe2: 0xd9a441 }, miss: ["Fine thread, if you're buying.", "Not much use to a wanderer, I'd think."] },
        { x: 3080, y: 900, name: "Brick-Maker", cfg: { body: "apron", robe: 0x9a6a4a, head: "cap", trim: 0x8e2f2f, beard: "mustache" }, miss: ["Bricks don't talk back. That's why I like them.", "West of here, the cold one. I'd wager you walked right past it."] },
        { x: 3390, y: 865, name: "Potter", cfg: { body: "apron", robe: 0x8a6a3a, head: "wrap", headColor: 0xe8dcc4, beard: "full", elder: true }, miss: ["This kiln's mine and it's lit, as you can see.", "The old couple? Back west. The kiln with no fire in it."] },
        { x: 3620, y: 905, name: "Melon-Seller", cfg: { body: "dress", robe: 0x8a5a3a, female: true, head: "scarf", headColor: 0xe2c04a, holding: "basket" }, miss: ["Melons! Sweet as honey!", "The kiln folk buy one melon a week, and split it two ways."] },
        { x: 2700, y: 880, name: "Oven-Keeper", target: true }
      ],
      dialogue: [
        L("Oven-Keeper", "We share one robe between us, stranger. There is little else worth telling."),
        L("Oven-Keeper", "But if you truly want it - there is a gravekeeper, east of here. Weeps day and night, they say, and has for twenty years."),
        L("Oven-Keeper", "Bring me his reason. Then, perhaps, I'll give you mine.")
      ]
    },

    graveyard: {
      title: "A Quiet Cemetery", sub: "east of the city", env: "cemetery", music: "grave",
      objective: "Find the gravekeeper among the graves",
      crowd: 5, guideAfter: 7,
      spots: [
        { x: 3980, y: 800, grave: "slab", miss: ["Fresh flowers. Someone still comes.", "A name carved deep, and a date long gone."] },
        { x: 3700, y: 965, grave: "box", miss: ["Nothing but weeds here.", "No one has visited in years."] },
        { x: 3400, y: 760, grave: "mound", miss: ["Empty. Untended."] },
        { x: 3150, y: 905, grave: "pole", miss: ["Rags tied to a pole, faded white. Someone grieved here, once."] },
        { x: 2850, y: 720, grave: "slab", miss: ["A cracked stone, no name at all."] },
        { x: 2500, y: 965, grave: "box", miss: ["Sunk deep into the earth. Old, this one."] },
        { x: 2250, y: 780, grave: "slab", miss: ["Somewhere to the west, someone is weeping."] },
        { x: 1950, y: 945, grave: "mound", miss: ["A child's grave. Small stones laid in a ring."] },
        { x: 1600, y: 720, grave: "pole", miss: ["Prayer ribbons - new ones, tied this week."] },
        { x: 1350, y: 965, grave: "slab", miss: ["'The keeper tends us all,' someone has scratched beneath the name."] },
        { x: 1050, y: 800, grave: "box", miss: ["The weeping is close now - just past the dead tree."] },
        { x: 780, y: 965, grave: "slab", miss: ["Nothing. Just stone and silence. The weeping comes from right by the gate."] },
        { x: 4150, y: 900, name: "Mourner", glow: true, cfg: { body: "dress", robe: 0x4a4a5a, female: true, head: "scarf", headColor: 0x2a2a3a, holding: "lantern", mood: "sad" }, miss: ["I come every Thursday, for my mother.", "The keeper? He sits by the west gate, at the far end. Always has."] },
        { x: 3550, y: 870, name: "Gravedigger", cfg: { body: "rags", robe: 0x5a5040, head: "wrap", headColor: 0x8a7a6a, beard: "full", holding: "staff" }, miss: ["Graves don't dig themselves.", "Twenty years he's been weeping. West, by the gate under the mulberry."] },
        { x: 2950, y: 830, name: "Old Mourner", glow: true, cfg: { body: "cloak", robe: 0x3e4048, head: "hood", beard: "full", elder: true, holding: "lantern", mood: "sad" }, miss: ["Leave an old man to his grief.", "Not me, friend. I only weep on holy days."] },
        { x: 2380, y: 870, name: "Young Man", cfg: { robe: 0x3a4a5a, head: "doppi", mood: "sad" }, miss: ["My brother's here. He fell from a roof.", "Follow the crying. It gets louder as you go west."] },
        { x: 1750, y: 860, name: "Reciter", cfg: { robe: 0x2a3a4a, head: "turban", headColor: 0xf2ecdc, beard: "long", holding: "staff" }, miss: ["I read for the dead. They're good listeners.", "The keeper? A broken man. He'll be by the gate, with his lantern."] },
        { x: 1200, y: 860, name: "Widow", glow: true, cfg: { body: "dress", robe: 0x3a3a4a, female: true, head: "scarf", headColor: 0x1a1a2a, holding: "lantern", elder: true, mood: "sad" }, miss: ["Shh. Can you hear him? Just there.", "He holds a lantern all night. As if someone might come back."] },
        { x: 900, y: 760, name: "Lamplighter", glow: true, cfg: { body: "cloak", robe: 0x4a4038, head: "hood", beard: "full", elder: true, holding: "lantern" }, miss: ["Every lamp in this place, I light it. Every night.", "The weeping one's not me, friend. Right by the gate, under the mulberry."] },
        { x: 470, y: 905, name: "Gravekeeper", target: true }
      ],
      dialogue: [
        L("Gravekeeper", "...Twenty years I've sat with a promise I never kept."),
        L("Gravekeeper", "It concerns someone called only 'the baker.' I don't even know if he's still alive - or still worth trusting."),
        L("Gravekeeper", "Bring me proof of that, and I'll finally speak.")
      ]
    },

    bakery: {
      title: "A Street of Ovens", sub: "the bakery that never sells", env: "bazaar", music: "dusk",
      objective: "Find the baker who never sells his bread",
      crowd: 14, guideAfter: 7, queues: [[860, 952, 3], [1700, 948, 2], [2560, 952, 3], [4270, 950, 2]],
      spots: [
        { x: 420, y: 760, name: "Tailor", cfg: { robe: 0x4a6a5a, head: "doppi", beard: "goatee" }, miss: ["Bread? Try further down.", "I only sew, friend."] },
        { x: 740, y: 890, name: "Baker", cfg: { body: "apron", robe: 0xa5553a, trim: 0xd9a441, head: "doppi", beard: "goatee", build: 1.1 }, miss: ["Fresh non! Two coppers a loaf!", "Me? I sell every loaf by noon. You want the one who never sells."] },
        { x: 1190, y: 945, name: "Fruit-Seller", cfg: { body: "dress", robe: 0x8a5a3a, female: true, head: "scarf", headColor: 0xe2c04a, holding: "basket" }, miss: ["That bakery? Strangest place in the city.", "His bread's the best on the street, and no one has ever bought a crumb."] },
        { x: 1330, y: 765, name: "Old Woman", cfg: { body: "dress", robe: 0x6a4a5a, female: true, head: "scarf", headColor: 0xf6ecd8, elder: true }, miss: ["In my day bread cost half a copper.", "There's one baker who'll not sell to anyone. Don't ask him why."] },
        { x: 1580, y: 880, name: "Baker", cfg: { body: "apron", robe: 0xb5553a, trim: 0xd9a441, head: "doppi", beard: "full", build: 1.15 }, miss: ["Queue's behind you, friend.", "The odd one? His shelves are always full. No queue, ever."] },
        { x: 1900, y: 885, name: "Porter", cfg: { robe: 0x9a6a8a, head: "wrap", headColor: 0xe8dcc4 }, miss: ["Careful, coming through!", "The baker you mean has a blue door. Further down."] },
        { x: 2110, y: 965, name: "Child", cfg: { robe: 0x8a8a4a, child: true, mood: "kind" }, miss: ["I like watching the loaves come out!", "Papa says the baker with the blue door never smiles."] },
        { x: 2440, y: 890, name: "Baker", cfg: { body: "apron", robe: 0x9a4a3a, trim: 0xd9a441, head: "doppi", beard: "mustache", build: 1.1 }, miss: ["Sesame or nigella?", "Not me. I'd sell my own grandmother's recipe for a copper."] },
        { x: 2790, y: 845, name: "Spice-Seller", cfg: { body: "dress", robe: 0x7a3a4a, female: true, head: "scarf", headColor: 0xd96a2a, pattern: "ikat", robe2: 0xd9a441 }, miss: ["Cumin, saffron, barberry!", "He bakes for the river, they say. Every single week."] },
        { x: 2990, y: 945, name: "Beggar", cfg: { body: "rags", robe: 0x6a8a9a, head: "wrap", headColor: 0x8a7a6a, beard: "full", elder: true, mood: "sad" }, miss: ["Spare bread, friend?", "He gives his to the river, not to me."] },
        { x: 3700, y: 965, name: "Water-Woman", cfg: { body: "dress", robe: 0x4a6a8a, female: true, head: "scarf", headColor: 0xf2ead8, holding: "jug" }, miss: ["Water's sweet from the street well.", "He gave me a loaf once, then asked for it back. Strange man."] },
        { x: 4150, y: 890, name: "Baker", cfg: { body: "apron", robe: 0xa86a3a, trim: 0xd9a441, head: "doppi", beard: "goatee", build: 1.2 }, miss: ["Last oven on the street - and the best.", "You walked right past him. Blue door, no customers."] },
        { x: 4460, y: 885, name: "Night-Watchman", cfg: { robe: 0x3a3a5a, head: "turban", headColor: 0xe8dcc4, beard: "full", holding: "staff" }, miss: ["Market closes at dark.", "The silent baker? Back the way you came. Blue door."] },
        { x: 3320, y: 890, name: "Baker", target: true }
      ],
      dialogue: [
        L("Baker", "Every week, bread. Never sold. I don't expect a stranger to understand why."),
        L("Baker", "Help me finish today's batch before it burns - maybe then I'll trust you enough to explain.")
      ],
      minigame: "BakeryGameScene"
    },

    saddler: {
      title: "The Saddler's Row", sub: "leather and brass", env: "saddler", music: "bazaar",
      objective: "Find the saddler who breaks his own work",
      crowd: 18, guideAfter: 8,
      spots: [
        { x: 380, y: 905, name: "Cobbler", cfg: { robe: 0x5a6a4a, head: "doppi" }, miss: ["Saddles aren't my trade.", "You want the one who breaks his own work. Further along the row."] },
        { x: 760, y: 885, name: "Leatherworker", cfg: { body: "apron", robe: 0x7a5a3a, head: "doppi", beard: "mustache" }, miss: ["Bridles, belts, the best in the city.", "Not me. I sell everything I make, and gladly."] },
        { x: 1060, y: 905, name: "Cart-Driver", cfg: { robe: 0x7a5a3a, head: "turban", headColor: 0xe8dcc4, beard: "full" }, miss: ["He builds one a year. Sells it. Buys it right back. Smashes it.", "Nobody's ever got a straight answer from him."] },
        { x: 1250, y: 880, name: "Stable-Hand", cfg: { robe: 0x9a8a5a, head: "cap", trim: 0x1f6f6f }, miss: ["Horses all through here, mind your step.", "He's particular about who he lets near his work."] },
        { x: 1480, y: 885, name: "Saddler", cfg: { robe: 0x6b4a2e, trim: 0xc9a24b, pattern: "stripes", head: "doppi", beard: "goatee", hair: 0x3a2a1a }, miss: ["Fine saddles, fair prices!", "The mad one? Look for splinters on the ground in front of his shop."] },
        { x: 1700, y: 905, name: "Tanner", cfg: { body: "apron", robe: 0x5a4a2a, head: "wrap", headColor: 0xd9cdb4, beard: "full" }, miss: ["Smells, doesn't it? That's the hides.", "He buys my best hides. Then he ruins them."] },
        { x: 1880, y: 845, name: "Trader", cfg: { body: "dress", robe: 0x8a6a9a, female: true, head: "scarf", headColor: 0xf6ecd8, holding: "basket" }, miss: ["Leatherwork, best in the city.", "Except his - never for sale, that one."] },
        { x: 2080, y: 880, name: "Child", cfg: { robe: 0x6a9a8a, child: true, mood: "kind" }, miss: ["He let me watch him work once!", "He talks to the saddle like it can hear him."] },
        { x: 2560, y: 965, name: "Water-Boy", cfg: { robe: 0x5a6a8a, child: true, holding: "jug" }, miss: ["Water for the horses!", "He's just there. Hear the mallet?"] },
        { x: 2880, y: 885, name: "Groom", cfg: { robe: 0x6a5a3a, head: "cap", trim: 0xd9a441 }, miss: ["This one bites. Don't.", "I bring him leather every spring. He never says thank you."] },
        { x: 3080, y: 885, name: "Saddler", cfg: { robe: 0x5a3a24, trim: 0xd9a441, pattern: "stripes", head: "doppi", beard: "full", hair: 0x2a1a10 }, miss: ["One saddle, two saddles - how many horses have you?", "Back west. You'll know him by the pieces at his feet."] },
        { x: 3560, y: 885, name: "Blacksmith", cfg: { body: "apron", robe: 0x3a3a3a, head: "cap", beard: "full", build: 1.2 }, miss: ["Stirrups, buckles, bits!", "He buys his iron from me and breaks it a year later."] },
        { x: 3740, y: 905, name: "Old Horseman", cfg: { robe: 0x4a5a6a, head: "kalpak", headColor: 0xf2ecdc, beard: "long", elder: true, holding: "staff" }, miss: ["I've ridden since before your father was born.", "Qahraton - now there was a rider. I've not heard that name in twenty years."] },
        { x: 3860, y: 885, name: "Saddler", cfg: { robe: 0x7a4a2e, trim: 0xc9a24b, pattern: "stripes", head: "doppi", beard: "mustache" }, miss: ["Leather from Bukhara, brass from Samarkand!", "Not me, friend. You've come too far."] },
        { x: 4180, y: 965, name: "Woman", cfg: { body: "dress", robe: 0x9a4a5a, female: true, head: "scarf", headColor: 0xd9a441, vest: 0x3a1a2a }, miss: ["Looking for a saddle for your sweetheart?", "Not that way. Back west - the one with the broken things."] },
        { x: 4600, y: 885, name: "Saddler", cfg: { robe: 0x6b4a2e, trim: 0xd9a441, pattern: "stripes", head: "turban", headColor: 0xe8dcc4, beard: "goatee" }, miss: ["Last shop on the row.", "You've come too far, friend. Much too far."] },
        { x: 2280, y: 880, name: "Saddler", target: true }
      ],
      dialogue: [
        L("Saddler", "One saddle a year. Sold, bought back, broken. Don't ask me why - I'm not sure I fully know myself."),
        L("Saddler", "If you've nothing better to do, help me finish this year's. Then we'll talk.")
      ],
      minigame: "SaddlerGameScene"
    },

    saddlerRevisit: {
      base: "saddler", title: "The Saddler's Row, Once More", grantClue: "swatch", objective: "Tell the saddler what became of Qahraton",
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
      base: "bakery", title: "The Street of Ovens, Once More", grantClue: "phrase", objective: "Show the baker the cloth with his mark",
      dialogue: [
        L("You", "The saddler is still alive. He gave me this - your mark, on the cloth from Qahraton's last order."),
        L("Baker", "...That's mine, yes."),
        L("Baker", "Years ago my family faced ruin over a debt. A go-between, working for a man I never met, quietly covered it - on one condition. Bread, every week, left at the river, no questions asked."),
        L("Baker", "One week, the sign that it had been collected simply never came. I kept baking anyway. Hope, mostly, by the end."),
        L("Baker", "The go-between once told me - if it ever came to this - to ask for 'the keeper of the west gate of the dead.'")
      ]
    },

    graveyardRevisit: {
      base: "graveyard", title: "The Cemetery, Once More", grantClue: "caseObtained", objective: "Bring the baker's words to the gravekeeper",
      dialogue: [
        L("You", "The baker is alive, and still keeping his half of something. He gave me a phrase - 'the keeper of the west gate of the dead.'"),
        L("Gravekeeper", "...That was real, then. He was real."),
        L("Gravekeeper", "Twenty years ago, I reached the grounds first - before the King's men. One attendant was still breathing. His last words begged me to carry a sealed case to 'the baker who owes the house a debt.'"),
        L("Gravekeeper", "I was afraid delivering it would look like confession. So I never did. I've wept less for the dead, these twenty years, than for my own cowardice."),
        L("Gravekeeper", "Take it - still sealed. And take his other words, half-finished: something about a kiln. A mother.")
      ]
    },

    ovenRevisit: {
      base: "oven", title: "The Kiln, One Last Time", objective: "Bring the sealed case home to the kiln",
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
    outro: [L("Baker", "There was a saddler, once, tied up in all this. If he still remembers me, so will I remember why I do this.")]
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
      L("You", "I'll manage."),
      L("Head Cook", "Read the ticket, gather what it asks for, and put it in the kazan. Burn the King's dinner and you'll wish the guard had turned you away.")
    ],
    outro: [L("Head Cook", "Fine. It was you. Go on, then - the King wants to see who's been showing him up.")]
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
    ],
    escape: [L("", "You lift the tea bowl, and under your breath you speak the old words. The carpet folded in your sleeve answers.")]
  },

  duel: {
    intro: [L("", "Twenty years ago. A moonlit orchard. You are King Sanobar, and the steward's attendants are already drawing their blades.")],
    qahratonEnter: [L("Qahraton", "So. The King finally came himself.")],
    victory: [L("", "Qahraton falls. The orchard is silent. Somewhere behind you, Gul says something you'll spend twenty years trying to remember correctly.")]
  },

  ending: [
    L("", "The written account reaches the Minister, then the King - less impressed that the young man survived than that he came back at all, with knowledge he could easily have sold, and chose instead to spend months chasing down other people's grief."),
    L("", "The wedding runs forty days and forty nights."),
    L("", "Word of the letter reaches King Sanobar too, carried gently rather than as accusation. He does not free Gul - some things cut too deep, even twenty years on - but the iron cage becomes a guarded house instead. Confined still. No longer kept like an animal."),
    L("", "Whether she knew, that last night, that it was meant to be a farewell - no one ever asks her. She never says.")
  ],

  // Flights. length = seconds of flying at full speed. gap = the vertical
  // opening between the top of a tower and the lowest point of whatever
  // hangs above it, in pixels (start of the flight -> end). spacing = the
  // distance between gaps. hazards = what else is in the air; hazardRate =
  // the chance of one per gap (start -> end). top = what hangs above.
  flights: {
    desert: { title: "Over the Red Sands", music: "flight1", time: "day", sky: [0x3f86b8, 0x9fd0e0, 0xf3d9a4], ground: 0xd9a861, ridge: 0xc98d4f, ridge2: 0xa86a3a, city: 0xb0784a, tower: "minaret", top: "cloud", hazards: [], speed: 430, length: 42, gap: [400, 340], spacing: [560, 470] },
    wind: { title: "Through the Wind Gate", music: "flight2", time: "day", sky: [0x6f9ab8, 0xb9d4dc, 0xe4e6d6], ground: 0x8a9a6a, ridge: 0x7a8aa0, ridge2: 0x5a6a80, city: 0x6a7a88, tower: "spire", top: "cloud", hazards: ["bird"], hazardRate: [0.25, 0.5], speed: 450, length: 50, gap: [385, 325], spacing: [540, 450], wind: true },
    dusk: { title: "The Evening Road", music: "flight3", time: "dusk", sky: [0x2a2458, 0xb05a6a, 0xf0a060], ground: 0x5a3a4a, ridge: 0x6a3a5a, ridge2: 0x3a2440, city: 0x3a2440, tower: "dome", top: "cloud", hazards: ["bird", "bird", "falcon"], hazardRate: [0.3, 0.55], speed: 465, length: 56, gap: [375, 315], spacing: [520, 430] },
    day2: { title: "The Canyon of Archers", music: "flight4", time: "day", sky: [0x4a86b0, 0xd8c890, 0xe8b070], ground: 0xb07a4a, ridge: 0xa8603a, ridge2: 0x7a4026, city: 0x8a5232, tower: "rock", top: "rock", hazards: ["arrow", "archer", "archer"], hazardRate: [0.35, 0.6], speed: 480, length: 60, gap: [370, 305], spacing: [510, 420], intro: "Archers in the canyon - watch where they aim!" },
    storm: { title: "Into the Storm", music: "flight5", time: "storm", sky: [0x15141f, 0x2a2a3e, 0x4a4658], ground: 0x24222e, ridge: 0x2e2c3a, ridge2: 0x1e1c28, city: 0x1e1c28, tower: "tower", top: "cloud", hazards: ["bird", "falcon", "arrow", "archer"], hazardRate: [0.45, 0.75], speed: 495, length: 64, gap: [365, 300], spacing: [500, 410], storm: true },
    // the way back: shorter, but each with its own trouble
    escape: { title: "Out of Sanobar's City", music: "flight6", time: "night", sky: [0x0a0a20, 0x1e2246, 0x4a3a5a], ground: 0x2a2436, ridge: 0x2a2a48, ridge2: 0x1e1e34, city: 0x1c1a34, tower: "walltower", top: "cloud", hazards: ["archer", "archer", "falcon", "arrow"], hazardRate: [0.45, 0.7], speed: 470, length: 34, gap: [385, 330], spacing: [520, 450], intro: "The palace archers are awake. Keep moving!" },
    ovens: { title: "Over the Street of Ovens", music: "flight7", time: "dusk", sky: [0x2a2458, 0xb05a6a, 0xf0a060], ground: 0x5a3a3a, ridge: 0x6a3a5a, ridge2: 0x3a2440, city: 0x4a2a40, tower: "chimney", top: "cloud", hazards: ["smoke", "smoke", "bird"], hazardRate: [0.5, 0.75], speed: 460, length: 32, gap: [390, 335], spacing: [520, 450], intro: "Hot smoke lifts the carpet - fly low over the chimneys" },
    graves: { title: "Over the Moonlit Graves", music: "flight8", time: "night", sky: [0x080a1c, 0x1a2244, 0x3a4468], ground: 0x2a3030, ridge: 0x22283e, ridge2: 0x1a1e30, city: 0x1a1e30, tower: "cypress", top: "cloud", hazards: ["bat", "bat", "falcon"], hazardRate: [0.45, 0.7], speed: 455, length: 32, gap: [385, 330], spacing: [520, 450], intro: "Bats over the graves. They never fly straight." },
    sands: { title: "Through the Sandstorm", music: "flight9", time: "day", sky: [0xb07a4a, 0xd8a868, 0xe8c890], ground: 0xc89a5a, ridge: 0xb07a48, ridge2: 0x8a5a34, city: 0x9a6a42, tower: "pillar", top: "rock", hazards: ["bird", "arrow"], hazardRate: [0.35, 0.55], speed: 470, length: 32, gap: [385, 330], spacing: [520, 450], wind: true, sand: true, intro: "Sand in the air - the wind will shove you" },
    home: { title: "The Road Home", music: "flight10", time: "dawn", sky: [0x3a3a6a, 0xd890a0, 0xffd8a0], ground: 0x8aa064, ridge: 0x8a7aa0, ridge2: 0x6a5a80, city: 0x7a6070, tower: "poplar", top: "cloud", hazards: ["kite", "kite", "bird"], hazardRate: [0.5, 0.7], speed: 450, length: 30, gap: [395, 340], spacing: [540, 470], intro: "The village children are flying kites - mind the strings!" }
  },

  sequence: [
    { type: "hallOfSkulls", mode: "prologue" },
    { type: "villagePalace" },
    { type: "carpet", theme: "desert", toLabel: "the Kiln at the City's Edge" },
    { type: "town", key: "oven" },
    { type: "carpet", theme: "wind", toLabel: "the Gravekeeper's Cemetery" },
    { type: "town", key: "graveyard" },
    { type: "carpet", theme: "dusk", toLabel: "the Street of Ovens" },
    { type: "town", key: "bakery" },
    { type: "carpet", theme: "day2", toLabel: "the Saddler's Row" },
    { type: "town", key: "saddler" },
    { type: "carpet", theme: "storm", toLabel: "the City of King Sanobar" },
    { type: "kitchenGame" },
    { type: "hallOfSkulls", mode: "real" },
    { type: "duel" },
    { type: "carpet", theme: "escape", toLabel: "the Saddler" },
    { type: "town", key: "saddlerRevisit" },
    { type: "carpet", theme: "ovens", toLabel: "the Street of Ovens" },
    { type: "town", key: "bakeryRevisit" },
    { type: "carpet", theme: "graves", toLabel: "the Gravekeeper" },
    { type: "town", key: "graveyardRevisit" },
    { type: "carpet", theme: "sands", toLabel: "the Kiln" },
    { type: "town", key: "ovenRevisit" },
    { type: "carpet", theme: "home", toLabel: "Home" },
    { type: "ending" }
  ]
};

// Revisits borrow everything they don't override from the first visit.
Object.keys(STORY.towns).forEach(k => {
  const t = STORY.towns[k];
  if (!t.base) return;
  const b = STORY.towns[t.base];
  ["env", "music", "sub", "crowd", "queues", "guideAfter"].forEach(f => { if (t[f] === undefined) t[f] = b[f]; });
  if (!t.spots) t.spots = b.spots;
});
