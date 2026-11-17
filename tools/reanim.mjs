// Bake a new clip set onto an existing rig. Usage: node tools/reanim.mjs <name> <rigTaskId> <id,id,...>
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/animations'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const [name, rig, ids] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ rig_task_id: rig, action_ids: ids.split(',').map(Number) }) })).json(); if (!r.result) { console.log(name, 'FAILED', JSON.stringify(r)); process.exit(1); }
for (let i = 0; i < 200; i++) { await sleep(5000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json();
  if (t.status === 'SUCCEEDED') { writeFileSync(`models-src/${name}_anim.glb`, Buffer.from(await (await fetch(t.result.animation_glb_url)).arrayBuffer())); writeFileSync(`models-src/${name}.rig`, rig); console.log(name, 'ok', t.consumed_credits); process.exit(0); }
  if (t.status === 'FAILED' || t.status === 'CANCELED') { console.log(name, t.status, JSON.stringify(t.task_error)); process.exit(1); } }
