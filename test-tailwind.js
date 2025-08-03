#!/usr/bin/env node

/**
 * Tailwind CSS 测试脚本
 * 安装依赖并启动开发服务器测试 Tailwind CSS
 */

const { spawn, exec } = require('child_process');
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

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    log('blue', `执行命令: ${command}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        log('red', `命令执行失败: ${error.message}`);
        reject(error);
      } else {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        resolve(stdout);
      }
    });
  });
}

async function main() {
  try {
    console.log('\n🎨 Tailwind CSS 测试脚本\n');

    // 检查前端目录
    const frontendDir = path.join(process.cwd(), 'frontend');
    if (!fs.existsSync(frontendDir)) {
      log('red', '❌ frontend 目录不存在');
      process.exit(1);
    }

    // 检查必要文件
    const requiredFiles = [
      'frontend/package.json',
      'frontend/tailwind.config.js',
      'frontend/postcss.config.js',
      'frontend/src/index.css'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        log('red', `❌ 缺少文件: ${file}`);
        process.exit(1);
      }
    }

    log('green', '✅ 所有必要文件都存在');

    // 安装前端依赖
    log('yellow', '📦 安装前端依赖...');
    await runCommand('npm install', frontendDir);

    // 检查 Tailwind CSS 是否安装
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    const hasTailwind = packageJson.devDependencies?.tailwindcss || packageJson.dependencies?.tailwindcss;
    
    if (!hasTailwind) {
      log('yellow', '📦 安装 Tailwind CSS...');
      await runCommand('npm install -D tailwindcss postcss autoprefixer', frontendDir);
    }

    log('green', '✅ 依赖安装完成');

    // 检查 Tailwind 配置
    log('yellow', '🔧 检查 Tailwind 配置...');
    
    const tailwindConfig = fs.readFileSync('frontend/tailwind.config.js', 'utf8');
    if (!tailwindConfig.includes('content:')) {
      log('red', '❌ Tailwind 配置中缺少 content 配置');
      process.exit(1);
    }

    const indexCss = fs.readFileSync('frontend/src/index.css', 'utf8');
    if (!indexCss.includes('@tailwind base') || !indexCss.includes('@tailwind components') || !indexCss.includes('@tailwind utilities')) {
      log('red', '❌ index.css 中缺少 Tailwind 指令');
      process.exit(1);
    }

    log('green', '✅ Tailwind 配置正确');

    // 提供测试说明
    console.log('\n📋 测试说明:');
    console.log('1. 运行以下命令启动开发服务器:');
    console.log('   cd frontend && npm run dev');
    console.log('');
    console.log('2. 在浏览器中访问:');
    console.log('   • 主页: http://localhost:3001');
    console.log('   • Tailwind 测试页: http://localhost:3001/test');
    console.log('');
    console.log('3. 如果样式正常显示，说明 Tailwind CSS 工作正常');
    console.log('');

    // 询问是否启动开发服务器
    log('yellow', '💡 是否现在启动开发服务器？(y/n)');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', (key) => {
      const input = key.toString().toLowerCase();
      
      if (input === 'y' || input === '\r') {
        log('green', '🚀 启动开发服务器...');
        
        const devServer = spawn('npm', ['run', 'dev'], {
          cwd: frontendDir,
          stdio: 'inherit'
        });

        devServer.on('close', (code) => {
          log('yellow', `开发服务器已停止 (退出码: ${code})`);
          process.exit(code);
        });

        // 处理 Ctrl+C
        process.on('SIGINT', () => {
          log('yellow', '\n正在停止开发服务器...');
          devServer.kill('SIGINT');
        });

      } else if (input === 'n') {
        log('blue', '👋 手动启动开发服务器: cd frontend && npm run dev');
        process.exit(0);
      } else if (input === '\u0003') { // Ctrl+C
        process.exit(0);
      }
    });

  } catch (error) {
    log('red', `❌ 测试失败: ${error.message}`);
    process.exit(1);
  }
}

main();
