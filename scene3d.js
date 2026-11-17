// The Cabinet in three dimensions: terrain, light, creatures and Seekers, all built in code.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Real models, loaded once and shared. Until one arrives its unit shows the placeholder shape.
const GLB = { vanguard: ['hobb', 1.5], tracker: ['sile', 1.42], naturalist: ['oyelaran', 1.6], thornling: ['thornling', 1.05], mossback: ['mossback', 1.7], orchardmother: ['orchardmother', 3.6] };
const glbCache = {}, glbWait = {}; const gl = new GLTFLoader();
function loadGLB(kind) {
  if (!GLB[kind]) return null; if (glbCache[kind]) return Promise.resolve(glbCache[kind]);
  return glbWait[kind] ||= gl.loadAsync(new URL(`assets/models/${GLB[kind][0]}.glb`, import.meta.url).href).then(g => { g.scene.traverse(m => { if (m.isMesh) { m.castShadow = true; const M = m.material; M.roughness = Math.max(.6, M.roughness); M.metalness = Math.min(.25, M.metalness); if (M.map) { M.emissiveMap = M.map; M.emissive = new THREE.Color(0xffffff); M.emissiveIntensity = .55; } } }); return glbCache[kind] = g.scene; }).catch(() => null);
}
for (const k in GLB) loadGLB(k);
const S = 1.25, GW = 8, GH = 6;
const wx = y => (y - (GH - 1) / 2) * S, wz = x => ((GW - 1) / 2 - x) * S;
const PAL = {
  verdant: { fog: 0x140c30, sky: 0x0e0822, ground: ['#33661f', '#4a8a24', '#6aa524', '#3d2a66', '#55309a'], key: 0xfff0c8, fill: 0x8fa0d8, rim: 0xff4fd8, leaf: [0x2f7d32, 0x1f5a3a, 0x5a2d91, 0x8a3ffc], glow: [0xff5fd2, 0xffe14a, 0xb46bff], trunk: 0x2a1b3a, stone: 0x8d8aa0 },
  clockwork: { fog: 0x0e2230, sky: 0x08151e, ground: ['#3a3326', '#5a4a2a', '#7a6230', '#1f4a55', '#2a6f7a'], key: 0xffd9a0, fill: 0x2fd0ff, rim: 0xffa040, leaf: [0x8a6a2a, 0xb08a3a, 0x2a6f7a, 0x3fb0c0], glow: [0x3fe0ff, 0xffb040, 0xfff0a0], trunk: 0x3a2f24, stone: 0x6f7a80 },
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

export function createScene(el, { onTile, region = 'verdant', seed = 1 }) {
  const pal = PAL[region] || PAL.verdant;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  el.prepend(renderer.domElement); renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(pal.sky); scene.fog = new THREE.FogExp2(pal.fog, .03);
  const cam = new THREE.PerspectiveCamera(34, 1, .1, 80);
  scene.add(new THREE.HemisphereLight(pal.fill, 0x1a2a14, 1.15)); const lift = new THREE.PointLight(0xfff0d8, 30, 16); lift.position.set(4, 5, 4.5); scene.add(lift);
  const key = new THREE.DirectionalLight(pal.key, 3.1); key.position.set(6, 11, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); key.shadow.bias = -.0006; scene.add(key);
  const rim = new THREE.DirectionalLight(pal.rim, .9); rim.position.set(-7, 4, -6); scene.add(rim);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam)); const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .38, .55, .9); composer.addPass(bloom); composer.addPass(new OutputPass());

  // ground: painted in a canvas, then lit
  const r0 = rng(seed + 11); const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const cx = cv.getContext('2d');
  cx.fillStyle = pal.ground[0]; cx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { const c = pal.ground[1 + Math.floor(r0() * 2)]; cx.fillStyle = c; cx.globalAlpha = .1 + r0() * .25; cx.beginPath(); cx.ellipse(r0() * 1024, r0() * 1024, 12 + r0() * 60, 8 + r0() * 40, r0() * 3, 0, 7); cx.fill(); }
  for (let i = 0; i < 16; i++) { cx.fillStyle = pal.ground[3 + Math.floor(r0() * 2)]; cx.globalAlpha = .12 + r0() * .2; const x = 300 + r0() * 424, y = 250 + r0() * 524; for (let j = 0; j < 7; j++) { cx.beginPath(); cx.ellipse(x + (r0() - .5) * 90, y + (r0() - .5) * 90, 10 + r0() * 34, 8 + r0() * 26, r0() * 3, 0, 7); cx.fill(); } }
  cx.globalAlpha = 1; const gt = new THREE.CanvasTexture(cv); gt.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(26, 48), new THREE.MeshStandardMaterial({ map: gt, roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // faint tile seams so the board reads without looking like a spreadsheet
  const seam = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .07 })); { const v = []; for (let x = 0; x <= GW; x++) v.push(wx(-.5), .012, wz(x - .5), wx(GH - .5), .012, wz(x - .5)); for (let y = 0; y <= GH; y++) v.push(wx(y - .5), .012, wz(-.5), wx(y - .5), .012, wz(GW - .5)); seam.geometry.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); } scene.add(seam);
  // surroundings
  const env = new THREE.Group(); scene.add(env);
  const tree = (x, z, h) => { const g = G(P(cyl(.16 * h, .3 * h, 2.6 * h, 6), mat(pal.trunk, { emissive: 0x1a0f2a, emissiveIntensity: .6 }), 0, 1.3 * h, 0)); for (let i = 0; i < 4; i++) g.add(P(sph(.9 * h * (1 - i * .12), 0), mat(pal.leaf[Math.floor(r0() * pal.leaf.length)]), (r0() - .5) * h, 2.5 * h + i * .45 * h, (r0() - .5) * h, { s: [1, .7, 1] })); g.position.set(x, 0, z); return g; };
  const pillar = (x, z, h) => { const g = G(P(cyl(.3, .36, h, 8), mat(pal.stone), 0, h / 2, 0), P(box(.9, .2, .9), mat(pal.stone), 0, h + .1, 0), region === 'clockwork' ? P(tor(.7, .08, 16), mat(0xc9a24a, { metalness: .8, roughness: .3 }), 0, h * .7, 0, { r: [Math.PI / 2, 0, 0] }) : P(sph(.22, 0), glow(pal.glow[2], 1.5), 0, h + .45, 0)); g.position.set(x, 0, z); return g; };
  for (let i = 0; i < 46; i++) { const a = r0() * Math.PI * 2, d = 7.6 + r0() * 9; const x = Math.cos(a) * d * .95, z = Math.sin(a) * d - 1; if ((z > 5.5 && Math.abs(x) < 6) || (x > 4.6 && Math.abs(z) < 10)) continue; env.add(r0() < .82 ? tree(x, z, .8 + r0() * 1.1) : pillar(x, z, 1.6 + r0() * 2)); }
  env.add(pillar(-2.6, -7.4, 3.4), pillar(2.6, -7.4, 3.4), P(box(6.2, .5, .8), mat(pal.stone), 0, 3.9, -7.4));
  const gate = P(new THREE.PlaneGeometry(4.2, 3.4), glow(pal.glow[2], .9), 0, 1.8, -7.6); env.add(gate);
  for (let i = 0; i < 70; i++) { const a = r0() * Math.PI * 2, d = 1 + r0() * 11; const f = P(sph(.03 + r0() * .035, 0), glow(pal.glow[Math.floor(r0() * 3)], 1.1 + r0() * .8), Math.cos(a) * d, .06 + r0() * .1, Math.sin(a) * d - .5); f.castShadow = false; env.add(f); }
  for (let i = 0; i < 70; i++) { const a = r0() * Math.PI * 2, d = 4 + r0() * 9; const b = P(cone(.16 + r0() * .2, .3 + r0() * .5, 5), mat(pal.leaf[Math.floor(r0() * pal.leaf.length)]), Math.cos(a) * d, .2, Math.sin(a) * d - .5); if (Math.abs(b.position.x) < 4.2 && Math.abs(b.position.z) < 5.4) continue; env.add(b); }
  const pl1 = new THREE.PointLight(pal.glow[2], 14, 12); pl1.position.set(0, 2.2, -6.6); scene.add(pl1); const pl2 = new THREE.PointLight(pal.glow[0], 9, 10); pl2.position.set(-5, 1.4, 2); scene.add(pl2);
  const fn = 46, fp = new Float32Array(fn * 3), fs = []; for (let i = 0; i < fn; i++) { fp[i * 3] = (r0() - .5) * 16; fp[i * 3 + 1] = .3 + r0() * 3; fp[i * 3 + 2] = (r0() - .5) * 16 - 1; fs.push(r0() * 6); }
  const flies = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(fp, 3)), new THREE.PointsMaterial({ color: pal.glow[1], size: .06, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(flies);

  // tile markers
  const marks = new THREE.Group(); scene.add(marks); const mk = {};
  const mm = { mv: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false }), ab: new THREE.MeshBasicMaterial({ color: 0xffd05a, transparent: true, opacity: .34, depthWrite: false }), danger: new THREE.MeshBasicMaterial({ color: 0xff4a3a, transparent: true, opacity: .4, depthWrite: false }) };
  const mg = { mv: new THREE.CircleGeometry(.13, 16), ab: new THREE.PlaneGeometry(S * .92, S * .92), danger: new THREE.PlaneGeometry(S * .96, S * .96) };
  const lineG = new THREE.Group(); scene.add(lineG); const lm = new THREE.LineDashedMaterial({ color: 0xff6a5a, dashSize: .16, gapSize: .12, transparent: true, opacity: .9 });
  const ringGeo = new THREE.RingGeometry(.4, .47, 28); const ringM = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .95, side: THREE.DoubleSide, depthWrite: false });
  const RM = { sel: ringM(0xffffff), hostile: ringM(0xff5a4a), tg: ringM(0xffd05a), calm: ringM(0x7fe0c0), spent: ringM(0x8090a8) };

  const units = new Map(), props = new Map(); let rocks = new THREE.Group(); scene.add(rocks); const labels = document.createElement('div'); labels.className = 'labels'; el.append(labels);
  function unitObj(u) {
    let o = units.get(u.id); if (o) return o;
    const g = new THREE.Group(); let sc = 1;
    const dress = (body, real) => {
      body.rotation.y = u.side === 'c' ? (real ? .5 : 0) : real ? Math.PI - .5 : Math.PI; // seekers face up the hall, turned enough to show a profile
      sc = (real ? GLB[u.kind][1] : ({ orchardmother: 1.9, regulator: 1.7, warden: 1.15, mossback: 1.1 }[u.kind] || 1) * 1.3); if (u.variant === 'overgrown') sc *= 1.35; body.scale.setScalar(sc);
      if (u.variant) body.traverse(m => { if (m.isMesh) m.material = m.material.clone(); });
      if (u.variant === 'gilded') body.traverse(m => { if (m.isMesh) { m.material.map = null; m.material.emissiveMap = null; m.material.emissive.set(0x5a3a00); m.material.color.set(0xe0b040); m.material.metalness = .7; m.material.roughness = .3; m.material.needsUpdate = true; } });
      if (u.variant === 'pale') body.traverse(m => { if (m.isMesh) { m.material.color.lerp(new THREE.Color(0xffffff), .75); m.material.transparent = true; m.material.opacity = .7; } });
      g.add(body); return body;
    };
    const ready = glbCache[u.kind]; const body = dress(ready ? ready.clone(true) : MODELS[MODELS[u.kind] ? u.kind : 'thornling'](), !!ready);
    if (!ready && GLB[u.kind]) loadGLB(u.kind).then(m => { const cur = units.get(u.id); if (!m || !cur || cur !== o) return; const rot = cur.body.rotation.y; g.remove(cur.body); cur.body = dress(m.clone(true), true); cur.body.rotation.y = rot; cur.real = true; cur.h = sc + .3; });
    const rg = new THREE.Mesh(ringGeo, RM.calm); rg.rotation.x = -Math.PI / 2; rg.position.y = .03; rg.scale.setScalar(sc > 2 ? 1.9 : 1.15); g.add(rg);
    g.position.set(wx(u.y), 0, wz(u.x)); scene.add(g);
    const lab = document.createElement('div'); lab.className = 'ulab ' + u.side; labels.append(lab);
    o = { g, body, rg, lab, real: !!ready, h: ready ? sc + .3 : sc > 2 ? 3.1 : 1.2 * sc + (body.userData.hover ? .15 : 0), phase: Math.random() * 6, kick: 0, tx: g.position.x, tz: g.position.z }; units.set(u.id, o); return o;
  }
  const api = {
    setRoom(st) {
      for (const o of units.values()) { scene.remove(o.g); o.lab.remove(); } units.clear(); for (const o of props.values()) scene.remove(o); props.clear(); scene.remove(rocks); rocks = new THREE.Group(); scene.add(rocks);
      const r = rng(seed * 31 + st.roomIdx * 7 + 3); st.room.rock.forEach((v, i) => { if (v) { const k = MODELS.rock(r, pal); k.position.set(wx(Math.floor(i / GW)), 0, wz(i % GW)); rocks.add(k); } });
    },
    // list: [{id,x,y,kind,side,variant,ring,label,gone}]
    sync(list, propList, extras) {
      const seen = new Set();
      for (const u of list) { const o = unitObj(u); seen.add(u.id); o.g.visible = !u.gone; o.lab.hidden = !!u.gone; if (u.gone) continue; o.g.position.x = o.tx = wx(u.y); o.g.position.z = o.tz = wz(u.x); o.rg.material = RM[u.ring] || RM.calm; o.rg.visible = !!u.ring; if (o.lab.innerHTML !== u.label) o.lab.innerHTML = u.label; }
      for (const [id, o] of units) if (!seen.has(id)) { scene.remove(o.g); o.lab.remove(); units.delete(id); }
      const pseen = new Set();
      for (const p of propList) { pseen.add(p.key); let o = props.get(p.key); if (!o) { const f = MODELS[p.model] || MODELS.cache; o = f(rng(1), pal); o.position.set(wx(p.y), 0, wz(p.x)); if (p.scale) o.scale.setScalar(p.scale); scene.add(o); props.set(p.key, o); } o.userData.use = p.use; }
      for (const [k, o] of props) if (!pseen.has(k)) { scene.remove(o); props.delete(k); }
      void extras;
    },
    marks(map) {
      for (const k in mk) { marks.remove(mk[k]); delete mk[k]; }
      for (const [k, cls] of map) { const [x, y] = k.split(',').map(Number); const m = new THREE.Mesh(mg[cls], mm[cls]); m.rotation.x = -Math.PI / 2; m.position.set(wx(y), cls === 'mv' ? .03 : .02, wz(x)); m.renderOrder = 2; marks.add(m); mk[k + cls] = m; }
    },
    lines(list) {
      lineG.clear();
      for (const [a, b] of list) { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector3(wx(a.y) + (wx(b.y) - wx(a.y)) * t, .25 + Math.sin(t * Math.PI) * .7, wz(a.x) + (wz(b.x) - wz(a.x)) * t)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm); l.computeLineDistances(); lineG.add(l); }
    },
    async move(id, path, ms = 110) { const o = units.get(id); if (!o) return; for (const [x, y] of path) { const fx = o.g.position.x, fz = o.g.position.z, tx = wx(y), tz = wz(x); const t0 = performance.now(); o.body.rotation.y = Math.atan2(tx - fx, tz - fz); await new Promise(res => { const step = () => { const t = Math.min(1, (performance.now() - t0) / ms); o.g.position.x = fx + (tx - fx) * t; o.g.position.z = fz + (tz - fz) * t; o.g.position.y = Math.sin(t * Math.PI) * .12; t < 1 ? requestAnimationFrame(step) : res(); }; step(); }); o.tx = tx; o.tz = tz; } },
    lunge(id, tid) { const o = units.get(id), t = units.get(tid); if (!o || !t) return; o.body.rotation.y = Math.atan2(t.g.position.x - o.g.position.x, t.g.position.z - o.g.position.z); o.lunge = { dx: (t.g.position.x - o.g.position.x), dz: (t.g.position.z - o.g.position.z), t: performance.now() }; },
    hit(id, crit) { const o = units.get(id); if (!o) return; o.kick = performance.now(); o.crit = crit; spark(o.g.position, crit ? 0xffd05a : 0xffffff, crit ? 16 : 9); },
    burst(x, y, c = 0x3fe0ff) { spark(new THREE.Vector3(wx(y), .3, wz(x)), c, 26); },
    gone(id) { const o = units.get(id); if (!o) return; o.dying = performance.now(); },
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
  renderer.domElement.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 12) return; const t = tileAt(e); if (t) onTile(t[0], t[1]); });
  const hover = new THREE.Mesh(new THREE.RingGeometry(.5, .56, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5, depthWrite: false })); hover.rotation.set(-Math.PI / 2, 0, Math.PI / 4); hover.position.y = .025; hover.visible = false; scene.add(hover);
  renderer.domElement.addEventListener('pointermove', e => { const bb = renderer.domElement.getBoundingClientRect(); ptr.x = (e.clientX - bb.left) / bb.width - .5; ptr.y = (e.clientY - bb.top) / bb.height - .5; const t = tileAt(e); hover.visible = !!t; if (t) hover.position.set(wx(t[1]), .025, wz(t[0])); });
  renderer.domElement.addEventListener('pointerleave', () => { hover.visible = false; });

  // Frame the whole board between the top bar and the bottom controls, whatever the window shape.
  const base = new THREE.Vector3(), pv = new THREE.Vector3(), ptr = { x: 0, y: 0 };
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); composer.setSize(w, h); cam.aspect = w / h; const tall = cam.aspect < 1.05;
    cam.fov = tall ? 44 : 30; cam.updateProjectionMatrix(); const dir = (tall ? pv.set(0, 1.5, 1) : pv.set(1, .8, .12)).normalize().clone(); const hw = GH * S / 2 + .3, hd = GW * S / 2 + .3;
    const top = 1 - 2 * (tall ? 110 : 64) / h, bot = -1 + 2 * (tall ? 330 : 150) / h; // phones look down the hall; wide screens look across it, so both sides are seen in profile
    const pts = tall ? [[-hw, 0, hd], [hw, 0, hd], [-hw, 1.7, -hd], [hw, 1.7, -hd], [-hw, 0, -hd], [hw, 0, -hd]] : [[hw, 0, hd], [hw, 0, -hd], [-hw, 2.2, hd], [-hw, 3.4, -hd], [-hw, 0, hd], [-hw, 0, -hd]];
    for (let d = 7; d < 46; d += .35) { cam.position.copy(dir).multiplyScalar(d); cam.lookAt(0, .3, 0); cam.updateMatrixWorld(); let ok = true; for (const p of pts) { pv.set(p[0], p[1], p[2]).project(cam); if (pv.z > 1 || pv.z < -1 || Math.abs(pv.x) > .93 || pv.y > top || pv.y < bot) { ok = false; break; } } if (ok) break; }
    // slide the view so the board sits in the open band, not dead centre behind the controls
    base.copy(cam.position); cam.userData.shift = (top + bot) / 2;
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let dead = false; const v3 = new THREE.Vector3();
  (function frame() {
    if (dead) return; requestAnimationFrame(frame); const now = performance.now(), t = now / 1000;
    for (const [id, o] of units) {
      const b = o.body; b.position.y = b.userData.hover ? .12 + Math.sin(t * 2.4 + o.phase) * .09 : Math.abs(Math.sin(t * 1.7 + o.phase)) * .025; if (!b.userData.hover) b.scale.y = b.scale.x * (1 + Math.sin(t * 2 + o.phase) * .02);
      if (b.userData.spin) b.userData.spin.forEach((r, i) => { r.rotation.x += .01 * (i + 1); r.rotation.y += .007 * (i + 1); });
      b.position.x = b.position.z = 0;
      if (o.lunge) { const k = (now - o.lunge.t) / 220; if (k >= 1) o.lunge = null; else { const a = Math.sin(k * Math.PI) * .35; const L = Math.hypot(o.lunge.dx, o.lunge.dz) || 1; o.g.position.x = o.tx + o.lunge.dx / L * a; o.g.position.z = o.tz + o.lunge.dz / L * a; } }
      if (o.kick) { const k = (now - o.kick) / 260; if (k >= 1) { o.kick = 0; b.rotation.z = 0; } else { b.rotation.z = Math.sin(k * Math.PI * 3) * .22 * (1 - k); b.position.y += Math.sin(k * Math.PI) * .1; } }
      if (o.dying) { const k = Math.min(1, (now - o.dying) / 420); o.g.scale.setScalar(1 - k * .9); o.g.position.y = -k * .3; o.g.rotation.y += .2; if (k >= 1) { o.g.visible = false; o.lab.hidden = true; o.dying = 0; o.g.scale.setScalar(1); o.g.rotation.y = 0; } }
      else if (!o.lunge && o.g.position.y < 0) o.g.position.y = 0;
      o.rg.rotation.z = t * .6;
      if (!o.lab.hidden) { v3.set(o.g.position.x, o.h, o.g.position.z).project(cam); o.lab.style.left = (v3.x * .5 + .5) * 100 + '%'; o.lab.style.top = (-v3.y * .5 + .5) * 100 + '%'; }
    }
    for (const o of props.values()) { if (o.userData.hover) o.position.y = Math.sin(t * 1.5) * .06; if (o.userData.use) o.scale.setScalar(1 + Math.sin(t * 5) * .05); }
    const pa = flies.geometry.attributes.position; for (let i = 0; i < fn; i++) { pa.array[i * 3 + 1] += Math.sin(t * .8 + fs[i]) * .003; pa.array[i * 3] += Math.cos(t * .5 + fs[i]) * .002; } pa.needsUpdate = true;
    for (const k in mk) if (k.endsWith('mv')) mk[k].scale.setScalar(1 + Math.sin(t * 4) * .12);
    gate.material.emissiveIntensity = .8 + Math.sin(t * 1.3) * .25;
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; const k = (now - s.t) / 480; if (k >= 1) { scene.remove(s.m); s.m.geometry.dispose(); sparks.splice(i, 1); continue; } const p = s.m.geometry.attributes.position; for (let j = 0; j < s.v.length; j++) { p.array[j * 3] += s.v[j][0] * .016; p.array[j * 3 + 1] += (s.v[j][1] - k * 6) * .016; p.array[j * 3 + 2] += s.v[j][2] * .016; } p.needsUpdate = true; s.m.material.opacity = 1 - k; }
    cam.position.set(base.x + Math.sin(t * .17) * .22 + ptr.x * .7, base.y + Math.sin(t * .23) * .1 - ptr.y * .3, base.z + Math.cos(t * .13) * .12); cam.lookAt(0, .3, 0);
    composer.render();
  })();
  return api;
}
