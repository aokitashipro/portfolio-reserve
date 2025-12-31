# 生成AI仕様駆動開発（SDD）& ATDD/BDD 完全ガイド

## はじめに

AI技術の進化により、ソフトウェア開発の手法が大きく変わりつつあります。本ガイドでは、近年注目を集める**仕様駆動開発（Spec-Driven Development: SDD）**と、従来から実践されている**ATDD（受け入れテスト駆動開発）**・**BDD（振る舞い駆動開発）**について、その進め方、必要な知識、ツール、注意点を体系的にまとめています。

---

## 第1部：仕様駆動開発（SDD）— AI時代の新しい開発手法

### 1.1 SDDとは何か

仕様駆動開発（SDD）は、「**仕様を最初に固め、そこから一貫性を持って開発を進める**」アプローチです。従来の開発では実装が先行して仕様が後付けになることが多かったのに対し、SDDでは仕様書を「唯一の真実（Single Source of Truth）」として位置づけます。

#### SDDの基本フロー

```
Specify（仕様策定）
    ↓
Plan（計画立案）
    ↓
Tasks（タスク分解）
    ↓
Implement（実装）
    ↓
Review（振り返り）
    ↓
（ループ：継続的改善）
```

#### なぜ今SDDが注目されるのか

1. **Vibe Codingの限界**: AIに曖昧な指示を出して「雰囲気で」コードを生成する手法では、保守性やアーキテクチャの一貫性に課題がある
2. **AIへの正確な指示**: 明確な仕様があれば、AIがより精度の高いコードを生成できる
3. **ドキュメントの陳腐化問題**: 仕様を中心に開発することで、ドキュメントが常に最新状態を維持できる

### 1.2 SDDの主要ツール

| ツール名 | 提供元 | 特徴 |
|---------|--------|------|
| **Kiro** | AWS | AI統合IDE。Vibeモード→Specモードの切り替えが可能。要件定義から設計・実装まで一貫支援 |
| **Spec Kit** | GitHub | オープンソースツールキット。`/specify`、`/plan`、`/tasks`、`/implement`コマンドで段階的に開発 |
| **cc-sdd** | 日本人開発者 | 日本語対応。日本の開発現場を考慮した設計 |
| **Spec Copilot** | コミュニティ | 19種の専門AIエージェント搭載。エンタープライズ向け |

### 1.3 SDDの実践ワークフロー（Spec Kit例）

#### Step 1: プロジェクト初期化
```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

#### Step 2: 仕様書作成（/specify）
AIと対話しながら、以下を明確化:
- **誰が（Who）**: ユーザー/ステークホルダー
- **何を（What）**: 機能要件
- **なぜ（Why）**: ビジネス価値

#### Step 3: 実装計画作成（/plan）
- アーキテクチャ構成
- 技術スタック選定
- モジュール設計

#### Step 4: タスク分解（/tasks）
実行可能なタスク一覧を生成:
```
☐ T001: Create Next.js project with App Router
☐ T002: Install and configure dependencies
☐ T003: Configure Tailwind CSS
...
```

#### Step 5: 実装実行（/implement）
タスクを順番に実行。AIがコードを生成。

### 1.4 SDDの注意点

1. **仕様の肥大化に注意**: AIが生成する仕様が想定より大きくなることがある。確認して進める
2. **コミット戦略の明記**: 開発方針に「フェーズごとにコミット」など記載
3. **仕様の整合性確認**: 仕様と実装の乖離がないか定期的にレビュー
4. **人間による検証**: AIが生成したコードは必ず人間がレビュー

---

## 第2部：ATDD/BDD — テスト駆動の仕様定義

### 2.1 TDD・BDD・ATDDの関係

```
TDD（テスト駆動開発）
  └─→ BDD（振る舞い駆動開発）: TDDを拡張、ビジネス視点を追加
        └─→ ATDD（受け入れテスト駆動開発）: 受け入れ基準からスタート
