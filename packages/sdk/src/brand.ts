import { http } from './http';

export interface BrandConfig {
  name: string;
  logo: {
    light: string;
    dark: string;
    mono: string;
  };
  palette: {
    primary: string;
    accent: string;
    bg: string;
    text: string;
  };
  fontFamily: string;
  favicon?: string;
  ogImage?: string;
}

export const brand = {
  // 获取品牌配置
  get: (): Promise<BrandConfig> => 
    http.get('/brand').then(r => r.data),
};
