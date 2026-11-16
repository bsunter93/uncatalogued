// End-to-end check against the live API with a throwaway account.
import * as C from '../core.js';
const API = 'https://kffkasnzqcddpystszch.supabase.co/functions/v1/uncatalogued';
const key = 'e2e' + [...crypto.getRandomValues(new Uint8Array(24))].map(x => x.toString(16).padStart(2, '0')).join('');
const call = async (op, body = {}) => { const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ v: C.VERSION, key, op, ...body }) }); return r.json(); };
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const name = 'Test ' + Math.floor(Math.random() * 1e6);
let j = await call('register', { name }); if (j.error) throw new Error(j.error); console.log('registered', name, 'items', Object.keys(j.state.items).length);
j = await call('ops', { ops: [{ t: 'start', c: 0, squad: j.state.roster, tier: 1 }] }); if (j.error) throw new Error(j.error);
const spec = j.state.run.spec; const st = C.createRun(spec); const log = []; let g = 0;
while (!st.outcome && g++ < 2000) {
  let a = { t: 'end' };
  if (C.canAdvance(st)) a = { t: 'next', c: 1 };
  else { const foes = st.units.filter(u => u.side === 'c' && !u.dead && !u.fled && C.isHostile(st, u));
    for (const u of st.units.filter(u => u.side === 's' && !u.dead && u.ap > 0)) { const t = foes.filter(f => md(u, f) <= C.weaponRange(st, u))[0]; if (t) { a = { t: 'atk', u: u.id, id: t.id }; break; }
      const near = foes.sort((p, q) => md(u, p) - md(u, q))[0]; if (near) { let best = null, bd = md(u, near); for (const [k, d] of C.moveTiles(st, u)) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const dd = Math.abs(x - near.x) + Math.abs(y - near.y); if (dd < bd && dd >= 1) { bd = dd; best = [x, y]; } } if (best) { a = { t: 'move', u: u.id, x: best[0], y: best[1] }; break; } } } }
  try { C.apply(st, a); log.push(a); } catch (e) { if (!e.illegal) throw e; C.apply(st, { t: 'end' }); log.push({ t: 'end' }); }
}
console.log('local outcome', st.outcome, 'actions', log.length);
j = await call('ops', { ops: [{ t: 'finish', log }] }); if (j.error) throw new Error(j.error);
const rep = j.results[0].report; console.log('server outcome', rep.outcome, 'contract', rep.contractDone, 'items', rep.items.length, 'xp', rep.xp, 'fresh', j.results[0].fresh.length, 'firsts', j.firsts.length, 'feed', j.world.feed.length);
if (rep.outcome !== st.outcome) throw new Error('server disagreed with client');
// cheating: claim a win with an empty log
j = await call('ops', { ops: [{ t: 'start', c: 0, squad: j.state.roster.slice(0, 3), tier: 1 }] });
j = await call('ops', { ops: [{ t: 'finish', log: [{ t: 'next', c: 0 }, { t: 'next' }, { t: 'next' }] }] }); console.log('forged log ->', j.error || j.results[0].report.outcome);
j = await call('ops', { ops: [{ t: 'finish', log: [] }] }); console.log('empty log ->', j.error || j.results[0].report.outcome + ' items ' + j.results[0].report.items.length);
console.log('KEY', key);
