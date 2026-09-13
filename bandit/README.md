# 風見鶏 (kazamidori-bot) — Bluesky source bandit

アカウント: https://bsky.app/profile/foreword.project-haru.org （旧 kazamidori-bot.bsky.social。2026-09-12 に Foreword へ統合）

「何を投稿するか」を人が決めず、反応で決めさせる仕組み。
複数の公開データソースから毎日少数の投稿を選び、24 時間後の反応を報酬として
Thompson sampling で次回の配分を更新する。
LLM の出番は 1 か所だけ: 投稿直前に英語の題名と説明文から日本語の一言（ダイジェスト）を書く（`src/lib/digest.mjs`、OpenAI API）。何を投稿するかの判断には LLM は入っていない。

## ループ

1. `run-measure.mjs` : 投稿から `measureAfterHours`（既定 12h）以上経った未計測の投稿の likes / reposts / replies / quotes を取得。
   `score = likes + 2*reposts + 2*replies + quotes`、`reward = score >= 1`。ソースごとの Beta 事後分布を更新。
2. `run-post.mjs` : 各ソースの事後分布からサンプリングして順位付け。
   `explorationDays`（既定 3 日）以上投稿していないソースは強制的に先頭へ（探索の下限）。
   上位から順に新着 1 件を取り、1 回の実行で `postsPerRun`（既定 1）件、1 日合計 `postsPerDay`（既定 6）件まで投稿する。
   同じソースは `perSourceMinHours`（既定 6h）空ける。同じ item は二度と投稿しない。
3. `run-report.mjs` : 週 1 回、直近 7 日の集計を `data/bsky/reports/` に書く。人はこれだけ読めばよい。

## データ

| ファイル | 内容 |
|---|---|
| `data/bsky/sources.json` | ソースの有効/無効とパラメータ、投稿頻度（`postsPerRun` / `postsPerDay` / `perSourceMinHours`）、計測待ち時間、探索日数、日本語ダイジェストの有効/無効とモデル（`digest`） |
| `data/bsky/bandit-state.json` | ソースごとの alpha / beta / 累計 |
| `data/bsky/posts.json` | 投稿ログ（追記専用）。`digest` に日本語の一言とモデル名、metrics と reward は計測時に埋まる |
| `data/bsky/runs.json` | 実行ごとの順位付けと各ソースの結果（posted / no-fresh-item / fetch-error / digest-error / kind-skip …）。kind-skip には落とした item の名前と一言も残す（門の監査用） |
| `data/bsky/skipped.json` | kind-skip で落とした item の id（追記専用）。二度とダイジェストに回さない |
| `data/bsky/profile-history.json` | フォロワー数の日次スナップショット |
| `data/bsky/reports/*.md` | 週次レポート |

## ソース

| id | 何を出すか |
|---|---|
| `arxiv` | arXiv の指定カテゴリ新着（既定 cs.AI） |
| `jma-quake` | 気象庁 地震情報。直近 24h・最大震度 3 以上のときだけ |
| `wikipedia-mostread` | 日本語 Wikipedia で昨日よく読まれた記事 |
| `hackernews` | Hacker News。`feed: 'top'`（トップ）か `'show'`（Show HN、作った人の発表）。`minScore` 以上のみ |
| `github-new-repos` | 直近 7 日に作られて 50★以上の GitHub リポジトリ |

2026-09-13 現在、有効なのは `hackernews`（show, 30 points 以上）と `github-new-repos` の 2 つ。他 3 つは Foreword の趣旨（海外のツール）に合わないので停止中。

ソースを足すには `src/sources/` にモジュールを 1 つ追加し、`index.mjs` と `sources.json` に登録する。
モジュールは `id`, `name`, `langs`, `fetchCandidates(params, ctx)`, `format(item, params, digest)` を export する。
日本語ダイジェストを使うソースは `digestInput(item)` → `{ name, text, url }` も export する。LLM が読めるのはこの 3 つだけ。
`format` は `digest`（`{ name, oneLiner, message, kind }`）があれば 2 行 + URL、無ければ従来の英語テンプレート。1 行目は看板「【海外で話題のツール】名前：何をするか【出典・点数】」（例 `【Show HN・128pt】`、`【GitHub・★2,185】`）、2 行目は独立して読める説明 2 文（誰向けか・何ができるか、どう楽になるか）で必ず「。」で終える（タカさん、2026-09-14）。
`digest.enabled` のとき、ダイジェストの取得に失敗した item は投稿せず `runs.json` に `digest-error` で残す（英語のまま出さない）。
ダイジェストの `kind` が「サービス・アプリ」以外（ライブラリ・部品 / 読み物・作品 / その他）の item も投稿しない（門 1、`docs/research/2026-09-13-source-landscape.md` 2 章）。落ちたら同じソースの次の候補を試し、1 回の実行で `digest.maxTriesPerSource`（既定 3）件まで。全部落ちたら `all-skipped`。
投稿の枠（接頭辞）は日本語。英語の中身を含む投稿は `langs: ['ja', 'en']` で両方の読者に届ける。
`fetchCandidates` は `{ itemId, url, ... }` の配列を新しい順に返す。

## セットアップ

1. Bluesky でアカウントを作り、設定 → App Passwords でアプリパスワードを発行する。
2. リポジトリの Secrets に `BSKY_HANDLE`（`foreword.project-haru.org`）と `BSKY_APP_PASSWORD` を登録する。
   日本語ダイジェストを使うなら `OPENAI_API_KEY` も登録する（無いと `digest.enabled` の間は投稿されない）。
3. Actions の `bsky-source-bandit` を `dry_run = true` で手動実行し、投稿文が出ることを確認する。
4. 以後は JST 8:17, 11:17, 14:17, 17:17, 20:17, 23:17 に自動で回り（1 回 1 投稿）、データファイルはワークフローが同じブランチにコミットする。この 6 枠を実際に起動するのは Foreword の Cloudflare Worker（`../foreword/worker/trigger.ts`、cron から workflow_dispatch）。GitHub 自身の schedule は数時間遅れたり枠ごと落ちたりするので（2026-09-13 実測）、フォールバック扱い。
   間隔を変えるにはワークフローの cron と `sources.json` の `postsPerDay` を合わせて変える。

## ローカル実行

```sh
cd bandit
npm test
node src/run-post.mjs --dry-run     # 資格情報なしでも動く。投稿も記録もしない（OPENAI_API_KEY が無ければ英語テンプレートで表示）
OPENAI_API_KEY=... node src/run-post.mjs --dry-run   # 日本語の一言まで実際に生成して表示（数円）
BSKY_HANDLE=... BSKY_APP_PASSWORD=... node src/run-post.mjs
node src/run-measure.mjs
node src/run-report.mjs 7
```

## 漂流を防ぐ規則

- 投稿頻度と探索日数は `sources.json` で固定。数値を追って増やさない。
- ソースの追加・削除は週次レポートを読んだ人が決める。日次ループはソース集合を変えない。
- 投稿文の枠は各ソースのテンプレートから機械的に作る。日本語の一言（oneLiner）は題名と説明文にある内容だけを訳し、一言メッセージ（message）は視点（誰向けか、いつ試す価値があるか）だけを足す。どちらも元データに無い事実・数字・評価語は足さない（`digest.mjs` の指示に明記）。
- `posts.json` の過去行は書き換えない。
