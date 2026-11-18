// Camp: everything between expeditions.
import { C, D, G, $, esc, art, face, store, toast, op, flush, serverOp, load, loadWorld, register, newKey, itemCard, itemMini, ago, accession, ROMAN, wornBy, modLine, itemArt } from './ui.js';
import { mountBattle, NATURE } from './battle.js';
// What a Mastered entry adds: who each resident lives beside, eats, or avoids.
// What one more expedition would finish: the nearest milestones and the animals closest to their next stage.
function closeTo(st) { const ctx = C.indexCtx(st); const rows = [];
  for (const m of D.MILESTONES.filter(m => !st.unlocks[m.id])) { const [h, n] = m.test(ctx); if (h < n) rows.push({ k: (n - h) / n, t: esc(m.reward), s: esc(m.need), h, n }); }
  rows.sort((a, b) => a.k - b.k); const out = rows.slice(0, 2);
  const sp = []; for (const key in st.cat) { if (key[0] !== 'f') continue; const e = st.cat[key], s = C.stageOf(e); if (s >= 3) continue; const [ns, nm] = C.STAGE_REQ[s + 1]; const ds = Math.max(0, ns - (e.study || 0)), dm = Math.max(0, nm - (e.samples || 0)); if (ds + dm === 0) continue; sp.push({ k: ds + 2 * dm, id: key.slice(2), s, ds, dm, ns, nm, e }); }
  sp.sort((a, b) => a.k - b.k); for (const x of sp.slice(0, 2)) out.push({ t: `${esc(D.SPECIES[x.id].name)} becomes ${C.STAGE_NAME[x.s + 1]}`, s: [x.ds ? `${x.ds} more field note${x.ds === 1 ? '' : 's'}` : '', x.dm ? `${x.dm} more sample${x.dm === 1 ? '' : 's'}` : ''].filter(Boolean).join(' and '), h: Math.min(x.e.study || 0, x.ns) + Math.min(x.e.samples || 0, x.nm), n: x.ns + x.nm });
  if (!out.length) return '';
  return `<div><div class="sec-head"><h3>Within reach</h3><span class="label">one more expedition</span></div><div class="reach">${out.map(m => `<div class="mile"><div class="t"><span>${m.t}</span><span class="num dim">${m.h}/${m.n}</span></div><div class="bar gilt"><i style="width:${Math.min(100, m.h / m.n * 100)}%"></i></div><span class="label">${m.s}</span></div>`).join('')}</div></div>`; }
const COAT = { pale: 'Pale', gilded: 'Gilded', overgrown: 'Overgrown' };
const ECO = {
  thornling: 'Packs trail Mossbacks for the seed that falls from their gardens. They will not touch a Gulper Vine and give it a wide berth.',
  mossback: 'Its shell garden feeds half the hall. Glasswings roost in it at night and Lantern Moss spreads wherever it sleeps.',
  glasswing: 'Drawn to any light. Hush take them on the wing, so a hall with no Glasswings usually has a Hush in it.',
  gulper: 'It does not hunt. It waits beside the paths the Thornlings use, and it has never been seen to move in daylight.',
  carrion: 'It follows whatever does the killing. The petals at its throat are the flowers of the things it has eaten.',
  stalkbriar: 'It keeps the Dewhare herds thin and the Carrion Blooms fed. A Hush will drive one off its kill without a fight.',
  dewhare: 'It grazes the low ferns and drinks from Mirror Reeds. Most of what hunts in the Galleries is hunting this.',
  lampmoth: 'It gathers at the old lamps as if they were its own kind. Glasswings follow it, and so does anything that eats them.',
  hush: 'The top of the hall. Everything else goes quiet when one is near, which is where the name comes from.',
  orchardmother: 'The Thornlings are hers. Every seed pod in the Galleries fell from one of her kind, and she remembers each one.',
  latchjaw: 'It was the catcher for this wing. The Wardens were built later, to protect the exhibits from it.',
  tickwren: 'Flocks nest in the Orrery and feed on filings the Mites leave. Latchjaws take them and Arc Mantises take what the Latchjaws miss.',
  lamplighter: 'Everything in the Wilds that hunts by light follows its round. Mites oil it and a Pollinator will mend it before anything else.',
  mite: 'They service the larger machines and are tolerated for it. A swarm with nothing to repair starts taking things apart.',
  pollinator: 'It carries filings between the copper lilies. The Wardens will not let anything near one.',
  coilfawn: 'Built to be chased. The Arc Mantis hunts them, and a herd that stops running winds down within the hour.',
  warden: 'It guards the Pollinators and the Coilfawns alike. Nobody has found who set it to.',
  mantis: 'It hunts Coilfawns for the spring steel. It will leave a Seeker alone if there is a fawn in reach.',
  regulator: 'Everything in the Wilds keeps its time. Stop it and the whole garden runs a little fast for a while.',
};

const app = $('#app');
const V = { tab: 'board', contract: 0, tier: {}, squad: null, seeker: null, slot: null, cat: 'Fauna', catKey: null, benchItem: null, benchTab: 'pack', filter: 'all', report: null, opened: {}, rec: 'feed', mounted: false, landErr: '', code: false, asmTier: 1 };
const TABS = [['board', 'Expeditions'], ['seekers', 'Seekers'], ['catalogue', 'Catalogue'], ['bench', 'Workbench'], ['record', '<span class="the">The </span>Record']];
const S = () => G.state;
const RAR = r => D.RARITIES.indexOf(r);
const plateBox = (key, o = {}) => `<div class="plate ${o.unknown ? 'unknown' : ''}">${art(key, o)}</div>`;
const pendingFor = s => s.pts > 0 || (s.lvl >= D.SPEC_LEVEL && !s.spec) || s.traits.length < D.TRAIT_LEVELS.filter(l => s.lvl >= l).length;
const have = k => !!S().cat[k];
const cost = c => { const ok = S().comps >= c.comps && C.matCount(S(), c.fam) >= c.mats; return `<span class="cost ${ok ? '' : 'short'}">${c.comps} components${c.mats ? ` · ${c.mats} ${D.FAMILY_NAME[c.fam].toLowerCase()} material` : ''}</span>`; };

// ---------------------------------------------------------------- boot
async function boot() {
  G.key = store.get('unc.key');
  if (G.key) { try { if (!(await load())) G.key = null; } catch (e) { app.innerHTML = `<p class="boot">${esc(e.message)}</p><p style="text-align:center"><button class="btn" onclick="location.reload()">Try again</button></p>`; return; } }
  if (!G.key) await loadWorld();
  render();
  setInterval(async () => { if (document.hidden || !G.key || S()?.run || V.report) return; await loadWorld(); if (V.tab === 'board' || V.tab === 'record') render(); }, 60000);
}
function render() {
  if (!S()) return landing();
  if (V.report) { app.innerHTML = report(); return; }
  if (S().run) { if (!V.mounted) { V.mounted = true; window.scrollTo(0, 0); mountBattle(app, finish); } return; }
  V.mounted = false;
  const st = S(); const sc = C.score(st);
  app.innerHTML = `<header class="top"><div class="wrap"><div class="mark">Wildhall</div>
    <nav class="nav" aria-label="Sections">${TABS.map(([id, n]) => `<button data-tab="${id}" ${V.tab === id ? 'aria-current="page"' : ''}>${n}${id === 'seekers' && st.roster.some(s => pendingFor(st.seekers[s])) ? '<span class="pip"></span>' : ''}</button>`).join('')}</nav>
    <div class="purse" title="Components and research"><span><b>${st.comps}</b> comp</span><span><b>${st.research}</b> research</span></div></div></header>
    <main class="wrap">${{ board, seekers, catalogue, bench, record }[V.tab]()}</main>`;
}

