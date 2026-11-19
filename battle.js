// The expedition screen: board, input, and playback of what the rules engine reports.
import { C, D, G, $, esc, art, face, store, toast, itemCard } from './ui.js';
import { createScene } from './scene3d.js';
import { snd } from './sound.js';
import { grow, sketchTag, drawSketches } from './sketch.js';

const PATHS = { verdant: [['The Overgrowth', 'has been seen in there. Harder. What it leaves behind is worth a better case.'], ['The Still Pond', 'Grazers and flora. What hunts in here hunts them, though it will turn on you if you walk into it. The party rests here and recovers. Nothing to clear, so no case and no boon.']],
  clockwork: [['The Foundry Floor', 'is working the line. Harder. What it leaves behind is worth a better case.'], ['The Winding Garden', 'Tended, quiet, watched. The party rests here and recovers. Nothing to clear, so no case and no boon.']] };
// Things around the hall that are not part of the fight. Tap one to read it.
const DECOR = {
  survey: ['Survey Station 4', 'Left standing', 'A brass theodolite on a tripod, aimed at the door. The sketchbook beside it is open to a drawing of this room. The trees in the drawing are shorter.'],
  crates: ['Supply crates', 'Third Expedition', 'Specimen jars packed in straw, every one labelled and empty. The lantern on top still has oil in it. Nobody came back for these.'],
  case_broken: ['Display Case 112', 'Seal broken', 'The plate says the specimen was collected dead. The glass was broken from the inside.'],
  lamp: ['Gallery lamp', 'Still fed', 'Brass, with a ground-glass lens. It lights when touched. Nobody has found where the supply comes from.'],
  column_fallen: ['Fallen column', 'Marble', 'It came down a long time ago. The moss on the break is older than the moss on the floor.'],
  plinth: ['Empty plinth', 'Label polished', 'Whatever stood here is gone and the dome lies beside it. Somebody has been keeping the label plate clean.'],
  mushrooms: ['Bellcap cluster', 'Uncatalogued', 'Taller than a Seeker. They dim when you stand close and brighten again when you look away.'],
  statue: ['The Cataloguer', 'Toppled', 'A stone naturalist four times life size, down on its side. The jar in its hand is carved empty. Someone has scratched a tally into the plinth and stopped at forty-one.'],
  glasshouse: ['The Glasshouse', 'Frame standing', 'Whatever was grown in here outgrew it. The panes that are left are the ones nothing pushed against.'],
  ribcage: ['The Ribs', 'No entry found', 'Each rib is taller than a tree and none of the Catalogue plates show the animal. The thorn only climbs two of them. The others it will not touch.'],
  crystal: ['Glass growth', 'Still growing', 'It hums a little below hearing. Hold a lamp to it and the light comes out the other side a second late.'],
  bell: ['The hall bell', 'Cracked', 'It rang the closing hour. The crack runs through the word for closed.'],
  nest: ['A great nest', 'Occupied lately', 'Thorn, bone and brass wire. Two eggs are cold. The third is warm and something inside it turns toward your hand.'],
  spires: ['Thorn spires', 'Grown overnight', 'Black thorns taller than a Seeker, all leaning the same way. The Overgrowth put them up to keep something in.'],
  pond: ['The Still Pond', 'No bottom found', 'The water does not move when you throw a stone in. The stone does not come back up either.'],
  reeds: ['Mirror reeds', 'Specimen bed', 'They grow toward their own reflections. Around the pond that means they grow in a ring.'],
  tree_a: ['Gallery oak', 'Rooted through the floor', 'The roots have lifted the tiles in a ring. An expedition left its instruments at the base and the tree has started to grow around them.'],
  tree_b: ['Tagged willow', 'Specimen 9', 'The brass tag on the trunk is stamped with a number and a date. The date has not happened yet.'],
};
// What kind of action each button is. The colour on the button says the same thing.
const KIND = { attack: 'Attack', defend: 'Defend', control: 'Control', support: 'Support', device: 'Device', lore: 'Knowledge', flow: '' };
const ABIL_KIND = { brace: 'defend', riposte: 'defend', shove: 'attack', deadeye: 'attack', spore_dart: 'attack', arc_pulse: 'attack', mark: 'control', snare: 'control', soothe: 'control', mend: 'support', overclock: 'support', drone: 'device', kindle: 'attack', fire_breath: 'attack', red_glare: 'attack' };
// How each kind of creature behaves, and the one thing worth knowing when you meet it.
export const NATURE = {
  pack: ['Pack hunter', 'Weak alone. Kill or scatter them one at a time before they gather round a single Seeker.'],
  predator: ['Predator', 'It picks a Seeker and commits. Brace, or put a snare in its path.'],
  ambush: ['Ambusher', 'It waits for you to come within reach. Fight it from range.'],
  grazer: ['Grazer', 'Harmless unless hurt. A safe subject for study.'],
  skittish: ['Skittish', 'It runs from anything close. Study it from the edge of your range.'],
  scavenger: ['Scavenger', 'It comes for the dead and feeds to heal. Clear the bodies or kill it first.'],
  lighter: ['Keeper', 'It tends the lamps and nothing else. Where it lights one, the hall gathers.'],
  mender: ['Mender', 'It repairs the others. Deal with it before the things it tends.'],
  sentinel: ['Sentinel', 'It guards a place and holds a grudge. Leave its ground and it lets you go.'],
  boss_orchard: ['Great one', 'It cannot be calmed. Watch for what it grows between its turns.'],
  boss_regulator: ['Great one', 'It cannot be calmed. The red line on the floor is where it strikes next.'],
};
const STATUS = u => { const s = []; const add = (on, cls, t, d) => { if (on) s.push(`<span class="st ${cls}" title="${d}">${t}</span>`); };
  add(u.shield > 0, 'buff', 'Shield ' + u.shield, 'Absorbs damage before health'); add(u.taunt > 0, 'buff', 'Braced', 'Drawing attacks'); add(u.rip > 0, 'buff', 'Riposte', 'Strikes back when hit in melee'); add(u.lit > 0, 'buff', 'Blades alight ' + u.lit, 'Every hit sets its target Burning'); add(u.calm > 0, 'buff', 'Calm ' + u.calm, 'Will not hunt unless hurt');
  add(u.bleed > 0, 'bad', 'Bleeding ' + u.bleed, 'Loses health each turn'); add(u.burn > 0, 'bad', 'Burning ' + u.burn, 'Loses health each turn until the fire is out'); add(u.poison > 0, 'bad', 'Poisoned ' + u.poison, 'Loses health each turn, fading by one'); add(u.mark > 0, 'bad', 'Marked', 'Takes 25% more damage'); add(u.root > 0, 'bad', 'Held ' + u.root, 'Cannot move'); add(u.stun > 0, 'bad', 'Stunned', 'Loses its turn');
  return s.length ? `<div class="sts2">${s.join('')}</div>` : '<p class="dim" style="font-size:12.5px">No active effects.</p>'; };
const FIXTURE = {
  bellcap: ['Bellcap', 'Spore cap', 'Strike it and it breathes out. Every living creature within two tiles goes drowsy for two turns. Machines and the great ones ignore it. Once only.'],
  lamp: ['Gallery lamp', 'Still fed', 'Light it and whatever is not hunting you drifts toward it and stays. A creature held by the light only notices you if you stand right beside it.'],
  case: ['Specimen case', 'Seal intact', 'Something was put in here a long time ago. It may still be a specimen. It may still be alive.'],
};
const FIXTURE_CW = { bellcap: ['Steam vent', 'Under pressure', 'Open the valve and it blows. Every creature within two tiles seizes for a turn. The great ones ignore it. Once only.'], case: ['Parts case', 'Seal intact', 'Something was packed in here a long time ago. It may still be a specimen. It may still be wound.'] };
// What a thing in the hall looks like before anyone in this party has tried it. Finding out what it does is the point.
const UNKNOWN = { bellcap: ['Swollen cap', 'Unrecorded', 'Taller than Hobb and warm to stand beside. It hums. Nobody has written down what it does.'], lamp: ['Old lamp', 'Unrecorded', 'There is still something in the reservoir. Nobody has written down what happens when it is lit.'], case: ['Sealed case', 'Unrecorded', 'The seal is whole and the glass is fogged from the inside. Nobody has written down what is in it.'] };
const UNKNOWN_CW = { bellcap: ['Brass valve', 'Unrecorded', 'It ticks under the hand and the pipe below it is hot. Nobody has written down what it does.'], lamp: ['Glass lantern', 'Unrecorded', 'A coil sits ready inside it. Nobody has written down what happens when it is lit.'], case: ['Sealed crate', 'Unrecorded', 'Something inside shifts when it is tilted. Nobody has written down what is in it.'] };
const knownSet = () => { try { return JSON.parse(store.get('unc.known') || '{}'); } catch { return {}; } };
const learn = k => { const o = knownSet(); if (o[k]) return false; o[k] = 1; store.set('unc.known', JSON.stringify(o)); return true; };
const MISSION = { pursue: 'Pursuit', observe: 'Observation', harvest: 'Harvest', cache: 'Recovery' };
const off = why => `aria-disabled="true" data-why="${why}"`;
const KINDWORD = { attack: 'strike', defend: 'guard', support: 'aid', control: 'hold', lore: 'observe' };
const btn = (kind, icon, name, sub, attrs) => { const tt = /title="([^"]*)"/.exec(attrs); attrs = attrs.replace(/title="[^"]*"/, ''); const cd = /^ready in (\d+)/.exec(sub); // the bar shows pictures only: the name, cost and what it does are in the hover card
  return `<button class="act k-${kind}" aria-label="${name}" data-tip="${name} · ${sub}" data-desc="${tt ? tt[1] : ''}" ${attrs}>${cd ? `<em class="cdn">${cd[1]}</em>` : ''}<img src="assets/icons/${icon}.jpg" alt="" onerror="this.style.visibility='hidden'"><span class="tx"><b>${name}</b><small>${sub}</small></span>${KIND[kind] ? `<i class="kd">${KIND[kind]}</i>` : ''}</button>`; };
