import { supabase } from './supabaseClient';
import { db } from './db';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'export' | 'submit';
  entity_type: string;
  entity_id: string;
  entity_name: string;
  module: string;
  changes?: FieldChange[];
  ip_address?: string;
  organization_id: string;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

const TABLE = 'audit_logs_v2';

export const auditService = {
  log: async (data: {
    action: AuditLogEntry['action'];
    entityType: string;
    entityId: string;
    entityName: string;
    module: string;
    changes?: FieldChange[];
  }): Promise<void> => {
    const user = JSON.parse(localStorage.getItem('aura_user') || '{}');

    const entry = {
      user_id: user.id || 'system',
      user_name: user.name || 'System',
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId,
      entity_name: data.entityName,
      module: data.module,
      changes: data.changes ? JSON.stringify(data.changes) : null,
      ip_address: '', // Would need server-side to get real IP
      organization_id: db.getOrgId(),
    };

    if (supabase) {
      await supabase.from(TABLE).insert(entry);
    }
  },

  fetch: async (filters?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    module?: string;
    userId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> => {
    if (!supabase) return [];
    let q = supabase.from(TABLE).select('*').eq('organization_id', db.getOrgId());
    if (filters?.entityType) q = q.eq('entity_type', filters.entityType);
    if (filters?.entityId) q = q.eq('entity_id', filters.entityId);
    if (filters?.action) q = q.eq('action', filters.action);
    if (filters?.module) q = q.eq('module', filters.module);
    if (filters?.userId) q = q.eq('user_id', filters.userId);
    const { data, error } = await q
      .order('timestamp', { ascending: false })
      .limit(filters?.limit || 200);
    if (error) return [];
    return (data || []).map(d => ({
      ...d,
      changes: d.changes ? JSON.parse(d.changes) : undefined,
    })) as AuditLogEntry[];
  },

  // Helper: compute changes between old and new objects
  diff(oldObj: Record<string, any>, newObj: Record<string, any>, excludeFields: string[] = ['id', 'created_at', 'updated_at']): FieldChange[] {
    const changes: FieldChange[] = [];
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    allKeys.forEach(key => {
      if (excludeFields.includes(key)) return;
      const oldVal = oldObj[key];
      const newVal = newObj[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, oldValue: oldVal, newValue: newVal });
      }
    });
    return changes;
  },

  // Pre-built audit actions
  created: (entityType: string, entityId: string, entityName: string, module: string) =>
    auditService.log({ action: 'create', entityType, entityId, entityName, module }),

  updated: (entityType: string, entityId: string, entityName: string, module: string, changes: FieldChange[]) =>
    auditService.log({ action: 'update', entityType, entityId, entityName, module, changes }),

  deleted: (entityType: string, entityId: string, entityName: string, module: string) =>
    auditService.log({ action: 'delete', entityType, entityId, entityName, module }),

  approved: (entityType: string, entityId: string, entityName: string, module: string) =>
    auditService.log({ action: 'approve', entityType, entityId, entityName, module }),

  rejected: (entityType: string, entityId: string, entityName: string, module: string) =>
    auditService.log({ action: 'reject', entityType, entityId, entityName, module }),
};
