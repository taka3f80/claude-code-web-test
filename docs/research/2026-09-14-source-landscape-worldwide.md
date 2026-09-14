# 調査: 1 日 6 本を安定して出せるか。世界中のソースを総当たりで調べた（2026-09-14）

型: 作業文書。BUSINESS.md v0.5.1 の 2.3「対象ツールの選び方」、3「チャネルの役割」、5「何を拾い、何を拾わないか」、8「ガードレール」を、風見鶏の投稿源の設計に落とすための調査。2026-09-13 の `docs/research/2026-09-13-source-landscape.md` の続編で、あの日は英語圏の主要どころだけを見た。今回は範囲を世界中に広げた。
問い（タカさんの問い）: ソースを増やせば 1 日 6 本を余裕を持って出せるのか。数字で答えてほしい。
方法: 5 系統の調査エージェントが 2026-09-13〜14 に curl と WebFetch で各エンドポイントを実際に叩いた。HTTP ステータス、認証の要否、robots.txt の記述、返ってきた件数は全てその実測値。叩けなかったもの、数えられなかったものには 未検証 / 未計測 と書いた。ハル 自身も 2026-09-14 08:41 JST に Product Hunt の公開 Atom を叩き直した。
注意: 数字は推測で埋めていない。「1 日あたり何件」は実測した期間の件数を日数で割った概算で、そう書いた。**9/13 に「未検証」と書いたものを、今回の調査で「検証済み」に格上げしたものは無い。** 道具比率は全て目算で、統計的に数えたものではない。

## 0. 結論（先に）

### 0.1 6 本/日は届く。ただし「余裕を持って」と言えるのは 1 ソースだけ足した状態ではない

**今の 2 本では届かない。** 実測で言えることは以下の通り。

| ソース | 1 日に投稿できる件数 | 根拠 |
|---|---|---|
| Show HN（30pt 以上、現行設定） | **約 1.8 件/日** | 3.5 件/日（HN Algolia の 14 日計数、実測）× ゲート 1 通過率 約 1/2（サンプル 3 件のみ。統計と呼べる数ではない） |
| GitHub 新規リポジトリ（7 日 / 50★、現行設定） | **ほぼ 0 件/日** | 9/13 の実測どおり、上位 30 件のうち `homepage` を持つのは 5 件。ほぼ全部が部品で、ゲート 1 で落ちる |
| 合計 | **約 1.8 件/日** | 目標 6 本に対して 3 割 |

**ソースごとの上限は 4 件/日**（`perSourceMinHours: 6` の 6 時間クールダウン × 1 日 6 回の実行）。つまり 1 本のソースだけで 6 本は原理的に埋まらない。**最低 2 本、実際には 3〜4 本のソースが要る。**

### 0.2 推奨するソース構成

| 順 | ソース | 投稿できる件数/日 | 実測か | クールダウン上限 |
|---|---|---|---|---|
| 既存 | Show HN（`minScore` を 30 → 20） | 約 2.2 | 生の件数 4.5/日 は実測。ゲート通過率は 3 サンプルのみ | 4 |
| 追加 1 | **Fazier**（`https://fazier.com/`） | 推定 4（上限に当たる） | 生の件数 16/日 は 5 日分の実測。ゲート通過率は **未計測** | 4 |
| 追加 2 | **GitHub トピック横断**（`topic:self-hosted` ほか、`homepage` 必須） | 推定 3〜5 | 1 トピック 7 日で 7 件は実測。複数トピック分は **未計測** | 4 |
| 追加 3 | **台帳 30 本**（`docs/research/2026-09-12-tool-gap-candidates.md`） | 1（決め打ち） | 在庫 30 本 + 補欠 18 本。ゲート 1・3 は人手で確認済み | 4 |
| 予備 | Console.dev（`https://console.dev/rss.xml`） | 約 0.7 | 9 件/週は実測、道具比率 5 割は目算 | 4 |
| 合計 | | **約 10〜12 件/日** | | |

この構成なら 6 本/日は埋まり、4〜6 件の余裕が出る。ただし**余裕の大半は Fazier と GitHub トピックが持っていて、そのどちらもゲート通過率が未計測**。実測できているのは Show HN の約 2.2 件/日と台帳の 1 件/日、合わせて**約 3.2 件/日が今日確実に言える床**。ここが正直な線。

### 0.3 足さないもの（理由が規約）

Disquiet（韓国）、GeekNews（韓国）、Korben（フランス）は、中身の質だけで見れば上の 3 つに匹敵する。合わせて 1 日 7〜8 件の供給力がある。**が、3 つとも robots.txt で `User-agent: ClaudeBot` を名指しで `Disallow: /` にしている。** 3 章でこの扱いを整理した。ハルの推奨は「名指しの AI ボット禁止と Content-Signal も尊重する」で、その場合この 3 つは落ちる。**これはタカさんの判断事項。** 判断が変われば 0.2 の表に 3 本足せて、余裕は 1 日 7〜8 件増える。

### 0.4 実装の順番（1 回 1 つ）

1. `hackernews` の `minScore` を 30 → 20（パラメータのみ、小）
2. GitHub ソースの `per_page=10` を直し、トピック横断と `homepage` 必須を足す（中）
3. Fazier のソースモジュールを新規（中）
4. 台帳 30 本を決定的ソースとして足す（中）
5. Console.dev（小さめの中）

詳細は 5 章。

## 1. 世界の全景

5 系統の調査を 1 枚に統合した。列の意味は 9/13 の表と同じ。「量/日」は実測できたものだけ数字を入れ、できなかったものは 未計測。「判定」は各調査担当の判定をそのまま持ってきている。

### 1.1 英語圏のローンチ・発見系プラットフォーム

| ソース | 地域 | 中身（サービス比率） | 取得（実測 HTTP・形式・認証） | robots/規約 | 量/日 | 順位信号 | 日本語ミラー | 判定 |
|---|---|---|---|---|---|---|---|---|
| Fazier `https://fazier.com/`（`__NEXT_DATA__` または `/_next/data/<buildId>/index.json`） | 英語圏 | AI ツール・SaaS の日別ローンチ。目算 7〜8 割 | 200、生 JSON、認証不要 | 個別ページ `/launch/` のみ禁止。ホーム・データパスは禁止なし | **実測 16 件/日**（09-13=21, 09-12=14, 09-11=16, 09-10=13, 09-09=15） | upvotes_count、comments_count、pricing_type | 未検証 | **使える** |
| Launch YC `https://www.ycombinator.com/launches` | 英語圏 | YC 企業の新製品・機能。目算 5〜6 割 | 200、`Content-Type: application/json` の Algolia 形式 JSON がそのまま返る、認証不要 | `/launches` は禁止されていない（`/library?*`、`/companies?*` は禁止） | 未計測（1 ページ 20 件、`nbHits` 3277。1 ページ目の日付分布 09-10=7, 09-09=5, 09-08=1…で新着順ソートか未確認） | total_vote_count | 未検証 | 条件付き |
| dev.to showdev `https://dev.to/api/articles?tag=showdev` | 英語圏 | 個人開発者の自作紹介記事。目算 3〜4 割 | 200、公式無認証 JSON | `/search?q=*` 等のみ禁止 | 未計測 | reactions_count、comments_count | 未検証 | 条件付き |
| Product Hunt 公開 Atom `https://www.producthunt.com/feed` | 英語圏 | 新規プロダクト。道具比率は全ソース中で最高 | 200、Atom、認証不要 | フィードは禁止対象外。GraphQL v2 は「商用利用禁止」と明記 <https://api.producthunt.com/v2/docs> | **実測 5〜10 件/日**（2026-09-14 08:41 JST に 51 件取得。`published` は 08-14〜09-11、09-08=5, 09-09=7, 09-10=19, 09-11=2。`updated` は全件 09-13、最新でも 3 日前） | **票数がフィードに無い** | **あり**（producthunt.news、producthunt.hatenablog.com） | 条件付き（9/13 は「足さない」判定） |
| BetaList `https://feeds.feedburner.com/BetaList` | 英語圏 | ローンチ前・直後のスタートアップ | 200、25 件（9/13 実測） | 実質無制限 | 未計測（1 日数件） | 無し | 見つからなかった | 条件付き |
| Launching Next `https://www.launchingnext.com/` | 英語圏 | 個人開発の新規プロダクト | robots.txt 自体が Cloudflare bot チャレンジ画面（JS 検証待ちの HTML） | 判定不能 | 未計測 | 未確認 | 未検証 | 使えない |
| SaaSHub `https://www.saashub.com/new` | 英語圏 | SaaS カタログ | robots.txt 200・許可的。`/new` は 200 だがカテゴリ一覧ページで新着一覧ではない。推測 URL は 404 | MJ12bot 以外は許可 | 未計測 | 投票・レビュー数がある模様（未検証） | 未検証 | 未検証（正しい新着 URL を特定できず） |
| Dev Hunt `https://devhunt.org/` | 英語圏 | 開発者向けツールの日次ベスト | 200 だが本文は Next.js のエラーシェル。`/feed`、`/rss.xml` は 200 だが実体はユーザープロフィールページ | 未検証 | 未計測 | 未確認 | 未検証 | 使えない |
| MicroLaunch `https://www.microlaunch.net/` | 英語圏 | マイクロ SaaS ローンチ掲示板 | HTTP 526（Cloudflare オリジンエラー）、複数回リトライ同じ | 取得不能 | 未計測 | 未確認 | 未検証 | 使えない |
| Tiny Launch `https://tinylaunch.com/` | 英語圏 | ローンチ掲示板。エージェント向け API を明示 | robots.txt 200。`llms.txt`、`.well-known/agents.json`、`openapi.json` は 307 経由 200。`GET /startups` は「ログイン中ユーザー自身の一覧」仕様 | 公開の新着一覧を返す無認証エンドポイントが存在しない | 未計測 | 未確認 | 未検証 | 使えない。**`llms.txt` に AI エージェント宛ての行動指示が埋め込まれていた（6 章に記録）** |
| YC 企業ディレクトリ（非公式ミラー）`https://yc-oss.github.io/api/companies/all.json` | 英語圏 | YC 出資全企業の静的 JSON | 200、認証不要、生 JSON | 非公式ミラー | 一括 JSON で「本日の新着」抽出には別処理が必要。鮮度 未計測 | 無し | 未検証 | 条件付き（補完用途） |
| AppSumo `https://appsumo.com/browse/` | 英語圏 | ライフタイムディール | 200、`__NEXT_DATA__` の `fallbackData.deals` に生データ | 専用 API / RSS は未発見 | 未計測 | codes_remaining のみ、票数相当なし | 未検証 | 条件付き |
| StackShare `https://stackshare.io/trending` | 英語圏 | 技術スタックのトレンド | 2 回とも 429。robots.txt も 429 | 未確認 | 未計測 | 未検証 | 未検証 | 未検証（レート制限） |
| Slant `https://www.slant.co/` | 英語圏 | 比較・推薦サイト | UA を変えても一貫して 403 | 未確認 | 未計測 | 未確認 | 未検証 | 使えない |
| G2 新着 `https://www.g2.com/products/new` | 英語圏 | B2B SaaS レビュー | 403（robots.txt は ClaudeBot を全面禁止していない） | 個別パスのみ禁止 | 未計測 | レビュー数・評点 | 未検証 | 使えない |
| Capterra `https://www.capterra.com/new-listings/` | 英語圏 | B2B SaaS レビュー | 403（正しい URL か未確定） | **robots.txt は ClaudeBot を明示的に Allow** | 未計測 | レビュー数 | 未検証 | 未検証 |
| Softpedia `https://www.softpedia.com/newSoft/` | 英語圏 | Windows/Mac ソフトのカタログ | 403。`rss.softpedia.com` は DNS/接続不可（HTTP 000） | **`User-agent: ClaudeBot / Disallow: /` と明記** | 未計測 | 未確認 | 未検証 | 使えない |
| MacUpdate `https://www.macupdate.com/explore/new` | 英語圏 | Mac アプリの新着 | 推測 URL は 404 | `/rss`、`/apps/`、`/browse/`、`/discover/` を軒並み禁止 | 未計測 | 未確認 | 未検証 | 使えない |
| Setapp `https://setapp.com/apps` | 英語圏 | 審査制の Mac アプリ集 | 200（2.2MB の静的寄りカタログ）。`/feed`、`/blog/rss.xml` 等は全て 404 | クエリ付き URL のみ禁止 | 未計測（追加ペースは低いと推測、未検証） | 無し | 未検証 | 使えない（RSS 無し、鮮度不足） |
| Bluesky 公開検索 `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` | 世界 | ハッシュタグ検索 | **`searchPosts` のみ 403**（Cloudflare 風）。同ホストの `app.bsky.actor.getProfile` は 200 | robots.txt は「公開 API のクロールは許可、429 でレート制御」 | 未計測 | いいね・リポスト数（設計上） | 未検証 | 使えない（実測時点） |
| Mastodon `#BuildInPublic` RSS `https://mastodon.social/tags/buildinpublic.rss` | 英語圏中心 | 個人開発者の進捗共有。目算 3〜4 割 | 200、RSS 2.0、認証不要 | GPTBot のみ全面禁止 | 未計測（数時間に数件） | 無し（RSS に含まれず） | 未検証 | 条件付き |
| Mastodon `#indiedev` / `#showcase` | 同上 | ゲーム・アプリの進捗 | ともに 200（本文サンプル未読み込み） | 同上 | 未計測 | 無し | 未検証 | 条件付き（ゲーム比率が高い見込み） |
| Lemmy `lemmy.world` `/api/v3/post/list?community_name=technology&sort=New` | 英語圏 | テックニュース・議論 | 200、認証不要の公式 JSON | 未検証 | 未計測 | upvote/downvote | 未検証 | 条件付き（道具比率が低い） |
| Lemmy `programming.dev` | 英語圏 | プログラミング系 | 推測 community_name は 404 | Content-Signal `ai-train=no`、`search=yes` | 未計測 | 未確認 | 未検証 | 未検証 |
| Tildes `https://tildes.net/~tech` | 英語圏（招待制） | テック議論 | `~tech` は 200（HTML）、`~tech.rss` は 404、`~tech/rss` は 302（追跡未完） | 「節度あるスクレイピングは歓迎、SEO 業者のみ拒否」と明記 | 未計測 | 投票数（HTML 内） | 未検証 | 未検証 |
| Mbin/Kbin `https://fedia.io/api/entries` | 英語圏 | 連合型掲示板 | `kbin.social` は接続不可（HTTP 000）。`fedia.io/api/entries` は 401 | robots.txt は許容的 | 未計測 | 未確認 | 未検証 | 使えない（無認証では） |
| Hashnode `https://gql.hashnode.com/` | 英語圏 | 開発者ブログ | POST すると 301 で API 仕様変更のお知らせページへ | 未検証 | 未計測 | 未確認 | 未検証 | 未検証 |
| Kickstarter `https://www.kickstarter.com/discover/advanced.json?category_id=16` | 世界 | クラファン | 403 | 未確認 | 未計測 | バッカー数・調達額 | 未検証 | 使えない（かつハード発表はゲート 1 で落ちる） |
| Indiegogo `https://www.indiegogo.com/explore/technology` | 世界 | クラファン | 403 | 未確認 | 未計測 | 未確認 | 未検証 | 使えない |

