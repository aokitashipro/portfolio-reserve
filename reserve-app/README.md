# Reserve System - 予約管理システム

Next.js + Supabase + Prisma で構築した、美容室・サロン・クリニック等の多業種対応予約管理システム

## 🎯 プロジェクト概要

美容室、歯科医院、整体院などの店舗向け予約管理システムのデモアプリケーション。
マルチテナント対応により、複数のポートフォリオシステムで同一データベースを共有可能。

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 16 (App Router) + React 19
- **スタイリング**: Tailwind CSS v4
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma 7
- **テスト**: Jest + React Testing Library + Playwright
- **言語**: TypeScript

## 📋 必須要件

- Node.js 20.x 以上
- npm または yarn
- Supabaseアカウント

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local`ファイルを編集して、Supabase接続情報を設定してください。
詳細は[SETUP.md](./SETUP.md)を参照。

### 3. データベースのセットアップ

```bash
# Prisma Clientを生成
npm run prisma:generate

# マイグレーションを実行（Supabase接続情報が必要）
npm run prisma:migrate
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### 5. データベース接続の確認

```bash
curl http://localhost:3000/api/health
```

## 📂 プロジェクト構成

```
reserve-app/
├── prisma/
│   ├── schema.prisma         # データベーススキーマ定義
│   └── migrations/           # マイグレーションファイル
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # APIルート
│   │   └── ...               # ページコンポーネント
│   ├── components/           # UIコンポーネント
│   ├── lib/
│   │   └── prisma.ts         # Prisma Clientシングルトン
│   └── __tests__/            # テストファイル
├── .env.example              # 環境変数テンプレート
├── package.json
└── SETUP.md                  # 詳細セットアップガイド
```

## 🗄️ データベーススキーマ

### テーブル一覧（booking_* prefix）

| テーブル名 | 説明 |
|-----------|------|
| `booking_users` | ユーザー情報 |
| `booking_staff` | スタッフ情報 |
| `booking_menus` | メニュー情報 |
| `booking_reservations` | 予約情報 |
| `booking_settings` | 店舗設定 |

すべてのテーブルに`tenant_id`カラムがあり、マルチテナント対応しています。

### マルチテナント設計

- **テーブル名プレフィックス**: `booking_*`（他システムは`hotel_*`, `clinic_*`など）
- **論理的分離**: `tenant_id`カラムで各テナントのデータを分離
- **環境変数**: `NEXT_PUBLIC_TENANT_ID`で現在のテナントを指定

## 🧪 テスト

### 単体テスト

```bash
npm run test
```

### E2Eテスト

プロジェクトでは**2段階テスト戦略**を採用しています：

#### スモークテスト（高速・PR用）
```bash
npm run test:e2e:smoke
```
クリティカルパスのみをテスト（5-8分）。PR作成時に自動実行されます。

#### フルE2Eテスト（完全・main用）
```bash
npm run test:e2e:full
```
全テストケースを実行（15-25分）。mainブランチマージ後に自動実行されます。

#### 従来のE2Eテスト実行
```bash
npm run test:e2e
```
全テストを実行（`test:e2e:full`と同じ）

### カバレッジレポート

```bash
npm run test:coverage
```

## 🔧 便利なコマンド

### Prisma関連

```bash
# Prisma Clientを生成
npm run prisma:generate

# マイグレーションを実行
npm run prisma:migrate

# Prisma Studioを起動（GUIでデータベース確認）
npm run prisma:studio

# データベースにスキーマをプッシュ（マイグレーションなし）
npm run prisma:push

# スキーマをフォーマット
npm run prisma:format
```

### 開発関連

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Lint実行
npm run lint
```

## 📖 関連ドキュメント

- [SETUP.md](./SETUP.md) - 詳細なセットアップ手順
- [GitHub Issues](https://github.com/YOUR_USERNAME/reserve-system/issues) - 機能一覧とタスク管理

## 🔗 外部リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📝 開発プロセス

このプロジェクトは **ATDD/BDD駆動開発** を採用しています。

1. GitHub Issueで機能要件を定義
2. BDDシナリオ作成（Gherkin記法）
3. 受入テスト実装（Playwright）
4. 単体テスト実装（Jest + RTL）
5. 機能実装
6. リファクタリング

詳細は `documents/開発プロセス設計.md` を参照。

## 🚀 デプロイ

### Vercelへのデプロイ

```bash
vercel
```

環境変数の設定方法は[SETUP.md](./SETUP.md)を参照。

## 📄 ライセンス

このプロジェクトはポートフォリオ目的で作成されています。

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
