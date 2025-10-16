#!/bin/bash
# Redorient Frontend 构建和部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_message "🚀 Redorient Frontend 部署脚本"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker 未安装"
    exit 1
fi

# 显示菜单
echo ""
echo "请选择操作:"
echo "1) 构建前端镜像"
echo "2) 启动前端服务"
echo "3) 停止前端服务"
echo "4) 查看服务状态"
echo "5) 查看日志"
echo "6) 清理镜像"
read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        print_message "构建前端镜像..."
        docker build -t redorient-fe .
        print_message "✅ 前端镜像构建完成"
        echo "📦 镜像名称: redorient-fe"
        ;;
    2)
        print_message "启动前端服务..."
        docker run -d --name redorient-fe -p 9000:9000 redorient-fe
        sleep 3
        if curl -f http://localhost:9000/ &>/dev/null; then
            print_message "✅ 前端服务启动成功"
            echo "🌐 访问地址: http://localhost:9000"
            echo "🌐 域名访问: http://redorient.cn:9000"
        else
            print_warning "⚠️ 前端服务可能未就绪，请稍等..."
        fi
        ;;
    3)
        print_message "停止前端服务..."
        docker stop redorient-fe 2>/dev/null || true
        docker rm redorient-fe 2>/dev/null || true
        print_message "✅ 前端服务已停止"
        ;;
    4)
        print_message "服务状态:"
        docker ps --filter "name=redorient-fe"
        ;;
    5)
        print_message "查看前端日志:"
        docker logs -f redorient-fe
        ;;
    6)
        print_warning "这将删除前端镜像!"
        read -p "确定要继续吗? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            print_message "停止并删除容器..."
            docker stop redorient-fe 2>/dev/null || true
            docker rm redorient-fe 2>/dev/null || true
            print_message "删除镜像..."
            docker rmi redorient-fe 2>/dev/null || true
            print_message "✅ 清理完成"
        else
            print_message "取消清理"
        fi
        ;;
    *)
        print_error "无效选择"
        exit 1
        ;;
esac