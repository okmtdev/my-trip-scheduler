# my-trip-scheduler

家族旅行のスケジュールを簡単に作成・管理できる Web アプリケーションです。

## 機能

- **ファミリー管理**: 家族（ファミリー）単位でスケジュールを管理
- **カレンダー日付選択**: カレンダー UI で旅行日程を選択
- **24 時間タイムライン**: 1 日ごとの予定を時間軸で視覚的に管理
- **カテゴリー分類**: 移動（飛行機・電車・バス・車）、食事、イベント、観光、宿泊
- **Markdown エクスポート / インポート**: 予定表を Markdown やテキスト形式で保存・読込
- **AI 画像生成**: Gemini API を使ってスケジュールの画像を自動生成
- **ローカルストレージ保存**: データはブラウザのローカルストレージに保存（外部サーバー不要）

## 技術スタック

- [Next.js](https://nextjs.org/) 14 (App Router, Static Export)
- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 3

## セットアップ

### 必要なもの

- Node.js 18 以上
- npm

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### Gemini API（画像生成機能）

画像生成機能を利用するには Gemini API キーが必要です。

1. [Google AI Studio](https://aistudio.google.com/app/apikey) で API キーを取得
2. アプリの「画像生成」ボタンから API キーを入力

API キーはブラウザのローカルストレージにのみ保存され、Gemini API への直接リクエストにのみ使用されます。

## Google Cloud Storage へのデプロイ

### 前提条件

- [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install) がインストール済み
- Google Cloud プロジェクトが作成済み
- 課金が有効化済み

### 手順

#### 1. gcloud の初期化とプロジェクトの設定

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### 2. Cloud Storage バケットの作成

```bash
gcloud storage buckets create gs://YOUR_BUCKET_NAME --location=asia-northeast1
```

#### 3. バケットの公開設定

```bash
gcloud storage buckets add-iam-policy-binding gs://YOUR_BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

#### 4. アプリケーションのビルド

`BASE_PATH` にバケット名を指定してビルドします。
Cloud Storage は `https://storage.googleapis.com/BUCKET_NAME/` の形式で配信されるため、アセットパスにバケット名のプレフィックスが必要です。

```bash
BASE_PATH=/YOUR_BUCKET_NAME npm run build
```

> **Note**: カスタムドメインや Load Balancer 経由（ルートから配信）の場合は `BASE_PATH` なしでビルドしてください。
>
> ```bash
> npm run build
> ```

`out/` ディレクトリに静的ファイルが生成されます。

#### 5. ビルド成果物のアップロード

```bash
gcloud storage rsync out/ gs://YOUR_BUCKET_NAME --recursive --delete-unmatched-destination-objects
```

#### 6. 静的ウェブサイトの設定

```bash
gcloud storage buckets update gs://YOUR_BUCKET_NAME \
  --web-main-page-suffix=index.html \
  --web-error-page=404.html
```

#### 7. アクセス確認

ブラウザで以下の URL にアクセスしてください:

```
https://storage.googleapis.com/YOUR_BUCKET_NAME/index.html
```

### カスタムドメインを使用する場合（オプション）

Cloud Storage の静的ウェブサイトにカスタムドメインを設定する場合:

1. バケット名をドメイン名と同じにする（例: `www.example.com`）
2. ドメインの DNS に CNAME レコードを追加して `c.storage.googleapis.com` を指定
3. ドメインの所有権を Google Search Console で確認

詳細は [公式ドキュメント](https://cloud.google.com/storage/docs/hosting-static-website) を参照してください。

### Cloud CDN + Load Balancer を使用する場合（オプション）

HTTPS でのアクセスやパフォーマンス向上が必要な場合は、Cloud CDN と Load Balancer の利用を推奨します:

```bash
# バックエンドバケットの作成
gcloud compute backend-buckets create YOUR_BACKEND_BUCKET \
  --gcs-bucket-name=YOUR_BUCKET_NAME \
  --enable-cdn

# URL マップの作成
gcloud compute url-maps create YOUR_URL_MAP \
  --default-backend-bucket=YOUR_BACKEND_BUCKET

# ターゲット HTTPS プロキシの作成（SSL 証明書付き）
gcloud compute ssl-certificates create YOUR_SSL_CERT \
  --domains=YOUR_DOMAIN \
  --global

gcloud compute target-https-proxies create YOUR_HTTPS_PROXY \
  --url-map=YOUR_URL_MAP \
  --ssl-certificates=YOUR_SSL_CERT \
  --global

# グローバル外部 IP アドレスの予約
gcloud compute addresses create YOUR_IP_NAME \
  --global

# フォワーディングルールの作成
gcloud compute forwarding-rules create YOUR_FWD_RULE \
  --global \
  --target-https-proxy=YOUR_HTTPS_PROXY \
  --address=YOUR_IP_NAME \
  --ports=443
```

## ライセンス

MIT
