#!/bin/bash

# OKX Trader Monitor 初始化脚本
# 使用方法: ./scripts/setup.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OKX Trader Monitor 初始化脚本${NC}"
echo -e "${BLUE}======================================${NC}"

# 检查 Node.js
echo -e "${YELLOW}📋 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    echo -e "${YELLOW}💡 请访问 https://nodejs.org 安装 Node.js 18 或更高版本${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js 版本过低 (当前: $(node -v), 需要: >= 16.0.0)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node -v)${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm 版本: $(npm -v)${NC}"

# 安装后端依赖
echo -e "${YELLOW}📦 安装后端依赖...${NC}"
npm install

# 安装前端依赖
echo -e "${YELLOW}📦 安装前端依赖...${NC}"
cd frontend
npm install
cd ..

# 创建环境配置文件
echo -e "${YELLOW}⚙️  创建环境配置...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ 已创建 .env 文件${NC}"
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，填写您的 OKX API 配置${NC}"
else
    echo -e "${YELLOW}⚠️  .env 文件已存在，跳过创建${NC}"
fi

# 创建必要的目录
echo -e "${YELLOW}📁 创建必要目录...${NC}"
mkdir -p data logs
chmod 755 data logs
echo -e "${GREEN}✅ 已创建 data 和 logs 目录${NC}"

# 设置脚本执行权限
echo -e "${YELLOW}🔧 设置脚本权限...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✅ 已设置脚本执行权限${NC}"

# 构建项目
echo -e "${YELLOW}🔨 构建项目...${NC}"
npm run build

echo -e "${GREEN}🎉 初始化完成！${NC}"
echo -e "${BLUE}======================================${NC}"

# 显示下一步操作
echo -e "${BLUE}📋 下一步操作:${NC}"
echo -e ""
echo -e "${YELLOW}1. 配置 OKX API:${NC}"
echo -e "   编辑 .env 文件，填写以下配置:"
echo -e "   • OKX_API_KEY=your_api_key"
echo -e "   • OKX_SECRET_KEY=your_secret_key"
echo -e "   • OKX_PASSPHRASE=your_passphrase"
echo -e ""
echo -e "${YELLOW}2. 配置邮件服务 (可选):${NC}"
echo -e "   • SMTP_HOST=smtp.gmail.com"
echo -e "   • SMTP_PORT=587"
echo -e "   • SMTP_USER=your_email@gmail.com"
echo -e "   • SMTP_PASS=your_app_password"
echo -e ""
echo -e "${YELLOW}3. 启动开发服务器:${NC}"
echo -e "   npm run dev"
echo -e ""
echo -e "${YELLOW}4. 或者启动生产服务器:${NC}"
echo -e "   npm start"
echo -e ""
echo -e "${YELLOW}5. 使用 Docker 部署:${NC}"
echo -e "   ./scripts/deploy.sh"
echo -e ""

# 显示有用的链接
echo -e "${BLUE}🔗 有用的链接:${NC}"
echo -e "   • OKX API 文档: https://www.okx.com/docs-v5/"
echo -e "   • OKX 跟单交易: https://www.okx.com/cn/copy-trading"
echo -e "   • 项目文档: README.md"
echo -e ""

# 显示配置提示
echo -e "${YELLOW}💡 配置提示:${NC}"
echo -e "   • OKX API 只需要读取权限，不需要交易权限"
echo -e "   • Gmail 需要使用应用专用密码，不是登录密码"
echo -e "   • 建议在测试环境先验证配置正确性"
echo -e ""

echo -e "${GREEN}✨ 准备就绪！开始使用 OKX Trader Monitor 吧！${NC}"