// ---------------------------------------------------------------- landing
function feedList(n) {
  const f = (G.world?.feed || []).slice(0, n); if (!f.length) return '<p class="dim" style="font-size:14px">Nothing has been catalogued yet. The first name in the ledger could be yours.</p>';
  return `<ul class="feed">${f.map(e => { const key = feedArt(e); return `<li>${art(key.k, key.o)}<div><span>${feedText(e)}</span><small>${e.region ? esc(D.REGIONS[e.region]?.short || '') + ' · ' : ''}${ago(e.at, G.world.now)}</small></div></li>`; }).join('')}</ul>`;
}
function feedArt(e) { const all = C.allKeys().map(k => ({ k, i: C.keyInfo(k) })); const m = all.find(x => x.i.name === e.title); if (m && m.i.art) return { k: m.i.art, o: { variant: m.i.variant } }; if (e.kind === 'milestone') return { k: 'research', o: {} }; return { k: 'cache', o: {} }; }
function feedText(e) {
  const who = `<b>${esc(e.who)}</b>`;
  if (e.kind === 'first') return `${who} was first to catalogue <b>${esc(e.title)}</b> <span class="dim">(${esc(e.detail)})</span>`;
  if (e.kind === 'find') return `${who} recovered <b class="r-${esc(e.rarity)}"><span class="rar">${esc(e.title)}</span></b> <span class="dim">(${esc(e.detail)})</span>`;
  if (e.kind === 'mastery') return `${who} mastered <b>${esc(e.title)}</b>`;
  return `<b>${esc(e.title)}.</b> ${esc(e.detail)}`;
}
function landing() {
  const wall = ['glasswing', 'pocket_sun', 'mossback', 'second_heart', 'thornling', 'regulator', 'lantern_moss', 'coilfawn', 'hush'];
  app.innerHTML = `<div class="wrap"><div class="land"><div class="stack" style="gap:22px">
    <h1><i>Field catalogue of</i>Wildhall</h1>
    <p class="lede">Someone built a world to hold every extraordinary thing in existence. Then they left. The exhibits got out, bred and changed, and the catalogue stopped updating.</p>
    <p class="lede"><b>You are here to finish it.</b> Take three Seekers in. Study what lives there, or fight it, or both. Whatever you record first carries your name for every player after you.</p>
    <form class="stack" id="join" style="gap:8px"><div class="ledger"><input id="name" maxlength="16" autocomplete="nickname" placeholder="${V.code ? 'Paste your carry code' : 'Sign the ledger'}" aria-label="${V.code ? 'Carry code' : 'Your Seeker name'}"><button class="btn go" type="submit">${V.code ? 'Return' : 'Enter the Cabinet'}</button></div>
    <p class="err">${esc(V.landErr)}</p><p style="font-size:13.5px"><button type="button" class="link" data-act="code">${V.code ? 'I am new here' : 'I have a carry code from another device'}</button></p></form>
    <div><div class="sec-head"><span class="label">Lately in the Cabinet</span><span class="label">${G.world ? G.world.seekers + ' in the ledger' : ''}</span></div>${feedList(4)}</div>
    </div><div class="wall" aria-hidden="true">${wall.map(k => plateBox(k)).join('')}</div></div></div>`;
  if (V.code) $('#name').maxLength = 128;
  $('#join').onsubmit = async e => {
    e.preventDefault(); const v = $('#name').value.trim(); if (!v) return; const btn = $('#join button[type=submit]'); btn.disabled = true; V.landErr = '';
    try {
      if (V.code) { G.key = v; if (!(await load())) { G.key = null; throw new Error('That code is not in the ledger.'); } }
      else { G.key = newKey(); try { await register(v); } catch (er) { G.key = null; throw er; } }
      store.set('unc.key', G.key); V.tab = 'board'; render();
    } catch (er) { V.landErr = er.message; landing(); }
  };
}

