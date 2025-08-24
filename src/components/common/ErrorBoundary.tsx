import React from 'react';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  message = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 
  onRetry 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 mb-4 text-red-500">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
    <p className="text-gray-600 mb-6 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        ลองใหม่
      </button>
    )}
  </div>
);

// 网络错误专用组件
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorFallback
    message="ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต"
    onRetry={onRetry}
  />
);

// 数据为空的状态
export const EmptyState: React.FC<{ message?: string; icon?: string }> = ({ 
  message = 'ไม่พบข้อมูล', 
  icon = '📭' 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <p className="text-gray-600">{message}</p>
  </div>
);
