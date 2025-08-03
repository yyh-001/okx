import React from 'react';
import { Heart, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              关于项目
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              OKX 交易员监控系统是一个开源项目，帮助用户实时监控交易员的带单情况，
              支持邮件订阅通知，让您不错过任何重要的交易机会。
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              核心功能
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 实时获取交易员带单数据</li>
              <li>• 邮件订阅通知系统</li>
              <li>• 交易员统计分析</li>
              <li>• 历史数据查询</li>
              <li>• 响应式界面设计</li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              相关链接
            </h3>
            <div className="space-y-2">
              <a
                href="https://www.okx.com/cn/copy-trading"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                OKX 跟单交易
              </a>
              <a
                href="https://github.com/your-username/okx-trader-monitor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub 仓库
              </a>
              <a
                href="mailto:your-email@example.com"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Mail className="w-4 h-4" />
                联系我们
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              Made with
              <Heart className="w-4 h-4 text-red-500" />
              by developers
            </div>
            
            <div className="text-sm text-gray-500">
              © 2024 OKX Trader Monitor. All rights reserved.
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>免责声明：</strong>
            本系统仅用于数据展示和分析，不构成投资建议。
            交易有风险，投资需谨慎。请在充分了解风险的基础上进行投资决策。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
