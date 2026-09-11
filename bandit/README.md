# Bluesky source bandit

「何を投稿するか」を人が決めず、反応で決めさせる仕組み。
複数の公開データソースから毎日少数の投稿を選び、24 時間後の反応を報酬として
Thompson sampling で次回の配分を更新する。LLM は日次ループには入っていない。

## ループ

1. `run-measure.mjs` : 投稿から 24h 以上経った未計測の投稿の likes / reposts / replies / quotes を取得。
   `score = likes + 2*reposts + 2*replies + quotes`、`reward = score >= 1`。ソースごとの Beta 事後分布を更新。
2. `run-post.mjs` : 各ソースの事後分布からサンプリングして順位付け。
   7 日以上投稿していないソースは強制的に先頭へ（探索の下限）。
   上位から順に新着 1 件を取り、`postsPerDay` 件投稿する。同じ item は二度と投稿しない。
3. `run-report.mjs` : 週 1 回、直近 7 日の集計を `data/bsky/reports/` に書く。人はこれだけ読めばよい。

## データ

| ファイル | 内容 |
|---|---|
| `data/bsky/sources.json` | ソースの有効/無効とパラメータ、1 日の投稿数、探索日数 |
| `data/bsky/bandit-state.json` | ソースごとの alpha / beta / 累計 |
| `data/bsky/posts.json` | 投稿ログ（追記専用）。metrics と reward は計測時に埋まる |
| `data/bsky/runs.json` | 実行ごとの順位付けと各ソースの結果（posted / no-fresh-item / fetch-error …） |
| `data/bsky/profile-history.json` | フォロワー数の日次スナップショット |
| `data/bsky/reports/*.md` | 週次レポート |

## ソース

| id | 何を出すか |
|---|---|
| `arxiv` | arXiv の指定カテゴリ新着（既定 cs.AI） |
| `jma-quake` | 気象庁 地震情報。直近 24h・最大震度 3 以上のときだけ |
| `wikipedia-mostread` | 日本語 Wikipedia で昨日よく読まれた記事 |
| `hackernews` | Hacker News トップ（100 points 以上） |
| `github-new-repos` | 直近 7 日に作られて 50★以上の GitHub リポジトリ |

ソースを足すには `src/sources/` にモジュールを 1 つ追加し、`index.mjs` と `sources.json` に登録する。
モジュールは `id`, `name`, `fetchCandidates(params, ctx)`, `format(item, params)` を export する。
`fetchCandidates` は `{ itemId, url, ... }` の配列を新しい順に返す。

## セットアップ

1. Bluesky でアカウントを作り、設定 → App Passwords でアプリパスワードを発行する。
2. リポジトリの Secrets に `BSKY_HANDLE`（例 `example.bsky.social`）と `BSKY_APP_PASSWORD` を登録する。
3. Actions の `bsky-source-bandit` を `dry_run = true` で手動実行し、投稿文が出ることを確認する。
4. 以後は毎日 09:00 JST に自動で回り、データファイルはワークフローが同じブランチにコミットする。

## ローカル実行

```sh
cd bandit
npm test
node src/run-post.mjs --dry-run     # 資格情報なしでも動く。投稿も記録もしない
BSKY_HANDLE=... BSKY_APP_PASSWORD=... node src/run-post.mjs
node src/run-measure.mjs
node src/run-report.mjs 7
```

## 漂流を防ぐ規則

- 1 日の投稿数と探索日数は `sources.json` で固定。数値を追って増やさない。
- ソースの追加・削除は週次レポートを読んだ人が決める。日次ループはソース集合を変えない。
- 投稿文は各ソースのテンプレートから機械的に作る。データにない文言を足さない。
- `posts.json` の過去行は書き換えない。
