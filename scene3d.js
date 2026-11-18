// The Cabinet in three dimensions: terrain, light, creatures and Seekers, all built in code.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skinClone } from 'three/addons/utils/SkeletonUtils.js';

// Real models, loaded once and shared. Until one arrives its unit shows the placeholder shape.
const GLB = { firebrand: ['garrow_anim', 2.15], tinkerer: ['tamsin_anim', 1.9], vanguard: ['hobb', 1.95], tracker: ['sile', 1.85], naturalist: ['oyelaran', 2.05], thornling: ['thornling', 1.35], mossback: ['mossback', 2.1], orchardmother: ['orchardmother', 4.2],
  stalkbriar: ['stalkbriar', .95], dewhare: ['dewhare', .85], lampmoth: ['lampmoth', .5], glasswing: ['glasswing', 1.25], gulper: ['gulper', 1.7], carrion: ['carrion', 1.35], hush: ['hush', 2.1], mite: ['mite', .85], pollinator: ['pollinator', 1.15], coilfawn: ['coilfawn', 1.55], warden: ['warden', 2.4], mantis: ['mantis', 1.75], regulator: ['regulator', 4.2],
  // things on the board
  fx_bellcap: ['p_mushrooms', 1.25], fx_lamp: ['p_lamp', 2.1], fx_case: ['p_case_broken', 1.35],
  rock: ['p_boulder', 1.45], cache: ['p_cache', 1.0], lantern_moss: ['p_lantern_moss', 1.05], snare_vine: ['p_snare_vine', 1.15], heartfruit: ['p_heartfruit', 1.0], mirror_reed: ['p_mirror_reed', 1.2],
  // things around it
  c_tree_a: ['p_c_tree_a', 6.6], c_tree_b: ['p_c_tree_b', 6], c_rock: ['p_c_rock', 1.5], c_gate: ['p_c_gate', 6.4], c_lamp: ['p_c_lamp', 2.9], c_boiler: ['p_c_boiler', 2.2], c_bench: ['p_c_bench', 2.1], c_gear: ['p_c_gear', 2.8], c_vent: ['p_c_vent', 1.7], c_orrery: ['p_c_orrery', 2.3], copper_lily: ['p_copper_lily', 1.0], tick_fern: ['p_tick_fern', 1.0],
  temple_ruin: ['p_temple_ruin_lo', 1], temple_arch: ['p_temple_arch_lo', 1], dream_tree_a: ['p_dream_tree_a_lo', 1], dream_tree_b: ['p_dream_tree_b_lo', 1], // far-world landmarks
  tree_a_lo: ['p_tree_a_lo', 6.4], tree_b_lo: ['p_tree_b_lo', 6], rock_lo: ['p_boulder_lo', 1.45], mushrooms_lo: ['p_mushrooms_lo', 1.9], c_tree_a_lo: ['p_c_tree_a_lo', 6.6], c_tree_b_lo: ['p_c_tree_b_lo', 6], c_rock_lo: ['p_c_rock_lo', 1.5], c_vent_lo: ['p_c_vent_lo', 1.7], // far-world stand-ins, a tenth of the triangles
  chest: ['p_chest', 1.15],
  drone: ['u_drone', .7], lure: ['u_lure', .55], // what a device becomes once it is out on the floor
  tree_a: ['p_tree_a', 6.4], tree_b: ['p_tree_b', 6], gate: ['p_gate', 6.2], lamp: ['p_lamp', 2.9], case_broken: ['p_case_broken', 2.1], column_fallen: ['p_column_fallen', 2.6], mushrooms: ['p_mushrooms', 1.9], plinth: ['p_plinth', 1.5], survey: ['p_survey', 2.1], crates: ['p_crates', 1.6] };
// Scenery you can touch: [model, x, z, turn, scale]. The far side and both ends of the hall, clear of the camera.
const DECORS = {
  // S, where the expedition came in: its camp by the way in, a ruined run of plinths along the far wall, a grove at the gate end
  S: [['lamp', -1.5, 6.1, 0], ['lamp', 1.7, 7.8, 2], ['survey', -5.2, 5.4, .9], ['crates', -6.5, 6.6, .4], ['crates', -4.9, 7.3, 2.2, .8], ['lamp', -6.4, 4.6, 1],
    ['plinth', -5.2, 1.8, 1.6], ['plinth', -5.2, -.4, 0], ['case_broken', -5.2, -2.6, 1.2], ['column_fallen', -6.7, .8, .3], ['column_fallen', -6.9, -1.9, 1.1, .85],
    ['tree_a', -7.2, -7.4, 1, 1], ['tree_b', -5.2, -8.6, 2, .85], ['mushrooms', -6.1, -5.6, 1, 1.4], ['mushrooms', -4.5, -6.9, 2.4, .9], ['tree_b', -6.6, 8, 3, .9], ['mushrooms', 4.7, -6.5, 2]],
  // A, The Overgrowth: one wall of thorn down the far side with fungus at its foot, a ruin being swallowed at the gate end
  A: [['spires', -6.2, -1.5, 0], ['spires', -6.6, 1.3, 1, .9], ['spires', -5.7, 3.7, 2, .8], ['spires', -7.3, -4.1, 3, 1], ['mushrooms', -4.8, .1, 0, 1.4], ['mushrooms', -4.9, 2.5, 2, 1.1],
    ['column_fallen', -5.2, -4.7, 1.3], ['case_broken', -5, -6.3, .6], ['mushrooms', -6.3, -6.6, 1, 1], ['tree_b', -9, 3, 1, 1.1], ['tree_b', -9.2, -2.5, 3, 1.2], ['mushrooms', 4.8, 6.4, 1, 1.2]],
  // B, The Still Pond: the water, reeds round its near bank, willows at both ends, and a lit plinth at the water's edge
  B: [['pond', -7.4, 0, 0], ['reeds', -5.4, 2.3, 0], ['reeds', -5.5, -2, 1], ['reeds', -6.1, 4.7, 2], ['reeds', -6.3, -4.5, 3], ['tree_b', -8.2, 6.4, 1, 1.2], ['tree_b', -8.4, -6.4, 2, 1.2],
    ['lamp', -4.8, 1.4, 0], ['plinth', -4.9, .1, .8], ['lamp', -4.8, -1.2, 2], ['tree_b', -5, 8.6, 3, .9], ['mushrooms', 4.8, -6.6, 1, .9]],
  // Side places, keyed by what they are (the hilltop a given one stands on changes from expedition to expedition).
  pl_lit_knoll: [['lamp', -4.6, 0, 0, 1.3], ['lamp', -5.2, 3, 1], ['lamp', -5.2, -3, 2], ['survey', -6.2, 1.4, .8], ['crates', -6.4, -1.6, .4], ['crates', -5, 5.6, 2, .8], ['tree_b', -8, 6, 1, .9], ['column_fallen', -6, -5.6, 1]],
  pl_hollow_giant: [['lamp', -4.6, -1, 0], ['tree_a', -9.2, 0, 1, 3], ['mushrooms', -5, 3.4, 0, 1.3], ['mushrooms', -5.2, -3.6, 2, 1.1], ['crates', -4.8, 1.2, .6, .8], ['tree_b', -7, 8, 2, 1], ['tree_b', -7, -8, 3, 1]],
  pl_standing_glass: [['pond', -7.4, 0, 0], ['plinth', -5, -4.4, 0], ['plinth', -4.9, -2.2, .5], ['plinth', -4.9, 0, 1], ['plinth', -4.9, 2.2, 1.5], ['plinth', -5, 4.4, 2], ['case_broken', -6.4, 6.4, 1], ['reeds', -6, -6.4, 0], ['reeds', -8.8, 3, 2], ['tree_b', -8.4, -7, 1, 1.1]],
  pl_signal_mast: [['lamp', -5, 0, 0, 2.4], ['survey', -5.6, 2.6, .8], ['crates', -5.6, -2.6, .4], ['column_fallen', -6.6, 5, 1], ['column_fallen', -6.6, -5, 2], ['tree_b', -8, 7, 1, .9]],
  pl_cold_foundry: [['plinth', -5, 0, 0, 2.2], ['plinth', -5.2, 3.6, 1, 1.4], ['plinth', -5.2, -3.6, 2, 1.4], ['column_fallen', -7, 1.6, .4, 1.4], ['crates', -4.8, 6, 1], ['case_broken', -5, -6, 2], ['spires', -8.6, 0, 0, .9]],
  pl_wound_orchard: [['lamp', -4.4, 6.6, 0], ['tree_b', -5, -5, 0, .55], ['tree_b', -5, -2.5, 1, .55], ['tree_b', -5, 0, 2, .55], ['tree_b', -5, 2.5, 3, .55], ['tree_b', -5, 5, 0, .55], ['tree_b', -7.4, -3.7, 1, .6], ['tree_b', -7.4, 0, 2, .6], ['tree_b', -7.4, 3.7, 3, .6]],
  // F, the last room: a formal approach, everything in pairs either side of the great tree
  F: [['tree_a', -10.6, 0, 1, 3.4], ['tree_a', -6.8, 7.8, 2, 1.1], ['tree_a', -6.8, -7.8, 0, 1.1], ['plinth', -5.2, 2.4, .4], ['plinth', -5.2, -2.4, 2.4], ['case_broken', -5.5, 4.6, .9], ['case_broken', -5.5, -4.6, 2.1],
    ['lamp', -4.7, 1.1, 0], ['lamp', -4.7, -1.1, 2], ['mushrooms', -6.4, 0, 0, 1.2], ['column_fallen', -6.9, 5.9, .6], ['column_fallen', -6.9, -5.9, 2.5]],
};
// Rigged heroes: file, then which library clip plays each game action.
const RIG = {
  vanguard: ['hobb_anim', { idle: 'Combat_Stance', walk: 'Walk_Fight_Forward', attack: 'Right_Hand_Sword_Slash', heavy: 'Charged_Slash', skill: 'Shield_Push_Left', guard: 'Block1', hit: 'Hit_Reaction', die: 'Knock_Down', study: 'Alert', cheer: 'Victory_Cheer' }, 620],
  tracker: ['sile_anim', { idle: 'Idle', walk: 'Walk_Forward_with_Bow_Aimed', attack: 'Archery_Shot', skill: 'Draw_and_Shoot_from_Back', guard: 'CrouchLookAroundBow', hit: 'Hit_Reaction_with_Bow', die: 'Knock_Down', study: 'Lower_Weapon_Look_Raise', cheer: 'Victory_Cheer' }, 700],
  firebrand: ['garrow_anim', { idle: 'Combat_Stance', walk: 'Walk_Fight_Forward', attack: 'Heavy_Hammer_Swing', skill: 'Shield_Push_Left', guard: 'Block1', hit: 'Hit_Reaction', die: 'Knock_Down', study: 'Alert', cheer: 'Victory_Cheer' }, 620],
  tinkerer: ['tamsin_anim', { idle: 'Idle', walk: 'Confident_Walk', attack: 'Charged_Spell_Cast', skill: 'mage_soell_cast', guard: 'Long_Breathe_and_Look_Around', hit: 'Hit_Reaction', die: 'Knock_Down', study: 'Torch_Look_Around', cheer: 'Victory_Cheer' }, 720],
  naturalist: ['oyelaran_anim', { idle: 'Idle', walk: 'Confident_Walk', attack: 'Charged_Spell_Cast', skill: 'mage_soell_cast', guard: 'Long_Breathe_and_Look_Around', hit: 'Hit_Reaction', die: 'Knock_Down', study: 'Torch_Look_Around', cheer: 'Victory_Cheer' }, 760],
};
// Gear a Seeker can wear, shown on the model. hand: [slot, weapon class]. head/chest: [slot, size factor, lift].
const FLAME = { kindled_pair: .72, kindled_dagger: .36 }; // blades that take a flame, and how long each is against the hero's height
const GEAR = { kindled_pair: ['hand', 'melee', 'kindled_dagger'], marrow_cleaver: ['hand', 'melee'], echo_blade: ['hand', 'melee'], arc_lance: ['hand', 'pole'], thorncaster: ['hand', 'gun'], spore_sling: ['hand', 'throw'], pulse_rifle: ['hand', 'rifle'],
  yesterdays_rifle: ['hand', 'rifle'], hunter_mask: ['head', 1.0, .035, .02], collectors_eye: ['head', 1.04, 0],
  // [where it is worn, size against the shoulders, up, forward]
  resin_charm: ['neck', .3], lucky_knot: ['neck', .3], hungry_compass: ['neck', .3], borrowed_moment: ['neck', .3], capacitor_band: ['wristL', .3], bait_satchel: ['hipL', .4],
  leechroot: ['shoulderR', .44], symbiote_graft: ['shoulderL', .4], neural_shunt: ['nape', .4], venom_sac: ['forearmR', .3], fold_gland: ['back', .46],
  lure_pod: ['hipR', .36], barrier_seed: ['hipR', .36], pulse_emitter: ['hipR', .4], drone_core: ['hipR', .4], blink_anchor: ['hipR', .44], gravity_knot: ['hipR', .34], unfinished_machine: ['hipR', .42],
  compound_lens: ['head', 1.02, .01], targeting_visor: ['head', 1.3, .0], oracle_shard: ['head', 1.02, .05], chitin_plate: ['chest', 1.0, 0], barkweave: ['chest', 1.0, 0], relay_harness: ['chest', 1.0, 0], mirror_carapace: ['chest', .96, 0], phase_shroud: ['chest', 1.05, .03] };
// Which clip a weapon class strikes with, and the part of it that is the strike: [clip, from s, to s, speed, ms until the blow lands].
// The library clips are long (a throw is 5.8 s with the release at 3.5), so each plays only its window.
const CLASS_CLIP = { melee: { a: ['Right_Hand_Sword_Slash', 0, 1.3, 1.3, 420], c: ['Charged_Slash', .3, 2.0, 1.3, 700] }, pole: { a: ['Thrust_Slash', .3, 1.3, 1.3, 370], c: ['Charged_Slash', .3, 2.0, 1.3, 700] },
  gun: { a: ['Side_Shot', .5, 1.75, 1.5, 520], c: ['Cowboy_Quick_Draw_Shooting', 2.05, 3.3, 1.3, 440] }, throw: { a: ['Crouch_Pull_and_Throw', 3.2, 4.8, 1.4, 820] },
  rifle: { a: ['Cowboy_Quick_Draw_Shooting', 2.05, 3.3, 1.3, 440], c: ['Side_Shot', .5, 1.75, 1.5, 520], aim: true } }; // aim: these are bow clips, so a rifle is levelled at the target while they play
