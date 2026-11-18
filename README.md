# Wildhall

A shared collection RPG that runs in the browser. Take three Seekers into the Cabinet, study what lives there, and put your name on what nobody has catalogued yet.

Play: https://bsunter93.github.io/uncatalogued/

## How it is built

- `data.js` holds every content table: species, flora, wonders, equipment bases, affixes, special effects, Singulars, Resonances, loot tables.
- `core.js` is the rules engine. It is deterministic: an expedition is a seed plus a list of player actions. The same file runs in the browser and on the server.
- `server/index.ts` is the API (a Supabase Edge Function on Postgres). It issues each expedition seed, replays the submitted action log through the engine to confirm the outcome, then rolls rewards with randomness the browser never sees. First discoveries are decided by a primary key insert, so two players cannot both be first.
- `battle.js`, `app.js`, `ui.js`, `style.css` are the interface. No framework.
- `art.js` draws every plate procedurally as SVG.

## Develop

    npm test          # bot playtests: determinism, win rates by tier, loot distribution
    npm run build     # bundle core.js + data.js into engine.iife.js for the server

Bump `VERSION` in `core.js` whenever the rules change, then rebuild. The server loads `engine.iife.js` at that version and tells older browsers to reload.