// ---------------------------------------------------------------- expeditions
function contractCard(c, i, selected) {
  const R = D.REGIONS[c.region]; const T = D.CONTRACT_TYPES[c.type];
  const tgt = c.type === 'pursue' ? R.boss : c.type === 'observe' ? R.observe : c.type === 'harvest' ? R.flora[0] : 'cache';
  const title = c.type === 'pursue' ? `Bring down ${D.SPECIES[R.boss].name}` : c.type === 'observe' ? `Observe the ${D.SPECIES[R.observe].name}` : c.type === 'harvest' ? 'Harvest the flora' : 'Recover the sealed case';
  const text = c.type === 'observe' ? `Record six studies of the ${D.SPECIES[R.observe].name} and leave every one of them alive.` : c.type === 'harvest' ? 'Gather four plants along the way. The great one waits at the end.' : c.type === 'pursue' ? 'Six halls and five forks, then the great one. Kill it.' : T.text;
  const known = c.type === 'pursue' || c.type === 'observe' ? have('f:' + tgt) : true;
  return `<button class="contract" data-contract="${i}" aria-pressed="${selected}">
    <div class="row" style="gap:6px"><span class="label">${c.weekly ? 'Weekly trial · same rooms for everyone' : esc(R.short)}</span></div>
    <div class="who">${known ? art(tgt) : `<span class="art" style="opacity:.25">${art(tgt)}</span>`}<h3>${esc(title)}</h3></div>
    <p>${esc(text)}</p>
    ${c.mods?.bloom ? '<span class="chip">Bloom · stranger rooms, richer cases</span>' : ''}${c.mods?.hunt ? '<span class="chip">Hunt · an elite in every room</span>' : ''}
    <p class="finds">Bonus case: ${D.FAMILY_NAME[c.target.fam].toLowerCase()} ${D.SLOT_NAME[c.target.slot].toLowerCase()}, likely</p></button>`;
}
function board() {
  const st = S(); const wk = C.weeklyContract(Date.now()); const list = st.board.list;
  if (!V.squad) V.squad = st.roster.slice(0, 3); V.squad = V.squad.filter(s => st.roster.includes(s));
  const weekly = V.contract === 'w'; const c = weekly ? wk : list[V.contract] || list[0]; const maxT = st.tierMax[c.region]; const tier = weekly ? 3 : Math.min(V.tier[c.region] || maxT, maxT);
  const wkLocked = !st.unlocks.clockwork && wk.region === 'clockwork';
  const wdone = st.weekly.id === wk.week && st.weekly.done; const wbest = st.weekly.id === wk.week ? st.weekly.best : 0;
  const next = D.MILESTONES.filter(m => !st.unlocks[m.id]).slice(0, 3); const ctx = C.indexCtx(st);
  const sg = C.dailySighting(Date.now(), st); const sgDone = st.daily && st.daily.id === sg.day; const streak = st.daily && st.daily.id >= sg.day - 1 ? st.daily.streak : 0; const hrs = Math.max(1, Math.ceil((86400000 - Date.now() % 86400000) / 3600000));
  const sight = !st.stats.runs ? '' : `<div class="panel sighting ${sgDone ? 'done' : ''}">${plateBox(sg.kind, { variant: sg.variant })}<div><p class="label">Today's sighting · ${esc(D.REGIONS[sg.region].short)}</p><h3>${COAT[sg.variant]} ${esc(D.SPECIES[sg.kind].name)}</h3>
      <p class="dim">${sgDone ? `Recorded. The next report comes in ${hrs} hour${hrs === 1 ? '' : 's'}.` : `One was reported in the first hall. Study it, sample it or bring it down for <b class="num">+${C.sightingBonus(streak + 1)}</b> research. Gone in ${hrs} hour${hrs === 1 ? '' : 's'}.`}</p>
      <p class="streak">${streak ? `<b class="num">${streak}</b> day${streak === 1 ? '' : 's'} in a row${sgDone ? '' : ' · keep it going today'}` : 'Meet one each day and the bonus grows, up to +10.'}</p></div></div>`;
  return `<div class="cols"><div class="stack" style="gap:22px">${sight}
    <div><div class="sec-head"><h2>Postings</h2><button class="link" data-act="reboard" ${st.research < 3 ? 'disabled style="opacity:.4"' : ''}>New postings · 3 research</button></div>
      <div class="contracts">${list.map((c, i) => contractCard(c, i, V.contract === i)).join('')}${wkLocked ? '' : contractCard(wk, 'w', weekly)}</div>
      ${weekly ? `<p class="dim" style="font-size:13.5px;margin-top:8px">Tier III, fixed. Scored on speed, studies and damage taken. ${wbest ? 'Your best this week: <b class="num">' + wbest + '</b>. ' : ''}${wdone ? 'This week\'s reward case is already yours. Runs still count for rank.' : 'First win of the week pays a trial case.'}</p>` : ''}</div>
    <div><div class="sec-head"><h3>Who goes in</h3><span class="label">up to three</span></div>
      <div class="squad">${st.roster.map(id => { const s = st.seekers[id]; return `<button class="pick" data-pick="${id}" aria-pressed="${V.squad.includes(id)}">${face(s.arch)}<span><b>${esc(s.name)}</b><small>${D.ARCHETYPES[s.arch].name} · level ${s.lvl}</small></span></button>`; }).join('')}</div></div>
    <div class="row" style="gap:16px">${weekly ? '' : `<div class="stepper" title="Higher tiers hit harder and drop stronger equipment"><button data-tier="-1" ${tier <= 1 ? 'disabled' : ''} aria-label="Lower tier">&minus;</button><span>Tier ${ROMAN[tier]}</span><button data-tier="1" ${tier >= maxT ? 'disabled' : ''} aria-label="Higher tier">+</button></div>`}
      <button class="btn go" data-act="start" ${!V.squad.length || G.busy ? 'disabled' : ''}>Set out</button>
      ${!weekly && maxT < 5 ? `<span class="dim" style="font-size:13px">Bring down ${esc(D.SPECIES[D.REGIONS[c.region].boss].name)} at Tier ${ROMAN[maxT]} to open Tier ${ROMAN[maxT + 1]}.</span>` : ''}</div>
    </div>
    <aside class="stack" style="gap:22px">
      <div><div class="sec-head"><span class="label">The Index</span><span class="label num">${ctx.entries} / ${C.allKeys().length}</span></div>
        ${next.map(m => { const [h, n] = m.test(ctx); return `<div class="mile"><div class="t"><span>${esc(m.reward)}</span><span class="num dim">${Math.min(h, n)}/${n}</span></div><div class="bar gilt"><i style="width:${Math.min(100, h / n * 100)}%"></i></div><span class="label">${esc(m.need)}</span></div>`; }).join('') || '<p class="dim">Every milestone reached.</p>'}</div>
      <div><div class="sec-head"><span class="label">Lately in the Cabinet</span></div>${feedList(7)}</div>
    </aside></div>`;
}