### 1.2 開発者・オープンソース・マーケットプレイス

| ソース | 地域 | 中身（サービス比率） | 取得（実測 HTTP・形式・認証） | robots/規約 | 量/日 | 順位信号 | 日本語ミラー | 判定 |
|---|---|---|---|---|---|---|---|---|
| GitHub Search API（topic + stars + created 絞り込み）`https://api.github.com/search/repositories?q=topic:self-hosted+created:>2026-09-07+stars:>20&sort=stars` | 世界 | 実見 7 件中 6 件が明確なプロダクト | 200、無認証 | `api.github.com` に robots.txt は 404 | **実測 7 件/7 日**（self-hosted の 1 系統のみ）。複数トピックで 3〜8 件/日は推定 | Star 数、created 日時 | あり（GitHub 全体のミラーは複数） | **使える** |
| GitHub Search API（絞り込みなし）`?q=topic:self-hosted&sort=updated` | 世界 | 目算 6〜7 割が部品 | 200。レート制限 **10 回/分**（`X-RateLimit-Limit: 10` 実測） | 同上 | 34,545 件ヒット（絞り込み前） | Star 数 | 同上 | 条件付き（ノイズ多い） |
| awesome-selfhosted-data コミット `https://api.github.com/repos/awesome-selfhosted/awesome-selfhosted-data/commits` | 世界 | 自己ホスト型ソフト専門の厳選リスト。目算 9 割以上がプロダクト | 200 | GitHub 全体の規約に準ずる | 未計測（`add` 系コミットは数日に 1 件程度。9/11 に 1 件確認） | API レスポンス自体には★なし | 未確認 | **使える**（量は少ない） |
| Firefox Add-ons（AMO）`https://addons.mozilla.org/api/v5/addons/search/?sort=hotness&app=firefox&type=extension` | 世界 | 実見上位 5 件中 4 件が実用ツール。目算 7〜8 割 | 200 | `Allow: /` が基本、`/api/` は制限なし | 実測: hotness 上位 50 件の作成日は 8〜9 月上旬に集中（直近 7 日以内作成は 0 件）。日次の新着ではなく週単位の入れ替わり | `average_daily_users`（実利用者数） | 未確認 | **使える** |
| Obsidian community-plugins.json `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json` | 世界 | Obsidian 専用プラグイン（アドオン寄り） | 200。`raw.githubusercontent.com/robots.txt` は 404 | 制限なし | **実測: 2026-09-13 に約 2 時間おきの自動コミット、1 コミットあたり 4〜6 件追加/更新** | `community-plugin-stats.json` に DL 数 | 未確認 | 条件付き（対象が Obsidian 限定） |
| Console.dev `https://console.dev/rss.xml` | 英語圏 | `Tool:` / `Beta:` プレフィックス付きで 1 エントリ = 1 ツール。ライブラリ寄りも半々 | 200、RSS、認証不要 | `Disallow: /landing` のみ | **実測 9 件/週 ≒ 1.3 件/日** | 無し | 未確認 | **使える**（量は少ない） |
| GitHub trending ページ `https://github.com/trending` | 世界 | 目算 1〜2 割が使えるプロダクト | 200、公式 JSON なし、HTML のみ | `/trending` の Disallow はない | 未計測 | Star 数（ページ内） | **あり**（`@gh_trending_`、`github-trending-ja.yashikota.com` ほか複数） | 条件付き（HTML スクレイピング、ミラー多数） |
| GitHub trending 非公式 API 群（gitterapp、herokuapp、huchenme、vercel） | 世界 | - | 404 / 451 / 404。**すべて死んでいる** | - | - | - | - | 使えない |
| OSS Insight `https://api.ossinsight.io/v1/trends/repos/?period=past_week` | 世界 | GitHub イベント集計 | 200 だが `"unavailable_since":"2026-03-01"` と自己申告（捕捉率が基準の約 0.3% まで低下） | 未確認 | データ自体が空 | 機能停止中 | 未確認 | 使えない |
| GitLab Explore / API `https://gitlab.com/api/v4/projects?order_by=star_count` | 世界 | 上位は GitLab 自社インフラ。1 割未満 | Explore は 302（ログインへ）。API は 200 | **robots.txt が `/api/v*` を明示的に Disallow** | 未計測 | Star 数 | 未確認 | 使えない |
| Hugging Face Spaces `https://huggingface.co/api/spaces?sort=likes` | 世界 | likes 上位はブラウザで使えるツール。createdAt 順は 0 いいねがほぼ 100% | 200 | robots.txt 全許可（`Allow: /`） | createdAt 降順は数秒単位で新規投稿 | likes 数、trendingScore | 未確認 | 条件付き（**trendingScore 上位に成人向け示唆タグの生成デモが複数混入、実測**） |
| npm registry search `https://registry.npmjs.org/-/v1/search?text=...` | 世界 | 目算ほぼ 100% ライブラリ | 200 | 実質無制限 | 未計測 | 週間/月間 DL 数 | 未確認 | 使えない（ゲート 1 で全滅） |
| PyPI RSS `https://pypi.org/rss/packages.xml` | 世界 | 目算 100% ライブラリ | 200 | 未確認 | 常時新着 | 無し | 未確認 | 使えない |
| crates.io `https://crates.io/api/v1/crates?sort=new` | 世界 | 目算 100% Rust ライブラリ | 200（既定 UA だと robots.txt が 403、ブラウザ風 UA で 200・全許可） | 全許可 | 未計測 | DL 数 | 未確認 | 使えない |
| Homebrew Analytics `https://formulae.brew.sh/api/analytics/install/30d.json` | 世界 | 既存フォーミュラの人気ランキング | 200 | 未確認 | 新着シグナルなし | インストール数 | 未確認 | 使えない |
| Homebrew cask.json `https://formulae.brew.sh/api/cask.json` | 世界 | GUI アプリ一覧 | 200 | 未確認 | 追加日時フィールドが無く新着抽出不可 | 無し | 未確認 | 条件付き |
| Homebrew-cask コミット `https://api.github.com/repos/Homebrew/homebrew-cask/commits` | 世界 | 実測直近 5 件中 4 件がバージョン bot 自動更新 | 200 | GitHub 規約 | 新規 cask 追加の頻度は bump に埋もれて不明 | 無し | 未確認 | 使えない（フィルタコスト高） |
| Docker Hub `https://hub.docker.com/v2/search/repositories/` | 世界 | 設定済み環境が中心、1〜2 割 | 200 で動作 | **`User-agent: ClaudeBot` に全面 `Disallow: /`** | 未計測 | star_count、pull_count | 未確認 | 使えない（規約） |
| VS Code Marketplace `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery`（POST） | 世界 | IDE 拡張はほぼ部品、1 割程度 | 200（POST 動作確認済み） | **robots.txt が `/_apis/` を明示的に Disallow** | 未計測 | インストール数、publishedDate | 未確認 | 使えない |
| JetBrains Marketplace `https://plugins.jetbrains.com/api/searchPlugins?orderBy=update+date` | 世界 | 実見 10 件中プロダクトは 1〜2 件 | 200 | API パスは禁止されていない | 実測: 数十分〜数時間おきに新規/更新 | ダウンロード数 | 未確認 | 条件付き（プロダクト比率が低い） |
| Chrome Web Store `https://chromewebstore.google.com/` | 世界 | - | 詳細ページは 301。一覧は JS 描画 SPA で埋め込み JSON なし | **`/search` を Disallow** | 取得不可 | - | - | 使えない |
| Raycast Store `https://www.raycast.com/store` | 世界 | - | 200 だが完全な JS 描画 SPA。`backend.raycast.com/api/v1/extensions` は 404 | 未確認 | 取得不可 | - | - | 使えない |
| Figma Community `https://www.figma.com/community` | 世界 | - | トップが 403 | GPTBot 等を全面禁止 | 取得不可 | - | - | 使えない |
| Zapier `https://zapier.com/apps` | 世界 | - | 200 だが HTML のみ、JSON/RSS なし | 個別ランディングページを禁止 | 未計測 | 未確認 | 未確認 | 使えない |
| Make.com `https://www.make.com/en/integrations` | 世界 | - | 403 | `/en/integration/*` 等を Disallow | 取得不可 | - | - | 使えない |
| Changelog Nightly | 世界 | - | 専用 RSS パスは 404 | **`changelog.com/robots.txt` がサイト全体に `disallow: /`** | 取得不可 | - | - | 使えない |
| TLDR Tech `https://tldr.tech/api/rss/tech` | 英語圏 | 一般テックニュースのダイジェスト。1 アイテム = 号全体 | 200 | `/subscribed` 等のみ禁止 | 平日 1 号/日 | 無し | 未確認 | 使えない（道具比率が低く、号ページの追加パースが要る） |
| Stack Overflow / StackExchange `https://api.stackexchange.com/2.3/tags` | 世界 | 言語タグのランキング | 200。無認証クォータ 300 回/日（`quota_max` 実測） | 未確認 | - | 質問数 | 未確認 | 使えない（目的と噛み合わない） |

