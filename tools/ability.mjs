// A motion clip for each ability: text -> motion -> retargeted onto the hero's rig. Usage: node tools/ability.mjs [ability ...]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const rig = n => readFileSync(`models-src/${n}.rig`, 'utf8').trim();
// ability: [rig file, seconds, what the body does]
export const MOVES = {
  brace: ['hobb2', 2.5, 'A heavily armored warrior plants his feet wide, raises a large round shield in front of his body with his left arm and braces hard behind it, leaning forward and holding the stance.'],
  shove: ['hobb2', 2.5, 'A warrior steps forward and slams a shield forward with his left arm in a violent shoulder-driven bash, then recovers to a fighting stance.'],
  riposte: ['hobb2', 3, 'A warrior parries an incoming blow by sweeping his weapon arm across his body, then immediately counterattacks with a fast downward strike of the right hand.'],
  mark: ['sile2', 2.5, 'An archer points sharply at a distant target with the right arm fully extended, holds the point for a beat, then lowers the arm.'],
  snare: ['sile2', 3.5, 'A hunter drops to one knee, sets a trap on the ground with both hands, presses it down firmly, then stands back up.'],
  deadeye: ['sile2', 3.5, 'An archer slowly draws a bow to full extension, holds perfectly still while aiming, then releases the arrow with a sharp recoil of the right hand.'],
  mend: ['oyelaran', 3, 'A healer raises both hands in front of the chest, gathers energy between the palms, then pushes both hands gently forward and outward to send it to an ally.'],
  spore_dart: ['oyelaran', 2.5, 'A person winds up and throws a small dart overhand with the right hand in a quick whipping motion, following through.'],
  soothe: ['oyelaran', 3.5, 'A person slowly lowers into a slight crouch and extends one open palm forward and down in a calming gesture, moving gently and slowly.'],
  drone: ['tamsin', 3, 'A person crouches slightly, cups an object in both hands, then tosses it upward and forward into the air with both hands and watches it rise.'],
  arc_pulse: ['tamsin', 2.5, 'A person thrusts the right arm straight forward with an open palm as if firing a blast of energy from the hand, the body recoiling from the force.'],
  overclock: ['tamsin', 3, 'A person spins both hands in a fast winding motion in front of the chest like cranking a mechanism, then throws both arms out toward an ally.'],
  kindle: ['garrow', 3, 'A warrior holding a sword in the right hand and a dagger in the left scrapes the two blades against each other in front of the chest, then flourishes both blades out to the sides.'],
  fire_breath: ['garrow', 3.5, 'A creature rears its head and chest back while inhaling deeply, then lunges the head forward with the mouth wide open and breathes out a long stream of fire, arms swept back.'],
  red_glare: ['garrow', 2.5, 'A warrior snaps the head forward and holds it rigid, leaning in with shoulders squared and fists clenched at the sides as if firing beams from the eyes, then relaxes.'],
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(path, body) { const r = await (await fetch(API + path, { method: 'POST', headers: H, body: JSON.stringify(body) })).json(); if (!r.result) throw new Error(path + ' ' + JSON.stringify(r));
  for (let i = 0; i < 240; i++) { await sleep(5000); const t = await (await fetch(API + path + '/' + r.result, { headers: H })).json(); if (t.status === 'SUCCEEDED') return t; if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(path + ' ' + JSON.stringify(t.task_error)); }
  throw new Error(path + ' timed out ' + r.result); }
const want = process.argv.slice(2); const todo = Object.entries(MOVES).filter(([k]) => want.length ? want.includes(k) : !existsSync(`models-src/abl_${k}.glb`));
if (import.meta.url === `file://${process.argv[1]}`) { for (let i = 0; i < todo.length; i += 5) await Promise.all(todo.slice(i, i + 5).map(async ([name, [r, secs, prompt]]) => { try {
  const m = await run('text-to-motion', { prompt, duration: secs }); const an = await run('animations', { rig_task_id: rig(r), motion_task_id: m.id });
  const url = an.result.animation_glb_url; if (!url) throw new Error('no glb ' + Object.keys(an.result));
  writeFileSync(`models-src/abl_${name}.glb`, Buffer.from(await (await fetch(url)).arrayBuffer())); console.log(name, 'ok', (m.consumed_credits || 0) + (an.consumed_credits || 0), 'credits');
} catch (e) { console.log(name, 'FAILED', e.message.slice(0, 220)); } })); console.log('done'); }
