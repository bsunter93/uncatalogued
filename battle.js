// The expedition screen: board, input, and playback of what the rules engine reports.
import { C, D, G, $, esc, art, face, store, toast, itemCard } from './ui.js';
import { createScene } from './scene3d.js';
import { snd } from './sound.js';

const PATHS = { verdant: [['The Overgrowth', 'has been seen in there. Harder. What it leaves behind is worth a better case.'], ['The Still Pond', 'Grazers, flora and no hunters. A good place to study. Nothing to clear, so no case for clearing it.']],
  clockwork: [['The Foundry Floor', 'is working the line. Harder. What it leaves behind is worth a better case.'], ['The Winding Garden', 'Tended, quiet, watched. A good place to study. Nothing to clear, so no case for clearing it.']] };
// Things around the hall that are not part of the fight. Tap one to read it.
const DECOR = {
  survey: ['Survey Station 4', 'Left standing', 'A brass theodolite on a tripod, aimed at the door. The sketchbook beside it is open to a drawing of this room. The trees in the drawing are shorter.'],
  crates: ['Supply crates', 'Third Expedition', 'Specimen jars packed in straw, every one labelled and empty. The lantern on top still has oil in it. Nobody came back for these.'],
  case_broken: ['Display Case 112', 'Seal broken', 'The plate says the specimen was collected dead. The glass was broken from the inside.'],
  lamp: ['Gallery lamp', 'Still fed', 'Brass, with a ground-glass lens. It lights when touched. Nobody has found where the supply comes from.'],
  column_fallen: ['Fallen column', 'Marble', 'It came down a long time ago. The moss on the break is older than the moss on the floor.'],
  plinth: ['Empty plinth', 'Label polished', 'Whatever stood here is gone and the dome lies beside it. Somebody has been keeping the label plate clean.'],
  mushrooms: ['Bellcap cluster', 'Uncatalogued', 'Taller than a Seeker. They dim when you stand close and brighten again when you look away.'],
  tree_a: ['Gallery oak', 'Rooted through the floor', 'The roots have lifted the tiles in a ring. An expedition left its instruments at the base and the tree has started to grow around them.'],
  tree_b: ['Tagged willow', 'Specimen 9', 'The brass tag on the trunk is stamped with a number and a date. The date has not happened yet.'],
};
// What kind of action each button is. The colour on the button says the same thing.
const KIND = { attack: 'Attack', defend: 'Defend', control: 'Control', support: 'Support', device: 'Device', lore: 'Knowledge', flow: '' };
const ABIL_KIND = { brace: 'defend', riposte: 'defend', shove: 'attack', deadeye: 'attack', spore_dart: 'attack', arc_pulse: 'attack', mark: 'control', snare: 'control', soothe: 'control', mend: 'support', overclock: 'support', drone: 'device' };
// How each kind of creature behaves, and the one thing worth knowing when you meet it.
const NATURE = {
  pack: ['Pack hunter', 'Weak alone. Kill or scatter them one at a time before they gather round a single Seeker.'],
  predator: ['Predator', 'It picks a Seeker and commits. Brace, or put a snare in its path.'],
  ambush: ['Ambusher', 'It waits for you to come within reach. Fight it from range.'],
  grazer: ['Grazer', 'Harmless unless hurt. A safe subject for study.'],
  skittish: ['Skittish', 'It runs from anything close. Study it from the edge of your range.'],
  scavenger: ['Scavenger', 'It comes for the dead and feeds to heal. Clear the bodies or kill it first.'],
  mender: ['Mender', 'It repairs the others. Deal with it before the things it tends.'],
  sentinel: ['Sentinel', 'It guards a place and holds a grudge. Leave its ground and it lets you go.'],
  boss_orchard: ['Great one', 'It cannot be calmed. Watch for what it grows between its turns.'],
  boss_regulator: ['Great one', 'It cannot be calmed. The red line on the floor is where it strikes next.'],
};
const STATUS = u => { const s = []; const add = (on, cls, t, d) => { if (on) s.push(`<span class="st ${cls}" title="${d}">${t}</span>`); };
  add(u.shield > 0, 'buff', 'Shield ' + u.shield, 'Absorbs damage before health'); add(u.taunt > 0, 'buff', 'Braced', 'Drawing attacks'); add(u.rip > 0, 'buff', 'Riposte', 'Strikes back when hit in melee'); add(u.calm > 0, 'buff', 'Calm ' + u.calm, 'Will not hunt unless hurt');
  add(u.bleed > 0, 'bad', 'Bleeding ' + u.bleed, 'Loses health each turn'); add(u.poison > 0, 'bad', 'Poisoned ' + u.poison, 'Loses health each turn, fading by one'); add(u.mark > 0, 'bad', 'Marked', 'Takes 25% more damage'); add(u.root > 0, 'bad', 'Held ' + u.root, 'Cannot move'); add(u.stun > 0, 'bad', 'Stunned', 'Loses its turn');
  return s.length ? `<div class="sts2">${s.join('')}</div>` : '<p class="dim" style="font-size:12.5px">No active effects.</p>'; };
