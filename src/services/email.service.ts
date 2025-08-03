import nodemailer from 'nodemailer';
import { config } from '../config';
import { database } from '../database';
import { EmailSubscription, EmailNotification, LeadPosition } from '../types';
import logger from '../utils/logger';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private emailQueue: Map<string, Date> = new Map(); // 邮件发送频率限制

  constructor() {
    // 只有在邮件配置完整时才创建传输器
    if (config.email.user && config.email.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.pass
        },
        // QQ邮箱特殊配置
        tls: {
          rejectUnauthorized: false
        },
        // 添加调试信息
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
      });

      // 验证邮件配置
      this.verifyConnection();
    } else {
      logger.warn('Email service not configured - missing credentials', {
        hasUser: !!config.email.user,
        hasPass: !!config.email.pass,
        host: config.email.host
      });
    }
  }

  /**
   * 验证邮件服务连接
   */
  private async verifyConnection(): Promise<void> {
    if (!this.transporter) {
      logger.warn('Cannot verify email connection - transporter not initialized');
      return;
    }
    
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Failed to connect to email service', {
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 添加邮件订阅
   */
  async addSubscription(
    email: string,
    uniqueCode: string,
    alertTypes: string[]
  ): Promise<EmailSubscription> {
    try {
      const result = await database.run(
        `INSERT OR REPLACE INTO email_subscriptions 
         (email, unique_code, alert_types, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [email, uniqueCode, JSON.stringify(alertTypes)]
      );

      logger.info('Email subscription added', {
        email,
        uniqueCode,
        alertTypes
      });

      // 发送订阅确认邮件
      await this.sendSubscriptionConfirmationEmail(email, uniqueCode, alertTypes);

      return {
        id: result.lastID,
        email,
        uniqueCode,
        alertTypes,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to add email subscription', {
        email,
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 删除邮件订阅
   */
  async removeSubscription(email: string, uniqueCode: string): Promise<boolean> {
    try {
      const result = await database.run(
        'DELETE FROM email_subscriptions WHERE email = ? AND unique_code = ?',
        [email, uniqueCode]
      );

      logger.info('Email subscription removed', {
        email,
        uniqueCode,
        changes: result.changes
      });

      return result.changes > 0;
    } catch (error) {
      logger.error('Failed to remove email subscription', {
        email,
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 获取用户订阅
   */
  async getUserSubscriptions(email: string): Promise<EmailSubscription[]> {
    try {
      const subscriptions = await database.query<any>(
        'SELECT * FROM email_subscriptions WHERE email = ? AND is_active = 1',
        [email]
      );

      return subscriptions.map(sub => ({
        ...sub,
        alertTypes: JSON.parse(sub.alert_types),
        createdAt: new Date(sub.created_at),
        updatedAt: new Date(sub.updated_at)
      }));
    } catch (error) {
      logger.error('Failed to get user subscriptions', {
        email,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 获取交易员的所有订阅者
   */
  async getTraderSubscribers(uniqueCode: string): Promise<EmailSubscription[]> {
    try {
      const subscriptions = await database.query<any>(
        'SELECT * FROM email_subscriptions WHERE unique_code = ? AND is_active = 1',
        [uniqueCode]
      );

      return subscriptions.map(sub => ({
        ...sub,
        alertTypes: JSON.parse(sub.alert_types),
        createdAt: new Date(sub.created_at),
        updatedAt: new Date(sub.updated_at)
      }));
    } catch (error) {
      logger.error('Failed to get trader subscribers', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 检查邮件发送频率限制
   */
  private canSendEmail(email: string): boolean {
    const lastSent = this.emailQueue.get(email);
    if (!lastSent) return true;

    const timeDiff = Date.now() - lastSent.getTime();
    const minInterval = (60 / config.email.rateLimit) * 1000; // 转换为毫秒

    return timeDiff >= minInterval;
  }

  /**
   * 发送邮件
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      // 检查transporter是否已初始化
      if (!this.transporter) {
        logger.warn('Cannot send email - email service not configured');
        return false;
      }

      // 检查发送频率限制
      if (!this.canSendEmail(notification.to)) {
        logger.warn('Email rate limit exceeded', {
          email: notification.to,
          type: notification.type
        });
        return false;
      }

      await this.transporter.sendMail({
        from: config.email.from,
        to: notification.to,
        subject: notification.subject,
        html: notification.html
      });

      // 更新发送时间
      this.emailQueue.set(notification.to, new Date());

      // 记录发送日志
      await database.run(
        'INSERT INTO email_logs (email, unique_code, subject, type) VALUES (?, ?, ?, ?)',
        [notification.to, '', notification.subject, notification.type]
      );

      logger.info('Email sent successfully', {
        to: notification.to,
        subject: notification.subject,
        type: notification.type
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        to: notification.to,
        subject: notification.subject,
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
  }

  /**
   * 生成新开仓通知邮件
   */
  generateNewPositionEmail(
    traderName: string,
    position: LeadPosition
  ): { subject: string; html: string } {
    const subject = `🚀 ${traderName} 开启新仓位 - ${position.instId}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1890ff;">新仓位通知</h2>
        <p>交易员 <strong>${traderName}</strong> 开启了新的仓位：</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">仓位详情</h3>
          <p><strong>交易对：</strong> ${position.instId}</p>
          <p><strong>方向：</strong> ${position.posSide === 'long' ? '做多' : '做空'}</p>
          <p><strong>数量：</strong> ${position.pos}</p>
          <p><strong>开仓价：</strong> ${position.avgPx}</p>
          <p><strong>杠杆：</strong> ${position.lever}x</p>
          <p><strong>名义价值：</strong> $${parseFloat(position.notionalUsd || '0').toLocaleString()}</p>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          此邮件由 OKX 交易员监控系统自动发送<br>
          发送时间: ${new Date().toLocaleString('zh-CN')}
        </p>
      </div>
    `;

    return { subject, html };
  }

  /**
   * 生成平仓通知邮件
   */
  generateClosePositionEmail(
    traderName: string,
    position: LeadPosition
  ): { subject: string; html: string } {
    const pnl = parseFloat(position.upl);
    const pnlColor = pnl >= 0 ? '#52c41a' : '#ff4d4f';
    const pnlIcon = pnl >= 0 ? '📈' : '📉';
    
    const subject = `${pnlIcon} ${traderName} 平仓 - ${position.instId} (${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT)`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${pnlColor};">平仓通知</h2>
        <p>交易员 <strong>${traderName}</strong> 平仓了仓位：</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #333;">仓位详情</h3>
          <p><strong>交易对：</strong> ${position.instId}</p>
          <p><strong>方向：</strong> ${position.posSide === 'long' ? '做多' : '做空'}</p>
          <p><strong>数量：</strong> ${position.pos}</p>
          <p><strong>开仓价：</strong> ${position.avgPx}</p>
          <p><strong>平仓价：</strong> ${position.markPx}</p>
          <p><strong>杠杆：</strong> ${position.lever}x</p>
          <p><strong>盈亏：</strong> <span style="color: ${pnlColor}; font-weight: bold;">${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT (${position.uplRatio}%)</span></p>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          此邮件由 OKX 交易员监控系统自动发送<br>
          发送时间: ${new Date().toLocaleString('zh-CN')}
        </p>
      </div>
    `;

    return { subject, html };
  }

  /**
   * 发送新仓位通知
   */
  async notifyNewPosition(uniqueCode: string, traderName: string, position: LeadPosition): Promise<void> {
    try {
      const subscribers = await this.getTraderSubscribers(uniqueCode);
      const { subject, html } = this.generateNewPositionEmail(traderName, position);

      for (const subscriber of subscribers) {
        if (subscriber.alertTypes.includes('new_position')) {
          await this.sendEmail({
            to: subscriber.email,
            subject,
            html,
            type: 'new_position'
          });
        }
      }
    } catch (error) {
      logger.error('Failed to notify new position', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 发送平仓通知
   */
  async notifyClosePosition(uniqueCode: string, traderName: string, position: LeadPosition): Promise<void> {
    try {
      const subscribers = await this.getTraderSubscribers(uniqueCode);
      const { subject, html } = this.generateClosePositionEmail(traderName, position);

      for (const subscriber of subscribers) {
        if (subscriber.alertTypes.includes('close_position')) {
          await this.sendEmail({
            to: subscriber.email,
            subject,
            html,
            type: 'close_position'
          });
        }
      }
    } catch (error) {
      logger.error('Failed to notify close position', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 发送订阅确认邮件
   */
  private async sendSubscriptionConfirmationEmail(
    email: string,
    uniqueCode: string,
    alertTypes: string[]
  ): Promise<void> {
    try {
      const alertTypeNames = {
        'new_position': '新开仓通知',
        'close_position': '平仓通知',
        'profit_loss': '盈亏变化通知'
      };

      const selectedAlerts = alertTypes.map(type => alertTypeNames[type as keyof typeof alertTypeNames]).join('、');

      const subject = '🎉 OKX 交易员监控 - 订阅确认';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1890ff; margin: 0;">OKX 交易员监控系统</h1>
            <p style="color: #666; margin: 10px 0;">订阅确认通知</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #52c41a; margin-top: 0;">✅ 订阅成功！</h2>
            <p>您已成功订阅交易员 <strong>${uniqueCode}</strong> 的带单通知。</p>
          </div>

          <div style="background: white; border: 1px solid #e8e8e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">📋 订阅详情</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>交易员代码：</strong>${uniqueCode}</li>
              <li><strong>通知类型：</strong>${selectedAlerts}</li>
              <li><strong>订阅邮箱：</strong>${email}</li>
              <li><strong>订阅时间：</strong>${new Date().toLocaleString('zh-CN')}</li>
            </ul>
          </div>

          <div style="background: #fff7e6; border: 1px solid #ffd591; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #fa8c16; margin-top: 0;">📧 通知说明</h4>
            <ul style="color: #666; line-height: 1.6; margin: 0;">
              <li>我们将根据您选择的通知类型发送邮件</li>
              <li>邮件发送频率有限制，避免过度打扰</li>
              <li>您可以随时使用相同邮箱取消订阅</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 12px;">
              如果您没有订阅此服务，请忽略此邮件<br>
              © 2024 OKX 交易员监控系统
            </p>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: email,
        subject,
        html,
        type: 'new_position' // 使用现有的邮件类型
      });

      logger.info('Subscription confirmation email sent', {
        email,
        uniqueCode,
        alertTypes
      });
    } catch (error) {
      logger.error('Failed to send subscription confirmation email', {
        email,
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      // 不抛出错误，避免影响订阅流程
    }
  }
}

export const emailService = new EmailService();
