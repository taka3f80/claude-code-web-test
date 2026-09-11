/** Weekly: summarize the last N days per source into data/bsky/reports/<date>.md */
import { readJson, writeText, dateJst } from './lib/store.mjs';
import { emptyState } from './lib/bandit.mjs';
import { SOURCES } from './sources/index.mjs';

const days = Number(process.argv[2] ?? 7);
const now = new Date();
const today = dateJst(now);
const since = dateJst(new Date(now.getTime() - days * 86400000));

const posts = readJson('posts.json', []).filter((p) => !p.dryRun);
const state = readJson('bandit-state.json', emptyState());
const config = readJson('sources.json', { sources: [] });
const runs = readJson('runs.json', []).filter((r) => r.date > since && !r.dryRun);
const profile = readJson('profile-history.json', []);

const recent = posts.filter((p) => p.date > since);
const lines = [];
lines.push(`# Bluesky source bandit: ${since} → ${today}`, '');

const first = profile.find((h) => h.date > since);
const last = profile.at(-1);
if (first && last) lines.push(`Followers: ${first.followers} → ${last.followers} (${last.followers - first.followers >= 0 ? '+' : ''}${last.followers - first.followers})`, '');

lines.push('| source | posts (window) | measured | success rate | avg score | alpha/beta | mean |', '|---|---:|---:|---:|---:|---|---:|');
for (const s of config.sources) {
  const arm = state.sources[s.id] ?? { alpha: 1, beta: 1 };
  const mine = recent.filter((p) => p.sourceId === s.id);
  const measured = mine.filter((p) => p.reward !== null);
  const succ = measured.filter((p) => p.reward === 1).length;
  const avg = measured.length ? (measured.reduce((a, p) => a + p.score, 0) / measured.length).toFixed(2) : '-';
  const rate = measured.length ? `${Math.round((100 * succ) / measured.length)}%` : '-';
  const mean = (arm.alpha / (arm.alpha + arm.beta)).toFixed(3);
  const name = SOURCES[s.id]?.name ?? s.id;
  lines.push(`| ${name}${s.enabled === false ? ' (off)' : ''} | ${mine.length} | ${measured.length} | ${rate} | ${avg} | ${arm.alpha}/${arm.beta} | ${mean} |`);
}
lines.push('');

const top = recent.filter((p) => p.reward !== null).sort((a, b) => b.score - a.score).slice(0, 5);
if (top.length) {
  lines.push('## Top posts', '');
  for (const p of top) lines.push(`- [${p.score}] ${p.sourceId}: ${p.text.split('\n')[0]} ${p.postUrl ?? ''}`);
  lines.push('');
}

const problems = runs.flatMap((r) => r.results.filter((x) => x.outcome.endsWith('-error')).map((x) => `${r.date} ${x.sourceId}: ${x.outcome} ${x.error ?? ''}`));
if (problems.length) lines.push('## Errors', '', ...problems.map((p) => `- ${p}`), '');

const md = lines.join('\n') + '\n';
writeText(`reports/${today}.md`, md);
process.stdout.write(md);
