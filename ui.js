// Shared interface pieces: state, server calls, item cards.
import * as C from './core.js';
import { plate } from './art.js';
export { C };
export const D = C.D;
const API = 'https://kffkasnzqcddpystszch.supabase.co/functions/v1/uncatalogued';
export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
const painted = k => k in D.SPECIES || k in D.FLORA || k in D.WONDERS || k in D.MATERIALS;
export const art = (key, o = {}) => painted(key) ? `<span class="art pic ${o.variant || ''}"><img src="assets/cat/${key}.jpg" alt=""></span>` : D.ARCHETYPES[key] && key !== 'tinkerer' ? `<span class="art pic"><img src="assets/portraits/${key}.jpg" alt=""></span>` : `<span class="art">${plate(key, o)}</span>`;
const PAINTED = new Set('thorncaster marrow_cleaver spore_sling pulse_rifle arc_lance echo_blade chitin_plate barkweave relay_harness mirror_carapace phase_shroud compound_lens targeting_visor oracle_shard resin_charm capacitor_band bait_satchel lucky_knot leechroot symbiote_graft neural_shunt venom_sac fold_gland lure_pod barrier_seed pulse_emitter drone_core blink_anchor gravity_knot second_heart hungry_compass borrowed_moment unfinished_machine'.split(' '));
export const itemArt = it => { const k = it.sing || it.base; return PAINTED.has(k) ? `<span class="art pic"><img src="assets/items/${k}.jpg" alt=""></span>` : art(k); };
const PORTRAIT = { vanguard: 1, tracker: 1, naturalist: 1 };
export const face = arch => PORTRAIT[arch] ? `<span class="face ph ${arch}"><img src="assets/portraits/${arch}.jpg" alt=""></span>` : `<span class="face">${plate(arch)}</span>`;

export const G = { key: null, state: null, world: null, firsts: {}, tab: 'board', busy: false };
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }, del(k) { try { localStorage.removeItem(k); } catch { /* */ } } };
export { store };

export function toast(msg, cls = '') { const t = document.createElement('div'); t.className = 'toast ' + cls; t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 3500); }

async function call(op, body = {}) {
  let res;
  try { res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ v: C.VERSION, key: G.key, op, ...body }) }); }
  catch { throw new Error('No connection to the Cabinet. Check your network and try again.'); }
  const j = await res.json().catch(() => ({ error: 'The Cabinet did not answer. Try again.' }));
  if (j.error === 'update') { location.reload(); throw new Error('Updating'); }
  if (j.world) setWorld(j.world);
  return j;
}
function setWorld(w) { G.world = w; G.firsts = {}; for (const f of w.firsts) G.firsts[f.key] = f; }
export function newKey() { const b = crypto.getRandomValues(new Uint8Array(24)); return [...b].map(x => x.toString(16).padStart(2, '0')).join(''); }
export async function loadWorld() { try { await call('world'); } catch { /* feed is optional */ } }
export async function load() { const j = await call('load'); if (j.error) return false; G.state = j.state; return true; }
export async function register(name) { const j = await call('register', { name }); if (j.error) throw new Error(j.error); G.state = j.state; }

// Camp operations. Simple ones apply here first so the screen answers at once, then go to the server in order.
let pending = [], timer = null, flushing = null;
export function op(o) {
  try { C.applyOp(G.state, o, { now: Date.now() }); } catch (e) { toast(e.message); return false; }
  pending.push(o); clearTimeout(timer); timer = setTimeout(flush, 500); return true;
}
export async function flush() {
  clearTimeout(timer); if (flushing) await flushing; if (!pending.length) return;
  const ops = pending; pending = [];
  flushing = call('ops', { ops }).then(j => { if (j.state && !pending.length) G.state = j.state; if (j.error) toast(j.error); announce(j); }).catch(e => toast(e.message)).finally(() => { flushing = null; });
  await flushing;
}
// Operations the server must roll. Returns the server's answer for that op.
export async function serverOp(o) {
  await flush(); G.busy = true;
  try { const j = await call('ops', { ops: [o] }); if (j.state) G.state = j.state; if (j.error) { if (j.error !== 'unknown') toast(j.error); return null; } announce(j); return { ...j.results[0], firsts: j.firsts }; }
  catch (e) { toast(e.message); return null; } finally { G.busy = false; }
}
function announce(j) {
  for (const r of j.results || []) for (const id of r.unlocked || []) { const m = D.MILESTONES.find(x => x.id === id); if (m) toast(m.reward, 'gilt'); }
  for (const k of j.firsts || []) if (!(j.results || []).some(r => r.report)) toast('First in the Cabinet: ' + C.keyInfo(k).name, 'gilt');
}