const gearWait = {};
const tune = sc => sc.traverse(m => { if (m.isMesh) { m.castShadow = true; const M = m.material; M.roughness = Math.max(.6, M.roughness); M.metalness = Math.min(.25, M.metalness); if (M.map) { M.emissiveMap = M.map; M.emissive = new THREE.Color(0xffffff); M.emissiveIntensity = .24; } } });
const loadGear = id => gearWait[id] ||= gl.loadAsync(new URL(`assets/gear/${id}.glb`, import.meta.url).href).then(g => { tune(g.scene); return g.scene; }).catch(() => null);
const FLIES = { lampmoth: 1.15, glasswing: 1.0, pollinator: .9, drone: 1.0 }; // how high the ones with wings hold themselves
let ALIAS = {}; const CW_ALIAS = { tree_a: 'c_tree_a', tree_b: 'c_tree_b', gate: 'c_gate', rock: 'c_rock', lamp: 'c_lamp', fx_lamp: 'c_lamp', mushrooms: 'c_vent', fx_bellcap: 'c_vent', survey: 'c_bench', column_fallen: 'c_gear', plinth: 'c_boiler', case_broken: 'c_orrery' };
const al = k => ALIAS[k] || k, gsz = k => GLB[al(k)][1];
const glbCache = {}, glbWait = {}; const gl = new GLTFLoader();
function loadGLB(kind) {
  kind = al(kind); if (!GLB[kind]) return Promise.resolve(null); if (glbCache[kind]) return Promise.resolve(glbCache[kind]);
  return glbWait[kind] ||= gl.loadAsync(new URL(`assets/models/${RIG[kind] ? RIG[kind][0] : GLB[kind][0]}.glb`, import.meta.url).href).then(g => { if (RIG[kind]) prepRig(g, kind); g.scene.traverse(m => { if (m.isMesh) { m.castShadow = true; const M = m.material; M.roughness = Math.max(.6, M.roughness); M.metalness = Math.min(.25, M.metalness); if (M.map) { M.emissiveMap = M.map; M.emissive = new THREE.Color(0xffffff); M.emissiveIntensity = .24; } } }); return glbCache[kind] = g.scene; }).catch(() => RIG[kind] ? (delete RIG[kind], delete glbWait[kind], loadGLB(kind)) : null);
}
// Wrap a rigged scene so it stands on the ground at unit height, and keep walk cycles in place.
// The direction a weapon model is long in (grip to tip), in its own space: the main axis of its vertices, pointing at the far end.
function longAxis(m) { if (m.userData.axis) return m.userData.axis; m.updateMatrixWorld(true); const pts = [], v = new THREE.Vector3(); m.traverse(c => { if (!c.isMesh) return; const p = c.geometry.attributes.position, st = Math.max(1, Math.floor(p.count / 400)); for (let i = 0; i < p.count; i += st) pts.push(v.fromBufferAttribute(p, i).applyMatrix4(c.matrixWorld).clone()); });
  const c = new THREE.Vector3(); for (const p of pts) c.add(p); c.divideScalar(pts.length || 1); let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0; for (const p of pts) { const x = p.x - c.x, y = p.y - c.y, z = p.z - c.z; xx += x * x; xy += x * y; xz += x * z; yy += y * y; yz += y * z; zz += z * z; }
  let a = new THREE.Vector3(1, 1, 1).normalize(); for (let i = 0; i < 40; i++) a.set(xx * a.x + xy * a.y + xz * a.z, xy * a.x + yy * a.y + yz * a.z, xz * a.x + yz * a.y + zz * a.z).normalize(); let lo = 0, hi = 0; for (const p of pts) { const d = p.dot(a); lo = Math.min(lo, d); hi = Math.max(hi, d); } if (-lo > hi) a.negate(); return m.userData.axis = a; }
// Library strike clips walk the body up to a tile and a half. Keep a hero on their own tile: scale the sideways and forward travel down.
function tether(clip, max = 28) { const t = clip.tracks.find(t => t.name === 'Hips.position'); if (!t) return; const v = t.values; for (const k of [0, 2]) { let lo = Infinity, hi = -Infinity; for (let i = k; i < v.length; i += 3) { lo = Math.min(lo, v[i]); hi = Math.max(hi, v[i]); } const f = Math.min(1, max / (hi - lo || 1)); if (f < 1) for (let i = k; i < v.length; i += 3) v[i] = v[k] + (v[i] - v[k]) * f; } }
function prepRig(g, kind) {
  g.scene.updateMatrixWorld(true); const box = new THREE.Box3(); g.scene.traverse(m => { if (m.isSkinnedMesh) { m.skeleton.update(); m.computeBoundingBox(); box.union(m.boundingBox.clone().applyMatrix4(m.matrixWorld)); } }); if (box.isEmpty()) box.setFromObject(g.scene); const h = box.max.y - box.min.y || 1; const wrap = new THREE.Group(); g.scene.scale.multiplyScalar(1 / h); g.scene.position.set(-(box.min.x + box.max.x) / 2 / h, -box.min.y / h, -(box.min.z + box.max.z) / 2 / h); wrap.add(g.scene); wrap.userData.h0 = h;
  g.scene.traverse(m => { if (m.isSkinnedMesh) m.frustumCulled = false; });
  const names = RIG[kind][1]; const clips = {};
  for (const k in names) { const c = g.animations.find(a => a.name === names[k]); if (!c) continue; if (k === 'walk') for (const t of c.tracks) if (t.name.endsWith('.position') && /hips|pelvis|root/i.test(t.name)) for (let i = 0; i < t.values.length; i += 3) { t.values[i] = t.values[0]; t.values[i + 2] = t.values[2]; } clips[k] = c; }
  wrap.userData.clips = clips; wrap.userData.rig = kind;
  // where gear goes, measured once on the untouched rest pose
  wrap.updateMatrixWorld(true); const B = n => wrap.getObjectByName(n); const P = n => new THREE.Vector3().setFromMatrixPosition(B(n).matrixWorld); const sock = {};
  try {
    for (const side of ['Right', 'Left']) { const w = P(side + 'Hand'), e = P(side + 'ForeArm'); sock[side + 'Hand'] = { bone: side + 'Hand', at: w.clone().add(w.clone().sub(e).normalize().multiplyScalar(.055)), size: 1, inv: B(side + 'Hand').matrixWorld.clone().invert() }; }
    const hd = P('Head'), he = P('head_end'); sock.head = { bone: 'Head', at: hd.clone().lerp(he, .56), size: hd.distanceTo(he) * .82, inv: B('Head').matrixWorld.clone().invert() };
    const span = Math.abs(P('LeftArm').x - P('RightArm').x); const ch = P('Spine01').lerp(P('Spine'), .35); ch.x = 0; sock.chest = { bone: 'Spine01', at: ch, size: span * 1.62, inv: B('Spine01').matrixWorld.clone().invert() };
    // jewelry, growths and carried things: neck, nape, back, shoulders, wrist, forearm, hips. Each rides the bone under it.
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z), I = n => B(n).matrixWorld.clone().invert(), SZ = .38, dp = ({ vanguard: .2, firebrand: .2, tracker: .11, naturalist: .13, tinkerer: .11 })[kind] || .12, // how far the front of the chest is from the spine, per hero // sized against the hero's height, not their shoulders: a narrow hero still needs gear that reads from across the hall
      sp2 = P('Spine02'), nk = P('neck'), hp = P('Hips'), LA = P('LeftArm'), RA = P('RightArm'), LF = P('LeftForeArm'), LH = P('LeftHand'), RF = P('RightForeArm'), RH = P('RightHand'); const sx = Math.sign(LA.x - RA.x) || 1;
    const along = (a, b) => new THREE.Quaternion().setFromUnitVectors(V3(0, -1, 0), b.clone().sub(a).normalize());
    sock.neck = { bone: 'Spine02', at: sp2.clone().lerp(nk, .35).add(V3(0, 0, dp)), size: SZ, inv: I('Spine02') };
    sock.nape = { bone: 'neck', at: nk.clone().add(V3(0, .01, -dp * .7)), size: SZ, inv: I('neck') };
    sock.back = { bone: 'Spine02', at: sp2.clone().add(V3(0, 0, -dp * .95)), size: SZ, inv: I('Spine02') };
    sock.shoulderL = { bone: 'Spine02', at: LA.clone().add(V3(-sx * SZ * .04, SZ * .16, 0)), size: SZ, inv: I('Spine02') };
    sock.shoulderR = { bone: 'Spine02', at: RA.clone().add(V3(sx * SZ * .04, SZ * .16, 0)), size: SZ, inv: I('Spine02') };
    sock.wristL = { bone: 'LeftForeArm', at: LF.clone().lerp(LH, .78), size: SZ, inv: I('LeftForeArm'), q: along(LF, LH) };
    sock.forearmR = { bone: 'RightForeArm', at: RF.clone().lerp(RH, .45).add(V3(0, 0, SZ * .1)), size: SZ, inv: I('RightForeArm'), q: along(RF, RH) };
    sock.hipL = { bone: 'Hips', at: hp.clone().add(V3(sx * Math.max(span * .5, .13), -SZ * .05, dp * .35)), size: SZ, inv: I('Hips') };
    sock.hipR = { bone: 'Hips', at: hp.clone().add(V3(-sx * Math.max(span * .5, .13), -SZ * .05, -dp * .45)), size: SZ, inv: I('Hips') };
  } catch { /* a rig without these bones just shows no gear */ }
  wrap.userData.sock = sock;
  gl.loadAsync(new URL(`assets/models/${RIG[kind][0].replace('_anim', '_cls')}.glb`, import.meta.url).href).then(c => { for (const a of c.animations) { tether(a); clips['c:' + a.name] = a; } }).catch(() => {});
  g.scene = wrap;
}
// Models load when something that uses them appears. Loading all of them up front made every visit fetch both regions.
const S = 1.1, GW = 14, GH = 10; const TR = 17, GZ = GW * S / 2 + 1.9, DK = 1.5; // terrace radius, gate distance, how far scenery sits out
const wx = y => (y - (GH - 1) / 2) * S, wz = x => ((GW - 1) / 2 - x) * S;
const PAL = {
  verdant: { fog: 0x140c30, sky: 0x0e0822, ground: ['#2b4a26', '#3a6129', '#557a2e', '#3a2a55', '#4b2f72'], dirt: ['#4a3f33', '#5c4f3d'], slab: ['#56624a', '#4b5842', '#616b52'], tuft: [0x3f6b2c, 0x5a8a34, 0x2f5530, 0x6a4a9a], key: 0xfff0c8, fill: 0x8fa0d8, rim: 0xff4fd8, leaf: [0x2f7d32, 0x1f5a3a, 0x5a2d91, 0x8a3ffc], glow: [0xff5fd2, 0xffe14a, 0xb46bff], trunk: 0x2a1b3a, stone: 0x8d8aa0 },
  clockwork: { fog: 0x0e2230, sky: 0x08151e, ground: ['#3a3326', '#52442a', '#6a5630', '#1f4a55', '#2a6f7a'], dirt: ['#2c2620', '#3a3128'], slab: ['#5e5136', '#54482f', '#6a5b3c'], tuft: [0x8a6a2a, 0xb08a3a, 0x2a6f7a, 0x5a4a2a], key: 0xffd9a0, fill: 0x2fd0ff, rim: 0xffa040, leaf: [0x8a6a2a, 0xb08a3a, 0x2a6f7a, 0x3fb0c0], glow: [0x3fe0ff, 0xffb040, 0xfff0a0], trunk: 0x3a2f24, stone: 0x6f7a80 },
};
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const glow = (c, i = 2.2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: .4 });
function P(geo, m, x = 0, y = 0, z = 0, o = {}) { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); if (o.r) k.rotation.set(...o.r); if (o.s) k.scale.set(...(Array.isArray(o.s) ? o.s : [o.s, o.s, o.s])); k.castShadow = true; k.receiveShadow = !!o.recv; return k; }
const G = (...kids) => { const g = new THREE.Group(); for (const k of kids) if (k) g.add(k); return g; };
const sph = (r, d = 1) => new THREE.IcosahedronGeometry(r, d), cone = (r, h, n = 6) => new THREE.ConeGeometry(r, h, n), cyl = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n), box = (a, b, c) => new THREE.BoxGeometry(a, b, c), tor = (r, t, n = 16) => new THREE.TorusGeometry(r, t, 6, n);
function ring(n, r, f) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const k = f(i, a); k.position.x += Math.cos(a) * r; k.position.z += Math.sin(a) * r; g.add(k); } return g; }
function legs(n, r, h, c, w = .035) { return ring(n, r, (i, a) => P(cyl(w, w * .6, h, 5), mat(c), 0, h / 2, 0, { r: [Math.cos(a) * .25, 0, -Math.sin(a) * .25] })); }
function leaves(n, r, h, cols, tilt = .9, y = 0) { return ring(n, r, (i, a) => P(cone(h * .28, h, 4), mat(cols[i % cols.length]), 0, y, 0, { r: [Math.sin(a) * tilt, -a, -Math.cos(a) * tilt] })); }

