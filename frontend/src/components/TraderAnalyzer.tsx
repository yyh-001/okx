import React, { useState } from 'react';
import { Link, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import { apiClient } from '../utils/api';
import { isValidTraderUrl } from '../utils/helpers';
import { AnalysisResult } from '../types';

interface TraderAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const TraderAnalyzer: React.FC<TraderAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [traderUrl, setTraderUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!traderUrl.trim()) {
      setError('请输入交易员链接');
      return;
    }

    if (!isValidTraderUrl(traderUrl)) {
      setError('请输入有效的OKX交易员链接');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const result = await apiClient.analyzeTrader(traderUrl);
      
      toast.success('交易员分析完成！');
      onAnalysisComplete(result);
      
      // 清空输入框
      setTraderUrl('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '分析失败，请重试';
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTraderUrl(e.target.value);
    if (error) setError('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-600" />
          交易员分析
        </Card.Title>
        <p className="text-sm text-gray-600 mt-1">
          输入OKX交易员链接，获取实时带单数据和统计信息
        </p>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="交易员链接"
            placeholder="https://www.okx.com/zh-hans/copy-trading/account/..."
            value={traderUrl}
            onChange={handleInputChange}
            error={error}
            helperText="支持OKX交易员详情页面链接（新版和旧版格式）"
            leftIcon={<Link className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isAnalyzing}
            disabled={!traderUrl.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? '分析中...' : '开始分析'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            📋 使用说明
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 访问 OKX 跟单交易页面，选择想要监控的交易员</li>
            <li>• 复制交易员详情页面的链接</li>
            <li>• 粘贴到上方输入框，点击"开始分析"</li>
            <li>• 系统将自动获取交易员的实时数据和历史表现</li>
          </ul>
        </div>
      </Card.Content>
    </Card>
  );
};

export default TraderAnalyzer;
