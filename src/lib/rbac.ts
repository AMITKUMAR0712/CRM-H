import { UserRole } from '@prisma/client'

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',

  MENU_READ: 'menu:read',
  MENU_WRITE: 'menu:write',
  MENU_DELETE: 'menu:delete',

  PAGE_READ: 'page:read',
  PAGE_WRITE: 'page:write',
  PAGE_PUBLISH: 'page:publish',
  PAGE_DELETE: 'page:delete',

  PG_READ: 'pg:read',
  PG_WRITE: 'pg:write',
  PG_DELETE: 'pg:delete',
  PG_BULK_UPLOAD: 'pg:bulk_upload',

  SECTOR_READ: 'sector:read',
  SECTOR_WRITE: 'sector:write',
  SECTOR_DELETE: 'sector:delete',

  LEAD_READ: 'lead:read',
  LEAD_WRITE: 'lead:write',
  LEAD_DELETE: 'lead:delete',
  LEAD_ASSIGN: 'lead:assign',
  LEAD_EXPORT: 'lead:export',

  BLOG_READ: 'blog:read',
  BLOG_WRITE: 'blog:write',
  BLOG_PUBLISH: 'blog:publish',
  BLOG_DELETE: 'blog:delete',

  REVIEW_READ: 'review:read',
  REVIEW_MODERATE: 'review:moderate',

  MEDIA_READ: 'media:read',
  MEDIA_WRITE: 'media:write',

  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',

  NOTIFICATION_READ: 'notification:read',
  NOTIFICATION_WRITE: 'notification:write',

  LOGS_READ: 'logs:read',

  // Advanced modules
  BANNERS_READ: 'module:banners.read',
  BANNERS_MANAGE: 'module:banners.manage',

  ENQUIRY_READ: 'module:enquiries.read',
  ENQUIRY_WRITE: 'module:enquiries.update',
  ENQUIRY_ASSIGN: 'module:enquiries.assign',
  ENQUIRY_CLOSE: 'module:enquiries.close',

  USERS_BLOCK: 'module:users.block',

  TICKET_READ: 'module:tickets.read',
  TICKET_WRITE: 'module:tickets.update',
  TICKET_ASSIGN: 'module:tickets.assign',
  TICKET_RESOLVE: 'module:tickets.resolve',

  CHAT_READ: 'module:chat.read',
  CHAT_WRITE: 'module:chat.write',
  CHAT_MUTE: 'module:chat.mute',
  CHAT_CLOSE: 'module:chat.close',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const userPermissions: Permission[] = []

const viewerPermissions: Permission[] = [
  PERMISSIONS.DASHBOARD_VIEW,

  PERMISSIONS.MENU_READ,
  PERMISSIONS.PAGE_READ,
  PERMISSIONS.PG_READ,
  PERMISSIONS.SECTOR_READ,
  PERMISSIONS.LEAD_READ,
  PERMISSIONS.BLOG_READ,
  PERMISSIONS.REVIEW_READ,
  PERMISSIONS.MEDIA_READ,
  PERMISSIONS.SETTINGS_READ,
  PERMISSIONS.NOTIFICATION_READ,
  PERMISSIONS.LOGS_READ,

  // Advanced read-only
  PERMISSIONS.BANNERS_READ,
  PERMISSIONS.ENQUIRY_READ,
  PERMISSIONS.TICKET_READ,
  PERMISSIONS.CHAT_READ,
]

const managerPermissions: Permission[] = [
  // Start from VIEWER, but explicitly remove modules MANAGER should not access.
  ...viewerPermissions.filter((p) => p !== PERMISSIONS.BANNERS_READ),

  // Ops modules (MANAGER is Full per strict matrix)
  PERMISSIONS.LEAD_WRITE,
  PERMISSIONS.LEAD_ASSIGN,
  PERMISSIONS.LEAD_EXPORT,

  PERMISSIONS.ENQUIRY_WRITE,
  PERMISSIONS.ENQUIRY_ASSIGN,
  PERMISSIONS.ENQUIRY_CLOSE,

  PERMISSIONS.TICKET_WRITE,
  PERMISSIONS.TICKET_ASSIGN,
  PERMISSIONS.TICKET_RESOLVE,

  PERMISSIONS.CHAT_WRITE,
  PERMISSIONS.CHAT_MUTE,
  PERMISSIONS.CHAT_CLOSE,

  // Blog/CMS (MANAGER can edit content)
  PERMISSIONS.BLOG_WRITE,
]

const adminPermissions: Permission[] = [
  ...managerPermissions,

  // Ensure ADMIN can view banners even though MANAGER cannot.
  PERMISSIONS.BANNERS_READ,

  // Content/CMS management
  PERMISSIONS.MENU_WRITE,
  PERMISSIONS.PAGE_WRITE,
  PERMISSIONS.PG_WRITE,
  PERMISSIONS.SECTOR_WRITE,
  PERMISSIONS.BLOG_WRITE,
  PERMISSIONS.REVIEW_MODERATE,
  PERMISSIONS.MEDIA_WRITE,
  PERMISSIONS.NOTIFICATION_WRITE,

  // Ops assignment + advanced modules
  PERMISSIONS.LEAD_ASSIGN,
  PERMISSIONS.ENQUIRY_ASSIGN,
  PERMISSIONS.TICKET_ASSIGN,
  PERMISSIONS.BANNERS_MANAGE,

  PERMISSIONS.MENU_DELETE,
  PERMISSIONS.PAGE_PUBLISH,
  PERMISSIONS.PAGE_DELETE,
  PERMISSIONS.PG_DELETE,
  PERMISSIONS.PG_BULK_UPLOAD,
  PERMISSIONS.SECTOR_DELETE,
  PERMISSIONS.LEAD_DELETE,
  PERMISSIONS.BLOG_PUBLISH,
  PERMISSIONS.BLOG_DELETE,
  // Note: strict matrix denies ADMIN access to settings and user management.

  // Advanced
  PERMISSIONS.USERS_BLOCK,
]

const superAdminPermissions: Permission[] = [
  ...adminPermissions,
  PERMISSIONS.USER_DELETE,
]

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  [UserRole.USER]: userPermissions,
  [UserRole.VIEWER]: viewerPermissions,
  [UserRole.MANAGER]: managerPermissions,
  [UserRole.ADMIN]: adminPermissions,
  [UserRole.SUPER_ADMIN]: superAdminPermissions,
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function roleHasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}
