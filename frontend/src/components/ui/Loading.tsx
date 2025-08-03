import React from 'react';
import { cn } from '../../utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className,
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-2 border-current border-t-transparent rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
      {text && (
        <span className="ml-2 text-sm text-gray-600">
          {text}
        </span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  show: boolean;
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  text = '加载中...',
  className,
}) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50',
        className
      )}
    >
      <div className="text-center">
        <Loading size="lg" />
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'bg-gray-200 rounded h-4 mb-2',
            index === lines - 1 && 'w-3/4' // 最后一行稍短
          )}
        />
      ))}
    </div>
  );
};

// 导出组合组件
Loading.Overlay = LoadingOverlay;
Loading.Skeleton = LoadingSkeleton;

export default Loading;
