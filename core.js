// The Uncatalogued: rules engine. Runs unchanged in the browser and on the server.
// The server replays every expedition from its seed and action log before paying out.
import * as D from './data.js';
export { D };
export const VERSION = 17;
export const W = 14, H = 10;

// ---------------------------------------------------------------- rng
export function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function mkRng(seed) {
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return (t ^ (t >>> 14)) >>> 0; };
  return { next, int: n => next() % n, range: (a, b) => a + next() % (b - a + 1), pct: p => next() % 10000 < p * 100, pick: a => a[next() % a.length], get s() { return s; }, set s(v) { s = v >>> 0; } };
}
const R = st => { const r = mkRng(st.rs); const api = { next: () => { const v = r.next(); st.rs = r.s; return v; } }; api.int = n => api.next() % n; api.range = (a, b) => a + api.next() % (b - a + 1); api.pct = p => api.next() % 10000 < p * 100; api.pick = a => a[api.next() % a.length]; return api; };
const fl = Math.floor;
const tierScale = (t, per = 25) => 100 + per * (t - 1);

// ---------------------------------------------------------------- items
const SCALED = new Set(['armor', 'hp', 'shieldStart', 'thorns', 'killHeal', 'leech']);
export function itemDef(it) { return it.sing ? D.SINGULARS[it.sing] : D.BASES[it.base]; }
export function itemName(it) {
  if (it.sing) return D.SINGULARS[it.sing].name;
  const b = D.BASES[it.base]; const a = it.aff || [];
  return (a[0] ? D.AFFIXES[a[0].id].pre + ' ' : '') + b.name + (a[1] ? ' ' + D.AFFIXES[a[1].id].suf : '');
}
export function itemTags(it) {
  const def = itemDef(it); const t = [...(def.tags || [])];
  for (const a of it.aff || []) t.push(...D.AFFIXES[a.id].tags);
  if (it.fx) t.push(...D.SPECIALS[it.fx].tags);
  return [...new Set(t)];
}
export function itemScale(it) { return fl(tierScale(it.tier, 20) * (it.stat || 100) / 100 * (100 + 4 * (it.cal || 0)) / 100); }
export function itemWeapon(it) {
  const def = itemDef(it); if (!def.w) return null; const s = itemScale(it);
  return { min: Math.max(1, Math.round(def.w[0] * s / 100)), max: Math.max(1, Math.round(def.w[1] * s / 100)), range: def.w[2], scale: def.w[3], fam: def.fam };
}
export function itemMods(it) {
  const def = itemDef(it); const m = {}; const s = itemScale(it);
  for (const k in def.m || {}) m[k] = (m[k] || 0) + (SCALED.has(k) ? Math.max(1, Math.round(def.m[k] * s / 100)) : def.m[k]);
  for (const a of it.aff || []) { const k = D.AFFIXES[a.id].key; m[k] = (m[k] || 0) + a.v; }
  return m;
}
export function affixBand(id, tier) { const a = D.AFFIXES[id]; const sc = SCALED.has(a.key) ? tierScale(tier, 20) : 100; return [Math.round(a.r[0] * sc / 100), Math.round(a.r[1] * sc / 100)]; }
function rollAffixValue(r, id, tier, q) {
  const [lo, hi] = affixBand(id, tier); const span = hi - lo; if (span <= 0) return lo;
  const a = lo + Math.round(span * [0, 0.3, 0.7][q]); const b = lo + Math.round(span * [0.3, 0.7, 1][q]);
  return r.range(Math.min(a, b), Math.max(a, b));
}
export function affixQuality(it, i) { const a = it.aff[i]; const [lo, hi] = affixBand(a.id, it.tier); if (hi <= lo) return 2; const p = (a.v - lo) / (hi - lo); return p >= 0.7 ? 2 : p >= 0.3 ? 1 : 0; }
function validAffixes(it, skipIdx = -1) {
  const def = itemDef(it); const rar = D.RARITIES.indexOf(it.rar); const have = new Set(), cats = {};
  (it.aff || []).forEach((a, i) => { if (i === skipIdx) return; const A = D.AFFIXES[a.id]; have.add(A.key); cats[A.cat] = (cats[A.cat] || 0) + 1; });
  for (const k in def.m || {}) if (k === 'echo' || k === 'phase') have.add(k);
  return Object.keys(D.AFFIXES).filter(id => { const A = D.AFFIXES[id]; return A.slots.includes(def.slot) && A.fams.includes(def.fam) && (A.min || 0) <= rar && !have.has(A.key) && (cats[A.cat] || 0) < 2; });
}
function rollQuality(r) { const x = r.int(100); return x < 30 ? 0 : x < 80 ? 1 : 2; }
export function makeItem(r, baseId, rarIdx, tier) {
  const it = { base: baseId, rar: D.RARITIES[rarIdx], tier, stat: fl(D.STAT_MULT[rarIdx] * r.range(95, 105) / 100), aff: [], seed: r.next() };
  const n = [0, 1, 2, 3, 3][rarIdx];
  for (let i = 0; i < n; i++) { const v = validAffixes(it); if (!v.length) break; const id = r.pick(v); it.aff.push({ id, v: rollAffixValue(r, id, tier, rollQuality(r)) }); }
  if (rarIdx === 4 || (rarIdx === 3 && r.pct(10))) {
    const def = D.BASES[baseId]; const sp = Object.keys(D.SPECIALS).filter(k => D.SPECIALS[k].slots.includes(def.slot) && D.SPECIALS[k].fams.includes(def.fam));
    if (sp.length) it.fx = r.pick(sp);
  }
  return it;
}
export function makeSingular(r, id, tier) { return { sing: id, rar: 'singular', tier, stat: 108, aff: [], seed: r.next() }; }
function weighted(r, table) { let tot = 0; for (const k in table) tot += table[k]; let x = r.int(Math.round(tot * 100)) / 100; for (const k in table) { x -= table[k]; if (x < 0) return k; } return Object.keys(table)[0]; }
// opts: src, region, tier, target {fam, slot}, rareFind, singBonus (percent points)
export function rollItem(r, o) {
  const tb = D.RARITY_TABLE[o.src].slice();
  if (o.rareFind) { const mv = Math.min(tb[0], o.rareFind); tb[0] -= mv; tb[2] += mv * 0.6; tb[3] += mv * 0.3; tb[4] += mv * 0.1; }
  if (o.singBonus && tb[5] > 0) { tb[5] += o.singBonus; tb[1] = Math.max(0, tb[1] - o.singBonus); }
  let x = r.int(10000) / 100, rar = 0; for (let i = 0; i < 6; i++) { x -= tb[i]; if (x < 0) { rar = i; break; } }
  if (rar === 5) return makeSingular(r, r.pick(Object.keys(D.SINGULARS).filter(k => k !== 'collectors_eye')), o.tier);
  const famT = { ...D.REGIONS[o.region].fam };
  if (o.target) { for (const f in famT) famT[f] *= 0.5; famT[o.target.fam] += 50; }
  if (o.src === 'cache') famT.anomalous += 25;
  let fam = weighted(r, famT); if (o.target && o.src === 'contract') fam = o.target.fam;
  let pool = Object.keys(D.BASES).filter(b => D.BASES[b].fam === fam);
  if (o.target && r.pct(o.src === 'contract' ? 70 : 35)) { const p2 = pool.filter(b => D.BASES[b].slot === o.target.slot); if (p2.length) pool = p2; }
  return makeItem(r, r.pick(pool), rar, o.tier);
}

// ---------------------------------------------------------------- seeker sheet
export function xpNext(lvl) { return 150 + 110 * lvl; }
// Sets worn: how many pieces of each, and the bonuses that count reaches. Singular items belong to no set.
export function setsFor(items) { const n = {}; for (const it of items) { if (it.sing) continue; const id = D.SET_OF[it.base]; if (id) n[id] = (n[id] || 0) + 1; }
  return Object.keys(n).sort().map(id => { const m = {}; for (const need in D.SETS[id].bonus) if (n[id] >= +need) for (const k in D.SETS[id].bonus[need]) m[k] = (m[k] || 0) + D.SETS[id].bonus[need][k]; return { id, n: n[id], m }; }); }
export function resonancesFor(items) {
  const tags = items.map(itemTags); const act = [];
  for (const id in D.RESONANCES) {
    const [a, b] = D.RESONANCES[id].need; let ok = false;
    for (let i = 0; i < tags.length && !ok; i++) for (let j = 0; j < tags.length; j++) if (i !== j && tags[i].includes(a) && tags[j].includes(b)) { ok = true; break; }
    if (ok) act.push(id);
  }
  return { active: act.slice(0, 2), dormant: act.slice(2) };
}
export function seekerItems(state, s) { return D.SLOTS.map(sl => s.gear[sl] && state.items[s.gear[sl]]).filter(Boolean); }
export function sheet(state, sid, gearOverride) {
  const s = state.seekers[sid]; const arch = D.ARCHETYPES[s.arch];
  const items = gearOverride || seekerItems(state, s);
  const m = {}, fx = {}; let w = null, dev = null, devItem = null;
  for (const it of items) {
    const im = itemMods(it); for (const k in im) m[k] = (m[k] || 0) + im[k];
    if (it.fx) fx[it.fx] = 1; if (it.sing) fx[it.sing] = 1;
    const def = itemDef(it); if (def.w) w = itemWeapon(it); if (def.dev) { dev = def.dev; devItem = it; }
  }
  const sets = setsFor(items); for (const st0 of sets) for (const k in st0.m) m[k] = (m[k] || 0) + st0.m[k];
  const res = resonancesFor(items); for (const id of res.active) fx['res_' + id] = 1;
  for (const t of s.traits) fx['t_' + t] = 1; if (s.spec) fx['s_' + s.spec] = 1; fx['a_' + s.arch] = 1;
  const A = s.attr; if (!w) w = { min: 2, max: 4, range: 1, scale: 'force' };
  let maxHp = 28 + 3 * A.vitality + 2 * s.lvl + (m.hp || 0); if (fx.glass) maxHp = fl(maxHp * 75 / 100);
  let range = w.range + (w.range > 1 || m.range ? (m.range || 0) : 0); if (fx.s_marksman && w.range > 1) range += 1;
  return {
    sid, name: s.name, arch: s.arch, lvl: s.lvl, attr: { ...A }, m, fx, res, sets, w: { ...w, range }, maxHp,
    armor: (m.armor || 0) + (fx.s_bulwark ? 2 : 0), move: 3 + (m.move || 0) + (fx.t_light ? 1 : 0), crit: 5 + A.precision + (m.crit || 0),
    dev, devCharges: dev ? 1 + (fx.twin ? 1 : 0) + (fx.a_tinkerer ? 1 : 0) + (dev === 'unfinished' ? 1 : 0) : 0,
    abilities: arch.abilities.slice(), tier: devItem ? devItem.tier : 1,
  };
}

// ---------------------------------------------------------------- expedition sim
const ENC = {
  verdant: {
    standard: [[['thornling', 4]], [['thornling', 3], ['mossback', 1]], [['thornling', 3], ['gulper', 1]], [['thornling', 2], ['carrion', 1], ['mossback', 1]], [['thornling', 2], ['gulper', 1], ['carrion', 1], ['glasswing', 1]], [['thornling', 3], ['carrion', 1], ['glasswing', 1]], [['thornling', 2], ['stalkbriar', 1], ['dewhare', 2]], [['stalkbriar', 1], ['dewhare', 3], ['mossback', 1]], [['thornling', 3], ['dewhare', 2], ['carrion', 1]]],
    elite: [[['hush', 1], ['thornling', 3]], [['hush', 1], ['mossback', 1], ['carrion', 2]]],
    quiet: [[['mossback', 2], ['glasswing', 2]], [['glasswing', 2], ['mossback', 1], ['gulper', 1]], [['dewhare', 3], ['mossback', 1], ['stalkbriar', 1]]],
    boss: [[['orchardmother', 1], ['thornling', 3]]],
  },
  clockwork: {
    standard: [[['mite', 4]], [['mite', 3], ['pollinator', 1]], [['mite', 2], ['coilfawn', 2], ['warden', 1]], [['mite', 3], ['coilfawn', 1]], [['mite', 3], ['pollinator', 1], ['warden', 1]]],
    elite: [[['mantis', 1], ['coilfawn', 2], ['warden', 1]], [['mantis', 1], ['mite', 3]]],
    quiet: [[['coilfawn', 2], ['warden', 1], ['pollinator', 1]], [['coilfawn', 3], ['pollinator', 2]]],
    boss: [[['regulator', 1], ['mite', 2], ['pollinator', 1]]],
  },
};
// 'roam' means it has not noticed the party and is living its own life.
const NOTICE = { pack: 2, predator: 3, scavenger: 2 }; const AMBIENT = { verdant: ['mossback', 'glasswing', 'lampmoth'], clockwork: ['coilfawn', 'pollinator'] };
const MOOD0 = { pack: 'roam', scavenger: 'roam', predator: 'roam', boss_orchard: 'hostile', boss_regulator: 'hostile', grazer: 'docile', mender: 'docile', sentinel: 'docile', skittish: 'wary', ambush: 'territorial' };
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const K = (x, y) => y * W + x;
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

