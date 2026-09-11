import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleBeta, rankSources, updateState, emptyState, scoreMetrics } from '../src/lib/bandit.mjs';

function lcg(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return (s + 0.5) / 4294967296; };
}

test('sampleBeta stays in (0,1) and tracks the mean', () => {
  const rng = lcg(7);
  let sum = 0;
  const n = 4000;
  for (let i = 0; i < n; i++) { const x = sampleBeta(8, 2, rng); assert.ok(x > 0 && x < 1); sum += x; }
  assert.ok(Math.abs(sum / n - 0.8) < 0.03, `mean ${sum / n}`);
});

test('updateState tracks alpha/beta and totals', () => {
  const st = emptyState();
  updateState(st, 'a', { success: true, score: 5 });
  updateState(st, 'a', { success: false, score: 0 });
  assert.deepEqual(st.sources.a, { alpha: 2, beta: 2, posts: 2, successes: 1, totalScore: 5 });
  assert.equal(scoreMetrics({ likeCount: 1, repostCount: 1, replyCount: 1, quoteCount: 1 }), 6);
});

test('rankSources forces never-posted and stale sources to the front, oldest first', () => {
  const sources = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd', enabled: false }];
  const posts = [
    { sourceId: 'a', date: '2026-09-10' },
    { sourceId: 'b', date: '2026-09-01' },
  ];
  const st = emptyState();
  const r = rankSources({ state: st, sources, posts, today: '2026-09-11', explorationDays: 7, rng: lcg(1) });
  assert.deepEqual(r.forced, ['c', 'b']);
  assert.deepEqual(r.order, ['c', 'b', 'a']);
  assert.ok(!r.order.includes('d'));
});

test('rankSources prefers the arm with the stronger posterior most of the time', () => {
  const sources = [{ id: 'good' }, { id: 'bad' }];
  const posts = [{ sourceId: 'good', date: '2026-09-10' }, { sourceId: 'bad', date: '2026-09-10' }];
  const st = { version: 1, sources: { good: { alpha: 20, beta: 2 }, bad: { alpha: 2, beta: 20 } } };
  const rng = lcg(3);
  let goodFirst = 0;
  for (let i = 0; i < 200; i++) if (rankSources({ state: st, sources, posts, today: '2026-09-11', rng }).order[0] === 'good') goodFirst++;
  assert.ok(goodFirst > 190, `good first ${goodFirst}/200`);
});

test('onCooldown ignores dry runs and posts older than the window', async () => {
  const { onCooldown } = await import('../src/lib/bandit.mjs');
  const now = new Date('2026-09-11T06:00:00Z');
  const posts = [
    { sourceId: 'a', postedAt: '2026-09-11T02:00:00Z' },
    { sourceId: 'b', postedAt: '2026-09-11T05:00:00Z', dryRun: true },
    { sourceId: 'c', postedAt: '2026-09-10T20:00:00Z' },
  ];
  assert.equal(onCooldown(posts, 'a', now, 6), true);
  assert.equal(onCooldown(posts, 'b', now, 6), false);
  assert.equal(onCooldown(posts, 'c', now, 6), false);
  assert.equal(onCooldown(posts, 'a', now, 3), false);
});
