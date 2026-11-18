// Content tables for The Uncatalogued. Pure data, shared by the browser and the server.

export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'exotic', 'singular'];
export const RARITY_NAME = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', exotic: 'Exotic', singular: 'Singular' };
export const SLOTS = ['weapon', 'body', 'head', 'accessory', 'implant', 'device'];
export const SLOT_NAME = { weapon: 'Weapon', body: 'Body', head: 'Head', accessory: 'Accessory', implant: 'Implant', device: 'Device' };
export const FAMILIES = ['organic', 'relic', 'anomalous'];
export const FAMILY_NAME = { organic: 'Organic', relic: 'Relic', anomalous: 'Anomalous' };
export const ATTRS = ['force', 'precision', 'vitality', 'adaptation', 'insight'];
export const ATTR_INFO = {
  force: ['Force', '+3% damage with Force weapons. Shoves hit harder.'],
  precision: ['Precision', '+3% damage with Precision weapons. +1% critical chance.'],
  vitality: ['Vitality', '+3 health.'],
  adaptation: ['Adaptation', '+3% damage with Adaptation weapons. +4% healing done. Stronger Bleed and Poison.'],
  insight: ['Insight', '+3% damage with Insight weapons. +3% ability and device power.'],
};

export const REGIONS = {
  verdant: {
    name: 'The Verdant Galleries', short: 'Verdant Galleries', code: 'VG',
    blurb: 'A rainforest grown through the display halls. The labels are still on the walls. Nothing is still behind them.',
    fam: { organic: 65, relic: 20, anomalous: 15 },
    fauna: ['thornling', 'mossback', 'glasswing', 'gulper', 'carrion', 'hush', 'orchardmother'],
    flora: ['lantern_moss', 'snare_vine', 'heartfruit', 'mirror_reed'],
    wonders: ['pocket_sun', 'upside_pool', 'growing_fossil', 'painted_door'],
    boss: 'orchardmother', elite: 'hush', observe: 'glasswing',
  },
  clockwork: {
    name: 'The Clockwork Wilds', short: 'Clockwork Wilds', code: 'CW',
    blurb: 'The keepers were machines. The exhibits were animals. After long enough, nobody could say which was which.',
    fam: { organic: 15, relic: 70, anomalous: 15 },
    fauna: ['mite', 'pollinator', 'coilfawn', 'warden', 'mantis', 'regulator'],
    flora: ['copper_lily', 'tick_fern', 'mirror_reed'],
    wonders: ['counting_clock', 'remembering_room', 'painted_door'],
    boss: 'regulator', elite: 'mantis', observe: 'coilfawn',
  },
};

// hp/dmg are tier 1 values. ai: pack | grazer | skittish | ambush | scavenger | predator | mender | sentinel | boss_orchard | boss_regulator
export const SPECIES = {
  thornling: { name: 'Thornling', latin: 'Spinifex gregarius', region: 'verdant', weak: 'relic', resist: 'organic', hp: 12, dmg: [4, 6], armor: 0, move: 3, range: 1, ai: 'pack', mat: 'thorn_resin',
    blurb: 'A seed pod that learned to walk and then learned to bite.',
    behavior: 'Hunts in groups. Each other Thornling beside its target adds 2 to its bite. Alone it is mostly noise.' },
  mossback: { name: 'Mossback', latin: 'Testudo hortensis', region: 'verdant', weak: 'anomalous', resist: 'organic', hp: 38, dmg: [7, 10], armor: 2, move: 2, range: 1, ai: 'grazer', mat: 'living_sap',
    blurb: 'A grazing animal with a garden on its back. The garden is older than the animal.',
    behavior: 'Ignores you until something hurts it. After that it charges whoever is nearest and does not calm down.' },
  glasswing: { name: 'Glasswing', latin: 'Vitrea fugax', region: 'verdant', weak: 'organic', resist: 'anomalous', hp: 9, dmg: [2, 3], armor: 0, move: 5, range: 1, ai: 'skittish', mat: 'sporeglass', prey: true,
    blurb: 'You can read the wall label through its wings.',
    behavior: 'Keeps three tiles between itself and anyone. Leaves the room for good once wounded. Approach from two sides or not at all.' },
  gulper: { name: 'Gulper Vine', latin: 'Faux radicans', region: 'verdant', weak: 'relic', resist: 'organic', hp: 22, dmg: [7, 9], armor: 1, move: 0, range: 3, ai: 'ambush', mat: 'thorn_resin',
    blurb: 'Filed under Flora for two centuries. The filing was wrong.',
    behavior: 'Rooted. Drags the nearest Seeker within three tiles to its mouth, then bites. Stay four tiles out and it can do nothing.' },
  carrion: { name: 'Carrion Bloom', latin: 'Necroflora ambulans', region: 'verdant', weak: 'relic', resist: 'organic', hp: 19, dmg: [4, 6], armor: 0, move: 3, range: 1, ai: 'scavenger', mat: 'sporeglass',
    blurb: 'A flower that walks to funerals.',
    behavior: 'Goes for remains before it goes for you. Each body it eats heals it and sharpens its bite. Eaten remains yield no material.' },
  hush: { name: 'Hush', latin: 'Silens silens', region: 'verdant', weak: 'organic', resist: 'anomalous', hp: 36, dmg: [8, 11], armor: 0, move: 4, range: 1, ai: 'predator', mat: 'living_sap', elite: true,
    blurb: 'The catalogue entry is a blank plate with claw marks on the frame.',
    behavior: 'Picks whoever stands alone, and prefers anyone already bleeding. Its bite opens a wound. Keep the squad shoulder to shoulder.' },
  orchardmother: { name: 'The Orchardmother', latin: 'Mater pomorum', region: 'verdant', weak: 'relic', resist: 'organic', hp: 92, dmg: [9, 13], armor: 1, move: 1, range: 1, ai: 'boss_orchard', mat: 'living_sap', boss: true,
    blurb: 'Every Thornling in the Galleries fell from her. She remembers each one.',
    behavior: 'Drops two Thornlings every third turn. Roots the farthest Seeker in place. Slow. Kill the brood or kill the mother, but choose.' },
  mite: { name: 'Brass Mite', latin: 'Acarus horologii', region: 'clockwork', weak: 'organic', resist: 'relic', hp: 10, dmg: [3, 4], armor: 1, move: 4, range: 1, ai: 'pack', mat: 'filament', mech: true,
    blurb: 'Built to clean the gears. Now it considers you a foreign object.',
    behavior: 'Swarms. When one breaks, its mainspring lashes everything beside it for 3, friend or not. Break them where they cluster.' },
  pollinator: { name: 'Pollinator', latin: 'Apis fabricata', region: 'clockwork', weak: 'anomalous', resist: 'relic', hp: 15, dmg: [0, 0], armor: 0, move: 4, range: 4, ai: 'mender', mat: 'machine_sap', mech: true,
    blurb: 'It tends metal flowers and anything else with a seam.',
    behavior: 'Harmless. Repairs the most damaged machine within four tiles each turn. Flees if struck.' },
  coilfawn: { name: 'Coilfawn', latin: 'Cervus elasticus', region: 'clockwork', weak: 'organic', resist: 'relic', hp: 17, dmg: [2, 4], armor: 0, move: 4, range: 1, ai: 'skittish', mat: 'machine_sap', prey: true,
    blurb: 'Half of it was born. Nobody has found the join.',
    behavior: 'Shy. The Wardens were built to keep it in and now keep everything else out. Hurt one and every Warden in the room turns on you.' },
  warden: { name: 'Warden', latin: 'Custos ferreus', region: 'clockwork', weak: 'anomalous', resist: 'relic', hp: 42, dmg: [8, 10], armor: 3, move: 3, range: 1, ai: 'sentinel', mat: 'pulse_core', mech: true,
    blurb: 'Its orders were to contain the exhibit. It has revised them to protect the exhibit.',
    behavior: 'Stands down unless it is struck or a Coilfawn is harmed. It punishes whoever did the harm, Seeker or beast.' },
  mantis: { name: 'Arc Mantis', latin: 'Mantis fulminans', region: 'clockwork', weak: 'organic', resist: 'relic', hp: 33, dmg: [8, 11], armor: 1, move: 4, range: 1, ai: 'predator', mat: 'pulse_core', mech: true, elite: true, hunts: true,
    blurb: 'It prays with both blades and something always answers.',
    behavior: 'Hunts Coilfawn when one is closer than you are. That brings the Wardens down on it. You are allowed to watch.' },
  regulator: { name: 'The Regulator', latin: 'Machina moderatrix', region: 'clockwork', weak: 'anomalous', resist: 'relic', hp: 96, dmg: [9, 12], armor: 2, move: 1, range: 1, ai: 'boss_regulator', mat: 'pulse_core', mech: true, boss: true,
    blurb: 'It kept the Wilds on schedule. The schedule ended. It did not.',
    behavior: 'Marks a full row or column, then purges it on its next turn. Everything on the line is hit, its own machines included. Step off the line.' },
};

