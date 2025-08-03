#!/bin/bash

# Railway 一键部署脚本
# 使用方法: ./scripts/deploy-railway.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Railway 一键部署脚本${NC}"
echo -e "${YELLOW}📋 准备部署 OKX Trader Monitor 到 Railway...${NC}"

# 检查必需的文件
echo -e "${YELLOW}📋 检查必需文件...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json 文件不存在${NC}"
    exit 1
fi

if [ ! -f "railway.json" ]; then
    echo -e "${RED}❌ railway.json 文件不存在${NC}"
    exit 1
fi

# 检查是否安装了 Railway CLI
echo -e "${YELLOW}🔧 检查 Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}📦 Railway CLI 未安装，正在安装...${NC}"
    npm install -g @railway/cli
fi

# 检查 Git 仓库
echo -e "${YELLOW}📂 检查 Git 仓库...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}🔧 初始化 Git 仓库...${NC}"
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
fi

# 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
npm run build

# 登录 Railway
echo -e "${YELLOW}🔑 登录 Railway...${NC}"
railway login

# 初始化 Railway 项目
echo -e "${YELLOW}🚀 初始化 Railway 项目...${NC}"
if [ ! -f ".railway" ]; then
    railway init
fi

# 设置环境变量提醒
echo -e "${YELLOW}⚠️  重要提醒：请在 Railway 控制台设置以下环境变量：${NC}"
echo -e "${BLUE}必需变量：${NC}"
echo -e "  NODE_ENV=production"
echo -e "  PORT=3000"
echo -e "  OKX_API_KEY=你的OKX_API密钥"
echo -e "  OKX_SECRET_KEY=你的OKX密钥"
echo -e "  OKX_PASSPHRASE=你的OKX密码短语"
echo -e "  OKX_SANDBOX=false"
echo -e "  JWT_SECRET=你的JWT密钥"
echo -e "  DATABASE_URL=sqlite:./data/database.sqlite"

echo -e "${BLUE}可选变量：${NC}"
echo -e "  SMTP_HOST=smtp.gmail.com"
echo -e "  SMTP_PORT=587"
echo -e "  SMTP_USER=你的邮箱"
echo -e "  SMTP_PASS=你的邮箱密码"
echo -e "  NOTIFICATION_EMAIL=通知邮箱"

echo -e "${YELLOW}⏳ 按任意键继续部署...${NC}"
read -n 1 -s

# 部署到 Railway
echo -e "${YELLOW}🚀 部署到 Railway...${NC}"
railway up

# 获取部署 URL
echo -e "${YELLOW}🔗 获取部署信息...${NC}"
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -n "$RAILWAY_URL" ]; then
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo -e "${BLUE}📍 访问地址：${NC}"
    echo -e "   • 应用首页: $RAILWAY_URL"
    echo -e "   • API健康检查: $RAILWAY_URL/api/health"
    echo -e "   • API信息: $RAILWAY_URL/api/info"
else
    echo -e "${YELLOW}⚠️  部署完成，请在 Railway 控制台查看部署状态${NC}"
fi

echo -e "${BLUE}📋 管理命令：${NC}"
echo -e "   • 查看日志: railway logs"
echo -e "   • 查看状态: railway status"
echo -e "   • 重新部署: railway up"
echo -e "   • 打开控制台: railway open"

echo -e "${YELLOW}💡 提示：${NC}"
echo -e "   • 在 Railway 控制台配置环境变量"
echo -e "   • 数据库文件会自动持久化"
echo -e "   • 每月有 $5 免费额度"

echo -e "${GREEN}✨ Railway 部署完成！${NC}"