### 1.3 アジア（日本以外）

| ソース | 地域 | 中身（サービス比率） | 取得（実測 HTTP・形式・認証） | robots/規約 | 量/日 | 順位信号 | 日本語ミラー | 判定 |
|---|---|---|---|---|---|---|---|---|
| V2EX 分享创造 RSS `https://www.v2ex.com/feed/create.xml` | 中国・簡体字 | 個人開発者の自作アプリ・ツール・OSS。目算 8 割以上 | 200、Atom、認証不要 | `/backstage/`、`/signin`、`/signout`、`/settings` のみ。**ボット名指し禁止は見当たらず** | **実測 約 24 件/日**（50 件が 2026-09-11T21:08〜09-13T23:38 の約 2.1 日）。ただし `updated` が返信 bump を含む可能性があり、純新規は 未検証 | replies 数 | 確認できず | **使える**（件数の実態は継続観察） |
| Disquiet products.json `https://disquiet.io/products.json` | 韓国・韓国語 | 韓国版 Product Hunt の承認済み新規プロダクト。目算 8 割以上 | 200、JSON、認証不要。`?page=2` でページング可 | `User-agent: *` は `Allow: /` だが **`User-agent: ClaudeBot / Disallow: /` を名指しで別途指定** | **実測 約 3.5 件/日**（20 件が 09-08T06:52〜09-13T22:31 の約 5.7 日） | このJSONには無し | 確認できず | 条件付き（規約はタカさんの判断） |
| GeekNews `https://news.hada.io/rss/news` | 韓国・韓国語 | 韓国版 HN。「Show GN」タグのみ自作ツール | 200、Atom、認証不要 | `Content-Signal: ai-train=no, search=yes, ai-input=yes`。**ClaudeBot は名指しで `Disallow: /`**（Claude-User / Claude-SearchBot は許可） | 実測: 直近 50 件が 09-13 09:36〜09-14 08:32（約 23 時間）。うち Show GN は **2 件のみ（約 4%）** | RSS に票数は出ない | 確認できず | 条件付き |
| Velog `https://velog.io/trending` | 韓国 | 技術記事 | 200（HTML）。GraphQL は 400（クエリ必須） | robots.txt は Disallow 行なし（全面許可） | 未計測 | 記事のいいね数（未取得） | 確認できず | 使えない（中身が記事） |
| Naver / Kakao Developers | 韓国 | 自社 API 文書 | Naver 301、Kakao 200 | - | - | - | - | 使えない |
| V2EX hot.json `https://www.v2ex.com/api/topics/hot.json` | 中国 | 雑談・キャリア相談 | 200、JSON | 上記と同じ | 実測 9 件 | replies 数 | - | 使えない（分享创造の方を使う） |
| 36Kr `https://www.36kr.com/feed` | 中国 | 資金調達・IPO・業界ニュース | 200、RSS | `/api/` 等を Disallow、フィードは対象外 | 未計測（1 回で約 20 件） | 無し | 確認できず | 使えない |
| Juejin 掘金 `https://juejin.cn` | 中国 | 技術記事 | 200（HTML）。無認証 JSON API は未発見 | 名指し禁止なし、`/search` 等のみ | 未検証 | - | - | 使えない/未検証 |
| sspai 少数派 `https://sspai.com/feed` | 中国 | アプリのレビュー・ノウハウ記事 | 200、RSS | `/a/*` 等を Disallow、`/feed` は対象外 | 未計測 | 無し | 確認できず | 条件付き/使えない |
| ifanr 爱范儿 `https://www.ifanr.com/feed` | 中国 | スマホ・EV・ガジェットニュース | 200、RSS | `Content-Signal: ai-train=no`、**ClaudeBot を名指しで `Disallow: /`** | 未計測（1 回で約 20 件） | 無し | 確認できず | 使えない |
| Gitee `https://gitee.com/explore` | 中国 | 中国版 GitHub のトレンド | **405**（Baidu WAF の JS チャレンジ） | robots.txt は 200 で読めるが本体がブロック | 取得不可 | - | - | 使えない |
| 今日热榜 `https://tophub.today` | 中国 | 各プラットフォームの急上昇まとめ | 200（ブラウザ UA 時。無指定だと 503） | robots.txt は 404（存在しない） | 未計測 | 元の順位の転記 | 確認できず | 使えない（中身が時事トレンド） |
| 即刻 `https://web.okjike.com` | 中国 | SNS | 200 だが React の SPA シェルのみ（1119 バイト） | `User-agent: *` のみ、制限行なし | 未検証 | - | - | 使えない/未検証 |
| 酷安 Coolapk `https://www.coolapk.com` | 中国 | Android アプリのレビュー | 200 だが HTML に記事一覧が含まれず | 一部パスのみ Disallow | 未検証 | - | - | 未検証 |
| INSIDE `https://www.inside.com.tw/feed/rss` | 台湾 | ガジェット・大企業動向 | 200（Mozilla UA 必須、UA 無しだと 403）、RSS | **ClaudeBot を名指しで `Disallow: /`** | 未計測 | 無し | 確認できず | 使えない |
| iThome `https://www.ithome.com.tw/rss` | 台湾 | 企業 IT・セキュリティ | 200、RSS | `Content-Signal: search=yes, ai-input=yes, ai-train=no`。**ClaudeBot 等は学習目的のみ禁止、リアルタイム引用は許可と明記** | 未計測 | 無し | 確認できず | 使えない（中身がゲート 1 不適合） |
| TechOrange `https://buzzorange.com/techorange/feed/` | 台湾 | 企業の AI 導入事例 | 301 → 200、RSS | 未確認 | 未計測 | 無し | 確認できず | 使えない |
| PTT Soft_Job `https://www.ptt.cc/bbs/Soft_Job/index.html` | 台湾 | 求人・キャリア掲示板 | 200（HTML）。JSON API 見当たらず | robots.txt は 404 | 実測: 直近 1 ページ 6 スレッド中、道具紹介は 1 件 | 推数（未集計） | 確認できず | 使えない |
| YourStory `https://yourstory.com/feed` | インド | スタートアップ・文化・政策記事 | 200、RSS | 名指し禁止なし | 未計測（1 回で約 8 件） | 無し | 確認できず | 使えない |
| Inc42 `https://inc42.com/feed/` | インド | 資金調達・IPO | 200、RSS | **ClaudeBot 等の学習系は company/person ページ以外 Disallow、Claude-User 等は全体 Allow** | 未計測（1 回で約 15 件） | 無し | 確認できず | 使えない |
| Tech in Asia `https://www.techinasia.com/feed` | 東南アジア | スタートアップニュース | robots.txt 自体が 403、フィードも 403 | 判定不能 | 取得不可 | - | - | 使えない |
| e27 `https://e27.co/feed/` | 東南アジア | スタートアップ・イベント | 403（複数 UA で再試行しても） | **ClaudeBot を `Disallow: /`**（Claude-User / Claude-SearchBot は許可） | 取得不可 | - | - | 使えない |
| KrASIA `https://kr-asia.com/feed` | 東南アジア | スタートアップニュース | 200 だが返るのは RSS ではなくトップページ HTML | robots.txt の sitemap が `krasia.triboostml.vercel.app` を指す（未確認） | 取得不可 | - | - | 使えない |
| Viblo `https://viblo.asia` | ベトナム | 技術記事 | 302 | **`Disallow: /*.json` と `Disallow: /*.xml` を明記** | 未計測 | - | - | 使えない |
| Kompas Tekno `https://tekno.kompas.com/rss` | インドネシア | 大手メディアのテック面 | フィードが 404 | **「個人の非商用利用のみ許可。データマイニング・AI/LLM 開発・商用利用は事前許可が必要」と明記。ClaudeBot / Claude-User / Claude-SearchBot を全て `Disallow: /`** | 取得不可 | - | - | 使えない |
| Startup Daily `https://www.startupdaily.net/feed/` | オーストラリア | 資金調達・政策 | 200、RSS | **ClaudeBot を名指しで `Disallow: /`**（GPTBot、PerplexityBot も同様） | 未計測（1 回で約 12 件） | 無し | 確認できず | 使えない |

### 1.4 欧州・ロシア/CIS・中南米・中東・アフリカ

