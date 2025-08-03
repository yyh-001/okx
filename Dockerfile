# 多阶段构建 Dockerfile
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# 安装依赖
RUN npm ci --only=production && npm cache clean --force
RUN cd frontend && npm ci && npm cache clean --force

# 构建阶段
FROM base AS builder

# 复制源代码
COPY . .

# 构建前端
RUN cd frontend && npm run build

# 构建后端
RUN npm run build

# 生产阶段
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/frontend/dist ./frontend/dist

# 创建数据目录
RUN mkdir -p data logs && chown -R nextjs:nodejs data logs

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["node", "dist/server.js"]
