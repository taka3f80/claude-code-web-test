export const id = 'hackernews';
export const name = 'Hacker News トップ';

const BASE = 'https://hacker-news.firebaseio.com/v0';

export function toItem(story) {
  if (!story || story.type !== 'story' || !story.title) return null;
  return {
    itemId: `hn-${story.id}`,
    title: story.title,
    score: story.score ?? 0,
    url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
  };
}

export async function fetchCandidates({ minScore = 100, lookAt = 10 } = {}, ctx) {
  const ids = await ctx.getJson(`${BASE}/topstories.json`);
  const out = [];
  for (const sid of ids.slice(0, lookAt)) {
    const item = toItem(await ctx.getJson(`${BASE}/item/${sid}.json`));
    if (item && item.score >= minScore) out.push(item);
  }
  return out;
}

export function format(item) {
  return { body: `【Hacker News トップ】${item.title}（${item.score} points）`, url: item.url };
}
