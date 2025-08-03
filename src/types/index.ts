// OKX API 响应类型
export interface OKXResponse<T> {
  code: string;
  msg: string;
  data: T[];
}

// 交易员带单位置信息（基于OKX认证API响应）
export interface LeadPosition {
  instId: string;          // 产品ID
  instType: string;        // 产品类型
  mgnMode: string;         // 保证金模式
  subPosId: string;        // 子持仓ID (认证API字段)
  posId?: string;          // 持仓ID (兼容性字段)
  posSide: string;         // 持仓方向
  subPos: string;          // 持仓数量 (认证API字段)
  pos?: string;            // 持仓数量 (兼容性字段)
  ccy: string;             // 币种
  openAvgPx: string;       // 开仓平均价 (认证API字段)
  avgPx?: string;          // 开仓平均价 (兼容性字段)
  markPx: string;          // 标记价格
  upl: string;             // 未实现收益
  uplRatio: string;        // 未实现收益率
  lever: string;           // 杠杆倍数
  margin: string;          // 保证金
  notionalUsd?: string;    // 以美元价值计算的持仓数量
  openTime: string;        // 开仓时间 (认证API字段)
  cTime?: string;          // 创建时间 (兼容性字段)
  uTime?: string;          // 更新时间 (兼容性字段)
  uniqueCode: string;      // 交易员唯一标识
  availSubPos: string;     // 可用子持仓
  algoId?: string;         // 算法订单ID
  openOrdId?: string;      // 开仓订单ID
  slOrdPx?: string;        // 止损订单价格
  slTriggerPx?: string;    // 止损触发价格
  tpOrdPx?: string;        // 止盈订单价格
  tpTriggerPx?: string;    // 止盈触发价格
}

// 子持仓信息
export interface SubPosition {
  instId: string;
  pos: string;
  avgPx: string;
  upl: string;
  uplRatio: string;
}

// 交易员统计信息
export interface TraderStats {
  uniqueCode?: string;      // 交易员唯一标识（前端添加）
  nickName?: string;        // 昵称（前端添加）
  instType?: string;        // 产品类型（前端添加）
  cTime?: string;           // 创建时间（前端添加）
  
  // OKX API 实际返回的字段
  avgSubPosNotional: string;  // 平均子持仓名义价值
  ccy: string;               // 币种
  curCopyTraderPnl: string;  // 当前跟单交易员盈亏
  investAmt: string;         // 投资金额
  lossDays: string;          // 亏损天数
  profitDays: string;        // 盈利天数
  winRatio: string;          // 胜率
}

// 数据库中的交易员信息
export interface TraderInfo {
  id?: number;
  uniqueCode: string;
  nickName?: string;
  url?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 数据库中的持仓记录
export interface PositionRecord {
  id?: number;
  uniqueCode: string;
  posId: string;
  instId: string;
  posSide: string;
  pos: string;
  avgPx: string;
  markPx: string;
  upl: string;
  uplRatio: string;
  lever: string;
  notionalUsd: string;
  cTime: string;
  uTime: string;
  recordTime: Date;
}

// 邮件订阅信息
export interface EmailSubscription {
  id?: number;
  email: string;
  uniqueCode: string;
  alertTypes: string[];    // JSON数组：['new_position', 'close_position', 'profit_loss']
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API 请求类型
export interface AnalyzeTraderRequest {
  traderUrl: string;
}

export interface SubscribeRequest {
  email: string;
  uniqueCode: string;
  alertTypes: string[];
}

export interface UnsubscribeRequest {
  email: string;
  uniqueCode: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 邮件通知类型
export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  type: 'new_position' | 'close_position' | 'profit_loss';
}

// 配置类型
export interface Config {
  okx: {
    apiKey: string;
    secretKey: string;
    passphrase: string;
    sandbox: boolean;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    rateLimit: number;
  };
  database: {
    path: string;
  };
  server: {
    port: number;
    env: string;
  };
  cron: {
    updateInterval: number;
  };
}
