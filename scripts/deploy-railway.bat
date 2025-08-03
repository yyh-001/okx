@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 Railway 一键部署脚本
echo 📋 准备部署 OKX Trader Monitor 到 Railway...

REM 检查必需的文件
echo 📋 检查必需文件...
if not exist "package.json" (
    echo ❌ package.json 文件不存在
    pause
    exit /b 1
)

if not exist "railway.json" (
    echo ❌ railway.json 文件不存在
    pause
    exit /b 1
)

REM 检查是否安装了 Railway CLI
echo 🔧 检查 Railway CLI...
railway --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Railway CLI 未安装，正在安装...
    npm install -g @railway/cli
)

REM 检查 Git 仓库
echo 📂 检查 Git 仓库...
if not exist ".git" (
    echo 🔧 初始化 Git 仓库...
    git init
    git add .
    git commit -m "Initial commit for Railway deployment"
)

REM 构建项目
echo 🔨 构建项目...
npm run build

REM 登录 Railway
echo 🔑 登录 Railway...
railway login

REM 初始化 Railway 项目
echo 🚀 初始化 Railway 项目...
if not exist ".railway" (
    railway init
)

REM 设置环境变量提醒
echo.
echo ⚠️  重要提醒：请在 Railway 控制台设置以下环境变量：
echo.
echo 必需变量：
echo   NODE_ENV=production
echo   PORT=3000
echo   OKX_API_KEY=你的OKX_API密钥
echo   OKX_SECRET_KEY=你的OKX密钥
echo   OKX_PASSPHRASE=你的OKX密码短语
echo   OKX_SANDBOX=false
echo   JWT_SECRET=你的JWT密钥
echo   DATABASE_URL=sqlite:./data/database.sqlite
echo.
echo 可选变量：
echo   SMTP_HOST=smtp.gmail.com
echo   SMTP_PORT=587
echo   SMTP_USER=你的邮箱
echo   SMTP_PASS=你的邮箱密码
echo   NOTIFICATION_EMAIL=通知邮箱
echo.
echo ⏳ 按任意键继续部署...
pause >nul

REM 部署到 Railway
echo 🚀 部署到 Railway...
railway up

echo.
echo 🎉 部署完成！
echo.
echo 📍 请在 Railway 控制台查看部署状态和访问地址
echo.
echo 📋 管理命令：
echo   • 查看日志: railway logs
echo   • 查看状态: railway status
echo   • 重新部署: railway up
echo   • 打开控制台: railway open
echo.
echo 💡 提示：
echo   • 在 Railway 控制台配置环境变量
echo   • 数据库文件会自动持久化
echo   • 每月有 $5 免费额度
echo.
echo ✨ Railway 部署完成！

pause
