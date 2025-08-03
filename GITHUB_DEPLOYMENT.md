# GitHub 免费部署指南 🚀

使用 GitHub Pages + GitHub Actions 完全免费部署你的 OKX 交易员监控系统！

## 🎯 方案优势

✅ **完全免费**: GitHub 提供免费的 Pages 和 Actions 服务  
✅ **无访问限制**: 全球都可以正常访问  
✅ **自动监控**: GitHub Actions 定时执行监控任务  
✅ **邮件通知**: 支持邮件提醒功能  
✅ **数据持久化**: 数据保存在 GitHub 仓库中  
✅ **版本控制**: 所有数据变更都有历史记录  

## 🚀 部署步骤

### 1. 准备 GitHub 仓库

```bash
# 初始化 Git 仓库 (如果还没有)
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit for GitHub deployment"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/okx-trader-monitor.git

# 推送到 GitHub
git push -u origin main
```

### 2. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

**邮件通知 Secrets** (可选，如需邮件提醒功能):
- `SMTP_HOST`: SMTP 服务器 (如: smtp.gmail.com)
- `SMTP_PORT`: SMTP 端口 (如: 587)
- `SMTP_USER`: 发送邮箱
- `SMTP_PASS`: 邮箱密码或应用密码
- `NOTIFICATION_EMAIL`: 接收通知的邮箱

### 3. 启用 GitHub Pages

1. 进入仓库设置 (Settings)
2. 找到 "Pages" 选项
3. Source 选择 "GitHub Actions"
4. 保存设置

### 4. 启用 GitHub Actions

1. 进入仓库的 "Actions" 标签页
2. 如果提示启用 Actions，点击启用
3. GitHub Actions 会自动运行部署流程

### 5. 验证部署

部署完成后，你可以访问：
- **网站**: `https://你的用户名.github.io/okx-trader-monitor`
- **数据**: 查看仓库中的 `data/traders.json` 文件

## 📋 工作原理

### GitHub Actions 工作流程

1. **定时触发**: 每1分钟自动运行监控任务
2. **数据获取**: 调用 OKX 公共 API 获取市场数据
3. **变化检测**: 对比历史数据，检测重要变化
4. **邮件通知**: 发现变化时发送邮件通知
5. **数据保存**: 更新数据文件并提交到仓库
6. **网站部署**: 自动部署更新后的前端页面

### 数据存储

- **后端数据**: 保存在 `data/traders.json`
- **前端数据**: 复制到 `frontend/dist/data/traders.json`
- **历史记录**: 通过 Git 提交历史保存所有变更

## 🔧 自定义配置

### 修改监控频率

编辑 `.github/workflows/deploy.yml` 文件中的 cron 表达式：

```yaml
schedule:
  # 每10分钟运行一次
  - cron: '*/10 * * * *'
  
  # 每小时运行一次
  # - cron: '0 * * * *'
  
  # 每天运行一次
  # - cron: '0 0 * * *'
```

### 添加监控的交易员

编辑 `scripts/monitor-task.js` 文件中的交易员列表：

```javascript
// 模拟监控的交易员列表
const traderIds = ['trader1', 'trader2', 'trader3', '你的交易员ID'];
```

### 自定义域名

如果你有自定义域名，在 `.github/workflows/deploy.yml` 中添加：

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./frontend/dist
    cname: your-domain.com  # 你的域名
```

## 📊 监控功能

### 自动监控项目

- ✅ 交易员盈利率变化
- ✅ 新开仓位提醒
- ✅ 持仓变化通知
- ✅ 跟单人数变化
- ✅ 异常情况报警

### 邮件通知内容

- 📈 盈利率显著变化 (>5%)
- 🔔 新开仓位通知
- 🆕 发现新交易员
- ⚠️ 监控任务异常

## 🛠️ 故障排除

### 1. Actions 执行失败

检查 Actions 日志，常见问题：
- Secrets 配置错误
- API 密钥无效
- 网络连接问题

### 2. 页面无法访问

确认：
- GitHub Pages 已启用
- 仓库是公开的
- 部署成功完成

### 3. 数据不更新

检查：
- Actions 是否正常运行
- API 调用是否成功
- 数据文件是否更新

### 4. 邮件通知不工作

验证：
- SMTP 配置是否正确
- 邮箱密码是否为应用密码
- 防火墙是否阻止连接

## 📈 使用统计

GitHub 提供免费额度：
- **GitHub Actions**: 每月 2000 分钟
- **GitHub Pages**: 100GB 带宽/月
- **存储空间**: 1GB

对于监控应用来说，这些额度完全够用！

## 🔄 手动触发

你可以手动触发监控任务：

1. 进入仓库的 "Actions" 页面
2. 选择 "OKX Trader Monitor" 工作流
3. 点击 "Run workflow" 按钮

## 📱 移动端支持

网站完全响应式设计，支持：
- 📱 手机浏览器
- 💻 桌面浏览器
- 📟 平板设备

## 🎉 部署完成

恭喜！你的 OKX 交易员监控系统现在已经：

✅ 完全免费运行  
✅ 自动监控交易员  
✅ 发送邮件通知  
✅ 全球可访问  
✅ 数据安全保存  

访问你的网站: `https://你的用户名.github.io/okx-trader-monitor`

## 💡 进阶功能

### 1. 添加更多通知方式
- Telegram Bot
- 微信推送
- 短信通知

### 2. 数据分析
- 历史收益分析
- 风险评估
- 策略回测

### 3. 界面优化
- 实时图表
- 自定义主题
- 多语言支持

这就是完全免费且功能强大的部署方案！🚀
