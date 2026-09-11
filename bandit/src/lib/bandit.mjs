/**
 * Thompson sampling over sources with Beta(alpha, beta) posteriors.
 * Reward is Bernoulli: 1 if a post scored at or above REWARD_THRESHOLD, else 0.
 */
export const REWARD_THRESHOLD = 1;

export function scoreMetrics(m) {
  return (m.likeCount ?? 0) + 2 * (m.repostCount ?? 0) + 2 * (m.replyCount ?? 0) + (m.quoteCount ?? 0);
}

// Marsaglia & Tsang gamma sampler; works for shape >= 1, boosted for shape < 1.
function sampleGamma(shape, rng) {
  if (shape < 1) return sampleGamma(shape + 1, rng) * Math.pow(rng(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do {
      x = gaussian(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

function gaussian(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function sampleBeta(alpha, beta, rng = Math.random) {
  const a = sampleGamma(alpha, rng);
  const b = sampleGamma(beta, rng);
  return a / (a + b);
}

export function emptyState() {
  return { version: 1, sources: {} };
}

export function armOf(state, id) {
  if (!state.sources[id]) state.sources[id] = { alpha: 1, beta: 1, posts: 0, successes: 0, totalScore: 0 };
  return state.sources[id];
}

export function updateState(state, id, { success, score }) {
  const arm = armOf(state, id);
  if (success) arm.alpha += 1; else arm.beta += 1;
  arm.posts += 1;
  if (success) arm.successes += 1;
  arm.totalScore += score;
  return arm;
}

/** Days between two YYYY-MM-DD strings. */
function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

/**
 * Return enabled source ids in the order they should be tried today.
 * Sources not posted for `explorationDays` or never posted are forced to the front
 * (oldest first), so every arm keeps getting sampled. The rest are ranked by a
 * Thompson draw from their posteriors.
 */
export function rankSources({ state, sources, posts, today, explorationDays = 7, rng = Math.random }) {
  const enabled = sources.filter((s) => s.enabled !== false);
  const lastPosted = new Map();
  for (const p of posts) {
    if (p.dryRun) continue;
    const prev = lastPosted.get(p.sourceId);
    if (!prev || p.date > prev) lastPosted.set(p.sourceId, p.date);
  }
  const forced = [];
  const sampled = [];
  for (const s of enabled) {
    const last = lastPosted.get(s.id);
    const stale = !last || daysBetween(last, today) >= explorationDays;
    if (stale) {
      forced.push({ id: s.id, key: last ? daysBetween(last, today) : Infinity });
    } else {
      const arm = armOf(state, s.id);
      sampled.push({ id: s.id, key: sampleBeta(arm.alpha, arm.beta, rng) });
    }
  }
  forced.sort((x, y) => y.key - x.key);
  sampled.sort((x, y) => y.key - x.key);
  return {
    order: [...forced.map((f) => f.id), ...sampled.map((s) => s.id)],
    forced: forced.map((f) => f.id),
    draws: Object.fromEntries(sampled.map((s) => [s.id, Number(s.key.toFixed(4))])),
  };
}

/** True if the source posted (for real) within the last `hours`. */
export function onCooldown(posts, sourceId, now, hours) {
  const since = now.getTime() - hours * 3600 * 1000;
  return posts.some((p) => !p.dryRun && p.sourceId === sourceId && Date.parse(p.postedAt) >= since);
}
