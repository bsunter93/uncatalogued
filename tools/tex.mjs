// Painted ground, wall and ground-cover art. Usage: node tools/tex.mjs [name ...]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/text-to-image'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const T = 'Hand-painted stylized game texture in the style of a classic 2000s fantasy MMO, soft painterly brushwork, chunky readable shapes, gentle gradients, violet-tinted shadows. Seamless tileable surface texture seen exactly straight on, filling the whole square edge to edge, perfectly even flat lighting, no perspective, no horizon, no border, no vignette, no text, no objects standing up. ';
const SP = 'Hand-painted stylized game sprite in the style of a classic 2000s fantasy MMO, soft painterly brushwork, broad soft rounded shapes, no thin spikes. Exactly one small plant clump seen from the side at eye level, centered, whole clump in frame with empty margin all round, on a perfectly flat uniform pure magenta (#ff00ff) background, no ground, no shadow, no text. ';
export const TEX = {
  v_grass: T + 'Top-down view of a lush forest floor: short soft grass and deep green moss with clover, a few tiny violet and pale blue flowers and scattered small fallen leaves. Deep emerald greens, muted, medium-dark.',
  v_stone: T + 'Top-down view of an ancient gallery floor of large irregular lilac-grey marble flagstones, worn and cracked, with bright moss and tiny flowers growing in the joints.',
  v_dirt: T + 'Top-down view of a worn footpath of packed brown earth with small pebbles, a few flat stones and thin roots, edges of moss.',
  v_cliff: T + 'Front view of a rock cliff face of layered lilac-grey stone strata with cracks, patches of green moss, and a few thin hanging vines.',
  v_tuft: SP + 'A soft bushy clump of broad-bladed emerald grass with rounded leaf tips and three small violet bell flowers.',
  v_fern: SP + 'A low spreading fern with broad rounded teal-green fronds and two small glowing blue buds.',
  c_ground: T + 'Top-down view of a machine-garden floor: dark oiled bronze-brown earth with scattered copper shavings, tiny cogs, rivets and patches of verdigris green.',
  c_stone: T + 'Top-down view of a floor of large square riveted brass and copper plates, worn and scratched, verdigris in the seams, a few small inset glass lenses.',
  c_dirt: T + 'Top-down view of a walkway of dark iron grating plates over packed soot-black gravel with copper dust.',
  c_cliff: T + 'Front view of a wall of stacked brass and copper machinery strata: riveted plates, pipes, embedded gears, verdigris streaks.',
  c_tuft: SP + 'A soft bushy clump of curled copper-wire grass with rounded brass leaf tips and three tiny teal glass bulbs.',
  c_fern: SP + 'A low spreading fern made of overlapping rounded brass leaves on copper stems with one small teal lamp bud.',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(TEX);
await Promise.all(names.map(async n => { const out = `concepts/tex/${n}.png`; if (existsSync(out)) return console.log(n, 'exists');
  try { const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ ai_model: 'nano-banana-2', prompt: TEX[n], aspect_ratio: '1:1' }) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
    for (let i = 0; i < 90; i++) { await sleep(4000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') { writeFileSync(out, Buffer.from(await (await fetch(t.image_urls[0])).arrayBuffer())); return console.log(n, 'ok'); } if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(t.status); }
    throw new Error('timeout'); } catch (e) { console.log(n, 'FAILED', e.message); } }));
