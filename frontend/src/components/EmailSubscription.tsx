import React, { useState } from 'react';
import { Mail, Bell, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { apiClient } from '../utils/api';
import { isValidEmail } from '../utils/helpers';
import { TraderInfo, AlertType } from '../types';

interface EmailSubscriptionProps {
  trader: TraderInfo;
  onSubscriptionChange?: () => void;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({
  trader,
  onSubscriptionChange,
}) => {
  const [email, setEmail] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<AlertType[]>(['new_position', 'close_position']);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [error, setError] = useState('');

  const alertOptions: { type: AlertType; label: string; description: string }[] = [
    {
      type: 'new_position',
      label: '新开仓通知',
      description: '当交易员开启新仓位时发送邮件',
    },
    {
      type: 'close_position',
      label: '平仓通知',
      description: '当交易员平仓时发送邮件',
    },
    {
      type: 'profit_loss',
      label: '盈亏变化通知',
      description: '当盈亏发生重大变化时发送邮件',
    },
  ];

  const handleAlertToggle = (alertType: AlertType) => {
    setSelectedAlerts(prev => {
      if (prev.includes(alertType)) {
        return prev.filter(type => type !== alertType);
      } else {
        return [...prev, alertType];
      }
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (selectedAlerts.length === 0) {
      setError('请至少选择一种通知类型');
      return;
    }

    setError('');
    setIsSubscribing(true);

    try {
      await apiClient.subscribe(email, trader.uniqueCode, selectedAlerts);
      
      toast.success('订阅成功！您将收到该交易员的通知邮件');
      onSubscriptionChange?.();
      
      // 清空表单
      setEmail('');
      setSelectedAlerts(['new_position', 'close_position']);
    } catch (error) {
      const message = error instanceof Error ? error.message : '订阅失败，请重试';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email.trim()) {
      setError('请输入邮箱地址');
      return;
    }

    if (!isValidEmail(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    setError('');
    setIsUnsubscribing(true);

    try {
      await apiClient.unsubscribe(email, trader.uniqueCode);
      
      toast.success('取消订阅成功！');
      onSubscriptionChange?.();
      
      // 清空表单
      setEmail('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消订阅失败，请重试';
      setError(message);
      toast.error(message);
    } finally {
      setIsUnsubscribing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div>
        <form onSubmit={handleSubscribe} className="space-y-6">
          <Input
            label="邮箱地址"
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={handleInputChange}
            error={error}
            helperText="我们将向此邮箱发送通知"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              通知类型
            </label>
            <div className="space-y-3">
              {alertOptions.map((option) => (
                <div
                  key={option.type}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAlerts.includes(option.type)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAlertToggle(option.type)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedAlerts.includes(option.type)
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedAlerts.includes(option.type) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Bell className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isSubscribing}
              disabled={!email.trim() || selectedAlerts.length === 0 || isSubscribing}
              className="flex-1"
            >
              {isSubscribing ? '订阅中...' : '订阅通知'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              loading={isUnsubscribing}
              disabled={!email.trim() || isUnsubscribing}
              onClick={handleUnsubscribe}
            >
              取消订阅
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">
            📧 订阅说明
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 订阅后将实时接收该交易员的带单通知</li>
            <li>• 邮件发送频率有限制，避免过度打扰</li>
            <li>• 可随时使用相同邮箱取消订阅</li>
            <li>• 请确保邮箱地址正确，以免错过重要通知</li>
          </ul>
        </div>
    </div>
  );
};

export default EmailSubscription;