// ---------------------------------------------------------------- models (unit height about 1)
const MODELS = {
  vanguard: () => hero(0x4f6f9a, 0x9fb4c8, 0x4fd8e8, g => { g.add(P(cyl(.22, .26, .05, 6), mat(0xc9a24a, { metalness: .5, roughness: .4 }), -.27, .45, .08, { r: [0, 0, Math.PI / 2] }), P(cone(.07, .14, 4), glow(0x4fd8e8, 1.4), -.31, .45, .08, { r: [0, 0, Math.PI / 2] }), P(box(.07, .5, .1), mat(0xd8dde6, { metalness: .6, roughness: .3 }), .27, .5, .05)); }),
  tracker: () => hero(0x3d6b4a, 0x7a5a36, 0xffe14a, g => { g.add(P(tor(.2, .018, 12), mat(0x7a5230), .26, .5, 0, { r: [0, Math.PI / 2, 0], s: [1, 1.5, 1] }), P(cone(.14, .22, 6), mat(0x2f5a3a), 0, .98, 0), P(cyl(.05, .05, .3, 5), mat(0x7a5230), -.12, .62, -.14, { r: [.4, 0, .3] })); }),
  naturalist: () => hero(0x8a4a8f, 0xe8d8b0, 0x9cff7a, g => { g.add(P(cyl(.24, .24, .03, 10), mat(0xd9b96a), 0, .93, 0), P(cyl(.12, .14, .1, 8), mat(0x6a3a7a), 0, .98, 0), P(cyl(.12, .12, .2, 8), mat(0xefe6d0), 0, .42, -.2, { r: [0, 0, Math.PI / 2] }), P(sph(.05, 0), glow(0x9cff7a), .2, .5, .12)); }),
  firebrand: () => hero(0x2a3550, 0xc9a24a, 0xff6a2a, g => {}), // stand-in until Garrow's model is made
  tinkerer: () => hero(0x8a8f9a, 0xc0c6d0, 0x3fe0ff, g => { g.add(P(cyl(.01, .01, .28, 4), mat(0xc0c6d0), .08, 1.08, 0), P(sph(.035, 0), glow(0x3fe0ff), .08, 1.22, 0), P(box(.2, .22, .12), mat(0x5a6070, { metalness: .5 }), 0, .5, -.19), P(box(.16, .05, .02), glow(0x3fe0ff, 1.6), 0, .86, .15)); }, true),
  thornling: () => G(P(sph(.2, 1), mat(0x7a4a2a), 0, .32, 0), leaves(9, .12, .3, [0xb6e33a, 0x7fc02a, 0x8a3ffc], 1.25, .38), leaves(5, .05, .26, [0xd6f04a], .4, .5), legs(4, .12, .2, 0x4a2f1a), P(sph(.04, 0), glow(0xff5fd2), .08, .32, .18), P(sph(.04, 0), glow(0xff5fd2), -.08, .32, .18)),
  mossback: () => G(P(sph(.42, 1), mat(0x5a7a3a), 0, .42, 0, { s: [1.15, .75, 1.3] }), P(sph(.44, 0), mat(0x7a6a4a), 0, .36, 0, { s: [1.05, .5, 1.2] }), P(sph(.16, 1), mat(0x8a7a52), 0, .3, .58), P(sph(.03, 0), glow(0xffe14a, 1.2), .08, .34, .7), P(sph(.03, 0), glow(0xffe14a, 1.2), -.08, .34, .7), ring(4, .34, (i, a) => P(cyl(.09, .1, .26, 6), mat(0x6a5a3a), 0, .13, 0)), leaves(7, .16, .42, [0x2f9d42, 0x7fc02a, 0xb46bff], .5, .78), P(cone(.08, .5, 5), mat(0x3fb04a), .1, .95, -.1), P(sph(.06, 0), glow(0xff5fd2), -.12, .9, .12)),
  glasswing: () => { const wm = new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .42, emissive: 0x6fd6ff, emissiveIntensity: .7, side: THREE.DoubleSide, roughness: .2 }); const w = (sx, rz, z) => P(new THREE.CircleGeometry(.3, 5), wm, sx * .22, .62, z, { r: [-Math.PI / 2, rz * sx, 0], s: [1, .55, 1] }); const g = G(P(cyl(.04, .02, .5, 6), mat(0xe8f4ff), 0, .6, 0, { r: [Math.PI / 2, 0, 0] }), P(sph(.07, 0), glow(0x9fe8ff, 1.2), 0, .6, .26), w(1, .3, .08), w(-1, .3, .08), w(1, -.25, -.12), w(-1, -.25, -.12)); g.userData.hover = 1; return g; },
  gulper: () => G(P(cyl(.1, .2, .7, 7), mat(0x2f6a3a), 0, .35, 0), P(sph(.28, 1), mat(0x8a2f7a), 0, .82, 0), ring(8, .2, (i, a) => P(cone(.04, .2, 4), mat(0xf4f0d0), 0, 1.0, 0)), P(sph(.16, 0), glow(0xff3fa8, 1.6), 0, .9, 0), ring(4, .3, (i, a) => P(cyl(.03, .015, .5, 5), mat(0x3f8a4a), 0, .18, 0, { r: [Math.cos(a) * 1.1, 0, -Math.sin(a) * 1.1] }))),
  carrion: () => G(legs(4, .1, .34, 0x5a3a2a, .03), P(sph(.16, 0), mat(0x3a1f2a), 0, .46, 0), leaves(7, .12, .42, [0xd0304a, 0x9a1f5a, 0xff6a3a], 1.05, .52), P(sph(.09, 0), glow(0xffd04a, 1.8), 0, .56, 0)),
  hush: () => { const m = new THREE.MeshStandardMaterial({ color: 0x1a1030, transparent: true, opacity: .78, roughness: .3, flatShading: true }); return G(P(sph(.22, 1), m, 0, .3, 0, { s: [.8, .7, 2.4] }), P(sph(.14, 1), m, 0, .36, .56), P(cone(.05, .7, 4), m, 0, .3, -.8, { r: [-Math.PI / 2, 0, 0] }), legs(4, .2, .3, 0x1a1030, .025), P(sph(.03, 0), glow(0xffffff, 3), .06, .4, .66), P(sph(.03, 0), glow(0xffffff, 3), -.06, .4, .66), P(cone(.03, .16, 3), mat(0xe8e0ff), .16, .06, .36, { r: [Math.PI / 2, 0, 0] }), P(cone(.03, .16, 3), mat(0xe8e0ff), -.16, .06, .36, { r: [Math.PI / 2, 0, 0] })); },
  orchardmother: () => { const wing = sx => { const g = G(P(cyl(.05, .03, 1.5, 5), mat(0x7a5230), 0, .75, 0), ...Array.from({ length: 7 }, (_, i) => P(cone(.12, .46, 4), mat([0xb6e33a, 0x2f9d42, 0x8a3ffc][i % 3], i % 3 === 2 ? { emissive: 0x6a1fd0, emissiveIntensity: .8 } : {}), sx * .1, .3 + i * .19, 0, { r: [0, 0, -sx * 1.2] }))); g.position.set(sx * .95, 0, .15); g.rotation.z = -sx * .55; return g; };
    return G(P(cyl(.3, .46, .9, 8), mat(0x6a4526), 0, .45, 0), P(sph(.6, 1), mat(0x2f7d32), 0, 1.15, 0, { s: [1.1, .8, 1.1] }), leaves(14, .42, .7, [0xc6ee3a, 0x7fc02a, 0x8a3ffc, 0x2f9d42], .85, 1.25), leaves(8, .2, .6, [0xd6f04a, 0xb6e33a], .4, 1.55), P(sph(.26, 1), mat(0xa87a3a), 0, .78, .42, { s: [1, .9, .8] }), P(cone(.11, .6, 5), mat(0xe0a020, { metalness: .4, roughness: .35 }), 0, .5, .56, { r: [Math.PI, 0, 0] }), P(sph(.07, 0), glow(0xd03fff, 3), .13, .84, .6), P(sph(.07, 0), glow(0xd03fff, 3), -.13, .84, .6), wing(1), wing(-1), ring(5, .5, (i, a) => P(sph(.08, 0), glow(0xb46bff, 1.6), 0, .72, 0))); },
  mite: () => G(P(cyl(.2, .2, .1, 10), mat(0xc9a24a, { metalness: .7, roughness: .35 }), 0, .2, 0), ring(8, .22, () => P(box(.06, .1, .06), mat(0xa8842f, { metalness: .7, roughness: .35 }), 0, .2, 0)), P(sph(.08, 0), glow(0xff8a2a, 2), 0, .28, .06), legs(6, .16, .16, 0x6a5020, .02)),
  pollinator: () => { const wm = new THREE.MeshStandardMaterial({ color: 0x9fdcff, transparent: true, opacity: .45, emissive: 0x3fe0ff, emissiveIntensity: .6, side: THREE.DoubleSide }); const g = G(P(sph(.17, 1), mat(0x2f5fc0, { metalness: .5, roughness: .4 }), 0, .7, 0, { s: [1, 1, 1.3] }), P(sph(.09, 0), glow(0x3fe0ff, 2.2), 0, .72, .2), P(new THREE.CircleGeometry(.3, 6), wm, .24, .86, 0, { r: [-Math.PI / 2, 0, .4], s: [1, .5, 1] }), P(new THREE.CircleGeometry(.3, 6), wm, -.24, .86, 0, { r: [-Math.PI / 2, 0, -.4], s: [1, .5, 1] }), P(cyl(.03, .01, .16, 5), mat(0xc9a24a, { metalness: .7 }), 0, .52, .05)); g.userData.hover = 1; return g; },
  coilfawn: () => G(P(sph(.18, 1), mat(0xd9c9a0), 0, .5, 0, { s: [.8, .8, 1.5] }), P(cyl(.05, .07, .28, 6), mat(0xd9c9a0), 0, .68, .24, { r: [.6, 0, 0] }), P(sph(.1, 1), mat(0xe8dcb8), 0, .82, .34), P(cone(.02, .2, 4), mat(0xc9a24a, { metalness: .7 }), .05, .98, .32), P(cone(.02, .2, 4), mat(0xc9a24a, { metalness: .7 }), -.05, .98, .32), P(sph(.025, 0), glow(0x3fe0ff, 2), .06, .84, .42), ring(4, .14, () => G(...[0, 1, 2, 3].map(i => P(tor(.04, .012, 8), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, .06 + i * .09, 0, { r: [Math.PI / 2, 0, 0] }))))),
  warden: () => G(P(box(.3, .34, .22), mat(0x5a6470, { metalness: .6, roughness: .4 }), 0, .2, 0), P(box(.5, .46, .32), mat(0x6f7a88, { metalness: .6, roughness: .4 }), 0, .66, 0), P(box(.26, .2, .26), mat(0x4a5460, { metalness: .6 }), .38, .82, 0), P(box(.26, .2, .26), mat(0x4a5460, { metalness: .6 }), -.38, .82, 0), P(box(.12, .5, .12), mat(0x5a6470, { metalness: .6 }), .4, .46, 0), P(box(.12, .5, .12), mat(0x5a6470, { metalness: .6 }), -.4, .46, 0), P(sph(.16, 1), mat(0x7f8a98, { metalness: .6 }), 0, 1.04, 0), P(sph(.08, 0), glow(0xffb040, 2.4), 0, 1.04, .13)),
  mantis: () => G(P(sph(.16, 1), mat(0x2a8a7a, { metalness: .5, roughness: .4 }), 0, .46, -.1, { s: [.8, .7, 2] }), P(cyl(.05, .07, .4, 6), mat(0x2a8a7a, { metalness: .5 }), 0, .66, .22, { r: [.5, 0, 0] }), P(cone(.12, .2, 3), mat(0x3fb0a0, { metalness: .5 }), 0, .9, .34, { r: [Math.PI / 2, 0, 0] }), P(sph(.035, 0), glow(0x3fe0ff, 3), .07, .92, .36), P(sph(.035, 0), glow(0x3fe0ff, 3), -.07, .92, .36), P(box(.03, .5, .1), glow(0x9ff4ff, .9), .2, .7, .44, { r: [.9, 0, .2] }), P(box(.03, .5, .1), glow(0x9ff4ff, .9), -.2, .7, .44, { r: [.9, 0, -.2] }), legs(4, .22, .46, 0x1f6a5a, .025)),
  regulator: () => { const g = G(P(cyl(.5, .62, .3, 10), mat(0x5a4a2a, { metalness: .6, roughness: .4 }), 0, .15, 0), P(cyl(.16, .2, 1.2, 8), mat(0x7a6230, { metalness: .6, roughness: .4 }), 0, .9, 0), P(sph(.24, 1), glow(0xff8a2a, 1.8), 0, 1.3, 0), P(cyl(.02, .02, .7, 4), mat(0xc9a24a, { metalness: .8 }), 0, .7, .3), P(sph(.1, 0), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, .34, .3)); const rs = [0, 1, 2].map(i => P(tor(.5 + i * .16, .03, 28), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, 1.3, 0, { r: [i * .9, i * .5, 0] })); rs.forEach(r => g.add(r)); g.userData.spin = rs; return g; },
  drone: () => { const g = G(P(box(.2, .08, .2), mat(0x8a8f9a, { metalness: .6 }), 0, .6, 0), P(sph(.05, 0), glow(0x3fe0ff, 2.4), 0, .55, .1), ring(4, .18, () => P(cyl(.1, .1, .012, 8), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .5 }), 0, .66, 0))); g.userData.hover = 1; return g; },
  lure: () => G(P(sph(.16, 1), mat(0x8a2f4a), 0, .18, 0), P(sph(.08, 0), glow(0xff3f6a, 3), 0, .36, 0)),
  // props
  rock: (r, pal) => G(P(new THREE.DodecahedronGeometry(.46, 0), mat(pal.stone), 0, .26, 0, { s: [1 + r() * .3, .7 + r() * .5, 1 + r() * .3], r: [r(), r() * 3, r()], recv: true }), P(new THREE.DodecahedronGeometry(.24, 0), mat(pal.stone), .3, .14, .22, { r: [r(), r(), r()] })),
  lantern_moss: () => G(...[[0, 0, .34], [.18, .1, .24], [-.16, .12, .28], [.06, -.18, .2], [-.1, -.14, .16]].map(([x, z, h]) => G(P(cyl(.015, .02, h, 5), mat(0xbfe8d0), x, h / 2, z), P(sph(.06, 0), glow(0x9fffe0, 2.6), x, h + .04, z)))),
  snare_vine: () => G(...Array.from({ length: 5 }, (_, i) => P(tor(.12 + i * .07, .02, 14), mat(0x2f6a3a), 0, .03, 0, { r: [Math.PI / 2, 0, i] })), ring(6, .3, () => P(cone(.02, .1, 4), mat(0xd6f04a), 0, .08, 0))),
  heartfruit: () => G(P(cyl(.03, .04, .5, 5), mat(0x3f6a3a), 0, .25, 0), P(sph(.16, 1), glow(0xff4a6a, 1.3), 0, .56, 0, { s: [1, 1.15, 1] }), leaves(4, .08, .24, [0x2f9d42], 1.2, .36)),
  mirror_reed: () => G(...Array.from({ length: 6 }, (_, i) => P(box(.03, .6 + (i % 3) * .14, .005), new THREE.MeshStandardMaterial({ color: 0xe8f4ff, metalness: 1, roughness: .08, emissive: 0x9fd0ff, emissiveIntensity: .5 }), (i - 2.5) * .08, .35, (i % 2) * .08))),
  copper_lily: () => G(P(cyl(.02, .03, .4, 5), mat(0x8a5a2a, { metalness: .6 }), 0, .2, 0), leaves(6, .08, .28, [0xd98a3a], 1.0, .46), P(sph(.06, 0), glow(0x3fe0ff, 2.6), 0, .5, 0)),
  tick_fern: () => G(...Array.from({ length: 5 }, (_, i) => P(tor(.1, .02, 10), mat(0x3fb0a0, { metalness: .4 }), Math.cos(i * 1.3) * .14, .22 + i * .04, Math.sin(i * 1.3) * .14, { r: [0, i * 1.3, 0] })), P(cyl(.02, .03, .3, 5), mat(0x2a6f7a), 0, .15, 0)),
  cache: () => G(P(box(.5, .3, .34), mat(0x5a4632), 0, .15, 0), P(box(.52, .1, .36), mat(0x7a6040), 0, .34, 0), P(box(.54, .04, .06), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, .22, .17), P(sph(.05, 0), glow(0xffe14a, 2), 0, .22, .2)),
  wonder: () => { const g = G(P(sph(.2, 2), glow(0xfff0a0, 3.2), 0, .9, 0), P(tor(.34, .012, 28), glow(0xffd080, 1.4), 0, .9, 0, { r: [1.2, 0, 0] }), P(cyl(.12, .2, .3, 8), mat(0x8d8aa0), 0, .15, 0)); g.userData.hover = 1; return g; },
  corpse: () => G(P(sph(.2, 0), mat(0x3a2f3a), 0, .06, 0, { s: [1.2, .3, 1] }), P(cone(.03, .2, 4), mat(0xd8d0c0), .1, .1, 0, { r: [0, 0, .9] })),
  trap: () => G(P(tor(.22, .025, 10), mat(0x8a8f9a, { metalness: .8 }), 0, .04, 0, { r: [Math.PI / 2, 0, 0] }), ring(6, .22, () => P(cone(.025, .1, 3), mat(0xd8dde6, { metalness: .8 }), 0, .08, 0))),
};
function hero(body, trim, accent, extra, robot) {
  const g = G(P(cyl(.16, .2, .4, 8), mat(body), 0, .46, 0), P(cyl(.2, .17, .12, 8), mat(trim, { metalness: .3 }), 0, .7, 0), P(sph(.15, 1), mat(robot ? 0xb0b6c2 : 0xf0c8a0, robot ? { metalness: .5 } : {}), 0, .86, 0), P(cyl(.07, .08, .26, 6), mat(0x2a2438), .09, .13, 0), P(cyl(.07, .08, .26, 6), mat(0x2a2438), -.09, .13, 0), P(sph(.1, 0), mat(trim, { metalness: .3 }), .22, .68, 0), P(sph(.1, 0), mat(trim, { metalness: .3 }), -.22, .68, 0), P(box(.34, .05, .2), glow(accent, 1.1), 0, .28, 0));
  extra(g); g.userData.hero = 1; return g;
}

