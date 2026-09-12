# 調査: 継続報酬型アフィリエイトの商品棚候補（2026-09-12）

型: 作業文書。目的は「継続報酬（月額の X% が N か月または無期限）で受け取れるプログラムだけを棚に並べる」ための一次調査。
方法: ハル の調査エージェント 3 系統が、各プログラムの公式ページ（または公式の PartnerStack / Impact / Rewardful 掲載ページ）を取得して条件を写した。「未確認」は公式ページで確認できなかったもの。数字は推測で埋めていない。
注意: 条件は頻繁に変わる。登録前に必ずタカさん本人が公式ページで再確認する。

## 0. 結論（先に）

- **タカさんの仮説は概ね正しい。** 日本の主要 ASP（A8、もしも、afb、バリューコマース、楽天、Amazon）に、サブスクの月額に対する継続報酬は事実上無い。A8 の「継続型」は D2C 定期便（サプリ・コスメ）向けの機能で、SaaS・サーバー・VPN・動画配信には無い。継続報酬は海外の SaaS に集中している。
- 海外でも **12 か月の継続が標準形**。無期限は少数: systeme.io 60%、Thinkific 30%、Mighty Networks 30%、MailerLite 30%、LiveChat 20%、Kinsta 10%、Cloudways 7%、pCloud 20%。Kit は 12 か月 50% の後、年 10 件以上の紹介があれば 10〜20% が無期限。
- 消費者向けで更新にも報酬が出ると公式に書いてあるのは NordVPN（更新 30%）、Proton（更新 30%）、pCloud（全支払いの 20%）だけ。ExpressVPN と Coursera は「更新は対象外」と明記。
- **日本語 UI が確認できた継続報酬型は少ない**: HubSpot、Pipedrive、Kinsta、ElevenLabs、Synthesia、NordVPN。
- AI ツールは初年度のみが多く、無期限はほぼ無い。Notion と Canva は新規受付停止。Cursor、Midjourney、Bolt、Zapier、Substack、Calm、Dropbox はプログラム無し。
- **受け取りは PartnerStack が最も楽**（日本が明記、最低額なし、PayPal/Stripe なら W-8 不要）。Impact は $10 から、非米国は W-8 必要。CJ は W-8BEN と Payoneer。Awin の日本在住個人の可否は未確認。

## 1. 棚の第一候補（ハル の見立て）

読者（風見鶏に集まる AI・技術寄りの日本語話者）との相性、継続報酬の厚さ、受け取りやすさで並べた。

| 順 | サービス | 分野 | 報酬（公式の文言） | 継続 | 受け取り | 日本語 UI | 見立て |
|---|---|---|---|---|---|---|---|
| 1 | Kit（旧 ConvertKit） | メール配信 | 50% for the first 12 months、以後 Bronze/Silver/Gold で +10/15/20% indefinitely | 12 か月＋条件付き無期限 | PartnerStack | 無 | 初年度が最も厚い。無期限の尾は年 10 件以上が条件なので上振れ扱い |
| 2 | systeme.io | オールインワン（LP・メール・講座） | 60% on every sale、Lifetime recurring | 無期限 | PayPal / 送金、$30 から、審査なし | 未確認 | 単価あたりの天井が最も高い。一人事業者向け |
| 3 | beehiiv | ニュースレター | 50〜60% every month for a year | 12 か月 | PayPal 毎月、最低額の記載なし | 無 | 月 $39〜99 のプランなので数件で積み上がる |
| 4 | Framer | サイトビルダー | 50% of their subscription for 12 months | 12 か月 | Dub、Stripe 払い、クリエイター承認が必要 | 無 | テンプレを 1 本公開して承認を取る必要あり |
| 5 | Webflow | サイトビルダー | 50% commission for 12 months | 12 か月 | PartnerStack、cookie 90 日 | 無 | 個人クリエイター向け。代理店は別枠 |
| 6 | Thinkific | オンライン講座 | 30% lifetime recurring | 無期限 | PartnerStack、$25 から、cookie 90 日 | 無 | 講座を持つ読者向け。タカさんの SE カレッジ経験と相性あり |
| 7 | ElevenLabs | 音声 AI | 22% for the first 12 months（Business は 11%） | 12 か月 | PartnerStack | 有 | 日本語 UI があり動画チャネルと相性が良い |
| 8 | Make.com | 自動化 | 35% for 12 months | 12 か月 | Wise のみ、$100 かつ有料 3 名から | 未確認 | 高単価の自動化ユーザー。閾値が高い |
| 9 | NordVPN | VPN | 新規 40〜100% / 更新 30% | 更新に 30%（期間の記載なし） | 直営 | 有 | 消費者向けで唯一「読者層を選ばず、日本語で申し込める継続型」。競合は多い |
| 10 | HubSpot | CRM | 30% monthly recurring for up to one year | 12 か月 | Impact、$10 から、cookie 180 日 | 有 | 日本語で契約まで進める数少ない一つ。読者層とはややずれる |

