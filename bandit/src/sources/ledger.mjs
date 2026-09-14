import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../lib/store.mjs';

export const id = 'ledger';
export const name = 'Foreword 台帳（海外で定着・日本で未紹介）';
export const langs = ['ja'];
/** The ledger is curated by hand (gate 1 and gate 3 checked by people), so the LLM kind gate is not applied. */
export const skipKindGate = true;

export const LEDGER_PATH = resolve(REPO_ROOT, 'data/tools/ledger.json');

export function toItems(ledger) {
  return (ledger?.tools ?? [])
    .filter((t) => t.enabled !== false && t.name && t.url)
    .map((t) => ({ itemId: `ledger-${t.id}`, name: t.name, what: t.what ?? '', evidence: t.evidence ?? '', url: t.url }));
}

/** Deterministic: the list order is the posting order. Already-posted items are excluded by the runner. */
export async function fetchCandidates(params = {}, ctx) {
  const raw = ctx?.readLedger ? ctx.readLedger() : readFileSync(LEDGER_PATH, 'utf8');
  return toItems(JSON.parse(raw));
}

/** What the Japanese digest step gets to read. */
export function digestInput(item) {
  return { name: item.name, text: item.what, url: item.url };
}

export function format(item, params = {}, digest = null) {
  if (digest) {
    const mark = item.evidence ? `【${item.evidence}】` : '';
    return { body: `【海外で定着したツール】${digest.name}：${digest.oneLiner}${mark}\n${digest.message}`, url: item.url };
  }
  return { body: `【海外で定着したツール】${item.name}\n${item.what}`, url: item.url };
}
