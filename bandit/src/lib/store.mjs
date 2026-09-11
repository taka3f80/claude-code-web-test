import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const DATA_DIR = resolve(REPO_ROOT, 'data/bsky');

export function readJson(name, fallback) {
  const p = resolve(DATA_DIR, name);
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, 'utf8'));
}

export function writeJson(name, value) {
  const p = resolve(DATA_DIR, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
}

export function writeText(name, value) {
  const p = resolve(DATA_DIR, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, value);
}

/** YYYY-MM-DD in JST for a given instant. */
export function dateJst(now = new Date()) {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
