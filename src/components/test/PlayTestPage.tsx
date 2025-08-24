import React from 'react';
import StartPlayButton from '../common/StartPlayButton';

export default function PlayTestPage() {
  const testMovies = [
    { id: 'm1', title: 'John Wick 4' },
    { id: 'm2', title: 'Dune' },
    { id: 'm3', title: 'Spider-Man: No Way Home' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">M2-5 播放授权测试页面</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">测试步骤：</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>点击下方任意"播放"按钮</li>
            <li>观察loading状态和埋点发送</li>
            <li>自动跳转到 <code>/watch/:id</code> 页面</li>
            <li>查看播放数据详情和心跳埋点</li>
            <li>检查API服务器日志中的追踪事件</li>
          </ol>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testMovies.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{movie.title}</h3>
              <div className="text-sm text-gray-400 mb-4">Movie ID: {movie.id}</div>
              
              <div className="space-y-3">
                <StartPlayButton 
                  movieId={movie.id}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center transition-colors"
                />
                
                <button 
                  onClick={() => window.open(`/watch/${movie.id}`, '_blank')}
                  className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  直接打开 Watch 页面
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-300">验收项目：</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-200">✅ 后端接口</h3>
              <ul className="text-sm text-blue-100 space-y-1 ml-4">
                <li>• GET /v1/movies/:id/play 返回正确数据结构</li>
                <li>• TTL、sources、subtitles、overlays 完整</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-200">✅ 前端功能</h3>
              <ul className="text-sm text-blue-100 space-y-1 ml-4">
                <li>• 播放按钮触发 play_start 埋点</li>
                <li>• 预拉取数据并缓存到 React Query</li>
                <li>• 跳转到 /watch/:id 页面</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-200">✅ Watch页面</h3>
              <ul className="text-sm text-blue-100 space-y-1 ml-4">
                <li>• 显示播放数据详情</li>
                <li>• 每30秒发送 play_heartbeat</li>
                <li>• 离开页面发送 play_end</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-200">✅ 缓存机制</h3>
              <ul className="text-sm text-blue-100 space-y-1 ml-4">
                <li>• React Query 缓存5分钟</li>
                <li>• 重复访问不重复请求</li>
                <li>• 错误处理和重试机制</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
