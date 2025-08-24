import Hls from 'hls.js';
import { createEmitter } from '../utils/emitter';
import type { PlayerAdapter, PlayerEventMap, PlaySource } from '../types';

export class Html5HlsAdapter implements PlayerAdapter {
  private video?: HTMLVideoElement;
  private hls?: Hls;
  private emitter = createEmitter<PlayerEventMap>();
  private currentSources: PlaySource[] = [];
  private loaded = false;

  mount(video: HTMLVideoElement) {
    this.video = video;
    
    // ✅ 移动端 + 桌面都需要的autoplay友好属性
    video.setAttribute('playsinline', 'true');
    (video as any).playsInline = true;
    video.muted = true;                 // 静音以提升自动播放成功率
    video.autoplay = true;              // 允许浏览器尝试自动播放
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';
    
    // 基础事件桥接
    video.addEventListener('timeupdate', () => {
      this.emitter.emit('timeupdate', { currentTime: video.currentTime, duration: video.duration || 0 });
    });
    video.addEventListener('loadedmetadata', () => {
      this.emitter.emit('loaded', undefined);
    });
    
    // 新增：播放状态事件
    video.addEventListener('playing', () => this.emitter.emit('playing', undefined));
    video.addEventListener('pause', () => this.emitter.emit('pause', undefined));
    video.addEventListener('waiting', () => this.emitter.emit('waiting', undefined));
    
    // ✅ 在canplay后尝试自动播放，失败则通知外层显示大按钮
    video.addEventListener('canplay', () => {
      this.emitter.emit('canplay', undefined);
      this.tryAutoplay();
    });
    
    video.addEventListener('stalled', () => this.emitter.emit('stalled', undefined));
    
    // 新增：缓冲进度
    video.addEventListener('progress', () => {
      try {
        const { duration, buffered } = video;
        const end = buffered.length ? buffered.end(buffered.length - 1) : 0;
        this.emitter.emit('progress', { bufferedEnd: end, duration: duration || 0 });
      } catch {}
    });
    
    // 新增：增强错误处理
    video.addEventListener('error', () => {
      const err = (video.error && video.error.message) || 'MEDIA_ERR';
      this.emitter.emit('error', { message: err });
    });
  }

  async load(sources: PlaySource[]) {
    this.currentSources = sources;
    if (!this.video) throw new Error('Adapter not mounted');

    const hlsSource = sources.find(s => s.type === 'hls');
    const mp4Source = sources.find(s => s.type === 'mp4');

    // 清理旧实例
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    this.loaded = false;

    // iOS Safari 原生 HLS 或浏览器不支持 MSE 的情况
    if (hlsSource && (this.canNativePlayHls(this.video) || !Hls.isSupported())) {
      this.video.src = hlsSource.url;
      await this.video.load();
      this.loaded = true;
      return;
    }

    // Hls.js 路径
    if (hlsSource && Hls.isSupported()) {
      const hls = new Hls({
        // 这里可以按需加参数（ABR、低延迟等）
        autoStartLoad: true,
      });
      this.hls = hls;
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = data.level as number;
        const details = hls.levels[level];
        const id = `level-${level}`;
        this.emitter.emit('levelSwitched', { id, label: details?.name || `${Math.round(details?.height || 0)}p` });
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        // 非致命错误可忽略
        if (data.fatal) {
          // 尝试降级到 MP4
          try { 
            hls.destroy(); 
            this.hls = undefined;
            const mp4Source = this.currentSources.find(s => s.type === 'mp4');
            if (mp4Source && this.video) {
              console.warn('HLS failed, fallback to MP4:', mp4Source.url);
              this.video.src = mp4Source.url;
              this.video.play().catch(() => {});
            }
          } catch {}
          this.emitter.emit('error', { message: data.details || 'HLS_FATAL', detail: data });
        }
      });
      hls.attachMedia(this.video!);
      hls.loadSource(hlsSource.url);
      this.loaded = true;
      return;
    }

    // 最后回退：MP4
    if (mp4Source) {
      this.video.src = mp4Source.url;
      await this.video.load();
      this.loaded = true;
      return;
    }

    throw new Error('No playable source');
  }

  play() {
    if (!this.video) throw new Error('Adapter not mounted');
    return this.video.play();
  }

  pause() {
    if (this.video) this.video.pause();
  }

  seek(sec: number) {
    if (!this.video) return;
    this.video.currentTime = Math.max(0, sec);
  }

  setVolume(vol: number) {
    if (!this.video) return;
    this.video.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted: boolean) {
    if (!this.video) return;
    this.video.muted = muted;
  }

  setQuality(qualityId: string | 'auto') {
    if (!this.hls) return;               // 仅 HLS 支持自定义清晰度
    if (qualityId === 'auto') {
      this.hls.currentLevel = -1;        // Hls.js 自动
      return;
    }
    const m = /^level-(\d+)$/.exec(qualityId);
    if (m) this.hls.currentLevel = parseInt(m[1], 10);
  }

  getQualities() {
    if (this.hls) {
      const levels = this.hls.levels || [];
      const items = levels.map((lv, i) => ({
        id: `level-${i}`,
        label: lv.name || `${Math.round(lv.height || 0)}p`,
      }));
      return [{ id: 'auto', label: 'Auto' }, ...items];
    }
    // mp4 情况：返回空（或返回 sources 中的 label）
    const mp4s = this.currentSources.filter(s => s.type === 'mp4');
    if (mp4s.length) {
      return mp4s.map(s => ({ id: s.id, label: s.label || 'MP4' }));
    }
    return [];
  }

  on<K extends keyof PlayerEventMap>(ev: K, cb: (data: PlayerEventMap[K]) => void) {
    return this.emitter.on(ev, cb);
  }

  // ✅ 尝试自动播放，失败则通知外层显示大按钮
  private async tryAutoplay() {
    if (!this.video) return;
    try {
      await this.video.play();
      this.emitter.emit('playing', undefined);
    } catch (err) {
      console.log('Autoplay blocked, showing big play button');
      this.emitter.emit('autoplayblocked', undefined); // ➜ 关键：告诉外壳需要展示「点击播放」
    }
  }

  destroy() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
    this.emitter.clear();
    if (this.video) {
      this.video.removeAttribute('src');
      try { this.video.load(); } catch {}
    }
  }

  private canNativePlayHls(video: HTMLVideoElement) {
    // iOS Safari / 部分浏览器对 application/vnd.apple.mpegurl 的原生支持
    return video.canPlayType('application/vnd.apple.mpegurl') === 'probably' ||
           video.canPlayType('application/x-mpegURL') === 'probably';
  }
}