// ---------------------------------------------------------------- seekers
function seekers() {
  const st = S(); if (!V.seeker || !st.roster.includes(V.seeker)) V.seeker = st.roster[0];
  const s = st.seekers[V.seeker]; const A = D.ARCHETYPES[s.arch]; const sh = C.sheet(st, s.id);
  const slotsOpen = D.TRAIT_LEVELS.filter(l => s.lvl >= l).length;
  let choose = '';
  if (s.lvl >= D.SPEC_LEVEL && !s.spec) choose += `<div><p class="label" style="margin-bottom:6px;color:var(--gilt)">Choose a specialization</p><div class="choice">${D.SPECS[s.arch].map(x => `<button data-spec="${x.id}"><b>${x.name}</b>${esc(x.desc)}</button>`).join('')}</div></div>`;
  if (s.traits.length < slotsOpen) choose += `<div><p class="label" style="margin-bottom:6px;color:var(--gilt)">Choose a trait</p><div class="choice">${C.traitOffer(s).map(t => `<button data-trait="${t}"><b>${D.TRAITS[t].name}</b>${esc(D.TRAITS[t].desc)}</button>`).join('')}</div></div>`;
  const pool = V.slot ? Object.values(st.items).filter(it => C.itemDef(it).slot === V.slot).sort((a, b) => RAR(b.rar) - RAR(a.rar) || b.tier - a.tier) : [];
  const near = []; if (V.slot == null) for (const id in D.RESONANCES) { if (sh.res.active.includes(id) || sh.res.dormant.includes(id)) continue; near.push(id); }
  return `<div class="tabs" role="tablist">${st.roster.map(id => { const x = st.seekers[id]; return `<button role="tab" data-seeker="${id}" aria-selected="${id === s.id}">${esc(x.name)}<span class="n">${x.lvl}</span>${pendingFor(x) ? ' <span style="color:var(--gilt)">&#9679;</span>' : ''}</button>`; }).join('')}</div>
  <div class="cols" style="margin-top:18px"><div class="stack" style="gap:18px">
    <div class="row" style="gap:14px;align-items:flex-start"><img class="bigport" src="assets/portraits/${s.arch}.jpg" alt="Portrait of ${esc(s.name)}"><div class="grow"><h2>${esc(s.name)}</h2><p class="label">${A.name}${s.spec ? ' · ' + D.SPECS[s.arch].find(x => x.id === s.spec).name : ''} · level ${s.lvl}</p><p class="dim" style="font-size:14px;margin-top:4px">${esc(A.bio)}</p>
      ${s.lvl < D.LEVEL_CAP ? `<div class="bar" style="margin-top:8px"><i style="width:${s.xp / C.xpNext(s.lvl) * 100}%"></i></div><p class="label" style="margin-top:3px">${s.xp} / ${C.xpNext(s.lvl)} to level ${s.lvl + 1}</p>` : '<p class="label" style="margin-top:6px">Level cap</p>'}</div></div>
    ${choose}
    <div><div class="sec-head"><h3>Equipment</h3><span class="label">tap a slot to change it</span></div>
      <div class="doll">${D.SLOTS.map(sl => { const it = s.gear[sl] && st.items[s.gear[sl]]; return it ? `<button class="slot full r-${it.rar}" data-slot="${sl}" aria-pressed="${V.slot === sl}"><span class="label">${D.SLOT_NAME[sl]}</span>${itemArt(it)}<span class="nm rar">${esc(C.itemName(it))}</span></button>` : `<button class="slot" data-slot="${sl}" aria-pressed="${V.slot === sl}"><span class="label">${D.SLOT_NAME[sl]}</span><span class="dim" style="font-size:13px;margin-top:auto">Empty</span></button>`; }).join('')}</div></div>
    ${V.slot ? `<div><div class="sec-head"><h3>${D.SLOT_NAME[V.slot]}s in your pack</h3><button class="link" data-slot="${V.slot}">Close</button></div><div class="inv">${pool.map(it => itemCard(it, { forSeeker: s.id, acts: s.gear[V.slot] === it.id ? `<button class="btn sm" data-unequip="${V.slot}">Take off</button>` : `<button class="btn sm go" data-equip="${it.id}">Equip${wornBy(it.id) ? ' (from ' + esc(wornBy(it.id).name) + ')' : ''}</button>` })).join('') || '<p class="dim">Nothing for this slot yet. Cases from expeditions fill it.</p>'}</div></div>` : ''}
    ${sh.sets.length ? `<div><div class="sec-head"><h3>Sets</h3><span class="label">pieces of one set worn together</span></div><div class="stack" style="gap:8px">${sh.sets.map(x => { const S0 = D.SETS[x.id]; return `<div class="reso ${x.n >= 2 ? '' : 'off'}"><b>${esc(S0.name)} · ${x.n} of ${S0.pieces.length}</b>${Object.entries(S0.bonus).map(([need, b]) => `<span class="sb ${x.n >= +need ? 'on' : ''}"><i>${need}</i>${esc(Object.entries(b).map(([k, v]) => modLine(k, v)).join(', '))}</span>`).join('')}<span class="dim" style="display:block;margin-top:4px;font-size:12px">${esc(S0.pieces.map(b => D.BASES[b].name).join(' · '))}</span></div>`; }).join('')}</div></div>` : ''}
    <div><div class="sec-head"><h3>Resonances</h3><span class="label">two tags on two different items · two at once</span></div><div class="stack" style="gap:8px">
      ${sh.res.active.map(r => `<div class="reso"><b>${D.RESONANCES[r].name}</b>${esc(D.RESONANCES[r].text)}</div>`).join('')}${sh.res.dormant.map(r => `<div class="reso off"><b>${D.RESONANCES[r].name} (dormant, limit is two)</b>${esc(D.RESONANCES[r].text)}</div>`).join('')}
      ${!sh.res.active.length ? `<p class="dim" style="font-size:14px">None awake. Every item carries tags. Put the right two tags on ${esc(s.name)} and something new happens. The Catalogue lists all ${Object.keys(D.RESONANCES).length}.</p>` : ''}</div></div>
    </div>
    <aside class="stack" style="gap:18px">
      <div><div class="sec-head"><span class="label">Attributes</span>${s.pts ? `<span class="label" style="color:var(--gilt)">${s.pts} to spend</span>` : ''}</div><div class="attr">${D.ATTRS.map(a => `<span title="${esc(D.ATTR_INFO[a][1])}">${D.ATTR_INFO[a][0]}<br><small class="dim" style="font-size:12px">${esc(D.ATTR_INFO[a][1])}</small></span><span class="num">${s.attr[a]}</span>${s.pts ? `<button data-attr="${a}" aria-label="Raise ${D.ATTR_INFO[a][0]}">+</button>` : '<span></span>'}`).join('')}</div></div>
      <div><span class="label">In the field</span><dl class="kv" style="margin-top:6px"><dt>Health</dt><dd class="num">${sh.maxHp}</dd><dt>Weapon</dt><dd class="num">${sh.w.min}-${sh.w.max} · ${sh.w.range > 1 ? 'range ' + sh.w.range : 'melee'}</dd><dt>Armor</dt><dd class="num">${sh.armor}</dd><dt>Move</dt><dd class="num">${sh.move}</dd><dt>Critical</dt><dd class="num">${sh.crit}%</dd></dl></div>
      <div><span class="label">Abilities</span>${A.abilities.map(id => { const a = D.ABILITIES[id]; return `<div class="abil"><img src="assets/icons/${id}.jpg" alt="" onerror="this.remove()"><b>${a.name}</b><span class="c">${a.ap ? a.ap + ' action' + (a.ap > 1 ? 's' : '') : 'free'} · ${a.cd} turn cooldown</span><span style="grid-column:1/-1" class="dim">${esc(a.desc)}</span></div>`; }).join('')}
        <div class="abil"><b>Innate</b><span></span><span style="grid-column:1/-1" class="dim">${esc(A.passive)}</span></div>
        ${s.spec ? `<div class="abil"><b>${D.SPECS[s.arch].find(x => x.id === s.spec).name}</b><span></span><span style="grid-column:1/-1" class="dim">${esc(D.SPECS[s.arch].find(x => x.id === s.spec).desc)}</span></div>` : `<div class="abil"><b class="dim">Specialization</b><span class="c">level ${D.SPEC_LEVEL}</span></div>`}
        ${s.traits.map(t => `<div class="abil"><b>${D.TRAITS[t].name}</b><span></span><span style="grid-column:1/-1" class="dim">${esc(D.TRAITS[t].desc)}</span></div>`).join('')}
        ${slotsOpen < D.TRAIT_LEVELS.length ? `<div class="abil"><b class="dim">Next trait</b><span class="c">level ${D.TRAIT_LEVELS[slotsOpen]}</span></div>` : ''}</div>
    </aside></div>`;
}