```

#### 各手法の特徴

| 手法 | 焦点 | 参加者 | 記述形式 |
|------|------|--------|----------|
| **TDD** | 単体テスト | 開発者 | コード（JUnit等） |
| **BDD** | システムの振る舞い | 開発者・テスター・ビジネス | Gherkin（自然言語） |
| **ATDD** | 受け入れ基準 | 全ステークホルダー | シナリオベース |

### 2.2 Gherkin記法の基本

BDD/ATDDでは、**Gherkin**という自然言語に近い記法でシナリオを記述します。

```gherkin
Feature: 自動販売機
  飲み物を購入できる自動販売機

  Scenario: 飲み物を買うと、お釣りが出る
    Given 自動販売機がある
    When 550円を入れる
    And 120円の "コーラ" を選択する
    Then "コーラ" が出てくる
    And 430円が出てくる
```

#### Gherkinのキーワード

| 英語 | 日本語 | 意味 |
|------|--------|------|
| Feature | 機能 | テスト対象の機能 |
| Scenario | シナリオ | 具体的なテストケース |
| Given | 前提 | テストの前提条件 |
| When | もし | アクション/操作 |
| Then | ならば | 期待される結果 |
| And / But | かつ / しかし | 条件の追加 |

### 2.3 Three Amigos（3人の仲間）

BDD/ATDDの核心は**コラボレーション**です。「Three Amigos」とは、3つの視点を持つ人々が協力してシナリオを定義する手法です。

```
        ┌─────────────────┐
        │ ビジネス担当者   │
        │ (PO/BA)         │
        │ 「何を解決？」   │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    ↓            ↓            ↓
┌───────────┐ ┌───────────┐ ┌───────────┐
│ 開発者     │ │  テスター  │ │  ユーザー │
│「どう実装」│ │「どうテスト」│ │ (任意)    │
└───────────┘ └───────────┘ └───────────┘
```

#### Three Amigosミーティングの進め方

1. **ユーザーストーリーの共有**: POがストーリーを説明
2. **質問と議論**: 各視点から疑問点を挙げる
3. **シナリオの定義**: 具体例をGherkin形式で記述
4. **エッジケースの洗い出し**: 境界条件や例外を検討
5. **合意形成**: 全員が理解・同意できるまで議論

### 2.4 Example Mapping（実例マッピング）

Three Amigosをより効率的に進めるための手法が**Example Mapping**です。

#### 4色カードの使い方

```
┌─────────────────────────────────────┐
│ 🟡 黄: ユーザーストーリー             │
│    「配送先住所を変更できる」         │
└─────────────────────────────────────┘
        │
        ├── 🔵 青: ルール（受け入れ基準）
        │      「注文から30分以内なら変更可能」
        │      │
        │      ├── 🟢 緑: 具体例
        │      │      「15分後に変更 → OK」
        │      │      「45分後に変更 → NG」
        │      │
        │      └── 🔴 赤: 未解決の質問
        │             「30分の起点は注文確定時？」
        │
        └── 🔵 青: 別のルール
               「配達員が出発前なら変更可能」
```

#### Example Mappingの判断基準

- **赤カードが多い** → まだ調査が必要、開発に入るのは早い
- **青カードが多い** → ストーリーが大きすぎる、分割を検討
- **緑カードが1つのルールに多い** → ルールが複雑すぎる

### 2.5 BDDツール

#### 主要なBDDフレームワーク

| ツール | 言語 | 特徴 |
|--------|------|------|
| **Cucumber** | Ruby/Java/JS等 | 最も有名。Gherkin記法の元祖 |
| **SpecFlow** | C# (.NET) | Cucumber for .NET |
| **Behave** | Python | Python向けBDDフレームワーク |
| **pytest-bdd** | Python | pytestとの統合が容易 |
| **RSpec** | Ruby | Ruby標準のBDDフレームワーク |

#### Cucumberの構造

```
project/
├── features/
│   ├── login.feature          # Gherkinシナリオ
│   └── step_definitions/
│       └── login_steps.rb     # ステップ定義（実装コード）
└── support/
    └── env.rb                 # 環境設定
