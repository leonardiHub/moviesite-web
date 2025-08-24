import { z } from 'zod';

// Campaign targeting schema
export const CampaignTargetingSchema = z.object({
  countries: z.array(z.string().length(2)).optional(),
  devices: z.array(z.enum(['mobile', 'tablet', 'desktop', 'tv'])).optional(),
  hours: z.array(z.number().min(0).max(23)).optional(),
  languages: z.array(z.string().length(2)).optional(),
});

// Frequency cap schema
export const FrequencyCapSchema = z.object({
  perSession: z.number().min(1).optional(),
  per24h: z.number().min(1).optional(),
  perWeek: z.number().min(1).optional(),
});

// UTM parameters schema
export const UTMSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  term: z.string().optional(),
  content: z.string().optional(),
});

// Campaign asset schema
export const CampaignAssetSchema = z.object({
  assetId: z.string(),
  weight: z.number().min(1).max(100).default(100),
  clickUrl: z.string().url(),
  utm: UTMSchema.optional(),
});

// Campaign configuration schema
export const CampaignConfigSchema = z.object({
  name: z.string().min(1),
  placementKey: z.string(),
  assets: z.array(CampaignAssetSchema).min(1),
  targeting: CampaignTargetingSchema.default({}),
  frequencyCap: FrequencyCapSchema.default({}),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).default('draft'),
});

export type CampaignTargeting = z.infer<typeof CampaignTargetingSchema>;
export type FrequencyCap = z.infer<typeof FrequencyCapSchema>;
export type UTM = z.infer<typeof UTMSchema>;
export type CampaignAsset = z.infer<typeof CampaignAssetSchema>;
export type CampaignConfig = z.infer<typeof CampaignConfigSchema>;

// Placement definitions
export const PLACEMENT_CONFIGS = {
  header: {
    key: 'header',
    name: 'Header Banner',
    ratio: '728:90',
    maxAssets: 1,
    description: 'Top header banner across all pages',
  },
  hero: {
    key: 'hero',
    name: 'Hero Section',
    ratio: '16:9',
    maxAssets: 3,
    description: 'Main hero section on homepage',
  },
  sidebar: {
    key: 'sidebar',
    name: 'Sidebar',
    ratio: '300:250',
    maxAssets: 2,
    description: 'Right sidebar on content pages',
  },
  player_pre: {
    key: 'player_pre',
    name: 'Pre-roll',
    ratio: '16:9',
    maxAssets: 1,
    description: 'Video ad before content playback',
  },
  footer: {
    key: 'footer',
    name: 'Footer Banner',
    ratio: '728:90',
    maxAssets: 1,
    description: 'Bottom footer banner',
  },
} as const;

export type PlacementKey = keyof typeof PLACEMENT_CONFIGS;