export function createRun(spec) {
  const st = { spec, rs: spec.seed, tier: spec.tier, roomIdx: -1, uid: 1, units: [], outcome: null, turn: 0, turns: 0, heartUsed: false, kills3: {},
    res: { study: {}, samples: {}, seen: {}, variants: {}, flora: {}, wonders: {}, mats: {}, kills: {}, cases: [], xp: 0, dmgTaken: 0, floraN: 0, bossDown: false, objCache: false, obsKilled: false, rooms: 0, contractDone: false } };
  { const pr = mkRng((spec.seed ^ 0x51de) >>> 0 || 7); const pl = (D.PLACES[spec.region] || []).slice(); for (let i = pl.length - 1; i > 0; i--) { const j = pr.next() % (i + 1); [pl[i], pl[j]] = [pl[j], pl[i]]; } st.places = pl; st.side = null; st.wandered = {}; } // which side place each hall can see
  for (const sh of spec.squad) {
    st.units.push({ id: st.uid++, side: 's', kind: sh.arch, name: sh.name, sh, m: sh.m, fx: sh.fx, x: 0, y: 0, hp: sh.maxHp, max: sh.maxHp, armor: sh.armor, move: sh.move, shield: 0, ap: 2, cds: {}, charges: 0, abilN: 0, killN: 0 });
  }
  enterRoom(st, 'standard', []);
  return st;
}
const seekers = st => st.units.filter(u => u.side === 's');
const alive = u => !u.dead && !u.fled;
const friends = st => st.units.filter(u => (u.side === 's' || u.side === 'a') && alive(u));
const creatures = st => st.units.filter(u => u.side === 'c' && alive(u));
export const unitAt = (st, x, y) => st.units.find(u => alive(u) && u.x === x && u.y === y);
const propAt = (st, x, y) => st.room.props.find(p => !p.done && p.x === x && p.y === y);
function solid(st, x, y) { if (!inb(x, y) || st.room.rock[K(x, y)]) return true; const p = propAt(st, x, y); return !!(p && !p.walk); }
const free = (st, x, y) => !solid(st, x, y) && !unitAt(st, x, y);

// A locked chest tucked out of the way: against boulders or along the far edges where it is not seen at a glance.
function addChest(st, r, lock) { const room = st.room; let best = null;
  for (let i = 0; i < 60; i++) { const x = r.range(5, W - 1), y = r.int(H); if (!free(st, x, y) || !DIRS.some(([dx, dy]) => free(st, x + dx, y + dy))) continue; let n = (y === 0 || y === H - 1 ? 2 : 0) + (x === W - 1 ? 1 : 0); for (const [dx, dy] of DIRS) if (inb(x + dx, y + dy) && room.rock[K(x + dx, y + dy)]) n += 2; if (!best || n > best.n) best = { x, y, n }; }
  if (!best) return; const chest = { pid: room.pid++, kind: 'chest', id: 'chest', x: best.x, y: best.y, lock, open: lock === 'plates' ? false : null, prog: 0 }; room.props.push(chest);
  if (lock === 'plates') { const g = [0, 1, 2, 3]; for (let i = 3; i > 0; i--) { const j = r.int(i + 1); [g[i], g[j]] = [g[j], g[i]]; } chest.seq = g.slice(0, 3); // three of the four marks, in an order; the fourth is a decoy
    for (let k = 0; k < 4; k++) for (let i = 0; i < 80; i++) { const x = r.range(2, W - 2), y = r.int(H); if (free(st, x, y) && !room.props.some(p => p.x === x && p.y === y)) { room.props.push({ pid: room.pid++, kind: 'plate', id: 'plate', glyph: k, x, y, walk: true }); break; } } } }
// Whether a chest will open now.
export function chestOpen(st, p) { return p.lock === 'plates' ? !!p.open : p.lock === 'light' ? st.room.props.some(q => q.kind === 'fixture' && q.id === 'lamp' && q.lit && !q.done) : st.room.props.some(q => q.kind === 'fixture' && q.id === 'bellcap' && q.spent); }
function onPlate(st, u, ev) { const pl = st.room.props.find(p => p.kind === 'plate' && p.x === u.x && p.y === u.y); const ch = st.room.props.find(p => p.kind === 'chest' && !p.done && p.lock === 'plates'); if (!pl || !ch || ch.open) return;
  if (pl.glyph === ch.seq[ch.prog]) { ch.prog++; if (ch.prog >= ch.seq.length) { ch.open = true; ev.push({ e: 'plate', pid: pl.pid, ok: true, n: ch.prog, of: ch.seq.length }, { e: 'unlock', pid: ch.pid, x: ch.x, y: ch.y }); } else ev.push({ e: 'plate', pid: pl.pid, ok: true, n: ch.prog, of: ch.seq.length }); }
  else { ch.prog = pl.glyph === ch.seq[0] ? 1 : 0; ev.push({ e: 'plate', pid: pl.pid, ok: ch.prog === 1, n: ch.prog, of: ch.seq.length, reset: true }); } }
// The side place this hall can see, if the party has not been yet. One per hall, none from the last room.
export function placeFor(st) { return !st.outcome && !st.side && st.roomIdx >= 0 && st.roomIdx < 2 && !st.wandered[st.roomIdx] ? st.places[st.roomIdx] || null : null; }
function enterSide(st, id, ev) {
  const r = R(st); const reg = st.spec.region; const sk = seekers(st);
  st.side = { id, room: st.room, others: st.units.filter(u => u.side !== 's'), at: sk.map(u => [u.id, u.x, u.y]), turn: st.turn }; st.wandered[st.roomIdx] = id;
  st.units = sk.slice(); const room = st.room = { type: 'side', place: id, rock: new Array(W * H).fill(0), props: [], traps: [], corpses: [], wonder: null, firstDeath: false, pid: 1 };
  for (let i = 0; i < 6; i++) room.rock[K(r.range(3, W - 1), r.int(H))] = 1;
  sk.forEach((u, i) => { u.x = 0; u.y = (i % 4) + 3; u.ap = 2; });
  const spot = (minX, maxX = W - 1) => { for (let i = 0; i < 200; i++) { const x = r.range(minX, maxX), y = r.int(H); if (free(st, x, y)) return [x, y]; } return null; };
  const c0 = spot(8, 11); if (c0) room.props.push({ pid: room.pid++, kind: 'wonder', id, x: c0[0], y: c0[1], place: true }); // the thing itself, to be recorded
  const finds = Object.keys(D.FINDS).filter(k => D.FINDS[k].place === id); const risk = r.int(finds.length), wake = r.pct(40);
  finds.forEach((f, i) => { const p = spot(4, 12); if (p) room.props.push({ pid: room.pid++, kind: 'find', id: f, x: p[0], y: p[1], wake: wake && i === risk }); });
  if (r.pct(40)) addChest(st, r, 'plates');
  for (let i = 0; i < 2; i++) { const p = spot(3); if (p) room.props.push({ pid: room.pid++, kind: 'flora', id: r.pick(D.REGIONS[reg].flora.filter(f => f !== 'snare_vine')), x: p[0], y: p[1] }); }
  for (const k of AMBIENT[reg] || []) if (r.pct(60)) { const p = spot(6); if (p) spawn(st, k, p[0], p[1], r, ev, true); }
  st.turn = 1; ev.push({ e: 'side', id });
}
function leaveSide(st, ev) {
  const b = st.side; for (const c of st.room.corpses) addMat(st, c.mat, c.n);
  st.room = b.room; st.units = seekers(st).concat(b.others); for (const [id, x, y] of b.at) { const u = st.units.find(q => q.id === id); if (u) { u.x = x; u.y = y; u.ap = 2; } }
  st.turn = b.turn; st.side = null; ev.push({ e: 'side', id: null });
}
function enterRoom(st, type, ev) {
  const r = R(st); const sp = st.spec; const reg = sp.region; const last = st.roomIdx + 1 === 2;
  st.roomIdx++; st.turn = 1;
  st.units = st.units.filter(u => u.side === 's');
  const room = st.room = { type, rock: new Array(W * H).fill(0), props: [], traps: [], corpses: [], wonder: null, firstDeath: false, pid: 1 };
  // rocks: keep the two left columns open, keep the floor connected
  for (let tries = 0; tries < 30; tries++) {
    room.rock.fill(0); const n = r.range(10, 17);
    for (let i = 0; i < n; i++) room.rock[K(r.range(2, W - 1), r.int(H))] = 1;
    const seen = new Set([0]), q = [[0, 0]]; let open = 0; for (let i = 0; i < W * H; i++) if (!room.rock[i]) open++;
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && !room.rock[K(nx, ny)] && !seen.has(K(nx, ny))) { seen.add(K(nx, ny)); q.push([nx, ny]); } } }
    if (seen.size === open) break;
  }
  const sk = seekers(st); sk.forEach((u, i) => {
    u.x = i < 4 ? 0 : 1; u.y = (i % 4) + 3;
    if (st.roomIdx > 0) { if (u.dead) { u.dead = false; u.hp = 0; } u.hp = Math.min(u.max, u.hp + fl(u.max * 30 / 100)); }
    u.shield = u.m.shieldStart || 0; u.shieldPeak = u.shield; u.cds = {}; u.charges = u.sh.devCharges; u.phase = u.m.phase ? 1 : 0; u.ap = 2;
    u.bleed = u.poison = u.root = u.stun = u.mark = u.rip = u.taunt = u.regenT = u.burn = u.lit = 0; u.moved = false; u.freeUsed = false; u.killRef = false; u.critRef = false; u.last = null; u.streak = 0; u.wrath = 0; u.usedStub = false;
  });
  const spot = (minX) => { for (let i = 0; i < 200; i++) { const x = r.range(minX, W - 1), y = r.int(H); if (free(st, x, y)) return [x, y]; } for (let x = W - 1; x >= 0; x--) for (let y = 0; y < H; y++) if (free(st, x, y)) return [x, y]; return null; };
  // encounter
  let etype = type; if (last) etype = sp.type === 'pursue' ? 'boss' : sp.type === 'recover' ? 'elite' : 'standard';
  const tpl = r.pick(ENC[reg][etype]).map(a => a.slice());
  if (sp.intro && st.roomIdx === 0) { tpl.length = 0; tpl.push(['thornling', 2], ['mossback', 1]); }
  if (st.tier >= 3 && etype !== 'boss') tpl[0][1]++;
  if (st.tier >= 4 && etype === 'boss') tpl[1][1]++;
  if (sp.mods.hunt && etype !== 'elite' && etype !== 'boss') tpl.push([D.REGIONS[reg].elite, 1]);
  if (sp.type === 'observe' && (last || etype === 'quiet')) tpl.push([D.REGIONS[reg].observe, last ? 3 : 1]);
  // the hall has residents that have nothing to do with you
  if (etype !== 'boss' && !(sp.intro && st.roomIdx === 0)) for (const k of AMBIENT[reg] || []) if (!tpl.some(t => t[0] === k) && r.pct(75)) tpl.push([k, 1]);
  for (const [kind, n] of tpl) for (let i = 0; i < n; i++) { const p = spot(D.SPECIES[kind].boss ? 9 : 5); if (p) spawn(st, kind, p[0], p[1], r, ev, true); }
  if (sp.sight && st.roomIdx === 0 && !sp.intro) { const p = spot(6); if (p) { const u = spawn(st, sp.sight.kind, p[0], p[1], r, ev, true, sp.sight.variant); u.sight = true; } } // today's sighting: one marked animal in the first hall
  // props
  const addProp = (kind, id, o = {}) => { const p = spot(2); if (p) room.props.push({ pid: room.pid++, kind, id, x: p[0], y: p[1], ...o }); };
  let nf = type === 'quiet' ? 3 : r.int(3); if (sp.type === 'harvest') nf += last ? 2 : 1; if (sp.intro && st.roomIdx === 0) nf = 0;
  const fl0 = D.REGIONS[reg].flora;
  for (let i = 0; i < nf; i++) { let id = r.pick(fl0); if (id === 'mirror_reed' && !r.pct(35)) id = fl0[0]; addProp('flora', id, id === 'snare_vine' ? { walk: true } : {}); }
  if (sp.intro && st.roomIdx === 0) addProp('flora', 'lantern_moss');
  if (last && sp.type === 'recover') { let best = null; for (let x = W - 1; x >= 5 && !best; x--) for (let y = 0; y < H; y++) if (free(st, x, y)) { best = [x, y]; break; } if (best) room.props.push({ pid: room.pid++, kind: 'cache', id: 'cache', x: best[0], y: best[1], obj: true }); }
  else if (r.pct(type === 'quiet' ? 60 : 25)) addProp('cache', 'cache');
  const wch = (sp.intro && st.roomIdx === 1) ? 100 : type === 'quiet' ? 30 : sp.mods.bloom ? 40 : 10;
  // things in the hall that can be worked: spore caps, a lamp, an old specimen case
  if (!(sp.intro && st.roomIdx === 0)) { const nb = r.range(1, 2); for (let i = 0; i < nb; i++) addProp('fixture', 'bellcap'); addProp('fixture', 'lamp'); if (r.pct(60)) addProp('fixture', 'case'); }
  if (r.pct(wch)) { const id = sp.intro ? 'pocket_sun' : r.pick(D.REGIONS[reg].wonders); room.wonder = id; addProp('wonder', id); }
  if (!(sp.intro && st.roomIdx === 0) && etype !== 'boss' && r.pct(type === 'quiet' ? 70 : 45)) addChest(st, r, r.pick(['plates', 'light', 'breath']));
  // nothing placed in the hall may wall part of it off
  for (let guard = 0; guard < 12; guard++) { const seen = new Set([K(0, 3)]), q = [[0, 3]]; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, k = K(nx, ny); if (inb(nx, ny) && !seen.has(k) && !solid(st, nx, ny)) { seen.add(k); q.push([nx, ny]); } } }
    let open = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(st, x, y)) open++;
    if (seen.size >= open) break; const fxs = room.props.filter(p => (p.kind === 'fixture' || p.kind === 'chest') && !p.done); if (!fxs.length) break; fxs[fxs.length - 1].done = true; }
  ev.push({ e: 'room', idx: st.roomIdx, type });
}
function spawn(st, kind, x, y, r, ev, natural, force) {
  const S = D.SPECIES[kind]; const hs = fl(tierScale(st.tier, 45) * (S.boss ? 150 : 140) / 100), ds = tierScale(st.tier, 36);
  const u = { id: st.uid++, side: 'c', kind, name: S.name, ai: S.ai, x, y, max: fl(S.hp * hs / 100), dmg: [fl(S.dmg[0] * ds / 100), fl(S.dmg[1] * ds / 100)], armor: S.armor + fl((st.tier - 1) / 2), move: S.move, range: S.range,
    mood: natural || MOOD0[S.ai] !== 'roam' ? MOOD0[S.ai] : 'hostile', hunter: MOOD0[S.ai] === 'roam' || MOOD0[S.ai] === 'hostile', home: { x, y }, shield: 0, studied: 0, tc: 0, bleed: 0, poison: 0, mark: 0, root: 0, stun: 0, calm: 0, echo: 0 };
  if (natural && !S.boss && (force || r.pct(Math.min(40, 5 * (100 + (st.spec.variantBoost || 0)) / 100)))) {
    u.variant = force || r.pick(['pale', 'gilded', 'overgrown']);
    if (u.variant === 'overgrown') { u.max = fl(u.max * 150 / 100); u.dmg = [fl(u.dmg[0] * 130 / 100), fl(u.dmg[1] * 130 / 100)]; }
    st.res.variants[kind + ':' + u.variant] = 1;
  }
  u.hp = u.max; st.units.push(u); st.res.seen[kind] = 1; if (ev && !natural) ev.push({ e: 'spawn', id: u.id });
  return u;
}
function summon(st, owner, kind, x, y, ev) {
  const ts = tierScale(st.tier), pw = abilPow(owner);
  const base = { id: st.uid++, side: 'a', kind, owner: owner.id, x, y, armor: 0, shield: 0, bleed: 0, poison: 0, mark: 0, root: 0, stun: 0, m: {}, fx: {} };
  let u;
  if (kind === 'drone') u = { ...base, name: 'Drone', max: fl(8 * ts / 100), dmg: [fl(3 * ts * pw / 10000 * (owner.fx.s_dronewright ? 150 : 100) / 100), fl(5 * ts * pw / 10000 * (owner.fx.s_dronewright ? 150 : 100) / 100)], range: 4, move: 0, turns: owner.fx.s_dronewright ? 99 : 3, chain: !!owner.fx.res_chain_reaction };
  else if (kind === 'lure') u = { ...base, name: 'Lure Pod', max: fl(10 * ts / 100), dmg: [0, 0], range: 0, move: 0, turns: 2 };
  else u = { ...base, name: 'Thornling', kind: 'thornling', max: fl(10 * ts / 100), dmg: [fl(3 * ts / 100), fl(5 * ts / 100)], range: 1, move: 3, turns: 2 };
  u.hp = u.max; st.units.push(u); ev.push({ e: 'spawn', id: u.id }); return u;
}

