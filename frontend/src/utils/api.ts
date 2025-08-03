import axios from 'axios';
import { ApiResponse, AnalysisResult, LeadPosition, TraderStats, PositionRecord, EmailSubscription } from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API 方法
export const apiClient = {
  // 获取交易员当前带单
  getCurrentPositions: async (uniqueCode: string): Promise<LeadPosition[]> => {
    const response = await api.get<ApiResponse<LeadPosition[]>>(`/trader/${uniqueCode}/positions`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get current positions');
    }

    return response.data.data!;
  },

  // 添加交易员到监控列表
  addTrader: async (uniqueCode: string, nickName?: string) => {
    const response = await api.post<ApiResponse>('/trader/add', {
      uniqueCode,
      nickName,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to add trader');
    }

    return response.data.data!;
  },

  // 订阅邮件通知
  subscribe: async (
    email: string,
    uniqueCode: string,
    alertTypes: string[]
  ): Promise<EmailSubscription> => {
    const response = await api.post<ApiResponse<EmailSubscription>>('/subscribe', {
      email,
      uniqueCode,
      alertTypes,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to subscribe');
    }
    
    return response.data.data!;
  },

  // 取消订阅
  unsubscribe: async (email: string, uniqueCode: string): Promise<void> => {
    const response = await api.delete<ApiResponse>('/unsubscribe', {
      data: { email, uniqueCode },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to unsubscribe');
    }
  },

  // 获取用户订阅
  getUserSubscriptions: async (email: string): Promise<EmailSubscription[]> => {
    const response = await api.get<ApiResponse<EmailSubscription[]>>(`/subscriptions/${email}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get user subscriptions');
    }
    
    return response.data.data!;
  },

  // 测试邮件发送
  testEmail: async (email: string): Promise<void> => {
    const response = await api.post<ApiResponse>('/test-email', { email });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to send test email');
    }
  },

  // 健康检查
  healthCheck: async () => {
    const response = await api.get<ApiResponse>('/health');
    return response.data;
  },

  // 获取API信息
  getApiInfo: async () => {
    const response = await api.get<ApiResponse>('/info');
    return response.data;
  },
};

export default apiClient;