| ソース | 地域 | 中身（サービス比率） | 取得（実測 HTTP・形式・認証） | robots/規約 | 量/日 | 順位信号 | 日本語ミラー | 判定 |
|---|---|---|---|---|---|---|---|---|
| Korben `https://korben.info/feed` | フランス | 個人開発・小規模ツールの一言紹介。目算 6〜7 割 | 200、RSS | `Content-Signal: search=yes, ai-train=no, use=reference`。**ClaudeBot / GPTBot / CCBot / Google-Extended を個別に `Disallow: /`** | 実測 25 件/8 日（09-04〜09-11）≒ 約 3 件/日 | 無し | 専用の日本語転載サイトは見つからず | 条件付き（規約はタカさんの判断） |
| Journal du Hacker `https://www.journalduhacker.net/rss`（JSON: `/hottest.json`、`/newest.json`） | フランス | Lobsters 型のユーザー投稿。目算 1〜2 割以下 | 200（RSS/JSON とも）。`/latest.json` は 404 | **`User-agent: * / Allow: /` のみ。AI ボット個別拒否なし（今回調べた中で最もクリーン）** | 実測 15〜25 件/1〜2 日 | score / upvotes / downvotes / comment_count | 未検索 | 条件付き（規約は最良、道具比率が低い） |
| Habr `https://habr.com/ru/rss/` | ロシア | 技術記事・意見記事が主 | 200 | `User-agent: *` に `Crawl-delay: 10` のみ。全面禁止なし | 直近フィードで 40 件。日次新規は 未計測 | 無し（フィードには出ない） | 専用の日本語転載サイトは確認できず | 条件付き |
| Habr ハブ別フィード（例 `/ru/rss/hub/programming/`） | ロシア | 未検証 | 301 リダイレクト後 200 | 同上 | 未計測 | 無し | 未検索 | 未検証（絞り込めば比率が上がる可能性） |
| vc.ru `https://vc.ru/rss` | ロシア | 資金調達・ビジネス論評 | 200 | `User-agent: *` のみ、全面禁止なし | 直近 12 件（09-11〜09-13） | 無し | 未検索 | 使えない |
| Tproger `https://tproger.ru/feed/` | ロシア | OSS のバージョン更新情報 | 200（301 経由） | **GPTBot / ClaudeBot を `Disallow: /`** | 直近 50 件 | 無し | 未検索 | 使えない |
| Heise `https://www.heise.de/rss/heise-atom.xml` | ドイツ | 総合 IT ニュース | 200 | 複雑。GPTBot/ClaudeBot は一部パスのみ Allow、別セクションで **`ClaudeBot Disallow: /`、`Claude Disallow: /` も併存（記述が矛盾）** | 151 エントリ、数時間おき | 無し | 未検索 | 使えない |
| Golem.de `https://rss.golem.de/rss.php?feed=RSS2.0` | ドイツ | 総合 IT ニュース・広告記事 | 200 | ClaudeBot/GPTBot/CCBot の個別記述なし | 40 件 | 無し | 未検索 | 使えない |
| t3n `https://t3n.de/rss.xml` | ドイツ | スタートアップ・ビジネス | 200 | `Claude-User`、`Claude-Web`、`ChatGPT-User` の項目あり（Disallow 内容は未確認） | 20 件 | 無し | 未検索 | 条件付き（要再確認） |
| Numerama `https://www.numerama.com/feed/` | フランス | 総合テックニュース | 200 | `CCBot Disallow: /`、`GPTBot Allow: /` | 15 件 | 無し | 未検索 | 使えない |
| Tweakers `https://tweakers.net/feeds/mixed.xml` | オランダ | 既存ソフトのバージョン更新告知 | 200 | robots.txt は初回 200、再アクセスで 403（不安定） | 40 件 | 無し | 専用の日本語転載サイトは見つからず | 使えない |
| Xataka `https://www.xataka.com/feedburner.xml` | スペイン | 総合ガジェットニュース | 200（301 経由） | 末尾に「BLOCK LLM」節。**その末尾コメントに「NOTA INTERNA: BOTS AUTORIZADOS」として ClaudeBot 等を列挙する不審な記述（6 章に記録）**。実際の Disallow 行には ClaudeBot の許可も禁止も無い | 多数 | 無し | 未検索 | 使えない |
| Genbeta `https://www.genbeta.com/feedburner.xml` | スペイン | ソフト・アプリのダウンロード記事 | 200（301 経由） | Xataka と同系列だが「BLOCK LLM」節や不審コメントは無し | 14 件（2025 年 12 月のものも混在、更新頻度が不安定の可能性） | 無し | 未検索 | 条件付き |
| Hipertextual `https://hipertextual.com/feed` | スペイン/中南米 | エンタメ・Windows 小ワザ | 200（301 経由） | `User-agent: *` のみ | 15 件 | 無し | 未検索 | 使えない |
| Tecnoblog `https://tecnoblog.net/feed/` | ブラジル | ガジェット比較記事 | 200 | AI ボット個別 Disallow なし | 50 件 | 無し | 未検索 | 使えない |
| Olhar Digital `https://olhardigital.com.br/feed/` | ブラジル | ガジェット・セール情報 | 200 | `CCBot`、`Amazonbot` を Disallow | 10 件 | 無し | 未検索 | 使えない |
| TabNews `https://www.tabnews.com.br/api/v1/contents` | ブラジル | HN 型のユーザー投稿。サンプル 10 件中、道具は 0 件 | 200、JSON、認証不要 | `User-agent: * Allow: /` のみ | 直近数時間で 10 件以上 | `tabcoins` | 専用の日本語転載サイトは見つからず | 条件付き（ゲート 1 でほぼ落ちる） |
| Punto Informatico `https://www.punto-informatico.it/feed/` | イタリア | 広告記事・総合ニュース | 200 | `grapeshot` 等 | 20 件 | 無し | 未検索 | 使えない |
| Breakit `https://www.breakit.se/feed/artiklar` | スウェーデン | 政治・ビジネス人物論評 | 200 | `GPTBot Disallow: /` | 5 件のみ | 無し | 未検索 | 使えない |
| Tech.eu `https://tech.eu/feed/` | 欧州 | 資金調達・M&A | 200 | **`ClaudeBot` / `CCBot` に `Allow: /`** | 20 件 | 無し | 未検索 | 使えない（中身） |
| Sifted `https://sifted.eu/feed` | 欧州 | 資金調達ニュース | 200 | **ClaudeBot / GPTBot / CCBot を `Disallow: /`** | 24 件 | 無し | 未検索 | 使えない |
| EU-Startups `https://www.eu-startups.com/feed/` | 欧州 | 資金調達・週刊まとめ | 200 | robots.txt が 403 で取得できず | 10 件 | 無し | 未検索 | 使えない |
| Wykop | ポーランド | 掲示板 | tag ページ 301、API v3 想定パス 404 | `/api/` を Disallow | 未計測 | 未計測 | 未検索 | 使えない |
| Niebezpiecznik `https://niebezpiecznik.pl/feed/` | ポーランド | セキュリティニュース | 200（302 経由） | robots.txt は Cloudflare の JS チャレンジで 403 | 15 件（8/25〜8/27、更新頻度低め） | 無し | 未検索 | 使えない |
| Webrazzi `https://webrazzi.com/feed/` | トルコ | スタートアップニュース | 200 | **`ClaudeBot` / `CCBot` に `Allow: /`** | 1 時間おきに更新 | 無し | 未検索 | 使えない（中身） |
| Geektime `https://www.geektime.co.il/feed/` | イスラエル | 未確認 | 403（feed、robots.txt とも、UA を変えても） | 判定不能 | 未計測 | - | 未検索 | 使えない |
| Wamda `https://www.wamda.com/feed` | 中東 | 資金調達・エコシステム | 200 | `PetalBot` のみ `Disallow: /` | 8/31〜9/10 | 無し | 未検索 | 使えない |
| TechCabal `https://techcabal.com/feed/` | アフリカ | アフリカテック業界ニュース | 200 | **`ClaudeBot` / `GPTBot` を `Disallow: /`** | 10 件（09-11〜09-13） | 無し | 未検索 | 使えない |
| Disrupt Africa `https://disrupt-africa.com/feed/` | アフリカ | スタートアップニュース | 200（301 経由）だが pubDate が 2024 年 1 月のまま | robots.txt は ModSecurity に阻まれ 406 | フィードが停止している疑い | 無し | 未検索 | 使えない |
| Meneame `https://www.meneame.net/rss2.php` | スペイン | 総合掲示板 | 200 | **テック絞り込みの `?tags=` 付き URL は `Disallow: /rss2.php?` で禁止** | 多数 | 無し | 未検索 | 使えない |

### 1.5 アプリストア・ニュースレター・動画・データ

| ソース | 地域 | 中身（サービス比率） | 取得（実測 HTTP・形式・認証） | robots/規約 | 量/日 | 順位信号 | 日本語ミラー | 判定 |
|---|---|---|---|---|---|---|---|---|
| Apple RSS Feed Generator `https://rss.marketingtools.apple.com/api/v2/us/apps/top-free/50/apps.json` | 各国（`jp` も 200） | 目算 9 割が既存の大手アプリ | 200、無認証、JSON/RSS/Atom | robots.txt は無制限 | 1 日 1 回更新（`updated` で確認）。新規入れ替わりは 未計測 | チャート順位 | 未検証 | 条件付き（ギャップ 0 でゲート 3 をほぼ満たさない） |
| Apple RSS の new-apps 系 | - | 存在しない | **404**（`new-apps-we-love`、`new-games-we-love`、`top-grossing`、`top-free-ipad`、`top-paid-ipad`、`new-apps`、`new-ios-apps`、`rising` を全て個別に実測）。UI 上も apps は top-free / top-paid の 2 種のみ | - | - | - | - | 使えない（**9/13 の「未検証」をここで確定させた**） |
| iTunes Search API `https://itunes.apple.com/search?term=X&entity=software` | グローバル | キーワード検索結果 | 200、無認証、JSON | **`Disallow: /search*`、`Disallow: /*/lookup?` を明記** | 日付でのブラウズ不可 | 無し | 未検証 | 条件付き（規約に抵触の可能性） |
| iTunes Lookup API `https://itunes.apple.com/lookup?id=X` | 同上 | 単一アプリの詳細（`releaseDate` 等を実測確認） | 200、無認証、JSON | 同上 | - | - | - | 条件付き（裏取り用の補助） |
| Google Play 新着 `https://play.google.com/store/apps/new` | グローバル | 公式の RSS/JSON 新着フィードは存在しない | トップチャートは 200（HTML）、RSS/JSON は 404 | `/store/apps` 全体の禁止はない | 未計測 | 構造化データなし | 未検証 | 使えない（**9/13 の「未検証」をここで確定させた**） |
| Mac App Store 新着 | - | - | `macapps` の media type / entity はいずれも 404 | - | - | - | - | 使えない |
| Microsoft Store `https://apps.microsoft.com/` | グローバル | 個別アプリ詳細 | 302。RSS/JSON API は未検出 | サイトマップあり | 未計測 | 星（構造化取得は未検証） | 未検証 | 使えない |
| Chrome Web Store（5 系統からも） | グローバル | 拡張機能一覧 | 一覧は 200 だが新着フィードなし。サイトマップは shard 分割の巨大 XML | `/search` と `/detail/*/report` のみ禁止 | 未計測 | 一覧では取れない | 未検証 | 使えない |
| Ben's Bites `https://www.bensbites.com/feed` | 英語圏 | 長文エッセイ形式、ツール名は文中に埋め込み | 200、Substack 標準 RSS | `/subscribe` 等のみ禁止 | 未計測 | 無し | 未検証 | 条件付き |
| Hacker Newsletter `https://hackernewsletter.com/` | 英語圏 | HN 記事の週刊まとめ | `/feed`、`/rss`、`/issues.rss` 全て 404。sitemap はホームページ 1 件のみ | 未確認 | 未計測 | 無し | 未検証 | 使えない |
| Refind `https://refind.com/rss` | 英語圏 | - | 200 だが **`/rss` は個別記事へのランダムリダイレクト**でフィードではない | 未確認 | - | - | - | 使えない |
| The Neuron `https://www.theneurondaily.com/feed` | 英語圏 | - | beehiiv 標準の 404 ページへリダイレクト | 未確認 | - | - | - | 使えない |
| Superhuman AI `https://www.superhuman.ai/feed` | 英語圏 | - | 404 | 未確認 | - | - | - | 使えない |
| Mindstream `https://www.mindstream.news/feed` | 英語圏 | - | 302 でホームページへ | 未確認 | - | - | - | 使えない |
| Tool Finder `https://www.toolfinder.co/feed` | 英語圏 | - | `.com` への誤字転送経由で最終的に 404 | 未確認 | - | - | - | 使えない |
| Toolify newsletter `https://newsletter.toolify.ai/feed` | 英語圏/中国系 | 月次で上位 5 ツール | `/feed`、`/rss` とも 403 | robots.txt 上は禁止されていないのに実際は取得不可（WAF の可能性） | 未計測 | 無し | 9/13 に「RSS なし」判定済み | 使えない |
| Software Applications Incorporated | 不明 | ニュースレターではなく企業名の可能性 | 推測 URL は名前解決失敗 / 404 | - | - | - | - | 未検証（対象誤りの可能性） |
| YouTube Data API v3 `search.list` | グローバル | 動画メタデータ | **無キーで 403**（`Method doesn't allow unregistered callers`）。キーがあれば 200 のはずだが未検証 | 公式ドキュメント <https://developers.google.com/youtube/v3/determine_quota_cost> によると `search.list` は 1 日 100 回、コスト 1 ユニット（旧来よく言われる数字と異なる。要実地確認） | 未計測 | 登録者数・再生数（別途） | 未検証 | 条件付き（要 API キー） |
| The Changelog podcast `https://changelog.com/podcast/feed` | 英語圏 | OSS/開発者向け対談 | フィードは 200 | **`changelog.com/robots.txt` が `disallow: /` とサイト全体を全面禁止** | 週 1 回 | 無し | 未検証 | 使えない |
| Syntax.fm `https://feed.syntax.fm/rss` | 英語圏 | Web 開発者向け対談 | 200（リダイレクト後） | `/admin`、`/haters`、`/api` のみ禁止 | 週 2 回 | 無し | 未検証 | 条件付き（頻度不足） |
| Indie Hackers podcast `https://feeds.transistor.fm/the-indie-hackers-podcast` | 英語圏 | 対談・インタビュー | 200、RSS、認証不要 | `feeds.transistor.fm/robots.txt` は "Bad Request" で内容確認不可 | 未計測 | 無し | 未検証 | 条件付き |
| Wikipedia 新規記事 `https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&rctype=new` | 英語版 | 全ジャンル混在 | 200、無認証、JSON | **`User-agent: *` に `Disallow: /w/` があり `action=query` はその対象内**。一方で財団の User-Agent policy は適切な API 利用を許可しているという運用実態がある（一次資料未確認） | 数秒に 1 件（ソフトウェア限定は 未計測） | 無し | 未検証 | 条件付き（解釈が曖昧、ゲート 3 も構造的に厳しい） |
| Wikidata SPARQL `https://query.wikidata.org/sparql` | グローバル | ソフトウェア項目のクエリ | 200（UA 指定・リトライ後）、無認証 | **robots.txt が `Disallow: /sparql` と明示** | 未計測 | 無し | 未検証 | 使えない |
| Google Trends 日次 RSS `https://trends.google.com/trends/trendingsearches/daily/rss` | 各国 | - | **404**（公式 RSS は廃止済み） | - | - | - | - | 使えない |
| Crunchbase `https://www.crunchbase.com/discover/organization.companies` | グローバル | 企業情報 | 403 | `/login` 等のみ禁止だが実際はブロック。有料プロダクト | 未計測 | 資金調達額 | 未検証 | 使えない |
| Product Hunt Golden Kitty `https://www.producthunt.com/golden-kitty-awards` | グローバル | 年間ベスト | 200（HTML）、専用フィードなし | - | 年 1 回 | 部門別受賞 | 未検証 | 使えない（頻度） |
| G2 Best Software Awards `https://www.g2.com/best-software-companies` | グローバル | 年次ランキング | 403 | 特定クエリのみ禁止 | 年 1 回 | カテゴリ別ランキング | 未検証 | 使えない |
| Substack Discover `https://substack.com/discover/category/technology` | 英語圏 | 人気ニュースレターのランキング（ツールではない） | 301 → 200 | `/subscribe` 等のみ禁止 | 未計測 | 有料購読者数 | 未検証 | 使えない |
| Medium タグ RSS `https://medium.com/feed/tag/saas` | 英語圏 | 個人ブログ記事。目算 1〜2 割がツール言及を含む記事、単体紹介は直近 8 件で 0 件 | 200、無認証、RSS | `/feed` への明示的禁止は無し | **実測 3 時間で 8 件 ≒ 約 20〜30 件/日** | 無し（RSS に含まれず） | 未検証 | 条件付き（ゲート 1 の通過率が低い） |