// --- geometry
function reach(st, u, steps) {
  const dist = new Map([[K(u.x, u.y), 0]]), par = new Map(), q = [[u.x, u.y]];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; const d = dist.get(K(x, y)); if (d >= steps) continue;
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy, k = K(nx, ny); if (!inb(nx, ny) || dist.has(k) || !free(st, nx, ny)) continue; dist.set(k, d + 1); par.set(k, K(x, y)); q.push([nx, ny]); } }
  return { dist, par };
}
function pathFrom(par, x, y) { const p = []; let k = K(x, y); while (par.has(k)) { p.unshift([k % W, fl(k / W)]); k = par.get(k); } return p; }
function field(st, tx, ty) { // walking distance to target, ignoring units
  const f = new Array(W * H).fill(99); f[K(tx, ty)] = 0; const q = [[tx, ty]];
  for (let i = 0; i < q.length; i++) { const [x, y] = q[i]; for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && f[K(nx, ny)] === 99 && !solid(st, nx, ny)) { f[K(nx, ny)] = f[K(x, y)] + 1; q.push([nx, ny]); } } }
  return f;
}
export function moveTiles(st, u) { if (u.root > 0 && !u.fx.anchor) return new Map(); return reach(st, u, moveRange(st, u)).dist; }
function moveRange(st, u) { return u.move + (st.room.wonder === 'remembering_room' ? 1 : 0); }
export function weaponRange(st, u) { return u.sh.w.range + (st.room.wonder === 'upside_pool' && u.sh.w.range > 1 ? 1 : 0); }

// --- damage
function abilPow(u) { return 100 + 3 * u.sh.attr.insight + (u.m.abil || 0) + (u.fx.overload ? 40 : 0); }
function heal(st, u, n, ev, fromOther) {
  if (u.dead || n <= 0) return 0;
  if (fromOther && u.fx.second_heart) n = fl(n * 85 / 100); if (fromOther && u.fx.gambler) n = fl(n * 80 / 100);
  const g = Math.min(n, u.max - u.hp); u.hp += g;
  if (u.fx && u.fx.res_living_bastion && n > 0) { u.shield += fl(n / 2); u.shieldPeak = Math.max(u.shieldPeak || 0, u.shield); }
  if (g > 0 || n > 0) ev.push({ e: 'heal', id: u.id, n: g }); return g;
}
function auraArmor(st, t) { if (t.side !== 's') return 0; return seekers(st).some(o => o !== t && alive(o) && o.fx.anchor && md(o, t) === 1) ? 2 : 0; }
function hurt(st, src, t, amt, ev, o = {}) {
  if (!alive(t) || amt <= 0) return 0;
  if (!o.dot) {
    amt = Math.max(1, amt - Math.max(0, t.armor + auraArmor(st, t) - (o.pierce || 0)));
    if (t.side === 's' && t.fx.a_vanguard) amt = Math.max(1, amt - 1);
    if (t.side === 's' && t.fx.a_firebrand) amt += 1; // plate over a furnace: the Firebrand hits hardest and breaks first
    if (t.phase) { t.phase = 0; ev.push({ e: 'text', id: t.id, msg: 'Passes through' }); return 0; }
    if (t.shield > 0) { const a = Math.min(t.shield, amt); t.shield -= a; amt -= a; ev.push({ e: 'shield', id: t.id, n: a });
      if (t.shield === 0 && t.fx && t.fx.res_rebound) { const v = t.shieldPeak || a; for (const c of creatures(st)) if (md(c, t) === 1) hurt(st, t, c, v, ev, { dot: true }); t.shieldPeak = 0; }
      if (amt <= 0) { provoke(st, src, t); return a; } }
  }
  t.hp -= amt; if (t.side === 's') { st.res.dmgTaken += amt; if (t.fx.s_retaliator) t.wrath = Math.min(45, (t.wrath || 0) + 15); }
  ev.push({ e: 'hit', from: src ? src.id : 0, id: t.id, n: amt, crit: !!o.crit, dot: o.dot ? (o.kind || 'dot') : null, k: o.dot ? null : (o.kind || null), eff: o.eff || null });
  provoke(st, src, t);
  if (t.hp <= 0) kill(st, src, t, ev);
  return amt;
}
function provoke(st, src, t) {
  if (t.side !== 'c') return; t.calm = 0; const beast = src && src.side === 'c';
  if (t.mood === 'roam' && !beast) t.mood = 'hostile';
  if (t.ai === 'grazer') { t.mood = 'hostile'; t.grudge = beast ? src.id : 0; }
  if (t.ai === 'mender') t.mood = 'flee';
  if (t.ai === 'sentinel' && src) { t.mood = 'hostile'; t.grudge = src.side === 'c' ? src.id : 0; }
  if (D.SPECIES[t.kind].prey && src) for (const w of creatures(st)) if (w.ai === 'sentinel' && w !== src) { w.mood = 'hostile'; w.grudge = src.side === 'c' ? src.id : 0; w.calm = 0; }
}
function kill(st, src, t, ev) {
  if (t.side === 's') {
    if (t.fx.t_stubborn && !t.usedStub) { t.usedStub = true; t.hp = 1; ev.push({ e: 'text', id: t.id, msg: 'Stubborn' }); return; }
    if (t.fx.second_heart && !st.heartUsed) { st.heartUsed = true; t.hp = fl(t.max * 30 / 100); ev.push({ e: 'text', id: t.id, msg: 'The Second Heart beats' }); return; }
    t.hp = 0; t.dead = true; ev.push({ e: 'down', id: t.id }); return;
  }
  if (t.side === 'a') { t.dead = true; ev.push({ e: 'die', id: t.id }); return; }
  if (st.room.wonder === 'growing_fossil' && !st.room.firstDeath) { st.room.firstDeath = true; t.hp = fl(t.max / 2); ev.push({ e: 'text', id: t.id, msg: 'Gets back up' }); return; }
  st.room.firstDeath = true; t.dead = true; t.hp = 0; ev.push({ e: 'die', id: t.id });
  for (const w of st.units) if (w.grudge === t.id) { w.grudge = 0; if (w.ai === 'sentinel' || w.ai === 'grazer') w.mood = 'docile'; }
  const S = D.SPECIES[t.kind]; const bled = t.bleed > 0, hadPoison = t.poison;
  st.res.kills[t.kind] = (st.res.kills[t.kind] || 0) + 1; st.res.samples[t.kind] = (st.res.samples[t.kind] || 0) + 1;
  if (!t.noLoot) st.res.xp += S.boss ? 75 : S.elite ? 35 : 8;
  if (S.boss) { st.res.bossDown = true; st.res.cases.push('boss'); } else if (S.elite) st.res.cases.push('elite');
  if (t.kind === D.REGIONS[st.spec.region].observe && st.spec.type === 'observe' && !(src && src.side === 'c')) st.res.obsKilled = true; // a predator taking one is not on you
  const corpse = { x: t.x, y: t.y, mat: S.mat, n: (t.variant === 'gilded' ? 2 : 1) };
  const k = src && src.side === 'a' ? st.units.find(u => u.id === src.owner) : src;
  if (k && k.side === 's') {
    if (bled && k.fx.res_red_harvest) corpse.n++;
    if (k.fx.killrefund && !k.killRef && alive(k)) { k.killRef = true; k.ap++; ev.push({ e: 'text', id: k.id, msg: '+1 action' }); }
    if (k.m.killHeal) heal(st, k, k.m.killHeal, ev);
    k.killN++; if (k.fx.swarm && k.killN % 3 === 0 && !solid(st, t.x, t.y)) summon(st, k, 'thornling', t.x, t.y, ev);
    if (k.fx.deathspore) for (const c of creatures(st)) if (md(c, t) === 1) { c.poison += 2; c.poisonPot = Math.max(c.poisonPot || 0, poisonPot(k)); ev.push({ e: 'status', id: c.id, s: 'poison' }); }
    if (k.fx.s_toxicologist && hadPoison > 0) { const n = creatures(st).filter(c => md(c, t) === 1)[0]; if (n) { n.poison += hadPoison; n.poisonPot = Math.max(n.poisonPot || 0, poisonPot(k)); ev.push({ e: 'status', id: n.id, s: 'poison' }); } }
  }
  if (bled && seekers(st).some(s => s.fx.res_bloodgarden)) for (const c of creatures(st)) if (md(c, t) === 1) { c.bleed = Math.max(c.bleed, 2); c.bleedD = Math.max(c.bleedD || 0, 2 * st.tier); ev.push({ e: 'status', id: c.id, s: 'bleed' }); }
  if (!t.noLoot) { if (!unitAt(st, t.x, t.y)) st.room.corpses.push(corpse); else addMat(st, corpse.mat, corpse.n, null); }
  if (t.kind === 'mite') { const v = fl(3 * tierScale(st.tier) / 100); for (const o of st.units.filter(u => alive(u) && md(u, t) === 1)) hurt(st, null, o, v, ev, { dot: true, kind: 'spark' }); }
}
function addMat(st, mat, n, by) { let y = 0; for (const s of seekers(st)) y = Math.max(y, s.m.yield || 0); const tot = n * (100 + y); let k = fl(tot / 100); if (R(st).int(100) < tot % 100) k++; st.res.mats[mat] = (st.res.mats[mat] || 0) + k; }
function poisonPot(u) { return (u.m.poisonPot || 0) + (u.fx.s_toxicologist ? 50 : 0) + 4 * u.sh.attr.adaptation; }
function push(st, t, dx, dy, n, ev, src, bonus) {
  const S = t.side === 'c' ? D.SPECIES[t.kind] : null; if ((S && (S.boss || S.move === 0)) || (t.fx && t.fx.anchor)) return;
  for (let i = 0; i < n; i++) { const nx = t.x + dx, ny = t.y + dy;
    if (free(st, nx, ny)) { t.x = nx; t.y = ny; ev.push({ e: 'move', id: t.id, path: [[nx, ny]], shove: true }); stepOn(st, t, ev); if (!alive(t)) return; }
    else { if (bonus) { const o = unitAt(st, nx, ny); hurt(st, src, t, bonus, ev, { dot: true, kind: 'slam' }); if (o && o.side === 'c') hurt(st, src, o, bonus, ev, { dot: true, kind: 'slam' }); } return; } }
}
function stepOn(st, u, ev) {
  const p = st.room.props.find(p => !p.done && p.walk && p.x === u.x && p.y === u.y);
  if (p) { p.done = true; if (!(u.fx && u.fx.anchor)) u.root = Math.max(u.root, 1); st.res.flora[p.id] = (st.res.flora[p.id] || 0) + 1; ev.push({ e: 'text', id: u.id, msg: 'Snared' }, { e: 'prop', pid: p.pid }); return true; }
  if (u.side === 'c') { const i = st.room.traps.findIndex(t => t.x === u.x && t.y === u.y); if (i >= 0) { const t = st.room.traps[i]; st.room.traps.splice(i, 1); ev.push({ e: 'trap', x: u.x, y: u.y }); u.root = 2; if (t.bleed) { u.bleed = 3; u.bleedD = 2 * st.tier; } hurt(st, st.units.find(o => o.id === t.owner), u, t.dmg, ev, { dot: true, kind: 'trap' }); return true; } }
  return false;
}
function walk(st, u, path, ev) { const done = [], tmp = []; for (const [x, y] of path) { u.x = x; u.y = y; done.push([x, y]); if (stepOn(st, u, tmp)) break; } if (done.length) ev.push({ e: 'move', id: u.id, path: done }); ev.push(...tmp); }

