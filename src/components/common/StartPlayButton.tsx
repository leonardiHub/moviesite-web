import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchMoviePlay } from '../../hooks/useMovies';
import { Track } from '../../lib/track';
import { useState, useTransition } from 'react';

interface StartPlayButtonProps {
  movieId: string;
  className?: string;
  children?: React.ReactNode;
}

export default function StartPlayButton({ movieId, className, children }: StartPlayButtonProps) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onClick = async () => {
    try {
      setLoading(true);
      Track.playStart(movieId);             // 埋点：开始
      await prefetchMoviePlay(qc, movieId); // 预拉取授权
      startTransition(() => {
        nav(`/watch/${movieId}`);
      });
    } catch (e) {
      console.error('prefetch play failed', e);
      alert('ขออภัย ไม่สามารถเริ่มเล่นได้ ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className={className || 'bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold text-white flex items-center transition-colors'} 
      onClick={onClick} 
      disabled={loading || isPending}
    >
      {loading || isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          กำลังเตรียม...
        </>
      ) : (
        children || (
          <>
            <span className="mr-2">▶</span>
            ดูหนัง
          </>
        )
      )}
    </button>
  );
}
