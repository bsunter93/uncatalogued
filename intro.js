// The opening: six plates from inside the Cabinet, each held and drifted slowly, each with its caption. Plays once, and can be played again from the landing page.
// The captions are the whole script, so a narration recorded later reads straight from PLATES.
const PLATES = [
  [1, 10, ['Someone built the Cabinet to hold one of every extraordinary thing.', 'Then they left.', 'They did not lock the gate.'], [-1.5, 0, 1.5, -1]],
  [2, 10, ['The exhibits got out and bred.', 'The labels are still on the walls.', 'Nothing is still behind them.'], [1.5, -.5, -1.5, .5]],
  [3, 9, ['The keepers were machines.', 'One still walks its lamp round and tips its lid to the empty benches.'], [-1, .5, 1.5, -.5]],
  [4, 10, ['Nobody has updated the catalogue since.', 'This is a Glasswing.', 'You can read the wall label through its wings.'], [1, 1, -1, -1]],
  [5, 11, ['The last hall belongs to a great one.', 'This is the Orchardmother.', 'Every Thornling in the Galleries fell from her, and she remembers each one.'], [0, 1.5, 0, -1.5]],
  [6, 11, ['You are a naturalist on contract.', 'The contracts are pinned to the gate each morning.', 'Nobody has seen who pins them.'], [-1, 0, 1, -1]],
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const src = n => new URL(`assets/intro/${n}.jpg`, import.meta.url).href;
export function playIntro() {
  return new Promise(done => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches; for (const p of PLATES) { const im = new Image(); im.src = src(p[0]); }
    const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Opening');
    el.innerHTML = '<div class="i-pic"></div><div class="i-cap" aria-live="polite"><span class="i-no"></span><p></p></div><div class="i-foot"><span class="i-pips"></span><button type="button" class="i-skip">Skip</button></div>';
    document.body.append(el); const pic = el.querySelector('.i-pic'), cap = el.querySelector('.i-cap p'), no = el.querySelector('.i-no'), pips = el.querySelector('.i-pips');
    pips.innerHTML = PLATES.map(() => '<i></i>').join(''); let at = -1, timers = [], over = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const end = () => { if (over) return; over = true; clear(); removeEventListener('keydown', key); el.classList.add('out'); setTimeout(() => { el.remove(); done(); }, 700); };
    const show = i => { clear(); if (i >= PLATES.length) return end(); at = i; const [n, hold, lines, d] = PLATES[i];
      const im = document.createElement('img'); im.alt = ''; im.src = src(n); pic.append(im); for (const o of [...pic.children].slice(0, -1)) { o.classList.add('gone'); setTimeout(() => o.remove(), 1300); }
      if (!still && im.animate) im.animate([{ transform: `scale(1.09) translate(${d[0]}%, ${d[1]}%)` }, { transform: `scale(1.15) translate(${d[2]}%, ${d[3]}%)` }], { duration: hold * 1000 + 1500, easing: 'linear', fill: 'forwards' });
      no.textContent = 'Plate ' + ROMAN[i]; cap.innerHTML = lines.map(t => `<span>${t}</span>`).join(' '); [...pips.children].forEach((p, k) => p.classList.toggle('on', k <= i));
      const sp = [...cap.children], gap = Math.min(2600, (hold * 1000 - 2600) / sp.length); sp.forEach((s, k) => timers.push(setTimeout(() => s.classList.add('in'), 700 + k * gap))); /* one sentence at a time, at reading pace */
      timers.push(setTimeout(() => show(i + 1), hold * 1000)); };
    const key = e => { if (e.key === 'Escape') end(); else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); } };
    addEventListener('keydown', key); el.querySelector('.i-skip').onclick = e => { e.stopPropagation(); end(); }; el.onclick = () => show(at + 1); show(0);
  });
}