export const VARIANTS = {
  pale: { name: 'Pale', note: 'Bleached. Mends itself every turn.' },
  gilded: { name: 'Gilded', note: 'Carries twice the material.' },
  overgrown: { name: 'Overgrown', note: 'Half again as large, and hits to match.' },
};

export const FLORA = {
  lantern_moss: { name: 'Lantern Moss', latin: 'Bryum lucens', mat: 'sporeglass', blurb: 'Glows when watched. Studies made within two tiles of it count for one more.' },
  snare_vine: { name: 'Snare Vine', latin: 'Laqueus repens', mat: 'thorn_resin', blurb: 'Lies flat across the path. The first thing to step on it is held for a turn.' },
  heartfruit: { name: 'Heartfruit', latin: 'Cor dulce', mat: 'living_sap', blurb: 'Beats faintly. Whoever picks it recovers 8 health.' },
  mirror_reed: { name: 'Mirror Reed', latin: 'Arundo speculum', mat: 'phase_crystal', blurb: 'Grows toward its own reflection. Rare in every hall.' },
  copper_lily: { name: 'Copper Lily', latin: 'Lilium cupreum', mat: 'filament', blurb: 'Picking it earths the charge: 4 damage to every creature beside it.' },
  tick_fern: { name: 'Tick-tock Fern', latin: 'Filix metronoma', mat: 'machine_sap', blurb: 'Unfurls once a second. Whoever picks it has one cooldown cut short.' },
};

export const WONDERS = {
  pocket_sun: { name: 'The Pocket Sun', blurb: 'A star the size of a plum, hung at head height. Somebody dusted it once.', effect: 'While it shines, every living thing in the room recovers 2 health a turn.' },
  upside_pool: { name: 'The Upside Pool', blurb: 'Water on the ceiling. It ripples when you speak.', effect: 'Sightlines bend here. Ranged weapons reach one tile farther.' },
  growing_fossil: { name: 'The Growing Fossil', blurb: 'Stone ribs, a hand longer than last season. The plinth has cracked to make room.', effect: 'The first creature to die in this room gets back up at half health.' },
  counting_clock: { name: 'The Clock That Counts Up', blurb: 'No hands. A number. The number is very large and it has just changed.', effect: 'Time runs quick in here. Cooldowns recover twice as fast.' },
  remembering_room: { name: 'The Room That Remembers', blurb: 'Your footprints are already on the floor, a little ahead of you.', effect: 'The floor knows where you are going. Everyone moves one tile farther.' },
  painted_door: { name: 'A Door Painted on Nothing', blurb: 'There is no wall behind it. It is locked from the other side.', effect: 'Recording it shakes a sealed case loose from somewhere.' },
  // Side places: off the way to the gate. Each can be seen from one hall and walked to. `seen` is how it looks from there.
  lit_knoll: { place: true, name: 'The Lit Knoll', seen: 'a light on the hill', blurb: 'A lamp burning on a hill nobody has climbed. The oil is fresh.', effect: 'Somebody keeps this lamp. They are not here.' },
  hollow_giant: { place: true, name: 'The Hollow Giant', seen: 'a door in a great tree', blurb: 'A tree wide as a gallery, with a door cut in it at Seeker height. The hinges are new.', effect: 'Whoever cut the door has been living in the tree.' },
  standing_glass: { place: true, name: 'The Standing Glass', seen: 'something glinting in the wet ground', blurb: 'A ring of empty plinths in standing water, each with a glass dome that was never broken.', effect: 'The domes were never filled. The labels were written first.' },
  signal_mast: { place: true, name: 'The Signal Mast', seen: 'a mast blinking on the ridge', blurb: 'A brass mast that blinks a pattern. The pattern is longer every time it repeats.', effect: 'It is sending to something. Nothing has answered yet.' },
  cold_foundry: { place: true, name: 'The Cold Foundry', seen: 'a chimney with no smoke', blurb: 'A foundry the size of a chapel, cold for a long time. The moulds are still set out.', effect: 'The moulds are for parts of something much larger than anything in the Wilds.' },
  wound_orchard: { place: true, name: 'The Wound Orchard', seen: 'rows of something planted', blurb: 'Brass saplings in straight rows, each with a key in its trunk. Some of the keys are still turning.', effect: 'Somebody winds them. The earliest rows have run down.' },
};

