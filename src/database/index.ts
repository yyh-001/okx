import sqlite3 from 'sqlite3';
import { config } from '../config';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class Database {
  private db: sqlite3.Database;

  constructor() {
    // 确保数据目录存在
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(config.database.path, (err) => {
      if (err) {
        logger.error('Failed to connect to database', { error: err.message });
        throw err;
      }
      logger.info('Connected to SQLite database', { path: config.database.path });
    });

    this.initTables();
  }

  /**
   * 初始化数据表
   */
  private initTables(): void {
    const tables = [
      // 邮件订阅表
      `CREATE TABLE IF NOT EXISTS email_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        unique_code TEXT NOT NULL,
        trader_name TEXT, -- 交易员昵称（可选）
        alert_types TEXT NOT NULL, -- JSON array: ["new_position", "close_position", "profit_loss"]
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, unique_code)
      )`,

      // 邮件发送记录表
      `CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        unique_code TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL, -- 通知类型：new_position, close_position, profit_loss
        content TEXT, -- 邮件内容摘要
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach((sql, index) => {
      this.db.run(sql, (err) => {
        if (err) {
          logger.error(`Failed to create table ${index + 1}`, { error: err.message });
        } else {
          logger.debug(`Table ${index + 1} created or already exists`);
        }
      });
    });

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unique_code ON email_subscriptions(unique_code)',
      'CREATE INDEX IF NOT EXISTS idx_email_logs_unique_code ON email_logs(unique_code)',
      'CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at)'
    ];

    indexes.forEach((sql) => {
      this.db.run(sql, (err) => {
        if (err) {
          logger.error('Failed to create index', { error: err.message, sql });
        }
      });
    });
  }

  /**
   * 执行查询
   */
  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database query error', { error: err.message, sql, params });
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  /**
   * 执行单条查询
   */
  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error', { error: err.message, sql, params });
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  /**
   * 执行插入/更新/删除
   */
  run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Database run error', { error: err.message, sql, params });
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Failed to close database', { error: err.message });
          reject(err);
        } else {
          logger.info('Database connection closed');
          resolve();
        }
      });
    });
  }
}

export const database = new Database();