```

---

## 第3部：生成AIとATDD/BDDの融合

### 3.1 AIによるテスト生成

近年、生成AIを活用したテスト自動化が急速に進んでいます。

#### AIテスト自動化の主要ツール

| ツール | 特徴 |
|--------|------|
| **UiPath Autopilot for Testers** | 要件からテストケース抽出、コード生成、実行まで自動化 |
| **mabl** | AIネイティブ。自己修復機能を持つE2Eテスト |
| **Autify** | ノーコードでのAIテスト自動化 |
| **MagicPod** | モバイル/Webアプリのテスト自動化 |

### 3.2 AIを活用したBDDワークフロー

生成AIとBDDを組み合わせることで、以下のような効率化が可能です:

```
1. 要件定義 + Claude相談
      ↓
2. ユーザーストーリー作成
      ↓
3. AIによる網羅性チェック
      ↓
4. Gherkinシナリオ自動生成
      ↓
5. ステップ定義（コード）生成
      ↓
6. テスト実行・リファクタリング
```

#### 実践例: pytest-bdd + 生成AI

```python
# AIに生成させるプロンプト例
"""
以下のGherkinシナリオに対応するpytest-bddのステップ定義を生成してください。

Feature: Google検索
Scenario: Googleで検索する
  Given Googleのトップページにアクセスする
  When 検索ボックスに「テスト」と入力する
  And 検索ボタンをクリックする
  Then 検索結果が表示される

使用ライブラリ: pytest-bdd, playwright
"""
```

### 3.3 SDD + BDDのハイブリッドアプローチ

最も効果的なのは、SDDとBDDを組み合わせたアプローチです:

```
Phase 1: 探索（Vibe Coding）
  │  AIでプロトタイプを素早く作成
  ↓
Phase 2: 仕様化（SDD）
  │  Spec Kit等で仕様を整理・文書化
  ↓
Phase 3: シナリオ定義（BDD）
  │  Three Amigosで受け入れ基準を定義
  │  Example Mappingで具体例を洗い出し
  ↓
Phase 4: 実装（テストファースト）
  │  Gherkinシナリオを先に書く
  │  AIでステップ定義を生成
  ↓
Phase 5: 運用（継続的改善）
     仕様を更新しながら機能追加
```

---

## 第4部：必要な知識とスキル

### 4.1 基礎知識

#### ソフトウェア開発手法
- アジャイル開発（スクラム、カンバン）
- ウォーターフォールモデル
- DevOps/CI/CD

#### テスト技法
- 単体テスト、統合テスト、E2Eテスト
- テストピラミッド
- シフトレフトテスト

#### ドメイン駆動設計（DDD）
- ユビキタス言語
- 境界づけられたコンテキスト

### 4.2 技術スキル

#### プログラミング言語
- Python（pytest-bdd, Behave）
- JavaScript/TypeScript（Cucumber-js, Playwright）
- Java（Cucumber-JVM, JUnit）
- Ruby（RSpec, Cucumber）

#### テスト自動化ツール
- Selenium / Playwright / Cypress
- Appium（モバイル）
- REST Assured（API）

#### CI/CDツール
- GitHub Actions
- Jenkins
- GitLab CI

### 4.3 ソフトスキル

- **ファシリテーション**: Three Amigosの進行
- **コミュニケーション**: 技術者・非技術者間の橋渡し
- **要件分析**: 曖昧な要求の明確化
- **ドキュメンテーション**: 分かりやすい仕様書作成

---

## 第5部：注意点とベストプラクティス

### 5.1 よくあるアンチパターン

#### BDD/ATDDのアンチパターン

1. **コード実装後にフィーチャーファイルを書く**
   - BDDの目的は「開発を駆動する」こと。後付けでは単なるドキュメント

2. **ビジネス担当者が単独でシナリオを作成**
   - 技術的な実現可能性が考慮されない

3. **開発者がビジネス担当者と相談せずシナリオを作成**
   - 実際のビジネスニーズを反映しない

4. **UIの詳細をシナリオに書きすぎる**
   - 「ログインボタンをクリック」ではなく「ログインする」

5. **シナリオが多すぎる/長すぎる**
   - BRIEFの原則を守る（後述）

#### SDDのアンチパターン

1. **仕様を完璧にしようとしすぎる**
   - 反復的に改善する姿勢が重要

2. **AIの出力を鵜呑みにする**
   - 必ず人間がレビュー

3. **仕様と実装の乖離を放置**
   - 変更があれば仕様を更新

### 5.2 BRIEFの原則

良いGherkinシナリオは**BRIEF**であるべきです:

| 頭文字 | 意味 | 説明 |
|--------|------|------|
| **B** | Business language | ビジネス用語で記述 |
| **R** | Real data | 現実的なデータを使用 |
| **I** | Intention revealing | 意図が明確 |
| **E** | Essential | 必要最小限 |
| **F** | Focused | 1つのシナリオに1つの振る舞い |

### 5.3 成功のためのチェックリスト

#### プロジェクト開始時
- [ ] チーム全員がBDD/SDDの目的を理解している
- [ ] Three Amigosの体制が整っている
- [ ] ツールの選定と環境構築が完了している

#### シナリオ作成時
- [ ] ビジネス価値が明確である
- [ ] 具体例（Example）が十分にある
- [ ] エッジケースが検討されている

#### 実装時
- [ ] シナリオが先、実装が後
- [ ] ステップ定義は再利用可能
- [ ] テストは独立して実行可能

#### 運用時
- [ ] フィーチャーファイルが最新に保たれている
- [ ] CI/CDパイプラインに組み込まれている
- [ ] テスト結果がチームに共有されている

---

## 第6部：ツール環境構築ガイド

### 6.1 Cucumber + JavaScript/TypeScript

```bash
# プロジェクト初期化
npm init -y
npm install --save-dev @cucumber/cucumber typescript ts-node