export const MATERIALS = {
  thorn_resin: { name: 'Thorn Resin', fam: 'organic', blurb: 'Sets harder than the thorn it came from.' },
  living_sap: { name: 'Living Sap', fam: 'organic', blurb: 'Keep the jar closed. It looks for the lid.' },
  sporeglass: { name: 'Sporeglass', fam: 'organic', blurb: 'Clear, light, and still technically alive.' },
  filament: { name: 'Conductive Filament', fam: 'relic', blurb: 'Hums near anything with a pulse.' },
  machine_sap: { name: 'Machine Sap', fam: 'relic', blurb: 'Oil that scabs over.' },
  pulse_core: { name: 'Pulse Core', fam: 'relic', blurb: 'Still counting. Nobody knows toward what.' },
  phase_crystal: { name: 'Phase Crystal', fam: 'anomalous', blurb: 'Weighs more on some days.' },
};

// Seekers
export const ARCHETYPES = {
  vanguard: { name: 'Vanguard', seeker: 'Hobb', bio: 'Loaded freight at the Entrance for nine years. Walked in the day the door opened wider.',
    attr: { force: 5, precision: 2, vitality: 5, adaptation: 2, insight: 1 }, abilities: ['brace', 'shove', 'riposte'], start: { weapon: 'marrow_cleaver', body: 'chitin_plate' },
    passive: 'Stands firm: takes 1 less damage from every hit.' },
  tracker: { name: 'Tracker', seeker: 'Sile', bio: 'Counts everything. Has not yet said what the count is for.',
    attr: { force: 2, precision: 6, vitality: 3, adaptation: 2, insight: 2 }, abilities: ['mark', 'snare', 'deadeye'], start: { weapon: 'thorncaster', body: 'barkweave' },
    passive: 'Clean shot: +10 critical chance against targets at full health.' },
  naturalist: { name: 'Naturalist', seeker: 'Oyelaran', bio: 'Came to disprove the Cabinet. Stayed to draw it.',
    attr: { force: 1, precision: 3, vitality: 3, adaptation: 6, insight: 2 }, abilities: ['mend', 'spore_dart', 'soothe'], start: { weapon: 'spore_sling', body: 'barkweave' },
    passive: 'Light hands: studying a calm creature also takes a sample from it.' },
  tinkerer: { name: 'Tinkerer', seeker: 'Tamsin-7', bio: 'A maintenance unit that stopped maintaining. Calls the Wardens "management".',
    attr: { force: 1, precision: 3, vitality: 3, adaptation: 2, insight: 6 }, abilities: ['drone', 'arc_pulse', 'overclock'], start: { weapon: 'pulse_rifle', body: 'relay_harness' },
    passive: 'Spare parts: devices have one extra charge.' },
  firebrand: { name: 'Firebrand', seeker: 'Garrow', bio: 'An exhibit that let itself out. Half lion, half eagle, all temper. Wants its own entry written properly.',
    attr: { force: 3, precision: 6, vitality: 1, adaptation: 2, insight: 3 }, abilities: ['kindle', 'fire_breath', 'red_glare'], start: { weapon: 'kindled_pair', body: 'chitin_plate' },
    passive: 'Twin blades: the dagger follows every weapon attack for 40%. Burns hot: every hit taken deals 1 more.' },
};

export const ABILITIES = {
  brace: { name: 'Brace', ap: 1, cd: 2, target: 'self', desc: 'Gain a shield and draw the attention of every creature beside you.' },
  shove: { name: 'Shove', ap: 1, cd: 2, target: 'enemy', range: 1, desc: 'Strike and throw the target two tiles back. It takes extra damage if it hits something.' },
  riposte: { name: 'Riposte', ap: 1, cd: 3, target: 'self', desc: 'Until your next turn, strike back at anything that hits you in melee.' },
  mark: { name: 'Mark', ap: 0, cd: 3, target: 'enemy', range: 5, desc: 'Free. The target takes 25% more damage from everyone for 2 turns.' },
  snare: { name: 'Snare', ap: 1, cd: 3, target: 'tile', range: 3, desc: 'Set a trap on an empty tile. The first creature to step on it is hurt and held for 2 turns.' },
  deadeye: { name: 'Deadeye', ap: 2, cd: 2, target: 'enemy', range: 'weapon', desc: 'A slow shot for 190% damage. Always critical against a Marked target.' },
  mend: { name: 'Mend', ap: 1, cd: 1, target: 'ally', range: 3, desc: 'Heal a Seeker within three tiles.' },
  spore_dart: { name: 'Spore Dart', ap: 1, cd: 1, target: 'enemy', range: 4, desc: 'Apply 3 Poison. Poison deals damage each turn and fades by one.' },
  soothe: { name: 'Soothe', ap: 1, cd: 4, target: 'enemy', range: 3, desc: 'Calm a creature for 2 turns. It stops hunting unless something hurts it. No effect on the great ones.' },
  drone: { name: 'Deploy Drone', ap: 1, cd: 4, target: 'tile', range: 2, desc: 'Launch a drone that shoots the nearest hostile each turn for 3 turns.' },
  arc_pulse: { name: 'Arc Pulse', ap: 1, cd: 2, target: 'enemy', range: 3, desc: 'Shock a target. The arc jumps to one creature beside it for half.' },
  overclock: { name: 'Overclock', ap: 1, cd: 3, target: 'ally', range: 3, desc: 'Another Seeker gains 2 action points now.' },
  kindle: { name: 'Kindle', ap: 0, cd: 4, target: 'self', desc: 'Free. Both blades catch fire for 2 turns. Every hit sets its target Burning.' },
  fire_breath: { name: 'Firebreath', ap: 2, cd: 3, target: 'enemy', range: 2, desc: 'Breathe fire over a creature and everything beside it. All of them are hurt and set Burning.' },
  red_glare: { name: 'Red Glare', ap: 1, cd: 2, target: 'enemy', range: 5, desc: 'Two red beams from the eyes. Strikes one distant creature and ignores its armor.' },
  // spec upgrades reuse ids with flags in SPECS
};

