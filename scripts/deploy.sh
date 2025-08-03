#!/bin/bash

# OKX Trader Monitor 部署脚本
# 使用方法: ./scripts/deploy.sh [environment]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 环境变量
ENVIRONMENT=${1:-production}
PROJECT_NAME="okx-trader-monitor"
DOCKER_IMAGE="$PROJECT_NAME:latest"

echo -e "${BLUE}🚀 开始部署 OKX Trader Monitor ($ENVIRONMENT)${NC}"

# 检查必需的文件
echo -e "${YELLOW}📋 检查必需文件...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 文件不存在，请先创建配置文件${NC}"
    echo -e "${YELLOW}💡 提示: 复制 .env.example 到 .env 并填写配置${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json 文件不存在${NC}"
    exit 1
fi

# 检查 Docker
echo -e "${YELLOW}🐳 检查 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装，请先安装 Docker Compose${NC}"
    exit 1
fi

# 停止现有服务
echo -e "${YELLOW}⏹️  停止现有服务...${NC}"
docker-compose down --remove-orphans || true

# 构建镜像
echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
docker build -t $DOCKER_IMAGE .

# 创建必要的目录
echo -e "${YELLOW}📁 创建数据目录...${NC}"
mkdir -p data logs
chmod 755 data logs

# 启动服务
echo -e "${YELLOW}🚀 启动服务...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose up -d
else
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
fi

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 健康检查
echo -e "${YELLOW}🏥 执行健康检查...${NC}"
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ 服务启动失败，请检查日志${NC}"
        docker-compose logs --tail=50
        exit 1
    fi
    
    echo -e "${YELLOW}⏳ 等待服务启动... ($attempt/$max_attempts)${NC}"
    sleep 2
    ((attempt++))
done

# 显示服务状态
echo -e "${YELLOW}📊 服务状态:${NC}"
docker-compose ps

# 显示访问信息
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}📍 访问地址:${NC}"
echo -e "   • 应用首页: http://localhost:3000"
echo -e "   • API文档: http://localhost:3000/api/info"
echo -e "   • 健康检查: http://localhost:3000/api/health"

echo -e "${BLUE}📋 管理命令:${NC}"
echo -e "   • 查看日志: docker-compose logs -f"
echo -e "   • 停止服务: docker-compose down"
echo -e "   • 重启服务: docker-compose restart"
echo -e "   • 查看状态: docker-compose ps"

echo -e "${YELLOW}💡 提示:${NC}"
echo -e "   • 数据存储在 ./data 目录"
echo -e "   • 日志存储在 ./logs 目录"
echo -e "   • 配置文件: .env"

# 如果是生产环境，显示额外信息
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}🔒 生产环境注意事项:${NC}"
    echo -e "   • 请确保防火墙配置正确"
    echo -e "   • 建议配置 HTTPS 证书"
    echo -e "   • 定期备份数据库文件"
    echo -e "   • 监控系统资源使用情况"
fi

echo -e "${GREEN}✨ 部署完成！${NC}"
