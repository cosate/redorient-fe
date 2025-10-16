# Redorient-FE Docker 部署指南

## 📋 修改总结

我已经对 Dockerfile 和相关配置进行了以下优化：

### ✅ 已修改的文件

1. **Dockerfile** - 修复了构建命令和端口配置
   - 使用 `npm run build:web` 而非 `npm run build`
   - nginx 监听 9000 端口
   - 多阶段构建优化镜像大小

2. **nginx.conf** - 新建 nginx 配置文件
   - 支持 SPA 路由（所有请求返回 index.html）
   - 启用 gzip 压缩
   - 静态资源缓存策略
   - 健康检查端点 `/health`
   - 监听 9000 端口

3. **.dockerignore** - 优化构建上下文
   - 排除 node_modules
   - 排除构建输出目录
   - 排除开发环境文件

### 🎯 关键变更

#### 构建命令修改
```dockerfile
# 之前（错误）
RUN npm run build

# 之后（正确）
RUN npm run build:web
```

#### 端口配置
```nginx
# nginx.conf
listen 9000;  # 直接监听 9000 端口
```

```dockerfile
# Dockerfile
EXPOSE 9000
```

## 🚀 快速开始

### 1. 构建镜像

```bash
cd /home/ecs-user/code/github.com/cosate/redorient-fe
docker build -t redorient-fe:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  redorient-fe:latest
```

### 3. 验证部署

```bash
# 检查容器状态
docker ps | grep redorient-fe

# 查看日志
docker logs redorient-fe

# 测试访问
curl http://localhost:9000
```

### 4. 通过域名访问

确保域名 `redorient.cn` 解析到服务器 IP 后：
- 访问: http://redorient.cn:9000

## ⚠️ 重要注意事项

### SSE 连接问题

当前前端配置连接到 `http://localhost:3002/sse`，这在 Docker 容器中会有问题：

**问题**: 容器内的 `localhost` 指向容器自身，而非宿主机

**解决方案有三种:**

#### 方案 1: 使用 host 网络（最简单）

```bash
docker run -d \
  --name redorient-fe \
  --network host \
  redorient-fe:latest
```

**优点**: 容器可以直接访问宿主机的 localhost:3002
**缺点**: 容器与宿主机共享网络栈，安全性稍低

#### 方案 2: 使用宿主机 IP

修改 `src/config.ts`:
```typescript
const config = [
    {
      name: 'xb-sse',
      type: 'sse',
      url: 'http://宿主机IP:3002/sse',  // 或使用域名
      isOpen: true
    }
];
```

#### 方案 3: 使用 Docker 内网（推荐用于生产）

如果 SSE 服务也在容器中，使用 docker-compose:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "9000:9000"
    depends_on:
      - sse-server
    environment:
      - SSE_URL=http://sse-server:3002/sse

  sse-server:
    image: your-sse-server:latest
    ports:
      - "3002:3002"
```

## 📝 测试脚本

我创建了一个测试脚本 `test-docker.sh`：

```bash
./test-docker.sh
```

这将自动：
1. 构建镜像
2. 启动测试容器
3. 检查容器状态
4. 测试 HTTP 访问
5. 清理测试容器

## 🔧 高级配置

### 环境变量支持

虽然前端是静态文件，但可以在运行时注入环境变量（需要修改代码）：

```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  -e OPENAI_API_KEY="sk-..." \
  -e OPENAI_MODEL="gpt-4o" \
  -e OPENAI_BASE_URL="https://api.openai.com/v1" \
  redorient-fe:latest
```

### 持久化日志

```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  -v /var/log/nginx:/var/log/nginx \
  redorient-fe:latest
```

### 自定义 nginx 配置

```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  -v $(pwd)/custom-nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  redorient-fe:latest
```

## 🌐 生产环境部署建议

### 使用反向代理（推荐）

在前面加一层 nginx 反向代理，统一管理端口和 HTTPS：

```nginx
# /etc/nginx/sites-available/redorient.cn
server {
    listen 80;
    server_name redorient.cn;

    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 配置（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d redorient.cn

# 自动续期
sudo certbot renew --dry-run
```

### 监控和日志

```bash
# 实时查看日志
docker logs -f redorient-fe

# 导出日志
docker logs redorient-fe > app.log 2>&1

# 监控资源使用
docker stats redorient-fe
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs redorient-fe

# 进入容器调试
docker exec -it redorient-fe sh
```

### 无法访问页面

```bash
# 检查端口是否正确映射
docker port redorient-fe

# 检查 nginx 配置
docker exec redorient-fe nginx -t

# 检查进程
docker exec redorient-fe ps aux
```

### 构建失败

```bash
# 清理缓存重新构建
docker build --no-cache -t redorient-fe:latest .

# 查看构建过程
docker build --progress=plain -t redorient-fe:latest .
```

## 📦 镜像优化

当前镜像大小约 40MB（nginx:alpine 基础镜像）

进一步优化建议：
1. 使用 .dockerignore 排除不必要文件 ✅
2. 多阶段构建 ✅
3. 启用 gzip 压缩 ✅
4. 静态资源 CDN（可选）

## 🔄 更新部署

```bash
# 1. 停止旧容器
docker stop redorient-fe
docker rm redorient-fe

# 2. 重新构建镜像
docker build -t redorient-fe:latest .

# 3. 启动新容器
docker run -d --name redorient-fe -p 9000:9000 redorient-fe:latest
```

或使用脚本一键更新：
```bash
./deploy.sh
```
