import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化数字为货币格式
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'USDT',
  decimals: number = 2
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0.00';
  
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return `${formatted} ${currency}`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(
  value: number | string,
  decimals: number = 2,
  showSign: boolean = true,
  isDecimal: boolean = true
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0.00%';

  // 如果是小数形式（如0.0011），需要乘以100转换为百分比
  const percentage = isDecimal ? num * 100 : num;

  const sign = showSign && percentage > 0 ? '+' : '';
  const formatted = percentage.toFixed(decimals);

  return `${sign}${formatted}%`;
}

/**
 * 格式化大数字（K, M, B）
 */
export function formatLargeNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (abs >= 1e9) {
    return `${sign}${(abs / 1e9).toFixed(1)}B`;
  } else if (abs >= 1e6) {
    return `${sign}${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${(abs / 1e3).toFixed(1)}K`;
  }
  
  return `${sign}${abs.toFixed(0)}`;
}

/**
 * 格式化时间
 */
export function formatTime(timestamp: string | number | Date): string {
  try {
    // 处理空值或无效值
    if (!timestamp || timestamp === '' || timestamp === '0' || timestamp === 0) {
      return '--';
    }

    // 如果是字符串，先转换为数字
    let timeValue: number;
    if (typeof timestamp === 'string') {
      timeValue = parseInt(timestamp, 10);
    } else if (typeof timestamp === 'number') {
      timeValue = timestamp;
    } else {
      timeValue = new Date(timestamp).getTime();
    }

    // 检查是否为有效的时间戳
    if (isNaN(timeValue) || timeValue <= 0) {
      return '--';
    }

    const date = new Date(timeValue);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '--';
    }

    return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN });
  } catch (error) {
    console.warn('Invalid time value:', timestamp, error);
    return '--';
  }
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(timestamp: string | number | Date): string {
  try {
    // 处理空值或无效值
    if (!timestamp || timestamp === '' || timestamp === '0' || timestamp === 0) {
      return '--';
    }
    
    const date = new Date(timestamp);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '--';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
  } catch (error) {
    console.warn('Invalid time value:', timestamp, error);
    return '--';
  }
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证OKX交易员链接
 */
export function isValidTraderUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('okx.com') &&
      (urlObj.pathname.includes('/trader/') ||
       urlObj.pathname.includes('/account/') ||
       urlObj.pathname.includes('/copy-trading/'))
    );
  } catch {
    return false;
  }
}

/**
 * 从URL中提取uniqueCode
 */
export function extractUniqueCodeFromUrl(url: string): string | null {
  try {
    const patterns = [
      /\/trader\/([A-Za-z0-9]{16})/,     // 旧版格式: /trader/uniqueCode
      /\/account\/([A-Za-z0-9]{16})/,    // 新版格式: /account/uniqueCode
      /uniqueCode=([A-Za-z0-9]{16})/,    // 查询参数格式
      /\/([A-Za-z0-9]{16})(?:\?|$)/      // 末尾格式，支持查询参数
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 获取持仓方向的中文名称
 * 根据OKX API文档：
 * - long：开平仓模式开多
 * - short：开平仓模式开空
 * - net：买卖模式（subPos为正代表开多，subPos为负代表开空）
 */
export function getPositionSideName(side: string, subPos?: string): string {
  switch (side.toLowerCase()) {
    case 'long':
      return '做多';
    case 'short':
      return '做空';
    case 'net':
      if (subPos) {
        const pos = parseFloat(subPos);
        return pos > 0 ? '做多' : pos < 0 ? '做空' : '净持仓';
      }
      return '净持仓';
    default:
      return side;
  }
}

/**
 * 获取持仓方向的颜色类
 */
export function getPositionSideColor(side: string): string {
  switch (side.toLowerCase()) {
    case 'long':
      return 'text-success-600 bg-success-50';
    case 'short':
      return 'text-danger-600 bg-danger-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * 获取盈亏的颜色类
 */
export function getPnlColor(pnl: number | string): string {
  const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
  
  if (isNaN(num) || num === 0) return 'text-gray-600';
  
  return num > 0 ? 'text-success-600' : 'text-danger-600';
}

/**
 * 获取盈亏的图标
 */
export function getPnlIcon(pnl: number | string): string {
  const num = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
  
  if (isNaN(num) || num === 0) return '➖';
  
  return num > 0 ? '📈' : '📉';
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch {
      return false;
    }
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}
