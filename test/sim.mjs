// Bot playtests: determinism, legality, win rates, loot distribution.
import * as C from '../core.js';
const D = C.D;
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
function botAction(st, r) {
  if (C.canAdvance(st) && !st.units.some(u => u.side === 'c' && !u.dead && !u.fled && u.hunter && !(u.calm > 0))) {
    // grab props nearby first sometimes
    return { t: 'next', c: r.int(2), b: r.int(3) };
  }
  const sk = st.units.filter(u => u.side === 's' && !u.dead);
  const foes = st.units.filter(u => u.side === 'c' && !u.dead && !u.fled && (C.isHostile(st, u) || (u.hunter && !(u.calm > 0))));
  for (const u of sk) {
    if (u.ap <= 0) continue;
    const inR = foes.filter(f => md(u, f) <= C.weaponRange(st, u)).sort((a, b) => a.hp - b.hp)[0];
    // abilities
    for (const id of u.sh.abilities) {
      if ((u.cds[id] || 0) > 0) continue; const A = D.ABILITIES[id]; if (u.ap < A.ap) continue;
      const rg = C.abilRange(st, u, id);
      if (A.target === 'enemy') { const t = foes.filter(f => md(u, f) <= rg && !(id === 'soothe') && !(id === 'mark' && f.mark > 0))[0]; if (t && id !== 'soothe') return { t: 'abil', u: u.id, a: id, id: t.id }; }
      if (id === 'mend') { const t = sk.filter(s => s.hp * 2 < s.max && md(u, s) <= rg)[0]; if (t) return { t: 'abil', u: u.id, a: id, id: t.id }; }
      if (id === 'brace' && !C.exploring(st) && foes.some(f => md(u, f) <= 2)) return { t: 'abil', u: u.id, a: id };
      if (id === 'drone' && foes.length) { for (const [dx, dy] of [[1, 0], [0, 1], [0, -1], [-1, 0]]) { const x = u.x + dx, y = u.y + dy; if (x >= 0 && y >= 0 && x < C.W && y < C.H && !C.unitAt(st, x, y) && !st.room.rock[y * C.W + x] && !st.room.props.some(p => !p.done && p.x === x && p.y === y)) return { t: 'abil', u: u.id, a: id, x, y }; } }
    }
    if (inR) return { t: 'atk', u: u.id, id: inR.id };
    // move toward nearest foe
    const tiles = C.moveTiles(st, u); const tgt = foes.sort((a, b) => md(u, a) - md(u, b))[0];
    if (tgt && tiles.size > 1) { let best = null, bd = md(u, tgt); for (const [k, d] of tiles) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const dd = Math.abs(x - tgt.x) + Math.abs(y - tgt.y); if (dd < bd && dd >= 1) { bd = dd; best = [x, y]; } } if (best) return { t: 'move', u: u.id, x: best[0], y: best[1] }; }
  }
  if (C.exploring(st) && C.canAdvance(st)) return { t: 'next', c: r.int(2), b: r.int(3) }; /* nothing it can reach is hunting it: walk on */
  return { t: 'end' };
}
function playRun(state, c, tier, seed, r) {
  const spec = C.buildSpec(state, c, state.roster.slice(0, 3), tier, seed);
  const st = C.createRun(spec); const log = []; let guard = 0;
  while (!st.outcome && guard++ < 3000) { const a = botAction(st, r); try { C.apply(st, a); log.push(a); } catch (e) { if (!e.illegal) throw e; C.apply(st, { t: 'end' }); log.push({ t: 'end' }); } }
  if (!st.outcome) { console.log('STALL', spec.region, spec.type, spec.seed, st.units.filter(u=>u.side==='c'&&!u.dead&&!u.fled).map(u=>u.kind+':'+u.mood+'@'+u.x+','+u.y).join(' '), st.units.filter(u=>u.side==='s').map(u=>u.x+','+u.y+' ap'+u.ap+(u.dead?'D':'')).join(' ')); C.apply(st,{t:'abandon'}); log.push({t:'abandon'}); }
  const st2 = C.replay(JSON.parse(JSON.stringify(spec)), JSON.parse(JSON.stringify(log)));
  if (st2.outcome !== st.outcome || st2.rs !== st.rs || JSON.stringify(st2.res) !== JSON.stringify(st.res)) throw new Error('replay diverged');
  return { st, spec, log };
}
const now = 1.8e12; const r = C.mkRng(7);
// 1. win rates by tier with a levelled squad
for (const region of ['verdant', 'clockwork']) for (const tier of [1, 2, 3, 4, 5]) for (const type of ['pursue', 'observe']) {
  let wins = 0, turns = 0, N = 150, done = 0, hurtF = 0, downs = 0;
  for (let i = 0; i < N; i++) {
    const state = C.newPlayer('bot', i + 1, now); state.stats.runs = 3; /* not a first expedition: those are short and scripted */ const lvl = Math.min(10, 1 + (tier - 1) * 2);
    for (const id of state.roster) { const s = state.seekers[id]; s.lvl = lvl; const main = Object.keys(s.attr).sort((a, b) => s.attr[b] - s.attr[a])[0]; s.attr[main] += Math.floor((lvl - 1) / 2); s.attr.vitality += Math.ceil((lvl - 1) / 2); for (const sl in s.gear) state.items[s.gear[sl]].tier = tier; }
    const { st } = playRun(state, { region, type, mods: {}, target: { fam: 'organic', slot: 'weapon' } }, tier, 1000 + i, r);
    if (st.outcome === 'win') { wins++; if (st.res.contractDone) done++; } turns += st.turns; hurtF += st.res.dmgTaken / st.units.filter(u=>u.side==='s').reduce((a,u)=>a+u.max,0); downs += st.units.filter(u=>u.side==='s'&&u.dead).length;
  }
  console.log(region.padEnd(10), 'T' + tier, type.padEnd(8), 'win', (wins / N * 100).toFixed(0).padStart(3) + '%', 'contract', (done / N * 100).toFixed(0).padStart(3) + '%', 'turns', (turns / N).toFixed(1), 'dmg/hp', (hurtF/N).toFixed(2), 'downs', (downs/N).toFixed(2));
}
// 2. a full account lifecycle through applyOp, as the server would run it
const state = C.newPlayer('lifecycle', 99, now); const srv = C.mkRng(4242); let items = 0; const rar = {};
for (let i = 0; i < 300; i++) {
  const ctx = { now: now + i * 1000, rng: srv };
  C.applyOp(state, { t: 'start', c: i % 3, squad: state.roster.slice(0, 3), tier: 1 }, ctx);
  const st = C.createRun(state.run.spec); const log = []; let g = 0;
  while (!st.outcome && g++ < 3000) { const a = botAction(st, r); try { C.apply(st, a); log.push(a); } catch (e) { if (!e.illegal) throw e; C.apply(st, { t: 'end' }); log.push({ t: 'end' }); } }
  const out = C.applyOp(state, { t: 'finish', log }, ctx);
  for (const it of out.report.items) { items++; const x = state.items[it.id]; rar[x.rar] = (rar[x.rar] || 0) + 1; C.itemName(x); C.itemMods(x); C.itemTags(x); }
  for (const id of state.roster) { const s = state.seekers[id]; while (s.pts > 0) C.applyOp(state, { t: 'attr', s: id, a: 'vitality' }, { now }); if (s.lvl >= 3 && !s.spec) C.applyOp(state, { t: 'spec', s: id, id: D.SPECS[s.arch][0].id }, { now }); while (s.traits.length < D.TRAIT_LEVELS.filter(l => s.lvl >= l).length) C.applyOp(state, { t: 'trait', s: id, id: C.traitOffer(s)[0] }, { now }); }
  // equip anything new into empty slots, dismantle the rest when the pack fills
  for (const id in state.items) { const it = state.items[id]; const sl = C.itemDef(it).slot; const s = state.seekers[state.roster[i % state.roster.length]]; if (!s.gear[sl]) C.applyOp(state, { t: 'equip', s: s.id, i: id }, { now }); }
  if (Object.keys(state.items).length > 60) { const worn = new Set(state.roster.flatMap(s => Object.values(state.seekers[s].gear))); C.applyOp(state, { t: 'dismantle', items: Object.keys(state.items).filter(id => !worn.has(id) && !state.items[id].sing) }, { now }); }
  if (i === 5 || i === 30 || i === 299) console.log('after', i + 1, 'runs: entries', Object.keys(state.cat).length, 'score', C.score(state), 'unlocks', Object.keys(state.unlocks).join(','), 'lvls', state.roster.map(s => state.seekers[s].lvl).join('/'), 'comps', state.comps);
}
console.log('items', items, rar, 'per run', (items / 300).toFixed(2));
// 3. raw table check
const cnt = [0, 0, 0, 0, 0, 0]; const rr = C.mkRng(1); for (let i = 0; i < 100000; i++) cnt[D.RARITIES.indexOf(C.rollItem(rr, { src: 'boss', region: 'verdant', tier: 3 }).rar)]++;
console.log('boss table x100k', cnt.map(n => (n / 1000).toFixed(2) + '%').join(' '));
console.log('keys', C.allKeys().length);
