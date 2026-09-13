import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseArxiv, format as fmtArxiv } from '../src/sources/arxiv.mjs';
import { selectQuakes, format as fmtQuake } from '../src/sources/jma-quake.mjs';
import { selectArticles, fetchCandidates as fetchWp } from '../src/sources/wikipedia-mostread.mjs';
import { toItem, fetchCandidates as fetchHn, digestInput as hnDigestInput, format as fmtHn } from '../src/sources/hackernews.mjs';
import { toItems, fetchCandidates as fetchGh, digestInput as ghDigestInput, format as fmtGh } from '../src/sources/github-new-repos.mjs';

const fx = (n) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');

test('arxiv: parses entries, strips version, decodes entities', () => {
  const items = parseArxiv(fx('arxiv.xml'));
  assert.equal(items.length, 2);
  assert.equal(items[0].itemId, 'arxiv-2609.01234');
  assert.equal(items[0].url, 'https://arxiv.org/abs/2609.01234');
  assert.equal(items[0].title, 'Bandits & Beyond: A Study of Exploration');
  assert.equal(items[1].itemId, 'arxiv-2609.00001');
  assert.match(fmtArxiv(items[0], { category: 'cs.AI' }).body, /^【arXiv cs\.AI 新着】Bandits/);
});

test('jma-quake: filters by intensity and window, dedupes eid, newest first', () => {
  const now = new Date('2026-09-11T03:00:00Z');
  const list = [
    { eid: 'a', at: '2026-09-11T11:30:00+09:00', anm: '千葉県北西部', mag: '4.2', maxi: '3' },
    { eid: 'a', at: '2026-09-11T11:30:00+09:00', anm: '千葉県北西部', mag: '4.2', maxi: '3' },
    { eid: 'b', at: '2026-09-11T10:00:00+09:00', anm: '宮城県沖', mag: '5.1', maxi: '5-' },
    { eid: 'c', at: '2026-09-11T09:00:00+09:00', anm: '奈良県', mag: '2.0', maxi: '1' },
    { eid: 'd', at: '2026-09-09T09:00:00+09:00', anm: '古い', mag: '6.0', maxi: '6+' },
  ];
  const items = selectQuakes(list, { minIntensity: '3', withinHours: 24, now });
  assert.deepEqual(items.map((i) => i.itemId), ['jma-a', 'jma-b']);
  assert.equal(fmtQuake(items[1]).body, '【地震情報】9/11 10:00 宮城県沖 M5.1 最大震度5-（気象庁発表）');
});

test('wikipedia: skips namespaces and main page; falls back to previous day', async () => {
  const feed = {
    mostread: {
      date: '2026-09-10Z',
      articles: [
        { title: 'メインページ', views: 99999 },
        { title: '特別:検索', views: 5000 },
        { title: 'ある_記事', normalizedtitle: 'ある 記事', views: 1234, content_urls: { desktop: { page: 'https://ja.wikipedia.org/wiki/%E3%81%82%E3%82%8B_%E8%A8%98%E4%BA%8B' } } },
      ],
    },
  };
  const items = selectArticles(feed);
  assert.equal(items.length, 1);
  assert.equal(items[0].itemId, 'wp-ある_記事');
  assert.equal(items[0].title, 'ある 記事');

  const calls = [];
  const ctx = {
    now: new Date('2026-09-11T00:30:00Z'),
    getJson: async (url) => { calls.push(url); if (url.endsWith('2026/09/11')) throw new Error('HTTP 404'); return feed; },
  };
  const got = await fetchWp({ lang: 'ja' }, ctx);
  assert.equal(got.length, 1);
  assert.deepEqual(calls, [
    'https://ja.wikipedia.org/api/rest_v1/feed/featured/2026/09/11',
    'https://ja.wikipedia.org/api/rest_v1/feed/featured/2026/09/10',
  ]);
});

