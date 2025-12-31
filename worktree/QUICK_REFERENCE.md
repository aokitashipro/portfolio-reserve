# Quick Reference - 4 Worktree 並行作業

## ⚡ 最優先事項

### 🚨 絶対に守ること

1. **共有ファイルは触らない** (package.json, schema.prisma, tsconfig.json)
2. **毎朝mainからrebase** (`git rebase main`)
3. **PR前に全テスト実行** (`npm run lint && npm test && npm run test:e2e`)
4. **型安全性100%** (anyは使わない)

---

## 📂 各Worktreeの担当範囲

### Worktree 1: CI/CD (`reserve-system-cicd`)
**編集OK:**
- `.github/workflows/*.yml`
- `package.json` (依存関係追加はここで)
- `.env.example`
- `tsconfig.json`, `eslint.config.mjs`

**Issue:** #3, #4

---

### Worktree 2: Auth (`reserve-system-auth`)
**編集OK:**
- `src/app/(auth)/register/`
- `src/app/(auth)/login/`
- `src/components/auth/`
- `src/__tests__/e2e/auth.spec.ts`

**Issue:** #5, #6

**必要な依存:**
```bash
# Supabase Auth
npm install @supabase/auth-helpers-nextjs
```

---

### Worktree 3: Admin (`reserve-system-admin`)
**編集OK:**
- `src/app/(admin)/admin/dashboard/`
- `src/app/(admin)/admin/reservations/`
- `src/components/admin/`
- `src/__tests__/e2e/admin.spec.ts`

**Issue:** #7, #15, #16

---

### Worktree 4: Booking (`reserve-system-booking`)
**編集OK:**
- `src/app/(booking)/menus/`
- `src/app/(booking)/booking/`
- `src/components/booking/`
- `src/__tests__/e2e/booking.spec.ts`

**Issue:** #8, #9, #10, #11

**必要な依存:**
```bash
# メール送信
npm install resend
```

---

## 🔄 毎日のルーチン

### 朝一（全worktree）

```bash
# メインリポジトリでmainを更新
cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system
git checkout main
git pull origin main

# 各worktreeでrebase
cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-cicd
git rebase main

cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-auth
git rebase main

cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-booking
git rebase main

cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-admin
git rebase main
```

### 作業終了前（各worktree）

```bash
cd reserve-app

# 品質チェック
npm run lint
npm run build:ci
npm test
npm run test:e2e

# すべて通ったらコミット
git add .
git commit -m "feat: XXX機能を実装"
git push origin feature/xxx
```

---

## ✅ PR作成前チェックリスト（超重要）

```bash
# 1. Lintチェック
npm run lint
# ✅ エラー0件であることを確認

# 2. 型チェック＋ビルド
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run build:ci
# ✅ ビルド成功を確認

# 3. 単体テスト
npm test
# ✅ すべて通過を確認

# 4. E2Eテスト
npm run test:e2e
# ✅ すべて通過を確認

# 5. 変更内容確認
git status
git diff
# ✅ 意図しない変更がないか確認
```

---

## 🎨 統一デザイン

### カラー（Tailwind）

```typescript
primary:   'bg-blue-500'   // アクションボタン
secondary: 'bg-purple-500' // 強調
success:   'bg-green-500'  // 成功メッセージ
warning:   'bg-yellow-500' // 警告
danger:    'bg-red-500'    // エラー
```

### ボタンスタイル

```tsx
// Primary
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  送信
</button>

// Secondary
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
  キャンセル
</button>

// Danger
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
  削除
</button>
```

### レイアウト

```tsx
// ページ共通レイアウト
<main className="container mx-auto px-4 py-8">
  <h1 className="text-2xl font-bold mb-6">タイトル</h1>
  <div className="bg-white rounded shadow p-6">
    {/* コンテンツ */}
  </div>
</main>
```

---

## 🧪 テストパターン

### E2Eテスト（Playwright）

```typescript
import { test, expect } from '@playwright/test';

test('ユーザーが登録できる', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/login');
  await expect(page.locator('.success')).toContainText('登録完了');
});
```

### 単体テスト（Jest + RTL）

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('クリックイベントが発火する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 🔐 認証フロー（Auth worktree用）

### Supabase Auth統合

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// components/auth/RegisterForm.tsx
const handleRegister = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Registration failed:', error);
    return;
  }

  console.log('User registered:', data.user);
};
```

---

## 📅 予約機能パターン（Booking worktree用）

### カレンダーコンポーネント

```typescript
// components/booking/Calendar.tsx
'use client';

import { useState } from 'react';

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="grid grid-cols-7 gap-2">
      {dates.map((date) => (
        <button
          key={date.toString()}
          onClick={() => setSelectedDate(date)}
          className={`
            p-2 rounded
            ${selectedDate === date ? 'bg-blue-500 text-white' : 'bg-gray-100'}
            ${isPast(date) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}
          `}
          disabled={isPast(date)}
        >
          {date.getDate()}
        </button>
      ))}
    </div>
  );
}
```

---

## 👨‍💼 管理画面パターン（Admin worktree用）

### ダッシュボード統計

```typescript
// app/(admin)/admin/dashboard/page.tsx
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  // 今日の予約数
  const todayReservations = await prisma.restaurantReservation.count({
    where: {
      tenantId: process.env.NEXT_PUBLIC_TENANT_ID,
      reservedDate: new Date(),
    },
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold">本日の予約</h2>
        <p className="text-3xl font-bold">{todayReservations}件</p>
      </div>
    </div>
  );
}
```

---

## 🚨 コンフリクト解決

### rebase中にコンフリクト発生

```bash
# 1. コンフリクトファイルを確認
git status

# 2. エディタで手動解決（<<<<< HEAD などを削除）

# 3. 解決後
git add .
git rebase --continue

# 4. 解決できない場合は中止
git rebase --abort
# → 他のエージェントと調整
```

---

## 📊 マージ順序

```
1️⃣ cicd → main (最優先)
   ↓
2️⃣ auth → main
   ↓
3️⃣ booking → main
   ↓
4️⃣ admin → main
```

**理由:**
- CI/CD先行 → 以降のPRで自動テストが動く
- auth先行 → booking, adminで認証使える

---

## 🎯 ゴール（Week 1）

- [ ] CI/CD完成（GitHub Actions動作）
- [ ] ユーザー認証完成（登録・ログイン）
- [ ] 予約機能完成（カレンダー・登録）
- [ ] 管理ダッシュボード完成

---

## 📞 ヘルプが必要な場合

### よくある問題

**Q: package.jsonに依存を追加したい**
→ A: `cicd` worktreeで追加して、他のworktreeは翌日rebaseで取得

**Q: Prismaスキーマを変更したい**
→ A: 全員に影響するため、事前に調整

**Q: 共通コンポーネントを作りたい**
→ A: `src/components/ui/` に配置（重複確認）

---

## 🚀 今すぐやること

1. **自分のworktreeに移動**
2. **担当Issueを確認**
3. **テストから書く**（BDD）
4. **実装**
5. **品質チェック**
6. **PR作成**

---

**最終更新**: 2025-12-31
