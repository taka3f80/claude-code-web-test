/**
 * Japanese one-line digest plus a one-line hook for a foreign tool/service, via the OpenAI Responses API.
 *
 * Rules baked into the prompt (mirrors docs/BUSINESS.md 8):
 *  - oneLiner: only what the given title/description says; no praise, no guessing, no numbers not in the source
 *  - message: a viewpoint is allowed (who it is for, when it is worth a try) but no new facts or evaluations
 *  - `name` is the product name as written in the source (Latin letters kept as-is)
 */

const ENDPOINT = 'https://api.openai.com/v1/responses';
export const DEFAULT_MODEL = 'gpt-5.4-mini';

const SYSTEM = [
  '海外のツールやサービスを、日本語の読者に短く紹介する編集者です。Bluesky の投稿に使います。',
  '与えられた題名と説明文から、次の 3 つを JSON で返します。',
  '',
  'name: 製品・サービス名。元の表記のまま（英字は英字のまま）。「Show HN:」やリポジトリの所有者名など、名前でない部分は外す。',
  '',
  'oneLiner: 何をするものかを一目で分かる短い言葉で。投稿の 1 行目「名前：ここ」に入る看板。',
  '- 20 文字前後、読点なし。「〜になる」「〜を作る」のような終止形か体言止め。「。」は付けない。',
  '- 説明文に無い機能・数字・評価（「便利」「高速」「人気」など）を足さない。',
  '- 何のツールか説明文から分からないときは、題名の直訳だけを書く。',
  '',
  'message: 投稿の 2 行目。1 行目とは独立した説明文として読めるように、2 文で書く。',
  '- 1 文目: 誰に向くか、何ができるか（説明文にある事実だけ）。2 文目: どう楽になるか、どんな場面で試す価値があるか（ここは視点を足してよい）。',
  '- 合計 70〜90 文字。読者に話しかける口調で、押しつけず、しかし背中を押す。「〜している人は一度これで。」のような締めでよい。',
  '- 説明文に無い事実（機能、数字、実績、他社との比較）は書かない。絵文字、感嘆符、「！」は使わない。',
  '- 各文は必ず「。」で終える。',
  '- 説明文が薄くて誰向けか言えないときは、題名から分かる範囲で書き、2 文目は「〜が気になる人向けです。」のように短く締める。',
  '',
  'kind: これが何かの分類。次の 4 つから 1 つ。判断の軸は「使う人がプログラムを書かずに、自分の仕事や生活に今日使えるか」。',
  '- サービス・アプリ: 個人や小さなチームが今日申し込んで（またはインストールして）使える完成品。Web サービス、デスクトップやスマホのアプリ、ブラウザ拡張、セルフホストできる完成品（例: ファイル 1 つで動くオフィススイート、ノートアプリ、ヘルプデスク、CRM、画面録画ツール）。',
  '- ライブラリ・部品: 開発者がコードから組み込んで使うもの。ライブラリ、フレームワーク、SDK、API ゲートウェイ、モデル、パッチ、ドライバ、データセット、CLI だけの開発者向けツール。',
  '- 読み物・作品: 記事、論文、トリビア、ゲーム、アート、技術デモ（「〜を可視化するデモ」「〜を試せるページ」）、ジョーク、個人の実験作。仕事や生活の道具として使い続ける想定が無いもの。',
  '- その他: 上のどれでもないもの、ハードウェアの発表、企業や政治のニュース。',
  '迷ったら「サービス・アプリ」以外を選ぶ。ただし「使う人が非開発者でも使える完成品」なら、セルフホストや OSS であってもサービス・アプリにする。',
].join('\n');

/** Gate 1 of docs/research/2026-09-13-source-landscape.md: only the first kind is posted. */
export const KINDS = ['サービス・アプリ', 'ライブラリ・部品', '読み物・作品', 'その他'];
export const POSTABLE_KIND = KINDS[0];

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: '製品・サービス名。元の表記のまま' },
    oneLiner: { type: 'string', description: '何をするものかの日本語一文。説明文にある内容だけ' },
    message: { type: 'string', description: '読者に向けた一言。視点は足してよいが事実は足さない' },
    kind: { type: 'string', enum: KINDS, description: 'これが何か。サービス・アプリ以外は投稿しない' },
  },
  required: ['name', 'oneLiner', 'message', 'kind'],
  additionalProperties: false,
};

export function buildDigestRequest({ name, text, url }, { model = DEFAULT_MODEL } = {}) {
  const user = ['名前: ' + name, '説明: ' + (text || '(なし)'), 'URL: ' + url].join('\n');
  return {
    model,
    input: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: user },
    ],
    text: { format: { type: 'json_schema', name: 'tool_digest_ja', schema: SCHEMA, strict: true } },
    max_output_tokens: 400,
  };
}

const clean = (v) => String(v ?? '').trim().replace(/[。！!]+$/, '');
/** Line 2 is a standalone sentence pair: always ends with 「。」 (タカさん, 2026-09-14). */
const sentence = (v) => { const s = clean(v); return s ? s + '。' : ''; };

export function parseDigestResponse(res) {
  const texts = [];
  for (const o of res?.output ?? []) {
    if (o.type !== 'message') continue;
    for (const c of o.content ?? []) if (c.type === 'output_text' && c.text) texts.push(c.text);
  }
  if (!texts.length) throw new Error('digest: no output_text in response');
  const obj = JSON.parse(texts.join(''));
  const name = clean(obj.name);
  const oneLiner = clean(obj.oneLiner);
  const message = sentence(obj.message);
  const kind = KINDS.includes(obj.kind) ? obj.kind : 'その他';
  if (!name || !oneLiner || !message) throw new Error('digest: empty name, oneLiner or message');
  return { name, oneLiner, message, kind };
}

/**
 * Returns { name, oneLiner, message, kind }. A `kind` other than POSTABLE_KIND means: do not post.
 * Throws on missing key, HTTP error, or unparsable output;
 * callers decide whether to skip the post (they should: never fall back to the English text).
 */
export async function digestJa(input, { apiKey, model = DEFAULT_MODEL, fetchImpl = fetch, timeoutMs = 45000 } = {}) {
  if (!apiKey) throw new Error('digest: OPENAI_API_KEY is not set');
  const body = buildDigestRequest(input, { model });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 200);
      throw new Error(`digest: POST ${ENDPOINT} -> HTTP ${res.status} ${detail}`);
    }
    return parseDigestResponse(await res.json());
  } finally {
    clearTimeout(timer);
  }
}
