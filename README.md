# 風見鶏 / kazamidori-bot

反応の向きで次に流すものを決める、Bluesky の自動投稿 bot です。
何を投稿するかを人が決めず、複数の公開データソースを「反応」で競わせます。

- アカウント: https://bsky.app/profile/kazamidori-bot.bsky.social
- 仕組みの説明とセットアップ: [bandit/README.md](bandit/README.md)
- 投稿ログ・反応・事後分布はすべて [data/bsky/](data/bsky/) に公開しています

## 何をしているか

1. arXiv・気象庁の地震情報・Wikipedia でよく読まれた記事・Hacker News・GitHub の新着から、1 回に 1 件を投稿する
2. 12 時間後に反応（いいね・リポスト・返信・引用）を測る
3. 反応が良かったソースが次に選ばれやすくなる（Thompson sampling）。ただし全ソースに探索の下限がある
4. 週に 1 回、ソースごとの成績をレポートする

投稿文はデータからテンプレートで機械的に作っています。日次ループに LLM は入っていません。

## その他

- `index.html`: 以前作った単一ファイルのポモドーロタイマー
