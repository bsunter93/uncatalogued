// A field sketch: the ink lines of a creature's plate, laid down a few strokes at a time. A look in a hall adds strokes. A finished record gets its colour wash.
// Usage: <canvas data-sketch="assets/cat/glasswing.jpg" data-p="0.66" data-wash="0" width="360" height="360">, then drawSketches(root).
const S = 400, PAPER = '#efe7d4', INK = [34, 27, 29];
const cache = new Map();
// Plates drawn in ink from the animal's own model (tools/plates). These have a line drawing and a wash of their own, so nothing is filtered out of a painting.
export const INKED = new Set('thornling mossback glasswing gulper carrion hush stalkbriar dewhare lampmoth orchardmother mite pollinator coilfawn warden mantis latchjaw tickwren lamplighter regulator lantern_moss snare_vine heartfruit mirror_reed copper_lily tick_fern chest'.split(' '));
const img = src => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function load(src) {
  if (cache.has(src)) return cache.get(src);
  const key = (/assets\/cat\/(\w+)\.jpg/.exec(src) || [])[1];
  if (INKED.has(key)) { const q = Promise.all([img(`assets/ink/${key}_l.webp`), img(`assets/ink/${key}.webp`)]).then(([l, w]) => { if (!l || !w) return null; const ink = document.createElement('canvas'); ink.width = ink.height = S; ink.getContext('2d').drawImage(l, 0, 0, S, S); return { ink, im: w, m: w.width, inked: 1 }; }); cache.set(src, q); return q; }
  const p = new Promise(res => { const im = new Image(); im.onload = () => {
    // The pencil-drawing trick: divide the plate by a blurred negative of itself. Flat areas go to white paper and every edge and fold stays as a dark line, the way a drawing leaves out everything but the form.
    const mk = f => { const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d', { willReadFrequently: true }); const m = Math.min(im.width, im.height); x.filter = f; x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, S, S); return x; };
    const xa = mk('grayscale(1) contrast(1.15)'), xb = mk('grayscale(1) contrast(1.15) invert(1) blur(5px)'); const A = xa.getImageData(0, 0, S, S).data, B = xb.getImageData(0, 0, S, S).data; const x = xa;
    const out = x.createImageData(S, S), o = out.data; const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) { const i = y * S + xx, g = A[i * 4] / 255, b = B[i * 4] / 255; const dodge = Math.min(1, g / Math.max(.02, 1 - b)); const r0 = Math.hypot(xx / S - .5, y / S - .53), near = ss(.6, .3, r0); /* the animal is in the middle of its plate: the jungle round it thins out toward the edge of the page */
      const line = ss(.1, .52, 1 - dodge) * near, hatch = ((xx + y) % 5 < 1 ? 1 : 0) * ss(.26, .1, g) * .45 * near; /* and a few slanted strokes in the darkest places */
      const a = Math.min(1, Math.max(line, hatch)); o[i * 4] = INK[0]; o[i * 4 + 1] = INK[1]; o[i * 4 + 2] = INK[2]; o[i * 4 + 3] = a * 255; }
    const m = Math.min(im.width, im.height);
    const ink = document.createElement('canvas'); ink.width = ink.height = S; ink.getContext('2d').putImageData(out, 0, 0); res({ ink, im, m });
  }; im.onerror = () => res(null); im.src = src; });
  cache.set(src, p); return p;
}
// The order the pencil works in: the middle of the animal first, the edges of the page last.
function strokes(src) { const r = rng(hash(src)), a = []; for (let i = 0; i < 170; i++) { const x = r() * S, y = r() * S, ang = -.62 + (r() - .5) * 1.1, len = 70 + r() * 110, w = 8 + r() * 9; a.push({ x, y, ang, len, w, d: Math.hypot(x - S / 2, y - S * .52) + r() * 46 }); } return a.sort((p, q) => p.d - q.d); }
export async function paint(cv, src, p, wash = 0) {
  const g = await load(src); const x = cv.getContext('2d'), W = cv.width, H = cv.height; x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = PAPER; x.fillRect(0, 0, W, H); if (!g) return;
  if (wash > 0 && g.inked) { x.globalAlpha = Math.min(1, wash * 1.8); x.drawImage(g.im, 0, 0, W, H); x.globalAlpha = 1; }
  else if (wash > 0) { x.globalAlpha = Math.min(1, wash) * .5; x.globalCompositeOperation = 'multiply'; x.drawImage(g.im, (g.im.width - g.m) / 2, (g.im.height - g.m) / 2, g.m, g.m, 0, 0, W, H); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  const t = document.createElement('canvas'); t.width = t.height = S; const tx = t.getContext('2d'); const st = strokes(src), n = Math.max(0, Math.min(st.length, p * st.length)); tx.lineCap = 'round'; tx.strokeStyle = '#000';
  for (let i = 0; i < n; i++) { const s = st[i], k = Math.min(1, n - i); tx.lineWidth = s.w; tx.beginPath(); tx.moveTo(s.x - Math.cos(s.ang) * s.len / 2, s.y - Math.sin(s.ang) * s.len / 2); tx.lineTo(s.x - Math.cos(s.ang) * s.len / 2 + Math.cos(s.ang) * s.len * k, s.y - Math.sin(s.ang) * s.len / 2 + Math.sin(s.ang) * s.len * k); tx.stroke(); }
  if (p >= .999) { tx.globalCompositeOperation = 'source-over'; tx.fillRect(0, 0, S, S); } /* a finished drawing has no gaps left in it */ tx.globalCompositeOperation = 'source-in'; tx.drawImage(g.ink, 0, 0); x.drawImage(t, 0, 0, W, H);
}
export function drawSketches(root = document) { for (const cv of root.querySelectorAll('canvas[data-sketch]')) { if (cv.dataset.done === cv.dataset.p + '|' + cv.dataset.wash) continue; cv.dataset.done = cv.dataset.p + '|' + cv.dataset.wash; paint(cv, cv.dataset.sketch, +cv.dataset.p || 0, +cv.dataset.wash || 0); } }
// Draw from one amount of sketch to another, stroke by stroke.
export function grow(cv, src, from, to, ms = 1100) { const t0 = performance.now(); let busy = false; const step = async () => { if (!cv.isConnected) return; const k = Math.min(1, (performance.now() - t0) / ms); if (!busy) { busy = true; await paint(cv, src, from + (to - from) * k, 0); busy = false; } if (k < 1) requestAnimationFrame(step); else if (cv.isConnected) paint(cv, src, to, 0); /* a slow plate must not leave the page short of where it should end */ }; step(); }
export const sketchTag = (key, p, wash = 0, px = 360) => `<canvas class="sketch" data-sketch="assets/cat/${key}.jpg" data-p="${p}" data-wash="${wash}" width="${px}" height="${px}" aria-hidden="true"></canvas>`;
