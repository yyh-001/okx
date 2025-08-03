import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config, validateConfig } from './config';
import { scheduler } from './scheduler';
import { monitorService } from './services/monitor.service';
import routes from './routes';
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
  corsOptions,
  rateLimit,
  bodySizeLimit,
  securityHeaders,
  apiVersion
} from './middleware';
import logger from './utils/logger';

class Server {
  private app: express.Application;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS
    this.app.use(cors(corsOptions));

    // 请求体解析
    this.app.use(express.json({ limit: bodySizeLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: bodySizeLimit }));

    // 自定义中间件
    this.app.use(securityHeaders);
    this.app.use(apiVersion);
    this.app.use(requestLogger);

    // 速率限制
    this.app.use('/api', rateLimit(100, 15 * 60 * 1000)); // API路由限制：100请求/15分钟

    // 静态文件服务（前端）
    if (config.server.env === 'production') {
      this.app.use(express.static(path.join(__dirname, '../frontend/dist')));
    }
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // API 路由
    this.app.use('/api', routes);

    // 前端路由（生产环境）
    if (config.server.env === 'production') {
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
      });
    } else {
      // 开发环境根路由
      this.app.get('/', (req, res) => {
        res.json({
          success: true,
          message: 'OKX Trader Monitor API',
          version: '1.0.0',
          environment: config.server.env,
          documentation: '/api/info'
        });
      });
    }
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    // 404 处理
    this.app.use(notFoundHandler);

    // 全局错误处理
    this.app.use(errorHandler);
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    try {
      // 验证配置
      validateConfig();

      // 启动定时任务
      scheduler.start();

      // 启动监控服务
      monitorService.start();

      // 启动HTTP服务器
      this.server = this.app.listen(config.server.port, () => {
        logger.info('Server started successfully', {
          port: config.server.port,
          environment: config.server.env,
          pid: process.pid
        });

        // 输出启动信息
        console.log(`
🚀 OKX Trader Monitor Server Started!

📍 Environment: ${config.server.env}
🌐 Port: ${config.server.port}
📊 API Documentation: http://localhost:${config.server.port}/api/info
💾 Database: ${config.database.path}
📧 Email Service: ${config.email.host}:${config.email.port}

🔗 API Endpoints:
   • GET  /api/trader/:uniqueCode/positions - 获取当前带单
   • POST /api/trader/add - 添加交易员监控
   • POST /api/subscribe - 订阅邮件通知
   • GET  /api/health - 健康检查

⏰ Monitoring Services:
   • Position Monitor: Every 30 seconds
   • Email Notifications: Real-time

${config.server.env === 'development' ? '🔧 Development Mode - Hot reload enabled' : '🏭 Production Mode'}
        `);
      });

      // 处理服务器错误
      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`Port ${config.server.port} is already in use`);
          process.exit(1);
        } else {
          logger.error('Server error', { error: error.message });
          throw error;
        }
      });

    } catch (error) {
      logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : error
      });
      process.exit(1);
    }
  }

  /**
   * 优雅关闭服务器
   */
  async stop(): Promise<void> {
    logger.info('Shutting down server...');

    return new Promise((resolve) => {
      // 停止定时任务
      scheduler.stop();

      // 停止监控服务
      monitorService.stop();

      // 关闭HTTP服务器
      if (this.server) {
        this.server.close(() => {
          logger.info('Server stopped successfully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// 创建服务器实例
const server = new Server();

// 处理进程信号
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM signal');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT signal');
  await server.stop();
  process.exit(0);
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    promise: promise
  });
  process.exit(1);
});

// 启动服务器
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start application', {
      error: error instanceof Error ? error.message : error
    });
    process.exit(1);
  });
}

export default server;
