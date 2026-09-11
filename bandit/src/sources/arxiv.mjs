import { decodeEntities, collapseWs } from '../lib/text.mjs';

export const id = 'arxiv';
export const name = 'arXiv 新着';

export function parseArxiv(xml) {
  const out = [];
  for (const chunk of xml.split('<entry>').slice(1)) {
    const idm = chunk.match(/<id>\s*(.*?)\s*<\/id>/);
    const tm = chunk.match(/<title>([\s\S]*?)<\/title>/);
    const pm = chunk.match(/<published>(.*?)<\/published>/);
    if (!idm || !tm) continue;
    const abs = idm[1].replace(/^http:/, 'https:');
    const bare = abs.replace(/v\d+$/, '');
    out.push({
      itemId: `arxiv-${bare.split('/abs/')[1]}`,
      title: collapseWs(decodeEntities(tm[1])),
      url: bare,
      published: pm?.[1] ?? null,
    });
  }
  return out;
}

export async function fetchCandidates({ category = 'cs.AI', max = 10 } = {}, ctx) {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(category)}&sortBy=submittedDate&sortOrder=descending&max_results=${max}`;
  return parseArxiv(await ctx.getText(url));
}

export function format(item, { category = 'cs.AI' } = {}) {
  return { body: `【arXiv ${category} 新着】${item.title}`, url: item.url };
}
