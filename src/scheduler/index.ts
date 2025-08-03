import cron from 'node-cron';
import { traderService } from '../services/trader.service';
import { emailService } from '../services/email.service';
import { config } from '../config';
import logger from '../utils/logger';

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * 启动所有定时任务
   */
  start(): void {
    logger.info('Starting scheduler...');

    // 启动数据更新任务
    this.startDataUpdateJob();

    // 启动监控任务
    this.startMonitoringJob();

    logger.info('All scheduled jobs started');
  }

  /**
   * 停止所有定时任务
   */
  stop(): void {
    logger.info('Stopping scheduler...');

    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });

    this.jobs.clear();
    logger.info('All scheduled jobs stopped');
  }

  /**
   * 启动数据更新任务（已简化，主要功能由监控服务处理）
   */
  private startDataUpdateJob(): void {
    const cronExpression = `*/${config.cron.updateInterval} * * * *`; // 每N分钟执行一次

    const job = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Scheduler heartbeat - monitoring service is handling position updates');
      } catch (error) {
        logger.error('Scheduler job failed', {
          error: error instanceof Error ? error.message : error
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Shanghai'
    });

    job.start();
    this.jobs.set('dataUpdate', job);
    
    logger.info(`Data update job scheduled: ${cronExpression}`);
  }

  /**
   * 启动监控任务
   * 每30秒检查一次新的仓位变化并发送通知
   */
  private startMonitoringJob(): void {
    const cronExpression = '*/30 * * * * *'; // 每30秒执行一次
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        await this.checkPositionChanges();
      } catch (error) {
        logger.error('Monitoring job failed', {
          error: error instanceof Error ? error.message : error
        });
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Shanghai'
    });

    job.start();
    this.jobs.set('monitoring', job);
    
    logger.info(`Monitoring job scheduled: ${cronExpression}`);
  }

  /**
   * 检查仓位变化并发送通知（已移至监控服务）
   */
  private async checkPositionChanges(): Promise<void> {
    // 此功能已移至 MonitorService，这里保留空实现以避免错误
    logger.debug('Position change monitoring is handled by MonitorService');
  }

  /**
   * 检查新开仓
   */
  private async checkNewPositions(trader: any, currentPositions: any[], recentHistory: any[]): Promise<void> {
    try {
      // 获取最近5分钟的历史记录中的posId
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentPosIds = new Set(
        recentHistory
          .filter(record => new Date(record.record_time) > fiveMinutesAgo)
          .map(record => record.pos_id)
      );

      // 检查当前持仓中是否有新的posId
      for (const position of currentPositions) {
        if (!recentPosIds.has(position.posId)) {
          logger.info('New position detected', {
            uniqueCode: trader.uniqueCode,
            posId: position.posId,
            instId: position.instId
          });

          // 发送新开仓通知
          await emailService.notifyNewPosition(
            trader.uniqueCode,
            trader.nickName || trader.uniqueCode,
            position
          );
        }
      }
    } catch (error) {
      logger.error('Failed to check new positions', {
        uniqueCode: trader.uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 检查平仓
   */
  private async checkClosedPositions(trader: any, currentPositions: any[], recentHistory: any[]): Promise<void> {
    try {
      // 获取当前持仓的posId
      const currentPosIds = new Set(currentPositions.map(pos => pos.posId));
      
      // 获取最近5分钟的历史记录
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentRecords = recentHistory.filter(record => 
        new Date(record.record_time) > fiveMinutesAgo
      );

      // 检查是否有仓位被平掉
      const recentPosIds = new Set(recentRecords.map(record => record.pos_id));
      
      for (const posId of recentPosIds) {
        if (!currentPosIds.has(posId)) {
          // 找到被平掉的仓位记录
          const closedPosition = recentRecords.find(record => record.pos_id === posId);
          
          if (closedPosition) {
            logger.info('Position closed detected', {
              uniqueCode: trader.uniqueCode,
              posId: closedPosition.pos_id,
              instId: closedPosition.inst_id
            });

            // 发送平仓通知
            await emailService.notifyClosePosition(
              trader.uniqueCode,
              trader.nickName || trader.uniqueCode,
              {
                subPosId: closedPosition.pos_id,
                instId: closedPosition.inst_id,
                instType: 'SWAP',
                mgnMode: 'cross',
                posSide: closedPosition.pos_side,
                subPos: closedPosition.pos || '0',
                ccy: 'USDT',
                openAvgPx: closedPosition.avg_px,
                markPx: closedPosition.mark_px,
                upl: closedPosition.upl,
                uplRatio: closedPosition.upl_ratio,
                lever: closedPosition.lever,
                margin: '0',
                notionalUsd: closedPosition.notional_usd,
                openTime: closedPosition.c_time,
                uniqueCode: trader.uniqueCode,
                availSubPos: '0'
              }
            );
          }
        }
      }
    } catch (error) {
      logger.error('Failed to check closed positions', {
        uniqueCode: trader.uniqueCode,
        error: error instanceof Error ? error.message : error
      });
    }
  }

  /**
   * 手动触发数据更新（已简化）
   */
  async triggerDataUpdate(): Promise<void> {
    try {
      logger.info('Manual data update triggered - monitoring service handles real-time updates');
    } catch (error) {
      logger.error('Manual data update failed', {
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 获取任务状态
   */
  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};

    this.jobs.forEach((job, name) => {
      status[name] = true; // 简化状态检查，假设任务已启动
    });

    return status;
  }
}

export const scheduler = new Scheduler();