// seeker strike with weapon
function strike(st, u, t, ev, o = {}) {
  const r = R(st); const w = u.sh.w; const m = u.m, fx = u.fx; let roll = r.range(w.min, w.max); if (fx.gambler) roll = Math.max(roll, r.range(w.min, w.max));
  let pct = 100 + 3 * u.sh.attr[w.scale] + (m.dmgPct || 0);
  if (o.abil) pct += abilPow(u) - 100;
  if (t.hp * 2 < t.max) pct += m.vsWounded || 0;
  if (t.hp === t.max) pct += m.vsFull || 0;
  if (t.mark > 0) pct += m.vsMarked || 0;
  if (u.last !== null && u.last !== t.id) pct += m.switchTarget || 0;
  if (u.last === t.id) { u.streak = Math.min(3, u.streak + 1); pct += (m.sameTarget || 0) * u.streak; } else u.streak = 0;
  if (fx.t_patient && !u.moved) pct += 20;
  if (fx.t_nerves && u.hp * 100 < u.max * 40) pct += 25;
  if (fx.t_packmate && t.hitBy && t.hitBy !== u.id) pct += 15;
  if (fx.knowledge && t.side === 'c') pct += 5 * ((st.spec.stages[t.kind] || 0) + 1);
  if (t.side === 'c' && (st.spec.stages[t.kind] || 0) >= 2) pct += 10;
  if (t.side === 'c' && t.studied) pct += 10 * t.studied; // every field note on this animal is a place to hit it
  if (fx.hungry_compass) pct += 6 * Object.keys(st.res.seen).length;
  if (fx.glass) pct += 35;
  if (u.wrath) { pct += u.wrath; u.wrath = 0; }
  let dmg = fl(roll * pct / 100 * (o.mult || 100) / 100);
  if (fx.res_galvanic_rot && t.poison) dmg += 2 * t.poison;
  let cc = u.sh.crit + (fx.a_tracker && t.hp === t.max ? 10 : 0) + (fx.s_cutthroat && t.burn > 0 ? 15 : 0);
  const crit = o.crit || (fx.bloodscent && t.bleed > 0) || r.int(100) < cc;
  if (crit) dmg = fl(dmg * (150 + (m.critDmg || 0)) / 100);
  if (t.mark > 0) dmg = fl(dmg * 125 / 100);
  u.last = t.id; const wasMarked = t.mark > 0; const tx = t.x, ty = t.y;
  // what the weapon is made of matters: each species is weak to one family and shrugs off another
  let eff = null; const TS = t.side === 'c' ? D.SPECIES[t.kind] : null; if (TS && w.fam) { if (TS.weak === w.fam) { dmg = fl(dmg * 135 / 100); eff = 'weak'; } else if (TS.resist === w.fam) { dmg = fl(dmg * 70 / 100); eff = 'resist'; } }
  const dealt = hurt(st, u, t, dmg, ev, { pierce: m.pierce || 0, crit, eff }); t.hitBy = t.hitBy || u.id;
  if (crit && fx.s_marksman && !u.critRef) { u.critRef = true; u.ap++; ev.push({ e: 'text', id: u.id, msg: '+1 action' }); }
  if (alive(t)) {
    if (m.bleedHit && r.int(100) < m.bleedHit) { t.bleed = 3 + (m.bleedDur || 0); t.bleedD = Math.max(t.bleedD || 0, 2 * st.tier + fl(u.sh.attr.adaptation / 3)); ev.push({ e: 'status', id: t.id, s: 'bleed' }); }
    if (m.poisonHit) { t.poison += m.poisonHit; t.poisonPot = Math.max(t.poisonPot || 0, poisonPot(u)); ev.push({ e: 'status', id: t.id, s: 'poison' }); }
    if (m.echo && dealt > 0) t.echo = (t.echo || 0) + fl(dealt * m.echo / 100);
    if (u.lit > 0) ignite(st, u, t, ev);
    if (crit && fx.res_displaced_fate) { const dx = Math.sign(t.x - u.x), dy = Math.sign(t.y - u.y); push(st, t, Math.abs(dx) >= Math.abs(dy) && dx ? dx : 0, Math.abs(dx) >= Math.abs(dy) && dx ? 0 : dy || 1, 1, ev, u, 0); }
    if (fx.res_field_notes && wasMarked) gainStudy(st, u, t, 1, ev);
  }
  if (m.leech && t.bleed > 0) heal(st, u, m.leech, ev);
  if (m.chain && !o.noChain && dealt > 0) { const n = creatures(st).filter(c => c !== t && Math.abs(c.x - tx) + Math.abs(c.y - ty) === 1)[0]; if (n) hurt(st, u, n, Math.max(1, fl(dealt * m.chain / 100)), ev, { dot: true, kind: 'arc' }); }
  if (fx.a_firebrand && !o.off && alive(t)) strike(st, u, t, ev, { off: true, noChain: true, mult: fx.s_cutthroat ? 70 : 40 }); // the dagger, a beat behind the sword
  return dealt;
}
// Burning: a fixed amount each turn for a few turns. A fresh flame replaces an older, weaker one.
function ignite(st, u, t, ev) { if (!alive(t)) return; t.burn = Math.max(t.burn || 0, 2 + (u.fx.s_pyre ? 1 : 0)); t.burnD = Math.max(t.burnD || 0, fl((1 + st.tier + fl(u.sh.attr.insight / 3)) * (u.fx.s_pyre ? 150 : 100) / 100)); ev.push({ e: 'status', id: t.id, s: 'burn' }); }
function gainStudy(st, u, t, pts, ev) {
  const cap = t.variant ? 5 : 3; const g = Math.min(pts, cap - t.studied); if (g <= 0) return 0;
  t.studied += g; st.res.study[t.kind] = (st.res.study[t.kind] || 0) + g; st.res.xp += 2 * g;
  ev.push({ e: 'study', id: t.id, by: u.id, n: g, left: cap - t.studied }); return g;
}
export function studyValue(st, u) { let p = 1 + (u.m.study || 0) + (u.fx.t_curious ? 1 : 0); if (st.room.props.some(q => !q.done && q.id === 'lantern_moss' && md(q, u) <= 2)) p++; return p; }
export function isHostile(st, c) {
  if (c.side !== 'c' || !alive(c) || c.calm > 0) return false;
  if (c.mood === 'hostile') return !(c.grudge && st.units.some(u => u.id === c.grudge && u.side === 'c' && alive(u)));
  if (c.ai === 'ambush') return seekers(st).some(s => alive(s) && md(s, c) <= 3);
  return false;
}
export function canAdvance(st) { return !st.outcome && !creatures(st).some(c => isHostile(st, c)); }

