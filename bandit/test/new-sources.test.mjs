import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toItems as ledgerItems, fetchCandidates as fetchLedger, digestInput as ledgerDigest, format as fmtLedger, skipKindGate } from '../src/sources/ledger.mjs';
import { parseNextData, toItems as fazierItems, fetchCandidates as fetchFazier, format as fmtFazier } from '../src/sources/fazier.mjs';
import { parseFeed, fetchCandidates as fetchConsole, digestInput as consoleDigest, format as fmtConsole } from '../src/sources/console-dev.mjs';
import { SOURCES } from '../src/sources/index.mjs';

const fx = (n) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');

test('ledger: real file loads, all 30 tools enabled with url and evidence, kind gate bypassed', async () => {
  const items = await fetchLedger({}, {});
  assert.equal(items.length, 30);
  for (const i of items) {
    assert.match(i.itemId, /^ledger-[a-z0-9-]+$/);
    assert.match(i.url, /^https:\/\//);
    assert.ok(i.what.length > 20, `${i.name} needs a description`);
  }
  assert.equal(skipKindGate, true);
  assert.deepEqual(ledgerDigest(items[0]), { name: 'Tana', text: items[0].what, url: 'https://tana.inc/' });
});

test('ledger: disabled and malformed entries are skipped; format uses evidence as the mark', () => {
  const items = ledgerItems({ tools: [
    { id: 'a', name: 'A', url: 'https://a', what: 'w', evidence: 'G2 4.7' },
    { id: 'b', name: 'B', url: 'https://b', what: 'w', enabled: false },
    { id: 'c', name: '', url: 'https://c' },
  ] });
  assert.deepEqual(items.map((i) => i.itemId), ['ledger-a']);
  const ja = fmtLedger(items[0], {}, { name: 'A', oneLiner: '何かをする', message: '誰かに向く。' });
  assert.equal(ja.body, '【海外で定着したツール】A：何かをする【G2 4.7】\n誰かに向く。');
  assert.equal(ja.url, 'https://a');
});

test('fazier: parses __NEXT_DATA__, merges lists, filters by upvotes, links to the launch page', async () => {
  const html = fx('fazier.html');
  const data = parseNextData(html);
  assert.ok(Array.isArray(data.props.pageProps.posts));
  const all = fazierItems(data, { minUpvotes: 0 });
  assert.ok(all.length >= 4);
  assert.match(all[0].url, /^https:\/\/fazier\.com\/launches\/[a-z0-9-]+$/);
  assert.ok(all.every((i, n, arr) => n === 0 || arr[n - 1].upvotes >= i.upvotes), 'sorted by upvotes desc');
  const high = fazierItems(data, { minUpvotes: 1000 });
  assert.equal(high.length, 0);
  const viaCtx = await fetchFazier({ minUpvotes: 0 }, { getText: async () => html });
  assert.equal(viaCtx.length, all.length);
  const ja = fmtFazier(all[0], {}, { name: all[0].name, oneLiner: '何か', message: '誰か。' });
  assert.match(ja.body, new RegExp(`【Fazier・${all[0].upvotes}pt】\\n誰か。$`));
  assert.throws(() => parseNextData('<html></html>'), /__NEXT_DATA__/);
});

test('console-dev: parses Tool/Beta items, strips ref param and HTML, keeps kind label', async () => {
  const items = parseFeed(fx('console-dev.xml'));
  assert.equal(items.length, 8);
  assert.equal(items[0].name, 'htmx 4');
  assert.equal(items[0].kindLabel, 'Tool');
  assert.equal(items[0].url, 'https://four.htmx.org');
  assert.match(items[0].description, /^Description: Enhance HTML\. What we like:/);
  assert.equal(items[2].name, 'Copperhead');
  assert.equal(items[2].kindLabel, 'Beta');
  assert.equal(items[2].url, 'https://copperhead.sh');
  const viaCtx = await fetchConsole({}, { getText: async () => fx('console-dev.xml') });
  assert.equal(viaCtx.length, 8);
  assert.deepEqual(consoleDigest(items[2]), { name: 'Copperhead', text: 'Cursor for circuit boards.', url: 'https://copperhead.sh' });
  const ja = fmtConsole(items[2], {}, { name: 'Copperhead', oneLiner: '基板の Cursor', message: '誰か。' });
  assert.equal(ja.body, '【海外で話題のツール】Copperhead：基板の Cursor【Console.dev・Beta】\n誰か。');
});

test('index: the three new sources are registered', () => {
  for (const id of ['ledger', 'fazier', 'console-dev']) assert.ok(SOURCES[id], id);
});
