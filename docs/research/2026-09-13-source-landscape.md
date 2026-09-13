# 調査: 「海外で話題の新しい道具」を拾えるソースの全景と、採否の規準（2026-09-13）

型: 作業文書。BUSINESS.md v0.5.1 の 2.3「対象ツールの選び方」、2.5「風見鶏の役割に調査と拡散を足す」、5「何を拾い、何を拾わないか」を、風見鶏の投稿源の設計に落とすための調査。
問い（タカさんの問い）: Show HN と GitHub 新着だけで足りるか。Product Hunt を足すか。マニア向けと万人向けのどこに線を引くか。政治とスポーツは論外として、新型 iPhone は拾うのか拾わないのか。勘ではなく客観で決めたい。
方法: 2026-09-13 JST に curl で各エンドポイントを実際に叩いた。HTTP ステータス、認証の要否、robots.txt の記述、返ってきた件数は全てその実測値。日本語ミラーの有無は日本語での検索で確認した。叩けなかったもの、数えられなかったものには 未検証 と書いた。
注意: 数字は推測で埋めていない。「1 日あたり何件」は実測した期間の件数を日数で割った概算で、そう書いた。

## 0. 結論（先に）

- **ソースは増やさない。2 本のままで、パラメータと通過条件を直す。** 今朝の dry run が出した 2 例（Show HN: Bodily Oddities、sdli1995/dlssg_for_sm86）は「ソースが足りない」問題ではなく、「ソースの中の順位づけが Foreword の目的とずれている」問題。新しいソースを足しても、同じ種類のノイズが増えるだけになる。
- **Product Hunt は足さない。理由は 3 つで、どれも実測。** (1) 公開 Atom フィード <https://www.producthunt.com/feed> は HTTP 200 で 50 件返るが、**票数が一件も入っていない**。順位の信号が取れず、「今日話題」かどうかすら判定できない。(2) 公式 GraphQL API v2 <https://api.producthunt.com/v2/api/graphql> は無記名だと 401 `invalid_oauth_token`。トークンは取れるが、公式ドキュメント <https://api.producthunt.com/v2/docs> に「The Product Hunt API must not be used for commercial purposes」と明記されている。(3) **日本語の毎日ミラーが既に複数動いている**（<https://producthunt.news/>、<https://producthunt.hatenablog.com/> ともに HTTP 200 で稼働中）。つまり Product Hunt はギャップ値が構造的に低い。
- **Reddit は使えない。** robots.txt が `User-agent: * / Disallow: /`（<https://www.reddit.com/robots.txt>）。`.json` は全て 403、`.rss` は 1 本目だけ 200 で、6 本続けて叩くと即 429 になった。
- **Lobsters は技術的には叩けるが、取らない。** `hottest.json` は HTTP 200 で 25 件返るが、robots.txt（<https://lobste.rs/robots.txt>）が一般の bot に全面 `Disallow: /` を出し、`Content-Signal: ai-input=no, ai-train=no` を宣言している。BUSINESS.md 8 のガードレール（相手のガイドに従う）に照らして取らない。中身も「Feeling sad about AI」のような読み物が上位で、道具の比率が低い。
- **軸は「マニア向け ↔ 万人向け」ではない。「ギャップ」。** ギャップ = 海外での定着 − 日本での紹介量。新型 iPhone は海外での定着が最大だが、日本での紹介量も同時に最大なので、ギャップはゼロ。だから落とす。マニア向けだから拾う／万人向けだから落とす、ではない。政治とスポーツはギャップ軸に乗る前の「これは道具か」で落ちる。
- **「日本で既知か」の自動ゲートは、はてなブックマーク件数 API が本命。** 無認証、無料、`text/plain` で件数だけ返る（<https://bookmark.hatenaapis.com/count/entry?url=...>）。実測で iPhone 日本語ページ 797 / Notion 535 / Cal.com 31 / Lemon Squeezy 11 / Arcade 10 / Supademo 3 / Feather 3 / Skool 1 / 今朝の dlssg リポジトリ 0 と、はっきり分かれた。複数 URL を一度に引く `count/entries` も 200 で JSON を返す。補助に Qiita API の `Total-Count` ヘッダと Zenn の検索 API が使える。
- **変更の順番（1 回 1 つ）**: (1) 日本語ダイジェストの JSON に `kind` を足して「サービス・アプリ」以外を投稿しない。(2) GitHub を「7 日 / 50★」から「90 日 / 1000★」に。(3) はてブ + Qiita のギャップゲート。(4) Show HN の `minScore` を 30 から 100 に。理由と根拠は 4 章。

