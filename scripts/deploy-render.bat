@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🌟 Render 免费部署指南
echo ==========================================
echo.

echo 📋 部署前检查：
if not exist "package.json" (
    echo ❌ package.json 文件不存在
    pause
    exit /b 1
)

if not exist "render.yaml" (
    echo ❌ render.yaml 文件不存在
    pause
    exit /b 1
)

echo ✅ 所有必需文件都存在
echo.

echo 🚀 Render 部署步骤：
echo.
echo 1️⃣ 准备 GitHub 仓库
echo    如果还没有推送到 GitHub，请先执行：
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git remote add origin https://github.com/你的用户名/okx-trader-monitor.git
echo    git push -u origin main
echo.

echo 2️⃣ 访问 Render 网站
echo    打开浏览器访问：https://render.com
echo    使用 GitHub 账号登录
echo.

echo 3️⃣ 创建 Web Service
echo    • 点击 "New +" → "Web Service"
echo    • 选择你的 GitHub 仓库
echo    • Name: okx-trader-monitor
echo    • Environment: Node
echo    • Build Command: npm run build
echo    • Start Command: npm start
echo    • Plan: Free
echo.

echo 4️⃣ 创建 PostgreSQL 数据库
echo    • 点击 "New +" → "PostgreSQL"
echo    • Name: okx-database
echo    • Database: okx_trader_db
echo    • User: okx_user
echo    • Plan: Free
echo.

echo 5️⃣ 配置环境变量
echo    在 Web Service 的 Environment 页面添加：
echo.
echo    必需变量：
echo    NODE_ENV=production
echo    PORT=10000
echo    DATABASE_URL=你的PostgreSQL连接字符串
echo    OKX_API_KEY=你的OKX_API密钥
echo    OKX_SECRET_KEY=你的OKX密钥
echo    OKX_PASSPHRASE=你的OKX密码短语
echo    OKX_SANDBOX=false
echo    JWT_SECRET=你的JWT密钥
echo.
echo    可选变量：
echo    SMTP_HOST=smtp.gmail.com
echo    SMTP_PORT=587
echo    SMTP_USER=你的邮箱
echo    SMTP_PASS=你的邮箱密码
echo    NOTIFICATION_EMAIL=通知邮箱
echo.

echo 🎯 部署优势：
echo ✅ 完全免费 (750小时/月)
echo ✅ 无访问限制
echo ✅ 免费 PostgreSQL 数据库
echo ✅ 自动 HTTPS 证书
echo ✅ 自动部署
echo.

echo 🔗 有用链接：
echo • Render 官网: https://render.com
echo • 部署指南: 查看 RENDER_DEPLOYMENT.md
echo • PostgreSQL 管理: Render 控制台
echo.

echo 💡 提示：
echo • 项目已包含 render.yaml 配置文件
echo • 数据库会自动创建表结构
echo • 免费版15分钟无活动会休眠
echo.

echo ✨ 准备就绪！现在可以去 Render 网站部署了
echo.

pause
