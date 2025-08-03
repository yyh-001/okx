import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();

export const config: Config = {
  okx: {
    apiKey: process.env.OKX_API_KEY || '',
    secretKey: process.env.OKX_SECRET_KEY || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
    sandbox: process.env.OKX_SANDBOX === 'true'
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'OKX Trader Monitor <noreply@example.com>',
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '5')
  },
  database: {
    path: process.env.DATABASE_PATH || './data/database.sqlite'
  },
  server: {
    port: parseInt(process.env.PORT || '3003'),
    env: process.env.NODE_ENV || 'development'
  },
  cron: {
    updateInterval: parseInt(process.env.UPDATE_INTERVAL || '1')
  }
};

// 验证必需的配置
export function validateConfig(): void {
  // 由于使用公共API获取交易员持仓，不再需要OKX API凭证
  // 只验证邮件配置（如果需要发送通知）
  console.log('✅ 配置验证通过 - 使用OKX公共API，无需API凭证');
}

// OKX API 基础URL
export const OKX_BASE_URL = config.okx.sandbox 
  ? 'https://www.okx.com'  // 模拟环境
  : 'https://www.okx.com'; // 实盘环境
