import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Html5HlsAdapter } from './adapters/html5HlsAdapter';
import type { PlayAuth, Subtitle, Overlay } from './types';
import OverlayRenderer from './OverlayRenderer';
import { useIdle } from './hooks/useIdle';
import './PlayerShell.css';

// 简易类名组合函数
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export type PlayerShellProps = {
  data: PlayAuth;
  onProgress?: (sec: number, duration: number) => void;
  /** 是否全宽（突破容器，100vw） */
  fullBleed?: boolean;
  /** 强调色（青绿） */
  accent?: string; // 如 '#21d0c6'
  
  /** 是否显示顶栏（返回、菜单）——默认 false */
  showTopBar?: boolean;
  /** 是否显示"返回"按钮——默认 false */
  showBack?: boolean;
  /** 是否显示"更多"按钮——默认 false */
  showMenu?: boolean;
  
  /** 返回按钮回调 */
  onBack?: () => void;
};

export default function PlayerShell({
  data, onProgress, fullBleed = true, accent = '#21d0c6',
  showTopBar = false,     // ★ 默认隐藏顶栏
  showBack = false,       // ★ 默认不显示"返回"
  showMenu = false,       // ★ 默认不显示"更多"
  onBack
}: PlayerShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const adapterRef = useRef<Html5HlsAdapter>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 播放状态
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBigPlay, setShowBigPlay] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [muted, setMuted] = useState(true); // 初始静音提升autoplay成功率
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  
  // 拖拽状态
  const [drag, setDrag] = useState<number | null>(null);

  // 自动隐藏（移动端除外）
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  }, []);
  
  const { idle, kick } = useIdle({
    delay: 2500,
    disabled: !isPlaying || !!error || isMobile,
    target: containerRef.current
  });

  // 初始化适配器
  useEffect(() => {
    const el = videoRef.current!;
    const adapter = new Html5HlsAdapter();
    adapterRef.current = adapter;
    adapter.mount(el);

    // 绑定事件
    const offLoaded = adapter.on('loaded', () => setReady(true));
    const offTime = adapter.on('timeupdate', ({ currentTime, duration }) => {
      setCurrent(currentTime);
      setDuration(duration || 0);
      onProgress?.(currentTime, duration || 0);
    });
    const offPlaying = adapter.on('playing', () => { 
      setIsPlaying(true); 
      setWaiting(false); 
      setError(null);
      setShowBigPlay(false);
    });
    const offPause = adapter.on('pause', () => setIsPlaying(false));
    const offWaiting = adapter.on('waiting', () => setWaiting(true));
    const offCanPlay = adapter.on('canplay', () => setWaiting(false));
    const offStalled = adapter.on('stalled', () => setWaiting(true));
    const offProgress = adapter.on('progress', ({ bufferedEnd }) => setBufferedEnd(bufferedEnd || 0));
    const offError = adapter.on('error', ({ message }) => { 
      setError(message || '播放错误'); 
      setWaiting(false); 
      setIsPlaying(false);
      setShowBigPlay(true);
    });
    const offAutoplayBlocked = adapter.on('autoplayblocked', () => {
      setIsPlaying(false);
      setShowBigPlay(true);
    });

    // 加载源
    (async () => {
      try {
        await adapter.load(data.sources);
      } catch (e) {
        console.error('Failed to load player:', e);
        setError('加载失败');
        setShowBigPlay(true);
      }
    })();

    return () => {
      offLoaded(); offTime(); offPlaying(); offPause(); offWaiting(); 
      offCanPlay(); offStalled(); offProgress(); offError(); offAutoplayBlocked();
      adapter.destroy();
    };
  }, [data.sources, onProgress]);

  // 进度计算
  const cur = drag ?? current;
  const playedPct = useMemo(() => duration ? Math.max(0, Math.min(100, (cur / duration) * 100)) : 0, [cur, duration]);
  const bufferedPct = useMemo(() => duration ? Math.max(0, Math.min(100, (bufferedEnd / duration) * 100)) : 0, [bufferedEnd, duration]);

  // 格式化时间
  const format = (s: number) => {
    if (!Number.isFinite(s)) return '00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  };

  // 交互处理
  const togglePlay = async () => {
    if (!adapterRef.current) return;
    try {
      if (isPlaying) { 
        await adapterRef.current.pause(); 
        setIsPlaying(false); 
      } else { 
        await adapterRef.current.play(); 
        setIsPlaying(true); 
        setShowBigPlay(false);
        // 首次播放后恢复音量
        if (muted) {
          setMuted(false);
          if (videoRef.current) {
            videoRef.current.muted = false;
          }
        }
      }
    } catch (e) {
      console.error('Play/pause error:', e);
      setShowBigPlay(true);
    }
  };

  const seekBy = (delta: number) => {
    if (!adapterRef.current) return;
    const base = drag ?? current;
    const next = Math.min(Math.max(0, base + delta), duration || base + delta);
    adapterRef.current.seek(next);
    setDrag(null);
    kick(); // 重置idle计时器
  };

  const onRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setDrag(v);
  };

  const onRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!adapterRef.current) return;
    const v = Number(e.target.value);
    adapterRef.current.seek(v);
    setDrag(null);
  };

  const toggleUI = () => kick();

  const enterPiP = async () => {
    const vid = videoRef.current;
    if (vid && 'requestPictureInPicture' in document) {
      try { 
        await (vid as any).requestPictureInPicture(); 
      } catch (e) {
        console.log('PiP not supported or failed:', e);
      }
    }
  };

  const showUI = !idle || !isPlaying || isMobile;

  return (
    <div
      ref={containerRef}
      className={cx(
        'ezp-root', 
        fullBleed && 'ezp-fullbleed', 
        !showUI && 'is-idle',
        waiting && 'is-loading',
        !!error && 'is-error'
      )}
      style={{ ['--ezp-accent' as any]: accent }}
      onClick={toggleUI}
      tabIndex={0}
      aria-label="Video player"
    >
      {/* 视频容器 */}
      <div className="ezp-videoMount">
        <video
          ref={videoRef}
          className="ezp-video"
          playsInline
          crossOrigin="anonymous"
          muted={muted}
        />

        {/* Loading状态 */}
        {waiting && !error && (
          <div className="ezp-loading" aria-live="polite" aria-label="Loading">
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="ezp-error" role="alert">
            <div className="ezp-error-icon">⚠️</div>
            <div className="ezp-error-message">{error}</div>
            <button
              className="ezp-error-button"
              onClick={() => {
                setError(null);
                setWaiting(true);
                adapterRef.current?.load(data.sources).then(() => {
                  adapterRef.current?.play();
                }).catch(e => {
                  setError(e.message || '重试失败');
                  setWaiting(false);
                });
              }}
            >
              重试
            </button>
          </div>
        )}

        {/* Overlays */}
        <OverlayRenderer 
          overlays={data.overlays || []} 
          currentTime={cur} 
        />
      </div>

      {/* 顶部操作栏 —— 受 showTopBar / showBack / showMenu 控制 */}
      {showUI && showTopBar && (
        <div className="ezp-topbar">
          {showBack && onBack && (
            <button className="ezp-ico" aria-label="Back" onClick={onBack}>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M15.5 19l-7-7 7-7"/>
              </svg>
            </button>
          )}

          {showMenu && (
            <button className="ezp-ico" aria-label="More">
              <svg viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 居中三键：后退10s / 播放 / 前进10s */}
      {showUI && !error && (
        <div className="ezp-center">
          <button className="ezp-ghost" aria-label="Back 10s" onClick={() => seekBy(-10)}>
            <svg viewBox="0 0 48 48">
              <path fill="currentColor" d="M24 9v6l-6-6 6-6v6zM11 24a13 13 0 1 0 13-13v4a9 9 0 1 1-9 9h-4z"/>
            </svg>
          </button>
          <button className="ezp-circle" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlay}>
            {isPlaying ? (
              <svg viewBox="0 0 48 48">
                <rect x="14" y="12" width="8" height="24" rx="2" fill="currentColor"/>
                <rect x="26" y="12" width="8" height="24" rx="2" fill="currentColor"/>
              </svg>
            ) : (
              <svg viewBox="0 0 48 48">
                <polygon points="18,12 36,24 18,36" fill="currentColor"/>
              </svg>
            )}
          </button>
          <button className="ezp-ghost" aria-label="Forward 10s" onClick={() => seekBy(10)}>
            <svg viewBox="0 0 48 48" style={{transform:'scaleX(-1)'}}>
              <path fill="currentColor" d="M24 9v6l-6-6 6-6v6zM11 24a13 13 0 1 0 13-13v4a9 9 0 1 1-9 9h-4z"/>
            </svg>
          </button>
        </div>
      )}

      {/* 底部信息行：时间 + 画中画 */}
      {showUI && !error && (
        <div className="ezp-bottombar">
          <div className="ezp-time">{format(cur)} / {format(duration || cur)}</div>
          <div className="ezp-actions">
            <button className="ezp-ico" aria-label="Picture in Picture" onClick={enterPiP}>
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 7H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h6v-2H5V9h14v7h2V9a2 2 0 0 0-2-2zm-2 6h-6a2 2 0 0 0-2 2v4h8a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 进度条（细线 + 青绿） */}
      {showUI && !error && ready && (
        <div className="ezp-progress" aria-label="Seek bar">
          <div className="ezp-buffer" style={{ width: `${bufferedPct}%` }} />
          <input
            className="ezp-range"
            type="range"
            min={0}
            max={Math.max(1, Math.floor(duration || 1))}
            value={Math.floor(cur)}
            onInput={onRangeInput}
            onChange={onRangeChange}
            style={{ ['--ezp-fill' as any]: `${playedPct}%` }}
          />
        </div>
      )}

      {/* 自动播放失败或暂停时的中央大按钮 */}
      {showBigPlay && !waiting && !error && (
        <button className="ezp-bigplay" onClick={togglePlay} aria-label="Play">
          <svg viewBox="0 0 48 48" className="ezp-big-ico">
            <polygon points="18,12 36,24 18,36"/>
          </svg>
        </button>
      )}
    </div>
  );
}