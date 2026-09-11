export const id = 'jma-quake';
export const name = '気象庁 地震情報';

const INTENSITY = { 1: 1, 2: 2, 3: 3, 4: 4, '5-': 5, '5+': 6, '6-': 7, '6+': 8, 7: 9 };
const LIST_URL = 'https://www.jma.go.jp/bosai/quake/data/list.json';
const MAP_URL = 'https://www.jma.go.jp/bosai/map.html#contents=earthquake_map';

export function selectQuakes(list, { minIntensity = '3', withinHours = 24, now = new Date() } = {}) {
  const minRank = INTENSITY[minIntensity] ?? 3;
  const since = now.getTime() - withinHours * 3600 * 1000;
  const seen = new Set();
  return list
    .filter((q) => q.at && q.anm && q.maxi && (INTENSITY[q.maxi] ?? 0) >= minRank)
    .filter((q) => Date.parse(q.at) >= since)
    .filter((q) => (seen.has(q.eid) ? false : (seen.add(q.eid), true)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((q) => ({ itemId: `jma-${q.eid}`, at: q.at, place: q.anm, mag: q.mag, maxi: q.maxi, url: MAP_URL }));
}

export async function fetchCandidates(params = {}, ctx) {
  const list = await ctx.getJson(LIST_URL);
  return selectQuakes(Array.isArray(list) ? list : [], { ...params, now: ctx.now });
}

function fmtTime(iso) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

export function format(item) {
  const mag = item.mag && item.mag !== '' ? ` M${item.mag}` : '';
  return { body: `【地震情報】${fmtTime(item.at)} ${item.place}${mag} 最大震度${item.maxi}（気象庁発表）`, url: item.url };
}