次点: Kinsta（10% 無期限、日本語 UI）、MailerLite（30% 無期限、$100 かつ有料 2 名から）、Mighty Networks（30% 無期限、PayPal）、n8n（30% 12 か月、€100 から）、Fireflies（30% 12 か月）、Synthesia（25% 12 か月、円建て価格あり）、Pipedrive（20% 12 か月、日本語 UI）、Proton（更新 30%、$100 から）、pCloud（20% 継続、PayPal $10 から）。

## 2. 系統別の一覧

### 2.1 AI・クリエイター・開発／ノーコード

| サービス | 報酬（公式の文言） | 継続 | cookie | 経路 | 受け取り・備考 | 日本語 UI | 出典 |
|---|---|---|---|---|---|---|---|
| Kit | 50% commission for 12 months, plus 10-20% recurring beyond 12 months（Bronze 10件+ / Silver 50件+ / Gold 100件+） | 12か月＋条件付き無期限 | 未確認 | PartnerStack | 未記載 | 無 | kit.com/affiliate |
| Framer | Earn 50% per referral… 50% of their subscription for 12 months | 12か月 | 未確認 | Dub / Stripe | 承認クリエイターのみ | 無 | framer.com/creators |
| Webflow | Earn 50% commission for 12 months | 12か月（年額は一括） | 90日 | PartnerStack | クリエイター向け | 無 | market.partnerstack.com/page/webflow |
| beehiiv | up to 60% commission every month（Bronze 50 / Silver 55 / Gold 60） | 12か月 | 60日 | 直営 | PayPal のみ、毎月15日 | 無 | beehiiv.com/partners |
| Make.com | 35% commission… for 12 months | 12か月 | 30日 | 直営 | Wise のみ。$100 かつ有料3名 | 未確認 | make.com/en/affiliate |
| Fireflies.ai | up to 30% recurring for 12 months（10→20→30%） | 12か月 | 90日 | FirstPromoter | PayPal | 無 | fireflies.ai/affiliate |
| n8n | 30% commission… for the first year | 12か月 | 未確認 | PartnerStack | PayPal のみ、€100 から、広告出稿禁止 | 無 | n8n.io/affiliates |
| Softr | 25% commission… for 12 months | 12か月 | 90日 | PartnerStack | PayPal / Stripe | 無 | market.partnerstack.com/page/softrplatformsgmbh |
| Synthesia | 25% of the net amount（Starter/Creator のみ） | 初回購入から12か月 | 未確認 | Rewardful | $30 未満は翌月繰越 | 有（円建て） | synthesia.io/terms/affiliate-terms |
| Opus Clip | 25% recurring through the first year | 12か月 | 未確認 | 直営 | PayPal USD、$20 から | 無 | opus.pro/affiliate |
| Jasper | 25% during the first twelve months（100件超で30%） | 12か月 | 14日 | FirstPromoter | PayPal / Wise、$25 から | 無 | jasper.ai/legal/affiliates |
| ElevenLabs | 22% on all payments… for the first 12 months（Business 11%） | 12か月 | 未確認 | PartnerStack | Stripe / PayPal / 口座、国による | 有（$建て） | elevenlabs.io/affiliates |
| Writesonic | 20% of every payment… for up to 12 months | 12か月 | 60日 | FirstPromoter | W-8BEN 必要、30日保留 | 無 | writesonic.com/affiliate |
| HeyGen | 35% recurring for 3 months | 3か月のみ | 30日 | 直営 | PayPal、$100 から、動画クリエイター限定 | 未確認 | heygen.com/affiliate-program |
| CapCut | Up to 35% recurring | 期間未確認 | 未確認 | Impact | 成果対象は米英独仏の契約者のみ | 有 | capcut.com/partners/affiliate-program |
| Riverside | up to 20〜25% revenue share（段階制） | 期間未確認 | 未確認 | PartnerStack | 未確認 | 無 | riverside.com/affiliate-program |
| Notion | up to $50 per activated sign up plus 20% of year one revenue | 初年度 | 180日 | PartnerStack | 新規受付停止中 | 有（円建て） | notion.com/affiliates |
| Gamma | 公式ページに率の記載なし | 未確認 | 未確認 | PartnerStack | 未確認 | 無 | help.gamma.app |

