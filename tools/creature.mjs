// Creature concepts and models for species that still use placeholder shapes. Usage: node tools/creature.mjs [id ...]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const STYLE = 'Stylized hand-painted low-poly game creature concept, classic 2000s fantasy MMO look, chunky readable silhouette, painted texture with soft gradients, saturated jewel tones with violet shadows and green rim light. A real animal of its world, not cute, not comical. Single full-body subject centered, three-quarter front view, plain flat mid-grey background, no text, no ground, nothing floating around it. Creature: ';
const C = {
  stalkbriar: [8000, 'a Stalkbriar, a lean ambush predator the size of a large wolf with the low stalking build of a big cat, its body woven from dark thorned briar stems and bark plates, a mane of moss and small violet leaves along the spine, a long whip tail of bramble, narrow amber eyes, jaws of hooked thorns, crouched low mid-stalk.'],
  dewhare: [6000, 'a Dewhare, a wary grazing animal the size of a large hare with long hind legs, soft grey-green mossy fur, two tall ears shaped like broad leaves, and a row of round translucent dew sacs glowing faint blue along its back. Alert, upright on its haunches, ears raised.'],
  lampmoth: [6000, 'a Lampmoth, a plump moth the size of a crow with a fat abdomen that glows warm amber like a paper lantern, four soft dusty wings in deep plum and gold with pale eye spots, a furred cream body, short feathered antennae, wings spread in flight.'],
  glasswing: [6000, 'a Glasswing, a large delicate moth the size of a hawk with four wings of clear rippled glass edged in teal, a slim furred violet body, long feathered antennae, wings spread.'],
  gulper: [8000, 'a Gulper Vine, a tall carnivorous pitcher plant that walks on four thick roots, a wide wet maw lined with soft teeth at the top of a swollen green and wine-red body, one lure tendril dangling over the mouth.'],
  carrion: [8000, 'a Carrion Bloom, a hunched four-legged scavenger with a long bone-white beak, a ruff of ragged dark petals like dead leaves around its neck, thin legs, a low prowling stance.'],
  hush: [8000, 'a Hush, a tall pale predator like a veil of spider silk over a thin frame, long trailing ribbons, a smooth oval face with no mouth and two dark eye hollows, two long thin clawed arms. Solid and opaque, eerie and silent.'],
  mite: [5000, 'a Brass Mite, a clockwork tick the size of a dinner plate, round riveted brass body, six needle legs, a wound mainspring on its back, a single red glass lens.'],
  pollinator: [6000, 'a Pollinator, a mechanical bee the size of a hawk, brass and cream enamel body, four glass wings on fine gears, a copper proboscis, small golden baskets on its legs.'],
  coilfawn: [7000, 'a Coilfawn, a slender fawn built of ivory plates and brass springs, coiled spring legs, glass eyes, small brass antler buds, alert stance.'],
  warden: [9000, 'a Warden, a broad boxy brass automaton sentinel twice the height of a person, riveted chest, a lantern for a head glowing amber, heavy piston arms ending in flat hammer fists, short thick legs.'],
  mantis: [8000, 'an Arc Mantis, a human-sized praying mantis of teal lacquered metal, folding blade forelimbs with copper edges, jewel compound eyes, a coil on its back crackling with a small arc.'],
  regulator: [14000, 'the Regulator, a massive clockwork engine-creature on a round geared base, a tall brass tower body with spinning governor arms ending in brass weights, vents of steam, a great dial face with no hands, two heavy clamp arms.'],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body, tries = 3) { for (let k = 0; k < tries; k++) { try {
  const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
  for (let i = 0; i < 240; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
  throw new Error('timed out');
} catch (e) { if (k === tries - 1) throw e; await sleep(4000); } } }
const want = process.argv.slice(2);
await Promise.all(Object.entries(C).filter(([k]) => want.length ? want.includes(k) : !existsSync(`models-src/${k}.glb`)).map(async ([name, [poly, p]]) => { try {
  const im = await run('text-to-image', { ai_model: 'nano-banana-2', prompt: STYLE + p, aspect_ratio: '1:1' }); writeFileSync(`concepts/${name}.png`, Buffer.from(await (await fetch(im.image_urls[0])).arrayBuffer()));
  const m = await run('image-to-3d', { input_task_id: im.id, model_type: 'smart-topology', ai_model: 'meshy-t2.5', target_polycount: poly, should_texture: true, texture_resolution: '2k' });
  writeFileSync(`models-src/${name}.glb`, Buffer.from(await (await fetch(m.model_urls.glb)).arrayBuffer())); console.log(name, 'ok');
} catch (e) { console.log(name, 'FAILED', e.message.slice(0, 160)); } }));
console.log('done');
