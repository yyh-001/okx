import { okxApi } from '../utils/okx-api';
import { emailService } from './email.service';
import { database } from '../database';
import { LeadPosition } from '../types';
import logger from '../utils/logger';

interface PositionSnapshot {
  uniqueCode: string;
  positions: LeadPosition[];
  timestamp: Date;
}

export class MonitorService {
  private positionSnapshots: Map<string, PositionSnapshot> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITOR_INTERVAL = 30000; // 30秒检查一次

  /**
   * 开始监控
   */
  start(): void {
    if (this.monitoringInterval) {
      logger.warn('Monitor service is already running');
      return;
    }

    logger.info('Starting position monitor service', {
      interval: this.MONITOR_INTERVAL
    });

    this.monitoringInterval = setInterval(async () => {
      await this.checkAllSubscriptions();
    }, this.MONITOR_INTERVAL);
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Position monitor service stopped');
    }
  }

  /**
   * 检查所有订阅的交易员
   */
  private async checkAllSubscriptions(): Promise<void> {
    try {
      // 获取所有活跃的订阅
      const subscriptions = await database.query<any>(
        'SELECT DISTINCT unique_code FROM email_subscriptions WHERE is_active = 1'
      );

      logger.debug('Checking subscriptions', {
        count: subscriptions.length
      });

      for (const subscription of subscriptions) {
        await this.checkTraderPositions(
          subscription.unique_code,
          `交易员 ${subscription.unique_code}`
        );
      }
    } catch (error) {
      logger.error('Failed to check all subscriptions', {
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 检查单个交易员的仓位变动
   */
  private async checkTraderPositions(uniqueCode: string, traderName: string): Promise<void> {
    try {
      // 获取当前仓位
      const currentPositions = await okxApi.getCurrentLeadPositions(uniqueCode);
      const previousSnapshot = this.positionSnapshots.get(uniqueCode);

      if (!previousSnapshot) {
        // 首次检查，保存快照
        this.positionSnapshots.set(uniqueCode, {
          uniqueCode,
          positions: currentPositions,
          timestamp: new Date()
        });
        
        logger.debug('Initial snapshot saved', {
          uniqueCode,
          positionCount: currentPositions.length
        });
        return;
      }

      // 比较仓位变动
      await this.comparePositions(
        uniqueCode,
        traderName,
        previousSnapshot.positions,
        currentPositions
      );

      // 更新快照
      this.positionSnapshots.set(uniqueCode, {
        uniqueCode,
        positions: currentPositions,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Failed to check trader positions', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 比较仓位变动
   */
  private async comparePositions(
    uniqueCode: string,
    traderName: string,
    previousPositions: LeadPosition[],
    currentPositions: LeadPosition[]
  ): Promise<void> {
    try {
      // 创建仓位映射，使用posId作为唯一标识
      const previousMap = new Map<string, LeadPosition>();
      const currentMap = new Map<string, LeadPosition>();

      previousPositions.forEach(pos => {
        const posId = pos.posId || pos.subPosId || `${pos.instId}_${pos.posSide}`;
        previousMap.set(posId, pos);
      });

      currentPositions.forEach(pos => {
        const posId = pos.posId || pos.subPosId || `${pos.instId}_${pos.posSide}`;
        currentMap.set(posId, pos);
      });

      // 检查新开仓位
      for (const [posId, position] of currentMap) {
        if (!previousMap.has(posId)) {
          logger.info('New position detected', {
            uniqueCode,
            posId,
            instId: position.instId,
            posSide: position.posSide
          });

          await emailService.notifyNewPosition(uniqueCode, traderName, position);
        }
      }

      // 检查平仓位
      for (const [posId, position] of previousMap) {
        if (!currentMap.has(posId)) {
          logger.info('Position closed detected', {
            uniqueCode,
            posId,
            instId: position.instId,
            posSide: position.posSide
          });

          await emailService.notifyClosePosition(uniqueCode, traderName, position);
        }
      }

      // 检查仓位变化（数量或盈亏显著变化）
      for (const [posId, currentPos] of currentMap) {
        const previousPos = previousMap.get(posId);
        if (previousPos) {
          await this.checkPositionChanges(uniqueCode, traderName, previousPos, currentPos);
        }
      }

    } catch (error) {
      logger.error('Failed to compare positions', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 检查仓位变化
   */
  private async checkPositionChanges(
    uniqueCode: string,
    traderName: string,
    previousPos: LeadPosition,
    currentPos: LeadPosition
  ): Promise<void> {
    try {
      const previousSize = parseFloat(previousPos.pos || '0');
      const currentSize = parseFloat(currentPos.pos || '0');
      const previousUpl = parseFloat(previousPos.upl || '0');
      const currentUpl = parseFloat(currentPos.upl || '0');

      // 检查仓位大小变化（超过10%）
      const sizeChangeRatio = Math.abs(currentSize - previousSize) / previousSize;
      if (sizeChangeRatio > 0.1) {
        logger.info('Significant position size change detected', {
          uniqueCode,
          instId: currentPos.instId,
          previousSize,
          currentSize,
          changeRatio: sizeChangeRatio
        });
      }

      // 检查盈亏变化（超过100 USDT）
      const uplChange = Math.abs(currentUpl - previousUpl);
      if (uplChange > 100) {
        logger.info('Significant PnL change detected', {
          uniqueCode,
          instId: currentPos.instId,
          previousUpl,
          currentUpl,
          uplChange
        });

        // 可以在这里添加盈亏变化通知
        // await emailService.notifyProfitLossChange(uniqueCode, traderName, currentPos, uplChange);
      }

    } catch (error) {
      logger.error('Failed to check position changes', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 手动检查特定交易员
   */
  async checkTrader(uniqueCode: string, traderName?: string): Promise<void> {
    const name = traderName || `交易员 ${uniqueCode}`;
    await this.checkTraderPositions(uniqueCode, name);
  }

  /**
   * 获取监控状态
   */
  getStatus(): {
    isRunning: boolean;
    monitoredTraders: number;
    lastCheck: Date | null;
  } {
    return {
      isRunning: !!this.monitoringInterval,
      monitoredTraders: this.positionSnapshots.size,
      lastCheck: this.positionSnapshots.size > 0 
        ? new Date(Math.max(...Array.from(this.positionSnapshots.values()).map(s => s.timestamp.getTime())))
        : null
    };
  }
}

export const monitorService = new MonitorService();
