@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 GitHub 一键部署脚本
echo ==========================================
echo.

echo 📋 部署前检查：
if not exist "package.json" (
    echo ❌ package.json 文件不存在
    pause
    exit /b 1
)

if not exist ".github\workflows\deploy.yml" (
    echo ❌ GitHub Actions 配置文件不存在
    pause
    exit /b 1
)

if not exist "scripts\monitor-task.js" (
    echo ❌ 监控任务脚本不存在
    pause
    exit /b 1
)

echo ✅ 所有必需文件都存在
echo.

echo 🔧 检查 Git 仓库状态...
git status >nul 2>&1
if errorlevel 1 (
    echo 📂 初始化 Git 仓库...
    git init
    echo ✅ Git 仓库初始化完成
) else (
    echo ✅ Git 仓库已存在
)

echo.
echo 📦 添加文件到 Git...
git add .
echo ✅ 文件添加完成

echo.
echo 💾 提交代码...
git commit -m "Deploy to GitHub Pages with monitoring system"
if errorlevel 1 (
    echo ⚠️  没有新的更改需要提交
) else (
    echo ✅ 代码提交完成
)

echo.
echo 🌐 GitHub 部署指南：
echo.
echo 1️⃣ 创建 GitHub 仓库
echo    • 访问 https://github.com/new
echo    • 仓库名称: okx-trader-monitor
echo    • 设置为公开仓库 (Public)
echo    • 不要初始化 README
echo.

echo 2️⃣ 推送代码到 GitHub
echo    请执行以下命令 (替换为你的用户名):
echo.
echo    git remote add origin https://github.com/你的用户名/okx-trader-monitor.git
echo    git branch -M main
echo    git push -u origin main
echo.

echo 3️⃣ 配置 GitHub Secrets (可选)
echo    如需邮件通知功能，在仓库设置 → Secrets and variables → Actions 中添加：
echo.
echo    邮件通知 Secrets:
echo    • SMTP_HOST = smtp.gmail.com
echo    • SMTP_PORT = 587
echo    • SMTP_USER = 你的邮箱
echo    • SMTP_PASS = 你的邮箱密码
echo    • NOTIFICATION_EMAIL = 接收通知的邮箱
echo.

echo 4️⃣ 启用 GitHub Pages
echo    • 进入仓库设置 (Settings)
echo    • 找到 "Pages" 选项
echo    • Source 选择 "GitHub Actions"
echo    • 保存设置
echo.

echo 5️⃣ 启用 GitHub Actions
echo    • 进入仓库的 "Actions" 标签页
echo    • 如果提示启用 Actions，点击启用
echo    • 等待自动部署完成
echo.

echo 🎯 部署优势：
echo ✅ 完全免费 (GitHub 免费额度)
echo ✅ 无访问限制 (全球可访问)
echo ✅ 无需 API 密钥 (使用公共端点)
echo ✅ 高频监控 (每1分钟执行)
echo ✅ 邮件通知 (变化提醒)
echo ✅ 数据持久化 (Git 版本控制)
echo ✅ 历史记录 (所有变更可追踪)
echo.

echo 📊 监控功能：
echo • 交易员盈利率变化监控
echo • 新开仓位实时提醒
echo • 持仓变化通知
echo • 跟单人数变化
echo • 异常情况报警
echo.

echo 🔗 部署完成后访问：
echo • 网站: https://你的用户名.github.io/okx-trader-monitor
echo • 数据: 仓库中的 data/traders.json 文件
echo • 日志: Actions 页面查看运行日志
echo.

echo 📋 管理命令：
echo • 手动触发: Actions → Run workflow
echo • 查看日志: Actions → 选择运行记录
echo • 更新代码: git push (自动重新部署)
echo • 修改配置: 编辑 .github/workflows/deploy.yml
echo.

echo 💡 提示：
echo • 首次部署需要等待几分钟
echo • 监控任务每1分钟自动运行
echo • 无需配置 OKX API 密钥
echo • 所有数据变更都会保存到 Git 历史
echo • 可以通过 Git 历史查看数据变化趋势
echo.

echo ⚠️  重要提醒：
echo • 确保 GitHub 仓库设置为公开 (Public)
echo • 邮件通知是可选功能，不配置也能正常运行
echo • 邮箱密码建议使用应用专用密码
echo • 定期检查 Actions 运行状态
echo.

echo ✨ 准备就绪！现在可以按照上述步骤部署到 GitHub 了
echo.
echo 📖 详细说明请查看: GITHUB_DEPLOYMENT.md
echo.

pause
