const seg = new Intl.Segmenter('ja', { granularity: 'grapheme' });
const enc = new TextEncoder();

export function graphemeLength(s) {
  let n = 0;
  for (const _ of seg.segment(s)) n++;
  return n;
}

export function truncateGraphemes(s, max, ellipsis = '…') {
  if (graphemeLength(s) <= max) return s;
  const keep = Math.max(0, max - graphemeLength(ellipsis));
  let out = '';
  let n = 0;
  for (const { segment } of seg.segment(s)) {
    if (n >= keep) break;
    out += segment;
    n++;
  }
  return out.trimEnd() + ellipsis;
}

export function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&');
}

export function collapseWs(s) {
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Compose a Bluesky post: body text plus a trailing URL rendered as a link facet.
 * Keeps the whole post within `maxGraphemes` by truncating the body, never the URL.
 */
export function buildPost({ body, url, maxGraphemes = 300 }) {
  const tail = url ? `\n${url}` : '';
  const budget = maxGraphemes - graphemeLength(tail);
  const text = truncateGraphemes(body, budget) + tail;
  const facets = [];
  if (url) {
    const byteStart = enc.encode(text).length - enc.encode(url).length;
    facets.push({
      index: { byteStart, byteEnd: byteStart + enc.encode(url).length },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }],
    });
  }
  return { text, facets };
}