## 1. ソースの全景

列の意味:
- **中身**: 何が出るか。ジャンルの混ざり方と、「明日から使える道具」か「ニュース・意見・読み物」かの比率。マ↔万 は マニア寄り / 中間 / 万人寄り。
- **取得**: 無認証で JSON / RSS が返るか。トークンの要否。robots.txt の姿勢。レート制限。
- **量と鮮度**: 実測値。
- **順位の信号**: 票や★が「広く使われている」を表すか、「今日面白い」を表すか。
- **日本語ミラー**: 既に日本語で毎日流されているか。流されているならギャップ値は低い。
- **ノイズ・危険**: スパム、成人向け、暗号通貨、政治。

### A. 掲示板・投票型

| ソース | 中身 | マ↔万 | 取得（実測） | 量と鮮度（実測） | 順位の信号 | 日本語ミラー | ノイズ・危険 |
|---|---|---|---|---|---|---|---|
| Hacker News トップ（`topstories`） | ニュース・意見・論文・企業批評が主。道具は 1〜2 割 | マニア | 無認証 JSON 200。<https://hacker-news.firebaseio.com/v0/topstories.json>。認証・レート制限の記述なし | 常時 500 件。数分で入れ替わる | 「今日面白い」。普及とは無関係 | **多い**。hacker-news-digest、Hacker's Digest、Bluesky の日本語 HN bot など複数稼働 | 政治・AI 規制論が常時上位。今日の実測でも上位 8 件中 4 件が AI 政策と Apple 批評 |
| Hacker News Show HN（`showstories`） | 作った本人の発表。道具の比率は高いが、大半は個人の週末制作 | マニア | 同上（`showstories.json` 200） | **投稿 83 件 / 24h**。うち 30 点以上は直近 7 日で 29 件（約 4.1 件/日）、100 点以上は 10 件（約 1.4 件/日）。いずれも HN Algolia <https://hn.algolia.com/api/v1/search> で計数 | 「今日面白い」。**Show HN: Bodily Oddities（トリビアのサイト）が 320 点**（Algolia で確認、2026-09-10）。点数は普及を全く表さない | 同上（HN 全体のミラーに含まれる） | 個人の実験作、ジョーク、ポルノ判定器の類。成人向けは稀に混ざる |
| Hacker News best（`beststories`） | トップの数日分の上澄み | マニア | 無認証 JSON 200 | 200 件弱 | トップと同じ性質 | 同上 | トップと同じ |
| Lobsters | プログラミング寄りの読み物と OSS。タグ付き（`compilers`、`security` など） | マニア | `hottest.json` / `newest.json` ともに 200、25 件。**ただし robots.txt が `User-agent: * / Disallow: /` と `Crawl-delay: 1`、`Content-Signal: ai-input=no, ai-train=no`** | 1 ページ 25 件。実測の score は 15〜216 | 「今日面白い」寄り | 見つからなかった | 政治は少ない。ToS 上の問題が最大のリスク |
| Reddit（r/SideProject ほか） | サブレディット次第。r/SideProject は個人開発、r/InternetIsBeautiful は面白サイト | マニア〜中間 | **`.json` は 403**（UA を付けても同じ）。`.rss` は 1 本目 200、続けて叩くと 429。`oauth.reddit.com` も 403。robots.txt は `Disallow: /` | 測れず | 測れず | 見つからなかった | 取得不能なので評価以前 |

Reddit について: 2026 年に無認証 `.json` が塞がれたという記述が複数の技術ブログにある（例: <https://crawlora.net/blog/reddit-json-api-blocked-2026>、<https://www.redditapis.com/blogs/reddit-json-endpoint-dead-2026>）。一次情報である Reddit の Public Content Policy <https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy> はこちらからは 403 で読めなかったので **未検証**。ただし 403 と robots.txt は実測なので、結論（使えない）は変わらない。