## 2. 使えるものの深掘り

「使える」または「条件付きだが実力がある」と判定されたものについて、実装に必要なことを書く。信号の推定値のうち、実測でないものには 未計測 と付けた。

### 2.1 Fazier（最有力）

- **エンドポイント**: `https://fazier.com/` の `<script id="__next-data__">`（Next.js 埋め込み JSON）、または `https://fazier.com/_next/data/<buildId>/index.json`。認証不要、200。
- **実際に見えたもの**: 日付ごとにグループ化されたローンチ一覧。各 item に名前、タグライン、`upvotes_count`、`comments_count`、`pricing_type`、`launch_date`。
- **量**: 実測 09-13=21, 09-12=14, 09-11=16, 09-10=13, 09-09=15 件。5 日平均 約 16 件/日。
- **投稿できる推定**: 16 × 道具比率 7〜8 割（目算）= 11〜13 件/日。**クールダウン上限 4 件/日に当たる。** ゲート 1・ゲート 3 の実通過率は 未計測。
- **モジュールに要るもの**:
  - `fetchCandidates`: ホーム HTML を `ctx.getText` で取り、`__NEXT_DATA__` を抜いて JSON.parse。`buildId` を拾って `/_next/data/<buildId>/index.json` に切り替えてもよい。`upvotes_count >= N`（パラメータ）で絞る。
  - `digestInput`: `{ name, text: tagline, url }`。
  - `format` の看板: `【海外で話題のツール】{name}：{oneLiner}【Fazier・{upvotes}pt】`。
- **リスク**: (1) `buildId` がデプロイごとに変わる。ホーム HTML から都度拾う実装にしないと壊れる。(2) Next.js の RSC ペイロードなので構造が変わりうる。**取得は HTML スクレイピング扱い**で、ブリーフの「最後の手段」に当たる。(3) AI ツールの量産 SaaS が多く、質のばらつきがある（目算）。(4) 日本語ミラーの有無が 未検証。

### 2.2 GitHub Search API（トピック + `homepage` 必須）

- **エンドポイント**: `https://api.github.com/search/repositories?q=topic:self-hosted+created:>2026-09-07+stars:>20&sort=stars`。無認証 200、**レート制限 10 回/分**（`X-RateLimit-Limit: 10` 実測）。`GITHUB_TOKEN` があれば 30 回/分。
- **実際に見えたもの**: `fossaryhq/catalog`（自己ホスト型アプリの Docker Compose レシピ集、★89）、`herliansyah/teledrive`（Telegram を裏側ストレージにした個人クラウド）、`GagnDeep/mailysend`（Cloudflare Workers 上の Resend 互換メール送信、ワンクリックデプロイ）。**実見 7 件中 6 件が明確なプロダクト。**
- **量**: `topic:self-hosted` の 1 系統で 7 件/7 日（実測）。トピックを 5 本ほど回せば 3〜8 件/日（**推定、未計測**）。
- **投稿できる推定**: 3〜5 件/日。クールダウン上限 4 件/日。
- **モジュールに要るもの**: 既存の `bandit/src/sources/github-new-repos.mjs` を直す。(1) `per_page=10` を 50〜100 に上げる（4 章参照）。(2) `topics` をパラメータで受けて複数クエリを回す。(3) `fork:false archived:false` を足す。(4) `homepage` が空のものを落とす（9/13 実測で、90 日/1000★の上位 30 件のうち 22 件が `homepage` あり）。
  - `digestInput`: 現行どおり `{ name: fullName, text: description, url }`。
  - `format` の看板: 現行どおり `【GitHub・★{stars}】`。
- **リスク**: (1) レート制限 10 回/分。トピックを増やすとすぐ当たる。(2) 中身が AI・LLM 開発基盤に偏る（9/13 の懸念そのまま）。(3) フォーク・アーカイブ済みの混在。

### 2.3 Launch YC

- **エンドポイント**: `https://www.ycombinator.com/launches`。**curl でそのまま `Content-Type: application/json` の Algolia 形式 JSON が返る**（HTML ではない）。認証不要 200。`nbHits` 3277、1 ページ 20 件。
- **実際に見えたもの**: YC ポートフォリオ企業の新製品・機能ローンチ。各 item に `created_at`、`total_vote_count`、企業タグ、URL。日付分布は 09-10=7, 09-09=5, 09-08=1, 09-07=2, 09-04=1, 09-02=3, 09-01=1。
- **投稿できる推定**: **未計測**。新着順ソートかどうかが未確認のため日次件数が出せない。道具比率は目算 5〜6 割（軍事ロボット、研究ベンチマークが混在）。目安として 2〜4 件/日。
- **モジュールに要るもの**: `fetchCandidates` は `ctx.getJson` 一本で済む（最も実装が軽い）。`hits` から `created_at` で直近 N 日を絞る。`digestInput`: `{ name, text: tagline, url }`。看板: `【Launch YC・{total_vote_count}票】`。
- **リスク**: (1) ソート順が不明。新着順を明示するパラメータを見つけるまで、古い item を拾い続ける可能性がある。(2) YC 企業は資金調達の報道が日本語でも出やすく、ゲート 3（はてブ 30 未満）で落ちる比率が 未計測。

### 2.4 dev.to showdev

- **エンドポイント**: `https://dev.to/api/articles?tag=showdev`。公式の無認証 JSON、200。
- **実際に見えたもの**: 実測 10 件中 3〜4 件が「今日使えるサービス」（PDF ツールキット、Raspberry Pi ダッシュボード等）。残りは技術解説記事や言語学習ネタ。
- **投稿できる推定**: 1〜2 件/日（**総量が 未計測**なので、この数字は目安）。
- **モジュールに要るもの**: `ctx.getJson` 一本。`reactions_count >= N` で絞る。`digestInput`: `{ name: title, text: description, url }`。ただし**記事の URL であってツールの URL ではない**ので、ゲート 3（はてブ件数）をツールのドメインに対して引けない。ここは 9/13 の 3.2 の注意にそのまま当たる。看板: `【dev.to Show Dev・{reactions}】`。
- **リスク**: (1) ツール URL が取れない（上記）。(2) 宣伝色の強い記事が混在。(3) 道具比率 3〜4 割で LLM のゲート 1 呼び出しが無駄打ちになる比率が高い。

### 2.5 V2EX 分享创造（中国語）

- **エンドポイント**: `https://www.v2ex.com/feed/create.xml`。200、Atom、認証不要。robots.txt は `/backstage/`、`/signin`、`/signout`、`/settings` のみ禁止で、**ボットの名指し禁止は見当たらない**。
- **実際に見えたもの**: PhotoBridge（iPhone から Pixel へ Wi-Fi 経由で写真・動画を転送）、StorePal（独立系アプリ向けのサポートページ・プライバシーポリシー生成プラットフォーム）、Torrid（無料の macOS 用ダウンロードソフト）。道具比率は目算 8 割以上。
- **量**: 実測で 50 件が 2026-09-11T21:08〜09-13T23:38（約 2.1 日）= **約 24 件/日**。ただし `updated` が返信 bump を含む可能性があり、純新規の件数は 未検証。
- **投稿できる推定**: 上限 4 件/日に当たる見込み。ただし bump の検証が先。
- **モジュールに要るもの**: Atom パース（既存の依存で足りるか要確認）。`digestInput`: `{ name: title, text: summary, url }`。日本語ダイジェストの入力が中国語になるので、**ダイジェストのプロンプトが中国語入力を想定しているかの確認が要る**（現状は未確認）。看板: `【V2EX 分享创造・返信{replies}】`。
- **リスク**: (1) bump 込みの件数かどうかが未検証で、実供給量が 1/2 以下になる可能性。(2) 名前が中国語のみの item が多く、日本語の紹介文が書きにくい。ラテン文字名のものだけを通すフィルタが要るかもしれない。(3) 一部に宣伝・アフィリエイト的な投稿が混ざる可能性（目視では明確なスパムは無し）。

### 2.6 Disquiet（韓国、規約の判断待ち）

- **エンドポイント**: `https://disquiet.io/products.json`（`?page=2` でページング可）。200、JSON、認証不要。
- **実際に見えたもの**: cinelog（映画を記録すると星が灯る記録アプリ、`https://cinelog.dev`）、stage-gen（アートディレクションと参考画像から 2D ゲームのキャラ・背景を生成する OSS、`https://github.com/softmarshmallow/stage-gen`）、thread0（Claude/GPT の複数サブスクを 1 画面で切り替える、`https://thread0.ai`）。
- **量**: 実測 20 件が 09-08T06:52〜09-13T22:31（約 5.7 日）= **約 3.5 件/日**。道具比率は目算 8 割以上。
- **投稿できる推定**: 約 2.8 件/日。
- **モジュールに要るもの**: `ctx.getJson` 一本。`digestInput`: `{ name, text: tagline, url }`。看板: `【Disquiet・韓国】`（票数がこの JSON に無いので数字は入れられない）。
- **リスク**: **robots.txt が `User-agent: ClaudeBot / Disallow: /` を名指しで指定**（`User-agent: *` は `Allow: /`）。3 章の判断次第。ほかに、ハングル名の item が多く日本語話者が検索しにくい、β テスト段階でリンク非公開の item が混ざる。

