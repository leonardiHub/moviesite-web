import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function SimpleWatchPage() {
  const { id = 'm1' } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:4000/v1/movies/${id}/play`);
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div>กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <div className="text-xl mb-2">เกิดข้อผิดพลาด</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>ไม่มีข้อมูล</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🎬 Simple Watch Page - {id}</h1>
        
        {/* 返回按钮 */}
        <button 
          onClick={() => window.history.back()}
          className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          ← กลับ
        </button>

        {/* 播放器占位区域 */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">视频播放区域</h2>
          <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎥</div>
              <div>播放器将在这里显示</div>
              <div className="text-sm text-gray-400 mt-2">Movie ID: {data.movieId}</div>
            </div>
          </div>
        </div>

        {/* 数据展示 */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 播放数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Movie ID</div>
              <div className="font-mono">{data.movieId}</div>
            </div>
            <div>
              <div className="text-gray-400">TTL</div>
              <div>{data.ttl}s</div>
            </div>
            <div>
              <div className="text-gray-400">Sources</div>
              <div>{data.sources?.length || 0}</div>
            </div>
            <div>
              <div className="text-gray-400">Heartbeat</div>
              <div>{data.analytics?.heartbeat || 'N/A'}s</div>
            </div>
          </div>

          {/* 源信息 */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">📹 视频源</h3>
            <div className="space-y-2">
              {data.sources?.map((source: any, i: number) => (
                <div key={i} className="bg-gray-800 p-3 rounded">
                  <div className="font-mono text-sm">
                    <span className="text-green-400">{source.type.toUpperCase()}</span> - 
                    <span className="text-blue-400"> {source.label}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{source.url}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 原始数据 */}
          <details className="mt-6">
            <summary className="cursor-pointer font-semibold">📄 原始JSON数据</summary>
            <pre className="mt-2 bg-gray-800 p-4 rounded text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