export const SPECS = {
  vanguard: [
    { id: 'bulwark', name: 'Bulwark', desc: 'Brace also shields Seekers beside you. +2 armor.' },
    { id: 'retaliator', name: 'Retaliator', desc: 'Riposte hits 60% harder. Each hit you take adds 15% to your next attack.' },
  ],
  tracker: [
    { id: 'marksman', name: 'Marksman', desc: '+1 weapon range. Your first critical hit each turn refunds 1 action point.' },
    { id: 'trapper', name: 'Trapper', desc: 'Snare cools down in 1 turn and its victims bleed.' },
  ],
  naturalist: [
    { id: 'medic', name: 'Medic', desc: 'Mend clears Bleed and Poison and leaves 2 turns of regeneration.' },
    { id: 'toxicologist', name: 'Toxicologist', desc: 'Your Poison hits 50% harder and jumps to a neighbour when its host dies.' },
  ],
  tinkerer: [
    { id: 'dronewright', name: 'Dronewright', desc: 'Drones last the whole room and hit 50% harder.' },
    { id: 'saboteur', name: 'Saboteur', desc: 'Arc Pulse stuns machines for a turn and Marks whatever it hits.' },
  ],
  firebrand: [
    { id: 'pyre', name: 'Pyre', desc: 'Burning lasts a turn longer and hits 50% harder.' },
    { id: 'cutthroat', name: 'Cutthroat', desc: 'The dagger follows for 70%. +15 critical chance against Burning targets.' },
  ],
};

export const TRAITS = {
  patient: { name: 'Patient Hunter', desc: '+20% damage on turns you have not moved.' },
  tissue: { name: 'Adaptive Tissue', desc: 'Bleed and Poison on you end a turn sooner.' },
  curious: { name: 'Curious Mind', desc: 'Each Study counts for one more.' },
  nerves: { name: 'Unstable Nerves', desc: '+25% damage while under 40% health.' },
  packmate: { name: 'Pack Instinct', desc: '+15% damage to a target another Seeker already hit this turn.' },
  light: { name: 'Light Step', desc: '+1 movement.' },
  forager: { name: 'Forager', desc: 'Picking flora does not cost an action point.' },
  stubborn: { name: 'Stubborn', desc: 'The first time you would go down in a room, stay up at 1 health.' },
};
export const TRAIT_LEVELS = [5, 8];
export const SPEC_LEVEL = 3;
export const LEVEL_CAP = 10;

// Equipment bases. w = weapon [min,max,range,scale]
export const BASES = {
  thorncaster: { name: 'Thorncaster', slot: 'weapon', fam: 'organic', w: [5, 8, 4, 'precision'], tags: [], text: 'Ranged 4. Scales with Precision.' },
  marrow_cleaver: { name: 'Marrow Cleaver', slot: 'weapon', fam: 'organic', w: [7, 10, 1, 'force'], tags: [], text: 'Melee. Scales with Force.' },
  spore_sling: { name: 'Spore Sling', slot: 'weapon', fam: 'organic', w: [4, 6, 3, 'adaptation'], tags: ['poison'], m: { poisonHit: 1 }, text: 'Ranged 3. Scales with Adaptation. Each hit applies 1 Poison.' },
  pulse_rifle: { name: 'Pulse Rifle', slot: 'weapon', fam: 'relic', w: [5, 8, 4, 'precision'], tags: ['electric'], m: { pierce: 1 }, text: 'Ranged 4. Scales with Precision. Ignores 1 armor.' },
  arc_lance: { name: 'Arc Lance', slot: 'weapon', fam: 'relic', w: [6, 9, 2, 'insight'], tags: ['electric'], text: 'Reach 2. Scales with Insight.' },
  kindled_pair: { name: 'Kindled Pair', slot: 'weapon', fam: 'relic', w: [5, 8, 1, 'precision'], tags: [], text: 'Melee. A sword and a dagger that take a flame. Scales with Precision.' },
  echo_blade: { name: 'Echo Blade', slot: 'weapon', fam: 'anomalous', w: [6, 8, 1, 'force'], tags: ['spatial'], m: { echo: 35 }, text: 'Melee. Scales with Force. 35% of each hit lands again next turn.' },

  chitin_plate: { name: 'Chitin Plate', slot: 'body', fam: 'organic', m: { armor: 3 }, tags: [], text: '' },
  barkweave: { name: 'Barkweave Coat', slot: 'body', fam: 'organic', m: { armor: 1, hp: 8, regen: 1 }, tags: ['regen'], text: '' },
  relay_harness: { name: 'Relay Harness', slot: 'body', fam: 'relic', m: { armor: 2, shieldStart: 6 }, tags: ['shield'], text: '' },
  mirror_carapace: { name: 'Mirror Carapace', slot: 'body', fam: 'relic', m: { armor: 2, thorns: 2 }, tags: ['thorns'], text: '' },
  phase_shroud: { name: 'Phase Shroud', slot: 'body', fam: 'anomalous', m: { armor: 1, phase: 1 }, tags: ['spatial'], text: 'The first hit against you in each room passes through.' },

  compound_lens: { name: 'Compound Lens', slot: 'head', fam: 'organic', m: { study: 1 }, tags: ['study'], text: '' },
  targeting_visor: { name: 'Targeting Visor', slot: 'head', fam: 'relic', m: { crit: 8 }, tags: ['crit'], text: '' },
  hunter_mask: { name: "Hunter's Mask", slot: 'head', fam: 'organic', m: { vsMarked: 12 }, tags: ['mark'], text: '' },
  oracle_shard: { name: 'Oracle Shard', slot: 'head', fam: 'anomalous', m: { range: 1 }, tags: ['spatial'], text: '' },

  resin_charm: { name: 'Resin Charm', slot: 'accessory', fam: 'organic', m: { healPow: 15 }, tags: ['regen'], text: '' },
  capacitor_band: { name: 'Capacitor Band', slot: 'accessory', fam: 'relic', m: { abil: 12 }, tags: ['electric'], text: '' },
  bait_satchel: { name: 'Bait Satchel', slot: 'accessory', fam: 'organic', m: { yield: 20 }, tags: ['yield', 'lure'], text: '' },
  lucky_knot: { name: 'Lucky Knot', slot: 'accessory', fam: 'anomalous', m: { crit: 5, critDmg: 20 }, tags: ['crit'], text: '' },

  leechroot: { name: 'Leechroot', slot: 'implant', fam: 'organic', m: { leech: 3 }, tags: ['bleed'], text: 'Your hits on Bleeding targets heal you for 3.' },
  symbiote_graft: { name: 'Symbiote Graft', slot: 'implant', fam: 'organic', m: { regen: 2 }, tags: ['symbiote'], text: '' },
  neural_shunt: { name: 'Neural Shunt', slot: 'implant', fam: 'relic', m: { cdr: 1 }, tags: ['electric'], text: '' },
  venom_sac: { name: 'Venom Sac', slot: 'implant', fam: 'organic', m: { poisonHit: 1 }, tags: ['poison'], text: '' },
  fold_gland: { name: 'Fold Gland', slot: 'implant', fam: 'anomalous', m: { move: 1 }, tags: ['spatial'], text: '' },

  lure_pod: { name: 'Lure Pod', slot: 'device', fam: 'organic', dev: 'lure', tags: ['lure'], text: 'Device. Throw a pod within 4 tiles. Creatures hunt the pod for 2 turns.' },
  barrier_seed: { name: 'Barrier Seed', slot: 'device', fam: 'organic', dev: 'barrier', tags: ['shield'], text: 'Device. A Seeker within 3 tiles gains a shield.' },
  pulse_emitter: { name: 'Pulse Emitter', slot: 'device', fam: 'relic', dev: 'pulse', tags: ['electric'], text: 'Device. Shock a tile within 3 and everything beside it.' },
  drone_core: { name: 'Drone Core', slot: 'device', fam: 'relic', dev: 'drone', tags: ['drone'], text: 'Device. Launch a drone for 3 turns.' },
  blink_anchor: { name: 'Blink Anchor', slot: 'device', fam: 'anomalous', dev: 'blink', tags: ['spatial'], text: 'Device. Step to any empty tile within 5. Free.' },
  gravity_knot: { name: 'Gravity Knot', slot: 'device', fam: 'anomalous', dev: 'gravity', tags: ['spatial'], text: 'Device. Drag every creature within 2 tiles of a point toward it and hold them a turn.' },
};