### 2.7 GeekNews Show GN（韓国、規約の判断待ち）

- **エンドポイント**: `https://news.hada.io/rss/news`。200、Atom、認証不要。
- **量**: 実測で直近 50 件が約 23 時間分、うち「Show GN」タグは **2 件（約 4%）**。
- **投稿できる推定**: 約 2 件/日（サンプル 1 回分のみ）。
- **モジュールに要るもの**: Atom パース + タイトルの「Show GN」判定。看板: `【GeekNews・Show GN】`。
- **リスク**: `Content-Signal: ai-train=no, search=yes, ai-input=yes` で、**ClaudeBot は名指しで `Disallow: /`**（Claude-User / Claude-SearchBot は許可）。量が少なく、単体では投稿枠を埋められない。

### 2.8 awesome-selfhosted-data のコミット

- **エンドポイント**: `https://api.github.com/repos/awesome-selfhosted/awesome-selfhosted-data/commits`。200。
- **実際に見えたもの**: `add NutriTrace (#2989)` のような「1 PR = 1 新規ソフト追加」のコミット。**確認できたのは 9/11 の 1 件のみで、サンプル 3 件はそろっていない（調査担当が明記）。** 他はメタデータ更新 bot（`[bot] update projects metadata`）。
- **量**: `add` 系コミットは数日に 1 件程度（**未計測**）。約 0.3 件/日。
- **投稿できる推定**: 0.3 件/日。**単体では枠を埋められないが、道具比率が 9 割以上（目算）と最も高い。**
- **モジュールに要るもの**: コミットメッセージから `add <名前> (#NNNN)` を正規表現で抜き、その PR が追加した YAML ファイルを取りに行く（追加のリクエストが要る）。`digestInput`: `{ name, text: description, url: website }`。看板: `【awesome-selfhosted】`。
- **リスク**: (1) 追加のリクエストが 1 item あたり 1〜2 回増える。(2) 頻度が低いので、他ソースの補助としてしか使えない。

### 2.9 Firefox Add-ons（AMO）

- **エンドポイント**: `https://addons.mozilla.org/api/v5/addons/search/?sort=hotness&app=firefox&type=extension`。200。robots.txt は `/api/` を制限していない。
- **実際に見えたもの**: `gg-deals-compare-game-prices`（ゲーム価格比較）、`gofullpage-screenshot`（ページ全体スクリーンショット）、`cookie-editor-free`（Cookie 編集、実利用者数 886/日、実測）。
- **量**: hotness 上位 50 件の作成日は 2026 年 8〜9 月上旬に集中、**直近 7 日以内作成は 0 件**。日次の新着ではなく週単位の入れ替わり。
- **投稿できる推定**: 0.5〜1 件/日（**未計測**）。
- **モジュールに要るもの**: `ctx.getJson` 一本。`average_daily_users >= N` で絞る。`digestInput`: `{ name: name.en-US, text: summary, url }`。看板: `【Firefox アドオン・日次{average_daily_users}人】`。**`average_daily_users` は「海外で使われている証拠」として、このリスト中で最も直接的な信号。** ゲート 2 に効く。
- **リスク**: (1) テーマやゲーム拡張が 2〜3 割混ざる（目算）。(2) 「入れ替わりが週単位」なので、同じ item を繰り返し拾う。既存の重複記録で弾けるが、候補が枯れやすい。

### 2.10 Console.dev

- **エンドポイント**: `https://console.dev/rss.xml`。200、RSS、認証不要。robots.txt は `Disallow: /landing` のみ。
- **実際に見えたもの**: `Tool: htmx 4`、`Tool: Solo`、`Beta: WebLLM`（ブラウザ内 LLM 実行）、`Beta: Copperhead`。**1 エントリ = 1 ツールで、`Tool:` / `Beta:` のプレフィックス付き。** ゲート 1 の構造が最初から入っている。
- **量**: 実測 9 件/号、週刊 = **約 1.3 件/日**。
- **投稿できる推定**: 約 0.7 件/日（道具比率は目算 5 割。htmx のようなライブラリ寄りが半分）。
- **モジュールに要るもの**: RSS パース + プレフィックス判定。`digestInput`: `{ name: title からプレフィックスを除いたもの, text: description, url }`。看板: `【Console.dev】`。
- **リスク**: 量が少ない。単体では補助。

### 2.11 Product Hunt 公開 Atom（9/13 の判定を更新する材料）

- **エンドポイント**: `https://www.producthunt.com/feed`。200、Atom、認証不要。
- **ハルの実測（2026-09-14 08:41 JST）**: 51 エントリ。`published` は 2026-08-14〜09-11（09-08=5, 09-09=7, 09-10=19, 09-11=2）。`updated` は全件 09-13。**最新の `published` でも 3 日前。**
- **読み取れること**: これは「今日のローンチ一覧」ではなく、**運営が選んだ featured の遅延リスト**。1 日あたり 5〜10 件で、9/13 に書いた「10〜20 件」は正しくなかった。`updated` が全件同じなので、更新日では鮮度を判定できない。
- **投稿できる推定**: 5〜10 × 高い道具比率 = 4〜8 件/日の候補は出る。**が、ゲート 3 で構造的に不利。** 日本語ミラー（producthunt.news、producthunt.hatenablog.com）が毎日動いているので、はてブ件数が伸びやすい。実効の通過率は 未計測。
- **モジュールに要るもの**: Atom パース。票数がフィードに無いので、`format` の看板に数字を入れられない（`【Product Hunt】`）。ゲート 2（海外で定着しているか）の信号が取れないのは 9/13 の判定のままで変わっていない。
- **リスク**: 3 日遅れ、票数なし、日本語ミラーあり。**churn（どれだけ入れ替わるか）を測る 2 回目のスナップショットを取る予定。** それを見てから足すかどうかを決めるのが筋。

### 2.12 BetaList

- **エンドポイント**: `https://feeds.feedburner.com/BetaList`（`/feed` は 404）。200、25 件（9/13 実測）。robots.txt は実質無制限。
- **量**: 未計測（1 日数件）。
- **リスク**: 票も★も無い（編集者の選定のみ）。掲載に有料枠があり、未完成のサービスが多い。ゲート 2 を満たさない item が多くなる見込み。

### 2.13 Hacker News トップ（`topstories`）

- **エンドポイント**: `https://hacker-news.firebaseio.com/v0/topstories.json`。既存モジュールの `feed: 'top'` でパラメータだけで切り替わる。**実装コストがゼロ。**
- **量**: 道具は 1〜2 割（9/13 実測の目算）。100pt 以上の item は常時あるが、投稿できる件数は 未計測。目安 0.5〜1 件/日。
- **リスク**: 政治・AI 規制論が常時上位（9/13 実測で上位 8 件中 4 件）。ゲート 1 の無駄打ちが増える。既存の `hackernews` ソースと同じ `id` なので、**別ソースとして bandit に登録するならモジュール ID を分ける必要がある**（同じ ID だとクールダウンと事後分布を共有してしまう）。

### 2.14 Korben（フランス、規約の判断待ち）

- **エンドポイント**: `https://korben.info/feed`。200、RSS。
- **実際に見えたもの**: OmniVoice（ローカルで動く音声クローン）、Pluton（ブラウザから操作する暗号化バックアップ）、DocuSeal（自前サーバーで文書に署名）。**いずれもラテン文字の固有名詞 + フランス語の一言説明で、Show HN 的な型に近い。**
- **量**: 実測 25 件/8 日（09-04〜09-11）= 約 3 件/日。道具比率は目算 6〜7 割で、**地域調査の中で最も高い**。
- **投稿できる推定**: 約 2 件/日。
- **リスク**: `Content-Signal: search=yes, ai-train=no, use=reference` に加えて **ClaudeBot / GPTBot / CCBot / Google-Extended を個別に `Disallow: /`**。3 章の判断次第。

### 2.15 Journal du Hacker（フランス、規約は最良）

- **エンドポイント**: `https://www.journalduhacker.net/rss`、JSON は `/hottest.json` と `/newest.json`（`/latest.json` は 404）。200。
- **robots.txt**: `User-agent: * / Allow: /` のみ。**AI ボットの個別拒否なし。今回調べた中で最もクリーン。**
- **実際に見えたもの**: Sideshow（エージェントの動きを可視化するツールの紹介動画。ツール自体ではない）、Veille #73（週刊まとめ、ツールではない）、Migration de Github vers une alternative europeenne（移行体験記）。**サンプル 15 件で「今日使えるツール」に直接該当するのは実質 0 件。**
- **量**: 15〜25 件/1〜2 日。道具比率 1〜2 割以下（目算）。
- **投稿できる推定**: 0.3〜0.6 件/日。
- **モジュールに要るもの**: `/newest.json` を `ctx.getJson`。`score`、`upvotes`、`comment_count` あり。看板: `【Journal du Hacker・{score}票】`。
- **リスク**: 量が出ない。規約は良いが、ゲート 1 の無駄打ちが多い。

### 2.16 Habr（ロシア）

- **エンドポイント**: `https://habr.com/ru/rss/`。200。robots.txt は `Crawl-delay: 10` のみで全面禁止なし。
- **量**: フィードに 40 件、常時更新。道具比率は目算で低い。日次件数は 未計測。
- **ハブ別フィード**（例 `/ru/rss/hub/programming/`）は 301 リダイレクト後 200 だが、**中身のサンプリングは未実施で道具比率が上がるかは 未検証**。
- **投稿できる推定**: 未計測。
- **リスク**: 記事中心。ハブで絞れるかの検証が先。

## 3. robots.txt と AI bot の扱い（運用判断）

### 3.1 起きていること

今回の調査で、**`User-agent: ClaudeBot` を名指しで `Disallow: /` にしているサイトが、調査対象の相当数**に見つかった。確認できたものだけで、Disquiet、GeekNews、ifanr、INSIDE、e27、Startup Daily、Kompas.com、Korben、Tproger、Heise、Sifted、TechCabal、Docker Hub、Softpedia。さらに `Content-Signal` で `ai-train=no` を宣言するサイト（Korben、ifanr、GeekNews、iThome、programming.dev）もある。一方で **ClaudeBot を明示的に `Allow` しているサイト**もある（Capterra、Tech.eu、Webrazzi）。

この記法は 2026 年に入ってから広まったもので、多くのメディアが採用している（調査担当の観察）。

### 3.2 こちら側の事実

- 風見鶏の fetcher が名乗る User-Agent は **`foreword-bot/0.2 (+https://bsky.app/profile/foreword.project-haru.org; +https://github.com/taka3f80/claude-code-web-test)`**（`bandit/src/lib/http.mjs`）。ClaudeBot でも GPTBot でもない。
- 取ったテキストは LLM に渡して日本語のダイジェストを書かせる。**学習には使っていない。** 用途としては `ai-train` ではなく、`ai-input` / `use=reference` に近い。
- 取得するのは公開 RSS / 公開 JSON で、認証を回避していない。頻度は 1 日 6 回。

つまり**文字どおりに読めば、名指しの ClaudeBot 禁止はこちらに当たらない。** しかしサイト運営者の意図（AI に読ませたくない）は明確。

### 3.3 選択肢