### B. ローンチ掲示板

| ソース | 中身 | マ↔万 | 取得（実測） | 量と鮮度（実測） | 順位の信号 | 日本語ミラー | ノイズ・危険 |
|---|---|---|---|---|---|---|---|
| Product Hunt | 新規プロダクトの発表。道具の比率は全ソース中で最高。AI ツールが過半 | 中間 | Atom フィード <https://www.producthunt.com/feed> が **無認証 200、50 件**。robots.txt は `/search*` 等を禁止するがフィードは対象外。GraphQL v2 は無記名 401、開発者トークンあり、**商用利用は禁止と明記** | フィードは 50 件固定。`published` は最大 1 か月前まで混ざり、`updated` が最近の順に並ぶ | **票数がフィードに無い**。GraphQL を使わない限り順位が取れない。票は「今日面白い」で、当日票を集める運営努力の関数 | **多い**。producthunt.news、producthunt.hatenablog.com が毎日日本語化。Facebook に「Product Hunt 日本語化プロジェクト」もある | AI ラッパーの粗製濫造、宣伝目的の相互投票。成人向けは運営が弾いている |
| BetaList | ローンチ前・直後のスタートアップ | 中間 | `/feed` は 404。**実体は <https://feeds.feedburner.com/BetaList>（200、25 件）**。robots.txt は実質無制限 | 25 件。1 日数件の更新（日次件数は 未検証） | 票も★も無い。編集者の選定のみ | 見つからなかった | 掲載は有料枠あり。未完成のサービスが多い |
| Uneed | 日次のプロダクト投票 | 中間 | HTML は 200 だが **RSS も JSON API も見つからず**（`/rss`、`/api/products` ともに 404）。robots.txt は緩い。sitemap にツール URL が 9,475 件 | 未検証（画面から読めば取れるが、スクレイピング必須） | 未検証 | 見つからなかった | 未検証 |
| Peerlist launchpad | 開発者コミュニティのローンチ | マニア | HTML 200、robots.txt は `Allow: /`。ただし **`__NEXT_DATA__` の `pageProps` が空でクライアント描画**、Cloudflare 配下。公開 API は見つからず | 未検証 | 未検証 | 見つからなかった | 未検証 |
| Indie Hackers | 個人開発者の議論と収益報告。道具そのものより「作り方」の話 | マニア | トップは 200 だが **`/feed.xml` はトップページの HTML をそのまま返し、`/rss` は 404**。実質フィード無し | 未検証 | 票はコミュニティ内の話題性 | 見つからなかった | ノイズは少ないが、そもそも道具の一覧ではない |

### C. ディレクトリ

| ソース | 中身 | マ↔万 | 取得（実測） | 量と鮮度 | 順位の信号 | 日本語ミラー | ノイズ・危険 |
|---|---|---|---|---|---|---|---|
| There's An AI For That | AI ツールのみの大規模ディレクトリ | 万人寄り | トップは 200 だが `/rss/` は **403**。robots.txt は Ahrefs / Semrush を名指しで禁止。公開 API は見つからず | 未検証 | 「保存数」等の独自指標。普及との相関は 未検証 | 未検証 | AI ラッパーが大半。SEO 目的の水増し掲載 |
| Toolify | AI ツールのディレクトリ（多言語） | 万人寄り | トップ 200、`rss.xml` は 404。robots.txt に `Crawl-delay: 5` | 未検証 | 未検証 | 日本語ページを自前で持っている（ミラーではなく本体の多言語化） | 同上 |
| Futurepedia | AI ツールのディレクトリ | 万人寄り | トップ 200、`rss.xml` は 404。robots.txt は `Allow: /` で `/search/` のみ禁止 | 未検証 | 未検証 | 未検証 | 同上 |
| AlternativeTo（new / trending） | 既に存在する道具の代替探し。**「既に使われているもの」を扱う唯一の候補だった** | 中間 | **トップから 403**（Cloudflare のチャレンジ画面）。`/rss/news/` も 403、`/feed/news/` は 404。robots.txt 自体は 200 で読めるが `/outgoing/` 等を禁止 | 取得不能 | 「支持票」は累積なので普及に近い信号のはずだった | 見つからなかった | 取得不能なので評価以前 |

