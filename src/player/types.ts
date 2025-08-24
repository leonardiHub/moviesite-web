// 播放授权契约（与 /v1/movies/:id/play 对齐）
export type PlaySource = {
  id: string;
  type: 'hls' | 'mp4' | 'dash';        // M3 先实现 hls/mp4，dash 预留
  label?: string;                      // 1080p/720p/Auto
  url: string;
  drm?: {
    widevineLicenseUrl?: string;
    fairplayLicenseUrl?: string;
    certificateUrl?: string;
    skd?: string;                      // FairPlay skd://
  };
};

export type Subtitle = {
  lang: string;                        // "th" | "en" | "zh"
  label?: string;                      // "ไทย" | "English" ...
  url: string;
};

export type Overlay = {
  type: 'image' | 'html' | 'sponsor';
  placement: 'tl' | 'tr' | 'bl' | 'br' | 'center';
  start?: number;                      // 秒（可选）
  end?: number;                        // 秒（可选）
  url?: string;                        // 图片地址或跳转地址
  width?: number;
  height?: number;
  html?: string;                       // 富文本（可选）
  clickUrl?: string;                   // 点击跳转（可选）
};

export type PlayAuth = {
  movieId: string;
  ttl: number;
  sources: PlaySource[];
  subtitles?: Subtitle[];
  overlays?: Overlay[];
  analytics?: { heartbeat?: number };
};

// 播放器适配层事件
export type PlayerEventMap = {
  loaded: void;
  timeupdate: { currentTime: number; duration: number };
  playing: void;
  pause: void;
  waiting: void;     // 新增：显示 Loading
  canplay: void;     // 新增：可播放，隐藏 Loading
  stalled: void;     // 新增：网络抖动
  error: { message: string; detail?: any };
  progress: { bufferedEnd: number; duration: number }; // 新增：缓冲进度
  levelSwitched: { id: string; label?: string };
  autoplayblocked: void; // 新增：自动播放被拦截，需要显示大播放按钮
};

export type Unsubscribe = () => void;

// 统一适配器接口
export interface PlayerAdapter {
  mount: (video: HTMLVideoElement) => void;
  load: (sources: PlaySource[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  seek: (sec: number) => void;
  setVolume: (vol: number) => void;        // 0~1
  setMuted: (muted: boolean) => void;
  setQuality: (qualityId: string | 'auto') => void;
  getQualities: () => { id: string; label: string }[];
  on: <K extends keyof PlayerEventMap>(ev: K, cb: (data: PlayerEventMap[K]) => void) => Unsubscribe;
  destroy: () => void;
}
