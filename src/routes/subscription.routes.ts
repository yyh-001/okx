import { Router, Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { ApiResponse, SubscribeRequest, UnsubscribeRequest } from '../types';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/subscribe
 * 订阅邮件通知
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, uniqueCode, alertTypes }: SubscribeRequest = req.body;

    // 验证请求参数
    if (!email || !uniqueCode || !alertTypes) {
      return res.status(400).json({
        success: false,
        error: 'email, uniqueCode, and alertTypes are required'
      } as ApiResponse);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      } as ApiResponse);
    }

    // 验证uniqueCode格式
    if (uniqueCode.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uniqueCode format'
      } as ApiResponse);
    }

    // 验证alertTypes
    const validAlertTypes = ['new_position', 'close_position', 'profit_loss'];
    const invalidTypes = alertTypes.filter(type => !validAlertTypes.includes(type));
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid alert types: ${invalidTypes.join(', ')}`
      } as ApiResponse);
    }

    const subscription = await emailService.addSubscription(email, uniqueCode, alertTypes);

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription added successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to add subscription', {
      error: error instanceof Error ? error.message : error,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * DELETE /api/unsubscribe
 * 取消订阅
 */
router.delete('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email, uniqueCode }: UnsubscribeRequest = req.body;

    if (!email || !uniqueCode) {
      return res.status(400).json({
        success: false,
        error: 'email and uniqueCode are required'
      } as ApiResponse);
    }

    const removed = await emailService.removeSubscription(email, uniqueCode);

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Subscription removed successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to remove subscription', {
      error: error instanceof Error ? error.message : error,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * GET /api/subscriptions/:email
 * 获取用户的所有订阅
 */
router.get('/subscriptions/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      } as ApiResponse);
    }

    const subscriptions = await emailService.getUserSubscriptions(email);

    res.json({
      success: true,
      data: subscriptions,
      message: 'User subscriptions retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to get user subscriptions', {
      email: req.params.email,
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * GET /api/subscribers/:uniqueCode
 * 获取交易员的所有订阅者（管理员功能）
 */
router.get('/subscribers/:uniqueCode', async (req: Request, res: Response) => {
  try {
    const { uniqueCode } = req.params;

    if (!uniqueCode || uniqueCode.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uniqueCode format'
      } as ApiResponse);
    }

    const subscribers = await emailService.getTraderSubscribers(uniqueCode);

    // 隐藏敏感信息（邮箱地址）
    const sanitizedSubscribers = subscribers.map(sub => ({
      ...sub,
      email: sub.email.replace(/(.{2}).*(@.*)/, '$1***$2') // 部分隐藏邮箱
    }));

    res.json({
      success: true,
      data: sanitizedSubscribers,
      message: 'Trader subscribers retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to get trader subscribers', {
      uniqueCode: req.params.uniqueCode,
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * POST /api/test-email
 * 测试邮件发送（开发环境）
 */
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    // 仅在开发环境允许
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Test email is not allowed in production'
      } as ApiResponse);
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'email is required'
      } as ApiResponse);
    }

    const success = await emailService.sendEmail({
      to: email,
      subject: '📧 OKX 交易员监控系统 - 测试邮件',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1890ff;">测试邮件</h2>
          <p>这是一封来自 OKX 交易员监控系统的测试邮件。</p>
          <p>如果您收到这封邮件，说明邮件服务配置正确。</p>
          <p style="color: #666; font-size: 12px;">
            发送时间: ${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `,
      type: 'new_position'
    });

    res.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to send test email', {
      error: error instanceof Error ? error.message : error,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
