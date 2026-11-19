var UncEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // core.js
  var core_exports = {};
  __export(core_exports, {
    D: () => data_exports,
    DEV_INFO: () => DEV_INFO,
    H: () => H,
    STAGE_NAME: () => STAGE_NAME,
    STAGE_REQ: () => STAGE_REQ,
    VERSION: () => VERSION,
    W: () => W,
    abilCd: () => abilCd,
    abilInfo: () => abilInfo,
    abilRange: () => abilRange,
    affixBand: () => affixBand,
    affixQuality: () => affixQuality,
    allKeys: () => allKeys,
    apply: () => apply,
    applyOp: () => applyOp,
    assembleCost: () => assembleCost,
    boonEarned: () => boonEarned,
    buildSpec: () => buildSpec,
    canAdvance: () => canAdvance,
    chestOpen: () => chestOpen,
    costOf: () => costOf,
    createRun: () => createRun,
    dailySighting: () => dailySighting,
    dayId: () => dayId,
    devKind: () => devKind,
    exploring: () => exploring,
    hashStr: () => hashStr,
    indexCtx: () => indexCtx,
    isHostile: () => isHostile,
    itemDef: () => itemDef,
    itemMods: () => itemMods,
    itemName: () => itemName,
    itemScale: () => itemScale,
    itemTags: () => itemTags,
    itemWeapon: () => itemWeapon,
    keyInfo: () => keyInfo,
    makeBoard: () => makeBoard,
    makeItem: () => makeItem,
    makeSingular: () => makeSingular,
    matCount: () => matCount,
    mkRng: () => mkRng,
    moveTiles: () => moveTiles,
    newPlayer: () => newPlayer,
    noticeRadius: () => noticeRadius,
    placeFor: () => placeFor,
    plan: () => plan,
    replay: () => replay,
    resonancesFor: () => resonancesFor,
    rollItem: () => rollItem,
    score: () => score,
    seekerItems: () => seekerItems,
    setsFor: () => setsFor,
    sheet: () => sheet,
    sightingBonus: () => sightingBonus,
    stageOf: () => stageOf,
    studyBand: () => studyBand,
    studyReach: () => studyReach,
    studyValue: () => studyValue,
    traitOffer: () => traitOffer,
    unitAt: () => unitAt,
    weaponRange: () => weaponRange,
    weekId: () => weekId,
    weeklyContract: () => weeklyContract,
    xpNext: () => xpNext
  });

  // data.js
  var data_exports = {};
  __export(data_exports, {
    ABILITIES: () => ABILITIES,
    AFFIXES: () => AFFIXES,
    ARCHETYPES: () => ARCHETYPES,
    ATTRS: () => ATTRS,
    ATTR_INFO: () => ATTR_INFO,
    BASES: () => BASES,
    BOONS: () => BOONS,
    CAL_MAX: () => CAL_MAX,
    CAT_NAME: () => CAT_NAME,
    CONTRACT_TYPES: () => CONTRACT_TYPES,
    DISMANTLE: () => DISMANTLE,
    FAMILIES: () => FAMILIES,
    FAMILY_NAME: () => FAMILY_NAME,
    FINDS: () => FINDS,
    FLORA: () => FLORA,
    GLYPHS: () => GLYPHS,
    LEVEL_CAP: () => LEVEL_CAP,
    LOCKS: () => LOCKS,
    MATERIALS: () => MATERIALS,
    MILESTONES: () => MILESTONES,
    MOD_TEXT: () => MOD_TEXT,
    PLACES: () => PLACES,
    RARITIES: () => RARITIES,
    RARITY_NAME: () => RARITY_NAME,
    RARITY_TABLE: () => RARITY_TABLE,
    REGIONS: () => REGIONS,
    RESONANCES: () => RESONANCES,
    SETS: () => SETS,
    SET_OF: () => SET_OF,
    SINGULARS: () => SINGULARS,
    SLOTS: () => SLOTS,
    SLOT_NAME: () => SLOT_NAME,
    SPECIALS: () => SPECIALS,
    SPECIES: () => SPECIES,
    SPECS: () => SPECS,
    SPEC_LEVEL: () => SPEC_LEVEL,
    STAT_MULT: () => STAT_MULT,
    TAG_NAME: () => TAG_NAME,
    TRAITS: () => TRAITS,
    TRAIT_LEVELS: () => TRAIT_LEVELS,
    VARIANTS: () => VARIANTS,
    WEEKDAYS: () => WEEKDAYS,
    WONDERS: () => WONDERS
  });
  var RARITIES = ["common", "uncommon", "rare", "epic", "exotic", "singular"];
  var RARITY_NAME = { common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic", exotic: "Exotic", singular: "Singular" };
  var SLOTS = ["weapon", "body", "head", "accessory", "implant", "device"];
  var SLOT_NAME = { weapon: "Weapon", body: "Body", head: "Head", accessory: "Accessory", implant: "Implant", device: "Device" };
  var FAMILIES = ["organic", "relic", "anomalous"];
  var FAMILY_NAME = { organic: "Organic", relic: "Relic", anomalous: "Anomalous" };
  var ATTRS = ["force", "precision", "vitality", "adaptation", "insight"];
  var ATTR_INFO = {
    force: ["Force", "+3% damage with Force weapons. Shoves hit harder."],
    precision: ["Precision", "+3% damage with Precision weapons. +1% critical chance."],
    vitality: ["Vitality", "+3 health."],
    adaptation: ["Adaptation", "+3% damage with Adaptation weapons. +4% healing done. Stronger Bleed and Poison."],
    insight: ["Insight", "+3% damage with Insight weapons. +3% ability and device power."]
  };
  var REGIONS = {
    verdant: {
      name: "The Verdant Galleries",
      short: "Verdant Galleries",
      code: "VG",
      blurb: "A rainforest grown through the display halls. The labels are still on the walls. Nothing is still behind them.",
      fam: { organic: 65, relic: 20, anomalous: 15 },
      fauna: ["thornling", "mossback", "glasswing", "dewhare", "lampmoth", "gulper", "carrion", "stalkbriar", "hush", "orchardmother"],
      flora: ["lantern_moss", "snare_vine", "heartfruit", "mirror_reed"],
      wonders: ["pocket_sun", "upside_pool", "growing_fossil", "painted_door"],
      boss: "orchardmother",
      elite: "hush",
      observe: "glasswing"
    },
    clockwork: {
      name: "The Clockwork Wilds",
      short: "Clockwork Wilds",
      code: "CW",
      blurb: "The keepers were machines. The exhibits were animals. After long enough, nobody could say which was which.",
      fam: { organic: 15, relic: 70, anomalous: 15 },
      fauna: ["mite", "pollinator", "coilfawn", "tickwren", "lamplighter", "warden", "latchjaw", "mantis", "regulator"],
      flora: ["copper_lily", "tick_fern", "mirror_reed"],
      wonders: ["counting_clock", "remembering_room", "painted_door"],
      boss: "regulator",
      elite: "mantis",
      observe: "coilfawn"
    }
  };
  var SPECIES = {
    thornling: {
      name: "Thornling",
      latin: "Spinifex gregarius",
      region: "verdant",
      weak: "relic",
      resist: "anomalous",
      hp: 12,
      dmg: [6, 8],
      armor: 0,
      move: 3,
      range: 1,
      ai: "pack",
      mat: "thorn_resin",
      blurb: "A seed pod that learned to walk and then learned to bite.",
      behavior: "Hunts in groups. Each other Thornling beside its target adds 2 to its bite. Alone it is mostly noise."
    },
    mossback: {
      name: "Mossback",
      latin: "Testudo hortensis",
      region: "verdant",
      weak: "anomalous",
      resist: "relic",
      hp: 38,
      dmg: [7, 10],
      armor: 2,
      move: 2,
      range: 1,
      ai: "grazer",
      mat: "living_sap",
      blurb: "A grazing animal with a garden on its back. The garden is older than the animal.",
      behavior: "Ignores you until something hurts it. After that it charges whoever is nearest and does not calm down."
    },
    glasswing: {
      name: "Glasswing",
      latin: "Vitrea fugax",
      region: "verdant",
      weak: "organic",
      resist: "anomalous",
      hp: 9,
      dmg: [2, 3],
      armor: 0,
      move: 5,
      range: 1,
      ai: "skittish",
      mat: "sporeglass",
      prey: true,
      blurb: "You can read the wall label through its wings.",
      behavior: "Keeps three tiles between itself and anyone. Leaves the room for good once wounded. Approach from two sides or not at all."
    },
    gulper: {
      name: "Gulper Vine",
      latin: "Faux radicans",
      region: "verdant",
      weak: "relic",
      resist: "anomalous",
      hp: 22,
      dmg: [7, 9],
      armor: 1,
      move: 0,
      range: 3,
      ai: "ambush",
      mat: "thorn_resin",
      blurb: "Filed under Flora for two centuries. The filing was wrong.",
      behavior: "Rooted. Drags the nearest Seeker within three tiles to its mouth, then bites. Stay four tiles out and it can do nothing."
    },
    carrion: {
      name: "Carrion Bloom",
      latin: "Necroflora ambulans",
      region: "verdant",
      weak: "relic",
      resist: "anomalous",
      hp: 19,
      dmg: [4, 6],
      armor: 0,
      move: 3,
      range: 1,
      ai: "scavenger",
      mat: "sporeglass",
      blurb: "A flower that walks to funerals.",
      behavior: "Goes for remains before it goes for you. Each body it eats heals it and sharpens its bite. Eaten remains yield no material."
    },
    hush: {
      name: "Hush",
      latin: "Silens silens",
      region: "verdant",
      weak: "organic",
      resist: "anomalous",
      hp: 36,
      dmg: [8, 11],
      armor: 0,
      move: 4,
      range: 1,
      ai: "predator",
      mat: "living_sap",
      elite: true,
      blurb: "The catalogue entry is a blank plate with claw marks on the frame.",
      behavior: "Picks whoever stands alone, and prefers anyone already bleeding. Its bite opens a wound. Keep the squad shoulder to shoulder."
    },
    stalkbriar: {
      name: "Stalkbriar",
      latin: "Rubus insidians",
      region: "verdant",
      weak: "relic",
      resist: "anomalous",
      hp: 22,
      dmg: [5, 7],
      armor: 0,
      move: 4,
      range: 1,
      ai: "predator",
      mat: "thorn_resin",
      hunts: true,
      blurb: "A thicket that learned patience. The hall thins out wherever one has been sleeping.",
      behavior: "Hunts Dewhares and Lampmoths when one is closer than you are. Left alone it eats and lies down. Step inside three tiles and you are the nearer meal."
    },
    dewhare: {
      name: "Dewhare",
      latin: "Lepus roridus",
      region: "verdant",
      weak: "organic",
      resist: "anomalous",
      hp: 8,
      dmg: [1, 2],
      armor: 0,
      move: 5,
      range: 1,
      ai: "skittish",
      mat: "living_sap",
      prey: true,
      blurb: "It carries its water on its back and listens with its whole body.",
      behavior: "Keeps its distance and bolts when hurt. Where a herd is calm, nothing is hunting nearby. Where it scatters, look the other way."
    },
    lampmoth: {
      name: "Lampmoth",
      latin: "Phalaena lucerna",
      region: "verdant",
      weak: "organic",
      resist: "relic",
      hp: 5,
      dmg: [1, 1],
      armor: 0,
      move: 4,
      range: 1,
      ai: "skittish",
      mat: "sporeglass",
      prey: true,
      blurb: "It glows to find the others. In the Galleries the lamps answer first.",
      behavior: "Harmless. Goes to any lit lamp and circles it. Whatever hunts by sight follows the moths to the light."
    },
    orchardmother: {
      name: "The Orchardmother",
      latin: "Mater pomorum",
      region: "verdant",
      weak: "relic",
      resist: "anomalous",
      hp: 104,
      dmg: [13, 18],
      armor: 1,
      move: 2,
      range: 1,
      ai: "boss_orchard",
      mat: "living_sap",
      boss: true,
      blurb: "Every Thornling in the Galleries fell from her. She remembers each one.",
      behavior: "Drops two Thornlings every third turn. Roots the farthest Seeker in place. Kill the brood or kill the mother, but choose."
    },
    mite: {
      name: "Brass Mite",
      latin: "Acarus horologii",
      region: "clockwork",
      weak: "organic",
      resist: "relic",
      hp: 10,
      dmg: [5, 6],
      armor: 1,
      move: 4,
      range: 1,
      ai: "pack",
      mat: "filament",
      mech: true,
      blurb: "Built to clean the gears. Now it considers you a foreign object.",
      behavior: "Swarms. When one breaks, its mainspring lashes everything beside it for 3, friend or not. Break them where they cluster."
    },
    pollinator: {
      name: "Pollinator",
      latin: "Apis fabricata",
      region: "clockwork",
      weak: "anomalous",
      resist: "relic",
      hp: 15,
      dmg: [0, 0],
      armor: 0,
      move: 4,
      range: 4,
      ai: "mender",
      mat: "machine_sap",
      mech: true,
      blurb: "It tends metal flowers and anything else with a seam.",
      behavior: "Harmless. Repairs the most damaged machine within four tiles each turn. Flees if struck."
    },
    coilfawn: {
      name: "Coilfawn",
      latin: "Cervus elasticus",
      region: "clockwork",
      weak: "organic",
      resist: "relic",
      hp: 17,
      dmg: [2, 4],
      armor: 0,
      move: 4,
      range: 1,
      ai: "skittish",
      mat: "machine_sap",
      prey: true,
      blurb: "Half of it was born. Nobody has found the join.",
      behavior: "Shy. The Wardens were built to keep it in and now keep everything else out. Hurt one and every Warden in the room turns on you."
    },
    warden: {
      name: "Warden",
      latin: "Custos ferreus",
      region: "clockwork",
      weak: "anomalous",
      resist: "relic",
      hp: 42,
      dmg: [8, 10],
      armor: 3,
      move: 3,
      range: 1,
      ai: "sentinel",
      mat: "pulse_core",
      mech: true,
      blurb: "Its orders were to contain the exhibit. It has revised them to protect the exhibit.",
      behavior: "Stands down unless it is struck or a Coilfawn is harmed. It punishes whoever did the harm, Seeker or beast."
    },
    mantis: {
      name: "Arc Mantis",
      latin: "Mantis fulminans",
      region: "clockwork",
      weak: "organic",
      resist: "relic",
      hp: 33,
      dmg: [8, 11],
      armor: 1,
      move: 4,
      range: 1,
      ai: "predator",
      mat: "pulse_core",
      mech: true,
      elite: true,
      hunts: true,
      blurb: "It prays with both blades and something always answers.",
      behavior: "Hunts Coilfawn when one is closer than you are. That brings the Wardens down on it. You are allowed to watch."
    },
    latchjaw: {
      name: "Latchjaw",
      latin: "Canis serratus",
      region: "clockwork",
      weak: "organic",
      resist: "relic",
      hp: 24,
      dmg: [5, 7],
      armor: 1,
      move: 4,
      range: 1,
      ai: "predator",
      mat: "filament",
      mech: true,
      hunts: true,
      blurb: "Built to catch what got out. Nothing told it when to stop.",
      behavior: "Runs down Tickwrens and Coilfawn when one is closer than you are. Every Warden in the hall turns on it for that. Let them settle it, or step in."
    },
    tickwren: {
      name: "Tickwren",
      latin: "Troglodytes horarius",
      region: "clockwork",
      weak: "anomalous",
      resist: "relic",
      hp: 6,
      dmg: [1, 1],
      armor: 0,
      move: 5,
      range: 1,
      ai: "skittish",
      mat: "machine_sap",
      mech: true,
      prey: true,
      blurb: "It sings the hour. The hour is always wrong and always the same.",
      behavior: "A flock keeps its distance and scatters when one is hurt. The Wardens count them. Harm one and you answer for it."
    },
    lamplighter: {
      name: "Lamplighter",
      latin: "Lucifer pedester",
      region: "clockwork",
      weak: "organic",
      resist: "relic",
      hp: 14,
      dmg: [0, 0],
      armor: 1,
      move: 3,
      range: 1,
      ai: "lighter",
      mat: "filament",
      mech: true,
      blurb: "It walks the same round it walked when there were visitors. It still tips its lid to the empty benches.",
      behavior: "Harmless. Walks to any lamp that is dark and lights it. A lit lamp draws the hall to it, so the Lamplighter decides where everything gathers. Flees if struck."
    },
    regulator: {
      name: "The Regulator",
      latin: "Machina moderatrix",
      region: "clockwork",
      weak: "anomalous",
      resist: "relic",
      hp: 96,
      dmg: [11, 15],
      armor: 2,
      move: 1,
      range: 1,
      ai: "boss_regulator",
      mat: "pulse_core",
      mech: true,
      boss: true,
      blurb: "It kept the Wilds on schedule. The schedule ended. It did not.",
      behavior: "Marks a full row or column, then purges it on its next turn. Everything on the line is hit, its own machines included. Step off the line."
    }
  };
  var VARIANTS = {
    pale: { name: "Pale", note: "Bleached. Mends itself every turn." },
    gilded: { name: "Gilded", note: "Carries twice the material." },
    overgrown: { name: "Overgrown", note: "Half again as large, and hits to match." }
  };
  var FLORA = {
    lantern_moss: { name: "Lantern Moss", latin: "Bryum lucens", mat: "sporeglass", blurb: "Glows when watched. Studies made within two tiles of it count for one more." },
    snare_vine: { name: "Snare Vine", latin: "Laqueus repens", mat: "thorn_resin", blurb: "Lies flat across the path. The first thing to step on it is held for a turn." },
    heartfruit: { name: "Heartfruit", latin: "Cor dulce", mat: "living_sap", blurb: "Beats faintly. Whoever picks it recovers 8 health." },
    mirror_reed: { name: "Mirror Reed", latin: "Arundo speculum", mat: "phase_crystal", blurb: "Grows toward its own reflection. Rare in every hall." },
    copper_lily: { name: "Copper Lily", latin: "Lilium cupreum", mat: "filament", blurb: "Picking it earths the charge: 4 damage to every creature beside it." },
    tick_fern: { name: "Tick-tock Fern", latin: "Filix metronoma", mat: "machine_sap", blurb: "Unfurls once a second. Whoever picks it has one cooldown cut short." }
  };
  var WONDERS = {
    pocket_sun: { name: "The Pocket Sun", blurb: "A star the size of a plum, hung at head height. Somebody dusted it once.", effect: "While it shines, every living thing in the room recovers 2 health a turn." },
    upside_pool: { name: "The Upside Pool", blurb: "Water on the ceiling. It ripples when you speak.", effect: "Sightlines bend here. Ranged weapons reach one tile farther." },
    growing_fossil: { name: "The Growing Fossil", blurb: "Stone ribs, a hand longer than last season. The plinth has cracked to make room.", effect: "The first creature to die in this room gets back up at half health." },
    counting_clock: { name: "The Clock That Counts Up", blurb: "No hands. A number. The number is very large and it has just changed.", effect: "Time runs quick in here. Cooldowns recover twice as fast." },
    remembering_room: { name: "The Room That Remembers", blurb: "Your footprints are already on the floor, a little ahead of you.", effect: "The floor knows where you are going. Everyone moves one tile farther." },
    painted_door: { name: "A Door Painted on Nothing", blurb: "There is no wall behind it. It is locked from the other side.", effect: "Recording it shakes a sealed case loose from somewhere." },
    // Side places: off the way to the gate. Each can be seen from one hall and walked to. `seen` is how it looks from there.
    lit_knoll: { place: true, name: "The Lit Knoll", seen: "a light on the hill", blurb: "A lamp burning on a hill nobody has climbed. The oil is fresh.", effect: "Somebody keeps this lamp. They are not here." },
    hollow_giant: { place: true, name: "The Hollow Giant", seen: "a door in a great tree", blurb: "A tree wide as a gallery, with a door cut in it at Seeker height. The hinges are new.", effect: "Whoever cut the door has been living in the tree." },
    standing_glass: { place: true, name: "The Standing Glass", seen: "something glinting in the wet ground", blurb: "A ring of empty plinths in standing water, each with a glass dome that was never broken.", effect: "The domes were never filled. The labels were written first." },
    signal_mast: { place: true, name: "The Signal Mast", seen: "a mast blinking on the ridge", blurb: "A brass mast that blinks a pattern. The pattern is longer every time it repeats.", effect: "It is sending to something. Nothing has answered yet." },
    cold_foundry: { place: true, name: "The Cold Foundry", seen: "a chimney with no smoke", blurb: "A foundry the size of a chapel, cold for a long time. The moulds are still set out.", effect: "The moulds are for parts of something much larger than anything in the Wilds." },
    wound_orchard: { place: true, name: "The Wound Orchard", seen: "rows of something planted", blurb: "Brass saplings in straight rows, each with a key in its trunk. Some of the keys are still turning.", effect: "Somebody winds them. The earliest rows have run down." }
  };
  var MATERIALS = {
    thorn_resin: { name: "Thorn Resin", fam: "organic", blurb: "Sets harder than the thorn it came from." },
    living_sap: { name: "Living Sap", fam: "organic", blurb: "Keep the jar closed. It looks for the lid." },
    sporeglass: { name: "Sporeglass", fam: "organic", blurb: "Clear, light, and still technically alive." },
    filament: { name: "Conductive Filament", fam: "relic", blurb: "Hums near anything with a pulse." },
    machine_sap: { name: "Machine Sap", fam: "relic", blurb: "Oil that scabs over." },
    pulse_core: { name: "Pulse Core", fam: "relic", blurb: "Still counting. Nobody knows toward what." },
    phase_crystal: { name: "Phase Crystal", fam: "anomalous", blurb: "Weighs more on some days." }
  };
  var ARCHETYPES = {
    vanguard: {
      name: "Vanguard",
      seeker: "Hobb",
      bio: "Loaded freight at the Entrance for nine years. Walked in the day the door opened wider.",
      attr: { force: 5, precision: 2, vitality: 5, adaptation: 2, insight: 1 },
      abilities: ["brace", "shove", "riposte"],
      start: { weapon: "marrow_cleaver", body: "chitin_plate" },
      passive: "Stands firm: takes 1 less damage from every hit."
    },
    tracker: {
      name: "Tracker",
      seeker: "Sile",
      bio: "Counts everything. Has not yet said what the count is for.",
      attr: { force: 2, precision: 6, vitality: 3, adaptation: 2, insight: 2 },
      abilities: ["mark", "snare", "deadeye"],
      start: { weapon: "thorncaster", body: "barkweave" },
      passive: "Clean shot: +10 critical chance against targets at full health."
    },
    naturalist: {
      name: "Naturalist",
      seeker: "Oyelaran",
      bio: "Came to disprove the Cabinet. Stayed to draw it.",
      attr: { force: 1, precision: 3, vitality: 3, adaptation: 6, insight: 2 },
      abilities: ["mend", "spore_dart", "soothe"],
      start: { weapon: "spore_sling", body: "barkweave" },
      passive: "Light hands: studying a calm creature also takes a sample from it."
    },
    tinkerer: {
      name: "Tinkerer",
      seeker: "Tamsin-7",
      bio: 'A maintenance unit that stopped maintaining. Calls the Wardens "management".',
      attr: { force: 1, precision: 3, vitality: 3, adaptation: 2, insight: 6 },
      abilities: ["drone", "arc_pulse", "overclock"],
      start: { weapon: "pulse_rifle", body: "relay_harness" },
      passive: "Spare parts: devices have one extra charge."
    },
    firebrand: {
      name: "Firebrand",
      seeker: "Garrow",
      bio: "An exhibit that let itself out. Half lion, half eagle, all temper. Wants its own entry written properly.",
      attr: { force: 3, precision: 6, vitality: 1, adaptation: 2, insight: 3 },
      abilities: ["kindle", "fire_breath", "red_glare"],
      start: { weapon: "kindled_pair", body: "chitin_plate" },
      passive: "Twin blades: the dagger follows every weapon attack for 40%. Burns hot: every hit taken deals 1 more."
    }
  };
  var ABILITIES = {
    brace: { name: "Brace", ap: 1, cd: 2, target: "self", desc: "Gain a shield and draw the attention of every creature beside you." },
    shove: { name: "Shove", ap: 1, cd: 2, target: "enemy", range: 1, desc: "Strike and throw the target two tiles back. It takes extra damage if it hits something." },
    riposte: { name: "Riposte", ap: 1, cd: 3, target: "self", desc: "Until your next turn, strike back at anything that hits you in melee." },
    mark: { name: "Mark", ap: 0, cd: 3, target: "enemy", range: 5, desc: "Free. The target takes 25% more damage from everyone for 2 turns." },
    snare: { name: "Snare", ap: 1, cd: 3, target: "tile", range: 3, desc: "Set a trap on an empty tile. The first creature to step on it is hurt and held for 2 turns." },
    deadeye: { name: "Deadeye", ap: 2, cd: 2, target: "enemy", range: "weapon", desc: "A slow shot for 190% damage. Always critical against a Marked target." },
    mend: { name: "Mend", ap: 1, cd: 1, target: "ally", range: 3, desc: "Heal a Seeker within three tiles." },
    spore_dart: { name: "Spore Dart", ap: 1, cd: 1, target: "enemy", range: 4, desc: "Apply 3 Poison. Poison deals damage each turn and fades by one." },
    soothe: { name: "Soothe", ap: 1, cd: 4, target: "enemy", range: 3, desc: "Calm a creature for 2 turns. It stops hunting unless something hurts it. No effect on the great ones." },
    drone: { name: "Deploy Drone", ap: 1, cd: 4, target: "tile", range: 2, desc: "Launch a drone that shoots the nearest hostile each turn for 3 turns." },
    arc_pulse: { name: "Arc Pulse", ap: 1, cd: 2, target: "enemy", range: 3, desc: "Shock a target. The arc jumps to one creature beside it for half." },
    overclock: { name: "Overclock", ap: 1, cd: 3, target: "ally", range: 3, desc: "Another Seeker gains 2 action points now." },
    kindle: { name: "Kindle", ap: 0, cd: 4, target: "self", desc: "Free. Both blades catch fire for 2 turns. Every hit sets its target Burning." },
    fire_breath: { name: "Firebreath", ap: 2, cd: 3, target: "enemy", range: 2, desc: "Breathe fire over a creature and everything beside it. All of them are hurt and set Burning." },
    red_glare: { name: "Red Glare", ap: 1, cd: 2, target: "enemy", range: 5, desc: "Two red beams from the eyes. Strikes one distant creature and ignores its armor." }
    // spec upgrades reuse ids with flags in SPECS
  };
  var SPECS = {
    vanguard: [
      { id: "bulwark", name: "Bulwark", desc: "Brace also shields Seekers beside you. +2 armor." },
      { id: "retaliator", name: "Retaliator", desc: "Riposte hits 60% harder. Each hit you take adds 15% to your next attack." }
    ],
    tracker: [
      { id: "marksman", name: "Marksman", desc: "+1 weapon range. Your first critical hit each turn refunds 1 action point." },
      { id: "trapper", name: "Trapper", desc: "Snare cools down in 1 turn and its victims bleed." }
    ],
    naturalist: [
      { id: "medic", name: "Medic", desc: "Mend clears Bleed and Poison and leaves 2 turns of regeneration." },
      { id: "toxicologist", name: "Toxicologist", desc: "Your Poison hits 50% harder and jumps to a neighbour when its host dies." }
    ],
    tinkerer: [
      { id: "dronewright", name: "Dronewright", desc: "Drones last the whole room and hit 50% harder." },
      { id: "saboteur", name: "Saboteur", desc: "Arc Pulse stuns machines for a turn and Marks whatever it hits." }
    ],
    firebrand: [
      { id: "pyre", name: "Pyre", desc: "Burning lasts a turn longer and hits 50% harder." },
      { id: "cutthroat", name: "Cutthroat", desc: "The dagger follows for 70%. +15 critical chance against Burning targets." }
    ]
  };
  var TRAITS = {
    patient: { name: "Patient Hunter", desc: "+20% damage on turns you have not moved." },
    tissue: { name: "Adaptive Tissue", desc: "Bleed and Poison on you end a turn sooner." },
    curious: { name: "Curious Mind", desc: "Each Study counts for one more." },
    nerves: { name: "Unstable Nerves", desc: "+25% damage while under 40% health." },
    packmate: { name: "Pack Instinct", desc: "+15% damage to a target another Seeker already hit this turn." },
    light: { name: "Light Step", desc: "+1 movement." },
    forager: { name: "Forager", desc: "Picking flora does not cost an action point." },
    stubborn: { name: "Stubborn", desc: "The first time you would go down in a room, stay up at 1 health." }
  };
  var TRAIT_LEVELS = [5, 8];
  var SPEC_LEVEL = 3;
  var LEVEL_CAP = 10;
  var BASES = {
    thorncaster: { name: "Thorncaster", slot: "weapon", fam: "organic", w: [5, 8, 4, "precision"], tags: [], text: "Ranged 4. Scales with Precision." },
    marrow_cleaver: { name: "Marrow Cleaver", slot: "weapon", fam: "organic", w: [7, 10, 1, "force"], tags: [], text: "Melee. Scales with Force." },
    spore_sling: { name: "Spore Sling", slot: "weapon", fam: "organic", w: [4, 6, 3, "adaptation"], tags: ["poison"], m: { poisonHit: 1 }, text: "Ranged 3. Scales with Adaptation. Each hit applies 1 Poison." },
    pulse_rifle: { name: "Pulse Rifle", slot: "weapon", fam: "relic", w: [5, 8, 4, "precision"], tags: ["electric"], m: { pierce: 1 }, text: "Ranged 4. Scales with Precision. Ignores 1 armor." },
    arc_lance: { name: "Arc Lance", slot: "weapon", fam: "relic", w: [6, 9, 2, "insight"], tags: ["electric"], text: "Reach 2. Scales with Insight." },
    kindled_pair: { name: "Kindled Pair", slot: "weapon", fam: "relic", w: [5, 8, 1, "precision"], tags: [], text: "Melee. A sword and a dagger that take a flame. Scales with Precision." },
    echo_blade: { name: "Echo Blade", slot: "weapon", fam: "anomalous", w: [6, 8, 1, "force"], tags: ["spatial"], m: { echo: 35 }, text: "Melee. Scales with Force. 35% of each hit lands again next turn." },
    chitin_plate: { name: "Chitin Plate", slot: "body", fam: "organic", m: { armor: 3 }, tags: [], text: "" },
    barkweave: { name: "Barkweave Coat", slot: "body", fam: "organic", m: { armor: 1, hp: 8, regen: 1 }, tags: ["regen"], text: "" },
    relay_harness: { name: "Relay Harness", slot: "body", fam: "relic", m: { armor: 2, shieldStart: 6 }, tags: ["shield"], text: "" },
    mirror_carapace: { name: "Mirror Carapace", slot: "body", fam: "relic", m: { armor: 2, thorns: 2 }, tags: ["thorns"], text: "" },
    phase_shroud: { name: "Phase Shroud", slot: "body", fam: "anomalous", m: { armor: 1, phase: 1 }, tags: ["spatial"], text: "The first hit against you in each room passes through." },
    compound_lens: { name: "Compound Lens", slot: "head", fam: "organic", m: { study: 1 }, tags: ["study"], text: "" },
    targeting_visor: { name: "Targeting Visor", slot: "head", fam: "relic", m: { crit: 8 }, tags: ["crit"], text: "" },
    hunter_mask: { name: "Hunter's Mask", slot: "head", fam: "organic", m: { vsMarked: 12 }, tags: ["mark"], text: "" },
    oracle_shard: { name: "Oracle Shard", slot: "head", fam: "anomalous", m: { range: 1 }, tags: ["spatial"], text: "" },
    resin_charm: { name: "Resin Charm", slot: "accessory", fam: "organic", m: { healPow: 15 }, tags: ["regen"], text: "" },
    capacitor_band: { name: "Capacitor Band", slot: "accessory", fam: "relic", m: { abil: 12 }, tags: ["electric"], text: "" },
    bait_satchel: { name: "Bait Satchel", slot: "accessory", fam: "organic", m: { yield: 20 }, tags: ["yield", "lure"], text: "" },
    lucky_knot: { name: "Lucky Knot", slot: "accessory", fam: "anomalous", m: { crit: 5, critDmg: 20 }, tags: ["crit"], text: "" },
    leechroot: { name: "Leechroot", slot: "implant", fam: "organic", m: { leech: 3 }, tags: ["bleed"], text: "Your hits on Bleeding targets heal you for 3." },
    symbiote_graft: { name: "Symbiote Graft", slot: "implant", fam: "organic", m: { regen: 2 }, tags: ["symbiote"], text: "" },
    neural_shunt: { name: "Neural Shunt", slot: "implant", fam: "relic", m: { cdr: 1 }, tags: ["electric"], text: "" },
    venom_sac: { name: "Venom Sac", slot: "implant", fam: "organic", m: { poisonHit: 1 }, tags: ["poison"], text: "" },
    fold_gland: { name: "Fold Gland", slot: "implant", fam: "anomalous", m: { move: 1 }, tags: ["spatial"], text: "" },
    lure_pod: { name: "Lure Pod", slot: "device", fam: "organic", dev: "lure", tags: ["lure"], text: "Device. Throw a pod within 4 tiles. Creatures hunt the pod for 2 turns." },
    barrier_seed: { name: "Barrier Seed", slot: "device", fam: "organic", dev: "barrier", tags: ["shield"], text: "Device. A Seeker within 3 tiles gains a shield." },
    pulse_emitter: { name: "Pulse Emitter", slot: "device", fam: "relic", dev: "pulse", tags: ["electric"], text: "Device. Shock a tile within 3 and everything beside it." },
    drone_core: { name: "Drone Core", slot: "device", fam: "relic", dev: "drone", tags: ["drone"], text: "Device. Launch a drone for 3 turns." },
    blink_anchor: { name: "Blink Anchor", slot: "device", fam: "anomalous", dev: "blink", tags: ["spatial"], text: "Device. Step to any empty tile within 5. Free." },
    gravity_knot: { name: "Gravity Knot", slot: "device", fam: "anomalous", dev: "gravity", tags: ["spatial"], text: "Device. Drag every creature within 2 tiles of a point toward it and hold them a turn." }
  };
  var MOD_TEXT = {
    armor: "+{v} armor",
    hp: "+{v} health",
    regen: "Recover {v} health each turn",
    shieldStart: "Enter each room with a {v} shield",
    thorns: "Melee attackers take {v} damage",
    crit: "+{v}% critical chance",
    critDmg: "+{v}% critical damage",
    vsWounded: "+{v}% damage to targets under half health",
    vsFull: "+{v}% damage to targets at full health",
    vsMarked: "+{v}% damage to Marked targets",
    bleedHit: "{v}% chance to cause Bleed on hit",
    poisonHit: "Hits apply {v} Poison",
    switchTarget: "+{v}% damage when you change targets",
    sameTarget: "+{v}% damage per repeat hit on one target (up to 3)",
    pierce: "Ignore {v} armor",
    chain: "Hits arc to a neighbour for {v}%",
    echo: "{v}% of each hit lands again next turn",
    move: "+{v} movement",
    range: "+{v} weapon range",
    cdr: "Cooldowns are {v} turn shorter",
    poisonPot: "Your Poison deals {v}% more",
    bleedDur: "Your Bleed lasts {v} turns longer",
    healPow: "+{v}% healing done",
    killHeal: "Recover {v} health on a kill",
    study: "Each Study counts for {v} more",
    yield: "+{v}% material from kills and flora",
    rareFind: "Sealed cases are {v}% more likely to hold something rare",
    variantSense: "Variants are {v}% more likely to appear",
    abil: "+{v}% ability and device power",
    dmgPct: "+{v}% damage",
    leech: "Hits on Bleeding targets heal you for {v}",
    phase: "The first hit against you in each room passes through"
  };
  var AFFIXES = {
    keen: { pre: "Keen", suf: "of the Needle", cat: "off", key: "crit", r: [4, 10], slots: ["weapon", "head", "accessory"], fams: FAMILIES, tags: ["crit"] },
    brutal: { pre: "Brutal", suf: "of Ruin", cat: "off", key: "critDmg", r: [20, 45], slots: ["weapon", "implant", "accessory"], fams: FAMILIES, tags: ["crit"] },
    barbed: { pre: "Barbed", suf: "of the Cull", cat: "off", key: "vsWounded", r: [12, 24], slots: ["weapon", "implant"], fams: ["organic", "anomalous"], tags: [] },
    ambush: { pre: "Ambusher's", suf: "of First Blood", cat: "off", key: "vsFull", r: [15, 30], slots: ["weapon", "head"], fams: FAMILIES, tags: [] },
    serrated: { pre: "Serrated", suf: "of Bleeding", cat: "off", key: "bleedHit", r: [20, 40], slots: ["weapon", "implant", "accessory"], fams: ["organic"], tags: ["bleed"] },
    venomous: { pre: "Venomous", suf: "of the Adder", cat: "off", key: "poisonHit", r: [1, 2], slots: ["weapon", "implant"], fams: ["organic"], tags: ["poison"] },
    restless: { pre: "Restless", suf: "of Wandering", cat: "off", key: "switchTarget", r: [12, 25], slots: ["weapon", "accessory"], fams: FAMILIES, tags: [] },
    fixated: { pre: "Fixated", suf: "of Obsession", cat: "off", key: "sameTarget", r: [6, 12], slots: ["weapon", "accessory"], fams: ["relic", "anomalous"], tags: [] },
    piercing: { pre: "Piercing", suf: "of the Awl", cat: "off", key: "pierce", r: [1, 3], slots: ["weapon"], fams: ["relic", "organic"], tags: [] },
    arcing: { pre: "Arcing", suf: "of Storms", cat: "off", key: "chain", r: [25, 45], slots: ["weapon", "accessory"], fams: ["relic"], tags: ["electric"] },
    echoing: { pre: "Echoing", suf: "of Yesterday", cat: "off", key: "echo", r: [15, 30], slots: ["weapon", "implant"], fams: ["anomalous"], tags: ["spatial"] },
    tracking: { pre: "Stalker's", suf: "of the Hunt", cat: "off", key: "vsMarked", r: [10, 20], slots: ["weapon", "head", "accessory"], fams: ["organic", "relic"], tags: ["mark"] },
    plated: { pre: "Plated", suf: "of the Shell", cat: "def", key: "armor", r: [1, 3], slots: ["body", "head"], fams: FAMILIES, tags: [] },
    hale: { pre: "Hale", suf: "of the Ox", cat: "def", key: "hp", r: [6, 14], slots: ["body", "implant", "accessory"], fams: FAMILIES, tags: [] },
    warded: { pre: "Warded", suf: "of the Screen", cat: "def", key: "shieldStart", r: [4, 9], slots: ["body", "accessory", "device"], fams: ["relic", "anomalous"], tags: ["shield"] },
    spined: { pre: "Spined", suf: "of Nettles", cat: "def", key: "thorns", r: [2, 4], slots: ["body", "implant"], fams: ["organic", "relic"], tags: ["thorns"] },
    mending: { pre: "Mending", suf: "of Regrowth", cat: "bio", key: "regen", r: [1, 2], slots: ["body", "implant", "accessory"], fams: ["organic"], tags: ["regen"] },
    fleet: { pre: "Fleet", suf: "of the Hare", cat: "tac", key: "move", r: [1, 1], slots: ["body", "implant"], fams: FAMILIES, tags: [], min: 2 },
    farsight: { pre: "Farsighted", suf: "of the Horizon", cat: "tac", key: "range", r: [1, 1], slots: ["head", "accessory"], fams: ["relic", "anomalous"], tags: [], min: 2 },
    recursive: { pre: "Recursive", suf: "of the Loop", cat: "tac", key: "cdr", r: [1, 1], slots: ["accessory", "head", "device"], fams: ["relic"], tags: [], min: 2 },
    tuned: { pre: "Tuned", suf: "of the Engine", cat: "tac", key: "abil", r: [10, 22], slots: ["accessory", "head", "device", "implant"], fams: ["relic", "anomalous"], tags: [] },
    virulent: { pre: "Virulent", suf: "of Blight", cat: "bio", key: "poisonPot", r: [20, 45], slots: ["implant", "accessory", "weapon"], fams: ["organic"], tags: ["poison"] },
    lingering: { pre: "Lingering", suf: "of the Open Wound", cat: "bio", key: "bleedDur", r: [1, 2], slots: ["implant", "accessory"], fams: ["organic"], tags: ["bleed"] },
    nurturing: { pre: "Nurturing", suf: "of the Garden", cat: "bio", key: "healPow", r: [10, 25], slots: ["accessory", "head", "implant"], fams: ["organic"], tags: ["regen"] },
    symbiotic: { pre: "Symbiotic", suf: "of the Host", cat: "bio", key: "killHeal", r: [2, 4], slots: ["implant", "body"], fams: ["organic"], tags: ["symbiote"] },
    studious: { pre: "Studious", suf: "of the Notebook", cat: "dis", key: "study", r: [1, 1], slots: ["head", "accessory"], fams: FAMILIES, tags: ["study"] },
    gleaning: { pre: "Gleaning", suf: "of Plenty", cat: "dis", key: "yield", r: [15, 35], slots: ["accessory", "head", "device"], fams: FAMILIES, tags: ["yield"] },
    curator: { pre: "Curator's", suf: "of the Vault", cat: "dis", key: "rareFind", r: [5, 12], slots: ["accessory", "head"], fams: ["relic", "anomalous"], tags: [] },
    wayfinder: { pre: "Wayfinder's", suf: "of Strange Roads", cat: "dis", key: "variantSense", r: [30, 80], slots: ["head", "accessory", "device"], fams: FAMILIES, tags: [] }
  };
  var CAT_NAME = { off: "Offensive", def: "Defensive", tac: "Tactical", bio: "Biological", dis: "Discovery" };
  var SPECIALS = {
    swarm: { name: "Broodmother", slots: ["weapon"], fams: ["organic"], tags: [], text: "Every third kill hatches a Thornling that fights for you for 2 turns." },
    killrefund: { name: "Momentum", slots: ["weapon"], fams: FAMILIES, tags: [], text: "Your first kill each turn refunds 1 action point." },
    freemove: { name: "Unbound", slots: ["body", "implant"], fams: FAMILIES, tags: [], text: "Your first move each turn costs no action point." },
    studymark: { name: "Field Marks", slots: ["head"], fams: FAMILIES, tags: ["mark", "study"], text: "Studying a creature also Marks it for 2 turns." },
    knowledge: { name: "Learned", slots: ["head", "accessory"], fams: FAMILIES, tags: ["study"], text: "+5% damage for each Catalogue stage you hold on the target species." },
    overload: { name: "Overload", slots: ["accessory", "device"], fams: ["relic"], tags: ["electric"], text: "Abilities deal 40% more. Their cooldowns are 1 turn longer." },
    glass: { name: "Hollow", slots: ["weapon", "implant"], fams: ["anomalous"], tags: [], text: "+35% damage. 25% less health." },
    deathspore: { name: "Sporeburst", slots: ["weapon", "implant"], fams: ["organic"], tags: ["poison"], text: "Creatures you kill burst: 2 Poison to every hostile beside them." },
    twin: { name: "Twinned", slots: ["device"], fams: FAMILIES, tags: [], text: "This device has one extra charge in each room." },
    bloodscent: { name: "Bloodscent", slots: ["implant", "head"], fams: ["organic"], tags: ["bleed", "crit"], text: "Your hits on Bleeding targets are always critical." },
    anchor: { name: "Anchored", slots: ["body"], fams: ["relic"], tags: ["shield"], text: "You cannot be pushed, pulled or rooted. Seekers beside you gain 2 armor." },
    gambler: { name: "Gambler's", slots: ["accessory", "weapon"], fams: ["anomalous"], tags: ["crit"], text: "Damage rolls twice and keeps the better. Healing you receive is cut by 20%." }
  };
  var SINGULARS = {
    second_heart: {
      name: "The Second Heart",
      slot: "implant",
      fam: "organic",
      tags: ["symbiote", "regen"],
      m: { regen: 1 },
      text: "Once per expedition, a blow that would fell you leaves you standing at 30% health. Healing from others is cut by 15%.",
      lore: "It was in a jar marked SPARE."
    },
    hungry_compass: {
      name: "The Hungry Compass",
      slot: "accessory",
      fam: "anomalous",
      tags: ["spatial"],
      m: {},
      text: "+6% damage for every different species you have met on this expedition.",
      lore: "Points at whatever you have not seen yet."
    },
    borrowed_moment: {
      name: "The Borrowed Moment",
      slot: "accessory",
      fam: "relic",
      tags: ["electric"],
      m: {},
      text: "Every fourth ability you use costs no action points and has no cooldown.",
      lore: "Somebody will want it back."
    },
    unfinished_machine: {
      name: "The Unfinished Machine",
      slot: "device",
      fam: "relic",
      dev: "unfinished",
      tags: ["electric", "drone", "spatial"],
      m: {},
      text: "Device. Each turn it is a different device. Two charges a room.",
      lore: "The last page of the manual says only: or."
    },
    collectors_eye: {
      name: "The Collector's Eye",
      slot: "head",
      fam: "anomalous",
      tags: ["study", "mark"],
      m: { study: 2, variantSense: 100, rareFind: 10, dmgPct: -25 },
      text: "It would rather look than fight.",
      lore: "It blinks when you are not watching. You have checked."
    },
    yesterdays_rifle: {
      name: "Yesterday's Rifle",
      slot: "weapon",
      fam: "anomalous",
      w: [6, 9, 5, "precision"],
      tags: ["spatial"],
      m: { echo: 70 },
      text: "Ranged 5. Scales with Precision. Every shot lands twice: now, and again next turn wherever the target has gone.",
      lore: "The report arrives first."
    }
  };
  var RESONANCES = {
    bloodgarden: { name: "Bloodgarden", need: ["bleed", "bleed"], text: "When a Bleeding creature dies, every hostile beside it starts Bleeding." },
    chain_reaction: { name: "Chain Reaction", need: ["electric", "drone"], text: "Your drones' shots arc to a second target." },
    living_bastion: { name: "Living Bastion", need: ["regen", "symbiote"], text: "Any healing you receive also gives you half that much shield." },
    displaced_fate: { name: "Displaced Fate", need: ["crit", "spatial"], text: "Your critical hits throw the target one tile back." },
    feeding_frenzy: { name: "Feeding Frenzy", need: ["lure", "poison"], text: "Creatures hunting a lure take double Poison damage." },
    rebound: { name: "Rebound", need: ["shield", "thorns"], text: "When your shield breaks, everything beside you takes the shield's full value." },
    field_notes: { name: "Field Notes", need: ["study", "mark"], text: "Hitting a Marked creature counts as studying it." },
    red_harvest: { name: "Red Harvest", need: ["bleed", "yield"], text: "Creatures that die Bleeding leave one extra material." },
    galvanic_rot: { name: "Galvanic Rot", need: ["electric", "poison"], text: "Your hits deal +2 damage for each Poison on the target." }
  };
  var TAG_NAME = { bleed: "Bleed", poison: "Poison", electric: "Electric", drone: "Drone", regen: "Regrowth", symbiote: "Symbiote", crit: "Critical", spatial: "Spatial", lure: "Lure", shield: "Shield", thorns: "Thorns", study: "Study", mark: "Mark", yield: "Yield" };
  var RARITY_TABLE = {
    standard: [45, 35, 16, 3.5, 0.5, 0],
    elite: [20, 35, 30, 12, 3, 0],
    cache: [20, 35, 30, 12, 3, 0],
    chest: [8, 28, 38, 20, 6, 0],
    // hidden and locked, so worth more than a case left in the open
    contract: [10, 30, 38, 17, 5, 0],
    boss: [5, 20, 40, 27, 7.8, 0.2],
    weekly: [0, 10, 40, 35, 14, 1]
  };
  var DISMANTLE = [1, 2, 4, 7, 12, 0];
  var CAL_MAX = [1, 1, 2, 2, 3, 0];
  var STAT_MULT = [100, 102, 104, 106, 108, 108];
  var CONTRACT_TYPES = {
    pursue: { name: "Pursue", verb: "Bring down", text: "Find the great one at the end of the hall and end it." },
    observe: { name: "Observe", verb: "Observe", text: "Study the species and leave every one of them alive." },
    harvest: { name: "Harvest", verb: "Harvest", text: "Gather flora across the expedition." },
    recover: { name: "Recover", verb: "Recover", text: "A sealed case sits behind the great one in the last hall. Open it." }
  };
  var MILESTONES = [
    { id: "bench", name: "A place to work", need: "12 Catalogue entries", reward: "Workbench: refine and calibrate equipment", test: (c) => [c.entries, 12] },
    { id: "clockwork", name: "The second door", need: "24 Catalogue entries", reward: "The Clockwork Wilds open", test: (c) => [c.entries, 24] },
    { id: "tamsin", name: "A defector", need: "Catalogue any machine species", reward: "Tamsin-7 joins as Tinkerer", test: (c) => [c.mech, 1] },
    { id: "garrow", name: "An exhibit lets itself out", need: "Investigate 2 species", reward: "Garrow joins as Firebrand", test: (c) => [c.investigated, 2] },
    { id: "mutate", name: "Biological crafting", need: "Observe 3 species", reward: "Workbench: mutate an affix", test: (c) => [c.observed, 3] },
    { id: "variants", name: "An eye for the odd one", need: "Catalogue 1 variant", reward: "Variants appear 50% more often", test: (c) => [c.variants, 1] },
    { id: "bloom", name: "What should not be", need: "Record 1 Wonder", reward: "Bloom contracts: stranger rooms, better cases", test: (c) => [c.wonders, 1] },
    { id: "hunts", name: "Hunting licence", need: "Investigate 3 species", reward: "Hunt contracts: an elite in every room", test: (c) => [c.investigated, 3] },
    { id: "assemble", name: "Pattern book", need: "Catalogue 12 equipment types", reward: "Workbench: assemble any equipment you have catalogued", test: (c) => [c.bases, 12] },
    { id: "eye", name: "The complete Galleries", need: "Observe every Verdant species and record its flora", reward: "Singular: The Collector's Eye", test: (c) => [c.verdantDone, c.verdantAll] }
  ];
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var PLACES = { verdant: ["lit_knoll", "hollow_giant", "standing_glass"], clockwork: ["signal_mast", "cold_foundry", "wound_orchard"] };
  var FINDS = {
    keepers_log: { place: "lit_knoll", name: "A keeper's ledger", look: "Under an oilcloth by the lamp post. The last page is still damp.", model: "survey", does: "notes", after: "Tallies of what passed the hill each night, in a careful hand." },
    buried_tin: { place: "lit_knoll", name: "A buried tin", look: "Sunk to the lid beside the path. It rattles when the ground is stamped.", model: "cache", does: "case", after: "A sealed case, packed in straw." },
    warm_stone: { place: "lit_knoll", name: "A warm stone", look: "The moss is worn off the top, as if something sleeps on it.", model: "lantern_moss", does: "mend", after: "The warmth goes right through. Everyone sits a while." },
    woven_nest: { place: "hollow_giant", name: "A woven nest", look: "Wider than Hobb is tall, and lined with something that catches the light.", model: "heartfruit", does: "mats", after: "The lining comes away in sheets." },
    carved_shelf: { place: "hollow_giant", name: "A carved shelf", look: "Cut into the heartwood. Rows of small things under dust sheets.", model: "crates", does: "case", after: "One of the things under the sheets is a sealed case." },
    bark_ledger: { place: "hollow_giant", name: "Marks in the bark", look: "Hundreds of tallies cut at different heights. The lowest are the oldest.", model: "plinth", does: "notes", after: "A count of something, kept for years." },
    empty_dome: { place: "standing_glass", name: "An unbroken dome", look: "Nothing inside. The label on the plinth is already written.", model: "case_broken", does: "lore", after: "The label names something that has not been found yet." },
    drowned_case: { place: "standing_glass", name: "A drowned crate", look: "Just under the surface, lashed shut. The rope is recent.", model: "cache", does: "case", after: "A sealed case, bone dry inside." },
    still_reed: { place: "standing_glass", name: "A reed that does not move", look: "The others bend in the wind. This one is listening.", model: "mirror_reed", does: "notes", after: "It turns to follow whatever comes near. You learn what it has been following." },
    mast_log: { place: "signal_mast", name: "A punched tape", look: "Spooling out of the mast foot into a heap. Still coming.", model: "survey", does: "notes", after: "A record of everything that has walked under the mast." },
    relay_box: { place: "signal_mast", name: "A sealed relay box", look: "Bolted to the base. Something inside is ticking evenly.", model: "cache", does: "case", after: "A sealed case with a clock packed round it." },
    earth_rod: { place: "signal_mast", name: "A humming rod", look: "Driven into the ground. The air round it tastes of metal.", model: "lantern_moss", does: "mend", after: "Every joint and ache settles at once." },
    set_mould: { place: "cold_foundry", name: "A mould left set", look: "The casting was never broken out. It is the size of a door.", model: "plinth", does: "mats", after: "The casting splits cleanly into usable stock." },
    foremans_desk: { place: "cold_foundry", name: "A foreman's desk", look: "Drawers locked, one key left in the wrong lock.", model: "crates", does: "case", after: "The bottom drawer holds a sealed case." },
    pour_book: { place: "cold_foundry", name: "A pour book", look: "Every pour dated and signed. The last entry has no signature.", model: "survey", does: "lore", after: 'The last pour was for something called "the first of the large ones".' },
    run_down_tree: { place: "wound_orchard", name: "A run-down sapling", look: "Its key has stopped. It would take both hands to turn.", model: "heartfruit", does: "mats", after: "It sheds a handful of small parts as it winds." },
    winders_bag: { place: "wound_orchard", name: "A winder's satchel", look: "Hung on a branch at head height. Left, not lost.", model: "cache", does: "case", after: "A sealed case and a spare key." },
    row_marker: { place: "wound_orchard", name: "A row marker", look: "A brass stake with a number and a date. The date is tomorrow.", model: "plinth", does: "notes", after: "The stake lists what the row is meant to become." }
  };
  var GLYPHS = { verdant: ["Leaf", "Eye", "Spiral", "Star"], clockwork: ["Gear", "Valve", "Coil", "Bell"] };
  var LOCKS = {
    plates: { verdant: "Three marks are cut in the lid, in a row. The same marks are set in the floor of this place.", clockwork: "Three marks are stamped in the lid, in a row. The same marks are set in the floor of this place." },
    light: { verdant: 'Cut in the lid: "I open only where it is bright."', clockwork: 'Stamped in the lid: "I open only where it is bright."' },
    breath: { verdant: 'Cut in the lid: "I open when the hall has breathed."', clockwork: 'Stamped in the lid: "I open when the pipes have sung."' }
  };
  var SETS = {
    thornwarden: {
      name: "Thornwarden's Kit",
      lore: "Issued to the first keepers of the Verdant Galleries. Most of it grew back.",
      pieces: ["thorncaster", "barkweave", "hunter_mask", "leechroot"],
      bonus: { 2: { regen: 1 }, 3: { bleedHit: 15 }, 4: { vsWounded: 20, thorns: 2 } }
    },
    surveyor: {
      name: "Surveyor's Issue",
      lore: "Standard issue for a survey nobody finished.",
      pieces: ["pulse_rifle", "relay_harness", "targeting_visor", "capacitor_band", "drone_core"],
      bonus: { 2: { study: 1 }, 3: { crit: 6 }, 4: { range: 1, abil: 10 } }
    },
    folded: {
      name: "The Folded Wardrobe",
      lore: "Each piece is slightly somewhere else. Worn together they agree.",
      pieces: ["echo_blade", "phase_shroud", "oracle_shard", "lucky_knot", "fold_gland", "blink_anchor"],
      bonus: { 2: { move: 1 }, 3: { critDmg: 25 }, 4: { echo: 15, crit: 5 } }
    },
    gardener: {
      name: "Gardener's Rounds",
      lore: "What the Galleries were tended with, before they tended themselves.",
      pieces: ["spore_sling", "resin_charm", "symbiote_graft", "lure_pod"],
      bonus: { 2: { healPow: 15 }, 3: { regen: 1, yield: 20 }, 4: { poisonHit: 1, hp: 10 } }
    },
    butcher: {
      name: "Field Dresser",
      lore: "For taking a specimen apart where it fell.",
      pieces: ["marrow_cleaver", "chitin_plate", "compound_lens", "neural_shunt", "barrier_seed"],
      bonus: { 2: { armor: 1 }, 3: { killHeal: 4 }, 4: { dmgPct: 10, study: 1 } }
    },
    stormglass: {
      name: "Stormglass",
      lore: "Three pieces of one machine that was never assembled.",
      pieces: ["arc_lance", "mirror_carapace", "pulse_emitter"],
      bonus: { 2: { thorns: 2 }, 3: { abil: 15, shieldStart: 6 } }
    }
  };
  var SET_OF = {};
  for (const id in SETS) for (const b of SETS[id].pieces) SET_OF[b] = id;
  var BOONS = {
    whetstone: { name: "Whetted Edges", desc: "Every weapon hits 15% harder.", m: { dmgPct: 15 } },
    gallery_eye: { name: "Collector's Eye", desc: "+12 critical chance for everyone.", m: { critB: 12 } },
    wound_reader: { name: "Wound Reader", desc: "+30% damage to anything below half health.", m: { vsWounded: 30 } },
    first_blood: { name: "First Blood", desc: "+35% damage to anything at full health.", m: { vsFull: 35 } },
    serrated: { name: "Serrated Fittings", desc: "Weapon hits have a 40% chance to open a bleeding wound.", m: { bleedHit: 40 } },
    venom_gland: { name: "Borrowed Venom", desc: "Every weapon hit applies 1 Poison.", m: { poisonHit: 1 } },
    capacitor: { name: "Spare Capacitor", desc: "Abilities and devices are 30% stronger.", m: { abil: 30 } },
    quick_fingers: { name: "Quick Fingers", desc: "Every ability is ready one turn sooner.", m: { cdr: 1 } },
    bark_wrap: { name: "Bark Wrap", desc: "Everyone enters each hall with a 6-point shield.", m: { shieldStart: 6 } },
    piercer: { name: "Needle Points", desc: "Weapons ignore 2 armor.", m: { pierce: 2 } },
    moss_poultice: { name: "Moss Poultice", desc: "Everyone recovers 2 health at the start of each turn.", m: { regen: 2 } },
    plate_rivets: { name: "Plate Rivets", desc: "+1 armor for everyone.", stat: { armor: 1 } },
    long_stride: { name: "Long Stride", desc: "Everyone moves one tile farther.", stat: { move: 1 } },
    heartfruit: { name: "Heartfruit Preserve", desc: "+8 health for everyone, and the whole party is mended now.", stat: { max: 8 }, mend: true },
    field_kit: { name: "Field Kit", desc: "The walk between halls restores 40% health, not 15%.", flag: "fieldKit" },
    soft_step: { name: "Soft Step", desc: "Residents notice the party from one tile closer than they would.", flag: "softStep" },
    ember_oil: { name: "Ember Oil", desc: "Every weapon hit sets its target Burning.", flag: "emberOil" }
  };

  // core.js
  var VERSION = 26;
  var W = 14;
  var H = 10;
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mkRng(seed) {
    let s = seed >>> 0;
    const next = () => {
      s = s + 1831565813 >>> 0;
      let t = s;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return (t ^ t >>> 14) >>> 0;
    };
    return { next, int: (n) => next() % n, range: (a, b) => a + next() % (b - a + 1), pct: (p) => next() % 1e4 < p * 100, pick: (a) => a[next() % a.length], get s() {
      return s;
    }, set s(v) {
      s = v >>> 0;
    } };
  }
  var R = (st) => {
    const r = mkRng(st.rs);
    const api = { next: () => {
      const v = r.next();
      st.rs = r.s;
      return v;
    } };
    api.int = (n) => api.next() % n;
    api.range = (a, b) => a + api.next() % (b - a + 1);
    api.pct = (p) => api.next() % 1e4 < p * 100;
    api.pick = (a) => a[api.next() % a.length];
    return api;
  };
  var fl = Math.floor;
  var tierScale = (t, per = 25) => 100 + per * (t - 1);
  var SCALED = /* @__PURE__ */ new Set(["armor", "hp", "shieldStart", "thorns", "killHeal", "leech"]);
  function itemDef(it) {
    return it.sing ? SINGULARS[it.sing] : BASES[it.base];
  }
  function itemName(it) {
    if (it.sing) return SINGULARS[it.sing].name;
    const b = BASES[it.base];
    const a = it.aff || [];
    return (a[0] ? AFFIXES[a[0].id].pre + " " : "") + b.name + (a[1] ? " " + AFFIXES[a[1].id].suf : "");
  }
  function itemTags(it) {
    const def = itemDef(it);
    const t = [...def.tags || []];
    for (const a of it.aff || []) t.push(...AFFIXES[a.id].tags);
    if (it.fx) t.push(...SPECIALS[it.fx].tags);
    return [...new Set(t)];
  }
  function itemScale(it) {
    return fl(tierScale(it.tier, 20) * (it.stat || 100) / 100 * (100 + 4 * (it.cal || 0)) / 100);
  }
  function itemWeapon(it) {
    const def = itemDef(it);
    if (!def.w) return null;
    const s = itemScale(it);
    return { min: Math.max(1, Math.round(def.w[0] * s / 100)), max: Math.max(1, Math.round(def.w[1] * s / 100)), range: def.w[2], scale: def.w[3], fam: def.fam };
  }
  function itemMods(it) {
    const def = itemDef(it);
    const m = {};
    const s = itemScale(it);
    for (const k in def.m || {}) m[k] = (m[k] || 0) + (SCALED.has(k) ? Math.max(1, Math.round(def.m[k] * s / 100)) : def.m[k]);
    for (const a of it.aff || []) {
      const k = AFFIXES[a.id].key;
      m[k] = (m[k] || 0) + a.v;
    }
    return m;
  }
  function affixBand(id, tier) {
    const a = AFFIXES[id];
    const sc = SCALED.has(a.key) ? tierScale(tier, 20) : 100;
    return [Math.round(a.r[0] * sc / 100), Math.round(a.r[1] * sc / 100)];
  }
  function rollAffixValue(r, id, tier, q) {
    const [lo, hi] = affixBand(id, tier);
    const span = hi - lo;
    if (span <= 0) return lo;
    const a = lo + Math.round(span * [0, 0.3, 0.7][q]);
    const b = lo + Math.round(span * [0.3, 0.7, 1][q]);
    return r.range(Math.min(a, b), Math.max(a, b));
  }
  function affixQuality(it, i) {
    const a = it.aff[i];
    const [lo, hi] = affixBand(a.id, it.tier);
    if (hi <= lo) return 2;
    const p = (a.v - lo) / (hi - lo);
    return p >= 0.7 ? 2 : p >= 0.3 ? 1 : 0;
  }
  function validAffixes(it, skipIdx = -1) {
    const def = itemDef(it);
    const rar = RARITIES.indexOf(it.rar);
    const have = /* @__PURE__ */ new Set(), cats = {};
    (it.aff || []).forEach((a, i) => {
      if (i === skipIdx) return;
      const A = AFFIXES[a.id];
      have.add(A.key);
      cats[A.cat] = (cats[A.cat] || 0) + 1;
    });
    for (const k in def.m || {}) if (k === "echo" || k === "phase") have.add(k);
    return Object.keys(AFFIXES).filter((id) => {
      const A = AFFIXES[id];
      return A.slots.includes(def.slot) && A.fams.includes(def.fam) && (A.min || 0) <= rar && !have.has(A.key) && (cats[A.cat] || 0) < 2;
    });
  }
  function rollQuality(r) {
    const x = r.int(100);
    return x < 30 ? 0 : x < 80 ? 1 : 2;
  }
  function makeItem(r, baseId, rarIdx, tier) {
    const it = { base: baseId, rar: RARITIES[rarIdx], tier, stat: fl(STAT_MULT[rarIdx] * r.range(95, 105) / 100), aff: [], seed: r.next() };
    const n = [0, 1, 2, 3, 3][rarIdx];
    for (let i = 0; i < n; i++) {
      const v = validAffixes(it);
      if (!v.length) break;
      const id = r.pick(v);
      it.aff.push({ id, v: rollAffixValue(r, id, tier, rollQuality(r)) });
    }
    if (rarIdx === 4 || rarIdx === 3 && r.pct(10)) {
      const def = BASES[baseId];
      const sp = Object.keys(SPECIALS).filter((k) => SPECIALS[k].slots.includes(def.slot) && SPECIALS[k].fams.includes(def.fam));
      if (sp.length) it.fx = r.pick(sp);
    }
    return it;
  }
  function makeSingular(r, id, tier) {
    return { sing: id, rar: "singular", tier, stat: 108, aff: [], seed: r.next() };
  }
  function weighted(r, table) {
    let tot = 0;
    for (const k in table) tot += table[k];
    let x = r.int(Math.round(tot * 100)) / 100;
    for (const k in table) {
      x -= table[k];
      if (x < 0) return k;
    }
    return Object.keys(table)[0];
  }
  function rollItem(r, o) {
    const tb = RARITY_TABLE[o.src].slice();
    if (o.rareFind) {
      const mv = Math.min(tb[0], o.rareFind);
      tb[0] -= mv;
      tb[2] += mv * 0.6;
      tb[3] += mv * 0.3;
      tb[4] += mv * 0.1;
    }
    if (o.singBonus && tb[5] > 0) {
      tb[5] += o.singBonus;
      tb[1] = Math.max(0, tb[1] - o.singBonus);
    }
    let x = r.int(1e4) / 100, rar = 0;
    for (let i = 0; i < 6; i++) {
      x -= tb[i];
      if (x < 0) {
        rar = i;
        break;
      }
    }
    if (rar === 5) return makeSingular(r, r.pick(Object.keys(SINGULARS).filter((k) => k !== "collectors_eye")), o.tier);
    const famT = { ...REGIONS[o.region].fam };
    if (o.target) {
      for (const f in famT) famT[f] *= 0.5;
      famT[o.target.fam] += 50;
    }
    if (o.src === "cache") famT.anomalous += 25;
    let fam = weighted(r, famT);
    if (o.target && o.src === "contract") fam = o.target.fam;
    let pool = Object.keys(BASES).filter((b) => BASES[b].fam === fam);
    if (o.target && r.pct(o.src === "contract" ? 70 : 35)) {
      const p2 = pool.filter((b) => BASES[b].slot === o.target.slot);
      if (p2.length) pool = p2;
    }
    return makeItem(r, r.pick(pool), rar, o.tier);
  }
  function xpNext(lvl) {
    return 150 + 110 * lvl;
  }
  function setsFor(items) {
    const n = {};
    for (const it of items) {
      if (it.sing) continue;
      const id = SET_OF[it.base];
      if (id) n[id] = (n[id] || 0) + 1;
    }
    return Object.keys(n).sort().map((id) => {
      const m = {};
      for (const need in SETS[id].bonus) if (n[id] >= +need) for (const k in SETS[id].bonus[need]) m[k] = (m[k] || 0) + SETS[id].bonus[need][k];
      return { id, n: n[id], m };
    });
  }
  function resonancesFor(items) {
    const tags = items.map(itemTags);
    const act2 = [];
    for (const id in RESONANCES) {
      const [a, b] = RESONANCES[id].need;
      let ok = false;
      for (let i = 0; i < tags.length && !ok; i++) for (let j = 0; j < tags.length; j++) if (i !== j && tags[i].includes(a) && tags[j].includes(b)) {
        ok = true;
        break;
      }
      if (ok) act2.push(id);
    }
    return { active: act2.slice(0, 2), dormant: act2.slice(2) };
  }
  function seekerItems(state, s) {
    return SLOTS.map((sl) => s.gear[sl] && state.items[s.gear[sl]]).filter(Boolean);
  }
  function sheet(state, sid, gearOverride) {
    const s = state.seekers[sid];
    const arch = ARCHETYPES[s.arch];
    const items = gearOverride || seekerItems(state, s);
    const m = {}, fx = {};
    let w = null, dev = null, devItem = null;
    for (const it of items) {
      const im = itemMods(it);
      for (const k in im) m[k] = (m[k] || 0) + im[k];
      if (it.fx) fx[it.fx] = 1;
      if (it.sing) fx[it.sing] = 1;
      const def = itemDef(it);
      if (def.w) w = itemWeapon(it);
      if (def.dev) {
        dev = def.dev;
        devItem = it;
      }
    }
    const sets = setsFor(items);
    for (const st0 of sets) for (const k in st0.m) m[k] = (m[k] || 0) + st0.m[k];
    const res = resonancesFor(items);
    for (const id of res.active) fx["res_" + id] = 1;
    for (const t of s.traits) fx["t_" + t] = 1;
    if (s.spec) fx["s_" + s.spec] = 1;
    fx["a_" + s.arch] = 1;
    const A = s.attr;
    if (!w) w = { min: 2, max: 4, range: 1, scale: "force" };
    let maxHp = 28 + 3 * A.vitality + 2 * s.lvl + (m.hp || 0);
    if (fx.glass) maxHp = fl(maxHp * 75 / 100);
    let range = w.range + (w.range > 1 || m.range ? m.range || 0 : 0);
    if (fx.s_marksman && w.range > 1) range += 1;
    return {
      sid,
      name: s.name,
      arch: s.arch,
      lvl: s.lvl,
      attr: { ...A },
      m,
      fx,
      res,
      sets,
      w: { ...w, range },
      maxHp,
      armor: (m.armor || 0) + (fx.s_bulwark ? 2 : 0),
      move: 3 + (m.move || 0) + (fx.t_light ? 1 : 0),
      crit: 5 + A.precision + (m.crit || 0),
      dev,
      devCharges: dev ? 1 + (fx.twin ? 1 : 0) + (fx.a_tinkerer ? 1 : 0) + (dev === "unfinished" ? 1 : 0) : 0,
      abilities: arch.abilities.slice(),
      tier: devItem ? devItem.tier : 1
    };
  }
  var ENC = {
    verdant: {
      standard: [[["thornling", 4]], [["thornling", 3], ["mossback", 1]], [["thornling", 3], ["gulper", 1]], [["thornling", 2], ["carrion", 1], ["mossback", 1]], [["thornling", 2], ["gulper", 1], ["carrion", 1], ["glasswing", 1]], [["thornling", 3], ["carrion", 1], ["glasswing", 1]], [["thornling", 2], ["stalkbriar", 1], ["dewhare", 2]], [["stalkbriar", 1], ["dewhare", 3], ["mossback", 1]], [["thornling", 3], ["dewhare", 2], ["carrion", 1]]],
      elite: [[["hush", 1], ["thornling", 3]], [["hush", 1], ["mossback", 1], ["carrion", 2]]],
      quiet: [[["mossback", 2], ["glasswing", 2]], [["glasswing", 2], ["mossback", 1], ["gulper", 1]], [["dewhare", 3], ["mossback", 1], ["stalkbriar", 1]]],
      boss: [[["orchardmother", 1], ["thornling", 3]]]
    },
    clockwork: {
      standard: [[["mite", 4]], [["mite", 3], ["pollinator", 1]], [["mite", 2], ["coilfawn", 2], ["warden", 1]], [["mite", 3], ["coilfawn", 1]], [["mite", 3], ["pollinator", 1], ["warden", 1]], [["mite", 2], ["latchjaw", 1], ["tickwren", 3]], [["latchjaw", 1], ["coilfawn", 2], ["warden", 1]], [["mite", 3], ["tickwren", 2]]],
      elite: [[["mantis", 1], ["coilfawn", 2], ["warden", 1]], [["mantis", 1], ["mite", 3]]],
      quiet: [[["coilfawn", 2], ["warden", 1], ["pollinator", 1]], [["coilfawn", 3], ["pollinator", 2]], [["tickwren", 3], ["coilfawn", 1], ["warden", 1], ["latchjaw", 1]]],
      boss: [[["regulator", 1], ["mite", 2], ["pollinator", 1]]]
    }
  };
  var NOTICE = { pack: 2, predator: 3, scavenger: 2 };
  var AMBIENT = { verdant: ["mossback", "glasswing", "lampmoth"], clockwork: ["coilfawn", "pollinator", "lamplighter"] };
  var MOOD0 = { pack: "roam", scavenger: "roam", predator: "roam", boss_orchard: "hostile", boss_regulator: "hostile", grazer: "docile", mender: "docile", lighter: "docile", sentinel: "docile", skittish: "wary", ambush: "territorial" };
  var md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  var K = (x, y) => y * W + x;
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  var inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  function createRun(spec) {
    const st = {
      spec,
      rs: spec.seed,
      tier: spec.tier,
      roomIdx: -1,
      uid: 1,
      units: [],
      outcome: null,
      turn: 0,
      turns: 0,
      heartUsed: false,
      kills3: {},
      res: { study: {}, samples: {}, seen: {}, variants: {}, flora: {}, wonders: {}, mats: {}, kills: {}, cases: [], xp: 0, dmgTaken: 0, floraN: 0, bossDown: false, objCache: false, obsKilled: false, rooms: 0, contractDone: false, read: {}, insight: 0 }
    };
    {
      const pr = mkRng((spec.seed ^ 20958) >>> 0 || 7);
      const pl = (PLACES[spec.region] || []).slice();
      for (let i = pl.length - 1; i > 0; i--) {
        const j = pr.next() % (i + 1);
        [pl[i], pl[j]] = [pl[j], pl[i]];
      }
      st.places = pl;
      st.side = null;
      st.wandered = {};
    }
    {
      const rr = mkRng((spec.seed ^ 12139) >>> 0 || 11);
      const LEN = spec.len || 3;
      st.route = [null];
      st.path = [];
      const forks = LEN - 2, rest = /* @__PURE__ */ new Set(), order = [];
      for (let i = 1; i <= forks; i++) order.push(i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = rr.next() % (i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
      for (const i of order) if (rest.size < Math.max(1, Math.floor(forks * 2 / 5)) && !rest.has(i - 1) && !rest.has(i + 1)) rest.add(i);
      for (let i = 1; i < LEN - 1; i++) {
        const p = rest.has(i) ? [rr.next() % 2 ? "standard" : "elite", "quiet"] : ["standard", "elite"];
        if (rr.next() % 2) p.reverse();
        st.route.push(p);
      }
    }
    st.boons = [];
    st.offer = null;
    st.bf = {};
    for (const sh of spec.squad) {
      st.units.push({ id: st.uid++, side: "s", kind: sh.arch, name: sh.name, sh, m: sh.m, fx: sh.fx, x: 0, y: 0, hp: sh.maxHp, max: sh.maxHp, armor: sh.armor, move: sh.move, shield: 0, ap: 2, cds: {}, charges: 0, abilN: 0, killN: 0 });
    }
    enterRoom(st, "standard", []);
    return st;
  }
  var seekers = (st) => st.units.filter((u) => u.side === "s");
  var alive = (u) => !u.dead && !u.fled;
  var friends = (st) => st.units.filter((u) => (u.side === "s" || u.side === "a") && alive(u));
  var creatures = (st) => st.units.filter((u) => u.side === "c" && alive(u));
  var unitAt = (st, x, y) => st.units.find((u) => alive(u) && u.x === x && u.y === y);
  var propAt = (st, x, y) => st.room.props.find((p) => !p.done && p.x === x && p.y === y);
  function solid(st, x, y) {
    if (!inb(x, y) || st.room.rock[K(x, y)]) return true;
    const p = propAt(st, x, y);
    return !!(p && !p.walk);
  }
  var free = (st, x, y) => !solid(st, x, y) && !unitAt(st, x, y);
  function addChest(st, r, lock) {
    const room = st.room;
    let best = null;
    for (let i = 0; i < 60; i++) {
      const x = r.range(5, W - 1), y = r.int(H);
      if (!free(st, x, y) || !DIRS.some(([dx, dy]) => free(st, x + dx, y + dy))) continue;
      let n = (y === 0 || y === H - 1 ? 2 : 0) + (x === W - 1 ? 1 : 0);
      for (const [dx, dy] of DIRS) if (inb(x + dx, y + dy) && room.rock[K(x + dx, y + dy)]) n += 2;
      if (!best || n > best.n) best = { x, y, n };
    }
    if (!best) return;
    const chest = { pid: room.pid++, kind: "chest", id: "chest", x: best.x, y: best.y, lock, open: lock === "plates" ? false : null, prog: 0 };
    room.props.push(chest);
    if (lock === "plates") {
      const g = [0, 1, 2, 3];
      for (let i = 3; i > 0; i--) {
        const j = r.int(i + 1);
        [g[i], g[j]] = [g[j], g[i]];
      }
      chest.seq = g.slice(0, 3);
      for (let k = 0; k < 4; k++) for (let i = 0; i < 80; i++) {
        const x = r.range(2, W - 2), y = r.int(H);
        if (free(st, x, y) && !room.props.some((p) => p.x === x && p.y === y)) {
          room.props.push({ pid: room.pid++, kind: "plate", id: "plate", glyph: k, x, y, walk: true });
          break;
        }
      }
    }
  }
  function chestOpen(st, p) {
    return p.lock === "plates" ? !!p.open : p.lock === "light" ? st.room.props.some((q) => q.kind === "fixture" && q.id === "lamp" && q.lit && !q.done) : st.room.props.some((q) => q.kind === "fixture" && q.id === "bellcap" && q.spent);
  }
  function onPlate(st, u, ev) {
    const pl = st.room.props.find((p) => p.kind === "plate" && p.x === u.x && p.y === u.y);
    const ch = st.room.props.find((p) => p.kind === "chest" && !p.done && p.lock === "plates");
    if (!pl || !ch || ch.open) return;
    if (pl.glyph === ch.seq[ch.prog]) {
      ch.prog++;
      if (ch.prog >= ch.seq.length) {
        ch.open = true;
        ev.push({ e: "plate", pid: pl.pid, ok: true, n: ch.prog, of: ch.seq.length }, { e: "unlock", pid: ch.pid, x: ch.x, y: ch.y });
      } else ev.push({ e: "plate", pid: pl.pid, ok: true, n: ch.prog, of: ch.seq.length });
    } else {
      ch.prog = pl.glyph === ch.seq[0] ? 1 : 0;
      ev.push({ e: "plate", pid: pl.pid, ok: ch.prog === 1, n: ch.prog, of: ch.seq.length, reset: true });
    }
  }
  function placeFor(st) {
    return !st.outcome && !st.side && st.roomIdx >= 0 && st.roomIdx < 2 && !st.wandered[st.roomIdx] ? st.places[st.roomIdx] || null : null;
  }
  function enterSide(st, id, ev) {
    const r = R(st);
    const reg = st.spec.region;
    const sk = seekers(st);
    st.side = { id, room: st.room, others: st.units.filter((u) => u.side !== "s"), at: sk.map((u) => [u.id, u.x, u.y]), turn: st.turn };
    st.wandered[st.roomIdx] = id;
    st.units = sk.slice();
    const room = st.room = { type: "side", place: id, rock: new Array(W * H).fill(0), props: [], traps: [], corpses: [], wonder: null, firstDeath: false, pid: 1 };
    for (let i = 0; i < 6; i++) room.rock[K(r.range(3, W - 1), r.int(H))] = 1;
    sk.forEach((u, i) => {
      u.x = 0;
      u.y = i % 4 + 3;
      u.ap = 2;
    });
    const spot = (minX, maxX = W - 1) => {
      for (let i = 0; i < 200; i++) {
        const x = r.range(minX, maxX), y = r.int(H);
        if (free(st, x, y)) return [x, y];
      }
      return null;
    };
    const c0 = spot(8, 11);
    if (c0) room.props.push({ pid: room.pid++, kind: "wonder", id, x: c0[0], y: c0[1], place: true });
    const finds = Object.keys(FINDS).filter((k) => FINDS[k].place === id);
    const risk = r.int(finds.length), wake = r.pct(40);
    finds.forEach((f, i) => {
      const p = spot(4, 12);
      if (p) room.props.push({ pid: room.pid++, kind: "find", id: f, x: p[0], y: p[1], wake: wake && i === risk });
    });
    if (r.pct(40)) addChest(st, r, "plates");
    for (let i = 0; i < 2; i++) {
      const p = spot(3);
      if (p) room.props.push({ pid: room.pid++, kind: "flora", id: r.pick(REGIONS[reg].flora.filter((f) => f !== "snare_vine")), x: p[0], y: p[1] });
    }
    for (const k of AMBIENT[reg] || []) if (r.pct(60)) {
      const p = spot(6);
      if (p) spawn(st, k, p[0], p[1], r, ev, true);
    }
    st.turn = 1;
    ev.push({ e: "side", id });
  }
  function leaveSide(st, ev) {
    const b = st.side;
    for (const c of st.room.corpses) addMat(st, c.mat, c.n);
    st.room = b.room;
    st.units = seekers(st).concat(b.others);
    for (const [id, x, y] of b.at) {
      const u = st.units.find((q) => q.id === id);
      if (u) {
        u.x = x;
        u.y = y;
        u.ap = 2;
      }
    }
    st.turn = b.turn;
    st.side = null;
    ev.push({ e: "side", id: null });
  }
  function offerBoons(st) {
    const LEN = st.spec.len || 3;
    if (st.roomIdx >= LEN - 1) {
      st.offer = null;
      return;
    }
    const br = mkRng((st.spec.seed ^ 45061) + st.roomIdx * 7919 >>> 0 || 13);
    const pool = Object.keys(BOONS).filter((k) => !st.boons.includes(k));
    const o = [];
    while (o.length < 3 && pool.length) o.push(pool.splice(br.next() % pool.length, 1)[0]);
    st.offer = o.length ? o : null;
  }
  function noticeRadius(st, c) {
    return st.room.props.some((p) => !p.done && p.lit && md(p, c) <= 1) ? 1 : Math.max(1, (NOTICE[c.ai] || 2) - (st.bf.softStep ? 1 : 0));
  }
  function boonEarned(st) {
    return !!st.offer && !st.side && st.room.type !== "quiet" && !creatures(st).some((c) => c.hunter && c.calm <= 0);
  }
  function takeBoon(st, id, ev) {
    const B = BOONS[id];
    st.boons.push(id);
    if (B.flag) st.bf[B.flag] = 1;
    for (const u of seekers(st)) {
      if (B.m) {
        u.m = { ...u.m };
        for (const k in B.m) u.m[k] = (u.m[k] || 0) + B.m[k];
      }
      if (B.stat) for (const k in B.stat) {
        u[k] += B.stat[k];
        if (k === "max" && alive(u)) u.hp += B.stat[k];
      }
      if (B.mend && alive(u)) u.hp = u.max;
    }
    ev.push({ e: "boon", id });
  }
  function enterRoom(st, type, ev) {
    const r = R(st);
    const sp = st.spec;
    const reg = sp.region;
    const last = st.roomIdx + 1 === (sp.len || 3) - 1;
    st.roomIdx++;
    st.turn = 1;
    st.units = st.units.filter((u) => u.side === "s");
    const room = st.room = { type, rock: new Array(W * H).fill(0), props: [], traps: [], corpses: [], wonder: null, firstDeath: false, pid: 1 };
    for (let tries = 0; tries < 30; tries++) {
      room.rock.fill(0);
      const n = r.range(6, 11);
      for (let i = 0; i < n; i++) room.rock[K(r.range(2, W - 1), r.int(H))] = 1;
      const seen = /* @__PURE__ */ new Set([0]), q = [[0, 0]];
      let open = 0;
      for (let i = 0; i < W * H; i++) if (!room.rock[i]) open++;
      while (q.length) {
        const [x, y] = q.pop();
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy;
          if (inb(nx, ny) && !room.rock[K(nx, ny)] && !seen.has(K(nx, ny))) {
            seen.add(K(nx, ny));
            q.push([nx, ny]);
          }
        }
      }
      if (seen.size === open) break;
    }
    const sk = seekers(st);
    sk.forEach((u, i) => {
      u.x = i % 2;
      u.y = Math.min(H - 1, 2 + i * 2);
      if (st.roomIdx > 0) {
        if (u.dead) {
          u.dead = false;
          u.hp = 0;
        }
        u.hp = Math.min(u.max, u.hp + fl(u.max * ((st.bf.fieldKit ? 40 : 15) + (type === "quiet" ? 35 : 0)) / 100));
      }
      u.shield = u.m.shieldStart || 0;
      u.shieldPeak = u.shield;
      u.cds = {};
      u.charges = u.sh.devCharges;
      u.phase = u.m.phase ? 1 : 0;
      u.ap = 2;
      u.bleed = u.poison = u.root = u.stun = u.mark = u.rip = u.taunt = u.regenT = u.burn = u.lit = 0;
      u.moved = false;
      u.freeUsed = false;
      u.killRef = false;
      u.critRef = false;
      u.last = null;
      u.streak = 0;
      u.wrath = 0;
      u.usedStub = false;
    });
    const spot = (minX) => {
      for (let i = 0; i < 200; i++) {
        const x = r.range(minX, W - 1), y = r.int(H);
        if (free(st, x, y)) return [x, y];
      }
      for (let x = W - 1; x >= 0; x--) for (let y = 0; y < H; y++) if (free(st, x, y)) return [x, y];
      return null;
    };
    let etype = type;
    if (last) etype = "boss";
    st.path.push(etype);
    const tpl = r.pick(ENC[reg][etype]).map((a) => a.slice());
    if (sp.intro && st.roomIdx === 0) {
      tpl.length = 0;
      tpl.push(["thornling", 2], ["mossback", 1]);
    }
    if (st.tier >= 3 && etype !== "boss") tpl[0][1]++;
    if (st.roomIdx >= 3 && etype !== "boss" && etype !== "quiet") tpl[0][1]++;
    if (st.tier >= 4 && etype === "boss") tpl[1][1]++;
    if (sp.mods.hunt && etype !== "elite" && etype !== "boss") tpl.push([REGIONS[reg].elite, 1]);
    if (sp.type === "observe" && etype !== "boss") tpl.push([REGIONS[reg].observe, etype === "quiet" ? 2 : 1]);
    if (etype !== "boss" && !(sp.intro && st.roomIdx === 0)) {
      for (const k of AMBIENT[reg] || []) if (!tpl.some((t) => t[0] === k) && r.pct(75)) tpl.push([k, 1]);
    }
    for (const [kind, n] of tpl) for (let i = 0; i < n; i++) {
      const p = spot(SPECIES[kind].boss ? 9 : 5);
      if (p) spawn(st, kind, p[0], p[1], r, ev, true);
    }
    if (sp.sight && st.roomIdx === 0 && !sp.intro) {
      const p = spot(6);
      if (p) {
        const u = spawn(st, sp.sight.kind, p[0], p[1], r, ev, true, sp.sight.variant);
        u.sight = true;
      }
    }
    const addProp = (kind, id, o = {}) => {
      const p = spot(2);
      if (p) room.props.push({ pid: room.pid++, kind, id, x: p[0], y: p[1], ...o });
    };
    let nf = type === "quiet" ? 3 : r.int(3);
    if (sp.type === "harvest") nf += last ? 2 : 1;
    if (sp.intro && st.roomIdx === 0) nf = 0;
    const fl0 = REGIONS[reg].flora;
    for (let i = 0; i < nf; i++) {
      let id = r.pick(fl0);
      if (id === "mirror_reed" && !r.pct(35)) id = fl0[0];
      addProp("flora", id, id === "snare_vine" ? { walk: true } : {});
    }
    if (sp.intro && st.roomIdx === 0) addProp("flora", "lantern_moss");
    if (last && sp.type === "recover") {
      let best = null;
      for (let x = W - 1; x >= 5 && !best; x--) for (let y = 0; y < H; y++) if (free(st, x, y)) {
        best = [x, y];
        break;
      }
      if (best) room.props.push({ pid: room.pid++, kind: "cache", id: "cache", x: best[0], y: best[1], obj: true });
    } else if (r.pct(type === "quiet" ? 60 : 25)) addProp("cache", "cache");
    const wch = sp.intro && st.roomIdx === 1 ? 100 : type === "quiet" ? 30 : sp.mods.bloom ? 40 : 10;
    if (!(sp.intro && st.roomIdx === 0)) {
      const nb = r.range(1, 2);
      for (let i = 0; i < nb; i++) addProp("fixture", "bellcap");
      addProp("fixture", "lamp");
      if (r.pct(60)) addProp("fixture", "case");
    }
    if (r.pct(wch)) {
      const id = sp.intro ? "pocket_sun" : r.pick(REGIONS[reg].wonders);
      room.wonder = id;
      addProp("wonder", id);
    }
    if (!(sp.intro && st.roomIdx === 0) && etype !== "boss" && r.pct(type === "quiet" ? 70 : 45)) addChest(st, r, r.pick(["plates", "light", "breath"]));
    for (let guard = 0; guard < 12; guard++) {
      const seen = /* @__PURE__ */ new Set([K(0, 3)]), q = [[0, 3]];
      while (q.length) {
        const [x, y] = q.pop();
        for (const [dx, dy] of DIRS) {
          const nx = x + dx, ny = y + dy, k = K(nx, ny);
          if (inb(nx, ny) && !seen.has(k) && !solid(st, nx, ny)) {
            seen.add(k);
            q.push([nx, ny]);
          }
        }
      }
      let open = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(st, x, y)) open++;
      if (seen.size >= open) break;
      const fxs = room.props.filter((p) => (p.kind === "fixture" || p.kind === "chest") && !p.done);
      if (!fxs.length) break;
      fxs[fxs.length - 1].done = true;
    }
    offerBoons(st);
    ev.push({ e: "room", idx: st.roomIdx, type });
  }
  function spawn(st, kind, x, y, r, ev, natural, force) {
    const S = SPECIES[kind];
    const hs = fl(tierScale(st.tier, 45) * (S.boss ? 150 : 140) / 100), ds = tierScale(st.tier, 36);
    const u = {
      id: st.uid++,
      side: "c",
      kind,
      name: S.name,
      ai: S.ai,
      x,
      y,
      max: fl(S.hp * hs / 100),
      dmg: [fl(S.dmg[0] * ds / 100), fl(S.dmg[1] * ds / 100)],
      armor: S.armor + fl((st.tier - 1) / 2),
      move: S.move,
      range: S.range,
      mood: natural || MOOD0[S.ai] !== "roam" ? MOOD0[S.ai] : "hostile",
      hunter: MOOD0[S.ai] === "roam" || MOOD0[S.ai] === "hostile",
      home: { x, y },
      shield: 0,
      studied: 0,
      tc: 0,
      bleed: 0,
      poison: 0,
      mark: 0,
      root: 0,
      stun: 0,
      calm: 0,
      echo: 0
    };
    if (natural && !S.boss && (force || r.pct(Math.min(40, 5 * (100 + (st.spec.variantBoost || 0)) / 100)))) {
      u.variant = force || r.pick(["pale", "gilded", "overgrown"]);
      if (u.variant === "overgrown") {
        u.max = fl(u.max * 150 / 100);
        u.dmg = [fl(u.dmg[0] * 130 / 100), fl(u.dmg[1] * 130 / 100)];
      }
      st.res.variants[kind + ":" + u.variant] = 1;
    }
    u.hp = u.max;
    st.units.push(u);
    st.res.seen[kind] = 1;
    if (ev && !natural) ev.push({ e: "spawn", id: u.id });
    return u;
  }
  function summon(st, owner, kind, x, y, ev) {
    const ts = tierScale(st.tier), pw = abilPow(owner);
    const base = { id: st.uid++, side: "a", kind, owner: owner.id, x, y, armor: 0, shield: 0, bleed: 0, poison: 0, mark: 0, root: 0, stun: 0, m: {}, fx: {} };
    let u;
    if (kind === "drone") u = { ...base, name: "Drone", max: fl(8 * ts / 100), dmg: [fl(3 * ts * pw / 1e4 * (owner.fx.s_dronewright ? 150 : 100) / 100), fl(5 * ts * pw / 1e4 * (owner.fx.s_dronewright ? 150 : 100) / 100)], range: 4, move: 0, turns: owner.fx.s_dronewright ? 99 : 3, chain: !!owner.fx.res_chain_reaction };
    else if (kind === "lure") u = { ...base, name: "Lure Pod", max: fl(10 * ts / 100), dmg: [0, 0], range: 0, move: 0, turns: 2 };
    else u = { ...base, name: "Thornling", kind: "thornling", max: fl(10 * ts / 100), dmg: [fl(3 * ts / 100), fl(5 * ts / 100)], range: 1, move: 3, turns: 2 };
    u.hp = u.max;
    st.units.push(u);
    ev.push({ e: "spawn", id: u.id });
    return u;
  }
  function reach(st, u, steps) {
    const dist = /* @__PURE__ */ new Map([[K(u.x, u.y), 0]]), par = /* @__PURE__ */ new Map(), q = [[u.x, u.y]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      const d = dist.get(K(x, y));
      if (d >= steps) continue;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = K(nx, ny);
        if (!inb(nx, ny) || dist.has(k) || !free(st, nx, ny)) continue;
        dist.set(k, d + 1);
        par.set(k, K(x, y));
        q.push([nx, ny]);
      }
    }
    return { dist, par };
  }
  function pathFrom(par, x, y) {
    const p = [];
    let k = K(x, y);
    while (par.has(k)) {
      p.unshift([k % W, fl(k / W)]);
      k = par.get(k);
    }
    return p;
  }
  function field(st, tx, ty) {
    const f = new Array(W * H).fill(99);
    f[K(tx, ty)] = 0;
    const q = [[tx, ty]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (inb(nx, ny) && f[K(nx, ny)] === 99 && !solid(st, nx, ny)) {
          f[K(nx, ny)] = f[K(x, y)] + 1;
          q.push([nx, ny]);
        }
      }
    }
    return f;
  }
  function moveTiles(st, u) {
    if (u.root > 0 && !u.fx.anchor) return /* @__PURE__ */ new Map();
    return reach(st, u, moveRange(st, u)).dist;
  }
  function moveRange(st, u) {
    return u.move + (st.room.wonder === "remembering_room" ? 1 : 0);
  }
  function weaponRange(st, u) {
    return u.sh.w.range + (st.room.wonder === "upside_pool" && u.sh.w.range > 1 ? 1 : 0);
  }
  function abilPow(u) {
    return 100 + 3 * u.sh.attr.insight + (u.m.abil || 0) + (u.fx.overload ? 40 : 0);
  }
  function heal(st, u, n, ev, fromOther) {
    if (u.dead || n <= 0) return 0;
    if (fromOther && u.fx.second_heart) n = fl(n * 85 / 100);
    if (fromOther && u.fx.gambler) n = fl(n * 80 / 100);
    const g = Math.min(n, u.max - u.hp);
    u.hp += g;
    if (u.fx && u.fx.res_living_bastion && n > 0) {
      u.shield += fl(n / 2);
      u.shieldPeak = Math.max(u.shieldPeak || 0, u.shield);
    }
    if (g > 0 || n > 0) ev.push({ e: "heal", id: u.id, n: g });
    return g;
  }
  function auraArmor(st, t) {
    if (t.side !== "s") return 0;
    return seekers(st).some((o) => o !== t && alive(o) && o.fx.anchor && md(o, t) === 1) ? 2 : 0;
  }
  function hurt(st, src, t, amt, ev, o = {}) {
    if (!alive(t) || amt <= 0) return 0;
    if (!o.dot) {
      amt = Math.max(1, amt - Math.max(0, t.armor + auraArmor(st, t) - (o.pierce || 0)));
      if (t.side === "s" && t.fx.a_vanguard) amt = Math.max(1, amt - 1);
      if (t.side === "s" && t.fx.a_firebrand) amt += 1;
      if (t.phase) {
        t.phase = 0;
        ev.push({ e: "text", id: t.id, msg: "Passes through" });
        return 0;
      }
      if (t.shield > 0) {
        const a = Math.min(t.shield, amt);
        t.shield -= a;
        amt -= a;
        ev.push({ e: "shield", id: t.id, n: a });
        if (t.shield === 0 && t.fx && t.fx.res_rebound) {
          const v = t.shieldPeak || a;
          for (const c of creatures(st)) if (md(c, t) === 1) hurt(st, t, c, v, ev, { dot: true });
          t.shieldPeak = 0;
        }
        if (amt <= 0) {
          provoke(st, src, t);
          return a;
        }
      }
    }
    t.hp -= amt;
    if (t.side === "s") {
      st.res.dmgTaken += amt;
      if (t.fx.s_retaliator) t.wrath = Math.min(45, (t.wrath || 0) + 15);
    }
    ev.push({ e: "hit", from: src ? src.id : 0, id: t.id, n: amt, crit: !!o.crit, dot: o.dot ? o.kind || "dot" : null, k: o.dot ? null : o.kind || null, eff: o.eff || null });
    if (src && src.side !== "c" && t.side === "c") t.byParty = 1;
    provoke(st, src, t);
    if (t.hp <= 0) kill(st, src, t, ev);
    return amt;
  }
  function provoke(st, src, t) {
    if (t.side !== "c") return;
    t.calm = 0;
    const beast = src && src.side === "c";
    if (t.mood === "asleep") {
      t.mood = "hostile";
      t.hunter = true;
    }
    if (t.mood === "roam" && !beast) t.mood = "hostile";
    if (t.ai === "grazer") {
      t.mood = "hostile";
      t.grudge = beast ? src.id : 0;
    }
    if (t.ai === "mender" || t.ai === "lighter") t.mood = "flee";
    if (t.ai === "sentinel" && src) {
      t.mood = "hostile";
      t.grudge = src.side === "c" ? src.id : 0;
    }
    if (SPECIES[t.kind].prey && src) {
      for (const w of creatures(st)) if (w.ai === "sentinel" && w !== src) {
        w.mood = "hostile";
        w.grudge = src.side === "c" ? src.id : 0;
        w.calm = 0;
      }
    }
  }
  function kill(st, src, t, ev) {
    if (t.side === "s") {
      if (t.fx.t_stubborn && !t.usedStub) {
        t.usedStub = true;
        t.hp = 1;
        ev.push({ e: "text", id: t.id, msg: "Stubborn" });
        return;
      }
      if (t.fx.second_heart && !st.heartUsed) {
        st.heartUsed = true;
        t.hp = fl(t.max * 30 / 100);
        ev.push({ e: "text", id: t.id, msg: "The Second Heart beats" });
        return;
      }
      t.hp = 0;
      t.dead = true;
      ev.push({ e: "down", id: t.id });
      return;
    }
    if (t.side === "a") {
      t.dead = true;
      ev.push({ e: "die", id: t.id });
      return;
    }
    if (st.room.wonder === "growing_fossil" && !st.room.firstDeath) {
      st.room.firstDeath = true;
      t.hp = fl(t.max / 2);
      ev.push({ e: "text", id: t.id, msg: "Gets back up" });
      return;
    }
    st.room.firstDeath = true;
    t.dead = true;
    t.hp = 0;
    ev.push({ e: "die", id: t.id });
    for (const w of st.units) if (w.grudge === t.id) {
      w.grudge = 0;
      if (w.ai === "sentinel" || w.ai === "grazer") w.mood = "docile";
    }
    const S = SPECIES[t.kind];
    const bled = t.bleed > 0, hadPoison = t.poison;
    st.res.kills[t.kind] = (st.res.kills[t.kind] || 0) + 1;
    st.res.samples[t.kind] = (st.res.samples[t.kind] || 0) + 1;
    if (!t.noLoot) st.res.xp += S.boss ? 75 : S.elite ? 35 : 8;
    if (S.boss) {
      st.res.bossDown = true;
      st.res.cases.push("boss");
    } else if (S.elite) st.res.cases.push("elite");
    if (t.kind === REGIONS[st.spec.region].observe && st.spec.type === "observe" && (src ? src.side !== "c" : t.byParty)) st.res.obsKilled = true;
    const corpse = { x: t.x, y: t.y, mat: S.mat, n: t.variant === "gilded" ? 2 : 1 };
    const k = src && src.side === "a" ? st.units.find((u) => u.id === src.owner) : src;
    if (k && k.side === "s") {
      if (bled && k.fx.res_red_harvest) corpse.n++;
      if (k.fx.killrefund && !k.killRef && alive(k)) {
        k.killRef = true;
        k.ap++;
        ev.push({ e: "text", id: k.id, msg: "+1 action" });
      }
      if (k.m.killHeal) heal(st, k, k.m.killHeal, ev);
      k.killN++;
      if (k.fx.swarm && k.killN % 3 === 0 && !solid(st, t.x, t.y)) summon(st, k, "thornling", t.x, t.y, ev);
      if (k.fx.deathspore) {
        for (const c of creatures(st)) if (md(c, t) === 1) {
          c.poison += 2;
          c.poisonPot = Math.max(c.poisonPot || 0, poisonPot(k));
          ev.push({ e: "status", id: c.id, s: "poison" });
        }
      }
      if (k.fx.s_toxicologist && hadPoison > 0) {
        const n = creatures(st).filter((c) => md(c, t) === 1)[0];
        if (n) {
          n.poison += hadPoison;
          n.poisonPot = Math.max(n.poisonPot || 0, poisonPot(k));
          ev.push({ e: "status", id: n.id, s: "poison" });
        }
      }
    }
    if (bled && seekers(st).some((s) => s.fx.res_bloodgarden)) {
      for (const c of creatures(st)) if (md(c, t) === 1) {
        c.bleed = Math.max(c.bleed, 2);
        c.bleedD = Math.max(c.bleedD || 0, 2 * st.tier);
        ev.push({ e: "status", id: c.id, s: "bleed" });
      }
    }
    if (!t.noLoot) {
      if (!unitAt(st, t.x, t.y)) st.room.corpses.push(corpse);
      else addMat(st, corpse.mat, corpse.n, null);
    }
    if (t.kind === "mite") {
      const v = fl(3 * tierScale(st.tier) / 100);
      for (const o of st.units.filter((u) => alive(u) && md(u, t) === 1)) hurt(st, null, o, v, ev, { dot: true, kind: "spark" });
    }
  }
  function addMat(st, mat, n, by) {
    let y = 0;
    for (const s of seekers(st)) y = Math.max(y, s.m.yield || 0);
    const tot = n * (100 + y);
    let k = fl(tot / 100);
    if (R(st).int(100) < tot % 100) k++;
    st.res.mats[mat] = (st.res.mats[mat] || 0) + k;
  }
  function poisonPot(u) {
    return (u.m.poisonPot || 0) + (u.fx.s_toxicologist ? 50 : 0) + 4 * u.sh.attr.adaptation;
  }
  function push(st, t, dx, dy, n, ev, src, bonus) {
    const S = t.side === "c" ? SPECIES[t.kind] : null;
    if (S && (S.boss || S.move === 0) || t.fx && t.fx.anchor) return;
    for (let i = 0; i < n; i++) {
      const nx = t.x + dx, ny = t.y + dy;
      if (free(st, nx, ny)) {
        t.x = nx;
        t.y = ny;
        ev.push({ e: "move", id: t.id, path: [[nx, ny]], shove: true });
        stepOn(st, t, ev);
        if (!alive(t)) return;
      } else {
        if (bonus) {
          const o = unitAt(st, nx, ny);
          hurt(st, src, t, bonus, ev, { dot: true, kind: "slam" });
          if (o && o.side === "c") hurt(st, src, o, bonus, ev, { dot: true, kind: "slam" });
        }
        return;
      }
    }
  }
  function stepOn(st, u, ev) {
    const p = st.room.props.find((p2) => !p2.done && p2.walk && p2.kind === "flora" && p2.x === u.x && p2.y === u.y);
    if (p) {
      p.done = true;
      if (!(u.fx && u.fx.anchor)) u.root = Math.max(u.root, 1);
      st.res.flora[p.id] = (st.res.flora[p.id] || 0) + 1;
      ev.push({ e: "text", id: u.id, msg: "Snared" }, { e: "prop", pid: p.pid });
      return true;
    }
    if (u.side === "c") {
      const i = st.room.traps.findIndex((t) => t.x === u.x && t.y === u.y);
      if (i >= 0) {
        const t = st.room.traps[i];
        st.room.traps.splice(i, 1);
        ev.push({ e: "trap", x: u.x, y: u.y });
        u.root = 2;
        if (t.bleed) {
          u.bleed = 3;
          u.bleedD = 2 * st.tier;
        }
        hurt(st, st.units.find((o) => o.id === t.owner), u, t.dmg, ev, { dot: true, kind: "trap" });
        return true;
      }
    }
    return false;
  }
  function walk(st, u, path, ev) {
    const done = [], tmp = [];
    for (const [x, y] of path) {
      u.x = x;
      u.y = y;
      done.push([x, y]);
      if (stepOn(st, u, tmp)) break;
    }
    if (done.length) ev.push({ e: "move", id: u.id, path: done });
    ev.push(...tmp);
  }
  function strike(st, u, t, ev, o = {}) {
    const r = R(st);
    const w = u.sh.w;
    const m = u.m, fx = u.fx;
    let roll = r.range(w.min, w.max);
    if (fx.gambler) roll = Math.max(roll, r.range(w.min, w.max));
    let pct = 100 + 3 * u.sh.attr[w.scale] + (m.dmgPct || 0);
    if (o.abil) pct += abilPow(u) - 100;
    if (t.hp * 2 < t.max) pct += m.vsWounded || 0;
    if (t.hp === t.max) pct += m.vsFull || 0;
    if (t.mark > 0) pct += m.vsMarked || 0;
    if (u.last !== null && u.last !== t.id) pct += m.switchTarget || 0;
    if (u.last === t.id) {
      u.streak = Math.min(3, u.streak + 1);
      pct += (m.sameTarget || 0) * u.streak;
    } else u.streak = 0;
    if (fx.t_patient && !u.moved) pct += 20;
    if (fx.t_nerves && u.hp * 100 < u.max * 40) pct += 25;
    if (fx.t_packmate && t.hitBy && t.hitBy !== u.id) pct += 15;
    if (fx.knowledge && t.side === "c") pct += 5 * ((st.spec.stages[t.kind] || 0) + 1);
    if (t.side === "c" && (st.spec.stages[t.kind] || 0) >= 2) pct += 10;
    if (t.side === "c" && st.res.read[t.kind]) pct += 15;
    if (fx.hungry_compass) pct += 6 * Object.keys(st.res.seen).length;
    if (fx.glass) pct += 35;
    if (u.wrath) {
      pct += u.wrath;
      u.wrath = 0;
    }
    let dmg = fl(roll * pct / 100 * (o.mult || 100) / 100);
    if (fx.res_galvanic_rot && t.poison) dmg += 2 * t.poison;
    let cc = u.sh.crit + (fx.a_tracker && t.hp === t.max ? 10 : 0) + (fx.s_cutthroat && t.burn > 0 ? 15 : 0) + (m.critB || 0);
    const known = t.side === "c" && u.side === "s" && st.res.read[t.kind] && !t.readHit && !SPECIES[t.kind].boss;
    if (known) t.readHit = 1;
    const crit = o.crit || known || fx.bloodscent && t.bleed > 0 || r.int(100) < cc;
    if (crit) dmg = fl(dmg * (150 + (m.critDmg || 0)) / 100);
    if (t.mark > 0) dmg = fl(dmg * 125 / 100);
    u.last = t.id;
    const wasMarked = t.mark > 0;
    const tx = t.x, ty = t.y;
    let eff = null;
    const TS = t.side === "c" ? SPECIES[t.kind] : null;
    if (TS && w.fam) {
      if (TS.weak === w.fam) {
        dmg = fl(dmg * 135 / 100);
        eff = "weak";
      } else if (TS.resist === w.fam) {
        dmg = fl(dmg * 70 / 100);
        eff = "resist";
      }
    }
    const dealt = hurt(st, u, t, dmg, ev, { pierce: m.pierce || 0, crit, eff });
    t.hitBy = t.hitBy || u.id;
    if (crit && fx.s_marksman && !u.critRef) {
      u.critRef = true;
      u.ap++;
      ev.push({ e: "text", id: u.id, msg: "+1 action" });
    }
    if (alive(t)) {
      if (m.bleedHit && r.int(100) < m.bleedHit) {
        t.bleed = 3 + (m.bleedDur || 0);
        t.bleedD = Math.max(t.bleedD || 0, 2 * st.tier + fl(u.sh.attr.adaptation / 3));
        ev.push({ e: "status", id: t.id, s: "bleed" });
      }
      if (m.poisonHit) {
        t.poison += m.poisonHit;
        t.poisonPot = Math.max(t.poisonPot || 0, poisonPot(u));
        ev.push({ e: "status", id: t.id, s: "poison" });
      }
      if (m.echo && dealt > 0) t.echo = (t.echo || 0) + fl(dealt * m.echo / 100);
      if (u.lit > 0 || st.bf.emberOil && u.side === "s") ignite(st, u, t, ev);
      if (crit && fx.res_displaced_fate) {
        const dx = Math.sign(t.x - u.x), dy = Math.sign(t.y - u.y);
        push(st, t, Math.abs(dx) >= Math.abs(dy) && dx ? dx : 0, Math.abs(dx) >= Math.abs(dy) && dx ? 0 : dy || 1, 1, ev, u, 0);
      }
      if (fx.res_field_notes && wasMarked) gainStudy(st, u, t, 1, ev);
    }
    if (m.leech && t.bleed > 0) heal(st, u, m.leech, ev);
    if (m.chain && !o.noChain && dealt > 0) {
      const n = creatures(st).filter((c) => c !== t && Math.abs(c.x - tx) + Math.abs(c.y - ty) === 1)[0];
      if (n) hurt(st, u, n, Math.max(1, fl(dealt * m.chain / 100)), ev, { dot: true, kind: "arc" });
    }
    if (fx.a_firebrand && !o.off && alive(t)) strike(st, u, t, ev, { off: true, noChain: true, mult: fx.s_cutthroat ? 70 : 40 });
    return dealt;
  }
  function ignite(st, u, t, ev) {
    if (!alive(t)) return;
    if (u && u.side !== "c") t.byParty = 1;
    t.burn = Math.max(t.burn || 0, 2 + (u.fx.s_pyre ? 1 : 0));
    t.burnD = Math.max(t.burnD || 0, fl((1 + st.tier + fl(u.sh.attr.insight / 3)) * (u.fx.s_pyre ? 150 : 100) / 100));
    ev.push({ e: "status", id: t.id, s: "burn" });
  }
  function studyReach(st, u) {
    let b = (u.m.study || 0) + (u.fx.t_curious ? 1 : 0);
    if (st.room.props.some((q) => !q.done && q.id === "lantern_moss" && md(q, u) <= 2)) b++;
    return b;
  }
  function studyBand(st, u, t) {
    const d = Math.max(1, md(u, t) - studyReach(st, u));
    return (d <= 1 ? 3 : d === 2 ? 2 : d === 3 ? 1 : 0) + (t.variant ? 2 : 0);
  }
  function studyValue(st, u, t) {
    return t ? Math.max(0, studyBand(st, u, t) - (t.studied || 0)) : 1;
  }
  function gainStudy(st, u, t, pts, ev) {
    const cap = t.variant ? 5 : 3;
    const g = Math.min(pts, cap - t.studied);
    if (g <= 0) return 0;
    t.studied += g;
    st.res.study[t.kind] = (st.res.study[t.kind] || 0) + g;
    st.res.xp += 2 * g;
    const e = { e: "study", id: t.id, by: u.id, n: g, left: cap - t.studied };
    if (t.studied >= cap && !st.res.read[t.kind]) {
      st.res.read[t.kind] = 1;
      e.read = true;
      if (!SPECIES[t.kind].boss) {
        st.res.insight = Math.min(3, st.res.insight + 1);
        e.insight = st.res.insight;
      }
      st.res.xp += 6;
    }
    ev.push(e);
    return g;
  }
  function isHostile(st, c) {
    if (c.side !== "c" || !alive(c) || c.calm > 0) return false;
    if (c.mood === "hostile") return !(c.grudge && st.units.some((u) => u.id === c.grudge && u.side === "c" && alive(u)));
    if (c.ai === "ambush") return seekers(st).some((s) => alive(s) && md(s, c) <= 3);
    return false;
  }
  function canAdvance(st) {
    return !st.outcome && !creatures(st).some((c) => isHostile(st, c));
  }
  function targetsOf(st, c) {
    if (c.grudge) {
      const g = st.units.find((u) => u.id === c.grudge && alive(u));
      if (g) return [g];
      if (c.ai === "sentinel") return [];
    }
    let t = friends(st);
    if (SPECIES[c.kind] && SPECIES[c.kind].hunts) t = t.concat(creatures(st).filter((o) => SPECIES[o.kind].prey));
    return t;
  }
  function pickTarget(st, c, ts) {
    if (c.side === "c" && st.spec.type === "observe") ts = ts.filter((t) => t.kind !== REGIONS[st.spec.region].observe);
    if (!ts.length) return null;
    const S = SPECIES[c.kind] || {};
    if (!S.boss) {
      const lure = ts.filter((t) => t.kind === "lure" && md(t, c) <= 6)[0];
      if (lure) return lure;
    }
    const taunt = ts.filter((t) => t.taunt > 0 && md(t, c) === 1)[0];
    if (taunt) return taunt;
    const f = field(st, c.x, c.y);
    let best = null, bs = 1e9;
    for (const t of ts) {
      let s = Math.min(...DIRS.map(([dx, dy]) => inb(t.x + dx, t.y + dy) ? f[K(t.x + dx, t.y + dy)] : 99)) * 10;
      if (c.ai === "predator") {
        if (t.bleed > 0) s -= 40;
        if (!friends(st).some((o) => o !== t && md(o, t) === 1)) s -= 30;
        if (t.side === "c") s -= 15;
      }
      s += t.id / 100;
      if (s < bs) {
        bs = s;
        best = t;
      }
    }
    return best;
  }
  function approach(st, c, t) {
    if (md(c, t) <= c.range) return null;
    if (c.move === 0 || c.root > 0) return null;
    const { dist, par } = reach(st, c, moveRange(st, c));
    const f = field(st, t.x, t.y);
    let best = null, bs = f[K(c.x, c.y)] * 10 + 5;
    for (const [k, d] of dist) {
      if (!d) continue;
      const x = k % W, y = fl(k / W);
      const inR = Math.abs(x - t.x) + Math.abs(y - t.y) <= c.range;
      const s = (inR ? 0 : f[k] * 10) + d / 10 + k / 1e3;
      if (s < bs) {
        bs = s;
        best = [x, y];
      }
    }
    return best ? { to: best, path: pathFrom(par, best[0], best[1]) } : null;
  }
  function plan(st, c) {
    if (c.mood === "asleep") return { k: "idle", label: "Sleeping" };
    if (c.stun > 0) return { label: "Stunned", k: "idle" };
    if (c.calm > 0) return { label: "Calmed", k: "idle" };
    const S = SPECIES[c.kind];
    const sk = seekers(st).filter(alive);
    if (c.side === "a") {
      if (c.kind === "drone") {
        const t3 = creatures(st).filter((o) => isHostile(st, o) && md(o, c) <= c.range).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
        return t3 ? { k: "atk", tgt: t3.id, label: "Firing" } : { k: "idle", label: "Scanning" };
      }
      if (c.kind === "lure") return { k: "idle", label: "Lure" };
      const t2 = pickTarget(st, c, creatures(st).filter((o) => isHostile(st, o)));
      if (!t2) return { k: "idle", label: "Waiting" };
      return { k: "atk", tgt: t2.id, mv: approach(st, c, t2), label: "Hunting" };
    }
    const lampOn = (c.mood === "roam" || c.ai === "skittish" && !sk.some((s) => md(s, c) <= 3)) && !S.boss ? st.room.props.filter((p) => !p.done && p.lit && md(p, c) <= 8).sort((a, b) => md(a, c) - md(b, c) || a.pid - b.pid)[0] : null;
    if (lampOn) return { k: "idle", mv: stepToward(st, c, lampOn, 2, 1), label: md(lampOn, c) <= 1 ? "Held by the light" : "Drawn to the light" };
    if (c.ai === "skittish") {
      let near = sk.filter((s) => md(s, c) <= 3);
      if (near.length === 1 && md(near[0], c) >= 2 && c.hp === c.max) return { k: "idle", label: "Watching you" };
      if (c.hp * 2 <= c.max && c.hp < c.max && !(c.bleed > 0 || c.mauled)) return { k: "flee", label: "Bolting" };
      if ((c.bleed > 0 || c.mauled) && c.hp < c.max) {
        const hunter = creatures(st).filter((o) => o !== c && (SPECIES[o.kind].ai === "predator" || SPECIES[o.kind].hunts)).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
        const away = hunter && c.root <= 0 ? DIRS.map((o) => [c.x + o[0], c.y + o[1]]).filter(([x, y]) => free(st, x, y)).sort((p, q) => Math.abs(q[0] - hunter.x) + Math.abs(q[1] - hunter.y) - (Math.abs(p[0] - hunter.x) + Math.abs(p[1] - hunter.y)))[0] : null;
        return away ? { k: "idle", mv: { to: away, path: [away] }, label: "Hurt, dragging itself away" } : { k: "idle", label: "Hurt, cornered" };
      }
      if (!near.length) {
        const o = DIRS[(c.id + st.turn) % 4];
        const x = c.x + o[0], y = c.y + o[1];
        return free(st, x, y) && c.root <= 0 ? { k: "idle", mv: { to: [x, y], path: [[x, y]] }, label: "Wary" } : { k: "idle", label: "Wary" };
      }
      const { dist, par } = reach(st, c, moveRange(st, c));
      const score2 = (x, y) => Math.min(...sk.map((s) => Math.abs(s.x - x) + Math.abs(s.y - y)));
      let best = null, bs = score2(c.x, c.y);
      for (const [k] of dist) {
        const x = k % W, y = fl(k / W);
        const s = score2(x, y);
        if (s > bs) {
          bs = s;
          best = [x, y];
        }
      }
      if (best && c.root <= 0) return { k: "idle", mv: { to: best, path: pathFrom(par, best[0], best[1]) }, label: "Keeping away" };
      const adj = near.filter((s) => md(s, c) === 1)[0];
      if (adj) return { k: "atk", tgt: adj.id, label: "Cornered" };
      return { k: "idle", label: "Wary" };
    }
    if (c.ai === "grazer" && c.mood === "docile") {
      const fl0 = st.room.props.filter((p) => !p.done && p.kind === "flora").sort((a, b) => md(a, c) - md(b, c) || a.pid - b.pid)[0];
      if (fl0 && md(fl0, c) <= 1) return { k: "idle", graze: fl0.pid, label: "Grazing" };
      return { k: "idle", mv: (c.id + st.turn) % 2 ? stepToward(st, c, fl0 || c.home, 1) : null, label: fl0 ? "Ambling to graze" : "Grazing" };
    }
    if (c.ai === "lighter") {
      if (c.mood === "flee") return { k: "flee", label: "Fleeing" };
      const lp = st.room.props.filter((p) => !p.done && p.kind === "fixture" && p.id === "lamp" && !p.lit).sort((a, b) => md(a, c) - md(b, c) || a.pid - b.pid)[0];
      if (!lp) return { k: "idle", mv: (c.id + st.turn) % 3 ? null : stepToward(st, c, c.home, 1), label: "Winding down" };
      return md(lp, c) <= 1 ? { k: "light", pid: lp.pid, label: "Lighting the lamp" } : { k: "idle", mv: stepToward(st, c, lp, 2, 1), label: "Walking its round" };
    }
    if (c.ai === "mender") {
      if (c.mood === "flee") return { k: "flee", label: "Fleeing" };
      const t2 = creatures(st).filter((o) => o !== c && SPECIES[o.kind].mech && o.hp < o.max && md(o, c) <= 4).sort((a, b) => a.hp / a.max - b.hp / b.max || a.id - b.id)[0];
      return t2 ? { k: "heal", tgt: t2.id, label: "Repairing" } : { k: "idle", label: "Tending" };
    }
    if (c.ai === "sentinel" && c.mood === "docile") return { k: "idle", label: "Standing guard" };
    if (c.ai === "ambush") {
      const t2 = sk.filter((s) => md(s, c) <= 3).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
      if (!t2) return { k: "idle", label: "Waiting" };
      if (md(t2, c) === 1) return { k: "atk", tgt: t2.id, label: "Biting" };
      return { k: "pull", tgt: t2.id, label: "Reaching" };
    }
    if (c.ai === "scavenger" && st.room.corpses.length) {
      const cs = st.room.corpses.map((o, i) => ({ o, i, d: md(o, c) })).sort((a, b) => a.d - b.d || a.i - b.i)[0];
      if (cs.d <= 1) return { k: "eat", ci: cs.i, label: "Feeding" };
      const mv = approach(st, { ...c, range: 1 }, cs.o);
      return { k: "eat", ci: cs.i, mv, label: "Going to feed" };
    }
    if (c.ai === "boss_orchard") {
      const n = c.tc + 1;
      if (c.falter) return { k: "idle", label: "Faltering" };
      if (n % 3 === 0) return { k: "seed", label: "Dropping brood" };
      const t2 = pickTarget(st, c, friends(st));
      const far = sk.slice().sort((a, b) => md(b, c) - md(a, c) || a.id - b.id)[0];
      return { k: "atk", tgt: t2 ? t2.id : 0, mv: t2 ? approach(st, c, t2) : null, root: n % 3 === 1 && far && md(far, c) > 1 ? far.id : 0, label: n % 3 === 1 ? "Rooting" : "Advancing" };
    }
    if (c.ai === "boss_regulator") {
      const t2 = pickTarget(st, c, friends(st));
      if (c.falter) return { k: "atk", tgt: t2 ? t2.id : 0, mv: t2 ? approach(st, c, t2) : null, label: "Faltering" };
      if (c.tele) return { k: "purge", tgt: t2 ? t2.id : 0, mv: t2 ? approach(st, c, t2) : null, label: "Purging the line" };
      let best = null, bn = -1;
      const near = sk.slice().sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
      for (let y = 0; y < H; y++) {
        const n = sk.filter((s) => s.y === y).length * 10 + (near && near.y === y ? 1 : 0);
        if (n > bn) {
          bn = n;
          best = { axis: "row", i: y };
        }
      }
      for (let x = 0; x < W; x++) {
        const n = sk.filter((s) => s.x === x).length * 10;
        if (n > bn) {
          bn = n;
          best = { axis: "col", i: x };
        }
      }
      return { k: "tele", line: best, tgt: t2 ? t2.id : 0, mv: t2 ? approach(st, c, t2) : null, label: "Marking a line" };
    }
    if (c.mood === "roam") {
      if (c.ai === "predator" || S.hunts) {
        const prey = creatures(st).filter((o) => o !== c && SPECIES[o.kind].prey && md(o, c) <= 8).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
        if (prey) return { k: "atk", tgt: prey.id, mv: approach(st, c, prey), prey: true, label: "Stalking the " + SPECIES[prey.kind].name };
      }
      const way = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]][(c.id * 5 + fl(st.turn / 2) * 3 + st.roomIdx) % 8];
      const lead = c.ai === "pack" ? creatures(st).filter((o) => o.kind === c.kind && o.mood === "roam").sort((a, b) => a.id - b.id)[0] : c;
      const goal = lead && lead !== c ? lead : { x: Math.max(4, Math.min(W - 1, c.home.x + way[0] * 3)), y: Math.max(0, Math.min(H - 1, c.home.y + way[1] * 2)) };
      return { k: "idle", mv: stepToward(st, c, goal, 2, lead && lead !== c ? 1 : 0), label: c.ai === "pack" ? "Roaming" : c.ai === "scavenger" ? "Scenting the air" : "Prowling" };
    }
    const t = pickTarget(st, c, targetsOf(st, c));
    if (!t) return { k: "idle", label: c.ai === "sentinel" ? "Standing guard" : "Waiting" };
    return { k: "atk", tgt: t.id, mv: approach(st, c, t), label: "Hunting" };
  }
  function stepToward(st, c, goal, steps, stopAt = 0) {
    if (!goal || c.root > 0) return null;
    const d0 = Math.abs(c.x - goal.x) + Math.abs(c.y - goal.y);
    if (d0 <= stopAt) return null;
    const { dist, par } = reach(st, c, Math.min(steps, moveRange(st, c)));
    let best = null, bd = d0;
    for (const [k] of dist) {
      const x = k % W, y = fl(k / W);
      const d = Math.abs(x - goal.x) + Math.abs(y - goal.y);
      if (d < bd && d >= stopAt) {
        bd = d;
        best = [x, y];
      }
    }
    return best ? { to: best, path: pathFrom(par, best[0], best[1]) } : null;
  }
  function witness(st, c, what, ev) {
    const seen = st.room.seenActs || (st.room.seenActs = {});
    const key = c.kind + ":" + what;
    if (seen[key]) return;
    const w = seekers(st).filter(alive).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
    if (!w || md(w, c) > (what === "kill" || what === "hunt" ? 10 : 7)) return;
    seen[key] = 1;
    st.res.study[c.kind] = (st.res.study[c.kind] || 0) + 2;
    st.res.xp += 4;
    ev.push({ e: "text", id: c.id, msg: what === "kill" ? "Witnessed: a kill" : what === "hunt" ? "Witnessed: a hunt" : what === "feed" ? "Witnessed: feeding" : what === "light" ? "Witnessed: a lamp lit" : "Witnessed: grazing" }, { e: "study", id: c.id, by: w.id, n: 2, left: 0, seen: what });
  }
  function notice(st, ev) {
    const sk = seekers(st).filter(alive);
    const woke = [];
    for (const c of creatures(st)) if (c.mood === "roam" && c.calm <= 0 && sk.some((s) => s.moved && md(s, c) <= noticeRadius(st, c))) woke.push(c);
    for (let i = 0; i < woke.length; i++) {
      const c = woke[i];
      if (c.mood !== "roam") continue;
      c.mood = "hostile";
      ev.push({ e: "text", id: c.id, msg: "Notices you" });
      for (const o of creatures(st)) if (o.mood === "roam" && o.kind === c.kind && md(o, c) <= 4) woke.push(o);
    }
  }
  function creatureAttack(st, c, t, ev) {
    const r = R(st);
    let dmg = r.range(c.dmg[0], c.dmg[1]);
    if (c.kind === "thornling") dmg += 2 * st.units.filter((o) => o !== c && alive(o) && o.kind === "thornling" && o.side === c.side && md(o, t) === 1).length * tierScale(st.tier) / 100 | 0;
    if (dmg <= 0) return;
    const melee = md(c, t) === 1;
    hurt(st, c, t, dmg, ev, { melee });
    if (c.kind === "hush" && alive(t)) {
      t.bleed = 3;
      t.bleedD = 2 * st.tier;
      ev.push({ e: "status", id: t.id, s: "bleed" });
    }
    if (melee && alive(c) && t.m && t.m.thorns) hurt(st, t, c, t.m.thorns, ev, { dot: true, kind: "thorns" });
    if (melee && alive(c) && alive(t) && t.rip > 0) strike(st, t, c, ev, { mult: t.fx.s_retaliator ? 160 : 100 });
  }
  function act(st, c, ev) {
    const p = plan(st, c);
    c.tc++;
    if (c.steady > 0) c.steady--;
    if (c.falter) c.falter = 0;
    if (p.k === "atk" && !(p.mv && p.mv.path.length)) {
      const t0 = st.units.find((u) => u.id === p.tgt && alive(u));
      if (!t0 || md(c, t0) > Math.max(1, c.range)) {
        c.stuck = (c.stuck || 0) + 1;
        if (c.stuck >= 3 && !SPECIES[c.kind].boss) {
          c.calm = 99;
          c.stuck = 0;
          ev.push({ e: "text", id: c.id, msg: "Loses the trail" });
          return;
        }
      } else c.stuck = 0;
    } else c.stuck = 0;
    if (p.k === "flee") {
      c.fled = true;
      ev.push({ e: "flee", id: c.id });
      return;
    }
    if (p.root) {
      const t2 = st.units.find((u) => u.id === p.root);
      if (t2 && alive(t2) && !t2.fx.anchor) {
        t2.root = 1;
        ev.push({ e: "text", id: t2.id, msg: "Rooted" }, { e: "status", id: t2.id, s: "root" });
      }
    }
    if (p.mv && p.mv.path.length) {
      walk(st, c, p.mv.path, ev);
      if (!alive(c)) return;
    }
    const t = p.tgt ? st.units.find((u) => u.id === p.tgt && alive(u)) : null;
    if (p.k === "atk") {
      if (t && md(c, t) <= Math.max(1, c.range) && (c.ai !== "ambush" || md(c, t) === 1)) {
        const beast = t.side === "c";
        creatureAttack(st, c, t, ev);
        if (beast && alive(t)) t.mauled = 1;
        if (beast && alive(c)) witness(st, c, alive(t) ? "hunt" : "kill", ev);
      }
    } else if (p.k === "idle" && p.graze) witness(st, c, "graze", ev);
    else if (p.k === "pull") {
      if (t && !t.fx.anchor) {
        let best = null, bd = 99;
        for (const [dx, dy] of DIRS) {
          const x = c.x + dx, y = c.y + dy;
          if (free(st, x, y)) {
            const d = Math.abs(x - t.x) + Math.abs(y - t.y);
            if (d < bd) {
              bd = d;
              best = [x, y];
            }
          }
        }
        if (best) {
          t.x = best[0];
          t.y = best[1];
          ev.push({ e: "move", id: t.id, path: [best], shove: true }, { e: "text", id: t.id, msg: "Dragged" });
        }
      }
    } else if (p.k === "eat") {
      const cp = st.room.corpses[p.ci];
      if (cp && md(cp, c) <= 1) {
        st.room.corpses.splice(p.ci, 1);
        c.max += 4;
        c.hp = Math.min(c.max, c.hp + 10);
        c.dmg = [c.dmg[0] + 2, c.dmg[1] + 2];
        ev.push({ e: "eat", id: c.id, x: cp.x, y: cp.y });
        witness(st, c, "feed", ev);
      }
    } else if (p.k === "heal") {
      if (t) heal(st, t, fl(6 * tierScale(st.tier) / 100), ev);
    } else if (p.k === "light") {
      const lp = st.room.props.find((q) => q.pid === p.pid);
      if (lp && !lp.lit) {
        lp.lit = true;
        ev.push({ e: "fx", pid: lp.pid, what: "lit", x: lp.x, y: lp.y });
        witness(st, c, "light", ev);
      }
    } else if (p.k === "seed") {
      const r = R(st);
      let n = 0;
      for (let i = 0; i < 40 && n < 2; i++) {
        const x = c.x + r.range(-2, 2), y = c.y + r.range(-2, 2);
        if (free(st, x, y)) {
          const u = spawn(st, "thornling", x, y, r, ev, false);
          u.noLoot = true;
          n++;
        }
      }
    } else if (p.k === "tele") {
      c.tele = p.line;
      ev.push({ e: "tele", id: c.id, line: p.line });
      if (t && md(c, t) === 1) creatureAttack(st, c, t, ev);
    } else if (p.k === "purge") {
      const L = c.tele;
      c.tele = null;
      ev.push({ e: "purge", line: L });
      const d = fl(c.dmg[1] * 130 / 100);
      for (const o of st.units.filter((u) => u !== c && alive(u) && (L.axis === "row" ? u.y === L.i : u.x === L.i))) hurt(st, c, o, d, ev, {});
      if (t && alive(t) && md(c, t) === 1) creatureAttack(st, c, t, ev);
    }
  }
  function tickUnit(st, u, ev) {
    if (!alive(u)) return;
    let reg = (u.m && u.m.regen || 0) + (st.room.wonder === "pocket_sun" ? 2 : 0) + (u.variant === "pale" ? 1 + st.tier : 0) + (u.regenT > 0 ? 2 + (u.side === "s" ? fl(u.sh.lvl / 3) : 0) : 0);
    if (reg && u.hp < u.max) heal(st, u, reg, ev);
    if (u.echo) {
      const e = u.echo;
      u.echo = 0;
      hurt(st, null, u, e, ev, { dot: true, kind: "echo" });
      if (!alive(u)) return;
    }
    if (u.poison > 0) {
      let d = fl(u.poison * (1 + st.tier) / 2 * (100 + (u.poisonPot || 0)) / 100);
      if (u.side === "c" && friends(st).some((f) => f.kind === "lure") && seekers(st).some((s) => s.fx.res_feeding_frenzy)) d *= 2;
      hurt(st, null, u, Math.max(1, d), ev, { dot: true, kind: "poison" });
      u.poison = Math.max(0, u.poison - (u.fx && u.fx.t_tissue ? 2 : 1));
      if (!alive(u)) return;
    }
    if (u.burn > 0) {
      hurt(st, null, u, u.burnD || 2, ev, { dot: true, kind: "burn" });
      u.burn--;
      if (!alive(u)) return;
    }
    if (u.bleed > 0) {
      hurt(st, null, u, u.bleedD || 2, ev, { dot: true, kind: "bleed" });
      u.bleed = Math.max(0, u.bleed - (u.fx && u.fx.t_tissue ? 2 : 1));
    }
  }
  function endPhase(units, keys = ["mark", "root", "stun", "calm", "regenT"]) {
    for (const u of units) {
      for (const k of keys) if (u[k] > 0) u[k]--;
    }
  }
  function endTurn(st, ev, free2) {
    for (const a of st.units.filter((u) => u.side === "a" && alive(u))) {
      const p = plan(st, a);
      if (p.mv && p.mv.path.length) walk(st, a, p.mv.path, ev);
      const t = p.tgt ? st.units.find((u) => u.id === p.tgt && alive(u)) : null;
      if (p.k === "atk" && t && md(a, t) <= Math.max(1, a.range)) {
        const d = R(st).range(a.dmg[0], a.dmg[1]);
        const tx = t.x, ty = t.y;
        hurt(st, a, t, d, ev, {});
        if (a.chain) {
          const n = creatures(st).filter((c) => c !== t && Math.abs(c.x - tx) + Math.abs(c.y - ty) <= 1)[0];
          if (n) hurt(st, a, n, Math.max(1, fl(d / 2)), ev, { dot: true, kind: "arc" });
        }
      }
      if (--a.turns <= 0) {
        a.dead = true;
        ev.push({ e: "die", id: a.id, quiet: true });
      }
    }
    endPhase(seekers(st));
    ev.push({ e: "phase", who: "c", free: !!free2 });
    for (const c of creatures(st)) tickUnit(st, c, ev);
    for (const c of st.units.filter((u) => u.side === "c")) {
      if (alive(c)) act(st, c, ev);
      if (!seekers(st).some(alive)) break;
    }
    endPhase(st.units.filter((u) => u.side === "c"));
    for (const c of st.units) if (c.side === "c") c.hitBy = 0;
    endPhase(seekers(st), free2 ? ["rip", "taunt"] : ["rip", "taunt", "lit"]);
    if (!seekers(st).some(alive)) {
      finish(st, "defeat", ev);
      return;
    }
    st.turn++;
    if (!free2) st.turns++;
    ev.push({ e: "phase", who: "s", free: !!free2 });
    const r = R(st);
    for (const u of seekers(st)) {
      if (!alive(u)) continue;
      tickUnit(st, u, ev);
      if (!alive(u)) continue;
      u.ap = u.stun > 0 ? 0 : 2;
      u.moved = false;
      u.freeUsed = false;
      u.freeStudy = false;
      u.killRef = false;
      u.critRef = false;
      for (const k in u.cds) u.cds[k] = Math.max(0, u.cds[k] - (st.room.wonder === "counting_clock" ? 2 : 1));
      if (u.sh.dev === "unfinished") u.devNow = r.pick(["lure", "barrier", "pulse", "drone", "blink", "gravity"]);
    }
    if (!seekers(st).some(alive)) finish(st, "defeat", ev);
  }
  function finish(st, outcome, ev) {
    st.outcome = outcome;
    const rs = st.res, sp = st.spec;
    if (outcome === "win") {
      rs.contractDone = sp.type === "pursue" ? rs.bossDown : sp.type === "observe" ? (rs.study[REGIONS[sp.region].observe] || 0) >= 6 && !rs.obsKilled : sp.type === "harvest" ? rs.floraN >= 4 : rs.objCache;
      rs.xp += 60 + (rs.contractDone ? 30 : 0);
      if (rs.contractDone) rs.cases.push(sp.weekly ? "weekly" : "contract");
    }
    ev.push({ e: "over", outcome });
  }
  function devKind(u) {
    return u.sh.dev === "unfinished" ? u.devNow || "pulse" : u.sh.dev;
  }
  var DEV_INFO = { lure: { range: 4, target: "tile", ap: 1 }, barrier: { range: 3, target: "ally", ap: 1 }, pulse: { range: 3, target: "any", ap: 1 }, drone: { range: 2, target: "tile", ap: 1 }, blink: { range: 5, target: "tile", ap: 0 }, gravity: { range: 4, target: "any", ap: 1 } };
  function abilCd(u, id) {
    return Math.max(1, ABILITIES[id].cd + (u.fx.overload ? 1 : 0) - (u.m.cdr || 0) - (id === "snare" && u.fx.s_trapper ? 2 : 0));
  }
  function abilRange(st, u, id) {
    const a = ABILITIES[id];
    return a.range === "weapon" ? weaponRange(st, u) : a.range;
  }
  function abilInfo(st, u, id) {
    const A = ABILITIES[id], ts = tierScale(st.tier), pw = abilPow(u), w = u.sh.w, sc = (n) => fl(n * ts * pw / 1e4), out = [], pct = (n, p) => fl(n * p / 100);
    const burn = fl((1 + st.tier + fl(u.sh.attr.insight / 3)) * (u.fx.s_pyre ? 150 : 100) / 100), burnT = 2 + (u.fx.s_pyre ? 1 : 0), pp = poisonPot(u), pz = (n) => fl(n * (1 + st.tier) / 2 * (100 + pp) / 100);
    if (id === "brace") out.push(`Shield ${sc(8)}`, "Taunt until your next turn");
    else if (id === "shove") out.push(`${w.min}-${w.max} damage`, "Push 2 tiles", `+${fl((4 + u.sh.attr.force) * ts / 100)} if it hits something`);
    else if (id === "riposte") out.push(`${pct(w.min, u.fx.s_retaliator ? 160 : 100)}-${pct(w.max, u.fx.s_retaliator ? 160 : 100)} damage per strike back`);
    else if (id === "mark") out.push("+25% damage taken", "2 turns");
    else if (id === "snare") out.push(`${sc(5)} damage`, "Held 2 turns");
    else if (id === "deadeye") out.push(`${pct(w.min, 190)}-${pct(w.max, 190)} damage (190%)`, "Critical on a Marked target");
    else if (id === "mend") out.push(`Heals ${fl((8 + 2 * u.sh.lvl) * (100 + (u.m.healPow || 0) + 4 * u.sh.attr.adaptation) / 100)}`);
    else if (id === "spore_dart") out.push("3 Poison", `${pz(3)}, ${pz(2)}, ${pz(1)} damage over 3 turns`);
    else if (id === "soothe") out.push("Calm 2 turns");
    else if (id === "drone") {
      const k = u.fx.s_dronewright ? 150 : 100;
      out.push(`${pct(sc(3), k)}-${pct(sc(5), k)} damage a turn`, u.fx.s_dronewright ? "Stays all fight" : "3 turns", `${fl(8 * ts / 100)} health`, "Shoots 4 tiles");
    } else if (id === "arc_pulse") out.push(`${sc(5)}-${sc(7)} damage`, "Half to one creature beside it", "Ignores 1 armor");
    else if (id === "overclock") out.push("+2 actions now");
    else if (id === "kindle") out.push("Blades lit 2 turns", `Burning: ${burn} damage a turn for ${burnT} turns`);
    else if (id === "fire_breath") out.push(`${sc(5)}-${sc(7)} damage to each`, `Burning: ${burn} a turn for ${burnT} turns`);
    else if (id === "red_glare") out.push(`${sc(6)}-${sc(8)} damage`, "Ignores all armor");
    const rg = A.target === "self" ? 0 : abilRange(st, u, id);
    out.push((rg ? `Range ${rg} \xB7 ` : "") + `${A.ap ? A.ap + (A.ap > 1 ? " actions" : " action") : "Free"} \xB7 ready every ${abilCd(u, id)} turns`);
    return out;
  }
  var bad = (msg) => {
    const e = new Error(msg);
    e.illegal = true;
    throw e;
  };
  function exploring(st) {
    return !st.outcome && !creatures(st).some((c) => isHostile(st, c));
  }
  function trail(st, leadId, ev) {
    const L = st.units.find((u) => u.id === leadId);
    if (!L) return;
    const fld = field(st, L.x, L.y);
    for (const u of seekers(st)) {
      if (u === L || !alive(u) || u.root > 0 || u.stun > 0 || md(u, L) <= 2) continue;
      const { dist, par } = reach(st, u, moveRange(st, u));
      let best = null;
      for (const [k, d] of dist) {
        if (!d) continue;
        const f = fld[k], x = k % W, y = fl(k / W);
        if (f < 1) continue;
        if (!best || f < best.f || f === best.f && d < best.d) best = { x, y, f, d };
      }
      if (best && best.f < fld[K(u.x, u.y)]) {
        const n = ev.length;
        walk(st, u, pathFrom(par, best.x, best.y), ev);
        for (let i = n; i < ev.length; i++) if (ev[i].e === "move") ev[i].trail = true;
      }
    }
  }
  function apply(st, a) {
    const calm = exploring(st) && a.t !== "end" && a.t !== "next" && a.t !== "abandon" && a.t !== "wander";
    const ev = applyAction(st, a);
    if (!st.outcome) notice(st, ev);
    if (calm && a.t === "move" && !a.solo && !st.outcome) {
      const quiet = exploring(st);
      trail(st, a.u, ev);
      if (quiet) notice(st, ev);
    }
    if (calm && exploring(st)) {
      endTurn(st, ev, true);
      if (!st.outcome) notice(st, ev);
    }
    return ev;
  }
  function applyAction(st, a) {
    if (st.outcome) bad("The expedition is over.");
    const ev = [];
    if (a.t === "abandon") {
      finish(st, "retreat", ev);
      return ev;
    }
    if (a.t === "end") {
      endTurn(st, ev);
      return ev;
    }
    if (a.t === "wander") {
      const id = placeFor(st);
      if (!id) bad("There is nowhere to wander to from here.");
      if (!exploring(st)) bad("Not while something is hunting you.");
      enterSide(st, id, ev);
      return ev;
    }
    if (a.t === "next") {
      if (!canAdvance(st)) bad("Something here is still hunting you.");
      if (st.side) {
        leaveSide(st, ev);
        return ev;
      }
      for (const c of st.room.corpses) addMat(st, c.mat, c.n);
      st.res.rooms++;
      st.res.xp += 15;
      if (st.room.type !== "quiet" && !creatures(st).some((c) => c.hunter && c.calm <= 0)) st.res.cases.push("standard");
      const LEN = st.spec.len || 3;
      if (st.roomIdx >= LEN - 1) {
        finish(st, "win", ev);
        return ev;
      }
      if (boonEarned(st)) {
        if (a.b !== 0 && a.b !== 1 && a.b !== 2 || !st.offer[a.b]) bad("Choose a boon.");
        takeBoon(st, st.offer[a.b], ev);
      }
      st.offer = null;
      let type = "standard";
      if (st.roomIdx + 1 < LEN - 1) {
        if (a.c !== 0 && a.c !== 1) bad("Choose a path.");
        type = st.route[st.roomIdx + 1][a.c];
      }
      st.turns++;
      enterRoom(st, type, ev);
      return ev;
    }
    const u = st.units.find((x) => x.id === a.u && x.side === "s");
    if (!u || !alive(u)) bad("No such Seeker.");
    const need = (n) => {
      if (u.ap < n) bad("Not enough action points.");
    };
    const tgt = (side) => {
      const t = st.units.find((x) => x.id === a.id && alive(x));
      if (!t) bad("No target.");
      if (side === "c" && t.side !== "c") bad("Not a creature.");
      if (side === "s" && t.side !== "s") bad("Not a Seeker.");
      return t;
    };
    if (a.t === "move") {
      if (u.root > 0 && !u.fx.anchor) bad("Held in place.");
      const freeMv = u.fx.freemove && !u.freeUsed;
      if (!freeMv) need(1);
      const { dist, par } = reach(st, u, moveRange(st, u));
      if (!dist.get(K(a.x, a.y))) bad("Out of reach.");
      if (freeMv) u.freeUsed = true;
      else u.ap--;
      u.moved = true;
      walk(st, u, pathFrom(par, a.x, a.y), ev);
      if (alive(u)) onPlate(st, u, ev);
      return ev;
    }
    if (a.t === "atk") {
      need(1);
      const t = tgt("c");
      if (md(u, t) > weaponRange(st, u)) bad("Out of range.");
      u.ap--;
      strike(st, u, t, ev);
      return ev;
    }
    if (a.t === "insight") {
      const t = tgt("c");
      if (!SPECIES[t.kind].boss) bad("Save it for the great one.");
      if ((st.res.insight || 0) < 1) bad("No insight to spend.");
      if (t.falter || t.steady > 0) bad(t.falter ? "It is already off balance." : "It has its footing back. Wait a round.");
      st.res.insight--;
      t.falter = 1;
      t.steady = 3;
      t.mark = Math.max(t.mark || 0, 2);
      ev.push({ e: "insight", id: t.id, by: u.id, left: st.res.insight }, { e: "status", id: t.id, s: "mark" });
      return ev;
    }
    if (a.t === "study") {
      const t = tgt("c");
      if (md(u, t) > 3) bad("Too far to study.");
      const calm = !isHostile(st, t);
      const free2 = calm && !u.freeStudy;
      if (!free2) need(1);
      const g = gainStudy(st, u, t, studyValue(st, u, t), ev);
      if (!g) bad(t.studied >= (t.variant ? 5 : 3) ? "Nothing more to learn from this one." : "Get closer to learn more.");
      if (free2) u.freeStudy = true;
      else u.ap--;
      if (u.fx.a_naturalist && calm && !t.sampled) {
        t.sampled = true;
        st.res.samples[t.kind] = (st.res.samples[t.kind] || 0) + 1;
        ev.push({ e: "text", id: t.id, msg: "Sample taken" });
      }
      if (u.fx.studymark) {
        t.mark = 2;
        ev.push({ e: "status", id: t.id, s: "mark" });
      }
      return ev;
    }
    if (a.t === "use") {
      const p = st.room.props.find((q) => q.pid === a.p && !q.done);
      if (!p) bad("Nothing there.");
      if (md(u, p) > 1) bad("Stand next to it.");
      if (p.kind === "fixture") {
        need(1);
        u.ap--;
        if (p.id === "bellcap") {
          if (p.spent) bad("It has nothing left to give.");
          p.spent = true;
          ev.push({ e: "fx", pid: p.pid, what: "spores", x: p.x, y: p.y });
          const steam = st.spec.region === "clockwork";
          for (const c of creatures(st)) if (md(c, p) <= 2 && !SPECIES[c.kind].boss) {
            if (steam) {
              c.stun = Math.max(c.stun, 1);
              ev.push({ e: "text", id: c.id, msg: "Seized" }, { e: "status", id: c.id, s: "stun" });
            } else if (!SPECIES[c.kind].mech) {
              c.calm = Math.max(c.calm, 2);
              ev.push({ e: "text", id: c.id, msg: "Drowsy" }, { e: "status", id: c.id, s: "calm" });
            }
          }
        } else if (p.id === "lamp") {
          p.lit = !p.lit;
          ev.push({ e: "fx", pid: p.pid, what: p.lit ? "lit" : "unlit", x: p.x, y: p.y });
        } else if (p.id === "case") {
          p.done = true;
          const r = R(st);
          const reg = st.spec.region;
          if (r.pct(55)) {
            const k = REGIONS[reg].observe;
            st.res.samples[k] = (st.res.samples[k] || 0) + 1;
            st.res.xp += 8;
            ev.push({ e: "fx", pid: p.pid, what: "specimen", x: p.x, y: p.y, kind: k });
          } else {
            ev.push({ e: "fx", pid: p.pid, what: "alive", x: p.x, y: p.y });
            const k = reg === "clockwork" ? "mite" : "thornling";
            let put = false;
            for (const [dx, dy] of DIRS) {
              const x = p.x + dx, y = p.y + dy;
              if (!put && free(st, x, y)) {
                const c = spawn(st, k, x, y, r, ev, false);
                c.noLoot = true;
                put = true;
              }
            }
          }
        }
        return ev;
      }
      if (p.kind === "plate") bad("Step onto it.");
      if (p.kind === "chest") {
        if (!chestOpen(st, p)) bad("It will not open yet.");
        need(1);
        u.ap--;
        p.done = true;
        st.res.cases.push("chest" + (st.side ? "@" + st.side.id : ""));
        st.res.xp += 12;
        ev.push({ e: "chest", pid: p.pid, x: p.x, y: p.y, by: u.id });
        return ev;
      }
      if (p.kind === "find") {
        need(1);
        u.ap--;
        p.done = true;
        const F = FINDS[p.id];
        const reg = st.spec.region;
        const r = R(st);
        let what = p.wake ? "wake" : F.does;
        if (what === "notes") {
          const k = r.pick(REGIONS[reg].fauna.filter((f) => !SPECIES[f].boss));
          st.res.seen[k] = 1;
          st.res.study[k] = (st.res.study[k] || 0) + 3;
          st.res.xp += 10;
          ev.push({ e: "find", pid: p.pid, what, x: p.x, y: p.y, kind: k, by: u.id });
        } else if (what === "case") {
          st.res.cases.push("cache@" + st.side.id);
          st.res.xp += 10;
          ev.push({ e: "find", pid: p.pid, what, x: p.x, y: p.y, by: u.id });
        } else if (what === "mats") {
          const m = SPECIES[REGIONS[reg].observe].mat;
          addMat(st, m, 2);
          st.res.xp += 6;
          ev.push({ e: "find", pid: p.pid, what, x: p.x, y: p.y, mat: m, by: u.id });
        } else if (what === "mend") {
          ev.push({ e: "find", pid: p.pid, what, x: p.x, y: p.y, by: u.id });
          for (const s of seekers(st)) if (alive(s)) heal(st, s, s.max, ev);
        } else if (what === "lore") {
          st.res.xp += 25;
          ev.push({ e: "find", pid: p.pid, what, x: p.x, y: p.y, by: u.id });
        } else {
          ev.push({ e: "find", pid: p.pid, what: "wake", x: p.x, y: p.y, by: u.id });
          const k = reg === "clockwork" ? "mite" : "thornling";
          let n = 0;
          for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]]) {
            const x = p.x + dx, y = p.y + dy;
            if (n < 2 && free(st, x, y)) {
              spawn(st, k, x, y, r, ev, false);
              n++;
            }
          }
        }
        return ev;
      }
      const cost = p.kind === "flora" && u.fx.t_forager ? 0 : 1;
      need(cost);
      u.ap -= cost;
      p.done = true;
      ev.push({ e: "prop", pid: p.pid, by: u.id });
      if (p.kind === "flora") {
        st.res.flora[p.id] = (st.res.flora[p.id] || 0) + 1;
        st.res.floraN++;
        addMat(st, FLORA[p.id].mat, 1);
        st.res.xp += 4;
        if (p.id === "heartfruit") heal(st, u, 8 + 2 * st.tier, ev);
        if (p.id === "copper_lily") {
          for (const c of creatures(st)) if (md(c, p) <= 1) hurt(st, u, c, 4 * st.tier, ev, { dot: true, kind: "arc" });
        }
        if (p.id === "tick_fern") {
          const k = Object.keys(u.cds).sort((x, y) => u.cds[y] - u.cds[x])[0];
          if (k) u.cds[k] = 0;
        }
      } else if (p.kind === "cache") {
        st.res.cases.push("cache");
        if (p.obj) st.res.objCache = true;
        st.res.xp += 10;
      } else if (p.kind === "wonder") {
        st.res.wonders[p.id] = 1;
        st.res.xp += 25;
        if (p.id === "painted_door") st.res.cases.push("cache");
      }
      return ev;
    }
    if (a.t === "abil") {
      const id = a.a;
      if (!u.sh.abilities.includes(id)) bad("Unknown ability.");
      const A = ABILITIES[id];
      if ((u.cds[id] || 0) > 0) bad("Still cooling down.");
      const freebie = u.fx.borrowed_moment && (u.abilN + 1) % 4 === 0;
      const cost = freebie ? 0 : A.ap;
      need(cost);
      const rng = abilRange(st, u, id);
      const ts = tierScale(st.tier), pw = abilPow(u);
      const pay2 = () => {
        u.abilN++;
        u.ap -= cost;
        if (!freebie) u.cds[id] = abilCd(u, id);
        ev.push({ e: "abil", id: u.id, a: id });
      };
      if (id === "brace") {
        pay2();
        const v = fl(8 * ts * pw / 1e4);
        u.shield += v;
        u.shieldPeak = Math.max(u.shieldPeak || 0, u.shield);
        u.taunt = 1;
        ev.push({ e: "shield", id: u.id, n: -v });
        if (u.fx.s_bulwark) {
          for (const o of seekers(st)) if (o !== u && alive(o) && md(o, u) === 1) {
            o.shield += fl(v / 2);
            o.shieldPeak = Math.max(o.shieldPeak || 0, o.shield);
            ev.push({ e: "shield", id: o.id, n: -fl(v / 2) });
          }
        }
      } else if (id === "riposte") {
        pay2();
        u.rip = 1;
        ev.push({ e: "text", id: u.id, msg: "Ready" });
      } else if (id === "shove") {
        const t = tgt("c");
        if (md(u, t) !== 1) bad("Shove needs a creature beside you.");
        pay2();
        const dx = t.x - u.x, dy = t.y - u.y;
        strike(st, u, t, ev, { abil: true });
        if (alive(t)) push(st, t, dx, dy, 2, ev, u, fl((4 + u.sh.attr.force) * ts / 100));
      } else if (id === "mark") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        t.mark = 2;
        ev.push({ e: "status", id: t.id, s: "mark" });
      } else if (id === "snare") {
        if (!inb(a.x, a.y) || !free(st, a.x, a.y) || md(u, a) > rng) bad("Pick an empty tile within reach.");
        pay2();
        st.room.traps.push({ x: a.x, y: a.y, owner: u.id, dmg: fl(5 * ts * pw / 1e4), bleed: !!u.fx.s_trapper });
        ev.push({ e: "trapset", x: a.x, y: a.y });
      } else if (id === "deadeye") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        strike(st, u, t, ev, { mult: 190, crit: t.mark > 0, abil: false });
      } else if (id === "mend") {
        const t = tgt("s");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        heal(st, t, fl((8 + 2 * u.sh.lvl) * (100 + (u.m.healPow || 0) + 4 * u.sh.attr.adaptation) / 100), ev, t !== u);
        if (u.fx.s_medic) {
          t.bleed = 0;
          t.poison = 0;
          t.regenT = 2;
        }
      } else if (id === "spore_dart") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        t.byParty = 1;
        t.poison += 3;
        t.poisonPot = Math.max(t.poisonPot || 0, poisonPot(u));
        ev.push({ e: "status", id: t.id, s: "poison" });
      } else if (id === "soothe") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        if (SPECIES[t.kind].boss) bad("It does not hear you.");
        pay2();
        t.calm = 2;
        ev.push({ e: "status", id: t.id, s: "calm" });
      } else if (id === "drone") {
        if (!inb(a.x, a.y) || !free(st, a.x, a.y) || md(u, a) > rng) bad("Pick an empty tile within reach.");
        pay2();
        summon(st, u, "drone", a.x, a.y, ev);
      } else if (id === "arc_pulse") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        const d = fl(R(st).range(5, 7) * ts * pw / 1e4);
        const tx = t.x, ty = t.y;
        const n = creatures(st).filter((c) => c !== t && md(c, t) === 1)[0];
        const zap = (c, v) => {
          hurt(st, u, c, v, ev, { pierce: 1, kind: "arc" });
          if (alive(c) && u.fx.s_saboteur) {
            c.mark = 2;
            if (SPECIES[c.kind].mech && !SPECIES[c.kind].boss) c.stun = 1;
            ev.push({ e: "status", id: c.id, s: "mark" });
          }
        };
        zap(t, d);
        if (n) zap(n, Math.max(1, fl(d / 2)));
      } else if (id === "kindle") {
        pay2();
        u.lit = 2;
        ev.push({ e: "text", id: u.id, msg: "Blades alight" });
      } else if (id === "fire_breath") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        const tx = t.x, ty = t.y;
        const d = fl(R(st).range(5, 7) * ts * pw / 1e4);
        for (const c of creatures(st).filter((c2) => Math.abs(c2.x - tx) + Math.abs(c2.y - ty) <= 1)) {
          hurt(st, u, c, d, ev, { kind: "fire" });
          ignite(st, u, c, ev);
        }
      } else if (id === "red_glare") {
        const t = tgt("c");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        hurt(st, u, t, fl(R(st).range(6, 8) * ts * pw / 1e4), ev, { pierce: 99, kind: "beam" });
      } else if (id === "overclock") {
        const t = tgt("s");
        if (t === u) bad("Overclock someone else.");
        if (md(u, t) > rng) bad("Out of range.");
        pay2();
        t.ap += 2;
        ev.push({ e: "text", id: t.id, msg: "+2 actions" });
      }
      return ev;
    }
    if (a.t === "dev") {
      if (!u.sh.dev) bad("No device.");
      if (u.charges <= 0) bad("No charges left in this room.");
      const k = devKind(u);
      const I = DEV_INFO[k];
      need(I.ap);
      if (!inb(a.x, a.y) || md(u, a) > I.range) bad("Out of range.");
      const ts = tierScale(st.tier), pw = abilPow(u);
      const at = unitAt(st, a.x, a.y);
      if (I.target === "tile" && !free(st, a.x, a.y)) bad("Pick an empty tile.");
      if (I.target === "ally" && !(at && at.side === "s")) bad("Pick a Seeker.");
      u.ap -= I.ap;
      u.charges--;
      ev.push({ e: "abil", id: u.id, a: k });
      if (k === "lure") summon(st, u, "lure", a.x, a.y, ev);
      else if (k === "drone") summon(st, u, "drone", a.x, a.y, ev);
      else if (k === "barrier") {
        const v = fl(10 * ts * pw / 1e4);
        at.shield += v;
        at.shieldPeak = Math.max(at.shieldPeak || 0, at.shield);
        ev.push({ e: "shield", id: at.id, n: -v });
      } else if (k === "pulse") {
        const d = fl(R(st).range(4, 6) * ts * pw / 1e4);
        ev.push({ e: "burst", x: a.x, y: a.y });
        for (const c of creatures(st)) if (md(c, a) <= 1) hurt(st, u, c, d, ev, { kind: "arc" });
      } else if (k === "blink") {
        u.x = a.x;
        u.y = a.y;
        ev.push({ e: "move", id: u.id, path: [[a.x, a.y]], blink: true });
        stepOn(st, u, ev);
      } else if (k === "gravity") {
        ev.push({ e: "burst", x: a.x, y: a.y });
        for (const c of creatures(st).filter((c2) => md(c2, a) <= 2 && md(c2, a) > 0).sort((p, q) => md(p, a) - md(q, a) || p.id - q.id)) {
          const S = SPECIES[c.kind];
          if (S.boss || S.move === 0) continue;
          const dx = Math.sign(a.x - c.x), dy = Math.sign(a.y - c.y);
          const opts = Math.abs(a.x - c.x) >= Math.abs(a.y - c.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]];
          for (const [ox, oy] of opts) if ((ox || oy) && free(st, c.x + ox, c.y + oy)) {
            c.x += ox;
            c.y += oy;
            ev.push({ e: "move", id: c.id, path: [[c.x, c.y]], shove: true });
            stepOn(st, c, ev);
            break;
          }
          if (alive(c)) c.root = Math.max(c.root, 1);
        }
      }
      return ev;
    }
    bad("Unknown action.");
  }
  function replay(spec, log) {
    const st = createRun(spec);
    for (const a of log) {
      if (st.outcome) break;
      apply(st, a);
    }
    return st;
  }
  var STAGE_NAME = ["Encountered", "Observed", "Investigated", "Mastered"];
  var STAGE_REQ = [[0, 0], [4, 0], [10, 2], [20, 5]];
  function stageOf(e) {
    let s = 0;
    for (let i = 1; i < 4; i++) if ((e.study || 0) >= STAGE_REQ[i][0] && (e.samples || 0) >= STAGE_REQ[i][1]) s = i;
    return s;
  }
  function allKeys() {
    const k = [];
    for (const s in SPECIES) {
      k.push("f:" + s);
      if (!SPECIES[s].boss) for (const v in VARIANTS) k.push("v:" + s + ":" + v);
    }
    for (const f in FLORA) k.push("p:" + f);
    for (const w in WONDERS) k.push("w:" + w);
    for (const m in MATERIALS) k.push("m:" + m);
    for (const b in BASES) k.push("b:" + b);
    for (const s in SINGULARS) k.push("s:" + s);
    for (const r in RESONANCES) k.push("r:" + r);
    return k;
  }
  function keyInfo(key) {
    const [t, a, b] = key.split(":");
    if (t === "f") return { kind: "Fauna", name: SPECIES[a].name, art: a, region: SPECIES[a].region };
    if (t === "v") return { kind: "Variant", name: VARIANTS[b].name + " " + SPECIES[a].name, art: a, variant: b, region: SPECIES[a].region };
    if (t === "p") return FLORA[a] ? { kind: "Flora", name: FLORA[a].name, art: a } : { kind: "Flora", name: "Unrecorded", art: null };
    if (t === "w") return { kind: "Wonder", name: WONDERS[a].name, art: a };
    if (t === "m") return { kind: "Material", name: MATERIALS[a].name, art: a };
    if (t === "b") return { kind: "Relic", name: BASES[a].name, art: a };
    if (t === "s") return { kind: "Singular", name: SINGULARS[a].name, art: a };
    if (t === "r") return { kind: "Resonance", name: RESONANCES[a].name, art: null };
    return { kind: "?", name: key };
  }
  function catAdd(state, key, now, fresh) {
    if (state.cat[key]) return false;
    state.cat[key] = { at: now };
    fresh.push(key);
    return true;
  }
  function indexCtx(state) {
    const c = { entries: 0, mech: 0, observed: 0, investigated: 0, variants: 0, wonders: 0, bases: 0, verdantDone: 0, verdantAll: 0 };
    for (const k in state.cat) {
      c.entries++;
      const [t, a] = k.split(":");
      const e = state.cat[k];
      if (t === "f") {
        if (SPECIES[a].mech) c.mech++;
        const s = stageOf(e);
        if (s >= 1) c.observed++;
        if (s >= 2) c.investigated++;
      }
      if (t === "v") c.variants++;
      if (t === "w") c.wonders++;
      if (t === "b") c.bases++;
    }
    const V = REGIONS.verdant;
    c.verdantAll = V.fauna.length + V.flora.length;
    for (const f of V.fauna) if (state.cat["f:" + f] && stageOf(state.cat["f:" + f]) >= 1) c.verdantDone++;
    for (const f of V.flora) if (state.cat["p:" + f]) c.verdantDone++;
    return c;
  }
  function score(state) {
    let s = 0;
    for (const k in state.cat) {
      const t = k[0];
      const e = state.cat[k];
      s += t === "v" ? 25 : t === "w" ? 40 : t === "s" ? 100 : t === "r" ? 20 : 10;
      if (t === "f") s += 15 * stageOf(e);
      if (e.first) s += 50;
    }
    return s;
  }
  function addItem(state, it, now, fresh) {
    const id = "i" + state.nextId++;
    it.id = id;
    state.items[id] = it;
    if (fresh) {
      catAdd(state, it.sing ? "s:" + it.sing : "b:" + it.base, now, fresh);
      for (const a of it.aff) state.aff[a.id] = 1;
      if (it.fx) state.fxSeen[it.fx] = 1;
    }
    return id;
  }
  function addSeeker(state, arch, r, now, fresh) {
    const A = ARCHETYPES[arch];
    const s = { id: arch, arch, name: A.seeker, lvl: 1, xp: 0, attr: { ...A.attr }, pts: 0, spec: null, traits: [], gear: {} };
    state.seekers[arch] = s;
    state.roster.push(arch);
    for (const sl in A.start) s.gear[sl] = addItem(state, makeItem(r, A.start[sl], 0, 1), now, fresh);
  }
  function newPlayer(name, seed, now) {
    const r = mkRng(seed);
    const state = {
      v: 1,
      name,
      seekers: {},
      roster: [],
      items: {},
      nextId: 1,
      mats: {},
      comps: 6,
      research: 0,
      cat: {},
      aff: {},
      fxSeen: {},
      unlocks: {},
      tierMax: { verdant: 1, clockwork: 1 },
      board: null,
      run: null,
      stats: { runs: 0, wins: 0, bossDry: 0 },
      weekly: { id: null, done: false, best: 0 },
      last: null
    };
    const fresh = [];
    for (const a of ["vanguard", "tracker", "naturalist"]) addSeeker(state, a, r, now, fresh);
    state.board = makeBoard(state, r.next());
    return state;
  }
  function weekId(now) {
    return fl((now - 3456e5) / 6048e5);
  }
  function dayId(now) {
    return fl(now / 864e5);
  }
  function dailySighting(now, state) {
    const d = dayId(now);
    const region = d % 2 && state && state.unlocks.clockwork ? "clockwork" : "verdant";
    const pool = REGIONS[region].fauna.filter((k) => !SPECIES[k].boss && !SPECIES[k].elite);
    return { day: d, region, kind: pool[hashStr("sighting-" + d) % pool.length], variant: ["pale", "gilded", "overgrown"][hashStr("coat-" + d) % 3] };
  }
  function sightingBonus(streak) {
    return 3 + Math.min(streak, 7);
  }
  function weeklyContract(now) {
    const w = weekId(now);
    return { weekly: true, week: w, region: w % 2 ? "clockwork" : "verdant", type: "pursue", tier: 3, mods: {}, target: { fam: w % 2 ? "relic" : "organic", slot: SLOTS[w % 6] }, seed: hashStr("weekly-trial-" + w) };
  }
  function makeBoard(state, seed) {
    const r = mkRng(seed);
    const regs = ["verdant"];
    if (state.unlocks.clockwork) regs.push("clockwork");
    const types = Object.keys(CONTRACT_TYPES);
    const list = [];
    const t0 = state.stats.runs ? r.int(4) : 0;
    for (let i = 0; i < 3; i++) {
      const region = regs.length > 1 ? regs[(i + r.int(2)) % 2] : "verdant";
      const type = types[(t0 + i) % 4];
      const fam = weighted(r, REGIONS[region].fam);
      const mods = {};
      if (state.unlocks.bloom && r.pct(25)) mods.bloom = 1;
      else if (state.unlocks.hunts && r.pct(25)) mods.hunt = 1;
      list.push({ region, type, mods, target: { fam, slot: r.pick(SLOTS) }, seed: r.next() });
    }
    return { seed, list };
  }
  function buildSpec(state, c, squad, tier, seed) {
    const stages = {};
    for (const k in state.cat) if (k[0] === "f") stages[k.slice(2)] = stageOf(state.cat[k]);
    let vb = state.unlocks.variants ? 50 : 0;
    const sheets = squad.map((id) => sheet(state, id));
    for (const s of sheets) vb += s.m.variantSense || 0;
    return { seed, region: c.region, type: c.type, tier, mods: c.mods || {}, target: c.target, weekly: !!c.weekly, week: c.week, intro: !state.stats.runs && !c.weekly, len: !state.stats.runs && !c.weekly ? 4 : 7, squad: sheets, stages, variantBoost: vb };
  }
  function checkMilestones(state, r, now, fresh, out) {
    const ctx = indexCtx(state);
    for (const m of MILESTONES) {
      if (state.unlocks[m.id]) continue;
      const [h, n] = m.test(ctx);
      if (h < n) continue;
      state.unlocks[m.id] = now;
      out.push(m.id);
      if (m.id === "tamsin") addSeeker(state, "tinkerer", r, now, fresh);
      if (m.id === "garrow") addSeeker(state, "firebrand", r, now, fresh);
      if (m.id === "eye") addItem(state, makeSingular(r, "collectors_eye", Math.max(1, state.tierMax.verdant)), now, fresh);
    }
  }
  var famMats = (fam) => Object.keys(MATERIALS).filter((m) => MATERIALS[m].fam === fam);
  function matCount(state, fam) {
    return famMats(fam).reduce((n, m) => n + (state.mats[m] || 0), 0);
  }
  function spendMats(state, fam, n) {
    if (matCount(state, fam) < n) bad("Not enough " + FAMILY_NAME[fam].toLowerCase() + " material.");
    while (n > 0) {
      const m = famMats(fam).sort((a, b) => (state.mats[b] || 0) - (state.mats[a] || 0))[0];
      state.mats[m]--;
      n--;
    }
  }
  function costOf(state, op, it) {
    const fam = itemDef(it).fam;
    const t = it.tier;
    if (op === "refine") return { comps: 2 + t, mats: 1, fam };
    if (op === "calibrate") return { comps: (3 + t) * ((it.cal || 0) + 1), mats: 1, fam };
    if (op === "mutate") return { comps: (4 + t) * ((it.mut || 0) + 1), mats: 2 * ((it.mut || 0) + 1), fam };
    return { comps: 0, mats: 0, fam };
  }
  function assembleCost(baseId, tier) {
    return { comps: 8 + 4 * tier, mats: 3, fam: BASES[baseId].fam };
  }
  function pay(state, c) {
    if (state.comps < c.comps) bad("Not enough components.");
    spendMats(state, c.fam, c.mats);
    state.comps -= c.comps;
  }
  var equippedBy = (state, id) => state.roster.find((s) => Object.values(state.seekers[s].gear).includes(id));
  function applyOp(state, op, ctx) {
    const now = ctx.now;
    const fresh = [];
    const out = { fresh, unlocked: [] };
    const S = (id) => state.seekers[id] && state.roster.includes(id) ? state.seekers[id] : bad("No such Seeker.");
    const I = (id) => state.items[id] || bad("No such item.");
    if (state.run && op.t !== "finish") bad("An expedition is under way.");
    switch (op.t) {
      case "equip": {
        const s = S(op.s), it = I(op.i);
        const sl = itemDef(it).slot;
        const who = equippedBy(state, it.id);
        if (who) delete state.seekers[who].gear[sl];
        s.gear[sl] = it.id;
        for (const id of resonancesFor(seekerItems(state, s)).active) catAdd(state, "r:" + id, now, fresh);
        break;
      }
      case "unequip": {
        const s = S(op.s);
        delete s.gear[op.slot];
        break;
      }
      case "attr": {
        const s = S(op.s);
        if (!ATTRS.includes(op.a)) bad("No such attribute.");
        if (s.pts < 1) bad("No points to spend.");
        s.pts--;
        s.attr[op.a]++;
        break;
      }
      case "spec": {
        const s = S(op.s);
        if (s.lvl < SPEC_LEVEL) bad("Reach level " + SPEC_LEVEL + " first.");
        if (!SPECS[s.arch].some((x) => x.id === op.id)) bad("No such specialization.");
        s.spec = op.id;
        break;
      }
      case "trait": {
        const s = S(op.s);
        const slots = TRAIT_LEVELS.filter((l) => s.lvl >= l).length;
        if (s.traits.length >= slots) bad("No trait slot open.");
        if (!traitOffer(s).includes(op.id)) bad("Not on offer.");
        s.traits.push(op.id);
        break;
      }
      case "lock": {
        const it = I(op.i);
        it.lock = !it.lock;
        break;
      }
      case "dismantle": {
        for (const id of op.items) {
          const it = I(id);
          if (it.lock) bad("Unlock it first.");
          if (equippedBy(state, id)) bad("Unequip it first.");
          if (it.sing) bad("A Singular cannot be dismantled.");
          const ri = RARITIES.indexOf(it.rar);
          state.comps += DISMANTLE[ri] + (it.tier - 1);
          const fm = famMats(itemDef(it).fam);
          const m = fm[it.seed % fm.length];
          state.mats[m] = (state.mats[m] || 0) + 1 + (ri >= 3 ? 1 : 0);
          catAdd(state, "m:" + m, now, fresh);
          delete state.items[id];
        }
        break;
      }
      case "refine": {
        if (!state.unlocks.bench) bad("The workbench is not set up yet.");
        const it = I(op.i);
        if (it.sing) bad("A Singular cannot be altered.");
        const a = it.aff[op.a] || bad("No such affix.");
        const q = affixQuality(it, op.a);
        const [lo, hi] = affixBand(a.id, it.tier);
        if (a.v >= hi) bad("Already at its best.");
        pay(state, costOf(state, "refine", it));
        a.v = q >= 2 ? hi : Math.max(a.v + 1, lo + Math.round((hi - lo) * (q === 0 ? 0.5 : 0.85)));
        break;
      }
      case "calibrate": {
        if (!state.unlocks.bench) bad("The workbench is not set up yet.");
        const it = I(op.i);
        if (it.sing) bad("A Singular cannot be altered.");
        if ((it.cal || 0) >= CAL_MAX[RARITIES.indexOf(it.rar)]) bad("Fully calibrated.");
        pay(state, costOf(state, "calibrate", it));
        it.cal = (it.cal || 0) + 1;
        break;
      }
      case "mutate": {
        if (!ctx.rng) bad("server");
        if (!state.unlocks.mutate) bad("Observe three species first.");
        const it = I(op.i);
        if (it.sing) bad("A Singular cannot be altered.");
        if (!it.aff[op.a]) bad("No such affix.");
        const v = validAffixes(it, op.a).filter((id2) => id2 !== it.aff[op.a].id);
        if (!v.length) bad("Nothing else can grow there.");
        pay(state, costOf(state, "mutate", it));
        const id = ctx.rng.pick(v);
        it.aff[op.a] = { id, v: rollAffixValue(ctx.rng, id, it.tier, rollQuality(ctx.rng)) };
        it.mut = (it.mut || 0) + 1;
        state.aff[id] = 1;
        out.item = it.id;
        break;
      }
      case "assemble": {
        if (!ctx.rng) bad("server");
        if (!state.unlocks.assemble) bad("Catalogue more equipment first.");
        if (!state.cat["b:" + op.base]) bad("You have not catalogued that.");
        const def = BASES[op.base];
        const tier = Math.max(1, Math.min(op.tier | 0, Math.max(state.tierMax.verdant, state.tierMax.clockwork)));
        pay(state, assembleCost(op.base, tier));
        const x = ctx.rng.int(100);
        out.item = addItem(state, makeItem(ctx.rng, op.base, x < 55 ? 1 : x < 90 ? 2 : 3, tier), now, fresh);
        void def;
        break;
      }
      case "reboard": {
        if (!ctx.rng) bad("server");
        if (state.research < 3) bad("Costs 3 research.");
        state.research -= 3;
        state.board = makeBoard(state, ctx.rng.next());
        break;
      }
      case "start": {
        if (!ctx.rng) bad("server");
        const c = op.weekly ? weeklyContract(now) : state.board.list[op.c];
        if (!c) bad("No such contract.");
        const squad = [...new Set(op.squad || [])];
        if (squad.length < 1 || squad.length > 3) bad("Take one to three Seekers.");
        squad.forEach(S);
        if (Object.keys(state.items).length > 90) bad("Your pack is full. Dismantle something first.");
        const tier = c.weekly ? c.tier : Math.max(1, Math.min(op.tier | 0 || 1, state.tierMax[c.region]));
        state.run = { spec: buildSpec(state, c, squad, tier, c.weekly ? c.seed : ctx.rng.next()), at: now, c: op.weekly ? -1 : op.c };
        {
          const sg = dailySighting(now, state);
          if (!c.weekly && c.region === sg.region && state.stats.runs && !(state.daily && state.daily.id === sg.day)) state.run.spec.sight = { kind: sg.kind, variant: sg.variant, day: sg.day };
        }
        break;
      }
      case "finish": {
        if (!ctx.rng) bad("server");
        if (!state.run) bad("No expedition to finish.");
        out.report = settle(state, op.log || [], ctx, fresh, out);
        break;
      }
      default:
        bad("Unknown operation.");
    }
    checkMilestones(state, ctx.rng || mkRng(hashStr(state.name) + state.nextId), now, fresh, out.unlocked);
    return out;
  }
  function traitOffer(s) {
    const all = Object.keys(TRAITS).filter((t) => !s.traits.includes(t));
    const r = mkRng(hashStr(s.id + ":" + s.traits.length));
    const o = [];
    while (o.length < 3 && all.length) o.push(all.splice(r.int(all.length), 1)[0]);
    return o;
  }
  function settle(state, log, ctx, fresh, out) {
    const run = state.run;
    const spec = run.spec;
    const r = ctx.rng;
    const now = ctx.now;
    const st = replay(spec, log);
    if (!st.outcome) st.outcome = "retreat";
    const rs = st.res;
    const win = st.outcome === "win";
    const rep = { outcome: st.outcome, contractDone: rs.contractDone, type: spec.type, region: spec.region, tier: spec.tier, items: [], mats: {}, stageUps: [], levelUps: [], research: 0, xp: 0, turns: st.turns, weekly: spec.weekly };
    state.run = null;
    state.stats.runs++;
    if (win) state.stats.wins++;
    const touch = (key) => {
      catAdd(state, key, now, fresh);
      return state.cat[key];
    };
    const met = (sp) => win || rs.study[sp] || rs.samples[sp] || rs.kills[sp];
    if (spec.sight && met(spec.sight.kind) && !(state.daily && state.daily.id >= spec.sight.day)) {
      const prev = state.daily || {};
      const streak = prev.id === spec.sight.day - 1 ? (prev.streak || 0) + 1 : 1;
      const bonus = sightingBonus(streak);
      state.daily = { id: spec.sight.day, streak, best: Math.max(prev.best || 0, streak) };
      state.research += bonus;
      rep.sight = { kind: spec.sight.kind, variant: spec.sight.variant, streak, bonus };
    }
    for (const sp in rs.seen) {
      if (!met(sp)) continue;
      const e = touch("f:" + sp);
      const before = stageOf(e);
      e.study = (e.study || 0) + (rs.study[sp] || 0);
      e.samples = (e.samples || 0) + (rs.samples[sp] || 0);
      e.n = (e.n || 0) + 1;
      const after = stageOf(e);
      if (after > before) {
        rep.stageUps.push({ sp, stage: after });
        rep.research += 5 * (after - before);
      }
    }
    for (const v in rs.variants) if (met(v.split(":")[0])) touch("v:" + v);
    for (const f in rs.flora) {
      if (!FLORA[f]) continue;
      const e = touch("p:" + f);
      e.n = (e.n || 0) + rs.flora[f];
    }
    for (const w in rs.wonders) touch("w:" + w);
    let studyPts = 0;
    for (const sp in rs.study) studyPts += rs.study[sp];
    for (const m in rs.mats) {
      const n = win ? rs.mats[m] : fl(rs.mats[m] / 2);
      if (n > 0) {
        state.mats[m] = (state.mats[m] || 0) + n;
        rep.mats[m] = n;
        touch("m:" + m);
      }
    }
    const srcOf = (c) => c.split("@")[0], found = (c) => srcOf(c) === "cache" || srcOf(c) === "chest";
    let cases = rs.cases.slice();
    if (!win) cases = cases.filter(found).concat(cases.filter((c) => !found(c) && c !== "boss").slice(0, fl(cases.length / 3)));
    if (spec.weekly) {
      const wk = weekId(now);
      if (state.weekly.id !== wk) state.weekly = { id: wk, done: false, best: 0 };
      if (state.weekly.done) cases = cases.filter((c) => c !== "weekly");
      else if (cases.includes("weekly")) state.weekly.done = true;
      if (win && spec.week === wk) {
        const sc = Math.max(1, 1e3 + 40 * studyPts + 25 * Object.values(rs.kills).reduce((a, b) => a + b, 0) - 12 * st.turns - 2 * rs.dmgTaken);
        rep.weeklyScore = sc;
        if (sc > state.weekly.best) state.weekly.best = sc;
      }
    }
    let rf = 0;
    for (const s of spec.squad) rf = Math.max(rf, s.m.rareFind || 0);
    if (spec.mods.bloom || spec.mods.hunt) rf += 8;
    for (const raw of cases) {
      const [src, at] = raw.split("@");
      const isBoss = src === "boss";
      const it = rollItem(r, { src, region: spec.region, tier: spec.tier, target: spec.target, rareFind: Math.min(25, rf), singBonus: isBoss ? Math.min(3, fl(state.stats.bossDry / 8) * 0.25) : 0 });
      if (isBoss) state.stats.bossDry = it.sing ? 0 : state.stats.bossDry + 1;
      it.prov = { src, region: spec.region, tier: spec.tier, at: at || null, on: now };
      const isNew = !state.cat[it.sing ? "s:" + it.sing : "b:" + it.base];
      const id = addItem(state, it, now, fresh);
      rep.items.push({ id, src, isNew });
    }
    rep.research += studyPts + 3 * fresh.length;
    state.research += rep.research;
    rep.xp = (win ? rs.xp : fl(rs.xp / 2)) + 10 * fresh.filter((k) => k[0] !== "b" && k[0] !== "m").length;
    for (const sh of spec.squad) {
      const s = state.seekers[sh.sid];
      if (!s || s.lvl >= LEVEL_CAP) continue;
      s.xp += rep.xp;
      while (s.lvl < LEVEL_CAP && s.xp >= xpNext(s.lvl)) {
        s.xp -= xpNext(s.lvl);
        s.lvl++;
        s.pts++;
        rep.levelUps.push({ sid: s.id, lvl: s.lvl });
      }
      if (s.lvl >= LEVEL_CAP) s.xp = 0;
    }
    if (win && rs.bossDown && !spec.weekly && spec.tier === state.tierMax[spec.region] && spec.tier < 5) {
      state.tierMax[spec.region]++;
      rep.tierUp = state.tierMax[spec.region];
    }
    if (!spec.weekly) state.board = makeBoard(state, r.next());
    rep.study = rs.study;
    rep.kills = rs.kills;
    rep.flora = rs.flora;
    rep.wonders = Object.keys(rs.wonders);
    rep.variants = Object.keys(rs.variants);
    state.last = { at: now, outcome: st.outcome };
    return rep;
  }
  return __toCommonJS(core_exports);
})();