const FIXTURE = {
  bellcap: ['Bellcap', 'Spore cap', 'Strike it and it breathes out. Every living creature within two tiles goes drowsy for two turns. Machines and the great ones ignore it. Once only.'],
  lamp: ['Gallery lamp', 'Still fed', 'Light it and whatever is not hunting you drifts toward it and stays. A creature held by the light only notices you if you stand right beside it.'],
  case: ['Specimen case', 'Seal intact', 'Something was put in here a long time ago. It may still be a specimen. It may still be alive.'],
};
const MISSION = { pursue: 'Pursuit', observe: 'Observation', harvest: 'Harvest', cache: 'Recovery' };
const off = why => `aria-disabled="true" data-why="${why}"`;
const btn = (kind, icon, name, sub, attrs) => `<button class="act k-${kind}" ${attrs}><img src="assets/icons/${icon}.jpg" alt=""><span class="tx"><b>${name}</b><small>${sub}</small></span>${KIND[kind] ? `<i class="kd">${KIND[kind]}</i>` : ''}</button>`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function mountBattle(root, onFinish) {
  const run = G.state.run; const spec = run.spec; const reg = D.REGIONS[spec.region];
  let log = []; try { const sv = JSON.parse(store.get('unc.run') || 'null'); if (sv && sv.at === run.at) log = sv.log; } catch { /* start over */ }
  let st; try { st = C.replay(spec, log); } catch { log = []; st = C.createRun(spec); }
  let focusOn = ''; let hov = null; let sel = null, mode = null, info = null, busy = false, armed = null, retreatArmed = false, shownRoom = -1;
  const first = !G.state.stats.runs;

  root.innerHTML = `<div class="game"><div class="board three"></div>
    <div class="hud htop"><div class="tracker"></div><span class="grow"></span><span class="label turn"></span><button class="link" data-act="log" aria-expanded="false">Log</button><button class="link" data-act="snd"></button><button class="link" data-act="retreat">Retreat</button></div>
    <div class="panel info" hidden></div><div class="clog" hidden><div class="clh"><span class="label">Combat log</span><button class="link" data-act="log">Close</button></div><ol></ol></div>
    <div class="hud hbot"><div class="scards"></div><div class="mid"><div class="hint"></div><div class="actions"></div></div></div></div>`;
  const wake = () => snd.start(spec.region); root.addEventListener('pointerdown', wake, { once: true });
  const leave = () => { snd.stop(); sc.dispose(); };
  const board = $('.board', root);
  const sc = createScene(board, { onTile: (x, y) => tileClick(x, y), onDecor: (k, lit) => { if (!DECOR[k]) return; info = { d: k, lit }; armed = null; snd.pick(); panel(); },
    onHover: (t, d) => { tipFor(t); const o = t && C.unitAt(st, t[0], t[1]); const p = t && propAt(t[0], t[1]); const nh = o && live(o) ? { u: o.id } : p ? { p: p.pid } : d && DECOR[d] ? { d } : null; if (JSON.stringify(nh) !== JSON.stringify(hov)) { hov = nh; if (!info) panel(); } }, region: spec.region, seed: spec.seed });
  // which far place the party is standing in: the start, one of the two doors, or the last room
  const siteNow = () => st.roomIdx === 0 ? 'S' : st.roomIdx === 1 ? ((log.find(a => a.t === 'next' && a.c != null)?.c) ? 'B' : 'A') : 'F';
  if (location.hostname === 'localhost') { window.__sc = sc; window.__b = { get st() { return st; }, get busy() { return busy; }, send: a => send(a), C, siteNow: () => siteNow() }; } // local testing hooks
  sc.names({ A: PATHS[spec.region]?.[0][0], B: PATHS[spec.region]?.[1][0], F: spec.type === 'pursue' ? D.SPECIES[reg.boss].name : 'The last room' }); sc.place(siteNow());
  const unit = id => st.units.find(u => u.id === id);
  // what each Seeker is wearing, by item type, so the scene can show it
  const gearOf = u => { const sk = Object.values(G.state.seekers).find(s => s.arch === u.kind); const g = {}; if (sk) for (const it of C.seekerItems(G.state, sk)) { const sl = C.itemDef(it).slot; if (sl === 'weapon' || sl === 'head' || sl === 'body') g[sl] = it.base; } return g; };
  const live = u => u && !u.dead && !u.fled;
  const mine = () => st.units.filter(u => u.side === 's');
  const foes = () => st.units.filter(u => u.side === 'c' && live(u));
  const propAt = (x, y) => st.room.props.find(p => !p.done && p.x === x && p.y === y);
  const stage = k => spec.stages[k] ?? -1;
  function label(u) {
    const s = []; if (u.bleed > 0) s.push(`<span class="bleed">BLEED ${u.bleed}</span>`); if (u.poison > 0) s.push(`<span class="poison">POISON ${u.poison}</span>`); if (u.mark > 0) s.push('<span class="mark">MARKED</span>'); if (u.root > 0) s.push('<span>HELD</span>'); if (u.stun > 0) s.push('<span>STUNNED</span>'); if (u.rip > 0) s.push('<span>RIPOSTE</span>'); if (u.taunt > 0) s.push('<span>BRACED</span>'); if (u.calm > 0) s.push('<span class="calm">CALM</span>');
    const h = u.side === 'c' && C.isHostile(st, u);
    return `${s.length ? `<div class="sts">${s.join('')}</div>` : ''}${u.side === 's' ? `<div class="ap">${'<i></i>'.repeat(Math.max(0, u.ap))}</div>` : ''}<div class="hp ${h ? 'hostile' : ''}"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i><b style="width:${Math.min(100, (u.shield || 0) / u.max * 100)}%"></b></div>`;
  }
  function sync() {
    if (shownRoom !== st.roomIdx) { shownRoom = st.roomIdx; sel = null; mode = null; info = null; sc.setRoom(st); }
    if (!sel || !live(unit(sel)) || unit(sel).ap <= 0) { const n = mine().find(u => live(u) && u.ap > 0); if (n && (!sel || !live(unit(sel)) || !mode)) sel = n.id; }
    const m = targets();
    sc.sync(st.units.map(u => { const a = live(u) && m.get(u.x + ',' + u.y); return { id: u.id, x: u.x, y: u.y, kind: u.kind, side: u.side, variant: u.variant, gear: u.side === 's' ? gearOf(u) : null, gone: !live(u), label: live(u) ? label(u) : '',
      ring: u.side === 's' ? (u.id === sel ? 'sel' : u.ap <= 0 ? 'spent' : null) : u.side === 'a' ? null : a && a.id === u.id ? 'tg' : C.isHostile(st, u) ? 'hostile' : 'calm' }; }),
      st.room.props.filter(p => !p.done).map(p => ({ key: 'p' + p.pid, x: p.x, y: p.y, model: p.kind === 'fixture' ? 'fx_' + p.id : p.kind === 'flora' ? p.id : p.kind, lit: !!p.lit, spent: !!p.spent, use: !!m.get(p.x + ',' + p.y) && !mode }))
        .concat(st.room.traps.map(t => ({ key: 't' + t.x + '_' + t.y, x: t.x, y: t.y, model: 'trap' })), st.room.corpses.map(c => ({ key: 'c' + c.x + '_' + c.y, x: c.x, y: c.y, model: 'corpse' }))));
    marks(m); drawLines(); head(); actions(); cards(); panel(); hint();
    const fu = unit(sel); if (live(fu) && focusOn !== sel + ':' + fu.x + ',' + fu.y + ':' + st.roomIdx) { const first = !focusOn; focusOn = sel + ':' + fu.x + ',' + fu.y + ':' + st.roomIdx; sc.focus(fu.x, fu.y, first); }
    sc.beacons(st.room.props.filter(p => !p.done).map(p => [p.x, p.y, p.kind === 'wonder' ? 2 : 1.35, p.kind === 'fixture' ? (p.spent ? 0x6a6a72 : 0xffa53b) : p.kind === 'wonder' ? 0x9fe8ff : p.kind === 'cache' ? 0xffd05a : 0x8ff0a8]));
  }
  function targets() { // what a click can do right now: Map "x,y" -> action
    const m = new Map(); const u = unit(sel); if (!live(u) || busy || st.outcome) return m;
    const each = f => { for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) f(x, y, C.unitAt(st, x, y)); };
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
      for (const c of foes()) if (md(u, c) <= 3 && c.studied < (c.variant ? 5 : 3) && (u.ap >= 1 || (!u.freeStudy && !C.isHostile(st, c)))) m.set(c.x + ',' + c.y, { t: 'study', u: u.id, id: c.id });
    } else {
      if (u.ap >= 1 || (u.fx.freemove && !u.freeUsed)) for (const [k, d] of C.moveTiles(st, u)) if (d) m.set((k % C.W) + ',' + Math.floor(k / C.W), { t: 'move', u: u.id, x: k % C.W, y: Math.floor(k / C.W) });
      if (u.ap >= 1) { for (const c of foes()) if (md(u, c) <= C.weaponRange(st, u)) m.set(c.x + ',' + c.y, { t: 'atk', u: u.id, id: c.id });
        for (const p of st.room.props) if (!p.done && md(u, p) <= 1) m.set(p.x + ',' + p.y, { t: 'use', u: u.id, p: p.pid }); }
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
    if (spec.type === 'pursue') return [`Bring down <b>${esc(D.SPECIES[reg.boss].name)}</b>${st.roomIdx < 2 ? '. It waits in the last room.' : ''}`, rs.bossDown];
    if (spec.type === 'observe') return [`Study <b>${esc(obs)}</b>: <span class="num">${Math.min(6, rs.study[reg.observe] || 0)}/6</span>. Kill none of them.${rs.obsKilled ? ' One has died. The contract is void.' : ''}`, (rs.study[reg.observe] || 0) >= 6 && !rs.obsKilled];
    if (spec.type === 'harvest') return [`Gather flora: <span class="num">${Math.min(4, rs.floraN)}/4</span>`, rs.floraN >= 4];
    return [`Open the <b>sealed case</b>${st.roomIdx < 2 ? ' in the last room' : ' at the far wall'}.`, rs.objCache];
  }
  let trkMin = store.get('unc.trk') === '1';
  function head() {
    const [t, ok] = objective(); const w = st.room.wonder && D.WONDERS[st.room.wonder]; const hunting = foes().filter(c => C.isHostile(st, c)).length; const adv = C.canAdvance(st);
    const next = st.outcome ? '' : ok && st.roomIdx >= 2 ? 'Objective met. Extract when you are ready.' : hunting ? `${hunting} creature${hunting === 1 ? ' is' : 's are'} hunting you. Fight, hold them off, or calm them.` : adv ? `The room is quiet. Study or gather what you want, then ${st.roomIdx >= 2 ? 'extract' : 'move on through the gate'}.` : 'End the turn to let the room move.';
    const pips = [0, 1, 2].map(i => `<i class="${i < st.roomIdx ? 'done' : i === st.roomIdx ? 'on' : ''}"></i>`).join('');
    $('.tracker', root).innerHTML = trkMin ? `<button class="trk min" data-act="trk" aria-expanded="false"><span class="rooms">${pips}</span><b>${MISSION[spec.type] || 'Mission'}</b><span class="${ok ? 'ok' : ''}">${ok ? 'Objective met' : 'Show mission'}</span></button>`
      : `<div class="trk"><div class="trh"><span class="label">${MISSION[spec.type] || 'Mission'} · ${esc(reg.short)}</span><button class="link" data-act="trk" aria-expanded="true">Hide</button></div>
        <p class="goal ${ok ? 'ok' : ''}"><span class="chk">${ok ? '&#10003;' : ''}</span><span>${t}</span></p>
        <div class="step"><span class="rooms">${pips}</span><span>Room ${st.roomIdx + 1} of 3</span></div>
        ${next ? `<p class="next"><b>Next</b> ${next}</p>` : ''}${w ? `<p class="won"><b>${esc(w.name)}.</b> ${esc(w.effect)}</p>` : ''}</div>`;
    $('.turn', root).textContent = `Tier ${['', 'I', 'II', 'III', 'IV', 'V'][st.tier]} · Turn ${st.turn}`; $('[data-act="snd"]', root).textContent = snd.on ? 'Sound on' : 'Sound off';
    $('[data-act="retreat"]', root).textContent = retreatArmed ? 'Really retreat? You lose most cases.' : 'Retreat';
  }
  function actions() {
    const u = unit(sel); const el = $('.actions', root); if (st.outcome) { el.innerHTML = ''; return; }
    const b = []; const dis = busy || !live(u);
    if (live(u)) {
      b.push(btn('lore', 'study', 'Study', u.freeStudy ? 'find weak points · 1 action' : 'free on a calm creature', `data-mode="study" aria-pressed="${mode?.k === 'study'}" title="Each note adds 10% damage against that creature and reveals what it is weak to" ${dis ? 'disabled' : u.ap < 1 && u.freeStudy ? off('No actions left this turn') : ''}`));
      for (const id of u.sh.abilities) { const A = D.ABILITIES[id]; const cd = u.cds[id] || 0; const free = u.fx.borrowed_moment && (u.abilN + 1) % 4 === 0;
        b.push(btn(ABIL_KIND[id] || 'attack', id, esc(A.name), cd > 0 ? `ready in ${cd}` : free ? 'free' : A.ap ? A.ap + (A.ap > 1 ? ' actions' : ' action') : 'free', `data-abil="${id}" aria-pressed="${mode?.id === id}" title="${esc(A.desc)}" ${dis ? 'disabled' : cd > 0 ? off(`${A.name} is ready in ${cd} turn${cd === 1 ? '' : 's'}`) : !free && u.ap < A.ap ? off(`Not enough actions: ${A.name} needs ${A.ap}, ${u.name} has ${u.ap}`) : ''}`)); }
      if (u.sh.dev) { const k = C.devKind(u); const I = C.DEV_INFO[k]; const nm = { lure: 'Lure Pod', barrier: 'Barrier Seed', pulse: 'Pulse Emitter', drone: 'Drone Core', blink: 'Blink Anchor', gravity: 'Gravity Knot' }[k];
        b.push(btn('device', 'device', nm, `${u.charges} left`, `data-mode="dev" aria-pressed="${mode?.k === 'dev'}" ${dis ? 'disabled' : u.charges <= 0 ? off('No charges left on this device') : u.ap < I.ap ? off('Not enough actions for the device') : ''}`)); }
    }
    const adv = C.canAdvance(st); const anyAp = mine().some(x => live(x) && x.ap > 0);
    if (adv) b.push(btn('flow', 'move_on', st.roomIdx >= 2 ? 'Extract' : 'Move on', st.roomIdx >= 2 ? 'end the expedition' : 'through the gate', `data-act="next" ${busy ? 'disabled' : ''}`).replace('class="act ', 'class="act adv '));
    b.push(btn('flow', 'end', 'End turn', adv ? 'let the room move' : 'creatures act', `data-act="end" ${busy ? 'disabled' : ''}`).replace('class="act ', `class="act end ${!anyAp && !adv ? 'ready' : ''} `));
    el.innerHTML = b.join('');
  }
  function cards() {
    $('.scards', root).innerHTML = mine().map(u => `<button class="scard ${live(u) ? '' : 'down'}" data-sel="${u.id}" aria-pressed="${u.id === sel}">${face(u.kind)}<span class="nm">${esc(u.name)}<span class="num">${Math.max(0, u.hp)}/${u.max}${u.shield ? ' +' + u.shield : ''}</span></span><span class="bar"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i></span><span class="sub label" style="grid-column:2">${live(u) ? D.ARCHETYPES[u.kind].name + ' · ' + u.sh.w.min + '-' + u.sh.w.max + (C.weaponRange(st, u) > 1 ? ' at ' + C.weaponRange(st, u) : '') + ' · armor ' + u.armor : 'Down until the next room'}</span><span class="aps" style="grid-column:2">${'<i></i>'.repeat(Math.max(0, live(u) ? u.ap : 0))}</span></button><button class="sheetbtn" data-sheet="${u.id}" title="Open ${esc(u.name)}'s sheet" aria-label="Open ${esc(u.name)}'s sheet">Sheet</button>`).join('');
  }
  function panel() {
    const el = $('.info', root); let h = '';
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
        <div class="hc-wr">${sg >= 2 || u.studied >= 2 ? `<span class="wk"><b>Weak to</b> ${D.FAMILY_NAME[S.weak]} weapons</span><span class="rs"><b>Resists</b> ${D.FAMILY_NAME[S.resist]} weapons</span>` : sg >= 1 || u.studied >= 1 ? `<span class="wk"><b>Weak to</b> ${D.FAMILY_NAME[S.weak]} weapons</span><span class="un"><b>Resists</b> not yet known</span>` : '<span class="un"><b>Weak to</b> not yet known</span><span class="un"><b>Resists</b> not yet known</span>'}</div>
        ${u.armor ? `<p class="dim" style="font-size:12.5px;margin-top:6px">Armor ${u.armor} is taken off every hit, so many small hits do little. Poison and Bleed ignore it.</p>` : ''}
        ${u.variant ? `<p style="margin-top:6px;font-size:13px"><span class="stamp">Variant</span> ${esc(D.VARIANTS[u.variant].note)}</p>` : ''}
        <div class="hc-foot"><span>Field notes${u.studied ? ` · +${u.studied * 10}% damage to it` : ''}</span><span class="pips">${Array.from({ length: cap }, (_, i) => `<i class="${i < u.studied ? 'on' : ''}"></i>`).join('')}</span></div>`;
    } else if (u && live(u) && u.side === 's') {
      h = `<div class="hc-art">${art(u.kind)}</div><p class="label">${esc(D.ARCHETYPES[u.kind].name)} · level ${u.sh.lvl}</p><h4>${esc(u.name)}</h4>
        <div class="hc-hp ally"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i><span class="num">${Math.max(0, u.hp)} / ${u.max}</span></div>
        <div class="hc-stats"><span><b class="num">${u.sh.w.min}-${u.sh.w.max}</b>damage</span><span><b class="num">${u.armor}</b>armor</span><span><b class="num">${u.move}</b>move</span><span><b class="num">${u.ap}</b>actions</span></div>${STATUS(u)}`;
    } else if (info2?.d) {
      const info = info2; const [nm, tag, txt] = DECOR[info.d]; h = `<p class="label">In the hall · ${esc(tag)}</p><h4>${esc(nm)}</h4><p style="margin-top:8px;font-size:13.5px">${esc(txt)}</p>${info.d === 'lamp' ? `<p class="dim" style="font-size:13px;margin-top:6px">${info.lit ? 'Lit.' : 'Out.'} Tap it again to change it.</p>` : ''}`;
    } else if (p) {
      const F = p.kind === 'fixture' ? { name: FIXTURE[p.id][0], blurb: FIXTURE[p.id][2] + (p.id === 'lamp' ? (p.lit ? ' It is lit.' : ' It is dark.') : p.spent ? ' It is spent.' : '') } : p.kind === 'flora' ? D.FLORA[p.id] : p.kind === 'wonder' ? D.WONDERS[p.id] : { name: p.obj ? 'The sealed case' : 'A sealed case', blurb: 'Specimen case, lead seal intact. Opened at extraction.' };
      h = `<div class="plate">${art(p.id)}</div><p class="label">${p.kind === 'fixture' ? 'In the hall · ' + FIXTURE[p.id][1] : p.kind === 'wonder' ? 'Wonder' : p.kind === 'flora' ? 'Flora' : 'Cache'}</p><h4>${esc(F.name)}</h4>${F.latin ? `<p class="lat">${esc(F.latin)}</p>` : ''}<p style="margin-top:8px;font-size:13.5px">${esc(F.blurb)}</p>${F.effect ? `<p style="margin-top:6px;font-size:13.5px;color:var(--gilt)">${esc(F.effect)}</p>` : ''}<p class="dim" style="font-size:13px;margin-top:6px">${p.walk ? 'Step on it, or stand beside it and tap it to cut it free.' : 'Stand a Seeker beside it and tap it. 1 action.'}</p>`;
    }
    if (h && pinned) h = '<button class="link x" data-act="closeinfo" aria-label="Close">Close</button>' + h; el.classList.toggle('hovering', !pinned);
    el.innerHTML = h; el.hidden = !h;
  }
  function hint() {
    const el = $('.hint', root); const u = unit(sel); let t = '';
    if (st.outcome) t = '';
    else if (busy) t = 'The room moves.';
    else if (mode?.k === 'abil') t = `<b>${esc(D.ABILITIES[mode.id].name)}.</b> ${esc(D.ABILITIES[mode.id].desc)} Tap a lit tile, or the button again to cancel.`;
    else if (mode?.k === 'study') t = '<b>Study</b> a creature within 3 tiles. Each note makes every hit on it 10% stronger. The first note shows what it is weak to, the second what it resists. Free once a turn on anything that is not hunting you.';
    else if (mode?.k === 'dev') t = '<b>Device.</b> Tap a lit tile to use it.';
    else if (armed) t = '<b>It is calm.</b> Tap it again to attack anyway. It will fight back.';
    else if (C.canAdvance(st) && first && st.roomIdx === 0) t = '<b>The room is quiet.</b> Before you move on: the Mossback is harmless. Study it, pick the moss, then leave when you are ready.';
    else if (C.canAdvance(st)) t = `<b>Nothing here is hunting you.</b> Study, gather, or ${st.roomIdx >= 2 ? 'extract' : 'move on'}.`;
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
    else if (st.room.rock[y * C.W + x]) { txt = 'Blocked: boulders'; cls = 'no'; }
    else if (p) { const near = live(me) && md(me, p) <= 1; txt = a && a.t === 'use' ? `${p.kind === 'fixture' ? (p.id === 'lamp' ? (p.lit ? 'Put out the lamp' : 'Light the lamp') : p.id === 'bellcap' ? (p.spent ? 'Spent' : 'Strike the Bellcap') : 'Open the case') : p.kind === 'flora' ? 'Gather' : p.kind === 'wonder' ? 'Record' : 'Take'} · 1 action` : near ? 'No actions left this turn' : p.walk ? 'Step onto it, or stand beside it to gather' : 'Stand beside it to use it'; cls = a ? 'go' : 'far'; }
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
      if (e.e === 'phase') push(e.who === 'c' ? `Round ${S.turn}: the Cabinet moves` : `Round ${S.turn}: your turn`, 'head');
      else if (e.e === 'room') push(`Room ${e.idx + 1}`, 'head');
      else if (e.e === 'move') push(`${who(e.id)} ${e.blink ? 'blinks' : e.shove ? 'is thrown' : 'moves'} ${e.path.length} tile${e.path.length === 1 ? '' : 's'}.`, cls(e.id));
      else if (e.e === 'hit') push(e.from && !e.dot ? `${who(e.from)} hits ${who(e.id)} for ${e.n}${e.crit ? ', a critical hit' : ''}${e.eff === 'weak' ? ' (it is weak to that weapon)' : e.eff === 'resist' ? ' (it resists that weapon)' : ''}.` : `${who(e.id)} takes ${e.n}${e.dot && e.dot !== 'dot' ? ' from ' + e.dot : ' damage'}.`, cls(e.from && !e.dot ? e.from : e.id));
      else if (e.e === 'heal') { if (e.n > 0) push(`${who(e.id)} recovers ${e.n} health.`, cls(e.id)); }
      else if (e.e === 'shield') push(e.n < 0 ? `${who(e.id)} gains ${-e.n} shield.` : `${who(e.id)}'s shield absorbs ${e.n}.`, cls(e.id));
      else if (e.e === 'text') push(`${who(e.id)}: ${e.msg}.`, cls(e.id));
      else if (e.e === 'status') push(`${who(e.id)} is ${{ bleed: 'bleeding', poison: 'poisoned', mark: 'marked', calm: 'calmed', root: 'held in place', stun: 'stunned' }[e.s] || e.s}.`, cls(e.id));
      else if (e.e === 'study') push(`Field notes on ${who(e.id)}: +${e.n}.`, 'ally');
      else if (e.e === 'die') push(`${who(e.id)} dies.`, cls(e.id));
      else if (e.e === 'flee') push(`${who(e.id)} flees the room.`, cls(e.id));
      else if (e.e === 'down') push(`${who(e.id)} goes down.`, cls(e.id));
      else if (e.e === 'spawn') push(`${who(e.id)} appears.`, cls(e.id));
      else if (e.e === 'eat') push(`${who(e.id)} feeds on the dead.`, cls(e.id));
      else if (e.e === 'tele') push('A strike is marked on the floor.', 'foe');
      else if (e.e === 'purge') push('The marked line is purged.', 'foe');
      else if (e.e === 'trapset') push('A snare is set.', 'ally'); else if (e.e === 'trap') push('A snare snaps shut.', 'ally'); else if (e.e === 'burst') push('A pulse goes off.', 'ally');
      else if (e.e === 'fx') push({ spores: 'The Bellcap breathes out a cloud of spores.', lit: 'The lamp is lit.', unlit: 'The lamp is put out.', specimen: 'The case holds a preserved specimen. Sample taken.', alive: 'The case opens. Something inside was still alive.' }[e.what], 'ally');
      else if (e.e === 'prop') { const p = S.room.props.find(q => q.pid === e.pid); push(p ? `${p.kind === 'wonder' ? 'Recorded' : p.kind === 'cache' ? 'Taken' : 'Gathered'}: ${p.kind === 'flora' ? D.FLORA[p.id].name : p.kind === 'wonder' ? D.WONDERS[p.id].name : 'a sealed case'}.` : 'Something is gathered.', 'ally'); }
    }
  }
  function drawLog() { const el = $('.clog', root); el.hidden = !logOpen; for (const bt of root.querySelectorAll('[data-act="log"]')) bt.setAttribute('aria-expanded', logOpen); if (!logOpen) return; const ol = $('ol', el); ol.innerHTML = clog.length ? clog.map(l => `<li class="${l.c}">${esc(l.t)}</li>`).join('') : '<li class="sys">Nothing has happened yet.</li>'; ol.scrollTop = ol.scrollHeight; }
  // rebuild the log after a reload by replaying what has already happened
  try { const S0 = C.createRun(spec); clog.push({ t: 'Room 1', c: 'head' }, { t: 'Round 1: your turn', c: 'head' }); for (const a of log) record(a, C.apply(S0, a), S0); } catch { /* the live state is what matters */ }
  // A short fading line over the selected Seeker saying why nothing happened.
  function say(txt, at) { const u = at || unit(sel) || mine()[0]; if (!u) return toast(txt); float(u.x, u.y, txt, 'txt why'); }
  function banner(txt) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = txt; board.append(b); setTimeout(() => b.remove(), 1000); }

  async function play(ev, before) {
    const vp = new Map(before.map(u => [u.id, { x: u.x, y: u.y }]));
    const at = id => { if (!vp.has(id)) { const u = unit(id); vp.set(id, u ? { x: u.x, y: u.y } : { x: 0, y: 0 }); } return vp.get(id); };
    let theirs = false;
    for (const e of ev) {
      if (e.e === 'text' && /^(Witnessed|Notices)/.test(e.msg)) { const v0 = at(e.id); sc.focus(v0.x, v0.y); await sleep(350); }
      if (e.e === 'room') { banner(`Room ${e.idx + 1}`); snd.room(); return; }
      if (e.e === 'move') { const v = at(e.id); snd.step(); const stp = setInterval(() => snd.step(), 120); await sc.move(e.id, e.path, e.blink ? 1 : e.shove ? 150 : 115); const l = e.path[e.path.length - 1]; v.x = l[0]; v.y = l[1]; clearInterval(stp); await sleep(50); }
      else if (e.e === 'hit') { const v = at(e.id); if (theirs) sc.focus(v.x, v.y); if (e.from && !e.dot) { const d = sc.lunge(e.from, e.id, e.crit) || 110; snd.swing(); await sleep(d); } sc.hit(e.id, e.crit); snd.hit(e.crit); float(v.x, v.y, (e.crit ? 'CRIT ' : '') + '-' + e.n + (e.dot && e.dot !== 'dot' ? ' ' + e.dot : ''), e.crit ? 'crit' : ''); if (e.eff) setTimeout(() => float(v.x, v.y, e.eff === 'weak' ? 'Weak to it' : 'Resisted', e.eff === 'weak' ? 'txt weak' : 'txt resist'), 160); await sleep(e.dot ? 150 : 260); }
      else if (e.e === 'heal') { const v = at(e.id); if (e.n > 0) { float(v.x, v.y, '+' + e.n, 'heal'); snd.heal(); sc.burst(v.x, v.y, 0x8fe0c2); await sleep(140); } }
      else if (e.e === 'shield') { const v = at(e.id); float(v.x, v.y, e.n < 0 ? 'shield +' + -e.n : 'blocked ' + e.n, 'txt'); await sleep(110); }
      else if (e.e === 'text') { const v = at(e.id); float(v.x, v.y, e.msg, 'txt'); await sleep(180); }
      else if (e.e === 'status') { const v = at(e.id); float(v.x, v.y, { bleed: 'Bleeding', poison: 'Poisoned', mark: 'Marked', calm: 'Calmed', root: 'Held' }[e.s] || e.s, 'txt'); await sleep(110); }
      else if (e.e === 'study') { const v = at(e.id); float(v.x, v.y, '+' + e.n + ' study', 'study'); snd.study(); sc.burst(v.x, v.y, 0x6fd6ff); await sleep(280); }
      else if (e.e === 'die' || e.e === 'flee' || e.e === 'down') { const v = at(e.id); sc.gone(e.id); e.e === 'flee' ? snd.flee() : snd.die(); if (e.e === 'flee') float(v.x, v.y, 'Gone', 'txt'); if (e.e === 'down') float(v.x, v.y, 'Down', 'txt'); if (!e.quiet) await sleep(300); }
      else if (e.e === 'spawn') { const u = unit(e.id); if (u) { sc.add({ id: u.id, x: u.x, y: u.y, kind: u.kind, side: u.side, variant: u.variant }); sc.burst(u.x, u.y, 0xb6e33a); vp.set(u.id, { x: u.x, y: u.y }); await sleep(180); } }
      else if (e.e === 'eat') { const v = at(e.id); float(v.x, v.y, 'Feeds', 'txt'); await sleep(220); }
      else if (e.e === 'phase') { theirs = e.who === 'c'; banner(e.who === 'c' ? 'The Cabinet moves' : 'Your turn'); snd.turn(e.who === 'c'); await sleep(e.who === 'c' ? 520 : 380); }
      else if (e.e === 'tele') { const m = new Map(); for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) if (e.line.axis === 'row' ? y === e.line.i : x === e.line.i) m.set(x + ',' + y, 'danger'); sc.marks(m); snd.warn(); await sleep(380); }
      else if (e.e === 'purge') { banner('Purge'); snd.warn(); await sleep(300); }
      else if (e.e === 'burst' || e.e === 'trap' || e.e === 'trapset') { float(e.x, e.y, e.e === 'trapset' ? 'Snare set' : e.e === 'trap' ? 'Snap' : 'Pulse', 'txt'); if (e.e !== 'trapset') sc.burst(e.x, e.y); await sleep(160); }
      else if (e.e === 'fx') { const T = { spores: ['Spores', 0xb6e33a], lit: ['Lit', 0xffc878], unlit: ['Dark', 0x8090a8], specimen: ['A preserved specimen', 0xffd05a], alive: ['It was still alive', 0xff5a4a] }[e.what]; float(e.x, e.y, T[0], 'study'); sc.burst(e.x, e.y, T[1]); if (e.what === 'spores') { for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]]) sc.burst(e.x + dx, e.y + dy, 0xb6e33a); } snd.pick(); await sleep(320); }
      else if (e.e === 'prop') { const p = st.room.props.find(q => q.pid === e.pid); if (p) { float(p.x, p.y, p.kind === 'wonder' ? 'Recorded' : p.kind === 'cache' ? 'Case taken' : 'Gathered', 'study'); sc.burst(p.x, p.y, 0xffd05a); snd.pick(); } await sleep(200); }
    }
  }
  async function send(a) {
    if (busy || st.outcome) return;
    const before = st.units.map(u => ({ id: u.id, x: u.x, y: u.y, hp: u.hp, max: u.max })); let ev;
    const roomWas = st.roomIdx;
    try { ev = C.apply(st, a); } catch (e) { if (e.illegal) { toast(e.message); return; } throw e; }
    const flair = a.t === 'study' ? 'study' : a.t === 'abil' ? (/brace|riposte|guard/.test(a.a) ? 'guard' : 'skill') : a.t === 'use' ? 'study' : null;
    log.push(a); store.set('unc.run', JSON.stringify({ at: run.at, log })); record(a, ev, st); drawLog();
    armed = null; retreatArmed = false; if (a.t !== 'move') mode = null; if (a.t === 'end' || a.t === 'next') { mode = null; info = null; }
    busy = true; actions(); hint(); sc.marks(new Map()); sc.lines([]); sc.threat([]); tip.hidden = true;
    if (flair) { const d = sc.act(a.u, flair); if (d) await sleep(Math.min(d * .5, 700)); }
    await play(ev, before);
    if (!st.outcome && st.roomIdx !== roomWas) { sc.sync([], []); sc.beacons([]); await sc.travel(siteNow()); }
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
      <h3>Abilities</h3><div class="shab">${u.sh.abilities.map(a => `<div class="k-${ABIL_KIND[a] || 'attack'}"><img src="assets/icons/${a}.jpg" alt=""><div><b>${esc(D.ABILITIES[a].name)}</b> <i class="kd">${KIND[ABIL_KIND[a] || 'attack']}</i><p>${esc(D.ABILITIES[a].desc)}</p><small>${D.ABILITIES[a].ap ? D.ABILITIES[a].ap + ' action' + (D.ABILITIES[a].ap > 1 ? 's' : '') : 'Free'} · ready every ${D.ABILITIES[a].cd} turns${(u.cds[a] || 0) > 0 ? ' · ready in ' + u.cds[a] : ''}</small></div></div>`).join('')}</div>
      ${u.sh.res.active.length ? `<h3>Resonances awake</h3>${u.sh.res.active.map(r => `<div class="reso"><b>${D.RESONANCES[r].name}</b>${esc(D.RESONANCES[r].text)}</div>`).join('')}` : ''}
      <h3>Gear worn</h3><p class="dim" style="font-size:13px;margin:-4px 0 8px">Gear is fixed until the expedition ends. Change it at camp.</p><div class="shgear">${gear.length ? gear.map(it => itemCard(it, { hints: false, worn: false })).join('') : '<p class="dim">Nothing equipped.</p>'}</div></div>`;
    v.onclick = e => { if (e.target === v || e.target.closest('[data-c="x"]')) v.remove(); };
    document.body.append(v);
  }
  function choosePath() {
    const P = PATHS[spec.region]; const v = document.createElement('div'); v.className = 'veil';
    v.innerHTML = `<div class="modal"><p class="label">Room 2 of 3</p><h2>Two doors.</h2><div class="paths">
      <button data-c="0"><span class="chip">Elite</span><h3>${P[0][0]}</h3><p>${esc(D.SPECIES[reg.elite].name)} ${P[0][1]}</p></button>
      <button data-c="1"><span class="chip" style="background:rgba(143,224,194,.14);color:var(--calm)">Quiet</span><h3>${P[1][0]}</h3><p>${P[1][1]}</p></button></div>
      <button class="link" data-c="x" style="align-self:flex-start">Not yet. Stay in this room.</button></div>`;
    v.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; v.remove(); if (b.dataset.c !== 'x') send({ t: 'next', c: +b.dataset.c }); };
    document.body.append(v);
  }
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.act === 'snd') { snd.toggle(); head(); return; }
    if (b.dataset.act === 'log') { logOpen = !logOpen; drawLog(); return; }
    if (b.dataset.act === 'trk') { trkMin = !trkMin; store.set('unc.trk', trkMin ? '1' : '0'); head(); return; }
    if (b.dataset.sheet) { openSheet(+b.dataset.sheet); return; }
    if (b.dataset.act === 'closeinfo') { info = null; armed = null; sync(); return; }
    if (b.getAttribute('aria-disabled') === 'true') { say(b.dataset.why); return; }
    if (busy) return; snd.click();
    if (b.dataset.sel) { const u = unit(+b.dataset.sel); if (live(u)) { sel = u.id; mode = null; info = null; armed = null; sync(); } return; }
    if (b.dataset.abil) { const id = b.dataset.abil; const u = unit(sel); if (D.ABILITIES[id].target === 'self') return send({ t: 'abil', u: u.id, a: id }); mode = mode?.id === id ? null : { k: 'abil', id }; armed = null; sync(); return; }
    if (b.dataset.mode) { mode = mode?.k === b.dataset.mode ? null : { k: b.dataset.mode }; armed = null; sync(); return; }
    if (b.dataset.act === 'end') return send({ t: 'end' });
    if (b.dataset.act === 'next') return st.roomIdx === 0 ? choosePath() : send({ t: 'next' });
    if (b.dataset.act === 'retreat') { if (retreatArmed) return send({ t: 'abandon' }); retreatArmed = true; head(); return; }
  };
  function tileClick(x, y) {
    if (busy || st.outcome) return;
    const o = C.unitAt(st, x, y); const p = propAt(x, y); const a = targets().get(x + ',' + y);
    if (o && o.side === 's' && !(mode && a)) { sel = o.id; mode = null; info = null; armed = null; return sync(); }
    if (a) {
      if (a.t === 'atk' && !C.isHostile(st, o) && armed !== o.id) { armed = o.id; info = { u: o.id }; return sync(); }
      if (a.t === 'use' || a.t === 'atk') info = null; return send(a);
    }
    const me = unit(sel);
    if (live(me) && o && o.side === 'c' && live(o)) {
      const dist = md(me, o);
      if (mode?.k === 'abil') { const A = D.ABILITIES[mode.id]; const rg = C.abilRange(st, me, mode.id); return say(A.target !== 'enemy' ? `${A.name} cannot target a creature` : dist > rg ? `Out of range: ${A.name} reaches ${rg}, target is ${dist} away` : `${A.name} has no effect on this one`); }
      if (mode?.k === 'study') return say(dist > 3 ? `Out of range: Study reaches 3, target is ${dist} away` : 'Nothing more to learn from this one');
      if (mode?.k === 'dev') return say('Out of range for the device');
      if (me.ap < 1) return say('No actions left this turn');
      // out of reach: close the distance with what movement is left
      let best = null; for (const [k, d] of C.moveTiles(st, me)) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const far = md({ x, y }, o); if (far < dist && (!best || far < best.far || (far === best.far && d < best.d))) best = { x, y, far, d }; }
      if (best) { info = null; say(best.far <= C.weaponRange(st, me) ? 'Closing in' : 'Out of range. Moving closer'); return send({ t: 'move', u: me.id, x: best.x, y: best.y }); }
      return say(`Out of range: weapon reaches ${C.weaponRange(st, me)}, target is ${dist} away, and there is no way closer`);
    }
    if (live(me) && !mode && !o && !p && !a) { say(st.room.rock[y * C.W + x] ? 'Blocked: boulders' : me.ap < 1 ? 'No actions left this turn' : `Too far: ${me.name} moves ${me.move} tiles per action`); }
    if (live(me) && mode && !o) { const nm = mode.k === 'abil' ? D.ABILITIES[mode.id].name : mode.k === 'study' ? 'Study' : 'The device'; say(`${nm} cannot be used there`); }
    if (mode) mode = null;
    armed = null; info = o ? { u: o.id } : p ? { p: p.pid } : null; sync();
  }
  sync(); if (st.outcome) { leave(); onFinish(log, st); return; } if (log.length === 0) banner(reg.short);
}
