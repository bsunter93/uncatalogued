// Turn concept images into 3D models with Meshy. Usage: node tools/model.mjs hobb sile ...
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/image-to-3d';
const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
// name: [concept file, humanoid?, face count]
const JOBS = { hobb: ['hobb_v4', 1, 14000], sile: ['sile_v4', 1, 14000], oyelaran: ['oyelaran_rig', 1, 14000], thornling: ['thornling', 0, 8000], mossback: ['mossback', 0, 12000], orchardmother: ['orchardmother', 0, 20000] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
await Promise.all(process.argv.slice(2).map(async name => {
  const [file, human, poly] = JOBS[name];
  const body = { image_url: 'data:image/png;base64,' + readFileSync(`concepts/${file}.png`).toString('base64'), model_type: 'smart-topology', ai_model: 'meshy-t2.5', target_polycount: poly, should_texture: true, texture_resolution: '2k' };
  if (human) body.pose_mode = 'a-pose';
  const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) return console.log(name, 'FAILED', JSON.stringify(r));
  writeFileSync(`models-src/${name}.task`, r.result);
  for (let i = 0; i < 200; i++) { await sleep(6000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json();
    if (t.status === 'SUCCEEDED') { const glb = Buffer.from(await (await fetch(t.model_urls.glb)).arrayBuffer()); writeFileSync(`models-src/${name}.glb`, glb); if (t.thumbnail_url) writeFileSync(`models-src/${name}.png`, Buffer.from(await (await fetch(t.thumbnail_url)).arrayBuffer())); return console.log(name, 'ok', t.consumed_credits, 'credits', (glb.length / 1e6).toFixed(1), 'MB'); }
    if (t.status === 'FAILED' || t.status === 'CANCELED') return console.log(name, t.status, JSON.stringify(t.task_error)); }
  console.log(name, 'timed out, task', r.result);
}));
