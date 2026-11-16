// The Uncatalogued: authoritative game API.
// Loads the same rules engine the browser runs, replays every expedition from its seed
// and action log, and only then rolls rewards with randomness the client never sees.
import postgres from "npm:postgres@3.4.5";

const SITE = "https://bsunter93.github.io/uncatalogued/";
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 3 });
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// deno-lint-ignore no-explicit-any
let core: any = null;
async function engine(v: number) {
  if (!core || v > core.VERSION) core = await import(`${SITE}engine.js?v=${v}`);
  return core;
}
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const secretSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const BLOCK = ["fuck", "shit", "cunt", "nigg", "fag", "rape", "nazi", "hitler", "bitch", "admin"];
function cleanName(raw: unknown) {
  const n = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 _'.-]{2,15}$/.test(n)) return null;
  const lc = n.toLowerCase().replace(/[^a-z]/g, "");
  if (BLOCK.some((b) => lc.includes(b))) return null;
  return n;
}

// deno-lint-ignore no-explicit-any
async function world(C: any, playerId?: string) {
  const [feed, leaders, firstsTop, firsts, total] = await Promise.all([
    sql`select at, kind, player_name as who, title, detail, region, rarity from uncatalogued.feed order by id desc limit 40`,
    sql`select name, score, entries, firsts from uncatalogued.players where score > 0 order by score desc, created_at limit 25`,
    sql`select name, firsts, score from uncatalogued.players where firsts > 0 order by firsts desc, score desc limit 25`,
    sql`select key, player_name as who, at from uncatalogued.firsts`,
    sql`select count(*)::int as n from uncatalogued.players`,
  ]);
  const wk = C.weekId(Date.now());
  const weekly = await sql`select name, weekly_score as score from uncatalogued.players where weekly_id = ${String(wk)} and weekly_score > 0 order by weekly_score desc limit 25`;
  let rank = null;
  if (playerId) {
    const r = await sql`select 1 + count(*)::int as rank from uncatalogued.players where score > (select score from uncatalogued.players where id = ${playerId})`;
    rank = r[0]?.rank ?? null;
  }
  return { feed, leaders, firstsTop, firsts, weekly, week: wk, seekers: total[0].n, rank, now: Date.now() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  // deno-lint-ignore no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  try {
    const C = await engine(Number(body.v) || 1);
    if (Number(body.v) < C.VERSION) return json({ error: "update" });
    const now = Date.now();
    if (body.op === "world" && !body.key) return json({ world: await world(C) });
    const key = String(body.key ?? "");
    if (key.length < 32 || key.length > 128) return json({ error: "Missing key" }, 400);
    const kh = await sha(key);

    if (body.op === "register") {
      const name = cleanName(body.name);
      if (!name) return json({ error: "Names are 3 to 16 letters, numbers or spaces." });
      const state = C.newPlayer(name, secretSeed(), now);
      try {
        const r = await sql`insert into uncatalogued.players (key_hash, name, name_lc, state, score, entries) values (${kh}, ${name}, ${name.toLowerCase()}, ${sql.json(state)}, ${C.score(state)}, ${Object.keys(state.cat).length}) returning id`;
        return json({ state, world: await world(C, r[0].id) });
      } catch (e) {
        if (String(e).includes("name_lc")) return json({ error: "That name is already in the ledger." });
        if (String(e).includes("key_hash")) return json({ error: "This browser already has a Seeker. Reload the page." });
        throw e;
      }
    }

    if (body.op === "load" || body.op === "world") {
      const r = await sql`update uncatalogued.players set seen_at = now() where key_hash = ${kh} returning id, state`;
      if (!r.length) return json({ error: "unknown" });
      return json({ state: body.op === "load" ? r[0].state : undefined, world: await world(C, r[0].id) });
    }

    if (body.op === "ops") {
      const ops = Array.isArray(body.ops) ? body.ops.slice(0, 60) : [];
      const rng = C.mkRng(secretSeed());
      // deno-lint-ignore no-explicit-any
      const result = await sql.begin(async (tx: any) => {
        const rows = await tx`select id, name, state from uncatalogued.players where key_hash = ${kh} for update`;
        if (!rows.length) return { error: "unknown" };
        const { id, name } = rows[0]; const state = rows[0].state;
        const results = []; const fresh: string[] = []; let err: string | null = null; let report = null;
        for (const op of ops) {
          try {
            const out = C.applyOp(state, op, { now, rng });
            fresh.push(...out.fresh); if (out.report) report = out.report;
            results.push({ unlocked: out.unlocked, item: out.item, report: out.report, fresh: out.fresh });
          } catch (e) {
            // deno-lint-ignore no-explicit-any
            if ((e as any).illegal) { err = (e as Error).message; break; }
            throw e;
          }
        }
        // first discoveries: one atomic insert per key, the primary key decides who was first
        const won: string[] = [];
        for (const k of fresh) {
          const r = await tx`insert into uncatalogued.firsts (key, player_id, player_name) values (${k}, ${id}, ${name}) on conflict (key) do nothing returning key`;
          if (r.length) { won.push(k); if (state.cat[k]) state.cat[k].first = true; }
        }
        const feed: Record<string, unknown>[] = [];
        for (const k of won) { const info = C.keyInfo(k); feed.push({ kind: "first", player_name: name, title: info.name, detail: info.kind, region: info.region ?? null, rarity: k[0] === "s" ? "singular" : k[0] === "v" ? "rare" : null }); }
        if (report) {
          for (const it of report.items) { const x = state.items[it.id]; if (x && (x.rar === "exotic" || x.rar === "singular")) feed.push({ kind: "find", player_name: name, title: C.itemName(x), detail: C.D.RARITY_NAME[x.rar], region: report.region, rarity: x.rar }); }
          for (const s of report.stageUps) if (s.stage === 3) feed.push({ kind: "mastery", player_name: name, title: C.D.SPECIES[s.sp].name, detail: "Mastered", region: C.D.SPECIES[s.sp].region, rarity: null });
        }
        // community coverage milestones
        const newFauna = won.filter((k) => k.startsWith("f:"));
        if (newFauna.length) {
          const all = await tx`select key from uncatalogued.firsts where key like 'f:%'`;
          for (const reg of Object.keys(C.D.REGIONS)) {
            const fauna: string[] = C.D.REGIONS[reg].fauna; const have = all.filter((r: { key: string }) => fauna.includes(r.key.slice(2))).length;
            const added = newFauna.filter((k) => fauna.includes(k.slice(2))).length; if (!added) continue;
            for (const th of [50, 80, 100]) if ((have - added) * 100 < th * fauna.length && have * 100 >= th * fauna.length) feed.push({ kind: "milestone", player_name: name, title: C.D.REGIONS[reg].short, detail: `Seekers have now documented ${th}% of its known fauna.`, region: reg, rarity: null });
          }
        }
        for (const f of feed) await tx`insert into uncatalogued.feed ${tx(f)}`;
        const wk = state.weekly?.id != null ? String(state.weekly.id) : null;
        const firstCount = Object.values(state.cat as Record<string, { first?: boolean }>).filter((e) => e.first).length;
        await tx`update uncatalogued.players set state = ${tx.json(state)}, version = version + 1, score = ${C.score(state)}, entries = ${Object.keys(state.cat).length}, firsts = ${firstCount}, weekly_id = ${wk}, weekly_score = ${state.weekly?.best ?? 0}, seen_at = now() where id = ${id}`;
        return { state, results, firsts: won, error: err, id };
      });
      if (result.error === "unknown") return json({ error: "unknown" });
      const withWorld = result.results?.some((r: { report?: unknown }) => r.report) || result.firsts?.length;
      return json({ state: result.state, results: result.results, firsts: result.firsts, error: result.error ?? undefined, world: withWorld ? await world(C, result.id) : undefined });
    }
    return json({ error: "Unknown request" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "The Cabinet did not answer. Try again." }, 500);
  }
});
