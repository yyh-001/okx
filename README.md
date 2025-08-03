# OKX 交易员带单监控系统

一个基于 OKX API v5 的交易员带单实时监控系统，支持通过交易员链接快速分析、24小时数据获取、邮箱订阅通知和简洁的Web界面展示。

## 🚀 功能特性

- **链接分析**: 只需输入交易员链接，自动提取uniqueCode进行分析
- **实时监控**: 24小时不间断获取 OKX 交易员当前带单数据
- **邮箱订阅**: 支持用户订阅特定交易员，自动发送带单通知邮件
- **简洁界面**: 响应式 Web 界面，清晰展示交易数据和收益分析
- **云端部署**: 支持多种云平台部署（Vercel、Railway、Docker 等）
- **数据持久化**: 交易数据存储和历史记录查询

## 📋 技术栈

### 前端
- **React 18** + **TypeScript**
- **Tailwind CSS** - 样式框架
- **Chart.js** - 数据可视化
- **Axios** - HTTP 请求

### 后端
- **Node.js** + **Express**
- **TypeScript**
- **node-cron** - 定时任务
- **nodemailer** - 邮件发送
- **sqlite3** - 数据存储

### API 集成
- **OKX API v5 跟单交易接口** - 获取交易员带单数据
- **WebSocket** - 实时数据推送

## 🛠️ 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd okx-trader-monitor

# 安装依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 环境配置
创建 `.env` 文件：
```env
# OKX API 配置
OKX_API_KEY=your_api_key
OKX_SECRET_KEY=your_secret_key
OKX_PASSPHRASE=your_passphrase
OKX_SANDBOX=false

# 邮件服务配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 数据库配置
DATABASE_URL=./data/database.sqlite

# 服务配置
PORT=3000
NODE_ENV=production
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## 📊 API 接口

### 分析交易员（通过链接）
```http
POST /api/analyze-trader
Content-Type: application/json

{
  "traderUrl": "https://www.okx.com/cn/copy-trading/trader/xxxxx"
}
```

### 获取交易员当前带单
```http
GET /api/trader/{uniqueCode}/positions
```

### 获取交易员历史数据
```http
GET /api/trader/{uniqueCode}/history?days={days}
```

### 订阅邮件通知
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "uniqueCode": "ABC123DEF456GHIJ",
  "alertTypes": ["new_position", "close_position", "profit_loss"]
}
```

### 取消订阅
```http
DELETE /api/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "uniqueCode": "ABC123DEF456GHIJ"
}
```

## 🎯 核心功能实现

### 1. 交易员链接解析模块
- 自动解析 OKX 交易员分享链接
- 提取 uniqueCode 用于 API 调用
- 支持多种链接格式识别

### 2. 数据获取模块
- 使用 OKX API v5 跟单交易接口：`/api/v5/copytrading/current-lead-positions`
- 通过 uniqueCode 获取指定交易员的当前带单数据
- 定时任务每分钟更新数据
- 数据包括：持仓信息、收益率、风险指标等

### 3. 邮件通知系统
- 用户可通过交易员链接订阅特定交易员
- 支持多种通知类型：新开仓、平仓、盈亏变化
- 邮件模板自定义和防重复发送机制

### 4. Web 界面
- 交易员链接输入和即时分析
- 实时带单数据展示
- 收益率和风险指标图表
- 订阅管理界面

## 🚀 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### Railway 部署
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

### Docker 部署
```bash
# 构建镜像
docker build -t okx-trader-monitor .

# 运行容器
docker run -p 3000:3000 --env-file .env okx-trader-monitor
```

## 📁 项目结构
```
okx-trader-monitor/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── utils/          # 工具函数
│   └── public/             # 静态资源
├── backend/                 # 后端代码
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   └── data/               # 数据库文件
├── docs/                   # 文档
└── scripts/                # 部署脚本
```

## 🔧 配置说明

### OKX API 权限
需要申请以下权限：
- **读取权限 (Read)** - 必需，用于获取跟单交易数据
- 交易权限 (Trade) - 不需要
- 提现权限 (Withdraw) - 不需要

### 核心API接口
主要使用 OKX API v5 跟单交易模块：
- `GET /api/v5/copytrading/current-lead-positions` - 获取交易员当前带单
- `GET /api/v5/copytrading/lead-position-history` - 获取交易员历史带单
- `GET /api/v5/copytrading/lead-trader-stats` - 获取交易员统计数据

### 邮件服务配置
支持的邮件服务商：
- Gmail
- Outlook
- 163邮箱
- QQ邮箱
- 自定义SMTP

## 📈 监控指标

- **实时带单数据**: 当前持仓、未实现盈亏、持仓时间
- **交易员统计**: 胜率、平均收益率、最大回撤
- **风险指标**: 仓位大小、杠杆倍数、风险等级
- **历史表现**: 带单频率、收益趋势分析
- **通知触发**: 新开仓、平仓、盈亏变化超过阈值

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔧 使用说明

### 如何获取交易员链接
1. 访问 [OKX 跟单交易页面](https://www.okx.com/cn/copy-trading)
2. 选择想要监控的交易员
3. 复制交易员详情页面的链接
4. 支持的链接格式：
   - 新版格式：`https://www.okx.com/zh-hans/copy-trading/account/{uniqueCode}`
   - 旧版格式：`https://www.okx.com/cn/copy-trading/trader/{uniqueCode}`
   - 带参数格式：`https://www.okx.com/zh-hans/copy-trading/account/{uniqueCode}?tab=trade`

### 快速开始
1. 在系统首页输入交易员链接
2. 系统自动解析并获取交易员数据
3. 查看实时带单情况和历史表现
4. 可选择订阅邮件通知

## ⚠️ 免责声明

本系统仅用于数据展示和分析，不构成投资建议。交易有风险，投资需谨慎。所有数据来源于 OKX 公开API，请以官方平台数据为准。

## 📞 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给个 Star！
