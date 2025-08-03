import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tailwind CSS 测试页面
        </h1>
        
        {/* 按钮测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">按钮样式测试</h2>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
              Secondary Button
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Success Button
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Danger Button
            </button>
          </div>
        </div>

        {/* 卡片测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">卡片样式测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">卡片标题</h3>
              <p className="text-gray-600">这是一个测试卡片的内容。</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  标签
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">另一个卡片</h3>
              <p className="text-gray-600">这是另一个测试卡片的内容。</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  成功
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">第三个卡片</h3>
              <p className="text-gray-600">这是第三个测试卡片的内容。</p>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  警告
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 表单测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">表单样式测试</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input 
                  type="email" 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="your-email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  交易员链接
                </label>
                <input 
                  type="url" 
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="https://www.okx.com/cn/copy-trading/trader/..."
                />
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                提交
              </button>
            </form>
          </div>
        </div>

        {/* 响应式测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">响应式测试</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div 
                key={item}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center"
              >
                项目 {item}
              </div>
            ))}
          </div>
        </div>

        {/* 动画测试 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">动画测试</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              加载中的内容...
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:scale-105 transition-transform cursor-pointer">
              悬停时放大
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
              加载中...
            </div>
          </div>
        </div>

        {/* 状态指示 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-800 font-medium">
              如果您能看到这些样式，说明 Tailwind CSS 正在正常工作！
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
