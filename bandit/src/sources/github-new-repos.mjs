export const id = 'github-new-repos';
export const name = 'GitHub 今週の新規リポジトリ';
/** Post language tags: Japanese framing; content language where it differs. */
export const langs = ['ja', 'en'];

export function toItems(result) {
  return (result?.items ?? []).map((r) => ({
    itemId: `gh-${r.full_name}`,
    fullName: r.full_name,
    description: r.description ?? '',
    stars: r.stargazers_count ?? 0,
    language: r.language ?? null,
    url: r.html_url,
  }));
}

export async function fetchCandidates({ days = 7, minStars = 50 } = {}, ctx) {
  const since = new Date(ctx.now.getTime() - days * 86400000).toISOString().slice(0, 10);
  const q = encodeURIComponent(`created:>${since} stars:>=${minStars}`);
  const headers = { accept: 'application/vnd.github+json' };
  const token = ctx.env?.GITHUB_TOKEN;
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await ctx.getJson(`https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`, { headers });
  return toItems(r);
}

/** What the Japanese digest step gets to read. Nothing else. */
export function digestInput(item) {
  return { name: item.fullName, text: item.description, url: item.url };
}

export function format(item, params = {}, digest = null) {
  const lang = item.language ? ` / ${item.language}` : '';
  if (digest) {
    const stars = item.stars.toLocaleString('en-US');
    return { body: `【海外で話題のツール】${digest.name}：${digest.oneLiner}\n${digest.message}\n公開 1 週間で GitHub ★${stars}${lang}`, url: item.url };
  }
  const desc = item.description ? `\n${item.description}` : '';
  return { body: `【今週生まれたGitHubリポジトリ】${item.fullName} ★${item.stars}${lang}${desc}`, url: item.url };
}