// Mod descriptions. {v} is replaced by the rolled value.
export const MOD_TEXT = {
  armor: '+{v} armor', hp: '+{v} health', regen: 'Recover {v} health each turn', shieldStart: 'Enter each room with a {v} shield', thorns: 'Melee attackers take {v} damage',
  crit: '+{v}% critical chance', critDmg: '+{v}% critical damage', vsWounded: '+{v}% damage to targets under half health', vsFull: '+{v}% damage to targets at full health',
  vsMarked: '+{v}% damage to Marked targets', bleedHit: '{v}% chance to cause Bleed on hit', poisonHit: 'Hits apply {v} Poison', switchTarget: '+{v}% damage when you change targets',
  sameTarget: '+{v}% damage per repeat hit on one target (up to 3)', pierce: 'Ignore {v} armor', chain: 'Hits arc to a neighbour for {v}%', echo: '{v}% of each hit lands again next turn',
  move: '+{v} movement', range: '+{v} weapon range', cdr: 'Cooldowns are {v} turn shorter', poisonPot: 'Your Poison deals {v}% more', bleedDur: 'Your Bleed lasts {v} turns longer',
  healPow: '+{v}% healing done', killHeal: 'Recover {v} health on a kill', study: 'Each Study counts for {v} more', yield: '+{v}% material from kills and flora',
  rareFind: 'Sealed cases are {v}% more likely to hold something rare', variantSense: 'Variants are {v}% more likely to appear', abil: '+{v}% ability and device power',
  dmgPct: '+{v}% damage', leech: 'Hits on Bleeding targets heal you for {v}', phase: 'The first hit against you in each room passes through',
};

// Affixes. cat: off | def | tac | bio | dis. slots, fams restrict where it can roll. min = lowest rarity index.
export const AFFIXES = {
  keen: { pre: 'Keen', suf: 'of the Needle', cat: 'off', key: 'crit', r: [4, 10], slots: ['weapon', 'head', 'accessory'], fams: FAMILIES, tags: ['crit'] },
  brutal: { pre: 'Brutal', suf: 'of Ruin', cat: 'off', key: 'critDmg', r: [20, 45], slots: ['weapon', 'implant', 'accessory'], fams: FAMILIES, tags: ['crit'] },
  barbed: { pre: 'Barbed', suf: 'of the Cull', cat: 'off', key: 'vsWounded', r: [12, 24], slots: ['weapon', 'implant'], fams: ['organic', 'anomalous'], tags: [] },
  ambush: { pre: "Ambusher's", suf: 'of First Blood', cat: 'off', key: 'vsFull', r: [15, 30], slots: ['weapon', 'head'], fams: FAMILIES, tags: [] },
  serrated: { pre: 'Serrated', suf: 'of Bleeding', cat: 'off', key: 'bleedHit', r: [20, 40], slots: ['weapon', 'implant', 'accessory'], fams: ['organic'], tags: ['bleed'] },
  venomous: { pre: 'Venomous', suf: 'of the Adder', cat: 'off', key: 'poisonHit', r: [1, 2], slots: ['weapon', 'implant'], fams: ['organic'], tags: ['poison'] },
  restless: { pre: 'Restless', suf: 'of Wandering', cat: 'off', key: 'switchTarget', r: [12, 25], slots: ['weapon', 'accessory'], fams: FAMILIES, tags: [] },
  fixated: { pre: 'Fixated', suf: 'of Obsession', cat: 'off', key: 'sameTarget', r: [6, 12], slots: ['weapon', 'accessory'], fams: ['relic', 'anomalous'], tags: [] },
  piercing: { pre: 'Piercing', suf: 'of the Awl', cat: 'off', key: 'pierce', r: [1, 3], slots: ['weapon'], fams: ['relic', 'organic'], tags: [] },
  arcing: { pre: 'Arcing', suf: 'of Storms', cat: 'off', key: 'chain', r: [25, 45], slots: ['weapon', 'accessory'], fams: ['relic'], tags: ['electric'] },
  echoing: { pre: 'Echoing', suf: 'of Yesterday', cat: 'off', key: 'echo', r: [15, 30], slots: ['weapon', 'implant'], fams: ['anomalous'], tags: ['spatial'] },
  tracking: { pre: "Stalker's", suf: 'of the Hunt', cat: 'off', key: 'vsMarked', r: [10, 20], slots: ['weapon', 'head', 'accessory'], fams: ['organic', 'relic'], tags: ['mark'] },
  plated: { pre: 'Plated', suf: 'of the Shell', cat: 'def', key: 'armor', r: [1, 3], slots: ['body', 'head'], fams: FAMILIES, tags: [] },
  hale: { pre: 'Hale', suf: 'of the Ox', cat: 'def', key: 'hp', r: [6, 14], slots: ['body', 'implant', 'accessory'], fams: FAMILIES, tags: [] },
  warded: { pre: 'Warded', suf: 'of the Screen', cat: 'def', key: 'shieldStart', r: [4, 9], slots: ['body', 'accessory', 'device'], fams: ['relic', 'anomalous'], tags: ['shield'] },
  spined: { pre: 'Spined', suf: 'of Nettles', cat: 'def', key: 'thorns', r: [2, 4], slots: ['body', 'implant'], fams: ['organic', 'relic'], tags: ['thorns'] },
  mending: { pre: 'Mending', suf: 'of Regrowth', cat: 'bio', key: 'regen', r: [1, 2], slots: ['body', 'implant', 'accessory'], fams: ['organic'], tags: ['regen'] },
  fleet: { pre: 'Fleet', suf: 'of the Hare', cat: 'tac', key: 'move', r: [1, 1], slots: ['body', 'implant'], fams: FAMILIES, tags: [], min: 2 },
  farsight: { pre: 'Farsighted', suf: 'of the Horizon', cat: 'tac', key: 'range', r: [1, 1], slots: ['head', 'accessory'], fams: ['relic', 'anomalous'], tags: [], min: 2 },
  recursive: { pre: 'Recursive', suf: 'of the Loop', cat: 'tac', key: 'cdr', r: [1, 1], slots: ['accessory', 'head', 'device'], fams: ['relic'], tags: [], min: 2 },
  tuned: { pre: 'Tuned', suf: 'of the Engine', cat: 'tac', key: 'abil', r: [10, 22], slots: ['accessory', 'head', 'device', 'implant'], fams: ['relic', 'anomalous'], tags: [] },
  virulent: { pre: 'Virulent', suf: 'of Blight', cat: 'bio', key: 'poisonPot', r: [20, 45], slots: ['implant', 'accessory', 'weapon'], fams: ['organic'], tags: ['poison'] },
  lingering: { pre: 'Lingering', suf: 'of the Open Wound', cat: 'bio', key: 'bleedDur', r: [1, 2], slots: ['implant', 'accessory'], fams: ['organic'], tags: ['bleed'] },
  nurturing: { pre: 'Nurturing', suf: 'of the Garden', cat: 'bio', key: 'healPow', r: [10, 25], slots: ['accessory', 'head', 'implant'], fams: ['organic'], tags: ['regen'] },
  symbiotic: { pre: 'Symbiotic', suf: 'of the Host', cat: 'bio', key: 'killHeal', r: [2, 4], slots: ['implant', 'body'], fams: ['organic'], tags: ['symbiote'] },
  studious: { pre: 'Studious', suf: 'of the Notebook', cat: 'dis', key: 'study', r: [1, 1], slots: ['head', 'accessory'], fams: FAMILIES, tags: ['study'] },
  gleaning: { pre: 'Gleaning', suf: 'of Plenty', cat: 'dis', key: 'yield', r: [15, 35], slots: ['accessory', 'head', 'device'], fams: FAMILIES, tags: ['yield'] },
  curator: { pre: "Curator's", suf: 'of the Vault', cat: 'dis', key: 'rareFind', r: [5, 12], slots: ['accessory', 'head'], fams: ['relic', 'anomalous'], tags: [] },
  wayfinder: { pre: "Wayfinder's", suf: 'of Strange Roads', cat: 'dis', key: 'variantSense', r: [30, 80], slots: ['head', 'accessory', 'device'], fams: FAMILIES, tags: [] },
};
export const CAT_NAME = { off: 'Offensive', def: 'Defensive', tac: 'Tactical', bio: 'Biological', dis: 'Discovery' };