一時金のみ（棚に載せない）: Figma（$3 または初回 30%）、Adobe CC（初月 85%）、Surfer SEO（CPA）、Lovable（最大 $100）、Descript（$25 固定、更新は対象外）、Runway（$15）、Miro（リード単価）、ClickUp（登録単価）、Grammarly（率非公開）。
プログラム無し: Midjourney、Substack、Bolt.new、Cursor、Zapier。Canva は受付停止。Replit はクレジット付与のみ。
未確認: Copy.ai、Otter.ai、Airtable、Bubble、Perplexity。

### 2.2 メール配信・講座・ファネル・CRM・チャット・ホスティング・EC

| サービス | 報酬（公式の文言） | 継続 | cookie | 経路 | 受け取り・備考 | 日本語 UI | 出典 |
|---|---|---|---|---|---|---|---|
| systeme.io | 60% on every sale、Lifetime recurring | 無期限 | 永続タグ | 直営 | PayPal / 送金、$30 から、毎月10日、審査なし | 未確認 | systeme.io/affiliate-program |
| Moosend | up to 40% recurring（0〜5件 30% → 36件+ 40%） | 有料継続中ずっと | 未確認 | PartnerStack | PayPal / Stripe | 未確認 | moosend.com/affiliate-program |
| Thinkific | 30% lifetime recurring（Plus は $150/月） | 無期限 | 90日 | PartnerStack | PayPal / Stripe、$25 から、30日遅延 | 無 | thinkific.com/partners/affiliates |
| Mighty Networks | 30%… as long as they stay. No caps, No expiration | 無期限 | 60日 | 直営 | PayPal 必須、PayPal が使える国なら参加可 | 未確認 | mightynetworks.com/partner-program |
| MailerLite | 30% on all subsequent recurring (lifetime) subscription payments | 無期限 | 45日 | 直営（Tipalti） | $100 超かつ有料2名から、30日保留 | 無 | mailerlite.com/legal/affiliate-program-terms |
| ClickFunnels | 30% Monthly Recurring Commission | 終期の記載なし | 45日 | 直営（Tipalti） | 1日と15日、$100 から、45日遅延、W-8BEN | 未確認 | clickfunnels.com/affiliates |
| LiveChat | 20% for the lifetime of every paid subscription（5件で22%） | 無期限 | 120日 | 直営 | PayPal、$50 から | 未確認 | partners.livechat.com |
| GetResponse | 40% for 12 months → 50%（50件）→ 60%（100件） | 12か月 | 90日 | PartnerStack | 毎月13日頃、183か国 | 無 | getresponse.com/affiliate-programs |
| Circle | $100 per customer plus up to 20% recurring | 有料継続中 | 90日 | PartnerStack | PayPal / Stripe / 口座、$5 から | 未確認 | circle.so/affiliate-program |
| HubSpot | 30% monthly recurring for up to one year | 12か月 | 180日 | Impact | EFT / PayPal、$10 から | 有 | hubspot.com/partners/affiliates |
| Pipedrive | 20% revenue share for the first 12 months（Growth で30%） | 12か月 | 90日 | PartnerStack | 毎月13日、$5 超から | 有 | pipedrive.com/en/affiliate-partnership |
| ActiveCampaign | 20% climbing up to 30%、for up to 12 months | 12か月 | 未確認 | PartnerStack | 未確認 | 無 | activecampaign.com/partner/affiliate |
| Teachable | 30% recurring for the entire first year | 12か月 | 30日 | PartnerStack | 未確認 | 未確認 | teachable.com/partners |
| Jotform | 30%… paid in 12 monthly installments during the first year | 12か月 | 60日 | 直営（Tremendous） | PayPal | 未確認 | jotform.com/partnership/affiliate |
| Buffer | 25% of the net subscription value for the first 12 months | 12か月 | 未確認 | Dub | 現地通貨払い、Buffer 利用者であること | 未確認 | buffer.com/partners |
| Typeform | 15% of their monthly subscription payment, up to $500 | 上限 $500 まで | 未確認 | Cello（アプリ内紹介） | PayPal / Venmo | 未確認 | typeform.com/affiliates |
| Podia | 20%（capped at 12 months） | 12か月 | 31日 | Rewardful | $50 から | 未確認 | affiliates.podia.com |
| Kajabi | トップは 30% lifetime だが規約では 2025-03 以前の参加者のみ。新規は Tier 1 一時金、Tier 2〜3 で継続（ヘルプでは 10/15/20%） | Tier 2 以上で継続 | 未確認 | 直営 | PayPal | 未確認 | kajabi.com/policies/partner-program-terms |
| Kinsta | up to $500 一時金 ＋ lifetime monthly commissions of 10% | 無期限（10%） | 60日 | 直営 | 未確認 | 有 | kinsta.com/affiliates |
| Cloudways | $30 per sale + 7% lifetime | 無期限（7%） | 90日 | 直営 | PayPal $250 から、送金 $1000 から | 未確認 | cloudways.com/en/affiliate-program.php |
| Later / Tidio | 30% と書かれているが継続か期間かが未確認 | 未確認 | 未確認 | PartnerStack | 未確認 | 未確認 | later.com/affiliate-program、tidio.com/partners/affiliate |

