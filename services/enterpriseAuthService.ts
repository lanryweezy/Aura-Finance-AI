/**
 * Enterprise Auth Service
 * SSO, MFA, custom roles, session management, API keys, audit export.
 */

import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

// ============== SSO ==============
export interface SSOConfig {
  provider: 'google' | 'microsoft' | 'azure';
  clientId: string;
  tenantId?: string;
  enabled: boolean;
}

export const ssoService = {
  // Configure SSO provider
  configure: async (config: SSOConfig): Promise<void> => {
    if (supabase) {
      await supabase.from('sso_config').upsert({
        ...config,
        organization_id: db.getOrgId(),
      });
    }
  },

  // Get SSO config
  getConfig: async (): Promise<SSOConfig | null> => {
    if (!supabase) return null;
    const { data } = await supabase.from('sso_config')
      .select('*').eq('organization_id', db.getOrgId()).single();
    return data as SSOConfig | null;
  },

  // Initiate SSO login
  loginWithSSO: async (provider: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    }
  },
};

// ============== MFA ==============
export const mfaService = {
  // Enable TOTP
  enableTOTP: async (): Promise<{ secret: string; qrCode: string }> => {
    if (supabase) {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Aura Finance AI',
      });
      if (error) throw error;
      return { secret: data.totp.secret, qrCode: data.totp.qr_code };
    }
    return { secret: 'mock-secret', qrCode: 'mock-qr' };
  },

  // Verify TOTP
  verifyTOTP: async (factorId: string, code: string): Promise<boolean> => {
    if (!supabase) return true;
    const { error } = await (supabase.auth.mfa as any).verify({
      factorId,
      code,
    });
    return !error;
  },

  // Check if MFA is enabled
  isMFAEnabled: async (): Promise<boolean> => {
    if (!supabase) return false;
    const { data } = await (supabase.auth.mfa as any).list();
    return (data?.totp || []).length > 0;
  },
};

// ============== SESSION MANAGEMENT ==============
export interface ActiveSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  lastActive: string;
  createdAt: string;
}

export const sessionService = {
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('active_sessions')
      .select('*').eq('organization_id', db.getOrgId())
      .order('last_active', { ascending: false });
    return (data || []) as ActiveSession[];
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    if (supabase) await supabase.from('active_sessions').delete().eq('id', sessionId);
  },

  revokeAllExcept: async (currentSessionId: string): Promise<void> => {
    if (!supabase) return;
    await supabase.from('active_sessions')
      .delete()
      .eq('organization_id', db.getOrgId())
      .neq('id', currentSessionId);
  },

  getSessionCount: async (): Promise<number> => {
    if (!supabase) return 1;
    const { count } = await supabase.from('active_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', db.getOrgId());
    return count || 0;
  },
};

// ============== API KEY MANAGEMENT ==============
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  scope: 'read' | 'write' | 'admin';
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

export const apiKeyService = {
  // Generate API key
  generate: async (name: string, scope: 'read' | 'write' | 'admin'): Promise<ApiKey> => {
    const key = `aura_live_${Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('')}`;
    const apiKey: Partial<ApiKey> = {
      name, key, scope,
      createdAt: new Date().toISOString(),
    };

    if (supabase) {
      const { data } = await supabase.from('api_keys').insert({
        ...apiKey,
        organization_id: db.getOrgId(),
      }).select().single();
      return data as ApiKey;
    }
    return { ...apiKey, id: `key_${Date.now()}` } as ApiKey;
  },

  // List API keys
  list: async (): Promise<ApiKey[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('api_keys')
      .select('*').eq('organization_id', db.getOrgId())
      .order('created_at', { ascending: false });
    return (data || []) as ApiKey[];
  },

  // Revoke API key
  revoke: async (keyId: string): Promise<void> => {
    if (supabase) await supabase.from('api_keys').delete().eq('id', keyId);
  },

  // Validate API key
  validate: async (key: string): Promise<boolean> => {
    if (!supabase) return true;
    const { data } = await supabase.from('api_keys')
      .select('id').eq('key', key).single();
    if (data) {
      await supabase.from('api_keys').update({ last_used: new Date().toISOString() }).eq('id', data.id);
      return true;
    }
    return false;
  },
};

// ============== AUDIT LOG EXPORT ==============
export const auditExportService = {
  exportCSV: async (): Promise<void> => {
    if (!supabase) return;
    const { data: logs } = await supabase.from('audit_logs_v2')
      .select('*').eq('organization_id', db.getOrgId())
      .order('timestamp', { ascending: false }).limit(5000);

    if (!logs || logs.length === 0) return;

    const headers = ['Timestamp', 'User', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Entity Name'];
    const rows = logs.map((l: any) => [
      l.timestamp, l.user_name, l.action, l.module, l.entity_type, l.entity_id, l.entity_name,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

// ============== PASSWORD POLICIES ==============
export const passwordPolicyService = {
  validate: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain a number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain a special character');
    return { valid: errors.length === 0, errors };
  },

  getStrength: (password: string): { score: number; label: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { score: Math.min(score, 5), label: labels[Math.min(score, 5)] };
  },
};

// ============== LOGIN HISTORY ==============
export interface LoginHistory {
  id: string;
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: string;
}

export const loginHistoryService = {
  record: async (email: string, success: boolean): Promise<void> => {
    if (supabase) {
      await supabase.from('login_history').insert({
        email, success,
        ip_address: 'client-side',
        user_agent: navigator.userAgent,
        organization_id: db.getOrgId(),
      });
    }
  },

  getHistory: async (limit = 50): Promise<LoginHistory[]> => {
    if (!supabase) return [];
    const { data } = await supabase.from('login_history')
      .select('*').eq('organization_id', db.getOrgId())
      .order('timestamp', { ascending: false }).limit(limit);
    return (data || []) as LoginHistory[];
  },
};