// ---------------------------------------------------------------- catalogue
const CATS = { Fauna: () => Object.keys(D.SPECIES).map(k => 'f:' + k), Flora: () => Object.keys(D.FLORA).map(k => 'p:' + k), Relics: () => Object.keys(D.BASES).map(k => 'b:' + k).concat(Object.keys(D.SINGULARS).map(k => 's:' + k)), Materials: () => Object.keys(D.MATERIALS).map(k => 'm:' + k), Wonders: () => Object.keys(D.WONDERS).map(k => 'w:' + k), Resonances: () => Object.keys(D.RESONANCES).map(k => 'r:' + k) };
function firstLine(key) { const f = G.firsts[key]; if (!f) return have(key) && !['b', 'm'].includes(key[0]) ? '' : ''; return `<p style="font-size:13px"><span class="stamp">First catalogued</span> <span class="dim">by</span> <b>${esc(f.who)}</b> <span class="dim">· ${ago(f.at, G.world?.now)}</span></p>`; }
function catDetail(key) {
  const st = S(); const [t, id] = key.split(':'); const e = st.cat[key]; const info = C.keyInfo(key);
  if (!e) { const f = G.firsts[key]; return `<div class="panel detail stack">${info.art ? plateBox(info.art, { unknown: true }) : ''}<p class="label">${accession(key)}</p><h3 class="dim">Uncatalogued</h3><p class="dim" style="font-size:14px">${t === 's' ? 'A Singular. One of a kind in its workings. Great ones carry them, rarely.' : t === 'w' ? 'A Wonder. They turn up unannounced. Quiet rooms and Bloom contracts show more of them.' : t === 'f' ? 'Something lives in the ' + D.REGIONS[D.SPECIES[id].region].short + ' that you have not met.' : t === 'r' ? '' : 'You have not found this yet.'}</p>${f ? `<p style="font-size:13px" class="dim">Somebody has. <b style="color:var(--ink)">${esc(f.who)}</b> catalogued it first.</p>` : t !== 'r' && t !== 'm' && t !== 'b' ? '<p style="font-size:13px;color:var(--gilt)">Nobody has catalogued this. The first name on it is permanent.</p>' : ''}${t === 'r' ? resoBody(id, false) : ''}</div>`; }
  let body = '';
  if (t === 'f') { const Sx = D.SPECIES[id]; const sg = C.stageOf(e); const nx = C.STAGE_REQ[sg + 1];
    body = `<p class="lat">${esc(Sx.latin)}</p><div class="track">${C.STAGE_NAME.map((n, i) => `<div class="${i <= sg ? 'on' : ''}">${n}</div>`).join('')}</div>
      <dl class="kv"><dt>Studies</dt><dd class="num">${e.study || 0}${nx ? ' / ' + nx[0] : ''}</dd><dt>Samples</dt><dd class="num">${e.samples || 0}${nx && nx[1] ? ' / ' + nx[1] : ''}</dd><dt>Home</dt><dd>${D.REGIONS[Sx.region].short}</dd>${sg >= 1 ? `<dt>Yields</dt><dd>${D.MATERIALS[Sx.mat].name}</dd>` : ''}</dl>
      <p style="font-size:14px">${esc(Sx.blurb)}</p>
      <div class="record">${[[1, 'Behaviour', Sx.behavior], [1, 'Weak to', D.FAMILY_NAME[Sx.weak] + ' weapons. They hit it 35% harder.'], [1, 'How to handle it', (NATURE[Sx.ai] || ['', ''])[1]], [2, 'Resists', D.FAMILY_NAME[Sx.resist] + ' weapons. They do 30% less.'], [2, 'Edge', 'Every Seeker deals 10% more damage to it.'], [3, 'Ecology', ECO[id] || '']]
        .map(([need, lab, txt]) => sg >= need ? `<div class="rec on"><span class="label">${lab}</span><p>${esc(txt)}</p></div>` : `<div class="rec"><span class="label">${lab}</span><p class="redact" aria-hidden="true">${'&#9608;'.repeat(Math.min(34, 10 + (txt.length >> 2)))}</p><small>${C.STAGE_NAME[need]}: ${Math.max(0, C.STAGE_REQ[need][0] - (e.study || 0))} more stud${C.STAGE_REQ[need][0] - (e.study || 0) === 1 ? 'y' : 'ies'}${C.STAGE_REQ[need][1] > (e.samples || 0) ? ', ' + (C.STAGE_REQ[need][1] - (e.samples || 0)) + ' more sample' + (C.STAGE_REQ[need][1] - (e.samples || 0) === 1 ? '' : 's') : ''}</small></div>`).join('')}</div>
      <p class="dim" style="font-size:12.5px">Notes come from Study, and from watching what it does when it has not noticed you. Samples come from kills, old specimen cases, and a Naturalist studying a calm one.</p>
      ${Sx.boss ? '' : `<div><span class="label">Variants</span><div class="vars" style="margin-top:6px">${Object.keys(D.VARIANTS).map(v => { const k = 'v:' + id + ':' + v; return `<div style="text-align:center" title="${have(k) ? esc(D.VARIANTS[v].note) : 'Not yet seen'}">${plateBox(id, { variant: v, unknown: !have(k) })}<span class="acc label ${G.firsts[k] && st.cat[k]?.first ? 'first' : ''}">${D.VARIANTS[v].name}</span></div>`; }).join('')}</div></div>`}`; }
  else if (t === 'p') body = `<p class="lat">${esc(D.FLORA[id].latin)}</p><p style="font-size:14px">${esc(D.FLORA[id].blurb)}</p><dl class="kv"><dt>Gathered</dt><dd class="num">${e.n || 0}</dd><dt>Yields</dt><dd>${D.MATERIALS[D.FLORA[id].mat].name}</dd></dl>`;
  else if (t === 'w') body = `<p style="font-size:14px">${esc(D.WONDERS[id].blurb)}</p><p style="font-size:14px;color:var(--gilt)">${esc(D.WONDERS[id].effect)}</p>`;
  else if (t === 'm') body = `<p style="font-size:14px">${esc(D.MATERIALS[id].blurb)}</p><dl class="kv"><dt>Held</dt><dd class="num">${st.mats[id] || 0}</dd><dt>Family</dt><dd>${D.FAMILY_NAME[D.MATERIALS[id].fam]}</dd></dl>`;
  else if (t === 'b') { const B = D.BASES[id]; const can = Object.keys(D.AFFIXES).filter(a => D.AFFIXES[a].slots.includes(B.slot) && D.AFFIXES[a].fams.includes(B.fam)); const known = can.filter(a => st.aff[a]);
    body = `<p class="label">${D.FAMILY_NAME[B.fam]} ${D.SLOT_NAME[B.slot]}</p><p style="font-size:14px">${esc(B.text || Object.keys(B.m || {}).map(k => modLine(k, B.m[k])).join('. '))}</p>${B.tags.length ? `<div class="tags">${B.tags.map(x => `<span class="tag">${D.TAG_NAME[x]}</span>`).join('')}</div>` : ''}
      <div><span class="label">Known properties · ${known.length} of ${can.length}</span><ul style="margin:6px 0 0;padding:0;list-style:none;font-size:13.5px;display:grid;gap:2px">${can.map(a => st.aff[a] ? `<li>${esc(D.AFFIXES[a].pre)} <span class="dim">· ${esc(modLine(D.AFFIXES[a].key, D.AFFIXES[a].r[0] + ' to ' + D.AFFIXES[a].r[1]))}</span></li>` : '<li class="dim">Unidentified</li>').join('')}</ul></div>`; }
  else if (t === 's') { const X = D.SINGULARS[id]; body = `<p class="label r-singular"><span class="rar">Singular</span> · ${D.SLOT_NAME[X.slot]}</p><p style="font-size:14px">${esc(X.text)}</p><p class="lat">${esc(X.lore)}</p>`; }
  else if (t === 'r') body = resoBody(id, true);
  return `<div class="panel detail stack">${info.art ? plateBox(info.art, { variant: info.variant }) : ''}<p class="label">${accession(key)}</p><h3>${esc(info.name)}</h3>${firstLine(key)}${body}</div>`;
}
function resoBody(id, woke) { const Rz = D.RESONANCES[id]; return `<div class="tags">${Rz.need.map(x => `<span class="tag on">${D.TAG_NAME[x]}</span>`).join('<span class="dim">+</span>')}</div><p style="font-size:14px">${esc(Rz.text)}</p><p class="dim" style="font-size:13px">${woke ? 'You have woken this one.' : 'Put these two tags on one Seeker, from two different items, to wake it.'}</p>`; }
function catalogue() {
  const st = S(); const keys = CATS[V.cat](); if (!V.catKey || !keys.includes(V.catKey)) V.catKey = keys.find(have) || keys[0];
  const sc = C.score(st); const total = C.allKeys().length; const n = Object.keys(st.cat).length; const mine = Object.values(st.cat).filter(e => e.first).length;
  const count = t => { const ks = CATS[t](); let h = ks.filter(have).length, tot = ks.length; if (t === 'Fauna') { const vs = C.allKeys().filter(k => k[0] === 'v'); h += vs.filter(have).length; tot += vs.length; } return `${h}/${tot}`; };
  return `<div class="sec-head" style="flex-wrap:wrap"><h2>Field Catalogue</h2><p class="label num">${n} of ${total} catalogued · ${mine} first${mine === 1 ? '' : 's'} · index score ${sc}${G.world?.rank ? ' · rank ' + G.world.rank : ''}</p></div>
    <div class="bar"><i style="width:${n / total * 100}%"></i></div>
    <div class="tabs" role="tablist" style="margin-top:14px">${Object.keys(CATS).map(t => `<button role="tab" data-cat="${t}" aria-selected="${V.cat === t}">${t}<span class="n">${count(t)}</span></button>`).join('')}</div>
    <div class="cols" style="margin-top:16px"><div class="plates">${keys.map(k => { const i = C.keyInfo(k); const h = have(k); return `<button class="entry" data-key="${k}" aria-pressed="${V.catKey === k}">${i.art ? plateBox(i.art, { unknown: !h }) : `<div class="plate ${h ? '' : 'unknown'}"><span class="art" style="display:grid;place-items:center;font:italic 500 15px var(--display);line-height:1.1;padding:8px;text-align:center">${h ? '' : ''}${D.RESONANCES[k.slice(2)].need.map(x => D.TAG_NAME[x]).join('<br>+<br>')}</span></div>`}<span class="nm ${h ? '' : 'dim'}">${h || k[0] === 'r' ? esc(i.name) : 'Uncatalogued'}</span><span class="acc ${st.cat[k]?.first ? 'first' : ''}">${st.cat[k]?.first ? 'yours first' : accession(k)}</span></button>`; }).join('')}</div>
    <aside>${catDetail(V.catKey)}</aside></div>`;
}

