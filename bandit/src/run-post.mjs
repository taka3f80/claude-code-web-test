/**
 * Daily: rank sources by Thompson sampling, fetch one fresh item per chosen source,
 * post it to Bluesky, append to data/bsky/posts.json.
 *
 * Env: BSKY_HANDLE, BSKY_APP_PASSWORD (omit either -> dry run), GITHUB_TOKEN (optional).
 * Flags: --dry-run, --force (post even if today's quota is already met).
 */
import { randomUUID } from 'node:crypto';
import { SOURCES } from './sources/index.mjs';
import { makeCtx } from './lib/http.mjs';
import { readJson, writeJson, dateJst } from './lib/store.mjs';
import { emptyState, rankSources } from './lib/bandit.mjs';
import { buildPost } from './lib/text.mjs';
import { login, createPost, postUrl } from './lib/bluesky.mjs';

const args = new Set(process.argv.slice(2));
const handle = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const dryRun = args.has('--dry-run') || process.env.DRY_RUN === '1' || !handle || !password;

const config = readJson('sources.json', { postsPerDay: 2, explorationDays: 7, sources: [] });
const state = readJson('bandit-state.json', emptyState());
const posts = readJson('posts.json', []);
const runs = readJson('runs.json', []);

const now = new Date();
const today = dateJst(now);
const ctx = makeCtx({ now });

const postedToday = posts.filter((p) => p.date === today && !p.dryRun);
if (postedToday.length >= config.postsPerDay && !args.has('--force')) {
  console.log(`[post] quota for ${today} already met (${postedToday.length}/${config.postsPerDay}); nothing to do`);
  process.exit(0);
}

const seen = new Set(posts.map((p) => p.itemId));
const ranking = rankSources({ state, sources: config.sources, posts, today, explorationDays: config.explorationDays });
console.log(`[post] ${today} order=${ranking.order.join(',')} forced=${ranking.forced.join(',') || '-'} draws=${JSON.stringify(ranking.draws)}`);

let session = null;
if (!dryRun) session = await login({ handle, password });
else console.log('[post] DRY RUN: nothing will be posted or recorded');

const run = { date: today, at: now.toISOString(), dryRun, order: ranking.order, forced: ranking.forced, draws: ranking.draws, results: [] };
const newPosts = [];
const remaining = () => config.postsPerDay - postedToday.length - newPosts.length;

for (const sourceId of ranking.order) {
  if (remaining() <= 0) break;
  const cfg = config.sources.find((s) => s.id === sourceId);
  const mod = SOURCES[sourceId];
  if (!mod) { run.results.push({ sourceId, outcome: 'unknown-source' }); continue; }
  if (postedToday.some((p) => p.sourceId === sourceId)) { run.results.push({ sourceId, outcome: 'already-posted-today' }); continue; }

  let candidates;
  try {
    candidates = await mod.fetchCandidates(cfg.params ?? {}, ctx);
  } catch (e) {
    console.warn(`[post] ${sourceId}: fetch failed: ${e.message}`);
    run.results.push({ sourceId, outcome: 'fetch-error', error: e.message.slice(0, 200) });
    continue;
  }
  const item = candidates.find((c) => !seen.has(c.itemId));
  if (!item) { run.results.push({ sourceId, outcome: 'no-fresh-item', candidates: candidates.length }); continue; }

  const { body, url } = mod.format(item, cfg.params ?? {});
  const { text, facets } = buildPost({ body, url });
  console.log(`[post] ${sourceId} -> ${item.itemId}\n${text.replace(/^/gm, '    ')}`);

  const record = {
    id: randomUUID(), date: today, postedAt: now.toISOString(), sourceId, itemId: item.itemId,
    text, url, uri: null, cid: null, postUrl: null, dryRun,
    metrics: null, score: null, reward: null, measuredAt: null,
  };
  if (!dryRun) {
    try {
      const r = await createPost(session, { text, facets, createdAt: new Date().toISOString() });
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
}
console.log(`[post] done: ${newPosts.length} ${dryRun ? 'would-be' : 'new'} post(s)`);
