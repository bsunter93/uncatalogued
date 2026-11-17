// Scenery and props: prompt -> concept image -> 3D model. Usage: node tools/prop.mjs [name ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const STYLE = 'Stylized hand-painted low-poly game environment prop, classic 2000s fantasy MMO look, chunky readable shapes, painted texture with soft gradients, saturated jewel tones with violet shadows. One single object, centered, three-quarter view from slightly above, whole object in frame, plain flat mid-grey background, no ground plane, no text, no characters. Setting: an overgrown living gallery inside an ancient museum drifting in deep space, where a Victorian-style naturalist expedition has left brass instruments behind. ';
export const PROPS = {
  tree_a: [9000, 'A huge ancient gallery tree with a thick twisted violet-brown trunk, exposed roots gripping broken marble floor tiles, and a broad dense canopy of emerald and violet leaves with a few small glowing blue blossoms.'],
  tree_b: [9000, 'A tall slender pale-barked tree with a spiralling trunk, long drooping willow-like fronds of deep purple and teal, and clusters of softly glowing magenta fruit hanging on thin stems. A tarnished brass specimen tag is nailed to the trunk.'],
  boulder: [3500, 'A cluster of three rounded mossy boulders of lilac-grey stone, moss and tiny ferns on top, one small brass survey marker pin driven into the largest.'],
  gate: [9000, 'A monumental stone gallery doorway arch, weathered lilac-grey masonry with riveted brass corner braces and a brass plaque above, thick roots and flowering vines climbing both pillars, the opening itself empty.'],
  lamp: [4000, 'A tall slender brass gallery lamp post, slightly leaning, with a riveted base, a copper pipe up the shaft, a round glass lens housing at the top glowing warm gold, and a vine curling up it.'],
  case_broken: [6000, 'An old museum display case on a carved dark wood plinth, brass frame, one glass pane shattered, inside it the small curled skeleton of an unknown six-limbed creature on a velvet cushion, moss and small flowers growing out through the broken pane, a brass label plate on the front.'],
  column_fallen: [4500, 'A fallen broken marble column lying on its side in two pieces, lilac-grey stone with carved leaf capital, covered in moss, glowing blue flowers and a few pale mushrooms.'],
  mushrooms: [4500, 'A cluster of giant bioluminescent mushrooms of different heights, teal and violet caps with softly glowing cyan gills and spots, thick pale stems, small ferns at the base.'],
  plinth: [3500, 'An empty carved stone specimen plinth, waist high, with a tarnished brass label plate, a cracked glass dome lying tipped beside it, and a ring of small glowing blue flowers around the base.'],
  survey: [5000, 'An abandoned naturalist survey station: a brass theodolite telescope on a wooden tripod with leather straps, a small folding field desk beside it holding an open sketchbook, an ink bottle and a glowing blue specimen jar.'],
  crates: [4500, 'A small stack of three expedition supply crates of dark wood with riveted brass corners and leather straps, one open showing glass specimen jars packed in straw, a coiled rope and a brass lantern on top.'],
  cache: [4500, 'A sealed specimen case: a sturdy brass-bound travelling chest of dark wood about knee high, with a round glass porthole in the lid glowing soft teal from inside, a heavy lead seal on the latch and a leather carrying handle.'],
  lantern_moss: [3500, 'A low mound of thick bright green moss growing over a stone, studded with many small round bulbs that glow warm yellow like tiny lanterns.'],
  snare_vine: [3500, 'A low flat sprawling thorny vine lying across the ground in loose coils, dark green with purple barbed thorns and a few curled tendrils, a small red warning bud at its centre.'],
  heartfruit: [3500, 'A small knee-high plant with a curved stem and broad dark leaves, bearing one large heart-shaped crimson fruit that glows softly from within, with visible veins.'],
  mirror_reed: [3500, 'A clump of tall thin reeds whose blades are flat polished silver mirrors reflecting violet and teal, growing from a small patch of dark water-worn stone.'],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body, tries = 3) {
  for (let k = 0; k < tries; k++) { try {
    const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
    for (let i = 0; i < 220; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
    throw new Error('timed out');
  } catch (e) { if (k === tries - 1) throw e; await sleep(3000); } }
}
const want = process.argv.slice(2);
if (import.meta.url === `file://${process.argv[1]}`) await Promise.all(Object.entries(PROPS).filter(([k]) => !want.length || want.includes(k)).map(async ([name, [poly, p]]) => {
  try {
    const im = await run('text-to-image', { ai_model: 'nano-banana-2', prompt: STYLE + p, aspect_ratio: '1:1' });
    writeFileSync(`concepts/p_${name}.png`, Buffer.from(await (await fetch(im.image_urls[0])).arrayBuffer()));
    const m = await run('image-to-3d', { input_task_id: im.id, model_type: 'smart-topology', ai_model: 'meshy-t2.5', target_polycount: poly, should_texture: true, texture_resolution: '2k' });
    writeFileSync(`models-src/p_${name}.glb`, Buffer.from(await (await fetch(m.model_urls.glb)).arrayBuffer()));
    console.log(name, 'ok', im.consumed_credits + m.consumed_credits, 'credits');
  } catch (e) { console.log(name, 'FAILED', e.message.slice(0, 200)); }
}));
