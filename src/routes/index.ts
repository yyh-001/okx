import { Router } from 'express';
import traderRoutes from './trader.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'OKX Trader Monitor API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 信息
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'OKX Trader Monitor API',
      version: '2.0.0',
      description: 'OKX交易员当前带单监控系统API - 简化版',
      features: [
        '使用OKX公共API，无需API密钥',
        '实时获取交易员当前带单数据',
        '邮件订阅通知功能',
        '简洁高效的监控体验'
      ],
      endpoints: {
        trader: {
          'GET /api/trader/:uniqueCode/positions': '获取交易员当前带单',
          'POST /api/trader/add': '添加交易员到监控列表'
        },
        subscription: {
          'POST /api/subscribe': '订阅邮件通知',
          'DELETE /api/unsubscribe': '取消订阅',
          'GET /api/subscriptions/:email': '获取用户订阅'
        },
        system: {
          'GET /api/health': '健康检查',
          'GET /api/info': 'API信息'
        }
      },
      usage: {
        'uniqueCode': '16位交易员唯一标识符，可从OKX交易员链接中提取',
        'example': 'https://www.okx.com/zh-hans/copy-trading/account/34ABFF2DBEC9E970'
      }
    }
  });
});

// 挂载路由
router.use('/', traderRoutes);
router.use('/', subscriptionRoutes);

export default router;
