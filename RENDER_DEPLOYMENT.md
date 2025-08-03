# Render 免费部署指南 🌟

Render 是完全免费且无访问限制的部署平台，非常适合你的项目！

## 🎯 为什么选择 Render？

✅ **完全免费**: 750小时/月免费服务时间  
✅ **无访问限制**: 全球都可以正常访问  
✅ **免费数据库**: 提供免费 PostgreSQL 数据库  
✅ **自动部署**: 连接 GitHub 自动部署  
✅ **支持定时任务**: node-cron 可以正常工作  
✅ **HTTPS**: 自动提供 HTTPS 证书  

## 🚀 部署步骤

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

### 2. 部署到 Render

#### 方法一：网页部署（推荐）
1. **访问 Render**: https://render.com
2. **注册登录**: 使用 GitHub 账号登录
3. **新建 Web Service**: 
   - 点击 "New +" → "Web Service"
   - 选择你的 GitHub 仓库
   - 配置如下：
     - **Name**: okx-trader-monitor
     - **Environment**: Node
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

#### 方法二：使用 render.yaml（自动化）
项目中已包含 `render.yaml` 配置文件，Render 会自动识别并部署。

### 3. 创建免费数据库

1. **新建 PostgreSQL 数据库**:
   - 在 Render 控制台点击 "New +" → "PostgreSQL"
   - **Name**: okx-database
   - **Database**: okx_trader_db
   - **User**: okx_user
   - **Plan**: Free

2. **获取数据库连接字符串**:
   - 数据库创建后，复制 "External Database URL"

### 4. 配置环境变量

在 Web Service 的 Environment 页面添加：

**必需变量**:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=你的PostgreSQL连接字符串
OKX_API_KEY=你的OKX_API密钥
OKX_SECRET_KEY=你的OKX密钥
OKX_PASSPHRASE=你的OKX密码短语
OKX_SANDBOX=false
JWT_SECRET=你的JWT密钥
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

### 5. 验证部署

部署完成后，访问：
- 主页: `https://你的应用名.onrender.com`
- API: `https://你的应用名.onrender.com/api/health`

## 🔄 其他免费方案

### Fly.io 部署
如果 Render 也有问题，可以试试 Fly.io：

```bash
# 安装 Fly CLI
curl -L https://fly.io/install.sh | sh

# 登录
fly auth login

# 初始化应用
fly launch

# 部署
fly deploy
```

### Heroku 替代方案
- **Koyeb**: https://www.koyeb.com (免费额度)
- **Cyclic**: https://www.cyclic.sh (免费部署)
- **Glitch**: https://glitch.com (免费，适合小项目)

## 📊 免费额度对比

| 平台 | 免费额度 | 数据库 | 访问限制 | 推荐度 |
|------|----------|--------|----------|--------|
| **Render** | 750小时/月 | PostgreSQL | 无 | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 3个应用 | SQLite/PostgreSQL | 无 | ⭐⭐⭐⭐ |
| **Koyeb** | 100小时/月 | 外部数据库 | 无 | ⭐⭐⭐ |
| **Cyclic** | 无限制 | DynamoDB | 无 | ⭐⭐⭐ |

## 🛠️ 数据库迁移

项目已经添加了 PostgreSQL 支持，会自动检测数据库类型：

```typescript
// 自动检测数据库类型
const isPostgres = process.env.DATABASE_URL?.includes('postgres');
```

## ⚡ 性能优化

### 1. 避免冷启动
Render 免费版会在15分钟无活动后休眠，可以：
- 使用 cron 服务定期访问
- 升级到付费版（$7/月）

### 2. 数据库优化
- 使用连接池
- 添加适当的索引
- 定期清理旧数据

## 🔧 常见问题

### Q: 应用休眠怎么办？
A: 免费版15分钟无活动会休眠，首次访问需要等待30秒启动。

### Q: 数据库会丢失吗？
A: PostgreSQL 数据会持久化保存，不会丢失。

### Q: 如何查看日志？
A: 在 Render 控制台的 Logs 页面查看实时日志。

### Q: 如何自定义域名？
A: 在 Settings → Custom Domains 添加自定义域名。

## 📋 部署检查清单

- [ ] GitHub 仓库已创建
- [ ] Render 账号已注册
- [ ] Web Service 已创建
- [ ] PostgreSQL 数据库已创建
- [ ] 环境变量已配置
- [ ] 应用成功部署
- [ ] API 端点正常响应
- [ ] 数据库连接正常

## 🎉 一键部署

如果你想要最简单的部署方式：

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

点击按钮，选择你的 GitHub 仓库即可自动部署！

Render 是目前最稳定的免费方案，强烈推荐！🚀