// ---------------------------------------------------------------- creature AI
function targetsOf(st, c) {
  if (c.grudge) { const g = st.units.find(u => u.id === c.grudge && alive(u)); if (g) return [g]; if (c.ai === 'sentinel') return []; }
  let t = friends(st);
  if (D.SPECIES[c.kind] && D.SPECIES[c.kind].hunts) t = t.concat(creatures(st).filter(o => D.SPECIES[o.kind].prey));
  return t;
}
function pickTarget(st, c, ts) {
  if (!ts.length) return null; const S = D.SPECIES[c.kind] || {};
  if (!S.boss) { const lure = ts.filter(t => t.kind === 'lure' && md(t, c) <= 6)[0]; if (lure) return lure; }
  const taunt = ts.filter(t => t.taunt > 0 && md(t, c) === 1)[0]; if (taunt) return taunt;
  const f = field(st, c.x, c.y); let best = null, bs = 1e9;
  for (const t of ts) { let s = Math.min(...DIRS.map(([dx, dy]) => inb(t.x + dx, t.y + dy) ? f[K(t.x + dx, t.y + dy)] : 99)) * 10;
    if (c.ai === 'predator') { if (t.bleed > 0) s -= 40; if (!friends(st).some(o => o !== t && md(o, t) === 1)) s -= 30; if (t.side === 'c') s -= 15; }
    s += t.id / 100; if (s < bs) { bs = s; best = t; } }
  return best;
}
function approach(st, c, t) { // returns tile to move to (or null) so that t is in range if possible
  if (md(c, t) <= c.range) return null; if (c.move === 0 || c.root > 0) return null;
  const { dist, par } = reach(st, c, moveRange(st, c)); const f = field(st, t.x, t.y); let best = null, bs = f[K(c.x, c.y)] * 10 + 5;
  for (const [k, d] of dist) { if (!d) continue; const x = k % W, y = fl(k / W); const inR = Math.abs(x - t.x) + Math.abs(y - t.y) <= c.range; const s = (inR ? 0 : f[k] * 10) + d / 10 + k / 1000; if (s < bs) { bs = s; best = [x, y]; } }
  return best ? { to: best, path: pathFrom(par, best[0], best[1]) } : null;
}
// plan: what this creature will do if the turn ended now. Used for both the intent display and execution.
export function plan(st, c) {
  if (c.stun > 0) return { label: 'Stunned', k: 'idle' };
  if (c.calm > 0) return { label: 'Calmed', k: 'idle' };
  const S = D.SPECIES[c.kind]; const sk = seekers(st).filter(alive);
  if (c.side === 'a') {
    if (c.kind === 'drone') { const t = creatures(st).filter(o => isHostile(st, o) && md(o, c) <= c.range).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0]; return t ? { k: 'atk', tgt: t.id, label: 'Firing' } : { k: 'idle', label: 'Scanning' }; }
    if (c.kind === 'lure') return { k: 'idle', label: 'Lure' };
    const t = pickTarget(st, c, creatures(st).filter(o => isHostile(st, o))); if (!t) return { k: 'idle', label: 'Waiting' };
    return { k: 'atk', tgt: t.id, mv: approach(st, c, t), label: 'Hunting' };
  }
  const lampOn = (c.mood === 'roam' || (c.ai === 'skittish' && !sk.some(s => md(s, c) <= 3))) && !S.boss ? st.room.props.filter(p => !p.done && p.lit && md(p, c) <= 8).sort((a, b) => md(a, c) - md(b, c) || a.pid - b.pid)[0] : null;
  if (lampOn) return { k: 'idle', mv: stepToward(st, c, lampOn, 2, 1), label: md(lampOn, c) <= 1 ? 'Held by the light' : 'Drawn to the light' };
  if (c.ai === 'skittish') {
    const near = sk.filter(s => md(s, c) <= 3);
    if (c.hp * 2 <= c.max && c.hp < c.max && !(c.bleed > 0 || c.mauled)) return { k: 'flee', label: 'Bolting' };
    if ((c.bleed > 0 || c.mauled) && c.hp < c.max) { const hunter = creatures(st).filter(o => o !== c && (D.SPECIES[o.kind].ai === 'predator' || D.SPECIES[o.kind].hunts)).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0]; // too hurt to clear the hall: it drags itself away from whatever bit it
      const away = hunter && c.root <= 0 ? DIRS.map(o => [c.x + o[0], c.y + o[1]]).filter(([x, y]) => free(st, x, y)).sort((p, q) => (Math.abs(q[0] - hunter.x) + Math.abs(q[1] - hunter.y)) - (Math.abs(p[0] - hunter.x) + Math.abs(p[1] - hunter.y)))[0] : null;
      return away ? { k: 'idle', mv: { to: away, path: [away] }, label: 'Hurt, dragging itself away' } : { k: 'idle', label: 'Hurt, cornered' }; }
    if (!near.length) { const o = DIRS[(c.id + st.turn) % 4]; const x = c.x + o[0], y = c.y + o[1]; return free(st, x, y) && c.root <= 0 ? { k: 'idle', mv: { to: [x, y], path: [[x, y]] }, label: 'Wary' } : { k: 'idle', label: 'Wary' }; }
    const { dist, par } = reach(st, c, moveRange(st, c)); const score = (x, y) => Math.min(...sk.map(s => Math.abs(s.x - x) + Math.abs(s.y - y)));
    let best = null, bs = score(c.x, c.y);
    for (const [k] of dist) { const x = k % W, y = fl(k / W); const s = score(x, y); if (s > bs) { bs = s; best = [x, y]; } }
    if (best && c.root <= 0) return { k: 'idle', mv: { to: best, path: pathFrom(par, best[0], best[1]) }, label: 'Keeping away' };
    const adj = near.filter(s => md(s, c) === 1)[0]; if (adj) return { k: 'atk', tgt: adj.id, label: 'Cornered' };
    return { k: 'idle', label: 'Wary' };
  }
  if (c.ai === 'grazer' && c.mood === 'docile') { const fl0 = st.room.props.filter(p => !p.done && p.kind === 'flora').sort((a, b) => md(a, c) - md(b, c) || a.pid - b.pid)[0];
    if (fl0 && md(fl0, c) <= 1) return { k: 'idle', graze: fl0.pid, label: 'Grazing' };
    return { k: 'idle', mv: (c.id + st.turn) % 2 ? stepToward(st, c, fl0 || c.home, 1) : null, label: fl0 ? 'Ambling to graze' : 'Grazing' }; }
  if (c.ai === 'mender') {
    if (c.mood === 'flee') return { k: 'flee', label: 'Fleeing' };
    const t = creatures(st).filter(o => o !== c && D.SPECIES[o.kind].mech && o.hp < o.max && md(o, c) <= 4).sort((a, b) => (a.hp / a.max) - (b.hp / b.max) || a.id - b.id)[0];
    return t ? { k: 'heal', tgt: t.id, label: 'Repairing' } : { k: 'idle', label: 'Tending' };
  }
  if (c.ai === 'sentinel' && c.mood === 'docile') return { k: 'idle', label: 'Standing guard' };
  if (c.ai === 'ambush') {
    const t = sk.filter(s => md(s, c) <= 3).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0]; if (!t) return { k: 'idle', label: 'Waiting' };
    if (md(t, c) === 1) return { k: 'atk', tgt: t.id, label: 'Biting' };
    return { k: 'pull', tgt: t.id, label: 'Reaching' };
  }
  if (c.ai === 'scavenger' && st.room.corpses.length) {
    const cs = st.room.corpses.map((o, i) => ({ o, i, d: md(o, c) })).sort((a, b) => a.d - b.d || a.i - b.i)[0];
    if (cs.d <= 1) return { k: 'eat', ci: cs.i, label: 'Feeding' };
    const mv = approach(st, { ...c, range: 1 }, cs.o); return { k: 'eat', ci: cs.i, mv, label: 'Going to feed' };
  }
  if (c.ai === 'boss_orchard') {
    const n = c.tc + 1;
    if (n % 3 === 0) return { k: 'seed', label: 'Dropping brood' };
    const t = pickTarget(st, c, friends(st)); const far = sk.slice().sort((a, b) => md(b, c) - md(a, c) || a.id - b.id)[0];
    return { k: 'atk', tgt: t ? t.id : 0, mv: t ? approach(st, c, t) : null, root: n % 3 === 1 && far && md(far, c) > 1 ? far.id : 0, label: n % 3 === 1 ? 'Rooting' : 'Advancing' };
  }
  if (c.ai === 'boss_regulator') {
    const t = pickTarget(st, c, friends(st));
    if (c.tele) return { k: 'purge', tgt: t ? t.id : 0, mv: t ? approach(st, c, t) : null, label: 'Purging the line' };
    let best = null, bn = -1; const near = sk.slice().sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0];
    for (let y = 0; y < H; y++) { const n = sk.filter(s => s.y === y).length * 10 + (near && near.y === y ? 1 : 0); if (n > bn) { bn = n; best = { axis: 'row', i: y }; } }
    for (let x = 0; x < W; x++) { const n = sk.filter(s => s.x === x).length * 10; if (n > bn) { bn = n; best = { axis: 'col', i: x }; } }
    return { k: 'tele', line: best, tgt: t ? t.id : 0, mv: t ? approach(st, c, t) : null, label: 'Marking a line' };
  }
  if (c.mood === 'roam') {
    if (c.ai === 'predator' || S.hunts) { const prey = creatures(st).filter(o => o !== c && D.SPECIES[o.kind].prey && md(o, c) <= 8).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0]; if (prey) return { k: 'atk', tgt: prey.id, mv: approach(st, c, prey), prey: true, label: 'Stalking the ' + D.SPECIES[prey.kind].name }; }
    const way = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]][(c.id * 5 + fl(st.turn / 2) * 3 + st.roomIdx) % 8]; const lead = c.ai === 'pack' ? creatures(st).filter(o => o.kind === c.kind && o.mood === 'roam').sort((a, b) => a.id - b.id)[0] : c;
    const goal = lead && lead !== c ? lead : { x: Math.max(4, Math.min(W - 1, c.home.x + way[0] * 3)), y: Math.max(0, Math.min(H - 1, c.home.y + way[1] * 2)) };
    return { k: 'idle', mv: stepToward(st, c, goal, 2, lead && lead !== c ? 1 : 0), label: c.ai === 'pack' ? 'Roaming' : c.ai === 'scavenger' ? 'Scenting the air' : 'Prowling' };
  }
  const t = pickTarget(st, c, targetsOf(st, c)); if (!t) return { k: 'idle', label: c.ai === 'sentinel' ? 'Standing guard' : 'Waiting' };
  return { k: 'atk', tgt: t.id, mv: approach(st, c, t), label: 'Hunting' };
}
// A short walk toward a place, for creatures going about their day.
function stepToward(st, c, goal, steps, stopAt = 0) {
  if (!goal || c.root > 0) return null; const d0 = Math.abs(c.x - goal.x) + Math.abs(c.y - goal.y); if (d0 <= stopAt) return null;
  const { dist, par } = reach(st, c, Math.min(steps, moveRange(st, c))); let best = null, bd = d0;
  for (const [k] of dist) { const x = k % W, y = fl(k / W); const d = Math.abs(x - goal.x) + Math.abs(y - goal.y); if (d < bd && d >= stopAt) { bd = d; best = [x, y]; } }
  return best ? { to: best, path: pathFrom(par, best[0], best[1]) } : null;
}
// The party sees something happen between residents and writes it down. Once per kind of event per room.
function witness(st, c, what, ev) {
  const seen = st.room.seenActs || (st.room.seenActs = {}); const key = c.kind + ':' + what; if (seen[key]) return;
  const w = seekers(st).filter(alive).sort((a, b) => md(a, c) - md(b, c) || a.id - b.id)[0]; if (!w || md(w, c) > (what === 'kill' || what === 'hunt' ? 10 : 7)) return; // a hunt is loud enough to follow from across the hall
  seen[key] = 1; st.res.study[c.kind] = (st.res.study[c.kind] || 0) + 2; st.res.xp += 4;
  ev.push({ e: 'text', id: c.id, msg: what === 'kill' ? 'Witnessed: a kill' : what === 'hunt' ? 'Witnessed: a hunt' : what === 'feed' ? 'Witnessed: feeding' : 'Witnessed: grazing' }, { e: 'study', id: c.id, by: w.id, n: 2, left: 0, seen: what });
}
// Anything still living its own life notices the party when they come close, and its kin take the alarm.
function notice(st, ev) {
  const sk = seekers(st).filter(alive); const woke = [];
  for (const c of creatures(st)) if (c.mood === 'roam' && c.calm <= 0 && sk.some(s => md(s, c) <= (st.room.props.some(p => !p.done && p.lit && md(p, c) <= 1) ? 1 : NOTICE[c.ai] || 2))) woke.push(c);
  for (let i = 0; i < woke.length; i++) { const c = woke[i]; if (c.mood !== 'roam') continue; c.mood = 'hostile'; ev.push({ e: 'text', id: c.id, msg: 'Notices you' });
    for (const o of creatures(st)) if (o.mood === 'roam' && o.kind === c.kind && md(o, c) <= 4) woke.push(o); }
}
function creatureAttack(st, c, t, ev) {
  const r = R(st); let dmg = r.range(c.dmg[0], c.dmg[1]);
  if (c.kind === 'thornling') dmg += 2 * st.units.filter(o => o !== c && alive(o) && o.kind === 'thornling' && o.side === c.side && md(o, t) === 1).length * tierScale(st.tier) / 100 | 0;
  if (dmg <= 0) return; const melee = md(c, t) === 1;
  hurt(st, c, t, dmg, ev, { melee });
  if (c.kind === 'hush' && alive(t)) { t.bleed = 3; t.bleedD = 2 * st.tier; ev.push({ e: 'status', id: t.id, s: 'bleed' }); }
  if (melee && alive(c) && t.m && t.m.thorns) hurt(st, t, c, t.m.thorns, ev, { dot: true, kind: 'thorns' });
  if (melee && alive(c) && alive(t) && t.rip > 0) strike(st, t, c, ev, { mult: t.fx.s_retaliator ? 160 : 100 });
}
function act(st, c, ev) {
  const p = plan(st, c); c.tc++;
  if (p.k === 'atk' && !(p.mv && p.mv.path.length)) { const t0 = st.units.find(u => u.id === p.tgt && alive(u)); if (!t0 || md(c, t0) > Math.max(1, c.range)) { c.stuck = (c.stuck || 0) + 1; if (c.stuck >= 3 && !D.SPECIES[c.kind].boss) { c.calm = 99; c.stuck = 0; ev.push({ e: 'text', id: c.id, msg: 'Loses the trail' }); return; } } else c.stuck = 0; } else c.stuck = 0;
  if (p.k === 'flee') { c.fled = true; ev.push({ e: 'flee', id: c.id }); return; }
  if (p.root) { const t = st.units.find(u => u.id === p.root); if (t && alive(t) && !t.fx.anchor) { t.root = 1; ev.push({ e: 'text', id: t.id, msg: 'Rooted' }, { e: 'status', id: t.id, s: 'root' }); } }
  if (p.mv && p.mv.path.length) { walk(st, c, p.mv.path, ev); if (!alive(c)) return; }
  const t = p.tgt ? st.units.find(u => u.id === p.tgt && alive(u)) : null;
  if (p.k === 'atk') { if (t && md(c, t) <= Math.max(1, c.range) && (c.ai !== 'ambush' || md(c, t) === 1)) { const beast = t.side === 'c'; creatureAttack(st, c, t, ev); if (beast && alive(t)) t.mauled = 1; if (beast && alive(c)) witness(st, c, alive(t) ? 'hunt' : 'kill', ev); } }
  else if (p.k === 'idle' && p.graze) witness(st, c, 'graze', ev);
  else if (p.k === 'pull') { if (t && !t.fx.anchor) { let best = null, bd = 99; for (const [dx, dy] of DIRS) { const x = c.x + dx, y = c.y + dy; if (free(st, x, y)) { const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd) { bd = d; best = [x, y]; } } } if (best) { t.x = best[0]; t.y = best[1]; ev.push({ e: 'move', id: t.id, path: [best], shove: true }, { e: 'text', id: t.id, msg: 'Dragged' }); } } }
  else if (p.k === 'eat') { const cp = st.room.corpses[p.ci]; if (cp && md(cp, c) <= 1) { st.room.corpses.splice(p.ci, 1); c.max += 4; c.hp = Math.min(c.max, c.hp + 10); c.dmg = [c.dmg[0] + 2, c.dmg[1] + 2]; ev.push({ e: 'eat', id: c.id, x: cp.x, y: cp.y }); witness(st, c, 'feed', ev); } }
  else if (p.k === 'heal') { if (t) heal(st, t, fl(6 * tierScale(st.tier) / 100), ev); }
  else if (p.k === 'seed') { const r = R(st); let n = 0; for (let i = 0; i < 40 && n < 2; i++) { const x = c.x + r.range(-2, 2), y = c.y + r.range(-2, 2); if (free(st, x, y)) { const u = spawn(st, 'thornling', x, y, r, ev, false); u.noLoot = true; n++; } } }
  else if (p.k === 'tele') { c.tele = p.line; ev.push({ e: 'tele', id: c.id, line: p.line }); if (t && md(c, t) === 1) creatureAttack(st, c, t, ev); }
  else if (p.k === 'purge') { const L = c.tele; c.tele = null; ev.push({ e: 'purge', line: L }); const d = fl(c.dmg[1] * 130 / 100); for (const o of st.units.filter(u => u !== c && alive(u) && (L.axis === 'row' ? u.y === L.i : u.x === L.i))) hurt(st, c, o, d, ev, {}); if (t && alive(t) && md(c, t) === 1) creatureAttack(st, c, t, ev); }
}
function tickUnit(st, u, ev) {
  if (!alive(u)) return;
  let reg = (u.m && u.m.regen || 0) + (st.room.wonder === 'pocket_sun' ? 2 : 0) + (u.variant === 'pale' ? 1 + st.tier : 0) + (u.regenT > 0 ? 2 + (u.side === 's' ? fl(u.sh.lvl / 3) : 0) : 0);
  if (reg && u.hp < u.max) heal(st, u, reg, ev);
  if (u.echo) { const e = u.echo; u.echo = 0; hurt(st, null, u, e, ev, { dot: true, kind: 'echo' }); if (!alive(u)) return; }
  if (u.poison > 0) { let d = fl(u.poison * (1 + st.tier) / 2 * (100 + (u.poisonPot || 0)) / 100); if (u.side === 'c' && friends(st).some(f => f.kind === 'lure') && seekers(st).some(s => s.fx.res_feeding_frenzy)) d *= 2; hurt(st, null, u, Math.max(1, d), ev, { dot: true, kind: 'poison' }); u.poison = Math.max(0, u.poison - (u.fx && u.fx.t_tissue ? 2 : 1)); if (!alive(u)) return; }
  if (u.burn > 0) { hurt(st, null, u, u.burnD || 2, ev, { dot: true, kind: 'burn' }); u.burn--; if (!alive(u)) return; }
  if (u.bleed > 0) { hurt(st, null, u, u.bleedD || 2, ev, { dot: true, kind: 'bleed' }); u.bleed = Math.max(0, u.bleed - (u.fx && u.fx.t_tissue ? 2 : 1)); }
}
function endPhase(units, keys = ['mark', 'root', 'stun', 'calm', 'regenT']) { for (const u of units) { for (const k of keys) if (u[k] > 0) u[k]--; } }
function endTurn(st, ev, free) {
  // allies
  for (const a of st.units.filter(u => u.side === 'a' && alive(u))) {
    const p = plan(st, a); if (p.mv && p.mv.path.length) walk(st, a, p.mv.path, ev);
    const t = p.tgt ? st.units.find(u => u.id === p.tgt && alive(u)) : null;
    if (p.k === 'atk' && t && md(a, t) <= Math.max(1, a.range)) { const d = R(st).range(a.dmg[0], a.dmg[1]); const tx = t.x, ty = t.y; hurt(st, a, t, d, ev, {});
      if (a.chain) { const n = creatures(st).filter(c => c !== t && Math.abs(c.x - tx) + Math.abs(c.y - ty) <= 1)[0]; if (n) hurt(st, a, n, Math.max(1, fl(d / 2)), ev, { dot: true, kind: 'arc' }); } }
    if (--a.turns <= 0) { a.dead = true; ev.push({ e: 'die', id: a.id, quiet: true }); }
  }
  endPhase(seekers(st));
  ev.push({ e: 'phase', who: 'c', free: !!free });
  for (const c of creatures(st)) tickUnit(st, c, ev);
  for (const c of st.units.filter(u => u.side === 'c')) { if (alive(c)) act(st, c, ev); if (!seekers(st).some(alive)) break; }
  endPhase(st.units.filter(u => u.side === 'c'));
  for (const c of st.units) if (c.side === 'c') c.hitBy = 0;
  endPhase(seekers(st), free ? ['rip', 'taunt'] : ['rip', 'taunt', 'lit']); // lit blades do not burn down while the hall is only being walked
  if (!seekers(st).some(alive)) { finish(st, 'defeat', ev); return; }
  st.turn++; if (!free) st.turns++; // beats spent exploring are not counted against the expedition
  ev.push({ e: 'phase', who: 's', free: !!free });
  const r = R(st);
  for (const u of seekers(st)) {
    if (!alive(u)) continue; tickUnit(st, u, ev); if (!alive(u)) continue;
    u.ap = u.stun > 0 ? 0 : 2; u.moved = false; u.freeUsed = false; u.freeStudy = false; u.killRef = false; u.critRef = false;
    for (const k in u.cds) u.cds[k] = Math.max(0, u.cds[k] - (st.room.wonder === 'counting_clock' ? 2 : 1));
    if (u.sh.dev === 'unfinished') u.devNow = r.pick(['lure', 'barrier', 'pulse', 'drone', 'blink', 'gravity']);
  }
  if (!seekers(st).some(alive)) finish(st, 'defeat', ev);
}
function finish(st, outcome, ev) {
  st.outcome = outcome; const rs = st.res, sp = st.spec;
  if (outcome === 'win') {
    rs.contractDone = sp.type === 'pursue' ? rs.bossDown : sp.type === 'observe' ? ((rs.study[D.REGIONS[sp.region].observe] || 0) >= 6 && !rs.obsKilled) : sp.type === 'harvest' ? rs.floraN >= 4 : rs.objCache;
    rs.xp += 60 + (rs.contractDone ? 30 : 0);
    if (rs.contractDone) rs.cases.push(sp.weekly ? 'weekly' : 'contract');
  }
  ev.push({ e: 'over', outcome });
}
export function devKind(u) { return u.sh.dev === 'unfinished' ? (u.devNow || 'pulse') : u.sh.dev; }
export const DEV_INFO = { lure: { range: 4, target: 'tile', ap: 1 }, barrier: { range: 3, target: 'ally', ap: 1 }, pulse: { range: 3, target: 'any', ap: 1 }, drone: { range: 2, target: 'tile', ap: 1 }, blink: { range: 5, target: 'tile', ap: 0 }, gravity: { range: 4, target: 'any', ap: 1 } };
export function abilCd(u, id) { return Math.max(1, D.ABILITIES[id].cd + (u.fx.overload ? 1 : 0) - (u.m.cdr || 0) - (id === 'snare' && u.fx.s_trapper ? 2 : 0)); }
export function abilRange(st, u, id) { const a = D.ABILITIES[id]; return a.range === 'weapon' ? weaponRange(st, u) : a.range; }

