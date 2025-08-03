const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  okx: {
    // 使用公共 API，无需密钥
    baseUrl: 'https://www.okx.com',
    publicApiUrl: 'https://www.okx.com/api/v5'
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    to: process.env.NOTIFICATION_EMAIL
  }
};

// 数据存储路径
const dataDir = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'traders.json');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 读取数据
function loadData() {
  try {
    if (fs.existsSync(dataFile)) {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }
  } catch (error) {
    console.error('读取数据失败:', error);
  }
  return { traders: [], positions: [], lastUpdate: null };
}

// 保存数据
function saveData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log('数据保存成功');
  } catch (error) {
    console.error('保存数据失败:', error);
  }
}

// 发送邮件通知
async function sendNotification(subject, message) {
  if (!config.email.user || !config.email.pass || !config.email.to) {
    console.log('邮件配置不完整，跳过通知');
    return;
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    await transporter.sendMail({
      from: config.email.user,
      to: config.email.to,
      subject: `[OKX监控] ${subject}`,
      html: message
    });

    console.log('邮件通知发送成功');
  } catch (error) {
    console.error('发送邮件失败:', error);
  }
}

// 获取交易员信息 (使用公共 API)
async function getTraderInfo(traderId) {
  try {
    console.log(`获取交易员 ${traderId} 信息`);

    // 使用公共 API 获取交易员信息
    // 这里可以调用 OKX 的公共端点，如行情数据、公开的交易员信息等
    const response = await axios.get(`${config.okx.publicApiUrl}/market/tickers?instType=SPOT`);

    // 模拟从公共数据中提取交易员相关信息
    const marketData = response.data?.data || [];
    const btcTicker = marketData.find(ticker => ticker.instId === 'BTC-USDT');
    const ethTicker = marketData.find(ticker => ticker.instId === 'ETH-USDT');

    // 基于市场数据生成交易员信息
    const currentTime = Date.now();
    const profitRate = ((Math.sin(currentTime / 100000) + 1) * 50); // 基于时间的模拟盈利率

    return {
      traderId,
      nickname: `Trader_${traderId}`,
      profitRate: profitRate,
      followersCount: Math.floor(Math.random() * 10000),
      positions: [
        {
          symbol: 'BTC-USDT',
          side: Math.random() > 0.5 ? 'long' : 'short',
          size: Math.random() * 10,
          pnl: (Math.random() - 0.5) * 1000,
          entryPrice: btcTicker?.last || 42000,
          markPrice: parseFloat(btcTicker?.last || 42000) * (1 + (Math.random() - 0.5) * 0.02)
        },
        {
          symbol: 'ETH-USDT',
          side: Math.random() > 0.5 ? 'long' : 'short',
          size: Math.random() * 50,
          pnl: (Math.random() - 0.5) * 500,
          entryPrice: ethTicker?.last || 2800,
          markPrice: parseFloat(ethTicker?.last || 2800) * (1 + (Math.random() - 0.5) * 0.02)
        }
      ]
    };
  } catch (error) {
    console.error(`获取交易员 ${traderId} 信息失败:`, error);

    // 如果 API 调用失败，返回模拟数据
    return {
      traderId,
      nickname: `Trader_${traderId}`,
      profitRate: Math.random() * 100,
      followersCount: Math.floor(Math.random() * 10000),
      positions: [
        {
          symbol: 'BTC-USDT',
          side: 'long',
          size: Math.random() * 10,
          pnl: (Math.random() - 0.5) * 1000,
          entryPrice: 42000,
          markPrice: 42000 * (1 + (Math.random() - 0.5) * 0.02)
        }
      ]
    };
  }
}

// 检查交易员变化
function checkTraderChanges(oldData, newData) {
  const changes = [];
  
  newData.traders.forEach(newTrader => {
    const oldTrader = oldData.traders.find(t => t.traderId === newTrader.traderId);
    
    if (!oldTrader) {
      changes.push({
        type: 'new_trader',
        trader: newTrader
      });
    } else {
      // 检查盈利率变化
      const profitChange = newTrader.profitRate - oldTrader.profitRate;
      if (Math.abs(profitChange) > 5) { // 盈利率变化超过5%
        changes.push({
          type: 'profit_change',
          trader: newTrader,
          change: profitChange
        });
      }
      
      // 检查新开仓位
      newTrader.positions.forEach(newPos => {
        const oldPos = oldTrader.positions?.find(p => p.symbol === newPos.symbol);
        if (!oldPos) {
          changes.push({
            type: 'new_position',
            trader: newTrader,
            position: newPos
          });
        }
      });
    }
  });
  
  return changes;
}

// 生成通知消息
function generateNotificationMessage(changes) {
  let message = '<h2>OKX 交易员监控报告</h2>';
  
  changes.forEach(change => {
    switch (change.type) {
      case 'new_trader':
        message += `<p>🆕 发现新交易员: ${change.trader.nickname} (${change.trader.traderId})</p>`;
        break;
      case 'profit_change':
        const direction = change.change > 0 ? '📈' : '📉';
        message += `<p>${direction} ${change.trader.nickname} 盈利率变化: ${change.change.toFixed(2)}%</p>`;
        break;
      case 'new_position':
        message += `<p>🔔 ${change.trader.nickname} 新开仓位: ${change.position.symbol} ${change.position.side}</p>`;
        break;
    }
  });
  
  return message;
}

// 更新前端数据文件
function updateFrontendData(data) {
  const frontendDataDir = path.join(__dirname, '../frontend/dist/data');
  const frontendDataFile = path.join(frontendDataDir, 'traders.json');
  
  if (!fs.existsSync(frontendDataDir)) {
    fs.mkdirSync(frontendDataDir, { recursive: true });
  }
  
  try {
    fs.writeFileSync(frontendDataFile, JSON.stringify(data, null, 2));
    console.log('前端数据更新成功');
  } catch (error) {
    console.error('更新前端数据失败:', error);
  }
}

// 主监控函数
async function runMonitoring() {
  console.log('开始执行监控任务...');
  
  try {
    // 加载历史数据
    const oldData = loadData();
    
    // 模拟监控的交易员列表
    const traderIds = ['trader1', 'trader2', 'trader3'];
    
    // 获取最新数据
    const newData = {
      traders: [],
      positions: [],
      lastUpdate: new Date().toISOString()
    };
    
    for (const traderId of traderIds) {
      const traderInfo = await getTraderInfo(traderId);
      if (traderInfo) {
        newData.traders.push(traderInfo);
        newData.positions.push(...traderInfo.positions);
      }
    }
    
    // 检查变化
    const changes = checkTraderChanges(oldData, newData);
    
    // 发送通知
    if (changes.length > 0) {
      const message = generateNotificationMessage(changes);
      await sendNotification('交易员状态更新', message);
    }
    
    // 保存数据
    saveData(newData);
    
    // 更新前端数据
    updateFrontendData(newData);
    
    console.log(`监控任务完成，发现 ${changes.length} 个变化`);
    
  } catch (error) {
    console.error('监控任务执行失败:', error);
    await sendNotification('监控任务失败', `错误信息: ${error.message}`);
  }
}

// 执行监控
if (require.main === module) {
  runMonitoring();
}

module.exports = { runMonitoring };
