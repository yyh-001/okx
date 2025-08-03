import { okxApi } from '../utils/okx-api';
import { LeadPosition } from '../types';
import logger from '../utils/logger';

export class TraderService {
  /**
   * 获取交易员当前带单
   */
  async getCurrentPositions(uniqueCode: string): Promise<LeadPosition[]> {
    try {
      return await okxApi.getCurrentLeadPositions(uniqueCode);
    } catch (error) {
      logger.error('Failed to get current positions', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }




}

export const traderService = new TraderService();