// ---------------------------------------------------------------- workbench
function bench() {
  const st = S(); const items = Object.values(st.items).filter(it => V.filter === 'all' || C.itemDef(it).slot === V.filter).sort((a, b) => RAR(b.rar) - RAR(a.rar) || b.tier - a.tier || a.id.localeCompare(b.id));
  const it = st.items[V.benchItem]; const mats = Object.keys(D.MATERIALS).filter(m => st.mats[m]).map(m => `<span title="${esc(D.MATERIALS[m].name)}" class="row" style="gap:4px"><span style="width:22px">${art(m)}</span><span class="num">${st.mats[m]}</span> <span class="dim" style="font-size:12.5px">${esc(D.MATERIALS[m].name)}</span></span>`).join('');
  const junk = Object.values(st.items).filter(x => x.rar === 'common' && !x.lock && !wornBy(x.id));
  let right = '<div class="panel detail"><p class="dim">Pick an item to work on it.</p></div>';
  if (it) {
    const worn = wornBy(it.id); const ri = RAR(it.rar); const acts = [];
    const fm = Object.keys(D.MATERIALS).filter(m => D.MATERIALS[m].fam === C.itemDef(it).fam); const dm = D.MATERIALS[fm[it.seed % fm.length]].name;
    let work = '';
    if (!it.sing) {
      if (!st.unlocks.bench) work += '<p class="dim" style="font-size:13.5px">Refining and calibration open at 12 Catalogue entries.</p>';
      else { const cm = D.CAL_MAX[ri];
        work += `<div class="row" style="justify-content:space-between"><span><b>Calibrate</b> <span class="dim" style="font-size:13px">+4% base stats · ${it.cal || 0} of ${cm}</span></span>${(it.cal || 0) < cm ? `<span class="row">${cost(C.costOf(st, 'calibrate', it))}<button class="btn sm" data-bench="calibrate">Calibrate</button></span>` : '<span class="label">done</span>'}</div>`;
        it.aff.forEach((a, i) => { const A = D.AFFIXES[a.id]; const [, hi] = C.affixBand(a.id, it.tier);
          work += `<hr class="rule"><div class="stack" style="gap:4px"><span><b>${esc(A.pre)}</b> <span class="dim" style="font-size:13px">${esc(modLine(A.key, a.v))}${a.v < hi ? ' · best is ' + hi : ' · at its best'}</span></span><span class="row">${a.v < hi ? `<button class="btn sm" data-bench="refine" data-a="${i}">Refine</button>${cost(C.costOf(st, 'refine', it))}` : ''}</span>
            <span class="row">${st.unlocks.mutate ? `<button class="btn sm" data-bench="mutate" data-a="${i}">Mutate into something else</button>${cost(C.costOf(st, 'mutate', it))}` : (i === 0 ? '<span class="dim" style="font-size:13px">Mutation opens when you have Observed 3 species.</span>' : '')}</span></div>`; });
      }
    }
    acts.push(`<button class="btn sm" data-bench="lock">${it.lock ? 'Unlock' : 'Lock'}</button>`);
    if (!it.sing) acts.push(`<button class="btn sm warn" data-bench="dismantle" ${worn || it.lock ? 'disabled' : ''} title="${worn ? 'Worn by ' + esc(worn.name) : it.lock ? 'Locked' : ''}">Dismantle for ${D.DISMANTLE[ri] + it.tier - 1} components + ${esc(dm)}</button>`);
    right = `<div class="detail stack">${itemCard(it, { acts: acts.join('') })}${work ? `<div class="panel stack" style="gap:8px">${work}</div>` : ''}</div>`;
  }
  const asm = () => { const maxT = Math.max(st.tierMax.verdant, st.tierMax.clockwork); V.asmTier = Math.min(V.asmTier, maxT); const bases = Object.keys(D.BASES).filter(b => have('b:' + b));
    return st.unlocks.assemble ? `<div class="row" style="margin:12px 0"><div class="stepper"><button data-asm="-1" ${V.asmTier <= 1 ? 'disabled' : ''}>&minus;</button><span>Tier ${ROMAN[V.asmTier]}</span><button data-asm="1" ${V.asmTier >= maxT ? 'disabled' : ''}>+</button></div><span class="dim" style="font-size:13.5px">Builds come out Uncommon to Epic. Affixes are rolled fresh.</span></div><div class="inv">${bases.map(b => `<div class="item r-uncommon"><header>${art(b)}<div class="grow"><h4>${esc(D.BASES[b].name)}</h4><p class="meta">${D.FAMILY_NAME[D.BASES[b].fam]} ${D.SLOT_NAME[D.BASES[b].slot]}</p></div></header><div class="acts"><button class="btn sm" data-build="${b}">Assemble</button>${cost(C.assembleCost(b, V.asmTier))}</div></div>`).join('')}</div>` : '<p class="dim" style="margin-top:14px">The pattern book opens when you have catalogued 12 kinds of equipment. Then anything you have catalogued can be built to order.</p>'; };
  return `<div class="sec-head" style="flex-wrap:wrap"><h2>Workbench</h2><div class="row" style="gap:14px"><span class="row" style="gap:4px"><span style="width:22px">${art('components')}</span><span class="num">${st.comps}</span> <span class="dim" style="font-size:12.5px">components</span></span>${mats}</div></div>
    <div class="tabs"><button data-btab="pack" aria-selected="${V.benchTab === 'pack'}">Pack<span class="n">${Object.keys(st.items).length}/90</span></button><button data-btab="asm" aria-selected="${V.benchTab === 'asm'}">Assemble</button></div>
    ${V.benchTab === 'asm' ? asm() : `<div class="row" style="margin:12px 0;gap:6px">${['all', ...D.SLOTS].map(f => `<button class="btn sm" data-filter="${f}" ${V.filter === f ? 'style="border-color:var(--ink)"' : ''}>${f === 'all' ? 'All' : D.SLOT_NAME[f]}</button>`).join('')}${junk.length ? `<button class="btn sm warn" data-act="junk" style="margin-left:auto">Dismantle ${junk.length} loose Common${junk.length === 1 ? '' : 's'}</button>` : ''}</div>
    <div class="cols"><div class="inv" style="align-content:start">${items.map(x => itemMini(x, { sel: x.id === V.benchItem })).join('')}</div><aside>${right}</aside></div>`}`;
}

