// Rig a humanoid model and bake a set of library animations into one GLB. Usage: node tools/rig.mjs hobb sile ...
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
// clip order matters: the game names clips by this order
export const CLIPS = ['idle', 'walk', 'attack', 'skill', 'guard', 'hit', 'die', 'study', 'cheer'];
const SETS = { hobb: [89, 21, 128, 220, 138, 178, 187, 2, 59], sile: [0, 115, 224, 222, 258, 150, 187, 334, 59], oyelaran: [0, 106, 125, 129, 336, 178, 187, 337, 59] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body) {
  const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(path + ' ' + JSON.stringify(r));
  for (let i = 0; i < 200; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(path + ' ' + JSON.stringify(t.task_error)); }
  throw new Error(path + ' timed out ' + r.result);
}
await Promise.all(process.argv.slice(2).map(async name => {
  try {
    const rig = await run('rigging', { input_task_id: readFileSync(`models-src/${name}.task`, 'utf8').trim(), height_meters: 1.75 });
    writeFileSync(`models-src/${name}.rig`, rig.id);
    const an = await run('animations', { rig_task_id: rig.id, action_ids: SETS[name] });
    const glb = Buffer.from(await (await fetch(an.result.animation_glb_url)).arrayBuffer()); writeFileSync(`models-src/${name}_anim.glb`, glb);
    console.log(name, 'ok rig', rig.consumed_credits, 'anim', an.consumed_credits, 'credits', (glb.length / 1e6).toFixed(1), 'MB', Object.keys(an.result).join(','));
  } catch (e) { console.log(name, 'FAILED', e.message); }
}));
