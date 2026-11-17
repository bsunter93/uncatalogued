// Edit an existing concept image with Meshy image-to-image. Usage: node tools/edit.mjs  (edits listed below)
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/image-to-image';
const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const KEEP = 'Keep this exact character, face, pose, proportions, colors, outfit, painted art style and plain grey background. Change only what is listed. Restrained, functional period-instrument details in the spirit of a Victorian naturalist field kit: brass, rivets, leather, glass. No goggles, no top hats, no decorative gears stuck on clothing. ';
const JOBS = {
  hobb: 'Add: a small round brass pressure gauge with a glass face set into the haft of the anchor hammer just below the head, with a thin copper pipe running to the head; riveted brass edge banding and three small rivets on the round shield; a brass buckle strap with a small valve wheel across the chest; a short brass piston brace along the outside of the left forearm guard.',
  sile: 'Add: small brass geared cams with a thin cable at both tips of the recurve bow, like a hand-built compound bow; a brass sighting ring with a tiny lens mounted on the bow grip; a small brass spyglass in a leather loop at the belt; a brass clasp shaped like a compass rose fastening the cloak.',
  oyelaran: 'Add: a jointed brass reading arm with a second small lens that swings out from the ring at the top of the staff; a small brass barometer dial hanging from the bandolier; brass caps and a thin copper tube linking the glowing vials; a slim brass monocle arm hinged on the side of her spectacles.',
};
const SPACE_KEEP = 'This expedition happens aboard a vast ancient structure in deep space. Layer in a few quiet far-future details, as if this period field kit were built with advanced technology. Hard-surface industrial design, understated and worn, never glossy or flashy. No helmets, no visors, no guns, no logos, no text. ';
const SPACE = {
  hobb: SPACE_KEEP + 'Add: a slim sealed pressure collar ring of dark composite at the neck under the coat collar; thin teal light seams along the edges of the forearm and shin plates; the shield face gains a few flush segmented panel lines with one small teal status light; a compact dark power cell clipped at the back of the belt.',
  sile: SPACE_KEEP + 'Add: a fitted dark composite chest plate with fine panel lines under the leather harness; a slim wrist band on the left bracer projecting a very small faint green holographic compass; thin green light seams on the boot cuffs; a narrow sealed collar ring at the neck inside the hood.',
  oyelaran: SPACE_KEEP + 'Add: a slim dark wrist device on the left cuff projecting a small faint gold holographic leaf diagram above her open palm; a narrow sealed collar ring at the neck; the staff ring gains two thin floating gold light arcs around the crystal; a small matte sample canister with a blue status light on the satchel strap.',
};
const ver = process.argv[2] || 'v3'; const src = process.argv[3] || ''; const SET = process.argv[4] === 'space' ? SPACE : JOBS; const sleep = ms => new Promise(r => setTimeout(r, ms));
await Promise.all(Object.entries(SET).map(async ([name, p]) => {
  const from = `concepts/${name}${src ? '_' + src : ''}.png`;
  const uri = 'data:image/png;base64,' + readFileSync(from).toString('base64');
  const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ ai_model: 'nano-banana-2', prompt: KEEP + p, reference_image_urls: [uri] }) })).json(); if (!r.result) return console.log(name, 'FAILED', JSON.stringify(r));
  for (let i = 0; i < 90; i++) { await sleep(4000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json();
    if (t.status === 'SUCCEEDED') { const img = Buffer.from(await (await fetch(t.image_urls[0])).arrayBuffer()); writeFileSync(`concepts/${name}_${ver}.png`, img); return console.log(name, 'ok', t.consumed_credits, 'credits'); }
    if (t.status === 'FAILED' || t.status === 'CANCELED') return console.log(name, t.status, JSON.stringify(t.task_error)); }
  console.log(name, 'timed out');
}));
