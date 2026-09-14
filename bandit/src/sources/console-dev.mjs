import { decodeEntities, collapseWs } from '../lib/text.mjs';

export const id = 'console-dev';
export const name = 'Console.dev（開発者ツールの週刊レター）';
export const langs = ['ja', 'en'];

const FEED = 'https://console.dev/rss.xml';

/** Titles look like "Tool: htmx 4" or "Beta: Copperhead". Descriptions are HTML with "Description:" and "What we like:". */
export function parseFeed(xml) {
  const items = [];
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const get = (tag) => {
      const r = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
      return r ? r[1] : '';
    };
    const rawTitle = collapseWs(decodeEntities(get('title')));
    const t = rawTitle.match(/^(Tool|Beta):\s*(.+)$/);
    if (!t) continue;
    const link = get('link').trim().replace(/[?&]ref=console\.dev$/, '');
    if (!link) continue;
    const desc = collapseWs(decodeEntities(get('description').replace(/<[^>]+>/g, ' ')));
    items.push({
      itemId: `console-${link}`,
      name: t[2],
      kindLabel: t[1],
      description: desc,
      url: link,
      pubDate: get('pubDate').trim() || null,
    });
  }
  return items;
}

export async function fetchCandidates(params = {}, ctx) {
  const xml = await ctx.getText(FEED);
  return parseFeed(xml);
}

/** What the Japanese digest step gets to read. Nothing else. */
export function digestInput(item) {
  return { name: item.name, text: item.description, url: item.url };
}

export function format(item, params = {}, digest = null) {
  if (digest) {
    return { body: `【海外で話題のツール】${digest.name}：${digest.oneLiner}【Console.dev・${item.kindLabel}】\n${digest.message}`, url: item.url };
  }
  return { body: `【Console.dev】${item.kindLabel}: ${item.name}\n${item.description}`, url: item.url };
}