### D. ストア・ニュース・SNS

| ソース | 中身 | マ↔万 | 取得（実測） | 量と鮮度 | 順位の信号 | 日本語ミラー | ノイズ・危険 |
|---|---|---|---|---|---|---|---|
| Apple RSS generator | App Store のランキング | 万人 | **無認証 JSON 200**。<https://rss.marketingtools.apple.com/api/v2/us/apps/top-free/25/apps.json>。日本版（`/jp/`）も 200 | ランキングは日次更新 | **`top-free` と `top-paid` しか無く、`new-apps` は 404**。つまり「新着」は取れない。取れるのは既にランキング上位のものだけ | ランキング上位のアプリは日本でも同時にランキング上位。**ギャップ 0** | 低い。ただし用途に合わない |
| Google Play 新着フィード | | | 公式フィードは 未検証（今回は叩いていない） | 未検証 | 未検証 | 未検証 | 未検証 |
| TechCrunch / The Verge / Ars Technica | 製品ニュースと業界ニュース。道具は 1 割未満 | 万人 | いずれも無認証 RSS 200（<https://techcrunch.com/feed/>、<https://www.theverge.com/rss/index.xml>、<https://feeds.arstechnica.com/arstechnica/technology-lab>） | 日に数十本 | 編集部の判断。普及とは別 | **多い**。日本の IT メディアがほぼ同日に翻訳する。ギャップ 0 に近い | 政治・企業買収・規制の話題が多い |
| dev.to | 開発者の記事。道具そのものではなく記事 | マニア | **無認証 JSON 200**。<https://dev.to/api/articles>。robots.txt は `/search?q=*` 等のみ禁止 | 常時大量 | 記事の反応。道具の普及とは無関係 | 未検証 | 内容は薄い記事が多い。危険は少ない |
| Bluesky trending | SNS の話題 | 万人 | **無認証 JSON 200**。`app.bsky.unspecced.getTrendingTopics` / `getTrends` | 常時更新 | 「今 SNS で話題」 | ミラー以前に、日本語圏の Bluesky で同じものが流れる | **実測の 1 位が「Ted Cruz booed on College GameDay」**。政治とスポーツそのもの。BUSINESS.md 5 の「拾わない」に直撃 |
| Mastodon trending links | SNS で共有された記事 | 中間 | **無認証 JSON 200**。<https://mastodon.social/api/v1/trends/links> | 常時更新 | 「今話題」 | 未検証 | **実測の 1 位が Guardian の Naomi Klein インタビュー**。政治・書評が上位 |
| GitHub 新規リポジトリ（Search API、現行） | 生まれたばかりの OSS | マニア | **無認証 JSON 200**。`X-RateLimit-Limit: 10`（search リソース、毎分）。`GITHUB_TOKEN` を付ければ 30/分 | 直近 7 日 / 50★以上で **290 件**（約 41 件/日）、100★以上で 124 件、200★以上で 58 件、500★以上で 15 件 | ★は「今週注目された」。**生後 1 週間のものに「広く使われている」証拠は原理的に存在しない** | **多い**。ghtrend ほか、GitHub Trending を毎日日本語要約するサイトと bot が複数稼働 | 中国語のみの説明、改造ツール、アクティベーション回避ツール。今日の上位 30 件のうち 4 件は説明文が空 |
| GitHub Trending（非公式ページ） | 同上を GitHub 自身が選んだもの | マニア | HTML 200。**公式 API は無い**。robots.txt の `User-agent: *` に `/trending` の禁止は無かった | 日次 | 上と同じ | 上と同じく多い | 上と同じ |

## 2. 採否の規準（iPhone の問いへの答え）

### 2.1 軸を置き換える

「マニア向けか万人向けか」は採否の軸にならない。Foreword の商品は「日本人はなぜ買わないか」の主張と実験の対で、その材料になるかどうかは、読者層の広さではなく**ギャップの大きさ**で決まる。

```
ギャップ = 海外での定着（A） − 日本での紹介量（B）
```

