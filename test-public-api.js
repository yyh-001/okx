const axios = require('axios');

// 测试公共API获取交易员持仓
async function testPublicAPI() {
  // 测试的交易员uniqueCode（从您的日志中获取）
  const testUniqueCode = '34ABFF2DBEC9E970';
  
  console.log('测试OKX公共API获取交易员持仓...');
  console.log('测试交易员:', testUniqueCode);
  console.log('API端点: /api/v5/copytrading/public-current-subpositions');
  console.log('特点: 无需API Key，无需签名认证\n');
  
  try {
    const response = await axios.get('https://www.okx.com/api/v5/copytrading/public-current-subpositions', {
      params: {
        uniqueCode: testUniqueCode,
        instType: 'SWAP'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 公共API调用成功!');
    console.log('响应代码:', response.data.code);
    console.log('响应消息:', response.data.msg || '成功');
    console.log('持仓数量:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📊 交易员当前持仓:');
      response.data.data.forEach((position, index) => {
        console.log(`${index + 1}. ${position.instId}`);
        console.log(`   持仓方向: ${position.posSide}`);
        console.log(`   持仓数量: ${position.subPos}`);
        console.log(`   开仓均价: ${position.openAvgPx}`);
        console.log(`   当前标记价: ${position.markPx}`);
        console.log(`   未实现盈亏: ${position.upl} (${(parseFloat(position.uplRatio) * 100).toFixed(2)}%)`);
        console.log(`   杠杆倍数: ${position.lever}x`);
        console.log(`   开仓时间: ${new Date(parseInt(position.openTime)).toLocaleString('zh-CN')}`);
        console.log('');
      });
    } else {
      console.log('该交易员当前无持仓');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ 公共API调用失败:');
    console.error('错误信息:', error.response?.data || error.message);
    console.error('状态码:', error.response?.status);
    
    if (error.response?.status === 404) {
      console.error('\n💡 可能的原因:');
      console.error('- 交易员uniqueCode不存在或无效');
      console.error('- 该交易员未公开持仓信息');
    }
    
    return null;
  }
}

// 测试另一个交易员
async function testAnotherTrader() {
  const anotherUniqueCode = '904AF3762185ED39'; // 从日志中的另一个交易员
  
  console.log('\n=== 测试第二个交易员 ===');
  console.log('测试交易员:', anotherUniqueCode);
  
  try {
    const response = await axios.get('https://www.okx.com/api/v5/copytrading/public-current-subpositions', {
      params: {
        uniqueCode: anotherUniqueCode,
        instType: 'SWAP'
      }
    });
    
    console.log('✅ 第二个交易员API调用成功!');
    console.log('持仓数量:', response.data.data?.length || 0);
    
    return response.data;
  } catch (error) {
    console.error('❌ 第二个交易员API调用失败:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('=== OKX 公共API测试开始 ===\n');
  
  await testPublicAPI();
  await testAnotherTrader();
  
  console.log('\n=== 测试完成 ===');
  console.log('如果测试成功，说明可以无需API Key直接获取交易员持仓信息！');
}

runTests();