// ---------------------------------------------------------------- record
function record() {
  const w = G.world || { leaders: [], firstsTop: [], weekly: [], firsts: [], feed: [] }; const me = S().name;
  const table = (rows, val, empty) => rows.length ? `<table class="rank">${rows.map((r, i) => `<tr class="${r.name === me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(r.name)}</td><td>${val(r)}</td></tr>`).join('')}</table>` : `<p class="dim" style="font-size:14px">${empty}</p>`;
  const cover = Object.keys(D.REGIONS).map(r => { const R = D.REGIONS[r]; const keys = R.fauna.map(f => 'f:' + f).concat(R.flora.map(f => 'p:' + f), R.wonders.map(x => 'w:' + x)); const h = keys.filter(k => G.firsts[k]).length; return `<div class="mile"><div class="t"><span>${R.short}</span><span class="num dim">${h}/${keys.length}</span></div><div class="bar"><i style="width:${h / keys.length * 100}%"></i></div></div>`; }).join('');
  const open = C.allKeys().filter(k => !G.firsts[k] && !['b', 'm'].includes(k[0])).length;
  return `<div class="sec-head"><h2>The Record</h2><span class="label">${w.seekers || 0} Seekers in the ledger</span></div>
    <div class="cols"><div class="stack" style="gap:22px">
      <div class="tabs">${[['feed', 'Discoveries'], ['index', 'Index score'], ['firsts', 'Firsts'], ['weekly', 'Weekly trial']].map(([id, n]) => `<button data-rec="${id}" aria-selected="${V.rec === id}">${n}</button>`).join('')}</div>
      ${V.rec === 'feed' ? feedList(40) : V.rec === 'index' ? table(w.leaders, r => r.score, 'No scores yet.') : V.rec === 'firsts' ? table(w.firstsTop, r => r.firsts, 'Nobody holds a first yet.') : table(w.weekly, r => r.score, 'Nobody has finished this week\'s trial. It resets every Monday.')}
    </div><aside class="stack" style="gap:22px">
      <div><span class="label">What Seekers have documented, together</span>${cover}<p style="font-size:13.5px;margin-top:10px;color:var(--gilt)">${open} entries have no name on them yet.</p></div>
      <div class="panel stack" style="gap:8px"><span class="label">Carry code</span><p class="dim" style="font-size:13.5px">You are <b style="color:var(--ink)">${esc(me)}</b> on this browser only. To play on another device, enter this code there. Anyone holding it is you, so keep it to yourself.</p>
        ${V.showCode ? `<input readonly id="carry" value="${esc(G.key)}" style="background:var(--bg);border:1px solid var(--line2);padding:8px;font:12px var(--mono);border-radius:3px;width:100%" onfocus="this.select()"><button class="btn sm" data-act="copy">Copy</button>` : '<button class="btn sm" data-act="showcode">Show my carry code</button>'}</div>
    </aside></div>`;
}

// ---------------------------------------------------------------- expedition end
async function finish(log) {
  app.innerHTML = '<p class="boot">Counting the cases</p>';
  let r = null; for (let i = 0; i < 3 && !r; i++) { r = await serverOp({ t: 'finish', log }); if (!r && !S().run) break; if (!r) await new Promise(z => setTimeout(z, 1500)); }
  if (!r) { if (S().run) { app.innerHTML = `<p class="boot">The Cabinet did not answer.</p><p style="text-align:center"><button class="btn go" id="retry">Send the expedition report again</button></p>`; $('#retry').onclick = () => finish(log); return; } V.mounted = false; return render(); }
  store.del('unc.run'); V.report = { rep: r.report, fresh: r.fresh || [], firsts: r.firsts || [], unlocked: r.unlocked || [] }; V.opened = {}; V.mounted = false; V.squad = null; window.scrollTo(0, 0); render();
}
function report() {
  const { rep, fresh, firsts, unlocked } = V.report; const st = S(); const win = rep.outcome === 'win';
  const head = win ? (rep.contractDone ? 'Contract fulfilled.' : 'Extracted.') : rep.outcome === 'retreat' ? 'You walked out.' : 'Carried out.';
  const sub = win ? (rep.contractDone ? 'Everything you gathered is yours.' : 'The contract went unmet, so no bonus case. Everything else is yours.') : 'Your notes survive. Half the material and most of the cases did not.';
  const disc = fresh.filter(k => !['b', 's'].includes(k[0]) || true);
  const allOpen = rep.items.every(x => V.opened[x.id]);
  return `<main class="wrap report stack" style="gap:24px;max-width:900px">
    <div><p class="label">${D.REGIONS[rep.region].short} · Tier ${ROMAN[rep.tier]} · ${rep.turns} turns${rep.weeklyScore ? ' · trial score ' + rep.weeklyScore : ''}</p><h2>${head}</h2><p class="dim">${sub}</p></div>
    ${disc.length ? `<div><div class="sec-head"><h3>New in your Catalogue</h3><span class="label">${disc.length} entr${disc.length === 1 ? 'y' : 'ies'}</span></div><div class="finds">${disc.map((k, i) => { const inf = C.keyInfo(k); const hidden = (k[0] === 'b' || k[0] === 's') && rep.items.some(x => !V.opened[x.id] && (st.items[x.id]?.base === k.slice(2) || st.items[x.id]?.sing === k.slice(2))); return hidden ? '' : `<div class="find" style="animation-delay:${i * 90}ms">${inf.art ? plateBox(inf.art, { variant: inf.variant }) : '<div class="plate"></div>'}<span class="label">${inf.kind}</span><br>${esc(inf.name)}${firsts.includes(k) ? '<br><span class="stamp">First in the Cabinet</span>' : ''}</div>`; }).join('')}</div></div>` : ''}
    ${rep.stageUps.length ? `<div class="stack" style="gap:6px">${rep.stageUps.map(s => `<p><b>${esc(D.SPECIES[s.sp].name)}</b> is now <b style="color:var(--gilt)">${C.STAGE_NAME[s.stage]}</b>. <span class="dim">${s.stage === 1 ? 'Its behaviour is written up in your Catalogue.' : s.stage === 2 ? 'Your Seekers hit it 10% harder.' : 'There is nothing more it can teach you.'}</span></p>`).join('')}</div>` : ''}
    ${unlocked.length ? `<div class="stack" style="gap:6px">${unlocked.map(id => `<p style="color:var(--gilt)"><span class="stamp">Index</span> ${esc(D.MILESTONES.find(m => m.id === id).reward)}</p>`).join('')}</div>` : ''}
    <div><div class="sec-head"><h3>Sealed cases</h3>${rep.items.length > 1 && !allOpen ? '<button class="link" data-act="openall">Break every seal</button>' : `<span class="label">${rep.items.length || 'none'}</span>`}</div>
      ${rep.items.length ? `<div class="cases">${rep.items.map(x => { const it = st.items[x.id]; if (!it) return ''; return V.opened[x.id] ? itemCard(it, { cls: 'reveal', acts: st.roster.map(sid => { const s = st.seekers[sid]; const on = s.gear[C.itemDef(it).slot] === it.id; return `<button class="btn sm" data-give="${sid}" data-id="${it.id}" ${on ? 'disabled' : ''}>${on ? 'On ' + esc(s.name) : 'Equip: ' + esc(s.name)}</button>`; }).join('') + (x.isNew ? '<span class="stamp" style="align-self:center">New type</span>' : '') }) : `<button class="case" data-open="${x.id}"><span>${art('cache')}<b>${{ boss: 'From the great one', elite: 'From the elite', cache: 'Found sealed', contract: 'Contract payment', weekly: 'Trial payment', standard: 'Room cleared' }[x.src]}</b><small>tap to break the seal</small></span></button>`; }).join('')}</div>` : '<p class="dim">No cases came out with you.</p>'}</div>
    <div class="panel"><dl class="kv"><dt>Experience</dt><dd><span class="num">+${rep.xp}</span> each${rep.levelUps.length ? ' · ' + rep.levelUps.map(l => `<b style="color:var(--gilt)">${esc(st.seekers[l.sid].name)} reached level ${l.lvl}</b>`).join(', ') : ''}</dd>
      <dt>Research</dt><dd class="num">+${rep.research}</dd>
      ${Object.keys(rep.mats).length ? `<dt>Material</dt><dd>${Object.keys(rep.mats).map(m => `${rep.mats[m]} ${esc(D.MATERIALS[m].name)}`).join(' · ')}</dd>` : ''}
      ${rep.tierUp ? `<dt>Access</dt><dd style="color:var(--gilt)">Tier ${ROMAN[rep.tierUp]} is open in ${D.REGIONS[rep.region].short}</dd>` : ''}</dl></div>
    ${rep.sight ? `<p style="color:var(--gilt)"><span class="stamp">Sighting</span> ${COAT[rep.sight.variant]} ${esc(D.SPECIES[rep.sight.kind].name)} recorded. <b class="num">+${rep.sight.bonus}</b> research · ${rep.sight.streak} day${rep.sight.streak === 1 ? '' : 's'} in a row.</p>` : ''}
    ${closeTo(st)}
    <div class="row"><button class="btn go" data-act="camp">Back to camp</button>${st.roster.some(s => pendingFor(st.seekers[s])) ? '<span style="color:var(--gilt);font-size:14px">A Seeker has a choice waiting.</span>' : ''}</div></main>`;
}

