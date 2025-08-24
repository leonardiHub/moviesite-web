import { track, TrackPayload } from '../../packages/sdk/src';

const SID_KEY = 'ez_sid';

function getSid(): string {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 12));
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

// 针对play_end等关键事件使用sendBeacon兜底
function sendTrackWithBeacon(payload: TrackPayload) {
  const url = '/v1/track';  // 使用相对路径走Vite代理
  
  try {
    // 对 play_end 优先使用 sendBeacon
    if (typeof navigator !== 'undefined' && navigator.sendBeacon && payload.type === 'play_end') {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const success = navigator.sendBeacon(url, blob);
      if (success) return Promise.resolve(true);
      // sendBeacon失败则降级到fetch
    }
  } catch (e) {
    console.warn('sendBeacon failed, falling back to fetch:', e);
  }

  // 默认使用SDK的track.send
  return track.send(payload).catch(() => false);
}

export function sendTrack(p: TrackPayload, sample = 1) {
  if (Math.random() > sample) return; // 采样，默认 100%
  const payload: TrackPayload = {
    timestamp: new Date().toISOString(),
    sessionId: getSid(),
    ...p,
  };
  
  // 对关键事件使用beacon兜底，其他事件正常发送
  if (payload.type === 'play_end') {
    sendTrackWithBeacon(payload).catch(() => {});
  } else {
    track.send(payload).catch(() => {});
  }
}

export const Track = {
  pageView: (path: string) => sendTrack({ type: 'page_view', path }),
  movieDetailView: (movieId: string, path: string) =>
    sendTrack({ type: 'movie_detail_view', movieId, path }),
  sponsorClick: (placement: string, sponsorId: string) =>
    sendTrack({ type: 'sponsor_click', meta: { placement, sponsorId } }),
  search: (keyword: string) => sendTrack({ type: 'search', meta: { keyword } }),
  playStart: (movieId: string) => sendTrack({ type: 'play_start', movieId }),
  playHeartbeat: (movieId: string, position: number) =>
    sendTrack({ type: 'play_heartbeat', movieId, meta: { position } }),
  playEnd: (movieId: string, reason: string) =>
    sendTrack({ type: 'play_end', movieId, meta: { reason } }),
};
