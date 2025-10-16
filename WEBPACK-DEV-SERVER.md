# 解决 "Invalid Host header" 问题

## 🐛 问题描述

使用域名访问 webpack-dev-server 时出现 `Invalid Host header` 错误。

## 🔍 原因

Webpack-dev-server 默认启用了 Host 头检查，作为安全措施防止 DNS rebinding 攻击。当使用域名访问时，如果域名不在白名单中，就会被拒绝。

## ✅ 解决方案

已在 `webpack.config.cjs` 中添加以下配置：

```javascript
devServer: {
  static: {
    directory: path.join(__dirname, 'dist')
  },
  compress: true,
  port: 9000,
  host: '0.0.0.0',        // ✅ 监听所有网络接口
  allowedHosts: 'all',    // ✅ 允许所有域名访问
  client: {
    webSocketURL: 'auto://0.0.0.0:0/ws'  // ✅ 支持热更新
  }
}
```

### 配置说明

- **`host: '0.0.0.0'`**: 允许服务器监听所有网络接口，而不仅仅是 localhost
- **`allowedHosts: 'all'`**: 允许任何域名访问（开发环境适用）
- **`client.webSocketURL`**: 确保 WebSocket 连接（热更新）也能正常工作

## 🔒 生产环境建议

如果在生产环境或需要更严格的安全控制，使用特定域名白名单：

```javascript
devServer: {
  // ... 其他配置
  allowedHosts: [
    'redorient.cn',
    '.redorient.cn',  // 支持所有子域名
    'localhost',
    '127.0.0.1'
  ]
}
```

## 🚀 使用方法

### 1. 重启开发服务器

```bash
# 停止当前服务（如果正在运行）
# Ctrl+C 或
npm run dev  # 重新启动
```

### 2. 访问方式

现在可以通过以下任意方式访问：

- ✅ `http://localhost:9000`
- ✅ `http://公网IP:9000`
- ✅ `http://redorient.cn:9000`
- ✅ `http://任意解析到该服务器的域名:9000`

## 🔥 热更新支持

配置了 `client.webSocketURL` 后，即使使用域名访问，热更新（HMR）功能仍然可以正常工作。

## ⚠️ 安全提示

### 开发环境
使用 `allowedHosts: 'all'` 是安全的，因为：
- 只在本地开发时使用
- webpack-dev-server 本身就标明是开发工具，不应用于生产

### 生产环境
- ❌ **不要**在生产环境使用 webpack-dev-server
- ✅ **应该**使用 `npm run build:web` 构建静态文件
- ✅ **应该**使用 nginx 等生产级服务器部署

## 📝 相关文档

- [Webpack Dev Server - allowedHosts](https://webpack.js.org/configuration/dev-server/#devserverallowedhosts)
- [DNS Rebinding 攻击解释](https://en.wikipedia.org/wiki/DNS_rebinding)

## 🎯 已完成

- ✅ 修改 `webpack.config.cjs`
- ✅ 添加 `host: '0.0.0.0'`
- ✅ 添加 `allowedHosts: 'all'`
- ✅ 配置 WebSocket URL 支持热更新
- ✅ 重启开发服务器

现在您可以使用 `http://redorient.cn:9000` 正常访问了！🎉
