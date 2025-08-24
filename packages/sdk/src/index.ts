// HTTP client
export { http, configureHttp } from './http';

// Home module
export { home } from './home';
export type { HomeData, Brand, Sponsor, HomeSection } from './home';

// Movies module  
export { movies } from './movies';
export type { 
  Movie, 
  MovieDetail, 
  PlayAuth, 
  MoviesListParams, 
  MoviesListResponse 
} from './movies';

// Brand module
export { brand } from './brand';
export type { BrandConfig } from './brand';

// Sponsor module
export { sponsor } from './sponsor';
export type { SponsorPlacement, SponsorPlacementsParams } from './sponsor';

// Track module
export { track } from './track';
export type { TrackType, TrackPayload } from './track';

// 导入所有模块用于默认导出
import { home } from './home';
import { movies } from './movies';
import { brand } from './brand';
import { sponsor } from './sponsor';
import { track } from './track';

// 默认导出所有API
export default {
  home,
  movies,
  brand,
  sponsor,
  track,
};