// ------------------------------------------------------------ items
export const modLine = (k, v) => (D.MOD_TEXT[k] || k).replace('{v}', v);
export function wornBy(id) { const s = G.state.roster.find(s => Object.values(G.state.seekers[s].gear).includes(id)); return s ? G.state.seekers[s] : null; }
// Which resonances would wake if this Seeker wore this item.
export function pairHints(it, onlySeeker) {
  const out = []; const slot = C.itemDef(it).slot;
  for (const sid of G.state.roster) {
    if (onlySeeker && sid !== onlySeeker) continue; const s = G.state.seekers[sid]; if (s.gear[slot] === it.id) continue;
    const cur = C.seekerItems(G.state, s); const next = cur.filter(x => C.itemDef(x).slot !== slot).concat([it]);
    const a = C.resonancesFor(cur), b = C.resonancesFor(next);
    for (const r of b.active) if (!a.active.includes(r)) { const [t1, t2] = D.RESONANCES[r].need; const other = next.find(x => x !== it && (C.itemTags(x).includes(t1) || C.itemTags(x).includes(t2)));
      out.push({ sid, name: s.name, res: r, other: other ? C.itemName(other) : null }); }
  }
  return out;
}
export function itemLines(it) {
  const def = C.itemDef(it); const L = []; const w = C.itemWeapon(it);
  if (w) L.push(`<li class="base">Damage <span class="num">${w.min}-${w.max}</span> · ${w.range > 1 ? 'Range ' + w.range : 'Melee'} · ${D.ATTR_INFO[w.scale][0]}</li>`);
  const base = {}; const s = C.itemScale(it);
  for (const k in def.m || {}) { if (k === 'phase') continue; const v = ['armor', 'hp', 'shieldStart', 'thorns', 'killHeal', 'leech'].includes(k) ? Math.max(1, Math.round(def.m[k] * s / 100)) : def.m[k]; base[k] = v; }
  for (const k in base) if (!(k === 'leech') && !(def.text && (k === 'poisonHit' || k === 'pierce' || k === 'echo'))) L.push(`<li class="base">${esc(modLine(k, base[k]).replace('+-', '-'))}</li>`);
  if (def.text && !it.sing && !w) L.push(`<li class="base">${esc(def.text)}</li>`);
  if (def.text && !it.sing && w && /Each hit|Ignores|lands again/.test(def.text)) L.push(`<li class="base">${esc(def.text.split('. ').slice(2).join('. '))}</li>`);
  (it.aff || []).forEach((a, i) => { const A = D.AFFIXES[a.id]; L.push(`<li class="aff"><span class="q q${C.affixQuality(it, i)}" title="Roll quality"></span><span>${esc(modLine(A.key, a.v))}</span><em>${esc(i === 1 ? A.suf.replace(/^of (the )?/, '') : A.pre)}</em></li>`); });
  if (it.fx) L.push(`<li class="fx"><b>${esc(D.SPECIALS[it.fx].name)}.</b> ${esc(D.SPECIALS[it.fx].text)}</li>`);
  if (it.sing) L.push(`<li class="fx">${esc(def.text)}</li>`, `<li class="lore">${esc(def.lore)}</li>`);
  return L.join('');
}
export function itemCard(it, o = {}) {
  const def = C.itemDef(it); const tags = C.itemTags(it); const worn = wornBy(it.id);
  const hints = o.hints === false ? [] : pairHints(it, o.forSeeker);
  return `<article class="item r-${it.rar} ${o.cls || ''}" data-item="${it.id}">
    <header>${itemArt(it)}<div class="grow"><h4>${esc(C.itemName(it))}${it.lock ? ' <span class="dim" title="Locked">&#9679;</span>' : ''}</h4>
    <p class="meta"><span class="rar">${D.RARITY_NAME[it.rar]}</span> · ${D.FAMILY_NAME[def.fam]} ${D.SLOT_NAME[def.slot]} · Tier ${ROMAN[it.tier]}${it.cal ? ' · Calibrated ' + it.cal : ''}</p></div></header>
    <ul>${itemLines(it)}</ul>
    ${tags.length ? `<div class="tags">${tags.map(t => `<span class="tag" title="Resonance tag">${D.TAG_NAME[t]}</span>`).join('')}</div>` : ''}
    ${hints.map(h => `<p class="pair"><span>On ${esc(h.name)}${h.other ? ', with ' + esc(h.other) : ''}: wakes <b>${esc(D.RESONANCES[h.res].name)}</b></span></p>`).join('')}
    ${worn && o.worn !== false ? `<p class="worn">Worn by ${esc(worn.name)}</p>` : ''}
    ${o.acts ? `<div class="acts">${o.acts}</div>` : ''}
  </article>`;
}
export function itemMini(it, o = {}) {
  const def = C.itemDef(it); const worn = wornBy(it.id); const hints = o.forSeeker ? pairHints(it, o.forSeeker) : [];
  return `<button class="item mini r-${it.rar} ${o.sel ? 'sel' : ''}" data-item="${it.id}"><header>${itemArt(it)}<div class="grow"><h4>${esc(C.itemName(it))}</h4>
    <p class="meta"><span class="rar">${D.RARITY_NAME[it.rar]}</span> · ${D.SLOT_NAME[def.slot]} · ${ROMAN[it.tier]}${worn ? ' · ' + esc(worn.name) : ''}</p></div></header>
    ${hints.map(h => `<p class="pair"><span>Wakes <b>${esc(D.RESONANCES[h.res].name)}</b></span></p>`).join('')}</button>`;
}
export function ago(t, now = Date.now()) { const s = Math.max(0, (now - new Date(t).getTime()) / 1000); if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; return Math.round(s / 86400) + ' d ago'; }
export function accession(key) { const all = C.allKeys(); const [t, a] = key.split(':'); const reg = t === 'f' || t === 'v' ? D.REGIONS[D.SPECIES[a].region].code : 'CAB'; return `UNC.${reg}.${String(all.indexOf(key) + 1).padStart(3, '0')}`; }
