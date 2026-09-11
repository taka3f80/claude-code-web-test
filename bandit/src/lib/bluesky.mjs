const PDS = process.env.BSKY_PDS ?? 'https://bsky.social';
const PUBLIC_API = 'https://public.api.bsky.app';
const UA = 'kazamidori-bot/0.1 (+https://github.com/taka3f80/claude-code-web-test)';

async function xrpc(base, nsid, { method = 'GET', params, body, jwt, fetchImpl = fetch } = {}) {
  const url = new URL(`${base}/xrpc/${nsid}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
    else url.searchParams.set(k, v);
  }
  const headers = { 'user-agent': UA, accept: 'application/json' };
  if (jwt) headers.authorization = `Bearer ${jwt}`;
  if (body) headers['content-type'] = 'application/json';
  const res = await fetchImpl(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${nsid} -> HTTP ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

export async function login({ handle, password, fetchImpl }) {
  const s = await xrpc(PDS, 'com.atproto.server.createSession', {
    method: 'POST', body: { identifier: handle, password }, fetchImpl,
  });
  return { did: s.did, accessJwt: s.accessJwt, handle: s.handle };
}

export async function createPost(session, { text, facets = [], langs = ['ja'], createdAt = new Date().toISOString() }, fetchImpl) {
  const record = { $type: 'app.bsky.feed.post', text, facets, langs, createdAt };
  const r = await xrpc(PDS, 'com.atproto.repo.createRecord', {
    method: 'POST', jwt: session.accessJwt, fetchImpl,
    body: { repo: session.did, collection: 'app.bsky.feed.post', record },
  });
  return { uri: r.uri, cid: r.cid };
}

/** Public, unauthenticated. Up to 25 URIs per call. */
export async function getPosts(uris, fetchImpl) {
  const out = [];
  for (let i = 0; i < uris.length; i += 25) {
    const r = await xrpc(PUBLIC_API, 'app.bsky.feed.getPosts', { params: { uris: uris.slice(i, i + 25) }, fetchImpl });
    out.push(...(r.posts ?? []));
  }
  return out;
}

export async function getProfile(actor, fetchImpl) {
  return xrpc(PUBLIC_API, 'app.bsky.actor.getProfile', { params: { actor }, fetchImpl });
}

export function postUrl(handle, uri) {
  const rkey = uri.split('/').pop();
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}
