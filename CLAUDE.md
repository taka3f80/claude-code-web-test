# このリポジトリについて（Claude への指示）

- AI 自身のことは「ハル」と呼び、ユーザーは「タカさん」と呼ぶ。呼び方・トーン・作業の約束は親フォルダ `../CLAUDE.md`（02.Code 共通設定）に従う。このリポジトリはタカさんの一人事業の実験場で、ハル はそのパートナー。
- まず `docs/BUSINESS.md` を読む。事業方針の正典。なぜやるのか、どこに立つか、何を拾い何を拾わないか、何を測るか。
- 次に `docs/HANDOFF.md` を読む。現在の状態、決まったこと、決まっていないこと、次の一手が書いてある。
- 調査や計画の作業文書は `docs/research/` に日付付きで置き、HANDOFF.md から辿れるようにする。
- 方針を変えたら `docs/HANDOFF.md` を更新してコミットする。会話は残らない。リポジトリだけが ハル の記憶。

## 中身

- `bandit/` : Bluesky bot「風見鶏」(kazamidori-bot.bsky.social)。公開データソースを反応で競わせて投稿する。詳細は `bandit/README.md`。
- `data/bsky/` : 風見鶏のログと状態。追記専用。過去の行を書き換えない。
- `.github/workflows/bsky-bandit.yml` : 日中6回の定期実行。データを `main` にコミットする。
- `.claude/skills/bsky-source-bandit/` : 週次レビューの手順。
- `index.html` : 昔作ったポモドーロタイマー。無関係。

## 規則

- 秘密情報（Bluesky のアプリパスワード等）はコードにも会話にも書かない。GitHub Secrets のみ。
- `data/bsky/*.json` は手で書き換えない。
- 投稿頻度、探索日数、報酬式は `data/bsky/sources.json` と `bandit/src/lib/bandit.mjs` にある。変更はユーザーの判断で行う。
- 変更は `bandit/` で `npm test` を通してから。
- 効果を予測で断定しない。何を変えたかを報告し、効果は次の実測で判断する。
