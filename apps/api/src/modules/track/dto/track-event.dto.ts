import { IsString, IsOptional, IsIn, IsNumber, IsISO8601, IsObject } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsIn([
    'page_view',
    'movie_detail_view',
    'sponsor_click',
    'search',
    'play_start',
    'play_heartbeat',
    'play_end',
  ])
  type!: string;

  @IsOptional() @IsISO8601()
  timestamp?: string;            // 客户端时间戳（可选）

  @IsOptional() @IsString()
  sessionId?: string;            // 前端生成的会话ID

  @IsOptional() @IsString()
  userId?: string;               // 登录后可带（目前可为空）

  @IsOptional() @IsString()
  path?: string;                 // 页面路径

  @IsOptional() @IsString()
  movieId?: string;              // 与电影相关的事件携带

  @IsOptional() @IsObject()
  meta?: Record<string, any>;    // 其它维度，例如 placement、keyword 等
}
