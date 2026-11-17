// Checks that the residents live their own lives: nobody hunts at the start, a lit lamp draws them, they notice a
// Seeker who walks up, predators take prey, and the party gets a note for watching.
import * as C from '../core.js';
const D = C.D; const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const state = C.newPlayer('Check', 7, 0);
let quiet = 0, rooms = 0, lampDrew = 0, lampRooms = 0, noticed = 0, kills = 0, witnessed = 0, grazed = 0;
for (let seed = 1; seed <= 300; seed++) {
  const c = { region: seed % 2 ? 'verdant' : 'clockwork', type: 'pursue', tier: 2, mods: {} };
  const spec = C.buildSpec(state, c, state.roster.slice(0, 3), 2, 5000 + seed); spec.intro = false;
  // 1. at the start nothing is hunting
  let st = C.createRun(spec); rooms++; if (C.canAdvance(st)) quiet++;
  // 2. light the lamp from wherever, by standing a Seeker beside it, then let the room move
  const lamp = st.room.props.find(p => p.id === 'lamp' && !p.done); const roam = () => st.units.filter(u => u.side === 'c' && !u.dead && u.mood === 'roam');
  if (lamp && roam().length) { lampRooms++; lamp.lit = true; const before = roam().map(u => md(u, lamp)); for (let i = 0; i < 6 && !st.outcome; i++) { const ev = C.apply(st, { t: 'end' }); for (const e of ev) { if (e.e === 'text' && /Witnessed/.test(e.msg)) witnessed++; if (e.e === 'text' && e.msg === 'Notices you') noticed++; } }
    const after = st.units.filter(u => u.side === 'c' && !u.dead && (u.mood === 'roam')).map(u => md(u, lamp)); if (after.length && Math.min(...after) <= 2 && Math.min(...after) < Math.min(...before)) lampDrew++; }
  // 3. fresh run: just wait and watch for predation and grazing
  st = C.createRun(spec); for (let i = 0; i < 25 && !st.outcome; i++) { const n0 = st.units.filter(u => u.side === 'c' && u.dead).length; const ev = C.apply(st, { t: 'end' }); kills += st.units.filter(u => u.side === 'c' && u.dead).length - n0; for (const e of ev) { if (e.e === 'text' && /Witnessed: a kill|Witnessed: feeding/.test(e.msg)) witnessed++; if (e.e === 'text' && /Witnessed: grazing/.test(e.msg)) grazed++; } }
  // 4. fresh run: walk the first Seeker at the nearest roamer until it notices
  st = C.createRun(spec); const u = st.units.find(x => x.side === 's'); let saw = false;
  for (let i = 0; i < 40 && !st.outcome && !saw; i++) { const t = st.units.filter(x => x.side === 'c' && !x.dead && x.mood === 'roam').sort((a, b) => md(a, u) - md(b, u))[0]; if (!t) break;
    let best = null, bd = md(u, t); for (const [k, d] of C.moveTiles(st, u)) { if (!d) continue; const x = k % C.W, y = Math.floor(k / C.W); const dd = Math.abs(x - t.x) + Math.abs(y - t.y); if (dd < bd && dd >= 1) { bd = dd; best = [x, y]; } }
    if (u.dead) break; let ev; try { ev = best && u.ap > 0 ? C.apply(st, { t: 'move', u: u.id, x: best[0], y: best[1] }) : C.apply(st, { t: 'end' }); } catch (e) { if (!e.illegal) throw e; ev = C.apply(st, { t: 'end' }); } if (ev.some(e => e.e === 'text' && e.msg === 'Notices you')) saw = true; }
  if (saw) noticed++;
}
console.log(`rooms quiet at start ${quiet}/${rooms}`); console.log(`lamp drew a roamer within 2 tiles ${lampDrew}/${lampRooms}`); console.log(`walking up got noticed ${noticed} times in ${rooms} runs`);
console.log(`resident-on-resident kills while waiting ${kills}, witnessed kill/feed notes ${witnessed}, grazing notes ${grazed}`);
