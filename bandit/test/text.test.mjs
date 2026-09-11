import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPost, graphemeLength, truncateGraphemes } from '../src/lib/text.mjs';

test('graphemes count emoji and CJK as single units', () => {
  assert.equal(graphemeLength('日本語👨‍👩‍👧'), 4);
  assert.equal(truncateGraphemes('あいうえお', 3), 'あい…');
  assert.equal(truncateGraphemes('short', 10), 'short');
});

test('buildPost keeps the URL intact, truncates body, sets byte-accurate facet', () => {
  const url = 'https://example.com/あ';
  const body = 'x'.repeat(400);
  const { text, facets } = buildPost({ body, url, maxGraphemes: 300 });
  assert.equal(graphemeLength(text), 300);
  assert.ok(text.endsWith('\n' + url));
  const bytes = new TextEncoder().encode(text);
  const f = facets[0].index;
  assert.equal(new TextDecoder().decode(bytes.slice(f.byteStart, f.byteEnd)), url);
  assert.equal(facets[0].features[0].uri, url);
});

test('buildPost without url has no facets', () => {
  assert.deepEqual(buildPost({ body: 'hi' }), { text: 'hi', facets: [] });
});
