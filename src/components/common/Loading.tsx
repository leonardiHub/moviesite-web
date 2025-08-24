import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'medium', message = 'กำลังโหลด...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-red-600`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

// Skeleton组件用于更好的加载体验
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`}></div>
);

// 电影卡片骨架屏
export const MovieCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="w-full aspect-[2/3]" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

// 首页轮播骨架屏
export const HeroSkeleton: React.FC = () => (
  <div className="relative h-[600px] w-full">
    <Skeleton className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <div className="flex space-x-4 justify-center">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  </div>
);

export default Loading;
