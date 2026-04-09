
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

const STORAGE_KEY = 'aura_saas_monitoring';

export const monitoringService = {
    log: (level: LogLevel, module: string, message: string, context?: any) => {
        const tenantId = authService.getTenantId();
        const log: SaaSLog = {
            timestamp: new Date().toISOString(),
            tenantId,
            level,
            module,
            message,
            context
        };

        // In a real app, this would be an API call to Sentry, LogRocket, etc.
        console.log(`[Aura ${level.toUpperCase()}] [${module}]`, message, context || '');

        const allLogs = monitoringService.getLogs();
        allLogs.unshift(log);

        // Keep only last 1000 logs locally
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allLogs.slice(0, 1000)));
    },

    getLogs: (): SaaSLog[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    trackError: (module: string, error: Error | string, context?: any) => {
        const message = error instanceof Error ? error.message : error;
        const stack = error instanceof Error ? error.stack : undefined;

        monitoringService.log('error', module, message, { ...context, stack });
    },

    trackAIUsage: (type: string, prompt: string, tokens?: number) => {
        monitoringService.log('info', 'AI_ENGINE', `AI ${type} executed`, { prompt: prompt.substring(0, 50) + '...', tokens });
    }
};
