import { z } from 'zod';

// Brand configuration schema
export const BrandConfigSchema = z.object({
  name: z.string().min(1),
  logo: z.object({
    light: z.string().url(),
    dark: z.string().url(),
    mono: z.string().url(),
  }),
  palette: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i),
    bg: z.string().regex(/^#[0-9A-F]{6}$/i),
    text: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  fontFamily: z.string().min(1),
  favicon: z.string().url().optional(),
  ogImage: z.string().url().optional(),
});

export type BrandConfig = z.infer<typeof BrandConfigSchema>;

// Default brand configuration
export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  name: 'EZ Movie',
  logo: {
    light: '/brand/logo-light.svg',
    dark: '/brand/logo-dark.svg',
    mono: '/brand/logo-mono.svg',
  },
  palette: {
    primary: '#E50914',
    accent: '#FF3341',
    bg: '#0A0C12',
    text: '#E6E9F2',
  },
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto',
  favicon: '/brand/favicon.ico',
  ogImage: '/brand/og.jpg',
};
