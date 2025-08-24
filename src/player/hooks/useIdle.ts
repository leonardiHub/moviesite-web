import { useEffect, useRef, useState, useCallback } from 'react';

type UseIdleOptions = {
  delay?: number;          // 多少毫秒无操作视为 idle
  disabled?: boolean;      // 暂停/拖拽/错误时禁用自动隐藏
  target?: HTMLElement | null; // 监听的容器（默认 document）
};

export function useIdle({ delay = 2500, disabled = false, target }: UseIdleOptions) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clear = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const kick = useCallback(() => {
    if (disabled) return setIdle(false);
    setIdle(false);
    clear();
    timerRef.current = window.setTimeout(() => {
      if (!disabled) setIdle(true);
    }, delay);
  }, [delay, disabled]);

  useEffect(() => {
    const el: any = target ?? document;
    const onMove = () => kick();
    const onKey = (e: KeyboardEvent) => {
      // 仅在与播放器相关按键时唤醒
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'f', 'm'].includes(e.key.toLowerCase())) kick();
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchstart', onMove, { passive: true });
    el.addEventListener('keydown', onKey);
    kick();
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('touchstart', onMove);
      el.removeEventListener('keydown', onKey);
      clear();
    };
  }, [kick, target]);

  useEffect(() => {
    if (disabled) setIdle(false);
  }, [disabled]);

  return { idle, kick };
}
