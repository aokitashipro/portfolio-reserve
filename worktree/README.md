# Worktree運用ドキュメント

このディレクトリには、4つのworktreeで並行作業するための資料が格納されています。

---

## 📚 ドキュメント一覧

### ⭐ 最優先（毎日参照）

| ファイル | 用途 |
|---------|------|
| **`QUICK_REFERENCE.md`** | 即座に参照できる簡潔版マニュアル |
| **`../CLAUDE.md`** | AIエージェント向けマスタードキュメント |

### 📖 詳細資料

| ファイル | 用途 |
|---------|------|
| **`SNIPPETS.md`** | コピペで使えるコードスニペット集 |

---

## 🎯 各Worktreeの担当範囲

### Worktree 1: CI/CD
- **ディレクトリ**: `reserve-system-cicd/`
- **ブランチ**: `feature/ci-cd-infrastructure`
- **Issue**: #3, #4
- **担当**: GitHub Actions, 環境変数管理, 依存関係管理

### Worktree 2: Auth
- **ディレクトリ**: `reserve-system-auth/`
- **ブランチ**: `feature/user-authentication`
- **Issue**: #5, #6
- **担当**: ユーザー登録・ログイン機能

### Worktree 3: Booking
- **ディレクトリ**: `reserve-system-booking/`
- **ブランチ**: `feature/booking-system`
- **Issue**: #8, #9, #10, #11
- **担当**: 予約カレンダー・登録・メール送信

### Worktree 4: Admin
- **ディレクトリ**: `reserve-system-admin/`
- **ブランチ**: `feature/admin-dashboard`
- **Issue**: #7, #15, #16
- **担当**: 管理者ログイン・ダッシュボード・予約一覧

---

## 🚨 重要注意事項

### 共有ファイルは触らない

**cicd worktreeのみ編集可能:**
- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `.env.example`
- `prisma/schema.prisma` (要相談)

### 毎朝rebase

```bash
cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system
git checkout main
git pull origin main

cd /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-XXX
git rebase main
```

### PR作成前チェック

```bash
cd reserve-app
npm run lint && npm run build:ci && npm test && npm run test:e2e
```

---

## 🎓 使い方

### 1. 自分のworktreeを確認

```bash
pwd
# 例: /Users/a-aoki/indivisual/2026/portpfolio/reserve-system-auth
```

### 2. QUICK_REFERENCE.mdを確認

```bash
cat /Users/a-aoki/indivisual/2026/portpfolio/reserve-system/worktree/QUICK_REFERENCE.md
```

または各worktreeのシンボリックリンク:

```bash
cat CLAUDE.md
```

### 3. 必要に応じてSNIPPETS.mdからコピペ

```bash
cat /Users/a-aoki/indivisual/2026/portpfolio/reserve-system/worktree/SNIPPETS.md
```

---

**最終更新**: 2025-12-31