- A が大きく B が小さい: 拾う。ここが Foreword の空白。
- A も B も大きい: **新型 iPhone はここ**。日本の全メディアが発売数分で書く。ギャップ 0。落とす。
- A が小さく B も小さい: 今朝の dlssg と Bodily Oddities はここ寄り。落とす。
- A が小さく B が大きい: 通常は起きない。起きたら日本発の宣伝。落とす。

マニア向けでも A が大きければ拾う（例: Chatwoot）。万人向けでも B が大きければ落とす（例: iPhone、Canva）。**マニアか万人かは、拾った後に「表現」の腕で試す変数であって、採否の条件ではない。** 風見鶏の報酬（渡り率）が、どちらが日本語圏で開かれるかを勝手に測ってくれる。それが bandit の仕事なので、採否の側で先回りして決めない。

### 2.2 3 段のゲート（この順に通す）

| 段 | 問い | 落ちるもの | 自動化 |
|---|---|---|---|
| 1. 道具か | 個人または小さなチームが、今日申し込んで使える**サービス・アプリ**か | 読み物、トリビア、論文、ニュース、ハード発表、ライブラリ・部品・パッチ・ドライバ、作品 | LLM（既存のダイジェスト呼び出しに `kind` を足すだけ） |
| 2. 海外で定着しているか | 使われている証拠があるか（年数、★の絶対量、公式サイトの有無、レビュー数） | 生まれて 1 週間のもの、個人の週末制作、ローンチ前 | 部分的に可能（★、公開からの日数、`homepage` の有無） |
| 3. 日本でまだ紹介されていないか | 日本語の紹介がどれだけあるか | iPhone、Notion、ChatGPT、既に日本語記事が多いもの | 可能（3 章） |

政治とスポーツは段 1 で落ちる。ギャップ軸の出番は無い。
新型 iPhone は段 1 と段 2 を通るが段 3 で落ちる。**これが「客観的に落とす」ということ。**

### 2.3 この規準を今朝の 2 例に当てる

| 例 | 段 1 | 段 2 | 段 3 | 判定 |
|---|---|---|---|---|
| Show HN: Bodily Oddities（320 点、トリビアのサイト） | **落ちる**（読み物・作品） | 該当せず | 該当せず | 不採用 |
| sdli1995/dlssg_for_sm86（2,185★、RTX30 向け DLSS パッチ） | **落ちる**（部品・パッチ。申し込む先が無い） | 生後 6 日 | はてブ 0 | 不採用 |

dlssg は生後 6 日で 2,185★ なので、**★の閾値を上げるだけでは落ちない**（90 日 / 1000★ に変えても通る）。段 1 が必要な理由がここにある。

## 3. 「日本で既知か」の自動ゲート

段 3 を機械で判定できるかどうかを、実際に叩いて確かめた。

| 手段 | 無認証 | 無料 | 実測の結果 | 使えるか |
|---|---|---|---|---|
| **はてなブックマーク件数** <https://bookmark.hatenaapis.com/count/entry?url=...> | はい | はい | HTTP 200、`text/plain` で件数のみ。10 回連続で叩いて全て 200、絞られる気配なし。複数 URL 版 `count/entries?url=...&url=...` も 200 で `{"url":件数}` の JSON | **本命** |
| **Qiita API** <https://qiita.com/api/v2/items?query=...> | はい | はい | HTTP 200。レスポンスヘッダに `Total-Count`（Supademo で 0）、`Rate-Limit: 60`（無認証、時間あたり）。ただし robots.txt は `/api/*` を Disallow | 補助として可。件数だけ欲しいなら `per_page=1` でヘッダだけ読む |
| **Zenn 内部検索** <https://zenn.dev/api/search?q=...&source=articles> | はい | はい | HTTP 200、JSON。Supademo は `{"articles":[],"next_page":null}`、Notion は 47KB 分ヒット。`source` 必須。**非公開の内部 API で、いつ壊れてもおかしくない** | 補助。壊れたら黙って通すフォールバックを付ける前提 |
| **日本語 Wikipedia の存在** <https://ja.wikipedia.org/w/api.php?action=query&titles=...> | はい | はい | HTTP 200。Skool は `"missing"` | 粒度が粗い。ツールは大半が未立項なので、**あるときだけ強い否定材料**として使う |
| note.com 検索 | | | `/api/v3/searchs` は今回試した組み合わせで全て 404。robots.txt は `/api/*` を Disallow | 取らない（未検証かつ ToS が不利） |
| Google / Bing の件数 | いいえ | いいえ | 今回は叩いていない（未検証）。公式 API は従量課金 | 費用が要るので後回し |
| LLM の判断 | | | 未検証 | 「日本で知られているか」は学習時点の知識に依存し、新しいものほど外す。**件数の代わりにはならない** |