// Special effects: Epic sometimes, Exotic always.
export const SPECIALS = {
  swarm: { name: 'Broodmother', slots: ['weapon'], fams: ['organic'], tags: [], text: 'Every third kill hatches a Thornling that fights for you for 2 turns.' },
  killrefund: { name: 'Momentum', slots: ['weapon'], fams: FAMILIES, tags: [], text: 'Your first kill each turn refunds 1 action point.' },
  freemove: { name: 'Unbound', slots: ['body', 'implant'], fams: FAMILIES, tags: [], text: 'Your first move each turn costs no action point.' },
  studymark: { name: 'Field Marks', slots: ['head'], fams: FAMILIES, tags: ['mark', 'study'], text: 'Studying a creature also Marks it for 2 turns.' },
  knowledge: { name: 'Learned', slots: ['head', 'accessory'], fams: FAMILIES, tags: ['study'], text: '+5% damage for each Catalogue stage you hold on the target species.' },
  overload: { name: 'Overload', slots: ['accessory', 'device'], fams: ['relic'], tags: ['electric'], text: 'Abilities deal 40% more. Their cooldowns are 1 turn longer.' },
  glass: { name: 'Hollow', slots: ['weapon', 'implant'], fams: ['anomalous'], tags: [], text: '+35% damage. 25% less health.' },
  deathspore: { name: 'Sporeburst', slots: ['weapon', 'implant'], fams: ['organic'], tags: ['poison'], text: 'Creatures you kill burst: 2 Poison to every hostile beside them.' },
  twin: { name: 'Twinned', slots: ['device'], fams: FAMILIES, tags: [], text: 'This device has one extra charge in each room.' },
  bloodscent: { name: 'Bloodscent', slots: ['implant', 'head'], fams: ['organic'], tags: ['bleed', 'crit'], text: 'Your hits on Bleeding targets are always critical.' },
  anchor: { name: 'Anchored', slots: ['body'], fams: ['relic'], tags: ['shield'], text: 'You cannot be pushed, pulled or rooted. Seekers beside you gain 2 armor.' },
  gambler: { name: "Gambler's", slots: ['accessory', 'weapon'], fams: ['anomalous'], tags: ['crit'], text: 'Damage rolls twice and keeps the better. Healing you receive is cut by 20%.' },
};

export const SINGULARS = {
  second_heart: { name: 'The Second Heart', slot: 'implant', fam: 'organic', tags: ['symbiote', 'regen'], m: { regen: 1 },
    text: 'Once per expedition, a blow that would fell you leaves you standing at 30% health. Healing from others is cut by 15%.', lore: 'It was in a jar marked SPARE.' },
  hungry_compass: { name: 'The Hungry Compass', slot: 'accessory', fam: 'anomalous', tags: ['spatial'], m: {},
    text: '+6% damage for every different species you have met on this expedition.', lore: 'Points at whatever you have not seen yet.' },
  borrowed_moment: { name: 'The Borrowed Moment', slot: 'accessory', fam: 'relic', tags: ['electric'], m: {},
    text: 'Every fourth ability you use costs no action points and has no cooldown.', lore: 'Somebody will want it back.' },
  unfinished_machine: { name: 'The Unfinished Machine', slot: 'device', fam: 'relic', dev: 'unfinished', tags: ['electric', 'drone', 'spatial'], m: {},
    text: 'Device. Each turn it is a different device. Two charges a room.', lore: 'The last page of the manual says only: or.' },
  collectors_eye: { name: "The Collector's Eye", slot: 'head', fam: 'anomalous', tags: ['study', 'mark'], m: { study: 2, variantSense: 100, rareFind: 10, dmgPct: -25 },
    text: 'It would rather look than fight.', lore: 'It blinks when you are not watching. You have checked.' },
  yesterdays_rifle: { name: "Yesterday's Rifle", slot: 'weapon', fam: 'anomalous', w: [6, 9, 5, 'precision'], tags: ['spatial'], m: { echo: 70 },
    text: 'Ranged 5. Scales with Precision. Every shot lands twice: now, and again next turn wherever the target has gone.', lore: 'The report arrives first.' },
};