# ディレクトリ構造
mkdir -p features/step_definitions
```

```typescript
// cucumber.js (設定ファイル)
module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['features/step_definitions/**/*.ts'],
    format: ['progress', 'html:cucumber-report.html']
  }
}
```

### 6.2 pytest-bdd + Python

```bash
# インストール
pip install pytest pytest-bdd playwright

# ディレクトリ構造
mkdir -p tests/features tests/steps
```

```python
# pytest.ini
[pytest]
bdd_features_base_dir = tests/features/
```

### 6.3 Spec Kit

```bash
# Claude Code等のAIツールと組み合わせて使用
# /constitution - プロジェクトの原則を設定
# /specify - 仕様書作成
# /plan - 実装計画作成
# /tasks - タスク分解
# /implement - 実装実行
```

---

## まとめ

### 各手法の使い分け

| 状況 | 推奨手法 |
|------|----------|
| 新規プロジェクト、AIでの高速開発 | SDD（Kiro, Spec Kit） |
| ビジネス要件の明確化が必要 | BDD（Three Amigos + Cucumber） |
| 受け入れテストの自動化 | ATDD（Gherkin + 自動化ツール） |
| 既存プロジェクトの品質向上 | BDD/ATDDの段階的導入 |

### キーポイント

1. **仕様を中心に据える**: SDDもBDDも、「仕様」が開発の起点
2. **コラボレーションが命**: ツールよりも、人と人のコミュニケーションが重要
3. **AIは補助**: 生成AIは強力だが、最終判断は人間が行う
4. **継続的改善**: 一度作って終わりではなく、常に仕様とテストを最新に保つ
5. **小さく始める**: 全てを一度に導入せず、段階的に取り入れる

---

## 参考リソース

### 書籍
- 『The BDD Books - Discovery』- Gáspár Nagy, Seb Rose
- 『Specification by Example』- Gojko Adzic
- 『The Cucumber Book』- Matt Wynne, Aslak Hellesøy

### Webサイト
- Cucumber公式: https://cucumber.io/docs/bdd/
- GitHub Spec Kit: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- Example Mapping紹介: https://cucumber.io/blog/bdd/example-mapping-introduction/

### コミュニティ
- BDD/ATDD Japan コミュニティ
- JaSST（ソフトウェアテストシンポジウム）

---

*最終更新: 2025年12月*