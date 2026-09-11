/**
 * Daily: for posts older than 24h that have not been measured, fetch engagement
 * from the public API, compute score and reward, update the bandit posteriors.
 * Also snapshots follower count once per day.
 */
import { readJson, writeJson, dateJst } from './lib/store.mjs';
import { emptyState, updateState, scoreMetrics, REWARD_THRESHOLD } from './lib/bandit.mjs';
import { getPosts, getProfile } from './lib/bluesky.mjs';

const MEASURE_AFTER_MS = 24 * 3600 * 1000;
const now = new Date();
const today = dateJst(now);

const posts = readJson('posts.json', []);
const state = readJson('bandit-state.json', emptyState());

const due = posts.filter((p) => p.uri && p.reward === null && now.getTime() - Date.parse(p.postedAt) >= MEASURE_AFTER_MS);
console.log(`[measure] ${due.length} post(s) due`);

if (due.length) {
  const fetched = await getPosts(due.map((p) => p.uri));
  const byUri = new Map(fetched.map((v) => [v.uri, v]));
  for (const p of due) {
    const v = byUri.get(p.uri);
    if (!v) { console.warn(`[measure] ${p.uri} not found (deleted?)`); p.metrics = { missing: true }; p.score = 0; p.reward = 0; p.measuredAt = now.toISOString(); continue; }
    p.metrics = { likeCount: v.likeCount ?? 0, repostCount: v.repostCount ?? 0, replyCount: v.replyCount ?? 0, quoteCount: v.quoteCount ?? 0 };
    p.score = scoreMetrics(p.metrics);
    p.reward = p.score >= REWARD_THRESHOLD ? 1 : 0;
    p.measuredAt = now.toISOString();
    updateState(state, p.sourceId, { success: p.reward === 1, score: p.score });
    console.log(`[measure] ${p.sourceId} ${p.itemId} score=${p.score} reward=${p.reward}`);
  }
  writeJson('posts.json', posts);
  writeJson('bandit-state.json', state);
}

const handle = process.env.BSKY_HANDLE;
if (handle) {
  const history = readJson('profile-history.json', []);
  if (!history.some((h) => h.date === today)) {
    try {
      const prof = await getProfile(handle);
      history.push({ date: today, followers: prof.followersCount ?? 0, follows: prof.followsCount ?? 0, posts: prof.postsCount ?? 0 });
      writeJson('profile-history.json', history.slice(-730));
      console.log(`[measure] followers=${prof.followersCount}`);
    } catch (e) {
      console.warn(`[measure] profile snapshot failed: ${e.message}`);
    }
  }
}
