import { useQuery, useQueryClient } from '@tanstack/react-query';
import { movies, PlayAuth } from '../../packages/sdk/src';

// API客户端 - 使用相对路径走Vite代理  
const fetchJson = async (url: string) => {
  const response = await fetch(`/v1${url}`, {
    credentials: 'omit',  // 关键：不带凭证避免CORS问题
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 首页数据hook
export const useHomeData = () => {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => fetchJson('/home'),
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};

// 电影列表hook
export const useMoviesList = (params: {
  page?: number;
  limit?: number;
  genre?: string;
  year?: number;
  sort?: string;
} = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => fetchJson(`/movies?${searchParams.toString()}`),
    staleTime: 1000 * 60 * 2, // 2分钟缓存
  });
};

// 电影详情hook
export const useMovieDetail = (movieId: string) => {
  return useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchJson(`/movies/${movieId}`),
    enabled: !!movieId, // 只有当movieId存在时才执行查询
    staleTime: 1000 * 60 * 10, // 10分钟缓存
  });
};

// 播放授权hook
export const usePlayAuth = (movieId: string) => {
  return useQuery({
    queryKey: ['play', movieId],
    queryFn: () => fetchJson(`/movies/${movieId}/play`),
    enabled: false, // 默认不自动执行，需要手动触发
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });
};

// 品牌配置hook
export const useBrandConfig = () => {
  return useQuery({
    queryKey: ['brand'],
    queryFn: () => fetchJson('/brand'),
    staleTime: 1000 * 60 * 30, // 30分钟缓存（品牌配置变化较少）
  });
};

// 赞助商投放位hook
export const useSponsorPlacements = (page?: string) => {
  return useQuery({
    queryKey: ['sponsors', page],
    queryFn: () => fetchJson(`/sponsors/placements${page ? `?page=${page}` : ''}`),
    staleTime: 1000 * 60 * 10, // 10分钟缓存
  });
};

// 播放授权hook
export const useMoviePlay = (movieId: string, enabled = true) => {
  return useQuery<PlayAuth, Error>({
    queryKey: ['moviePlay', movieId],
    queryFn: () => movies.getPlay(movieId),
    enabled: Boolean(movieId) && enabled,
    staleTime: 5 * 60 * 1000, // 先 5 分钟；后续 M3 可根据返回 ttl 动态调整
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
};

// 可复用的预取函数（供"播放按钮"点击时调用）
export const prefetchMoviePlay = (queryClient: ReturnType<typeof useQueryClient>, movieId: string) => {
  return queryClient.prefetchQuery({
    queryKey: ['moviePlay', movieId],
    queryFn: () => movies.getPlay(movieId),
  });
};