// Resonances: two tags from two different items worn by one Seeker.
export const RESONANCES = {
  bloodgarden: { name: 'Bloodgarden', need: ['bleed', 'bleed'], text: 'When a Bleeding creature dies, every hostile beside it starts Bleeding.' },
  chain_reaction: { name: 'Chain Reaction', need: ['electric', 'drone'], text: 'Your drones\' shots arc to a second target.' },
  living_bastion: { name: 'Living Bastion', need: ['regen', 'symbiote'], text: 'Any healing you receive also gives you half that much shield.' },
  displaced_fate: { name: 'Displaced Fate', need: ['crit', 'spatial'], text: 'Your critical hits throw the target one tile back.' },
  feeding_frenzy: { name: 'Feeding Frenzy', need: ['lure', 'poison'], text: 'Creatures hunting a lure take double Poison damage.' },
  rebound: { name: 'Rebound', need: ['shield', 'thorns'], text: 'When your shield breaks, everything beside you takes the shield\'s full value.' },
  field_notes: { name: 'Field Notes', need: ['study', 'mark'], text: 'Hitting a Marked creature counts as studying it.' },
  red_harvest: { name: 'Red Harvest', need: ['bleed', 'yield'], text: 'Creatures that die Bleeding leave one extra material.' },
  galvanic_rot: { name: 'Galvanic Rot', need: ['electric', 'poison'], text: 'Your hits deal +2 damage for each Poison on the target.' },
};
export const TAG_NAME = { bleed: 'Bleed', poison: 'Poison', electric: 'Electric', drone: 'Drone', regen: 'Regrowth', symbiote: 'Symbiote', crit: 'Critical', spatial: 'Spatial', lure: 'Lure', shield: 'Shield', thorns: 'Thorns', study: 'Study', mark: 'Mark', yield: 'Yield' };

// Loot tables (percent), from the design spec.
export const RARITY_TABLE = {
  standard: [45, 35, 16, 3.5, 0.5, 0],
  elite: [20, 35, 30, 12, 3, 0],
  cache: [20, 35, 30, 12, 3, 0],
  chest: [8, 28, 38, 20, 6, 0], // hidden and locked, so worth more than a case left in the open
  contract: [10, 30, 38, 17, 5, 0],
  boss: [5, 20, 40, 27, 7.8, 0.2],
  weekly: [0, 10, 40, 35, 14, 1],
};
export const DISMANTLE = [1, 2, 4, 7, 12, 0];
export const CAL_MAX = [1, 1, 2, 2, 3, 0];
export const STAT_MULT = [100, 102, 104, 106, 108, 108];

export const CONTRACT_TYPES = {
  pursue: { name: 'Pursue', verb: 'Bring down', text: 'Find the great one at the end of the hall and end it.' },
  observe: { name: 'Observe', verb: 'Observe', text: 'Study the species and leave every one of them alive.' },
  harvest: { name: 'Harvest', verb: 'Harvest', text: 'Gather flora across the expedition.' },
  recover: { name: 'Recover', verb: 'Recover', text: 'A sealed case sits at the far end of the last room. Open it.' },
};

