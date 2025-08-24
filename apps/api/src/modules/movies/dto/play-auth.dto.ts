export type SourceType = 'hls' | 'dash' | 'mp4';

export class PlayDRMDto {
  widevine?: { licenseUrl: string; headers?: Record<string, string> };
  fairplay?: { licenseUrl: string; certificateUrl?: string; headers?: Record<string, string> };
  clearkey?: { keys: Array<{ kid: string; k: string }> };
}

export class PlaySourceDto {
  id!: string;
  type!: SourceType;                  // hls|dash|mp4
  label!: string;                     // 1080p、720p 等
  url!: string;                       // 临时授权地址
  drm?: PlayDRMDto;                   // 可选
}

export class SubtitleDto {
  lang!: string;                      // th,en,zh…
  label!: string;                     // ไทย / English
  url!: string;                       // vtt/srt
}

export class OverlayDto {
  type!: 'image' | 'html';
  placement!: 'tl' | 'tr' | 'bl' | 'br';
  start?: number;                     // 秒
  end?: number;
  url?: string;                       // image 时
  html?: string;                      // html 时
  href?: string;                      // 点击跳转
  opacity?: number;                   // 0-1
}

export class PlayAuthResponseDto {
  movieId!: string;
  ttl!: number;                       // 秒
  expiresAt!: string;
  sources!: PlaySourceDto[];
  subtitles?: SubtitleDto[];
  overlays?: OverlayDto[];
  analytics?: { heartbeat: number };  // 心跳秒数（默认 30）
}
