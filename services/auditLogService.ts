import type { AuditLog } from '../types';
import { supabase } from './supabaseClient';
import { authService } from './authService';

const TABLE = 'audit_logs';

export const auditLogService = {
  add: async (action: string, user: string, module?: string, before?: any, after?: any): Promise<AuditLog> => {
    if (!supabase) {
      return { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user, action, module, before, after };
    }
    const orgId = authService.getTenantId() || 'default_tenant';
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user,
        action,
        module,
        before_data: before || null,
        after_data: after || null,
        organization_id: orgId,
      })
      .select()
      .single();
    if (error) {
      console.error('Audit log error:', error);
      return { id: `log_${Date.now()}`, timestamp: new Date().toISOString(), user, action, module, before, after };
    }
    return data as AuditLog;
  },

  getLogs: async (): Promise<AuditLog[]> => {
    if (!supabase) return [];
    const orgId = authService.getTenantId() || 'default_tenant';
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('organization_id', orgId)
      .order('timestamp', { ascending: false })
      .limit(500);
    if (error) return [];
    return (data as AuditLog[]) || [];
  },

  clear: async (): Promise<void> => {
    if (!supabase) return;
    const orgId = authService.getTenantId() || 'default_tenant';
    await supabase.from(TABLE).delete().eq('organization_id', orgId);
  },
};
