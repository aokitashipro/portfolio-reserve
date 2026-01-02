#!/bin/bash

# Admin機能フラグ関連のIssue作成スクリプト

echo "Admin機能フラグ関連のIssueを作成します..."

# Issue #89: 機能フラグDB設計・実装
gh issue create \
  --title "【Admin機能】機能フラグのデータベース設計・実装" \
  --label "feature,priority-high" \
  --body "## 📝 概要
オプション機能のON/OFF管理のためのデータベース設計と実装

## 🎯 目的
ココナラ販売時に、顧客が購入したオプション機能のみを有効化できるようにする

## ✅ 実装内容

### Phase 1: データベース
- [ ] Prismaスキーマに\`FeatureFlag\`モデル追加
- [ ] マイグレーション実行
- [ ] Seed dataで初期フラグ設定（デモ環境は全機能ON）

\`\`\`prisma
model FeatureFlag {
  id                         String   @id @default(uuid())
  tenantId                   String   @map(\"tenant_id\")
  
  enableStaffSelection       Boolean  @default(false)
  enableStaffShiftManagement Boolean  @default(false)
  enableCustomerManagement   Boolean  @default(false)
  enableReservationUpdate    Boolean  @default(false)
  enableReminderEmail        Boolean  @default(false)
  enableManualReservation    Boolean  @default(false)
  enableAnalyticsReport      Boolean  @default(false)
  enableRepeatRateAnalysis   Boolean  @default(false)
  enableCouponFeature        Boolean  @default(false)
  enableLineNotification     Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([tenantId])
  @@map(\"feature_flags\")
}
\`\`\`

### Phase 2: API実装
- [ ] \`GET /api/admin/feature-flags\` API実装（Admin専用）
- [ ] \`PATCH /api/admin/feature-flags\` API実装（Admin専用）
- [ ] \`GET /api/feature-flags\` API実装（全ユーザー向け）
- [ ] バリデーション実装
- [ ] エラーハンドリング実装

## 🔧 実装工数
約8時間

## 📚 関連ドキュメント
- \`documents/marketing/Admin機能フラグ設計.md\`"

# Issue #90: Admin機能設定画面の実装
gh issue create \
  --title "【Admin機能】機能設定画面の実装（ON/OFF切り替えUI）" \
  --label "feature,priority-high" \
  --body "## 📝 概要
Admin権限で各オプション機能のON/OFFを切り替えられる設定画面を実装

## 🎯 目的
購入したオプション機能を管理画面から簡単に有効化/無効化できるようにする

## ✅ 実装内容

### Phase 1: 設定画面
- [ ] \`/admin/settings/features\` ページ作成
- [ ] \`FeatureFlagCard\` コンポーネント実装
- [ ] トグルスイッチUI実装
- [ ] 保存ボタン・保存処理実装
- [ ] ローディング・エラー表示

### Phase 2: 画面レイアウト
各オプション機能をカード形式で表示
- 機能名
- 価格（+X,000円）
- 機能説明
- ON/OFFトグル

### Phase 3: UX改善
- [ ] 変更内容のプレビュー
- [ ] 確認ダイアログ
- [ ] 成功/失敗メッセージ

## 🔧 実装工数
約8時間

## 📚 関連ドキュメント
- \`documents/marketing/Admin機能フラグ設計.md\`"

# Issue #91: フロントエンド機能フラグ制御の実装
gh issue create \
  --title "【Admin機能】フロントエンドでの機能フラグ制御実装" \
  --label "feature,priority-high" \
  --body "## 📝 概要
フロントエンドで機能フラグに基づいてUIの表示/非表示を制御する

## 🎯 目的
機能が無効な場合はUIを表示せず、有効な場合のみ表示する

## ✅ 実装内容

### Phase 1: カスタムフック
- [ ] \`useFeatureFlags\` カスタムフック実装
- [ ] SWRを使ったキャッシュ実装
- [ ] Context APIでアプリ全体から参照可能にする

### Phase 2: 各機能での制御
- [ ] スタッフ指名機能の表示制御
- [ ] スタッフシフト管理の表示制御
- [ ] 顧客管理機能の表示制御
- [ ] 予約変更機能の表示制御
- [ ] 分析レポートの表示制御
- [ ] その他オプション機能の表示制御

### Phase 3: UX改善
- [ ] 機能無効時のメッセージ表示
- [ ] 「この機能を有効にするには管理者にお問い合わせください」

## 🔧 実装例
\`\`\`tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export function BookingForm() {
  const { flags } = useFeatureFlags();

  return (
    <form>
      <MenuSelect />
      
      {flags.enableStaffSelection && (
        <StaffSelect />
      )}
      
      {flags.enableCouponFeature && (
        <CouponInput />
      )}
    </form>
  );
}
\`\`\`

## 🔧 実装工数
約6時間

## 📚 関連ドキュメント
- \`documents/marketing/Admin機能フラグ設計.md\`"

# Issue #92: バックエンドAPI保護の実装
gh issue create \
  --title "【Admin機能】バックエンドAPIでの機能フラグチェック実装" \
  --label "feature,priority-medium" \
  --body "## 📝 概要
バックエンドAPIで機能フラグをチェックし、無効な機能へのアクセスを拒否する

## 🎯 目的
フロントエンドを迂回した直接APIアクセスを防止する

## ✅ 実装内容

### Phase 1: ミドルウェア実装
- [ ] \`requireFeatureFlag\` ミドルウェア実装
- [ ] 機能フラグチェック処理
- [ ] 403エラーレスポンス

### Phase 2: 各APIで適用
- [ ] 予約変更API
- [ ] スタッフ指名関連API
- [ ] 顧客管理API
- [ ] 分析レポートAPI
- [ ] クーポンAPI
- [ ] その他オプション機能のAPI

### Phase 3: エラーメッセージ統一
- [ ] 統一エラーメッセージ作成
- [ ] エラーログ記録

## 🔧 実装例
\`\`\`typescript
export async function PATCH(request: NextRequest) {
  const flags = await getFeatureFlags(TENANT_ID);
  if (!flags.enableReservationUpdate) {
    return NextResponse.json(
      { success: false, error: '予約変更機能は有効化されていません' },
      { status: 403 }
    );
  }
  // 処理続行
}
\`\`\`

## 🔧 実装工数
約6時間

## 📚 関連ドキュメント
- \`documents/marketing/Admin機能フラグ設計.md\`"

echo "Admin機能フラグ関連のIssue作成完了！"
