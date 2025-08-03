import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { LeadPosition } from '../types';
import {
  formatCurrency,
  formatPercentage,
  formatTime,
  getPositionSideName,
  getPositionSideColor,
  getPnlColor,
  getPnlIcon,
} from '../utils/helpers';

interface PositionsListProps {
  positions: LeadPosition[];
  loading?: boolean;
}

const PositionsList: React.FC<PositionsListProps> = ({ positions, loading }) => {
  if (loading) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>当前持仓</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            当前持仓
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无持仓</p>
            <p className="text-sm text-gray-400 mt-1">
              该交易员当前没有开仓位置
            </p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  // 计算总体统计
  const totalPnl = positions.reduce((sum, pos) => sum + parseFloat(pos.upl), 0);
  const totalNotional = positions.reduce((sum, pos) => sum + parseFloat(pos.notionalUsd), 0);

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            当前持仓
            <Badge variant="info" size="sm">
              {positions.length} 个
            </Badge>
          </Card.Title>
          <div className="text-right">
            <p className="text-sm text-gray-500">总未实现盈亏</p>
            <p className={`text-lg font-bold font-mono-numbers ${getPnlColor(totalPnl)}`}>
              {getPnlIcon(totalPnl)} {formatCurrency(totalPnl)}
            </p>
          </div>
        </div>
      </Card.Header>

      <Card.Content>
        <div className="space-y-4">
          {positions.map((position) => {
            const pnl = parseFloat(position.upl);
            const pnlRatio = parseFloat(position.uplRatio);
            const leverage = parseFloat(position.lever);
            const notional = parseFloat(position.notionalUsd);

            return (
              <div
                key={position.subPosId || position.posId || `${position.instId}-${position.posSide}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {position.instId}
                    </h4>
                    <Badge
                      variant={position.posSide === 'long' ? 'success' : 'danger'}
                      size="sm"
                    >
                      {position.posSide === 'long' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {getPositionSideName(position.posSide, position.subPos || position.pos)}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {leverage}x
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold font-mono-numbers ${getPnlColor(pnl)}`}>
                      {formatCurrency(pnl)}
                    </p>
                    <p className={`text-sm font-mono-numbers ${getPnlColor(pnlRatio)}`}>
                      {formatPercentage(pnlRatio, 2, true, true)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">持仓数量</p>
                    <p className="font-mono-numbers font-medium">
                      {(position.subPos || position.pos) && !isNaN(parseFloat(position.subPos || position.pos))
                        ? parseFloat(position.subPos || position.pos).toLocaleString()
                        : '数据获取中...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">开仓价格</p>
                    <p className="font-mono-numbers font-medium">
                      {(position.openAvgPx || position.avgPx) && !isNaN(parseFloat(position.openAvgPx || position.avgPx))
                        ? `$${parseFloat(position.openAvgPx || position.avgPx).toLocaleString()}`
                        : '数据获取中...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">标记价格</p>
                    <p className="font-mono-numbers font-medium">
                      {position.markPx && !isNaN(parseFloat(position.markPx))
                        ? `$${parseFloat(position.markPx).toLocaleString()}`
                        : '数据获取中...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">保证金</p>
                    <p className="font-mono-numbers font-medium">
                      {position.margin && !isNaN(parseFloat(position.margin))
                        ? `${parseFloat(position.margin).toLocaleString()} ${position.ccy || 'USDT'}`
                        : '数据获取中...'}
                    </p>
                  </div>
                </div>

                {/* 额外信息行 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">保证金模式</p>
                    <p className="font-medium">
                      <Badge variant={position.mgnMode === 'isolated' ? 'warning' : 'default'} size="sm">
                        {position.mgnMode === 'isolated' ? '逐仓' : position.mgnMode === 'cross' ? '全仓' : position.mgnMode}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">产品类型</p>
                    <p className="font-medium">
                      <Badge variant="default" size="sm">
                        {position.instType === 'SWAP' ? '永续合约' : position.instType === 'SPOT' ? '币币' : position.instType}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">币种</p>
                    <p className="font-medium">{position.ccy || 'USDT'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">交易员代码</p>
                    <p className="font-mono-numbers text-xs">{position.uniqueCode ? position.uniqueCode.slice(-8) : '数据获取中'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      开仓: {position.openTime ? formatTime(position.openTime) : '数据获取中'}
                    </div>
                    {position.uTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        更新: {formatTime(position.uTime)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    仓位ID: {position.subPosId ? position.subPosId.slice(-8) : '数据获取中'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-500">持仓总数</p>
              <p className="text-lg font-bold text-gray-900">
                {positions.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">总名义价值</p>
              <p className="text-lg font-bold text-gray-900 font-mono-numbers">
                {formatCurrency(totalNotional)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">总未实现盈亏</p>
              <p className={`text-lg font-bold font-mono-numbers ${getPnlColor(totalPnl)}`}>
                {formatCurrency(totalPnl)}
              </p>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default PositionsList;
