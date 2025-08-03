import crypto from 'crypto';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { config, OKX_BASE_URL } from '../config';
import { OKXResponse, LeadPosition, TraderStats } from '../types';
import logger from './logger';

export class OKXApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: OKX_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 添加请求拦截器进行签名
    this.client.interceptors.request.use((config) => {
      return this.signRequest(config);
    });

    // 添加响应拦截器进行日志记录
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('OKX API Response', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('OKX API Error', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        throw error;
      }
    );
  }

  /**
   * 签名请求
   */
  private signRequest(requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const timestamp = new Date().toISOString();
    const method = requestConfig.method?.toUpperCase() || 'GET';
    const requestPath = requestConfig.url || '';
    const body = requestConfig.data ? JSON.stringify(requestConfig.data) : '';

    // 创建签名字符串
    const signString = timestamp + method + requestPath + body;
    
    // 生成签名
    const signature = crypto
      .createHmac('sha256', config.okx.secretKey)
      .update(signString)
      .digest('base64');

    // 添加认证头
    requestConfig.headers = {
      ...requestConfig.headers,
      'OK-ACCESS-KEY': config.okx.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': config.okx.passphrase
    } as any;

    // 如果是模拟环境，添加模拟交易头
    if (config.okx.sandbox) {
      requestConfig.headers['x-simulated-trading'] = '1';
    }

    return requestConfig;
  }

  /**
   * 获取交易员当前带单（使用公共接口，无需签名）
   * 根据OKX官方文档：https://www.okx.com/docs-v5/zh/#order-book-trading-copy-trading-get-lead-trader-current-lead-positions
   */
  async getCurrentLeadPositions(uniqueCode: string): Promise<LeadPosition[]> {
    try {
      // 使用官方公共API端点获取交易员当前带单
      const response = await axios.get<OKXResponse<LeadPosition>>(
        `${OKX_BASE_URL}/api/v5/copytrading/public-current-subpositions`,
        {
          params: {
            uniqueCode,
            instType: 'SWAP' // 永续合约
          },
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OKX-Trader-Monitor/1.0'
          },
          timeout: 30000
        }
      );

      if (response.data.code !== '0') {
        throw new Error(`OKX API Error: ${response.data.msg || 'Unknown error'}`);
      }

      logger.info('Successfully fetched current positions', {
        uniqueCode,
        positionCount: response.data.data?.length || 0
      });

      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to get current lead positions', {
        uniqueCode,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * 从交易员URL中提取uniqueCode
   */
  static extractUniqueCodeFromUrl(url: string): string | null {
    try {
      // 支持多种OKX交易员链接格式
      const patterns = [
        /\/copy-trading\/account\/([A-F0-9]{16})/i,
        /\/copy-trading\/trader\/([A-F0-9]{16})/i,
        /uniqueCode=([A-F0-9]{16})/i,
        /\/([A-F0-9]{16})(?:\/|$)/i
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1].toUpperCase();
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to extract uniqueCode from URL', {
        url,
        error: error instanceof Error ? error.message : error
      });
      return null;
    }
  }
}

// 导出单例实例
export const okxApi = new OKXApi();