一時金のみ: Shopify（最大 $150）、Semrush（$100〜300）、Hostinger（初回のみ）、SiteGround（$50〜）、WP Engine（$100〜200）、Hootsuite（初月 20%）、Tailwind、Squarespace、Wix（率非公開）、Brevo（403 で一部未確認）。
プログラム無し・未確認: Calendly（無し）、Paddle、Ahrefs、Gumroad、Lemon Squeezy。

### 2.3 消費者向けサブスク

| サービス | 報酬（公式の文言） | 継続 | cookie | 経路 | 受け取り・備考 | 日本語 UI | 出典 |
|---|---|---|---|---|---|---|---|
| NordVPN | 1か月: 新規 100% / 更新 30%。1年・2年: 新規 40% / 更新 30% | 更新に 30%（期間の記載なし） | 未確認 | 直営（nordvpnmedia） | 未確認 | 有 | nordvpn.com/affiliate/ |
| Proton（Mail / VPN / Drive / Pass） | 新規 30%（VPN 40%）、Renewals: 30% | 更新に 30%（期間の記載なし） | 未確認 | 直営 | 翌月30日に銀行振込、$100 超から | 無 | proton.me/partners/affiliates |
| pCloud | 20% of each monthly or annual payment for subscription plans | 全支払い（上限の記載なし） | 45日 | 直営 | PayPal $10 から、銀行 $500 から、全世界 | 未確認 | pcloud.com/affiliate |
| Backblaze | 公式に条件の記載なし（第三者: 10% lifetime、$100 から） | 未確認 | 未確認 | 直営ポータル | 未確認 | 無 | backblaze.com/partners |
| Surfshark | 40% revenue share of new sales | 一時金 | 30日 | Tune / Impact / CJ / Awin | $100 から | 有 | surfshark.com/affiliate |
| ExpressVPN | CPA。FAQ に「更新は対象外」と明記 | 一時金 | 未確認 | Impact | PayPal $50 から | 有 | expressvpn.com/affiliates/faq |
| 1Password | $2 per signup and 25% of the first year or month's payment | 一時金 | 未確認 | CJ | CJ 準拠 | 有 | 1password.com/affiliate |
| Skillshare | 20% commission, up to $34, for every new customer | 一時金 | 30日 | Impact | Impact 準拠 | 無 | skillshare.com/en/affiliates |
| Coursera | 15〜45%。「更新は対象外、初月のみ」と明記 | 一時金 | 30日 | Impact | Impact 準拠 | 無 | coursera.org/about/affiliates |
| Audible（日本） | 新規登録 1 件 1,500 円 | 一時金 | Amazon 準拠 | Amazon アソシエイト | Amazon 準拠 | 有 | affiliate.amazon.co.jp |
| Kindle Unlimited（日本） | 1 件 500 円 | 一時金 | Amazon 準拠 | Amazon アソシエイト | Amazon 準拠 | 有 | affiliate.amazon.co.jp |
| Grammarly | 率非公開（第三者: Premium $20） | 一時金 | 90日 | Impact | Impact 準拠 | 無 | grammarly.com/affiliates |

