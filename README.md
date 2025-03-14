# recruiting_app

## アプリケーション概要

人材紹介会社の業務をサポートするWebアプリケーションです。
求職者、求人情報、社員、面接、電話連絡などを管理し、マッチングやKPI集計機能を提供します。

## 技術スタック

### バックエンド

- Python
  - Flask
  - Flask-CORS
  - Flask-SQLAlchemy
  - SQLAlchemy
  - openpyxl
  - gspread
  - python-dotenv
  - Werkzeug
- データベース: SQLite (デフォルト), PostgreSQL (設定による)

### フロントエンド

- JavaScript
  - React
  - React Router
  - Axios
  - Chart.js / Recharts
- ビルドツール: Webpack, Babel

## ディレクトリ構造

```
recruiting_app/
├── backend/          # バックエンドソースコード
│   ├── app.py        # Flaskアプリケーションのメインファイル
│   ├── models.py     # データベースモデル定義
│   ├── requirements.txt  # Python依存ライブラリ
│   ├── credentials.json # 認証情報等（Googleスプレッドシート連携用）
│   ├── settings.json    # アプリケーション設定ファイル
│   ├── .env          # 環境変数ファイル
│   └── logs/         # ログファイル格納ディレクトリ
│       └── app.log
├── frontend/         # フロントエンドソースコード
│   ├── public/       # 静的ファイル
│   ├── src/          # Reactコンポーネントなど
│   │   ├── components/   # 各機能のコンポーネント
│   │   ├── App.js      # ルーティング設定など
│   │   ├── index.js    # アプリケーションのエントリーポイント
│   │   ├── AuthContext.js # 認証コンテキスト
│   │   ├── LandingPage.js # トップページ
│   │   ├── Login.js       # ログインページ
│   │   └── ProtectedRoute.js # 認証保護ルート
│   ├── package.json  # JavaScript依存ライブラリ、ビルド設定
│   └── webpack.config.js # Webpack設定ファイル
├── development_status_report_20250310.md # 開発状況報告
└── README.md       # このファイル
```

## 機能

- 求職者管理
  - 一覧表示、詳細表示、追加、編集、削除
  - 進捗管理（応募日、電話日、接続日、提案日、書類送付日、書類通過日、面接日、内定日、入社日、入金日）
  - 担当社員割り当て
  - 紹介料設定
- 求人情報管理
  - 一覧表示、詳細表示、追加、削除
  - Excelファイルからのインポート
- 社員管理
  - 一覧表示、詳細表示、追加、編集、削除
- 面接管理
  - 一覧表示、追加、詳細表示、更新、削除
- 架電記録管理
  - 一覧表示、追加、詳細表示、更新、削除
- マッチング
  - 求職者と求人情報のマッチング
  - 求人と求職者のマッチング
- KPI集計
  - 社員別KPI（架電数、接続数、提案数、書類送付数、書類通過数、面接数、内定数、入社数、入金数、売上、各種変換率、月次進捗、パイプライン分布、ステージ間平均日数）
  - 会社全体KPI（上記に加えて、部門別成績、四半期目標vs実績）
  - トップパフォーマー表示
- 設定
  - スプレッドシート連携設定
  - Excelインポート設定
  - 通知設定
  - UI設定
  - バックアップ設定

## その他

- 開発環境では、`/api/reset-database` エンドポイントでデータベースをリセットできます。
- `/api/health` エンドポイントで健全性チェックができます。
- Google Distance Matrix APIを使用した距離計算エンドポイントがあります。
- データベース構造のデバッグ用に`/api/debug/applicant-model`エンドポイントがあります。