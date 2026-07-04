/**
 * User Activity Logging Service
 * Logs all user actions for audit trail, analytics, and security.
 */

import { supabase } from './supabaseClient';
import { db } from './db';

export type ActivityType = 
  | 'login' | 'logout' | 'signup'
  | 'create' | 'update' | 'delete'
  | 'view' | 'export' | 'import'
  | 'approve' | 'reject'
  | 'submit' | 'pay' | 'void'
  | 'ai_chat' | 'ai_insight'
  | 'settings_change' | 'profile_update';

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityType;
  entityType: string;
  entityId: string;
  entityName: string;
  module: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  organizationId: string;
}

export interface ActivityStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByUser: Record<string, number>;
  recentActivity: UserActivity[];
}

export const activityService = {
  // Log a user activity
  log: async (data: {
    action: ActivityType;
    entityType: string;
    entityId: string;
    entityName: string;
    module: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');
    const activity: Omit<UserActivity, 'id'> = {
      userId: user.id || 'anonymous',
      userName: user.name || 'Anonymous',
      userRole: user.role || 'viewer',
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      module: data.module,
      description: data.description,
      metadata: data.metadata,
      timestamp: new Date().toISOString(),
      organizationId: db.getOrgId(),
    };

    if (supabase) {
      await supabase.from('user_activities').insert({
        ...activity,
        ip_address: '',
        user_agent: navigator.userAgent,
      });
    }
  },

  // Get user activities
  getActivities: async (filters?: {
    userId?: string;
    action?: string;
    entityType?: string;
    module?: string;
    limit?: number;
    since?: string;
  }): Promise<UserActivity[]> => {
    if (!supabase) return [];
    let q = supabase.from('user_activities').select('*').eq('organization_id', db.getOrgId());
    if (filters?.userId) q = q.eq('user_id', filters.userId);
    if (filters?.action) q = q.eq('action', filters.action);
    if (filters?.entityType) q = q.eq('entity_type', filters.entityType);
    if (filters?.module) q = q.eq('module', filters.module);
    if (filters?.since) q = q.gte('timestamp', filters.since);
    const { data } = await q.order('timestamp', { ascending: false }).limit(filters?.limit || 100);
    return (data || []) as UserActivity[];
  },

  // Get activity stats
  getStats: async (since?: string): Promise<ActivityStats> => {
    const activities = await activityService.getActivities({ since, limit: 1000 });
    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};

    activities.forEach(a => {
      actionsByType[a.action] = (actionsByType[a.action] || 0) + 1;
      actionsByUser[a.userName] = (actionsByUser[a.userName] || 0) + 1;
    });

    return {
      totalActions: activities.length,
      actionsByType,
      actionsByUser,
      recentActivity: activities.slice(0, 10),
    };
  },

  // Get activity for specific entity
  getEntityActivity: async (entityType: string, entityId: string): Promise<UserActivity[]> => {
    return activityService.getActivities({ entityType, entityId, limit: 50 });
  },

  // Get user's activity
  getUserActivity: async (userId: string): Promise<UserActivity[]> => {
    return activityService.getActivities({ userId, limit: 50 });
  },

  // Activity logging helpers
  logCreate: (entityType: string, entityId: string, entityName: string) =>
    activityService.log({ action: 'create', entityType, entityId, entityName, module: entityType, description: `Created ${entityType}: ${entityName}` }),

  logUpdate: (entityType: string, entityId: string, entityName: string) =>
    activityService.log({ action: 'update', entityType, entityId, entityName, module: entityType, description: `Updated ${entityType}: ${entityName}` }),

  logDelete: (entityType: string, entityId: string, entityName: string) =>
    activityService.log({ action: 'delete', entityType, entityId, entityName, module: entityType, description: `Deleted ${entityType}: ${entityName}` }),

  logView: (entityType: string, entityId: string, entityName: string) =>
    activityService.log({ action: 'view', entityType, entityId, entityName, module: entityType, description: `Viewed ${entityType}: ${entityName}` }),

  logExport: (entityType: string, format: string) =>
    activityService.log({ action: 'export', entityType, entityId: '', entityName: '', module: entityType, description: `Exported ${entityType} as ${format}` }),

  logLogin: () =>
    activityService.log({ action: 'login', entityType: 'session', entityId: '', entityName: '', module: 'auth', description: 'User logged in' }),

  logLogout: () =>
    activityService.log({ action: 'logout', entityType: 'session', entityId: '', entityName: '', module: 'auth', description: 'User logged out' }),
};
