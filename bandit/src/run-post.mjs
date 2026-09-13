/**
 * Daily: rank sources by Thompson sampling, fetch one fresh item per chosen source,
 * post it to Bluesky, append to data/bsky/posts.json.
 *
 * Env: BSKY_HANDLE, BSKY_APP_PASSWORD (omit either -> dry run), GITHUB_TOKEN (optional),
 *      OPENAI_API_KEY (required for real posts when `digest.enabled`; dry run prints the English text without it).
 * Flags: --dry-run, --force (post even if today's quota is already met).
 * Runs several times a day; each run posts up to `postsPerRun`, capped by `postsPerDay`,
 * and a source is skipped while inside its `perSourceMinHours` cooldown.
 * With `digest.enabled`, a source that exports `digestInput` gets a Japanese one-liner from
 * the OpenAI API before posting; if that call fails the item is skipped, never posted in English.
 */
import { randomUUID } from 'node:crypto';
import { SOURCES } from './sources/index.mjs';
import { makeCtx } from './lib/http.mjs';
import { readJson, writeJson, dateJst } from './lib/store.mjs';
import { emptyState, rankSources, onCooldown } from './lib/bandit.mjs';
import { buildPost } from './lib/text.mjs';
import { login, createPost, postUrl } from './lib/bluesky.mjs';
import { digestJa, DEFAULT_MODEL, POSTABLE_KIND } from './lib/digest.mjs';

const args = new Set(process.argv.slice(2));
const handle = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const missing = [!handle && 'BSKY_HANDLE', !password && 'BSKY_APP_PASSWORD'].filter(Boolean);
const dryRun = args.has('--dry-run') || process.env.DRY_RUN === '1' || missing.length > 0;

const config = { postsPerRun: 1, postsPerDay: 6, perSourceMinHours: 6, explorationDays: 3, sources: [], digest: { enabled: false }, ...readJson('sources.json', {}) };
const digestCfg = { enabled: false, model: DEFAULT_MODEL, ...config.digest };
const openaiKey = process.env.OPENAI_API_KEY;
const state = readJson('bandit-state.json', emptyState());
const posts = readJson('posts.json', []);
const runs = readJson('runs.json', []);

const now = new Date();
const today = dateJst(now);
const ctx = makeCtx({ now });

const postedToday = posts.filter((p) => p.date === today && !p.dryRun);
if (!dryRun && postedToday.length >= config.postsPerDay && !args.has('--force')) {
  console.log(`[post] quota for ${today} already met (${postedToday.length}/${config.postsPerDay}); nothing to do`);
  process.exit(0);
}

// Items the digest classified as not-a-service are remembered in skipped.json so they are never digested twice.
const skippedLog = readJson('skipped.json', []);
const seen = new Set([...posts.map((p) => p.itemId), ...skippedLog.map((s) => s.itemId)]);
const skipped = [];
const ranking = rankSources({ state, sources: config.sources, posts, today, explorationDays: config.explorationDays });
console.log(`[post] ${today} order=${ranking.order.join(',')} forced=${ranking.forced.join(',') || '-'} draws=${JSON.stringify(ranking.draws)}`);

let session = null;
if (!dryRun) session = await login({ handle, password });
else {
  console.log('[post] DRY RUN: nothing will be posted or recorded; every enabled source is tried so all templates can be checked');
  if (missing.length) console.warn(`[post] WARNING: missing secret(s): ${missing.join(', ')} -> scheduled runs will not post until set`);
}

const run = { date: today, at: now.toISOString(), dryRun, order: ranking.order, forced: ranking.forced, draws: ranking.draws, results: [] };
const newPosts = [];
const remaining = () => (dryRun ? Infinity : Math.min(config.postsPerRun, config.postsPerDay - postedToday.length) - newPosts.length);

