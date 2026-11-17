// Weapons as separate models, and weaponless hero bodies rigged and animated. Usage: node tools/weap.mjs [name ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const ISO = 'From this character sheet, draw ONLY the object described, alone, nothing else: no character, no hands, no body. Same painted art style, same design, colors and details as on the character. The whole object in frame, centered, three-quarter view, on a plain flat mid-grey background, no ground, no text. Object: ';
const BODY = 'Keep this exact character, face, outfit, colors, painted art style and plain grey background. Full body head to boots, clean symmetrical A-pose facing the camera straight on, both arms straight and held out from the sides at 45 degrees with empty open hands, legs slightly apart. Remove any holograms or floating glow effects. Change: ';
const JOBS = {
  w_hammer: { src: 'hobb_v4', p: ISO + 'the long-hafted war hammer whose head is a ship anchor fluke, with the brass pressure gauge and copper pipe below the head and a wrapped leather grip. Full length of the haft visible, laid diagonally.', poly: 4000 },
  w_shield: { src: 'hobb_v4', p: ISO + 'EXACTLY ONE shield, a single object shown once from the front only, never two views: the great round tower shield of brass and dark iron with riveted edge banding, segmented panel lines and a small teal light at its centre, seen from the front at a slight angle, with leather arm straps on the back.', poly: 4000 },
  w_bow: { src: 'sile_v4', p: ISO + 'the tall recurve bow of pale carved wood with glowing green runes along its limbs, small brass geared cams at both tips, a brass sighting ring on the grip, and its bowstring strung taut. Upright, full height.', poly: 4000 },
  w_staff: { src: 'oyelaran_v4', p: ISO + 'EXACTLY ONE staff, a single object shown once, never two copies: the tall ornate staff of dark wood crowned with a large brass ring holding a crystal lens, with a jointed brass reading arm and second small lens. Upright, full height, perfectly straight.', poly: 4000 },
  hobb2: { src: 'hobb_v4', p: BODY + 'remove the war hammer and the round shield from his back completely, so his back and shoulders are clear. Keep the brass prow pauldron, half-cape and belt.', poly: 14000, rig: [89, 21, 128, 220, 138, 178, 187, 2, 59] },
  sile2: { src: 'sile_v4', p: BODY + 'remove the bow from her back completely. Keep the quiver of green-fletched arrows on her back, the feathered mantle and the hood. Shorten the cloak so it ends at her knees and hangs behind her, clear of her arms and legs.', poly: 14000, rig: [0, 115, 224, 222, 258, 150, 187, 334, 59] },
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body, tries = 3) { for (let k = 0; k < tries; k++) { try {
  const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
  for (let i = 0; i < 220; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
  throw new Error('timed out');
} catch (e) { if (k === tries - 1) throw e; await sleep(4000); } } }
const dl = async (url, out) => writeFileSync(out, Buffer.from(await (await fetch(url)).arrayBuffer()));
const want = process.argv.slice(2);
await Promise.all(Object.entries(JOBS).filter(([k]) => !want.length || want.includes(k)).map(async ([name, j]) => { try {
  const im = await run('image-to-image', { ai_model: 'nano-banana-2', prompt: j.p, reference_image_urls: ['data:image/png;base64,' + readFileSync(`concepts/${j.src}.png`).toString('base64')] });
  await dl(im.image_urls[0], `concepts/${name}.png`);
  const body = { input_task_id: im.id, model_type: 'smart-topology', ai_model: 'meshy-t2.5', target_polycount: j.poly, should_texture: true, texture_resolution: '2k' }; if (j.rig) body.pose_mode = 'a-pose';
  const m = await run('image-to-3d', body); await dl(m.model_urls.glb, `models-src/${name}.glb`);
  if (!j.rig) return console.log(name, 'ok model');
  const rig = await run('rigging', { input_task_id: m.id, height_meters: 1.75 }, 1);
  const an = await run('animations', { rig_task_id: rig.id, action_ids: j.rig }); await dl(an.result.animation_glb_url, `models-src/${name}_anim.glb`);
  console.log(name, 'ok rigged');
} catch (e) { console.log(name, 'FAILED', e.message.slice(0, 160)); } }));
