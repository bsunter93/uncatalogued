// Builds art-preview.html, a static contact sheet of every plate.
import { plate, KEYS } from './art.js';
import { writeFileSync } from 'node:fs';
const cell = (k, o = {}, label = k) => `<figure><div class="big">${plate(k, o)}</div><div class="sm">${plate(k, o)}</div><figcaption>${label}</figcaption></figure>`;
let h = `<!doctype html><meta charset="utf8"><title>plates</title><style>body{background:#12325a;color:#9cc3e6;font:11px ui-monospace,monospace;margin:16px;display:flex;flex-wrap:wrap;gap:10px}
figure{margin:0;width:150px;position:relative}.big svg{width:150px;height:150px;display:block}.sm{position:absolute;right:0;top:0}.sm svg{width:40px;height:40px;display:block;background:#0e2848}h2{width:100%;margin:8px 0 0;font-size:12px}</style>`;
h += '<h2>all keys</h2>' + KEYS.filter(k => k !== 'item').map(k => cell(k)).join('');
h += '<h2>variants</h2>';
for (const k of ['thornling', 'mossback', 'mite', 'warden']) for (const v of ['pale', 'gilded', 'overgrown']) h += cell(k, { variant: v }, k + ' ' + v);
h += '<h2>item slot x family (seeds 0,1)</h2>';
for (const slot of ['weapon', 'body', 'head', 'accessory', 'implant', 'device']) for (const family of ['organic', 'relic', 'anomalous']) for (const seed of [0, 1]) h += cell('item', { slot, family, seed }, `${slot} ${family} ${seed}`);
h += '<h2>obstacle seeds</h2>' + [1, 2, 3, 4].map(s => cell('obstacle', { seed: s }, 'obstacle ' + s)).join('');
writeFileSync(new URL('./art-preview.html', import.meta.url), h);
let max = ['', 0];
for (const k of KEYS) { const s = plate(k, { slot: 'weapon', family: 'organic' }); if (!s.startsWith('<svg')) throw new Error(k); if (s.length > max[1]) max = [k, s.length]; }
console.log(KEYS.length, 'ok; largest', max.join(' '), '; unknown ->', plate('nope').length);
