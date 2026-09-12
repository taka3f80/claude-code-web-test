# 調査: 海外では使われているのに日本で紹介されていないツール（候補 30 本、2026-09-12 夜）

型: 作業文書。BUSINESS.md v0.5 の 2.3「対象ツールの選び方」に基づく一次選定。
条件: 海外で広く使われている。日本ではほとんど紹介されていない（壁を突破済みの ChatGPT、Notion、Canva 等は除く）。日本人も入るべきと言える。日本から使える。アフィリエイトの有無は問わない。
方法: Sonnet の調査エージェント 3 系統（仕事・知識 / 作る・公開 / クリエイター・個人）が約 45 本を選別。海外の実績は公式・報道の数字、日本の空白は日本語で「<ツール> 使い方」「<ツール> とは」を検索して測定。空白の点数は 5 が「日本語でほぼ何も無い」、1 が「よく知られている」。
注意: 「未検証」は、エージェントの検索枠が切れて日本語検索ができなかったもの。別途の検証パス（下記 4 章）で埋める。数字は推測で埋めていない。

## 0. 結論（先に）

- 空白 5（日本語でほぼ何も無い）で、海外の実績が確かなもの: **Tana、Skool、Arcade、Pitch、Feather、Jitter**。
- 空白 4 で実績が確かなもの: **Supademo、Storylane、Rive、Spline、Fillout、folk、Customer.io、Cal.com、Kit、Ghost、Circle、Xano**。
- 除外した「もう知られている」もの: Gamma（日本語記事 10 本超と YouTube）、LottieFiles（公式 /jp あり）、Logseq、n8n、Webflow、Carrd、Durable、NocoDB、Photoroom（メルカリ出品者に浸透）、Substack、Gumroad、Replit / Bolt / Lovable / v0。
- 除外した「死んでいる・使えない」もの: Tome（2025-04 終了）、Bento（2026-02 終了）、Potion、Navattic（価格が営業経由で個人向けでない）。
- 傾向: 空白が大きいのは「製品デモ」「コミュニティ」「モーション・3D」「小さな商売の CRM と配信」。日本の SaaS 紹介は AI 生成系と開発者向けに偏っていて、ここが空いている。

## 1. 候補 30 本

### A. 仕事と知識（10）

| # | ツール | 何か | 海外の実績 | 空白 | 日本の状況 | 価格 | アフィリエイト |
|---|---|---|---|---|---|---|---|
| 1 | Tana | AI 知識グラフ型アウトライナー | $25M 調達、待機 16 万人 | 5 | 日本語 UI 無し。検索は同名の在庫アプリに埋もれ、実質ゼロ | 無料枠あり、有料 $10 前後（未確認） | 不明 |
| 2 | Heptabase | ホワイトボード型 PKM | PH Golden Kitty 2024、黒字 | 3 | Zenn、note に愛好家の投稿数本。主流の紹介なし | 無料枠なし、$10 前後 | 不明 |
| 3 | Granola | bot 無しの AI 議事録 | $125M、評価額 $1.5B | 3 | 日本語ブログ 3〜5 本。日本語書き起こしはベータ | 無料枠あり、$18 前後 | 不明 |
| 4 | Motion | AI が予定を組み直す PM | $60M、評価額 $550M、10 万顧客 | 3 | 日本語レビュー数本、App Store 日本あり | $19〜34 | 未確認 |
| 5 | Reclaim.ai | カレンダー自動化 | 60 万ユーザー、Dropbox が買収 | 3 | 日本語 UI 無し、記事 1〜3 本 | 無料枠あり、$8 前後 | 未確認 |
| 6 | Cal.com | OSS の予約ページ | GitHub 44.6k ★、$32.4M | 3〜4 | 日本語の言語設定あり、手引き数本 | 無料、Teams $12〜15 | あり |
| 7 | Fillout | フォーム | G2 / Capterra 数百件、4.7〜4.8 | 4 | 日本語 UI 未確認、記事ほぼゼロ | 無料枠あり、$20 前後 | 未確認 |
| 8 | Krisp | AI ノイズ除去 | 500 万ユーザー | 3（未検証） | リモートワーク系ブログに少し | 無料枠あり、$8 前後 | あり |
| 9 | Readwise Reader | あとで読む＋間隔反復 | Pocket 終了後の受け皿 | 4（未検証） | 日本語 UI 無し | $9.99 | あり（30% 継続） |
| 10 | Consensus | 論文を引いて答える AI 検索 | MAU 40 万、$41.5M | 4（未検証） | 日本語情報ほぼ無し | 無料枠あり、$9〜12 | 不明 |

