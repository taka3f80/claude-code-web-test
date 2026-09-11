export const id = 'wikipedia-mostread';
export const name = 'Wikipedia よく読まれた記事';

const SKIP = /^(メインページ|Main Page|特別:|Special:|Wikipedia:|Help:|ファイル:|File:|Portal:|Category:|カテゴリ:)/;

export function selectArticles(feed) {
  const articles = feed?.mostread?.articles ?? [];
  const date = (feed?.mostread?.date ?? '').slice(0, 10);
  return articles
    .filter((a) => a.title && !SKIP.test(a.normalizedtitle ?? a.title))
    .map((a) => ({
      itemId: `wp-${a.title}`,
      title: a.normalizedtitle ?? a.title.replace(/_/g, ' '),
      views: a.views ?? 0,
      date,
      url: a.content_urls?.desktop?.page ?? `https://ja.wikipedia.org/wiki/${encodeURIComponent(a.title)}`,
    }));
}

function ymdPath(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())}`;
}

export async function fetchCandidates({ lang = 'ja' } = {}, ctx) {
  // The featured feed for day D carries "mostread" for D-1. Try today, then yesterday.
  for (const back of [0, 1]) {
    const d = new Date(ctx.now.getTime() - back * 86400000);
    try {
      const feed = await ctx.getJson(`https://${lang}.wikipedia.org/api/rest_v1/feed/featured/${ymdPath(d)}`);
      const items = selectArticles(feed);
      if (items.length) return items;
    } catch (e) {
      if (back === 1) throw e;
    }
  }
  return [];
}

export function format(item) {
  const views = item.views ? `（${item.views.toLocaleString('ja-JP')} views）` : '';
  return { body: `【Wikipedia 昨日よく読まれた記事】${item.title}${views}`, url: item.url };
}
