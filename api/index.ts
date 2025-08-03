import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config, validateConfig } from '../src/config';
import routes from '../src/routes';
import {
  requestLogger,
  errorHandler,
  notFoundHandler,
  corsOptions,
  rateLimit,
  bodySizeLimit,
  securityHeaders,
  apiVersion
} from '../src/middleware';
import logger from '../src/utils/logger';

// 验证配置
validateConfig();

const app = express();

// 安全中间件
app.use(helmet({
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
app.use(cors(corsOptions));

// 请求日志
app.use(requestLogger);

// 安全头
app.use(securityHeaders);

// API 版本
app.use(apiVersion);

// 请求体大小限制
app.use(bodySizeLimit);

// 速率限制
app.use(rateLimit);

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 (前端)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API 路由
app.use('/api', routes);

// 前端路由 (SPA)
app.get('*', (req, res) => {
  // 如果是 API 请求但没有匹配到路由，返回 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path 
    });
  }
  
  // 其他请求返回前端应用
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// 404 处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 导出 app 供 Vercel 使用
export default app;