### B. 小さな商売（10）

| # | ツール | 何か | 海外の実績 | 空白 | 日本の状況 | 価格 | アフィリエイト |
|---|---|---|---|---|---|---|---|
| 11 | Attio | AI ネイティブ CRM | $124M、顧客に OpenAI、Vercel | 3 | 日本語 UI 無し、解説数本 | 無料枠あり、$29/席 | 未確認 |
| 12 | folk | 軽い CRM（LinkedIn / Gmail 連携） | G2 300 件超、4.5 | 4 | 日本語 UI 無し、記事ほぼゼロ | 試用のみ、$20/席 | 未確認 |
| 13 | Customer.io | 行動トリガーの配信 | ARR $100M、4,600 社 | 4 | 記事 1〜3 本 | 試用のみ、$100〜 | 未確認 |
| 14 | Lemon Squeezy | 個人開発者向けの決済・税務代行 | Stripe が買収 | 4（未検証） | 未検証 | 月額なし、約 5% + 決済手数料 | 自前の機能あり |
| 15 | Kit（旧 ConvertKit） | クリエイター向けメール配信 | 売上 $43.8M、6.3 万顧客 | 4 | 日本語 UI 無し、解説 1〜3 本 | 1 万人まで無料、$39〜 | あり（PartnerStack） |
| 16 | Ghost | OSS の有料購読メディア基盤 | 約 8,600 ドメイン | 4 | Zenn、note に数本 | Ghost(Pro) $9〜25 | 不明 |
| 17 | Feather | Notion で書いて SEO ブログにする | PH #1、935 票 | 5 | 日本語記事ほぼゼロ | 試用のみ、$33〜 | あり（25% 継続） |
| 18 | Skool | コミュニティ＋講座、定額 | ARR $26〜50M、有料ホスト 1 万超 | 5 | note に 1 本 | $99 定額、無料枠なし | 不明 |
| 19 | Circle | ブランド付きコミュニティ | G2 401 件、4.6 | 4 | 言及 1〜3 本 | $89〜 | 不明 |
| 20 | Chatwoot | OSS のサポート窓口 | YC 出身、OSS Intercom 代替の定番 | 4（未検証） | 未検証 | 自前なら無料、クラウド $19〜 | 不明 |

### C. 作る・見せる（10）

| # | ツール | 何か | 海外の実績 | 空白 | 日本の状況 | 価格 | アフィリエイト |
|---|---|---|---|---|---|---|---|
| 21 | Arcade | クリックを対話型デモにする | $14M（Kleiner Perkins）、G2 4.7 | 5 | 2022 年の調達記事 1 本のみ | 無料枠あり、$32 前後 | 不明 |
| 22 | Supademo | AI で製品デモを作る | ユーザー 6〜10 万、G2 523 件 | 4〜5 | ディレクトリの薄い言及のみ | 無料枠あり、$39〜 | あり（30% 継続） |
| 23 | Storylane | 物語型デモ | G2 1,500 件超、分野 1 位 | 4 | 記事 2 本 | 無料 1 本、$40/席 | あり（最大 20%） |
| 24 | Pitch | 共同編集と閲覧分析のあるプレゼン | $137M、ARR 約 $10M、G2 4.4 | 5 | 「pitch」が一般語で埋もれ、ツールの記事ゼロ | 無料枠あり、€10〜20 | あり（30%、上限 $100） |
| 25 | Rive | 実行時に動く対話型アニメーション | $14M、Spotify / LinkedIn / Duolingo が採用 | 4 | CyberAgent、dely の技術ブログのみ | 無料枠あり、$9/席〜 | 無し |
| 26 | Spline | ブラウザで 3D | $41M、シーン 700 万 | 4 | Web 制作会社のブログ 5〜8 本、主流なし | 無料枠あり、$15〜 | あり |
| 27 | Jitter | ブラウザでモーションデザイン | PH #2、Capterra 4.3 | 5 | 「ジッター」に埋もれ、記事 1〜3 本 | 無料枠あり | 無し |
| 28 | Penpot | OSS の Figma 代替 | GitHub 59.9k ★ | 3 | 有志の日本語チュートリアルサイトあり | 無料、$7/席 | 無し |
| 29 | Krea | リアルタイム生成 AI キャンバス | 2,000 万ユーザー、$83M | 4（未検証） | AI 画像界隈に少し | 無料枠あり、$10〜 | 不明 |
| 30 | Screen Studio | 映画のような画面収録（Mac） | PH Product of the Year | 4（未検証） | ほぼ無し | 約 $89 買い切り（未確認） | 不明 |

