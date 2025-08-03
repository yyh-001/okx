# 🚀 GitHub 快速部署指南

## 超简单 3 步部署

### 1️⃣ 推送到 GitHub
```bash
# 创建 GitHub 仓库: https://github.com/new
# 仓库名: okx-trader-monitor (设为公开)

git init
git add .
git commit -m "Deploy OKX Monitor"
git remote add origin https://github.com/你的用户名/okx-trader-monitor.git
git push -u origin main
```

### 2️⃣ 启用 GitHub Pages
- 进入仓库 Settings → Pages
- Source 选择 "GitHub Actions"
- 保存

### 3️⃣ 等待部署完成
- 进入 Actions 页面查看部署进度
- 完成后访问: `https://你的用户名.github.io/okx-trader-monitor`

## ✨ 就这么简单！

### 🎯 特点
- ✅ **完全免费** - 无任何费用
- ✅ **无需 API 密钥** - 使用公共数据
- ✅ **每分钟更新** - 实时监控
- ✅ **全球访问** - 无地区限制
- ✅ **自动运行** - 无需维护

### 📧 可选：邮件通知
如需邮件提醒功能，在仓库 Settings → Secrets 中添加：
- `SMTP_HOST` = smtp.gmail.com
- `SMTP_PORT` = 587
- `SMTP_USER` = 你的邮箱
- `SMTP_PASS` = 邮箱密码
- `NOTIFICATION_EMAIL` = 接收通知的邮箱

### 🔧 管理
- **手动运行**: Actions → Run workflow
- **查看日志**: Actions → 选择运行记录
- **更新代码**: git push (自动重新部署)

### 📱 功能
- 📊 交易员数据监控
- 📈 实时盈利率跟踪
- 🔔 持仓变化提醒
- 📧 邮件通知 (可选)
- 📱 响应式界面

就是这么简单！🎉