プログラム無し: Bitwarden（リセラーのみ）、Dropbox、Google One（Workspace のみ、一時金）、Spotify（Premium 向け無し）、Duolingo、Calm（明記）。未確認: Dashlane、Sync.com、MasterClass、Headspace。

### 2.4 日本の ASP に継続報酬はあるか

| ASP | 結果 | 根拠 |
|---|---|---|
| A8.net | 「継続型アフィリエイト機能」（2023-02）は **リピスト**（D2C 定期便カート）を使う広告主向け。公開の「リピート成果対象ランキング」はお名前.com 110 円/件、Agoda 4% など、注文ごとの成果で月額の分配ではない。サーバー・VPN・動画配信に月額継続の文言は無し | prtimes.jp/main/html/rd/p/000000061.000026953.html、support.a8.net/as/HintOfProgram/ranking/repeat.php |
| もしもアフィリエイト | 継続報酬の機能なし。ConoHa WING は単発 3,500〜10,000 円/件 | af.moshimo.com/af/www/help、conoha.jp/wing/affiliate/ |
| afb | サプリ・コスメの定期購入で「継続報酬」の事例はブログにあるが、公式の説明ページは無し | 第三者のみ |
| バリューコマース | 公式に継続報酬の記述なし | — |
| 楽天アフィリエイト | 楽天マガジンは初回申込のみ | affiliate.rakuten.co.jp/group/magazine/ |
| Amazon アソシエイト | Audible 1,500 円、KU 500 円の一時金 | 上記 |
| Xserver | A8 経由、報酬非公開、申込ごと | xserver.ne.jp/affiliate.php |
| 例外 | Dairin（dair.in）が「成約時の報酬に加え、利用継続期間に応じて毎月固定額または固定率」を売りにする ASP 機能を持つ。他に「継続報酬」で出てくるのは情報商材の 2-tier、FX、カジノ、成人向け | dair.in/blog/continuous-reward-examples.html |

### 2.5 日本在住の個人が海外ネットワークで受け取る条件

| ネットワーク | 受け取り方法 | 最低額 | 日本の扱い | 税務書類 | 出典 |
|---|---|---|---|---|---|
| PartnerStack | PayPal（手数料 2%、上限 $20）、Stripe、Airwallex 経由の口座振込（日本が明記） | 記載なし。出金には税務登録住所が必要 | 可。個人は自分の名前を事業名にしてよい | 口座振込のみ W-8。PayPal / Stripe は不要 | support.partnerstack.com/hc/en-us/articles/360009377934、/360048158113 |
| impact.com | 銀行（国内 EFT 無料 / 国際送金は通貨別手数料）、PayPal（2%、上限 $20） | $10。7 か月目から口座維持費（$10/月） | JPY の支店コード検証あり。国別リストは未確認 | 米国ブランドと組む非米国パートナーは W-8 必須 | help.impact.com（payment-requirements、withdraw-funds） |
| Awin | 銀行振込（公式ページ 404、第三者: 銀行 / PayPal / Wise） | 自分で設定、最低 $20 相当、1 日と 15 日 | 日本の明記なし。180 か国と謳うが個人の可否は未確認 | 記載なし | success.awin.com/s/article/What-are-the-payment-thresholds |
| CJ | 口座振込（150 通貨）、Payoneer、小切手 | 自分で設定（第三者: $50 / 小切手 $100） | Payoneer が非米国向け | W-8BEN（個人） | junction.cj.com |
| Rewardful 系 | 各社が設定: PayPal、Wise、または Managed Payouts | 各社が設定 | 各社と PayPal の可否次第 | W-8BEN（ブログ記述、未確認） | help.rewardful.com/en/articles/2773351 |
| FirstPromoter 系 | 各社が設定: PayPal、Stripe、Wise、銀行、暗号資産 | 各社が設定 | 各社次第 | PayPal 払いなら税務書類不要 | help.firstpromoter.com/en/articles/8971355 |

## 3. 次の判断材料

