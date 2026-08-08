# Rafale Holdings 株式会社 コーポレートサイト

「楽しさを原動力に。人を育て、事業を育てる。」を理念に、飲食・エンターテインメント・
コンサルティングなど8事業を展開する Rafale Holdings 株式会社の公式サイトです。

黒・ゴールド・ホワイトを基調に、Apple のミニマルさ／Hermès の高級感／日本らしい静けさを
目指した、静かで上質なブランドサイトです。

---

## 技術構成

- **プレーンな静的サイト**（HTML / CSS / JavaScript のみ）
- **ビルド不要**・フレームワーク不要・依存パッケージなし
- 桜の花びら演出やヒーローのオープニングは JavaScript / CSS のみで実装（外部ライブラリ不使用）
- フォント: Google Fonts（Shippori Mincho / Noto Sans JP）を CDN から読み込み

そのままファイルを配信するだけで動作します。Cloudflare Pages / GitHub Pages / Netlify などの
静的ホスティングにビルドコマンドなしで公開できます。

## ディレクトリ構成

```
.
├── index.html            … トップページ（1ページ完結）
├── 404.html              … 404ページ（Cloudflare Pagesが自動で使用）
├── css/style.css         … スタイル
├── js/script.js          … スクリプト（桜演出・スクロール・フォーム等）
├── img/                  … ロゴ・favicon・OGP・ブランドロゴ
│   ├── logo.png          … ★会社ロゴ（現在は仮ロゴ／差し替え可）
│   ├── brand-sakura-logo.png … ★SAKURA Poker Lounge ロゴ（仮）
│   ├── ogp.jpg           … SNSシェア用サムネイル
│   ├── favicon-16.png / favicon-32.png / apple-touch-icon.png
│   ├── icon-192.png / icon-512.png
│   └── README.txt        … 画像差し替えの詳しい手順
├── assets/videos/        … ★ヒーロー背景動画の置き場所（未配置。README.txt参照）
├── robots.txt
├── sitemap.xml
├── site.webmanifest      … PWAマニフェスト
├── _headers              … Cloudflare Pages 用HTTPヘッダ設定
└── .gitignore
```

★ = 後から差し替え/追加する前提のファイル

## ローカルで確認する

任意の静的サーバーで `index.html` を開くだけです。例：

```bash
# Python がある場合
python -m http.server 5173
# → http://localhost:5173 を開く
```

（開発時に使用していた PowerShell 用サーバーは `.claude/` にありますが、公開には不要のため
リポジトリには含めていません。）

---

## Cloudflare Pages への公開設定

GitHub リポジトリと連携して公開します。ビルドは不要なので、設定は以下だけです。

| 項目 | 値 |
|------|-----|
| Framework preset（フレームワーク） | **None** |
| Build command（ビルドコマンド） | **（空欄）** |
| Build output directory（出力ディレクトリ） | **`/`**（リポジトリのルート） |
| Root directory | （空欄のまま） |

- `404.html` は Cloudflare Pages が自動的に404ページとして使用します。
- `_headers` によりセキュリティヘッダと画像キャッシュが自動適用されます。

> 具体的な操作手順はリポジトリ連携ウィザードに沿って進めてください（本リポジトリを選択 →
> 上記の設定 → Deploy）。

---

## 後から追加・差し替えする項目（構造は対応済み）

以下は「ファイルを差し替える／コメントを外す」だけで反映できるようにしてあります。

- **正式ロゴ** … `img/logo.png` を上書き（ヘッダー・ヒーロー両方に自動反映。ダーク背景用＝
  文字が白系・背景透過のPNG推奨）
- **ブランドムービー（約12秒）** … `assets/videos/rafale-opening.mp4`（任意で `.webm`）を配置。
  未配置の間はコード生成のオープニング演出が自動表示されます
- **ブランド追加** … `index.html` の `#brands` 内 `<article class="brand-card">` を複製
- ~~**お問い合わせ送信機能**~~ … 対応済み。`functions/api/contact.js` から Resend 経由で
  `info@rafale-hd.jp` へ送信します（APIキーは Cloudflare の環境変数 `RESEND_API_KEY`）
- **独自ドメイン** … 現在 `rafale-holdings.co.jp` を仮設定。確定後に
  `index.html`（canonical / og:url / og:image / 構造化データ）・`sitemap.xml`・`robots.txt` を更新
- **電話番号** … 現在「只今準備中です」（`index.html` の CONTACT）
- ~~**ブランドサイトURL**~~ … 対応済み。SAKURA Poker Lounge（`https://sakura-poker.jp/`）
- **Google Analytics (GA4)** … `index.html` の `<head>` 内コメントを外し測定IDを設定
- **Google Search Console** … 同 `<head>` 内コメントの確認メタタグ、または確認用HTMLを設置

## 配色・デザイン方針

- 配色は **黒 / ゴールド / ホワイト** で固定（`css/style.css` の `:root` にトークン定義）
- 派手さではなく、余白・タイポグラフィ・控えめなアニメーションで魅せる
- `prefers-reduced-motion` 有効時はアニメーションを自動的に停止

---

© Rafale Holdings Co., Ltd. All Rights Reserved.
