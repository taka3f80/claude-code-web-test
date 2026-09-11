const UA = 'kazamidori-bot/0.1 (+https://bsky.app/profile/kazamidori-bot.bsky.social; +https://github.com/taka3f80/claude-code-web-test)';

async function request(url, { headers = {}, fetchImpl = fetch, timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { headers: { 'user-agent': UA, ...headers }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function getJson(url, opts = {}) {
  const res = await request(url, { ...opts, headers: { accept: 'application/json', ...(opts.headers ?? {}) } });
  return res.json();
}

export async function getText(url, opts = {}) {
  const res = await request(url, opts);
  return res.text();
}

/** Build the ctx object every source receives. Tests inject their own. */
export function makeCtx({ fetchImpl = fetch, now = new Date(), env = process.env } = {}) {
  return {
    now,
    env,
    getJson: (url, opts = {}) => getJson(url, { ...opts, fetchImpl }),
    getText: (url, opts = {}) => getText(url, { ...opts, fetchImpl }),
  };
}