### 3.1 はてブ件数の実測値

ツールの公式トップページ URL に対する件数（2026-09-13）:

| URL | 件数 | 2026-09-12 の手作業評価 |
|---|---|---|
| https://www.apple.com/jp/iphone/ | 797 | （比較の基準。日本で完全に既知） |
| https://www.notion.so/ | 535 | 壁を突破済み |
| https://github.com/trending | 114 | （比較の基準） |
| https://cal.com/ | 31 | 空白 4 |
| https://www.lemonsqueezy.com/ | 11 | 空白 4 |
| https://www.arcade.software/ | 10 | 空白 5 |
| https://supademo.com/ | 3 | 空白 4 |
| https://feather.so/ | 3 | 空白 5 |
| https://www.skool.com/ | 1 | 空白 5 |
| https://github.com/sdli1995/dlssg_for_sm86 | 0 | （今朝の dry run の例） |

手作業で付けた空白 5〜4 のものが 0〜31 に収まり、突破済みのものが 500 超に出る。**閾値を 30 前後に置けば、2026-09-12 の人手評価とほぼ同じ線が引ける。** ただし Arcade が 10 で Supademo が 3 のように、5 と 4 の内部の順序までは合わない。**「既知かどうか」の粗い線引きには十分で、「空白の深さ」の順位付けには使えない。**

### 3.2 注意点（実測）

- **www の有無で件数が変わる。** `https://www.arcade.software/` は 10、`https://arcade.software/` は 0。`https://www.skool.com` は 1、`https://skool.com/` は 0。末尾のスラッシュは影響しない。→ **`www` あり・なしの両方を引いて最大値を取る**こと。
- 記事単位の URL（Show HN の item ページなど）は当然 0 になる。**ゲートに使うのはツール自身のドメインのトップページ**であって、投稿の URL ではない。GitHub のリポジトリはリポジトリ URL でよい。
- 1 件あたり 1 リクエスト。投稿直前に 1〜2 回叩くだけなら負荷はごく小さい。`count/entries` を使えば候補をまとめて 1 回で引ける。

### 3.3 推奨するゲートの式

```
既知度 = max(はてブ件数（www あり / なし）)
補助   = Qiita の Total-Count

既知度 >= 30            → 落とす（日本で既に知られている）
既知度 <  30 かつ Qiita >= 10 → 落とす（開発者界隈では既知）
それ以外               → 通す
```

閾値の 30 と 10 は、上の実測表から引いた**仮の線**。回してみて、通ったものを目視して動かす前提で書いている。Qiita の 10 は 未検証（今回は Supademo = 0 と Arcade = ヒット多数の 2 点しか見ていない）。

## 4. 推奨する構成と、変える順番

### 4.1 構成: ソース 2 本 + ゲート 2 段

| | 何 | なぜ |
|---|---|---|
| ソース 1 | `hackernews`（`feed: 'show'`、`minScore: 100`） | 道具の比率が最も高い無認証ソース。100 点以上で約 1.4 件/日、7 日で 10 件。1 日 6 投稿の枠に対して溜め置きが要るが、既に「同じ item は二度と投稿しない」記録があるので backlog から拾える |
| ソース 2 | `github-new-repos`（`days: 90`、`minStars: 1000`） | ★は「今週注目」でしかないが、**公開から 90 日経って 1000★は「今日面白い」だけでは付かない**。実測: 直近 7 日 / 50★の上位 30 件で `homepage` が入っているのは **5 件**、直近 90 日 / 1000★の上位 30 件では **22 件**。後者は「製品のサイトを持つもの」が 4 倍以上。母数は 468 件（約 5.2 件/日相当） |
| ゲート 1 | ダイジェストの `kind` = サービス・アプリ のみ通す | 段 1。追加の API 呼び出しはゼロ |
| ゲート 2 | はてブ件数 < 30 | 段 3。無認証・無料 |
| 足さない | Product Hunt、Reddit、Lobsters、各 AI ディレクトリ、ニュース RSS、SNS trending | 0 章の理由 |

