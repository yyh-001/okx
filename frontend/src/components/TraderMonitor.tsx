import React, { useState } from 'react';
import { Search, RefreshCw, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import PositionsList from './PositionsList';
import EmailSubscription from './EmailSubscription';
import { apiClient } from '../utils/api';
import { LeadPosition } from '../types';

const TraderMonitor: React.FC = () => {
  const [uniqueCode, setUniqueCode] = useState('');
  const [positions, setPositions] = useState<LeadPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSubscription, setShowSubscription] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uniqueCode.trim()) {
      setError('请输入交易员UniqueCode');
      return;
    }

    if (uniqueCode.length !== 16) {
      setError('UniqueCode应为16位字符');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await apiClient.getCurrentPositions(uniqueCode);
      setPositions(result);
      setShowSubscription(true);
      toast.success('获取带单数据成功！');
    } catch (error) {
      const message = error instanceof Error ? error.message : '获取数据失败，请重试';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!uniqueCode) return;
    
    setIsLoading(true);
    try {
      const result = await apiClient.getCurrentPositions(uniqueCode);
      setPositions(result);
      toast.success('数据已刷新！');
    } catch (error) {
      const message = error instanceof Error ? error.message : '刷新失败';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUniqueCode(e.target.value.toUpperCase());
    if (error) setError('');
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="w-full max-w-2xl mx-auto">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-600" />
            交易员监控
          </Card.Title>
          <p className="text-sm text-gray-600 mt-1">
            输入交易员UniqueCode，获取实时带单数据
          </p>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="交易员UniqueCode"
              placeholder="例如：34ABFF2DBEC9E970"
              value={uniqueCode}
              onChange={handleInputChange}
              error={error}
              helperText="16位交易员唯一标识符，可从OKX交易员链接中获取"
              maxLength={16}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={!uniqueCode.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? '获取中...' : '获取带单数据'}
              </Button>
              
              {positions.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-4"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              📋 使用说明
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 访问 OKX 跟单交易页面，选择想要监控的交易员</li>
              <li>• 从交易员链接中提取16位UniqueCode</li>
              <li>• 例如：https://www.okx.com/zh-hans/copy-trading/account/34ABFF2DBEC9E970</li>
              <li>• 输入UniqueCode：34ABFF2DBEC9E970</li>
            </ul>
          </div>
        </Card.Content>
      </Card>

      {/* Positions Display */}
      {positions.length > 0 && (
        <div className="space-y-6">
          <PositionsList positions={positions} />
          
          {/* Email Subscription */}
          {showSubscription && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  邮件订阅
                </Card.Title>
                <p className="text-sm text-gray-600 mt-1">
                  订阅该交易员的带单变动通知
                </p>
              </Card.Header>
              <Card.Content>
                <EmailSubscription
                  trader={{ uniqueCode, nickName: `交易员 ${uniqueCode}` }}
                  onSubscriptionChange={() => {
                    console.log('Subscription changed');
                  }}
                />
              </Card.Content>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && positions.length === 0 && uniqueCode && (
        <Card className="text-center py-12">
          <Card.Content>
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无带单数据
            </h3>
            <p className="text-gray-600">
              该交易员当前没有持仓，或UniqueCode不正确
            </p>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default TraderMonitor;