- 「読者に合う」「初年度が厚い」「日本語で申し込める」の三つを同時に満たすものは HubSpot と Pipedrive くらいで、どちらも風見鶏の読者とはずれる。
- 現実的な組み合わせは二段: (a) 読者に合う Kit / beehiiv / ElevenLabs のどれかを 1 本目、(b) 無期限の systeme.io / Thinkific を 2 本目。
- 消費者向けで日本語 UI があり更新にも出るのは NordVPN のみ。競合は多いが「誰にでも勧められる」棚として保険になる。
- ネットワークの登録はまず PartnerStack 一つに絞ると、Kit、Webflow、Thinkific、ElevenLabs、Softr、n8n、GetResponse、Pipedrive、HubSpot（Impact）以外がまとめて扱える。
- 登録はタカさんが行う。ハル はアカウント作成を代行しない。

## 4. 追加調査（2026-09-12 夜）: 普通の人が使うサブスクで継続報酬があるもの

条件: IT と関係ない人が日常で使うもの。日本語 UI は条件にしない（無いのに良いものは手引きが価値になる）。

### 4.1 公式ページで継続報酬を確認できたもの

| サービス | 分野 | 報酬（公式の文言） | 継続 | 経路 | 日本語 UI | 出典 |
|---|---|---|---|---|---|---|
| NordVPN | VPN | 新規 40〜100% / 更新 30% | 更新に 30% | Nord 直営 | 有 | nordvpn.com/affiliate/ |
| NordPass | パスワード管理 | 新規 30%、B2C の全更新に 10% | 更新に 10%、期限なし | Nord 直営（同じ口座） | 有の見込み | nordpass.com/affiliate/ |
| Proton | メール・VPN・保存 | 新規 30%（VPN 40%）、Renewals 30% | 更新に 30% | 直営、$100 超から銀行振込 | 無 | proton.me/partners/affiliates |
| pCloud | 保存 | 20% of each monthly or annual payment | 全支払い | 直営、PayPal $10 から | 未確認 | pcloud.com/affiliate |
| Kapwing | ブラウザ動画編集 | commissions for as long as they are a user（率は公式に無し、第三者 25〜35%） | ユーザーである限り | 直営 | 無 | kapwing.com/affiliates |
| Icedrive | 保存 | 20% on all sales including all recurring（自社の SNS 投稿。公式ページは取得できず） | 全更新 | 直営 | 無 | icedrive.net/partner-program |
| Everand（Scribd） | 電子書籍・オーディオブック | 15% recurring for up to 12 months。ただし成果対象は米英居住者の購入のみ | 12 か月 | PartnerStack | 無 | support.scribd.com |

### 4.2 有力だが公式で未確認（ページが 403 か、更新の記述なし）

IDrive（保存、第三者は 25% 継続で一致）、Enpass（パスワード、every purchase に 30%）、MEGA（保存、12 か月内の再購入に 20%）、Malwarebytes（最大 30%、更新は不明）、Bitdefender（新規 20%、更新は不明）、QuillBot（10〜20%、継続は不明）、Keeper（最低 10%）、RoboForm（30%、規約はログイン後）、Qustodio（最大 20%、Awin）。

### 4.3 一時金のみ、または無し

一時金: Setapp（$25）、Adobe（1 請求期間分）、Babbel、italki、Preply、Brilliant、Fitbit Premium、MyFitnessPal、YNAB、Monarch、Noom、Suno、Kobo Plus。
無し: DeepL、Mullvad、Kagi、Tuta（クレジット付与のみ。第三者の「25% 継続」は誤り）。

### 4.4 見立て

- 普通の人向けで継続報酬が確認できるのは「守りと片付け」に集中している。VPN、パスワード管理、保存、暗号化メール。これは「デジタルの身の回りをととのえる」と読み替えられ、Sopiva の看板と噛み合う。
- 上位はほぼ直営プログラム（Nord、Proton、pCloud、Icedrive、Kapwing）。PartnerStack に依存しなくても 1 本目を始められる。
- 日本で既に多く紹介されているのは NordVPN だけ。NordPass、Proton、pCloud、Icedrive、Kapwing は日本語の手引きがほぼ無い。値差はこちらにある。

## 5. PartnerStack の評判（2026-09-12）

### 5.1 数字

| 場所 | 評価 | 件数 | 主な書き手 |
|---|---|---|---|
| Trustpilot | 1.8〜2.0 / 5 | 61 件。1 つ星 64%、5 つ星 32% の二極 | アフィリエイト（受け取る側） |
| G2 | 4.6〜4.7 / 5 | 約 900〜1,000 件 | プログラムを運営する会社（払う側） |
| Capterra | 4.8 / 5 | 89 件 | 同上 |
| Google | 独立した口コミページは見つからず。検索結果に Trustpilot 等の断片が出ている可能性が高い | | |

