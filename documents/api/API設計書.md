# API設計書

**最終更新**: 2026-01-01
**ベースURL**: `https://reserve-system.vercel.app/api`
**プロトコル**: HTTPS
**認証**: Bearer Token (JWT)

---

## 📋 目次

- [認証API](#認証api)
- [予約API](#予約api)
- [管理者予約API](#管理者予約api) ⭐ NEW
- [管理者統計API](#管理者統計api) ⭐ NEW
- [メニューAPI](#メニューapi)
- [スタッフAPI](#スタッフapi)
- [管理者スタッフAPI](#管理者スタッフapi) ⭐ NEW
- [顧客管理API](#顧客管理api)
- [店舗設定API](#店舗設定api)
- [ユーティリティAPI](#ユーティリティapi) ⭐ NEW
- [エラーレスポンス](#エラーレスポンス)

---

## 🔐 認証API

### POST /api/auth/register
ユーザー新規登録

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "山田太郎",
  "phone": "090-1234-5678"
}
```

**レスポンス (201)**:
```json
{
  "message": "Registration successful. Please check your email for confirmation.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田太郎"
  }
}
```

**エラー (400)**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

### POST /api/auth/login
ログイン

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田太郎"
  }
}
```

**エラー (401)**:
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout
ログアウト

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**レスポンス (200)**:
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/reset-password
パスワードリセットリクエスト

**リクエスト**:
```json
{
  "email": "user@example.com"
}
```

**レスポンス (200)**:
```json
{
  "message": "Password reset email sent"
}
```

---

## 📅 予約API

### GET /api/reservations
予約一覧取得

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 | 例 |
|----------|---|------|------|---|
| `date` | string | NO | 予約日フィルタ | `2025-01-20` |
| `staffId` | string | NO | スタッフIDフィルタ | `uuid` |
| `status` | enum | NO | ステータスフィルタ | `CONFIRMED` |
| `limit` | number | NO | 取得件数 | `20` |
| `offset` | number | NO | オフセット | `0` |

**レスポンス (200)**:
```json
{
  "reservations": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "山田太郎",
      "userEmail": "user@example.com",
      "staffId": "uuid",
      "staffName": "田中太郎",
      "menuId": "uuid",
      "menuName": "カット",
      "reservedDate": "2025-01-20",
      "reservedTime": "14:00",
      "status": "CONFIRMED",
      "notes": "初めての利用です",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/reservations/:id
予約詳細取得

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "name": "山田太郎",
    "email": "user@example.com",
    "phone": "090-1234-5678"
  },
  "staff": {
    "id": "uuid",
    "name": "田中太郎",
    "role": "スタイリスト"
  },
  "menu": {
    "id": "uuid",
    "name": "カット",
    "price": 5000,
    "duration": 60
  },
  "reservedDate": "2025-01-20",
  "reservedTime": "14:00",
  "status": "CONFIRMED",
  "notes": "初めての利用です",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

**エラー (404)**:
```json
{
  "error": "Reservation not found"
}
```

---

### POST /api/reservations
予約作成

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**リクエスト**:
```json
{
  "menuId": "uuid",
  "staffId": "uuid",
  "reservedDate": "2025-01-20",
  "reservedTime": "14:00",
  "notes": "初めての利用です"
}
```

**バリデーション**:
- `menuId`: UUID形式
- `staffId`: UUID形式
- `reservedDate`: YYYY-MM-DD形式、過去日付不可
- `reservedTime`: HH:MM形式、営業時間内
- `notes`: 500文字以内（任意）

**レスポンス (201)**:
```json
{
  "id": "uuid",
  "menuId": "uuid",
  "staffId": "uuid",
  "reservedDate": "2025-01-20",
  "reservedTime": "14:00",
  "status": "CONFIRMED",
  "message": "Reservation created successfully. Confirmation email sent."
}
```

**エラー (409)**:
```json
{
  "error": "Time slot already booked",
  "conflictingReservation": {
    "id": "uuid",
    "reservedTime": "14:00"
  }
}
```

**エラー (400)**:
```json
{
  "error": "Invalid date",
  "message": "Cannot book reservations in the past"
}
```

---

### PATCH /api/reservations/:id
予約更新

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**リクエスト**:
```json
{
  "reservedDate": "2025-01-21",
  "reservedTime": "15:00",
  "notes": "時間変更しました"
}
```

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "reservedDate": "2025-01-21",
  "reservedTime": "15:00",
  "status": "CONFIRMED",
  "message": "Reservation updated successfully"
}
```

---

### DELETE /api/reservations/:id
予約キャンセル

**ヘッダー**:
```
Authorization: Bearer {access_token}
```

**レスポンス (200)**:
```json
{
  "message": "Reservation cancelled successfully",
  "id": "uuid"
}
```

**エラー (403)**:
```json
{
  "error": "Cannot cancel reservation within 24 hours of scheduled time"
}
```

---

### PATCH /api/reservations/:id/status
予約ステータス変更（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "status": "COMPLETED"
}
```

**許可されるステータス**:
- `PENDING` → `CONFIRMED`
- `CONFIRMED` → `COMPLETED`
- `CONFIRMED` → `CANCELLED`
- `CONFIRMED` → `NO_SHOW`

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "message": "Status updated successfully"
}
```

---

## 👨‍💼 管理者予約API

### GET /api/admin/reservations
管理者用の予約一覧取得

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 | 例 |
|----------|---|------|------|---|
| `status` | enum | NO | ステータスフィルタ | `all`, `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW` |
| `dateRange` | enum | NO | 日付範囲フィルタ | `all`, `this-week`, `this-month` |
| `search` | string | NO | 顧客名検索 | `山田` |
| `tenantId` | string | NO | テナントID | `demo-restaurant` |

**レスポンス (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reservedDate": "2025-01-20",
      "reservedTime": "14:00",
      "customerName": "山田太郎",
      "customerEmail": "user@example.com",
      "customerPhone": "090-1234-5678",
      "menuName": "カット",
      "menuPrice": 5000,
      "menuDuration": 60,
      "staffName": "田中太郎",
      "staffRole": "スタイリスト",
      "status": "CONFIRMED",
      "notes": "初めての利用です",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

### POST /api/admin/reservations
管理者が新規予約を作成

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "userId": "uuid",
  "menuId": "uuid",
  "staffId": "uuid",
  "reservedDate": "2025-01-20",
  "reservedTime": "14:00",
  "notes": "店舗側で代理予約"
}
```

**バリデーション**:
- `userId`: UUID形式（必須）
- `menuId`: UUID形式（必須）
- `staffId`: UUID形式（必須）
- `reservedDate`: YYYY-MM-DD形式（必須）
- `reservedTime`: HH:MM形式（必須）
- `notes`: 500文字以内（任意）

**レスポンス (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reservedDate": "2025-01-20",
    "reservedTime": "14:00",
    "customerName": "山田太郎",
    "customerEmail": "user@example.com",
    "customerPhone": "090-1234-5678",
    "menuName": "カット",
    "menuPrice": 5000,
    "staffName": "田中太郎",
    "status": "CONFIRMED",
    "notes": "店舗側で代理予約",
    "createdAt": "2025-01-20T12:00:00Z",
    "updatedAt": "2025-01-20T12:00:00Z"
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**エラー (404)**:
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**エラー (409)**:
```json
{
  "success": false,
  "error": "Time slot conflict",
  "code": "TIME_SLOT_CONFLICT",
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

### GET /api/admin/reservations/:id
管理者用の予約詳細取得

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reservedDate": "2025-01-20",
    "reservedTime": "14:00",
    "customerName": "山田太郎",
    "customerEmail": "user@example.com",
    "customerPhone": "090-1234-5678",
    "menuName": "カット",
    "menuPrice": 5000,
    "menuDuration": 60,
    "staffName": "田中太郎",
    "staffRole": "スタイリスト",
    "status": "CONFIRMED",
    "notes": "初めての利用です",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

### PATCH /api/admin/reservations/:id
管理者用の予約更新

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "menuId": "uuid",
  "staffId": "uuid",
  "reservedDate": "2025-01-21",
  "reservedTime": "15:00",
  "status": "CONFIRMED",
  "notes": "変更しました"
}
```

**許可されるフィールド**:
- `menuId`: UUID（任意）
- `staffId`: UUID（任意）
- `reservedDate`: YYYY-MM-DD（任意）
- `reservedTime`: HH:MM（任意）
- `status`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`（任意）
- `notes`: 500文字以内（任意）

**レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reservedDate": "2025-01-21",
    "reservedTime": "15:00",
    "status": "CONFIRMED",
    "notes": "変更しました",
    "updatedAt": "2025-01-20T12:00:00Z"
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

### DELETE /api/admin/reservations/:id
管理者用の予約削除（ソフトデリート）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**レスポンス (200)**:
```json
{
  "success": true,
  "message": "Reservation cancelled successfully",
  "timestamp": "2025-01-20T12:00:00Z"
}
```

---

## 📊 管理者統計API

### GET /api/admin/stats
管理者ダッシュボード用の統計データ取得

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|---|------|------|
| `tenantId` | string | NO | テナントID |

**レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "todayReservations": 5,
    "monthlyReservations": 120,
    "monthlyRevenue": 600000,
    "repeatRate": 35,
    "todayReservationsList": [
      {
        "id": "uuid",
        "time": "14:00",
        "customer": "山田太郎",
        "email": "user@example.com",
        "menu": "カット",
        "staff": "田中太郎",
        "status": "CONFIRMED",
        "price": 5000,
        "duration": 60
      }
    ],
    "weeklyStats": [
      {
        "date": "2025-01-20",
        "day": "月",
        "count": 8
      },
      {
        "date": "2025-01-21",
        "day": "火",
        "count": 12
      }
    ]
  },
  "timestamp": "2025-01-20T12:00:00Z"
}
```

**統計データ説明**:
- `todayReservations`: 本日の予約件数
- `monthlyReservations`: 今月の予約件数
- `monthlyRevenue`: 今月の売上（完了済み予約の合計）
- `repeatRate`: リピート率（%）
- `todayReservationsList`: 本日の予約一覧（詳細）
- `weeklyStats`: 過去7日間の予約件数推移

---

## 📋 メニューAPI

### GET /api/menus
メニュー一覧取得

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|---|------|------|
| `category` | string | NO | カテゴリフィルタ |
| `isActive` | boolean | NO | 有効/無効フィルタ |

**レスポンス (200)**:
```json
{
  "menus": [
    {
      "id": "uuid",
      "name": "カット",
      "description": "スタイリッシュなカット",
      "price": 5000,
      "duration": 60,
      "category": "カット",
      "isActive": true
    },
    {
      "id": "uuid",
      "name": "カラー",
      "description": "トレンドカラー",
      "price": 8000,
      "duration": 90,
      "category": "カラー",
      "isActive": true
    }
  ]
}
```

---

### POST /api/menus
メニュー作成（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "name": "パーマ",
  "description": "ふんわりパーマ",
  "price": 10000,
  "duration": 120,
  "category": "パーマ"
}
```

**レスポンス (201)**:
```json
{
  "id": "uuid",
  "name": "パーマ",
  "price": 10000,
  "duration": 120,
  "message": "Menu created successfully"
}
```

---

### PATCH /api/menus/:id
メニュー更新（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "price": 9500,
  "description": "キャンペーン価格"
}
```

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "name": "パーマ",
  "price": 9500,
  "message": "Menu updated successfully"
}
```

---

### DELETE /api/menus/:id
メニュー削除（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**レスポンス (200)**:
```json
{
  "message": "Menu deleted successfully"
}
```

**エラー (409)**:
```json
{
  "error": "Cannot delete menu with existing reservations"
}
```

---

## 👥 スタッフAPI

### GET /api/staff
スタッフ一覧取得

**レスポンス (200)**:
```json
{
  "staff": [
    {
      "id": "uuid",
      "name": "田中太郎",
      "role": "スタイリスト",
      "isActive": true
    }
  ]
}
```

---

### POST /api/staff
スタッフ作成（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "name": "佐藤花子",
  "role": "シニアスタイリスト"
}
```

**レスポンス (201)**:
```json
{
  "id": "uuid",
  "name": "佐藤花子",
  "role": "シニアスタイリスト",
  "message": "Staff created successfully"
}
```

---

## 🔧 管理者スタッフAPI

### GET /api/admin/staff
スタッフ一覧取得（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|---|------|------|
| `search` | string | NO | スタッフ名で検索 |
| `tenantId` | string | NO | テナントID（デフォルト: 環境変数） |

**レスポンス (200)**:
```json
[
  {
    "id": "uuid",
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "phone": "090-1234-5678",
    "role": "スタイリスト",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "_count": {
      "reservations": 25
    }
  }
]
```

**説明**:
- アクティブなスタッフのみを取得
- `_count.reservations`: スタッフの予約件数を返す
- 作成日時の降順でソート

---

### POST /api/admin/staff
スタッフ作成（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "name": "佐藤花子",
  "email": "sato@example.com",
  "phone": "080-9876-5432",
  "role": "シニアスタイリスト"
}
```

**バリデーション**:
- `name`: 必須、1〜100文字
- `email`: 必須、有効なメールアドレス形式
- `phone`: オプション
- `role`: オプション

**レスポンス (201)**:
```json
{
  "id": "uuid",
  "name": "佐藤花子",
  "email": "sato@example.com",
  "phone": "080-9876-5432",
  "role": "シニアスタイリスト",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

**エラー (400)**:
```json
{
  "error": "このメールアドレスは既に登録されています",
  "code": "EMAIL_EXISTS"
}
```

---

### GET /api/admin/staff/:id
スタッフ詳細取得（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "phone": "090-1234-5678",
  "role": "スタイリスト",
  "isActive": true,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z",
  "_count": {
    "reservations": 25
  }
}
```

**エラー (404)**:
```json
{
  "error": "スタッフが見つかりません",
  "code": "NOT_FOUND"
}
```

---

### PATCH /api/admin/staff/:id
スタッフ情報更新（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "name": "田中太郎",
  "email": "tanaka.new@example.com",
  "phone": "090-1111-2222",
  "role": "トップスタイリスト"
}
```

**説明**:
- すべてのフィールドはオプション（一部更新可能）
- メールアドレス変更時は重複チェック実施

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "name": "田中太郎",
  "email": "tanaka.new@example.com",
  "phone": "090-1111-2222",
  "role": "トップスタイリスト",
  "isActive": true,
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

**エラー (404)**:
```json
{
  "error": "スタッフが見つかりません",
  "code": "NOT_FOUND"
}
```

**エラー (400)**:
```json
{
  "error": "このメールアドレスは既に登録されています",
  "code": "EMAIL_EXISTS"
}
```

---

### DELETE /api/admin/staff/:id
スタッフ削除（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**説明**:
- 論理削除（`isActive = false`）を実行
- 予約が存在するスタッフは削除不可

**レスポンス (200)**:
```json
null
```

**エラー (404)**:
```json
{
  "error": "スタッフが見つかりません",
  "code": "NOT_FOUND"
}
```

**エラー (400)**:
```json
{
  "error": "予約が存在するため削除できません",
  "code": "HAS_RESERVATIONS"
}
```

---

## 👤 顧客管理API

### GET /api/admin/customers
顧客一覧取得（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|---|------|------|
| `search` | string | NO | 名前・メール検索 |
| `limit` | number | NO | 取得件数 |
| `offset` | number | NO | オフセット |

**レスポンス (200)**:
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "山田太郎",
      "email": "user@example.com",
      "phone": "090-1234-5678",
      "totalReservations": 5,
      "lastVisit": "2025-01-15",
      "createdAt": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 100
}
```

---

### GET /api/admin/customers/:id
顧客詳細取得（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**レスポンス (200)**:
```json
{
  "id": "uuid",
  "name": "山田太郎",
  "email": "user@example.com",
  "phone": "090-1234-5678",
  "createdAt": "2024-12-01T10:00:00Z",
  "reservationHistory": [
    {
      "id": "uuid",
      "menuName": "カット",
      "staffName": "田中太郎",
      "reservedDate": "2025-01-15",
      "status": "COMPLETED"
    }
  ]
}
```

---

## ⚙️ 店舗設定API

### GET /api/settings
店舗設定取得

**レスポンス (200)**:
```json
{
  "storeName": "サンプル美容室",
  "storeEmail": "info@sample-salon.com",
  "storePhone": "03-1234-5678",
  "openTime": "10:00",
  "closeTime": "20:00",
  "closedDays": ["Monday"],
  "slotDuration": 30
}
```

---

### PATCH /api/settings
店舗設定更新（管理者のみ）

**ヘッダー**:
```
Authorization: Bearer {admin_access_token}
```

**リクエスト**:
```json
{
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

**レスポンス (200)**:
```json
{
  "message": "Settings updated successfully",
  "openTime": "09:00",
  "closeTime": "21:00"
}
```

---

## 🛠️ ユーティリティAPI

### GET /api/available-slots
空き時間スロット取得

**説明**:
指定した日付・メニュー・スタッフの組み合わせで、予約可能な時間帯を取得します。

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|----------|---|------|------|
| `date` | string | YES | 予約日（YYYY-MM-DD形式） |
| `menuId` | string | YES | メニューID（UUID） |
| `staffId` | string | NO | スタッフID（UUID、未指定の場合は全スタッフから検索） |

**レスポンス (200)**:
```json
{
  "date": "2026-01-15",
  "slots": [
    {
      "time": "09:00",
      "available": true,
      "staffId": "uuid"
    },
    {
      "time": "09:30",
      "available": false
    },
    {
      "time": "10:00",
      "available": true,
      "staffId": "uuid"
    }
  ]
}
```

**動作仕様**:
1. 店舗設定から営業時間と定休日を取得
2. 定休日の場合は空配列（`slots: []`）を返す
3. メニューの所要時間を基に、予約可能なタイムスロットを生成
4. 各タイムスロットについて:
   - `staffId`が指定されている場合: そのスタッフの空き状況のみをチェック
   - `staffId`が未指定の場合: 全アクティブスタッフから最初に空いているスタッフを割り当て
5. 時間の重複判定:
   - 既存の予約と新規予約の時間帯が重ならない場合のみ `available: true`

**エラー (400)**:
```json
{
  "error": "Invalid query parameters",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "date",
      "message": "Date must be in YYYY-MM-DD format"
    }
  ]
}
```

**エラー (404)**:
```json
{
  "error": "Store settings not found",
  "code": "SETTINGS_NOT_FOUND"
}
```

```json
{
  "error": "Menu not found",
  "code": "MENU_NOT_FOUND"
}
```

---

### GET /api/health
ヘルスチェック

**説明**:
データベース接続状態を確認するためのヘルスチェックエンドポイント。

**レスポンス (200)**:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

**エラー (500)**:
```json
{
  "status": "error",
  "message": "Database connection failed",
  "error": "Connection timeout",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

**用途**:
- CI/CDパイプラインでのヘルスチェック
- 監視ツールからの定期的な疎通確認
- デプロイ後の動作確認

---

## ❌ エラーレスポンス

### 共通エラーフォーマット

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

### HTTPステータスコード

| コード | 意味 | 用途 |
|-------|------|------|
| **200** | OK | 成功 |
| **201** | Created | リソース作成成功 |
| **400** | Bad Request | バリデーションエラー |
| **401** | Unauthorized | 認証エラー |
| **403** | Forbidden | 権限エラー |
| **404** | Not Found | リソースが存在しない |
| **409** | Conflict | リソースの競合（重複予約等） |
| **500** | Internal Server Error | サーバーエラー |

### バリデーションエラー例

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "reservedDate",
      "message": "Date must be in the future"
    },
    {
      "field": "reservedTime",
      "message": "Time must be in HH:MM format"
    }
  ],
  "statusCode": 400
}
```

---

## 🔒 認証・認可

### JWTトークン

**トークン形式**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**トークンペイロード**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "customer",
  "tenantId": "demo-restaurant",
  "iat": 1640000000,
  "exp": 1640003600
}
```

### 権限レベル

| ロール | 権限 |
|-------|------|
| **customer** | 自身の予約CRUD、メニュー閲覧、スタッフ閲覧 |
| **admin** | 全予約管理、顧客管理、スタッフ管理、メニュー管理、設定管理 |

---

## 📊 レート制限

| エンドポイント | 制限 |
|-------------|------|
| `/api/auth/login` | 5回/分 |
| `/api/auth/register` | 3回/分 |
| その他 | 100回/分 |

**レート制限超過時のレスポンス (429)**:
```json
{
  "error": "Too many requests",
  "message": "Please try again later",
  "retryAfter": 60
}
```

---

## 📚 関連ドキュメント

- `spec/データベース設計書.md` - DB設計
- `architecture/システムアーキテクチャ.md` - システム構成
- `reserve-app/src/app/api/` - API Route実装

---

**このAPI設計は、RESTful原則に従い、明確で一貫性のあるインターフェースを提供します。**
