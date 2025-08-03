import { Pool } from 'pg';
import logger from '../utils/logger';

class PostgresDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async init(): Promise<void> {
    try {
      // 创建表
      await this.createTables();
      logger.info('PostgreSQL 数据库初始化成功');
    } catch (error) {
      logger.error('PostgreSQL 数据库初始化失败:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTradersTable = `
      CREATE TABLE IF NOT EXISTS traders (
        id SERIAL PRIMARY KEY,
        trader_id VARCHAR(255) UNIQUE NOT NULL,
        nickname VARCHAR(255),
        avatar_url TEXT,
        profit_rate DECIMAL(10, 4),
        followers_count INTEGER DEFAULT 0,
        total_pnl DECIMAL(15, 2) DEFAULT 0,
        win_rate DECIMAL(5, 2) DEFAULT 0,
        is_monitored BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createPositionsTable = `
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        trader_id VARCHAR(255) NOT NULL,
        position_id VARCHAR(255) UNIQUE NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        size DECIMAL(20, 8) NOT NULL,
        entry_price DECIMAL(20, 8),
        mark_price DECIMAL(20, 8),
        pnl DECIMAL(15, 2) DEFAULT 0,
        pnl_ratio DECIMAL(10, 4) DEFAULT 0,
        margin DECIMAL(15, 2) DEFAULT 0,
        leverage INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'open',
        open_time TIMESTAMP,
        close_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trader_id) REFERENCES traders(trader_id)
      );
    `;

    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        trader_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trader_id) REFERENCES traders(trader_id)
      );
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_traders_trader_id ON traders(trader_id);
      CREATE INDEX IF NOT EXISTS idx_positions_trader_id ON positions(trader_id);
      CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
      CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_trader_id ON notifications(trader_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_sent ON notifications(is_sent);
    `;

    await this.pool.query(createTradersTable);
    await this.pool.query(createPositionsTable);
    await this.pool.query(createNotificationsTable);
    await this.pool.query(createIndexes);
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const postgresDb = new PostgresDatabase();
