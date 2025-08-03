# Railway 免费部署指南 🚀

Railway 是最适合你项目的免费部署平台，支持 SQLite 数据库持久化！

## 为什么选择 Railway？

✅ **完全免费**: 每月 $5 免费额度，足够小项目使用  
✅ **支持 SQLite**: 数据库文件会持久化保存  
✅ **自动部署**: 连接 GitHub 后自动部署  
✅ **简单配置**: 几乎零配置即可部署  
✅ **支持定时任务**: node-cron 可以正常工作  

## 部署步骤

### 1. 准备 GitHub 仓库
```bash
# 如果还没有 Git 仓库，先初始化
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/你的用户名/okx-trader-monitor.git
git push -u origin main
```

### 2. 部署到 Railway

1. **访问 Railway**: https://railway.app
2. **登录**: 使用 GitHub 账号登录
3. **新建项目**: 点击 "New Project"
4. **选择仓库**: 选择你的 GitHub 仓库
5. **自动部署**: Railway 会自动检测并部署

### 3. 配置环境变量

在 Railway 项目设置中添加环境变量：

**必需变量**:
```
NODE_ENV=production
PORT=3000
OKX_API_KEY=你的OKX_API密钥
OKX_SECRET_KEY=你的OKX密钥
OKX_PASSPHRASE=你的OKX密码短语
OKX_SANDBOX=false
JWT_SECRET=你的JWT密钥
DATABASE_URL=sqlite:./data/database.sqlite
```

**可选变量**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=你的邮箱
SMTP_PASS=你的邮箱密码
NOTIFICATION_EMAIL=通知邮箱
LOG_LEVEL=info
```

### 4. 验证部署

部署完成后，Railway 会提供一个域名，访问：
- 主页: `https://你的应用.railway.app`
- API: `https://你的应用.railway.app/api/health`

## 其他免费方案对比

### Render 部署
```yaml
# render.yaml
services:
  - type: web
    name: okx-trader-monitor
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Fly.io 部署
```dockerfile
# fly.toml
app = "okx-trader-monitor"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  http_checks = []
  internal_port = 3000
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"
```

## 免费额度对比

| 平台 | 免费额度 | 数据库 | 持久化存储 | 定时任务 |
|------|----------|--------|------------|----------|
| **Railway** | $5/月 | SQLite | ✅ | ✅ |
| **Render** | 750小时/月 | PostgreSQL | ✅ | ✅ |
| **Fly.io** | 3个应用 | SQLite | ✅ | ✅ |
| **Vercel** | 无限制 | 需外部 | ❌ | 需Cron Jobs |

## 推荐部署顺序

1. **首选**: Railway (最简单，支持 SQLite)
2. **备选**: Render (免费 PostgreSQL)
3. **高级**: Fly.io (更多控制权)

## Railway 部署命令行方式

如果你喜欢命令行：

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

## 常见问题

### Q: Railway 免费额度够用吗？
A: 对于小型监控应用，$5/月的额度完全够用。通常只会用到 $1-2。

### Q: 数据会丢失吗？
A: Railway 支持持久化存储，SQLite 数据库文件会保存。

### Q: 如何查看日志？
A: 在 Railway 控制台可以实时查看应用日志。

### Q: 如何自定义域名？
A: Railway 支持自定义域名，在项目设置中配置。

## 部署检查清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] Railway 项目已创建
- [ ] 环境变量已配置
- [ ] 应用成功启动
- [ ] API 端点正常响应
- [ ] 数据库连接正常
- [ ] 前端页面正常加载

选择 Railway 吧，它是最适合你项目的免费方案！🎉
