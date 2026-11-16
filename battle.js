// The expedition screen: board, input, and playback of what the rules engine reports.
import { C, D, G, $, esc, art, face, store, toast } from './ui.js';

const PATHS = { verdant: [['The Overgrowth', 'has been seen in there. Harder. What it leaves behind is worth a better case.'], ['The Still Pond', 'Grazers, flora and no hunters. A good place to study. Nothing to clear, so no case for clearing it.']],
  clockwork: [['The Foundry Floor', 'is working the line. Harder. What it leaves behind is worth a better case.'], ['The Winding Garden', 'Tended, quiet, watched. A good place to study. Nothing to clear, so no case for clearing it.']] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const md = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function mountBattle(root, onFinish) {
  const run = G.state.run; const spec = run.spec; const reg = D.REGIONS[spec.region];
  let log = []; try { const sv = JSON.parse(store.get('unc.run') || 'null'); if (sv && sv.at === run.at) log = sv.log; } catch { /* start over */ }
  let st; try { st = C.replay(spec, log); } catch { log = []; st = C.createRun(spec); }
  let sel = null, mode = null, info = null, busy = false, armed = null, retreatArmed = false, shownRoom = -1;
  const first = !G.state.stats.runs;

  root.innerHTML = `<div class="wrap" style="padding-block:14px 90px"><div class="bhead"><div class="rooms"></div><div class="obj grow"></div><span class="label turn"></span><button class="link" data-act="retreat">Retreat</button></div>
    <div class="battle"><div><div class="board"><div class="tiles"></div><svg class="lines" viewBox="0 0 8 6" preserveAspectRatio="none"></svg><div class="toks"></div></div><div class="actions"></div><div class="hint"></div></div>
    <aside class="stack"><div class="scards"></div><div class="panel info"></div></aside></div></div>`;
  const board = $('.board', root), tiles = $('.tiles', root), toks = $('.toks', root), lines = $('.lines', root);
  for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) { const b = document.createElement('button'); b.className = 'tile'; b.dataset.x = x; b.dataset.y = y; b.setAttribute('aria-label', `Tile ${x + 1}, ${y + 1}`); tiles.append(b); }
  const tileEl = (x, y) => tiles.children[y * C.W + x];
  const pos = (el, x, y) => { el.style.left = x * 12.5 + '%'; el.style.top = y * 16.6667 + '%'; };
  const unit = id => st.units.find(u => u.id === id);
  const live = u => u && !u.dead && !u.fled;
  const mine = () => st.units.filter(u => u.side === 's');
  const foes = () => st.units.filter(u => u.side === 'c' && live(u));
  const propAt = (x, y) => st.room.props.find(p => !p.done && p.x === x && p.y === y);
  const artKey = u => u.side === 's' ? u.kind : u.kind;
  const stage = k => spec.stages[k] ?? -1;

  function tok(u) {
    let el = toks.querySelector(`[data-id="${u.id}"]`);
    if (!el) { el = document.createElement('div'); el.dataset.id = u.id; el.className = 'tok ' + u.side; el.innerHTML = art(artKey(u), { variant: u.variant }) + '<div class="hp"><i></i><b></b></div><div class="ap"></div><div class="sts"></div>' + (u.side === 'c' ? '<div class="mood"></div>' : ''); pos(el, u.x, u.y); toks.append(el); }
    return el;
  }
  function sync() {
    if (shownRoom !== st.roomIdx) { toks.innerHTML = ''; shownRoom = st.roomIdx; sel = null; mode = null; info = null;
      st.room.rock.forEach((r, i) => { if (r) { const el = document.createElement('div'); el.className = 'tok prop rock'; el.innerHTML = art('obstacle', { seed: i + st.roomIdx * 7 }); pos(el, i % C.W, Math.floor(i / C.W)); toks.append(el); } }); }
    const ids = new Set(st.units.map(u => String(u.id)));
    for (const el of [...toks.querySelectorAll('[data-id]')]) if (!ids.has(el.dataset.id)) el.remove();
    for (const p of st.room.props) { let el = toks.querySelector(`[data-pid="${p.pid}"]`); if (p.done) { el?.remove(); continue; } if (!el) { el = document.createElement('div'); el.dataset.pid = p.pid; el.className = 'tok prop'; el.innerHTML = art(p.id); pos(el, p.x, p.y); toks.append(el); } }
    toks.querySelectorAll('[data-trap],[data-corpse]').forEach(e => e.remove());
    for (const t of st.room.traps) { const el = document.createElement('div'); el.dataset.trap = 1; el.className = 'tok prop'; el.innerHTML = art('trap'); pos(el, t.x, t.y); toks.prepend(el); }
    for (const c of st.room.corpses) { const el = document.createElement('div'); el.dataset.corpse = 1; el.className = 'tok prop rock'; el.innerHTML = art('corpse'); pos(el, c.x, c.y); toks.prepend(el); }
    if (!sel || !live(unit(sel)) || unit(sel).ap <= 0) { const n = mine().find(u => live(u) && u.ap > 0); if (n && (!sel || !live(unit(sel)) || !mode)) sel = n.id; }
    const su = unit(sel);
    for (const u of st.units) {
      const el = tok(u); pos(el, u.x, u.y); const gone = !live(u); el.classList.toggle('gone', gone); if (gone) continue;
      el.querySelector('.hp i').style.width = Math.max(0, u.hp / u.max * 100) + '%'; el.querySelector('.hp b').style.width = Math.min(100, (u.shield || 0) / u.max * 100) + '%';
      const s = []; if (u.bleed > 0) s.push(`<span class="bleed">BLEED ${u.bleed}</span>`); if (u.poison > 0) s.push(`<span class="poison">POISON ${u.poison}</span>`); if (u.mark > 0) s.push('<span class="mark">MARKED</span>'); if (u.root > 0) s.push('<span>HELD</span>'); if (u.stun > 0) s.push('<span>STUNNED</span>'); if (u.rip > 0) s.push('<span>RIPOSTE</span>'); if (u.taunt > 0) s.push('<span>BRACED</span>');
      el.querySelector('.sts').innerHTML = s.join('');
      if (u.side === 's') { el.classList.toggle('sel', u.id === sel); el.classList.toggle('spent', u.ap <= 0); el.querySelector('.ap').innerHTML = '<i></i>'.repeat(Math.max(0, u.ap)); }
      if (u.side === 'c') { const h = C.isHostile(st, u); el.classList.toggle('hostile', h); if (u.variant) el.classList.add('var-' + u.variant); el.querySelector('.mood').textContent = C.plan(st, u).label; }
    }
    marks(); drawLines(); head(); actions(); cards(); panel(); hint();
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
      for (const c of foes()) if (md(u, c) <= 3 && c.studied < (c.variant ? 5 : 3)) m.set(c.x + ',' + c.y, { t: 'study', u: u.id, id: c.id });
    } else {
      if (u.ap >= 1 || (u.fx.freemove && !u.freeUsed)) for (const [k, d] of C.moveTiles(st, u)) if (d) m.set((k % C.W) + ',' + Math.floor(k / C.W), { t: 'move', u: u.id, x: k % C.W, y: Math.floor(k / C.W) });
      if (u.ap >= 1) { for (const c of foes()) if (md(u, c) <= C.weaponRange(st, u)) m.set(c.x + ',' + c.y, { t: 'atk', u: u.id, id: c.id });
        for (const p of st.room.props) if (!p.done && md(u, p) <= 1) m.set(p.x + ',' + p.y, { t: 'use', u: u.id, p: p.pid }); }
    }
    return m;
  }
  function marks() {
    const m = targets(); const reg = st.units.find(u => u.tele && live(u));
    for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) { const a = m.get(x + ',' + y); const el = tileEl(x, y);
      el.className = 'tile' + (a ? (a.t === 'move' ? ' mv' : mode ? ' ab' : '') : '') + (reg && (reg.tele.axis === 'row' ? y === reg.tele.i : x === reg.tele.i) ? ' danger' : ''); }
    for (const el of toks.querySelectorAll('.tok.c')) { const u = unit(+el.dataset.id); const a = live(u) && m.get(u.x + ',' + u.y); el.classList.toggle('tg', !!a && !mode); el.classList.toggle('abt', !!a && !!mode); }
    for (const el of toks.querySelectorAll('[data-pid]')) { const p = st.room.props.find(q => q.pid === +el.dataset.pid); el.classList.toggle('use', !!p && !!m.get(p.x + ',' + p.y) && !mode); }
  }
  function drawLines() {
    let s = ''; for (const c of foes()) { if (!C.isHostile(st, c)) continue; const p = C.plan(st, c); const t = p.tgt && unit(p.tgt); if (!t || !live(t)) continue;
      s += `<line x1="${c.x + .5}" y1="${c.y + .5}" x2="${t.x + .5}" y2="${t.y + .5}"/><circle cx="${t.x + .5}" cy="${t.y + .5}" r=".42"/>`; }
    lines.innerHTML = s;
  }
  function objective() {
    const rs = st.res; const obs = D.SPECIES[reg.observe].name;
    if (spec.type === 'pursue') return [`Bring down <b>${esc(D.SPECIES[reg.boss].name)}</b>${st.roomIdx < 2 ? '. It waits in the last room.' : ''}`, rs.bossDown];
    if (spec.type === 'observe') return [`Study <b>${esc(obs)}</b>: <span class="num">${Math.min(6, rs.study[reg.observe] || 0)}/6</span>. Kill none of them.${rs.obsKilled ? ' One has died. The contract is void.' : ''}`, (rs.study[reg.observe] || 0) >= 6 && !rs.obsKilled];
    if (spec.type === 'harvest') return [`Gather flora: <span class="num">${Math.min(4, rs.floraN)}/4</span>`, rs.floraN >= 4];
    return [`Open the <b>sealed case</b>${st.roomIdx < 2 ? ' in the last room' : ' at the far wall'}.`, rs.objCache];
  }
  function head() {
    $('.rooms', root).innerHTML = [0, 1, 2].map(i => `<i class="${i < st.roomIdx ? 'done' : i === st.roomIdx ? 'on' : ''}"></i>`).join('');
    const [t, ok] = objective(); const o = $('.obj', root); o.innerHTML = t; o.classList.toggle('ok', !!ok);
    $('.turn', root).textContent = `${reg.short} · Tier ${['', 'I', 'II', 'III', 'IV', 'V'][st.tier]} · Room ${st.roomIdx + 1} of 3 · Turn ${st.turn}`;
    $('[data-act="retreat"]', root).textContent = retreatArmed ? 'Really retreat? You keep your notes and lose most cases.' : 'Retreat';
  }
  function actions() {
    const u = unit(sel); const el = $('.actions', root); if (st.outcome) { el.innerHTML = ''; return; }
    const b = []; const dis = busy || !live(u);
    if (live(u)) {
      b.push(`<button class="act" data-mode="study" aria-pressed="${mode?.k === 'study'}" ${dis || u.ap < 1 ? 'disabled' : ''}><b>Study</b><small>1 action · range 3</small></button>`);
      for (const id of u.sh.abilities) { const A = D.ABILITIES[id]; const cd = u.cds[id] || 0; const free = u.fx.borrowed_moment && (u.abilN + 1) % 4 === 0;
        b.push(`<button class="act" data-abil="${id}" aria-pressed="${mode?.id === id}" ${dis || cd > 0 || (!free && u.ap < A.ap) ? 'disabled' : ''}><b>${esc(A.name)}</b><small>${cd > 0 ? `ready in ${cd}` : free ? 'free' : A.ap ? A.ap + (A.ap > 1 ? ' actions' : ' action') : 'free'}</small></button>`); }
      if (u.sh.dev) { const k = C.devKind(u); const I = C.DEV_INFO[k]; const nm = { lure: 'Lure Pod', barrier: 'Barrier Seed', pulse: 'Pulse Emitter', drone: 'Drone Core', blink: 'Blink Anchor', gravity: 'Gravity Knot' }[k];
        b.push(`<button class="act" data-mode="dev" aria-pressed="${mode?.k === 'dev'}" ${dis || u.charges <= 0 || u.ap < I.ap ? 'disabled' : ''}><b>${nm}</b><small>device · ${u.charges} left</small></button>`); }
    }
    const adv = C.canAdvance(st); const anyAp = mine().some(x => live(x) && x.ap > 0);
    if (adv) b.push(`<button class="act adv" data-act="next" ${busy ? 'disabled' : ''}><b>${st.roomIdx >= 2 ? 'Extract' : 'Move on'}</b><small>${st.roomIdx >= 2 ? 'end the expedition' : 'nothing here is hunting you'}</small></button>`);
    b.push(`<button class="act end ${!anyAp && !adv ? 'ready' : ''}" data-act="end" ${busy ? 'disabled' : ''}><b>End turn</b><small>${adv ? 'let the room move' : 'creatures act'}</small></button>`);
    el.innerHTML = b.join('');
  }
  function cards() {
    $('.scards', root).innerHTML = mine().map(u => `<button class="scard ${live(u) ? '' : 'down'}" data-sel="${u.id}" aria-pressed="${u.id === sel}">${face(u.kind)}<span class="nm">${esc(u.name)}<span class="num">${Math.max(0, u.hp)}/${u.max}${u.shield ? ' +' + u.shield : ''}</span></span><span class="bar"><i style="width:${Math.max(0, u.hp / u.max * 100)}%"></i></span><span class="sub label" style="grid-column:2">${live(u) ? D.ARCHETYPES[u.kind].name + ' · ' + u.ap + ' action' + (u.ap === 1 ? '' : 's') : 'Down. Back on their feet next room.'}</span></button>`).join('');
  }
  function panel() {
    const el = $('.info', root); let h = '';
    const u = info?.u != null ? unit(info.u) : null; const p = info?.p != null ? st.room.props.find(q => q.pid === info.p && !q.done) : null;
    if (u && live(u) && u.side === 'c') {
      const S = D.SPECIES[u.kind]; const sg = stage(u.kind); const tot = (G.state.cat['f:' + u.kind]?.study || 0) + (st.res.study[u.kind] || 0); const cap = u.variant ? 5 : 3; const pl = C.plan(st, u); const t = pl.tgt && unit(pl.tgt);
      h = `<div class="plate">${art(u.kind, { variant: u.variant })}</div><p class="label">${sg < 0 ? 'New to your Catalogue' : C.STAGE_NAME[sg]}</p><h4>${u.variant ? esc(D.VARIANTS[u.variant].name) + ' ' : ''}${esc(S.name)}</h4><p class="lat">${esc(S.latin)}</p>
        <dl class="kv" style="margin-top:8px"><dt>Health</dt><dd class="num">${u.hp}/${u.max}${u.armor ? ' · armor ' + u.armor : ''}</dd><dt>Bite</dt><dd class="num">${u.dmg[1] ? u.dmg[0] + '-' + u.dmg[1] : 'none'}</dd>
        <dt>Now</dt><dd style="color:${C.isHostile(st, u) ? 'var(--hostile)' : 'var(--calm)'}">${esc(pl.label)}${t && pl.k !== 'heal' ? ': ' + esc(t.name) : ''}</dd>
        <dt>Studied</dt><dd><span class="pips">${Array.from({ length: cap }, (_, i) => `<i class="${i < u.studied ? 'on' : ''}"></i>`).join('')}</span></dd></dl>
        ${u.variant ? `<p style="margin-top:8px"><span class="stamp">Variant</span> ${esc(D.VARIANTS[u.variant].note)}</p>` : ''}
        <p style="margin-top:8px;font-size:13.5px">${sg >= 1 ? esc(S.behavior) : `<span class="dim">${esc(S.blurb)} Its habits are unrecorded. ${Math.max(1, 4 - tot)} more study and the Catalogue will say how it behaves.</span>`}</p>
        ${!C.isHostile(st, u) && S.ai !== 'skittish' ? '<p class="dim" style="font-size:13px;margin-top:6px">It is leaving you alone. You do not have to fight it.</p>' : ''}`;
    } else if (p) {
      const F = p.kind === 'flora' ? D.FLORA[p.id] : p.kind === 'wonder' ? D.WONDERS[p.id] : { name: p.obj ? 'The sealed case' : 'A sealed case', blurb: 'Specimen case, lead seal intact. Opened at extraction.' };
      h = `<div class="plate">${art(p.id)}</div><p class="label">${p.kind === 'wonder' ? 'Wonder' : p.kind === 'flora' ? 'Flora' : 'Cache'}</p><h4>${esc(F.name)}</h4>${F.latin ? `<p class="lat">${esc(F.latin)}</p>` : ''}<p style="margin-top:8px;font-size:13.5px">${esc(F.blurb)}</p>${F.effect ? `<p style="margin-top:6px;font-size:13.5px;color:var(--gilt)">${esc(F.effect)}</p>` : ''}<p class="dim" style="font-size:13px;margin-top:6px">${p.walk ? 'Step on it, or stand beside it and tap it to cut it free.' : 'Stand a Seeker beside it and tap it. 1 action.'}</p>`;
    } else {
      const su = unit(sel);
      if (live(su)) { const w = su.sh.w; const res = su.sh.res.active;
        h = `<p class="label">${D.ARCHETYPES[su.kind].name} · level ${su.sh.lvl}</p><h4>${esc(su.name)}</h4><dl class="kv" style="margin-top:8px"><dt>Weapon</dt><dd class="num">${w.min}-${w.max} · ${C.weaponRange(st, su) > 1 ? 'range ' + C.weaponRange(st, su) : 'melee'}</dd><dt>Armor</dt><dd class="num">${su.armor}</dd><dt>Move</dt><dd class="num">${su.move}</dd><dt>Critical</dt><dd class="num">${su.sh.crit}%</dd></dl>
          ${res.map(r => `<div class="reso" style="margin-top:8px"><b>${D.RESONANCES[r].name}</b>${esc(D.RESONANCES[r].text)}</div>`).join('')}<p class="dim" style="font-size:13px;margin-top:8px">Tap any creature or object to read about it.</p>`; }
    }
    if (st.room.wonder && !info) { const w = D.WONDERS[st.room.wonder]; h += `<hr class="rule" style="margin:12px 0"><p class="label">In this room</p><p style="font-size:13.5px;color:var(--gilt)">${esc(w.name)}. ${esc(w.effect)}</p>`; }
    el.innerHTML = h; el.hidden = !h;
  }
  function hint() {
    const el = $('.hint', root); const u = unit(sel); let t = '';
    if (st.outcome) t = '';
    else if (busy) t = 'The room moves.';
    else if (mode?.k === 'abil') t = `<b>${esc(D.ABILITIES[mode.id].name)}.</b> ${esc(D.ABILITIES[mode.id].desc)} Tap a lit tile, or the button again to cancel.`;
    else if (mode?.k === 'study') t = `<b>Study.</b> Tap a lit creature within 3 tiles. Each one can be studied ${'three'} times. Enough study moves a species up a stage in your Catalogue.`;
    else if (mode?.k === 'dev') t = '<b>Device.</b> Tap a lit tile to use it.';
    else if (armed) t = '<b>It is calm.</b> Tap it again to attack anyway. It will fight back.';
    else if (C.canAdvance(st) && first && st.roomIdx === 0) t = '<b>The room is quiet.</b> Before you move on: the Mossback is harmless. Study it, pick the moss, then leave when you are ready.';
    else if (C.canAdvance(st)) t = `<b>Nothing here is hunting you.</b> Study, gather, or ${st.roomIdx >= 2 ? 'extract' : 'move on'}.`;
    else if (live(u) && u.ap > 0) t = first && st.turn <= 2 && st.roomIdx === 0 ? `<b>${esc(u.name)}</b> has ${u.ap} action${u.ap === 1 ? '' : 's'}. Tap a dotted tile to move. Tap a glowing creature to attack. Red lines show who each creature is coming for.` : `<b>${esc(u.name)}</b>: ${u.ap} action${u.ap === 1 ? '' : 's'} left.`;
    else t = 'No actions left. <b>End turn.</b>';
    el.innerHTML = t;
  }
  function float(x, y, txt, cls = '') { const f = document.createElement('div'); f.className = 'float ' + cls; f.textContent = txt; f.style.left = (x + .5) * 12.5 + '%'; f.style.top = y * 16.6667 + '%'; board.append(f); setTimeout(() => f.remove(), 900); }
  function banner(txt) { const b = document.createElement('div'); b.className = 'banner'; b.textContent = txt; board.append(b); setTimeout(() => b.remove(), 1000); }

  async function play(ev, before) {
    const vp = new Map(before.map(u => [u.id, { x: u.x, y: u.y, hp: u.hp, max: u.max }]));
    const at = id => { if (!vp.has(id)) { const u = unit(id); if (u) vp.set(id, { x: u.x, y: u.y, hp: u.max, max: u.max }); } return vp.get(id) || { x: 0, y: 0, hp: 1, max: 1 }; };
    const el = id => toks.querySelector(`[data-id="${id}"]`);
    for (const e of ev) {
      if (e.e === 'room') { banner(`Room ${e.idx + 1}`); return; }
      if (e.e === 'move') { const v = at(e.id); const t = el(e.id); for (const [x, y] of e.path) { v.x = x; v.y = y; if (t) pos(t, x, y); await sleep(e.shove ? 120 : 85); } await sleep(60); }
      else if (e.e === 'hit') { const v = at(e.id); v.hp -= e.n; const t = el(e.id); if (t) { t.classList.remove('hitfx'); void t.offsetWidth; t.classList.add('hitfx'); t.querySelector('.hp i').style.width = Math.max(0, v.hp / v.max * 100) + '%'; }
        float(v.x, v.y, (e.crit ? 'CRIT ' : '') + '-' + e.n + (e.dot && e.dot !== 'dot' ? ' ' + e.dot : ''), e.crit ? 'crit' : ''); await sleep(e.dot ? 130 : 230); }
      else if (e.e === 'heal') { const v = at(e.id); if (e.n > 0) { v.hp += e.n; float(v.x, v.y, '+' + e.n, 'heal'); const t = el(e.id); if (t) t.querySelector('.hp i').style.width = Math.min(100, v.hp / v.max * 100) + '%'; await sleep(120); } }
      else if (e.e === 'shield') { const v = at(e.id); float(v.x, v.y, e.n < 0 ? 'shield +' + -e.n : 'blocked ' + e.n, 'txt'); await sleep(110); }
      else if (e.e === 'text') { const v = at(e.id); float(v.x, v.y, e.msg, 'txt'); await sleep(180); }
      else if (e.e === 'status') { const v = at(e.id); float(v.x, v.y, { bleed: 'Bleeding', poison: 'Poisoned', mark: 'Marked', calm: 'Calmed', root: 'Held' }[e.s] || e.s, 'txt'); await sleep(110); }
      else if (e.e === 'study') { const v = at(e.id); float(v.x, v.y, '+' + e.n + ' study', 'study'); await sleep(260); }
      else if (e.e === 'die' || e.e === 'flee' || e.e === 'down') { const v = at(e.id); const t = el(e.id); if (t) t.classList.add('gone'); if (e.e === 'flee') float(v.x, v.y, 'Gone', 'txt'); if (e.e === 'down') float(v.x, v.y, 'Down', 'txt'); if (!e.quiet) await sleep(200); }
      else if (e.e === 'spawn') { const u = unit(e.id); if (u) { const t = tok(u); pos(t, u.x, u.y); vp.set(u.id, { x: u.x, y: u.y, hp: u.max, max: u.max }); await sleep(160); } }
      else if (e.e === 'eat') { const v = at(e.id); float(v.x, v.y, 'Feeds', 'txt'); await sleep(220); }
      else if (e.e === 'phase') { banner(e.who === 'c' ? 'The Cabinet moves' : 'Your turn'); await sleep(e.who === 'c' ? 520 : 380); }
      else if (e.e === 'tele') { const L = e.line; for (let y = 0; y < C.H; y++) for (let x = 0; x < C.W; x++) if (L.axis === 'row' ? y === L.i : x === L.i) tileEl(x, y).classList.add('danger'); await sleep(350); }
      else if (e.e === 'purge') { banner('Purge'); await sleep(300); }
      else if (e.e === 'burst' || e.e === 'trap' || e.e === 'trapset') { float(e.x, e.y, e.e === 'trapset' ? 'Snare set' : e.e === 'trap' ? 'Snap' : 'Pulse', 'txt'); await sleep(140); }
      else if (e.e === 'prop') { const t = toks.querySelector(`[data-pid="${e.pid}"]`); if (t) { t.classList.add('gone'); const p = st.room.props.find(q => q.pid === e.pid); if (p) float(p.x, p.y, p.kind === 'wonder' ? 'Recorded' : p.kind === 'cache' ? 'Case taken' : 'Gathered', 'study'); } await sleep(200); }
    }
  }
  async function send(a) {
    if (busy || st.outcome) return;
    const before = st.units.map(u => ({ id: u.id, x: u.x, y: u.y, hp: u.hp, max: u.max })); let ev;
    try { ev = C.apply(st, a); } catch (e) { if (e.illegal) { toast(e.message); return; } throw e; }
    log.push(a); store.set('unc.run', JSON.stringify({ at: run.at, log }));
    armed = null; retreatArmed = false; if (a.t !== 'move') mode = null; if (a.t === 'end' || a.t === 'next') { mode = null; info = null; }
    busy = true; actions(); hint(); tiles.querySelectorAll('.mv,.ab').forEach(t => t.classList.remove('mv', 'ab')); lines.innerHTML = '';
    await play(ev, before); busy = false;
    if (st.outcome) { sync(); await sleep(350); onFinish(log, st); return; }
    sync();
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
    const b = e.target.closest('button'); if (!b || busy) return;
    if (b.dataset.sel) { const u = unit(+b.dataset.sel); if (live(u)) { sel = u.id; mode = null; info = null; armed = null; sync(); } return; }
    if (b.dataset.abil) { const id = b.dataset.abil; const u = unit(sel); if (D.ABILITIES[id].target === 'self') return send({ t: 'abil', u: u.id, a: id }); mode = mode?.id === id ? null : { k: 'abil', id }; armed = null; sync(); return; }
    if (b.dataset.mode) { mode = mode?.k === b.dataset.mode ? null : { k: b.dataset.mode }; armed = null; sync(); return; }
    if (b.dataset.act === 'end') return send({ t: 'end' });
    if (b.dataset.act === 'next') return st.roomIdx === 0 ? choosePath() : send({ t: 'next' });
    if (b.dataset.act === 'retreat') { if (retreatArmed) return send({ t: 'abandon' }); retreatArmed = true; head(); return; }
    if (b.classList.contains('tile')) {
      const x = +b.dataset.x, y = +b.dataset.y; const o = C.unitAt(st, x, y); const p = propAt(x, y); const a = targets().get(x + ',' + y);
      if (o && o.side === 's' && !(mode && a)) { sel = o.id; mode = null; info = null; armed = null; return sync(); }
      if (a) {
        if (a.t === 'atk' && !C.isHostile(st, o) && armed !== o.id) { armed = o.id; info = { u: o.id }; return sync(); }
        if (a.t === 'use' || a.t === 'atk') info = null; return send(a);
      }
      if (mode) { mode = null; }
      armed = null; info = o ? { u: o.id } : p ? { p: p.pid } : null; sync();
    }
  };
  sync(); if (st.outcome) { onFinish(log, st); return; } if (log.length === 0) banner(reg.short);
}
