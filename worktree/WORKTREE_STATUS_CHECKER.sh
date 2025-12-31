#!/bin/bash

# Worktree状況確認スクリプト

echo "================================================"
echo "  Worktree Status Dashboard"
echo "================================================"
echo ""

BASE_DIR="/Users/a-aoki/indivisual/2026/portpfolio"
WORKTREES=("reserve-system-cicd:CICD" "reserve-system-auth:Auth" "reserve-system-booking:Booking" "reserve-system-admin:Admin")

for entry in "${WORKTREES[@]}"; do
  IFS=':' read -r dir name <<< "$entry"

  echo "┌─────────────────────────────────────"
  echo "│ $name ($dir)"
  echo "└─────────────────────────────────────"

  cd "$BASE_DIR/$dir" 2>/dev/null || { echo "  ❌ Directory not found"; continue; }

  # ブランチ名
  branch=$(git branch --show-current)
  echo "  ブランチ: $branch"

  # 最新コミット
  echo "  最新コミット:"
  git log --oneline -1 | sed 's/^/    /'

  # 変更状況
  echo "  変更状況:"
  changes=$(git status --short | wc -l | tr -d ' ')
  if [ "$changes" -eq 0 ]; then
    echo "    ✅ クリーン（変更なし）"
  else
    echo "    📝 変更あり ($changes files)"
    git status --short | head -5 | sed 's/^/    /'
  fi

  # mainとの差分
  echo "  mainとの差分:"
  diff_count=$(git diff --name-only main 2>/dev/null | wc -l | tr -d ' ')
  echo "    変更ファイル数: $diff_count"

  # 競合リスクチェック（共有ファイル）
  echo "  競合リスク:"
  risky_files=$(git diff --name-only main 2>/dev/null | grep -E '(package\.json|tsconfig\.json|eslint\.config\.mjs|prisma/schema\.prisma|\.env\.example)' || true)
  if [ -z "$risky_files" ]; then
    echo "    ✅ 共有ファイルの変更なし"
  else
    echo "    ⚠️  共有ファイルを変更:"
    echo "$risky_files" | sed 's/^/      /'
  fi

  echo ""
done

echo "================================================"
echo "  オープン中のPR"
echo "================================================"
cd "$BASE_DIR/reserve-system"
gh pr list --json number,title,headRefName,state --jq '.[] | "  #\(.number) - \(.title) (\(.headRefName))"'

echo ""
echo "================================================"
echo "  推奨アクション"
echo "================================================"
echo "  1. 各worktreeで 'git rebase main' を実行"
echo "  2. 共有ファイルの変更は cicd worktree のみで行う"
echo "  3. 変更が完了したら PR作成"
echo "================================================"
