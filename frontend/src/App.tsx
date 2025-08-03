import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import TraderMonitor from './components/TraderMonitor';
import TailwindTest from './components/TailwindTest';

const HomePage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-gradient">OKX 交易员带单监控</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            实时监控 OKX 交易员当前带单数据，支持邮件订阅通知
          </p>
        </div>

        {/* Main Content */}
        <TraderMonitor />

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              功能特性
            </h2>
            <p className="text-lg text-gray-600">
              简洁高效的交易员监控工具
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                实时监控
              </h3>
              <p className="text-gray-600">
                实时获取交易员当前带单数据
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                邮件通知
              </h3>
              <p className="text-gray-600">
                及时接收带单变动通知
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔑</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                无需密钥
              </h3>
              <p className="text-gray-600">
                使用公共API，无需配置密钥
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/test" element={<TailwindTest />} />
    </Routes>
  );
};

export default App;
