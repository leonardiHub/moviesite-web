import { http } from './http';

export interface Brand {
  name: string;
  logo: {
    light: string;
    dark: string;
  };
  palette: {
    primary: string;
    bg: string;
    text: string;
  };
}

export interface Sponsor {
  placement: string;
  image: string;
  url: string;
}

export interface HomeSection {
  id: string;
  kind: 'hero' | 'slider' | 'top10' | 'grid';
  title?: string;
  country?: string;
  items: Array<{
    id: string;
    title: string;
    poster?: string;
    backdrop?: string;
    year?: number;
    rating?: number;
    rank?: number;
    genres?: string[];
    synopsis?: string;
  }>;
}

export interface HomeData {
  brand: Brand;
  sponsors: Sponsor[];
  sections: HomeSection[];
}

export const home = {
  // 获取首页数据
  get: (): Promise<HomeData> => 
    http.get('/home').then(r => r.data),
};
