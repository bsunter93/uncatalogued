// Painted Catalogue plates for creatures, flora, wonders and materials, plus the camp backdrop.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import * as D from '../data.js';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/text-to-image'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const STYLE = 'A square painted illustration in the tradition of the finest collectible fantasy card game art: traditional oil-paint brushwork, dramatic chiaroscuro lighting, rich atmosphere and depth. One subject, large in frame. Thin worn brass border with small rivets in the corners. No text, no letters, no numbers, no people. ';
const LOOK = {
  thornling: 'a lean knee-high predatory seed-pod creature, dark bark-armoured husk, four sharp root legs, a ridge of curved violet thorns, splinter teeth with a magenta glow, one torn leaf on its spine, crouched to spring',
  mossback: 'a cart-sized gentle tortoise with stone-grey skin, its shell a living garden of moss, ferns, pale mushrooms and glowing blue flowers',
  stalkbriar: 'a lean wolf-sized ambush predator woven from dark thorned briar and bark, moss mane, amber eyes, hooked thorn jaws, half hidden in undergrowth, mid-stalk',
  dewhare: 'a wary long-legged hare with grey-green mossy fur and tall leaf-shaped ears, a row of glowing blue dew sacs along its back, upright and listening in tall ferns',
  lampmoth: 'a plump crow-sized moth with a glowing amber lantern abdomen and dusty plum and gold wings, circling an old brass lamp in the dark',
  glasswing: 'a large delicate moth with wings of clear rippled glass edged in teal, long feathered antennae, caught mid-flight, light refracting through it',
  gulper: 'a tall carnivorous pitcher plant that walks on thick roots, a wide wet maw lined with soft teeth, green and wine-red, a lure tendril dangling',
  carrion: 'a hunched four-legged scavenger with a long bone-white beak, ragged dark feathers like dead leaves, picking at a husk',
  hush: 'a pale drifting creature like a veil of spider silk with a faint oval face, utterly silent, dust motes hanging still around it',
  orchardmother: 'a towering ancient tree-beast, hunched trunk of twisted purple-brown wood, a mane of violet and emerald leaves, long root-claw arms, glowing magenta fruit, two burning green eyes in a hollow face',
  latchjaw: 'a lean wolf-sized clockwork hound of dark iron and brass with a serrated spring-trap jaw and one cracked amber eye, stalking between metal ferns',
  tickwren: 'a small plump clockwork songbird of brass and copper feather plates with a winding key on its back, perched on a metal branch mid-song',
  lamplighter: 'a small stooped three-legged brass automaton shaped like an oil lamp, reaching up with a long thin arm to light an old lamp post in a dark machine garden',
  mite: 'a brass clockwork tick the size of a dinner plate, six needle legs, a wound mainspring on its back, a single red lens',
  pollinator: 'a mechanical bee the size of a hawk, brass and enamel body, glass wings on fine gears, a copper proboscis, golden pollen dust on its legs',
  coilfawn: 'a slender fawn built of ivory plates and brass springs, coiled spring legs, glass eyes, standing alert among metal ferns',
  warden: 'a broad boxy brass automaton sentinel with a riveted chest, a lantern for a head, heavy piston arms, standing guard in a workshop gallery',
  mantis: 'a human-sized praying mantis of teal lacquered metal and blades, jewel compound eyes, forelimbs like folding knives',
  regulator: 'a massive clockwork engine-creature on a round geared base, spinning governor arms with brass weights, vents of steam, a great dial face showing no hands',
};
const jobs = {};
for (const k in D.SPECIES) jobs[k] = `Subject, a creature in its habitat: ${LOOK[k] || D.SPECIES[k].name}. ${D.SPECIES[k].region === 'verdant' ? 'Setting: an overgrown living gallery, violet and green light.' : 'Setting: a brass clockwork garden, amber and teal light.'}`;
for (const k in D.FLORA) jobs[k] = `Subject, a single strange plant growing in a museum gallery: ${D.FLORA[k].name}. ${D.FLORA[k].blurb.split('.')[0]}.`;
for (const k in D.WONDERS) jobs[k] = D.WONDERS[k].place ? `Subject, a lonely strange place found off the path in a vast ${D.PLACES.verdant.includes(k) ? 'overgrown twilight landscape of giant trees and violet light' : 'brass and copper machine landscape under amber haze'}, seen from a little way off as a traveller first sees it: ${D.WONDERS[k].name.replace(/^The |^A /, '')}. ${D.WONDERS[k].blurb}` : `Subject, an impossible landmark inside an ancient museum gallery: ${D.WONDERS[k].name.replace(/^The |^A /, '')}. ${D.WONDERS[k].blurb}`;
for (const k in D.MATERIALS) jobs[k] = `Subject, a rare crafting material displayed in a naturalist's specimen jar or tray on a workbench: ${D.MATERIALS[k].name}. ${D.MATERIALS[k].blurb}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function gen(out, body) { for (let k = 0; k < 3; k++) { try {
  const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
  for (let j = 0; j < 100; j++) { await sleep(4000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') { writeFileSync(out, Buffer.from(await (await fetch(t.image_urls[0])).arrayBuffer())); return; } if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
} catch (e) { if (k === 2) console.log(out, 'FAILED', e.message.slice(0, 100)); await sleep(2000); } } }
if (!existsSync('concepts/cat/_camp.png')) gen('concepts/cat/_camp.png', { ai_model: 'nano-banana-pro', aspect_ratio: '16:9', prompt: 'A wide painted environment illustration in the tradition of the finest fantasy card game art, oil-paint brushwork, deep atmosphere. The Entrance hall of the Cabinet: a colossal dim museum gallery aboard an ancient structure in deep space, endless rows of tall brass and glass specimen cases receding into darkness, a great arched doorway at the far end spilling violet light, an expedition camp in the foreground with crates, a brass telescope, lanterns and a workbench, a huge window showing a nebula. Dark, moody, rich in the shadows, with the centre and lower half kept quiet and dark so interface panels can sit over it. No people, no text.' });
const todo = Object.entries(jobs).filter(([k]) => !existsSync(`concepts/cat/${k}.png`)); console.log('to make', todo.length);
for (let i = 0; i < todo.length; i += 11) await Promise.all(todo.slice(i, i + 11).map(([k, p]) => gen(`concepts/cat/${k}.png`, { ai_model: 'nano-banana-2', prompt: STYLE + p, aspect_ratio: '1:1' })));
console.log('done');