for (const sourceId of ranking.order) {
  if (remaining() <= 0) break;
  const cfg = config.sources.find((s) => s.id === sourceId);
  const mod = SOURCES[sourceId];
  if (!mod) { run.results.push({ sourceId, outcome: 'unknown-source' }); continue; }
  if (!dryRun && onCooldown(posts, sourceId, now, config.perSourceMinHours)) { console.log(`[post] ${sourceId}: cooldown`); run.results.push({ sourceId, outcome: 'cooldown' }); continue; }

  let candidates;
  try {
    candidates = await mod.fetchCandidates(cfg.params ?? {}, ctx);
  } catch (e) {
    console.warn(`[post] ${sourceId}: fetch failed: ${e.message}`);
    run.results.push({ sourceId, outcome: 'fetch-error', error: e.message.slice(0, 200) });
    continue;
  }
  const item = candidates.find((c) => !seen.has(c.itemId));
  if (!item) {
    console.log(`[post] ${sourceId}: no fresh item (${candidates.length} candidate(s), all posted before or none available)`);
    run.results.push({ sourceId, outcome: 'no-fresh-item', candidates: candidates.length });
    continue;
  }

  let digest = null;
  if (digestCfg.enabled && typeof mod.digestInput === 'function') {
    if (!openaiKey && dryRun) {
      console.warn(`[post] ${sourceId}: DRY RUN without OPENAI_API_KEY -> showing the English template; a real run would skip this item`);
    } else {
      try {
        digest = await digestJa(mod.digestInput(item), { apiKey: openaiKey, model: digestCfg.model });
        console.log(`[post] ${sourceId}: digest ok (${digestCfg.model}) kind=${digest.kind}`);
      } catch (e) {
        console.warn(`[post] ${sourceId}: digest failed, skipping item: ${e.message}`);
        run.results.push({ sourceId, outcome: 'digest-error', itemId: item.itemId, error: e.message.slice(0, 200) });
        continue;
      }
      if (digest.kind !== POSTABLE_KIND) {
        // Gate 1: only services/apps a reader can sign up for today. What was dropped is logged so the gate can be audited.
        console.log(`[post] ${sourceId}: kind-skip (${digest.kind}) ${item.itemId} ${digest.name}: ${digest.oneLiner}`);
        run.results.push({ sourceId, outcome: 'kind-skip', itemId: item.itemId, kind: digest.kind, name: digest.name, oneLiner: digest.oneLiner });
        seen.add(item.itemId);
        skipped.push({ itemId: item.itemId, sourceId, kind: digest.kind, at: now.toISOString() });
        continue;
      }
    }
  }

  const { body, url } = mod.format(item, cfg.params ?? {}, digest);
  const { text, facets } = buildPost({ body, url });
  console.log(`[post] ${sourceId} -> ${item.itemId}\n${text.replace(/^/gm, '    ')}`);

  const record = {
    id: randomUUID(), date: today, postedAt: now.toISOString(), sourceId, itemId: item.itemId,
    text, url, uri: null, cid: null, postUrl: null, dryRun,
    digest: digest ? { ...digest, model: digestCfg.model } : null,
    metrics: null, score: null, reward: null, measuredAt: null,
  };
  if (!dryRun) {
    try {
      const r = await createPost(session, { text, facets, langs: mod.langs ?? ['ja'], createdAt: new Date().toISOString() });
      record.uri = r.uri; record.cid = r.cid; record.postUrl = postUrl(session.handle, r.uri);
    } catch (e) {
      console.warn(`[post] ${sourceId}: createPost failed: ${e.message}`);
      run.results.push({ sourceId, outcome: 'post-error', error: e.message.slice(0, 200) });
      continue;
    }
  }
  newPosts.push(record);
  seen.add(item.itemId);
  run.results.push({ sourceId, outcome: dryRun ? 'dry-run' : 'posted', itemId: item.itemId });
}

if (!dryRun) {
  writeJson('posts.json', [...posts, ...newPosts]);
  writeJson('runs.json', [...runs, run].slice(-365));
  if (skipped.length) writeJson('skipped.json', [...skippedLog, ...skipped]);
}
console.log(`[post] done: ${newPosts.length} ${dryRun ? 'would-be' : 'new'} post(s)`);