| 案 | 中身 | 使えるソース | 失うもの |
|---|---|---|---|
| **(a) `User-agent: *` の規則だけを守る** | 名指しの AI ボット禁止と Content-Signal は「うちの UA には当たらない」として無視する | 上の全部。Disquiet（2.8 件/日）、GeekNews（2 件/日）、Korben（2 件/日）が加わり、**余裕が 1 日 7〜8 件増える** | BUSINESS.md 8 の「各社のガイドに従う」との整合。Foreword は海外ベンダーに「日本展開の方法」を売る事業で、**そのベンダー自身が AI クローラをブロックしている側**でもある。指摘されたときに説明できる立場を失う |
| **(b) 名指しの AI クローラ禁止と Content-Signal も尊重する** | ClaudeBot / GPTBot を名指しで禁止しているサイト、`ai-input=no` を宣言しているサイトは使わない | Fazier、Launch YC、dev.to、V2EX、GitHub、AMO、Console.dev、Product Hunt、BetaList、HN、Journal du Hacker、Habr、TabNews、Medium、Mastodon | Disquiet、GeekNews、Korben、ifanr、INSIDE、e27、Startup Daily、Tproger、Heise、Sifted、TechCabal、Kompas、Docker Hub、Softpedia。**質の高い 3 本（Disquiet / GeekNews / Korben）が丸ごと落ちる** |
| **(c) サイトごとに個別判断** | 「学習は禁止だが参照は許可」と読めるものは使う。iThome（`ai-input=yes`、学習目的のみ禁止と明記）、Inc42（Claude-User は全体 Allow）、Korben（`use=reference`）はこの型 | (b) + Korben + 読み方次第で数本 | 判断の一貫性がなくなる。robots.txt の解釈は機械では自動化できないので、ソースを足すたびに人が読むことになる。Heise のように**同一ファイル内で記述が矛盾している**サイトもある |

### 3.4 ハルの推奨

**(b) を推す。理由は 3 つ。**

1. **BUSINESS.md 8 が「ロゴと商標は各社のガイドに従う」と書いている。** robots.txt は各社のガイドそのもの。名指しの禁止を「UA が違うから当たらない」と読むのは、ガイドの文字に従ってガイドの意図に背く動き方で、9/13 に Lobsters を落としたときの判断と矛盾する。
2. **Foreword の商品は「海外ベンダーに信用される日本人」という立場そのもの。** ソースの取り方で一度でも指摘されたら、商品ごと傷む。得られるのは 1 日 7〜8 件の余裕で、失うリスクに見合わない。
3. **(b) でも 6 本/日は届く。** 0.2 の構成は全て (b) の範囲内。規約で妥協しなくても目標は達成できる。

**ただし 3 つ、正直に付け加える。**

- (b) を選ぶと、**アジアと欧州のローカルなソースがほぼ全部落ちる**。風見鶏の item が英語圏と中国語圏（V2EX）に偏る。「世界中を探す」という今回の目的の一部は達成できない。
- Korben は惜しい。道具比率が地域調査中で最高で、`use=reference` という Content-Signal は「参照なら可」と読める。**(c) を選ぶならここが最初の対象。**
- Content-Signal を機械で読む実装はしていない。(b) を選んだ場合も、**「ソースを足すときに人が robots.txt を読む」という運用**になる。自動では守れない。

**これはタカさんが決めること。** ハルは (b) を推すが、(a) や (c) を選んだ場合の構成も 4 章の表から組める。

## 4. 6 本/日への道筋

### 4.1 数字の台帳

「投稿できる推定/日」は、生の件数 × 道具比率（目算）で出した概算。**実測はゲート適用前の生の件数だけ**で、ゲート通過後の実数を測ったソースは 1 つも無い（Show HN のサンプル 3 件を除く）。

| ソース | 生の件数/日 | 実測か | 道具比率（目算） | 投稿できる推定/日 | クールダウン上限 |
|---|---|---|---|---|---|
| Show HN（10pt 以上） | 8.7 | **実測**（HN Algolia、14 日） | ゲート 1 通過 約 1/2（3 サンプル） | 4.4 → 上限 4 | 4 |
| Show HN（20pt 以上） | 4.5 | **実測**（同上） | 同上 | **約 2.2** | 4 |
| Show HN（30pt 以上、現行） | 3.5 | **実測**（同上） | 同上 | **約 1.8** | 4 |
| Show HN（100pt 以上） | 1.3 | **実測**（同上） | 同上 | 約 0.7 | 4 |
| Fazier | 16 | **実測**（5 日） | 7〜8 割 | 11〜13 → **上限 4** | 4 |
| V2EX 分享创造 | 約 24（bump 込みの疑い） | **実測**（2.1 日） | 8 割以上 | 19 → **上限 4** | 4 |
| GitHub トピック横断 | 1（self-hosted 単独、7 件/7 日） | **実測**（1 トピックのみ） | 8 割以上 | トピック 5 本で **3〜5**（未計測） | 4 |
| Product Hunt Atom | 5〜10 | **実測**（2026-09-14、4 日分） | 高い | 4〜8。ただしゲート 3 で大幅減の見込み（未計測） | 4 |
| Disquiet | 3.5 | **実測**（5.7 日） | 8 割以上 | **約 2.8** | 4 |
| Korben | 約 3 | **実測**（8 日） | 6〜7 割 | **約 2** | 4 |
| GeekNews Show GN | 約 2 | **実測**（23 時間、1 サンプル） | 高い | **約 2** | 4 |
| Launch YC | 未計測 | 1 ページ 20 件、直近日で 5〜7 件 | 5〜6 割 | 目安 2〜4 | 4 |
| dev.to showdev | 未計測 | 10 件サンプルのみ | 3〜4 割 | 目安 1〜2 | 4 |
| Console.dev | 1.3 | **実測**（9 件/週） | 5 割 | **約 0.7** | 4 |
| Firefox AMO | 週単位 | 未計測（日次） | 7〜8 割 | 目安 0.5〜1 | 4 |
| awesome-selfhosted | 数日に 1 件 | 未計測 | 9 割以上 | 約 0.3 | 4 |
| HN トップ（100pt 以上） | 未計測 | - | 1〜2 割 | 目安 0.5〜1 | 4 |
| Journal du Hacker | 15〜25/1〜2 日 | **実測** | 1〜2 割以下 | 0.3〜0.6 | 4 |
| BetaList | 未計測 | 25 件のフィード | 中 | 未計測 | 4 |
| Habr | 未計測 | 40 件のフィード | 低い | 未計測 | 4 |
| **台帳 30 本** | **決定的** | 在庫 30 本 + 補欠 18 本 | **人手で確認済み** | **1（決め打ち）** | 4 |

### 4.2 組み合わせ

| 組み合わせ | 構成 | 合計/日 | 6 本 + 余裕に届くか |
|---|---|---|---|
| **現状** | Show HN(30pt) 1.8 + GitHub(現行) ほぼ 0 | **約 1.8** | **届かない。目標の 3 割** |
| **A（推奨、規約 (b) の範囲）** | Show HN(20pt) 2.2 + Fazier 4 + GitHub トピック 3〜5 + 台帳 1 | **約 10〜12** | **届く。余裕 4〜6** |
| B（Fazier を外した保守案） | Show HN(20pt) 2.2 + GitHub トピック 3〜5 + Console.dev 0.7 + 台帳 1 + AMO 0.5〜1 | **約 7.4〜9.9** | 届く。余裕 1.4〜3.9。**GitHub の推定が外れると割れる** |
| C（最小手数） | Show HN(20pt) 2.2 + Fazier 4 | **約 6.2** | **ぎりぎり。余裕がほぼ無い**。Fazier が壊れたら即割れる |
| D（規約 (a) を選んだ場合） | A + Disquiet 2.8 + Korben 2 + GeekNews 2 | **約 17〜19** | 大きく届く |
| E（V2EX を足す） | A + V2EX 4 | **約 14〜16** | 届く。ただし bump の検証と中国語の扱いが前提 |

**A を推す。** C は 1 本壊れたら終わりで、「余裕を持って」の条件を満たさない。B は Fazier を避けられるが、GitHub トピック横断の 3〜5 件が未計測の推定なので、下振れすると 6 を割る。A は 2 本が同時に壊れても Show HN + 台帳 + 残り 1 本で 5〜7 件が残る。

**確実に言える床を改めて書く。** 実測で裏が取れているのは Show HN の約 2.2 件/日と台帳の 1 件/日で、**合計 3.2 件/日**。残りの 3〜8 件は全部「生の件数は実測、ゲート通過率は未計測」の推定の上に乗っている。**最初の 2 週間は、推定が当たっているかを `runs.json` で数えることが仕事になる。**

### 4.3 台帳 30 本を決定的ソースとして使う

`docs/research/2026-09-12-tool-gap-candidates.md` の 30 本 + 補欠 18 本は、**ゲート 1（道具か）とゲート 3（日本で未紹介か）を人手で通した在庫**。自動ソースが持っていない性質が 2 つある。

1. **ゲート 2（海外で定着しているか）を満たす。** Skool（ARR $26〜50M、有料ホスト 1 万超）、Arcade（$14M 調達、G2 4.7）、Chatwoot（YC 出身）のように、何年も動いている。9/13 の 4.1 が書いたとおり、**新着フィードは原理的に「定着したもの」を出せない**。台帳はそこを埋める唯一の手段。
2. **決定的。** ソースが 403 になろうが 429 になろうが、必ず 1 件出せる。**6 本/日の床を作るのはこれ。**

- **供給量**: 30 本 + 補欠 18 本 = 48 本。1 日 1 本なら 48 日分。表現の実験（同じツールを複数の言い方で出す、BUSINESS.md 3）を回すなら 1 ツールあたり 3 通りで 144 日分。
- **モジュールに要るもの**: `data/` に JSON を置き、`fetchCandidates` は「まだ投稿していないものを 1 件返す」だけ。ネットワーク呼び出しゼロ。`digestInput`: `{ name, text: 「何か」の列, url }`。看板: `【Foreword の候補】`（外部ソースではないので、票数や★の代わりに何を出すかは要検討）。
- **注意**: 台帳の item は既に日本語で選定理由が書かれている。**ダイジェストに「元データに無い事実」を足させない**（BUSINESS.md 8）よう、digestInput に渡すのは台帳の記述に留める。

### 4.4 GitHub の `per_page=10` の制限

現行の `bandit/src/sources/github-new-repos.mjs` は以下で固定されている。

```
`https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`
```

**★の多い上位 10 件しか見ていない。** これだと (1) backlog（溜め置き）が作れない、(2) 同じ上位 10 件を毎回見るので、投稿済みを除くとすぐ枯れる、(3) `homepage` を持つものだけに絞ると 10 件中 2〜3 件しか残らない。

直すべきこと: `per_page` を 50〜100 に上げる。トピックを複数回すならページングも要る。ただし**無認証だと Search API は 10 回/分**（実測）なので、1 回の実行で叩けるクエリ数に上限がある。`GITHUB_TOKEN`（GitHub Actions なら既にある）を使えば 30 回/分。

## 5. 実装の順番

BUSINESS.md 6 の「一度に変える改善は一つ」に従う。各段階の後に、次に進む前に実測を見る。