export function createScene(el, { onTile, onDecor, onHover, onMiss, region = 'verdant', seed = 1, places = {} }) {
  const decorOf = id => DECORS[places[id] ? 'pl_' + places[id] : id] || (places[id] ? [] : DECORS.S); // a side place is dressed for what it is
  const pal = PAL[region] || PAL.verdant;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  let dpr = Math.min(devicePixelRatio, 1.5); renderer.setPixelRatio(dpr); renderer.shadowMap.autoUpdate = false; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  el.prepend(renderer.domElement); renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  const scene = new THREE.Scene(); const vista = true; const CW = region === 'clockwork'; ALIAS = CW ? CW_ALIAS : {}; scene.background = new THREE.Color(CW ? 0xb9966a : 0x6f95c4); scene.fog = new THREE.FogExp2(CW ? 0xc7a274 : 0x7fa4cf, vista ? .0042 : .03);
  const here = new THREE.Group(); scene.add(here); // the hall you are in; the far world slides past it when you travel
  const cam = new THREE.PerspectiveCamera(34, 1, .1, 1200);
  scene.add(new THREE.HemisphereLight(pal.fill, 0x1a2a14, 1.75)); const lift = new THREE.PointLight(0xfff0d8, 30, 16); lift.position.set(4, 5, 4.5); scene.add(lift);
  const key = new THREE.DirectionalLight(pal.key, 4.2); key.position.set(9, 13, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);  Object.assign(key.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 50 }); key.shadow.bias = -.0008; key.shadow.normalBias = .04; scene.add(key);
  const rim = new THREE.DirectionalLight(pal.rim, .9); rim.position.set(-7, 4, -6); scene.add(rim);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam)); const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .38, .55, .9); composer.addPass(bloom); composer.addPass(new OutputPass());

  // ground: painted in a canvas, then lit. One composed floor: a paved survey floor where the board is, a worn path from
  // the way in to the gate, moss thickening to the rim, and bare earth under every piece of scenery so it sits in the ground.
  const r0 = rng(seed + 11); const cv = document.createElement('canvas'); cv.width = cv.height = 2048; const cx = cv.getContext('2d'); const GP = 2048 / (2 * TR); const px = x => (x + TR) * GP, pz = z => (z + TR) * GP;
  const TP = CW ? 'c_' : 'v_'; const art = {}; const ready = Promise.all(['ground', 'stone', 'dirt', 'cliff', 'tuft', 'fern', 'plates'].map(k => new Promise(res => { const im = new Image(); im.onload = () => { art[k] = im; res(); }; im.onerror = () => res(); im.src = new URL(`assets/tex/${TP}${k === 'ground' && !CW ? 'grass' : k}.${k === 'tuft' || k === 'fern' ? 'png' : 'jpg'}`, import.meta.url).href; })));
  // a painted texture laid as mirrored tiles, so it repeats without a seam
  const tiles = (im, px0, tint) => { const c = document.createElement('canvas'); c.width = c.height = px0 * 2; const x = c.getContext('2d'); for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { x.save(); x.translate(a ? px0 * 2 : 0, b ? px0 * 2 : 0); x.scale(a ? -1 : 1, b ? -1 : 1); x.drawImage(im, 0, 0, px0, px0); x.restore(); } if (tint) { x.globalCompositeOperation = 'multiply'; x.fillStyle = tint; x.fillRect(0, 0, px0 * 2, px0 * 2); } return cx.createPattern(c, 'repeat'); };
  let lastSite = 'S';
  const paintGround = siteId => { lastSite = siteId; const r = rng(seed + 11 + (siteId ? siteId.charCodeAt(0) : 0)); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over'; cx.fillStyle = pal.ground[0]; cx.fillRect(0, 0, 2048, 2048); if (!art.ground) return;
    const grass = tiles(art.ground, 330, CW ? '#c8c0b0' : '#b9c4b4'), dirt = art.dirt && tiles(art.dirt, 250, '#c9c2b8'), stone = art.stone && tiles(art.stone, CW ? 2 * S * GP : 3 * S * GP, CW ? '#a39a88' : '#8f978c');
    cx.fillStyle = grass; cx.fillRect(0, 0, 2048, 2048);
    // soft-edged patches of another surface: build the shape in a mask, then draw the texture through it
    const mask = document.createElement('canvas'); mask.width = mask.height = 2048; const mx = mask.getContext('2d'); const through = pat => { mx.globalCompositeOperation = 'source-in'; mx.fillStyle = pat; mx.fillRect(0, 0, 2048, 2048); cx.drawImage(mask, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.clearRect(0, 0, 2048, 2048); };
    const puff = (X, Y, R, a = 1) => { const g = mx.createRadialGradient(X, Y, R * .35, X, Y, R); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); mx.fillStyle = g; mx.beginPath(); mx.arc(X, Y, R, 0, 7); mx.fill(); };
    const wild = !!places[siteId];
    if (dirt) { // the path in and the path on to the gate, and bare earth under scenery
      const way = (x0, z0, x1, z1) => { for (let t = 0; t <= 1; t += .02) { const w = Math.sin(t * 9 + x0) * .5; puff(px(x0 + (x1 - x0) * t + w), pz(z0 + (z1 - z0) * t), 62 + r() * 26, .9); } };
      way(.8, TR, 0, GW * S / 2); if (!wild) way(0, -GW * S / 2, 0, -GZ - 1); else { way(0, GW * S / 2, -1.5, 2); for (let q = 0; q < 26; q++) puff(px((r() - .5) * GH * S * .9), pz((r() - .5) * GW * S * .9), 50 + r() * 70, .5); } // off the path the ground is only trodden, never paved
      for (const [kind, x0, z0, , k = 1] of decorOf(siteId)) { if (kind === 'pond' || kind === 'reeds') continue; const R = (kind.startsWith('tree') ? 120 : kind === 'spires' ? 150 : 78) * Math.min(2.2, k); for (let q = 0; q < 5; q++) puff(px(x0 * DK) + (r() - .5) * R * .7, pz(z0 * DK) + (r() - .5) * R * .7, R * (.55 + r() * .4), .8); }
      through(dirt); }
    if (stone && !wild) { // the survey floor: paving with a broken, overgrown edge
      const hx = GH * S / 2 * GP, hz = GW * S / 2 * GP; mx.fillStyle = '#000'; mx.fillRect(1024 - hx - 6, 1024 - hz - 6, hx * 2 + 12, hz * 2 + 12); mx.globalCompositeOperation = 'destination-out'; for (let q = 0; q < 150; q++) { const e = Math.floor(r() * 4), t = r() * 2 - 1; const X = 1024 + (e < 2 ? t * hx : (e === 2 ? -hx : hx)), Y = 1024 + (e < 2 ? (e ? hz : -hz) : t * hz); const R = 10 + r() * 30; const g = mx.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); mx.fillStyle = g; mx.beginPath(); mx.arc(X, Y, R, 0, 7); mx.fill(); } mx.globalCompositeOperation = 'source-over'; through(stone); }
    const vg = cx.createRadialGradient(1024, 1024, 2048 * .24, 1024, 1024, 1024); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.85, 'rgba(8,8,14,.1)'); vg.addColorStop(1, 'rgba(6,6,12,.22)'); cx.globalAlpha = 1; cx.fillStyle = vg; cx.fillRect(0, 0, 2048, 2048); };
  paintGround('S');
  cx.globalAlpha = 1; const gt = new THREE.CanvasTexture(cv); gt.colorSpace = THREE.SRGBColorSpace; gt.anisotropy = 8; ready.then(() => { if (dead) return; paintGround(lastSite); gt.needsUpdate = true; });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(vista ? TR : 30, 64), new THREE.MeshStandardMaterial({ map: gt, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; here.add(ground);
  // faint tile seams so the board reads without looking like a spreadsheet
  const seam = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x0a0f08, transparent: true, opacity: .22 })); { const v = []; for (let x = 0; x <= GW; x++) v.push(wx(-.5), .012, wz(x - .5), wx(GH - .5), .012, wz(x - .5)); for (let y = 0; y <= GH; y++) v.push(wx(y - .5), .012, wz(-.5), wx(y - .5), .012, wz(GW - .5)); seam.geometry.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); } here.add(seam);
  // surroundings
  const env = new THREE.Group(); here.add(env);
  const tree = (x, z, h) => { const g = G(P(cyl(.16 * h, .3 * h, 2.6 * h, 6), mat(pal.trunk, { emissive: 0x1a0f2a, emissiveIntensity: .6 }), 0, 1.3 * h, 0)); for (let i = 0; i < 4; i++) g.add(P(sph(.9 * h * (1 - i * .12), 0), mat(pal.leaf[Math.floor(r0() * pal.leaf.length)]), (r0() - .5) * h, 2.5 * h + i * .45 * h, (r0() - .5) * h, { s: [1, .7, 1] })); g.position.set(x, 0, z); return g; };
  const pillar = (x, z, h) => { const g = G(P(cyl(.3, .36, h, 8), mat(pal.stone), 0, h / 2, 0), P(box(.9, .2, .9), mat(pal.stone), 0, h + .1, 0), region === 'clockwork' ? P(tor(.7, .08, 16), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, h * .7, 0, { r: [Math.PI / 2, 0, 0] }) : P(sph(.22, 0), glow(pal.glow[2], 1.5), 0, h + .45, 0)); g.position.set(x, 0, z); return g; };
  const real = true; const decor = new THREE.Group(); here.add(decor);
  if (!real) for (let i = 0; i < 46; i++) { const a = r0() * Math.PI * 2, d = 7.6 + r0() * 9; const x = Math.cos(a) * d * .95, z = Math.sin(a) * d - 1; if ((z > 5.5 && Math.abs(x) < 6) || (x > 4.6 && Math.abs(z) < 10)) continue; env.add(r0() < .82 ? tree(x, z, .8 + r0() * 1.1) : pillar(x, z, 1.6 + r0() * 2)); }
  if (!real) env.add(pillar(-2.6, -GZ + .2, 3.4), pillar(2.6, -GZ + .2, 3.4), P(box(6.2, .5, .8), mat(pal.stone), 0, 3.9, -GZ + .2));
  const gate = P(new THREE.PlaneGeometry(real ? 2.5 : 4.2, real ? 3.6 : 3.4), glow(pal.glow[2], .9), 0, 1.8, -GZ - .1); gate.castShadow = false; env.add(gate);
  const lamps = []; let dressSite = () => {};
  // ---- The far world. The hall is a terrace; beyond its edge the Galleries fall away for miles.
  const farG = new THREE.Group(); scene.add(farG); const skyG = new THREE.Group(); scene.add(skyG); const drift = []; /* P0, P1: hilltops off the way, one seen from the first hall and one from the second */ const SITES = { S: [0, 0, 0], A: [-92, 5, -52], B: [-92, -5, 58], F: [-205, 12, 0], P0: [-46, 7, 42], P1: [-150, 14, 0] }; const marksFar = {}; let site = 'S', flight = null;
  if (vista) {
    const fm = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true, ...o });
    // painted rock and turf for the big bare shapes, so the far world is made of the same stuff as the hall
    const skin = (mesh, k, rx, ry, tint = 0xffffff) => { ready.then(() => { if (dead || !art[k]) return; const t = new THREE.Texture(art[k]); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; mesh.material = new THREE.MeshStandardMaterial({ map: t, color: tint, roughness: 1 }); }); return mesh; };
    // sky: a painted dome that fog does not touch
    const sk = document.createElement('canvas'); sk.width = 1024; sk.height = 512; const sx = sk.getContext('2d'); const g0 = sx.createLinearGradient(0, 0, 0, 512);
    (CW ? [[0, '#150d2a'], [.24, '#3a2a5a'], [.38, '#8a5a6a'], [.47, '#e8a868'], [.5, '#ffe2a8'], [.52, '#d9b07a'], [.6, '#b9966a'], [1, '#8a6a48']] : [[0, '#0b1238'], [.26, '#1f3a86'], [.4, '#4f86cf'], [.475, '#a8dcec'], [.5, '#ffe6c0'], [.52, '#9fc4e0'], [.6, '#6f95c4'], [1, '#4a6c9c']]).forEach(([p, c]) => g0.addColorStop(p, c)); sx.fillStyle = g0; sx.fillRect(0, 0, 1024, 512);
    const rs = rng(seed + 77); for (let i = 0; i < 520; i++) { sx.globalAlpha = .25 + rs() * .75; sx.fillStyle = rs() < .15 ? '#ffd9a8' : '#ffffff'; const y = rs() * rs() * 170; sx.fillRect(rs() * 1024, y, rs() < .08 ? 2 : 1, rs() < .08 ? 2 : 1); }
    for (let i = 0; i < 9; i++) { const x = rs() * 1024, y = 40 + rs() * 170, r = 60 + rs() * 130; const ng = sx.createRadialGradient(x, y, 0, x, y, r); const col = ['180,90,255', '80,200,230', '255,120,200'][i % 3]; ng.addColorStop(0, `rgba(${col},.22)`); ng.addColorStop(1, `rgba(${col},0)`); sx.globalAlpha = 1; sx.fillStyle = ng; sx.fillRect(x - r, y - r, r * 2, r * 2); }
    const skt = new THREE.CanvasTexture(sk); skt.colorSpace = THREE.SRGBColorSpace; const dome = new THREE.Mesh(new THREE.SphereGeometry(900, 40, 20), new THREE.MeshBasicMaterial({ map: skt, side: THREE.BackSide, fog: false, depthWrite: false })); dome.rotation.y = 1.2; skyG.add(dome);
    // a pale ringed world low over the far side
    const pc = document.createElement('canvas'); pc.width = pc.height = 256; const px = pc.getContext('2d'); const pg = px.createRadialGradient(100, 96, 8, 128, 128, 120); pg.addColorStop(0, '#f4ead8'); pg.addColorStop(.6, '#c9a8d8'); pg.addColorStop(1, '#5a4a90'); px.fillStyle = pg; px.beginPath(); px.arc(128, 128, 112, 0, 7); px.fill(); px.globalAlpha = .25; px.fillStyle = '#7a5aa8'; for (let i = 0; i < 7; i++) px.fillRect(16, 60 + i * 22, 224, 6 + (i % 3) * 3);
    const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace; const planet = new THREE.Mesh(new THREE.CircleGeometry(95, 48), new THREE.MeshBasicMaterial({ map: pt, fog: false, transparent: true, opacity: .8, depthWrite: false })); planet.position.set(-700, 250, -260); planet.lookAt(0, 20, 0); skyG.add(planet);
    const ringP = new THREE.Mesh(new THREE.RingGeometry(120, 170, 64), new THREE.MeshBasicMaterial({ color: 0xd8c8f0, fog: false, transparent: true, opacity: .32, side: THREE.DoubleSide, depthWrite: false })); ringP.position.copy(planet.position); ringP.lookAt(0, 20, 0); ringP.rotateX(1.25); skyG.add(ringP);
    // the terrace: rock falling away under the hall
    // ---- One continuous land. Every place is a clearing on it; hills, woods and paths lie between, and a ridge can hide a place.
    const sst = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    const ROUTES = [['S', 'A'], ['S', 'B'], ['A', 'F'], ['B', 'F'], ['S', 'P0'], ['A', 'P1'], ['B', 'P1']]; const segD = (x, z, a, b) => { const ax = SITES[a][0], az = SITES[a][2], bx = SITES[b][0], bz = SITES[b][2]; const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2))); const w = Math.sin(t * Math.PI) * Math.sin(t * 9 + ax) * 5; return [Math.hypot(x - (ax + (bx - ax) * t) - w * .4, z - (az + (bz - az) * t) - w), t, SITES[a][1] + (SITES[b][1] - SITES[a][1]) * t]; };
    const pathAt = (x, z) => { let best = [1e9, 0, 0]; for (const [a, b] of ROUTES) { const d = segD(x, z, a, b); if (d[0] < best[0]) best = d; } return best; };
    const MESAS = [[-118, -18, 13, 24], [-110, 24, 12, 19], [-170, -62, 24, 34], [-175, 66, 26, 40], [-290, -72, 40, 62], [-300, 82, 44, 70], [-252, 0, 24, 46], [-60, -122, 20, 22], [-72, 126, 22, 26]]; // placed inside what the hall's camera can see down the valley, plus two for the flights
    const land = (x, z) => { let h = 7 * Math.sin(x * .031 + 1.3) * Math.cos(z * .027) + 4 * Math.sin(x * .07 + z * .05) + 2.5 * Math.sin(z * .11 - x * .04) - 5;
      h += 15 * Math.exp(-(((x + 150) / 24) ** 2)) * (.5 + .5 * Math.sin(z * .045 + 1)) - 5 * Math.exp(-((z / 26) ** 2)) * sst(-20, -60, x) * sst(-140, -110, x); // a ridge before the last room, and an open valley down the middle to see along
      const d = Math.hypot((x + 100) / 235, z / 245); h += sst(.72, 1.2, d) * (70 + 22 * Math.sin(x * .05) * Math.cos(z * .06)); // high ground closing the horizon
      for (const [mx, mz, mr, mh] of MESAS) h += mh * (1 - sst(mr * .8, mr, Math.hypot(x - mx, z - mz))) * (1 + .06 * Math.sin(x * .3) * Math.cos(z * .27)); // table mountains: flat tops, sheer sides
      const pt = pathAt(x, z); h += (pt[2] - 1.2 - h) * (1 - sst(4, 16, pt[0])) * .85; // the ways between places are worn low
      for (const id in SITES) { const [sx, sy, sz] = SITES[id]; h += (sy - .07 - h) * (1 - sst(TR + 1.5, TR * 2.5, Math.hypot(x - sx, z - sz))); } return h; };
    { const X0 = -360, X1 = 150, Z0 = -260, Z1 = 260, NX = 200, NZ = 200; const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, NX, NZ); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2); const P0 = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < P0.count; i++) { P0.setY(i, land(P0.getX(i), P0.getZ(i))); { const x = P0.getX(i), z = P0.getZ(i); uv.setXY(i, (x + 9 * Math.sin(z * .043) + 4 * Math.sin(z * .13 + x * .05)) / 23, (z + 9 * Math.sin(x * .039 + 1) + 4 * Math.cos(x * .11 - z * .06)) / 23); } } g.computeVertexNormals();
      const N0 = g.attributes.normal, col = new Float32Array(P0.count * 3), c = new THREE.Color(), rock = new THREE.Color(CW ? 0x8a7a5a : 0x9a94b4), meadow = new THREE.Color(CW ? 0xd08a4a : 0xc08af0), mossy = new THREE.Color(CW ? 0x5ac0b0 : 0x5fd6c8), dirt = new THREE.Color(CW ? 0x6a5a48 : 0xa08a6a); for (let i = 0; i < P0.count; i++) { const x = P0.getX(i), z = P0.getZ(i), y = P0.getY(i); const sh = .72 + .28 * sst(-14, 14, y) + (Math.sin(x * .9) * Math.cos(z * .8)) * .05; c.setRGB(sh, sh, sh); const n1 = Math.sin(x * .05 + 1.7) * Math.cos(z * .043 - .6) + Math.sin((x + z) * .021), n2 = Math.sin(x * .037 - 2) * Math.cos(z * .061 + 1.1) + Math.cos((x - z) * .017); c.lerp(meadow, sst(.75, 1.25, n1) * .75); c.lerp(mossy, sst(.8, 1.3, n2) * .7); c.lerp(rock, sst(.9, .68, N0.getY(i))); c.lerp(dirt, (1 - sst(1.5, 5, pathAt(x, z)[0])) * .8); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const terr = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: CW ? 0x7a6a48 : 0x4a7a40, roughness: 1, vertexColors: true })); terr.receiveShadow = true; farG.add(terr);
      ready.then(() => { if (dead || !art.ground) return; const t = new THREE.Texture(art.ground); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 8; t.needsUpdate = true; terr.material.map = t; terr.material.color.set(0xffffff); terr.material.needsUpdate = true; });
      // light falling as water: streaks drawn once, scrolled forever
      const fc = document.createElement('canvas'); fc.width = 64; fc.height = 256; const fx = fc.getContext('2d'); const fr = rng(seed + 909); for (let i = 0; i < 46; i++) { const X = fr() * 64, w0 = 1 + fr() * 5; const g = fx.createLinearGradient(0, 0, 0, 256); const a0 = .25 + fr() * .6; for (let q = 0; q <= 6; q++) g.addColorStop(q / 6, `rgba(255,255,255,${(q % 2 ? a0 : a0 * .35).toFixed(2)})`); fx.fillStyle = g; fx.fillRect(X, 0, w0, 256); }
      const fallTex = () => { const t = new THREE.CanvasTexture(fc); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
      MESAS.forEach(([mx, mz, mr, mh], i) => { const n = i >= 2 && i < 6 ? 2 : 1; for (let j = 0; j < n; j++) { const a = Math.atan2(-mz, -mx + 20) + (j ? .9 : -.25) * (i % 2 ? 1 : -1); const dx = Math.cos(a), dz = Math.sin(a); const ex = mx + dx * mr * .9, ez = mz + dz * mr * .9, bx = mx + dx * mr * 1.04, bz = mz + dz * mr * 1.04; const top = land(mx + dx * mr * .7, mz + dz * mr * .7), bot = land(bx, bz); const H0 = top - bot; if (H0 < 8) continue; const w0 = 4 + (i * 3 + j * 5) % 5; const colr = (i + j) % 2 ? (CW ? 0xffb040 : 0xb070ff) : (CW ? 0x40ffe0 : 0x40d8ff);
          const tex = fallTex(); tex.repeat.set(1, H0 / 18); const f = new THREE.Mesh(new THREE.PlaneGeometry(w0, H0), new THREE.MeshBasicMaterial({ map: tex, color: colr, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); f.position.set((ex + bx) / 2, bot + H0 / 2, (ez + bz) / 2); f.rotation.y = Math.atan2(dx, dz); f.userData = { fall: 1, sp: .5 + (i % 3) * .15 }; farG.add(f); drift.push(f);
          const pool = new THREE.Mesh(new THREE.CircleGeometry(w0 * 1.5, 20), new THREE.MeshBasicMaterial({ color: colr, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(bx + dx * w0, bot + .4, bz + dz * w0); farG.add(pool);
          const mist = new THREE.Mesh(new THREE.SphereGeometry(w0 * 1.1, 10, 8), new THREE.MeshBasicMaterial({ color: colr, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false })); mist.position.set(bx, bot + w0 * .5, bz); mist.scale.y = .6; farG.add(mist); } });
      // old temples on the table tops, and trees nobody planted
      const LM = [['temple_ruin', -170, -62, 15, .4], ['temple_ruin', -300, 82, 26, 2.2], ['temple_arch', -175, 66, 17, 1.2], ['temple_arch', -290, -72, 24, 4], ['temple_arch', -84, 8, 8, 2.6], ['temple_ruin', -118, -18, 8, 1.6], ['dream_tree_b', -110, 24, 7, 2], ['temple_ruin', -60, -122, 12, 1],
        ['dream_tree_a', -72, 126, 12, 0], ['dream_tree_a', -252, 0, 14, 2], ['dream_tree_a', -112, 30, 8, 1], ['dream_tree_a', -200, -24, 10, 3], ['dream_tree_a', -34, -40, 6, 4], ['dream_tree_b', -70, -22, 7, 0], ['dream_tree_b', -132, 62, 10, 1], ['dream_tree_b', -226, 40, 13, 2], ['dream_tree_b', -30, 78, 6.5, 3], ['dream_tree_b', -128, -70, 8, 5]];
      for (const kind of ['temple_ruin', 'temple_arch', 'dream_tree_a', 'dream_tree_b']) loadGLB(kind).then(m => { if (!m || dead) return; for (const [k0, x, z, k, turn] of LM) { if (k0 !== kind) continue; let near = 1e9; for (const id in SITES) near = Math.min(near, Math.hypot(x - SITES[id][0], z - SITES[id][2])); if (near < TR + 8) continue; const o = m.clone(true); o.traverse(n => { if (n.isMesh) n.castShadow = false; }); o.scale.setScalar(k); o.position.set(x, land(x, z) - .4, z); o.rotation.y = turn; farG.add(o); } });
      // woods, outcrops and fungus between the places, thicker off the paths
      const rw = rng(seed * 3 + 77); const spots = []; for (let i = 0; i < 4000 && spots.length < 150; i++) { const x = X0 + 60 + rw() * (X1 - X0 - 130), z = Z0 + 50 + rw() * (Z1 - Z0 - 100); if (x > 26) continue; let near = 1e9; for (const id in SITES) near = Math.min(near, Math.hypot(x - SITES[id][0], z - SITES[id][2])); if (near < TR + 5 || pathAt(x, z)[0] < 7) continue; if (Math.sin(x * .045 + 2) * Math.cos(z * .05) + rw() * .7 < .35) continue; spots.push([x, z, rw()]); }
      for (const kind of ['tree_a', 'tree_b', 'rock', 'mushrooms']) loadGLB(al(kind) + '_lo').then(m => { if (!m || dead) return; const mine = spots.map((p, i) => [p, i]).filter(([[, , q]]) => (q < .42 ? 'tree_a' : q < .72 ? 'tree_b' : q < .9 ? 'rock' : 'mushrooms') === kind); if (!mine.length) return; m.updateMatrixWorld(true); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), E = new THREE.Euler();
        m.traverse(c => { if (!c.isMesh) return; const im = new THREE.InstancedMesh(c.geometry, c.material, mine.length); mine.forEach(([[x, z], i], n) => { const k = gsz(al(kind)) * (kind === 'rock' ? 2.5 + (i % 5) : kind === 'mushrooms' ? 2 + (i % 3) : 1.1 + (i % 7) * .22); E.set(0, i * 2.4, 0); Q.setFromEuler(E); V.set(x, land(x, z) - .3, z); Sc.set(k, k, k); M.compose(V, Q, Sc).multiply(c.matrixWorld); im.setMatrixAt(n, M); }); im.frustumCulled = false; farG.add(im); }); }); }
    const canopy = CW ? [0x9a7a3a, 0x7a6a3a, 0x4a8a7a, 0xa8823a, 0x3f7a72, 0x8a5a3a] : [0x3f8f4a, 0x2f7a52, 0x4a8a6a, 0x57a04a, 0x2f6f5a, 0x6a5aa8];
    // colossal gallery columns and arches marching to the horizon
    const stone = fm(CW ? 0x8a6f3a : 0x8f8ab0), brass = fm(0xb8964a, { metalness: .5, roughness: .5 });
    const column = (x, z, h, r) => { const c = new THREE.Group(); c.add(skin(new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.15, h, 10), stone), 'cliff', 3, Math.round(h / (r * 2)), CW ? 0xd0c0a0 : 0xc8c4d8)); const cap = new THREE.Mesh(new THREE.BoxGeometry(r * 3, r * .9, r * 3), stone); cap.position.y = h / 2; c.add(cap); const band = new THREE.Mesh(new THREE.TorusGeometry(r * 1.08, r * .09, 6, 16), brass); band.rotation.x = Math.PI / 2; band.position.y = h * .18; c.add(band); c.position.set(x, -46 + h / 2, z); farG.add(c); return c; };
    for (let row = 0; row < 7; row++) for (const sgn of [-1, 1]) { const x = -70 - row * 85, z = sgn * (85 + row * 22), h = 190 + row * 14; column(x, z, h, 9 + row); if (row < 6) { const arch = new THREE.Mesh(new THREE.TorusGeometry(85 + row * 22, 5 + row * .6, 6, 24, Math.PI), stone); arch.position.set(x, -46 + h - 10, 0); arch.rotation.y = Math.PI / 2; if (sgn > 0) farG.add(arch); } }
    // far giants: the same trees you stand under, a hundred times the size
    const giants = [[-150, -190, 14], [-170, 200, 16], [-300, -130, 22], [-330, 150, 24], [-420, -40, 30], [-480, 230, 34, 'tree_b'], [-120, -230, 10, 'tree_b'], [-520, -260, 36], [-60, 150, 8, 'tree_b'], [-40, -150, 8]];
    for (const [x, z, k, kind = 'tree_a'] of giants) loadGLB(al(kind) + '_lo').then(m => { if (!m || dead) return; const t = m.clone(true); t.traverse(c => { if (c.isMesh) c.castShadow = false; }); t.scale.setScalar(gsz(kind) * k * .55); t.position.set(x, land(x, z) - 1, z); t.rotation.y = x * .7; farG.add(t); });
    // islands adrift between here and there
    // shafts of light through the canopy of the ceiling nobody has seen
    for (const [x, z, w] of [[-18, -14, 5], [-30, 20, 8], [-70, -40, 14], [-120, 50, 22], [-8, 16, 3]]) { const ray = new THREE.Mesh(new THREE.CylinderGeometry(w * .35, w, 220, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: .05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); ray.position.set(x, 60, z); ray.rotation.z = .16; farG.add(ray); drift.push(Object.assign(ray, { userData: { ray: 1, ph: x } })); }
    // the places this expedition can go next, standing where you can see them
    const beam = c => new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 240, 10, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    for (const id in SITES) { const [x, y, z] = SITES[id]; const L = new THREE.Group(); L.position.set(x, y, z); const top = new THREE.Mesh(new THREE.CylinderGeometry(TR, TR, .5, 28), fm(CW ? (id === 'A' ? 0x5a4a2a : 0x7a6a3a) : id === 'A' ? 0x3a5a2a : 0x57a04a)); top.position.y = -.26; const under = new THREE.Mesh(new THREE.CylinderGeometry(TR, TR * .66, 26, 20, 1, true), fm(CW ? 0x3a2c1c : 0x3a2f52)); L.add(skin(top, 'ground', 6, 6, 0xb9c4b4));
      const bm = beam(id === 'A' ? 0xff6a4a : id === 'B' ? 0x8fe8ff : id === 'F' ? 0xff7ae0 : 0xffe9a8); bm.position.y = 110; L.add(bm); drift.push(Object.assign(bm, { userData: { beam: 1, ph: x } }));
      if (id === 'A') for (let i = 0; i < 16; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(.6 + rs() * 1.2, 5 + rs() * 9, 5), fm(i % 3 ? 0x2a1f3f : 0x5a2d6a)); const a = rs() * 6.3, d = 2 + rs() * 9; sp.position.set(Math.cos(a) * d, 3, Math.sin(a) * d); sp.rotation.z = (rs() - .5) * .5; L.add(sp); }
      if (id === 'B') { const pond = new THREE.Mesh(new THREE.CircleGeometry(8, 28), new THREE.MeshStandardMaterial({ color: 0x7fd6f0, roughness: .15, metalness: .4, emissive: 0x2a6a88, emissiveIntensity: .6 })); pond.rotation.x = -Math.PI / 2; pond.position.y = .02; L.add(pond); loadGLB('tree_b').then(m => { if (!m || dead) return; for (const [tx, tz] of [[9, 3], [-8, -6], [2, -10]]) { const t = m.clone(true); t.scale.setScalar(7); t.position.set(tx, 0, tz); L.add(t); } }); }
      if (id === 'F') loadGLB('tree_a').then(m => { if (!m || dead) return; const t = m.clone(true); t.scale.setScalar(60); t.position.set(-4, 0, 0); L.add(t); });
      if (id === 'S') loadGLB('gate').then(m => { if (!m || dead) return; const t = m.clone(true); t.scale.setScalar(gsz('gate')); t.position.set(0, 0, -GZ); L.add(t); });
      farG.add(L); marksFar[id] = L; const tag = document.createElement('div'); tag.className = 'sitetag'; tag.hidden = true; L.userData.tag = tag; }
    scene.add(new THREE.HemisphereLight(CW ? 0xffe2b0 : 0xcfe6ff, CW ? 0x4a3a1a : 0x3a5a3a, .9)); const hemiFar = new THREE.DirectionalLight(0xfff0d0, 1.1); hemiFar.position.set(-40, 60, 0); scene.add(hemiFar);
  }
  const put = (kind, x, z, turn = 0, k = 1) => loadGLB(kind).then(m => { if (!m || dead) return null; const o = m.clone(true); o.scale.setScalar(gsz(kind) * k); o.position.set(x, 0, z); o.rotation.y = turn; o.traverse(c => { c.userData.decor = kind; }); o.userData.home = k; return o; });
  if (real) {
    let gateO = null; put('gate', 0, -GZ).then(o => { if (!o) return; gateO = o; env.add(o); o.visible = gate.visible; });
    const cover = new THREE.Group(); here.add(cover);
    const cardGeo = (() => { const g = new THREE.BufferGeometry(); const v = [], uv = [], nm = [], ix = []; for (let q = 0; q < 2; q++) { const c = Math.cos(q * Math.PI / 2 + .4) * .5, sn = Math.sin(q * Math.PI / 2 + .4) * .5; const b = v.length / 3; v.push(-c, 0, -sn, c, 0, sn, c, .72, sn, -c, .72, -sn); uv.push(0, 0, 1, 0, 1, 1, 0, 1); for (let k = 0; k < 4; k++) nm.push(0, 1, 0); ix.push(b, b + 1, b + 2, b, b + 2, b + 3); } g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nm, 3)); g.setIndex(ix); return g; })();
    const cardMat = k => { const t = new THREE.Texture(art[k]); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: 1, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .06 }); };
    const growCover = id => { for (const o of [...cover.children]) cover.remove(o); const r = rng(seed * 7 + id.charCodeAt(0)); const D0 = decorOf(id).filter(d => d[0] !== 'pond'); const pond = decorOf(id).find(d => d[0] === 'pond');
      const onFloor = (x, z, m) => Math.abs(x) < GH * S / 2 + m && Math.abs(z) < GW * S / 2 + m, onPath = (x, z) => Math.abs(x) < 1.6 && (z > GW * S / 2 || z < -GW * S / 2), inPond = (x, z) => pond && ((x - pond[1] * DK) / 5.6) ** 2 + ((z - pond[2] * DK) / 8.4) ** 2 < 1;
      const ok = (x, z) => x * x + z * z < (TR - .8) ** 2 && !onFloor(x, z, .35) && !onPath(x, z) && !inPond(x, z); const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), col = new THREE.Color();
      const spots = []; for (const d of D0) { const X = d[1] * DK, Z = d[2] * DK, R = (d[0].startsWith('tree') ? 2.6 : 1.7) * Math.min(2, d[4] || 1); for (let i = 0; i < 9; i++) { const a = r() * 6.283, q = R * (.6 + r() * .6); spots.push([X + Math.cos(a) * q, Z + Math.sin(a) * q]); } } // gathered at the foot of things
      for (let i = 0; i < 46; i++) { const a = r() * 6.283, q = TR * (.55 + r() * .42); const x = Math.cos(a) * q, z = Math.sin(a) * q; const c = 2 + Math.floor(r() * 4); for (let j = 0; j < c; j++) spots.push([x + (r() - .5) * 1.6, z + (r() - .5) * 1.6]); } // and in drifts out toward the rim
      for (const [k, share, size] of [['tuft', .7, 1.0], ['fern', .3, 1.1]]) { if (!art[k]) continue; const mine = spots.filter((_, i) => (i * 7 % 10 < 7) === (k === 'tuft')).filter(p => ok(p[0], p[1])); const im = new THREE.InstancedMesh(cardGeo, cardMat(k), mine.length); mine.forEach(([x, z], i) => { const sz = size * (.7 + r() * .7); E.set(0, r() * 6.283, 0); Q.setFromEuler(E); Sc.set(sz, sz, sz); V.set(x, -.02, z); M.compose(V, Q, Sc); im.setMatrixAt(i, M); col.setScalar(.62 + r() * .22); im.setColorAt(i, col); }); if (im.instanceColor) im.instanceColor.needsUpdate = true; im.receiveShadow = true; cover.add(im); }
      const rk = al('rock'); loadGLB(rk).then(m => { if (!m || dead || site !== id) return; for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + r() * .16; if (Math.cos(a) > .5 && Math.abs(Math.sin(a)) < .55) continue; const q = TR - .9 - r() * 1.1, x = Math.cos(a) * q, z = Math.sin(a) * q; if (onPath(x, z) || inPond(x, z)) continue; const o = m.clone(true); o.scale.setScalar(gsz(rk) * (.7 + r() * .9)); o.position.set(x, -.05, z); o.rotation.y = r() * 6.283; cover.add(o); } }); };
    dressSite = id => { gate.visible = !places[id]; if (gateO) gateO.visible = gate.visible; pl1.intensity = gate.visible ? 14 : 0; seam.visible = !places[id]; paintGround(id); gt.needsUpdate = true; ready.then(() => { if (!dead && site === id) growCover(id); });
      for (const o of [...decor.children]) { if (o.userData.light) scene.remove(o.userData.light); decor.remove(o); } const mySite = id;
      decorOf(id).forEach(([kind, x0, z0, turn, k = 1], i) => { const x = x0 * DK, z = z0 * DK; const add = o => { if (!o || site !== mySite) return; o.userData.i = i; o.traverse(c => { c.userData.decor = kind; }); decor.add(o);
          if (kind === 'lamp' && decorOf(id).findIndex(d => d[0] === 'lamp') === i) { const l = new THREE.PointLight(0xffc878, 18, 10); l.position.set(x, 2.6, z); scene.add(l); o.userData.light = l; } }; // one lit lamp per site: every point light is paid for on every pixel
        if (kind === 'spires') { const g = new THREE.Group(); const rr = rng(seed + i * 13 + 5); for (let j = 0; j < 9; j++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(.25 + rr() * .45, 2.2 + rr() * 4.2, 5), new THREE.MeshStandardMaterial(CW ? { color: j % 3 ? 0x6a4a2a : 0x9a7a3a, roughness: .5, metalness: .6, flatShading: true } : { color: j % 3 ? 0x2a1f3f : 0x5a2d6a, roughness: .9, flatShading: true })); sp.position.set((rr() - .5) * 3.4, 1.6, (rr() - .5) * 3.4); sp.rotation.z = (rr() - .5) * .5; sp.rotation.x = (rr() - .5) * .4; sp.castShadow = true; g.add(sp); } g.position.set(x, 0, z); g.scale.setScalar(k); add(g); }
        else if (kind === 'pond') { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.CircleGeometry(5.2, 36), new THREE.MeshStandardMaterial({ color: CW ? 0x3fd0c0 : 0x7fd6f0, roughness: .12, metalness: .5, emissive: CW ? 0x1a8a7a : 0x2a6a88, emissiveIntensity: CW ? .9 : .55, transparent: true, opacity: .92 })); w.rotation.x = -Math.PI / 2; w.position.y = .03; w.scale.set(1, 1.5, 1); const rim = new THREE.Mesh(new THREE.RingGeometry(5.1, 5.7, 36), new THREE.MeshStandardMaterial({ color: 0x4a5a48, roughness: 1 })); rim.rotation.x = -Math.PI / 2; rim.position.y = .035; rim.scale.set(1, 1.5, 1); g.add(w, rim); g.position.set(x, 0, z); add(g); }
        else if (kind === 'reeds') loadGLB('mirror_reed').then(m => { if (!m || dead) return; const g = new THREE.Group(); for (let j = 0; j < 3; j++) { const t = m.clone(true); t.scale.setScalar(2.6 + j * .5); t.position.set((j - 1) * 1.1, 0, (j % 2) * .9); t.rotation.y = j * 2.1; g.add(t); } g.position.set(x, 0, z); g.rotation.y = turn * 1.57; add(g); });
        else put(kind, x, z, turn * 1.57, k).then(add); });
    };
    // a loose ring of forest behind everything, kept off the camera's side of the hall
    for (let i = 0; i < 0; i++) { const a = r0() * Math.PI * 2, d = 12 + r0() * 9; const x = Math.cos(a) * d - 3, z = Math.sin(a) * d; if (x > 3.5 && Math.abs(z) < 12) continue; if (z > 6 && Math.abs(x) < 5) continue; put(r0() < .6 ? 'tree_a' : 'tree_b', x, z, r0() * 6, .8 + r0() * .7).then(o => o && env.add(o)); }
  }
  for (let i = 0; i < 70; i++) { const a = r0() * Math.PI * 2, d = 1 + r0() * 11; const f = P(sph(.03 + r0() * .035, 0), glow(pal.glow[Math.floor(r0() * 3)], 1.1 + r0() * .8), Math.cos(a) * d, .06 + r0() * .1, Math.sin(a) * d - .5); f.castShadow = false; env.add(f); }
  for (let i = 0; i < (vista ? 0 : 70); i++) { const a = r0() * Math.PI * 2, d = 4 + r0() * 9; const b = P(cone(.16 + r0() * .2, .3 + r0() * .5, 5), mat(pal.leaf[Math.floor(r0() * pal.leaf.length)]), Math.cos(a) * d, .2, Math.sin(a) * d - .5); if (Math.abs(b.position.x) < 4.2 && Math.abs(b.position.z) < 5.4) continue; env.add(b); }
  const pl1 = new THREE.PointLight(pal.glow[2], 14, 12); pl1.position.set(0, 2.2, -GZ + 1); scene.add(pl1);;
  const fn = 46, fp = new Float32Array(fn * 3), fs = []; for (let i = 0; i < fn; i++) { fp[i * 3] = (r0() - .5) * 16; fp[i * 3 + 1] = .3 + r0() * 3; fp[i * 3 + 2] = (r0() - .5) * 16 - 1; fs.push(r0() * 6); }
  const flies = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(fp, 3)), new THREE.PointsMaterial({ color: pal.glow[1], size: .06, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); here.add(flies);

  // tile markers
  const marks = new THREE.Group(); here.add(marks); const mk = {};
  const mm = { reach: new THREE.MeshBasicMaterial({ color: 0x9ff0e0, transparent: true, opacity: .2, depthWrite: false }), threat: new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: .26, depthWrite: false }), mv: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, depthWrite: false }), ab: new THREE.MeshBasicMaterial({ color: 0xffd05a, transparent: true, opacity: .34, depthWrite: false }), danger: new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: .4, depthWrite: false }) };
  const mg = { reach: new THREE.PlaneGeometry(S * .93, S * .93), threat: new THREE.PlaneGeometry(S * .97, S * .97), mv: new THREE.CircleGeometry(.09, 16), ab: new THREE.PlaneGeometry(S * .92, S * .92), danger: new THREE.PlaneGeometry(S * .96, S * .96) };
  const lineG = new THREE.Group(); here.add(lineG); const threatG = new THREE.Group(); here.add(threatG); const beaconG = new THREE.Group(); here.add(beaconG); const beaconGeo = new THREE.OctahedronGeometry(.11, 0); const arrowGeo = new THREE.ConeGeometry(.11, .3, 6); const lineM = new THREE.MeshBasicMaterial({ color: 0xff5a48, transparent: true, opacity: .85, depthWrite: false }); const lm = new THREE.LineDashedMaterial({ color: 0xff6a5a, dashSize: .16, gapSize: .12, transparent: true, opacity: .9 });
  const ringGeo = new THREE.RingGeometry(.34, .4, 28); const ringM = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false });
  const RM = { sel: ringM(0xffffff), hostile: ringM(0xff5a4a), tg: ringM(0xffd05a), calm: ringM(0x7fe0c0), spent: ringM(0x8090a8) };

  const units = new Map(), props = new Map(); let rocks = new THREE.Group(); here.add(rocks); const labels = document.createElement('div'); labels.className = 'labels'; el.append(labels);
  function unitObj(u) {
    let o = units.get(u.id); if (o) return o;
    const g = new THREE.Group(); let sc = 1;
    const dress = (body, real) => {
      body.rotation.y = u.side === 'c' ? (real ? .5 : 0) : real ? Math.PI - .5 : Math.PI; // seekers face up the hall, turned enough to show a profile
      sc = .86 * (real ? GLB[u.kind][1] : ({ orchardmother: 1.9, regulator: 1.7, warden: 1.15, mossback: 1.1 }[u.kind] || 1) * 1.3); if (u.variant === 'overgrown') sc *= 1.35; body.scale.setScalar(sc);
      if (u.variant) body.traverse(m => { if (m.isMesh) m.material = m.material.clone(); });
      if (u.variant === 'gilded') body.traverse(m => { if (m.isMesh) { m.material.map = null; m.material.emissiveMap = null; m.material.emissive.set(0x5a3a00); m.material.color.set(0xe0b040); m.material.metalness = .7; m.material.roughness = .3; m.material.needsUpdate = true; } });
      if (u.variant === 'pale') body.traverse(m => { if (m.isMesh) { m.material.color.lerp(new THREE.Color(0xffffff), .75); m.material.transparent = true; m.material.opacity = .7; } });
      if (real && FLIES[u.kind]) { body.userData.hover = true; body.userData.hoverY = FLIES[u.kind]; }
      g.add(body); return body;
    };
    const copy = m => { if (!m.userData.rig) return m.clone(true); const c = skinClone(m); c.userData.clips = m.userData.clips; c.userData.rig = m.userData.rig; c.userData.sock = m.userData.sock; return c; };
    const ready = glbCache[u.kind]; const body = dress(ready ? copy(ready) : MODELS[MODELS[u.kind] ? u.kind : 'thornling'](), !!ready);
    if (!ready && GLB[u.kind]) body.visible = false; // no stand-in shape while the model is on its way
    if (!ready && GLB[u.kind]) loadGLB(u.kind).then(m => { const cur = units.get(u.id); if (!m || !cur || cur !== o) return; const rot = cur.body.rotation.y; g.remove(cur.body); cur.body = dress(copy(m), true); cur.body.rotation.y = rot; cur.real = true; animate(cur); wear(cur, u.gear); cur.h = sc + .3; });
    const rg = new THREE.Mesh(ringGeo, RM.calm); rg.rotation.x = -Math.PI / 2; rg.position.y = .03; rg.scale.setScalar(sc > 2 ? 1.9 : 1.15); g.add(rg);
    g.position.set(wx(u.y), 0, wz(u.x)); here.add(g);
    const lab = document.createElement('div'); lab.className = 'ulab ' + u.side; labels.append(lab);
    o = { g, body, rg, lab, real: !!ready, h: ready ? sc + .3 : sc > 2 ? 3.1 : 1.2 * sc + (body.userData.hover ? .15 : 0), phase: Math.random() * 6, kick: 0, tx: g.position.x, tz: g.position.z }; units.set(u.id, o); animate(o); wear(o, u.gear); return o;
  }
  // Rigged units get a mixer. play() crossfades to a clip; one-shots return to idle.
  function animate(o) {
    const clips = o.body.userData.clips; if (!clips) return; o.mixer = new THREE.AnimationMixer(o.body); o.acts = {}; for (const k in clips) o.acts[k] = o.mixer.clipAction(clips[k]);
    o.mixer.addEventListener('finished', e => { if (o.cur === e.action && !o.downed) play(o, 'idle'); }); o.cur = null; play(o, 'idle');
  }
  // Put what the Seeker has equipped on the model: weapon in hand, head piece, body armor.
  function wear(o, gear) {
    const sock = o.body.userData.sock; if (!sock || !gear) return; const body = o.body; o.wclass = null; o.flames = [];
    const flame = (piece, id) => { const len = FLAME[id]; if (!len) return; const dir = new THREE.Vector3(0, Math.sin(.698), Math.cos(.698)), f = new THREE.Group(); // a blade in grip space leans 40 degrees forward of straight up
      for (const [r, h, c, op] of [[.075, .86, 0xff5a14, .55], [.04, .7, 0xffd24a, .8]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(len * r, len * h, 7, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.y = len * h * .5; f.add(m); }
      const l = new THREE.PointLight(0xff8a3a, 5, 3.5); l.position.y = len * .5; f.add(l); f.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); f.position.copy(dir).multiplyScalar(len * .04); f.visible = !!o.lit; piece.add(f); o.flames.push(f); };
    const off = GEAR[gear.weapon] && GEAR[gear.weapon][0] === 'hand' && GEAR[gear.weapon][2], sl = off && sock.LeftHand; // a second blade for the left hand
    if (sl) loadGear(off).then(m => { if (!m || o.body !== body) return; const bone = body.getObjectByName(sl.bone); if (!bone) return; const piece = m.clone(true); const L = sl.inv.clone().multiply(new THREE.Matrix4().compose(sl.at.clone(), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1))); L.decompose(piece.position, piece.quaternion, piece.scale); bone.add(piece); flame(piece, off); });
    for (const id of [gear.weapon, gear.head, gear.body, gear.accessory, gear.implant, gear.device]) { const G0 = GEAR[id]; if (!G0) continue; const s = sock[G0[0] === 'hand' ? 'RightHand' : G0[0]]; if (!s) continue; if (G0[0] === 'hand') o.wclass = G0[1];
      loadGear(id).then(m => { if (!m || o.body !== body) return; const bone = body.getObjectByName(s.bone); if (!bone) return; const piece = m.clone(true); const k = G0[0] === 'hand' ? 1 : s.size * G0[1];
        const W = new THREE.Matrix4().compose(s.at.clone().add(new THREE.Vector3(0, G0[0] === 'hand' ? 0 : G0[2] || 0, G0[0] === 'hand' ? 0 : G0[3] || 0)), s.q || new THREE.Quaternion(), new THREE.Vector3(k, k, k)); const L = s.inv.clone().multiply(W); L.decompose(piece.position, piece.quaternion, piece.scale); bone.add(piece);
        if (G0[0] === 'hand') { o.weap = { piece, rest: piece.quaternion.clone(), axis: longAxis(m) }; flame(piece, id); } }); }
  }
  // Point the held weapon's long axis where the body is facing, eased in and out over the strike.
  const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
  function level(o, now) { const w = o.weap, a = o.aim; if (!w || !w.piece.parent) { o.aim = null; return; } const k = (now - a.t) / a.ms; w.piece.quaternion.copy(w.rest); if (k >= 1) { o.aim = null; return; }
    const e = Math.min(1, k / .22, (1 - k) / .2); w.piece.parent.updateWorldMatrix(true, false); w.piece.parent.getWorldQuaternion(_q1); _q2.copy(_q1).multiply(w.rest); _v1.copy(w.axis).applyQuaternion(_q2).normalize(); o.body.getWorldQuaternion(_q3); _v2.set(0, 0, 1).applyQuaternion(_q3).normalize();
    _q3.setFromUnitVectors(_v1, _v2); _q2.premultiply(new THREE.Quaternion().slerp(_q3, e * e * (3 - 2 * e))); w.piece.quaternion.copy(_q1.invert().multiply(_q2)); }
  function play(o, name, { once = false, speed = 1, hold = false, from = 0, to = 0 } = {}) {
    if (o.acts && !o.acts[name] && o.body.userData.clips[name]) o.acts[name] = o.mixer.clipAction(o.body.userData.clips[name]);
    const a = o.acts && o.acts[name]; if (!a) return 0; if (o.cur === a && !once) return 0;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = once; a.timeScale = speed; a.fadeIn(.16).play(); if (from) a.time = from; o.endAt = to ? performance.now() + (to - from) / speed * 1000 : 0; if (o.cur && o.cur !== a) o.cur.fadeOut(.16); o.cur = a; o.downed = hold;
    return a.getClip().duration / speed * 1000;
  }
  // Stand at a site with no flight (start of a room, or a reload mid-expedition).
  function placeAt(id) { site = id || 'S'; if (!vista) return; const p = SITES[site]; farG.position.set(-p[0], -p[1], -p[2]); here.position.set(0, 0, 0); for (const k in marksFar) marksFar[k].visible = k !== site; dressSite(site); }
  const api = {
    // look at a tile: used when a Seeker is selected and when something worth watching happens
    focus(x, y, snap) { focus.set(clampX(wx(y)), 0, clampZ(wz(x))); if (snap) focNow.copy(focus); },
    place: placeAt,
    names(n) { if (!vista) return; for (const k in marksFar) { const tag = marksFar[k].userData.tag; tag.textContent = k === 'S' ? 'Where you came in' : n[k] || ''; if (!tag.parentNode) labels.append(tag); } },
    // Fly to another site: the hall falls away behind and the place you could see arrives underneath you.
    travel(id) { if (!vista || !SITES[id] || id === site) { placeAt(id); return Promise.resolve(); } const zoomWas = zoom; zoom = 1; setTimeout(() => { zoom = zoomWas; }, 3300); const from = farG.position.clone(); const p = SITES[id]; const to = new THREE.Vector3(-p[0], -p[1], -p[2]);
      labels.style.opacity = 0; marksFar[site].visible = false; return new Promise(res => { flight = { from, delta: to.clone().sub(from), t0: performance.now(), ms: 3200, done: () => { flight = null; placeAt(id); labels.style.opacity = 1; res(); } }; }); },
    setRoom(st) {
      for (const o of units.values()) { o.g.removeFromParent(); o.lab.remove(); } units.clear(); for (const o of props.values()) o.removeFromParent(); props.clear(); rocks.removeFromParent(); rocks = new THREE.Group(); here.add(rocks);
      const r = rng(seed * 31 + st.roomIdx * 7 + 3); st.room.rock.forEach((v, i) => { if (!v) return; const X = wx(Math.floor(i / GW)), Z = wz(i % GW), turn = r() * 6, k = .85 + r() * .3; const group = rocks; const m = real && glbCache[al('rock')]; const add = (o, sc) => { o.position.set(X, 0, Z); if (sc) { o.scale.setScalar(sc); o.rotation.y = turn; } group.add(o); return o; };
        if (m) add(m.clone(true), gsz('rock') * k); else { const ph = add(MODELS.rock(r, pal)); ph.visible = !real; if (real) loadGLB('rock').then(g => { if (!g || group !== rocks) return; group.remove(ph); add(g.clone(true), gsz('rock') * k); }); } });
    },
    // list: [{id,x,y,kind,side,variant,ring,label,gone}]
    sync(list, propList, extras) {
      const seen = new Set();
      for (const u of list) { const o = unitObj(u); seen.add(u.id); o.g.visible = !u.gone; o.lab.hidden = !!u.gone; if (u.gone) continue; if (!o.walking) { o.g.position.x = o.tx = wx(u.y); o.g.position.z = o.tz = wz(u.x); } o.rg.material = RM[u.ring] || RM.calm; o.rg.visible = !!u.ring; if (o.lab.innerHTML !== u.label) o.lab.innerHTML = u.label; o.lit = !!u.lit; }
      for (const [id, o] of units) if (!seen.has(id)) { o.g.removeFromParent(); o.lab.remove(); units.delete(id); }
      const pseen = new Set();
      for (const p of propList) { pseen.add(p.key); let o = props.get(p.key); if (o && p.lit !== undefined) { if (p.lit && !o.userData.lamp) { const l = new THREE.PointLight(0xffc878, 22, 9); l.position.y = 1.9; o.add(l); o.userData.lamp = l; } else if (!p.lit && o.userData.lamp) { o.remove(o.userData.lamp); o.userData.lamp = null; } o.scale.y = p.spent ? .7 : 1; } if (o && p.model === 'plate') o.userData.mat.emissiveIntensity = p.on ? 1.1 : .1;
        if (!o && p.model === 'plate') { o = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xb4b4b4, roughness: .9, polygonOffset: true, polygonOffsetFactor: -2, emissive: 0xffffff, emissiveIntensity: p.on ? 1.1 : .1 }); const disc = new THREE.Mesh(new THREE.CircleGeometry(S * .45, 28), mat); disc.rotation.x = -Math.PI / 2; disc.position.y = .02; disc.receiveShadow = true; o.add(disc); o.userData.mat = mat; const g0 = p.glyph; ready.then(() => { if (!art.plates) return; const t = new THREE.Texture(art.plates); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(.5, .5); t.offset.set(g0 % 2 ? .5 : 0, g0 > 1 ? 0 : .5); t.needsUpdate = true; mat.map = t; mat.emissiveMap = t; mat.needsUpdate = true; }); o.position.set(wx(p.y), 0, wz(p.x)); here.add(o); props.set(p.key, o); }
        if (!o) { const rm = GLB[al(p.model)] && glbCache[al(p.model)]; if (rm) { o = new THREE.Group(); const c = rm.clone(true); c.scale.setScalar(gsz(p.model)); o.add(c); } else { const f = MODELS[p.model] || MODELS.cache; o = f(rng(1), pal); if (GLB[al(p.model)]) { const holder = o; for (const c of holder.children) c.visible = false; loadGLB(p.model).then(g => { if (!g || props.get(p.key) !== holder) return; holder.clear(); const c = g.clone(true); c.scale.setScalar(gsz(p.model)); holder.add(c); }); } } o.position.set(wx(p.y), 0, wz(p.x)); if (p.scale) o.scale.setScalar(p.scale); here.add(o); props.set(p.key, o); } o.userData.use = p.use; }
      for (const [k, o] of props) if (!pseen.has(k)) { o.removeFromParent(); props.delete(k); }
      void extras;
    },
    marks(map) {
      for (const k in mk) { marks.remove(mk[k]); delete mk[k]; }
      const put = (k, cls, x, y, h) => { const m = new THREE.Mesh(mg[cls], mm[cls]); m.rotation.x = -Math.PI / 2; m.position.set(wx(y), h, wz(x)); m.renderOrder = 2; marks.add(m); mk[k + cls] = m; };
      for (const [k, cls] of map) { const [x, y] = k.split(',').map(Number); if (cls === 'mv') { put(k, 'reach', x, y, .018); put(k, 'mv', x, y, .03); } else put(k, cls, x, y, .02); }
    },
    // tiles a hovered creature could strike next turn
    threat(list) { threatG.clear(); for (const [x, y] of list) { const m = new THREE.Mesh(mg.threat, mm.threat); m.rotation.x = -Math.PI / 2; m.position.set(wx(y), .024, wz(x)); m.renderOrder = 3; threatG.add(m); } },
    // a marker over everything on the board that can be used, studied or gathered
    beacons(list) { beaconG.clear(); for (const [x, y, h, c] of list) { const m = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: c || 0xffd05a })); m.position.set(wx(y), h || 1.5, wz(x)); m.userData.y = h || 1.5; beaconG.add(m); } },
    lines(list) {
      lineG.clear();
      for (const [a, b] of list) { const A = new THREE.Vector3(wx(a.y), .5, wz(a.x)), Bv = new THREE.Vector3(wx(b.y), .55, wz(b.x)); const mid = A.clone().lerp(Bv, .5); mid.y = 1.2 + A.distanceTo(Bv) * .12; const curve = new THREE.QuadraticBezierCurve3(A, mid, Bv);
        lineG.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 18, .035, 5), lineM)); const head = new THREE.Mesh(arrowGeo, lineM); const tan = curve.getTangent(1); head.position.copy(Bv); head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan); lineG.add(head); }
    },
    async move(id, path, ms = 110) { const o = units.get(id); if (!o) return; const tok = o.mvTok = (o.mvTok || 0) + 1; o.walking = true; if (o.real && !o.mixer && ms > 20) ms = Math.max(ms, 170); if (o.mixer && ms > 20) { play(o, 'walk', { speed: 1.5 }); ms = Math.max(ms, 230); } for (const [x, y] of path) { if (o.mvTok !== tok) return; const fx = o.g.position.x, fz = o.g.position.z, tx = wx(y), tz = wz(x); const t0 = performance.now(); o.body.rotation.y = Math.atan2(tx - fx, tz - fz); await new Promise(res => { const step = () => { if (o.mvTok !== tok) return res(); const t = Math.min(1, (performance.now() - t0) / ms); o.g.position.x = fx + (tx - fx) * t; o.g.position.z = fz + (tz - fz) * t; o.g.position.y = o.mixer ? 0 : Math.sin(t * Math.PI) * .12; t < 1 ? requestAnimationFrame(step) : res(); }; step(); }); o.tx = tx; o.tz = tz; } if (o.mvTok !== tok) return; o.walking = false; if (o.mixer) play(o, 'idle'); },
    lunge(id, tid, crit) { const o = units.get(id), t = units.get(tid); if (!o || !t) return 0; o.body.rotation.y = Math.atan2(t.g.position.x - o.g.position.x, t.g.position.z - o.g.position.z);
      if (o.mixer) { const C0 = CLASS_CLIP[o.wclass]; const cc = C0 && (crit && C0.c || C0.a); const ms = cc && play(o, 'c:' + cc[0], { once: true, speed: cc[3], from: cc[1], to: cc[2] }); if (ms && C0.aim && o.weap) o.aim = { t: performance.now(), ms: (cc[2] - cc[1]) / cc[3] * 1000 }; if (ms) return cc[4]; play(o, crit && o.acts.heavy ? 'heavy' : 'attack', { once: true, speed: 1.35 }); return RIG[o.body.userData.rig][2]; }
      o.lunge = { dx: (t.g.position.x - o.g.position.x), dz: (t.g.position.z - o.g.position.z), t: performance.now() }; return 110; },
    act(id, name) { const o = units.get(id); return o && o.mixer ? play(o, name, { once: true, speed: 1.2 }) : 0; },
    hit(id, crit) { const o = units.get(id); if (!o) return; if (o.mixer && !o.downed) play(o, 'hit', { once: true, speed: 1.3 }); else o.kick = performance.now(); o.crit = crit; spark(o.g.position, crit ? 0xffd05a : 0xffffff, crit ? 16 : 9); },
    burst(x, y, c = 0x3fe0ff) { spark(new THREE.Vector3(wx(y), .3, wz(x)), c, 26); },
    ray(x0, y0, x1, y1, c = 0xff2a1a) { // two thin beams from eye height to the target, gone in a quarter second
      const a = new THREE.Vector3(wx(y0), 1.62, wz(x0)), b = new THREE.Vector3(wx(y1), .7, wz(x1)), d = b.clone().sub(a), len = d.length(); if (len < .01) return;
      const side = new THREE.Vector3(d.z, 0, -d.x).normalize().multiplyScalar(.05); const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false });
      for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, len, 6), m); g.position.copy(a).addScaledVector(d, .5).addScaledVector(side, s); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); here.add(g); setTimeout(() => { here.remove(g); g.geometry.dispose(); }, 260); }
      spark(b, c, 18); },
    gone(id) { const o = units.get(id); if (!o) return; if (o.mixer) { play(o, 'die', { once: true, hold: true }); o.dying = performance.now() + 1500; } else o.dying = performance.now(); },
    add(u) { unitObj(u); },
    screen(x, y, h = 1) { const v = new THREE.Vector3(wx(y), h, wz(x)).project(cam); return { left: (v.x * .5 + .5) * 100, top: (-v.y * .5 + .5) * 100 }; },
    dispose() { dead = true; ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); labels.remove(); },
  };
  // hit sparks
  const sparks = [];
  function spark(pos, color, n) { const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3), v = []; for (let i = 0; i < n; i++) { p[i * 3] = pos.x; p[i * 3 + 1] = .6; p[i * 3 + 2] = pos.z; v.push([(Math.random() - .5) * 3, 1 + Math.random() * 3, (Math.random() - .5) * 3]); } g.setAttribute('position', new THREE.BufferAttribute(p, 3)); const m = new THREE.Points(g, new THREE.PointsMaterial({ color, size: .13, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(m); sparks.push({ m, v, t: performance.now() }); }

  // input
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  function tileAt(e) { const b = renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), cam); if (!ray.ray.intersectPlane(plane, hitP)) return null; const y = Math.round(hitP.x / S + (GH - 1) / 2), x = Math.round((GW - 1) / 2 - hitP.z / S); return x >= 0 && y >= 0 && x < GW && y < GH ? [x, y] : null; }
  let down = null; renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  function decorAt(e) { const b = renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), cam); const h = ray.intersectObjects(decor.children, true)[0]; if (!h) return null; let o = h.object; while (o.parent && o.parent !== decor) o = o.parent; return o; }
  renderer.domElement.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 12) return; const t = tileAt(e); if (t) return onTile(t[0], t[1]); const d = decorAt(e); if (d) { d.userData.poke = performance.now(); if (d.userData.light) d.userData.light.intensity = d.userData.light.intensity ? 0 : 16; else spark(d.position, pal.glow[d.userData.i % 3], 14); onDecor && onDecor(d.userData.decor, !!(d.userData.light && d.userData.light.intensity)); } else onMiss && onMiss(); });
  const hover = new THREE.Mesh(new THREE.RingGeometry(.5 * S / 1.25, .56 * S / 1.25, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false })); hover.rotation.set(-Math.PI / 2, 0, Math.PI / 4); hover.position.y = .025; hover.visible = false; here.add(hover);
  renderer.domElement.addEventListener('pointermove', e => { const bb = renderer.domElement.getBoundingClientRect(); ptr.x = (e.clientX - bb.left) / bb.width - .5; ptr.y = (e.clientY - bb.top) / bb.height - .5; const t = tileAt(e); hover.visible = !!t; if (t) hover.position.set(wx(t[1]), .025, wz(t[0])); });
  renderer.domElement.addEventListener('pointerleave', () => { hover.visible = false; });
  // scroll to zoom toward whatever is under the pointer; scroll back out to see the whole hall
  let zoom = .5, zoomNow = .5; const focus = new THREE.Vector3(), focNow = new THREE.Vector3(), ORIGIN = new THREE.Vector3();
  renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); const was = zoom; zoom = Math.min(1, Math.max(.22, zoom * (e.deltaY > 0 ? 1.12 : .89))); if (zoom < was && was > .95) { const b = renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), cam); if (ray.ray.intersectPlane(plane, hitP)) focus.set(clampX(hitP.x), 0, clampZ(hitP.z)); } }, { passive: false });
  const clampX = v => Math.max(-GH * S / 2, Math.min(GH * S / 2, v)), clampZ = v => Math.max(-GW * S / 2 - 1, Math.min(GW * S / 2 + 1, v)); let dragging = false;
  renderer.domElement.addEventListener('pointermove', e => { if (!down || !(e.buttons & 1)) return; const dx = e.clientX - down[0], dy = e.clientY - down[1]; if (!dragging && Math.hypot(dx, dy) < 12) return; if (!dragging) { dragging = true; down[2] = e.clientX; down[3] = e.clientY; } const k = .03 * (zoomNow + .25); focus.z = clampZ(focus.z + (e.clientX - down[2]) * k); focus.x = clampX(focus.x + (e.clientY - down[3]) * k * 1.6); down[2] = e.clientX; down[3] = e.clientY; renderer.domElement.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', () => { dragging = false; });
  let hovKey = ''; renderer.domElement.addEventListener('pointermove', e => { const t = tileAt(e); const d = t ? null : decorAt(e); renderer.domElement.style.cursor = t || d ? 'pointer' : 'default'; const k = t ? t.join(',') : d ? 'd' + d.userData.i : ''; if (k !== hovKey) { hovKey = k; onHover && onHover(t, d ? d.userData.decor : null); } });
  renderer.domElement.addEventListener('pointerleave', () => { if (hovKey) { hovKey = ''; onHover && onHover(null, null); } });

  // Frame the whole board between the top bar and the bottom controls, whatever the window shape.
  const base = new THREE.Vector3(), pv = new THREE.Vector3(), ptr = { x: 0, y: 0 }, look = new THREE.Vector3(0, .3, 0);
  let vw = 0, vh = 0, hudPx = 150, voNow = 0; // when zoomed in, the picture is lifted by half the HUD's height so the Seeker in focus is not under the action bar
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); composer.setSize(w, h); cam.aspect = w / h; const tall = cam.aspect < 1.05; cam.clearViewOffset(); vw = w; vh = h; hudPx = tall ? 330 : 150; voNow = 0;
    cam.fov = tall ? 44 : vista ? 46 : 30; cam.updateProjectionMatrix(); const far = vista && !tall; look.set(far ? -3 : 0, far ? 1.6 : .3, 0); const dir = (tall ? pv.set(0, 1.5, 1) : pv.set(1, vista ? .36 : .8, .1)).normalize().clone(); const hw = GH * S / 2 + .3, hd = GW * S / 2 + .3;
    const top = far ? .22 : 1 - 2 * (tall ? 110 : 64) / h, bot = -1 + 2 * (tall ? 330 : 150) / h; // phones look down the hall; wide screens look across it, so both sides are seen in profile
    const pts = tall ? [[-hw, 0, hd], [hw, 0, hd], [-hw, 1.7, -hd], [hw, 1.7, -hd], [-hw, 0, -hd], [hw, 0, -hd]] : [[hw, 0, hd], [hw, 0, -hd], [-hw, 2.2, hd], [-hw, 3.4, -hd], [-hw, 0, hd], [-hw, 0, -hd]];
    for (let d = 7; d < 46; d += .35) { cam.position.copy(dir).multiplyScalar(d).add(pv.set(look.x, 0, 0)); cam.lookAt(look); cam.updateMatrixWorld(); let ok = true; for (const p of pts) { pv.set(p[0], p[1], p[2]).project(cam); if (pv.z > 1 || pv.z < -1 || Math.abs(pv.x) > .93 || pv.y > top || pv.y < bot) { ok = false; break; } } if (ok) break; }
    // slide the view so the board sits in the open band, not dead centre behind the controls
    base.copy(cam.position); cam.userData.shift = (top + bot) / 2;
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let dead = false, last = performance.now(); const v3 = new THREE.Vector3();
  let fN = 0, fAcc = 0, slow = 0;
  (function frame() {
    if (dead) return; requestAnimationFrame(frame); const now = performance.now(), t = now / 1000; const dt = Math.min(.1, (now - last) / 1000); last = now;
    fN++; renderer.shadowMap.needsUpdate = fN % 2 === 0; fAcc += dt; if (fN % 90 === 0) { const avg = fAcc / 90; fAcc = 0; slow = avg > .026 && fN > 400 && !document.hidden ? slow + 1 : 0; if (slow >= 2 && dpr > 1) { slow = 0; dpr = Math.max(1, dpr - .25); renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); } } // two slow stretches in a row, after loading, before giving up sharpness
    for (const [id, o] of units) {
      const b = o.body; if (o.mixer) o.mixer.update(dt); if (o.aim) level(o, now); if (!o.mixer) b.position.y = b.userData.hover ? (b.userData.hoverY || .12) + Math.sin(t * 2.4 + o.phase) * .09 : Math.abs(Math.sin(t * 1.7 + o.phase)) * .025; if (!b.userData.hover && !o.mixer) b.scale.y = b.scale.x * (1 + Math.sin(t * 2 + o.phase) * .02);
      if (b.userData.spin) b.userData.spin.forEach((r, i) => { r.rotation.x += .01 * (i + 1); r.rotation.y += .007 * (i + 1); });
      b.position.x = b.position.z = 0;
      if (o.real && !o.mixer && !o.kick) { const w = o.walking ? 1 : 0; b.rotation.z = Math.sin(t * (w ? 13 : 1.3) + o.phase) * (w ? .09 : .025); b.rotation.x = Math.sin(t * (w ? 6.5 : .9) + o.phase * 2) * (w ? .05 : .02); if (w && !b.userData.hover) b.position.y += Math.abs(Math.sin(t * 13 + o.phase)) * .07; }
      if (o.endAt && now > o.endAt) { o.endAt = 0; if (o.mixer && !o.downed) play(o, 'idle'); }
      if (o.lunge) { const k = (now - o.lunge.t) / 220; if (k >= 1) o.lunge = null; else { const a = Math.sin(k * Math.PI) * .35; const L = Math.hypot(o.lunge.dx, o.lunge.dz) || 1; o.g.position.x = o.tx + o.lunge.dx / L * a; o.g.position.z = o.tz + o.lunge.dz / L * a; } }
      if (o.kick) { const k = (now - o.kick) / 260; if (k >= 1) { o.kick = 0; b.rotation.z = 0; } else { b.rotation.z = Math.sin(k * Math.PI * 3) * .22 * (1 - k); b.position.y += Math.sin(k * Math.PI) * .1; } }
      if (o.dying && now > o.dying) { const k = Math.min(1, (now - o.dying) / 420); o.g.scale.setScalar(1 - k * .9); o.g.position.y = -k * .3; o.g.rotation.y += .2; if (k >= 1) { o.g.visible = false; o.lab.hidden = true; o.dying = 0; o.g.scale.setScalar(1); o.g.rotation.y = 0; } }
      else if (!o.lunge && o.g.position.y < 0) o.g.position.y = 0;
      o.rg.rotation.z = t * .6;
      if (!o.lab.hidden) { v3.set(o.g.position.x, o.h, o.g.position.z).project(cam); o.lab.style.left = (v3.x * .5 + .5) * 100 + '%'; o.lab.style.top = (-v3.y * .5 + .5) * 100 + '%'; }
    }
    for (const o of props.values()) { if (o.userData.hover) o.position.y = Math.sin(t * 1.5) * .06; if (o.userData.use) o.scale.setScalar(1 + Math.sin(t * 5) * .05); }
    const pa = flies.geometry.attributes.position; for (let i = 0; i < fn; i++) { pa.array[i * 3 + 1] += Math.sin(t * .8 + fs[i]) * .003; pa.array[i * 3] += Math.cos(t * .5 + fs[i]) * .002; } pa.needsUpdate = true;
    for (const k in mk) if (k.endsWith('mv')) mk[k].scale.setScalar(1 + Math.sin(t * 4) * .12);
    gate.material.emissiveIntensity = .8 + Math.sin(t * 1.3) * .25;
    for (const d of drift) { if (d.userData.fall) { d.material.map.offset.y = (t * d.userData.sp) % 1; continue; } if (d.userData.beam) { d.material.opacity = .3 + Math.sin(t * 1.3 + d.userData.ph) * .08; continue; } if (d.userData.ray) d.material.opacity = .04 + Math.sin(t * .4 + d.userData.ph) * .02; else { d.position.y = d.userData.y + Math.sin(t * .25 + d.userData.ph) * .9; d.rotation.y = t * .01; } } lineM.opacity = .6 + Math.sin(t * 4) * .25;
    for (const m of beaconG.children) { m.position.y = m.userData.y + Math.sin(t * 2.2 + m.position.x) * .08; m.rotation.y = t * 1.6; }
    for (const k in mk) if (k.endsWith('reach')) mk[k].material.opacity = .17 + Math.sin(t * 2.4) * .05;
    for (const d of decor.children) { const p = d.userData.poke; if (p) { const k = (now - p) / 420; if (k >= 1) { d.userData.poke = 0; d.rotation.z = 0; } else d.rotation.z = Math.sin(k * Math.PI * 3) * .05 * (1 - k); } if (d.userData.light && d.userData.light.intensity) d.userData.light.intensity = 15 + Math.sin(t * 9 + d.userData.i) * 1.2; }
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; const k = (now - s.t) / 480; if (k >= 1) { scene.remove(s.m); s.m.geometry.dispose(); sparks.splice(i, 1); continue; } const p = s.m.geometry.attributes.position; for (let j = 0; j < s.v.length; j++) { p.array[j * 3] += s.v[j][0] * .016; p.array[j * 3 + 1] += (s.v[j][1] - k * 6) * .016; p.array[j * 3 + 2] += s.v[j][2] * .016; } p.needsUpdate = true; s.m.material.opacity = 1 - k; }
    for (const [, o] of units) if (o.flames) for (let i = 0; i < o.flames.length; i++) { const f = o.flames[i]; f.visible = !!o.lit; if (o.lit) f.scale.set(1 + Math.sin(t * 23 + i) * .12, 1 + Math.sin(t * 17 + i * 2) * .1, 1 + Math.cos(t * 19 + i) * .12); }
    zoomNow += (zoom - zoomNow) * .14; focNow.lerp(zoom < .98 ? focus : ORIGIN, .12);
    { const vo = Math.round(hudPx * .5 * Math.min(1, (1 - zoomNow) * 2)); if (vw && vo !== voNow) { voNow = vo; if (vo) cam.setViewOffset(vw, vh, 0, vo, vw, vh); else cam.clearViewOffset(); } }
    cam.position.set(focNow.x + base.x * zoomNow + Math.sin(t * .17) * .22 * zoomNow + ptr.x * .7 * zoomNow, base.y * zoomNow + Math.sin(t * .23) * .1 - ptr.y * .3 * zoomNow + .3 * (1 - zoomNow), focNow.z + base.z * zoomNow + Math.cos(t * .13) * .12); cam.lookAt(focNow.x + look.x * zoomNow, look.y * zoomNow + .3 * (1 - zoomNow) + (1 - zoomNow) * .5, focNow.z);
    if (flight) { const k0 = Math.min(1, (now - flight.t0) / flight.ms); const k = k0 < .5 ? 4 * k0 * k0 * k0 : 1 - Math.pow(-2 * k0 + 2, 3) / 2; const liftY = -Math.sin(k0 * Math.PI) * 22;
      farG.position.copy(flight.from).addScaledVector(flight.delta, k); farG.position.y += liftY; here.position.copy(flight.delta).multiplyScalar(k); here.position.y += liftY; if (k0 >= 1) flight.done(); }
    const shownTags = [];
    for (const k in marksFar) { const L = marksFar[k], tag = L.userData.tag; if (!tag.parentNode) continue; const show = L.visible && !flight && tag.textContent; if (show) { v3.set(L.position.x + farG.position.x, L.position.y + farG.position.y + 5, L.position.z + farG.position.z).project(cam); const ok = v3.z < 1 && Math.abs(v3.x) < .95 && v3.y < .97 && v3.y > -.2; tag.hidden = !ok; if (ok) shownTags.push([tag, (v3.x * .5 + .5) * el.clientWidth, (-v3.y * .5 + .5) * el.clientHeight, v3.z]); } else tag.hidden = true; }
    shownTags.sort((a, b) => a[3] - b[3]); for (let i = 0; i < shownTags.length; i++) { const t = shownTags[i]; for (let g = 0; g < 6; g++) { const hit = shownTags.slice(0, i).find(o => Math.abs(o[1] - t[1]) < 170 && Math.abs(o[2] - t[2]) < 30); if (!hit) break; t[2] = hit[2] - 32; } t[0].style.left = t[1] + 'px'; t[0].style.top = t[2] + 'px'; } // nearer places keep their spot; ones behind step up out of the way
    composer.render();
  })();
  if (location.hostname === 'localhost') api.dbg = { units, cam, renderer, scene }; // local testing only
  return api;
}
