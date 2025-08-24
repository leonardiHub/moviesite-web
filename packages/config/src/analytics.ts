import { z } from 'zod';

// Event tracking schemas
export const BaseEventSchema = z.object({
  event: z.string(),
  ts: z.number(),
  user_id: z.string().optional(),
  session_id: z.string(),
  anon_id: z.string(),
  movie_id: z.string().optional(),
  episode_id: z.string().optional(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  device_type: z.enum(['mobile', 'tablet', 'desktop', 'tv']),
  os: z.string(),
  os_version: z.string().optional(),
  browser: z.string(),
  viewport: z.string().optional(),
  country: z.string().length(2),
  region: z.string().optional(),
  city: z.string().optional(),
  ip_hash: z.string().optional(),
  network_downlink_mbps: z.number().optional(),
  rtt_ms: z.number().optional(),
});

// Specific event schemas
export const PageViewEventSchema = BaseEventSchema.extend({
  event: z.literal('page_view'),
  page_type: z.string(),
  page_path: z.string(),
});

export const SearchEventSchema = BaseEventSchema.extend({
  event: z.literal('search'),
  query: z.string(),
  results_count: z.number(),
});

export const CardImpressionEventSchema = BaseEventSchema.extend({
  event: z.literal('card_impression'),
  card_position: z.number(),
  section_type: z.string(),
});

export const DetailViewEventSchema = BaseEventSchema.extend({
  event: z.literal('detail_view'),
});

export const PlayClickEventSchema = BaseEventSchema.extend({
  event: z.literal('play_click'),
});

export const PlayerEventSchema = BaseEventSchema.extend({
  event: z.enum(['player_start', 'player_quartile', 'player_seek', 'player_stall_start', 'player_stall_end', 'player_error']),
  startup_time_ms: z.number().optional(),
  cdn_edge: z.string().optional(),
  manifest: z.string().optional(),
  quality_initial: z.string().optional(),
  quartile: z.enum(['25', '50', '75', '100']).optional(),
  from_sec: z.number().optional(),
  to_sec: z.number().optional(),
  error_code: z.string().optional(),
  error_message: z.string().optional(),
});

export const SponsorEventSchema = BaseEventSchema.extend({
  event: z.enum(['sponsor_impression', 'sponsor_click']),
  placement: z.string(),
  asset_id: z.string(),
  campaign_id: z.string().optional(),
});

export const UserActionEventSchema = BaseEventSchema.extend({
  event: z.enum(['favorite_add', 'watchlist_add', 'share', 'login', 'signup']),
});

// Analytics query schemas
export const TimeRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const AnalyticsFilterSchema = z.object({
  timeRange: TimeRangeSchema,
  countries: z.array(z.string().length(2)).optional(),
  devices: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
});

// Response schemas for API
export const KPIMetricSchema = z.object({
  value: z.number(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
});

export const TimeSeriesDataPointSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
  label: z.string().optional(),
});

export const ChartDataSchema = z.object({
  type: z.enum(['line', 'bar', 'pie', 'area', 'funnel', 'heatmap']),
  title: z.string(),
  data: z.array(z.any()),
  xAxis: z.string().optional(),
  yAxis: z.string().optional(),
});

// Export types
export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type PageViewEvent = z.infer<typeof PageViewEventSchema>;
export type SearchEvent = z.infer<typeof SearchEventSchema>;
export type CardImpressionEvent = z.infer<typeof CardImpressionEventSchema>;
export type DetailViewEvent = z.infer<typeof DetailViewEventSchema>;
export type PlayClickEvent = z.infer<typeof PlayClickEventSchema>;
export type PlayerEvent = z.infer<typeof PlayerEventSchema>;
export type SponsorEvent = z.infer<typeof SponsorEventSchema>;
export type UserActionEvent = z.infer<typeof UserActionEventSchema>;

export type AnalyticsEvent = PageViewEvent | SearchEvent | CardImpressionEvent | DetailViewEvent | PlayClickEvent | PlayerEvent | SponsorEvent | UserActionEvent;

export type TimeRange = z.infer<typeof TimeRangeSchema>;
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;
export type KPIMetric = z.infer<typeof KPIMetricSchema>;
export type TimeSeriesDataPoint = z.infer<typeof TimeSeriesDataPointSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
