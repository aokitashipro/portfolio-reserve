# コードスニペット集 - コピペで使える

## 🎯 よく使うパターン

---

## 1️⃣ APIルート（Next.js App Router）

### GET - 一覧取得

```typescript
// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const reservations = await prisma.restaurantReservation.findMany({
      where: {
        tenantId: process.env.NEXT_PUBLIC_TENANT_ID!,
        ...(date && { reservedDate: new Date(date) }),
      },
      include: {
        user: true,
        staff: true,
        menu: true,
      },
      orderBy: { reservedDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch' } },
      { status: 500 }
    );
  }
}
```

### POST - 新規作成

```typescript
// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reservationSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = reservationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const reservation = await prisma.restaurantReservation.create({
      data: {
        ...validated.data,
        tenantId: process.env.NEXT_PUBLIC_TENANT_ID!,
      },
    });

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Failed to create reservation:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create' } },
      { status: 500 }
    );
  }
}
```

### PATCH - 更新

```typescript
// app/api/reservations/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const reservation = await prisma.restaurantReservation.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: reservation });
  } catch (error) {
    console.error('Failed to update reservation:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update' } },
      { status: 500 }
    );
  }
}
```

### DELETE - 削除

```typescript
// app/api/reservations/[id]/route.ts
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.restaurantReservation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete reservation:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete' } },
      { status: 500 }
    );
  }
}
```

---

## 2️⃣ フォームコンポーネント

### 基本フォーム

```typescript
// components/BookingForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface BookingFormProps {
  onSuccess?: () => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    menuId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error?.message || 'エラーが発生しました');
        return;
      }

      onSuccess?.();
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          日付
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? '処理中...' : '予約する'}
      </Button>
    </form>
  );
}
```

---

## 3️⃣ データフェッチ

### Server Component

```typescript
// app/reservations/page.tsx
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // 60秒キャッシュ

export default async function ReservationsPage() {
  const reservations = await prisma.restaurantReservation.findMany({
    where: { tenantId: process.env.NEXT_PUBLIC_TENANT_ID! },
    include: { user: true, staff: true, menu: true },
    orderBy: { reservedDate: 'desc' },
  });

  return (
    <div>
      <h1>予約一覧</h1>
      {reservations.map((reservation) => (
        <div key={reservation.id}>
          {reservation.user.name} - {reservation.reservedDate.toLocaleDateString()}
        </div>
      ))}
    </div>
  );
}
```

### Client Component (SWR)

```typescript
// components/ReservationList.tsx
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReservationList() {
  const { data, error, isLoading } = useSWR('/api/reservations', fetcher);

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div>
      {data.data.map((reservation: any) => (
        <div key={reservation.id}>{reservation.user.name}</div>
      ))}
    </div>
  );
}
```

---

## 4️⃣ 認証（Supabase）

### 登録

```typescript
// components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    alert('確認メールを送信しました');
    router.push('/login');
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        {loading ? '登録中...' : '登録'}
      </button>
    </form>
  );
}
```

### ログイン

```typescript
// components/auth/LoginForm.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  router.push('/');
  router.refresh();
};
```

### ログアウト

```typescript
// components/LogoutButton.tsx
const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push('/login');
  router.refresh();
};
```

---

## 5️⃣ Zodバリデーション

```typescript
// lib/validations.ts
import { z } from 'zod';

export const reservationSchema = z.object({
  userId: z.string().uuid('無効なユーザーID'),
  menuId: z.string().uuid('無効なメニューID'),
  staffId: z.string().uuid('無効なスタッフID'),
  reservedDate: z.coerce.date(),
  reservedTime: z.string().regex(/^\d{2}:\d{2}$/, '時間形式が正しくありません'),
  notes: z.string().optional(),
});

export const userSchema = z.object({
  email: z.string().email('メールアドレスが正しくありません'),
  name: z.string().min(1, '名前を入力してください'),
  phone: z.string().regex(/^\d{10,11}$/, '電話番号が正しくありません').optional(),
});
```

---

## 6️⃣ テストコード

### E2E（Playwright）

```typescript
// __tests__/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('予約機能', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('予約を作成できる', async ({ page }) => {
    await page.goto('/booking');
    await page.click('button:has-text("20")');
    await page.click('button:has-text("14:00")');
    await page.selectOption('select[name="menu"]', 'カット');
    await page.click('button:has-text("予約する")');

    await expect(page).toHaveURL('/booking/complete');
    await expect(page.locator('h1')).toContainText('予約完了');
  });
});
```

### 単体テスト（Jest）

```typescript
// __tests__/unit/BookingForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from '@/components/BookingForm';

describe('BookingForm', () => {
  it('フォーム送信時にAPIを呼び出す', async () => {
    const onSuccess = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, data: {} }),
    });

    render(<BookingForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('日付'), {
      target: { value: '2025-01-20' },
    });
    fireEvent.click(screen.getByText('予約する'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## 7️⃣ 共通UIコンポーネント

### Button

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

### Card

```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {children}
    </div>
  );
}
```

### Loading Spinner

```typescript
// components/ui/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}
```

---

## 8️⃣ メール送信（Resend）

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReservationConfirmation(
  email: string,
  reservation: any
) {
  await resend.emails.send({
    from: 'noreply@yourapp.com',
    to: email,
    subject: '予約確認',
    html: `
      <h1>予約が完了しました</h1>
      <p>日時: ${reservation.reservedDate} ${reservation.reservedTime}</p>
      <p>メニュー: ${reservation.menu.name}</p>
    `,
  });
}
```

---

## 9️⃣ ミドルウェア（認証チェック）

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 未ログインの場合はログインページへ
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*'],
};
```

---

## 🔟 環境変数

```bash
# .env.local
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx..."
NEXT_PUBLIC_TENANT_ID="demo-booking"
RESEND_API_KEY="re_xxx"
```

---

**これらのスニペットをコピペして開発速度を上げてください！**
