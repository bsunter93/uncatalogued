// Painted ability icons. Usage: node tools/icon.mjs [name ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const KEY = (process.env.MESHY_API_KEY || readFileSync(homedir() + '/.config/meshy/key', 'utf8')).trim();
const API = 'https://api.meshy.ai/openapi/v1/text-to-image'; const H = { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
const STYLE = 'A single square game ability icon, hand-painted in the style of classic 2000s fantasy MMO spell icons, bold readable central subject filling the frame, strong rim light, rich brushwork, dark vignette background, thin worn brass border with small rivets in the corners. No text, no letters, no numbers, no UI. Subject: ';
const C = { attack: 'Dominant color: hot red and orange.', defend: 'Dominant color: steel blue and pale cyan.', control: 'Dominant color: violet and magenta.', support: 'Dominant color: emerald green and soft gold.', device: 'Dominant color: amber and copper.', lore: 'Dominant color: bright cyan and parchment gold.' };
const ICONS = {
  study: ['lore', 'a brass magnifying lens held over an open field sketchbook, a small glowing creature silhouette visible inside the lens.'],
  brace: ['defend', 'a great round brass and iron tower shield planted in the ground with a teal sigil glowing at its centre, shockwave rings around it.'],
  shove: ['attack', 'an armored gauntlet and shield rim slamming forward with a burst of impact lines and flying splinters.'],
  riposte: ['defend', 'an anchor-headed war hammer parrying a clawed strike, sparks at the point of contact, a counter-swing arc.'],
  mark: ['control', 'a glowing rune crosshair hovering over the dark silhouette of a small thorned beast, like a hunter\'s mark.'],
  snare: ['control', 'a coiled spring trap of brass jaws and thorned vine set open on mossy ground, a faint glow under it.'],
  deadeye: ['attack', 'a single arrow with luminous green fletching in flight, seen head on, a brass sighting ring around it and streaks of speed.'],
  mend: ['support', 'two hands cupping a glowing vial of green sap, small leaves and motes of light rising from it.'],
  spore_dart: ['attack', 'a slender blow dart tipped with a swollen glowing green spore pod, trailing a cloud of toxic spores.'],
  soothe: ['control', 'an open hand releasing a slow spiral of soft violet pollen toward a calm closed animal eye.'],
  drone: ['device', 'a small brass clockwork hovering drone with a glass lens eye and two spinning rotors, a thin beam of light from the lens.'],
  kindle: ['attack', 'a slim dark steel sword and a short dagger crossed, both blades wrapped in bright orange flame, sparks flying.'],
  fire_breath: ['attack', 'the head of a golden eagle in profile with its hooked beak wide open, breathing out a roaring cone of orange and yellow fire.'],
  red_glare: ['attack', 'the fierce face of a golden eagle seen head on, two thin blazing red beams of light shooting straight out of its eyes toward the viewer.'],
  boon_whetstone: ['attack', 'a brass-bound whetstone with a blade edge drawn across it, a shower of bright sparks.'],
  boon_gallery_eye: ['lore', 'a brass monocle with a glowing lens showing a tiny target reticle, held on a fine chain.'],
  boon_wound_reader: ['attack', 'an anatomical sketch on parchment with one red mark circled, a scalpel laid across it.'],
  boon_first_blood: ['attack', 'a single thorn-tipped arrowhead with one bright drop of red falling from its point.'],
  boon_serrated: ['attack', 'a row of jagged saw teeth of dark steel bolted along a blade edge, brass rivets.'],
  boon_venom_gland: ['support', 'a swollen translucent green venom sac tied with cord, one drop of glowing green at the tip.'],
  boon_capacitor: ['device', 'a fat glass and brass capacitor jar crackling with teal lightning inside.'],
  boon_quick_fingers: ['device', 'a gloved hand with brass fingertip caps snapping its fingers, motion streaks.'],
  boon_bark_wrap: ['defend', 'a forearm wrapped in overlapping strips of living bark with small green shoots.'],
  boon_piercer: ['attack', 'three long steel needles bundled in a leather wrap, their points glinting.'],
  boon_moss_poultice: ['support', 'a folded poultice of glowing green moss bound with twine on a broad leaf.'],
  boon_plate_rivets: ['defend', 'a heavy brass rivet being hammered into a dark steel plate, sparks flying.'],
  boon_long_stride: ['support', 'a worn leather expedition boot mid-stride with small brass wings at the heel.'],
  boon_heartfruit: ['support', 'a glass preserving jar holding one glowing red heart-shaped fruit in amber syrup.'],
  boon_field_kit: ['support', 'an open leather field surgery roll with brass instruments, bandages and a small glowing vial.'],
  boon_soft_step: ['control', 'a bare footprint pressed softly into moss, fading, with a feather lying beside it.'],
  boon_ember_oil: ['attack', 'a small brass oil flask tipped over a blade, the oil catching into orange flame.'],
  attack: ['attack', 'a single heavy steel blade caught mid-swing, a bright curved arc of motion trailing behind its edge, sparks at the tip.'],
  watch: ['lore', 'a brass field spyglass half extended, a small sketchbook with a pencil drawing of an animal lying open beside it.'],
  arc_pulse: ['attack', 'a brass tesla coil emitter firing a forked bolt of lightning that jumps between two points.'],
  overclock: ['support', 'a brass pocket watch with its gears exposed and spinning fast, hands blurred, sparks and gold light spilling out.'],
  device: ['device', 'a brass field gadget: a seed-shaped canister with a pull ring, a glass window showing glowing liquid, copper pipes.'],
  end: ['lore', 'a brass hourglass with glowing sand almost run out, set on a stone ledge.'],
  move_on: ['lore', 'a tall stone gallery doorway overgrown with vines, bright violet light pouring through the opening.'],
};
const want = process.argv.slice(2); const sleep = ms => new Promise(r => setTimeout(r, ms));
await Promise.all(Object.entries(ICONS).filter(([k]) => !want.length || want.includes(k)).map(async ([name, [type, p]]) => {
  for (let k = 0; k < 3; k++) { try {
    const r = await (await fetch(API, { method: 'POST', headers: H, body: JSON.stringify({ ai_model: 'nano-banana-2', prompt: STYLE + p + ' ' + C[type], aspect_ratio: '1:1' }) })).json(); if (!r.result) throw new Error(JSON.stringify(r));
    for (let i = 0; i < 90; i++) { await sleep(4000); const t = await (await fetch(API + '/' + r.result, { headers: H })).json();
      if (t.status === 'SUCCEEDED') { writeFileSync(`concepts/icons/${name}.png`, Buffer.from(await (await fetch(t.image_urls[0])).arrayBuffer())); return console.log(name, 'ok'); }
      if (t.status === 'FAILED' || t.status === 'CANCELED') throw new Error(JSON.stringify(t.task_error)); }
  } catch (e) { if (k === 2) console.log(name, 'FAILED', e.message.slice(0, 120)); await sleep(2000); } }
}));
