// Tamsin-7, the Tinkerer: concept, weaponless body, rig, base clips, weapon-class clips, portrait.
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body, tries = 3) { for (let k = 0; k < tries; k++) { try {
  const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
  for (let i = 0; i < 240; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
  throw new Error('timed out');
} catch (e) { if (k === tries - 1) throw e; await sleep(4000); } } }
const dl = async (url, out) => writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
const LOOK = 'Tamsin-7, a tinkerer automaton that joined the expedition: a slim humanoid machine of brass, cream enamel and dark steel, about the height of a person, a round glass-domed head with a single soft teal lens eye and a small expressive brass shutter brow, visible gear joints at shoulders, elbows and knees, a riveted chest plate with a small glowing teal core behind a grille, a leather tool harness with pouches and coiled copper wire, a short patched expedition half-cloak over one shoulder, thin dexterous three-fingered hands. Curious and gentle, clearly built not born. Colors: brass, cream enamel, dark steel, teal light.';
try {
  const im = await run('text-to-image', { ai_model: 'nano-banana-2', pose_mode: 'a-pose', prompt: 'Stylized hand-painted low-poly game character concept, classic 2000s fantasy MMO look, chunky readable silhouette, heroic confident presence, grounded and believable, painted texture with soft gradients, saturated jewel tones with violet shadows and green rim light, single full-body subject centered, empty hands, no weapons, plain flat mid-grey background, no text, no ground. ' + LOOK });
  await dl(im.image_urls[0], 'concepts/tamsin.png'); console.log('concept ok');
  const [m, pt] = await Promise.all([
    run('image-to-3d', { input_task_id: im.id, model_type: 'smart-topology', ai_model: 'meshy-t2.5', target_polycount: 14000, should_texture: true, texture_resolution: '2k', pose_mode: 'a-pose' }),
    run('image-to-image', { ai_model: 'nano-banana-pro', input_task_id: im.id, prompt: 'Paint a highly detailed character portrait of this exact character, same design and colors. Waist-up, three-quarter view, square composition. Rich painterly digital illustration in the style of classic fantasy RPG character portraits: visible brushwork, fine detail in the enamel, scuffed brass, leather grain and glass. Dramatic warm key light from the upper left with a cool violet-green rim light. The automaton is holding a small half-built brass drone in both hands and studying it, teal lens glowing. Background: the dim interior of a vast ancient gallery in deep space, towering specimen cases, drifting motes, a tall window with a faint nebula, softly out of focus. No text, no frame.' }),
  ]);
  await dl(m.model_urls.glb, 'models-src/tamsin.glb'); await dl(pt.image_urls[0], 'concepts/tamsin_portrait.png'); console.log('model and portrait ok');
  const rig = await run('rigging', { input_task_id: m.id, height_meters: 1.7 }, 1); writeFileSync('models-src/tamsin.rig', rig.id); console.log('rig ok', rig.id);
  const [a, c] = await Promise.all([run('animations', { rig_task_id: rig.id, action_ids: [0, 106, 125, 129, 336, 178, 187, 337, 59] }), run('animations', { rig_task_id: rig.id, action_ids: [219, 242, 240, 224, 222, 104, 232, 239] })]);
  await dl(a.result.animation_glb_url, 'models-src/tamsin_anim.glb'); await dl(c.result.animation_glb_url, 'models-src/tamsin_cls_anim.glb'); console.log('clips ok');
} catch (e) { console.log('FAILED', e.message.slice(0, 200)); }
