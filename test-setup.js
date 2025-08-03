#!/usr/bin/env node

/**
 * OKX Trader Monitor 项目结构测试脚本
 * 验证所有必要的文件和配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('green', `✅ ${description}: ${filePath}`);
    return true;
  } else {
    log('red', `❌ ${description}: ${filePath} (缺失)`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log('green', `✅ ${description}: ${dirPath}`);
    return true;
  } else {
    log('red', `❌ ${description}: ${dirPath} (缺失)`);
    return false;
  }
}

console.log('\n🚀 OKX Trader Monitor 项目结构检查\n');

let allGood = true;

// 检查根目录文件
log('blue', '📋 检查根目录文件:');
allGood &= checkFile('package.json', '后端包配置');
allGood &= checkFile('tsconfig.json', 'TypeScript配置');
allGood &= checkFile('Dockerfile', 'Docker配置');
allGood &= checkFile('docker-compose.yml', 'Docker Compose配置');
allGood &= checkFile('.env.example', '环境变量模板');
allGood &= checkFile('.gitignore', 'Git忽略文件');
allGood &= checkFile('README.md', '项目文档');

console.log('');

// 检查后端源码目录
log('blue', '🔧 检查后端源码:');
allGood &= checkDirectory('src', '源码目录');
allGood &= checkFile('src/server.ts', '服务器主文件');
allGood &= checkFile('src/config/index.ts', '配置文件');
allGood &= checkFile('src/types/index.ts', '类型定义');
allGood &= checkFile('src/utils/logger.ts', '日志工具');
allGood &= checkFile('src/utils/okx-api.ts', 'OKX API客户端');
allGood &= checkFile('src/database/index.ts', '数据库层');
allGood &= checkFile('src/services/trader.service.ts', '交易员服务');
allGood &= checkFile('src/services/email.service.ts', '邮件服务');
allGood &= checkFile('src/routes/index.ts', '路由入口');
allGood &= checkFile('src/routes/trader.routes.ts', '交易员路由');
allGood &= checkFile('src/routes/subscription.routes.ts', '订阅路由');
allGood &= checkFile('src/scheduler/index.ts', '定时任务');
allGood &= checkFile('src/middleware/index.ts', '中间件');

console.log('');

// 检查前端目录
log('blue', '🎨 检查前端源码:');
allGood &= checkDirectory('frontend', '前端目录');
allGood &= checkFile('frontend/package.json', '前端包配置');
allGood &= checkFile('frontend/vite.config.ts', 'Vite配置');
allGood &= checkFile('frontend/tailwind.config.js', 'Tailwind配置');
allGood &= checkFile('frontend/index.html', 'HTML模板');
allGood &= checkFile('frontend/src/main.tsx', '前端入口');
allGood &= checkFile('frontend/src/App.tsx', '主应用组件');
allGood &= checkFile('frontend/src/index.css', '样式文件');
allGood &= checkFile('frontend/src/types/index.ts', '前端类型定义');
allGood &= checkFile('frontend/src/utils/api.ts', 'API客户端');
allGood &= checkFile('frontend/src/utils/helpers.ts', '辅助函数');

console.log('');

// 检查前端组件
log('blue', '🧩 检查前端组件:');
allGood &= checkDirectory('frontend/src/components', '组件目录');
allGood &= checkDirectory('frontend/src/components/ui', 'UI组件目录');
allGood &= checkFile('frontend/src/components/ui/Button.tsx', '按钮组件');
allGood &= checkFile('frontend/src/components/ui/Input.tsx', '输入框组件');
allGood &= checkFile('frontend/src/components/ui/Card.tsx', '卡片组件');
allGood &= checkFile('frontend/src/components/ui/Badge.tsx', '标签组件');
allGood &= checkFile('frontend/src/components/ui/Loading.tsx', '加载组件');
allGood &= checkFile('frontend/src/components/TraderAnalyzer.tsx', '交易员分析器');
allGood &= checkFile('frontend/src/components/TraderStats.tsx', '交易员统计');
allGood &= checkFile('frontend/src/components/PositionsList.tsx', '持仓列表');
allGood &= checkFile('frontend/src/components/EmailSubscription.tsx', '邮件订阅');
allGood &= checkFile('frontend/src/components/Header.tsx', '页头组件');
allGood &= checkFile('frontend/src/components/Footer.tsx', '页脚组件');

console.log('');

// 检查脚本目录
log('blue', '📜 检查部署脚本:');
allGood &= checkDirectory('scripts', '脚本目录');
allGood &= checkFile('scripts/setup.sh', '初始化脚本');
allGood &= checkFile('scripts/deploy.sh', '部署脚本');
allGood &= checkFile('scripts/start.sh', '启动脚本');

console.log('');

// 检查包配置
log('blue', '📦 检查包配置:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const frontendPackageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  
  log('green', `✅ 后端项目名称: ${packageJson.name}`);
  log('green', `✅ 前端项目名称: ${frontendPackageJson.name}`);
  
  // 检查关键依赖
  const backendDeps = ['express', 'typescript', 'axios', 'sqlite3', 'nodemailer', 'node-cron'];
  const frontendDeps = ['react', 'vite', 'tailwindcss', 'axios', 'react-router-dom'];
  
  log('yellow', '🔍 检查后端依赖:');
  backendDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      log('green', `  ✅ ${dep}`);
    } else {
      log('red', `  ❌ ${dep} (缺失)`);
      allGood = false;
    }
  });
  
  log('yellow', '🔍 检查前端依赖:');
  frontendDeps.forEach(dep => {
    if (frontendPackageJson.dependencies?.[dep] || frontendPackageJson.devDependencies?.[dep]) {
      log('green', `  ✅ ${dep}`);
    } else {
      log('red', `  ❌ ${dep} (缺失)`);
      allGood = false;
    }
  });
  
} catch (error) {
  log('red', `❌ 读取包配置失败: ${error.message}`);
  allGood = false;
}

console.log('');

// 最终结果
if (allGood) {
  log('green', '🎉 项目结构检查通过！所有文件都已正确创建。');
  console.log('');
  log('blue', '📋 下一步操作:');
  console.log('1. 复制 .env.example 到 .env 并填写配置');
  console.log('2. 运行 npm install 安装依赖');
  console.log('3. 运行 cd frontend && npm install 安装前端依赖');
  console.log('4. 运行 npm run dev 启动开发服务器');
  console.log('');
  log('yellow', '💡 或者使用脚本快速启动:');
  console.log('• node test-setup.js (检查项目结构)');
  console.log('• npm run dev (开发模式)');
  console.log('• npm run build && npm start (生产模式)');
} else {
  log('red', '❌ 项目结构检查失败！请检查缺失的文件。');
  process.exit(1);
}

console.log('');
