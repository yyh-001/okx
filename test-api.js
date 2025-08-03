const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// 创建签名
function createSignature(timestamp, method, requestPath, body, secretKey) {
  const signString = timestamp + method + requestPath + body;
  return crypto.createHmac('sha256', secretKey).update(signString).digest('base64');
}

// 测试获取交易员持仓
async function testTraderPositions() {
  // 测试的交易员uniqueCode（从您的日志中获取）
  const testUniqueCode = '34ABFF2DBEC9E970';
  
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const requestPath = '/api/v5/copytrading/current-subpositions';
  const body = '';
  
  const signature = createSignature(timestamp, method, requestPath, body, process.env.OKX_SECRET_KEY);
  
  const headers = {
    'OK-ACCESS-KEY': process.env.OKX_API_KEY,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
    'Content-Type': 'application/json'
  };

  console.log('测试获取交易员持仓...');
  console.log('API Key:', process.env.OKX_API_KEY ? '已配置' : '未配置');
  console.log('Secret Key:', process.env.OKX_SECRET_KEY ? '已配置' : '未配置');
  console.log('Passphrase:', process.env.OKX_PASSPHRASE ? '已配置' : '未配置');
  console.log('测试交易员:', testUniqueCode);
  
  try {
    const response = await axios.get('https://www.okx.com/api/v5/copytrading/current-subpositions', {
      headers,
      params: {
        uniqueCode: testUniqueCode,
        instType: 'SWAP'
      }
    });
    
    console.log('✅ 获取交易员持仓成功!');
    console.log('响应代码:', response.data.code);
    console.log('持仓数量:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('示例持仓:', {
        instId: response.data.data[0].instId,
        subPos: response.data.data[0].subPos,
        openAvgPx: response.data.data[0].openAvgPx,
        markPx: response.data.data[0].markPx,
        upl: response.data.data[0].upl
      });
    } else {
      console.log('该交易员当前无持仓');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 获取交易员持仓失败:');
    console.error('错误信息:', error.response?.data || error.message);
    console.error('状态码:', error.response?.status);
    
    // 如果是权限问题，提供解决建议
    if (error.response?.data?.code === '50102') {
      console.error('\n🔧 解决建议:');
      console.error('- 检查API Key是否有"复制交易"读取权限');
      console.error('- 确认API Key未被限制或暂停');
    }
    
    return null;
  }
}

// 测试基础API连接
async function testBasicAPI() {
  const timestamp = new Date().toISOString();
  const method = 'GET';
  const requestPath = '/api/v5/public/time';
  const body = '';
  
  try {
    const response = await axios.get('https://www.okx.com/api/v5/public/time');
    console.log('✅ 基础API连接正常');
    console.log('服务器时间:', response.data.data[0].ts);
    return true;
  } catch (error) {
    console.error('❌ 基础API连接失败:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== OKX API 测试开始 ===\n');
  
  // 1. 测试基础连接
  console.log('1. 测试基础API连接...');
  const basicTest = await testBasicAPI();
  
  if (!basicTest) {
    console.log('基础连接失败，请检查网络连接');
    return;
  }
  
  console.log('\n2. 测试获取交易员持仓...');
  await testTraderPositions();
  
  console.log('\n=== 测试完成 ===');
}

runTests();