### 5.2 苦情の中身（受け取る側）

未払い・消えた報酬、説明なしの凍結、サポート無応答、計測のバグ。2026 年 5〜7 月の 1 つ星に会社の返信なし。第三者の比較テストで「PartnerStack だけ成果を計測しなかった」という指摘が 1 件（単独の検証で、追認はできていない）。

### 5.3 公式の仕組み

- 最低支払額 $5。毎月 8〜13 日に引き出し。PayPal（5 日保留）、Stripe（$2.25 + 0.25%、上限 $20）、Airwallex 口座振込。
- 参加承認は各プログラムの会社が個別に行う。却下理由は表示される。
- 返金・解約があると会社側がクローバック（未払い残高から差し引き、残高がマイナスになることもある）。**支払い済みの金額は戻されない。**
- 除名も各社ごと。1 社から外されても口座は残る。

### 5.4 判定

詐欺ではない。ただし受け取る側の金銭トラブルは実際に起き、サポートは当てにならない。小さく使うなら足りる。対策:

1. 各プログラムの規約を文字どおり守る（自己紹介、報酬付き誘導、cookie の細工をしない）
2. $5 を超えたら毎月引き出す。残高を溜めない
3. 管理画面を定期的に記録しておく
4. 直営プログラムを混ぜて、PartnerStack 一本に寄せない。上の 4.4 のとおり、普通の人向けの棚は直営が主なので自然に分散する
5. 支払いが止まったら、PartnerStack のサポートと同時に、その会社（資金を持っている側）にも連絡する

## 6. 網（ネットワーク）の比較（2026-09-12 夜）: 一つ登録して多くの継続報酬に届くか

前提: どの網も「網への登録」と「各社プログラムへの参加承認」は別。承認なしで即使えるのは ClickBank と Digistore24（情報商材中心、うちの棚には合わない）だけ。網の価値は、一つの画面・一つの支払い・一つの税務書類に集約できること。

| 網 | 種類 | 各社承認 | 継続報酬の例（確認済み） | 日本の個人 | 支払い | 評判 | 出典 |
|---|---|---|---|---|---|---|---|
| Impact.com | 大手網、2,000 社超（NordVPN、HubSpot、Canva、Shopify、Semrush） | 各社ごと | NordVPN（更新 30%、Impact 経由でも参加可）、HubSpot（12 か月 30%） | 可、W-8BEN | PayPal 2%（上限 $20）/ 銀行、$10 から。**維持費は税務・支払い情報が未設定で 6 か月払えない場合のみ $10/月**（公式ヘルプで確認） | Trustpilot は件数少なく低め | help.impact.com、junction.cj.com |
| PartnerStack | B2B SaaS 市場 | 各社ごと | Kit、Webflow、Thinkific、ElevenLabs、GetResponse、Pipedrive ほか（2 章） | 可、PayPal/Stripe なら W-8 不要 | 最低 $5 | 1.8〜2.0（5 章） | support.partnerstack.com |
| Awin（ShareASale を 2025 年に吸収） | 大手網、数万社 | 各社ごと | NordVPN（US & CA 向け）。他の継続型は名前で確認できず | 明記なし。旧 $5 デポジットの有無は未確認 | 各社ごと、最低 $20 相当 | 3.8 | awin.com |
| CJ | 大手網 | 各社ごと、サイト審査あり | NordVPN（新規 40%） | 可、W-8BEN、Payoneer | $50 から。6 か月無活動で閉鎖 | 低い | junction.cj.com |
| Rakuten Advertising | 大手網 | 各社ごと | 名前で確認できず | 可 | 12 か月無活動で維持費 | 2.2 | pubhelp.rakutenadvertising.com |
| FlexOffers | 集約網 | 一部自動承認 | 名前で確認できず | 可 | 標準 | 2.5 | flexoffers.com |
| Reditus | B2B SaaS の一覧兼市場、155 件 | 各社ごと | Reditus 上: Joiin 12 か月 40〜50%、Leadpages 12 か月 20%、Search Atlas 無期限 30%、Omnimind 無期限 30%。他は他社基盤への案内（systeme.io、MailerLite、beehiiv、Snov.io 無期限 40%） | 制限の記載なし | Reditus 上のものは一つのリンクと自動支払い | 未確認 | getreditus.com/affiliate-programs |
| ClickBank / Digistore24 | 情報商材の市場 | ほぼ即時 | rebill 型が多い。Digistore24 は無期限 70% の商品も | 可 | PayPal/送金、$50 から | ClickBank 4.5 | 棚に合わない |
| Tolt / FirstPromoter / Rewardful / Affiliatly / Post Affiliate Pro | 各社が自前で回す道具。市場ではない | — | — | — | — | — | 対象外 |