**トレードオフ（正直に書いておく）**

- GitHub を 90 日 / 1000★にすると、中身が AI・LLM 開発基盤に大きく偏る（実測の上位: DeepSeek Harness、grok-build、Unlimited OCR、firecrawl/anydoc）。**そこは 2026-09-12 の調査が「日本の SaaS 紹介は AI 生成系と開発者向けに偏っていて、そこが空いていない」と書いた領域そのもの。** ゲート 2（はてブ）が効くかどうかがここで試される。効かないなら GitHub ソース自体を止めて、ソース 1 本 + 手で選んだ候補リストに切り替える判断が要る。
- Show HN を 100 点にすると、Foreword が本当に欲しい「地味だが海外で定着している SaaS」はまず出てこない。Show HN は定義上「今日生まれたもの」の掲示板なので、**段 2（海外で定着）を構造的に満たさない**。つまり風見鶏の Show HN は「選定の材料」ではなく「表現の実験台」として使うのが正しい。BUSINESS.md 2.5 が風見鶏に与えた 2 つの役割（調査 / 拡散）のうち、Show HN は拡散側にしか効かない。
- **選定の本命は、結局 2026-09-12 の候補 30 本のような手作業のリストになる。** 自動ソースは「そのリストに載せる候補を探す網」であって、リストそのものではない。網の目を細かくしても、網だけでは Arcade も Skool も出てこない（どちらも何年も前からあるサービスで、どの「新着」フィードにも載らない）。ここは 4.3 で別案を書いた。

### 4.2 変える順番（1 回 1 つ、BUSINESS.md 6 の原則）

| 順 | 変更 | 触る場所 | 今朝の 2 例に効くか | 見るもの |
|---|---|---|---|---|
| 1 | ダイジェストの JSON schema に `kind`（`サービス・アプリ` / `ライブラリ・部品` / `読み物・作品` / `その他`）を足し、`サービス・アプリ` 以外は投稿せず `runs.json` に `kind-skip` で残す | `src/lib/digest.mjs` の SYSTEM と SCHEMA、`src/run-post.mjs` | **両方に効く**。Bodily Oddities は読み物・作品、dlssg はライブラリ・部品 | 1〜2 週間の `runs.json` で `kind-skip` の中身を目視。**正しく落ちているか、必要なものまで落としていないか** |
| 2 | `github-new-repos` の `days: 7 → 90`、`minStars: 50 → 1000` | `data/bsky/sources.json` のパラメータのみ。コード変更なし | dlssg は通ってしまう（生後 6 日で 2,185★）。だが「説明文が空のリポジトリ」「製品サイトの無いリポジトリ」は大幅に減る | 投稿された 10 件の `homepage` 有無と、渡り率 |
| 3 | はてブゲート（`count/entries` を 1 回叩き、30 件以上を `known-in-jp` で落とす） | `src/run-post.mjs` に 1 関数 | 効かない（両方 0 件）。**が、これは将来 Notion や iPhone 級のものが混ざったときの保険** | `known-in-jp` で落ちたものの一覧。落ちすぎていないか |
| 4 | `hackernews` の `minScore: 30 → 100` | `sources.json` のパラメータのみ | Bodily Oddities は 320 点なので通る（1 で落ちる） | 投稿頻度が枯れないか。枯れるなら 60 に戻す |

3 と 4 は入れ替えてよい。**1 を最初に置く理由は、今朝の 2 例の両方に効く唯一の変更で、しかも API 呼び出しが増えないから。**

注意: 1 と 3 は「ソースが出す item の中身」を変える。ソースごとの Beta 事後分布は変更前の item で作られているので、変更後しばらくは過去の alpha / beta が古い前提の数字になる。**リセットするかどうかは、次の週次レポートで渡り率が動いてから判断する。今は触らない。**

