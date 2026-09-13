import { decodeEntities, collapseWs } from '../lib/text.mjs';

export const id = 'hackernews';
export const name = 'Hacker News トップ';
/** Post language tags: Japanese framing; content language where it differs. */
export const langs = ['ja', 'en'];

const BASE = 'https://hacker-news.firebaseio.com/v0';
const FEEDS = { top: 'topstories', show: 'showstories' };

function stripHtml(s) {
  return collapseWs(decodeEntities(String(s ?? '').replace(/<p>/gi, ' ').replace(/<[^>]+>/g, '')));
}

export function toItem(story) {
  if (!story || story.type !== 'story' || !story.title) return null;
  return {
    itemId: `hn-${story.id}`,
    title: story.title,
    text: stripHtml(story.text),
    score: story.score ?? 0,
    url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
  };
}

/** `feed`: 'top' (front page) or 'show' (Show HN, new tools people built). */
export async function fetchCandidates({ feed = 'top', minScore = 100, lookAt = 10 } = {}, ctx) {
  const ids = await ctx.getJson(`${BASE}/${FEEDS[feed] ?? FEEDS.top}.json`);
  const out = [];
  for (const sid of ids.slice(0, lookAt)) {
    const item = toItem(await ctx.getJson(`${BASE}/item/${sid}.json`));
    if (item && item.score >= minScore) out.push(item);
  }
  return out;
}

/** What the Japanese digest step gets to read. Nothing else. */
export function digestInput(item) {
  return { name: item.title, text: item.text, url: item.url };
}

export function format(item, params = {}, digest = null) {
  if (digest) {
    const origin = /^show hn/i.test(item.title)
      ? '海外の開発者掲示板 Hacker News で、作った本人が発表して話題'
      : '海外の開発者掲示板 Hacker News で今日話題';
    return { body: `【海外で話題のツール】${digest.name}：${digest.oneLiner}\n${digest.message}\n${origin}`, url: item.url };
  }
  return { body: `【Hacker News トップ】${item.title}（${item.score} points）`, url: item.url };
}
