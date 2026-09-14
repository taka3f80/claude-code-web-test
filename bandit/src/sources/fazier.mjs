export const id = 'fazier';
export const name = 'Fazier（海外のローンチ掲示板）';
export const langs = ['ja', 'en'];

const HOME = 'https://fazier.com/';

/**
 * Fazier has no public API. The home page embeds a Next.js JSON blob (script#__NEXT_DATA__) with
 * pageProps.posts (today's launches), weeklyPosts and monthlyPosts, each carrying name, tagline,
 * slug, launch_date, upvotes_count. robots.txt allows "/" and disallows only /launch/, /admin/ etc.
 * This is HTML scraping by the brief's definition: expect breakage when they redeploy.
 * Rationale: docs/research/2026-09-14-source-landscape-worldwide.md 2.1.
 */
export function parseNextData(html) {
  const m = String(html).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('fazier: __NEXT_DATA__ not found (page structure changed?)');
  return JSON.parse(m[1]);
}

/** `posts` is grouped by day ([{ date, posts: [...] }]); weeklyPosts / monthlyPosts are flat. Flatten both shapes. */
function flatten(list) {
  const out = [];
  for (const e of list ?? []) {
    if (e && Array.isArray(e.posts)) out.push(...e.posts);
    else if (e) out.push(e);
  }
  return out;
}

export function toItems(nextData, { minUpvotes = 20 } = {}) {
  const pp = nextData?.props?.pageProps ?? {};
  const byId = new Map();
  for (const list of [pp.posts, pp.weeklyPosts, pp.monthlyPosts]) {
    for (const p of flatten(list)) {
      if (!p || p.is_published === false || !p.name || !p.slug) continue;
      if ((p.upvotes_count ?? 0) < minUpvotes) continue;
      if (p.category_type && p.category_type !== 'Products') continue;
      if (!byId.has(p.id)) byId.set(p.id, {
        itemId: `fazier-${p.id}`,
        name: p.name,
        tagline: p.tagline ?? '',
        upvotes: p.upvotes_count ?? 0,
        launchDate: p.launch_date ?? null,
        pricing: p.pricing_type ?? null,
        url: `https://fazier.com/launches/${p.slug}`,
      });
    }
  }
  return [...byId.values()].sort((a, b) => b.upvotes - a.upvotes);
}

export async function fetchCandidates({ minUpvotes = 20 } = {}, ctx) {
  const html = await ctx.getText(HOME);
  return toItems(parseNextData(html), { minUpvotes });
}

/** What the Japanese digest step gets to read. Nothing else. */
export function digestInput(item) {
  return { name: item.name, text: item.tagline, url: item.url };
}

export function format(item, params = {}, digest = null) {
  if (digest) {
    return { body: `【海外で話題のツール】${digest.name}：${digest.oneLiner}【Fazier・${item.upvotes}pt】\n${digest.message}`, url: item.url };
  }
  return { body: `【Fazier】${item.name}: ${item.tagline}（${item.upvotes} upvotes）`, url: item.url };
}
