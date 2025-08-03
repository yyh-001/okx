import { Router, Request, Response } from 'express';
import { okxApi } from '../utils/okx-api';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/trader/:uniqueCode/positions
 * 获取交易员当前带单（使用公共接口，无需API密钥）
 */
router.get('/trader/:uniqueCode/positions', async (req: Request, res: Response) => {
  try {
    const { uniqueCode } = req.params;

    if (!uniqueCode || uniqueCode.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uniqueCode format. UniqueCode should be 16 characters long.'
      } as ApiResponse);
    }

    // 直接调用OKX公共API获取当前带单
    const positions = await okxApi.getCurrentLeadPositions(uniqueCode);

    res.json({
      success: true,
      data: positions,
      message: 'Current positions retrieved successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to get current positions', {
      uniqueCode: req.params.uniqueCode,
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve positions'
    } as ApiResponse);
  }
});

/**
 * POST /api/trader/add
 * 添加交易员到监控列表（通过uniqueCode）
 */
router.post('/trader/add', async (req: Request, res: Response) => {
  try {
    const { uniqueCode, nickName } = req.body;

    if (!uniqueCode || uniqueCode.length !== 16) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uniqueCode format. UniqueCode should be 16 characters long.'
      } as ApiResponse);
    }

    // 验证uniqueCode是否有效（尝试获取当前带单）
    try {
      await okxApi.getCurrentLeadPositions(uniqueCode);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid uniqueCode. Unable to fetch trader data.'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        uniqueCode,
        nickName: nickName || 'Unknown Trader',
        addedAt: new Date().toISOString()
      },
      message: 'Trader added to monitoring list successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Failed to add trader', {
      error: error instanceof Error ? error.message : error,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add trader'
    } as ApiResponse);
  }
});

export default router;
