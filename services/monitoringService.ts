import { supabase } from './supabaseClient';
import { authService } from './authService';

export type LogLevel = 'info' | 'warn' | 'error' | 'critical';

interface SaaSLog {
  timestamp: string;
  tenantId: string;
  level: LogLevel;
  module: string;
  message: string;
  context?: any;
}

export const monitoringService = {
  log: (level: LogLevel, module: string, message: string, context?: any) => {
    const tenantId = authService.getTenantId();
    const log: SaaSLog = {
      timestamp: new Date().toISOString(),
      tenantId,
      level,
      module,
      message,
      context,
    };
    console.log(`[Aura ${level.toUpperCase()}] [${module}]`, message, context || '');

    // Persist to Supabase if available, otherwise keep in localStorage
    if (supabase) {
      supabase.from('audit_logs').insert({
        user: 'system',
        action: `[${level}] ${message}`,
        module,
        before_data: context || null,
        organization_id: tenantId,
      }).then(() => {});
    }
  },

  getLogs: (): SaaSLog[] => {
    const stored = localStorage.getItem('aura_saas_monitoring');
    return stored ? JSON.parse(stored) : [];
  },

  trackError: (module: string, error: Error | string, context?: any) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    monitoringService.log('error', module, message, { ...context, stack });
  },

  trackAIUsage: (type: string, prompt: string, tokens?: number) => {
    monitoringService.log('info', 'AI_ENGINE', `AI ${type} executed`, { prompt: prompt.substring(0, 50) + '...', tokens });
  },
};
