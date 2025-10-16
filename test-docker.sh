#!/bin/bash

# 测试 Docker 构建脚本
set -e

echo "🏗️  开始构建 Docker 镜像..."
docker build -t redorient-fe:test .

echo ""
echo "✅ 构建成功！"
echo ""
echo "📦 镜像信息:"
docker images redorient-fe:test

echo ""
echo "🧪 测试运行容器..."
docker run -d --name redorient-fe-test -p 9000:9000 redorient-fe:test

echo ""
echo "⏳ 等待容器启动 (5秒)..."
sleep 5

echo ""
echo "🔍 检查容器状态:"
docker ps | grep redorient-fe-test

echo ""
echo "📋 容器日志:"
docker logs redorient-fe-test

echo ""
echo "🌐 测试访问 http://localhost:9000"
curl -I http://localhost:9000 || echo "⚠️  无法访问，请检查容器是否正常运行"

echo ""
echo "🛑 清理测试容器..."
docker stop redorient-fe-test
docker rm redorient-fe-test

echo ""
echo "✅ 测试完成！"
echo ""
echo "💡 使用以下命令运行生产容器:"
echo "   docker run -d --name redorient-fe -p 9000:9000 redorient-fe:test"
