import { http } from './http';

export type TrackType =
  | 'page_view'
  | 'movie_detail_view'
  | 'sponsor_click'
  | 'search'
  | 'play_start'
  | 'play_heartbeat'
  | 'play_end';

export interface TrackPayload {
  type: TrackType;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  path?: string;
  movieId?: string;
  meta?: Record<string, any>;
}

export const track = {
  send: (p: TrackPayload) => http.post('/track', p).then(r => r.data),
};
