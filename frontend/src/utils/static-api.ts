import { LeadPosition, TraderStats, PositionRecord, EmailSubscription } from '../types';

// 静态数据 API 客户端 (用于 GitHub Pages)
export class StaticApiClient {
  private dataCache: any = null;
  private lastFetch: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5分钟缓存

  // 获取静态数据
  private async fetchStaticData(): Promise<any> {
    const now = Date.now();
    
    // 如果缓存有效，直接返回
    if (this.dataCache && (now - this.lastFetch) < this.cacheTimeout) {
      return this.dataCache;
    }

    try {
      // 尝试从 GitHub Pages 获取数据
      const response = await fetch('/data/traders.json');
      if (response.ok) {
        this.dataCache = await response.json();
        this.lastFetch = now;
        return this.dataCache;
      }
    } catch (error) {
      console.warn('无法获取静态数据，使用模拟数据:', error);
    }

    // 如果获取失败，返回模拟数据
    return this.getMockData();
  }

  // 模拟数据
  private getMockData() {
    return {
      traders: [
        {
          traderId: 'trader1',
          nickname: '量化大师',
          profitRate: 25.6,
          followersCount: 1250,
          positions: [
            {
              symbol: 'BTC-USDT',
              side: 'long',
              size: 2.5,
              pnl: 1250.50,
              entryPrice: 42000,
              markPrice: 42500
            },
            {
              symbol: 'ETH-USDT',
              side: 'short',
              size: 10.0,
              pnl: -320.75,
              entryPrice: 2800,
              markPrice: 2832
            }
          ]
        },
        {
          traderId: 'trader2',
          nickname: '稳健投资者',
          profitRate: 18.3,
          followersCount: 890,
          positions: [
            {
              symbol: 'BNB-USDT',
              side: 'long',
              size: 50.0,
              pnl: 890.25,
              entryPrice: 320,
              markPrice: 338
            }
          ]
        }
      ],
      lastUpdate: new Date().toISOString()
    };
  }

  // 获取交易员当前带单
  async getCurrentPositions(uniqueCode: string): Promise<LeadPosition[]> {
    const data = await this.fetchStaticData();
    const trader = data.traders.find((t: any) => t.traderId === uniqueCode);
    
    if (!trader) {
      throw new Error('交易员不存在');
    }

    return trader.positions.map((pos: any) => ({
      positionId: `${pos.symbol}_${pos.side}`,
      symbol: pos.symbol,
      side: pos.side,
      size: pos.size.toString(),
      entryPrice: pos.entryPrice?.toString() || '0',
      markPrice: pos.markPrice?.toString() || '0',
      pnl: pos.pnl?.toString() || '0',
      pnlRatio: pos.pnl && pos.entryPrice ? ((pos.pnl / (pos.entryPrice * pos.size)) * 100).toFixed(2) : '0',
      margin: '0',
      leverage: '1',
      openTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }));
  }

  // 添加交易员到监控列表 (静态模式下只是模拟)
  async addTrader(uniqueCode: string, nickName?: string) {
    console.log(`模拟添加交易员: ${uniqueCode} (${nickName})`);
    
    // 在实际应用中，这里可以通过 GitHub API 或其他方式提交数据
    return {
      success: true,
      message: '交易员已添加到监控列表 (静态模式)',
      data: {
        traderId: uniqueCode,
        nickname: nickName || uniqueCode
      }
    };
  }

  // 订阅邮件通知 (静态模式下保存到 localStorage)
  async subscribe(
    email: string,
    uniqueCode: string,
    alertTypes: string[]
  ): Promise<EmailSubscription> {
    const subscription: EmailSubscription = {
      id: Date.now().toString(),
      email,
      traderId: uniqueCode,
      alertTypes,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存到 localStorage
    const subscriptions = this.getLocalSubscriptions();
    subscriptions.push(subscription);
    localStorage.setItem('okx_subscriptions', JSON.stringify(subscriptions));

    return subscription;
  }

  // 取消订阅
  async unsubscribe(email: string, uniqueCode: string): Promise<void> {
    const subscriptions = this.getLocalSubscriptions();
    const filtered = subscriptions.filter(
      (sub: EmailSubscription) => !(sub.email === email && sub.traderId === uniqueCode)
    );
    localStorage.setItem('okx_subscriptions', JSON.stringify(filtered));
  }

  // 获取用户订阅
  async getUserSubscriptions(email: string): Promise<EmailSubscription[]> {
    const subscriptions = this.getLocalSubscriptions();
    return subscriptions.filter((sub: EmailSubscription) => sub.email === email);
  }

  // 从 localStorage 获取订阅
  private getLocalSubscriptions(): EmailSubscription[] {
    try {
      const stored = localStorage.getItem('okx_subscriptions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // 测试邮件发送 (静态模式下只是模拟)
  async testEmail(email: string): Promise<void> {
    console.log(`模拟发送测试邮件到: ${email}`);
    // 在实际应用中，可以通过第三方服务发送邮件
  }

  // 健康检查
  async healthCheck() {
    const data = await this.fetchStaticData();
    return {
      success: true,
      message: 'GitHub Pages 静态服务正常',
      data: {
        status: 'healthy',
        lastUpdate: data.lastUpdate,
        tradersCount: data.traders?.length || 0
      }
    };
  }

  // 获取API信息
  async getApiInfo() {
    return {
      success: true,
      message: 'OKX 交易员监控系统 - GitHub Pages 版本',
      data: {
        version: '1.0.0',
        mode: 'static',
        platform: 'GitHub Pages',
        features: [
          '交易员监控',
          '持仓跟踪',
          '邮件订阅 (本地存储)',
          '数据可视化'
        ]
      }
    };
  }

  // 获取所有交易员统计
  async getAllTraders(): Promise<TraderStats[]> {
    const data = await this.fetchStaticData();
    
    return data.traders.map((trader: any) => ({
      traderId: trader.traderId,
      nickname: trader.nickname,
      profitRate: trader.profitRate,
      followersCount: trader.followersCount,
      totalPnl: trader.positions.reduce((sum: number, pos: any) => sum + (pos.pnl || 0), 0),
      winRate: Math.random() * 100, // 模拟胜率
      positionsCount: trader.positions.length,
      lastUpdate: data.lastUpdate
    }));
  }
}

// 检测是否在 GitHub Pages 环境
const isGitHubPages = window.location.hostname.includes('github.io') || 
                     window.location.hostname.includes('github.com') ||
                     !window.location.hostname.includes('localhost');

// 导出适当的 API 客户端
export const apiClient = isGitHubPages ? new StaticApiClient() : 
  (await import('./api')).apiClient;

export default apiClient;