| 順 | 変更 | 手間 | 触る場所 | 後で見るもの |
|---|---|---|---|---|
| 1 | `hackernews` の `minScore` を 30 → 20 | **小**（パラメータのみ） | `data/bsky/sources.json` | 1 週間の `runs.json`。投稿できた件数が 1.8 → 2.2 に近づくか。ゲート 1 で落ちる比率が上がりすぎないか（3 サンプルしか無い通過率 1/2 を、ここで実数に置き換える） |
| 2 | GitHub ソースを直す（`per_page` を 50 に、`topics` パラメータ、`homepage` 必須、`fork:false archived:false`） | **中**（既存モジュール 1 本 + テスト） | `bandit/src/sources/github-new-repos.mjs`、`sources.json` | トピック横断で 1 日何件残るか。3〜5 件の推定が当たっているか。レート制限（10 回/分）に当たらないか |
| 3 | **台帳 30 本のソースモジュールを新規** | **中**（新規モジュール 1 本 + データ JSON + テスト） | `bandit/src/sources/foreword-ledger.mjs`（新規）、`data/` に JSON | 床が効いているか。1 日 6 本のうち何本がこれで埋まったか。埋まりすぎているなら他のソースが弱い証拠 |
| 4 | **Fazier のソースモジュールを新規** | **中**（新規モジュール 1 本 + HTML/JSON パース + テスト） | `bandit/src/sources/fazier.mjs`（新規）、`sources.json` | ゲート 1 の通過率（推定 7〜8 割が当たっているか）。`buildId` が変わったときに壊れないか。AI 量産 SaaS の比率 |
| 5 | Console.dev を足す | **中**（新規モジュール 1 本、RSS パースが要る） | `bandit/src/sources/console-dev.mjs`（新規） | 0.7 件/日の推定が当たるか。`Tool:` と `Beta:` のどちらの渡り率が高いか |
| 保留 | Product Hunt Atom | - | - | **2 回目のスナップショットで churn を測ってから判断。** 今の材料（3 日遅れ、票数なし、日本語ミラーあり）では 9/13 の「足さない」を覆せない |
| 保留 | V2EX 分享创造 | - | - | **bump 込みかどうかを数日観察してから。** 中国語入力をダイジェストが扱えるかの確認も先 |
| 保留 | Launch YC | - | - | ソート順のパラメータを特定してから |
| 判断待ち | Disquiet / GeekNews / Korben | - | - | 3 章のタカさんの判断 |

**3 を 4 より先に置く理由**: 台帳は外部依存がゼロなので、確実に床ができる。Fazier は実装が壊れやすい（HTML スクレイピング + `buildId` 変動）ので、床を作った後に足す方が安全。

**注意（9/13 の 4.2 と同じ）**: ソースを足すと、bandit の Beta 事後分布は新しいソースについてゼロから始まる。`explorationDays: 3` の探索期間があるので、足した直後の 3 日間は渡り率の低いソースにも枠が回る。**1 日 6 本が埋まるかどうかの判定は、探索期間が終わってからにする。**

## 6. 検証した方法とできなかったこと

### 6.1 検証した方法

- 5 系統の調査エージェントが、2026-09-13〜14 に各エンドポイントを curl（一部 WebFetch）で実際に叩いた。HTTP ステータス、`Content-Type`、認証の要否は全て実測値。User-Agent は `Mozilla/5.0` 相当、または既定のものを使った（サイトによって挙動が変わったものはその旨を表に書いた）。
- robots.txt は各サイトで実際に取得して読んだ。取得できなかったもの（EU-Startups の 403、Niebezpiecznik の Cloudflare チャレンジ、Disrupt Africa の 406、feeds.transistor.fm の "Bad Request"）はそう書いた。
- 件数は実データから数えた。Fazier は日付ごとのグループを数え、V2EX と Disquiet は Atom / JSON の日時の幅を日数で割った。
- ハル が 2026-09-14 08:41 JST に Product Hunt の公開 Atom を取得し、51 エントリの `published` と `updated` を数えた。
- Show HN の件数（10pt 8.7/日、20pt 4.5/日、30pt 3.5/日、100pt 1.3/日）は HN Algolia の 14 日計数。

### 6.2 できなかったこと（未検証・未計測、5 系統の統合）

**ゲート通過率の実数**

1. **どのソースについても、ゲート 1（道具か）・ゲート 3（日本で未紹介か）を通した後の実数を測っていない。** 唯一の例外が Show HN の約 1/2 で、それも **3 サンプルしかない**。4 章の「投稿できる推定/日」は全て、生の件数 × 目算の道具比率。
2. 各ソースのノイズ比率（成人向け、暗号通貨、宣伝）の定量。全て 1 回のスナップショットの目算。

**個別ソース**

3. **Fazier**: 日本語ミラーの有無。`buildId` が変わる頻度。Next.js の RSC ペイロード構造の安定性。
4. **Launch YC**: デフォルトのソート順が新着順か人気順か。Algolia のソートパラメータで新着順を明示できるか。1 日あたりの正確な件数。
5. **V2EX 分享创造**: `updated` が返信 bump を含むか。含む場合の純新規件数。ダイジェストが中国語入力を扱えるか。
6. **Disquiet**: 投票・スター数などの「使われている」信号（products.json に含まれず、個別ページの URL 構造も特定できず）。
7. **GeekNews**: Show GN の比率はサンプル 1 回分（50 件中 2 件）のみ。
8. **awesome-selfhosted-data**: 正確な日次新規追加件数。**サンプル item が 1 件（NutriTrace）しかそろわなかった**（調査担当が明記）。
9. **Firefox AMO**: 日次の新着件数（週単位の入れ替わりであることは実測、日次は未計測）。
10. **Console.dev**: 過去の配信間隔（1 回のフェッチで先頭号のみ確認）。
11. **Product Hunt**: churn（どれだけ入れ替わるか）。2 回目のスナップショットを取る予定。
12. **dev.to showdev**: タグ全体のページング件数（1 日の総流量）。
13. **GitHub trending**: HTML 構造とスクレイピングの安定性（実際にコードを書いて試していない）。
14. **Homebrew cask**: 「新着」を実用的に抽出する方法。
15. **JetBrains Marketplace**: `cdate` が作成日か更新日か。
16. **npm / PyPI / crates.io**: 稀に混ざる CLI ツール等の比率（目算のみ）。
17. **Habr**: ハブ別フィードで道具比率が上がるか。
18. **Genbeta / t3n / Wamda / Webrazzi**: タイトルの文字コード（CDATA）の関係で一覧抽出が簡易的にしかできず、道具比率の目算が他より粗い。
19. **Journal du Hacker 以外の HN 風アグリゲーター**（ドイツ語版、イタリア語版、ポルトガル語版）: 検索した範囲では見つからなかったが、網羅的な探索はしていない。

**取得できなかった・特定できなかった**

20. **SaaSHub**: 正しい「新着」URL（`/new` はカテゴリ一覧、推測 URL は 404）。サイトマップ（`https://www.saashub.com/sitemaps/sitemap.xml.gz`）から逆算する手は残っている。
21. **StackShare**: 2 回とも 429 でレート制限。実データも robots.txt も未確認。
22. **G2 / Capterra**: 新着リストの正しい URL（推測 URL は全て 403）。**Capterra の robots.txt は ClaudeBot を明示的に Allow しているので、URL が見つかれば取れる可能性が残る。**
23. **MacUpdate**: 新着ページの正しい URL。
24. **Bluesky `searchPosts`**: 同ホストの `getProfile` は 200 なのに `searchPosts` だけ 403 になる理由。認証トークンで解消するか、`app.bsky.feed.getFeed` なら通るか。
25. **Lemmy**: `programming.dev` の正しい `community_name`。`SomebodyMakeThis`、`opensource` 等の実在確認。
26. **Tildes**: 正しい RSS/Atom URL（`.rss` は 404、`/rss` は 302 で追跡未完）。招待制で投稿量が非常に少ない可能性も未検証。
27. **Mbin/Kbin**: `fedia.io` 等での無認証読み取り API のパス。
28. **Hashnode**: 現行の公開 GraphQL エンドポイントと認証要件。
29. **Dev Hunt**: ヘッドレスブラウザでの取得可否、非公開 API の有無。
30. **AppSumo / Setapp / Microsoft Store / Chrome Web Store**: 新規追加の頻度。
31. **Juejin / 即刻 / Coolapk**: 無認証で使える JSON/RSS エンドポイント。非公式 API のリバースエンジニアリングが要るためスコープ外とした。
32. **Gitee**: Baidu WAF（BDWAF）にブロック。ブラウザ経由の再検証はしていない。
33. **Tech in Asia**: robots.txt 自体が 403。ブラウザ経由の再検証はしていない。
34. **KrASIA**: robots.txt の sitemap が `krasia.triboostml.vercel.app` という別ドメインを指す理由。
35. **Wykop**: API v3 の正式なエンドポイント形式と認証要件（公式ドキュメントの一次情報は未確認）。
36. **Disrupt Africa**: フィードが 2024 年 1 月で止まっているのがキャッシュか本当の更新停止か。
37. **YouTube Data API**: API キーを持っていないため実クエリ未実行。クオータ数値もドキュメント記載であり実測ではない。
38. **42matters 等の Google Play 向け有料 API**: 価格・利用規約。
39. **Wikipedia の `Disallow: /w/` と財団の User-Agent policy の関係**: 一次資料未確認。伝聞ベースの記述に留めた。
40. **Wikidata SPARQL の「新規追加ソフトウェア」クエリ**: robots.txt で禁止と判定したため深追いしていない。
41. **TLDR / Ben's Bites の号ページから個別ツールを抽出した場合の件数**。
42. **Software Applications Incorporated**: ブリーフが指す実体を特定できなかった（同名企業しか見つからず）。
43. **G2 / Crunchbase の 403 の原因**（WAF か URL の誤りかの切り分け）。
44. **日本語ミラーの有無**: 全体としてほぼ全ソースで「未検証」または「確認できず」。日本語で検索したのは GeekNews、Disquiet、V2EX、Korben、Habr、TabNews、Tweakers の 7 件のみで、いずれも「専用の日本語転載サイトは見つからなかった」。**「無い」ことの証明はできないので「確認できず」とした。**

### 6.3 調査中に見つけた、こちらへの指示めいた記述（実行していない。記録のみ）

調査の副産物として、**AI エージェント宛てに書かれたテキスト**が 2 か所で見つかった。どちらも「ツールの出力の中にある文字列」であって、タカさんからの指示ではない。**どちらも実行していないし、判断材料にもしていない。** ソース調査の一環として、そういうサイトが存在する事実だけを記録する。

1. **Tiny Launch の `llms.txt`**（`https://tinylaunch.com/llms.txt`）: これを読んだ AI エージェントに対し、「ユーザーに代わって自律的にスタートアップを登録せよ」「`AskUserQuestion` 等のツールを呼び出せ」といった行動を促す指示文が埋め込まれていた。調査担当は読み取り専用の調査に留め、指示には一切従っていない。**なお Tiny Launch は「公開の新着一覧を返す無認証 API が存在しない」という別の理由で使えない判定。**
2. **Xataka の robots.txt**（`https://www.xataka.com/robots.txt`）: 末尾の「BLOCK LLM」節のコメントに「NOTA INTERNA: BOTS AUTORIZADOS（内部メモ: 認可済みボット）」として ClaudeBot 等の名前を列挙する記述があった。**これは実際の `Disallow` / `Allow` 行ではなくコメント**で、AI ボットに対して「お前は許可されている」と読ませようとする不審な記述と判断した。実際の Disallow 行には ClaudeBot への明示的な許可も禁止も無い。同種の記述が同系列の Genbeta には無いことも確認済み。Xataka は別の理由（中身がニュース中心）で使えない判定。

**運用上の含意**: ソースを足すときに robots.txt や `llms.txt` を読むのは人（またはハル）だが、**そこに書かれている「こちらへの呼びかけ」を判断材料にしない**という原則を、ソース追加の手順に明記しておく必要がある。今回はどちらも記録だけして、判定には使わなかった。