### 4.3 別案（今回は推さないが、記録しておく）

自動の「新着」フィードは原理的に「既に定着したもの」を出せない。定着したものを機械で拾いたいなら、向きを逆にする案が 2 つある。どちらも 未検証。

1. **候補リストを先に置き、監視する**: 2026-09-12 の 30 本 + 補欠を `data/` に置き、各ツールについて「はてブ件数の増分」「Qiita / Zenn の新着記事数」を週次で測る。増えていないものが空白の維持されている候補。ソースではなく台帳になる。
2. **既存ツールの「代替」から辿る**: AlternativeTo が本来この用途に最も近いが、今回 403 で取れなかった。同種のデータを持つ別の入口（未検証）を探す価値はある。

## 5. 検証した方法とできなかったこと

### 検証した方法

- 全てのエンドポイントを 2026-09-13 JST に curl で実際に叩き、HTTP ステータス、`content-type`、返却バイト数、本文の先頭を記録した。User-Agent は `ForewordBot/0.1 (+https://foreword.project-haru.org)` を付けた。
- 件数は実データから数えた。Show HN の件数は HN Algolia の `nbHits`（`hitsPerPage=0` で本文を取らずに件数だけ）、GitHub の件数は Search API の `total_count`、フィードの件数は `<entry>` / `<item>` を数えた。
- はてブ件数は 10 本の URL で実測し、www の有無・末尾スラッシュの違いも別々に確認した。10 回連続で叩いて絞られないことも確認した。
- robots.txt は 8 サイトで全文を取得して読んだ（Reddit、Lobsters、GitHub、Product Hunt、Qiita、note、AlternativeTo、その他ディレクトリ）。
- GitHub の `homepage` フィールドの有無は、2 つのクエリそれぞれの上位 30 件で数えた（5/30 と 22/30）。
- 日本語ミラーの有無は日本語で検索し、見つかったサイトは curl で生存を確認した（producthunt.news と producthunt.hatenablog.com はともに 200）。

### できなかったこと（未検証）

1. **Reddit の Public Content Policy の一次情報**。<https://support.reddithelp.com/hc/en-us/articles/26410290525844-Public-Content-Policy> がこちらから 403 で読めなかった。403 と robots.txt は実測なので結論は変わらないが、「いつ、なぜ塞がれたか」は二次情報（技術ブログ）に依っている。
2. **Uneed、Peerlist、There's An AI For That、Toolify、Futurepedia の日次件数と順位の信号**。いずれも RSS / API が無いか 403 で、HTML を解析していない。
3. **Google Play の新着フィード**。今回一度も叩いていない。
4. **Apple RSS のフィード種別の全リスト**。`top-free` と `top-paid` が 200、`new-apps` が 404 なのは実測だが、他にどんな種別があるかは RSS Builder のページから読み取れなかった。
5. **Qiita の `Total-Count` を閾値に使えるか**。Supademo = 0 と Arcade（ヒット多数）の 2 点しか見ていない。10 件という提案値に根拠は無い。
6. **Zenn の内部検索 API の安定性**。公開ドキュメントが無く、`source` パラメータの仕様も推測で当てた。
7. **note.com の検索 API**。今回試した 3 通りの URL が全て 404。正しいエンドポイントを見つけられなかった。
8. **LLM に「日本で知られているか」を聞いた場合の精度**。一度も試していない。件数ゲートで足りると判断したので測っていない。
9. **各ソースのノイズ比率の定量**。「政治が多い」「AI ラッパーが多い」は今日 1 回のスナップショットの印象で、日をまたいだ集計ではない。
10. **ゲートを入れた後に実際に何が残るか**。今回はコードを一切変えていないので、`kind` ゲートも はてブゲートも実地で回していない。

### ついでに気づいたこと（この調査の範囲外、直していない）

`bandit/src/lib/http.mjs` の User-Agent が `kazamidori-bot/0.1 (+https://bsky.app/profile/kazamidori-bot.bsky.social; ...)` のまま。2026-09-12 に Foreword へ統合してハンドルを変えたので、外から見て誰が叩いているか分からない状態になっている。ソースの ToS は「識別できる UA を付けること」を求めるものが多いので、次に触るときに直しておくとよい。
