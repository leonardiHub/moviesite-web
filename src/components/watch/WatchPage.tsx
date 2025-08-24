import { useParams, useNavigate } from 'react-router-dom';
import { useMoviePlay } from '../../hooks/useMovies';
import { Track } from '../../lib/track';
import { useEffect, useRef } from 'react';
import PlayerShell from '../../player/PlayerShell';
import { ErrorFallback } from '../common/ErrorBoundary';
import Loading from '../common/Loading';

export default function WatchPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useMoviePlay(id, true);
  const lastPosRef = useRef(0);
  const hbRef = useRef<any>(null);

  // 进入页：发 play_start（防重）
  useEffect(() => {
    if (!id) return;
    Track.playStart(id);
  }, [id]);

  // 心跳调度：基于真实 currentTime
  useEffect(() => {
    if (!id || !data) return;
    const hb = Math.max(10, data.analytics?.heartbeat || 30); // 最少 10s 一次
    hbRef.current = setInterval(() => {
      Track.playHeartbeat(id, lastPosRef.current);
    }, hb * 1000);
    return () => {
      if (hbRef.current) clearInterval(hbRef.current);
      // 补发一次最后心跳 + play_end
      Track.playHeartbeat(id, lastPosRef.current);
      Track.playEnd(id, 'page_leave');
    };
  }, [id, data?.analytics?.heartbeat]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0c12] text-white flex items-center justify-center">
      <Loading size="large" message="กำลังเตรียมสตรีม..." />
    </div>
  );
  
  if (error || !data) return (
    <div className="min-h-screen bg-[#0a0c12] text-white flex items-center justify-center">
      <ErrorFallback 
        message="เริ่มเล่นไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" 
        onRetry={() => window.location.reload()} 
      />
    </div>
  );

  return (
    <div className="watch-page min-h-screen bg-[#0a0c12] text-white">
      <style>{`
        /* 去掉页面容器对播放器的左右 padding，保证 100vw 真全宽 */
        .watch-page,
        .watch-page .ezm-container,
        .watch-page .container,
        .watch-page main {
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          max-width: none !important;
        }
      `}</style>
      
      {/* 极简播放器 - 无顶栏干扰 */}
      <div className="w-full">
        <PlayerShell
          data={data}
          onProgress={(sec) => { lastPosRef.current = sec; }}
          fullBleed={true}                  // ★ 铺满 100vw
          accent="#21d0c6"                  // ★ 主色
          showTopBar={false}                // ★ 不显示顶栏
          showBack={false}                  // ★ 无返回按钮
          showMenu={false}                  // ★ 无菜单按钮
        />
      </div>
      
      {/* 可选：播放器下方的详细信息 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-lg font-semibold mb-4 text-gray-100">播放信息</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <div className="text-gray-400">Movie ID</div>
              <div className="font-mono text-[#21d0c6]">{data.movieId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">Sources</div>
              <div className="text-white">{data.sources.length} available</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">Subtitles</div>
              <div className="text-white">{data.subtitles?.length || 0} languages</div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">Overlays</div>
              <div className="text-white">{data.overlays?.length || 0} sponsors</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div>Heartbeat: {data.analytics?.heartbeat ?? 30}s</div>
              <div>High-end Player UI v2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
