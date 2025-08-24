import { http } from './http';

export interface SponsorPlacement {
  id: string;
  placement: string;
  page: string;
  position: string;
  type: 'banner' | 'video_overlay' | 'native_ad';
  image: string;
  url: string;
  title: string;
  active: boolean;
  priority: number;
}

export interface SponsorPlacementsParams {
  page?: 'home' | 'detail' | 'player' | 'catalog';
}

export const sponsor = {
  // 获取赞助商投放位
  getPlacements: (params: SponsorPlacementsParams = {}): Promise<SponsorPlacement[]> => 
    http.get('/sponsors/placements', { params }).then(r => r.data),
};
