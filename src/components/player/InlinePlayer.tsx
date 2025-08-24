import React from 'react';
import { useMoviePlay } from '../../hooks/useMovies';
import PlayerShell from '../../player/PlayerShell';
import { ErrorFallback } from '../common/ErrorBoundary';
import Loading from '../common/Loading';

interface InlinePlayerProps {
  movieId: string;
}

// 内嵌播放器组件 - 用于详情页内嵌播放
export function InlinePlayer({ movieId }: InlinePlayerProps) {
  const { data, isLoading, error, refetch } = useMoviePlay(movieId);

  if (isLoading) {
    return (
      <div className="ezp-root" style={{ aspectRatio: '16/9', background: '#000' }}>
        <Loading size="large" message="กำลังโหลดเนื้อหา..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ezp-root" style={{ aspectRatio: '16/9', background: '#000' }}>
        <ErrorFallback 
          message="ไม่สามารถเล่นได้ กรุณาลองใหม่อีกครั้ง"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="ezp-root">
      <PlayerShell data={data} />
    </div>
  );
}

export default InlinePlayer;
