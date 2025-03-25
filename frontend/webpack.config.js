const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 開発と本番環境の両方で使えるように条件分岐
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    // ビルド先を 'build' ディレクトリに変更
    path: path.resolve(__dirname, 'build'),
    filename: '[name].[contenthash].js',  // キャッシュ対策としてコンテンツハッシュを追加
    publicPath: '/',
    clean: true,  // ビルド前に出力ディレクトリをクリーン
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,  // .jsx ファイルもサポート
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // 画像ファイルのローダー追加（必要な場合）
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],  // .jsx ファイル解決のサポート
  },
  // 開発サーバー設定（開発時のみ使用）
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    port: 3000,
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:5001',
      },
    ],
  },
  // 本番ビルド時の最適化オプション
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    splitChunks: {
      chunks: 'all',
    },
  },
  // ソースマップの設定
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
};