### 6.1 見立て

- 「一つ登録して全部」は存在しない。現実解は **Impact と PartnerStack の二つ**。Impact が消費者向け（NordVPN ほか）、PartnerStack が SaaS（ElevenLabs、Kit、Webflow、Thinkific）。この二つで 1 章と 4 章の候補の大半に届く。
- 直営は、網に無いもの（Proton、pCloud、Icedrive、Kapwing、systeme.io、beehiiv）だけ、棚に載せると決めたときに個別に。
- 網の中の継続型プログラムの全容は、外からは見えない。登録して管理画面で「recurring」で検索するのが一番確実で、これはタカさんの手になる。
- 未確認: Awin の日本の個人の可否とデポジット、NordPass が Impact 上にあるか、Impact 経由の NordVPN に更新報酬が付くか（直営の条件と同じかは登録後に確認）。

## 7. 「日本でデジタルツールを売る方法」に特化したニュースレターはあるか（2026-09-12 夜）

問い: 海外の SaaS・開発者ツールが日本に入るときの売り方（円建て価格、決済手段、販売代理店の構造、日本語化の順番、日本の買い手の反応、どの海外ツールが日本で伸びているか）に特化した英語の有料レターは存在するか。

| 名前 | 運営 | 有料 | 特化度（5 が最高） |
|---|---|---|---|
| Disrupting Japan | Tim Romero、podcast + Substack、2,000 人超 | 無料 | 2。スタートアップ生態系の話。GTM は対談の中で散発 |
| One Capital の Japan SaaS Insights | VC | 無料、年次 | 2。日本の SaaS の市場規模。海外勢の入り方ではない |
| Made In Japan | 匿名 Substack、4,600 人超 | 有料枠あり | 1。日本 SaaS 株の投資レター |
| Coral Capital blog | VC | 無料 | 2 |
| TokyoDev / Japan Dev | 求人 | 無料 | 1。採用 |
| Nihonium | 日本 GTM コンサルの資料ハブ | 無料資料、有料はコンサル | 4。題材は近いが、営業導線であって定期刊行物ではない |
| Stripe の Payments in Japan | ベンダー | 無料 | 3。決済だけ |

日本語側にも「海外 SaaS を日本で売る方法」の定期刊行物は見つからず。WOVN、IGNITE 等のローカライズ会社の記事が散発するのみ。

**結論: (a) 海外ソフトの日本 GTM に特化し、(b) 2026 年に定期刊行され、(c) 有料か持続する事業として回っているものは、英語にも日本語にも見つからなかった。** 空白。ただし検索に出ない小規模・招待制の存在は否定できない。

金を払う価値が出るために要る中身（GTM の人が実際に聞いていること）: 決済手段別の転換率（コンビニ、カード、振込、請求書）、名前と数字のある成功・失敗事例と代理店の取り分の相場、調達・法令の生きたチェックリスト（印鑑、インボイス制度、ISMAP、セキュリティ調査票）。

### 7.1 式との関係（タカさんとの議論、2026-09-12 夜）

- 他人の台（TikTok、アフィリエイト）で張る限り胴元には勝てない。持っている〇（深い信号の自動収集、即日の制作、自動投稿と反応計測、空白の占有）を、自分が支払いの仕組みを握る形に組み替える。
- 式の候補 1: 装置の公開実演 ＋ タカさんが既に握る支払いの仕組み（MaiWay 顧問、SE カレッジ、HARU の月額）＝「業界版の装置」を中小企業に月額で売る。アフィリエイトは実演台に格下げ。
- 式の候補 2（この章）: 装置が測る「日本語圏の反応」と「どの海外ツールに日本の需要が生まれているか」 ＋ タカさんの 10 年の日本の中小企業・IT の知識 ＝ 海外のソフト企業の GTM 担当に売る有料の情報。支払いの仕組みは beehiiv / Stripe。日本の読者を集めなくてよい。競合は空白。航路B（日本の情報を英語圏へ）の形。