// The same places in the Clockwork Wilds, where things are built and not grown.
const DECOR_CW = {
  survey: ['Tinker bench', 'Left mid-task', 'Half-built animals in rows, each a little closer to finished than the last. The newest one has no maker\'s mark.'],
  crates: ['Parts crates', 'Third Expedition', 'Springs sorted by size, every drawer labelled. One drawer is labelled with your name.'],
  case_broken: ['Orrery', 'Still turning', 'It models a sky with one more world than the charts allow. That world is the only one that never completes an orbit.'],
  lamp: ['Gas lamp', 'Still fed', 'Teal glass and a copper feed pipe. It lights when touched. The pipe is not connected to anything.'],
  column_fallen: ['Great gear', 'Thrown clear', 'It came off something much larger. The teeth are worn on one side only, as if it turned the same quarter turn for an age.'],
  plinth: ['Boiler', 'At pressure', 'The gauge reads full. The firebox is cold and has been for years.'],
  mushrooms: ['Floor vent', 'Breathing', 'Steam comes up in a slow rhythm. Stand over it long enough and you start breathing in time.'],
  tree_a: ['Brass oak', 'Assembled', 'Every leaf is enamel on a wire stem. Some of the stems have grown.'],
  tree_b: ['Chain willow', 'Specimen 9', 'The tag on the trunk is stamped with a number and a date. The date has not happened yet.'],
  statue: ['The Founder', 'Toppled', 'A cast-iron engineer four times life size, down on its side. The plaque gives a name and a date and both have been filed off.'],
  glasshouse: ['The Glass Orrery', 'Frame standing', 'A dome of iron hoops that once turned. The planets were taken out one at a time and carefully.'],
  ribcage: ['The Hull', 'Unfinished', 'The ribs of a machine big enough to walk inside. The drawings for the rest of it are not in the Cabinet.'],
  nest: ['A scrap nest', 'Occupied lately', 'Wire, springs and watch faces, wound tight. The eggs are riveted. One of them is ticking.'],
  spires: ['Smokestacks', 'Foundry line', 'Still warm. Whatever they vent for is working somewhere underneath you.'],
  pond: ['Coolant pool', 'No bottom found', 'It glows and does not ripple. A dropped spanner goes down slowly and keeps its shine the whole way.'],
  reeds: ['Mirror reeds', 'Specimen bed', 'The only grown things here. They lean toward the pool and away from the machines.'],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function mountBattle(root, onFinish) {
  const run = G.state.run; const spec = run.spec; const reg = D.REGIONS[spec.region];
  const LORE = spec.region === 'clockwork' ? { ...DECOR, ...DECOR_CW } : DECOR; const CWF = spec.region === 'clockwork';
  let log = []; try { const sv = JSON.parse(store.get('unc.run') || 'null'); if (sv && sv.at === run.at) log = sv.log; } catch { /* start over */ }
  let st; try { st = C.replay(spec, log); } catch { log = []; st = C.createRun(spec); }
  const passed = new Set(); let fightFrom = 0; let focusOn = ''; let hov = null; let sel = null, mode = null, info = null, busy = false, armed = null, retreatArmed = false, shownRoom = -1;
  const first = !G.state.stats.runs;

  root.innerHTML = `<div class="game"><div class="board three"></div>
    <div class="hud htop"><div class="tracker"></div><div class="held"></div><span class="grow"></span><span class="label turn"></span><button class="link" data-act="log" aria-expanded="false">Log</button><button class="link" data-act="cine" title="Cut to a close-up when a Seeker strikes"></button><button class="link" data-act="snd"></button><button class="link" data-act="retreat">Retreat</button></div>
    <div class="panel info" hidden></div><div class="clog" hidden><div class="clh"><span class="label">Combat log</span><button class="link" data-act="log">Close</button></div><ol></ol></div>
    <div class="hud hbot"><div class="scards"></div><div class="mid"><div class="hint"></div><div class="actions"></div></div></div></div>`;
  const wake = () => snd.start(spec.region); root.addEventListener('pointerdown', wake, { once: true });
  const leave = () => { snd.stop(); sc.dispose(); };
  const board = $('.board', root);
  const sc = createScene(board, { onTile: (x, y) => tileClick(x, y), onMiss: () => { if (!busy && !st.outcome) say('Nothing to walk to there'); }, onDecor: (k, lit) => { if (!LORE[k]) return; info = { d: k, lit }; armed = null; snd.pick(); panel(); },
    onHover: (t, d) => { tipFor(t); const o = t && C.unitAt(st, t[0], t[1]); const p = t && propAt(t[0], t[1]); const nh = o && live(o) ? { u: o.id } : p ? { p: p.pid } : d && LORE[d] ? { d } : null; if (JSON.stringify(nh) !== JSON.stringify(hov)) { hov = nh; if (!info) panel(); } }, region: (location.hostname === 'localhost' && new URLSearchParams(location.search).get('region')) || spec.region, seed: spec.seed, places: { P0: st.places[0], P1: st.places[1] } });
  // which far place the party is standing in: the start, one of the two doors, or the last room
  const LEN = spec.len || 3; const ROAD = { verdant: ['The Long Gallery', 'Residents going about their day, and some of them hunt. A case for clearing it.'], clockwork: ['The Assembly Row', 'The line still runs and its keepers still walk it. A case for clearing it.'] };
  // each hall stands at one of the far places: the kind of hall picks it, and the party never arrives where it already is
  const SITE_NAME = { verdant: { A: 'The Overgrowth', B: 'The Still Pond', C: 'The Fallen Colonnade', D: 'The Glasshouse', E: 'The Rib Hall' }, clockwork: { A: 'The Foundry Floor', B: 'The Winding Garden', C: 'The Assembly Row', D: 'The Glass Orrery', E: 'The Scrap Vault' } }[spec.region] || {};
  const POOL = { elite: ['A', 'E'], quiet: ['B', 'D'], standard: ['C'] };
  // the places a run of halls stands at: each kind of hall has its own places, and the party does not see the same one twice if there is another left
  const sitesFor = path => { const out = ['S'], seen = new Set(['S']); for (let i = 1; i < path.length; i++) { if (i === LEN - 1) { out.push('F'); break; } const pool = POOL[path[i]] || POOL.standard; const to = pool.find(x => !seen.has(x)) || ['C', 'A', 'B', 'E', 'D'].find(x => !seen.has(x)) || pool.find(x => x !== out[i - 1]) || 'A'; seen.add(to); out.push(to); } return out; };
  const siteNow = () => st.side ? 'P' + st.roomIdx : sitesFor(st.path)[st.roomIdx] || 'S';
  if (location.hostname === 'localhost') { window.__sc = sc; window.__b = { get st() { return st; }, get busy() { return busy; }, send: a => send(a), C, siteNow: () => siteNow(), tile: (x, y) => tileClick(x, y) }; } // local testing hooks
  const cap = t => t ? t[0].toUpperCase() + t.slice(1) : ''; const placeTag = i => { const id = st.places[i]; if (!id) return ''; const W0 = D.WONDERS[id]; return Object.values(st.wandered).includes(id) ? W0.name : cap(W0.seen); }; // a far place is only named once the party has been
  const nameSites = () => sc.names({ ...SITE_NAME, F: D.SPECIES[reg.boss].name, P0: placeTag(0), P1: placeTag(1) });
  nameSites(); sc.place(siteNow());
  setTimeout(async () => { if (busy || st.outcome || log.length) return; busy = true; try { await entrance(); } finally { busy = false; sync(); } }, 1800);
  const unit = id => st.units.find(u => u.id === id);
  // what each Seeker is wearing, by item type, so the scene can show it
  const fixInfo = p => p.kind !== 'fixture' ? [] : knownSet()[spec.region + ':' + p.id] ? ((CWF && FIXTURE_CW[p.id]) || FIXTURE[p.id]) : ((CWF && UNKNOWN_CW[p.id]) || UNKNOWN[p.id]);
  const GL = D.GLYPHS[spec.region] || D.GLYPHS.verdant; const lockedChest = () => st.room.props.find(p => p.kind === 'chest' && !p.done && p.lock === 'plates'); const plateOn = p => { const c = lockedChest(); return !!c && (c.open || c.seq.slice(0, c.prog).includes(p.glyph)); };
  const glyphPic = i => `<i class="glyph" style="background-image:url(assets/tex/${spec.region === 'clockwork' ? 'c' : 'v'}_plates.jpg);background-position:${i % 2 ? 100 : 0}% ${i > 1 ? 100 : 0}%" title="${GL[i]}"></i>`;
  const gearOf = u => { const sk = Object.values(G.state.seekers).find(s => s.arch === u.kind); const g = {}; if (sk) for (const it of C.seekerItems(G.state, sk)) { const sl = C.itemDef(it).slot; g[sl] = it.sing || it.base; } return g; };
  const live = u => u && !u.dead && !u.fled;
  const mine = () => st.units.filter(u => u.side === 's');
  const foes = () => st.units.filter(u => u.side === 'c' && live(u));
  const propAt = (x, y) => st.room.props.find(p => !p.done && p.x === x && p.y === y);
  const stage = k => spec.stages[k] ?? -1;
  function label(u) {
    const s = []; if (u.bleed > 0) s.push(`<span class="bleed">BLEED ${u.bleed}</span>`); if (u.poison > 0) s.push(`<span class="poison">POISON ${u.poison}</span>`); if (u.mark > 0) s.push('<span class="mark">MARKED</span>'); if (u.root > 0) s.push('<span>HELD</span>'); if (u.stun > 0) s.push('<span>STUNNED</span>'); if (u.rip > 0) s.push('<span>RIPOSTE</span>'); if (u.taunt > 0) s.push('<span>BRACED</span>'); if (u.calm > 0) s.push('<span class="calm">CALM</span>');
    const h = u.side === 'c' && C.isHostile(st, u); if (u.side === 'c' && spec.type === 'observe' && u.kind === reg.observe) s.unshift('<span class="want">YOUR SUBJECT</span>');
    return `${s.length ? `<div class="sts">${s.join('')}</div>` : ''}${u.side === 's' ? `<div class="ap">${'<i></i>'.repeat(Math.max(0, u.ap))}</div>` : ''}<div class="hp ${h ? 'hostile' : ''}"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i><b style="width:${Math.min(100, (u.shield || 0) / u.max * 100)}%"></b></div>`;
  }
  function sync() {
    const rk = st.roomIdx + (st.side ? 's' : ''); if (shownRoom !== rk) { shownRoom = rk; sel = null; mode = null; info = null; sc.setRoom(st); }
    if (!sel || !live(unit(sel)) || unit(sel).ap <= 0) { const n = mine().find(u => live(u) && u.ap > 0 && !passed.has(u.id)); if (n && (!sel || !live(unit(sel)) || !mode)) sel = n.id; }
    const m = targets();
    sc.sync(st.units.map(u => { const a = live(u) && m.get(u.x + ',' + u.y); return { id: u.id, x: u.x, y: u.y, kind: u.kind, side: u.side, variant: u.variant, gear: u.side === 's' ? gearOf(u) : null, lit: u.lit > 0 || (u.side === 's' && !!st.bf.emberOil), gone: !live(u), label: live(u) ? label(u) : '',
      ring: u.side === 's' ? (u.id === sel ? 'sel' : u.ap <= 0 ? 'spent' : null) : u.side === 'a' ? null : a && a.id === u.id ? 'tg' : C.isHostile(st, u) ? 'hostile' : 'calm' }; }),
      st.room.props.filter(p => !p.done).map(p => ({ key: 'p' + p.pid, x: p.x, y: p.y, model: p.kind === 'fixture' ? 'fx_' + p.id : p.kind === 'flora' ? p.id : p.kind === 'find' ? D.FINDS[p.id].model : p.kind, glyph: p.glyph, on: p.kind === 'plate' && plateOn(p), lit: p.kind === 'plate' ? undefined : !!p.lit, spent: !!p.spent, use: !!m.get(p.x + ',' + p.y) && !mode }))
        .concat(st.room.traps.map(t => ({ key: 't' + t.x + '_' + t.y, x: t.x, y: t.y, model: 'trap' })), st.room.corpses.map(c => ({ key: 'c' + c.x + '_' + c.y, x: c.x, y: c.y, model: 'corpse' }))));
    marks(m); drawLines(); head(); actions(); cards(); panel(); hint();
    const fu = unit(sel); if (live(fu) && focusOn !== sel + ':' + fu.x + ',' + fu.y + ':' + st.roomIdx) { const first = !focusOn; focusOn = sel + ':' + fu.x + ',' + fu.y + ':' + st.roomIdx; sc.focus(fu.x, fu.y, first); }
    sc.beacons(st.room.props.filter(p => !p.done && p.kind !== 'plate' && !(p.kind === 'chest' && !C.chestOpen(st, p))).map(p => [p.x, p.y, p.kind === 'wonder' ? 2 : 1.35, p.kind === 'fixture' ? (p.spent ? 0x6a6a72 : 0xffa53b) : p.kind === 'wonder' ? 0x9fe8ff : p.kind === 'cache' ? 0xffd05a : 0x8ff0a8]));
  }
  function targets() { // what a click can do right now: Map "x,y" -> action
    const m = new Map(); const u = unit(sel); if (!live(u) || busy || st.outcome) return m;
    const each = f => { for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) f(x, y, C.unitAt(st, x, y)); };
    if (mode && mode.k === 'atk') { each((x, y, o) => { if (o && o.side === 'c' && live(o) && u.ap > 0 && md(u, o) <= C.weaponRange(st, u)) m.set(x + ',' + y, { t: 'atk', u: u.id, id: o.id }); }); return m; }
    if (mode && mode.k === 'abil') {
      const A = D.ABILITIES[mode.id]; const rg = C.abilRange(st, u, mode.id);
      each((x, y, o) => { const d = md(u, { x, y }); if (d > rg) return;
        if (A.target === 'enemy' && o && o.side === 'c' && !(mode.id === 'soothe' && D.SPECIES[o.kind].boss)) m.set(x + ',' + y, { t: 'abil', u: u.id, a: mode.id, id: o.id });
        if (A.target === 'ally' && o && o.side === 's' && !(mode.id === 'overclock' && o === u)) m.set(x + ',' + y, { t: 'abil', u: u.id, a: mode.id, id: o.id });
        if (A.target === 'tile' && !o && !st.room.rock[y * C.W + x] && !propAt(x, y)) m.set(x + ',' + y, { t: 'abil', u: u.id, a: mode.id, x, y }); });
    } else if (mode && mode.k === 'dev') {
      const I = C.DEV_INFO[C.devKind(u)];
      each((x, y, o) => { if (md(u, { x, y }) > I.range) return; const open = !o && !st.room.rock[y * C.W + x] && !(propAt(x, y) && !propAt(x, y).walk);
        if ((I.target === 'tile' && open) || (I.target === 'ally' && o && o.side === 's') || I.target === 'any') m.set(x + ',' + y, { t: 'dev', u: u.id, x, y }); });
    } else if (mode && mode.k === 'study') {
      for (const c of foes()) if (md(u, c) <= 3 && C.studyValue(st, u, c) > 0 && (u.ap >= 1 || (!u.freeStudy && !C.isHostile(st, c)))) m.set(c.x + ',' + c.y, { t: 'study', u: u.id, id: c.id });
    } else {
      if (u.ap >= 1 || (u.fx.freemove && !u.freeUsed)) for (const [k, d] of C.moveTiles(st, u)) if (d) m.set((k % C.W) + ',' + Math.floor(k / C.W), { t: 'move', u: u.id, x: k % C.W, y: Math.floor(k / C.W) });
      if (u.ap >= 1) { for (const c of foes()) if (md(u, c) <= C.weaponRange(st, u)) m.set(c.x + ',' + c.y, { t: 'atk', u: u.id, id: c.id });
        for (const p of st.room.props) if (!p.done && md(u, p) <= 1 && p.kind !== 'plate' && !(p.kind === 'chest' && !C.chestOpen(st, p))) m.set(p.x + ',' + p.y, { t: 'use', u: u.id, p: p.pid }); }
    }
    return m;
  }
  function marks(m = targets()) {
    const out = new Map(); const reg = st.units.find(u => u.tele && live(u));
    if (reg) for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) if (reg.tele.axis === 'row' ? y === reg.tele.i : x === reg.tele.i) out.set(x + ',' + y, 'danger');
    for (const [k, a] of m) { if (a.t === 'move') out.set(k, 'mv'); else if (mode) out.set(k, 'ab'); }
    sc.marks(out);
  }
  function drawLines() {
    const L = []; for (const c of foes()) { if (!C.isHostile(st, c)) continue; const p = C.plan(st, c); const t = p.tgt && unit(p.tgt); if (t && live(t)) L.push([c, t]); }
    sc.lines(L);
  }
  function objective() {
    const rs = st.res; const obs = D.SPECIES[reg.observe].name;
    if (spec.type === 'pursue') return [`Bring down <b>${esc(D.SPECIES[reg.boss].name)}</b>${st.roomIdx < LEN - 1 ? '. It waits in the last hall.' : ''}`, rs.bossDown];
    if (spec.type === 'observe') return [`Study <b>${esc(obs)}</b>: <span class="num">${Math.min(6, rs.study[reg.observe] || 0)}/6</span>. Kill none of them.${rs.obsKilled ? ' One has died. The contract is void.' : ''}`, (rs.study[reg.observe] || 0) >= 6 && !rs.obsKilled];
    if (spec.type === 'harvest') return [`Gather flora: <span class="num">${Math.min(4, rs.floraN)}/4</span>`, rs.floraN >= 4];
    return [`Open the <b>sealed case</b>${st.roomIdx < LEN - 1 ? ' in the last hall' : ' at the far wall'}.`, rs.objCache];
  }
  let trkMin = store.get('unc.trk') === '1';
  function head() {
    const [t, ok] = objective(); const w = st.room.wonder && D.WONDERS[st.room.wonder]; const wKnown = w && (G.state.cat['w:' + st.room.wonder] || st.room.props.some(p => p.kind === 'wonder' && p.id === st.room.wonder && p.done)); const hunting = foes().filter(c => C.isHostile(st, c)).length; const adv = C.canAdvance(st);
    const next = st.outcome ? '' : st.side && !hunting ? 'You are off the path. Look around and try things. Head back when you are done.' : hunting && st.roomIdx >= LEN - 1 && foes().some(c => D.SPECIES[c.kind].boss) ? `${esc(D.SPECIES[foes().find(c => D.SPECIES[c.kind].boss).kind].name)} stands between you and the way out.` : ok && st.roomIdx >= LEN - 1 ? 'Objective met. Extract when you are ready.' : hunting ? `${hunting} creature${hunting === 1 ? ' is' : 's are'} hunting you. Fight, hold them off, or calm them.` : adv ? `The room is quiet. Study or gather what you want, then ${st.roomIdx >= LEN - 1 ? 'extract' : 'move on through the gate'}.` : 'End the turn to let the room move.';
    const pips = Array.from({ length: LEN }, (_, i) => i).map(i => `<i class="${i < st.roomIdx ? 'done' : i === st.roomIdx ? 'on' : ''}"></i>`).join('');
    $('.tracker', root).innerHTML = trkMin ? `<button class="trk min" data-act="trk" aria-expanded="false"><span class="rooms">${pips}</span><b>${MISSION[spec.type] || 'Mission'}</b><span class="${ok ? 'ok' : ''}">${ok ? 'Objective met' : 'Show mission'}</span></button>`
      : `<div class="trk"><div class="trh"><span class="label">${MISSION[spec.type] || 'Mission'} · ${esc(reg.short)}</span><button class="link" data-act="trk" aria-expanded="true">Hide</button></div>
        <p class="goal ${ok ? 'ok' : ''}"><span class="chk">${ok ? '&#10003;' : ''}</span><span>${t}</span></p>
        <div class="step"><span class="rooms">${pips}</span><span>Hall ${st.roomIdx + 1} of ${LEN}${st.roomIdx === LEN - 2 ? ' · the great one is next' : ''}</span></div>
        ${next ? `<p class="next"><b>Next</b> ${next}</p>` : ''}${w ? (wKnown ? `<p class="won"><b>${esc(w.name)}.</b> ${esc(w.effect)}</p>` : `<p class="won"><b>Something about this hall is not right.</b> Find it and record it to learn what it does.</p>`) : ''}</div>`;
    $('.turn', root).textContent = `Tier ${['', 'I', 'II', 'III', 'IV', 'V'][st.tier]} · ${C.exploring(st) ? 'Exploring' : 'Round ' + (st.turn - fightFrom + 1)}`; $('[data-act="snd"]', root).textContent = snd.on ? 'Sound on' : 'Sound off'; $('.held', root).innerHTML = st.boons.map(id => `<span class="hb" data-tip="${esc(D.BOONS[id].name)}" data-desc="${esc(D.BOONS[id].desc)}"><img src="assets/icons/boon_${id}.jpg" alt="${esc(D.BOONS[id].name)}" onerror="this.style.visibility='hidden'"></span>`).join('') + (st.res.insight > 0 ? `<span class="hb ins" data-tip="Insight ${st.res.insight}" data-desc="Earned by a full record of a species. Spend one on the great one: it loses its next trick and takes 25% more for two rounds."><img src="assets/icons/watch.jpg" alt="Insight"><b>${st.res.insight}</b></span>` : ''); $('[data-act="cine"]', root).textContent = store.get('unc.cine') === '0' ? 'Close-ups off' : 'Close-ups on';
    $('[data-act="retreat"]', root).textContent = retreatArmed ? 'Really retreat? You lose most cases.' : 'Retreat';
  }
  function actions() {
    const u = unit(sel); const el = $('.actions', root); if (st.outcome) { el.innerHTML = ''; return; }
    const b = [], own = []; const dis = busy || !live(u); const calm = C.exploring(st);
    if (live(u)) {
      b.push(btn('lore', 'study', 'Study', u.freeStudy ? 'closer is more · 1 action' : 'closer is more · free on a calm creature', `data-mode="study" aria-pressed="${mode?.k === 'study'}" title="From three tiles a sketch, from two a proper look, beside it the full record. One full record of a kind: 15% more on every hit against it, a critical on your first blow, and an insight to spend on the great one." ${dis ? 'disabled' : u.ap < 1 && u.freeStudy ? off('No actions left this turn') : ''}`));
      own.push(btn('attack', 'attack', 'Attack', calm ? 'weapon' : 'weapon · 1 action', `data-mode="atk" aria-pressed="${mode?.k === 'atk'}" title="Strike with ${esc(u.name)}'s weapon. Something calm is only struck when you choose this first." ${dis ? 'disabled' : u.ap < 1 && !calm ? off('No actions left this turn') : ''}`));
      for (const id of u.sh.abilities) { const A = D.ABILITIES[id]; const cd = u.cds[id] || 0; const free = u.fx.borrowed_moment && (u.abilN + 1) % 4 === 0;
        own.push(btn(ABIL_KIND[id] || 'attack', id, esc(A.name), cd > 0 ? `ready in ${cd}` : free || C.exploring(st) ? KINDWORD[ABIL_KIND[id]] || 'ability' : A.ap ? A.ap + (A.ap > 1 ? ' actions' : ' action') : 'free', `data-abil="${id}" aria-pressed="${mode?.id === id}" title="${esc(A.desc + '\n' + C.abilInfo(st, u, id).join('\n'))}" ${dis ? 'disabled' : cd > 0 ? off(`${A.name} is ready in ${cd} turn${cd === 1 ? '' : 's'}`) : !free && u.ap < A.ap ? off(`Not enough actions: ${A.name} needs ${A.ap}, ${u.name} has ${u.ap}`) : ''}`)); }
      if (u.sh.dev) { const k = C.devKind(u); const I = C.DEV_INFO[k]; const nm = { lure: 'Lure Pod', barrier: 'Barrier Seed', pulse: 'Pulse Emitter', drone: 'Drone Core', blink: 'Blink Anchor', gravity: 'Gravity Knot' }[k];
        own.push(btn('device', 'device', nm, `${u.charges} left`, `data-mode="dev" aria-pressed="${mode?.k === 'dev'}" ${dis ? 'disabled' : u.charges <= 0 ? off('No charges left on this device') : u.ap < I.ap ? off('Not enough actions for the device') : ''}`)); }
    }
    const adv = C.canAdvance(st); const anyAp = mine().some(x => live(x) && x.ap > 0 && !passed.has(x.id));
    if (live(u) && !calm) { const others = mine().some(x => x !== u && live(x) && x.ap > 0 && !passed.has(x.id)); own.push(btn('flow', 'end', 'End turn', others ? `${esc(u.name)} is done` : 'last Seeker: creatures act', `data-act="pass" title="Finish ${esc(u.name)}'s turn and hand over to the next Seeker" ${busy ? 'disabled' : ''}`).replace('class="act ', `class="act end ${u.ap <= 0 ? 'ready' : ''} `)); }
    const great = st.units.find(c => c.side === 'c' && live(c) && D.SPECIES[c.kind].boss); if (great && st.res.insight > 0 && live(u)) b.push(btn('lore', 'watch', 'Use insight', great.falter ? 'already off balance' : great.steady > 0 ? 'it has its footing · wait' : st.res.insight + ' left · free', `data-act="insight" title="What you learned on the way in. The ${esc(D.SPECIES[great.kind].name)} loses its next trick and takes 25% more from every hit for two rounds." ${busy || great.falter || great.steady > 0 ? 'disabled' : ''}`));
    const far = C.exploring(st) ? C.placeFor(st) : null; if (far) b.push(btn('lore', 'study', 'Wander off', 'to ' + D.WONDERS[far].seen, `data-act="wander" title="Leave the hall for a while and go and look. You can come back." ${busy ? 'disabled' : ''}`));
    if (adv) b.push(btn('flow', 'move_on', st.side ? 'Head back' : st.roomIdx >= LEN - 1 ? 'Extract' : st.roomIdx === LEN - 2 ? 'Face the great one' : 'Move on', st.side ? 'to the hall you left' : st.roomIdx >= LEN - 1 ? 'end the expedition' : (st.offer && !C.boonEarned(st) ? (st.room.type === 'quiet' ? 'a quiet hall gives rest, not a boon · ' : 'leave now and this hall gives no boon · ') : st.offer ? 'take a boon · ' : '') + (st.roomIdx === LEN - 2 ? D.SPECIES[reg.boss].name + ' is next' : 'choose the next hall'), `data-act="next" ${busy ? 'disabled' : ''}`).replace('class="act ', 'class="act adv '));
    b.push(btn('flow', 'end', calm ? 'Wait' : 'End round', calm ? 'watch the hall move' : 'all Seekers done', `data-act="end" title="${calm ? 'Stay put for a moment and watch' : 'End the turn for the whole party now'}" ${busy ? 'disabled' : ''}`).replace('class="act ', `class="act end ${!anyAp && !adv ? 'ready' : ''} `));
    // two framed groups: what only this Seeker can do, and what anyone can do
    const pips = live(u) && !calm ? `<span class="pips" title="Actions left this turn">${'<i class="on"></i>'.repeat(Math.max(0, u.ap))}${'<i></i>'.repeat(Math.max(0, (u.apMax || 2) - u.ap))}</span>` : '';
    el.innerHTML = (own.length ? `<div class="agrp own"><div class="agh"><span class="label">${esc(u.name)}</span><span class="agk">${esc(D.ARCHETYPES[u.kind]?.name || '')}</span>${pips}</div><div class="agb">${own.join('')}</div></div>` : '')
      + `<div class="agrp all"><div class="agh"><span class="label">Party</span><span class="agk">any Seeker</span></div><div class="agb">${b.join('')}</div></div>`;
  }
  function cards() {
    $('.scards', root).innerHTML = mine().map(u => `<button class="scard ${live(u) ? '' : 'down'}" data-sel="${u.id}" aria-pressed="${u.id === sel}" data-tip="${esc(u.name)} · ${Math.max(0, u.hp)}/${u.max}${u.shield ? ' +' + u.shield : ''}" data-desc="${live(u) ? D.ARCHETYPES[u.kind].name + ' · ' + u.sh.w.min + '-' + u.sh.w.max + ' damage · armor ' + u.armor + '. Click again for the full sheet.' : 'Down until the next hall.'}">${face(u.kind)}<span class="nm">${esc(u.name)}<span class="num">${Math.max(0, u.hp)}/${u.max}${u.shield ? ' +' + u.shield : ''}</span></span><span class="bar"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i></span><span class="sub label" style="grid-column:2">${live(u) ? D.ARCHETYPES[u.kind].name + ' · ' + u.sh.w.min + '-' + u.sh.w.max + (C.weaponRange(st, u) > 1 ? ' at ' + C.weaponRange(st, u) : '') + ' · armor ' + u.armor : 'Down until the next room'}</span><span class="aps" style="grid-column:2">${'<i></i>'.repeat(Math.max(0, live(u) ? u.ap : 0))}</span></button><button class="sheetbtn" data-sheet="${u.id}" title="Open ${esc(u.name)}'s sheet" aria-label="Open ${esc(u.name)}'s sheet">Sheet</button>`).join('');
  }
  function panel() {
    const el = $('.info', root); let h = '';
    if (mode) { el.hidden = true; el.innerHTML = ''; return; } // while aiming an ability, a study or a device, nothing covers the hall: the one-line tip by the pointer says what a click will do
    const pinned = info; const info2 = info || hov; const u = info2?.u != null ? unit(info2.u) : null; const p = info2?.p != null ? st.room.props.find(q => q.pid === info2.p && !q.done) : null;
    if (u && live(u) && u.side === 'c') {
      const S = D.SPECIES[u.kind]; const sg = stage(u.kind); const tot = (G.state.cat['f:' + u.kind]?.study || 0) + (st.res.study[u.kind] || 0); const cap = u.variant ? 5 : 3; const pl = C.plan(st, u); const t = pl.tgt && unit(pl.tgt); const [nat, tip] = NATURE[S.ai] || ['Creature', '']; const host = C.isHostile(st, u);
      h = `<div class="hc-art">${art(u.kind, { variant: u.variant })}<span class="hc-tier">Tier ${['', 'I', 'II', 'III', 'IV', 'V'][st.tier]}</span></div>
        <p class="label">${esc(nat)} · ${esc(reg.short)}${sg < 0 ? ' · new to you' : ' · ' + C.STAGE_NAME[sg]}</p><h4>${u.variant ? esc(D.VARIANTS[u.variant].name) + ' ' : ''}${esc(S.name)}</h4><p class="lat">${esc(S.latin)}</p>
        <div class="hc-hp"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i><span class="num">${u.hp} / ${u.max}</span></div>
        <div class="hc-stats"><span><b class="num">${u.dmg[1] ? u.dmg[0] + '-' + u.dmg[1] : '0'}</b>bite</span><span><b class="num">${u.armor || 0}</b>armor</span><span><b class="num">${S.move}</b>move</span><span><b class="num">${S.range > 1 ? S.range : 1}</b>reach</span></div>
        <p class="hc-now" style="color:${host ? 'var(--hostile)' : 'var(--calm)'}">${esc(pl.label)}${t && pl.k !== 'heal' ? ': ' + esc(t.name) : ''}</p>
        ${STATUS(u)}
        <p style="margin-top:8px;font-size:13.5px">${esc(S.blurb)} ${sg >= 1 ? esc(S.behavior) : ''}</p>
        ${sg >= 1 ? `<p class="hc-tip"><b>Tip</b> ${esc(tip)}</p>` : `<p class="hc-tip"><b>Unrecorded</b> Its habits are not in your Catalogue. ${Math.max(1, 4 - tot)} more stud${4 - tot === 1 ? 'y' : 'ies'} and this card will say how it behaves and how to handle it.</p>`}
        <div class="hc-wr">${sg >= 2 || u.studied >= 2 || st.res.read?.[u.kind] ? `<span class="wk"><b>Weak to</b> ${D.FAMILY_NAME[S.weak]} weapons</span><span class="rs"><b>Resists</b> ${D.FAMILY_NAME[S.resist]} weapons</span>` : sg >= 1 || u.studied >= 1 ? `<span class="wk"><b>Weak to</b> ${D.FAMILY_NAME[S.weak]} weapons</span><span class="un"><b>Resists</b> not yet known</span>` : '<span class="un"><b>Weak to</b> not yet known</span><span class="un"><b>Resists</b> not yet known</span>'}</div>
        ${u.armor ? `<p class="dim" style="font-size:12.5px;margin-top:6px">Armor ${u.armor} is taken off every hit, so many small hits do little. Poison and Bleed ignore it.</p>` : ''}
        ${u.variant ? `<p style="margin-top:6px;font-size:13px"><span class="stamp">Variant</span> ${esc(D.VARIANTS[u.variant].note)}</p>` : ''}
        <p class="hc-first">${wallLabel(u.kind)}</p><div class="hc-foot"><span>${st.res.read?.[u.kind] ? 'Full record · +15% damage to its kind' : u.studied ? `Field notes ${u.studied} of ${u.variant ? 5 : 3} · get closer for the full record` : 'No field notes yet'}</span><span class="pips">${Array.from({ length: cap }, (_, i) => `<i class="${i < u.studied ? 'on' : ''}"></i>`).join('')}</span></div>`;
    } else if (u && live(u) && u.side === 's') {
      h = `<div class="hc-art">${art(u.kind)}</div><p class="label">${esc(D.ARCHETYPES[u.kind].name)} · level ${u.sh.lvl}</p><h4>${esc(u.name)}</h4>
        <div class="hc-hp ally"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i><span class="num">${Math.max(0, u.hp)} / ${u.max}</span></div>
        <div class="hc-stats"><span><b class="num">${u.sh.w.min}-${u.sh.w.max}</b>damage</span><span><b class="num">${u.armor}</b>armor</span><span><b class="num">${u.move}</b>move</span><span><b class="num">${u.ap}</b>actions</span></div>${STATUS(u)}`;
    } else if (info2?.d) {
      const info = info2; const [nm, tag, txt] = LORE[info.d]; h = `<p class="label">In the hall · ${esc(tag)}</p><h4>${esc(nm)}</h4><p style="margin-top:8px;font-size:13.5px">${esc(txt)}</p>${info.d === 'lamp' ? `<p class="dim" style="font-size:13px;margin-top:6px">${info.lit ? 'Lit.' : 'Out.'} Tap it again to change it.</p>` : ''}`;
    } else if (p) {
      const FX = fixInfo(p); const F = p.kind === 'fixture' ? { name: FX[0], blurb: FX[2] + (p.id === 'lamp' ? (p.lit ? ' It is lit.' : ' It is dark.') : p.spent ? ' It is spent.' : '') } : p.kind === 'flora' ? D.FLORA[p.id] : p.kind === 'wonder' ? D.WONDERS[p.id] : p.kind === 'find' ? { name: D.FINDS[p.id].name, blurb: D.FINDS[p.id].look + ' Nobody has written down what it does.' } : p.kind === 'chest' ? { name: C.chestOpen(st, p) ? 'A chest, unlocked' : 'A locked chest', blurb: D.LOCKS[p.lock][spec.region] + (C.chestOpen(st, p) ? ' The lock has given. It will open now.' : p.lock === 'plates' && p.prog ? ` ${p.prog} of ${p.seq.length} found.` : '') } : p.kind === 'plate' ? { name: 'A mark in the floor: ' + GL[p.glyph], blurb: 'A round plate set flush in the ground. It gives a little underfoot.' } : { name: p.obj ? 'The sealed case' : 'A sealed case', blurb: 'Specimen case, lead seal intact. Opened at extraction.' };
      h = `<div class="plate">${p.kind === 'plate' ? glyphPic(p.glyph).replace('class="glyph"', 'class="glyph big"') : p.kind === 'chest' ? '<img class="chestpic" src="assets/cat/chest.jpg" alt="">' : art(p.id)}</div><p class="label">${p.kind === 'fixture' ? 'In the hall · ' + FX[1] : p.kind === 'wonder' ? 'Wonder' : p.kind === 'flora' ? 'Flora' : p.kind === 'find' ? 'Unrecorded' : p.kind === 'chest' ? 'Hidden' : p.kind === 'plate' ? 'Underfoot' : 'Cache'}</p><h4>${esc(F.name)}</h4>${F.latin ? `<p class="lat">${esc(F.latin)}</p>` : ''}<p style="margin-top:8px;font-size:13.5px">${esc(F.blurb)}</p>${F.effect ? `<p style="margin-top:6px;font-size:13.5px;color:var(--gilt)">${esc(F.effect)}</p>` : ''}${p.kind === 'chest' && p.lock === 'plates' ? `<p class="glyphs">${p.seq.map((g, i) => `<span class="${i < p.prog || p.open ? 'got' : ''}">${glyphPic(g)}</span>`).join('<b>then</b>')}</p>` : ''}<p class="dim" style="font-size:13px;margin-top:6px">${p.kind === 'plate' ? 'Walk a Seeker onto it.' : p.kind === 'chest' ? (C.chestOpen(st, p) ? 'Stand a Seeker beside it and tap it.' : 'It will not open until its lock is answered.') : p.walk ? 'Step on it, or stand beside it and tap it to cut it free.' : 'Stand a Seeker beside it and tap it.'}</p>`;
    }
    if (h && pinned) h = '<button class="link x" data-act="closeinfo" aria-label="Close">Close</button>' + h; el.classList.toggle('hovering', !pinned);
    el.innerHTML = h; el.hidden = !h;
  }
  function hint() {
    const el = $('.hint', root); const u = unit(sel); let t = '';
    if (st.outcome) t = '';
    else if (busy) t = 'The room moves.';
    else if (mode?.k === 'abil') t = `<b>${esc(D.ABILITIES[mode.id].name)}.</b> ${esc(D.ABILITIES[mode.id].desc)} Tap a lit tile, or the button again to cancel.`;
    else if (mode?.k === 'study') t = '<b>Study</b> a creature. Three tiles away is a sketch (1 note), two tiles a proper look (2), beside it the full record (3). One full record is all you need of each kind: every hit on that kind is 15% stronger, your first blow on each is a critical, and you earn an insight for the great one.';
    else if (mode?.k === 'dev') t = '<b>Device.</b> Tap a lit tile to use it.';
    else if (armed) t = '<b>It is calm.</b> Tap it again to attack anyway. It will fight back.';
    else if (C.canAdvance(st) && first && st.roomIdx === 0) t = '<b>The room is quiet.</b> Before you move on: the Mossback is harmless. Study it, pick the moss, then leave when you are ready.';
    else if (C.canAdvance(st)) t = `<b>Exploring.</b> Click to walk; click a creature to creep up and look. Stand still and you are scenery: only moving close gets you noticed.`;
    else if (live(u) && u.ap > 0) t = first && st.turn <= 2 && st.roomIdx === 0 ? `<b>${esc(u.name)}</b> has ${u.ap} action${u.ap === 1 ? '' : 's'}. Tap a dotted tile to move. Tap a glowing creature to attack. Red lines show who each creature is coming for.` : `<b>${esc(u.name)}</b>: ${u.ap} action${u.ap === 1 ? '' : 's'} left.`;
    else t = 'No actions left. <b>End turn.</b>';
    el.innerHTML = t;
  }
  function float(x, y, txt, cls = '') { const f = document.createElement('div'); f.className = 'float ' + cls; f.textContent = txt; const p = sc.screen(x, y, 1.5); f.style.left = p.left + '%'; f.style.top = p.top + '%'; board.append(f); setTimeout(() => f.remove(), cls.includes('why') ? 1900 : 900); }
  // What the tile under the pointer means right now, in a line. Answers "can I go there, and if not, why".
  const tip = document.createElement('div'); tip.className = 'tiletip'; tip.hidden = true; board.append(tip);
  function tipFor(t) {
    sc.threat([]); if (!t || busy || st.outcome) { tip.hidden = true; return; }
    const [x, y] = t; const me = unit(sel); const o = C.unitAt(st, x, y); const p = propAt(x, y); const a = targets().get(x + ',' + y); let txt = '', cls = '';
    if (o && o.side === 'c' && live(o)) {
      if (C.isHostile(st, o)) { const S = D.SPECIES[o.kind]; const seen = new Set(); for (const [k] of C.moveTiles(st, o)) { const tx = k % C.W, ty = Math.floor(k / C.W); for (let dy = -S.range; dy <= S.range; dy++) for (let dx = -S.range; dx <= S.range; dx++) { const nx = tx + dx, ny = ty + dy; if (Math.abs(dx) + Math.abs(dy) <= S.range && nx >= 0 && ny >= 0 && nx < C.W && ny < C.H && !st.room.rock[ny * C.W + nx]) seen.add(nx + ',' + ny); } }
        sc.threat([...seen].map(k => k.split(',').map(Number))); }
      if (!live(me)) txt = o.name || D.SPECIES[o.kind].name;
      else if (mode) { txt = a ? `${mode.k === 'abil' ? D.ABILITIES[mode.id].name : mode.k === 'study' ? 'Study' : 'Use device on'} ${D.SPECIES[o.kind].name}` : 'Out of range or not a valid target'; cls = a ? 'go' : 'no'; }
      else if (a && a.t === 'atk') { const S = D.SPECIES[o.kind], sg = stage(o.kind), f = me.sh.w.fam; txt = `Attack · ${me.sh.w.min}-${me.sh.w.max} damage · 1 action` + (sg >= 1 && S.weak === f ? ' · strong against it' : sg >= 2 && S.resist === f ? ' · it resists this weapon' : ''); cls = 'atk'; }
      else if (me.ap < 1) { txt = 'No actions left this turn'; cls = 'no'; }
      else { txt = `Out of reach (${md(me, o)} tiles, weapon reaches ${C.weaponRange(st, me)}). Click to move closer`; cls = 'far'; }
      if (C.isHostile(st, o)) txt += ' · red tiles: where it can strike next turn';
    } else if (o && o.side === 's') { txt = o.id === sel ? `${o.name} · selected` : `Select ${o.name}`; }
    else if (st.room.rock[y * C.W + x]) { txt = CWF ? 'Blocked: machinery' : 'Blocked: boulders'; cls = 'no'; }
    else if (p && p.kind === 'plate') { txt = 'A mark in the floor: ' + GL[p.glyph] + '. Click to step onto it'; cls = 'go'; }
    else if (p && p.kind === 'chest' && !C.chestOpen(st, p)) { txt = 'A locked chest. Click to read the lid'; cls = 'far'; }
    else if (p) { const near = live(me) && md(me, p) <= 1; txt = a && a.t === 'use' ? `${p.kind === 'find' || (p.kind === 'fixture' && !knownSet()[spec.region + ':' + p.id]) ? 'See what it does' : p.kind === 'fixture' ? (p.id === 'lamp' ? (p.lit ? 'Put out the lamp' : 'Light the lamp') : p.id === 'bellcap' ? (p.spent ? 'Spent' : CWF ? 'Open the steam valve' : 'Strike the Bellcap') : 'Open the case') : p.kind === 'flora' ? 'Gather' : p.kind === 'wonder' ? 'Record' : p.kind === 'chest' ? 'Open the chest' : 'Take'}${C.exploring(st) ? '' : ' · 1 action'}` : near ? 'No actions left this turn' : p.walk ? 'Click to walk to it' : 'Click to walk up to it'; cls = a ? 'go' : 'far'; }
    else if (!live(me)) txt = '';
    else if (mode) { txt = a ? `${mode.k === 'abil' ? D.ABILITIES[mode.id].name : 'Use device'} here` : 'Out of range'; cls = a ? 'go' : 'no'; }
    else if (a && a.t === 'move') { const d = C.moveTiles(st, me).get(y * C.W + x); txt = `Move here · ${d} step${d === 1 ? '' : 's'} · 1 action`; cls = 'go'; }
    else if (me.ap < 1) { txt = 'No actions left this turn'; cls = 'no'; }
    else if (![...C.moveTiles(st, me).values()].some(d => d > 0)) { txt = `${me.name} is boxed in: every tile beside them is taken`; cls = 'no'; }
    else { txt = `Too far this turn: ${me.name} moves ${me.move} tiles per action`; cls = 'far'; }
    if (!txt) { tip.hidden = true; return; }
    const q = sc.screen(x, y, .15); tip.textContent = txt; tip.className = 'tiletip ' + cls; tip.style.left = q.left + '%'; tip.style.top = q.top + '%'; tip.hidden = false;
  }
  // ---- Combat log: every action by everything, in plain words. Hidden until opened.
  const clog = []; let logOpen = false;
  function record(a, ev, S) {
    const who = id => { const u = S.units.find(x => x.id === id); if (!u) return 'Something'; return u.side === 'c' ? (u.variant ? D.VARIANTS[u.variant].name + ' ' : '') + D.SPECIES[u.kind].name : u.name || (u.kind === 'drone' ? 'The drone' : 'An ally'); };
    const cls = id => { const u = S.units.find(x => x.id === id); return !u ? '' : u.side === 'c' ? 'foe' : 'ally'; }; const push = (t, c = '') => clog.push({ t, c });
    if (a) { if (a.t === 'abil') push(`${who(a.u)} uses ${D.ABILITIES[a.a].name}${a.id != null ? ' on ' + who(a.id) : ''}.`, 'ally did'); else if (a.t === 'study') push(`${who(a.u)} studies ${who(a.id)}.`, 'ally did'); else if (a.t === 'dev') push(`${who(a.u)} uses a device.`, 'ally did'); else if (a.t === 'atk') push(`${who(a.u)} attacks ${who(a.id)}.`, 'ally did'); else if (a.t === 'end') push('You end the turn.', 'sys'); else if (a.t === 'next') push(S.outcome ? 'The party extracts.' : 'The party moves on.', 'sys'); else if (a.t === 'abandon') push('The party retreats.', 'sys'); }
    for (const e of ev) {
      if (e.e === 'phase' && e.free) continue;
      if (e.e === 'phase') push(e.who === 'c' ? 'The Cabinet moves' : 'Your turn', 'head');
      else if (e.e === 'room') push(`Room ${e.idx + 1}`, 'head');
      else if (e.e === 'side') push(e.id ? 'The party wanders off to ' + D.WONDERS[e.id].name : 'The party heads back to the hall', 'head');
      else if (e.e === 'find') { const F0 = D.FINDS[S.room.props.find(q => q.pid === e.pid)?.id]; push(who(e.by) + ' tries ' + (F0 ? F0.name.toLowerCase() : 'something') + '. ' + (e.what === 'wake' ? 'Something wakes.' : F0 ? F0.after : ''), 'ally did'); }
      else if (e.e === 'move') push(`${who(e.id)} ${e.blink ? 'blinks' : e.shove ? 'is thrown' : 'moves'} ${e.path.length} tile${e.path.length === 1 ? '' : 's'}.`, cls(e.id));
      else if (e.e === 'hit') push(e.from && !e.dot ? `${who(e.from)} hits ${who(e.id)} for ${e.n}${e.crit ? ', a critical hit' : ''}${e.eff === 'weak' ? ' (it is weak to that weapon)' : e.eff === 'resist' ? ' (it resists that weapon)' : ''}.` : `${who(e.id)} takes ${e.n}${e.dot && e.dot !== 'dot' ? ' from ' + e.dot : ' damage'}.`, cls(e.from && !e.dot ? e.from : e.id));
      else if (e.e === 'heal') { if (e.n > 0) push(`${who(e.id)} recovers ${e.n} health.`, cls(e.id)); }
      else if (e.e === 'shield') push(e.n < 0 ? `${who(e.id)} gains ${-e.n} shield.` : `${who(e.id)}'s shield absorbs ${e.n}.`, cls(e.id));
      else if (e.e === 'text') push(/^Witnessed/.test(e.msg) ? `You watch the ${who(e.id)}. ${e.msg}.` : `${who(e.id)}: ${e.msg}.`, cls(e.id));
      else if (e.e === 'insight') push(`You know how ${who(e.id)} moves. It falters.`, 'ally');
      else if (e.e === 'status') push(`${who(e.id)} is ${{ bleed: 'bleeding', burn: 'burning', poison: 'poisoned', mark: 'marked', calm: 'calmed', root: 'held in place', stun: 'stunned' }[e.s] || e.s}.`, cls(e.id));
      else if (e.e === 'study') push(`Field notes on ${who(e.id)}: +${e.n}.`, 'ally');
      else if (e.e === 'die') push(`${who(e.id)} dies.`, cls(e.id));
      else if (e.e === 'flee') push(`${who(e.id)} flees the room.`, cls(e.id));
      else if (e.e === 'down') push(`${who(e.id)} goes down.`, cls(e.id));
      else if (e.e === 'spawn') push(`${who(e.id)} appears.`, cls(e.id));
      else if (e.e === 'eat') push(`${who(e.id)} feeds on the dead.`, cls(e.id));
      else if (e.e === 'tele') push('A strike is marked on the floor.', 'foe');
      else if (e.e === 'purge') push('The marked line is purged.', 'foe');
      else if (e.e === 'trapset') push('A snare is set.', 'ally'); else if (e.e === 'trap') push('A snare snaps shut.', 'ally'); else if (e.e === 'burst') push('A pulse goes off.', 'ally');
      else if (e.e === 'fx') push({ spores: CWF ? 'The vent blows a wall of steam.' : 'The Bellcap breathes out a cloud of spores.', lit: 'The lamp is lit.', unlit: 'The lamp is put out.', specimen: 'The case holds a preserved specimen. Sample taken.', alive: 'The case opens. Something inside was still alive.' }[e.what], 'ally');
      else if (e.e === 'plate') push(e.ok ? `A mark in the floor answers: ${e.n} of ${e.of}.` : 'The wrong mark. They all go dark.', 'ally did');
      else if (e.e === 'unlock') push('Somewhere in the hall a lock gives.', 'ally did');
      else if (e.e === 'chest') push(`${who(e.by)} opens the chest. A sealed case comes out.`, 'ally did');
      else if (e.e === 'prop') { const p = S.room.props.find(q => q.pid === e.pid); push(p ? `${p.kind === 'wonder' ? 'Recorded' : p.kind === 'cache' ? 'Taken' : 'Gathered'}: ${p.kind === 'flora' ? D.FLORA[p.id].name : p.kind === 'wonder' ? D.WONDERS[p.id].name : 'a sealed case'}.` : 'Something is gathered.', 'ally'); }
    }
  }
  function drawLog() { const el = $('.clog', root); el.hidden = !logOpen; for (const bt of root.querySelectorAll('[data-act="log"]')) bt.setAttribute('aria-expanded', logOpen); if (!logOpen) return; const ol = $('ol', el); ol.innerHTML = clog.length ? clog.map(l => `<li class="${l.c}">${esc(l.t)}</li>`).join('') : '<li class="sys">Nothing has happened yet.</li>'; ol.scrollTop = ol.scrollHeight; }
  // rebuild the log after a reload by replaying what has already happened
  try { const S0 = C.createRun(spec); clog.push({ t: 'Hall 1', c: 'head' }, { t: 'Your turn', c: 'head' }); for (const a of log) record(a, C.apply(S0, a), S0); } catch { /* the live state is what matters */ }
  // A short fading line over the selected Seeker saying why nothing happened.
  function say(txt, at) { const u = at || unit(sel) || mine()[0]; if (!u) return toast(txt); float(u.x, u.y, txt, 'txt why'); }
  function banner(txt) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = txt; board.append(b); setTimeout(() => b.remove(), 1000); }

  // The cut-away. Paintings load ahead of time; if either one is not ready the blow simply plays in the hall.
  const CUT_HERO = { vanguard: 'hobb', tracker: 'sile', naturalist: 'oyelaran', tinkerer: 'tamsin', firebrand: 'garrow' }; const cutImg = {};
  const cutLoad = id => { if (!id || cutImg[id]) return; const im = new Image(); im.src = `assets/cut/${id}.jpg`; cutImg[id] = im; };
  const cutReady = id => cutImg[id] && cutImg[id].complete && cutImg[id].naturalWidth > 0;
  for (const u of st.units) cutLoad(u.side === 's' ? CUT_HERO[u.kind] : u.side === 'c' ? u.kind : null);
  let cutAct = null, fightShot = false; const castSeen = new Set(), fell = new Set();
  // What a field note taught you, shown as the page it goes on: the plate, the name, and the one new thing.
  function studyCard(e) { const c = unit(e.id); if (!c || c.side !== 'c' || !D.SPECIES[c.kind]) return; const S = D.SPECIES[c.kind];
    root.querySelector('.studycard')?.remove(); const d = document.createElement('button'); d.className = 'studycard';
    d.innerHTML = `${sketchTag(c.kind, 1, 0, 200)}<span><i>Full record</i><b>${esc(S.name)}</b><em>${esc(S.latin)}</em><p>${esc(S.behavior)}</p><small>Weak to ${D.FAMILY_NAME[S.weak]} · resists ${D.FAMILY_NAME[S.resist]}</small><p class="sc-pay">${S.boss ? 'Every hit on it is 15% stronger.' : `Hits on any ${esc(S.name)} are 15% stronger this expedition, and your first blow on each is a critical.${e.insight ? ` Insight ${e.insight} for the great one.` : ''}`}</p></span>`;
    d.onclick = () => d.remove(); root.querySelector('.game').append(d); drawSketches(d); setTimeout(() => d.remove(), 5200); }
  // Every look adds strokes to the sketch of the animal: studying is something you watch happen, not a number going up.
  let padT = 0; function sketchPad(e) { const c = unit(e.id); if (!c || c.side !== 'c' || !D.SPECIES[c.kind] || !e.n) return; const cap = c.variant ? 5 : 3, to = e.read ? 1 : Math.min(1, (c.studied || 0) / cap), from = Math.max(0, to - e.n / cap); let d = root.querySelector('.sketchpad');
    if (!d) { d = document.createElement('div'); d.className = 'sketchpad'; d.innerHTML = '<canvas width="220" height="220"></canvas><b></b><small></small>'; root.querySelector('.game').append(d); }
    d.querySelector('b').textContent = D.SPECIES[c.kind].name; d.querySelector('small').textContent = e.read ? 'Full record' : `Field sketch · ${Math.min(cap, c.studied || 0)} of ${cap}`; grow(d.querySelector('canvas'), `assets/cat/${c.kind}.jpg`, from, to); clearTimeout(padT); padT = setTimeout(() => d.remove(), e.read ? 1400 : 3600); }
  const wallLabel = kind => { const f = G.firsts && G.firsts['f:' + kind], mine = G.state && G.state.cat && G.state.cat['f:' + kind] && G.state.cat['f:' + kind].first; return mine ? 'Wall label: first recorded by you' : f ? `Wall label: first recorded by ${esc(f.who)}` : 'Wall label: blank. Nobody has recorded this one.'; };
  // Arriving: the hall is shown before it is played. The great one gets its name; anywhere else, one resident going about its day.
  async function entrance() { const res = st.units.filter(u => u.side === 'c' && live(u)); if (!res.length || st.side) return; const nm = u => D.SPECIES[u.kind].name; let who = res.find(u => D.SPECIES[u.kind].boss), big = !!who, line = '';
    const subj = spec.type === 'observe' && res.find(u => u.kind === reg.observe); if (!who && subj) { who = subj; line = `The ${nm(subj)} you came to record is here.`; }
    if (!who) { const prey = res.find(u => D.SPECIES[u.kind].prey); const hunter = res.find(u => (D.SPECIES[u.kind].ai === 'predator' || D.SPECIES[u.kind].hunts)); const by = ai => res.find(u => D.SPECIES[u.kind].ai === ai);
      if (hunter && prey) { who = hunter; line = `A ${nm(hunter)} is stalking the ${nm(prey)}s.`; } else if (by('lighter')) { who = by('lighter'); line = `A ${nm(who)} is walking its round, lamp to lamp.`; } else if (by('sentinel')) { who = by('sentinel'); line = `A ${nm(who)} stands guard. It has not moved for you.`; }
      else if (by('grazer')) { who = by('grazer'); line = `A ${nm(who)} is grazing.`; } else if (by('pack')) { who = by('pack'); const k = res.filter(u => u.kind === who.kind).length; line = k > 1 ? `${k} ${nm(who)}s are roaming together.` : `A ${nm(who)} is roaming.`; } else return; }
    const S = D.SPECIES[who.kind]; const d = document.createElement('div'); d.className = 'entrance' + (big ? ' big' : '');
    d.innerHTML = big ? `<i>${esc(S.latin)}</i><b>${esc(S.name)}</b><p>${esc(S.blurb)}</p>${who.mood === 'asleep' ? '<p style="color:var(--gilt)">It is asleep. Study it and leave, or strike it and wake it.</p>' : ''}` : `<p>${esc(line)}</p><i>Nothing here has noticed you.</i>`;
    d.insertAdjacentHTML('beforeend', `<small class="wl">${wallLabel(who.kind)}</small>`); root.querySelector('.game').append(d); root.querySelector('.game').classList.add('arriving'); sc.focus(who.x, who.y); await sleep(big ? 3200 : 2400); d.remove(); root.querySelector('.game').classList.remove('arriving'); const me = unit(sel) || mine()[0]; if (big) { sc.wide(.6); /* close enough to read the fight: at .86 the board was a quarter of the screen and stayed that way */ sc.focus(Math.round((who.x + (me ? me.x : 0)) / 2), Math.round((who.y + (me ? me.y : 0)) / 2)); } else if (me) sc.focus(me.x, me.y); await sleep(250); } // what the Seeker just did, so the cut-away can show the very weapon or spell
  async function cutIn(fromKind, toKind, n, word, art) { const h = CUT_HERO[fromKind]; cutLoad(h); cutLoad(toKind); if (!cutReady(h) || !cutReady(toKind)) return false;
    const d = document.createElement('div'); d.className = 'cutin'; d.innerHTML = `<div class="pane hero"><img src="assets/cut/${h}.jpg" alt=""></div><div class="pane foe"><img src="assets/cut/${toKind}.jpg" alt=""></div><i class="slash"></i>${art ? `<img class="tool" src="${art}" alt="" onerror="this.remove()">` : ''}<b class="num">${n}<small>${word}</small></b>`;
    root.querySelector('.game').append(d); await sleep(1250); d.remove(); return true; }
  async function play(ev, before) {
    const vp = new Map(before.map(u => [u.id, { x: u.x, y: u.y }]));
    const at = id => { if (!vp.has(id)) { const u = unit(id); vp.set(id, u ? { x: u.x, y: u.y } : { x: 0, y: 0 }); } return vp.get(id); };
    let theirs = false, drift = false, cutBusy = false, fired = false; // drift: the hall moving on its own while the party explores. Nothing waits for it.
    for (const e of ev) {
      if (e.e === 'phase' && sc.cining()) { sc.cineEnd(); await sleep(220); }
      if (e.e === 'text' && /^(Witnessed|Notices)/.test(e.msg)) { const v0 = at(e.id); sc.focus(v0.x, v0.y); await sleep(350); }
      if (e.e === 'room') { sc.cineEnd(); castSeen.clear(); fightShot = false; banner(e.idx === LEN - 1 ? D.SPECIES[reg.boss].name : `Hall ${e.idx + 1}`); snd.room(); return; }
      if (e.e === 'side') { sc.cineEnd(); banner(e.id ? D.WONDERS[e.id].name : 'Back in the hall'); snd.room(); return; }
      if (e.e === 'find') { const F0 = D.FINDS[st.room.props.find(q => q.pid === e.pid)?.id] || {}; const res = { notes: 'Field notes on the ' + (D.SPECIES[e.kind]?.name || 'residents') + ': +3.', case: 'A sealed case comes out with you.', mats: 'Two of ' + (D.MATERIALS[e.mat]?.name || 'something useful') + '.', mend: 'The whole party is restored.', lore: 'Worth writing down. Experience for everyone.', wake: 'It was not empty.' }[e.what]; float(e.x, e.y, e.what === 'wake' ? 'Something wakes' : 'Found', e.what === 'wake' ? 'txt why' : 'study'); sc.burst(e.x, e.y, e.what === 'wake' ? 0xff5a4a : 0xffd05a); e.what === 'wake' ? snd.warn() : snd.pick(); toast((F0.name || 'It') + ': ' + (e.what === 'wake' ? '' : (F0.after || '') + ' ') + res, e.what === 'wake' ? '' : 'good'); await sleep(420); continue; }
      if (e.e === 'move' && (drift || e.trail)) { const v = at(e.id); sc.move(e.id, e.path, e.trail ? 115 : 190); const l = e.path[e.path.length - 1]; v.x = l[0]; v.y = l[1]; continue; }
      if (e.e === 'move') { const v = at(e.id); snd.step(); const stp = setInterval(() => snd.step(), 120); await sc.move(e.id, e.path, e.blink ? 1 : e.shove ? 150 : 115); const l = e.path[e.path.length - 1]; v.x = l[0]; v.y = l[1]; clearInterval(stp); await sleep(50); }
      else if (e.e === 'hit') { const v = at(e.id); if (theirs && !drift) sc.focus(v.x, v.y); const mine0 = e.from && !e.dot && unit(e.from)?.side === 's' && unit(e.id)?.side === 'c' && store.get('unc.cine') !== '0'; const kill0 = (unit(e.id)?.hp ?? 1) <= 0; if (mine0 && !sc.cining() && (kill0 || ((e.crit || e.eff === 'weak' || !fightShot) && e.eff !== 'resist')) && sc.cine(e.from, e.id)) { fightShot = true; tip.hidden = true; await sleep(230); } /* a close-up for the blows that matter: a kill, a critical, a weakness found, the first blow of a fight. The rest land at the pace of play. */ const close = mine0 && sc.cining(); if (e.from && e.k === 'beam') { const f = at(e.from); sc.ray(f.x, f.y, v.x, v.y, 0xff2a1a); await sleep(180); } else if (e.from && e.k === 'fire') { if (!fired) { fired = true; sc.breath(e.from, e.id); await sleep(420); } sc.burst(v.x, v.y, 0xff7a2a); await sleep(90); } else if (e.from && !e.dot) { const d = sc.lunge(e.from, e.id, e.crit) || 110; snd.swing(); await sleep(d); const f0 = at(e.from); if (close && Math.abs(f0.x - v.x) + Math.abs(f0.y - v.y) > 1) { sc.fly(320); await sleep(320); } } sc.hit(e.id, e.crit); const dies = close && (unit(e.id)?.hp ?? 1) <= 0; if (close) sc.impact(e.id, e.crit, dies); if (dies && !fell.has(e.id)) { fell.add(e.id); sc.gone(e.id); } if (close && (e.crit || dies || e.k) && !cutBusy) { cutBusy = true; await sleep(90); await cutIn(unit(e.from).kind, unit(e.id).kind, e.n, dies ? 'Finished' : e.crit ? 'Critical' : e.eff === 'weak' ? 'Weak to it' : 'Hit', cutAct && cutAct.t === 'abil' ? `assets/icons/${cutAct.a}.jpg` : gearOf(unit(e.from)).weapon ? `assets/items/${gearOf(unit(e.from)).weapon}.jpg` : ''); cutBusy = false; } snd.hit(e.crit); float(v.x, v.y, (e.crit ? 'CRIT ' : '') + '-' + e.n + (e.dot && e.dot !== 'dot' ? ' ' + e.dot : ''), e.crit ? 'crit' : ''); if (e.eff) setTimeout(() => float(v.x, v.y, e.eff === 'weak' ? 'Weak to it' : 'Resisted', e.eff === 'weak' ? 'txt weak' : 'txt resist'), 160); await sleep(e.dot ? 150 : close ? 460 : 260); }
      else if (e.e === 'heal') { const v = at(e.id); if (e.n > 0) { float(v.x, v.y, '+' + e.n, 'heal'); snd.heal(); sc.burst(v.x, v.y, 0x8fe0c2); await sleep(140); } }
      else if (e.e === 'shield') { const v = at(e.id); float(v.x, v.y, e.n < 0 ? 'shield +' + -e.n : 'blocked ' + e.n, 'txt'); await sleep(110); }
      else if (e.e === 'text') { const v = at(e.id); float(v.x, v.y, e.msg, 'txt'); await sleep(180); }
      else if (e.e === 'insight') { const v = at(e.id); sc.focus(v.x, v.y); float(v.x, v.y, 'Off balance', 'study'); sc.burst(v.x, v.y, 0xffd05a); snd.study(); await sleep(520); }
      else if (e.e === 'status') { const v = at(e.id); float(v.x, v.y, { bleed: 'Bleeding', poison: 'Poisoned', mark: 'Marked', calm: 'Calmed', root: 'Held' }[e.s] || e.s, 'txt'); await sleep(110); }
      else if (e.e === 'study') { const v = at(e.id); sketchPad(e); if (e.read) studyCard(e); float(v.x, v.y, e.read ? 'Full record' : e.seen ? '+' + e.n + ' study' : e.left > 0 ? '+' + e.n + ' · closer for more' : '+' + e.n + ' study', 'study'); snd.study(); sc.burst(v.x, v.y, 0x6fd6ff); await sleep(280); }
      else if (e.e === 'die' || e.e === 'flee' || e.e === 'down') { if (e.e === 'flee') sc.cineEnd(); const v = at(e.id); if (!fell.has(e.id)) sc.gone(e.id); e.e === 'flee' ? snd.flee() : snd.die(); if (e.e === 'flee') float(v.x, v.y, 'Gone', 'txt'); if (e.e === 'down') float(v.x, v.y, 'Down', 'txt'); if (!e.quiet) await sleep(300); }
      else if (e.e === 'spawn') { const u = unit(e.id); if (u) { sc.add({ id: u.id, x: u.x, y: u.y, kind: u.kind, side: u.side, variant: u.variant }); sc.burst(u.x, u.y, 0xb6e33a); vp.set(u.id, { x: u.x, y: u.y }); await sleep(180); } }
      else if (e.e === 'eat') { const v = at(e.id); float(v.x, v.y, 'Feeds', 'txt'); await sleep(220); }
      else if (e.e === 'phase' && e.free) { drift = e.who === 'c'; }
      else if (e.e === 'phase') { theirs = e.who === 'c'; banner(e.who === 'c' ? 'The Cabinet moves' : 'Your turn'); snd.turn(e.who === 'c'); await sleep(e.who === 'c' ? 520 : 380); }
      else if (e.e === 'tele') { const m = new Map(); for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) if (e.line.axis === 'row' ? y === e.line.i : x === e.line.i) m.set(x + ',' + y, 'danger'); sc.marks(m); snd.warn(); await sleep(380); }
      else if (e.e === 'purge') { banner('Purge'); snd.warn(); await sleep(300); }
      else if (e.e === 'burst' || e.e === 'trap' || e.e === 'trapset') { float(e.x, e.y, e.e === 'trapset' ? 'Snare set' : e.e === 'trap' ? 'Snap' : 'Pulse', 'txt'); if (e.e !== 'trapset') sc.burst(e.x, e.y); await sleep(160); }
      else if (e.e === 'fx') { const T = { spores: [CWF ? 'Steam' : 'Spores', CWF ? 0xe8f4ff : 0xb6e33a], lit: ['Lit', 0xffc878], unlit: ['Dark', 0x8090a8], specimen: ['A preserved specimen', 0xffd05a], alive: ['It was still alive', 0xff5a4a] }[e.what]; float(e.x, e.y, T[0], 'study'); sc.burst(e.x, e.y, T[1]); if (e.what === 'spores') { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) sc.burst(e.x + dx, e.y + dy, 0xb6e33a); } snd.pick(); await sleep(320); }
      else if (e.e === 'plate') { const p = st.room.props.find(q => q.pid === e.pid); if (p) { float(p.x, p.y, e.ok ? `${GL[p.glyph]} · ${e.n} of ${e.of}` : 'The marks go dark', e.ok ? 'study' : 'txt why'); sc.burst(p.x, p.y, e.ok ? 0x6fe8d0 : 0x8090a8); e.ok ? snd.pick() : snd.click(); } await sleep(260); }
      else if (e.e === 'unlock') { sc.focus(e.x, e.y); await sleep(350); float(e.x, e.y, 'A lock gives', 'study'); sc.burst(e.x, e.y, 0xffd05a); snd.study(); await sleep(500); }
      else if (e.e === 'chest') { float(e.x, e.y, 'Opened', 'study'); sc.burst(e.x, e.y, 0xffd05a); snd.pick(); toast('The chest: a sealed case comes out with you. It is opened at extraction.', 'good'); await sleep(420); }
      else if (e.e === 'prop') { const p = st.room.props.find(q => q.pid === e.pid); if (p) { float(p.x, p.y, p.kind === 'wonder' ? 'Recorded' : p.kind === 'cache' ? 'Case taken' : 'Gathered', 'study'); sc.burst(p.x, p.y, 0xffd05a); snd.pick(); } await sleep(200); }
    }
    sc.cineEnd();
  }
  async function send(a) {
    if (busy || st.outcome) return;
    const before = st.units.map(u => ({ id: u.id, x: u.x, y: u.y, hp: u.hp, max: u.max })); let ev;
    const roomWas = st.roomIdx + (st.side ? 's' : '');
    const wasCalm = C.exploring(st);
    const used = a.t === 'use' ? st.room.props.find(q => q.pid === a.p) : null;
    const shut = st.room.props.filter(q => q.kind === 'chest' && !q.done && q.lock !== 'plates' && !C.chestOpen(st, q));
    try { ev = C.apply(st, a); } catch (e) { if (e.illegal) { toast(e.message); return; } throw e; }
    const flair = a.t === 'study' ? 'study' : a.t === 'abil' ? (/brace|riposte|guard/.test(a.a) ? 'guard' : 'skill') : a.t === 'use' ? 'study' : null;
    log.push(a); store.set('unc.run', JSON.stringify({ at: run.at, log })); record(a, ev, st);
    armed = null; retreatArmed = false; if (a.t !== 'move') mode = null; if (a.t === 'end' || a.t === 'next') { mode = null; info = null; passed.clear(); sel = null; }
    busy = true; actions(); hint(); sc.marks(new Map()); sc.lines([]); sc.threat([]); tip.hidden = true;
    if (a.t === 'abil' && a.id != null && unit(a.id)?.side === 'c' && store.get('unc.cine') !== '0' && !castSeen.has(a.a) && !sc.cining() && sc.cine(a.u, a.id)) { castSeen.add(a.a); fightShot = true; tip.hidden = true; await sleep(230); } // the close-up opens on the cast, not only on the blow
    if (flair) { const own = a.t === 'abil' ? sc.act(a.u, 'a:' + a.a) : 0; const d = own || sc.act(a.u, flair); if (d) await sleep(own ? Math.min(d * .55, 1500) : Math.min(d * .5, 700)); }
    if (C.exploring(st)) fightShot = false; cutAct = a; await play(ev, before); drawLog();
    for (const q of shut) if (!q.done && C.chestOpen(st, q)) { sc.focus(q.x, q.y); await sleep(350); float(q.x, q.y, 'A lock gives', 'study'); sc.burst(q.x, q.y, 0xffd05a); snd.study(); await sleep(500); }
    if (used && used.kind === 'fixture' && learn(spec.region + ':' + used.id)) { const K = (CWF && FIXTURE_CW[used.id]) || FIXTURE[used.id]; toast(`Recorded: ${K[0]}. ${K[2]}`, 'good'); info = { p: used.pid }; }
    if (!st.outcome && wasCalm && !C.exploring(st)) { fightFrom = st.turn; passed.clear(); banner('Something turns on you'); snd.warn(); } else if (!st.outcome && !wasCalm && C.exploring(st)) banner('The hall settles');
    if (!st.outcome && st.roomIdx + (st.side ? 's' : '') !== roomWas) { sc.sync([], []); sc.beacons([]); nameSites(); await sc.travel(siteNow()); head(); sync(); /* the residents are built as the party arrives, under the arrival card, not in a half-second stall when the card closes */ await entrance(); }
    busy = false;
    if (st.outcome) { sync(); await sleep(350); leave(); onFinish(log, st); return; }
    sync();
  }
  // A Seeker's full sheet. Readable at any time; gear cannot change until the expedition ends.
  function openSheet(id) {
    const u = unit(id); if (!u) return; const sk = Object.values(G.state.seekers).find(s => s.arch === u.kind); const A = D.ARCHETYPES[u.kind]; const w = u.sh.w; const gear = sk ? C.seekerItems(G.state, sk) : [];
    const sts = []; if (u.bleed > 0) sts.push('Bleeding ' + u.bleed); if (u.poison > 0) sts.push('Poisoned ' + u.poison); if (u.shield > 0) sts.push('Shield ' + u.shield); if (u.taunt > 0) sts.push('Braced'); if (u.rip > 0) sts.push('Riposte ready');
    const v = document.createElement('div'); v.className = 'veil sheetveil';
    v.innerHTML = `<div class="modal sheet"><button class="link x" data-c="x">Close</button>
      <div class="shtop"><img class="shport" src="assets/portraits/${u.kind}.jpg" alt="" onerror="this.remove()"><div><p class="label">${esc(A.name)} · level ${u.sh.lvl}</p><h2>${esc(u.name)}</h2><p class="dim" style="font-size:13.5px;margin-top:4px">${esc(A.bio || '')}</p>
        <dl class="kv" style="margin-top:10px"><dt>Health</dt><dd class="num">${Math.max(0, u.hp)}/${u.max}</dd><dt>Actions</dt><dd class="num">${u.ap} this turn</dd><dt>Weapon</dt><dd class="num">${w.min}-${w.max} · ${C.weaponRange(st, u) > 1 ? 'range ' + C.weaponRange(st, u) : 'melee'}</dd><dt>Armor</dt><dd class="num">${u.armor}</dd><dt>Move</dt><dd class="num">${u.move} tiles</dd><dt>Critical</dt><dd class="num">${u.sh.crit}%</dd>${u.sh.dev ? `<dt>Device</dt><dd class="num">${u.charges} charge${u.charges === 1 ? '' : 's'} left</dd>` : ''}</dl>
        ${sts.length ? `<p style="margin-top:8px;font-size:13px;color:var(--gilt)">${sts.join(' · ')}</p>` : ''}</div></div>
      <h3>Abilities</h3><div class="shab">${u.sh.abilities.map(a => `<div class="k-${ABIL_KIND[a] || 'attack'}"><img src="assets/icons/${a}.jpg" alt="" onerror="this.style.visibility='hidden'"><div><b>${esc(D.ABILITIES[a].name)}</b> <i class="kd">${KIND[ABIL_KIND[a] || 'attack']}</i><p>${esc(D.ABILITIES[a].desc)}</p><small>${D.ABILITIES[a].ap ? D.ABILITIES[a].ap + ' action' + (D.ABILITIES[a].ap > 1 ? 's' : '') : 'Free'} · ready every ${D.ABILITIES[a].cd} turns${(u.cds[a] || 0) > 0 ? ' · ready in ' + u.cds[a] : ''}</small></div></div>`).join('')}</div>
      ${u.sh.res.active.length ? `<h3>Resonances awake</h3>${u.sh.res.active.map(r => `<div class="reso"><b>${D.RESONANCES[r].name}</b>${esc(D.RESONANCES[r].text)}</div>`).join('')}` : ''}
      <h3>Gear worn</h3><p class="dim" style="font-size:13px;margin:-4px 0 8px">Gear is fixed until the expedition ends. Change it at camp.</p><div class="shgear">${gear.length ? gear.map(it => itemCard(it, { hints: false, worn: false })).join('') : '<p class="dim">Nothing equipped.</p>'}</div></div>`;
    v.onclick = e => { if (e.target === v || e.target.closest('[data-c="x"]')) v.remove(); };
    document.body.append(v);
  }
  // Moving on: first take one of the three boons this hall offers, then (unless the great one is next) pick a door.
  function choosePath() {
    const P = PATHS[spec.region]; const v = document.createElement('div'); v.className = 'veil'; let pick = null;
    const fork = st.roomIdx < LEN - 2; const opt = fork ? st.route[st.roomIdx + 1] : null; const left = LEN - 2 - st.roomIdx;
    const place = t => SITE_NAME[sitesFor(st.path.concat([t]))[st.roomIdx + 1]] || ROAD[spec.region][0];
    const card = (t, c) => t === 'elite' ? `<button data-c="${c}"><span class="chip">Elite</span><h3>${place(t)}</h3><p>${esc(D.SPECIES[reg.elite].name)} ${P[0][1]}</p></button>`
      : t === 'quiet' ? `<button data-c="${c}"><span class="chip" style="background:rgba(143,224,194,.14);color:var(--calm)">Quiet</span><h3>${place(t)}</h3><p>${P[1][1]}</p></button>`
      : `<button data-c="${c}"><span class="chip" style="background:rgba(232,195,106,.14);color:var(--gilt)">Hall</span><h3>${place(t)}</h3><p>${ROAD[spec.region][1]}</p></button>`;
    const stay = (spec.type === 'observe' ? `<p class="dim" style="font-size:13.5px">Your subject, the ${esc(D.SPECIES[reg.observe].name)}, is in every hall before the last: one of them, or two where it is quiet.</p>` : '') + '<button class="link" data-c="x" style="align-self:flex-start">Not yet. Stay in this hall.</button>';
    const boons = () => { v.innerHTML = `<div class="modal"><p class="label">Hall ${st.roomIdx + 1} of ${LEN} cleared · ${st.boons.length} boon${st.boons.length === 1 ? '' : 's'} carried</p><h2>Something worth taking.</h2><p class="dim" style="margin-top:-6px">Take one. It stays with the whole party until the expedition ends.</p>
      <div class="boonpick">${st.offer.map((id, i) => `<button data-b="${i}"><img src="assets/icons/boon_${id}.jpg" alt="" onerror="this.style.visibility='hidden'"><h3>${esc(D.BOONS[id].name)}</h3><p>${esc(D.BOONS[id].desc)}</p></button>`).join('')}</div>${stay}</div>`; };
    const doors = () => { v.innerHTML = `<div class="modal"><p class="label">Hall ${st.roomIdx + 2} of ${LEN} · ${left === 1 ? 'the last fork before the great one' : left + ' forks before the great one'}</p><h2>Two doors.</h2><div class="paths">${card(opt[0], 0)}${card(opt[1], 1)}</div>${stay}</div>`; };
    const go = c => { v.remove(); const a = { t: 'next' }; if (c != null) a.c = c; if (pick != null) a.b = pick; send(a); };
    v.onclick = e => { const b = e.target.closest('[data-b],[data-c]'); if (!b) return; if (b.dataset.c === 'x') return v.remove();
      if (b.dataset.b != null) { pick = +b.dataset.b; return fork ? doors() : go(null); } go(+b.dataset.c); };
    if (C.boonEarned(st)) boons(); else if (fork) doors(); else return send({ t: 'next' });
    document.body.append(v);
  }
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'snd') { snd.toggle(); head(); return; }
    if (b.dataset.act === 'cine') { store.set('unc.cine', store.get('unc.cine') === '0' ? '1' : '0'); head(); return; }
    if (b.dataset.act === 'log') { logOpen = !logOpen; drawLog(); return; }
    if (b.dataset.act === 'trk') { trkMin = !trkMin; store.set('unc.trk', trkMin ? '1' : '0'); head(); return; }
    if (b.dataset.sheet) { openSheet(+b.dataset.sheet); return; }
    if (b.dataset.act === 'closeinfo') { info = null; armed = null; sync(); return; }
    if (b.getAttribute('aria-disabled') === 'true') { say(b.dataset.why); return; }
    if (busy) return; snd.click();
    if (b.dataset.sel) { const u = unit(+b.dataset.sel); if (u && u.id === sel) { openSheet(u.id); return; } if (live(u)) { sel = u.id; mode = null; info = null; armed = null; sync(); } return; }
    if (b.dataset.abil) { const id = b.dataset.abil; const u = unit(sel); if (D.ABILITIES[id].target === 'self') return send({ t: 'abil', u: u.id, a: id }); mode = mode?.id === id ? null : { k: 'abil', id }; armed = null; info = null; sync(); return; }
    if (b.dataset.mode) { mode = mode?.k === b.dataset.mode ? null : { k: b.dataset.mode }; armed = null; info = null; sync(); return; }
    if (b.dataset.act === 'end') return send({ t: 'end' });
    if (b.dataset.act === 'pass') { passed.add(sel); const n = mine().find(u => live(u) && u.ap > 0 && !passed.has(u.id)); if (!n) return send({ t: 'end' }); sel = n.id; mode = null; info = null; armed = null; sc.focus(n.x, n.y); return sync(); }
    if (b.dataset.act === 'wander') return send({ t: 'wander' });
    if (b.dataset.act === 'insight') { const g = st.units.find(c => c.side === 'c' && live(c) && D.SPECIES[c.kind].boss); const me = unit(sel); return g && live(me) ? send({ t: 'insight', u: me.id, id: g.id }) : null; }
    if (b.dataset.act === 'next') return st.side || st.roomIdx >= LEN - 1 ? send({ t: 'next' }) : choosePath();
    if (b.dataset.act === 'retreat') { if (retreatArmed) return send({ t: 'abandon' }); retreatArmed = true; head(); return; }
  };
  // Walk the selected Seeker as close to a tile as their remaining actions allow, stopping once within `need` of it.
  // Walking up to look: one Seeker goes alone, and never onto a tile where a roaming hunter would notice. The others stay put.
  async function creep(o) { const me = unit(sel); if (!live(me)) return; let moved = 0, held = false; const near = o.ai === 'ambush' ? 4 : o.ai === 'skittish' ? 2 : 1; /* as close as it will stand for */
    const quiet = (x, y) => st.units.every(h => h === o || !(h.side === 'c' && live(h) && !(h.calm > 0)) || (h.mood === 'roam' ? md({ x, y }, h) > C.noticeRadius(st, h) : h.ai === 'ambush' ? md({ x, y }, h) > 3 : true)); /* nor into the reach of anything lying in wait */
    while (!busy && !st.outcome && live(me) && live(o) && C.exploring(st) && md(me, o) > near && moved < 6) { const dist = md(me, o); let best = null;
      for (const [k, d] of C.moveTiles(st, me)) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const far = md({ x, y }, o); if (far >= dist || far < near || !quiet(x, y)) continue; if (!best || far < best.far || (far === best.far && d < best.d)) best = { x, y, far, d }; }
      if (!best) { held = true; break; } moved++; await send({ t: 'move', u: me.id, x: best.x, y: best.y, solo: true }); }
    if (!busy && !st.outcome && live(me) && live(o) && C.exploring(st) && !me.freeStudy && md(me, o) <= 3 && C.studyValue(st, me, o) > 0) await send({ t: 'study', u: me.id, id: o.id });
    if (live(o)) { info = { u: o.id }; sync(); } if (held && live(o) && md(me, o) > 1) say(C.exploring(st) ? 'Any closer and something here will notice' : ''); }
  async function approach(tx, ty, need, what) {
    const me = unit(sel); const T0 = { x: tx, y: ty }; if (!live(me)) return; if (me.ap < 1) return say('No actions left this turn'); let moved = 0;
    const calm0 = C.exploring(st);
    while (!busy && !st.outcome && live(me) && me.ap >= 1 && md(me, T0) > need && C.exploring(st) === calm0) { const dist = md(me, T0); let best = null;
      for (const [k, d] of C.moveTiles(st, me)) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const far = md({ x, y }, T0); if (far >= dist) continue; const inR = far <= need; if (!best || (inR && !best.inR) || (inR === best.inR && (inR ? d < best.d : far < best.far || (far === best.far && d < best.d)))) best = { x, y, far, d, inR }; }
      if (!best) break; info = null; moved++; await send({ t: 'move', u: me.id, x: best.x, y: best.y }); }
    if (!moved) return say(need ? `Out of range: ${what} reaches ${need}, and there is no way closer` : 'No way there');
    if (need && live(me) && !st.outcome && C.exploring(st) === calm0) say(md(me, T0) <= need ? (me.ap >= 1 ? 'In range' : 'In range. No actions left') : 'Out of range. Moved as close as possible');
  }
  function tileClick(x, y) {
    if (busy || st.outcome) return;
    const o = C.unitAt(st, x, y); const p = propAt(x, y); const a = targets().get(x + ',' + y);
    if (o && o.side === 's' && !(mode && a)) { sel = o.id; mode = null; info = null; armed = null; return sync(); }
    const me0 = unit(sel);
    if (mode?.k === 'atk') { if (o && o.side === 'c' && live(o) && live(me0)) { const r = C.weaponRange(st, me0); if (md(me0, o) <= r && me0.ap > 0) { mode = null; return send({ t: 'atk', u: me0.id, id: o.id }); } return approach(x, y, r, 'Weapon'); } mode = null; return sync(); }
    /* a creature that is not hunting you is something to look at: a click walks up to watching distance and opens what is known. Striking it takes the Attack button. */
    if (!mode && o && o.side === 'c' && live(o) && !C.isHostile(st, o) && live(me0)) { armed = null; return creep(o); }
    if (a) {
      if (a.t === 'atk' && !C.isHostile(st, o) && armed !== o.id) { armed = o.id; info = { u: o.id }; return sync(); }
      if (a.t === 'use' || a.t === 'atk') info = null; return send(a);
    }
    const me = unit(sel);
    if (live(me) && o && o.side === 'c' && live(o)) {
      const dist = md(me, o);
      if (mode?.k === 'abil') { const A = D.ABILITIES[mode.id]; const rg = C.abilRange(st, me, mode.id); if (A.target !== 'enemy') return say(`${A.name} cannot target a creature`); if (dist > rg) return approach(x, y, rg, A.name); return say(`${A.name} has no effect on this one`); }
      if (mode?.k === 'study') return o.studied >= (o.variant ? 5 : 3) ? say('Nothing more to learn from this one') : approach(x, y, dist > 3 ? 3 : Math.max(1, dist - 1), 'Study');
      if (mode?.k === 'dev') return approach(x, y, C.DEV_INFO[C.devKind(me)].range, 'The device');
      return approach(x, y, C.weaponRange(st, me), 'Weapon');
    }
    if (live(me) && p && !a && md(me, p) > (p.kind === 'plate' ? 0 : 1)) return approach(x, y, p.kind === 'plate' ? 0 : 1, 'Reach'); // scenery and samples: walk up to them
    if (live(me) && !o && !p && !a) { if (mode) { const need = mode.k === 'abil' ? C.abilRange(st, me, mode.id) : mode.k === 'dev' ? C.DEV_INFO[C.devKind(me)].range : 3; if (md(me, { x, y }) > need) return approach(x, y, need, mode.k === 'abil' ? D.ABILITIES[mode.id].name : mode.k === 'study' ? 'Study' : 'The device'); say('That cannot be used there'); }
      else if (st.room.rock[y * C.W + x]) say(CWF ? 'Blocked: machinery' : 'Blocked: boulders'); else return approach(x, y, 0, 'Move'); }
    if (mode) mode = null;
    armed = null; info = o ? { u: o.id } : p ? { p: p.pid } : null; sync();
  }
  sync(); if (st.outcome) { leave(); onFinish(log, st); return; } if (log.length === 0) banner(reg.short);
}