// Index milestones. test(ctx) -> [have, need]
export const MILESTONES = [
  { id: 'bench', name: 'A place to work', need: '12 Catalogue entries', reward: 'Workbench: refine and calibrate equipment', test: c => [c.entries, 12] },
  { id: 'clockwork', name: 'The second door', need: '24 Catalogue entries', reward: 'The Clockwork Wilds open', test: c => [c.entries, 24] },
  { id: 'tamsin', name: 'A defector', need: 'Catalogue any machine species', reward: 'Tamsin-7 joins as Tinkerer', test: c => [c.mech, 1] },
  { id: 'garrow', name: 'An exhibit lets itself out', need: 'Investigate 2 species', reward: 'Garrow joins as Firebrand', test: c => [c.investigated, 2] },
  { id: 'mutate', name: 'Biological crafting', need: 'Observe 3 species', reward: 'Workbench: mutate an affix', test: c => [c.observed, 3] },
  { id: 'variants', name: 'An eye for the odd one', need: 'Catalogue 1 variant', reward: 'Variants appear 50% more often', test: c => [c.variants, 1] },
  { id: 'bloom', name: 'What should not be', need: 'Record 1 Wonder', reward: 'Bloom contracts: stranger rooms, better cases', test: c => [c.wonders, 1] },
  { id: 'hunts', name: 'Hunting licence', need: 'Investigate 3 species', reward: 'Hunt contracts: an elite in every room', test: c => [c.investigated, 3] },
  { id: 'assemble', name: 'Pattern book', need: 'Catalogue 12 equipment types', reward: 'Workbench: assemble any equipment you have catalogued', test: c => [c.bases, 12] },
  { id: 'eye', name: 'The complete Galleries', need: 'Observe every Verdant species and record its flora', reward: "Singular: The Collector's Eye", test: c => [c.verdantDone, c.verdantAll] },
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Which side places a region has, and what stands in each. Nobody knows what a find does until it is tried.
// does: notes (field notes on something that lives here), case (a sealed case), mats, mend (the party is restored), lore (experience).
export const PLACES = { verdant: ['lit_knoll', 'hollow_giant', 'standing_glass'], clockwork: ['signal_mast', 'cold_foundry', 'wound_orchard'] };
export const FINDS = {
  keepers_log: { place: 'lit_knoll', name: "A keeper's ledger", look: 'Under an oilcloth by the lamp post. The last page is still damp.', model: 'survey', does: 'notes', after: 'Tallies of what passed the hill each night, in a careful hand.' },
  buried_tin: { place: 'lit_knoll', name: 'A buried tin', look: 'Sunk to the lid beside the path. It rattles when the ground is stamped.', model: 'cache', does: 'case', after: 'A sealed case, packed in straw.' },
  warm_stone: { place: 'lit_knoll', name: 'A warm stone', look: 'The moss is worn off the top, as if something sleeps on it.', model: 'lantern_moss', does: 'mend', after: 'The warmth goes right through. Everyone sits a while.' },
  woven_nest: { place: 'hollow_giant', name: 'A woven nest', look: 'Wider than Hobb is tall, and lined with something that catches the light.', model: 'heartfruit', does: 'mats', after: 'The lining comes away in sheets.' },
  carved_shelf: { place: 'hollow_giant', name: 'A carved shelf', look: 'Cut into the heartwood. Rows of small things under dust sheets.', model: 'crates', does: 'case', after: 'One of the things under the sheets is a sealed case.' },
  bark_ledger: { place: 'hollow_giant', name: 'Marks in the bark', look: 'Hundreds of tallies cut at different heights. The lowest are the oldest.', model: 'plinth', does: 'notes', after: 'A count of something, kept for years.' },
  empty_dome: { place: 'standing_glass', name: 'An unbroken dome', look: 'Nothing inside. The label on the plinth is already written.', model: 'case_broken', does: 'lore', after: 'The label names something that has not been found yet.' },
  drowned_case: { place: 'standing_glass', name: 'A drowned crate', look: 'Just under the surface, lashed shut. The rope is recent.', model: 'cache', does: 'case', after: 'A sealed case, bone dry inside.' },
  still_reed: { place: 'standing_glass', name: 'A reed that does not move', look: 'The others bend in the wind. This one is listening.', model: 'mirror_reed', does: 'notes', after: 'It turns to follow whatever comes near. You learn what it has been following.' },
  mast_log: { place: 'signal_mast', name: 'A punched tape', look: 'Spooling out of the mast foot into a heap. Still coming.', model: 'survey', does: 'notes', after: 'A record of everything that has walked under the mast.' },
  relay_box: { place: 'signal_mast', name: 'A sealed relay box', look: 'Bolted to the base. Something inside is ticking evenly.', model: 'cache', does: 'case', after: 'A sealed case with a clock packed round it.' },
  earth_rod: { place: 'signal_mast', name: 'A humming rod', look: 'Driven into the ground. The air round it tastes of metal.', model: 'lantern_moss', does: 'mend', after: 'Every joint and ache settles at once.' },
  set_mould: { place: 'cold_foundry', name: 'A mould left set', look: 'The casting was never broken out. It is the size of a door.', model: 'plinth', does: 'mats', after: 'The casting splits cleanly into usable stock.' },
  foremans_desk: { place: 'cold_foundry', name: "A foreman's desk", look: 'Drawers locked, one key left in the wrong lock.', model: 'crates', does: 'case', after: 'The bottom drawer holds a sealed case.' },
  pour_book: { place: 'cold_foundry', name: 'A pour book', look: 'Every pour dated and signed. The last entry has no signature.', model: 'survey', does: 'lore', after: 'The last pour was for something called "the first of the large ones".' },
  run_down_tree: { place: 'wound_orchard', name: 'A run-down sapling', look: 'Its key has stopped. It would take both hands to turn.', model: 'heartfruit', does: 'mats', after: 'It sheds a handful of small parts as it winds.' },
  winders_bag: { place: 'wound_orchard', name: "A winder's satchel", look: 'Hung on a branch at head height. Left, not lost.', model: 'cache', does: 'case', after: 'A sealed case and a spare key.' },
  row_marker: { place: 'wound_orchard', name: 'A row marker', look: 'A brass stake with a number and a date. The date is tomorrow.', model: 'plinth', does: 'notes', after: 'The stake lists what the row is meant to become.' },
};

// Chest locks. No lockpicking: each is a small thing to work out from what is in the hall.
// plates: step on the floor marks in the order cut on the lid. light: it opens only where a lamp is lit. breath: it opens once a cap (or vent) in the hall has gone off.
export const GLYPHS = { verdant: ['Leaf', 'Eye', 'Spiral', 'Star'], clockwork: ['Gear', 'Valve', 'Coil', 'Bell'] };
export const LOCKS = {
  plates: { verdant: 'Three marks are cut in the lid, in a row. The same marks are set in the floor of this place.', clockwork: 'Three marks are stamped in the lid, in a row. The same marks are set in the floor of this place.' },
  light: { verdant: 'Cut in the lid: "I open only where it is bright."', clockwork: 'Stamped in the lid: "I open only where it is bright."' },
  breath: { verdant: 'Cut in the lid: "I open when the hall has breathed."', clockwork: 'Stamped in the lid: "I open when the pipes have sung."' },
};

// Item sets. Wearing pieces of the same set at once adds bonuses at 2, 3 and 4 pieces. A set never has two pieces for one slot.
// Bonuses stack with Resonances and are plain numbers the rest of the rules already understand.
export const SETS = {
  thornwarden: { name: "Thornwarden's Kit", lore: 'Issued to the first keepers of the Verdant Galleries. Most of it grew back.', pieces: ['thorncaster', 'barkweave', 'hunter_mask', 'leechroot'],
    bonus: { 2: { regen: 1 }, 3: { bleedHit: 15 }, 4: { vsWounded: 20, thorns: 2 } } },
  surveyor: { name: "Surveyor's Issue", lore: 'Standard issue for a survey nobody finished.', pieces: ['pulse_rifle', 'relay_harness', 'targeting_visor', 'capacitor_band', 'drone_core'],
    bonus: { 2: { study: 1 }, 3: { crit: 6 }, 4: { range: 1, abil: 10 } } },
  folded: { name: 'The Folded Wardrobe', lore: 'Each piece is slightly somewhere else. Worn together they agree.', pieces: ['echo_blade', 'phase_shroud', 'oracle_shard', 'lucky_knot', 'fold_gland', 'blink_anchor'],
    bonus: { 2: { move: 1 }, 3: { critDmg: 25 }, 4: { echo: 15, crit: 5 } } },
  gardener: { name: "Gardener's Rounds", lore: 'What the Galleries were tended with, before they tended themselves.', pieces: ['spore_sling', 'resin_charm', 'symbiote_graft', 'lure_pod'],
    bonus: { 2: { healPow: 15 }, 3: { regen: 1, yield: 20 }, 4: { poisonHit: 1, hp: 10 } } },
  butcher: { name: 'Field Dresser', lore: 'For taking a specimen apart where it fell.', pieces: ['marrow_cleaver', 'chitin_plate', 'compound_lens', 'neural_shunt', 'barrier_seed'],
    bonus: { 2: { armor: 1 }, 3: { killHeal: 4 }, 4: { dmgPct: 10, study: 1 } } },
  stormglass: { name: 'Stormglass', lore: 'Three pieces of one machine that was never assembled.', pieces: ['arc_lance', 'mirror_carapace', 'pulse_emitter'],
    bonus: { 2: { thorns: 2 }, 3: { abil: 15, shieldStart: 6 } } },
};
export const SET_OF = {}; for (const id in SETS) for (const b of SETS[id].pieces) SET_OF[b] = id;