// ---------------------------------------------------------------- input
app.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b || (S()?.run && V.mounted && !V.report)) return; const d = b.dataset; const st = S(); if (!st) { if (d.act === 'code') { V.code = !V.code; V.landErr = ''; landing(); } return; }
  if (d.tab) { V.tab = d.tab; V.slot = null; window.scrollTo(0, 0); return render(); }
  if (d.contract != null) { V.contract = d.contract === 'w' ? 'w' : +d.contract; return render(); }
  if (d.pick) { const i = V.squad.indexOf(d.pick); if (i >= 0) V.squad.splice(i, 1); else if (V.squad.length < 3) V.squad.push(d.pick); else toast('Three at most. Tap one to stand them down first.'); return render(); }
  if (d.tier) { const c = st.board.list[V.contract]; const m = st.tierMax[c.region]; V.tier[c.region] = Math.max(1, Math.min(m, (V.tier[c.region] || m) + +d.tier)); return render(); }
  if (d.act === 'start') { const weekly = V.contract === 'w'; const c = weekly ? null : st.board.list[V.contract]; b.disabled = true; b.textContent = 'Opening the door'; store.del('unc.run');
    await serverOp(weekly ? { t: 'start', weekly: true, squad: V.squad } : { t: 'start', c: V.contract, squad: V.squad, tier: Math.min(V.tier[c.region] || st.tierMax[c.region], st.tierMax[c.region]) }); V.contract = 0; return render(); }
  if (d.act === 'reboard') { await serverOp({ t: 'reboard' }); V.contract = 0; return render(); }
  if (d.seeker) { V.seeker = d.seeker; V.slot = null; return render(); }
  if (d.slot) { V.slot = V.slot === d.slot ? null : d.slot; return render(); }
  if (d.equip) { op({ t: 'equip', s: V.seeker, i: d.equip }); V.slot = null; return render(); }
  if (d.unequip) { op({ t: 'unequip', s: V.seeker, slot: d.unequip }); return render(); }
  if (d.attr) { op({ t: 'attr', s: V.seeker, a: d.attr }); return render(); }
  if (d.spec) { op({ t: 'spec', s: V.seeker, id: d.spec }); return render(); }
  if (d.trait) { op({ t: 'trait', s: V.seeker, id: d.trait }); return render(); }
  if (d.cat) { V.cat = d.cat; V.catKey = null; return render(); }
  if (d.key) { V.catKey = d.key; render(); if (innerWidth < 900) $('.detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
  if (d.btab) { V.benchTab = d.btab; return render(); }
  if (d.filter) { V.filter = d.filter; return render(); }
  if (d.asm) { V.asmTier = Math.max(1, V.asmTier + +d.asm); return render(); }
  if (d.build) { b.disabled = true; const r = await serverOp({ t: 'assemble', base: d.build, tier: V.asmTier }); if (r?.item) { V.benchItem = r.item; V.benchTab = 'pack'; V.filter = 'all'; toast('Assembled: ' + C.itemName(S().items[r.item])); } return render(); }
  if (d.bench) { const id = V.benchItem; if (d.bench === 'lock') op({ t: 'lock', i: id }); else if (d.bench === 'dismantle') { if (op({ t: 'dismantle', items: [id] })) V.benchItem = null; } else if (d.bench === 'calibrate') op({ t: 'calibrate', i: id }); else if (d.bench === 'refine') op({ t: 'refine', i: id, a: +d.a });
    else if (d.bench === 'mutate') { b.disabled = true; const r = await serverOp({ t: 'mutate', i: id, a: +d.a }); if (r) toast('It grew into: ' + D.AFFIXES[S().items[id].aff[+d.a].id].pre); } return render(); }
  if (d.act === 'junk') { const ids = Object.values(st.items).filter(x => x.rar === 'common' && !x.lock && !wornBy(x.id)).map(x => x.id); if (op({ t: 'dismantle', items: ids })) toast(`Dismantled ${ids.length}.`); V.benchItem = null; return render(); }
  if (d.item && V.tab === 'bench' && !V.report) { V.benchItem = d.item; render(); if (innerWidth < 900) $('.detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return; }
  if (d.rec) { V.rec = d.rec; return render(); }
  if (d.act === 'showcode') { V.showCode = true; return render(); }
  if (d.act === 'copy') { try { await navigator.clipboard.writeText(G.key); toast('Copied'); } catch { $('#carry')?.select(); } return; }
  if (d.open) { V.opened[d.open] = true; return render(); }
  if (d.act === 'openall') { for (const x of V.report.rep.items) V.opened[x.id] = true; return render(); }
  if (d.give) { op({ t: 'equip', s: d.give, i: d.id }); return render(); }
  if (d.act === 'camp') { V.report = null; V.tab = st.roster.some(s => pendingFor(st.seekers[s])) ? 'seekers' : 'board'; await flush(); window.scrollTo(0, 0); return render(); }
});
boot();
