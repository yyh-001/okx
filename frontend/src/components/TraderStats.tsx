import React, { useState } from 'react';
import { Award, TrendingUp, Target, Users, Calendar, AlertTriangle, History, Clock } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { TraderInfo, TraderStats as TraderStatsType, LeadPosition } from '../types';

interface TraderStatsProps {
  trader: TraderInfo;
  stats: TraderStatsType | null;
  multiPeriodStats?: {
    stats7d: TraderStatsType | null;
    stats30d: TraderStatsType | null;
    statsAll: TraderStatsType | null;
    validation: {
      isValid: boolean;
      issues: string[];
    };
  };
  history?: any[];
}

const TraderStats: React.FC<TraderStatsProps> = ({ 
  trader, 
  stats, 
  multiPeriodStats,
  history = []
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('all');
  const [showHistory, setShowHistory] = useState(false);

  if (!stats && !multiPeriodStats) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500">暂无统计数据</p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  // 根据选择的时间段获取对应的统计数据
  const getCurrentStats = () => {
    if (!multiPeriodStats) return stats;
    
    switch (selectedPeriod) {
      case '7d':
        return multiPeriodStats.stats7d || stats;
      case '30d':
        return multiPeriodStats.stats30d || stats;
      case 'all':
        return multiPeriodStats.statsAll || stats;
      default:
        return stats;
    }
  };

  const currentStats = getCurrentStats();
  if (!currentStats) return null;

  const formatCurrency = (amount: number, currency: string = 'USDT'): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currency}`;
  };

  const formatPercentage = (value: number, decimals: number = 2, showSign: boolean = true): string => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  };

  const totalPnl = parseFloat(currentStats.curCopyTraderPnl || '0');
  const investAmt = parseFloat(currentStats.investAmt || '0');
  const winRatio = parseFloat(currentStats.winRatio || '0');
  const profitDays = parseInt(currentStats.profitDays || '0');
  const lossDays = parseInt(currentStats.lossDays || '0');
  const totalDays = profitDays + lossDays;
  
  // 计算收益率：如果有投资金额，用总收益/投资金额计算
  const pnlRatio = investAmt > 0 ? (totalPnl / investAmt) * 100 : 0;

  const statItems = [
    {
      label: '总收益率',
      value: formatPercentage(pnlRatio),
      icon: TrendingUp,
      color: pnlRatio >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: pnlRatio >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      label: '胜率',
      value: formatPercentage(winRatio * 100, 1, false),
      icon: Target,
      color: winRatio >= 0.6 ? 'text-success-600' : winRatio >= 0.4 ? 'text-yellow-600' : 'text-danger-600',
      bgColor: winRatio >= 0.6 ? 'bg-success-50' : winRatio >= 0.4 ? 'bg-yellow-50' : 'bg-danger-50',
    },
    {
      label: '总收益',
      value: formatCurrency(totalPnl, currentStats.ccy || 'USDT'),
      icon: Award,
      color: totalPnl >= 0 ? 'text-success-600' : 'text-danger-600',
      bgColor: totalPnl >= 0 ? 'bg-success-50' : 'bg-danger-50',
    },
    {
      label: '投资金额',
      value: formatCurrency(investAmt, currentStats.ccy || 'USDT'),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const periodOptions = [
    { key: '7d', label: '7天', available: !!multiPeriodStats?.stats7d },
    { key: '30d', label: '30天', available: !!multiPeriodStats?.stats30d },
    { key: 'all', label: '全部', available: !!multiPeriodStats?.statsAll }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-600" />
                交易员统计
              </Card.Title>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-semibold text-gray-900">
                  {currentStats.nickName || trader.uniqueCode}
                </span>
                <Badge variant="info" size="sm">
                  {currentStats.instType || 'SWAP'}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>交易天数</p>
              <p>盈利 {profitDays} 天 / 亏损 {lossDays} 天</p>
            </div>
          </div>

          {/* 时间维度切换 */}
          {multiPeriodStats && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">时间范围：</span>
              </div>
              <div className="flex gap-2">
                {periodOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedPeriod(option.key as '7d' | '30d' | 'all')}
                    disabled={!option.available}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      selectedPeriod === option.key
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : option.available
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 数据验证警告 */}
          {multiPeriodStats && !multiPeriodStats.validation.isValid && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">数据验证警告</p>
                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                    {multiPeriodStats.validation.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card.Header>

        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${item.bgColor} border border-opacity-20`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {item.label}
                    </p>
                    <p className={`text-xl font-bold ${item.color} font-mono-numbers`}>
                      {item.value}
                    </p>
                  </div>
                  <item.icon className={`w-8 h-8 ${item.color} opacity-80`} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              📊 数据说明
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><strong>总收益率：</strong>基于投资金额计算的收益率</p>
                <p><strong>胜率：</strong>盈利天数占总交易天数的比例</p>
              </div>
              <div>
                <p><strong>总收益：</strong>当前跟单交易员的盈亏金额</p>
                <p><strong>投资金额：</strong>交易员的投资本金</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p>当前显示：{selectedPeriod === '7d' ? '最近7天' : selectedPeriod === '30d' ? '最近30天' : '全部时间'}数据</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* 历史操作记录 */}
      {history && history.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-600" />
                历史操作记录
              </Card.Title>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showHistory ? '收起' : `查看全部 (${history.length})`}
              </button>
            </div>
          </Card.Header>

          <Card.Content>
            {showHistory ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {record.instId || '未知交易对'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.side === 'buy' ? '开多' : record.side === 'sell' ? '开空' : record.side}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {record.sz} {record.instId?.split('-')[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(parseInt(record.cTime || '0')).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  共 {history.length} 条历史操作记录
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  点击上方"查看全部"展开详细记录
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default TraderStats;
