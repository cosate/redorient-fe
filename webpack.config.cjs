const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "fs": false,
      "path": false,
      "os": false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new Dotenv({
      path: './.env',
      safe: false,
      systemvars: true,
      defaults: false,
      allowlist: [
        'OPENAI_API_KEY',
        'OPENAI_MODEL',
        'OPENAI_BASE_URL'
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    host: '0.0.0.0',  // 监听所有网络接口
    allowedHosts: 'all',  // 允许所有域名访问（开发环境）
    // 或者指定特定域名：
    // allowedHosts: [
    //   'redorient.cn',
    //   '.redorient.cn',  // 支持子域名
    //   'localhost'
    // ],
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'  // 支持热更新
    },
    proxy: [
      {
        context: ['/mcp'],
        target: 'http://127.0.0.1:3002',
        changeOrigin: true,
        ws: true,  // 支持 WebSocket
        onProxyReq: (proxyReq, req, res) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> http://127.0.0.1:3002${req.url}`);
        }
      }
    ]
  }
};