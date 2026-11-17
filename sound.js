// Sound, synthesized in the browser. No audio files. Starts on the first tap, because browsers require that.
let ctx = null, master = null, amb = null, chime = null;
let on = true; try { on = localStorage.getItem('unc.snd') !== '0'; } catch { /* private mode */ }
const SCALE = [220, 261.6, 293.7, 349.2, 392, 440, 523.3, 587.3];

function boot() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = on ? .9 : 0;
  const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
  return true;
}
function noise(sec) { const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = b; return s; }
function tone(f, { t = 0, dur = .3, type = 'sine', vol = .2, to = null, att = .005 } = {}) {
  if (!ctx) return; const t0 = ctx.currentTime + t; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + att); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
}
function thud(f, { t = 0, dur = .12, vol = .3, q = 1 } = {}) {
  if (!ctx) return; const t0 = ctx.currentTime + t; const s = noise(dur + .05), fl = ctx.createBiquadFilter(), g = ctx.createGain(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); s.connect(fl); fl.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + .05);
}

export const snd = {
  get on() { return on; },
  toggle() { on = !on; try { localStorage.setItem('unc.snd', on ? '1' : '0'); } catch { /* */ } if (boot()) master.gain.setTargetAtTime(on ? .9 : 0, ctx.currentTime, .05); return on; },
  // Call from a tap. Starts the room's ambience once.
  start(region = 'verdant') {
    if (!boot() || amb) return;
    const root = region === 'clockwork' ? 82.4 : 110; const out = ctx.createGain(); out.gain.value = 0; out.gain.linearRampToValueAtTime(.16, ctx.currentTime + 4); out.connect(master);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(out);
    const nodes = [];
    for (const [m, d, type] of [[1, -4, 'sine'], [1.5, 5, 'sine'], [2, -7, 'triangle'], [3, 3, 'sine']]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = root * m; o.detune.value = d; g.gain.value = m > 2 ? .12 : .3; o.connect(g); g.connect(lp); o.start(); nodes.push(o); }
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = 180; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); nodes.push(lfo);
    const wind = noise(4); wind.loop = true; const wf = ctx.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = region === 'clockwork' ? 240 : 700; wf.Q.value = .6; const wg = ctx.createGain(); wg.gain.value = .09; wind.connect(wf); wf.connect(wg); wg.connect(out); wind.start(); nodes.push(wind);
    amb = { out, nodes };
    const ring = () => { if (!amb) return; const f = SCALE[Math.floor(Math.random() * SCALE.length)] * (region === 'clockwork' ? 1 : 2); tone(f, { dur: 2.4, vol: .035, att: .02 }); if (Math.random() < .4) tone(f * 1.5, { t: .35, dur: 2, vol: .022, att: .02 }); chime = setTimeout(ring, 2600 + Math.random() * 5200); };
    chime = setTimeout(ring, 1800);
  },
  stop() { clearTimeout(chime); if (!amb) return; const a = amb; amb = null; a.out.gain.setTargetAtTime(0, ctx.currentTime, .3); setTimeout(() => a.nodes.forEach(n => { try { n.stop(); } catch { /* */ } }), 1500); },
  click() { tone(660, { dur: .06, vol: .07, type: 'triangle' }); },
  step() { thud(180 + Math.random() * 60, { dur: .08, vol: .22, q: 1.4 }); },
  swing() { thud(1400, { dur: .13, vol: .1, q: .7 }); },
  hit(crit) { thud(320, { dur: .16, vol: .5 }); tone(150, { dur: .2, vol: .3, to: 55, type: 'triangle' }); if (crit) { tone(1320, { t: .03, dur: .5, vol: .11 }); tone(1980, { t: .08, dur: .45, vol: .07 }); } },
  heal() { tone(523.3, { dur: .35, vol: .09 }); tone(784, { t: .1, dur: .45, vol: .08 }); },
  study() { [880, 1108.7, 1318.5].forEach((f, i) => tone(f, { t: i * .07, dur: .5, vol: .06 })); },
  pick() { tone(659.3, { dur: .2, vol: .09, type: 'triangle' }); tone(987.8, { t: .08, dur: .5, vol: .08 }); },
  die() { tone(260, { dur: .55, vol: .2, to: 48, type: 'sawtooth' }); thud(140, { dur: .4, vol: .3, q: .5 }); },
  flee() { tone(500, { dur: .25, vol: .08, to: 900 }); },
  warn() { tone(196, { dur: .5, vol: .16, type: 'sawtooth', to: 185 }); tone(98, { dur: .6, vol: .2 }); },
  turn(theirs) { tone(theirs ? 110 : 164.8, { dur: 1.2, vol: .16, att: .01 }); tone(theirs ? 164.8 : 246.9, { t: .02, dur: 1, vol: .08 }); },
  room() { [146.8, 220, 293.7, 440].forEach((f, i) => tone(f, { t: i * .12, dur: 1.6, vol: .1 })); },
};
