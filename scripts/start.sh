#!/bin/bash

# OKX Trader Monitor 启动脚本
# 使用方法: ./scripts/start.sh [mode]
# mode: dev (开发模式) 或 prod (生产模式)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取模式参数
MODE=${1:-dev}

echo -e "${BLUE}🚀 启动 OKX Trader Monitor ($MODE 模式)${NC}"

# 检查环境配置
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 文件不存在${NC}"
    echo -e "${YELLOW}💡 请先运行: ./scripts/setup.sh${NC}"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    cd frontend && npm install && cd ..
fi

# 创建必要目录
mkdir -p data logs

# 根据模式启动
if [ "$MODE" = "dev" ]; then
    echo -e "${YELLOW}🔧 启动开发模式...${NC}"
    echo -e "${BLUE}📍 访问地址:${NC}"
    echo -e "   • 前端: http://localhost:3001"
    echo -e "   • 后端: http://localhost:3000"
    echo -e "   • API文档: http://localhost:3000/api/info"
    echo -e ""
    echo -e "${YELLOW}💡 提示: 使用 Ctrl+C 停止服务${NC}"
    echo -e ""
    
    # 启动开发服务器
    npm run dev
    
elif [ "$MODE" = "prod" ]; then
    echo -e "${YELLOW}🏭 启动生产模式...${NC}"
    
    # 构建项目
    echo -e "${YELLOW}🔨 构建项目...${NC}"
    npm run build
    
    echo -e "${BLUE}📍 访问地址:${NC}"
    echo -e "   • 应用: http://localhost:3000"
    echo -e "   • API文档: http://localhost:3000/api/info"
    echo -e ""
    echo -e "${YELLOW}💡 提示: 使用 Ctrl+C 停止服务${NC}"
    echo -e ""
    
    # 启动生产服务器
    npm start
    
else
    echo -e "${RED}❌ 无效的模式: $MODE${NC}"
    echo -e "${YELLOW}💡 使用方法: ./scripts/start.sh [dev|prod]${NC}"
    exit 1
fi