### D. 補欠（順不同）

Clay（$7.1B、空白 3、$149/月で個人には重い）、Opus Clip（空白 3、日本語ブログあり）、Riverside（空白 3）、Submagic（空白 3、日本語精度が弱い）、CleanShot X（空白 4 未検証、Mac）、Cap（OSS 画面収録、空白 5 未検証）、Fastmail（空白 4 未検証）、Zen Browser（空白 3〜4 未検証）、Actual Budget（空白 4 未検証、実績小）、Xano（空白 4、ノーコードのバックエンド、対象が狭い）、Beautiful.ai（空白 3、無料枠なし）、Umso（空白 5、実績が弱い）、Snipd（空白 5 未検証、実績小）、Mighty Networks、Kajabi、Podia、Guidde、Mintlify、GitBook（未調査）。

## 2. 見立て

- **最初の 1 ツールに向くもの**: 画面で動きを見せられて、ずんだもんの短尺で「伸びそうなカット」が作れて、個人でも今日から使えるもの。Arcade、Supademo、Pitch、Rive、Spline、Jitter、Tana、Skool。
- **「日本人はなぜ買わないか」の実験に向くもの**: 無料枠があり、申込みの途中で止まる場所を測れるもの。Tana、Fillout、Cal.com、Pitch、Arcade、Supademo。
- **海外ベンダーに見せたときに響くもの**: 資金が大きく GTM 担当がいる会社。Granola、Motion、Attio、Clay、Customer.io、Pitch、Arcade、Storylane、Supademo。
- アフィリエイトの有無は選定に使っていない。あるものは計器として使う。

## 3. 選定から外した理由の記録

| 除外 | 理由 |
|---|---|
| Gamma | 日本語記事 10 本超、日本語 YouTube あり。空白 2 |
| LottieFiles | 公式 /jp ページと日本語チュートリアル多数。空白 2 |
| Logseq、n8n | 日本語 UI あり、記事多数。空白 2 |
| Webflow、Carrd、Durable、NocoDB、Photoroom | 日本語記事多数、または既に浸透 |
| Substack、Gumroad、Replit、Bolt、Lovable、v0、Supabase、Retool | 日本で既に話題 |
| Tome、Bento、Potion | 終了、または実質停止 |
| Navattic | 価格が営業経由（$500〜/月）で個人・小規模向けでない |
| Monarch、YNAB | 日本の銀行連携が無く、日本では成立しにくい |

## 4. 検証パス（進行中）

空白の点数が「未検証」のもの（Krisp、Screen Studio、CleanShot X、Cap、Krea、Readwise Reader、Snipd、Consensus、Fastmail、Zen Browser、Actual Budget、Chatwoot、Lemon Squeezy）と、点数の根拠を厚くしたいもの（Photoroom、Opus Clip、Riverside、Skool、Arcade、Supademo、Tana、Fillout、folk、Customer.io、Feather、Pitch、Jitter）を、日本語検索で測り直している。結果はこの章に追記する。
