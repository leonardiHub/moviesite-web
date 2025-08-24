import React, { useState, useEffect } from 'react';

export default function PlayerDebug() {
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/v1/movies/m1/play');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setApiTest(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'API调用失败');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔧 播放器API调试页面</h1>
      
      <div className="space-y-6">
        {/* API状态 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API连接状态</h2>
          
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <span>正在测试API连接...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900 border border-red-500 rounded p-4">
              <h3 className="font-bold text-red-300">❌ API错误</h3>
              <p className="text-red-200 mt-2">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                重试
              </button>
            </div>
          )}
          
          {apiTest && !loading && !error && (
            <div className="bg-green-900 border border-green-500 rounded p-4">
              <h3 className="font-bold text-green-300">✅ API连接成功</h3>
              <div className="mt-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-green-400">Movie ID:</span> {apiTest.movieId}
                  </div>
                  <div>
                    <span className="text-green-400">TTL:</span> {apiTest.ttl}s
                  </div>
                  <div>
                    <span className="text-green-400">Sources:</span> {apiTest.sources?.length || 0}
                  </div>
                  <div>
                    <span className="text-green-400">Subtitles:</span> {apiTest.subtitles?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* API详细数据 */}
        {apiTest && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📡 API返回数据</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto text-green-300">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        )}

        {/* 服务状态检查 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🖥️ 服务状态</h2>
          <div className="space-y-2 text-sm">
            <div>前端: http://localhost:5173 (当前页面能正常显示)</div>
            <div>后端: http://localhost:4000 (测试中...)</div>
          </div>
        </div>

        {/* 导航 */}
        <div className="bg-blue-900 border border-blue-500 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🧭 测试导航</h2>
          <div className="space-y-3">
            <a 
              href="/watch/m1" 
              className="block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              → 测试WatchPage (/watch/m1)
            </a>
            <a 
              href="/test-play" 
              className="block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
            >
              → 测试PlayTestPage (/test-play)
            </a>
            <a 
              href="/simple-test" 
              className="block bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
            >
              → 最简单测试 (/simple-test)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
