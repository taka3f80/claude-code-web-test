import test from 'node:test';
import assert from 'node:assert/strict';
import { digestJa, buildDigestRequest, parseDigestResponse } from '../src/lib/digest.mjs';

const okResponse = (obj) => ({
  ok: true,
  status: 200,
  json: async () => ({ output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(obj) }] }] }),
  text: async () => '',
});

test('buildDigestRequest: model, strict schema, and the source text go into the body', () => {
  const body = buildDigestRequest({ name: 'a/b', text: 'A tiny tool that does X', url: 'https://x/a' }, { model: 'gpt-test' });
  assert.equal(body.model, 'gpt-test');
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.text.format.strict, true);
  assert.equal(body.text.format.schema.additionalProperties, false);
  assert.deepEqual(body.text.format.schema.required, ['name', 'oneLiner', 'message', 'kind']);
  assert.deepEqual(body.text.format.schema.properties.kind.enum, ['サービス・アプリ', 'ライブラリ・部品', '読み物・作品', 'その他']);
  const user = body.input.find((m) => m.role === 'user').content;
  assert.match(user, /a\/b/);
  assert.match(user, /A tiny tool that does X/);
  assert.match(user, /https:\/\/x\/a/);
});

test('parseDigestResponse: reads output_text JSON, rejects empty or missing fields', () => {
  const good = { output: [{ type: 'message', content: [{ type: 'output_text', text: '{"name":"Arcade","oneLiner":"クリックした画面を対話型デモにする。","message":"デモを撮り直している人は一度見てみてください！","kind":"サービス・アプリ"}' }] }] };
  assert.deepEqual(parseDigestResponse(good), { name: 'Arcade', oneLiner: 'クリックした画面を対話型デモにする', message: 'デモを撮り直している人は一度見てみてください。', kind: 'サービス・アプリ' });
  const withPeriod = { output: [{ type: 'message', content: [{ type: 'output_text', text: '{"name":"x","oneLiner":"y","message":"二文です。締めです。","kind":"その他"}' }] }] };
  assert.equal(parseDigestResponse(withPeriod).message, '二文です。締めです。');
  const unknownKind = { output: [{ type: 'message', content: [{ type: 'output_text', text: '{"name":"x","oneLiner":"y","message":"z","kind":"変な値"}' }] }] };
  assert.equal(parseDigestResponse(unknownKind).kind, 'その他');
  assert.throws(() => parseDigestResponse({ output: [] }), /no output_text/);
  assert.throws(() => parseDigestResponse({ output: [{ type: 'message', content: [{ type: 'output_text', text: '{"name":"x","oneLiner":"y","message":"","kind":"その他"}' }] }] }), /empty/);
});

test('digestJa: sends bearer key, returns the digest, throws on HTTP error or missing key', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return okResponse({ name: 'Arcade', oneLiner: 'クリックした画面をそのまま対話型の製品デモにする', message: 'デモ動画を撮り直している人向け', kind: 'サービス・アプリ' });
  };
  const d = await digestJa({ name: 'Arcade', text: 'Show HN: Arcade – turn clicks into interactive demos', url: 'https://arcade.software' }, { apiKey: 'sk-test', model: 'gpt-test', fetchImpl });
  assert.equal(d.oneLiner, 'クリックした画面をそのまま対話型の製品デモにする');
  assert.equal(d.kind, 'サービス・アプリ');
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].init.headers.authorization, 'Bearer sk-test');
  assert.equal(JSON.parse(calls[0].init.body).model, 'gpt-test');

  await assert.rejects(
    () => digestJa({ name: 'x', text: 'y', url: 'https://z' }, { apiKey: 'k', model: 'm', fetchImpl: async () => ({ ok: false, status: 429, text: async () => 'rate limited', json: async () => ({}) }) }),
    /HTTP 429/,
  );
  await assert.rejects(() => digestJa({ name: 'x', text: 'y', url: 'https://z' }, { apiKey: '', model: 'm', fetchImpl }), /OPENAI_API_KEY/);
});
