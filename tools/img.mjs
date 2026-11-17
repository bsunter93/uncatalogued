// One image-to-image edit. Usage: node tools/img.mjs <in.png> <out.png> <model> <prompt>
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/image-to-image'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const [src, out, model, prompt] = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ ai_model: model, prompt, reference_image_urls: ['data:image/png;base64,' + readFileSync(src).toString('base64')] }) })).json();
if (!r.result) { console.log(out, 'FAILED', JSON.stringify(r)); process.exit(1); }
for (let i = 0; i < 120; i++) { await sleep(4000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json();
  if (t.status === 'SUCCEEDED') { writeFileSync(out, Buffer.from(await (await fetch(t.image_urls[0])).arrayBuffer())); writeFileSync(out + '.task', r.result); console.log(out, 'ok', t.consumed_credits, 'credits'); process.exit(0); }
  if (t.status === 'FAILED' || t.status === 'CANCELED') { console.log(out, t.status, JSON.stringify(t.task_error)); process.exit(1); } }
