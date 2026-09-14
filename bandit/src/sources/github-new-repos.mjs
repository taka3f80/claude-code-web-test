export const id = 'github-new-repos';
export const name = 'GitHub の新しい製品リポジトリ';
/** Post language tags: Japanese framing; content language where it differs. */
export const langs = ['ja', 'en'];

export function toItems(result) {
  return (result?.items ?? []).map((r) => ({
    itemId: `gh-${r.full_name}`,
    fullName: r.full_name,
    description: r.description ?? '',
    stars: r.stargazers_count ?? 0,
    language: r.language ?? null,
    homepage: (r.homepage ?? '').trim() || null,
    url: r.html_url,
  }));
}

/**
 * Params:
 *   days, minStars      created within `days`, at least `minStars`
 *   topics              array of GitHub topics; one search per topic (empty -> one untopic'd search)
 *   requireHomepage     drop repos without a product site (parts rarely have one; products usually do)
 *   perPage             results per query (max 100). Was 10, which starved the backlog.
 * Search API: 10 req/min unauthenticated, 30 with GITHUB_TOKEN. Keep `topics` short.
 * Rationale: docs/research/2026-09-14-source-landscape-worldwide.md 2.2 and 4.4.
 */
export async function fetchCandidates({ days = 7, minStars = 50, topics = [], requireHomepage = false, perPage = 50 } = {}, ctx) {
  const since = new Date(ctx.now.getTime() - days * 86400000).toISOString().slice(0, 10);
  const headers = { accept: 'application/vnd.github+json' };
  const token = ctx.env?.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;

  const queries = (topics.length ? topics : [null]).map((t) =>
    [t && `topic:${t}`, `created:>${since}`, `stars:>=${minStars}`, 'fork:false', 'archived:false'].filter(Boolean).join(' '),
  );
  const byId = new Map();
  for (const q of queries) {
    const r = await ctx.getJson(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${Math.min(100, perPage)}`,
      { headers },
    );
    for (const item of toItems(r)) if (!byId.has(item.itemId)) byId.set(item.itemId, item);
  }
  let items = [...byId.values()];
  if (requireHomepage) items = items.filter((i) => i.homepage);
  return items.sort((a, b) => b.stars - a.stars);
}

/** What the Japanese digest step gets to read. Nothing else. */
export function digestInput(item) {
  return { name: item.fullName, text: item.description, url: item.url };
}

export function format(item, params = {}, digest = null) {
  const lang = item.language ? ` / ${item.language}` : '';
  if (digest) {
    const stars = item.stars.toLocaleString('en-US');
    return { body: `【海外で話題のツール】${digest.name}：${digest.oneLiner}【GitHub・★${stars}】\n${digest.message}`, url: item.url };
  }
  const desc = item.description ? `\n${item.description}` : '';
  return { body: `【今週生まれたGitHubリポジトリ】${item.fullName} ★${item.stars}${lang}${desc}`, url: item.url };
}
