# 构建并运行 redorient-fe 前端项目

## 🏗️ 构建 Docker 镜像

```bash
# 在项目根目录执行
docker build -t redorient-fe:latest .
```

## 🚀 运行容器

### 基础运行（不需要连接后端 SSE 服务）
```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  redorient-fe:latest
```

### 传递环境变量（如果需要配置 OpenAI）
```bash
docker run -d \
  --name redorient-fe \
  -p 9000:9000 \
  -e OPENAI_API_KEY="your-api-key" \
  -e OPENAI_MODEL="gpt-4o" \
  -e OPENAI_BASE_URL="https://api.openai.com/v1" \
  redorient-fe:latest
```

### 连接到本地 SSE 服务（使用 host 网络）
```bash
docker run -d \
  --name redorient-fe \
  --network host \
  -e OPENAI_API_KEY="your-api-key" \
  -e OPENAI_MODEL="gpt-4o" \
  -e OPENAI_BASE_URL="https://api.openai.com/v1" \
  redorient-fe:latest
```

## 🌐 访问应用

- 本地访问: http://localhost:9000
- 域名访问: http://redorient.cn:9000

## 🔧 查看日志

```bash
docker logs -f redorient-fe
```

## 🛑 停止和删除容器

```bash
docker stop redorient-fe
docker rm redorient-fe
```

## 📝 注意事项

### 关于 SSE 连接

当前配置中，前端代码会尝试连接到 `http://localhost:3002/sse`。这在以下情况下会工作：

1. **开发环境**: 直接在宿主机运行前端
2. **容器使用 host 网络**: `docker run --network host`
3. **需要代理方案**: 如果要在容器中独立运行，需要：
   - 修改 `src/config.ts` 使用环境变量配置 SSE URL
   - 或者添加后端代理服务

### 生产环境建议

对于生产环境，建议：

1. **使用 docker-compose** 管理多个服务
2. **添加反向代理**（如 nginx）统一管理端口和域名
3. **配置 HTTPS**
4. **使用环境变量** 管理配置

## 📦 多容器部署示例

创建 `docker-compose.yml`:

\`\`\`yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "9000:9000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL}
    depends_on:
      - sse-server
    networks:
      - app-network

  sse-server:
    # 您的 SSE 服务配置
    image: your-sse-server:latest
    ports:
      - "3002:3002"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
\`\`\`

然后运行:
```bash
docker-compose up -d
```