const bad = msg => { const e = new Error(msg); e.illegal = true; throw e; };
// Apply one player action. Throws on anything illegal. Returns the list of events for animation.
// While nothing is hunting the party there are no rounds: the hall moves one beat each time they do, and the others trail whoever leads.
// Rounds and action points only begin to matter when something turns on them.
export function exploring(st) { return !st.outcome && !creatures(st).some(c => isHostile(st, c)); }
function trail(st, leadId, ev) { const L = st.units.find(u => u.id === leadId); if (!L) return; const fld = field(st, L.x, L.y); // walking distance to the leader, so a follower goes round scenery instead of stopping behind it
  for (const u of seekers(st)) { if (u === L || !alive(u) || u.root > 0 || u.stun > 0 || md(u, L) <= 2) continue; const { dist, par } = reach(st, u, moveRange(st, u)); let best = null;
    for (const [k, d] of dist) { if (!d) continue; const f = fld[k], x = k % W, y = fl(k / W); if (f < 1) continue; if (!best || f < best.f || (f === best.f && d < best.d)) best = { x, y, f, d }; }
    if (best && best.f < fld[K(u.x, u.y)]) { const n = ev.length; walk(st, u, pathFrom(par, best.x, best.y), ev); for (let i = n; i < ev.length; i++) if (ev[i].e === 'move') ev[i].trail = true; } } }
export function apply(st, a) {
  const calm = exploring(st) && a.t !== 'end' && a.t !== 'next' && a.t !== 'abandon' && a.t !== 'wander';
  const ev = applyAction(st, a); if (!st.outcome) notice(st, ev);
  if (calm && a.t === 'move' && !a.solo && !st.outcome) { const quiet = exploring(st); trail(st, a.u, ev); if (quiet) notice(st, ev); } // the others still close up on the step that gets the party noticed, so a fight never starts with them strung out behind
  if (calm && exploring(st)) { endTurn(st, ev, true); if (!st.outcome) notice(st, ev); }
  return ev; }
function applyAction(st, a) {
  if (st.outcome) bad('The expedition is over.');
  const ev = [];
  if (a.t === 'abandon') { finish(st, 'retreat', ev); return ev; }
  if (a.t === 'end') { endTurn(st, ev); return ev; }
  if (a.t === 'wander') { const id = placeFor(st); if (!id) bad('There is nowhere to wander to from here.'); if (!exploring(st)) bad('Not while something is hunting you.'); enterSide(st, id, ev); return ev; }
  if (a.t === 'next') {
    if (!canAdvance(st)) bad('Something here is still hunting you.');
    if (st.side) { leaveSide(st, ev); return ev; }
    for (const c of st.room.corpses) addMat(st, c.mat, c.n);
    st.res.rooms++; st.res.xp += 15; if (st.room.type !== 'quiet' && !creatures(st).some(c => c.hunter && c.calm <= 0)) st.res.cases.push('standard');
    if (st.roomIdx >= 2) { finish(st, 'win', ev); return ev; }
    let type = 'standard'; if (st.roomIdx === 0) { if (a.c !== 0 && a.c !== 1) bad('Choose a path.'); type = a.c === 0 ? 'elite' : 'quiet'; }
    st.turns++; enterRoom(st, type, ev); return ev;
  }
  const u = st.units.find(x => x.id === a.u && x.side === 's'); if (!u || !alive(u)) bad('No such Seeker.');
  const need = n => { if (u.ap < n) bad('Not enough action points.'); };
  const tgt = (side) => { const t = st.units.find(x => x.id === a.id && alive(x)); if (!t) bad('No target.'); if (side === 'c' && t.side !== 'c') bad('Not a creature.'); if (side === 's' && t.side !== 's') bad('Not a Seeker.'); return t; };
  if (a.t === 'move') {
    if (u.root > 0 && !u.fx.anchor) bad('Held in place.');
    const freeMv = u.fx.freemove && !u.freeUsed; if (!freeMv) need(1);
    const { dist, par } = reach(st, u, moveRange(st, u)); if (!dist.get(K(a.x, a.y))) bad('Out of reach.');
    if (freeMv) u.freeUsed = true; else u.ap--; u.moved = true; walk(st, u, pathFrom(par, a.x, a.y), ev); if (alive(u)) onPlate(st, u, ev); return ev;
  }
  if (a.t === 'atk') { need(1); const t = tgt('c'); if (md(u, t) > weaponRange(st, u)) bad('Out of range.'); u.ap--; strike(st, u, t, ev); return ev; }
  if (a.t === 'study') { const t = tgt('c'); if (md(u, t) > 3) bad('Too far to study.'); const calm = !isHostile(st, t);
    // watching something that is not hunting you costs nothing, once a turn
    const free = calm && !u.freeStudy; if (!free) need(1);
    const g = gainStudy(st, u, t, studyValue(st, u), ev); if (!g) bad('Nothing more to learn from this one.'); if (free) u.freeStudy = true; else u.ap--;
    if (u.fx.a_naturalist && calm && !t.sampled) { t.sampled = true; st.res.samples[t.kind] = (st.res.samples[t.kind] || 0) + 1; ev.push({ e: 'text', id: t.id, msg: 'Sample taken' }); }
    if (u.fx.studymark) { t.mark = 2; ev.push({ e: 'status', id: t.id, s: 'mark' }); } return ev; }
  if (a.t === 'use') {
    const p = st.room.props.find(q => q.pid === a.p && !q.done); if (!p) bad('Nothing there.'); if (md(u, p) > 1) bad('Stand next to it.');
    if (p.kind === 'fixture') { need(1); u.ap--;
      if (p.id === 'bellcap') { if (p.spent) bad('It has nothing left to give.'); p.spent = true; ev.push({ e: 'fx', pid: p.pid, what: 'spores', x: p.x, y: p.y });
        // spores put living things to sleep; in the Wilds the same fixture is a steam vent that seizes machines for a turn
        const steam = st.spec.region === 'clockwork';
        for (const c of creatures(st)) if (md(c, p) <= 2 && !D.SPECIES[c.kind].boss) { if (steam) { c.stun = Math.max(c.stun, 1); ev.push({ e: 'text', id: c.id, msg: 'Seized' }, { e: 'status', id: c.id, s: 'stun' }); } else if (!D.SPECIES[c.kind].mech) { c.calm = Math.max(c.calm, 2); ev.push({ e: 'text', id: c.id, msg: 'Drowsy' }, { e: 'status', id: c.id, s: 'calm' }); } } }
      else if (p.id === 'lamp') { p.lit = !p.lit; ev.push({ e: 'fx', pid: p.pid, what: p.lit ? 'lit' : 'unlit', x: p.x, y: p.y }); }
      else if (p.id === 'case') { p.done = true; const r = R(st); const reg = st.spec.region;
        if (r.pct(55)) { const k = D.REGIONS[reg].observe; st.res.samples[k] = (st.res.samples[k] || 0) + 1; st.res.xp += 8; ev.push({ e: 'fx', pid: p.pid, what: 'specimen', x: p.x, y: p.y, kind: k }); }
        else { ev.push({ e: 'fx', pid: p.pid, what: 'alive', x: p.x, y: p.y }); const k = reg === 'clockwork' ? 'mite' : 'thornling'; let put = false; for (const [dx, dy] of DIRS) { const x = p.x + dx, y = p.y + dy; if (!put && free(st, x, y)) { const c = spawn(st, k, x, y, r, ev, false); c.noLoot = true; put = true; } } } }
      return ev; }
    if (p.kind === 'plate') bad('Step onto it.');
    if (p.kind === 'chest') { if (!chestOpen(st, p)) bad('It will not open yet.'); need(1); u.ap--; p.done = true; st.res.cases.push('chest' + (st.side ? '@' + st.side.id : '')); st.res.xp += 12; ev.push({ e: 'chest', pid: p.pid, x: p.x, y: p.y, by: u.id }); return ev; }
    if (p.kind === 'find') { need(1); u.ap--; p.done = true; const F = D.FINDS[p.id]; const reg = st.spec.region; const r = R(st); let what = p.wake ? 'wake' : F.does;
      if (what === 'notes') { const k = r.pick(D.REGIONS[reg].fauna.filter(f => !D.SPECIES[f].boss)); st.res.seen[k] = 1; st.res.study[k] = (st.res.study[k] || 0) + 3; st.res.xp += 10; ev.push({ e: 'find', pid: p.pid, what, x: p.x, y: p.y, kind: k, by: u.id }); }
      else if (what === 'case') { st.res.cases.push('cache@' + st.side.id); st.res.xp += 10; ev.push({ e: 'find', pid: p.pid, what, x: p.x, y: p.y, by: u.id }); }
      else if (what === 'mats') { const m = D.SPECIES[D.REGIONS[reg].observe].mat; addMat(st, m, 2); st.res.xp += 6; ev.push({ e: 'find', pid: p.pid, what, x: p.x, y: p.y, mat: m, by: u.id }); }
      else if (what === 'mend') { ev.push({ e: 'find', pid: p.pid, what, x: p.x, y: p.y, by: u.id }); for (const s of seekers(st)) if (alive(s)) heal(st, s, s.max, ev); }
      else if (what === 'lore') { st.res.xp += 25; ev.push({ e: 'find', pid: p.pid, what, x: p.x, y: p.y, by: u.id }); }
      else { ev.push({ e: 'find', pid: p.pid, what: 'wake', x: p.x, y: p.y, by: u.id }); const k = reg === 'clockwork' ? 'mite' : 'thornling'; let n = 0; for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]]) { const x = p.x + dx, y = p.y + dy; if (n < 2 && free(st, x, y)) { spawn(st, k, x, y, r, ev, false); n++; } } }
      return ev; }
    const cost = p.kind === 'flora' && u.fx.t_forager ? 0 : 1; need(cost); u.ap -= cost; p.done = true; ev.push({ e: 'prop', pid: p.pid, by: u.id });
    if (p.kind === 'flora') { st.res.flora[p.id] = (st.res.flora[p.id] || 0) + 1; st.res.floraN++; addMat(st, D.FLORA[p.id].mat, 1); st.res.xp += 4;
      if (p.id === 'heartfruit') heal(st, u, 8 + 2 * st.tier, ev);
      if (p.id === 'copper_lily') for (const c of creatures(st)) if (md(c, p) <= 1) hurt(st, u, c, 4 * st.tier, ev, { dot: true, kind: 'arc' });
      if (p.id === 'tick_fern') { const k = Object.keys(u.cds).sort((x, y) => u.cds[y] - u.cds[x])[0]; if (k) u.cds[k] = 0; } }
    else if (p.kind === 'cache') { st.res.cases.push('cache'); if (p.obj) st.res.objCache = true; st.res.xp += 10; }
    else if (p.kind === 'wonder') { st.res.wonders[p.id] = 1; st.res.xp += 25; if (p.id === 'painted_door') st.res.cases.push('cache'); }
    return ev;
  }
  if (a.t === 'abil') {
    const id = a.a; if (!u.sh.abilities.includes(id)) bad('Unknown ability.'); const A = D.ABILITIES[id]; if ((u.cds[id] || 0) > 0) bad('Still cooling down.');
    const freebie = u.fx.borrowed_moment && (u.abilN + 1) % 4 === 0; const cost = freebie ? 0 : A.ap; need(cost);
    const rng = abilRange(st, u, id); const ts = tierScale(st.tier), pw = abilPow(u);
    const pay = () => { u.abilN++; u.ap -= cost; if (!freebie) u.cds[id] = abilCd(u, id); ev.push({ e: 'abil', id: u.id, a: id }); };
    if (id === 'brace') { pay(); const v = fl(8 * ts * pw / 10000); u.shield += v; u.shieldPeak = Math.max(u.shieldPeak || 0, u.shield); u.taunt = 1; ev.push({ e: 'shield', id: u.id, n: -v }); if (u.fx.s_bulwark) for (const o of seekers(st)) if (o !== u && alive(o) && md(o, u) === 1) { o.shield += fl(v / 2); o.shieldPeak = Math.max(o.shieldPeak || 0, o.shield); ev.push({ e: 'shield', id: o.id, n: -fl(v / 2) }); } }
    else if (id === 'riposte') { pay(); u.rip = 1; ev.push({ e: 'text', id: u.id, msg: 'Ready' }); }
    else if (id === 'shove') { const t = tgt('c'); if (md(u, t) !== 1) bad('Shove needs a creature beside you.'); pay(); const dx = t.x - u.x, dy = t.y - u.y; strike(st, u, t, ev, { abil: true }); if (alive(t)) push(st, t, dx, dy, 2, ev, u, fl((4 + u.sh.attr.force) * ts / 100)); }
    else if (id === 'mark') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); t.mark = 2; ev.push({ e: 'status', id: t.id, s: 'mark' }); }
    else if (id === 'snare') { if (!inb(a.x, a.y) || !free(st, a.x, a.y) || md(u, a) > rng) bad('Pick an empty tile within reach.'); pay(); st.room.traps.push({ x: a.x, y: a.y, owner: u.id, dmg: fl(5 * ts * pw / 10000), bleed: !!u.fx.s_trapper }); ev.push({ e: 'trapset', x: a.x, y: a.y }); }
    else if (id === 'deadeye') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); strike(st, u, t, ev, { mult: 190, crit: t.mark > 0, abil: false }); }
    else if (id === 'mend') { const t = tgt('s'); if (md(u, t) > rng) bad('Out of range.'); pay(); heal(st, t, fl((8 + 2 * u.sh.lvl) * (100 + (u.m.healPow || 0) + 4 * u.sh.attr.adaptation) / 100), ev, t !== u); if (u.fx.s_medic) { t.bleed = 0; t.poison = 0; t.regenT = 2; } }
    else if (id === 'spore_dart') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); t.poison += 3; t.poisonPot = Math.max(t.poisonPot || 0, poisonPot(u)); ev.push({ e: 'status', id: t.id, s: 'poison' }); }
    else if (id === 'soothe') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); if (D.SPECIES[t.kind].boss) bad('It does not hear you.'); pay(); t.calm = 2; ev.push({ e: 'status', id: t.id, s: 'calm' }); }
    else if (id === 'drone') { if (!inb(a.x, a.y) || !free(st, a.x, a.y) || md(u, a) > rng) bad('Pick an empty tile within reach.'); pay(); summon(st, u, 'drone', a.x, a.y, ev); }
    else if (id === 'arc_pulse') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); const d = fl(R(st).range(5, 7) * ts * pw / 10000); const tx = t.x, ty = t.y; const n = creatures(st).filter(c => c !== t && md(c, t) === 1)[0];
      const zap = (c, v) => { hurt(st, u, c, v, ev, { pierce: 1, kind: 'arc' }); if (alive(c) && u.fx.s_saboteur) { c.mark = 2; if (D.SPECIES[c.kind].mech && !D.SPECIES[c.kind].boss) c.stun = 1; ev.push({ e: 'status', id: c.id, s: 'mark' }); } };
      zap(t, d); if (n) zap(n, Math.max(1, fl(d / 2))); }
    else if (id === 'kindle') { pay(); u.lit = 2; ev.push({ e: 'text', id: u.id, msg: 'Blades alight' }); }
    else if (id === 'fire_breath') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); const tx = t.x, ty = t.y; const d = fl(R(st).range(5, 7) * ts * pw / 10000);
      for (const c of creatures(st).filter(c => Math.abs(c.x - tx) + Math.abs(c.y - ty) <= 1)) { hurt(st, u, c, d, ev, { kind: 'fire' }); ignite(st, u, c, ev); } }
    else if (id === 'red_glare') { const t = tgt('c'); if (md(u, t) > rng) bad('Out of range.'); pay(); hurt(st, u, t, fl(R(st).range(6, 8) * ts * pw / 10000), ev, { pierce: 99, kind: 'beam' }); }
    else if (id === 'overclock') { const t = tgt('s'); if (t === u) bad('Overclock someone else.'); if (md(u, t) > rng) bad('Out of range.'); pay(); t.ap += 2; ev.push({ e: 'text', id: t.id, msg: '+2 actions' }); }
    return ev;
  }
  if (a.t === 'dev') {
    if (!u.sh.dev) bad('No device.'); if (u.charges <= 0) bad('No charges left in this room.'); const k = devKind(u); const I = DEV_INFO[k]; need(I.ap);
    if (!inb(a.x, a.y) || md(u, a) > I.range) bad('Out of range.'); const ts = tierScale(st.tier), pw = abilPow(u); const at = unitAt(st, a.x, a.y);
    if (I.target === 'tile' && !free(st, a.x, a.y)) bad('Pick an empty tile.');
    if (I.target === 'ally' && !(at && at.side === 's')) bad('Pick a Seeker.');
    u.ap -= I.ap; u.charges--; ev.push({ e: 'abil', id: u.id, a: k });
    if (k === 'lure') summon(st, u, 'lure', a.x, a.y, ev);
    else if (k === 'drone') summon(st, u, 'drone', a.x, a.y, ev);
    else if (k === 'barrier') { const v = fl(10 * ts * pw / 10000); at.shield += v; at.shieldPeak = Math.max(at.shieldPeak || 0, at.shield); ev.push({ e: 'shield', id: at.id, n: -v }); }
    else if (k === 'pulse') { const d = fl(R(st).range(4, 6) * ts * pw / 10000); ev.push({ e: 'burst', x: a.x, y: a.y }); for (const c of creatures(st)) if (md(c, a) <= 1) hurt(st, u, c, d, ev, { kind: 'arc' }); }
    else if (k === 'blink') { u.x = a.x; u.y = a.y; ev.push({ e: 'move', id: u.id, path: [[a.x, a.y]], blink: true }); stepOn(st, u, ev); }
    else if (k === 'gravity') { ev.push({ e: 'burst', x: a.x, y: a.y }); for (const c of creatures(st).filter(c => md(c, a) <= 2 && md(c, a) > 0).sort((p, q) => md(p, a) - md(q, a) || p.id - q.id)) { const S = D.SPECIES[c.kind]; if (S.boss || S.move === 0) continue; const dx = Math.sign(a.x - c.x), dy = Math.sign(a.y - c.y); const opts = Math.abs(a.x - c.x) >= Math.abs(a.y - c.y) ? [[dx, 0], [0, dy]] : [[0, dy], [dx, 0]]; for (const [ox, oy] of opts) if ((ox || oy) && free(st, c.x + ox, c.y + oy)) { c.x += ox; c.y += oy; ev.push({ e: 'move', id: c.id, path: [[c.x, c.y]], shove: true }); stepOn(st, c, ev); break; } if (alive(c)) c.root = Math.max(c.root, 1); } }
    return ev;
  }
  bad('Unknown action.');
}
export function replay(spec, log) { const st = createRun(spec); for (const a of log) { if (st.outcome) break; apply(st, a); } return st; }

