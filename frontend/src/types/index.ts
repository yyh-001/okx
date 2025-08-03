// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 交易员带单位置信息
export interface LeadPosition {
  instId: string;          // 产品ID
  instType: string;        // 产品类型
  mgnMode: string;         // 保证金模式
  posId?: string;          // 持仓ID (旧字段)
  subPosId?: string;       // 带单仓位ID (OKX API字段)
  posSide: string;         // 持仓方向
  pos?: string;            // 持仓数量 (旧字段)
  subPos?: string;         // 持仓张数 (OKX API字段)
  baseCcy?: string;        // 交易货币
  quoteCcy?: string;       // 计价货币
  avgPx?: string;          // 开仓平均价 (旧字段)
  openAvgPx?: string;      // 开仓均价 (OKX API字段)
  markPx: string;          // 标记价格
  upl: string;             // 未实现收益
  uplRatio: string;        // 未实现收益率
  lever: string;           // 杠杆倍数
  notionalUsd?: string;    // 以美元价值计算的持仓数量 (旧字段)
  margin?: string;         // 保证金 (OKX API字段)
  cTime?: string;          // 创建时间 (旧字段)
  openTime?: string;       // 开仓时间 (OKX API字段)
  uTime?: string;          // 更新时间
  ccy?: string;            // 币种 (OKX API字段)
  uniqueCode?: string;     // 交易员唯一标识码 (OKX API字段)
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

// 交易员信息
export interface TraderInfo {
  id?: number;
  uniqueCode: string;
  nickName?: string;
  url?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 持仓记录
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
  recordTime: string;
}

// 邮件订阅信息
export interface EmailSubscription {
  id?: number;
  email: string;
  uniqueCode: string;
  alertTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 表单数据类型
export interface SubscribeForm {
  email: string;
  uniqueCode: string;
  alertTypes: string[];
}

// 通知类型
export type AlertType = 'new_position' | 'close_position' | 'profit_loss';

// 持仓方向
export type PositionSide = 'long' | 'short';
