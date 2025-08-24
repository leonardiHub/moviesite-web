import { http } from './http';

export interface Movie {
  id: string;
  slug: string;
  title: string;
  poster: string;
  year: number;
  rating: number;
  genres: string[];
}

export interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  runtime: number;
  rating: number;
  synopsis: string;
  poster: string;
  backdrop: string;
  genres: string[];
  tags: string[];
  cast: Array<{ id: string; name: string; character: string }>;
  crew: Array<{ id: string; name: string; role: string }>;
  related: Array<{ id: string; title: string; poster: string; year: number; rating: number }>;
}

export interface PlayAuth {
  movieId: string;
  ttl: number;
  expiresAt: string;
  sources: Array<{
    id: string;
    type: 'hls' | 'dash' | 'mp4';
    label: string;
    url: string;
    drm?: any;
  }>;
  subtitles?: Array<{
    lang: string;
    label: string;
    url: string;
  }>;
  overlays?: Array<{
    type: 'image' | 'html';
    placement: 'tl' | 'tr' | 'bl' | 'br';
    start?: number;
    end?: number;
    url?: string;
    html?: string;
    href?: string;
    opacity?: number;
  }>;
  analytics?: { heartbeat: number };
}

export interface MoviesListParams {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  sort?: 'popular' | 'rating' | 'year' | 'title';
}

export interface MoviesListResponse {
  items: Movie[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const movies = {
  // 获取电影列表
  list: (params: MoviesListParams = {}): Promise<MoviesListResponse> => 
    http.get('/movies', { params }).then(r => r.data),

  // 获取电影详情
  detail: (id: string): Promise<MovieDetail> => 
    http.get(`/movies/${id}`).then(r => r.data),

  // 获取播放授权
  play: (id: string): Promise<PlayAuth> => 
    http.get(`/movies/${id}/play`).then(r => r.data),

  // 获取播放授权 (别名方法)
  getPlay: (id: string): Promise<PlayAuth> => 
    http.get(`/movies/${id}/play`).then(r => r.data),
};