// ---------------------------------------------------------------- player state
export const STAGE_NAME = ['Encountered', 'Observed', 'Investigated', 'Mastered'];
export const STAGE_REQ = [[0, 0], [4, 0], [10, 2], [20, 5]];
export function stageOf(e) { let s = 0; for (let i = 1; i < 4; i++) if ((e.study || 0) >= STAGE_REQ[i][0] && (e.samples || 0) >= STAGE_REQ[i][1]) s = i; return s; }
export function allKeys() {
  const k = [];
  for (const s in D.SPECIES) { k.push('f:' + s); if (!D.SPECIES[s].boss) for (const v in D.VARIANTS) k.push('v:' + s + ':' + v); }
  for (const f in D.FLORA) k.push('p:' + f); for (const w in D.WONDERS) k.push('w:' + w); for (const m in D.MATERIALS) k.push('m:' + m);
  for (const b in D.BASES) k.push('b:' + b); for (const s in D.SINGULARS) k.push('s:' + s); for (const r in D.RESONANCES) k.push('r:' + r);
  return k;
}
export function keyInfo(key) {
  const [t, a, b] = key.split(':');
  if (t === 'f') return { kind: 'Fauna', name: D.SPECIES[a].name, art: a, region: D.SPECIES[a].region };
  if (t === 'v') return { kind: 'Variant', name: D.VARIANTS[b].name + ' ' + D.SPECIES[a].name, art: a, variant: b, region: D.SPECIES[a].region };
  if (t === 'p') return { kind: 'Flora', name: D.FLORA[a].name, art: a };
  if (t === 'w') return { kind: 'Wonder', name: D.WONDERS[a].name, art: a };
  if (t === 'm') return { kind: 'Material', name: D.MATERIALS[a].name, art: a };
  if (t === 'b') return { kind: 'Relic', name: D.BASES[a].name, art: a };
  if (t === 's') return { kind: 'Singular', name: D.SINGULARS[a].name, art: a };
  if (t === 'r') return { kind: 'Resonance', name: D.RESONANCES[a].name, art: null };
  return { kind: '?', name: key };
}
function catAdd(state, key, now, fresh) { if (state.cat[key]) return false; state.cat[key] = { at: now }; fresh.push(key); return true; }
export function indexCtx(state) {
  const c = { entries: 0, mech: 0, observed: 0, investigated: 0, variants: 0, wonders: 0, bases: 0, verdantDone: 0, verdantAll: 0 };
  for (const k in state.cat) { c.entries++; const [t, a] = k.split(':'); const e = state.cat[k];
    if (t === 'f') { if (D.SPECIES[a].mech) c.mech++; const s = stageOf(e); if (s >= 1) c.observed++; if (s >= 2) c.investigated++; }
    if (t === 'v') c.variants++; if (t === 'w') c.wonders++; if (t === 'b') c.bases++; }
  const V = D.REGIONS.verdant; c.verdantAll = V.fauna.length + V.flora.length;
  for (const f of V.fauna) if (state.cat['f:' + f] && stageOf(state.cat['f:' + f]) >= 1) c.verdantDone++;
  for (const f of V.flora) if (state.cat['p:' + f]) c.verdantDone++;
  return c;
}
export function score(state) {
  let s = 0; for (const k in state.cat) { const t = k[0]; const e = state.cat[k]; s += t === 'v' ? 25 : t === 'w' ? 40 : t === 's' ? 100 : t === 'r' ? 20 : 10; if (t === 'f') s += 15 * stageOf(e); if (e.first) s += 50; }
  return s;
}
function addItem(state, it, now, fresh) {
  const id = 'i' + (state.nextId++); it.id = id; state.items[id] = it;
  if (fresh) { catAdd(state, it.sing ? 's:' + it.sing : 'b:' + it.base, now, fresh); for (const a of it.aff) state.aff[a.id] = 1; if (it.fx) state.fxSeen[it.fx] = 1; }
  return id;
}
function addSeeker(state, arch, r, now, fresh) {
  const A = D.ARCHETYPES[arch]; const s = { id: arch, arch, name: A.seeker, lvl: 1, xp: 0, attr: { ...A.attr }, pts: 0, spec: null, traits: [], gear: {} };
  state.seekers[arch] = s; state.roster.push(arch);
  for (const sl in A.start) s.gear[sl] = addItem(state, makeItem(r, A.start[sl], 0, 1), now, fresh);
}
export function newPlayer(name, seed, now) {
  const r = mkRng(seed);
  const state = { v: 1, name, seekers: {}, roster: [], items: {}, nextId: 1, mats: {}, comps: 6, research: 0, cat: {}, aff: {}, fxSeen: {}, unlocks: {}, tierMax: { verdant: 1, clockwork: 1 },
    board: null, run: null, stats: { runs: 0, wins: 0, bossDry: 0 }, weekly: { id: null, done: false, best: 0 }, last: null };
  const fresh = []; for (const a of ['vanguard', 'tracker', 'naturalist']) addSeeker(state, a, r, now, fresh);
  state.board = makeBoard(state, r.next()); return state;
}
export function weekId(now) { return fl((now - 345600000) / 604800000); }
// One odd animal is reported each day, the same for everyone. Meeting it pays research, more for each day in a row.
export function dayId(now) { return fl(now / 86400000); }
export function dailySighting(now, state) { const d = dayId(now); const region = d % 2 && state && state.unlocks.clockwork ? 'clockwork' : 'verdant';
  const pool = D.REGIONS[region].fauna.filter(k => !D.SPECIES[k].boss && !D.SPECIES[k].elite); return { day: d, region, kind: pool[hashStr('sighting-' + d) % pool.length], variant: ['pale', 'gilded', 'overgrown'][hashStr('coat-' + d) % 3] }; }
export function sightingBonus(streak) { return 3 + Math.min(streak, 7); }
export function weeklyContract(now) { const w = weekId(now); return { weekly: true, week: w, region: w % 2 ? 'clockwork' : 'verdant', type: 'pursue', tier: 3, mods: {}, target: { fam: w % 2 ? 'relic' : 'organic', slot: D.SLOTS[w % 6] }, seed: hashStr('weekly-trial-' + w) }; }
export function makeBoard(state, seed) {
  const r = mkRng(seed); const regs = ['verdant']; if (state.unlocks.clockwork) regs.push('clockwork');
  const types = Object.keys(D.CONTRACT_TYPES); const list = []; const t0 = state.stats.runs ? r.int(4) : 0;
  for (let i = 0; i < 3; i++) {
    const region = regs.length > 1 ? regs[(i + r.int(2)) % 2] : 'verdant'; const type = types[(t0 + i) % 4];
    const fam = weighted(r, D.REGIONS[region].fam); const mods = {};
    if (state.unlocks.bloom && r.pct(25)) mods.bloom = 1; else if (state.unlocks.hunts && r.pct(25)) mods.hunt = 1;
    list.push({ region, type, mods, target: { fam, slot: r.pick(D.SLOTS) }, seed: r.next() });
  }
  return { seed, list };
}
export function buildSpec(state, c, squad, tier, seed) {
  const stages = {}; for (const k in state.cat) if (k[0] === 'f') stages[k.slice(2)] = stageOf(state.cat[k]);
  let vb = state.unlocks.variants ? 50 : 0; const sheets = squad.map(id => sheet(state, id)); for (const s of sheets) vb += s.m.variantSense || 0;
  return { seed, region: c.region, type: c.type, tier, mods: c.mods || {}, target: c.target, weekly: !!c.weekly, week: c.week, intro: !state.stats.runs && !c.weekly, squad: sheets, stages, variantBoost: vb };
}
function checkMilestones(state, r, now, fresh, out) {
  const ctx = indexCtx(state);
  for (const m of D.MILESTONES) { if (state.unlocks[m.id]) continue; const [h, n] = m.test(ctx); if (h < n) continue;
    state.unlocks[m.id] = now; out.push(m.id);
    if (m.id === 'tamsin') addSeeker(state, 'tinkerer', r, now, fresh);
    if (m.id === 'garrow') addSeeker(state, 'firebrand', r, now, fresh);
    if (m.id === 'eye') addItem(state, makeSingular(r, 'collectors_eye', Math.max(1, state.tierMax.verdant)), now, fresh); }
}
const famMats = fam => Object.keys(D.MATERIALS).filter(m => D.MATERIALS[m].fam === fam);
export function matCount(state, fam) { return famMats(fam).reduce((n, m) => n + (state.mats[m] || 0), 0); }
function spendMats(state, fam, n) { if (matCount(state, fam) < n) bad('Not enough ' + D.FAMILY_NAME[fam].toLowerCase() + ' material.'); while (n > 0) { const m = famMats(fam).sort((a, b) => (state.mats[b] || 0) - (state.mats[a] || 0))[0]; state.mats[m]--; n--; } }
export function costOf(state, op, it) {
  const fam = itemDef(it).fam; const t = it.tier;
  if (op === 'refine') return { comps: 2 + t, mats: 1, fam };
  if (op === 'calibrate') return { comps: (3 + t) * ((it.cal || 0) + 1), mats: 1, fam };
  if (op === 'mutate') return { comps: (4 + t) * ((it.mut || 0) + 1), mats: 2 * ((it.mut || 0) + 1), fam };
  return { comps: 0, mats: 0, fam };
}
export function assembleCost(baseId, tier) { return { comps: 8 + 4 * tier, mats: 3, fam: D.BASES[baseId].fam }; }
function pay(state, c) { if (state.comps < c.comps) bad('Not enough components.'); spendMats(state, c.fam, c.mats); state.comps -= c.comps; }
const equippedBy = (state, id) => state.roster.find(s => Object.values(state.seekers[s].gear).includes(id));