test('hackernews: only stories above minScore, falls back to HN item url', async () => {
  assert.equal(toItem({ id: 1, type: 'comment' }), null);
  const db = {
    'https://hacker-news.firebaseio.com/v0/topstories.json': [10, 11, 12],
    'https://hacker-news.firebaseio.com/v0/item/10.json': { id: 10, type: 'story', title: 'Low', score: 20, url: 'https://x/a' },
    'https://hacker-news.firebaseio.com/v0/item/11.json': { id: 11, type: 'story', title: 'Ask HN: no url', score: 300 },
    'https://hacker-news.firebaseio.com/v0/item/12.json': { id: 12, type: 'story', title: 'High', score: 150, url: 'https://x/c' },
  };
  const items = await fetchHn({ minScore: 100, lookAt: 10 }, { getJson: async (u) => db[u] });
  assert.deepEqual(items.map((i) => i.itemId), ['hn-11', 'hn-12']);
  assert.equal(items[0].url, 'https://news.ycombinator.com/item?id=11');
});

test('github: builds query with since date and token header', async () => {
  let seen;
  const ctx = {
    now: new Date('2026-09-11T00:00:00Z'),
    env: { GITHUB_TOKEN: 't0k' },
    getJson: async (url, opts) => { seen = { url, opts }; return { items: [{ full_name: 'a/b', description: 'd', stargazers_count: 77, language: 'Rust', html_url: 'https://github.com/a/b' }] }; },
  };
  const items = await fetchGh({ days: 7, minStars: 50 }, ctx);
  assert.equal(items[0].itemId, 'gh-a/b');
  assert.match(seen.url, /q=created%3A%3E2026-09-04%20stars%3A%3E%3D50/);
  assert.equal(seen.opts.headers.authorization, 'Bearer t0k');
  assert.deepEqual(toItems(null), []);
});

test('hackernews: show feed, self-text stripped, digest input and Japanese format', async () => {
  const db = {
    'https://hacker-news.firebaseio.com/v0/showstories.json': [20],
    'https://hacker-news.firebaseio.com/v0/item/20.json': { id: 20, type: 'story', title: 'Show HN: Arcade – demos from clicks', score: 40, url: 'https://arcade.software', text: 'Hi HN,<p>we built <a href="x">this</a> &amp; that' },
  };
  const items = await fetchHn({ feed: 'show', minScore: 30, lookAt: 10 }, { getJson: async (u) => db[u] });
  assert.equal(items.length, 1);
  assert.equal(items[0].text, 'Hi HN, we built this & that');
  const di = hnDigestInput(items[0]);
  assert.deepEqual(di, { name: 'Show HN: Arcade – demos from clicks', text: 'Hi HN, we built this & that', url: 'https://arcade.software' });
  const ja = fmtHn(items[0], {}, { name: 'Arcade', oneLiner: 'クリックから製品デモを作る', message: 'デモを撮り直している人向け' });
  assert.equal(ja.body, '【海外で話題のツール】Arcade：クリックから製品デモを作る\nデモを撮り直している人向け\n海外の開発者掲示板 Hacker News で、作った本人が発表して話題');
  assert.equal(ja.url, 'https://arcade.software');
  assert.match(fmtHn(items[0], {}).body, /^【Hacker News トップ】Show HN/);
});

test('github: digest input and Japanese format', () => {
  const [item] = toItems({ items: [{ full_name: 'a/b', description: 'A tiny tool', stargazers_count: 77, language: 'Rust', html_url: 'https://github.com/a/b' }] });
  assert.deepEqual(ghDigestInput(item), { name: 'a/b', text: 'A tiny tool', url: 'https://github.com/a/b' });
  const ja = fmtGh(item, {}, { name: 'b', oneLiner: '小さな道具', message: '道具が好きな人向け' });
  assert.equal(ja.body, '【海外で話題のツール】b：小さな道具\n道具が好きな人向け\n公開 1 週間で GitHub ★77 / Rust');
});
