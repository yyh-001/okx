import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // 记录请求开始
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });

  next();
};

/**
 * 错误处理中间件
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  // 不要在生产环境中暴露错误堆栈
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDevelopment && { 
      details: error.message,
      stack: error.stack 
    })
  });
};

/**
 * 404 处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`
  });
};

/**
 * CORS 配置中间件
 */
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // 生产环境域名
    : ['http://localhost:3000', 'http://localhost:3001'], // 开发环境
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * 速率限制中间件
 */
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();

    // 获取或创建客户端记录
    let clientRecord = rateLimitMap.get(clientId);
    
    if (!clientRecord || now > clientRecord.resetTime) {
      // 创建新记录或重置过期记录
      clientRecord = {
        count: 1,
        resetTime: now + windowMs
      };
      rateLimitMap.set(clientId, clientRecord);
    } else {
      // 增加请求计数
      clientRecord.count++;
    }

    // 检查是否超过限制
    if (clientRecord.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        count: clientRecord.count,
        maxRequests
      });

      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000)
      });
    }

    // 添加速率限制头
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - clientRecord.count).toString(),
      'X-RateLimit-Reset': new Date(clientRecord.resetTime).toISOString()
    });

    next();
  };
};

/**
 * 请求体大小限制中间件
 */
export const bodySizeLimit = '10mb';

/**
 * 安全头中间件
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 设置安全相关的HTTP头
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  next();
};

/**
 * API版本中间件
 */
export const apiVersion = (req: Request, res: Response, next: NextFunction) => {
  res.set('X-API-Version', '1.0.0');
  next();
};
