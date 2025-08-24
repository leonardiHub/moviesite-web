export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Content Management
  CONTENT_MOVIES_VIEW: 'content.movies.view',
  CONTENT_MOVIES_CREATE: 'content.movies.create',
  CONTENT_MOVIES_UPDATE: 'content.movies.update',
  CONTENT_MOVIES_DELETE: 'content.movies.delete',
  
  CONTENT_SERIES_VIEW: 'content.series.view',
  CONTENT_SERIES_CREATE: 'content.series.create',
  CONTENT_SERIES_UPDATE: 'content.series.update',
  CONTENT_SERIES_DELETE: 'content.series.delete',
  
  CONTENT_PEOPLE_VIEW: 'content.people.view',
  CONTENT_PEOPLE_CREATE: 'content.people.create',
  CONTENT_PEOPLE_UPDATE: 'content.people.update',
  CONTENT_PEOPLE_DELETE: 'content.people.delete',
  
  CONTENT_COLLECTIONS_VIEW: 'content.collections.view',
  CONTENT_COLLECTIONS_CREATE: 'content.collections.create',
  CONTENT_COLLECTIONS_UPDATE: 'content.collections.update',
  CONTENT_COLLECTIONS_DELETE: 'content.collections.delete',
  
  CONTENT_HOMEPAGE_VIEW: 'content.homepage.view',
  CONTENT_HOMEPAGE_UPDATE: 'content.homepage.update',

  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  ANALYTICS_DETAILED: 'analytics.detailed',

  // Brand & Sponsors
  BRAND_VIEW: 'brand.view',
  BRAND_UPDATE: 'brand.update',
  
  SPONSORS_VIEW: 'sponsors.view',
  SPONSORS_CREATE: 'sponsors.create',
  SPONSORS_UPDATE: 'sponsors.update',
  SPONSORS_DELETE: 'sponsors.delete',
  
  CAMPAIGNS_VIEW: 'campaigns.view',
  CAMPAIGNS_CREATE: 'campaigns.create',
  CAMPAIGNS_UPDATE: 'campaigns.update',
  CAMPAIGNS_DELETE: 'campaigns.delete',

  // Users & Moderation
  USERS_VIEW: 'users.view',
  USERS_UPDATE: 'users.update',
  USERS_BAN: 'users.ban',
  
  REPORTS_VIEW: 'reports.view',
  REPORTS_RESOLVE: 'reports.resolve',

  // Search & SEO
  SEARCH_MANAGE: 'search.manage',
  SEO_MANAGE: 'seo.manage',

  // System & Admin
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  
  AUDIT_VIEW: 'audit.view',
  
  ADMIN_USERS_VIEW: 'admin.users.view',
  ADMIN_USERS_CREATE: 'admin.users.create',
  ADMIN_USERS_UPDATE: 'admin.users.update',
  ADMIN_USERS_DELETE: 'admin.users.delete',
  
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default roles and their permissions
export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full system access',
    permissions: Object.values(PERMISSIONS),
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manages movies, series, and content',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CONTENT_MOVIES_VIEW,
      PERMISSIONS.CONTENT_MOVIES_CREATE,
      PERMISSIONS.CONTENT_MOVIES_UPDATE,
      PERMISSIONS.CONTENT_MOVIES_DELETE,
      PERMISSIONS.CONTENT_SERIES_VIEW,
      PERMISSIONS.CONTENT_SERIES_CREATE,
      PERMISSIONS.CONTENT_SERIES_UPDATE,
      PERMISSIONS.CONTENT_SERIES_DELETE,
      PERMISSIONS.CONTENT_PEOPLE_VIEW,
      PERMISSIONS.CONTENT_PEOPLE_CREATE,
      PERMISSIONS.CONTENT_PEOPLE_UPDATE,
      PERMISSIONS.CONTENT_PEOPLE_DELETE,
      PERMISSIONS.CONTENT_COLLECTIONS_VIEW,
      PERMISSIONS.CONTENT_COLLECTIONS_CREATE,
      PERMISSIONS.CONTENT_COLLECTIONS_UPDATE,
      PERMISSIONS.CONTENT_COLLECTIONS_DELETE,
      PERMISSIONS.CONTENT_HOMEPAGE_VIEW,
      PERMISSIONS.CONTENT_HOMEPAGE_UPDATE,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
  },
  MARKETING_MANAGER: {
    name: 'Marketing Manager',
    description: 'Manages brand, sponsors, and campaigns',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CONTENT_MOVIES_VIEW,
      PERMISSIONS.CONTENT_SERIES_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.BRAND_VIEW,
      PERMISSIONS.BRAND_UPDATE,
      PERMISSIONS.SPONSORS_VIEW,
      PERMISSIONS.SPONSORS_CREATE,
      PERMISSIONS.SPONSORS_UPDATE,
      PERMISSIONS.SPONSORS_DELETE,
      PERMISSIONS.CAMPAIGNS_VIEW,
      PERMISSIONS.CAMPAIGNS_CREATE,
      PERMISSIONS.CAMPAIGNS_UPDATE,
      PERMISSIONS.CAMPAIGNS_DELETE,
    ],
  },
  ANALYST: {
    name: 'Analyst',
    description: 'Views and exports analytics data',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CONTENT_MOVIES_VIEW,
      PERMISSIONS.CONTENT_SERIES_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.ANALYTICS_DETAILED,
      PERMISSIONS.USERS_VIEW,
    ],
  },
  MODERATOR: {
    name: 'Moderator',
    description: 'Handles user reports and moderation',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CONTENT_MOVIES_VIEW,
      PERMISSIONS.CONTENT_SERIES_VIEW,
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_BAN,
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_RESOLVE,
    ],
  },
} as const;

export type RoleName = keyof typeof DEFAULT_ROLES;