// Apply a camp operation. ctx: { now, rng } (rng only on the server; ops that need it are server-only).
export function applyOp(state, op, ctx) {
  const now = ctx.now; const fresh = []; const out = { fresh, unlocked: [] };
  const S = id => state.seekers[id] && state.roster.includes(id) ? state.seekers[id] : bad('No such Seeker.');
  const I = id => state.items[id] || bad('No such item.');
  if (state.run && op.t !== 'finish') bad('An expedition is under way.');
  switch (op.t) {
    case 'equip': { const s = S(op.s), it = I(op.i); const sl = itemDef(it).slot; const who = equippedBy(state, it.id); if (who) delete state.seekers[who].gear[sl]; s.gear[sl] = it.id;
      for (const id of resonancesFor(seekerItems(state, s)).active) catAdd(state, 'r:' + id, now, fresh); break; }
    case 'unequip': { const s = S(op.s); delete s.gear[op.slot]; break; }
    case 'attr': { const s = S(op.s); if (!D.ATTRS.includes(op.a)) bad('No such attribute.'); if (s.pts < 1) bad('No points to spend.'); s.pts--; s.attr[op.a]++; break; }
    case 'spec': { const s = S(op.s); if (s.lvl < D.SPEC_LEVEL) bad('Reach level ' + D.SPEC_LEVEL + ' first.'); if (!D.SPECS[s.arch].some(x => x.id === op.id)) bad('No such specialization.'); s.spec = op.id; break; }
    case 'trait': { const s = S(op.s); const slots = D.TRAIT_LEVELS.filter(l => s.lvl >= l).length; if (s.traits.length >= slots) bad('No trait slot open.'); if (!traitOffer(s).includes(op.id)) bad('Not on offer.'); s.traits.push(op.id); break; }
    case 'lock': { const it = I(op.i); it.lock = !it.lock; break; }
    case 'dismantle': { for (const id of op.items) { const it = I(id); if (it.lock) bad('Unlock it first.'); if (equippedBy(state, id)) bad('Unequip it first.'); if (it.sing) bad('A Singular cannot be dismantled.');
        const ri = D.RARITIES.indexOf(it.rar); state.comps += D.DISMANTLE[ri] + (it.tier - 1); const fm = famMats(itemDef(it).fam); const m = fm[it.seed % fm.length]; state.mats[m] = (state.mats[m] || 0) + 1 + (ri >= 3 ? 1 : 0); catAdd(state, 'm:' + m, now, fresh); delete state.items[id]; } break; }
    case 'refine': { if (!state.unlocks.bench) bad('The workbench is not set up yet.'); const it = I(op.i); if (it.sing) bad('A Singular cannot be altered.'); const a = it.aff[op.a] || bad('No such affix.'); const q = affixQuality(it, op.a); const [lo, hi] = affixBand(a.id, it.tier); if (a.v >= hi) bad('Already at its best.');
      pay(state, costOf(state, 'refine', it)); a.v = q >= 2 ? hi : Math.max(a.v + 1, lo + Math.round((hi - lo) * (q === 0 ? 0.5 : 0.85))); break; }
    case 'calibrate': { if (!state.unlocks.bench) bad('The workbench is not set up yet.'); const it = I(op.i); if (it.sing) bad('A Singular cannot be altered.'); if ((it.cal || 0) >= D.CAL_MAX[D.RARITIES.indexOf(it.rar)]) bad('Fully calibrated.'); pay(state, costOf(state, 'calibrate', it)); it.cal = (it.cal || 0) + 1; break; }
    case 'mutate': { if (!ctx.rng) bad('server'); if (!state.unlocks.mutate) bad('Observe three species first.'); const it = I(op.i); if (it.sing) bad('A Singular cannot be altered.'); if (!it.aff[op.a]) bad('No such affix.');
      const v = validAffixes(it, op.a).filter(id => id !== it.aff[op.a].id); if (!v.length) bad('Nothing else can grow there.'); pay(state, costOf(state, 'mutate', it)); const id = ctx.rng.pick(v); it.aff[op.a] = { id, v: rollAffixValue(ctx.rng, id, it.tier, rollQuality(ctx.rng)) }; it.mut = (it.mut || 0) + 1; state.aff[id] = 1; out.item = it.id; break; }
    case 'assemble': { if (!ctx.rng) bad('server'); if (!state.unlocks.assemble) bad('Catalogue more equipment first.'); if (!state.cat['b:' + op.base]) bad('You have not catalogued that.'); const def = D.BASES[op.base]; const tier = Math.max(1, Math.min(op.tier | 0, Math.max(state.tierMax.verdant, state.tierMax.clockwork)));
      pay(state, assembleCost(op.base, tier)); const x = ctx.rng.int(100); out.item = addItem(state, makeItem(ctx.rng, op.base, x < 55 ? 1 : x < 90 ? 2 : 3, tier), now, fresh); void def; break; }
    case 'reboard': { if (!ctx.rng) bad('server'); if (state.research < 3) bad('Costs 3 research.'); state.research -= 3; state.board = makeBoard(state, ctx.rng.next()); break; }
    case 'start': { if (!ctx.rng) bad('server'); const c = op.weekly ? weeklyContract(now) : state.board.list[op.c]; if (!c) bad('No such contract.');
      const squad = [...new Set(op.squad || [])]; if (squad.length < 1 || squad.length > 3) bad('Take one to three Seekers.'); squad.forEach(S);
      if (Object.keys(state.items).length > 90) bad('Your pack is full. Dismantle something first.');
      const tier = c.weekly ? c.tier : Math.max(1, Math.min(op.tier | 0 || 1, state.tierMax[c.region]));
      state.run = { spec: buildSpec(state, c, squad, tier, c.weekly ? c.seed : ctx.rng.next()), at: now, c: op.weekly ? -1 : op.c };
      { const sg = dailySighting(now, state); if (!c.weekly && c.region === sg.region && state.stats.runs && !(state.daily && state.daily.id === sg.day)) state.run.spec.sight = { kind: sg.kind, variant: sg.variant, day: sg.day }; } break; }
    case 'finish': { if (!ctx.rng) bad('server'); if (!state.run) bad('No expedition to finish.'); out.report = settle(state, op.log || [], ctx, fresh, out); break; }
    default: bad('Unknown operation.');
  }
  checkMilestones(state, ctx.rng || mkRng(hashStr(state.name) + state.nextId), now, fresh, out.unlocked);
  return out;
}
export function traitOffer(s) { const all = Object.keys(D.TRAITS).filter(t => !s.traits.includes(t)); const r = mkRng(hashStr(s.id + ':' + s.traits.length)); const o = []; while (o.length < 3 && all.length) o.push(all.splice(r.int(all.length), 1)[0]); return o; }

function settle(state, log, ctx, fresh, out) {
  const run = state.run; const spec = run.spec; const r = ctx.rng; const now = ctx.now;
  const st = replay(spec, log); if (!st.outcome) st.outcome = 'retreat';
  const rs = st.res; const win = st.outcome === 'win'; const rep = { outcome: st.outcome, contractDone: rs.contractDone, type: spec.type, region: spec.region, tier: spec.tier, items: [], mats: {}, stageUps: [], levelUps: [], research: 0, xp: 0, turns: st.turns, weekly: spec.weekly };
  state.run = null; state.stats.runs++; if (win) state.stats.wins++;
  // catalogue
  const touch = (key) => { catAdd(state, key, now, fresh); return state.cat[key]; };
  // Walking out early only counts what the party actually worked on: studied, sampled, watched or killed. Being in the room with it is not a record.
  const met = sp => win || rs.study[sp] || rs.samples[sp] || rs.kills[sp];
  if (spec.sight && met(spec.sight.kind) && !(state.daily && state.daily.id >= spec.sight.day)) { const prev = state.daily || {}; const streak = prev.id === spec.sight.day - 1 ? (prev.streak || 0) + 1 : 1; const bonus = sightingBonus(streak);
    state.daily = { id: spec.sight.day, streak, best: Math.max(prev.best || 0, streak) }; state.research += bonus; rep.sight = { kind: spec.sight.kind, variant: spec.sight.variant, streak, bonus }; }
  for (const sp in rs.seen) { if (!met(sp)) continue; const e = touch('f:' + sp); const before = stageOf(e); e.study = (e.study || 0) + (rs.study[sp] || 0); e.samples = (e.samples || 0) + (rs.samples[sp] || 0); e.n = (e.n || 0) + 1; const after = stageOf(e); if (after > before) { rep.stageUps.push({ sp, stage: after }); rep.research += 5 * (after - before); } }
  for (const v in rs.variants) if (met(v.split(':')[0])) touch('v:' + v);
  for (const f in rs.flora) { const e = touch('p:' + f); e.n = (e.n || 0) + rs.flora[f]; }
  for (const w in rs.wonders) touch('w:' + w);
  let studyPts = 0; for (const sp in rs.study) studyPts += rs.study[sp];
  // materials
  for (const m in rs.mats) { const n = win ? rs.mats[m] : fl(rs.mats[m] / 2); if (n > 0) { state.mats[m] = (state.mats[m] || 0) + n; rep.mats[m] = n; touch('m:' + m); } }
  // cases
  const srcOf = c => c.split('@')[0], found = c => srcOf(c) === 'cache' || srcOf(c) === 'chest'; // things carried out by hand survive a retreat
  let cases = rs.cases.slice(); if (!win) cases = cases.filter(found).concat(cases.filter(c => !found(c) && c !== 'boss').slice(0, fl(cases.length / 3)));
  if (spec.weekly) { const wk = weekId(now); if (state.weekly.id !== wk) state.weekly = { id: wk, done: false, best: 0 }; if (state.weekly.done) cases = cases.filter(c => c !== 'weekly'); else if (cases.includes('weekly')) state.weekly.done = true;
    if (win && spec.week === wk) { const sc = Math.max(1, 1000 + 40 * studyPts + 25 * Object.values(rs.kills).reduce((a, b) => a + b, 0) - 12 * st.turns - 2 * rs.dmgTaken); rep.weeklyScore = sc; if (sc > state.weekly.best) state.weekly.best = sc; } }
  let rf = 0; for (const s of spec.squad) rf = Math.max(rf, s.m.rareFind || 0); if (spec.mods.bloom || spec.mods.hunt) rf += 8;
  for (const raw of cases) { const [src, at] = raw.split('@');
    const isBoss = src === 'boss'; const it = rollItem(r, { src, region: spec.region, tier: spec.tier, target: spec.target, rareFind: Math.min(25, rf), singBonus: isBoss ? Math.min(3, fl(state.stats.bossDry / 8) * 0.25) : 0 });
    if (isBoss) state.stats.bossDry = it.sing ? 0 : state.stats.bossDry + 1;
    it.prov = { src, region: spec.region, tier: spec.tier, at: at || null, on: now }; // where it was found, kept with the item for good
    const isNew = !state.cat[it.sing ? 's:' + it.sing : 'b:' + it.base]; const id = addItem(state, it, now, fresh); rep.items.push({ id, src, isNew });
  }
  // progression
  rep.research += studyPts + 3 * fresh.length; state.research += rep.research;
  rep.xp = (win ? rs.xp : fl(rs.xp / 2)) + 10 * fresh.filter(k => k[0] !== 'b' && k[0] !== 'm').length;
  for (const sh of spec.squad) { const s = state.seekers[sh.sid]; if (!s || s.lvl >= D.LEVEL_CAP) continue; s.xp += rep.xp; while (s.lvl < D.LEVEL_CAP && s.xp >= xpNext(s.lvl)) { s.xp -= xpNext(s.lvl); s.lvl++; s.pts++; rep.levelUps.push({ sid: s.id, lvl: s.lvl }); } if (s.lvl >= D.LEVEL_CAP) s.xp = 0; }
  if (win && rs.bossDown && !spec.weekly && spec.tier === state.tierMax[spec.region] && spec.tier < 5) { state.tierMax[spec.region]++; rep.tierUp = state.tierMax[spec.region]; }
  if (!spec.weekly) state.board = makeBoard(state, r.next());
  rep.study = rs.study; rep.kills = rs.kills; rep.flora = rs.flora; rep.wonders = Object.keys(rs.wonders); rep.variants = Object.keys(rs.variants);
  state.last = { at: now, outcome: st.outcome };
  return rep;
}
